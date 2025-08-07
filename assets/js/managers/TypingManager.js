/**
 * TypingManager - Handles typing animation effects
 * Integrates with StateManager and I18nManager for reactive updates
 */
class TypingManager {
  constructor() {
    this.line1 = null;
    this.line2 = null;
    this.stateManager = window.stateManager;
    this.eventBus = window.eventBus;
    this.isAnimating = false;
    this.resizeTimer = null;
    
    this.init();
  }

  init() {
    this.setupDOM();
    this.setupEventListeners();
    this.setupStateSubscriptions();
  }

  setupDOM() {
    this.line1 = document.getElementById('line1');
    this.line2 = document.getElementById('line2');
  }

  setupEventListeners() {
    // Listen for typing animation requests
    this.eventBus.on('typing:start', () => this.startAnimation());
    this.eventBus.on('typing:restart', () => this.restartAnimation());
    this.eventBus.on('typing:stop', () => this.stopAnimation());

    // Bind event handlers
    this.boundHandleResize = this.handleResize.bind(this);
    this.boundScheduleInitialAnimation = this.scheduleInitialAnimation.bind(this);

    // Handle window resize with debouncing
    window.addEventListener('resize', this.boundHandleResize);

    // Start animation when page loads
    window.addEventListener('load', this.boundScheduleInitialAnimation);
  }

  setupStateSubscriptions() {
    // Subscribe to language changes to restart animation
    this.stateManager.subscribe('language', () => {
      if (!this.isAnimating) {
        setTimeout(() => this.startAnimation(), 100);
      }
    });

    // Subscribe to translations updates
    this.stateManager.subscribe('translations', (newTranslations) => {
      if (newTranslations && Object.keys(newTranslations).length > 0) {
        this.eventBus.emit('typing:translationsReady');
      }
    });
  }

  /**
   * Schedule initial animation with delay
   */
  scheduleInitialAnimation() {
    console.log('TypingManager: Scheduling initial animation');
    setTimeout(() => {
      const translations = this.stateManager.getState('translations');
      console.log('TypingManager: Checking translations:', translations);
      if (translations && Object.keys(translations).length > 0) {
        console.log('TypingManager: Starting animation with translations');
        this.startAnimation();
      } else {
        console.log('TypingManager: No translations, using fallback');
        // Fallback with default values if translations not loaded
        setTimeout(() => this.startAnimation(), 1000);
      }
    }, 500);
  }

  /**
   * Handle window resize with debouncing
   */
  handleResize() {
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      // Only reload on significant size changes that affect layout
      if (this.shouldReloadOnResize()) {
        location.reload();
      }
    }, 250);
  }

  /**
   * Determine if page should reload on resize
   * @returns {boolean} True if reload is needed
   */
  shouldReloadOnResize() {
    // Check if we crossed mobile/desktop breakpoint
    const isMobile = this.isMobile();
    const wasMobile = window.innerWidth <= 768;
    return isMobile !== wasMobile;
  }

  /**
   * Check if current viewport is mobile
   * @returns {boolean} True if mobile viewport
   */
  isMobile() {
    return window.innerWidth <= 768;
  }

  /**
   * Get current translations from state or fallback
   * @returns {Object} Translation data
   */
  getTranslations() {
    const translations = this.stateManager.getState('translations');
    
    // Fallback to default values if translations not available
    const fallback = {
      hero: {
        greeting: "Hi, I'm",
        name: "Wooyong Lee"
      }
    };
    
    return translations?.hero ? translations : fallback;
  }

  /**
   * Type text with animation effect
   * @param {Element} element - Target element
   * @param {string} text - Text to type
   * @param {number} speed - Typing speed in ms
   * @param {boolean} isAccentColor - Use accent color
   * @returns {Promise} Promise that resolves when animation completes
   */
  async typeText(element, text, speed = 100, isAccentColor = false) {
    if (!element) return;
    
    return new Promise((resolve) => {
      let i = 0;
      element.style.width = '0';
      element.style.overflow = 'hidden';
      element.style.whiteSpace = 'nowrap';
      element.textContent = '';
      
      // Set colors based on accent flag
      if (isAccentColor) {
        element.style.color = '#81D8D0';
        element.style.borderRightColor = 'var(--accent-color)';
      } else {
        element.style.color = 'var(--typing-primary)';
        element.style.borderRightColor = 'var(--typing-cursor-primary)';
      }
      
      const timer = setInterval(() => {
        if (i < text.length && this.isAnimating) {
          element.style.width = (i + 1) + 'ch';
          element.textContent = text.substring(0, i + 1);
          i++;
        } else {
          clearInterval(timer);
          resolve();
        }
      }, speed);
    });
  }

  /**
   * Continue typing on existing text (desktop mode)
   * @param {Element} element - Target element
   * @param {string} existingText - Existing text
   * @param {string} newText - New text to add
   * @param {number} speed - Typing speed
   * @param {boolean} isAccentColor - Use accent color for new text
   * @returns {Promise} Promise that resolves when animation completes
   */
  async typeTextContinue(element, existingText, newText, speed = 100, isAccentColor = false) {
    if (!element) return;
    
    return new Promise((resolve) => {
      let i = 0;
      
      if (isAccentColor) {
        element.style.borderRightColor = 'var(--accent-color)';
      }
      
      const timer = setInterval(() => {
        if (i < newText.length && this.isAnimating) {
          const fullText = existingText + newText.substring(0, i + 1);
          element.innerHTML = `
            <span style="color: var(--typing-primary)">${existingText}</span>
            <span style="color: var(--accent-color)">${newText.substring(0, i + 1)}</span>
          `;
          element.style.width = (fullText.length) + 'ch';
          i++;
        } else {
          clearInterval(timer);
          resolve();
        }
      }, speed);
    });
  }

  /**
   * Start the main typing animation sequence
   */
  async startAnimation() {
    if (this.isAnimating || !this.line1) return;
    
    this.isAnimating = true;
    this.eventBus.emit('typing:started');
    
    try {
      const { hero } = this.getTranslations();
      const greeting = hero.greeting || "Hi, I'm";
      const name = hero.name || "Wooyong Lee";
      
      // Reset elements
      this.resetElements();
      
      if (this.isMobile()) {
        await this.animateMobile(greeting, name);
      } else {
        await this.animateDesktop(greeting, name);
      }
      
      // Clean up animation state
      this.cleanupAnimation();
      
    } catch (error) {
      console.error('Error in typing animation:', error);
    } finally {
      this.isAnimating = false;
      this.stateManager.setState('isTypingAnimationComplete', true);
      this.eventBus.emit('typing:completed');
    }
  }

  /**
   * Reset animation elements to initial state
   */
  resetElements() {
    if (this.line1) {
      this.line1.textContent = '';
      this.line1.style.width = '0';
      this.line1.classList.remove('blink');
      this.line1.style.borderRight = 'none';
    }
    
    if (this.line2) {
      this.line2.textContent = '';
      this.line2.style.width = '0';
      this.line2.classList.remove('blink');
      this.line2.style.borderRight = 'none';
    }
  }

  /**
   * Animate for mobile layout (two lines)
   * @param {string} greeting - Greeting text
   * @param {string} name - Name text
   */
  async animateMobile(greeting, name) {
    if (!this.line1 || !this.line2) return;
    
    this.line2.style.display = 'block';
    
    // Animate greeting on first line
    this.line1.style.borderRight = '3px solid var(--typing-cursor-primary)';
    this.line1.classList.add('blink');
    await this.typeText(this.line1, greeting, 120, false);
    await this.delay(300);
    
    // Switch to name on second line
    this.line1.style.borderRight = 'none';
    this.line1.classList.remove('blink');
    this.line2.style.borderRight = '3px solid var(--accent-color)';
    this.line2.classList.add('blink');
    await this.typeText(this.line2, name, 120, true);
  }

  /**
   * Animate for desktop layout (one line)
   * @param {string} greeting - Greeting text
   * @param {string} name - Name text
   */
  async animateDesktop(greeting, name) {
    if (!this.line1 || !this.line2) return;
    
    this.line2.style.display = 'none';
    this.line1.style.borderRight = '3px solid var(--typing-cursor-primary)';
    this.line1.classList.add('blink');
    
    // Type greeting with space
    await this.typeText(this.line1, greeting + " ", 100, false);
    
    // Continue with name in accent color
    this.line1.style.borderRightColor = 'var(--accent-color)';
    const currentText = this.line1.textContent;
    await this.typeTextContinue(this.line1, currentText, name, 100, true);
  }

  /**
   * Clean up animation styles and cursors
   */
  cleanupAnimation() {
    setTimeout(() => {
      if (this.line1) {
        this.line1.classList.remove('blink');
        this.line1.style.borderRight = 'none';
      }
      if (this.line2) {
        this.line2.classList.remove('blink');
        this.line2.style.borderRight = 'none';
      }
    }, 2000);
  }

  /**
   * Restart animation (useful for language changes)
   */
  async restartAnimation() {
    this.stopAnimation();
    await this.delay(100);
    this.startAnimation();
  }

  /**
   * Stop current animation
   */
  stopAnimation() {
    this.isAnimating = false;
    this.resetElements();
  }

  /**
   * Utility delay function
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} Promise that resolves after delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if animation is currently running
   * @returns {boolean} True if animating
   */
  isRunning() {
    return this.isAnimating;
  }

  /**
   * Cleanup event listeners and timers
   */
  destroy() {
    this.stopAnimation();
    clearTimeout(this.resizeTimer);
    window.removeEventListener('resize', this.boundHandleResize);
    window.removeEventListener('load', this.boundScheduleInitialAnimation);
  }
}

// Export for use in main app
window.TypingManager = TypingManager;

// Make startTypingAnimation available globally for backward compatibility
window.startTypingAnimation = function() {
  if (window.portfolioApp && window.portfolioApp.getManager('typing')) {
    window.portfolioApp.getManager('typing').startAnimation();
  }
};