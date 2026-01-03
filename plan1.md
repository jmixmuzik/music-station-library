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

---

## 5. 백엔드 상세 설계

### 5.1 파일 구조

```
backend/
├── app.py                    # Flask 앱 초기화
├── config.py                 # 설정 파일
├── requirements.txt          # Python 패키지
├── api/
│   ├── __init__.py
│   ├── tracks.py            # 트랙 관련 API
│   └── tags.py              # 태그 관련 API
├── models/
│   ├── __init__.py
│   └── track.py             # Track 모델
├── utils/
│   ├── __init__.py
│   ├── db.py                # DB 유틸리티
│   └── backup.py            # JSON 백업/복원
└── data/
    └── tracks.db            # SQLite 파일 (Phase 3에서 생성)
```

### 5.2 필수 API 엔드포인트 (Phase 2)

**최소한의 엔드포인트만 구현:**

```
GET    /api/tracks              # 트랙 목록 조회 + 필터링
GET    /api/tracks/:id          # 특정 트랙 조회
POST   /api/tracks              # 새 트랙 추가
PUT    /api/tracks/:id          # 트랙 정보 수정
DELETE /api/tracks/:id          # 트랙 삭제
GET    /api/tags                # 사용 가능한 태그 목록
GET    /api/stream/:id          # 음악 파일 스트리밍
GET    /health                  # 헬스체크
```

**추후 확장 가능한 엔드포인트 (Phase 2에서는 구현 안 함):**
```
POST   /api/tracks/bulk         # 일괄 추가
GET    /api/playlists           # 플레이리스트 관련
POST   /api/backup              # JSON 백업
POST   /api/restore             # JSON 복원
```

### 5.3 필터링 쿼리 파라미터

```
GET /api/tracks?genre=House,Techno&mood=Energetic&bpm_min=120&bpm_max=130&key=Am&search=summer
```

**지원 파라미터:**
- `genre`: 쉼표로 구분된 장르 (OR 조건)
- `mood`: 쉼표로 구분된 무드 (OR 조건)
- `bpm_min`, `bpm_max`: BPM 범위
- `key`: 키
- `search`: 제목/아티스트 검색 (부분일치)

### 5.4 응답 형식

**성공 응답:**
```json
{
  "success": true,
  "data": {
    "tracks": [...],
    "total": 42,
    "filtered": 15
  }
}
```

**에러 응답:**
```json
{
  "success": false,
  "error": {
    "code": "TRACK_NOT_FOUND",
    "message": "트랙을 찾을 수 없습니다."
  }
}
```

### 5.5 Flask 기본 구성 (app.py)

```python
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # 프론트엔드 연동을 위한 CORS 활성화

# API 라우트 등록
from api.tracks import tracks_bp
from api.tags import tags_bp

app.register_blueprint(tracks_bp, url_prefix='/api')
app.register_blueprint(tags_bp, url_prefix='/api')

@app.route('/health')
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
```

---

## 6. 데이터베이스 상세 설계

### 6.1 SQLite 스키마

```sql
CREATE TABLE tracks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT,
    genre TEXT,              -- JSON array 문자열: ["House", "Techno"]
    mood TEXT,               -- JSON array 문자열: ["Energetic", "Dark"]
    bpm INTEGER,
    key TEXT,
    file_path TEXT NOT NULL,
    duration INTEGER,
    file_size INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tracks_genre ON tracks(genre);
CREATE INDEX idx_tracks_bpm ON tracks(bpm);
CREATE INDEX idx_tracks_key ON tracks(key);
```

### 6.2 JSON 백업 기능

**백업 (DB → JSON):**
```python
import json
import sqlite3

def export_to_json(db_path, json_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM tracks")
    tracks = cursor.fetchall()
    
    # 트랙 데이터를 JSON으로 변환
    data = {
        "tracks": [dict(zip([col[0] for col in cursor.description], track)) 
                   for track in tracks],
        "exported_at": datetime.now().isoformat()
    }
    
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    conn.close()
```

**복원 (JSON → DB):**
```python
def import_from_json(json_path, db_path):
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    for track in data['tracks']:
        cursor.execute("""
            INSERT OR REPLACE INTO tracks 
            (id, title, artist, genre, mood, bpm, key, file_path, duration, file_size, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (track['id'], track['title'], ...))
    
    conn.commit()
    conn.close()
```

---

## 7. Docker Compose 구성

### 7.1 docker-compose.yml

```yaml
version: '3.8'

services:
  # 백엔드 서비스
  backend:
    build: ./backend
    container_name: music-library-backend
    ports:
      - "5000:5000"
    volumes:
      - /volume1/music:/app/music:ro     # 음악 파일 (읽기 전용)
      - ./backend/data:/app/data         # 데이터베이스 파일
    environment:
      - FLASK_ENV=production
      - MUSIC_PATH=/app/music
      - DB_PATH=/app/data/tracks.db
    restart: unless-stopped

  # 프론트엔드 서비스 (Nginx로 정적 파일 서빙)
  frontend:
    image: nginx:alpine
    container_name: music-library-frontend
    ports:
      - "3000:80"
    volumes:
      - ./frontend:/usr/share/nginx/html:ro
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - backend
    restart: unless-stopped
```

### 7.2 Nginx 설정 (nginx.conf)

```nginx
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    # 프론트엔드 정적 파일
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 백엔드 API 프록시
    location /api/ {
        proxy_pass http://backend:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 음악 스트리밍 프록시
    location /stream/ {
        proxy_pass http://backend:5000;
        proxy_buffering off;
    }
}
```

### 7.3 Dockerfile (Backend)

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "app.py"]
```

---

## 8. 개발 가이드라인

### 8.1 코드 작성 원칙

**프론트엔드:**
- 모든 함수는 단일 책임 원칙
- 전역 변수 최소화 (IIFE 또는 모듈 패턴 사용)
- 주석은 "왜"를 설명 (코드가 "무엇"을 설명)
- 하드코딩 금지 (상수는 별도 정의)

**백엔드:**
- PEP 8 스타일 가이드 준수
- 타입 힌트 사용 권장
- 에러 핸들링 철저히
- 로깅 구현 (개발/프로덕션 구분)

### 8.2 변수/함수 네이밍

**JavaScript:**
```javascript
// 변수: camelCase
let currentTrack = null;
const filteredTracks = [];

// 함수: camelCase (동사 시작)
function loadTracks() {}
function filterByGenre(genres) {}

// 상수: UPPER_SNAKE_CASE
const API_BASE_URL = 'http://localhost:5000';
const MAX_TRACKS_PER_PAGE = 50;

// 클래스: PascalCase
class AudioPlayer {}
```

**Python:**
```python
# 변수/함수: snake_case
current_track = None
def load_tracks():
    pass

# 상수: UPPER_SNAKE_CASE
API_VERSION = 'v1'
MAX_FILE_SIZE = 10 * 1024 * 1024

# 클래스: PascalCase
class Track:
    pass
```

### 8.3 에러 처리

**프론트엔드:**
```javascript
// API 호출 시 에러 처리
async function fetchTracks() {
  try {
    const response = await fetch(API_BASE_URL + '/api/tracks');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch tracks:', error);
    showErrorMessage('트랙을 불러오는데 실패했습니다.');
    return null;
  }
}
```

**백엔드:**
```python
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': {
            'code': 'NOT_FOUND',
            'message': '리소스를 찾을 수 없습니다.'
        }
    }), 404
```

---

## 9. 테스트 전략

### 9.1 Phase 1 (프론트엔드)
- [ ] Mock 데이터로 모든 UI 작동 확인
- [ ] 필터링 로직 정확성 검증
- [ ] 오디오 재생 안정성 테스트
- [ ] 다양한 브라우저 호환성 (Chrome, Firefox, Safari)

### 9.2 Phase 2 (백엔드 통합)
- [ ] 각 API 엔드포인트 정상 작동 확인
- [ ] 프론트-백엔드 통신 검증
- [ ] 에러 케이스 처리 확인
- [ ] 성능 테스트 (100곡 로딩 시간)

### 9.3 Phase 3 (데이터베이스)
- [ ] CRUD 작업 정상 동작
- [ ] JSON 백업/복원 무결성 검증
- [ ] 동시 접속 테스트
- [ ] 데이터 무결성 검증

---

## 10. 배포 및 실행

### 10.1 로컬 개발 환경

**프론트엔드 (Phase 1):**
```bash
# 간단한 HTTP 서버로 실행
cd frontend
python -m http.server 8080
# 또는
npx serve .
```

**전체 스택 (Phase 2+):**
```bash
# Docker Compose로 실행
docker-compose up --build
```

### 10.2 Synology NAS 배포

```bash
# NAS에 SSH 접속 후
cd /volume1/docker/music-library
git clone <repository-url> .
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

### 10.3 접속 URL
- 프론트엔드: `http://<NAS-IP>:3000`
- 백엔드 API: `http://<NAS-IP>:5000`
- 헬스체크: `http://<NAS-IP>:5000/health`

---

## 11. 체크리스트

### Phase 1 완료 조건
- [ ] Fragment HTML 시스템 작동
- [ ] 모든 UI 컴포넌트 렌더링
- [ ] Mock 데이터 기반 필터링 작동
- [ ] 오디오 플레이어 완전 작동
- [ ] CSS 스타일링 완료
- [ ] 브라우저 콘솔 에러 없음

### Phase 2 완료 조건
- [ ] Flask 서버 정상 실행
- [ ] 모든 API 엔드포인트 응답
- [ ] CORS 설정 완료
- [ ] 프론트엔드에서 API 호출 성공
- [ ] 음악 파일 스트리밍 작동
- [ ] Docker Compose로 전체 스택 실행

### Phase 3 완료 조건
- [ ] SQLite DB 정상 생성
- [ ] CRUD 작업 모두 작동
- [ ] JSON 백업 기능 작동
- [ ] JSON 복원 기능 작동
- [ ] 데이터 영속성 확인

---

## 12. 주의사항 및 제약사항

### 12.1 반드시 지켜야 할 것
- ✅ 프론트엔드에서 프레임워크/라이브러리 사용 금지
- ✅ Jinja2 템플릿 사용 금지
- ✅ API 엔드포인트는 필수적인 것만 구현
- ✅ Phase별 순서 준수 (프론트 → 백엔드 → DB)

### 12.2 현재 고려하지 않는 것
- ❌ 사용자 인증/권한
- ❌ 외부 접속 보안 (HTTPS)
- ❌ 파일 업로드 UI
- ❌ 반응형 모바일 디자인
- ❌ 플레이리스트 기능
- ❌ 자동 메타데이터 추출

### 12.3 확장 가능성을 위한 고려
- 함수/모듈은 독립적으로 작성
- 하드코딩 대신 설정 파일 활용
- API 버전 관리 구조 (현재는 미사용)
- 주석으로 확장 포인트 명시

---

## 13. 참고 자료

### 13.1 기술 문서
- Flask 공식 문서: https://flask.palletsprojects.com/
- SQLite 문서: https://www.sqlite.org/docs.html
- Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

### 13.2 예제 코드 스니펫
개발 중 필요한 코드 예제는 별도 문서로 제공 가능

---

## 14. 다음 단계

1. **AI 개발자에게 전달할 내용:**
   - 이 기획서 전체
   - Mock 데이터 샘플 (별도 제공)
   - 디자인 참고 이미지 (있다면)

2. **개발 시작:**
   - Phase 1부터 순차적으로 진행
   - 각 Phase 완료 후 검토 및 피드백

3. **커뮤니케이션:**
   - 구현 중 불명확한 부분 질문
   - 기술적 제약으로 불가능한 부분 보고
   - 대안 제시 및 협의

---

## 15. 상세 구현 가이드

### 15.1 Fragment HTML 로더 상세 구현

**fragment-loader.js 완전한 예시:**
```javascript
// Fragment 로더 클래스
class FragmentLoader {
  constructor() {
    this.cache = new Map();
  }

  // Fragment HTML 로드
  async load(elementId, fragmentPath, useCache = true) {
    try {
      let html;
      
      // 캐시 확인
      if (useCache && this.cache.has(fragmentPath)) {
        html = this.cache.get(fragmentPath);
      } else {
        const response = await fetch(fragmentPath);
        if (!response.ok) {
          throw new Error(`Failed to load fragment: ${fragmentPath}`);
        }
        html = await response.text();
        this.cache.set(fragmentPath, html);
      }
      
      // DOM에 삽입
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element not found: ${elementId}`);
      }
      element.innerHTML = html;
      
      // 삽입 후 이벤트 발생
      element.dispatchEvent(new CustomEvent('fragmentLoaded', {
        detail: { fragmentPath }
      }));
      
      return true;
    } catch (error) {
      console.error('Fragment load error:', error);
      return false;
    }
  }

  // 여러 Fragment 동시 로드
  async loadMultiple(fragments) {
    const promises = fragments.map(({ elementId, fragmentPath, useCache }) =>
      this.load(elementId, fragmentPath, useCache)
    );
    return Promise.all(promises);
  }

  // 캐시 초기화
  clearCache() {
    this.cache.clear();
  }
}

// 전역 인스턴스 생성
const fragmentLoader = new FragmentLoader();
```

**app.js에서 사용 예시:**
```javascript
// 앱 초기화
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Fragment 로드
    await fragmentLoader.loadMultiple([
      { elementId: 'header', fragmentPath: '/fragments/header.html' },
      { elementId: 'sidebar', fragmentPath: '/fragments/sidebar.html' },
      { elementId: 'footer', fragmentPath: '/fragments/footer.html' }
    ]);
    
    // Fragment 로드 완료 후 이벤트 리스너 등록
    initializeEventListeners();
    
    // Mock 데이터 로드
    await loadMockData();
    
    // 초기 렌더링
    renderTracks();
    
  } catch (error) {
    console.error('App initialization failed:', error);
  }
});
```

### 15.2 API 레이어 상세 구현

**api.js - Phase 1 (Mock) 버전:**
```javascript
// API 클래스
class MusicLibraryAPI {
  constructor() {
    this.baseUrl = '/data';  // Mock 데이터 경로
    this.tracks = [];
    this.tags = {};
  }

  // Mock 데이터 로드
  async initialize() {
    try {
      const response = await fetch(`${this.baseUrl}/mock-tracks.json`);
      const data = await response.json();
      this.tracks = data.tracks;
      this.tags = data.tags;
      return true;
    } catch (error) {
      console.error('Failed to load mock data:', error);
      return false;
    }
  }

  // 트랙 목록 조회 (필터링 포함)
  async getTracks(filters = {}) {
    let result = [...this.tracks];

    // 장르 필터
    if (filters.genre && filters.genre.length > 0) {
      result = result.filter(track =>
        track.genre.some(g => filters.genre.includes(g))
      );
    }

    // 무드 필터
    if (filters.mood && filters.mood.length > 0) {
      result = result.filter(track =>
        track.mood.some(m => filters.mood.includes(m))
      );
    }

    // BPM 필터
    if (filters.bpmMin !== undefined) {
      result = result.filter(track => track.bpm >= filters.bpmMin);
    }
    if (filters.bpmMax !== undefined) {
      result = result.filter(track => track.bpm <= filters.bpmMax);
    }

    // 키 필터
    if (filters.key) {
      result = result.filter(track => track.key === filters.key);
    }

    // 텍스트 검색
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(track =>
        track.title.toLowerCase().includes(searchLower) ||
        track.artist.toLowerCase().includes(searchLower)
      );
    }

    return {
      tracks: result,
      total: this.tracks.length,
      filtered: result.length
    };
  }

  // 특정 트랙 조회
  async getTrack(id) {
    return this.tracks.find(track => track.id === id);
  }

  // 태그 목록 조회
  async getTags() {
    return this.tags;
  }

  // 스트리밍 URL 생성
  getStreamUrl(id) {
    const track = this.tracks.find(t => t.id === id);
    return track ? track.filePath : null;
  }
}

// 전역 인스턴스
const api = new MusicLibraryAPI();
```

**api.js - Phase 2 (Real API) 버전으로 전환:**
```javascript
class MusicLibraryAPI {
  constructor() {
    this.baseUrl = 'http://localhost:5000/api';  // 실제 API URL로 변경
  }

  async getTracks(filters = {}) {
    // 쿼리 파라미터 생성
    const params = new URLSearchParams();
    if (filters.genre) params.append('genre', filters.genre.join(','));
    if (filters.mood) params.append('mood', filters.mood.join(','));
    if (filters.bpmMin) params.append('bpm_min', filters.bpmMin);
    if (filters.bpmMax) params.append('bpm_max', filters.bpmMax);
    if (filters.key) params.append('key', filters.key);
    if (filters.search) params.append('search', filters.search);

    const response = await fetch(`${this.baseUrl}/tracks?${params}`);
    if (!response.ok) throw new Error('API request failed');
    const data = await response.json();
    return data.data;
  }

  async getTrack(id) {
    const response = await fetch(`${this.baseUrl}/tracks/${id}`);
    if (!response.ok) throw new Error('Track not found');
    const data = await response.json();
    return data.data;
  }

  getStreamUrl(id) {
    return `${this.baseUrl}/stream/${id}`;
  }
}
```

### 15.3 필터링 시스템 상세 구현

**filter.js:**
```javascript
class FilterManager {
  constructor() {
    this.filters = {
      genre: [],
      mood: [],
      bpmMin: null,
      bpmMax: null,
      key: null,
      search: ''
    };
    this.callbacks = [];
  }

  // 필터 업데이트
  updateFilter(filterType, value) {
    switch (filterType) {
      case 'genre':
      case 'mood':
        // 체크박스 토글
        const index = this.filters[filterType].indexOf(value);
        if (index > -1) {
          this.filters[filterType].splice(index, 1);
        } else {
          this.filters[filterType].push(value);
        }
        break;
      
      case 'bpmMin':
      case 'bpmMax':
        this.filters[filterType] = value ? parseInt(value) : null;
        break;
      
      case 'key':
        this.filters[filterType] = value || null;
        break;
      
      case 'search':
        this.filters[filterType] = value;
        break;
    }

    this.notifyChange();
  }

  // 필터 초기화
  reset() {
    this.filters = {
      genre: [],
      mood: [],
      bpmMin: null,
      bpmMax: null,
      key: null,
      search: ''
    };
    this.notifyChange();
    this.updateUI();
  }

  // 현재 필터 값 반환
  getFilters() {
    return { ...this.filters };
  }

  // 변경 콜백 등록
  onChange(callback) {
    this.callbacks.push(callback);
  }

  // 변경 알림
  notifyChange() {
    this.callbacks.forEach(callback => callback(this.getFilters()));
  }

  // UI 업데이트 (체크박스, 입력 필드 등)
  updateUI() {
    // 장르 체크박스
    document.querySelectorAll('.genre-checkbox').forEach(checkbox => {
      checkbox.checked = this.filters.genre.includes(checkbox.value);
    });

    // 무드 체크박스
    document.querySelectorAll('.mood-checkbox').forEach(checkbox => {
      checkbox.checked = this.filters.mood.includes(checkbox.value);
    });

    // BPM 슬라이더
    const bpmMinInput = document.getElementById('bpm-min');
    const bpmMaxInput = document.getElementById('bpm-max');
    if (bpmMinInput) bpmMinInput.value = this.filters.bpmMin || '';
    if (bpmMaxInput) bpmMaxInput.value = this.filters.bpmMax || '';

    // 키 선택
    const keySelect = document.getElementById('key-select');
    if (keySelect) keySelect.value = this.filters.key || '';

    // 검색어
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = this.filters.search;
  }
}

// 전역 인스턴스
const filterManager = new FilterManager();
```

### 15.4 오디오 플레이어 상세 구현

**player.js:**
```javascript
class AudioPlayer {
  constructor() {
    this.audio = new Audio();
    this.currentTrack = null;
    this.isPlaying = false;
    
    // 이벤트 리스너 등록
    this.audio.addEventListener('timeupdate', () => this.onTimeUpdate());
    this.audio.addEventListener('ended', () => this.onEnded());
    this.audio.addEventListener('loadedmetadata', () => this.onLoaded());
  }

  // 트랙 로드
  async loadTrack(track) {
    try {
      this.currentTrack = track;
      this.audio.src = api.getStreamUrl(track.id);
      this.updatePlayerUI();
      return true;
    } catch (error) {
      console.error('Failed to load track:', error);
      return false;
    }
  }

  // 재생
  async play() {
    try {
      await this.audio.play();
      this.isPlaying = true;
      this.updatePlayButton();
    } catch (error) {
      console.error('Playback failed:', error);
    }
  }

  // 일시정지
  pause() {
    this.audio.pause();
    this.isPlaying = false;
    this.updatePlayButton();
  }

  // 재생/일시정지 토글
  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  // Seek
  seek(time) {
    this.audio.currentTime = time;
  }

  // 볼륨 설정 (0-1)
  setVolume(volume) {
    this.audio.volume = Math.max(0, Math.min(1, volume));
  }

  // 시간 업데이트 이벤트
  onTimeUpdate() {
    if (!this.currentTrack) return;

    const currentTime = this.audio.currentTime;
    const duration = this.audio.duration;
    const progress = (currentTime / duration) * 100;

    // UI 업데이트
    this.updateProgressBar(progress);
    this.updateTimeDisplay(currentTime, duration);
  }

  // 재생 종료 이벤트
  onEnded() {
    this.isPlaying = false;
    this.updatePlayButton();
  }

  // 로드 완료 이벤트
  onLoaded() {
    const duration = this.audio.duration;
    this.updateTimeDisplay(0, duration);
  }

  // UI 업데이트 함수들
  updatePlayerUI() {
    if (!this.currentTrack) return;

    document.getElementById('player-title').textContent = this.currentTrack.title;
    document.getElementById('player-artist').textContent = this.currentTrack.artist;
  }

  updatePlayButton() {
    const playBtn = document.getElementById('play-btn');
    if (playBtn) {
      playBtn.textContent = this.isPlaying ? '⏸' : '▶';
    }
  }

  updateProgressBar(progress) {
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
  }

  updateTimeDisplay(current, duration) {
    const currentEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration-time');
    
    if (currentEl) currentEl.textContent = this.formatTime(current);
    if (durationEl) durationEl.textContent = this.formatTime(duration);
  }

  formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}

// 전역 인스턴스
const player = new AudioPlayer();
```

### 15.5 UI 렌더링 상세 구현

**ui.js:**
```javascript
class UIManager {
  constructor() {
    this.trackGridElement = document.getElementById('track-grid');
  }

  // 트랙 목록 렌더링
  renderTracks(tracks) {
    if (!this.trackGridElement) return;

    // 결과 없음 처리
    if (tracks.length === 0) {
      this.trackGridElement.innerHTML = `
        <div class="no-results">
          <p>검색 결과가 없습니다.</p>
        </div>
      `;
      return;
    }

    // 트랙 카드 생성
    const cardsHTML = tracks.map(track => this.createTrackCard(track)).join('');
    this.trackGridElement.innerHTML = cardsHTML;

    // 이벤트 리스너 등록
    this.attachTrackCardListeners();
  }

  // 트랙 카드 HTML 생성
  createTrackCard(track) {
    return `
      <div class="track-card" data-track-id="${track.id}">
        <div class="track-card__header">
          <h3 class="track-card__title">${this.escapeHtml(track.title)}</h3>
          <p class="track-card__artist">${this.escapeHtml(track.artist)}</p>
        </div>
        
        <div class="track-card__info">
          <span class="track-card__bpm">${track.bpm} BPM</span>
          <span class="track-card__key">${track.key}</span>
          <span class="track-card__duration">${this.formatDuration(track.duration)}</span>
        </div>
        
        <div class="track-card__tags">
          ${track.genre.map(g => `<span class="tag tag--genre">${g}</span>`).join('')}
          ${track.mood.map(m => `<span class="tag tag--mood">${m}</span>`).join('')}
        </div>
        
        <button class="track-card__play-btn" data-track-id="${track.id}">
          ▶ Play
        </button>
      </div>
    `;
  }

  // 카드 이벤트 리스너
  attachTrackCardListeners() {
    document.querySelectorAll('.track-card__play-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const trackId = e.target.dataset.trackId;
        const track = await api.getTrack(trackId);
        if (track) {
          await player.loadTrack(track);
          await player.play();
        }
      });
    });
  }

  // 로딩 상태 표시
  showLoading() {
    if (!this.trackGridElement) return;
    this.trackGridElement.innerHTML = `
      <div class="loading">
        <div class="loading__spinner"></div>
        <p>로딩 중...</p>
      </div>
    `;
  }

  // 에러 메시지 표시
  showError(message) {
    if (!this.trackGridElement) return;
    this.trackGridElement.innerHTML = `
      <div class="error">
        <p>${this.escapeHtml(message)}</p>
      </div>
    `;
  }

  // 필터 결과 카운트 업데이트
  updateFilterCount(total, filtered) {
    const countElement = document.getElementById('filter-count');
    if (countElement) {
      countElement.textContent = `${filtered} / ${total} tracks`;
    }
  }

  // 유틸리티: HTML 이스케이프
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 유틸리티: 시간 포맷
  formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}

// 전역 인스턴스
const uiManager = new UIManager();
```

### 15.6 메인 앱 로직

**app.js 완전한 버전:**
```javascript
// 앱 상태
const appState = {
  isInitialized: false,
  tracks: [],
  filteredTracks: []
};

// 앱 초기화
async function initializeApp() {
  try {
    // Fragment 로드
    await fragmentLoader.loadMultiple([
      { elementId: 'header', fragmentPath: '/fragments/header.html' },
      { elementId: 'sidebar', fragmentPath: '/fragments/sidebar.html' },
      { elementId: 'footer', fragmentPath: '/fragments/footer.html' }
    ]);

    // API 초기화 (Mock 데이터 로드)
    const success = await api.initialize();
    if (!success) {
      throw new Error('Failed to initialize API');
    }

    // 초기 데이터 로드
    await loadTracks();

    // 이벤트 리스너 등록
    initializeEventListeners();

    // 태그 목록 렌더링
    await renderTagFilters();

    appState.isInitialized = true;
    console.log('App initialized successfully');

  } catch (error) {
    console.error('App initialization failed:', error);
    uiManager.showError('앱을 초기화하는데 실패했습니다.');
  }
}

// 트랙 로드
async function loadTracks(filters = {}) {
  try {
    uiManager.showLoading();
    
    const result = await api.getTracks(filters);
    appState.tracks = result.tracks;
    appState.filteredTracks = result.tracks;

    uiManager.renderTracks(result.tracks);
    uiManager.updateFilterCount(result.total, result.filtered);

  } catch (error) {
    console.error('Failed to load tracks:', error);
    uiManager.showError('트랙을 불러오는데 실패했습니다.');
  }
}

// 태그 필터 렌더링
async function renderTagFilters() {
  const tags = await api.getTags();

  // 장르 체크박스
  const genreContainer = document.getElementById('genre-filters');
  if (genreContainer) {
    genreContainer.innerHTML = tags.genres.map(genre => `
      <label class="filter-checkbox">
        <input type="checkbox" class="genre-checkbox" value="${genre}">
        <span>${genre}</span>
      </label>
    `).join('');
  }

  // 무드 체크박스
  const moodContainer = document.getElementById('mood-filters');
  if (moodContainer) {
    moodContainer.innerHTML = tags.moods.map(mood => `
      <label class="filter-checkbox">
        <input type="checkbox" class="mood-checkbox" value="${mood}">
        <span>${mood}</span>
      </label>
    `).join('');
  }

  // 키 드롭다운
  const keySelect = document.getElementById('key-select');
  if (keySelect) {
    keySelect.innerHTML = '<option value="">All Keys</option>' +
      tags.keys.map(key => `<option value="${key}">${key}</option>`).join('');
  }
}

// 이벤트 리스너 초기화
function initializeEventListeners() {
  // 필터 변경 감지
  filterManager.onChange(async (filters) => {
    await loadTracks(filters);
  });

  // 장르 필터
  document.addEventListener('change', (e) => {
    if (e.target.classList.contains('genre-checkbox')) {
      filterManager.updateFilter('genre', e.target.value);
    }
  });

  // 무드 필터
  document.addEventListener('change', (e) => {
    if (e.target.classList.contains('mood-checkbox')) {
      filterManager.updateFilter('mood', e.target.value);
    }
  });

  // BPM 필터
  const bpmMinInput = document.getElementById('bpm-min');
  const bpmMaxInput = document.getElementById('bpm-max');
  if (bpmMinInput) {
    bpmMinInput.addEventListener('input', debounce((e) => {
      filterManager.updateFilter('bpmMin', e.target.value);
    }, 500));
  }
  if (bpmMaxInput) {
    bpmMaxInput.addEventListener('input', debounce((e) => {
      filterManager.updateFilter('bpmMax', e.target.value);
    }, 500));
  }

  // 키 필터
  const keySelect = document.getElementById('key-select');
  if (keySelect) {
    keySelect.addEventListener('change', (e) => {
      filterManager.updateFilter('key', e.target.value);
    });
  }

  // 검색
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      filterManager.updateFilter('search', e.target.value);
    }, 300));
  }

  // 필터 초기화
  const resetBtn = document.getElementById('reset-filters-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      filterManager.reset();
    });
  }

  // 플레이어 컨트롤
  const playBtn = document.getElementById('play-btn');
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      player.togglePlay();
    });
  }

  // 프로그레스 바 클릭 (seek)
  const progressContainer = document.getElementById('progress-container');
  if (progressContainer) {
    progressContainer.addEventListener('click', (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const time = percent * player.audio.duration;
      player.seek(time);
    });
  }

  // 볼륨 컨트롤
  const volumeSlider = document.getElementById('volume-slider');
  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      player.setVolume(e.target.value / 100);
    });
  }
}

// Debounce 유틸리티
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// DOMContentLoaded 이벤트
document.addEventListener('DOMContentLoaded', initializeApp);
```

---

## 16. 백엔드 상세 구현 예시

### 16.1 Flask 앱 구조

**app.py:**
```python
from flask import Flask
from flask_cors import CORS
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

# 블루프린트 등록
from api.tracks import tracks_bp
from api.tags import tags_bp

app.register_blueprint(tracks_bp, url_prefix='/api')
app.register_blueprint(tags_bp, url_prefix='/api')

@app.route('/health')
def health():
    return {'status': 'ok'}, 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
```

**config.py:**
```python
import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    MUSIC_PATH = os.environ.get('MUSIC_PATH') or '/app/music'
    DB_PATH = os.environ.get('DB_PATH') or '/app/data/tracks.db'
    MAX_CONTENT_LENGTH = 500 * 1024 * 1024  # 500MB
```

**api/tracks.py:**
```python
from flask import Blueprint, jsonify, request, send_file
from models.track import Track
import os

tracks_bp = Blueprint('tracks', __name__)

@tracks_bp.route('/tracks', methods=['GET'])
def get_tracks():
    """트랙 목록 조회 및 필터링"""
    try:
        # 쿼리 파라미터 파싱
        genre = request.args.get('genre', '').split(',') if request.args.get('genre') else []
        mood = request.args.get('mood', '').split(',') if request.args.get('mood') else []
        bpm_min = request.args.get('bpm_min', type=int)
        bpm_max = request.args.get('bpm_max', type=int)
        key = request.args.get('key')
        search = request.args.get('search', '')

        # 필터링 로직 (Phase 3에서 DB 쿼리로 대체)
        tracks = Track.get_all()
        
        # 장르 필터
        if genre:
            tracks = [t for t in tracks if any(g in t['genre'] for g in genre)]
        
        # 무드 필터
        if mood:
            tracks = [t for t in tracks if any(m in t['mood'] for m in mood)]
        
        # BPM 필터
        if bpm_min:
            tracks = [t for t in tracks if t.get('bpm', 0) >= bpm_min]
        if bpm_max:
            tracks = [t for t in tracks if t.get('bpm', 999) <= bpm_max]
        
        # 키 필터
        if key:
            tracks = [t for t in tracks if t.get('key') == key]
        
        # 검색
        if search:
            search_lower = search.lower()
            tracks = [t for t in tracks if 
                     search_lower in t.get('title', '').lower() or
                     search_lower in t.get('artist', '').lower()]

        return jsonify({
            'success': True,
            'data': {
                'tracks': tracks,
                'total': len(Track.get_all()),
                'filtered': len(tracks)
            }
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': {'code': 'SERVER_ERROR', 'message': str(e)}
        }), 500

@tracks_bp.route('/tracks/<track_id>', methods=['GET'])
def get_track(track_id):
    """특정 트랙 조회"""
    try:
        track = Track.get_by_id(track_id)
        if not track:
            return jsonify({
                'success': False,
                'error': {'code': 'TRACK_NOT_FOUND', 'message': '트랙을 찾을 수 없습니다.'}
            }), 404

        return jsonify({'success': True, 'data': track}), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': {'code': 'SERVER_ERROR', 'message': str(e)}
        }), 500

@tracks_bp.route('/stream/<track_id>', methods=['GET'])
def stream_track(track_id):
    """음악 파일 스트리밍"""
    try:
        track = Track.get_by_id(track_id)
        if not track:
            return jsonify({'error': 'Track not found'}), 404

        file_path = os.path.join(app.config['MUSIC_PATH'], track['filePath'])
        if not os.path.exists(file_path):
            return jsonify({'error': 'File not found'}), 404

        return send_file(file_path, mimetype='audio/mpeg')

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tracks_bp.route('/tracks', methods=['POST'])
def create_track():
    """새 트랙 추가"""
    try:
        data = request.json
        
        # 필수 필드 검증
        if not data.get('title') or not data.get('filePath'):
            return jsonify({
                'success': False,
                'error': {'code': 'INVALID_DATA', 'message': '필수 필드가 누락되었습니다.'}
            }), 400

        track = Track.create(data)
        return jsonify({'success': True, 'data': track}), 201

    except Exception as e:
        return jsonify({
            'success': False,
            'error': {'code': 'SERVER_ERROR', 'message': str(e)}
        }), 500

@tracks_bp.route('/tracks/<track_id>', methods=['PUT'])
def update_track(track_id):
    """트랙 정보 수정"""
    try:
        data = request.json
        track = Track.update(track_id, data)
        
        if not track:
            return jsonify({
                'success': False,
                'error': {'code': 'TRACK_NOT_FOUND', 'message': '트랙을 찾을 수 없습니다.'}
            }), 404

        return jsonify({'success': True, 'data': track}), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': {'code': 'SERVER_ERROR', 'message': str(e)}
        }), 500

@tracks_bp.route('/tracks/<track_id>', methods=['DELETE'])
def delete_track(track_id):
    """트랙 삭제"""
    try:
        success = Track.delete(track_id)
        
        if not success:
            return jsonify({
                'success': False,
                'error': {'code': 'TRACK_NOT_FOUND', 'message': '트랙을 찾을 수 없습니다.'}
            }), 404

        return jsonify({'success': True}), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': {'code': 'SERVER_ERROR', 'message': str(e)}
        }), 500
```

**api/tags.py:**
```python
from flask import Blueprint, jsonify

tags_bp = Blueprint('tags', __name__)

@tags_bp.route('/tags', methods=['GET'])
def get_tags():
    """사용 가능한 태그 목록"""
    try:
        tags = {
            'genres': [
                'House', 'Techno', 'Trap', 'Hip-Hop', 'R&B', 
                'Pop', 'Ambient', 'Cinematic', 'EDM', 'Lo-Fi'
            ],
            'moods': [
                'Energetic', 'Calm', 'Dark', 'Uplifting', 
                'Melancholic', 'Aggressive', 'Dreamy', 'Mysterious'
            ],
            'keys': [
                'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
                'Cm', 'C#m', 'Dm', 'D#m', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bm'
            ]
        }
        
        return jsonify({'success': True, 'data': tags}), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': {'code': 'SERVER_ERROR', 'message': str(e)}
        }), 500
```

**models/track.py (Phase 2 - 메모리 기반):**
```python
import uuid
from datetime import datetime
import json

class Track:
    # Phase 2에서는 메모리에 저장 (Phase 3에서 DB로 전환)
    _tracks = []

    @classmethod
    def get_all(cls):
        """모든 트랙 조회"""
        return cls._tracks

    @classmethod
    def get_by_id(cls, track_id):
        """ID로 트랙 조회"""
        for track in cls._tracks:
            if track['id'] == track_id:
                return track
        return None

    @classmethod
    def create(cls, data):
        """새 트랙 생성"""
        track = {
            'id': str(uuid.uuid4()),
            'title': data['title'],
            'artist': data.get('artist', ''),
            'genre': data.get('genre', []),
            'mood': data.get('mood', []),
            'bpm': data.get('bpm'),
            'key': data.get('key'),
            'filePath': data['filePath'],
            'duration': data.get('duration'),
            'fileSize': data.get('fileSize'),
            'createdAt': datetime.now().isoformat(),
            'updatedAt': datetime.now().isoformat()
        }
        cls._tracks.append(track)
        return track

    @classmethod
    def update(cls, track_id, data):
        """트랙 정보 수정"""
        track = cls.get_by_id(track_id)
        if not track:
            return None

        # 업데이트 가능한 필드만 수정
        updatable_fields = ['title', 'artist', 'genre', 'mood', 'bpm', 'key', 'filePath']
        for field in updatable_fields:
            if field in data:
                track[field] = data[field]
        
        track['updatedAt'] = datetime.now().isoformat()
        return track

    @classmethod
    def delete(cls, track_id):
        """트랙 삭제"""
        track = cls.get_by_id(track_id)
        if not track:
            return False
        
        cls._tracks.remove(track)
        return True

    @classmethod
    def load_from_json(cls, json_path):
        """JSON에서 트랙 로드 (초기 데이터)"""
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                cls._tracks = data.get('tracks', [])
            return True
        except Exception as e:
            print(f"Failed to load tracks from JSON: {e}")
            return False
```

**requirements.txt:**
```
Flask==3.0.0
Flask-CORS==4.0.0
python-dotenv==1.0.0
```

---

## 17. 데이터베이스 구현 (Phase 3)

### 17.1 SQLite 연결 및 초기화

**utils/db.py:**
```python
import sqlite3
import json
from datetime import datetime
from config import Config

class Database:
    def __init__(self, db_path=None):
        self.db_path = db_path or Config.DB_PATH

    def get_connection(self):
        """데이터베이스 연결"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row  # 딕셔너리 형태로 결과 반환
        return conn

    def initialize(self):
        """데이터베이스 초기화 (테이블 생성)"""
        conn = self.get_connection()
        cursor = conn.cursor()

        # tracks 테이블 생성
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS tracks (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                artist TEXT,
                genre TEXT,
                mood TEXT,
                bpm INTEGER,
                key TEXT,
                file_path TEXT NOT NULL,
                duration INTEGER,
                file_size INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # 인덱스 생성
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_tracks_bpm ON tracks(bpm)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_tracks_key ON tracks(key)')

        conn.commit()
        conn.close()

    def execute_query(self, query, params=None):
        """쿼리 실행"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
        
        conn.commit()
        result = cursor.fetchall()
        conn.close()
        
        return [dict(row) for row in result]

    def execute_one(self, query, params=None):
        """단일 결과 쿼리"""
        result = self.execute_query(query, params)
        return result[0] if result else None

# 전역 인스턴스
db = Database()
```

### 17.2 Track 모델 (DB 버전)

**models/track.py (Phase 3 - DB 기반):**
```python
import uuid
from datetime import datetime
import json
from utils.db import db

class Track:
    @classmethod
    def get_all(cls, filters=None):
        """모든 트랙 조회 (필터링 지원)"""
        query = "SELECT * FROM tracks WHERE 1=1"
        params = []

        if filters:
            # 장르 필터
            if filters.get('genre'):
                genre_conditions = ' OR '.join(['genre LIKE ?' for _ in filters['genre']])
                query += f" AND ({genre_conditions})"
                params.extend([f'%{g}%' for g in filters['genre']])

            # 무드 필터
            if filters.get('mood'):
                mood_conditions = ' OR '.join(['mood LIKE ?' for _ in filters['mood']])
                query += f" AND ({mood_conditions})"
                params.extend([f'%{m}%' for m in filters['mood']])

            # BPM 필터
            if filters.get('bpm_min'):
                query += " AND bpm >= ?"
                params.append(filters['bpm_min'])
            if filters.get('bpm_max'):
                query += " AND bpm <= ?"
                params.append(filters['bpm_max'])

            # 키 필터
            if filters.get('key'):
                query += " AND key = ?"
                params.append(filters['key'])

            # 검색
            if filters.get('search'):
                query += " AND (title LIKE ? OR artist LIKE ?)"
                search_term = f"%{filters['search']}%"
                params.extend([search_term, search_term])

        query += " ORDER BY created_at DESC"
        
        tracks = db.execute_query(query, params if params else None)
        
        # JSON 문자열을 배열로 변환
        for track in tracks:
            track['genre'] = json.loads(track['genre']) if track['genre'] else []
            track['mood'] = json.loads(track['mood']) if track['mood'] else []
        
        return tracks

    @classmethod
    def get_by_id(cls, track_id):
        """ID로 트랙 조회"""
        track = db.execute_one("SELECT * FROM tracks WHERE id = ?", (track_id,))
        
        if track:
            track['genre'] = json.loads(track['genre']) if track['genre'] else []
            track['mood'] = json.loads(track['mood']) if track['mood'] else []
        
        return track

    @classmethod
    def create(cls, data):
        """새 트랙 생성"""
        track_id = str(uuid.uuid4())
        now = datetime.now().isoformat()

        query = '''
            INSERT INTO tracks 
            (id, title, artist, genre, mood, bpm, key, file_path, duration, file_size, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        '''
        
        params = (
            track_id,
            data['title'],
            data.get('artist', ''),
            json.dumps(data.get('genre', [])),
            json.dumps(data.get('mood', [])),
            data.get('bpm'),
            data.get('key'),
            data['filePath'],
            data.get('duration'),
            data.get('fileSize'),
            now,
            now
        )

        db.execute_query(query, params)
        return cls.get_by_id(track_id)

    @classmethod
    def update(cls, track_id, data):
        """트랙 정보 수정"""
        track = cls.get_by_id(track_id)
        if not track:
            return None

        now = datetime.now().isoformat()
        
        query = '''
            UPDATE tracks
            SET title = ?, artist = ?, genre = ?, mood = ?, 
                bpm = ?, key = ?, file_path = ?, updated_at = ?
            WHERE id = ?
        '''
        
        params = (
            data.get('title', track['title']),
            data.get('artist', track['artist']),
            json.dumps(data.get('genre', track['genre'])),
            json.dumps(data.get('mood', track['mood'])),
            data.get('bpm', track['bpm']),
            data.get('key', track['key']),
            data.get('filePath', track['file_path']),
            now,
            track_id
        )

        db.execute_query(query, params)
        return cls.get_by_id(track_id)

    @classmethod
    def delete(cls, track_id):
        """트랙 삭제"""
        track = cls.get_by_id(track_id)
        if not track:
            return False

        db.execute_query("DELETE FROM tracks WHERE id = ?", (track_id,))
        return True
```

### 17.3 JSON 백업/복원 구현

**utils/backup.py:**
```python
import json
from datetime import datetime
from utils.db import db

class BackupManager:
    @staticmethod
    def export_to_json(output_path):
        """DB를 JSON으로 내보내기"""
        try:
            # 모든 트랙 조회
            tracks = db.execute_query("SELECT * FROM tracks")
            
            # JSON 문자열을 배열로 변환
            for track in tracks:
                track['genre'] = json.loads(track['genre']) if track['genre'] else []
                track['mood'] = json.loads(track['mood']) if track['mood'] else []

            # 백업 데이터 구성
            backup_data = {
                'version': '1.0',
                'exportedAt': datetime.now().isoformat(),
                'trackCount': len(tracks),
                'tracks': tracks
            }

            # JSON 파일로 저장
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(backup_data, f, ensure_ascii=False, indent=2)

            return True, f"Successfully exported {len(tracks)} tracks"

        except Exception as e:
            return False, f"Export failed: {str(e)}"

    @staticmethod
    def import_from_json(input_path, mode='replace'):
        """JSON에서 DB로 가져오기
        
        Args:
            input_path: JSON 파일 경로
            mode: 'replace' (기존 데이터 삭제 후 가져오기) 또는 'merge' (병합)
        """
        try:
            # JSON 파일 읽기
            with open(input_path, 'r', encoding='utf-8') as f:
                backup_data = json.load(f)

            tracks = backup_data.get('tracks', [])

            # replace 모드: 기존 데이터 삭제
            if mode == 'replace':
                db.execute_query("DELETE FROM tracks")

            # 트랙 삽입
            imported_count = 0
            for track in tracks:
                query = '''
                    INSERT OR REPLACE INTO tracks 
                    (id, title, artist, genre, mood, bpm, key, file_path, 
                     duration, file_size, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                '''
                
                params = (
                    track['id'],
                    track['title'],
                    track.get('artist', ''),
                    json.dumps(track.get('genre', [])),
                    json.dumps(track.get('mood', [])),
                    track.get('bpm'),
                    track.get('key'),
                    track.get('file_path', track.get('filePath', '')),
                    track.get('duration'),
                    track.get('file_size', track.get('fileSize')),
                    track.get('created_at', track.get('createdAt')),
                    track.get('updated_at', track.get('updatedAt'))
                )

                db.execute_query(query, params)
                imported_count += 1

            return True, f"Successfully imported {imported_count} tracks"

        except Exception as e:
            return False, f"Import failed: {str(e)}"

# 사용 예시
# BackupManager.export_to_json('/app/data/backup.json')
# BackupManager.import_from_json('/app/data/backup.json', mode='replace')
```

---

## 18. CSS 스타일 예시

### 18.1 reset.css
```css
/* CSS Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
}

a {
  text-decoration: none;
  color: inherit;
}

button {
  border: none;
  background: none;
  cursor: pointer;
  font-family: inherit;
}

ul, ol {
  list-style: none;
}
```

### 18.2 layout.css
```css
/* 메인 레이아웃 */
.main-container {
  display: flex;
  min-height: calc(100vh - var(--header-height) - var(--player-height));
  background-color: var(--color-background);
}

/* 사이드바 */
aside {
  width: var(--sidebar-width);
  background-color: var(--color-surface);
  padding: var(--spacing-lg);
  overflow-y: auto;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

/* 메인 콘텐츠 */
.content {
  flex: 1;
  padding: var(--spacing-lg);
  overflow-y: auto;
}

/* 트랙 그리드 */
.track-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-lg);
  margin-top: var(--spacing-lg);
}

/* 플레이어 바 */
.player-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--player-height);
  background-color: var(--color-surface);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  padding: 0 var(--spacing-lg);
  z-index: 1000;
}
```

### 18.3 components.css
```css
/* 트랙 카드 */
.track-card {
  background-color: var(--color-surface);
  border-radius: 8px;
  padding: var(--spacing-md);
  transition: transform 0.2s, box-shadow 0.2s;
}

.track-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

.track-card__header {
  margin-bottom: var(--spacing-md);
}

.track-card__title {
  color: var(--color-text);
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
}

.track-card__artist {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.track-card__info {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.track-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
}

.tag {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.tag--genre {
  background-color: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

.tag--mood {
  background-color: rgba(168, 85, 247, 0.2);
  color: #c084fc;
}

.track-card__play-btn {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-primary);
  color: white;
  border-radius: 6px;
  font-weight: 600;
  transition: background-color 0.2s;
}

.track-card__play-btn:hover {
  background-color: #2563eb;
}

/* 필터 체크박스 */
.filter-checkbox {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) 0;
  color: var(--color-text);
  cursor: pointer;
  user-select: none;
}

.filter-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

/* 로딩/에러 */
.loading, .error, .no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  color: var(--color-text-secondary);
}

.loading__spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

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

## 부록 A: 개발 환경 설정

### A.1 로컬 개발 환경 (Windows/Mac/Linux)

**필요한 도구:**
- Python 3.9+
- Node.js (간단한 HTTP 서버용, 선택사항)
- Docker Desktop (Phase 2+)
- VSCode 또는 원하는 에디터

**초기 설정:**
```bash
# 프로젝트 클론
git clone <repository-url>
cd music-library

# Python 가상환경 생성
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Python 패키지 설치
cd backend
pip install -r requirements.txt

# 프론트엔드 로컬 서버 실행 (Phase 1)
cd ../frontend
python -m http.server 8080
```

### A.2 Synology NAS 설정

**SSH 접속 활성화:**
1. DSM > 제어판 > 터미널 및 SNMP
2. SSH 서비스 활성화

**Docker 설치:**
1. 패키지 센터에서 Docker 설치
2. Container Manager 실행

**프로젝트 배포:**
```bash
# SSH로 NAS 접속
ssh admin@<NAS-IP>

# 프로젝트 디렉토리 생성
mkdir -p /volume1/docker/music-library
cd /volume1/docker/music-library

# 프로젝트 파일 업로드 (FileStation 또는 git clone)

# Docker Compose 실행
sudo docker-compose up -d

# 로그 확인
sudo docker-compose logs -f
```

---

## 부록 B: 트러블슈팅

### B.1 일반적인 문제

**문제: Fragment가 로드되지 않음**
- 원인: CORS 정책 또는 경로 문제
