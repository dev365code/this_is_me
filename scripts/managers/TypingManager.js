/**
 * TypingManager - 반응형 타이핑 애니메이션 관리자
 * 
 * 주요 기능:
 * - 반응형 타이핑 애니메이션 (데스크톱: 한줄, 모바일: 두줄)
 * - 다국어 지원 (영어/한국어 각각 다른 구조)
 * - 자연스러운 커서 이동 및 색상 변화
 * - StateManager, I18nManager와 연동
 * 
 * 애니메이션 플로우:
 * 1. 첫 번째 줄 타이핑 (검은색)
 * 2. 커서가 두 번째 줄로 이동
 * 3. 두 번째 줄 타이핑 (이름: 티파니민트, 나머지: 검은색)
 */
class TypingManager {
  constructor() {
    // DOM 요소 참조
    this.line1 = null;              // 첫 번째 타이핑 라인
    this.line2 = null;              // 두 번째 타이핑 라인
    
    // 외부 의존성
    this.stateManager = window.stateManager;  // 전역 상태 관리자
    this.eventBus = window.eventBus;          // 이벤트 버스
    
    // 내부 상태
    this.isAnimating = false;       // 현재 애니메이션 진행 중인지
    this.resizeTimer = null;        // 리사이즈 디바운싱용 타이머
    
    this.init();
  }

  /**
   * 매니저 초기화
   * - DOM 요소 설정, 이벤트 리스너 등록, 상태 구독 설정
   */
  init() {
    this.setupDOM();                // DOM 요소 참조 설정
    this.setupEventListeners();     // 이벤트 리스너 등록
    this.setupStateSubscriptions(); // 상태 변화 구독 설정
  }

  /**
   * DOM 요소 참조 설정
   * - 타이핑 애니메이션에 사용될 HTML 요소들을 가져옴
   */
  setupDOM() {
    this.line1 = document.getElementById('line1');  // 첫 번째 타이핑 라인
    this.line2 = document.getElementById('line2');  // 두 번째 타이핑 라인
  }

  /**
   * 이벤트 리스너 설정
   * - 내부/외부 이벤트 구독 및 윈도우 이벤트 처리
   */
  setupEventListeners() {
    // EventBus를 통한 타이핑 애니메이션 제어 이벤트
    this.eventBus.on('typing:start', () => this.startAnimation());      // 애니메이션 시작 요청
    this.eventBus.on('typing:restart', () => this.restartAnimation());  // 애니메이션 재시작 요청
    this.eventBus.on('typing:stop', () => this.stopAnimation());        // 애니메이션 중지 요청

    // 윈도우 이벤트 핸들러 바인딩 (this 컨텍스트 보존)
    this.boundHandleResize = this.handleResize.bind(this);                          // 리사이즈 핸들러
    this.boundScheduleInitialAnimation = this.scheduleInitialAnimation.bind(this);  // 초기 애니메이션 스케줄러

    // 윈도우 리사이즈 이벤트 (디바운싱 적용)
    window.addEventListener('resize', this.boundHandleResize);

    // 페이지 로드 완료 시 애니메이션 시작
    window.addEventListener('load', this.boundScheduleInitialAnimation);
  }

  /**
   * 상태 변화 구독 설정
   * - StateManager의 상태 변화에 반응하여 애니메이션 업데이트
   */
  setupStateSubscriptions() {
    // 언어 변경 시 애니메이션 재시작
    this.stateManager.subscribe('language', () => {
      // 언어가 바뀌면 항상 애니메이션을 재시작하여 새로운 텍스트 표시
      this.restartAnimation();
    });

    // 번역 데이터 업데이트 감지
    this.stateManager.subscribe('translations', (newTranslations) => {
      if (newTranslations && Object.keys(newTranslations).length > 0) {
        // 번역 데이터가 준비되면 이벤트 발생
        this.eventBus.emit('typing:translationsReady');
      }
    });
  }

  /**
   * 초기 애니메이션 스케줄링
   * - 페이지 로드 후 적절한 지연 시간을 두고 애니메이션 시작
   * - 번역 데이터 로딩 상태를 확인하여 적절한 타이밍에 시작
   */
  scheduleInitialAnimation() {
    // 500ms 후에 애니메이션 시작 여부 판단
    setTimeout(() => {
      const translations = this.stateManager.getState('translations');
      
      if (translations && Object.keys(translations).length > 0) {
        // 번역 데이터가 준비되어 있으면 즉시 시작
        this.startAnimation();
      } else {
        // 번역 데이터가 없으면 추가로 1초 기다린 후 폴백으로 시작
        setTimeout(() => this.startAnimation(), 1000);
      }
    }, 500);
  }

  /**
   * 윈도우 리사이즈 처리 (디바운싱 적용)
   * - 반응형 레이아웃 변경 시 페이지 새로고침으로 애니메이션 재시작
   * - 250ms 디바운싱으로 성능 최적화
   */
  handleResize() {
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      // 현재는 새로운 반응형 시스템으로 페이지 새로고침 불필요
      // CSS가 자동으로 레이아웃을 처리하므로 주석 처리
      // location.reload();
    }, 250);
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
        line1: "Hi, I'm",
        line2: "Wooyong Lee"
      }
    };
    
    return translations?.hero ? translations : fallback;
  }


  /**
   * 메인 타이핑 애니메이션 시퀀스 시작
   * - 반응형 타이핑 애니메이션의 진입점
   * - 데스크톱/모바일 구분 없이 동일한 로직 사용
   * 
   * 애니메이션 순서:
   * 1. 상태 체크 및 준비
   * 2. 번역 데이터에서 텍스트 가져오기
   * 3. 요소 초기화
   * 4. 반응형 애니메이션 실행
   * 5. 정리 및 상태 업데이트
   */
  async startAnimation() {
    // 중복 실행 방지 - 이미 실행 중이거나 DOM 요소가 없으면 중단
    if (this.isAnimating || !this.line1) return;
    
    // 애니메이션 상태 설정 및 이벤트 발생
    this.isAnimating = true;
    this.eventBus.emit('typing:started');
    
    try {
      // 번역 데이터에서 각 줄의 텍스트 추출
      const { hero } = this.getTranslations();
      const line1Text = hero.line1 || "Hi, I'm";      // 첫 번째 줄 (인사말)
      const line2Text = hero.line2 || "Wooyong Lee";  // 두 번째 줄 (이름 + 추가 텍스트)
      
      // 모든 요소를 초기 상태로 리셋
      this.resetElements();
      
      // 새로운 반응형 애니메이션 실행 - 데스크톱/모바일 동일 로직
      await this.animateResponsive(line1Text, line2Text);
      
      // 애니메이션 완료 후 스타일 정리
      this.cleanupAnimation();
      
    } catch (error) {
      console.error('Error in typing animation:', error);
    } finally {
      // 상태 정리 및 완료 이벤트 발생
      this.isAnimating = false;
      this.stateManager.setState('isTypingAnimationComplete', true);
      this.eventBus.emit('typing:completed');
    }
  }

  /**
   * Reset animation elements to clean initial state
   */
  resetElements() {
    if (this.line1) {
      this.line1.textContent = '';
      this.line1.innerHTML = '';
      this.line1.style.width = 'auto';
      this.line1.style.overflow = 'visible';
      this.line1.style.whiteSpace = 'nowrap';
      this.line1.classList.remove('blink');
      this.line1.style.borderRight = 'none';
      this.line1.style.borderRightColor = '';
      this.line1.style.color = '';
    }
    
    if (this.line2) {
      this.line2.textContent = '';
      this.line2.innerHTML = '';
      this.line2.style.width = 'auto';
      this.line2.style.overflow = 'visible';
      this.line2.style.whiteSpace = 'nowrap';
      this.line2.classList.remove('blink');
      this.line2.style.borderRight = 'none';
      this.line2.style.borderRightColor = '';
      this.line2.style.color = '';
      this.line2.style.display = 'none';
    }
  }

  /**
   * 간단하고 자연스러운 타이핑 애니메이션
   * - 실제 타이핑처럼 글자가 하나씩 나타나고 커서가 따라감
   * - 완료 후에도 커서 유지
   * - 중앙 정렬 유지
   * 
   * @param {string} line1Text - 첫 번째 줄 텍스트
   * @param {string} line2Text - 두 번째 줄 텍스트
   */
  async animateResponsive(line1Text, line2Text) {
    if (!this.line1 || !this.line2) return;
    
    // 두 번째 라인 표시 준비
    this.line2.style.display = 'inline-block';
    
    // 두 번째 줄 텍스트를 색상별 세그먼트로 분할
    const line2Parts = this.parseLine2Text(line2Text);
    
    // === 1단계: 첫 번째 줄 타이핑 ===
    await this.typeTextNaturally(this.line1, line1Text, 100, 'var(--typing-primary)', true);
    await this.delay(500);
    
    // === 2단계: 두 번째 줄 타이핑 ===
    this.line1.style.borderRight = 'none';
    this.line1.classList.remove('blink');
    
    // 두 번째 줄을 미리 구조화된 HTML로 설정
    this.setupLine2Structure(line2Parts);
    
    // 첫 번째 부분 (이름) - 티파니민트
    const span1 = this.line2.querySelector('.part1');
    if (span1) {
      await this.typeTextNaturally(span1, line2Parts[0].text, 100, 'var(--accent-color)', true);
    }
    
    // 두 번째 부분이 있으면 (예: " 입니다.") - 검은색으로
    if (line2Parts.length > 1) {
      await this.delay(200);
      const span2 = this.line2.querySelector('.part2');
      if (span2) {
        // 커서를 두 번째 부분으로 이동
        if (span1) {
          span1.style.borderRight = 'none';
          span1.classList.remove('blink');
        }
        await this.typeTextNaturally(span2, line2Parts[1].text, 100, 'var(--typing-primary)', true);
      }
    }
  }

  /**
   * 두 번째 줄을 색상별 span 구조로 미리 설정
   * @param {Array} line2Parts - 텍스트 파트 배열
   */
  setupLine2Structure(line2Parts) {
    if (!this.line2) return;
    
    if (line2Parts.length === 1) {
      // 단일 색상인 경우 (영어)
      this.line2.innerHTML = '<span class="part1"></span>';
    } else {
      // 두 색상인 경우 (한국어)
      this.line2.innerHTML = '<span class="part1"></span><span class="part2"></span>';
    }
  }

  /**
   * 자연스러운 타이핑 애니메이션 - 글자별로 나타나며 커서가 따라감
   * @param {Element} element - 대상 요소
   * @param {string} text - 타이핑할 텍스트
   * @param {number} speed - 타이핑 속도 (ms)
   * @param {string} color - 텍스트 색상
   * @param {boolean} showCursor - 커서 표시 여부
   * @returns {Promise} 애니메이션 완료 Promise
   */
  async typeTextNaturally(element, text, speed = 100, color = 'var(--typing-primary)', showCursor = true) {
    if (!element) return;
    
    return new Promise((resolve) => {
      let i = 0;
      element.textContent = '';
      element.style.color = color;
      element.style.whiteSpace = 'nowrap';
      element.style.overflow = 'visible';
      element.style.width = 'auto';
      
      if (showCursor) {
        element.style.borderRight = `2px solid ${color}`;
        element.classList.add('blink');
      }
      
      const timer = setInterval(() => {
        if (i < text.length && this.isAnimating) {
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
   * 기존 텍스트에 이어서 자연스럽게 타이핑 (단순 텍스트 방식)
   * @param {Element} element - 대상 요소
   * @param {string} newText - 추가할 텍스트
   * @param {number} speed - 타이핑 속도
   * @param {string} newColor - 새 텍스트 색상 (무시됨 - 단순화)
   * @param {boolean} showCursor - 커서 표시 여부
   * @returns {Promise} 애니메이션 완료 Promise
   */
  async typeTextContinueNaturally(element, newText, speed = 100, newColor = 'var(--typing-primary)', showCursor = true) {
    if (!element) return;
    
    return new Promise((resolve) => {
      const existingText = element.textContent;
      let i = 0;
      
      if (showCursor) {
        element.style.borderRight = `2px solid ${newColor}`;
        element.classList.add('blink');
      }
      
      const timer = setInterval(() => {
        if (i < newText.length && this.isAnimating) {
          const currentNewText = newText.substring(0, i + 1);
          element.textContent = existingText + currentNewText;
          i++;
        } else {
          clearInterval(timer);
          resolve();
        }
      }, speed);
    });
  }

  /**
   * Parse second line text into color segments
   * @param {string} text - Text to parse
   * @returns {Array} Array of text parts with color info
   */
  parseLine2Text(text) {
    const currentLang = this.stateManager.getState('language');
    
    if (currentLang === 'ko') {
      // Korean: "이우용 입니다." -> ["이우용", " 입니다."]
      const parts = text.split(' ');
      if (parts.length >= 2) {
        return [
          { text: parts[0], isAccent: true }, // "이우용"
          { text: ' ' + parts.slice(1).join(' '), isAccent: false } // " 입니다."
        ];
      }
    }
    
    // English or fallback: treat as single accent-colored part
    return [{ text: text, isAccent: true }];
  }


  /**
   * Clean up animation - keep cursor blinking after completion
   */
  cleanupAnimation() {
    // 커서를 남겨두고 계속 깜빡이도록 함 (실제 터미널처럼)
    // 특별한 정리 없이 커서 유지
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
   * Utility delay function (using app's delay method)
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} Promise that resolves after delay
   */
  delay(ms) {
    return window.portfolioApp?.delay(ms) || new Promise(resolve => setTimeout(resolve, ms));
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