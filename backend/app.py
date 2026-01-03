import os
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
    debug_mode = os.environ.get('FLASK_ENV') != 'production'
    app.run(host='0.0.0.0', port=5000, debug=debug_mode)
