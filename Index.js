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
      element.style.color = '#ffffff';
      element.style.borderRightColor = '#ffffff';
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

async function startTypingAnimation() {
  const line1 = document.getElementById('line1');
  const line2 = document.getElementById('line2');
  
  line1.textContent = '';
  line2.textContent = '';
  line1.style.width = '0';
  line2.style.width = '0';
  
  if (isMobile()) {
    line2.style.display = 'block';
    
    line1.style.borderRight = '3px solid #ffffff';
    line1.classList.add('blink');
    await typeText(line1, "Hi, I'm", 120, false);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    line1.style.borderRight = 'none';
    line1.classList.remove('blink');
    line2.style.borderRight = '3px solid var(--accent-color)';
    line2.classList.add('blink');
    await typeText(line2, "Wooyong Lee", 120, true);
    
  } else {
    line2.style.display = 'none';
    line1.style.borderRight = '3px solid #ffffff';
    line1.classList.add('blink');
    
    await typeText(line1, "Hi, I'm ", 100, false);
    line1.style.borderRightColor = 'var(--accent-color)';
    
    const currentText = line1.textContent;
    await typeTextContinue(line1, currentText, "Wooyong Lee", 100, true);
  }
  
  setTimeout(() => {
    line1.classList.remove('blink');
    line2.classList.remove('blink');
    line1.style.borderRight = 'none';
    line2.style.borderRight = 'none';
  }, 2000000); // 200000에서 2000으로 수정
} // 이 닫는 괄호가 빠져있었어요!

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    location.reload();
  }, 250);
});

window.addEventListener('load', () => {
  setTimeout(startTypingAnimation, 500);
});