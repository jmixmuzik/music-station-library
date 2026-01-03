
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
