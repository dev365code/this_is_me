/**
 * App - 메인 애플리케이션 진입점
 * 
 * 주요 역할:
 * - 모든 매니저들의 초기화 및 생명주기 관리
 * - 매니저 간 통신 조율 및 의존성 관리
 * - 전역 이벤트 처리 및 에러 핸들링
 * - 키보드 단축키 및 시스템 이벤트 관리
 * 
 * 초기화 순서:
 * 1. 코어 시스템 (EventBus, StateManager) 확인
 * 2. 매니저들 순차 초기화 (I18n → Theme → Nav → Typing)
 * 3. 매니저 간 통신 설정
 * 4. 글로벌 이벤트 리스너 등록
 * 5. 애플리케이션 준비 완료 이벤트 발생
 */

class App {
  constructor() {
    // 매니저 인스턴스들을 저장하는 객체
    this.managers = {};
    
    // 애플리케이션 상태
    this.isInitialized = false;      // 초기화 완료 여부
    
    // 코어 시스템 참조 (HTML에서 먼저 로드됨)
    this.eventBus = null;            // 이벤트 버스 인스턴스
    this.stateManager = null;        // 상태 관리자 인스턴스
    
    this.init();
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
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
    
  }

  /**
   * Initialize all managers in proper order
   */
  async initManagers() {
    // Phase 1: Core managers (essential for basic functionality)
    const coreManagers = [
      { name: 'i18n', class: window.I18nManager, required: true },
      { name: 'theme', class: window.ThemeManager, required: true },
      { name: 'nav', class: window.NavManager, required: true }
    ];

    console.log('🚀 Initializing core managers...');
    for (const config of coreManagers) {
      try {
        if (!config.class) {
          throw new Error(`Required manager class not found: ${config.name}`);
        }

        console.log(`📝 Initializing ${config.name} manager...`);
        this.managers[config.name] = new config.class();
        
        // Wait for core manager initialization
        await this.delay(100);
        console.log(`✅ ${config.name} manager initialized`);
        
      } catch (error) {
        console.error(`❌ Failed to initialize ${config.name} manager:`, error);
        throw error; // Core managers are required
      }
    }

    // Set up inter-manager communication first
    this.setupManagerCommunication();

    // Phase 2: Enhanced managers (can be initialized asynchronously)
    const enhancedManagers = [
      { name: 'typing', class: window.TypingManager, required: false },
      { name: 'blog', class: window.BlogManager, required: false }
    ];

    console.log('🎨 Initializing enhanced managers...');
    // Initialize enhanced managers without blocking
    this.initEnhancedManagers(enhancedManagers);
  }

  /**
   * Initialize enhanced managers asynchronously
   * @param {Array} managers - Array of manager configurations
   */
  async initEnhancedManagers(managers) {
    for (const config of managers) {
      try {
        if (!config.class) {
          console.warn(`Optional manager not available: ${config.name}`);
          continue;
        }

        console.log(`🎨 Initializing ${config.name} manager...`);
        this.managers[config.name] = new config.class();
        console.log(`✅ ${config.name} manager initialized`);
        
      } catch (error) {
        console.error(`⚠️ Failed to initialize ${config.name} manager:`, error);
        // Enhanced managers are optional, so continue
      }
    }
  }

  /**
   * Set up communication between managers
   */
  setupManagerCommunication() {
    // Language changes are handled directly in TypingManager

    // Navigation state changes (prevent infinite loop)
    this.eventBus.on('nav:stateChanged', ({ isOpen }) => {
      const currentState = this.stateManager.getState('isNavOpen');
      if (currentState !== isOpen) {
        this.stateManager.setState('isNavOpen', isOpen);
      }
    });

    // Theme changes are handled by ThemeManager

    // Typing animation events
    this.eventBus.on('typing:completed', () => {
      // Initialize scroll spy after typing animation completes
      if (this.managers.nav && this.managers.nav.initScrollSpy) {
        setTimeout(() => {
          this.managers.nav.initScrollSpy();
        }, 1000);
      }
    });

    // BlogManager 초기화 후 즉시 블로그 포스트 로드 시작
    if (this.managers.blog) {
      // 백그라운드에서 블로그 포스트 로드 (타이핑 애니메이션과 병렬 진행)
      this.managers.blog.loadBlogPosts().catch(error => {
        console.warn('초기 블로그 로드 실패:', error);
      });
    }

    // Start typing animation after all managers are ready (타이밍 조정됨)
    setTimeout(() => {
      if (this.managers.typing) {
        this.managers.typing.startAnimation();
      }
    }, 1500);
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
    
    try {
      // Destroy all managers
      for (const [name, manager] of Object.entries(this.managers)) {
        if (manager && typeof manager.destroy === 'function') {
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