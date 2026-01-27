import { COLOR_THEMES, DEFAULT_THEME } from './config.js';
import { StorageManager } from './storage.js';

export class ColorManager {
    constructor(root, colorOptions) {
        this.root = root;
        this.colorOptions = colorOptions;
        this.currentTheme = StorageManager.loadTheme();
        this.themes = COLOR_THEMES;
    }
    
    setTheme(themeName) {
        if (this.themes[themeName]) {
            this.currentTheme = themeName;
            StorageManager.saveTheme(themeName);
            this.applyColors();
            this.updateColorButtons();
        }
    }
    
    applyColors() {
        const theme = this.themes[this.currentTheme] || this.themes[DEFAULT_THEME];
        
        this.root.style.setProperty('--primary-color', theme.primary);
        this.root.style.setProperty('--secondary-color', theme.secondary);
        this.root.style.setProperty('--text-color', theme.text);
        this.root.style.setProperty('--active-gradient-start', theme.primary);
        this.root.style.setProperty('--active-gradient-end', theme.secondary);
        this.root.style.setProperty('--text-color-rgb', theme.rgb);
    }
    
    updateColorButtons() {
        this.colorOptions.forEach(btn => {
            if (btn.dataset.theme === this.currentTheme) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
    
    getCurrentTheme() {
        return this.currentTheme;
    }
}
