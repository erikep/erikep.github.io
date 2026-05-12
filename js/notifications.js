export class NotificationManager {
    static requestPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
    
    static playSound(alarm = 'relaxing-chime') {
        const alarms = {
            original: () => this.playOriginalBeep(),
            'relaxing-chime': () => this.playRelaxingChime(),
            'urgent-alert': () => this.playUrgentAlert()
        };
        
        (alarms[alarm] || alarms['relaxing-chime'])();
    }

    static createAudioContext() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) {
            return null;
        }

        return new AudioContext();
    }

    static playOriginalBeep() {
        const audioContext = this.createAudioContext();
        if (!audioContext) {
            return;
        }

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const startTime = audioContext.currentTime;
        const duration = 0.5;
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
        
        setTimeout(() => audioContext.close(), duration * 1000 + 100);
    }

    static playRelaxingChime() {
        const audioContext = this.createAudioContext();
        if (!audioContext) {
            return;
        }

        const masterGain = audioContext.createGain();
        const startTime = audioContext.currentTime;
        const duration = 2.1;
        
        masterGain.gain.setValueAtTime(0.9, startTime);
        masterGain.connect(audioContext.destination);

        const playChimeNote = (frequency, noteStart, noteDuration, peakGain) => {
            const noteTime = startTime + noteStart;
            const tone = audioContext.createOscillator();
            const shimmer = audioContext.createOscillator();
            const toneGain = audioContext.createGain();
            const shimmerGain = audioContext.createGain();

            tone.type = 'sine';
            shimmer.type = 'sine';
            tone.frequency.setValueAtTime(frequency, noteTime);
            shimmer.frequency.setValueAtTime(frequency * 2, noteTime);

            tone.connect(toneGain);
            shimmer.connect(shimmerGain);
            toneGain.connect(masterGain);
            shimmerGain.connect(masterGain);

            toneGain.gain.setValueAtTime(0.001, noteTime);
            toneGain.gain.linearRampToValueAtTime(peakGain, noteTime + 0.04);
            toneGain.gain.exponentialRampToValueAtTime(0.001, noteTime + noteDuration);

            shimmerGain.gain.setValueAtTime(0.001, noteTime);
            shimmerGain.gain.linearRampToValueAtTime(peakGain * 0.18, noteTime + 0.03);
            shimmerGain.gain.exponentialRampToValueAtTime(0.001, noteTime + noteDuration * 0.7);

            tone.start(noteTime);
            shimmer.start(noteTime);
            tone.stop(noteTime + noteDuration);
            shimmer.stop(noteTime + noteDuration);
        };

        // A bright major arpeggio is noticeable without the tension of a siren.
        playChimeNote(523.25, 0, 1.1, 0.14);
        playChimeNote(659.25, 0.32, 1.1, 0.15);
        playChimeNote(783.99, 0.64, 1.05, 0.16);
        playChimeNote(1046.5, 1.02, 0.95, 0.12);
        
        setTimeout(() => audioContext.close(), duration * 1000 + 100);
    }

    static playUrgentAlert() {
        const audioContext = this.createAudioContext();
        if (!audioContext) {
            return;
        }

        const masterGain = audioContext.createGain();
        const startTime = audioContext.currentTime;
        const duration = 1.68;

        masterGain.gain.setValueAtTime(0.92, startTime);
        masterGain.connect(audioContext.destination);

        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3200, startTime);
        filter.Q.setValueAtTime(0.7, startTime);
        filter.connect(masterGain);

        const playRhythmHit = (offsetSec, frequency, hitMs, peakGain) => {
            const t0 = startTime + offsetSec;
            const hitDur = hitMs / 1000;
            const tone = audioContext.createOscillator();
            const toneGain = audioContext.createGain();

            tone.type = 'triangle';
            tone.frequency.setValueAtTime(frequency, t0);

            tone.connect(toneGain);
            toneGain.connect(filter);

            toneGain.gain.setValueAtTime(0.0008, t0);
            toneGain.gain.linearRampToValueAtTime(peakGain, t0 + 0.012);
            toneGain.gain.exponentialRampToValueAtTime(0.0008, t0 + hitDur);

            tone.start(t0);
            tone.stop(t0 + hitDur + 0.02);
        };

        const playKick = (offsetSec, peakGain) => {
            const t0 = startTime + offsetSec;
            const kick = audioContext.createOscillator();
            const kickGain = audioContext.createGain();

            kick.type = 'sine';
            kick.frequency.setValueAtTime(150, t0);
            kick.frequency.exponentialRampToValueAtTime(55, t0 + 0.12);

            kick.connect(kickGain);
            kickGain.connect(masterGain);

            kickGain.gain.setValueAtTime(0.0008, t0);
            kickGain.gain.linearRampToValueAtTime(peakGain, t0 + 0.006);
            kickGain.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.14);

            kick.start(t0);
            kick.stop(t0 + 0.16);
        };

        // Staccato groove with downbeat kicks: bold but rounded (triangle + lowpass), not square-wave rigid.
        playKick(0, 0.14);
        playRhythmHit(0, 587.33, 85, 0.26);
        playRhythmHit(0.14, 587.33, 78, 0.22);
        playRhythmHit(0.32, 783.99, 92, 0.3);
        playRhythmHit(0.48, 587.33, 72, 0.2);

        playKick(0.64, 0.12);
        playRhythmHit(0.64, 587.33, 78, 0.24);
        playRhythmHit(0.78, 698.46, 82, 0.26);
        playRhythmHit(0.94, 880, 88, 0.3);
        playRhythmHit(1.08, 587.33, 68, 0.2);

        playKick(1.2, 0.15);
        playRhythmHit(1.2, 783.99, 86, 0.28);
        playRhythmHit(1.34, 698.46, 80, 0.24);
        playRhythmHit(1.48, 1046.5, 105, 0.32);

        setTimeout(() => audioContext.close(), duration * 1000 + 120);
    }
    
    static showNotification(title, body) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: body,
                icon: '🔔'
            });
        }
    }
}
