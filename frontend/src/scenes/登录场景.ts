/**
 * 登录场景类
 * 负责用户登录和注册功能
 */
import Phaser from 'phaser';
import { 用户服务 } from '../services/api服务';

export class 登录场景 extends Phaser.Scene {
  private 用户名输入框!: HTMLInputElement;
  private 密码输入框!: HTMLInputElement;
  private 确认密码输入框!: HTMLInputElement;
  private 邮箱输入框!: HTMLInputElement;
  private 错误文本!: Phaser.GameObjects.Text;
  private 当前模式: '登录' | '注册' = '登录';
  
  constructor() {
    super('登录场景');
  }
  
  create(): void {
    // 设置背景
    this.cameras.main.setBackgroundColor('#3498db');
    
    // 创建标题
    const 标题 = this.add.text(
      this.cameras.main.width / 2,
      100,
      'AI驱动的动态叙事像素RPG',
      {
        fontSize: '32px',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    );
    标题.setOrigin(0.5);
    
    // 创建登录表单
    this.创建登录表单();
    
    // 创建错误文本
    this.错误文本 = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height - 100,
      '',
      {
        fontSize: '16px',
        color: '#e74c3c'
      }
    );
    this.错误文本.setOrigin(0.5);
    
    // 检查是否已登录
    this.检查登录状态();
  }
  
  /**
   * 创建登录表单
   */
  private 创建登录表单(): void {
    // 移除之前的DOM元素
    const 旧元素 = document.getElementById('登录表单容器');
    if (旧元素) {
      旧元素.remove();
    }
    
    // 创建表单容器
    const 表单容器 = document.createElement('div');
    表单容器.id = '登录表单容器';
    表单容器.style.position = 'absolute';
    表单容器.style.left = '50%';
    表单容器.style.top = '50%';
    表单容器.style.transform = 'translate(-50%, -50%)';
    表单容器.style.width = '300px';
    表单容器.style.padding = '20px';
    表单容器.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    表单容器.style.borderRadius = '10px';
    表单容器.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    
    // 创建表单标题
    const 表单标题 = document.createElement('h2');
    表单标题.textContent = this.当前模式 === '登录' ? '用户登录' : '用户注册';
    表单标题.style.textAlign = 'center';
    表单标题.style.marginBottom = '20px';
    表单标题.style.color = '#2c3e50';
    表单容器.appendChild(表单标题);
    
    // 创建用户名输入框
    this.创建输入框(表单容器, '用户名', 'text', (input) => {
      this.用户名输入框 = input;
    });
    
    // 创建密码输入框
    this.创建输入框(表单容器, '密码', 'password', (input) => {
      this.密码输入框 = input;
    });
    
    // 如果是注册模式，添加确认密码和邮箱输入框
    if (this.当前模式 === '注册') {
      this.创建输入框(表单容器, '确认密码', 'password', (input) => {
        this.确认密码输入框 = input;
      });
      
      this.创建输入框(表单容器, '邮箱', 'email', (input) => {
        this.邮箱输入框 = input;
      });
    }
    
    // 创建提交按钮
    const 提交按钮 = document.createElement('button');
    提交按钮.textContent = this.当前模式 === '登录' ? '登录' : '注册';
    提交按钮.style.width = '100%';
    提交按钮.style.padding = '10px';
    提交按钮.style.marginTop = '20px';
    提交按钮.style.backgroundColor = '#2ecc71';
    提交按钮.style.color = 'white';
    提交按钮.style.border = 'none';
    提交按钮.style.borderRadius = '5px';
    提交按钮.style.cursor = 'pointer';
    提交按钮.style.fontSize = '16px';
    提交按钮.onclick = () => this.提交表单();
    表单容器.appendChild(提交按钮);
    
    // 创建切换模式链接
    const 切换链接 = document.createElement('p');
    切换链接.style.textAlign = 'center';
    切换链接.style.marginTop = '15px';
    切换链接.style.fontSize = '14px';
    
    const 链接文本 = document.createElement('a');
    链接文本.textContent = this.当前模式 === '登录' ? '没有账号？点击注册' : '已有账号？点击登录';
    链接文本.style.color = '#3498db';
    链接文本.style.cursor = 'pointer';
    链接文本.onclick = () => this.切换模式();
    
    切换链接.appendChild(链接文本);
    表单容器.appendChild(切换链接);
    
    // 将表单添加到DOM
    document.body.appendChild(表单容器);
  }
  
  /**
   * 创建输入框
   * @param 容器 - 父容器
   * @param 标签文本 - 输入框标签
   * @param 类型 - 输入框类型
   * @param 回调 - 输入框创建后的回调
   */
  private 创建输入框(容器: HTMLElement, 标签文本: string, 类型: string, 回调: (input: HTMLInputElement) => void): void {
    const 输入组 = document.createElement('div');
    输入组.style.marginBottom = '15px';
    
    const 标签 = document.createElement('label');
    标签.textContent = 标签文本;
    标签.style.display = 'block';
    标签.style.marginBottom = '5px';
    标签.style.fontSize = '14px';
    标签.style.color = '#2c3e50';
    
    const 输入框 = document.createElement('input');
    输入框.type = 类型;
    输入框.style.width = '100%';
    输入框.style.padding = '8px';
    输入框.style.boxSizing = 'border-box';
    输入框.style.border = '1px solid #bdc3c7';
    输入框.style.borderRadius = '4px';
    
    输入组.appendChild(标签);
    输入组.appendChild(输入框);
    容器.appendChild(输入组);
    
    回调(输入框);
  }
  
  /**
   * 切换登录/注册模式
   */
  private 切换模式(): void {
    this.当前模式 = this.当前模式 === '登录' ? '注册' : '登录';
    this.创建登录表单();
    this.错误文本.setText('');
  }
  
  /**
   * 提交表单
   */
  private async 提交表单(): Promise<void> {
    try {
      this.错误文本.setText('');
      
      if (this.当前模式 === '登录') {
        // 登录逻辑
        if (!this.用户名输入框.value || !this.密码输入框.value) {
          this.错误文本.setText('请输入用户名和密码');
          return;
        }
        
        // 调用登录API
        await 用户服务.登录(this.用户名输入框.value, this.密码输入框.value);
        
        // 登录成功，跳转到主菜单
        this.清理DOM元素();
        this.scene.start('主菜单场景');
      } else {
        // 注册逻辑
        if (!this.用户名输入框.value || !this.密码输入框.value || !this.确认密码输入框.value || !this.邮箱输入框.value) {
          this.错误文本.setText('请填写所有字段');
          return;
        }
        
        if (this.密码输入框.value !== this.确认密码输入框.value) {
          this.错误文本.setText('两次输入的密码不匹配');
          return;
        }
        
        // 调用注册API
        await 用户服务.注册(
          this.用户名输入框.value,
          this.密码输入框.value,
          this.确认密码输入框.value,
          this.邮箱输入框.value
        );
        
        // 注册成功，跳转到主菜单
        this.清理DOM元素();
        this.scene.start('主菜单场景');
      }
    } catch (错误: any) {
      console.error('表单提交错误:', 错误);
      
      // 显示错误信息
      if (错误.response && 错误.response.data && 错误.response.data.消息) {
        this.错误文本.setText(错误.response.data.消息);
      } else {
        this.错误文本.setText('发生错误，请稍后再试');
      }
    }
  }
  
  /**
   * 检查用户是否已登录
   */
  private 检查登录状态(): void {
    const 令牌 = localStorage.getItem('auth_token');
    if (令牌) {
      // 已登录，跳转到主菜单
      this.清理DOM元素();
      this.scene.start('主菜单场景');
    }
  }
  
  /**
   * 清理DOM元素
   */
  private 清理DOM元素(): void {
    const 表单容器 = document.getElementById('登录表单容器');
    if (表单容器) {
      表单容器.remove();
    }
  }
}
