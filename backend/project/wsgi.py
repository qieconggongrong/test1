"""
WSGI config for the project project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/stable/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

# 这一行确保 Django 知道在哪里找到你的 settings.py 文件。
# 'project.settings' 对于你的项目结构来说是正确的。
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')

application = get_wsgi_application()