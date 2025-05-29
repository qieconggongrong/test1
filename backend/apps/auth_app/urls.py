"""
认证应用的URL配置
"""

from django.urls import path
from .views import 用户注册视图, 用户登录视图, 用户注销视图, 用户信息视图
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', 用户注册视图.as_view(), name='用户注册'),
    path('login/', 用户登录视图.as_view(), name='用户登录'),
    path('logout/', 用户注销视图.as_view(), name='用户注销'),
    path('user/', 用户信息视图.as_view(), name='用户信息'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
