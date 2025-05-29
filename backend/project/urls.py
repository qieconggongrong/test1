"""
Django项目URL配置
"""

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # API路由
    path('api/auth/', include('apps.auth_app.urls')),
    path('api/game/', include('apps.game.urls')),
    path('api/ai/', include('apps.ai.urls')),
]
