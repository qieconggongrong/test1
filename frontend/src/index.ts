/**
 * 游戏主入口文件
 */
import Phaser from 'phaser';
import { 启动场景 } from './scenes/启动场景';
import { 登录场景 } from './scenes/登录场景';
import { 主菜单场景 } from './scenes/主菜单场景';
import { 游戏场景 } from './scenes/游戏场景';
import { 对话场景 } from './scenes/对话场景';
import { 背包场景 } from './scenes/背包场景';
import { 任务场景 } from './scenes/任务场景';
import { 游戏配置 } from './config/游戏配置';

// 游戏配置
const 配置: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 游戏配置.宽度,
  height: 游戏配置.高度,
  parent: 'game-container',
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 }, // 同时提供 x 和 y
      debug: false
    }
  },
  scene: [
    启动场景,
    登录场景,
    主菜单场景,
    游戏场景,
    对话场景,
    背包场景,
    任务场景
  ],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

// 创建游戏实例
window.addEventListener('load', () => {
  new Phaser.Game(配置);
});
