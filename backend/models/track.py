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
