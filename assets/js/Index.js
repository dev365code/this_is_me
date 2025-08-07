console.log('JavaScript 파일 로드됨');

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM 로드 완료');
});

function isMobile() {
  return window.innerWidth <= 768;
}

async function typeText(element, text, speed = 100, isAccentColor = false) {
  return new Promise((resolve) => {
    let i = 0;
    element.style.width = '0';
    element.style.overflow = 'hidden';
    element.style.whiteSpace = 'nowrap';
    element.textContent = '';
    
    if (isAccentColor) {
      element.style.color = '#81D8D0';
      element.style.borderRightColor = 'var(--accent-color)';
    } else {
      element.style.color = 'var(--typing-primary)';
      element.style.borderRightColor = 'var(--typing-cursor-primary)';
    }
    
    const timer = setInterval(() => {
      if (i < text.length) {
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

// 데스크톱용: 기존 텍스트에 이어서 타이핑하는 함수
async function typeTextContinue(element, existingText, newText, speed = 100, isAccentColor = false) {
  return new Promise((resolve) => {
    let i = 0;
    
    if (isAccentColor) {
      element.style.borderRightColor = 'var(--accent-color)';
    }
    
    const timer = setInterval(() => {
      if (i < newText.length) {
        const fullText = existingText + newText.substring(0, i + 1);
        element.innerHTML = `<span style="color: var(--typing-primary)">${existingText}</span><span style="color: var(--accent-color)">${newText.substring(0, i + 1)}</span>`;
        element.style.width = (fullText.length) + 'ch';
        i++;
      } else {
        clearInterval(timer);
        resolve();
      }
    }, speed);
  });
}

async function startTypingAnimation() {
  const line1 = document.getElementById('line1');
  const line2 = document.getElementById('line2');
  
  // Get current language data
  let greeting = "Hi, I'm";
  let name = "Wooyong Lee";
  
  if (window.i18nManager && window.i18nManager.translations && window.i18nManager.translations.hero) {
    greeting = window.i18nManager.translations.hero.greeting;
    name = window.i18nManager.translations.hero.name;
  }
  
  line1.textContent = '';
  line2.textContent = '';
  line1.style.width = '0';
  line2.style.width = '0';
  
  if (isMobile()) {
    line2.style.display = 'block';
    
    line1.style.borderRight = '3px solid var(--typing-cursor-primary)';
    line1.classList.add('blink');
    await typeText(line1, greeting, 120, false);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    line1.style.borderRight = 'none';
    line1.classList.remove('blink');
    line2.style.borderRight = '3px solid var(--accent-color)';
    line2.classList.add('blink');
    await typeText(line2, name, 120, true);
    
  } else {
    line2.style.display = 'none';
    line1.style.borderRight = '3px solid var(--typing-cursor-primary)';
    line1.classList.add('blink');
    
    await typeText(line1, greeting + " ", 100, false);
    line1.style.borderRightColor = 'var(--accent-color)';
    
    const currentText = line1.textContent;
    await typeTextContinue(line1, currentText, name, 100, true);
  }
  
  setTimeout(() => {
    line1.classList.remove('blink');
    line2.classList.remove('blink');
    line1.style.borderRight = 'none';
    line2.style.borderRight = 'none';
  }, 2000);
}

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    location.reload();
  }, 250);
});

window.addEventListener('load', () => {
  // Wait for config to load, then start typing animation
  setTimeout(() => {
    if (window.configLoader && window.configLoader.config) {
      startTypingAnimation();
    } else {
      // Fallback with default values if config not loaded
      setTimeout(startTypingAnimation, 1000);
    }
  }, 500);
});

// Theme Management
class ThemeManager {
  constructor() {
    this.themeToggle = document.getElementById('menu-theme-toggle');
    this.currentTheme = this.getStoredTheme() || 'light'; // Default to light theme
    
    this.init();
  }
  
  init() {
    this.setTheme(this.currentTheme);
    if (this.themeToggle) {
      this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }
  }
  
  getStoredTheme() {
    return localStorage.getItem('portfolio-theme');
  }
  
  setStoredTheme(theme) {
    localStorage.setItem('portfolio-theme', theme);
  }
  
  setTheme(theme) {
    this.currentTheme = theme;
    
    if (theme === 'light') {
      document.documentElement.removeAttribute('data-theme'); // Light is default in CSS
      if (this.themeToggle) {
        this.themeToggle.classList.add('light');
        this.themeToggle.classList.remove('dark');
      }
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (this.themeToggle) {
        this.themeToggle.classList.add('dark');
        this.themeToggle.classList.remove('light');
      }
    }
    
    this.setStoredTheme(theme);
  }
  
  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }
}

// Navigation Menu Management
class NavManager {
  constructor() {
    this.navToggle = document.getElementById('nav-toggle');
    this.navList = document.getElementById('nav-list');
    this.navLinks = document.querySelectorAll('.nav-link');
    
    this.init();
  }
  
  init() {
    if (this.navToggle) {
      this.navToggle.addEventListener('click', () => this.toggleNav());
    }
    
    // Close nav when clicking on a link
    this.navLinks.forEach(link => {
      link.addEventListener('click', () => this.closeNav());
    });
    
    // Close nav when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav-menu')) {
        this.closeNav();
      }
    });
    
    // Smooth scroll for navigation links
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
          const offsetTop = targetSection.offsetTop - 80;
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      });
    });
  }
  
  toggleNav() {
    this.navList.classList.toggle('active');
  }
  
  closeNav() {
    this.navList.classList.remove('active');
  }
}

// Initialize managers when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ThemeManager();
  new NavManager();
});