# 🎲 人生决策骰子模拟器

一个帮你"模拟"人生重大决策后果的娱乐化工具。它不提供答案，只帮你可视化可能性。

## ✨ 功能特点

- 🎯 **决策输入**：输入你的决策任务和多个选项
- 🎁 **幸运盲盒**：点击按钮后会有精美的开盲盒动画效果
- 🎉 **随机决策**：系统随机为你选择一个选项
- 📖 **故事生成**：为每个决策生成一个充满想象力的未来故事
- 📚 **历史记录**：保存并查看你的所有决策历史，支持关键词搜索
- 🗑️ **记录管理**：可以删除不需要的历史记录
- 💫 **祝福语**：每次决策都会收到喜庆的祝福

## 🚀 快速开始

### 环境要求

- Python 3.6+
- MySQL 5.7+ 或兼容数据库（如 MariaDB）
- pip

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd lucky_rand
```

2. **安装依赖**
```bash
pip install -r requirements.txt
```

3. **配置数据库**

创建MySQL数据库：
```sql
CREATE DATABASE lucky_rand CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

初始化数据库表（可选，应用首次运行时会自动创建）：
```bash
mysql -u root -p lucky_rand < init_db.sql
```

4. **配置环境变量**

**方式一：使用环境变量（推荐）**

Linux/Mac:
```bash
export DB_HOST=localhost
export DB_PORT=3306
export DB_USER=root
export DB_PASSWORD=your_password
export DB_NAME=lucky_rand
export FLASK_DEBUG=True
```

Windows PowerShell:
```powershell
$env:DB_HOST="localhost"
$env:DB_PORT="3306"
$env:DB_USER="root"
$env:DB_PASSWORD="your_password"
$env:DB_NAME="lucky_rand"
$env:FLASK_DEBUG="True"
```

Windows CMD:
```cmd
set DB_HOST=localhost
set DB_PORT=3306
set DB_USER=root
set DB_PASSWORD=your_password
set DB_NAME=lucky_rand
set FLASK_DEBUG=True
```

**方式二：创建 .env 文件（需要安装 python-dotenv）**

在项目根目录创建 `.env` 文件：
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=lucky_rand
FLASK_DEBUG=True
```

⚠️ **重要**：`.env` 文件包含敏感信息，已被 `.gitignore` 忽略，不会提交到代码仓库。

5. **运行应用**
```bash
python app.py
```

6. **访问应用**

打开浏览器访问：http://localhost:9000

## 📁 项目结构

```
lucky_rand/
├── app.py                  # Flask主应用
├── config.py               # 配置文件
├── requirements.txt        # Python依赖
├── init_db.sql            # 数据库初始化脚本
├── README.md              # 项目说明
├── DEPLOY.md              # 部署指南
├── serverless.yml         # Serverless配置（可选）
├── .gitignore             # Git忽略文件
├── templates/             # HTML模板
│   ├── index.html         # 主页面
│   └── history.html       # 历史记录页面
└── static/               # 静态文件
    ├── css/
    │   └── style.css      # 样式文件
    └── js/
        ├── main.js        # 主页面JavaScript
        └── history.js     # 历史页面JavaScript
```

## 🎮 使用说明

1. **输入决策任务**：在"你的决策任务"输入框中输入你的问题，例如"是否要换工作？"

2. **添加选项**：至少输入2个选项，可以点击"+ 添加选项"按钮添加更多选项（最多10个）

3. **开启盲盒**：点击"🎁 开启幸运盲盒"按钮，观看精美的开盲盒动画

4. **查看结果**：系统会随机选择一个选项，并生成一个关于未来的故事

5. **查看历史**：
   - 点击右上角"📚 查看历史"按钮进入历史记录页面
   - 在搜索框输入关键词可以搜索历史记录
   - 点击记录右上角的🗑️按钮可以删除记录

## 🎨 技术栈

- **后端框架**：Flask 1.1.4
- **数据库**：MySQL (PyMySQL)
- **前端技术**：HTML5 + CSS3 + JavaScript (原生)
- **动画效果**：CSS3 Animations
- **部署支持**：腾讯云 Serverless Framework

## 📝 API接口

### POST /api/make_decision
做出决策

**请求体**：
```json
{
  "task": "是否要换工作？",
  "options": ["换工作", "不换工作", "再考虑考虑"]
}
```

**响应**：
```json
{
  "success": true,
  "selected_option": "换工作",
  "blessing": "🎉 恭喜你！这个选择将为你开启新的篇章！",
  "story": "你选择了「换工作」。起初，一切看起来都很平常...",
  "all_options": ["换工作", "不换工作", "再考虑考虑"]
}
```

### GET /api/history
获取历史记录

**查询参数**：
- `limit`: 返回记录数量（默认50）
- `keyword`: 搜索关键词（可选，会在任务、选项、故事中搜索）

**响应**：
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "id": 1,
      "task": "是否要换工作？",
      "options": ["换工作", "不换工作"],
      "selected_option": "换工作",
      "story": "...",
      "created_at": "2024-01-01 12:00:00"
    }
  ]
}
```

### DELETE /api/history/<record_id>
删除历史记录

**响应**：
```json
{
  "success": true,
  "message": "删除成功"
}
```

## 🔒 安全说明

本项目已做安全处理：
- ✅ 所有数据库敏感信息通过环境变量配置
- ✅ `.env` 文件已加入 `.gitignore`，不会被提交
- ✅ 代码中不包含任何硬编码的密码或敏感信息
- ✅ 支持通过环境变量灵活配置

**开源前请确认**：
- 检查代码中是否还有硬编码的敏感信息
- 确认 `.env` 文件已加入 `.gitignore`
- 不要在代码注释中留下敏感信息

## 🚀 部署

### 本地部署
参考 [DEPLOY.md](DEPLOY.md) 文件了解详细的部署说明。

### Serverless 部署
项目支持腾讯云 Serverless Framework 部署，配置文件为 `serverless.yml`。

## 💡 设计理念

这个工具用戏谑的方式提醒我们：
- 人生没有标准答案
- 充满了蝴蝶效应
- 每个选择都可能引向截然不同的人生路径
- 这本身就是一种哲学思考

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## ⚠️ 免责声明

本工具仅供娱乐使用，真正的决策还是要靠你自己哦！

## 📄 许可证

MIT License

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！
