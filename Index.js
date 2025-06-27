function isMobile() {
  return window.innerWidth <= 768;
}

async function typeText(element, text, speed = 100, isAccentColor = false) {
  return new Promise((resolve) => {
    let i = 0;
    element.style.width = '0';
    element.style.overflow = 'hidden';
    element.style.whiteSpace = 'nowrap';
    element.textContent = ''; // 완전히 비우기 - W글자 미리보기 방지
    
    // 색상 설정
    if (isAccentColor) {
      element.style.color = 'var(--accent-color)';
      element.style.borderRightColor = 'var(--accent-color)'; // 커서도 accent 색상
    } else {
      element.style.color = '#ffffff';
      element.style.borderRightColor = '#ffffff'; // 커서도 흰색
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

async function startTypingAnimation() {
  const line1 = document.getElementById('line1');
  const line2 = document.getElementById('line2');
  const subtitle = document.getElementById('subtitle');
  const ctaButton = document.getElementById('cta-button');
  
  // 초기화: 모든 내용 완전히 비우기
  line1.textContent = '';
  line2.textContent = '';
  line1.style.width = '0';
  line2.style.width = '0';
  
  if (isMobile()) {
    // 모바일: 2줄로 표시
    line2.style.display = 'block';
    
    // 첫 번째 줄 타이핑 (흰색 텍스트, 흰색 커서)
    line1.style.borderRight = '3px solid #ffffff';
    line1.classList.add('blink');
    await typeText(line1, "Hi, I'm", 120, false); // false = 흰색
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // 첫 번째 줄 커서 제거하고 두 번째 줄 커서 시작
    line1.style.borderRight = 'none';
    line1.classList.remove('blink');
    line2.style.borderRight = '3px solid var(--accent-color)';
    line2.classList.add('blink');
    await typeText(line2, "Wooyong Lee", 120, true); // true = accent 색상
    
  } else {
    // 데스크톱: 1줄로 표시
    line2.style.display = 'none';
    line1.style.borderRight = '3px solid #ffffff';
    line1.classList.add('blink');
    
    // "Hi, I'm " 먼저 흰색으로 타이핑
    await typeText(line1, "Hi, I'm ", 100, false);
    
    // 커서 색상을 accent로 변경하고 "Wooyong Lee" 타이핑
    line1.style.borderRightColor = 'var(--accent-color)';
    
    // 기존 텍스트에 이어서 타이핑
    const currentText = line1.textContent;
    await typeTextContinue(line1, currentText, "Wooyong Lee", 100, true);
  }
  
  // 타이핑 완료 후에도 커서 깜빡임 유지 (2초간)
  setTimeout(() => {
    line1.classList.remove('blink');
    line2.classList.remove('blink');
    line1.style.borderRight = 'none';
    line2.style.borderRight = 'none';
    subtitle.style.opacity = '1';
    
    setTimeout(() => {
      ctaButton.style.opacity = '1';
    }, 500);
  }, 2000);
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
        const currentChar = newText[i];
        const fullText = existingText + newText.substring(0, i + 1);
        
        // 기존 흰색 텍스트 + 새로운 accent 텍스트 조합
        element.innerHTML = `<span style="color: #ffffff">${existingText}</span><span style="color: var(--accent-color)">${newText.substring(0, i + 1)}</span>`;
        element.style.width = (fullText.length) + 'ch';
        i++;
      } else {
        clearInterval(timer);
        resolve();
      }
    }, speed);
  });
}

// 리사이즈 이벤트 처리
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    location.reload();
  }, 250);
});

// 페이지 로드 후 애니메이션 시작
window.addEventListener('load', () => {
  setTimeout(startTypingAnimation, 500);
});