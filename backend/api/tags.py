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
