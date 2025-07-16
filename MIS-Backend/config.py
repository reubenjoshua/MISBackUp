import os
from dotenv import load_dotenv
from flask_caching import Cache

load_dotenv()

class Config:
    #Flask Configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'default-secret-key')
    JWT_SECRET_KEY = os.getenv('JWS_SECRET_KEY', 'default-secret-key')

    #Database Config
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    #Flask Environment
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    DEBUG = os.getenv('FLASK_DEBUG', False)

import os

# Check if Redis is available, otherwise use simple cache
REDIS_AVAILABLE = os.getenv('REDIS_AVAILABLE', 'false').lower() == 'true'

if REDIS_AVAILABLE:
    CACHE_CONFIG = {
        'CACHE_TYPE': 'redis',
        'CACHE_REDIS_HOST': 'localhost',
        'CACHE_REDIS_PORT': 6379,
        'CACHE_REDIS_DB': 0,
        'CACHE_DEFAULT_TIMEOUT': 300
    }
else:
    CACHE_CONFIG = {
        'CACHE_TYPE': 'simple',  # Use simple in-memory cache for development
        'CACHE_DEFAULT_TIMEOUT': 300
    }

# Create cache instance
cache = Cache()