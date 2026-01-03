from flask import Blueprint, jsonify, request, send_file
from models.track import Track
from flask import current_app
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
            tracks = [t for t in tracks if any(g in t.get('genre', []) for g in genre)]
        
        # 무드 필터
        if mood:
            tracks = [t for t in tracks if any(m in t.get('mood', []) for m in mood)]
        
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

        file_path = os.path.join(current_app.config['MUSIC_PATH'], track['filePath'])
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
