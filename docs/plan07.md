
## 19. Fragment HTML 예시

### 19.1 header.html
```html
<header class="header">
  <div class="header__logo">
    <h1>🎵 Music Library</h1>
  </div>
  <div class="header__actions">
    <div id="filter-count" class="header__count">0 tracks</div>
  </div>
</header>
```

### 19.2 sidebar.html
```html
<div class="sidebar">
  <div class="sidebar__section">
    <h3 class="sidebar__title">Search</h3>
    <input 
      type="text" 
      id="search-input" 
      class="sidebar__search" 
      placeholder="Search tracks..."
    >
  </div>

  <div class="sidebar__section">
    <h3 class="sidebar__title">Genre</h3>
    <div id="genre-filters"></div>
  </div>

  <div class="sidebar__section">
    <h3 class="sidebar__title">Mood</h3>
    <div id="mood-filters"></div>
  </div>

  <div class="sidebar__section">
    <h3 class="sidebar__title">BPM Range</h3>
    <div class="sidebar__range">
      <input type="number" id="bpm-min" placeholder="Min" min="0" max="200">
      <span>-</span>
      <input type="number" id="bpm-max" placeholder="Max" min="0" max="200">
    </div>
  </div>

  <div class="sidebar__section">
    <h3 class="sidebar__title">Key</h3>
    <select id="key-select" class="sidebar__select">
      <option value="">All Keys</option>
    </select>
  </div>

  <button id="reset-filters-btn" class="sidebar__reset-btn">
    Reset Filters
  </button>
</div>
```

### 19.3 footer.html
```html
<footer class="footer">
  <p>&copy; 2024 Music Library. All rights reserved.</p>
</footer>
```

---

## 20. 최종 체크리스트 및 테스트 시나리오

### 20.1 Phase 1 테스트
```
□ Fragment 로딩 확인
  - header.html 정상 로드
  - sidebar.html 정상 로드
  - footer.html 정상 로드

□ Mock 데이터 로딩
  - mock-tracks.json 정상 파싱
  - 트랙 목록 렌더링 확인

□ 필터링 기능
  - 장르 필터 (다중 선택)
  - 무드 필터 (다중 선택)
  - BPM 범위 필터
  - 키 필터
  - 텍스트 검색
  - 필터 초기화

□ 오디오 플레이어
  - 트랙 재생/일시정지
  - 진행바 표시 및 seek
  - 볼륨 조절
  - 시간 표시

□ UI/UX
  - 카드 호버 효과
  - 로딩 상태 표시
  - 브라우저 콘솔 에러 없음
```

### 20.2 Phase 2 테스트
```
□ 백엔드 서버
  - Flask 서버 정상 실행
  - 헬스체크 엔드포인트 응답

□ API 엔드포인트
  - GET /api/tracks (필터링 포함)
  - GET /api/tracks/:id
  - POST /api/tracks
  - PUT /api/tracks/:id
  - DELETE /api/tracks/:id
  - GET /api/tags
  - GET /api/stream/:id

□ 프론트-백엔드 통합
  - CORS 정상 작동
  - API 호출 성공
  - 음악 스트리밍 작동

□ Docker
  - docker-compose up 정상 실행
  - 컨테이너 간 통신 확인
```

### 20.3 Phase 3 테스트
```
□ 데이터베이스
  - SQLite 파일 생성
  - 테이블 및 인덱스 생성
  - CRUD 작업 모두 정상

□ 백업/복원
  - JSON 내보내기 성공
  - JSON 가져오기 (replace 모드)
  - JSON 가져오기 (merge 모드)
  - 데이터 무결성 검증

□ 영속성
  - 서버 재시작 후 데이터 유지
  - 동시 접속 테스트
```

---
