-- 数据库初始化脚本
-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS lucky_rand CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE lucky_rand;

-- 创建决策记录表
CREATE TABLE IF NOT EXISTS decisions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task VARCHAR(500) NOT NULL COMMENT '决策任务',
    options TEXT NOT NULL COMMENT '所有选项（JSON格式）',
    selected_option VARCHAR(500) NOT NULL COMMENT '选中的选项',
    story TEXT NOT NULL COMMENT '生成的故事',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='决策记录表';

