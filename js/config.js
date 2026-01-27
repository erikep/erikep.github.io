export const DEFAULT_DURATIONS = {
    pomodoro: 25,
    'short-break': 5,
    'long-break': 15
};

export const COLOR_THEMES = {
    forest: {
        primary: '#6b8e5a',
        secondary: '#4a6b3a',
        text: '#3d5630',
        rgb: '107, 142, 90'
    },
    desert: {
        primary: '#c9a882',
        secondary: '#a6896b',
        text: '#7a6b55',
        rgb: '201, 168, 130'
    },
    autumn: {
        primary: '#c97d60',
        secondary: '#a85d45',
        text: '#8b4a35',
        rgb: '201, 125, 96'
    },
    sage: {
        primary: '#9aaf88',
        secondary: '#7a9570',
        text: '#5f7354',
        rgb: '154, 175, 136'
    },
    terracotta: {
        primary: '#b8735a',
        secondary: '#965a45',
        text: '#7a4838',
        rgb: '184, 115, 90'
    }
};

export const STORAGE_KEYS = {
    DURATIONS: 'pomodoroDurations',
    THEME: 'pomodoroTheme',
    FOCUS_DATA: 'pomodoroFocusData'
};

export const DEFAULT_THEME = 'autumn';
