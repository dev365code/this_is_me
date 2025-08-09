/**
 * NavManager - Handles navigation menu interactions and smooth scrolling
 * Integrates with StateManager and EventBus for reactive updates
 */
class NavManager {
  constructor() {
    this.navToggle = null;
    this.navList = null;
    this.navLinks = [];
    this.stateManager = window.stateManager;
    this.eventBus = window.eventBus;
    
    this.init();
  }

  init() {
    this.setupDOM();
    this.setupEventListeners();
    this.setupStateSubscriptions();
  }

  setupDOM() {
    this.navToggle = document.getElementById('nav-toggle');
    this.navList = document.getElementById('nav-list');
    this.navLinks = document.querySelectorAll('.nav-link');
  }

  setupEventListeners() {
    // Toggle button click
    if (this.navToggle) {
      this.navToggle.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleNav();
      });
    }

    // Navigation link clicks
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        this.handleNavLinkClick(e, link);
      });
    });

    // Close nav when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav-menu')) {
        this.closeNav();
      }
    });

    // Listen for navigation events
    this.eventBus.on('nav:toggle', () => this.toggleNav());
    this.eventBus.on('nav:open', () => this.openNav());
    this.eventBus.on('nav:close', () => this.closeNav());
    this.eventBus.on('nav:scrollTo', (sectionId) => this.scrollToSection(sectionId));

    // Handle escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isNavOpen()) {
        this.closeNav();
      }
    });
  }

  setupStateSubscriptions() {
    // Subscribe to nav state changes
    this.stateManager.subscribe('isNavOpen', (isOpen) => {
      this.updateNavVisibility(isOpen);
      this.eventBus.emit('nav:stateChanged', { isOpen });
    });
  }

  /**
   * Handle navigation link clicks
   * @param {Event} e - Click event
   * @param {Element} link - Clicked link element
   */
  handleNavLinkClick(e, link) {
    e.preventDefault();
    
    const targetId = link.getAttribute('href');
    
    // Close navigation first
    this.closeNav();
    
    // Scroll to target section
    this.scrollToSection(targetId);
    
    // Emit navigation event
    this.eventBus.emit('nav:linkClicked', { targetId, link });
  }

  /**
   * Scroll to specific section with smooth animation
   * @param {string} targetId - Target section ID (with #)
   */
  scrollToSection(targetId) {
    if (!targetId) return;
    
    const targetSection = document.querySelector(targetId);
    
    if (targetSection) {
      const offsetTop = targetSection.offsetTop - 80; // Account for fixed header
      
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
      
      // Update URL without triggering page reload
      history.pushState(null, null, targetId);
      
      this.eventBus.emit('nav:scrolled', { targetId, targetSection });
    }
  }

  /**
   * Toggle navigation menu
   */
  toggleNav() {
    const isOpen = this.isNavOpen();
    this.stateManager.setState('isNavOpen', !isOpen);
  }

  /**
   * Open navigation menu
   */
  openNav() {
    this.stateManager.setState('isNavOpen', true);
  }

  /**
   * Close navigation menu
   */
  closeNav() {
    this.stateManager.setState('isNavOpen', false);
  }

  /**
   * Check if navigation is open
   * @returns {boolean} True if navigation is open
   */
  isNavOpen() {
    return this.stateManager.getState('isNavOpen');
  }

  /**
   * Update navigation visibility based on state
   * @param {boolean} isOpen - Whether nav should be open
   */
  updateNavVisibility(isOpen) {
    if (!this.navList) return;
    
    if (isOpen) {
      this.navList.classList.add('active');
      this.navToggle?.setAttribute('aria-expanded', 'true');
      
      // Prevent body scroll when nav is open on mobile
      if (window.innerWidth <= 768) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      this.navList.classList.remove('active');
      this.navToggle?.setAttribute('aria-expanded', 'false');
      
      // Restore body scroll
      document.body.style.overflow = '';
    }
  }

  /**
   * Handle window resize
   */
  handleResize() {
    // Close nav on resize to prevent layout issues
    if (window.innerWidth > 768 && this.isNavOpen()) {
      this.closeNav();
    }
  }

  /**
   * Set active navigation item based on current section
   * @param {string} sectionId - Current section ID
   */
  setActiveNavItem(sectionId) {
    this.navLinks.forEach(link => {
      const href = link.getAttribute('href');
      
      if (href === sectionId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
    
    this.eventBus.emit('nav:activeChanged', { sectionId });
  }

  /**
   * Initialize scroll spy functionality
   */
  initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    
    if (sections.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.setActiveNavItem(`#${entry.target.id}`);
        }
      });
    }, {
      threshold: 0.3,
      rootMargin: '-80px 0px -50% 0px'
    });
    
    sections.forEach(section => observer.observe(section));
  }

  /**
   * Cleanup event listeners and observers
   */
  destroy() {
    // Remove event listeners
    if (this.navToggle) {
      this.navToggle.removeEventListener('click', this.toggleNav);
    }
    
    this.navLinks.forEach(link => {
      link.removeEventListener('click', this.handleNavLinkClick);
    });
    
    // Restore body scroll
    document.body.style.overflow = '';
  }
}

// Export for use in main app
window.NavManager = NavManager;