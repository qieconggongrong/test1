"""
认证应用的视图
"""

from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import 用户注册序列化器, 用户信息序列化器

用户模型 = get_user_model()

class 用户注册视图(APIView):
    """用户注册视图"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        """处理POST请求，用户注册"""
        serializer = 用户注册序列化器(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                "状态": "成功",
                "数据": {
                    "token": str(refresh.access_token),
                    "refresh": str(refresh),
                    "用户": 用户信息序列化器(user).data
                },
                "消息": "注册成功",
                "代码": status.HTTP_201_CREATED
            }, status=status.HTTP_201_CREATED)
        return Response({
            "状态": "错误",
            "数据": None,
            "消息": serializer.errors,
            "代码": status.HTTP_400_BAD_REQUEST
        }, status=status.HTTP_400_BAD_REQUEST)

class 用户登录视图(APIView):
    """用户登录视图"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        """处理POST请求，用户登录"""
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response({
                "状态": "错误",
                "数据": None,
                "消息": "请提供用户名和密码",
                "代码": status.HTTP_400_BAD_REQUEST
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = 用户模型.objects.get(username=username)
        except 用户模型.DoesNotExist:
            return Response({
                "状态": "错误",
                "数据": None,
                "消息": "用户不存在",
                "代码": status.HTTP_404_NOT_FOUND
            }, status=status.HTTP_404_NOT_FOUND)
        
        if not user.check_password(password):
            return Response({
                "状态": "错误",
                "数据": None,
                "消息": "密码错误",
                "代码": status.HTTP_400_BAD_REQUEST
            }, status=status.HTTP_400_BAD_REQUEST)
        
        refresh = RefreshToken.for_user(user)
        
        # 更新最后登录IP
        if 'REMOTE_ADDR' in request.META:
            user.上次登录IP = request.META['REMOTE_ADDR']
            user.save(update_fields=['上次登录IP', 'last_login'])
        
        return Response({
            "状态": "成功",
            "数据": {
                "token": str(refresh.access_token),
                "refresh": str(refresh),
                "用户": 用户信息序列化器(user).data
            },
            "消息": "登录成功",
            "代码": status.HTTP_200_OK
        })

class 用户注销视图(APIView):
    """用户注销视图"""
    
    def post(self, request):
        """处理POST请求，用户注销"""
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response({
                    "状态": "错误",
                    "数据": None,
                    "消息": "请提供刷新令牌",
                    "代码": status.HTTP_400_BAD_REQUEST
                }, status=status.HTTP_400_BAD_REQUEST)
            
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            return Response({
                "状态": "成功",
                "数据": None,
                "消息": "注销成功",
                "代码": status.HTTP_200_OK
            })
        except Exception as e:
            return Response({
                "状态": "错误",
                "数据": None,
                "消息": f"注销失败: {str(e)}",
                "代码": status.HTTP_400_BAD_REQUEST
            }, status=status.HTTP_400_BAD_REQUEST)

class 用户信息视图(APIView):
    """用户信息视图"""
    
    def get(self, request):
        """处理GET请求，获取当前用户信息"""
        serializer = 用户信息序列化器(request.user)
        return Response({
            "状态": "成功",
            "数据": serializer.data,
            "消息": "获取用户信息成功",
            "代码": status.HTTP_200_OK
        })
    
    def put(self, request):
        """处理PUT请求，更新用户信息"""
        serializer = 用户信息序列化器(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "状态": "成功",
                "数据": serializer.data,
                "消息": "更新用户信息成功",
                "代码": status.HTTP_200_OK
            })
        return Response({
            "状态": "错误",
            "数据": None,
            "消息": serializer.errors,
            "代码": status.HTTP_400_BAD_REQUEST
        }, status=status.HTTP_400_BAD_REQUEST)
