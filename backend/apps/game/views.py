"""
游戏应用的视图
"""

from rest_framework import status, viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import 地图, NPC, 物品, 任务, 存档, 对话
from .serializers import (
    地图序列化器, NPC序列化器, 物品序列化器, 任务序列化器, 
    存档序列化器, 对话序列化器, 对话请求序列化器
)

class 地图视图集(viewsets.ReadOnlyModelViewSet):
    """地图视图集，只提供读取功能"""
    queryset = 地图.objects.all()
    serializer_class = 地图序列化器
    
    def retrieve(self, request, *args, **kwargs):
        """获取单个地图详情"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            "状态": "成功",
            "数据": serializer.data,
            "消息": "获取地图数据成功",
            "代码": status.HTTP_200_OK
        })
    
    def list(self, request, *args, **kwargs):
        """获取地图列表"""
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "状态": "成功",
            "数据": serializer.data,
            "消息": "获取地图列表成功",
            "代码": status.HTTP_200_OK
        })

class NPC视图集(viewsets.ReadOnlyModelViewSet):
    """NPC视图集，只提供读取功能"""
    queryset = NPC.objects.all()
    serializer_class = NPC序列化器
    
    def retrieve(self, request, *args, **kwargs):
        """获取单个NPC详情"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            "状态": "成功",
            "数据": serializer.data,
            "消息": "获取NPC数据成功",
            "代码": status.HTTP_200_OK
        })
    
    def list(self, request, *args, **kwargs):
        """获取NPC列表"""
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "状态": "成功",
            "数据": serializer.data,
            "消息": "获取NPC列表成功",
            "代码": status.HTTP_200_OK
        })
    
    @action(detail=True, methods=['post'])
    def dialogue(self, request, pk=None):
        """获取NPC对话"""
        npc = self.get_object()
        serializer = 对话请求序列化器(data=request.data)
        
        if serializer.is_valid():
            # 这里应该调用AI服务生成对话，暂时返回模拟数据
            # 在实际实现中，应该调用apps.ai中的服务
            return Response({
                "状态": "成功",
                "数据": {
                    "对话内容": f"{npc.名称}说：你好，旅行者！有什么我能帮助你的吗？",
                    "对话选项": ["询问任务", "闲聊", "离开"]
                },
                "消息": "获取NPC对话成功",
                "代码": status.HTTP_200_OK
            })
        return Response({
            "状态": "错误",
            "数据": None,
            "消息": serializer.errors,
            "代码": status.HTTP_400_BAD_REQUEST
        }, status=status.HTTP_400_BAD_REQUEST)

class 物品视图集(viewsets.ReadOnlyModelViewSet):
    """物品视图集，只提供读取功能"""
    queryset = 物品.objects.all()
    serializer_class = 物品序列化器
    
    def retrieve(self, request, *args, **kwargs):
        """获取单个物品详情"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            "状态": "成功",
            "数据": serializer.data,
            "消息": "获取物品数据成功",
            "代码": status.HTTP_200_OK
        })
    
    def list(self, request, *args, **kwargs):
        """获取物品列表"""
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "状态": "成功",
            "数据": serializer.data,
            "消息": "获取物品列表成功",
            "代码": status.HTTP_200_OK
        })

class 任务视图集(viewsets.ModelViewSet):
    """任务视图集"""
    queryset = 任务.objects.all()
    serializer_class = 任务序列化器
    
    def retrieve(self, request, *args, **kwargs):
        """获取单个任务详情"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            "状态": "成功",
            "数据": serializer.data,
            "消息": "获取任务数据成功",
            "代码": status.HTTP_200_OK
        })
    
    def list(self, request, *args, **kwargs):
        """获取任务列表"""
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "状态": "成功",
            "数据": serializer.data,
            "消息": "获取任务列表成功",
            "代码": status.HTTP_200_OK
        })
    
    def update(self, request, *args, **kwargs):
        """更新任务状态"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                "状态": "成功",
                "数据": serializer.data,
                "消息": "更新任务状态成功",
                "代码": status.HTTP_200_OK
            })
        return Response({
            "状态": "错误",
            "数据": None,
            "消息": serializer.errors,
            "代码": status.HTTP_400_BAD_REQUEST
        }, status=status.HTTP_400_BAD_REQUEST)

class 存档视图集(viewsets.ModelViewSet):
    """存档视图集"""
    serializer_class = 存档序列化器
    
    def get_queryset(self):
        """只返回当前用户的存档"""
        return 存档.objects.filter(用户=self.request.user)
    
    def create(self, request, *args, **kwargs):
        """创建新存档"""
        serializer = self.get_serializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({
                "状态": "成功",
                "数据": serializer.data,
                "消息": "创建存档成功",
                "代码": status.HTTP_201_CREATED
            }, status=status.HTTP_201_CREATED)
        return Response({
            "状态": "错误",
            "数据": None,
            "消息": serializer.errors,
            "代码": status.HTTP_400_BAD_REQUEST
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def retrieve(self, request, *args, **kwargs):
        """获取单个存档详情"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            "状态": "成功",
            "数据": serializer.data,
            "消息": "获取存档数据成功",
            "代码": status.HTTP_200_OK
        })
    
    def list(self, request, *args, **kwargs):
        """获取存档列表"""
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "状态": "成功",
            "数据": serializer.data,
            "消息": "获取存档列表成功",
            "代码": status.HTTP_200_OK
        })
    
    def update(self, request, *args, **kwargs):
        """更新存档"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                "状态": "成功",
                "数据": serializer.data,
                "消息": "更新存档成功",
                "代码": status.HTTP_200_OK
            })
        return Response({
            "状态": "错误",
            "数据": None,
            "消息": serializer.errors,
            "代码": status.HTTP_400_BAD_REQUEST
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        """删除存档"""
        instance = self.get_object()
        instance.delete()
        return Response({
            "状态": "成功",
            "数据": None,
            "消息": "删除存档成功",
            "代码": status.HTTP_204_NO_CONTENT
        }, status=status.HTTP_204_NO_CONTENT)
