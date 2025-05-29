"""
AI应用的序列化器
"""

from rest_framework import serializers
from .models import AI生成内容

class AI生成内容序列化器(serializers.ModelSerializer):
    """AI生成内容序列化器"""
    class Meta:
        model = AI生成内容
        fields = '__all__'
        read_only_fields = ['创建时间', '更新时间']

class 任务生成请求序列化器(serializers.Serializer):
    """任务生成请求序列化器"""
    上下文 = serializers.CharField(required=True)
    难度 = serializers.ChoiceField(choices=['简单', '中等', '困难'], required=True)
    类型 = serializers.ChoiceField(choices=['主线', '支线', '日常'], required=True)

class 对话生成请求序列化器(serializers.Serializer):
    """对话生成请求序列化器"""
    NPC信息 = serializers.JSONField(required=True)
    对话历史 = serializers.ListField(child=serializers.JSONField(), required=False)
    当前情境 = serializers.CharField(required=True)

class 描述生成请求序列化器(serializers.Serializer):
    """描述生成请求序列化器"""
    信息 = serializers.JSONField(required=True)
    描述类型 = serializers.ChoiceField(choices=['物品', '地点', '人物'], required=True)
