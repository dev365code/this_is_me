# This Is Me — 이우용 포트폴리오

바닐라 JavaScript로 만든 개인 포트폴리오 웹사이트입니다. 빌드 도구·프레임워크 없이 동작하며, 매니저 패턴 기반 아키텍처와 다국어(한국어/영어), 다크/라이트 테마, 타이핑 애니메이션, 티스토리 RSS 블로그 연동을 지원합니다.

🔗 **Live:** https://dev365code.github.io/this_is_me/

## ✨ 주요 기능

- **다국어 지원** — 한국어 / 영어 실시간 전환 (`languages/*.json` 기반)
- **다크 / 라이트 테마** — CSS 변수 기반 즉시 전환, localStorage 영속화
- **반응형 디자인** — 모바일 우선(320px ~ 2560px+)
- **타이핑 애니메이션** — 언어·테마 인지형 히어로 타이핑
- **블로그 자동 연동** — 티스토리 RSS를 프록시로 가져와 카드로 표시(캐싱 포함)
- **프레임워크 0** — 외부 의존성 최소화, 폰트·라이브러리 로컬 번들

## 🧱 기술 스택

- HTML5 / CSS3 (CSS Custom Properties)
- Vanilla JavaScript (ES6+, 클래스 기반 매니저 패턴)
- AOS(스크롤 애니메이션), Bootstrap(유틸리티), Font Awesome(아이콘)

## 🚀 로컬 실행

빌드 과정이 없는 정적 사이트이므로 아무 정적 서버나 사용하면 됩니다.

```bash
# Python
python -m http.server 8000

# Node.js
npx serve .
```

이후 브라우저에서 `http://localhost:8000` 접속.

## 📁 프로젝트 구조

```
this_is_me/
├── index.html                  # 메인 HTML
├── styles/                     # CSS (theme, components, animations, responsive 등)
├── scripts/
│   ├── core/                   # EventBus(pub/sub), StateManager(전역 상태)
│   ├── managers/               # I18n, Theme, Nav, Typing, Blog 매니저
│   └── app.js                  # 매니저 초기화·생명주기 오케스트레이션
├── languages/                  # ko.json / en.json (모든 콘텐츠)
├── images/                     # 프로필·프로젝트 이미지
├── fonts/  libraries/          # 로컬 폰트 및 서드파티 자산
└── favicon.png
```

## 🛠 아키텍처 개요

- **EventBus** — 매니저 간 느슨한 결합을 위한 전역 pub/sub
- **StateManager** — 테마·언어·블로그 캐시 등 전역 상태 + localStorage 영속화
- **Managers** — `app.js`가 2단계로 초기화
  - Phase 1(필수): `I18nManager` → `ThemeManager` → `NavManager`
  - Phase 2(비동기·선택): `TypingManager`, `BlogManager`
- **콘텐츠 관리** — 모든 텍스트/프로젝트/스킬은 `languages/{ko,en}.json`에 정의되고, `I18nManager`가 `data-translate` 속성과 동적 렌더링으로 주입

자세한 내부 구조는 `CLAUDE.md` 참고.

## 📬 Contact

- GitHub: [@dev365code](https://github.com/dev365code)
- LinkedIn: [yong125](https://www.linkedin.com/in/yong125/)
- Blog: [arex.tistory.com](https://arex.tistory.com/)

## 📝 License

MIT License — 자세한 내용은 [LICENSE](LICENSE) 참고.
