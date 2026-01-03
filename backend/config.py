import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    MUSIC_PATH = os.environ.get('MUSIC_PATH') or '/app/music'
    DB_PATH = os.environ.get('DB_PATH') or '/app/data/tracks.db'
    MAX_CONTENT_LENGTH = 500 * 1024 * 1024  # 500MB
