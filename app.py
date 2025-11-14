# -*- coding: utf-8 -*-
"""
人生决策骰子模拟器
Life Decision Dice Simulator
"""
from flask import Flask, render_template, request, jsonify
import pymysql
import random
import json
from datetime import datetime
import config

app = Flask(__name__)

# 数据库配置（从config模块导入，统一管理）
DB_CONFIG = {
    'host': config.DB_HOST,
    'user': config.DB_USER,
    'password': config.DB_PASSWORD,
    'database': config.DB_NAME,
    'charset': 'utf8mb4',
    'port': config.DB_PORT
}

# 祝福语库
BLESSINGS = [
    "🎉 恭喜你！这个选择将为你开启新的篇章！",
    "✨ 太棒了！命运之轮正在为你转动！",
    "🌟 这是一个绝佳的选择！未来充满无限可能！",
    "🎊 勇敢的决定！你正在书写属于自己的传奇！",
    "💫 明智的选择！好运将伴随你左右！",
    "🎈 太精彩了！这个决定将带来意想不到的惊喜！",
    "🎁 完美！你抓住了命运的尾巴！",
    "🏆 优秀！这个选择将引领你走向成功！",
    "🎯 精准！你做出了最正确的决定！",
    "🚀 太棒了！准备好迎接美好的未来吧！"
]

# 故事模板库
STORY_TEMPLATES = [
    "你选择了「{option}」。起初，一切看起来都很平常，但随着时间的推移，这个决定像蝴蝶扇动翅膀一样，引发了一系列连锁反应。{outcome}",
    "「{option}」——这个看似简单的选择，实际上是你人生路上的一个重要转折点。{outcome}",
    "当你决定选择「{option}」时，命运的齿轮开始转动。{outcome}",
    "「{option}」成为了你的选择。在未来的日子里，{outcome}",
    "你勇敢地选择了「{option}」。这个决定将带你走向一个全新的世界，{outcome}"
]

# 结果描述库
OUTCOMES = [
    "你发现这个选择带来了意想不到的机遇，生活变得更加丰富多彩。",
    "虽然过程中遇到了一些挑战，但你从中获得了宝贵的经验和成长。",
    "这个决定让你结识了新的朋友，拓展了你的视野和认知。",
    "你发现这个选择完美契合了你的内心，让你感到前所未有的满足。",
    "这个决定开启了你人生中一段精彩的旅程，充满了惊喜和收获。",
    "你发现这个选择让你离梦想更近了一步，每一天都充满希望。",
    "这个决定虽然充满未知，但正是这种不确定性让生活变得有趣。",
    "你发现这个选择让你成为了更好的自己，收获了内心的平静和快乐。"
]


def get_db_connection():
    """获取数据库连接"""
    try:
        connection = pymysql.connect(**DB_CONFIG)
        return connection
    except Exception as e:
        print(f"数据库连接失败: {e}")
        return None


def init_database():
    """初始化数据库表"""
    connection = get_db_connection()
    if not connection:
        return False
    
    try:
        with connection.cursor() as cursor:
            # 创建决策记录表
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS decisions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    task VARCHAR(500) NOT NULL,
                    options TEXT NOT NULL,
                    selected_option VARCHAR(500) NOT NULL,
                    story TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """)
            connection.commit()
            print("数据库表初始化成功")
            return True
    except Exception as e:
        print(f"数据库初始化失败: {e}")
        return False
    finally:
        connection.close()


@app.route('/')
def index():
    """首页"""
    return render_template('index.html')


@app.route('/history')
def history():
    """历史记录页面"""
    return render_template('history.html')


@app.route('/api/make_decision', methods=['POST'])
def make_decision():
    """处理决策请求"""
    try:
        data = request.get_json()
        task = data.get('task', '').strip()
        options = data.get('options', [])
        
        if not task:
            return jsonify({'success': False, 'message': '请输入决策任务'}), 400
        
        if not options or len(options) < 2:
            return jsonify({'success': False, 'message': '至少需要2个选项'}), 400
        
        # 过滤空选项
        options = [opt.strip() for opt in options if opt.strip()]
        if len(options) < 2:
            return jsonify({'success': False, 'message': '至少需要2个有效选项'}), 400
        
        # 随机选择一个选项
        selected_option = random.choice(options)
        
        # 生成祝福语
        blessing = random.choice(BLESSINGS)
        
        # 生成故事
        story_template = random.choice(STORY_TEMPLATES)
        outcome = random.choice(OUTCOMES)
        story = story_template.format(option=selected_option, outcome=outcome)
        
        # 保存到数据库
        connection = get_db_connection()
        if connection:
            try:
                with connection.cursor() as cursor:
                    sql = """
                        INSERT INTO decisions (task, options, selected_option, story)
                        VALUES (%s, %s, %s, %s)
                    """
                    cursor.execute(sql, (
                        task,
                        json.dumps(options, ensure_ascii=False),
                        selected_option,
                        story
                    ))
                    connection.commit()
            except Exception as e:
                print(f"保存数据失败: {e}")
            finally:
                connection.close()
        
        return jsonify({
            'success': True,
            'selected_option': selected_option,
            'blessing': blessing,
            'story': story,
            'all_options': options
        })
    
    except Exception as e:
        print(f"处理请求失败: {e}")
        return jsonify({'success': False, 'message': f'服务器错误: {str(e)}'}), 500


@app.route('/api/history', methods=['GET'])
def get_history():
    """获取历史记录"""
    try:
        limit = int(request.args.get('limit', 50))
        keyword = request.args.get('keyword', '').strip()
        connection = get_db_connection()
        
        if not connection:
            return jsonify({'success': False, 'message': '数据库连接失败'}), 500
        
        try:
            with connection.cursor(pymysql.cursors.DictCursor) as cursor:
                if keyword:
                    # 带关键词搜索
                    sql = """
                        SELECT id, task, options, selected_option, story, created_at
                        FROM decisions
                        WHERE task LIKE %s 
                           OR selected_option LIKE %s
                           OR story LIKE %s
                        ORDER BY created_at DESC
                        LIMIT %s
                    """
                    search_pattern = f'%{keyword}%'
                    cursor.execute(sql, (search_pattern, search_pattern, search_pattern, limit))
                else:
                    # 无关键词，返回所有记录
                    sql = """
                        SELECT id, task, options, selected_option, story, created_at
                        FROM decisions
                        ORDER BY created_at DESC
                        LIMIT %s
                    """
                    cursor.execute(sql, (limit,))
                
                results = cursor.fetchall()
                
                # 解析JSON格式的options
                for result in results:
                    result['options'] = json.loads(result['options'])
                    result['created_at'] = result['created_at'].strftime('%Y-%m-%d %H:%M:%S')
                
                return jsonify({'success': True, 'data': results, 'count': len(results)})
        except Exception as e:
            print(f"查询历史失败: {e}")
            return jsonify({'success': False, 'message': f'查询失败: {str(e)}'}), 500
        finally:
            connection.close()
    
    except Exception as e:
        return jsonify({'success': False, 'message': f'服务器错误: {str(e)}'}), 500


@app.route('/api/history/<int:record_id>', methods=['DELETE'])
def delete_history(record_id):
    """删除历史记录"""
    try:
        connection = get_db_connection()
        
        if not connection:
            return jsonify({'success': False, 'message': '数据库连接失败'}), 500
        
        try:
            with connection.cursor() as cursor:
                # 检查记录是否存在
                cursor.execute("SELECT id FROM decisions WHERE id = %s", (record_id,))
                if not cursor.fetchone():
                    return jsonify({'success': False, 'message': '记录不存在'}), 404
                
                # 删除记录
                cursor.execute("DELETE FROM decisions WHERE id = %s", (record_id,))
                connection.commit()
                
                return jsonify({'success': True, 'message': '删除成功'})
        except Exception as e:
            print(f"删除历史失败: {e}")
            connection.rollback()
            return jsonify({'success': False, 'message': f'删除失败: {str(e)}'}), 500
        finally:
            connection.close()
    
    except Exception as e:
        return jsonify({'success': False, 'message': f'服务器错误: {str(e)}'}), 500


if __name__ == '__main__':
    # 初始化数据库
    init_database()
    # 启动Flask应用，端口9000
    app.run(host='0.0.0.0', port=9000, debug=True)

