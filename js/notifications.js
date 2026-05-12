export class NotificationManager {
    static requestPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
    
    static playSound() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) {
            return;
        }

        const audioContext = new AudioContext();
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
    
    static showNotification(title, body) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: body,
                icon: '🔔'
            });
        }
    }
}
