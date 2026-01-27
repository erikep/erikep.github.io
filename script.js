import { DEFAULT_DURATIONS } from './js/config.js';
import { StorageManager } from './js/storage.js';
import { ColorManager } from './js/colorManager.js';
import { FocusGraph } from './js/graph.js';
import { Timer } from './js/timer.js';
import { UI } from './js/ui.js';
import { NotificationManager } from './js/notifications.js';

class PomodoroTimer {
    constructor() {
        // Initialize storage and load data
        this.durations = StorageManager.loadDurations();
        this.sessionCount = 0;
        
        // Initialize timer with tick callback
        this.timer = new Timer(this.durations, (result) => {
            if (result === true) {
                this.complete();
            } else if (result === 'update') {
                this.updateDisplay();
            }
        });
        
        // Initialize UI elements
        this.initializeElements();
        
        // Initialize managers
        this.colorManager = new ColorManager(this.root, this.colorOptions);
        this.ui = new UI({
            timeDisplay: this.timeDisplay,
            timerStatus: this.timerStatus,
            sessionCountEl: this.sessionCountEl,
            startBtn: this.startBtn,
            pauseBtn: this.pauseBtn,
            resetBtn: this.resetBtn,
            modeButtons: this.modeButtons,
            durationInputs: this.durationInputs,
            progressCircle: this.progressCircle,
            body: this.body
        });
        
        // Initialize graph (only if canvas exists)
        if (this.graphCanvas && this.graphCtx) {
            this.graph = new FocusGraph(
                this.graphCanvas,
                this.graphCtx,
                this.todayTimeEl,
                this.weekTimeEl
            );
        } else {
            this.graph = null;
        }
        
        // Initialize UI state
        this.ui.initializeDurationInputs(this.durations);
        this.colorManager.updateColorButtons();
        this.colorManager.applyColors();
        
        // Clean up old data and update display
        StorageManager.cleanupOldFocusData();
        this.updateDisplay();
        this.updateStatus();
        this.ui.updateDurationInputsState(this.timer.isRunning);
        if (this.graph) {
            this.graph.update();
        }
        
        // Set up event listeners
        this.setupEventListeners();
    }
    
    initializeElements() {
        this.timeDisplay = document.getElementById('time-display');
        this.timerStatus = document.getElementById('timer-status');
        this.sessionCountEl = document.getElementById('session-count');
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.modeButtons = document.querySelectorAll('.mode-btn');
        this.durationInputs = document.querySelectorAll('.duration-input');
        this.colorOptions = document.querySelectorAll('.color-option');
        this.progressCircle = document.querySelector('.progress-ring-circle');
        this.graphCanvas = document.getElementById('focus-graph');
        this.graphCtx = this.graphCanvas ? this.graphCanvas.getContext('2d') : null;
        this.todayTimeEl = document.getElementById('today-time');
        this.weekTimeEl = document.getElementById('week-time');
        this.body = document.body;
        this.root = document.documentElement;
    }
    
    setupEventListeners() {
        // Timer controls
        if (this.startBtn) {
            this.startBtn.addEventListener('click', () => this.start());
        }
        if (this.pauseBtn) {
            this.pauseBtn.addEventListener('click', () => this.pause());
        }
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => this.reset());
        }
        
        // Mode selection
        this.modeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!this.timer.isRunning) {
                    this.setMode(e.target.dataset.mode);
                }
            });
        });
        
        // Duration input changes
        this.durationInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                if (!this.timer.isRunning) {
                    this.updateDuration(e.target);
                }
            });
            
            input.addEventListener('blur', (e) => {
                if (!this.timer.isRunning) {
                    this.updateDuration(e.target);
                }
            });
            
            input.addEventListener('focus', () => {
                if (this.timer.isRunning) {
                    input.blur();
                }
            });
        });
        
        // Color theme selection
        this.colorOptions.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const theme = e.currentTarget.dataset.theme;
                this.colorManager.setTheme(theme);
            });
        });
        
        // Tab visibility and focus events
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.timer.isRunning) {
                this.syncTimer();
            }
        });
        
        window.addEventListener('focus', () => {
            if (this.timer.isRunning) {
                this.syncTimer();
            }
        });
        
        // Window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (this.graph) {
                    this.graph.update();
                }
            }, 250);
        });
    }
    
    start() {
        this.timer.start();
        this.ui.setButtonStates(true);
        this.updateStatus();
        this.ui.updateDurationInputsState(true);
    }
    
    pause() {
        this.syncTimer();
        this.timer.pause();
        this.ui.setButtonStates(false);
        this.updateStatus();
        this.ui.updateDurationInputsState(false);
    }
    
    reset() {
        this.timer.reset();
        this.ui.setButtonStates(false);
        this.updateDisplay();
        this.updateStatus();
        this.ui.updateDurationInputsState(false);
    }
    
    updateStatus() {
        const state = this.timer.getState();
        this.ui.updateStatus(null, state.mode, state.isRunning, state.timeLeft, state.durations[state.mode]);
    }
    
    setMode(mode) {
        this.timer.setMode(mode);
        this.ui.updateModeButtons(mode);
        this.updateDisplay();
        this.ui.updateBodyClass(mode);
    }
    
    updateDuration(input) {
        const mode = input.dataset.mode;
        let minutes = parseInt(input.value);
        
        // Validate input
        if (isNaN(minutes) || minutes < 1) {
            minutes = DEFAULT_DURATIONS[mode];
            input.value = minutes;
        } else if (minutes > 99) {
            minutes = 99;
            input.value = 99;
        }
        
        const newDuration = minutes * 60;
        
        if (this.durations[mode] !== newDuration) {
            this.durations[mode] = newDuration;
            // Update timer's durations reference
            this.timer.durations[mode] = newDuration;
            StorageManager.saveDurations(this.durations);
            this.timer.updateDuration(mode, newDuration);
            
            if (this.timer.mode === mode && !this.timer.isRunning) {
                this.updateDisplay();
            }
        }
    }
    
    syncTimer() {
        const completed = this.timer.syncTimer();
        if (completed) {
            this.complete();
        } else {
            this.updateDisplay();
        }
    }
    
    complete() {
        this.timer.pause();
        this.ui.setButtonStates(false);
        this.ui.updateDurationInputsState(false);
        
        NotificationManager.playSound();
        
        // Update session count for completed pomodoros
        if (this.timer.mode === 'pomodoro') {
            this.sessionCount++;
            this.ui.updateSessionCount(this.sessionCount);
            
            // Track completed pomodoro for graph
            this.trackFocusTime(this.durations.pomodoro);
            
            // Auto-switch to break after 4 pomodoros
            if (this.sessionCount % 4 === 0) {
                this.setMode('long-break');
                this.timerStatus.textContent = 'Take a Long Break!';
            } else {
                this.setMode('short-break');
                this.timerStatus.textContent = 'Take a Short Break!';
            }
        } else {
            // Auto-switch back to pomodoro after break
            this.setMode('pomodoro');
            this.timerStatus.textContent = 'Ready to Focus';
        }
        
        // Show notification
        const title = this.timer.mode === 'pomodoro' ? 'Break Complete!' : 'Pomodoro Complete!';
        const body = this.timer.mode === 'pomodoro' ? 'Time for a break!' : 'Time to get back to work!';
        NotificationManager.showNotification(title, body);
    }
    
    trackFocusTime(durationSeconds) {
        const today = new Date().toISOString().split('T')[0];
        const data = StorageManager.loadFocusData();
        
        if (!data[today]) {
            data[today] = 0;
        }
        
        data[today] += durationSeconds;
        
        // Clean up old data (keep only last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];
        
        Object.keys(data).forEach(date => {
            if (date < cutoffDate) {
                delete data[date];
            }
        });
        
        StorageManager.saveFocusData(data);
        if (this.graph) {
            this.graph.update();
        }
    }
    
    updateDisplay() {
        const state = this.timer.getState();
        this.ui.updateDisplay(state.timeLeft, state.durations[state.mode]);
    }
}

// Request notification permission on load
NotificationManager.requestPermission();

// Initialize timer when page loads
document.addEventListener('DOMContentLoaded', () => {
    try {
        new PomodoroTimer();
    } catch (error) {
        console.error('Error initializing PomodoroTimer:', error);
    }
});
