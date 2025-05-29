/**
 * 背包场景类
 * 负责显示和管理玩家背包物品
 */
import Phaser from 'phaser';

export class 背包场景 extends Phaser.Scene {
  private 背包容器!: Phaser.GameObjects.Container;
  private 物品格子: Phaser.GameObjects.Container[] = [];
  private 物品详情框!: Phaser.GameObjects.Container;
  private 玩家数据: any = null;
  private 关闭回调: Function | null = null;
  private 当前选中物品: any = null;
  
  constructor() {
    super('背包场景');
  }
  
  init(数据: any): void {
    // 获取传入的数据
    this.玩家数据 = 数据.玩家数据;
    this.关闭回调 = 数据.关闭回调 || null;
  }
  
  create(): void {
    // 创建半透明背景
    const 背景 = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.7
    );
    
    // 创建背包界面
    this.创建背包界面();
    
    // 创建物品详情框（初始隐藏）
    this.创建物品详情框();
    
    // 加载背包物品
    this.加载背包物品();
  }
  
  /**
   * 创建背包界面
   */
  private 创建背包界面(): void {
    // 创建背包容器
    this.背包容器 = this.add.container(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2
    );
    
    // 创建背包背景
    const 背包背景 = this.add.image(0, 0, '物品栏');
    背包背景.setDisplaySize(600, 400);
    
    // 创建标题
    const 标题 = this.add.text(0, -160, '背包', {
      fontSize: '28px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    标题.setOrigin(0.5);
    
    // 创建关闭按钮
    const 关闭按钮 = this.add.rectangle(260, -160, 30, 30, 0xe74c3c, 1);
    关闭按钮.setStrokeStyle(2, 0xc0392b);
    关闭按钮.setInteractive({ useHandCursor: true });
    
    const 关闭文本 = this.add.text(260, -160, 'X', {
      fontSize: '16px',
      color: '#ffffff'
    });
    关闭文本.setOrigin(0.5);
    
    关闭按钮.on('pointerdown', () => {
      this.关闭背包();
    });
    
    // 添加到背包容器
    this.背包容器.add([背包背景, 标题, 关闭按钮, 关闭文本]);
    
    // 创建物品格子
    this.创建物品格子();
  }
  
  /**
   * 创建物品格子
   */
  private 创建物品格子(): void {
    const 行数 = 4;
    const 列数 = 6;
    const 格子大小 = 70;
    const 格子间距 = 10;
    const 起始X = -((列数 * 格子大小 + (列数 - 1) * 格子间距) / 2) + 格子大小 / 2;
    const 起始Y = -80;
    
    for (let 行 = 0; 行 < 行数; 行++) {
      for (let 列 = 0; 列 < 列数; 列++) {
        const x = 起始X + 列 * (格子大小 + 格子间距);
        const y = 起始Y + 行 * (格子大小 + 格子间距);
        
        // 创建格子容器
        const 格子容器 = this.add.container(x, y);
        
        // 创建格子背景
        const 格子背景 = this.add.rectangle(0, 0, 格子大小, 格子大小, 0x3c3c3c, 0.8);
        格子背景.setStrokeStyle(2, 0x666666);
        
        // 添加到格子容器
        格子容器.add(格子背景);
        
        // 设置数据
        格子容器.setData('索引', 行 * 列数 + 列);
        格子容器.setData('物品', null);
        
        // 添加到背包容器
        this.背包容器.add(格子容器);
        
        // 保存格子引用
        this.物品格子.push(格子容器);
      }
    }
  }
  
  /**
   * 创建物品详情框
   */
  private 创建物品详情框(): void {
    // 创建详情框容器
    this.物品详情框 = this.add.container(0, 150);
    this.物品详情框.setVisible(false);
    
    // 创建详情框背景
    const 详情框背景 = this.add.rectangle(0, 0, 500, 100, 0x2c3e50, 0.9);
    详情框背景.setStrokeStyle(2, 0x34495e);
    
    // 创建物品名称
    const 物品名称 = this.add.text(-240, -30, '', {
      fontSize: '18px',
      color: '#f1c40f',
      fontStyle: 'bold'
    });
    物品名称.setOrigin(0, 0.5);
    
    // 创建物品类型
    const 物品类型 = this.add.text(-240, 0, '', {
      fontSize: '14px',
      color: '#bdc3c7'
    });
    物品类型.setOrigin(0, 0.5);
    
    // 创建物品描述
    const 物品描述 = this.add.text(-240, 30, '', {
      fontSize: '14px',
      color: '#ecf0f1',
      wordWrap: { width: 480 }
    });
    物品描述.setOrigin(0, 0.5);
    
    // 创建使用按钮
    const 使用按钮 = this.add.rectangle(180, 0, 80, 30, 0x2ecc71, 1);
    使用按钮.setStrokeStyle(2, 0x27ae60);
    使用按钮.setInteractive({ useHandCursor: true });
    
    const 使用文本 = this.add.text(180, 0, '使用', {
      fontSize: '14px',
      color: '#ffffff'
    });
    使用文本.setOrigin(0.5);
    
    使用按钮.on('pointerdown', () => {
      this.使用物品();
    });
    
    // 添加到详情框容器
    this.物品详情框.add([详情框背景, 物品名称, 物品类型, 物品描述, 使用按钮, 使用文本]);
    
    // 添加到背包容器
    this.背包容器.add(this.物品详情框);
  }
  
  /**
   * 加载背包物品
   */
  private 加载背包物品(): void {
    // 获取背包物品
    const 背包物品 = this.玩家数据.背包 || [];
    
    // 清空所有格子
    this.物品格子.forEach(格子 => {
      // 移除物品图标
      格子.getAll().forEach((物品, 索引) => {
        if (索引 > 0) { // 跳过格子背景
          物品.destroy();
        }
      });
      
      // 重置数据
      格子.setData('物品', null);
      
      // 移除交互
      格子.removeInteractive();
    });
    
    // 填充物品
    背包物品.forEach((物品: any, 索引: number) => {
      if (索引 < this.物品格子.length) {
        const 格子 = this.物品格子[索引];
        
        // 创建物品图标
        const 物品图标 = this.add.rectangle(0, 0, 50, 50, 0x3498db, 1);
        
        // 创建物品名称
        const 物品名称 = this.add.text(0, 0, 物品.名称, {
          fontSize: '12px',
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 3
        });
        物品名称.setOrigin(0.5);
        
        // 添加到格子
        格子.add([物品图标, 物品名称]);
        
        // 设置数据
        格子.setData('物品', 物品);
        
        // 设置交互
        格子.setInteractive({ useHandCursor: true })
          .on('pointerdown', () => {
            this.选择物品(物品, 格子);
          });
      }
    });
  }
  
  /**
   * 选择物品
   * @param 物品 - 选中的物品
   * @param 格子 - 物品所在的格子
   */
  private 选择物品(物品: any, 格子: Phaser.GameObjects.Container): void {
    // 保存当前选中物品
    this.当前选中物品 = 物品;
    
    // 高亮选中的格子
    this.物品格子.forEach(格子容器 => {
      const 背景 = 格子容器.getAt(0) as Phaser.GameObjects.Rectangle;
      背景.setStrokeStyle(2, 0x666666);
    });
    
    const 背景 = 格子.getAt(0) as Phaser.GameObjects.Rectangle;
    背景.setStrokeStyle(3, 0xf1c40f);
    
    // 更新物品详情
    this.更新物品详情(物品);
    
    // 显示详情框
    this.物品详情框.setVisible(true);
  }
  
  /**
   * 更新物品详情
   * @param 物品 - 物品数据
   */
  private 更新物品详情(物品: any): void {
    const 名称文本 = this.物品详情框.getAt(1) as Phaser.GameObjects.Text;
    const 类型文本 = this.物品详情框.getAt(2) as Phaser.GameObjects.Text;
    const 描述文本 = this.物品详情框.getAt(3) as Phaser.GameObjects.Text;
    
    名称文本.setText(物品.名称);
    类型文本.setText(`类型: ${物品.类型}`);
    描述文本.setText(物品.描述);
    
    // 根据物品类型决定是否显示使用按钮
    const 使用按钮 = this.物品详情框.getAt(4) as Phaser.GameObjects.Rectangle;
    const 使用文本 = this.物品详情框.getAt(5) as Phaser.GameObjects.Text;
    
    if (物品.类型 === '消耗品') {
      使用按钮.setVisible(true);
      使用文本.setVisible(true);
    } else {
      使用按钮.setVisible(false);
      使用文本.setVisible(false);
    }
  }
  
  /**
   * 使用物品
   */
  private 使用物品(): void {
    if (!this.当前选中物品) return;
    
    // 根据物品类型执行不同效果
    if (this.当前选中物品.类型 === '消耗品') {
      // 应用物品效果
      this.应用物品效果(this.当前选中物品);
      
      // 从背包中移除物品
      const 背包 = this.玩家数据.背包;
      const 索引 = 背包.findIndex((物品: any) => 物品 === this.当前选中物品);
      
      if (索引 !== -1) {
        背包.splice(索引, 1);
      }
      
      // 重新加载背包物品
      this.加载背包物品();
      
      // 隐藏详情框
      this.物品详情框.setVisible(false);
      this.当前选中物品 = null;
    }
  }
  
  /**
   * 应用物品效果
   * @param 物品 - 物品数据
   */
  private 应用物品效果(物品: any): void {
    // 获取物品效果
    const 效果 = 物品.效果 || {};
    
    // 应用效果
    if (效果.生命值) {
      this.玩家数据.生命值 = Math.min(
        this.玩家数据.生命值 + 效果.生命值,
        this.玩家数据.最大生命值
      );
    }
    
    if (效果.魔法值) {
      this.玩家数据.魔法值 = Math.min(
        this.玩家数据.魔法值 + 效果.魔法值,
        this.玩家数据.最大魔法值
      );
    }
    
    // 显示使用效果提示
    this.显示提示(`使用了 ${物品.名称}`);
  }
  
  /**
   * 显示提示
   * @param 消息 - 提示消息
   */
  private 显示提示(消息: string): void {
    const 提示文本 = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 100,
      消息,
      {
        fontSize: '18px',
        color: '#ffffff',
        backgroundColor: '#2ecc71',
        padding: { x: 10, y: 5 }
      }
    );
    提示文本.setOrigin(0.5);
    
    // 淡出动画
    this.tweens.add({
      targets: 提示文本,
      alpha: 0,
      y: '-=50',
      duration: 2000,
      ease: 'Power2',
      onComplete: () => {
        提示文本.destroy();
      }
    });
  }
  
  /**
   * 关闭背包
   */
  private 关闭背包(): void {
    // 调用回调函数
    if (this.关闭回调) {
      this.关闭回调();
    }
    
    // 关闭场景
    this.scene.stop();
  }
}
