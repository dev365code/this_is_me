/**
 * Utility helper functions
 * Common utility functions used across the application
 */

/**
 * Device and viewport utilities
 */
export const Device = {
  /**
   * Check if current viewport is mobile
   * @param {number} breakpoint - Mobile breakpoint (default: 768)
   * @returns {boolean} True if mobile viewport
   */
  isMobile(breakpoint = 768) {
    return window.innerWidth <= breakpoint;
  },

  /**
   * Check if current viewport is tablet
   * @param {number} minWidth - Minimum tablet width (default: 769)
   * @param {number} maxWidth - Maximum tablet width (default: 1024)
   * @returns {boolean} True if tablet viewport
   */
  isTablet(minWidth = 769, maxWidth = 1024) {
    return window.innerWidth >= minWidth && window.innerWidth <= maxWidth;
  },

  /**
   * Check if current viewport is desktop
   * @param {number} minWidth - Minimum desktop width (default: 1025)
   * @returns {boolean} True if desktop viewport
   */
  isDesktop(minWidth = 1025) {
    return window.innerWidth >= minWidth;
  },

  /**
   * Get current viewport size
   * @returns {Object} Viewport dimensions
   */
  getViewport() {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }
};

/**
 * DOM utilities
 */
export const DOM = {
  /**
   * Safely query selector with optional parent
   * @param {string} selector - CSS selector
   * @param {Element} parent - Parent element (default: document)
   * @returns {Element|null} Found element or null
   */
  $(selector, parent = document) {
    try {
      return parent.querySelector(selector);
    } catch (error) {
      console.warn(`Invalid selector: ${selector}`, error);
      return null;
    }
  },

  /**
   * Safely query selector all with optional parent
   * @param {string} selector - CSS selector
   * @param {Element} parent - Parent element (default: document)
   * @returns {NodeList} Found elements
   */
  $$(selector, parent = document) {
    try {
      return parent.querySelectorAll(selector);
    } catch (error) {
      console.warn(`Invalid selector: ${selector}`, error);
      return [];
    }
  },

  /**
   * Check if element exists and is visible
   * @param {Element} element - Element to check
   * @returns {boolean} True if element exists and is visible
   */
  isVisible(element) {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && 
           rect.top >= 0 && rect.left >= 0 &&
           rect.bottom <= window.innerHeight &&
           rect.right <= window.innerWidth;
  },

  /**
   * Smooth scroll to element
   * @param {Element|string} target - Target element or selector
   * @param {number} offset - Offset from target (default: 80)
   * @param {string} behavior - Scroll behavior (default: 'smooth')
   */
  scrollTo(target, offset = 80, behavior = 'smooth') {
    const element = typeof target === 'string' ? this.$(target) : target;
    
    if (!element) {
      console.warn('Scroll target not found:', target);
      return;
    }
    
    const offsetTop = element.offsetTop - offset;
    window.scrollTo({
      top: offsetTop,
      behavior
    });
  },

  /**
   * Add event listener with cleanup function
   * @param {Element} element - Target element
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   * @param {Object} options - Event options
   * @returns {Function} Cleanup function
   */
  on(element, event, handler, options = {}) {
    if (!element || !event || typeof handler !== 'function') {
      console.warn('Invalid event listener parameters');
      return () => {};
    }
    
    element.addEventListener(event, handler, options);
    
    return () => {
      element.removeEventListener(event, handler, options);
    };
  }
};

/**
 * Timing utilities
 */
export const Timing = {
  /**
   * Debounce function calls
   * @param {Function} func - Function to debounce
   * @param {number} delay - Delay in milliseconds
   * @returns {Function} Debounced function
   */
  debounce(func, delay) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  },

  /**
   * Throttle function calls
   * @param {Function} func - Function to throttle
   * @param {number} delay - Delay in milliseconds
   * @returns {Function} Throttled function
   */
  throttle(func, delay) {
    let lastCall = 0;
    return (...args) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        return func.apply(this, args);
      }
    };
  },

  /**
   * Create a delay/sleep function
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} Promise that resolves after delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Retry function with exponential backoff
   * @param {Function} fn - Function to retry
   * @param {number} maxAttempts - Maximum retry attempts
   * @param {number} baseDelay - Base delay in milliseconds
   * @returns {Promise} Promise that resolves with function result
   */
  async retry(fn, maxAttempts = 3, baseDelay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        console.warn(`Attempt ${attempt} failed:`, error);
        
        if (attempt < maxAttempts) {
          const delay = baseDelay * Math.pow(2, attempt - 1);
          await this.delay(delay);
        }
      }
    }
    
    throw lastError;
  }
};

/**
 * Storage utilities
 */
export const Storage = {
  /**
   * Safely get item from localStorage
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if key not found
   * @returns {*} Stored value or default
   */
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Failed to get storage item '${key}':`, error);
      return defaultValue;
    }
  },

  /**
   * Safely set item in localStorage
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @returns {boolean} True if successful
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Failed to set storage item '${key}':`, error);
      return false;
    }
  },

  /**
   * Remove item from localStorage
   * @param {string} key - Storage key
   * @returns {boolean} True if successful
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Failed to remove storage item '${key}':`, error);
      return false;
    }
  },

  /**
   * Clear all localStorage items
   * @returns {boolean} True if successful
   */
  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.warn('Failed to clear storage:', error);
      return false;
    }
  }
};

/**
 * URL utilities
 */
export const URL = {
  /**
   * Get URL parameters as object
   * @returns {Object} URL parameters
   */
  getParams() {
    return Object.fromEntries(new URLSearchParams(window.location.search));
  },

  /**
   * Set URL parameter
   * @param {string} key - Parameter key
   * @param {string} value - Parameter value
   * @param {boolean} replace - Replace current history entry
   */
  setParam(key, value, replace = false) {
    const url = new URL(window.location);
    url.searchParams.set(key, value);
    
    if (replace) {
      history.replaceState(null, '', url);
    } else {
      history.pushState(null, '', url);
    }
  },

  /**
   * Remove URL parameter
   * @param {string} key - Parameter key to remove
   * @param {boolean} replace - Replace current history entry
   */
  removeParam(key, replace = false) {
    const url = new URL(window.location);
    url.searchParams.delete(key);
    
    if (replace) {
      history.replaceState(null, '', url);
    } else {
      history.pushState(null, '', url);
    }
  },

  /**
   * Get hash without #
   * @returns {string} Current hash
   */
  getHash() {
    return window.location.hash.slice(1);
  },

  /**
   * Set hash
   * @param {string} hash - Hash to set (without #)
   */
  setHash(hash) {
    window.location.hash = hash;
  }
};

/**
 * Validation utilities
 */
export const Validate = {
  /**
   * Check if value is empty
   * @param {*} value - Value to check
   * @returns {boolean} True if empty
   */
  isEmpty(value) {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  },

  /**
   * Check if string is valid email
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid email
   */
  isEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Check if string is valid URL
   * @param {string} url - URL to validate
   * @returns {boolean} True if valid URL
   */
  isURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Check if value is within range
   * @param {number} value - Value to check
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {boolean} True if within range
   */
  inRange(value, min, max) {
    return value >= min && value <= max;
  }
};

/**
 * Animation utilities
 */
export const Animation = {
  /**
   * Animate element with CSS classes
   * @param {Element} element - Element to animate
   * @param {string} className - Animation class name
   * @param {number} duration - Animation duration (optional)
   * @returns {Promise} Promise that resolves when animation completes
   */
  animate(element, className, duration = null) {
    if (!element) return Promise.resolve();
    
    return new Promise((resolve) => {
      const cleanup = () => {
        element.classList.remove(className);
        element.removeEventListener('animationend', cleanup);
        resolve();
      };
      
      element.addEventListener('animationend', cleanup);
      element.classList.add(className);
      
      // Fallback timeout if animationend doesn't fire
      if (duration) {
        setTimeout(cleanup, duration);
      }
    });
  },

  /**
   * Fade in element
   * @param {Element} element - Element to fade in
   * @param {number} duration - Fade duration in ms
   * @returns {Promise} Promise that resolves when fade completes
   */
  fadeIn(element, duration = 300) {
    if (!element) return Promise.resolve();
    
    return new Promise((resolve) => {
      element.style.opacity = '0';
      element.style.display = 'block';
      element.style.transition = `opacity ${duration}ms ease`;
      
      // Trigger reflow
      element.offsetHeight;
      
      element.style.opacity = '1';
      
      setTimeout(() => {
        element.style.transition = '';
        resolve();
      }, duration);
    });
  },

  /**
   * Fade out element
   * @param {Element} element - Element to fade out
   * @param {number} duration - Fade duration in ms
   * @returns {Promise} Promise that resolves when fade completes
   */
  fadeOut(element, duration = 300) {
    if (!element) return Promise.resolve();
    
    return new Promise((resolve) => {
      element.style.transition = `opacity ${duration}ms ease`;
      element.style.opacity = '0';
      
      setTimeout(() => {
        element.style.display = 'none';
        element.style.transition = '';
        resolve();
      }, duration);
    });
  }
};

// Make utilities available globally for backward compatibility
if (typeof window !== 'undefined') {
  window.Utils = {
    Device,
    DOM,
    Timing,
    Storage,
    URL,
    Validate,
    Animation
  };
}