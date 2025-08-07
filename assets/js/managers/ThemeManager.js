/**
 * ThemeManager - Handles theme switching and persistence
 * Integrates with StateManager and EventBus for reactive updates
 */
class ThemeManager {
  constructor() {
    this.themeToggle = null;
    this.stateManager = window.stateManager;
    this.eventBus = window.eventBus;
    
    this.init();
  }

  init() {
    this.setupDOM();
    this.setupEventListeners();
    this.setupStateSubscriptions();
    
    // Apply initial theme from state
    this.applyTheme(this.stateManager.getState('theme'));
  }

  setupDOM() {
    this.themeToggle = document.getElementById('menu-theme-toggle');
  }

  setupEventListeners() {
    if (this.themeToggle) {
      this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    // Listen for theme change events
    this.eventBus.on('theme:toggle', () => this.toggleTheme());
    this.eventBus.on('theme:set', (theme) => this.setTheme(theme));
  }

  setupStateSubscriptions() {
    // Subscribe to theme state changes
    this.stateManager.subscribe('theme', (newTheme, oldTheme) => {
      this.applyTheme(newTheme);
      this.eventBus.emit('theme:changed', { newTheme, oldTheme });
    });
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme() {
    const currentTheme = this.stateManager.getState('theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  /**
   * Set specific theme
   * @param {string} theme - Theme to set ('light' or 'dark')
   */
  setTheme(theme) {
    if (theme !== 'light' && theme !== 'dark') {
      console.warn(`Invalid theme: ${theme}. Using 'light' as fallback.`);
      theme = 'light';
    }

    this.stateManager.setState('theme', theme);
  }

  /**
   * Apply theme to DOM
   * @param {string} theme - Theme to apply
   */
  applyTheme(theme) {
    const root = document.documentElement;
    
    if (theme === 'light') {
      root.removeAttribute('data-theme');
      if (this.themeToggle) {
        this.themeToggle.classList.add('light');
        this.themeToggle.classList.remove('dark');
      }
    } else {
      root.setAttribute('data-theme', 'dark');
      if (this.themeToggle) {
        this.themeToggle.classList.add('dark');
        this.themeToggle.classList.remove('light');
      }
    }
  }

  /**
   * Get current theme
   * @returns {string} Current theme
   */
  getCurrentTheme() {
    return this.stateManager.getState('theme');
  }

  /**
   * Check if current theme is dark
   * @returns {boolean} True if dark theme is active
   */
  isDarkTheme() {
    return this.getCurrentTheme() === 'dark';
  }

  /**
   * Cleanup event listeners
   */
  destroy() {
    if (this.themeToggle) {
      this.themeToggle.removeEventListener('click', this.toggleTheme);
    }
  }
}

// Export for use in main app
window.ThemeManager = ThemeManager;