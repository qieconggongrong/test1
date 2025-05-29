"""
认证应用的序列化器
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

用户模型 = get_user_model()

class 用户注册序列化器(serializers.ModelSerializer):
    """用户注册序列化器"""
    # 确认密码字段，仅用于验证
    确认密码 = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = 用户模型
        fields = ['username', 'email', 'password', '确认密码']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }
    
    def validate(self, attrs):
        """验证密码是否匹配"""
        if attrs['password'] != attrs.pop('确认密码'):
            raise serializers.ValidationError({"确认密码": "两次输入的密码不匹配"})
        
        # 验证密码强度
        validate_password(attrs['password'])
        return attrs
    
    def create(self, validated_data):
        """创建用户"""
        user = 用户模型.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class 用户信息序列化器(serializers.ModelSerializer):
    """用户信息序列化器"""
    class Meta:
        model = 用户模型
        fields = ['id', 'username', 'email', '头像', '简介', 'date_joined', 'last_login']
        read_only_fields = ['id', 'date_joined', 'last_login']
