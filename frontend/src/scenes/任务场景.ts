/**
 * 任务场景类
 * 负责显示和管理玩家任务
 */
import Phaser from 'phaser';
import { 游戏服务 } from '../services/api服务';

export class 任务场景 extends Phaser.Scene {
  private 任务容器!: Phaser.GameObjects.Container;
  private 任务列表容器!: Phaser.GameObjects.Container;
  private 任务详情容器!: Phaser.GameObjects.Container;
  private 游戏状态: any = null;
  private 关闭回调: Function | null = null;
  private 任务列表: any[] = [];
  private 当前选中任务: any = null;
  
  constructor() {
    super('任务场景');
  }
  
  init(数据: any): void {
    // 获取传入的数据
    this.游戏状态 = 数据.游戏状态;
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
    
    // 创建任务界面
    this.创建任务界面();
    
    // 加载任务列表
    this.加载任务列表();
  }
  
  /**
   * 创建任务界面
   */
  private 创建任务界面(): void {
    // 创建任务容器
    this.任务容器 = this.add.container(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2
    );
    
    // 创建任务背景
    const 任务背景 = this.add.rectangle(0, 0, 700, 500, 0x2c3e50, 0.9);
    任务背景.setStrokeStyle(2, 0x34495e);
    
    // 创建标题
    const 标题 = this.add.text(0, -220, '任务日志', {
      fontSize: '28px',
      color: '#ecf0f1',
      fontStyle: 'bold'
    });
    标题.setOrigin(0.5);
    
    // 创建关闭按钮
    const 关闭按钮 = this.add.rectangle(320, -220, 30, 30, 0xe74c3c, 1);
    关闭按钮.setStrokeStyle(2, 0xc0392b);
    关闭按钮.setInteractive({ useHandCursor: true });
    
    const 关闭文本 = this.add.text(320, -220, 'X', {
      fontSize: '16px',
      color: '#ffffff'
    });
    关闭文本.setOrigin(0.5);
    
    关闭按钮.on('pointerdown', () => {
      this.关闭任务界面();
    });
    
    // 创建任务列表容器
    this.任务列表容器 = this.add.container(-300, 0);
    
    // 创建任务详情容器
    this.任务详情容器 = this.add.container(100, 0);
    
    // 添加到任务容器
    this.任务容器.add([任务背景, 标题, 关闭按钮, 关闭文本, this.任务列表容器, this.任务详情容器]);
    
    // 创建任务分类标签
    this.创建任务分类标签();
  }
  
  /**
   * 创建任务分类标签
   */
  private 创建任务分类标签(): void {
    const 分类 = ['全部', '主线', '支线', '已完成'];
    const 标签宽度 = 120;
    const 起始X = -((分类.length * 标签宽度) / 2) + 标签宽度 / 2;
    
    分类.forEach((分类名称, 索引) => {
      const x = 起始X + 索引 * 标签宽度;
      
      // 创建标签背景
      const 标签背景 = this.add.rectangle(x, -180, 标签宽度 - 10, 30, 0x3498db, 0.8);
      标签背景.setStrokeStyle(1, 0x2980b9);
      标签背景.setInteractive({ useHandCursor: true });
      
      // 创建标签文本
      const 标签文本 = this.add.text(x, -180, 分类名称, {
        fontSize: '16px',
        color: '#ffffff'
      });
      标签文本.setOrigin(0.5);
      
      // 设置交互
      标签背景.on('pointerdown', () => {
        this.筛选任务(分类名称);
      });
      
      // 添加到任务容器
      this.任务容器.add([标签背景, 标签文本]);
    });
  }
  
  /**
   * 加载任务列表
   */
  private async 加载任务列表(): Promise<void> {
    try {
      // 显示加载中
      const 加载文本 = this.add.text(0, 0, '加载任务中...', {
        fontSize: '18px',
        color: '#ffffff'
      });
      加载文本.setOrigin(0.5);
      this.任务列表容器.add(加载文本);
      
      // 获取任务列表
      const 响应 = await 游戏服务.获取任务列表();
      
      if (响应.状态 !== '成功') {
        throw new Error('获取任务列表失败');
      }
      
      // 保存任务列表
      this.任务列表 = 响应.数据.数据;
      
      // 移除加载文本
      加载文本.destroy();
      
      // 显示任务列表
      this.显示任务列表('全部');
    } catch (错误) {
      console.error('加载任务列表失败:', 错误);
      
      // 显示错误信息
      const 错误文本 = this.add.text(0, 0, '加载任务失败，请稍后再试', {
        fontSize: '18px',
        color: '#e74c3c'
      });
      错误文本.setOrigin(0.5);
      this.任务列表容器.add(错误文本);
    }
  }
  
  /**
   * 显示任务列表
   * @param 分类 - 任务分类
   */
  private 显示任务列表(分类: string): void {
    // 清空任务列表容器
    this.任务列表容器.removeAll(true);
    
    // 筛选任务
    let 筛选后任务 = [...this.任务列表];
    
    if (分类 === '主线') {
      筛选后任务 = 筛选后任务.filter(任务 => 任务.类型 === '主线');
    } else if (分类 === '支线') {
      筛选后任务 = 筛选后任务.filter(任务 => 任务.类型 === '支线');
    } else if (分类 === '已完成') {
      筛选后任务 = 筛选后任务.filter(任务 => {
        return this.游戏状态.已完成任务.includes(任务.id);
      });
    }
    
    // 如果没有任务
    if (筛选后任务.length === 0) {
      const 无任务文本 = this.add.text(0, 0, '没有找到任务', {
        fontSize: '18px',
        color: '#7f8c8d'
      });
      无任务文本.setOrigin(0.5);
      this.任务列表容器.add(无任务文本);
      return;
    }
    
    // 创建任务列表
    const 任务高度 = 40;
    const 任务间距 = 10;
    const 可见任务数 = 10;
    const 列表高度 = 可见任务数 * (任务高度 + 任务间距);
    const 起始Y = -列表高度 / 2 + 任务高度 / 2;
    
    // 创建列表背景
    const 列表背景 = this.add.rectangle(0, 0, 250, 列表高度, 0x34495e, 0.5);
    列表背景.setStrokeStyle(1, 0x2c3e50);
    this.任务列表容器.add(列表背景);
    
    // 创建任务项
    筛选后任务.forEach((任务, 索引) => {
      const y = 起始Y + 索引 * (任务高度 + 任务间距);
      
      // 创建任务项容器
      const 任务项容器 = this.add.container(0, y);
      
      // 创建任务项背景
      const 任务状态 = this.获取任务状态(任务);
      const 背景颜色 = this.获取任务背景颜色(任务状态);
      
      const 任务项背景 = this.add.rectangle(0, 0, 240, 任务高度, 背景颜色, 0.8);
      任务项背景.setStrokeStyle(1, 0x2c3e50);
      任务项背景.setInteractive({ useHandCursor: true });
      
      // 创建任务名称
      const 任务名称 = this.add.text(-110, -8, 任务.名称, {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold'
      });
      任务名称.setOrigin(0, 0.5);
      
      // 创建任务类型
      const 任务类型 = this.add.text(-110, 8, `[${任务.类型}]`, {
        fontSize: '12px',
        color: '#bdc3c7'
      });
      任务类型.setOrigin(0, 0.5);
      
      // 创建任务状态标签
      const 状态文本 = this.add.text(100, 0, 任务状态, {
        fontSize: '12px',
        color: this.获取任务状态颜色(任务状态)
      });
      状态文本.setOrigin(0.5);
      
      // 设置交互
      任务项背景.on('pointerdown', () => {
        this.选择任务(任务);
      });
      
      // 添加到任务项容器
      任务项容器.add([任务项背景, 任务名称, 任务类型, 状态文本]);
      
      // 添加到任务列表容器
      this.任务列表容器.add(任务项容器);
    });
    
    // 如果有任务，默认选择第一个
    if (筛选后任务.length > 0) {
      this.选择任务(筛选后任务[0]);
    }
  }
  
  /**
   * 筛选任务
   * @param 分类 - 任务分类
   */
  private 筛选任务(分类: string): void {
    this.显示任务列表(分类);
  }
  
  /**
   * 选择任务
   * @param 任务 - 任务数据
   */
  private async 选择任务(任务: any): void {
    // 保存当前选中任务
    this.当前选中任务 = 任务;
    
    // 清空任务详情容器
    this.任务详情容器.removeAll(true);
    
    try {
      // 显示加载中
      const 加载文本 = this.add.text(0, 0, '加载任务详情中...', {
        fontSize: '18px',
        color: '#ffffff'
      });
      加载文本.setOrigin(0.5);
      this.任务详情容器.add(加载文本);
      
      // 获取任务详情
      const 响应 = await 游戏服务.获取任务详情(任务.id);
      
      if (响应.状态 !== '成功') {
        throw new Error('获取任务详情失败');
      }
      
      // 获取任务详情
      const 任务详情 = 响应.数据.数据;
      
      // 移除加载文本
      加载文本.destroy();
      
      // 显示任务详情
      this.显示任务详情(任务详情);
    } catch (错误) {
      console.error('加载任务详情失败:', 错误);
      
      // 显示错误信息
      const 错误文本 = this.add.text(0, 0, '加载任务详情失败，请稍后再试', {
        fontSize: '18px',
        color: '#e74c3c'
      });
      错误文本.setOrigin(0.5);
      this.任务详情容器.add(错误文本);
    }
  }
  
  /**
   * 显示任务详情
   * @param 任务详情 - 任务详情数据
   */
  private 显示任务详情(任务详情: any): void {
    // 创建任务标题
    const 任务标题 = this.add.text(0, -180, 任务详情.名称, {
      fontSize: '24px',
      color: '#f1c40f',
      fontStyle: 'bold'
    });
    任务标题.setOrigin(0.5);
    
    // 创建任务类型和状态
    const 任务状态 = this.获取任务状态(任务详情);
    const 类型状态文本 = this.add.text(0, -150, `[${任务详情.类型}] - ${任务状态}`, {
      fontSize: '16px',
      color: this.获取任务状态颜色(任务状态)
    });
    类型状态文本.setOrigin(0.5);
    
    // 创建任务描述标题
    const 描述标题 = this.add.text(-150, -110, '任务描述:', {
      fontSize: '18px',
      color: '#3498db',
      fontStyle: 'bold'
    });
    描述标题.setOrigin(0, 0.5);
    
    // 创建任务描述
    const 任务描述 = this.add.text(-150, -70, 任务详情.描述, {
      fontSize: '16px',
      color: '#ecf0f1',
      wordWrap: { width: 300 }
    });
    任务描述.setOrigin(0, 0);
    
    // 创建任务目标标题
    const 目标标题 = this.add.text(-150, 20, '任务目标:', {
      fontSize: '18px',
      color: '#3498db',
      fontStyle: 'bold'
    });
    目标标题.setOrigin(0, 0.5);
    
    // 创建任务目标列表
    let 目标Y = 50;
    任务详情.目标.forEach((目标: string, 索引: number) => {
      const 目标文本 = this.add.text(-130, 目标Y, `${索引 + 1}. ${目标}`, {
        fontSize: '16px',
        color: '#ecf0f1'
      });
      目标文本.setOrigin(0, 0);
      this.任务详情容器.add(目标文本);
      
      目标Y += 30;
    });
    
    // 创建任务奖励标题
    const 奖励标题 = this.add.text(-150, 目标Y + 20, '任务奖励:', {
      fontSize: '18px',
      color: '#3498db',
      fontStyle: 'bold'
    });
    奖励标题.setOrigin(0, 0.5);
    
    // 创建任务奖励列表
    let 奖励Y = 目标Y + 50;
    Object.entries(任务详情.奖励).forEach(([类型, 数量]: [string, any]) => {
      const 奖励文本 = this.add.text(-130, 奖励Y, `${类型}: ${数量}`, {
        fontSize: '16px',
        color: '#2ecc71'
      });
      奖励文本.setOrigin(0, 0);
      this.任务详情容器.add(奖励文本);
      
      奖励Y += 30;
    });
    
    // 添加到任务详情容器
    this.任务详情容器.add([任务标题, 类型状态文本, 描述标题, 任务描述, 目标标题, 奖励标题]);
    
    // 如果任务未完成，显示放弃任务按钮
    if (任务状态 !== '已完成' && 任务状态 !== '未接取') {
      const 放弃按钮 = this.add.rectangle(0, 奖励Y + 40, 120, 40, 0xe74c3c, 1);
      放弃按钮.setStrokeStyle(2, 0xc0392b);
      放弃按钮.setInteractive({ useHandCursor: true });
      
      const 放弃文本 = this.add.text(0, 奖励Y + 40, '放弃任务', {
        fontSize: '16px',
        color: '#ffffff'
      });
      放弃文本.setOrigin(0.5);
      
      放弃按钮.on('pointerdown', () => {
        this.放弃任务(任务详情.id);
      });
      
      this.任务详情容器.add([放弃按钮, 放弃文本]);
    }
  }
  
  /**
   * 获取任务状态
   * @param 任务 - 任务数据
   * @returns 任务状态
   */
  private 获取任务状态(任务: any): string {
    if (this.游戏状态.已完成任务.includes(任务.id)) {
      return '已完成';
    } else if (this.游戏状态.进行中任务.includes(任务.id)) {
      return '进行中';
    } else {
      return '未接取';
    }
  }
  
  /**
   * 获取任务背景颜色
   * @param 状态 - 任务状态
   * @returns 背景颜色
   */
  private 获取任务背景颜色(状态: string): number {
    switch (状态) {
      case '已完成':
        return 0x27ae60;
      case '进行中':
        return 0x2980b9;
      case '未接取':
        return 0x7f8c8d;
      default:
        return 0x34495e;
    }
  }
  
  /**
   * 获取任务状态颜色
   * @param 状态 - 任务状态
   * @returns 状态颜色
   */
  private 获取任务状态颜色(状态: string): string {
    switch (状态) {
      case '已完成':
        return '#2ecc71';
      case '进行中':
        return '#3498db';
      case '未接取':
        return '#bdc3c7';
      default:
        return '#ffffff';
    }
  }
  
  /**
   * 放弃任务
   * @param 任务ID - 任务ID
   */
  private async 放弃任务(任务ID: number): Promise<void> {
    try {
      // 从进行中任务列表中移除
      const 索引 = this.游戏状态.进行中任务.indexOf(任务ID);
      if (索引 !== -1) {
        this.游戏状态.进行中任务.splice(索引, 1);
      }
      
      // 更新任务状态
      await 游戏服务.更新任务状态(任务ID, '未接取', {});
      
      // 重新加载任务列表
      this.加载任务列表();
      
      // 显示提示
      this.显示提示('已放弃任务');
    } catch (错误) {
      console.error('放弃任务失败:', 错误);
      this.显示提示('放弃任务失败，请稍后再试', true);
    }
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
  
  /**
   * 关闭任务界面
   */
  private 关闭任务界面(): void {
    // 调用回调函数
    if (this.关闭回调) {
      this.关闭回调();
    }
    
    // 关闭场景
    this.scene.stop();
  }
}
