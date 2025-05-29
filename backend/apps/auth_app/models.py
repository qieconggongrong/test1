"""
认证应用的模型定义
"""

from django.db import models
from django.contrib.auth.models import AbstractUser

class 用户(AbstractUser):
    """
    自定义用户模型，扩展Django内置的用户模型
    """
    # 用户头像
    头像 = models.CharField(max_length=255, blank=True, null=True, verbose_name='头像')
    # 用户简介
    简介 = models.TextField(blank=True, null=True, verbose_name='简介')
    # 上次登录IP
    上次登录IP = models.GenericIPAddressField(blank=True, null=True, verbose_name='上次登录IP')
    # 创建时间和更新时间
    创建时间 = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    更新时间 = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        verbose_name = '用户'
        verbose_name_plural = '用户'
        db_table = 'auth_user'

    def __str__(self):
        return self.username
