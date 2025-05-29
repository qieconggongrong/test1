"""
游戏应用的模型定义
"""

from django.db import models
from django.contrib.auth import get_user_model

用户模型 = get_user_model()

class 地图(models.Model):
    """地图模型"""
    名称 = models.CharField(max_length=100, verbose_name='名称')
    描述 = models.TextField(blank=True, null=True, verbose_name='描述')
    瓦片数据 = models.JSONField(verbose_name='瓦片数据')
    碰撞区域 = models.JSONField(verbose_name='碰撞区域')
    NPC分布 = models.JSONField(verbose_name='NPC分布')
    物品分布 = models.JSONField(verbose_name='物品分布')
    传送点 = models.JSONField(verbose_name='传送点')
    创建时间 = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    更新时间 = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        verbose_name = '地图'
        verbose_name_plural = '地图'
        db_table = 'game_map'

    def __str__(self):
        return self.名称

class NPC(models.Model):
    """NPC模型"""
    名称 = models.CharField(max_length=100, verbose_name='名称')
    角色设定 = models.TextField(verbose_name='角色设定')
    初始位置 = models.JSONField(verbose_name='初始位置')
    对话ID列表 = models.JSONField(verbose_name='对话ID列表')
    创建时间 = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    更新时间 = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        verbose_name = 'NPC'
        verbose_name_plural = 'NPC'
        db_table = 'game_npc'

    def __str__(self):
        return self.名称

class 物品(models.Model):
    """物品模型"""
    名称 = models.CharField(max_length=100, verbose_name='名称')
    类型 = models.CharField(max_length=50, verbose_name='类型')  # 任务道具/消耗品/装备
    描述 = models.TextField(blank=True, null=True, verbose_name='描述')
    效果 = models.JSONField(blank=True, null=True, verbose_name='效果')
    图标 = models.CharField(max_length=255, verbose_name='图标')
    创建时间 = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    更新时间 = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        verbose_name = '物品'
        verbose_name_plural = '物品'
        db_table = 'game_item'

    def __str__(self):
        return self.名称

class 任务(models.Model):
    """任务模型"""
    名称 = models.CharField(max_length=100, verbose_name='名称')
    描述 = models.TextField(verbose_name='描述')
    目标 = models.JSONField(verbose_name='目标')
    完成条件 = models.JSONField(verbose_name='完成条件')
    奖励 = models.JSONField(verbose_name='奖励')
    前置任务ID = models.IntegerField(blank=True, null=True, verbose_name='前置任务ID')
    触发条件 = models.JSONField(verbose_name='触发条件')
    是否AI生成 = models.BooleanField(default=False, verbose_name='是否AI生成')
    创建时间 = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    更新时间 = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        verbose_name = '任务'
        verbose_name_plural = '任务'
        db_table = 'game_quest'

    def __str__(self):
        return self.名称

class 存档(models.Model):
    """存档模型"""
    用户 = models.ForeignKey(用户模型, on_delete=models.CASCADE, related_name='存档', verbose_name='用户')
    存档名称 = models.CharField(max_length=100, verbose_name='存档名称')
    角色数据 = models.JSONField(verbose_name='角色数据')
    游戏状态 = models.JSONField(verbose_name='游戏状态')
    创建时间 = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    更新时间 = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        verbose_name = '存档'
        verbose_name_plural = '存档'
        db_table = 'game_save'
        unique_together = ['用户', '存档名称']

    def __str__(self):
        return f"{self.用户.username}的存档: {self.存档名称}"

class 对话(models.Model):
    """对话模型"""
    NPC = models.ForeignKey(NPC, on_delete=models.CASCADE, related_name='对话', verbose_name='NPC')
    对话节点 = models.JSONField(verbose_name='对话节点')
    是否AI生成 = models.BooleanField(default=False, verbose_name='是否AI生成')
    创建时间 = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    更新时间 = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        verbose_name = '对话'
        verbose_name_plural = '对话'
        db_table = 'game_dialogue'

    def __str__(self):
        return f"{self.NPC.名称}的对话"
