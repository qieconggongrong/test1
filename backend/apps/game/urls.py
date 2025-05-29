"""
游戏应用的URL配置
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import 地图视图集, NPC视图集, 物品视图集, 任务视图集, 存档视图集

# 创建路由器并注册视图集
router = DefaultRouter()
router.register(r'map', 地图视图集, basename='地图')
router.register(r'npc', NPC视图集, basename='NPC')
router.register(r'item', 物品视图集, basename='物品')
router.register(r'quest', 任务视图集, basename='任务')
router.register(r'save', 存档视图集, basename='存档')

urlpatterns = [
    path('', include(router.urls)),
]
