# AI驱动的动态叙事像素RPG

这是一个前后端分离的AI驱动像素风格RPG游戏项目，通过AI技术实现动态叙事和游戏内容生成。

## 项目结构

项目采用前后端分离架构，分为以下两个主要部分：

### 前端 (frontend)

基于Phaser.js的像素风格RPG游戏客户端，负责游戏渲染、用户交互和界面展示。

```
frontend/
├── public/              # 静态资源
├── src/                 # 源代码
│   ├── config/          # 游戏配置
│   ├── scenes/          # 游戏场景
│   ├── objects/         # 游戏对象
│   ├── ui/              # 用户界面组件
│   ├── services/        # API服务
│   └── utils/           # 工具函数
├── package.json         # 项目依赖
└── webpack.config.js    # 构建配置
```

### 后端 (backend)

基于Django和Django REST Framework的游戏服务器，负责用户认证、游戏数据存储和AI内容生成。

```
backend/
├── project/             # Django项目配置
├── apps/                # 应用模块
│   ├── auth_app/        # 用户认证（注意：已重命名以避免与Django内置auth冲突）
│   ├── game/            # 游戏核心
│   └── ai/              # AI内容生成
├── utils/               # 工具函数
└── manage.py            # Django命令行工具
```

## 技术栈

### 前端
- Phaser.js：HTML5游戏框架
- TypeScript：类型安全的JavaScript超集
- Webpack：模块打包工具
- Axios：HTTP客户端

### 后端
- Django：Python Web框架
- Django REST Framework：RESTful API框架
- JWT：用户认证
- SQLite：默认数据库（开发环境）

## 功能特性

- 用户注册与登录系统
- 角色创建与存档管理
- 像素风格地图探索
- NPC交互与对话系统
- 任务系统
- 背包与物品管理
- AI驱动的动态内容生成
  - 任务生成
  - 对话生成
  - 描述生成

## 详细安装与运行指南

### 后端设置（无需实际数据库）

1. **创建虚拟环境**:
```bash
cd ai_rpg_project/backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

2. **安装依赖**:
```bash
pip install -r requirements.txt
```

**重要提示**：项目默认使用SQLite数据库，不需要安装MySQL或其他数据库软件。requirements.txt中已移除mysqlclient依赖，避免不必要的安装错误。如果您确实需要使用MySQL，请参考下方的"常见问题解答"部分。

3. **配置SQLite数据库**（无需安装额外数据库）:
Django默认使用SQLite作为开发数据库，您无需安装任何数据库软件。在`backend/project/settings.py`中，数据库配置已设置为使用SQLite：

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

4. **运行数据库迁移**:
```bash
python manage.py makemigrations
python manage.py migrate
```

5. **创建超级用户**（可选）:
```bash
python manage.py createsuperuser
```

6. **启动后端服务器**:
```bash
uv run python manage.py migrate
```
后端服务将在 http://localhost:8000 运行

### 前端设置

1. **安装Node.js依赖**:
```bash
cd ai_rpg_project/frontend
npm install
```

2. **配置API地址**:
如果需要，在`frontend/src/config/游戏配置.ts`中修改API基础URL：
```typescript
API基础URL: 'http://localhost:8000/api'
```

3. **启动开发服务器**:
```bash
npm run dev
```
前端服务将在 http://localhost:8080 运行

### 测试账户（开发模式）

在开发模式下，您可以使用以下测试账户：
- 用户名: test
- 密码: test123

或者通过注册功能创建新账户。

### 游戏资源

本项目需要以下游戏资源文件，请确保它们位于正确的目录中：

```
frontend/public/assets/
├── characters/          # 角色精灵
│   ├── player.png       # 玩家角色
│   └── npc.png          # NPC角色
├── tiles/               # 地图瓦片
│   └── tileset.png      # 瓦片集
├── maps/                # 地图数据
│   └── village.json     # 村庄地图
├── ui/                  # 界面元素
│   ├── button.png       # 按钮
│   ├── dialog.png       # 对话框
│   └── inventory.png    # 物品栏
└── audio/               # 音频资源
    ├── background.mp3   # 背景音乐
    └── click.mp3        # 点击音效
```

如果这些资源文件不存在，游戏可能无法正常运行。您可以使用自己的像素风格资源替换这些文件，或者从网上下载免费的像素风格游戏资源。

## 常见问题解答

### 数据库相关

**Q: 我需要安装MySQL或其他数据库吗？**  
A: 不需要。本项目默认使用SQLite作为开发数据库，它是一个文件型数据库，无需安装额外软件。Django会自动创建和管理SQLite数据库文件。

**Q: 安装依赖时出现mysqlclient相关错误怎么办？**  
A: 我们已经从requirements.txt中移除了mysqlclient依赖，因为项目默认使用SQLite。如果您仍然遇到此类错误，请确保使用的是最新版本的项目文件。

**Q: 如何切换到MySQL或PostgreSQL？**  
A: 如果您确实需要使用MySQL，请按照以下步骤操作：
1. 在Windows上，先安装MySQL或MariaDB服务器和连接器C库
2. 手动安装mysqlclient：`pip install mysqlclient`
3. 在`backend/project/settings.py`中修改DATABASES配置：
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'your_db_name',
        'USER': 'your_db_user',
        'PASSWORD': 'your_db_password',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
```

### 前端相关

**Q: 游戏画面显示不出来或报错**  
A: 请检查以下几点：
1. 确保所有游戏资源文件都已放置在正确位置
2. 检查浏览器控制台是否有错误信息
3. 确认后端API服务器正在运行
4. 检查API基础URL配置是否正确

**Q: 如何添加新的游戏场景或功能？**  
A: 在`frontend/src/scenes/`目录下创建新的场景类，然后在`index.ts`中注册该场景。

### 后端相关

**Q: API返回404错误**  
A: 请检查：
1. 后端服务器是否正在运行
2. API路径是否正确
3. Django的URL配置是否正确

**Q: 找不到manage.py文件怎么办？**  
A: manage.py文件应位于backend目录下。如果找不到，请确保您使用的是最新版本的项目文件。

**Q: 运行Django命令时出现"Application labels aren't unique, duplicates: auth"错误**  
A: 这是因为Django内置的auth应用与项目中的auth应用名称冲突。在最新版本中，我们已将自定义auth应用重命名为auth_app以避免此问题。如果您仍然遇到此错误，请确保使用的是最新版本的项目文件。

**Q: 如何添加新的API端点？**  
A: 在相应的app目录下创建或修改views.py和urls.py文件，然后在主urls.py中注册新的URL路径。

### DeepSeek AI相关

**Q: 如何配置DeepSeek AI接口？**  
A: 在`backend/project/settings.py`文件中添加以下配置：
```python
# DeepSeek AI API配置
DEEPSEEK_API_KEY = "您的DeepSeek API密钥"  # 替换为您的实际API密钥
DEEPSEEK_API_URL = "https://api.deepseek.com"  # DeepSeek API的基础URL
```

**Q: 没有DeepSeek API密钥可以运行吗？**  
A: 可以。如果没有设置API密钥，系统会使用模拟数据进行响应，这在开发和测试阶段非常有用。

## API文档

详细的API设计和使用说明请参考 [api_design.md](api_design.md) 文件。

## 前后端分离开发规范

本项目严格遵循前后端分离架构，前端和后端通过RESTful API进行通信。开发时请遵循以下规范：

1. 前端只通过API与后端交互，不直接操作数据库
2. 后端提供标准化的RESTful API接口
3. 使用JWT进行用户认证
4. 所有API响应使用统一的数据格式
5. 所有代码注释、命名、界面文本和游戏对话均使用中文

## 中文规范

本项目所有内容均采用中文表达，包括但不限于：

1. 代码注释
2. 变量、函数、类命名
3. 用户界面文本
4. 游戏内对话
5. 文档说明

## 开发团队

- 前端开发：AI驱动的动态叙事像素RPG团队
- 后端开发：AI驱动的动态叙事像素RPG团队
- 游戏设计：AI驱动的动态叙事像素RPG团队
- AI集成：AI驱动的动态叙事像素RPG团队
