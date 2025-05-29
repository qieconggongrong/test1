"""
Django项目设置文件
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from datetime import timedelta # 确保 timedelta 被导入，因为 SIMPLE_JWT 设置中用到了它

# 加载环境变量
load_dotenv()

# 构建路径
BASE_DIR = Path(__file__).resolve().parent.parent

# 安全设置
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-默认密钥仅用于开发环境')
DEBUG = os.getenv('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# 应用定义
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # 第三方应用
    'rest_framework',
    'corsheaders',
    # 自定义应用
    'apps.auth_app', # 你的自定义用户模型 '用户' 应该在这个应用中
    'apps.game',
    'apps.ai',
]

# --- 我添加的关键设置 ---
# 指定自定义用户模型
AUTH_USER_MODEL = 'auth_app.用户' # <--- 这是正确的值
# --------------------------

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # CORS中间件
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'project.wsgi.application'

# 数据库配置
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# 密码验证
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# 国际化
LANGUAGE_CODE = 'zh-hans'
TIME_ZONE = 'Asia/Shanghai'
USE_I18N = True
USE_TZ = True

# 静态文件设置
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles') # 注意：STATIC_ROOT 用于 collectstatic，开发时通常不用

# 默认主键字段类型
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework设置
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer', # 开发时方便查看 API
    ],
    'EXCEPTION_HANDLER': 'utils.exception_handler.custom_exception_handler', # 确保这个路径是正确的
}

# CORS设置
CORS_ALLOW_ALL_ORIGINS = DEBUG  # 开发环境允许所有来源
if not DEBUG:
    CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:8080').split(',')
# 你也可以更明确地设置允许的源，例如：
# CORS_ALLOWED_ORIGINS = [
#    "http://localhost:8080", # 假设你的前端运行在这个地址
#    "http://127.0.0.1:8080",
# ]
# 或者使用 CORS_ALLOW_CREDENTIALS = True 并配合 CORS_ALLOWED_ORIGINS (非通配符) 或 CORS_ALLOW_ALL_ORIGINS = False


# JWT设置
# from datetime import timedelta # 这行在文件顶部已经有了，确保只导入一次
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': False,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY, # 使用 settings.SECRET_KEY
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id', # 确保你的 '用户' 模型中主键是 'id' (如果是继承自 AbstractUser，那默认就是 'id')
    'USER_ID_CLAIM': 'user_id',
}

# DeepSeek API设置
DEEPSEEK_API_KEY = os.getenv('DEEPSEEK_API_KEY', 'sk-dbc5491eea7f4a87b05e773e8e855dca')
DEEPSEEK_API_URL = os.getenv('DEEPSEEK_API_URL', 'https://api.deepseek.com')