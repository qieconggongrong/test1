/**
 * 启动场景类
 * 负责加载游戏资源并显示加载进度
 */
import Phaser from 'phaser';

export class 启动场景 extends Phaser.Scene {
  private 加载文本!: Phaser.GameObjects.Text;
  private 进度条!: Phaser.GameObjects.Graphics;
  
  constructor() {
    super('启动场景');
  }
  
  preload(): void {
    // 创建加载进度条
    this.创建加载UI();
    
    // 监听加载进度
    this.load.on('progress', (值: number) => {
      // 更新进度条
      this.进度条.clear();
      this.进度条.fillStyle(0xffffff, 1);
      this.进度条.fillRect(
        this.cameras.main.width / 4, 
        this.cameras.main.height / 2 - 16, 
        (this.cameras.main.width / 2) * 值, 
        32
      );
      
      // 更新百分比文本
      this.加载文本.setText(`加载中... ${Math.floor(值 * 100)}%`);
    });
    
    // 加载完成事件
    this.load.on('complete', () => {
      // 加载完成后的处理
    });
    
    // 加载游戏资源
    this.加载游戏资源();
  }
  
  create(): void {
    // 显示加载完成文本
    this.加载文本.setText('加载完成！');
    
    // 延迟一秒后跳转到登录场景
    this.time.delayedCall(1000, () => {
      this.scene.start('登录场景');
    });
  }
  
  /**
   * 创建加载UI
   */
  private 创建加载UI(): void {
    // 创建背景
    this.cameras.main.setBackgroundColor('#000000');
    
    // 创建标题
    const 标题 = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 3,
      'AI驱动的动态叙事像素RPG',
      {
        fontSize: '32px',
        color: '#ffffff'
      }
    );
    标题.setOrigin(0.5);
    
    // 创建进度条边框
    const 进度条边框 = this.add.graphics();
    进度条边框.lineStyle(2, 0xffffff, 1);
    进度条边框.strokeRect(
      this.cameras.main.width / 4, 
      this.cameras.main.height / 2 - 16, 
      this.cameras.main.width / 2, 
      32
    );
    
    // 创建进度条
    this.进度条 = this.add.graphics();
    
    // 创建加载文本
    this.加载文本 = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 50,
      '加载中... 0%',
      {
        fontSize: '18px',
        color: '#ffffff'
      }
    );
    this.加载文本.setOrigin(0.5);
  }
  
  /**
   * 加载游戏资源
   */
  private 加载游戏资源(): void {
    // 加载图像资源
    this.load.image('玩家', 'assets/characters/player.png');
    this.load.image('NPC', 'assets/characters/npc.png');
    this.load.image('瓦片集', 'assets/tiles/tileset.png');
    
    // 加载地图资源
    this.load.tilemapTiledJSON('地图_村庄', 'assets/maps/village.json');
    
    // 加载UI资源
    this.load.image('按钮', 'assets/ui/button.png');
    this.load.image('对话框', 'assets/ui/dialog.png');
    this.load.image('物品栏', 'assets/ui/inventory.png');
    
    // 加载音频资源
    this.load.audio('背景音乐', 'assets/audio/background.mp3');
    this.load.audio('点击音效', 'assets/audio/click.mp3');
  }
}
