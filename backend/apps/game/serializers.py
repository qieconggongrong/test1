"""
游戏应用的序列化器
"""

from rest_framework import serializers
from .models import 地图, NPC, 物品, 任务, 存档, 对话

class 地图序列化器(serializers.ModelSerializer):
    """地图序列化器"""
    class Meta:
        model = 地图
        fields = '__all__'

class NPC序列化器(serializers.ModelSerializer):
    """NPC序列化器"""
    class Meta:
        model = NPC
        fields = '__all__'

class 物品序列化器(serializers.ModelSerializer):
    """物品序列化器"""
    class Meta:
        model = 物品
        fields = '__all__'

class 任务序列化器(serializers.ModelSerializer):
    """任务序列化器"""
    class Meta:
        model = 任务
        fields = '__all__'

class 存档序列化器(serializers.ModelSerializer):
    """存档序列化器"""
    class Meta:
        model = 存档
        fields = '__all__'
        read_only_fields = ['用户', '创建时间', '更新时间']
    
    def create(self, validated_data):
        """创建存档时自动关联当前用户"""
        validated_data['用户'] = self.context['request'].user
        return super().create(validated_data)

class 对话序列化器(serializers.ModelSerializer):
    """对话序列化器"""
    class Meta:
        model = 对话
        fields = '__all__'

class 对话请求序列化器(serializers.Serializer):
    """NPC对话请求序列化器"""
    玩家输入 = serializers.CharField(required=False, allow_blank=True)
    对话历史 = serializers.ListField(
        child=serializers.DictField(),
        required=False
    )
