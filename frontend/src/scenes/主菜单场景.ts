/**
 * 主菜单场景类
 * 负责显示游戏主菜单，包括开始游戏、加载存档、设置和退出选项
 */
import Phaser from 'phaser';
import { 存档服务 } from '../services/api服务';

export class 主菜单场景 extends Phaser.Scene {
  private 背景!: Phaser.GameObjects.Image;
  private 标题!: Phaser.GameObjects.Text;
  private 按钮组: Phaser.GameObjects.Container[] = [];
  private 存档列表: any[] = [];
  private 存档选择容器!: Phaser.GameObjects.Container;
  private 是否显示存档列表: boolean = false;
  
  constructor() {
    super('主菜单场景');
  }
  
  create(): void {
    // 设置背景
    this.cameras.main.setBackgroundColor('#2c3e50');
    
    // 创建标题
    this.标题 = this.add.text(
      this.cameras.main.width / 2,
      100,
      'AI驱动的动态叙事像素RPG',
      {
        fontSize: '36px',
        color: '#ecf0f1',
        fontStyle: 'bold'
      }
    );
    this.标题.setOrigin(0.5);
    
    // 创建菜单按钮
    this.创建菜单按钮();
    
    // 创建存档选择容器（初始隐藏）
    this.存档选择容器 = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2);
    this.存档选择容器.setVisible(false);
    
    // 播放背景音乐
    if (!this.sound.get('背景音乐')) {
      this.sound.add('背景音乐', { loop: true, volume: 0.5 });
    }
    if (!this.sound.get('背景音乐').isPlaying) {
      this.sound.play('背景音乐');
    }
  }
  
  /**
   * 创建菜单按钮
   */
  private 创建菜单按钮(): void {
    const 按钮数据 = [
      { 文本: '开始新游戏', 回调: () => this.开始新游戏() },
      { 文本: '加载存档', 回调: () => this.加载存档列表() },
      { 文本: '设置', 回调: () => this.打开设置() },
      { 文本: '退出', 回调: () => this.退出游戏() }
    ];
    
    const 按钮间距 = 70;
    const 起始Y = this.cameras.main.height / 2;
    
    按钮数据.forEach((按钮, 索引) => {
      const 容器 = this.add.container(
        this.cameras.main.width / 2,
        起始Y + 索引 * 按钮间距
      );
      
      // 创建按钮背景
      const 背景 = this.add.rectangle(0, 0, 200, 50, 0x3498db, 0.8);
      背景.setStrokeStyle(2, 0x2980b9);
      
      // 创建按钮文本
      const 文本 = this.add.text(0, 0, 按钮.文本, {
        fontSize: '24px',
        color: '#ffffff'
      });
      文本.setOrigin(0.5);
      
      // 添加到容器
      容器.add([背景, 文本]);
      
      // 设置交互
      背景.setInteractive({ useHandCursor: true })
        .on('pointerover', () => {
          背景.fillColor = 0x2980b9;
          文本.setScale(1.1);
        })
        .on('pointerout', () => {
          背景.fillColor = 0x3498db;
          文本.setScale(1);
        })
        .on('pointerdown', () => {
          this.sound.play('点击音效');
          按钮.回调();
        });
      
      this.按钮组.push(容器);
    });
  }
  
  /**
   * 开始新游戏
   */
  private 开始新游戏(): void {
    // 创建角色名称输入对话框
    this.创建角色名称输入框();
  }
  
  /**
   * 创建角色名称输入框
   */
  private 创建角色名称输入框(): void {
    // 隐藏主菜单按钮
    this.按钮组.forEach(按钮 => 按钮.setVisible(false));
    
    // 创建对话框背景
    const 对话框 = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      400,
      250,
      0xffffff,
      0.9
    );
    对话框.setStrokeStyle(2, 0x000000);
    
    // 创建标题
    const 标题 = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 80,
      '创建新角色',
      {
        fontSize: '24px',
        color: '#2c3e50'
      }
    );
    标题.setOrigin(0.5);
    
    // 创建输入框
    const 输入框元素 = document.createElement('input');
    输入框元素.type = 'text';
    输入框元素.placeholder = '请输入角色名称';
    输入框元素.style.position = 'absolute';
    输入框元素.style.left = '50%';
    输入框元素.style.top = '50%';
    输入框元素.style.transform = 'translate(-50%, -50%)';
    输入框元素.style.padding = '10px';
    输入框元素.style.width = '300px';
    输入框元素.style.fontSize = '16px';
    输入框元素.style.borderRadius = '5px';
    输入框元素.style.border = '1px solid #bdc3c7';
    document.body.appendChild(输入框元素);
    输入框元素.focus();
    
    // 创建确认按钮
    const 确认按钮 = this.add.rectangle(
      this.cameras.main.width / 2 - 80,
      this.cameras.main.height / 2 + 60,
      120,
      40,
      0x2ecc71,
      1
    );
    确认按钮.setStrokeStyle(2, 0x27ae60);
    确认按钮.setInteractive({ useHandCursor: true });
    
    const 确认文本 = this.add.text(
      this.cameras.main.width / 2 - 80,
      this.cameras.main.height / 2 + 60,
      '确认',
      {
        fontSize: '18px',
        color: '#ffffff'
      }
    );
    确认文本.setOrigin(0.5);
    
    // 创建取消按钮
    const 取消按钮 = this.add.rectangle(
      this.cameras.main.width / 2 + 80,
      this.cameras.main.height / 2 + 60,
      120,
      40,
      0xe74c3c,
      1
    );
    取消按钮.setStrokeStyle(2, 0xc0392b);
    取消按钮.setInteractive({ useHandCursor: true });
    
    const 取消文本 = this.add.text(
      this.cameras.main.width / 2 + 80,
      this.cameras.main.height / 2 + 60,
      '取消',
      {
        fontSize: '18px',
        color: '#ffffff'
      }
    );
    取消文本.setOrigin(0.5);
    
    // 添加按钮事件
    确认按钮.on('pointerdown', async () => {
      const 角色名称 = 输入框元素.value.trim();
      if (角色名称) {
        // 移除DOM元素
        输入框元素.remove();
        
        // 创建新存档
        try {
          // 创建初始角色数据
          const 角色数据 = {
            名称: 角色名称,
            等级: 1,
            经验: 0,
            生命值: 100,
            最大生命值: 100,
            魔法值: 50,
            最大魔法值: 50,
            力量: 10,
            敏捷: 10,
            智力: 10,
            位置: { x: 0, y: 0, 地图ID: 1 },
            背包: [],
            装备: {},
            技能: []
          };
          
          await 存档服务.创建存档(角色名称, 角色数据);
          
          // 开始游戏
          this.scene.start('游戏场景');
        } catch (错误) {
          console.error('创建存档失败:', 错误);
          // 显示错误信息
          this.显示错误消息('创建存档失败，请稍后再试');
          
          // 恢复主菜单
          this.按钮组.forEach(按钮 => 按钮.setVisible(true));
        }
      } else {
        // 显示错误提示
        this.显示错误消息('请输入角色名称');
      }
      
      // 销毁对话框元素
      对话框.destroy();
      标题.destroy();
      确认按钮.destroy();
      确认文本.destroy();
      取消按钮.destroy();
      取消文本.destroy();
    });
    
    取消按钮.on('pointerdown', () => {
      // 移除DOM元素
      输入框元素.remove();
      
      // 销毁对话框元素
      对话框.destroy();
      标题.destroy();
      确认按钮.destroy();
      确认文本.destroy();
      取消按钮.destroy();
      取消文本.destroy();
      
      // 恢复主菜单
      this.按钮组.forEach(按钮 => 按钮.setVisible(true));
    });
  }
  
  /**
   * 加载存档列表
   */
  private async 加载存档列表(): Promise<void> {
    try {
      // 隐藏主菜单按钮
      this.按钮组.forEach(按钮 => 按钮.setVisible(false));
      
      // 显示加载中
      const 加载文本 = this.add.text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        '加载存档中...',
        {
          fontSize: '24px',
          color: '#ffffff'
        }
      );
      加载文本.setOrigin(0.5);
      
      // 获取存档列表
      const 响应 = await 存档服务.获取存档列表();
      this.存档列表 = 响应.数据;
      
      // 移除加载文本
      加载文本.destroy();
      
      // 显示存档列表
      this.显示存档列表();
    } catch (错误) {
      console.error('加载存档列表失败:', 错误);
      
      // 显示错误信息
      this.显示错误消息('加载存档列表失败，请稍后再试');
      
      // 恢复主菜单
      this.按钮组.forEach(按钮 => 按钮.setVisible(true));
    }
  }
  
  /**
   * 显示存档列表
   */
  private 显示存档列表(): void {
    // 清空存档选择容器
    this.存档选择容器.removeAll(true);
    
    // 创建存档列表背景
    const 背景 = this.add.rectangle(0, 0, 500, 400, 0xffffff, 0.9);
    背景.setStrokeStyle(2, 0x000000);
    this.存档选择容器.add(背景);
    
    // 创建标题
    const 标题 = this.add.text(0, -160, '选择存档', {
      fontSize: '28px',
      color: '#2c3e50'
    });
    标题.setOrigin(0.5);
    this.存档选择容器.add(标题);
    
    // 如果没有存档
    if (this.存档列表.length === 0) {
      const 无存档文本 = this.add.text(0, 0, '没有找到存档', {
        fontSize: '20px',
        color: '#7f8c8d'
      });
      无存档文本.setOrigin(0.5);
      this.存档选择容器.add(无存档文本);
    } else {
      // 显示存档列表
      const 起始Y = -100;
      const 间距 = 60;
      
      this.存档列表.forEach((存档, 索引) => {
        // 创建存档项背景
        const 存档背景 = this.add.rectangle(
          0,
          起始Y + 索引 * 间距,
          450,
          50,
          0xecf0f1,
          1
        );
        存档背景.setStrokeStyle(1, 0xbdc3c7);
        存档背景.setInteractive({ useHandCursor: true });
        
        // 创建存档名称文本
        const 存档名称 = this.add.text(
          -200,
          起始Y + 索引 * 间距,
          存档.存档名称,
          {
            fontSize: '18px',
            color: '#2c3e50'
          }
        );
        存档名称.setOrigin(0, 0.5);
        
        // 创建存档信息文本
        const 角色数据 = 存档.角色数据;
        const 存档信息 = this.add.text(
          -200,
          起始Y + 索引 * 间距 + 20,
          `等级: ${角色数据.等级} | 创建: ${new Date(存档.创建时间).toLocaleString()}`,
          {
            fontSize: '14px',
            color: '#7f8c8d'
          }
        );
        存档信息.setOrigin(0, 0.5);
        
        // 创建加载按钮
        const 加载按钮 = this.add.rectangle(
          170,
          起始Y + 索引 * 间距,
          80,
          30,
          0x3498db,
          1
        );
        加载按钮.setStrokeStyle(1, 0x2980b9);
        加载按钮.setInteractive({ useHandCursor: true });
        
        const 加载文本 = this.add.text(
          170,
          起始Y + 索引 * 间距,
          '加载',
          {
            fontSize: '14px',
            color: '#ffffff'
          }
        );
        加载文本.setOrigin(0.5);
        
        // 创建删除按钮
        const 删除按钮 = this.add.rectangle(
          170 + 90,
          起始Y + 索引 * 间距,
          80,
          30,
          0xe74c3c,
          1
        );
        删除按钮.setStrokeStyle(1, 0xc0392b);
        删除按钮.setInteractive({ useHandCursor: true });
        
        const 删除文本 = this.add.text(
          170 + 90,
          起始Y + 索引 * 间距,
          '删除',
          {
            fontSize: '14px',
            color: '#ffffff'
          }
        );
        删除文本.setOrigin(0.5);
        
        // 添加事件
        加载按钮.on('pointerdown', async () => {
          try {
            // 加载存档
            await 存档服务.获取存档(存档.id);
            
            // 开始游戏
            this.scene.start('游戏场景');
          } catch (错误) {
            console.error('加载存档失败:', 错误);
            this.显示错误消息('加载存档失败，请稍后再试');
          }
        });
        
        删除按钮.on('pointerdown', () => {
          // 显示确认对话框
          this.显示删除确认对话框(存档.id);
        });
        
        // 添加到容器
        this.存档选择容器.add([存档背景, 存档名称, 存档信息, 加载按钮, 加载文本, 删除按钮, 删除文本]);
      });
    }
    
    // 创建返回按钮
    const 返回按钮 = this.add.rectangle(0, 160, 120, 40, 0x95a5a6, 1);
    返回按钮.setStrokeStyle(2, 0x7f8c8d);
    返回按钮.setInteractive({ useHandCursor: true });
    
    const 返回文本 = this.add.text(0, 160, '返回', {
      fontSize: '18px',
      color: '#ffffff'
    });
    返回文本.setOrigin(0.5);
    
    返回按钮.on('pointerdown', () => {
      // 隐藏存档列表
      this.存档选择容器.setVisible(false);
      
      // 显示主菜单
      this.按钮组.forEach(按钮 => 按钮.setVisible(true));
    });
    
    this.存档选择容器.add([返回按钮, 返回文本]);
    
    // 显示存档列表
    this.存档选择容器.setVisible(true);
  }
  
  /**
   * 显示删除确认对话框
   * @param 存档ID - 要删除的存档ID
   */
  private 显示删除确认对话框(存档ID: number): void {
    // 创建确认对话框容器
    const 确认对话框 = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2);
    
    // 创建背景
    const 背景 = this.add.rectangle(0, 0, 400, 200, 0xffffff, 0.95);
    背景.setStrokeStyle(2, 0x000000);
    
    // 创建标题
    const 标题 = this.add.text(0, -60, '确认删除', {
      fontSize: '24px',
      color: '#e74c3c'
    });
    标题.setOrigin(0.5);
    
    // 创建提示文本
    const 提示文本 = this.add.text(0, -10, '确定要删除这个存档吗？\n此操作无法撤销。', {
      fontSize: '18px',
      color: '#2c3e50',
      align: 'center'
    });
    提示文本.setOrigin(0.5);
    
    // 创建确认按钮
    const 确认按钮 = this.add.rectangle(-80, 60, 120, 40, 0xe74c3c, 1);
    确认按钮.setStrokeStyle(2, 0xc0392b);
    确认按钮.setInteractive({ useHandCursor: true });
    
    const 确认文本 = this.add.text(-80, 60, '确认删除', {
      fontSize: '16px',
      color: '#ffffff'
    });
    确认文本.setOrigin(0.5);
    
    // 创建取消按钮
    const 取消按钮 = this.add.rectangle(80, 60, 120, 40, 0x95a5a6, 1);
    取消按钮.setStrokeStyle(2, 0x7f8c8d);
    取消按钮.setInteractive({ useHandCursor: true });
    
    const 取消文本 = this.add.text(80, 60, '取消', {
      fontSize: '16px',
      color: '#ffffff'
    });
    取消文本.setOrigin(0.5);
    
    // 添加事件
    确认按钮.on('pointerdown', async () => {
      try {
        // 删除存档
        await 存档服务.删除存档(存档ID);
        
        // 重新加载存档列表
        const 响应 = await 存档服务.获取存档列表();
        this.存档列表 = 响应.数据;
        
        // 更新存档列表显示
        this.显示存档列表();
        
        // 销毁确认对话框
        确认对话框.destroy();
      } catch (错误) {
        console.error('删除存档失败:', 错误);
        this.显示错误消息('删除存档失败，请稍后再试');
        
        // 销毁确认对话框
        确认对话框.destroy();
      }
    });
    
    取消按钮.on('pointerdown', () => {
      // 销毁确认对话框
      确认对话框.destroy();
    });
    
    // 添加到容器
    确认对话框.add([背景, 标题, 提示文本, 确认按钮, 确认文本, 取消按钮, 取消文本]);
  }
  
  /**
   * 打开设置
   */
  private 打开设置(): void {
    // 隐藏主菜单按钮
    this.按钮组.forEach(按钮 => 按钮.setVisible(false));
    
    // 创建设置面板
    const 设置容器 = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2);
    
    // 创建背景
    const 背景 = this.add.rectangle(0, 0, 500, 400, 0xffffff, 0.9);
    背景.setStrokeStyle(2, 0x000000);
    
    // 创建标题
    const 标题 = this.add.text(0, -160, '游戏设置', {
      fontSize: '28px',
      color: '#2c3e50'
    });
    标题.setOrigin(0.5);
    
    // 创建音量设置
    const 音量标签 = this.add.text(-200, -80, '音乐音量:', {
      fontSize: '20px',
      color: '#2c3e50'
    });
    音量标签.setOrigin(0, 0.5);
    
    // 创建音量滑块背景
    const 滑块背景 = this.add.rectangle(50, -80, 300, 10, 0xbdc3c7, 1);
    
    // 获取当前音量
    const 当前音量 = this.sound.get('背景音乐').volume;
    
    // 创建音量滑块
    const 滑块 = this.add.rectangle(
      -100 + 当前音量 * 300,
      -80,
      20,
      20,
      0x3498db,
      1
    );
    滑块.setInteractive({ draggable: true, useHandCursor: true });
    
    // 创建音量值文本
    const 音量值 = this.add.text(200, -80, `${Math.round(当前音量 * 100)}%`, {
      fontSize: '18px',
      color: '#2c3e50'
    });
    音量值.setOrigin(0, 0.5);
    
    // 设置滑块拖动事件
    this.input.setDraggable(滑块);
    this.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Rectangle, dragX: number) => {
      if (gameObject === 滑块) {
        // 限制滑块在滑轨范围内
        const 最小X = -100;
        const 最大X = 200;
        let 新X = Phaser.Math.Clamp(dragX, 最小X, 最大X);
        
        // 更新滑块位置
        gameObject.x = 新X;
        
        // 计算音量值 (0-1)
        const 音量 = (新X - 最小X) / (最大X - 最小X);
        
        // 更新音量值文本
        音量值.setText(`${Math.round(音量 * 100)}%`);
        
        // 设置音乐音量
        this.sound.get('背景音乐').setVolume(音量);
      }
    });
    
    // 创建音效设置
    const 音效标签 = this.add.text(-200, -20, '音效音量:', {
      fontSize: '20px',
      color: '#2c3e50'
    });
    音效标签.setOrigin(0, 0.5);
    
    // 创建音效滑块背景
    const 音效滑块背景 = this.add.rectangle(50, -20, 300, 10, 0xbdc3c7, 1);
    
    // 创建音效滑块
    const 音效滑块 = this.add.rectangle(50, -20, 20, 20, 0x3498db, 1);
    音效滑块.setInteractive({ draggable: true, useHandCursor: true });
    
    // 创建音效值文本
    const 音效值 = this.add.text(200, -20, '50%', {
      fontSize: '18px',
      color: '#2c3e50'
    });
    音效值.setOrigin(0, 0.5);
    
    // 创建全屏切换
    const 全屏标签 = this.add.text(-200, 40, '全屏模式:', {
      fontSize: '20px',
      color: '#2c3e50'
    });
    全屏标签.setOrigin(0, 0.5);
    
    // 创建全屏切换按钮
    const 全屏按钮 = this.add.rectangle(0, 40, 100, 40, 0x3498db, 1);
    全屏按钮.setStrokeStyle(2, 0x2980b9);
    全屏按钮.setInteractive({ useHandCursor: true });
    
    const 全屏文本 = this.add.text(0, 40, '开启全屏', {
      fontSize: '16px',
      color: '#ffffff'
    });
    全屏文本.setOrigin(0.5);
    
    全屏按钮.on('pointerdown', () => {
      if (!this.scale.isFullscreen) {
        this.scale.startFullscreen();
        全屏文本.setText('退出全屏');
      } else {
        this.scale.stopFullscreen();
        全屏文本.setText('开启全屏');
      }
    });
    
    // 创建返回按钮
    const 返回按钮 = this.add.rectangle(0, 120, 120, 40, 0x95a5a6, 1);
    返回按钮.setStrokeStyle(2, 0x7f8c8d);
    返回按钮.setInteractive({ useHandCursor: true });
    
    const 返回文本 = this.add.text(0, 120, '返回', {
      fontSize: '18px',
      color: '#ffffff'
    });
    返回文本.setOrigin(0.5);
    
    返回按钮.on('pointerdown', () => {
      // 销毁设置面板
      设置容器.destroy();
      
      // 显示主菜单
      this.按钮组.forEach(按钮 => 按钮.setVisible(true));
    });
    
    // 添加到容器
    设置容器.add([
      背景, 标题, 
      音量标签, 滑块背景, 滑块, 音量值,
      音效标签, 音效滑块背景, 音效滑块, 音效值,
      全屏标签, 全屏按钮, 全屏文本,
      返回按钮, 返回文本
    ]);
  }
  
  /**
   * 退出游戏
   */
  private async 退出游戏(): Promise<void> {
    try {
      // 注销用户
      await 用户服务.注销();
      
      // 停止音乐
      this.sound.stopAll();
      
      // 返回登录场景
      this.scene.start('登录场景');
    } catch (错误) {
      console.error('注销失败:', 错误);
      
      // 显示错误信息
      this.显示错误消息('注销失败，请稍后再试');
    }
  }
  
  /**
   * 显示错误消息
   * @param 消息 - 错误消息
   */
  private 显示错误消息(消息: string): void {
    const 错误文本 = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height - 50,
      消息,
      {
        fontSize: '18px',
        color: '#e74c3c',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: { x: 10, y: 5 }
      }
    );
    错误文本.setOrigin(0.5);
    
    // 3秒后自动消失
    this.time.delayedCall(3000, () => {
      错误文本.destroy();
    });
  }
}
