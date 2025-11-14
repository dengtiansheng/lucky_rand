# -*- coding: utf-8 -*-
"""
配置文件
"""
import os
from pathlib import Path

# 尝试加载 .env 文件（如果存在）
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).parent / '.env'
    if env_path.exists():
        load_dotenv(env_path)
except ImportError:
    # 如果没有安装 python-dotenv，则跳过
    pass

# 数据库配置（通过环境变量配置，确保敏感信息安全）
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
DB_NAME = os.getenv('DB_NAME', 'lucky_rand')
DB_PORT = int(os.getenv('DB_PORT', '3306'))

# Flask配置
FLASK_HOST = '0.0.0.0'
FLASK_PORT = 9000
FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'

