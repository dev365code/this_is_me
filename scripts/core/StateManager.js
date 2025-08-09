/**
 * StateManager - Central state management
 * Manages global application state with reactive updates
 */
class StateManager {
  constructor() {
    this.state = {
      theme: 'light',
      language: 'ko',
      isNavOpen: false,
      isTypingAnimationComplete: false,
      translations: {}
    };
    
    this.subscribers = new Map();
    this.eventBus = window.eventBus;
    
    this.init();
  }

  init() {
    // Load persisted state
    this.loadPersistedState();
    
    // Set up event bus listeners
    this.setupEventListeners();
  }

  /**
   * Load state from localStorage
   */
  loadPersistedState() {
    const savedTheme = localStorage.getItem('portfolio-theme');
    const savedLang = localStorage.getItem('portfolio-lang');
    
    if (savedTheme) {
      this.state.theme = savedTheme;
    }
    
    if (savedLang) {
      this.state.language = savedLang;
    }
  }

  /**
   * Set up event bus listeners
   */
  setupEventListeners() {
    // Listen for state change requests
    this.eventBus.on('state:set', ({ key, value }) => {
      this.setState(key, value);
    });
    
    this.eventBus.on('state:get', ({ key, callback }) => {
      callback(this.getState(key));
    });
  }

  /**
   * Get current state value
   * @param {string} key - State key
   * @returns {*} State value
   */
  getState(key) {
    return key ? this.state[key] : this.state;
  }

  /**
   * Set state value and notify subscribers
   * @param {string} key - State key
   * @param {*} value - New value
   */
  setState(key, value) {
    const oldValue = this.state[key];
    this.state[key] = value;
    
    // Persist certain state values
    this.persistState(key, value);
    
    // Notify subscribers
    this.notifySubscribers(key, value, oldValue);
    
    // Emit event bus event
    this.eventBus.emit('state:changed', { key, value, oldValue });
  }

  /**
   * Subscribe to state changes
   * @param {string} key - State key to watch
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(key, callback) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, []);
    }
    
    this.subscribers.get(key).push(callback);
    
    // Return unsubscribe function
    return () => this.unsubscribe(key, callback);
  }

  /**
   * Unsubscribe from state changes
   * @param {string} key - State key
   * @param {Function} callback - Callback to remove
   */
  unsubscribe(key, callback) {
    if (!this.subscribers.has(key)) return;
    
    const callbacks = this.subscribers.get(key);
    const index = callbacks.indexOf(callback);
    
    if (index > -1) {
      callbacks.splice(index, 1);
    }
    
    if (callbacks.length === 0) {
      this.subscribers.delete(key);
    }
  }

  /**
   * Notify all subscribers of a state change
   * @param {string} key - State key
   * @param {*} value - New value
   * @param {*} oldValue - Previous value
   */
  notifySubscribers(key, value, oldValue) {
    if (!this.subscribers.has(key)) return;
    
    const callbacks = this.subscribers.get(key);
    callbacks.forEach(callback => {
      try {
        callback(value, oldValue);
      } catch (error) {
        console.error(`Error in state subscriber for '${key}':`, error);
      }
    });
  }

  /**
   * Persist state to localStorage
   * @param {string} key - State key
   * @param {*} value - Value to persist
   */
  persistState(key, value) {
    switch (key) {
      case 'theme':
        localStorage.setItem('portfolio-theme', value);
        break;
      case 'language':
        localStorage.setItem('portfolio-lang', value);
        break;
    }
  }

  /**
   * Reset state to defaults
   */
  reset() {
    this.state = {
      theme: 'light',
      language: 'en',
      isNavOpen: false,
      isTypingAnimationComplete: false,
      translations: {}
    };
    
    // Clear localStorage
    localStorage.removeItem('portfolio-theme');
    localStorage.removeItem('portfolio-lang');
    
    // Notify all subscribers
    Object.keys(this.state).forEach(key => {
      this.notifySubscribers(key, this.state[key], undefined);
    });
    
    this.eventBus.emit('state:reset');
  }
}

// Create and export global state manager instance
window.stateManager = new StateManager();