# 部署指南

## 本地开发环境部署

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 配置数据库

#### 方式一：使用环境变量（推荐，安全）

**Windows PowerShell:**
```powershell
$env:DB_HOST="localhost"
$env:DB_PORT="3306"
$env:DB_USER="root"
$env:DB_PASSWORD="your_password"
$env:DB_NAME="lucky_rand"
$env:FLASK_DEBUG="True"
```

**Linux/Mac:**
```bash
export DB_HOST=localhost
export DB_PORT=3306
export DB_USER=root
export DB_PASSWORD=your_password
export DB_NAME=lucky_rand
export FLASK_DEBUG=True
```

**Windows CMD:**
```cmd
set DB_HOST=localhost
set DB_PORT=3306
set DB_USER=root
set DB_PASSWORD=your_password
set DB_NAME=lucky_rand
set FLASK_DEBUG=True
```

⚠️ **注意**：请勿在代码中硬编码数据库密码等敏感信息！

### 3. 初始化数据库

执行 SQL 脚本：

```bash
mysql -u root -p < init_db.sql
```

或者手动执行：

```sql
CREATE DATABASE IF NOT EXISTS lucky_rand CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lucky_rand;
-- 然后执行 init_db.sql 中的表创建语句
```

### 4. 运行应用

```bash
python app.py
```

应用将在 http://localhost:9000 启动

## 腾讯云 Serverless 部署

### 前置要求

1. 安装 Serverless Framework CLI：

```bash
npm install -g serverless
```

2. 配置腾讯云凭证：

```bash
serverless config credentials \
  --provider tencent \
  --key <your-secret-id> \
  --secret <your-secret-key>
```

### 部署步骤

1. **配置环境变量**

在 `serverless.yml` 中配置数据库连接信息，或使用环境变量：

```bash
export DB_HOST=your_db_host
export DB_USER=your_db_user
export DB_PASSWORD=your_db_password
export DB_NAME=lucky_rand
```

2. **部署到腾讯云**

```bash
serverless deploy
```

3. **访问应用**

部署成功后，会返回 API Gateway 的访问地址。

### 注意事项

1. **数据库配置**：确保 MySQL 数据库允许 Serverless 函数的 IP 访问
2. **静态文件**：确保 `static` 和 `templates` 目录被正确打包
3. **端口配置**：Serverless 环境下不需要指定端口，API Gateway 会自动处理
4. **数据库初始化**：首次部署后，需要在数据库中手动执行 `init_db.sql` 创建表结构

### 数据库初始化（Serverless环境）

在 Serverless 环境下，数据库表的创建需要在首次请求时自动完成，代码中已经包含了 `init_database()` 函数，会在应用启动时自动执行。

如果自动初始化失败，可以：

1. 通过 MySQL 客户端手动执行 `init_db.sql`
2. 或者通过云数据库控制台执行 SQL 脚本

## 故障排查

### 数据库连接失败

1. 检查数据库配置是否正确
2. 检查数据库服务是否运行
3. 检查防火墙设置
4. 检查数据库用户权限

### 静态文件无法加载

1. 确保 `static` 和 `templates` 目录存在
2. 检查 Flask 的静态文件路径配置
3. 在 Serverless 环境下，确保这些目录被正确打包

### 端口被占用

如果 9000 端口被占用，可以修改 `app.py` 中的端口号：

```python
app.run(host='0.0.0.0', port=9000, debug=True)
```

## 测试

### 测试决策功能

使用 curl 或 Postman 测试 API：

```bash
curl -X POST http://localhost:9000/api/make_decision \
  -H "Content-Type: application/json" \
  -d '{
    "task": "是否要换工作？",
    "options": ["换工作", "不换工作", "再考虑考虑"]
  }'
```

### 测试历史记录

```bash
curl http://localhost:9000/api/history?limit=10
```

