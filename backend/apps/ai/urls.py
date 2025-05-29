"""
AI应用的URL配置
"""

from django.urls import path
from .views import 任务生成视图, 对话生成视图, 描述生成视图

urlpatterns = [
    path('generate/quest/', 任务生成视图.as_view(), name='任务生成'),
    path('generate/dialogue/', 对话生成视图.as_view(), name='对话生成'),
    path('generate/description/', 描述生成视图.as_view(), name='描述生成'),
]
