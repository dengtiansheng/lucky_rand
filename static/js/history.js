// 历史记录页面JavaScript

let currentKeyword = '';

// 页面加载时获取历史记录
document.addEventListener('DOMContentLoaded', function() {
    loadHistory();
    
    // 搜索框回车事件
    const searchInput = document.getElementById('searchKeyword');
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchHistory();
        }
    });
    
    // 搜索框输入事件（实时搜索，可选）
    // searchInput.addEventListener('input', function(e) {
    //     if (e.target.value.trim() === '') {
    //         clearSearch();
    //     }
    // });
});

// 加载历史记录
async function loadHistory(keyword = '') {
    const historyList = document.getElementById('historyList');
    const recordCount = document.getElementById('recordCount');
    const clearBtn = document.getElementById('clearBtn');
    
    historyList.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">加载中...</div>';
    
    try {
        const url = keyword 
            ? `/api/history?limit=100&keyword=${encodeURIComponent(keyword)}`
            : '/api/history?limit=100';
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            currentKeyword = keyword;
            
            if (keyword) {
                clearBtn.style.display = 'inline-block';
                document.getElementById('searchTips').textContent = `找到 ${data.count} 条相关记录`;
            } else {
                clearBtn.style.display = 'none';
                document.getElementById('searchTips').textContent = '';
            }
            
            if (data.data && data.data.length > 0) {
                recordCount.textContent = `共 ${data.count} 条记录`;
                historyList.innerHTML = data.data.map(item => `
                    <div class="history-item" id="history-item-${item.id}">
                        <div class="history-item-header">
                            <h3>${escapeHtml(item.task)}</h3>
                            <button class="delete-history-btn" onclick="deleteHistoryItem(${item.id})" title="删除这条记录">🗑️</button>
                        </div>
                        <div class="history-options">
                            <strong>选项：</strong>${item.options.map(opt => escapeHtml(opt)).join('、')}
                        </div>
                        <div class="history-selected">🎯 选择结果：${escapeHtml(item.selected_option)}</div>
                        <div class="history-story">${escapeHtml(item.story)}</div>
                        <div class="history-time">${item.created_at}</div>
                    </div>
                `).join('');
            } else {
                recordCount.textContent = keyword ? '未找到相关记录' : '暂无记录';
                historyList.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">' + 
                    (keyword ? '没有找到匹配的记录，试试其他关键词吧~' : '还没有任何决策记录，快去首页做一个决策吧！') + 
                    '</div>';
            }
        } else {
            recordCount.textContent = '加载失败';
            historyList.innerHTML = '<div style="text-align: center; padding: 40px; color: #ff6b6b;">' + 
                (data.message || '加载失败，请重试') + 
                '</div>';
        }
    } catch (error) {
        console.error('Error:', error);
        recordCount.textContent = '加载失败';
        historyList.innerHTML = '<div style="text-align: center; padding: 40px; color: #ff6b6b;">网络错误，请重试</div>';
    }
}

// 搜索历史记录
function searchHistory() {
    const keyword = document.getElementById('searchKeyword').value.trim();
    loadHistory(keyword);
}

// 清除搜索
function clearSearch() {
    document.getElementById('searchKeyword').value = '';
    loadHistory('');
}

// 删除历史记录
async function deleteHistoryItem(recordId) {
    if (!confirm('确定要删除这条记录吗？')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/history/${recordId}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        
        if (data.success) {
            // 从页面中移除该记录
            const itemElement = document.getElementById(`history-item-${recordId}`);
            if (itemElement) {
                itemElement.style.transition = 'opacity 0.3s, transform 0.3s';
                itemElement.style.opacity = '0';
                itemElement.style.transform = 'translateX(-20px)';
                setTimeout(() => {
                    itemElement.remove();
                    
                    // 重新加载历史记录（保持当前搜索状态）
                    loadHistory(currentKeyword);
                }, 300);
            }
        } else {
            alert(data.message || '删除失败，请重试');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('网络错误，请重试');
    }
}

// HTML转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

