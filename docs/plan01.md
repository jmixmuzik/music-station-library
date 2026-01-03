# 음악 라이브러리 시스템 개발 기획서

> **대상:** AI 개발자  
> **환경:** Synology NAS + Docker Compose  
> **개발 우선순위:** Frontend → Backend API → Database

---

## 1. 프로젝트 개요

### 1.1 목적
- NAS에 저장된 음악 파일의 효율적인 관리 및 탐색
- 태그 기반 필터링을 통한 빠른 레퍼런스 검색
- 음악 프로듀싱 작업 시 레퍼런스 트랙 탐색 도구

### 1.2 핵심 원칙
- **단순성 우선**: 프레임워크 없는 순수 구현
- **점진적 개발**: 프론트 → 백엔드 → DB 순서
- **확장 가능성**: 나중에 기능 추가가 용이한 구조
- **모듈화**: 공통 컴포넌트 재사용

---

## 2. 기술 스택 (확정)

### 2.1 프론트엔드
- **순수 HTML/CSS/JavaScript** (프레임워크 사용 금지)
- **모듈화 방식**: Fragment HTML 파일로 공통 컴포넌트 구성
  - `header.html`, `footer.html`, `sidebar.html` 등
  - JavaScript로 동적 로드
- **CSS**: 순수 CSS (Tailwind, Bootstrap 등 사용 금지)
- **JavaScript**: Vanilla JS (jQuery, React 등 사용 금지)

### 2.2 백엔드
- **Flask** (Python 기반)
- **Jinja2 템플릿 사용 금지** (SSR 미사용)
- **RESTful API 제공**
- **최소한의 필수 엔드포인트만 구현** (추후 확장)

### 2.3 데이터베이스
- **SQLite** (파일 기반)
- **JSON 백업/복원 기능** 필수
  - DB → JSON 내보내기
  - JSON → DB 가져오기

### 2.4 배포
- **Docker Compose** 기반
- Synology NAS에서 실행

---

## 3. 개발 단계 및 우선순위

### Phase 1: 프론트엔드 (최우선)
**목표:** 완전히 작동하는 정적 웹 페이지 (Mock 데이터 사용)

**구현 내용:**
1. HTML 구조 설계
2. Fragment HTML 시스템 구축
3. CSS 스타일링
4. JavaScript 인터랙션 (필터링, 재생, UI 동작)
5. Mock JSON 데이터로 완전 동작 확인

**완료 조건:** 
- Mock 데이터로 모든 UI/UX가 완벽하게 작동
- 백엔드 없이도 로컬에서 실행 가능

### Phase 2: 백엔드 API (두 번째)
**목표:** 프론트엔드와 연동되는 최소한의 API

**구현 내용:**
1. Flask 기본 설정
2. 필수 API 엔드포인트만 구현
3. CORS 설정
4. 프론트엔드와 통합 테스트

**완료 조건:**
- 프론트엔드가 Mock 데이터 대신 API 호출
- 모든 기능이 API 기반으로 동작

### Phase 3: 데이터베이스 (마지막)
**목표:** 영구 저장 및 백업 시스템

**구현 내용:**
1. SQLite 스키마 설계
2. ORM 또는 직접 쿼리 구현
3. JSON 내보내기/가져오기 기능
4. 데이터 마이그레이션

**완료 조건:**
- 데이터 영구 저장
- JSON 백업/복원 검증 완료

---

## 4. 프론트엔드 상세 설계

### 4.1 파일 구조

```
frontend/
├── index.html                 # 메인 페이지
├── css/
│   ├── reset.css             # CSS 초기화
│   ├── variables.css         # CSS 변수 정의
│   ├── common.css            # 공통 스타일
│   ├── layout.css            # 레이아웃 (그리드, 플렉스)
│   ├── components.css        # 컴포넌트 스타일
│   └── pages.css             # 페이지별 스타일
├── js/
│   ├── app.js                # 앱 초기화 및 메인 로직
│   ├── utils.js              # 유틸리티 함수
│   ├── api.js                # API 호출 (나중에 Mock → Real API 전환)
│   ├── player.js             # 오디오 플레이어 로직
│   ├── filter.js             # 필터링 로직
│   ├── ui.js                 # UI 업데이트 로직
│   └── fragment-loader.js    # Fragment HTML 로더
├── fragments/
│   ├── header.html           # 공통 헤더
│   ├── footer.html           # 공통 푸터
│   ├── sidebar.html          # 사이드바 (필터)
│   └── track-card.html       # 트랙 카드 템플릿
├── data/
│   └── mock-tracks.json      # Mock 데이터 (Phase 1용)
└── assets/
    ├── icons/                # 아이콘
    └── images/               # 이미지
```

### 4.2 Fragment HTML 시스템

**fragment-loader.js 구현 예시:**
```javascript
// Fragment HTML 로드 함수
async function loadFragment(elementId, fragmentPath) {
  const response = await fetch(fragmentPath);
  const html = await response.text();
  document.getElementById(elementId).innerHTML = html;
}

// 사용 예시
await loadFragment('header', '/fragments/header.html');
await loadFragment('sidebar', '/fragments/sidebar.html');
await loadFragment('footer', '/fragments/footer.html');
```

### 4.3 페이지 구성

**index.html 기본 구조:**
```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Music Library</title>
  <link rel="stylesheet" href="/css/reset.css">
  <link rel="stylesheet" href="/css/variables.css">
  <link rel="stylesheet" href="/css/common.css">
  <link rel="stylesheet" href="/css/layout.css">
  <link rel="stylesheet" href="/css/components.css">
</head>
<body>
  <!-- Fragment로 로드될 영역 -->
  <div id="header"></div>
  
  <div class="main-container">
    <aside id="sidebar"></aside>
    
    <main class="content">
      <div id="player-bar" class="player-bar"></div>
      <div id="track-grid" class="track-grid"></div>
    </main>
  </div>
  
  <div id="footer"></div>

  <!-- JavaScript 로드 순서 중요 -->
  <script src="/js/utils.js"></script>
  <script src="/js/fragment-loader.js"></script>
  <script src="/js/api.js"></script>
  <script src="/js/player.js"></script>
  <script src="/js/filter.js"></script>
  <script src="/js/ui.js"></script>
  <script src="/js/app.js"></script>
</body>
</html>
```

### 4.4 핵심 기능 (Phase 1)

**필수 구현 사항:**
1. **필터 사이드바**
   - 장르 다중 선택 (체크박스)
   - 무드 다중 선택 (체크박스)
   - BPM 범위 슬라이더
   - 키 드롭다운
   - 텍스트 검색 (제목/아티스트)
   - 필터 초기화 버튼

2. **트랙 그리드**
   - 카드 레이아웃 (Grid CSS 사용)
   - 트랙 정보 표시 (제목, 아티스트, BPM, 키, 태그)
   - 재생 버튼
   - 호버 효과

3. **오디오 플레이어**
   - 재생/일시정지
   - 진행바 (클릭해서 seek 가능)
   - 시간 표시 (현재/전체)
   - 볼륨 컨트롤
   - 현재 재생 중인 트랙 정보 표시

4. **필터링 로직**
   - 실시간 필터링 (입력 즉시 반영)
   - AND 조건 (모든 필터가 동시에 적용)
   - 필터링 결과 카운트 표시

### 4.5 Mock 데이터 형식

**data/mock-tracks.json:**
```json
{
  "tracks": [
    {
      "id": "track_001",
      "title": "Summer Vibes",
      "artist": "Producer Name",
      "genre": ["House", "Electronic"],
      "mood": ["Uplifting", "Energetic"],
      "bpm": 128,
      "key": "Am",
      "duration": 180,
      "filePath": "/music/summer-vibes.mp3",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    {
      "id": "track_002",
      "title": "Dark Techno",
      "artist": "Producer Name",
      "genre": ["Techno"],
      "mood": ["Dark", "Mysterious"],
      "bpm": 135,
      "key": "Fm",
      "duration": 240,
      "filePath": "/music/dark-techno.mp3",
      "createdAt": "2024-01-20T14:20:00Z"
    }
  ],
  "tags": {
    "genres": ["House", "Techno", "Trap", "Hip-Hop", "R&B", "Ambient", "Cinematic"],
    "moods": ["Energetic", "Calm", "Dark", "Uplifting", "Melancholic", "Aggressive", "Dreamy"],
    "keys": ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "Cm", "Dm", "Em", "Fm", "Gm", "Am"]
  }
}
```

### 4.6 CSS 설계 원칙

**CSS Variables (variables.css):**
```css
:root {
  /* Colors */
  --color-primary: #3b82f6;
  --color-secondary: #64748b;
  --color-background: #0f172a;
  --color-surface: #1e293b;
  --color-text: #f1f5f9;
  --color-text-secondary: #94a3b8;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Typography */
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 24px;
  
  /* Layout */
  --sidebar-width: 280px;
  --header-height: 60px;
  --player-height: 80px;
}
```

**레이아웃 원칙:**
- Flexbox와 Grid를 적절히 활용
- 반응형은 추후 고려 (일단 데스크톱 1920x1080 기준)
- 모든 색상/간격은 CSS Variables 사용
- 클래스명은 BEM 방식 권장 (block__element--modifier)
