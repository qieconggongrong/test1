"""
自定义异常处理模块
"""

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    """
    自定义异常处理函数
    
    参数:
        exc: 异常对象
        context: 异常上下文
        
    返回:
        Response对象，包含统一格式的错误响应
    """
    # 首先调用REST framework默认的异常处理
    response = exception_handler(exc, context)
    
    # 如果异常未被REST framework处理，则自定义处理
    if response is None:
        return Response({
            "状态": "错误",
            "数据": None,
            "消息": f"服务器内部错误: {str(exc)}",
            "代码": status.HTTP_500_INTERNAL_SERVER_ERROR
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # 自定义REST framework处理的异常响应格式
    error_data = {
        "状态": "错误",
        "数据": None,
        "消息": str(exc),
        "代码": response.status_code
    }
    
    # 如果响应中已有数据，则保留
    if hasattr(response, 'data') and isinstance(response.data, dict):
        if 'detail' in response.data:
            error_data['消息'] = response.data['detail']
        elif '消息' in response.data:
            error_data['消息'] = response.data['消息']
    
    response.data = error_data
    return response
