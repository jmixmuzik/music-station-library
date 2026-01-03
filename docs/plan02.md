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
