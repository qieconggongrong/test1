/**
 * API服务类 - 处理与后端API的所有交互
 */
import axios from 'axios';
import { 游戏配置 } from '../config/游戏配置';

// 创建axios实例
const API = axios.create({
  baseURL: 游戏配置.API基础URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器 - 添加认证令牌
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(游戏配置.存储键.认证令牌);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理令牌过期
API.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const 原始请求 = error.config;
    
    // 如果是401错误且未尝试过刷新令牌
    if (error.response.status === 401 && !原始请求._retry) {
      原始请求._retry = true;
      
      try {
        // 尝试刷新令牌
        const 刷新令牌 = localStorage.getItem(游戏配置.存储键.刷新令牌);
        if (!刷新令牌) {
          // 如果没有刷新令牌，直接跳转到登录页
          window.location.href = '/';
          return Promise.reject(error);
        }
        
        const 响应 = await axios.post(
          `${游戏配置.API基础URL}/auth/token/refresh/`,
          { refresh: 刷新令牌 }
        );
        
        // 保存新令牌
        localStorage.setItem(游戏配置.存储键.认证令牌, 响应.data.access);
        
        // 使用新令牌重试原始请求
        原始请求.headers['Authorization'] = `Bearer ${响应.data.access}`;
        return API(原始请求);
      } catch (刷新错误) {
        // 刷新令牌失败，清除所有令牌并跳转到登录页
        localStorage.removeItem(游戏配置.存储键.认证令牌);
        localStorage.removeItem(游戏配置.存储键.刷新令牌);
        localStorage.removeItem(游戏配置.存储键.用户信息);
        window.location.href = '/';
        return Promise.reject(刷新错误);
      }
    }
    
    return Promise.reject(error);
  }
);

/**
 * 用户相关API服务
 */
export const 用户服务 = {
  /**
   * 用户注册
   * @param 用户名 - 用户名
   * @param 密码 - 密码
   * @param 确认密码 - 确认密码
   * @param 邮箱 - 邮箱
   * @returns 注册结果
   */
  注册: async (用户名: string, 密码: string, 确认密码: string, 邮箱: string) => {
    try {
      const 响应 = await API.post('/auth/register/', {
        username: 用户名,
        password: 密码,
        确认密码: 确认密码,
        email: 邮箱
      });
      
      // 保存令牌和用户信息
      localStorage.setItem(游戏配置.存储键.认证令牌, 响应.data.数据.token);
      localStorage.setItem(游戏配置.存储键.刷新令牌, 响应.data.数据.refresh);
      localStorage.setItem(游戏配置.存储键.用户信息, JSON.stringify(响应.data.数据.用户));
      
      return 响应.data;
    } catch (错误) {
      console.error('注册失败:', 错误);
      throw 错误;
    }
  },
  
  /**
   * 用户登录
   * @param 用户名 - 用户名
   * @param 密码 - 密码
   * @returns 登录结果
   */
  登录: async (用户名: string, 密码: string) => {
    try {
      const 响应 = await API.post('/auth/login/', {
        username: 用户名,
        password: 密码
      });
      
      // 保存令牌和用户信息
      localStorage.setItem(游戏配置.存储键.认证令牌, 响应.data.数据.token);
      localStorage.setItem(游戏配置.存储键.刷新令牌, 响应.data.数据.refresh);
      localStorage.setItem(游戏配置.存储键.用户信息, JSON.stringify(响应.data.数据.用户));
      
      return 响应.data;
    } catch (错误) {
      console.error('登录失败:', 错误);
      throw 错误;
    }
  },
  
  /**
   * 用户注销
   * @returns 注销结果
   */
  注销: async () => {
    try {
      const 刷新令牌 = localStorage.getItem(游戏配置.存储键.刷新令牌);
      const 响应 = await API.post('/auth/logout/', { refresh: 刷新令牌 });
      
      // 清除本地存储的令牌和用户信息
      localStorage.removeItem(游戏配置.存储键.认证令牌);
      localStorage.removeItem(游戏配置.存储键.刷新令牌);
      localStorage.removeItem(游戏配置.存储键.用户信息);
      localStorage.removeItem(游戏配置.存储键.当前存档);
      
      return 响应.data;
    } catch (错误) {
      console.error('注销失败:', 错误);
      throw 错误;
    }
  },
  
  /**
   * 获取当前用户信息
   * @returns 用户信息
   */
  获取用户信息: async () => {
    try {
      const 响应 = await API.get('/auth/user/');
      return 响应.data;
    } catch (错误) {
      console.error('获取用户信息失败:', 错误);
      throw 错误;
    }
  }
};

/**
 * 游戏存档相关API服务
 */
export const 存档服务 = {
  /**
   * 获取存档列表
   * @returns 存档列表
   */
  获取存档列表: async () => {
    try {
      const 响应 = await API.get('/game/save/');
      return 响应.data;
    } catch (错误) {
      console.error('获取存档列表失败:', 错误);
      throw 错误;
    }
  },
  
  /**
   * 创建新存档
   * @param 存档名称 - 存档名称
   * @param 角色数据 - 角色初始数据
   * @returns 创建结果
   */
  创建存档: async (存档名称: string, 角色数据: any) => {
    try {
      const 响应 = await API.post('/game/save/', {
        存档名称: 存档名称,
        角色数据: 角色数据,
        游戏状态: {
          当前地图: 1,
          已完成任务: [],
          进行中任务: [],
          对话历史: {},
          游戏时间: 0
        }
      });
      
      // 保存当前存档ID
      localStorage.setItem(游戏配置.存储键.当前存档, 响应.data.数据.id);
      
      return 响应.data;
    } catch (错误) {
      console.error('创建存档失败:', 错误);
      throw 错误;
    }
  },
  
  /**
   * 获取特定存档
   * @param 存档ID - 存档ID
   * @returns 存档详情
   */
  获取存档: async (存档ID: number) => {
    try {
      const 响应 = await API.get(`/game/save/${存档ID}/`);
      
      // 保存当前存档ID
      localStorage.setItem(游戏配置.存储键.当前存档, 存档ID.toString());
      
      return 响应.data;
    } catch (错误) {
      console.error('获取存档失败:', 错误);
      throw 错误;
    }
  },
  
  /**
   * 更新存档
   * @param 存档ID - 存档ID
   * @param 角色数据 - 角色数据
   * @param 游戏状态 - 游戏状态
   * @returns 更新结果
   */
  更新存档: async (存档ID: number, 角色数据: any, 游戏状态: any) => {
    try {
      const 响应 = await API.put(`/game/save/${存档ID}/`, {
        角色数据: 角色数据,
        游戏状态: 游戏状态
      });
      return 响应.data;
    } catch (错误) {
      console.error('更新存档失败:', 错误);
      throw 错误;
    }
  },
  
  /**
   * 删除存档
   * @param 存档ID - 存档ID
   * @returns 删除结果
   */
  删除存档: async (存档ID: number) => {
    try {
      const 响应 = await API.delete(`/game/save/${存档ID}/`);
      
      // 如果删除的是当前存档，清除当前存档ID
      const 当前存档ID = localStorage.getItem(游戏配置.存储键.当前存档);
      if (当前存档ID === 存档ID.toString()) {
        localStorage.removeItem(游戏配置.存储键.当前存档);
      }
      
      return 响应.data;
    } catch (错误) {
      console.error('删除存档失败:', 错误);
      throw 错误;
    }
  }
};

/**
 * 游戏内容相关API服务
 */
export const 游戏服务 = {
  /**
   * 获取地图数据
   * @param 地图ID - 地图ID
   * @returns 地图数据
   */
  获取地图: async (地图ID: number) => {
    try {
      const 响应 = await API.get(`/game/map/${地图ID}/`);
      return 响应.data;
    } catch (错误) {
      console.error('获取地图数据失败:', 错误);
      throw 错误;
    }
  },
  
  /**
   * 获取NPC数据
   * @param NPCID - NPC ID
   * @returns NPC数据
   */
  获取NPC: async (NPCID: number) => {
    try {
      const 响应 = await API.get(`/game/npc/${NPCID}/`);
      return 响应.data;
    } catch (错误) {
      console.error('获取NPC数据失败:', 错误);
      throw 错误;
    }
  },
  
  /**
   * 获取NPC对话
   * @param NPCID - NPC ID
   * @param 玩家输入 - 玩家输入的对话内容
   * @param 对话历史 - 之前的对话历史
   * @returns 对话内容
   */
  获取NPC对话: async (NPCID: number, 玩家输入?: string, 对话历史?: any[]) => {
    try {
      const 响应 = await API.post(`/game/npc/${NPCID}/dialogue/`, {
        玩家输入: 玩家输入 || '',
        对话历史: 对话历史 || []
      });
      return 响应.data;
    } catch (错误) {
      console.error('获取NPC对话失败:', 错误);
      throw 错误;
    }
  },
  
  /**
   * 获取物品数据
   * @param 物品ID - 物品ID
   * @returns 物品数据
   */
  获取物品: async (物品ID: number) => {
    try {
      const 响应 = await API.get(`/game/item/${物品ID}/`);
      return 响应.data;
    } catch (错误) {
      console.error('获取物品数据失败:', 错误);
      throw 错误;
    }
  },
  
  /**
   * 获取任务列表
   * @returns 任务列表
   */
  获取任务列表: async () => {
    try {
      const 响应 = await API.get('/game/quest/');
      return 响应.data;
    } catch (错误) {
      console.error('获取任务列表失败:', 错误);
      throw 错误;
    }
  },
  
  /**
   * 获取任务详情
   * @param 任务ID - 任务ID
   * @returns 任务详情
   */
  获取任务详情: async (任务ID: number) => {
    try {
      const 响应 = await API.get(`/game/quest/${任务ID}/`);
      return 响应.data;
    } catch (错误) {
      console.error('获取任务详情失败:', 错误);
      throw 错误;
    }
  },
  
  /**
   * 更新任务状态
   * @param 任务ID - 任务ID
   * @param 任务状态 - 任务状态
   * @param 进度 - 任务进度
   * @returns 更新结果
   */
  更新任务状态: async (任务ID: number, 任务状态: string, 进度: any) => {
    try {
      const 响应 = await API.put(`/game/quest/${任务ID}/`, {
        任务状态: 任务状态,
        进度: 进度
      });
      return 响应.data;
    } catch (错误) {
      console.error('更新任务状态失败:', 错误);
      throw 错误;
    }
  }
};

/**
 * AI内容生成相关API服务
 */
export const AI服务 = {
  /**
   * 生成任务
   * @param 上下文 - 游戏上下文
   * @param 难度 - 任务难度
   * @param 类型 - 任务类型
   * @returns 生成的任务内容
   */
  生成任务: async (上下文: string, 难度: '简单' | '中等' | '困难', 类型: '主线' | '支线' | '日常') => {
    try {
      const 响应 = await API.post('/ai/generate/quest/', {
        上下文: 上下文,
        难度: 难度,
        类型: 类型
      });
      return 响应.data;
    } catch (错误) {
      console.error('生成任务失败:', 错误);
      throw 错误;
    }
  },
  
  /**
   * 生成对话
   * @param NPC信息 - NPC信息
   * @param 当前情境 - 当前情境
   * @param 对话历史 - 对话历史
   * @returns 生成的对话内容
   */
  生成对话: async (NPC信息: any, 当前情境: string, 对话历史?: any[]) => {
    try {
      const 响应 = await API.post('/ai/generate/dialogue/', {
        NPC信息: NPC信息,
        当前情境: 当前情境,
        对话历史: 对话历史 || []
      });
      return 响应.data;
    } catch (错误) {
      console.error('生成对话失败:', 错误);
      throw 错误;
    }
  },
  
  /**
   * 生成描述
   * @param 信息 - 物品/地点信息
   * @param 描述类型 - 描述类型
   * @returns 生成的描述文本
   */
  生成描述: async (信息: any, 描述类型: '物品' | '地点' | '人物') => {
    try {
      const 响应 = await API.post('/ai/generate/description/', {
        信息: 信息,
        描述类型: 描述类型
      });
      return 响应.data;
    } catch (错误) {
      console.error('生成描述失败:', 错误);
      throw 错误;
    }
  }
};

export default {
  用户服务,
  存档服务,
  游戏服务,
  AI服务
};
