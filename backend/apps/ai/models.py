"""
AI应用的模型定义
"""

from django.db import models

class AI生成内容(models.Model):
    """AI生成内容模型"""
    类型 = models.CharField(max_length=50, verbose_name='类型')  # 任务/对话/描述
    原始Prompt = models.TextField(verbose_name='原始Prompt')
    生成文本 = models.TextField(verbose_name='生成文本')
    相关上下文 = models.JSONField(blank=True, null=True, verbose_name='相关上下文')
    创建时间 = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    更新时间 = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        verbose_name = 'AI生成内容'
        verbose_name_plural = 'AI生成内容'
        db_table = 'ai_generated_content'

    def __str__(self):
        return f"{self.类型} - {self.创建时间}"
