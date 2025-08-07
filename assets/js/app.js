/**
 * Main Application Entry Point
 * Initializes all managers and coordinates the application lifecycle
 */

class App {
  constructor() {
    this.managers = {};
    this.isInitialized = false;
    this.eventBus = null;
    this.stateManager = null;
    
    this.init();
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      console.log('Initializing Portfolio App...');
      
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.start());
      } else {
        await this.start();
      }
      
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.handleInitError(error);
    }
  }

  /**
   * Start the application
   */
  async start() {
    try {
      // Initialize core systems
      await this.initCore();
      
      // Initialize managers
      await this.initManagers();
      
      // Set up global event listeners
      this.setupGlobalListeners();
      
      // Mark as initialized
      this.isInitialized = true;
      
      // Emit ready event
      this.eventBus.emit('app:ready');
      
      console.log('Portfolio App initialized successfully');
      
    } catch (error) {
      console.error('Failed to start app:', error);
      this.handleInitError(error);
    }
  }

  /**
   * Initialize core systems (EventBus and StateManager)
   */
  async initCore() {
    // Core systems should already be loaded from HTML
    this.eventBus = window.eventBus;
    this.stateManager = window.stateManager;
    
    if (!this.eventBus || !this.stateManager) {
      throw new Error('Core systems not available. Make sure EventBus and StateManager are loaded.');
    }
    
    // Set up core event listeners
    this.eventBus.on('app:restart', () => this.restart());
    this.eventBus.on('app:destroy', () => this.destroy());
    
    console.log('Core systems initialized');
  }

  /**
   * Initialize all managers in proper order
   */
  async initManagers() {
    const managerConfig = [
      { name: 'i18n', class: window.I18nManager, required: true },
      { name: 'theme', class: window.ThemeManager, required: true },
      { name: 'nav', class: window.NavManager, required: true },
      { name: 'typing', class: window.TypingManager, required: false }
    ];

    for (const config of managerConfig) {
      try {
        if (!config.class) {
          if (config.required) {
            throw new Error(`Required manager class not found: ${config.name}`);
          } else {
            console.warn(`Optional manager not available: ${config.name}`);
            continue;
          }
        }

        console.log(`Initializing ${config.name} manager...`);
        this.managers[config.name] = new config.class();
        
        // Wait a bit for manager initialization
        await this.delay(50);
        
      } catch (error) {
        console.error(`Failed to initialize ${config.name} manager:`, error);
        
        if (config.required) {
          throw error;
        }
      }
    }

    // Set up inter-manager communication
    this.setupManagerCommunication();
    
    console.log('All managers initialized');
  }

  /**
   * Set up communication between managers
   */
  setupManagerCommunication() {
    // Language changes should trigger typing animation restart
    this.eventBus.on('i18n:languageChanged', () => {
      if (this.managers.typing) {
        setTimeout(() => {
          this.managers.typing.restartAnimation();
        }, 100);
      }
    });

    // Navigation state changes
    this.eventBus.on('nav:stateChanged', ({ isOpen }) => {
      this.stateManager.setState('isNavOpen', isOpen);
    });

    // Theme changes
    this.eventBus.on('theme:changed', ({ newTheme }) => {
      console.log(`Theme changed to: ${newTheme}`);
    });

    // Typing animation events
    this.eventBus.on('typing:completed', () => {
      // Initialize scroll spy after typing animation completes
      if (this.managers.nav && this.managers.nav.initScrollSpy) {
        setTimeout(() => {
          this.managers.nav.initScrollSpy();
        }, 1000);
      }
    });
  }

  /**
   * Set up global event listeners
   */
  setupGlobalListeners() {
    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      this.eventBus.emit('app:error', { error: event.error });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.eventBus.emit('app:error', { error: event.reason });
    });

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      const isVisible = !document.hidden;
      this.eventBus.emit('app:visibilityChanged', { isVisible });
    });

    // Handle online/offline status
    window.addEventListener('online', () => {
      this.eventBus.emit('app:connectionChanged', { isOnline: true });
    });

    window.addEventListener('offline', () => {
      this.eventBus.emit('app:connectionChanged', { isOnline: false });
    });

    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      this.handleKeyboardShortcuts(e);
    });

    console.log('Global event listeners set up');
  }

  /**
   * Handle keyboard shortcuts
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleKeyboardShortcuts(event) {
    // Escape key - close any open modals/menus
    if (event.key === 'Escape') {
      this.eventBus.emit('app:escape');
    }

    // Ctrl/Cmd + K - Focus search (if available)
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.eventBus.emit('app:focusSearch');
    }

    // Theme toggle with Ctrl/Cmd + Shift + T
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'T') {
      event.preventDefault();
      this.eventBus.emit('theme:toggle');
    }
  }

  /**
   * Handle initialization errors
   * @param {Error} error - Error that occurred
   */
  handleInitError(error) {
    console.error('App initialization failed:', error);
    
    // Show user-friendly error message
    const errorMessage = this.createErrorMessage(error);
    document.body.appendChild(errorMessage);
    
    // Emit error event
    if (this.eventBus) {
      this.eventBus.emit('app:initError', { error });
    }
  }

  /**
   * Create user-friendly error message element
   * @param {Error} error - Error that occurred
   * @returns {Element} Error message element
   */
  createErrorMessage(error) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'app-error';
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ff4444;
      color: white;
      padding: 15px;
      border-radius: 5px;
      z-index: 10000;
      max-width: 300px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
    `;
    
    errorDiv.innerHTML = `
      <strong>App Error</strong><br>
      Something went wrong. Please refresh the page.
      <br><br>
      <button onclick="location.reload()" style="
        background: white;
        color: #ff4444;
        border: none;
        padding: 5px 10px;
        border-radius: 3px;
        cursor: pointer;
      ">Refresh Page</button>
    `;
    
    return errorDiv;
  }

  /**
   * Restart the application
   */
  async restart() {
    console.log('Restarting app...');
    
    try {
      // Destroy current instance
      await this.destroy();
      
      // Reinitialize
      await this.start();
      
    } catch (error) {
      console.error('Failed to restart app:', error);
    }
  }

  /**
   * Destroy the application and cleanup
   */
  async destroy() {
    console.log('Destroying app...');
    
    try {
      // Destroy all managers
      for (const [name, manager] of Object.entries(this.managers)) {
        if (manager && typeof manager.destroy === 'function') {
          console.log(`Destroying ${name} manager...`);
          manager.destroy();
        }
      }
      
      // Clear managers
      this.managers = {};
      
      // Clear state
      if (this.stateManager) {
        this.stateManager.reset();
      }
      
      // Clear event bus
      if (this.eventBus) {
        this.eventBus.clear();
      }
      
      this.isInitialized = false;
      
      console.log('App destroyed');
      
    } catch (error) {
      console.error('Error during app destruction:', error);
    }
  }

  /**
   * Get manager instance
   * @param {string} name - Manager name
   * @returns {Object|null} Manager instance or null
   */
  getManager(name) {
    return this.managers[name] || null;
  }

  /**
   * Check if app is initialized
   * @returns {boolean} True if initialized
   */
  isReady() {
    return this.isInitialized;
  }

  /**
   * Get app status
   * @returns {Object} App status information
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      managers: Object.keys(this.managers),
      theme: this.stateManager?.getState('theme') || 'unknown',
      language: this.stateManager?.getState('language') || 'unknown'
    };
  }

  /**
   * Utility delay function
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} Promise that resolves after delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create and start the app
const app = new App();

// Make app instance globally available for debugging
window.portfolioApp = app;

// Log startup message
console.log('Portfolio App starting...');