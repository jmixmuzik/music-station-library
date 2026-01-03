
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
