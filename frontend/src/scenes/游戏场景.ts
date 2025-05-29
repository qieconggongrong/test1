/**
 * 游戏场景类
 * 负责主要游戏逻辑，包括地图渲染、角色移动、NPC交互等
 */
import Phaser from 'phaser';
import { 游戏配置 } from '../config/游戏配置';
import { 游戏服务, 存档服务 } from '../services/api服务';

export class 游戏场景 extends Phaser.Scene {
  // 地图相关
  private 地图!: Phaser.Tilemaps.Tilemap;
  private 地图图层: Record<string, Phaser.Tilemaps.TilemapLayer> = {};
  private 当前地图ID: number = 1;
  private 地图数据: any = null;
  
  // 角色相关
  private 玩家精灵!: Phaser.Physics.Arcade.Sprite;
  private 玩家数据: any = null;
  private 移动控制: {
    上: Phaser.Input.Keyboard.Key;
    下: Phaser.Input.Keyboard.Key;
    左: Phaser.Input.Keyboard.Key;
    右: Phaser.Input.Keyboard.Key;
    交互: Phaser.Input.Keyboard.Key;
    菜单: Phaser.Input.Keyboard.Key;
  } | null = null;
  
  // NPC相关
  private NPC列表: Phaser.Physics.Arcade.Group | null = null;
  
  // UI相关
  private 状态栏!: Phaser.GameObjects.Container;
  private 游戏菜单!: Phaser.GameObjects.Container;
  private 是否显示菜单: boolean = false;
  
  // 游戏状态
  private 游戏状态: any = null;
  private 存档ID: number | null = null;
  private 上次存档时间: number = 0;
  private 自动存档间隔: number = 60000; // 60秒自动存档一次
  
  constructor() {
    super('游戏场景');
  }
  
  init(): void {
    // 获取存档ID
    this.存档ID = Number(localStorage.getItem(游戏配置.存储键.当前存档));
    
    // 初始化控制器
    this.移动控制 = {
      上: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      下: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      左: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      右: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      交互: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      菜单: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
    };
  }
  
  async create(): Promise<void> {
    // 显示加载中提示
    const 加载文本 = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      '加载游戏中...',
      {
        fontSize: '24px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
      }
    );
    加载文本.setOrigin(0.5);
    
    try {
      // 加载存档数据
      await this.加载存档数据();
      
      // 加载地图数据
      await this.加载地图数据();
      
      // 创建地图
      this.创建地图();
      
      // 创建玩家
      this.创建玩家();
      
      // 创建NPC
      this.创建NPC();
      
      // 创建UI
      this.创建UI();
      
      // 设置碰撞
      this.设置碰撞();
      
      // 设置相机跟随
      this.cameras.main.startFollow(this.玩家精灵);
      this.cameras.main.setZoom(1.5);
      
      // 移除加载文本
      加载文本.destroy();
      
      // 监听菜单键
      this.移动控制!.菜单.on('down', () => {
        this.切换游戏菜单();
      });
      
      // 监听交互键
      this.移动控制!.交互.on('down', () => {
        this.检查NPC交互();
      });
    } catch (错误) {
      console.error('游戏场景加载失败:', 错误);
      加载文本.setText('加载失败，返回主菜单...');
      
      // 3秒后返回主菜单
      this.time.delayedCall(3000, () => {
        this.scene.start('主菜单场景');
      });
    }
  }
  
  update(时间: number, 增量: number): void {
    // 如果菜单打开，不处理移动
    if (this.是否显示菜单) return;
    
    // 处理玩家移动
    this.处理玩家移动();
    
    // 自动存档
    if (时间 - this.上次存档时间 > this.自动存档间隔) {
      this.保存游戏();
      this.上次存档时间 = 时间;
    }
  }
  
  /**
   * 加载存档数据
   */
  private async 加载存档数据(): Promise<void> {
    if (!this.存档ID) {
      throw new Error('未找到存档ID');
    }
    
    const 响应 = await 存档服务.获取存档(this.存档ID);
    
    if (响应.状态 !== '成功') {
      throw new Error('加载存档失败');
    }
    
    this.玩家数据 = 响应.数据.角色数据;
    this.游戏状态 = 响应.数据.游戏状态;
    this.当前地图ID = this.游戏状态.当前地图;
  }
  
  /**
   * 加载地图数据
   */
  private async 加载地图数据(): Promise<void> {
    const 响应 = await 游戏服务.获取地图(this.当前地图ID);
    
    if (响应.状态 !== '成功') {
      throw new Error('加载地图数据失败');
    }
    
    this.地图数据 = 响应.数据.数据;
  }
  
  /**
   * 创建地图
   */
  private 创建地图(): void {
    // 创建地图
    this.地图 = this.make.tilemap({ key: '地图_村庄' });
    
    // 添加瓦片集
    const 瓦片集 = this.地图.addTilesetImage('tileset', '瓦片集');
    
    // 创建图层
    this.地图图层.地面 = this.地图.createLayer('地面', 瓦片集);
    this.地图图层.建筑 = this.地图.createLayer('建筑', 瓦片集);
    this.地图图层.装饰 = this.地图.createLayer('装饰', 瓦片集);
    
    // 设置碰撞图层
    this.地图图层.建筑.setCollisionByProperty({ 碰撞: true });
  }
  
  /**
   * 创建玩家
   */
  private 创建玩家(): void {
    // 获取玩家位置
    const 位置 = this.玩家数据.位置;
    
    // 创建玩家精灵
    this.玩家精灵 = this.physics.add.sprite(位置.x, 位置.y, '玩家');
    this.玩家精灵.setCollideWorldBounds(true);
    
    // 设置玩家动画
    // 这里应该添加玩家的动画帧，但由于资源限制，暂时省略
  }
  
  /**
   * 创建NPC
   */
  private 创建NPC(): void {
    // 创建NPC组
    this.NPC列表 = this.physics.add.group();
    
    // 从地图数据中获取NPC信息并创建
    if (this.地图数据 && this.地图数据.NPC分布) {
      this.地图数据.NPC分布.forEach((npc: any) => {
        const npc精灵 = this.physics.add.sprite(npc.x, npc.y, 'NPC');
        npc精灵.setData('npcID', npc.id);
        npc精灵.setData('名称', npc.名称);
        npc精灵.setImmovable(true);
        
        // 添加到NPC组
        this.NPC列表!.add(npc精灵);
      });
    }
  }
  
  /**
   * 创建UI
   */
  private 创建UI(): void {
    // 创建状态栏
    this.创建状态栏();
    
    // 创建游戏菜单（初始隐藏）
    this.创建游戏菜单();
  }
  
  /**
   * 创建状态栏
   */
  private 创建状态栏(): void {
    // 创建状态栏容器
    this.状态栏 = this.add.container(10, 10);
    this.状态栏.setScrollFactor(0); // 固定在屏幕上
    
    // 创建背景
    const 背景 = this.add.rectangle(0, 0, 200, 80, 0x000000, 0.7);
    背景.setOrigin(0);
    
    // 创建角色名称
    const 角色名称 = this.add.text(10, 10, this.玩家数据.名称, {
      fontSize: '18px',
      color: '#ffffff'
    });
    角色名称.setOrigin(0);
    
    // 创建等级信息
    const 等级信息 = this.add.text(10, 35, `等级: ${this.玩家数据.等级}`, {
      fontSize: '14px',
      color: '#ffffff'
    });
    等级信息.setOrigin(0);
    
    // 创建生命值条
    const 生命值背景 = this.add.rectangle(10, 60, 180, 10, 0x555555);
    生命值背景.setOrigin(0);
    
    const 生命值比例 = this.玩家数据.生命值 / this.玩家数据.最大生命值;
    const 生命值条 = this.add.rectangle(10, 60, 180 * 生命值比例, 10, 0xff0000);
    生命值条.setOrigin(0);
    
    // 创建生命值文本
    const 生命值文本 = this.add.text(100, 60, `${this.玩家数据.生命值}/${this.玩家数据.最大生命值}`, {
      fontSize: '12px',
      color: '#ffffff'
    });
    生命值文本.setOrigin(0.5, 0.5);
    
    // 添加到状态栏
    this.状态栏.add([背景, 角色名称, 等级信息, 生命值背景, 生命值条, 生命值文本]);
  }
  
  /**
   * 创建游戏菜单
   */
  private 创建游戏菜单(): void {
    // 创建菜单容器
    this.游戏菜单 = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2);
    this.游戏菜单.setScrollFactor(0); // 固定在屏幕上
    this.游戏菜单.setVisible(false);
    
    // 创建半透明背景
    const 背景 = this.add.rectangle(
      0,
      0,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.7
    );
    背景.setOrigin(0.5);
    
    // 创建菜单面板
    const 面板 = this.add.rectangle(0, 0, 300, 400, 0xffffff, 0.9);
    面板.setStrokeStyle(2, 0x000000);
    
    // 创建标题
    const 标题 = this.add.text(0, -160, '游戏菜单', {
      fontSize: '28px',
      color: '#2c3e50'
    });
    标题.setOrigin(0.5);
    
    // 创建菜单选项
    const 选项数据 = [
      { 文本: '继续游戏', 回调: () => this.切换游戏菜单() },
      { 文本: '背包', 回调: () => this.打开背包() },
      { 文本: '任务', 回调: () => this.打开任务() },
      { 文本: '保存游戏', 回调: () => this.保存游戏() },
      { 文本: '返回主菜单', 回调: () => this.返回主菜单() }
    ];
    
    const 按钮组: Phaser.GameObjects.Container[] = [];
    const 按钮间距 = 60;
    const 起始Y = -80;
    
    选项数据.forEach((选项, 索引) => {
      const 按钮容器 = this.add.container(0, 起始Y + 索引 * 按钮间距);
      
      // 创建按钮背景
      const 按钮背景 = this.add.rectangle(0, 0, 200, 40, 0x3498db, 0.8);
      按钮背景.setStrokeStyle(2, 0x2980b9);
      
      // 创建按钮文本
      const 按钮文本 = this.add.text(0, 0, 选项.文本, {
        fontSize: '20px',
        color: '#ffffff'
      });
      按钮文本.setOrigin(0.5);
      
      // 设置交互
      按钮背景.setInteractive({ useHandCursor: true })
        .on('pointerover', () => {
          按钮背景.fillColor = 0x2980b9;
          按钮文本.setScale(1.1);
        })
        .on('pointerout', () => {
          按钮背景.fillColor = 0x3498db;
          按钮文本.setScale(1);
        })
        .on('pointerdown', () => {
          this.sound.play('点击音效');
          选项.回调();
        });
      
      // 添加到容器
      按钮容器.add([按钮背景, 按钮文本]);
      按钮组.push(按钮容器);
    });
    
    // 添加到菜单
    this.游戏菜单.add([背景, 面板, 标题, ...按钮组]);
  }
  
  /**
   * 设置碰撞
   */
  private 设置碰撞(): void {
    // 玩家与地图碰撞
    this.physics.add.collider(this.玩家精灵, this.地图图层.建筑);
    
    // 玩家与NPC碰撞
    this.physics.add.collider(this.玩家精灵, this.NPC列表!);
  }
  
  /**
   * 处理玩家移动
   */
  private 处理玩家移动(): void {
    // 重置速度
    this.玩家精灵.setVelocity(0);
    
    // 根据按键设置速度
    const 速度 = 游戏配置.角色移动速度;
    
    if (this.移动控制!.上.isDown) {
      this.玩家精灵.setVelocityY(-速度);
    } else if (this.移动控制!.下.isDown) {
      this.玩家精灵.setVelocityY(速度);
    }
    
    if (this.移动控制!.左.isDown) {
      this.玩家精灵.setVelocityX(-速度);
    } else if (this.移动控制!.右.isDown) {
      this.玩家精灵.setVelocityX(速度);
    }
    
    // 更新玩家位置数据
    this.玩家数据.位置.x = this.玩家精灵.x;
    this.玩家数据.位置.y = this.玩家精灵.y;
  }
  
  /**
   * 切换游戏菜单
   */
  private 切换游戏菜单(): void {
    this.是否显示菜单 = !this.是否显示菜单;
    this.游戏菜单.setVisible(this.是否显示菜单);
    
    // 暂停/恢复游戏
    if (this.是否显示菜单) {
      this.physics.pause();
    } else {
      this.physics.resume();
    }
  }
  
  /**
   * 检查NPC交互
   */
  private 检查NPC交互(): void {
    // 如果菜单打开，不处理交互
    if (this.是否显示菜单) return;
    
    // 获取玩家周围的NPC
    const 交互距离 = 50;
    let 最近NPC: Phaser.Physics.Arcade.Sprite | null = null;
    let 最小距离 = Infinity;
    
    this.NPC列表!.getChildren().forEach((npc: Phaser.GameObjects.GameObject) => {
      const npc精灵 = npc as Phaser.Physics.Arcade.Sprite;
      const 距离 = Phaser.Math.Distance.Between(
        this.玩家精灵.x, this.玩家精灵.y,
        npc精灵.x, npc精灵.y
      );
      
      if (距离 < 交互距离 && 距离 < 最小距离) {
        最近NPC = npc精灵;
        最小距离 = 距离;
      }
    });
    
    // 如果有可交互的NPC
    if (最近NPC) {
      const npcID = 最近NPC.getData('npcID');
      const npc名称 = 最近NPC.getData('名称');
      
      // 暂停物理引擎
      this.physics.pause();
      
      // 启动对话场景
      this.scene.launch('对话场景', { 
        npcID: npcID,
        npc名称: npc名称,
        对话结束回调: () => {
          // 恢复物理引擎
          this.physics.resume();
        }
      });
    }
  }
  
  /**
   * 打开背包
   */
  private 打开背包(): void {
    // 关闭菜单
    this.游戏菜单.setVisible(false);
    
    // 启动背包场景
    this.scene.launch('背包场景', { 
      玩家数据: this.玩家数据,
      关闭回调: () => {
        // 如果菜单仍然应该显示，则重新显示
        if (this.是否显示菜单) {
          this.游戏菜单.setVisible(true);
        } else {
          // 恢复物理引擎
          this.physics.resume();
        }
      }
    });
  }
  
  /**
   * 打开任务
   */
  private 打开任务(): void {
    // 关闭菜单
    this.游戏菜单.setVisible(false);
    
    // 启动任务场景
    this.scene.launch('任务场景', { 
      游戏状态: this.游戏状态,
      关闭回调: () => {
        // 如果菜单仍然应该显示，则重新显示
        if (this.是否显示菜单) {
          this.游戏菜单.setVisible(true);
        } else {
          // 恢复物理引擎
          this.physics.resume();
        }
      }
    });
  }
  
  /**
   * 保存游戏
   */
  private async 保存游戏(): Promise<void> {
    try {
      if (!this.存档ID) {
        throw new Error('未找到存档ID');
      }
      
      // 更新游戏状态
      this.游戏状态.当前地图 = this.当前地图ID;
      this.游戏状态.游戏时间 += Date.now() - this.上次存档时间;
      
      // 保存游戏
      await 存档服务.更新存档(this.存档ID, this.玩家数据, this.游戏状态);
      
      // 更新上次存档时间
      this.上次存档时间 = Date.now();
      
      // 显示保存成功提示
      this.显示提示('游戏已保存');
      
      // 如果是从菜单保存的，关闭菜单
      if (this.是否显示菜单) {
        this.切换游戏菜单();
      }
    } catch (错误) {
      console.error('保存游戏失败:', 错误);
      this.显示提示('保存失败，请稍后再试', true);
    }
  }
  
  /**
   * 返回主菜单
   */
  private 返回主菜单(): void {
    // 保存游戏
    this.保存游戏().then(() => {
      // 返回主菜单
      this.scene.start('主菜单场景');
    });
  }
  
  /**
   * 显示提示
   * @param 消息 - 提示消息
   * @param 是否错误 - 是否为错误提示
   */
  private 显示提示(消息: string, 是否错误: boolean = false): void {
    const 颜色 = 是否错误 ? '#e74c3c' : '#2ecc71';
    const 背景颜色 = 是否错误 ? 0xe74c3c : 0x2ecc71;
    
    const 提示容器 = this.add.container(
      this.cameras.main.width / 2,
      100
    );
    提示容器.setScrollFactor(0);
    
    const 背景 = this.add.rectangle(0, 0, 200, 40, 背景颜色, 0.8);
    背景.setStrokeStyle(1, 0x000000);
    
    const 文本 = this.add.text(0, 0, 消息, {
      fontSize: '18px',
      color: '#ffffff'
    });
    文本.setOrigin(0.5);
    
    提示容器.add([背景, 文本]);
    
    // 淡出动画
    this.tweens.add({
      targets: 提示容器,
      alpha: 0,
      y: 80,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => {
        提示容器.destroy();
      }
    });
  }
}
