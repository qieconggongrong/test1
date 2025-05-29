/**
 * 对话场景类
 * 负责NPC对话界面和交互
 */
import Phaser from 'phaser';
import { 游戏服务, AI服务 } from '../services/api服务';

export class 对话场景 extends Phaser.Scene {
  private 对话框!: Phaser.GameObjects.Container;
  private 对话文本!: Phaser.GameObjects.Text;
  private 对话选项组: Phaser.GameObjects.Container[] = [];
  private NPC名称!: Phaser.GameObjects.Text;
  private NPC头像!: Phaser.GameObjects.Image;
  
  private npcID: number = 0;
  private npc名称: string = '';
  private 对话历史: any[] = [];
  private 当前对话内容: string = '';
  private 当前对话选项: string[] = [];
  private 对话结束回调: Function | null = null;
  
  constructor() {
    super('对话场景');
  }
  
  init(数据: any): void {
    // 获取传入的数据
    this.npcID = 数据.npcID;
    this.npc名称 = 数据.npc名称;
    this.对话结束回调 = 数据.对话结束回调 || null;
    this.对话历史 = [];
  }
  
  create(): void {
    // 创建半透明背景
    const 背景 = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.5
    );
    
    // 创建对话框
    this.创建对话框();
    
    // 加载NPC对话
    this.加载NPC对话();
  }
  
  /**
   * 创建对话框
   */
  private 创建对话框(): void {
    // 创建对话框容器
    this.对话框 = this.add.container(
      this.cameras.main.width / 2,
      this.cameras.main.height - 150
    );
    
    // 创建对话框背景
    const 对话框背景 = this.add.image(0, 0, '对话框');
    对话框背景.setDisplaySize(700, 200);
    
    // 创建NPC头像背景
    const 头像背景 = this.add.rectangle(-300, -60, 80, 80, 0xffffff, 1);
    头像背景.setStrokeStyle(2, 0x000000);
    
    // 创建NPC头像
    this.NPC头像 = this.add.image(-300, -60, 'NPC');
    this.NPC头像.setDisplaySize(70, 70);
    
    // 创建NPC名称
    this.NPC名称 = this.add.text(-300, -15, this.npc名称, {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#2c3e50',
      padding: { x: 5, y: 2 }
    });
    this.NPC名称.setOrigin(0.5);
    
    // 创建对话文本
    this.对话文本 = this.add.text(-220, -70, '', {
      fontSize: '18px',
      color: '#2c3e50',
      wordWrap: { width: 450 }
    });
    this.对话文本.setOrigin(0, 0);
    
    // 添加到对话框
    this.对话框.add([对话框背景, 头像背景, this.NPC头像, this.NPC名称, this.对话文本]);
    
    // 创建关闭按钮
    const 关闭按钮 = this.add.rectangle(320, -80, 30, 30, 0xe74c3c, 1);
    关闭按钮.setStrokeStyle(2, 0xc0392b);
    关闭按钮.setInteractive({ useHandCursor: true });
    
    const 关闭文本 = this.add.text(320, -80, 'X', {
      fontSize: '16px',
      color: '#ffffff'
    });
    关闭文本.setOrigin(0.5);
    
    关闭按钮.on('pointerdown', () => {
      this.结束对话();
    });
    
    this.对话框.add([关闭按钮, 关闭文本]);
  }
  
  /**
   * 加载NPC对话
   */
  private async 加载NPC对话(): Promise<void> {
    try {
      // 显示加载中
      this.对话文本.setText('加载对话中...');
      
      // 获取NPC数据
      const npc响应 = await 游戏服务.获取NPC(this.npcID);
      
      if (npc响应.状态 !== '成功') {
        throw new Error('获取NPC数据失败');
      }
      
      const npc数据 = npc响应.数据.数据;
      
      // 获取NPC对话
      const 对话响应 = await 游戏服务.获取NPC对话(this.npcID, '', this.对话历史);
      
      if (对话响应.状态 !== '成功') {
        throw new Error('获取NPC对话失败');
      }
      
      // 解析对话内容
      this.解析对话内容(对话响应.数据.数据.对话内容);
      
      // 显示对话选项
      this.显示对话选项(对话响应.数据.数据.对话选项);
      
      // 添加到对话历史
      this.对话历史.push({
        说话者: 'NPC',
        内容: this.当前对话内容
      });
    } catch (错误) {
      console.error('加载NPC对话失败:', 错误);
      this.对话文本.setText('对话加载失败，请稍后再试。');
      
      // 创建关闭选项
      this.显示对话选项(['离开']);
    }
  }
  
  /**
   * 解析对话内容
   * @param 对话内容 - 对话内容文本
   */
  private 解析对话内容(对话内容: string): void {
    this.当前对话内容 = 对话内容;
    this.对话文本.setText(对话内容);
  }
  
  /**
   * 显示对话选项
   * @param 选项 - 对话选项数组
   */
  private 显示对话选项(选项: string[]): void {
    // 清除之前的选项
    this.对话选项组.forEach(选项 => 选项.destroy());
    this.对话选项组 = [];
    
    // 保存当前选项
    this.当前对话选项 = 选项;
    
    // 创建新选项
    const 起始Y = 30;
    const 间距 = 40;
    
    选项.forEach((选项文本, 索引) => {
      const 选项容器 = this.add.container(0, 起始Y + 索引 * 间距);
      
      // 创建选项背景
      const 选项背景 = this.add.rectangle(0, 0, 500, 30, 0x3498db, 0.8);
      选项背景.setStrokeStyle(1, 0x2980b9);
      选项背景.setInteractive({ useHandCursor: true });
      
      // 创建选项文本
      const 文本 = this.add.text(0, 0, 选项文本, {
        fontSize: '16px',
        color: '#ffffff'
      });
      文本.setOrigin(0.5);
      
      // 设置交互
      选项背景.on('pointerover', () => {
        选项背景.fillColor = 0x2980b9;
        文本.setScale(1.05);
      });
      
      选项背景.on('pointerout', () => {
        选项背景.fillColor = 0x3498db;
        文本.setScale(1);
      });
      
      选项背景.on('pointerdown', () => {
        this.选择对话选项(索引);
      });
      
      // 添加到容器
      选项容器.add([选项背景, 文本]);
      this.对话框.add(选项容器);
      
      // 保存选项引用
      this.对话选项组.push(选项容器);
    });
  }
  
  /**
   * 选择对话选项
   * @param 索引 - 选项索引
   */
  private async 选择对话选项(索引: number): Promise<void> {
    const 选择的选项 = this.当前对话选项[索引];
    
    // 如果选择了"离开"选项，结束对话
    if (选择的选项 === '离开') {
      this.结束对话();
      return;
    }
    
    // 添加到对话历史
    this.对话历史.push({
      说话者: '玩家',
      内容: 选择的选项
    });
    
    try {
      // 显示加载中
      this.对话文本.setText('...');
      
      // 清除选项
      this.对话选项组.forEach(选项 => 选项.setVisible(false));
      
      // 获取NPC回应
      const 对话响应 = await 游戏服务.获取NPC对话(this.npcID, 选择的选项, this.对话历史);
      
      if (对话响应.状态 !== '成功') {
        throw new Error('获取NPC回应失败');
      }
      
      // 解析对话内容
      this.解析对话内容(对话响应.数据.数据.对话内容);
      
      // 显示对话选项
      this.显示对话选项(对话响应.数据.数据.对话选项);
      
      // 添加到对话历史
      this.对话历史.push({
        说话者: 'NPC',
        内容: this.当前对话内容
      });
    } catch (错误) {
      console.error('获取NPC回应失败:', 错误);
      this.对话文本.setText('对话出现问题，请稍后再试。');
      
      // 创建关闭选项
      this.显示对话选项(['离开']);
    }
  }
  
  /**
   * 结束对话
   */
  private 结束对话(): void {
    // 调用回调函数
    if (this.对话结束回调) {
      this.对话结束回调();
    }
    
    // 关闭场景
    this.scene.stop();
  }
}
