/**
 * 游戏配置文件
 */
export const 游戏配置 = {
  // 游戏基础配置
  宽度: 800,
  高度: 600,
  标题: 'AI驱动的动态叙事像素RPG',
  
  // API配置
  API基础URL: 'http://localhost:8000/api',
  
  // 游戏设置
  瓦片尺寸: 32,
  角色移动速度: 150,
  
  // 存储键
  存储键: {
    认证令牌: 'auth_token',
    刷新令牌: 'refresh_token',
    用户信息: 'user_info',
    当前存档: 'current_save'
  }
};
