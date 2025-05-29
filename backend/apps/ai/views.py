"""
AI应用的视图
"""

import requests
import json
from rest_framework import status, views
from rest_framework.response import Response
from .models import AI生成内容
from .serializers import (
    AI生成内容序列化器, 任务生成请求序列化器, 
    对话生成请求序列化器, 描述生成请求序列化器
)
from django.conf import settings

class AI服务基础视图(views.APIView):
    """AI服务基础视图，提供与AI模型交互的基础功能"""
    
    def 调用AI模型(self, prompt, 最大长度=1000):
        """
        调用DeepSeek API生成内容
        
        参数:
            prompt: 提示词
            最大长度: 生成内容的最大长度
            
        返回:
            生成的文本内容
        """
        # 实际项目中应该使用环境变量中的API密钥和URL
        api_key = settings.DEEPSEEK_API_KEY
        api_url = settings.DEEPSEEK_API_URL
        
        # 如果没有配置API密钥，返回模拟数据
        if not api_key:
            # 模拟AI生成的内容
            return f"这是模拟的AI生成内容，基于提示：{prompt[:50]}..."
        
        # 实际调用AI API的代码
        try:
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}"
            }
            
            payload = {
                "model": "deepseek-chat",
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 最大长度
            }
            
            response = requests.post(
                f"{api_url}/v1/chat/completions", 
                headers=headers,
                data=json.dumps(payload)
            )
            
            if response.status_code == 200:
                result = response.json()
                return result["choices"][0]["message"]["content"]
            else:
                # 如果API调用失败，返回错误信息
                return f"AI服务调用失败: {response.status_code} - {response.text}"
                
        except Exception as e:
            # 捕获所有异常，返回错误信息
            return f"AI服务调用异常: {str(e)}"
    
    def 保存生成内容(self, 类型, 原始Prompt, 生成文本, 相关上下文=None):
        """
        保存AI生成的内容到数据库
        
        参数:
            类型: 内容类型（任务/对话/描述）
            原始Prompt: 原始提示词
            生成文本: 生成的内容
            相关上下文: 相关的上下文信息
            
        返回:
            保存的AI生成内容对象
        """
        ai_content = AI生成内容.objects.create(
            类型=类型,
            原始Prompt=原始Prompt,
            生成文本=生成文本,
            相关上下文=相关上下文
        )
        return ai_content

class 任务生成视图(AI服务基础视图):
    """任务生成视图"""
    
    def post(self, request):
        """处理POST请求，生成任务"""
        serializer = 任务生成请求序列化器(data=request.data)
        
        if serializer.is_valid():
            上下文 = serializer.validated_data['上下文']
            难度 = serializer.validated_data['难度']
            类型 = serializer.validated_data['类型']
            
            # 构建提示词
            prompt = f"""
            请根据以下信息生成一个像素RPG游戏的任务：
            
            游戏背景上下文：{上下文}
            任务难度：{难度}
            任务类型：{类型}
            
            请生成任务的名称、详细描述、目标、完成条件和奖励。格式如下：
            
            任务名称：[名称]
            任务描述：[详细描述]
            任务目标：[具体目标，可以是多个]
            完成条件：[完成任务需要满足的条件]
            奖励：[完成任务后获得的奖励]
            """
            
            # 调用AI模型生成内容
            生成内容 = self.调用AI模型(prompt)
            
            # 保存生成内容
            ai_content = self.保存生成内容(
                类型='任务',
                原始Prompt=prompt,
                生成文本=生成内容,
                相关上下文={
                    '上下文': 上下文,
                    '难度': 难度,
                    '类型': 类型
                }
            )
            
            return Response({
                "状态": "成功",
                "数据": {
                    "任务内容": 生成内容,
                    "生成ID": ai_content.id
                },
                "消息": "任务生成成功",
                "代码": status.HTTP_200_OK
            })
        
        return Response({
            "状态": "错误",
            "数据": None,
            "消息": serializer.errors,
            "代码": status.HTTP_400_BAD_REQUEST
        }, status=status.HTTP_400_BAD_REQUEST)

class 对话生成视图(AI服务基础视图):
    """对话生成视图"""
    
    def post(self, request):
        """处理POST请求，生成对话"""
        serializer = 对话生成请求序列化器(data=request.data)
        
        if serializer.is_valid():
            NPC信息 = serializer.validated_data['NPC信息']
            当前情境 = serializer.validated_data['当前情境']
            对话历史 = serializer.validated_data.get('对话历史', [])
            
            # 构建提示词
            prompt = f"""
            请根据以下信息生成一个像素RPG游戏中NPC的对话：
            
            NPC信息：{json.dumps(NPC信息, ensure_ascii=False)}
            当前情境：{当前情境}
            
            对话历史：
            {json.dumps(对话历史, ensure_ascii=False) if 对话历史 else "无"}
            
            请生成NPC的对话内容和可能的玩家回应选项。格式如下：
            
            NPC对话：[对话内容]
            对话选项：
            1. [选项1]
            2. [选项2]
            3. [选项3]
            """
            
            # 调用AI模型生成内容
            生成内容 = self.调用AI模型(prompt)
            
            # 保存生成内容
            ai_content = self.保存生成内容(
                类型='对话',
                原始Prompt=prompt,
                生成文本=生成内容,
                相关上下文={
                    'NPC信息': NPC信息,
                    '当前情境': 当前情境,
                    '对话历史': 对话历史
                }
            )
            
            return Response({
                "状态": "成功",
                "数据": {
                    "对话内容": 生成内容,
                    "生成ID": ai_content.id
                },
                "消息": "对话生成成功",
                "代码": status.HTTP_200_OK
            })
        
        return Response({
            "状态": "错误",
            "数据": None,
            "消息": serializer.errors,
            "代码": status.HTTP_400_BAD_REQUEST
        }, status=status.HTTP_400_BAD_REQUEST)

class 描述生成视图(AI服务基础视图):
    """描述生成视图"""
    
    def post(self, request):
        """处理POST请求，生成描述"""
        serializer = 描述生成请求序列化器(data=request.data)
        
        if serializer.is_valid():
            信息 = serializer.validated_data['信息']
            描述类型 = serializer.validated_data['描述类型']
            
            # 构建提示词
            prompt = f"""
            请根据以下信息生成一个像素RPG游戏中的{描述类型}描述：
            
            {描述类型}信息：{json.dumps(信息, ensure_ascii=False)}
            
            请生成详细、生动、有趣的描述文本。
            """
            
            # 调用AI模型生成内容
            生成内容 = self.调用AI模型(prompt)
            
            # 保存生成内容
            ai_content = self.保存生成内容(
                类型='描述',
                原始Prompt=prompt,
                生成文本=生成内容,
                相关上下文={
                    '信息': 信息,
                    '描述类型': 描述类型
                }
            )
            
            return Response({
                "状态": "成功",
                "数据": {
                    "描述文本": 生成内容,
                    "生成ID": ai_content.id
                },
                "消息": "描述生成成功",
                "代码": status.HTTP_200_OK
            })
        
        return Response({
            "状态": "错误",
            "数据": None,
            "消息": serializer.errors,
            "代码": status.HTTP_400_BAD_REQUEST
        }, status=status.HTTP_400_BAD_REQUEST)
