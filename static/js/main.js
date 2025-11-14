// 添加选项
function addOption() {
    const container = document.getElementById('options-container');
    const optionCount = container.children.length;
    
    if (optionCount >= 10) {
        alert('最多只能添加10个选项');
        return;
    }
    
    const optionDiv = document.createElement('div');
    optionDiv.className = 'option-input';
    optionDiv.innerHTML = `
        <input type="text" class="option" placeholder="选项 ${optionCount + 1}" maxlength="100">
        <button type="button" class="remove-option" onclick="removeOption(this)">×</button>
    `;
    
    container.appendChild(optionDiv);
    updateRemoveButtons();
}

// 删除选项
function removeOption(btn) {
    const container = document.getElementById('options-container');
    if (container.children.length <= 2) {
        alert('至少需要2个选项');
        return;
    }
    
    btn.parentElement.remove();
    updateRemoveButtons();
}

// 更新删除按钮显示状态
function updateRemoveButtons() {
    const container = document.getElementById('options-container');
    const removeButtons = container.querySelectorAll('.remove-option');
    
    if (container.children.length > 2) {
        removeButtons.forEach(btn => btn.style.display = 'block');
    } else {
        removeButtons.forEach(btn => btn.style.display = 'none');
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    updateRemoveButtons();
    
    // 允许按Enter键提交
    document.getElementById('task').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            makeDecision();
        }
    });
    
    // 选项输入框也支持Enter
    const optionInputs = document.querySelectorAll('.option');
    optionInputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                makeDecision();
            }
        });
    });
});

// 做出决策
async function makeDecision() {
    const task = document.getElementById('task').value.trim();
    const optionInputs = document.querySelectorAll('.option');
    const options = Array.from(optionInputs)
        .map(input => input.value.trim())
        .filter(opt => opt.length > 0);
    
    // 验证输入
    if (!task) {
        alert('请输入决策任务');
        document.getElementById('task').focus();
        return;
    }
    
    if (options.length < 2) {
        alert('至少需要2个有效选项');
        return;
    }
    
    // 禁用按钮
    const decisionBtn = document.getElementById('decisionBtn');
    decisionBtn.disabled = true;
    decisionBtn.textContent = '正在开启...';
    
    // 隐藏结果
    document.getElementById('resultContainer').style.display = 'none';
    
    // 显示盲盒
    const boxContainer = document.getElementById('boxContainer');
    boxContainer.style.display = 'block';
    
    const boxTop = document.querySelector('.box-top');
    const boxContent = document.getElementById('boxContent');
    
    // 重置盲盒状态
    boxTop.classList.remove('open');
    boxContent.innerHTML = '<div class="loading-text">正在为你开启...</div>';
    
    // 延迟一下再开始动画
    setTimeout(() => {
        // 发送请求
        fetch('/api/make_decision', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                task: task,
                options: options
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // 开始开盲盒动画
                setTimeout(() => {
                    boxTop.classList.add('open');
                    
                    // 延迟显示内容
                    setTimeout(() => {
                        boxContent.innerHTML = `
                            <div style="font-size: 1.5em; margin-bottom: 10px;">🎉</div>
                            <div>${data.selected_option}</div>
                        `;
                        
                        // 延迟显示结果
                        setTimeout(() => {
                            showResult(data);
                            boxContainer.style.display = 'none';
                        }, 1000);
                    }, 500);
                }, 500);
            } else {
                alert(data.message || '请求失败，请重试');
                resetUI();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('网络错误，请重试');
            resetUI();
        });
    }, 300);
}

// 显示结果
function showResult(data) {
    const resultContainer = document.getElementById('resultContainer');
    document.getElementById('blessing').textContent = data.blessing;
    document.getElementById('selectedOption').textContent = data.selected_option;
    document.getElementById('story').textContent = data.story;
    
    resultContainer.style.display = 'block';
    
    // 滚动到结果
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// 重置UI
function resetUI() {
    const decisionBtn = document.getElementById('decisionBtn');
    decisionBtn.disabled = false;
    decisionBtn.textContent = '🎁 开启幸运盲盒';
    
    document.getElementById('boxContainer').style.display = 'none';
}

// 重置表单
function resetForm() {
    document.getElementById('task').value = '';
    const optionInputs = document.querySelectorAll('.option');
    optionInputs.forEach((input, index) => {
        input.value = '';
        input.placeholder = `选项 ${index + 1}`;
    });
    
    // 如果选项超过2个，删除多余的
    const container = document.getElementById('options-container');
    while (container.children.length > 2) {
        container.removeChild(container.lastChild);
    }
    
    updateRemoveButtons();
    document.getElementById('resultContainer').style.display = 'none';
    document.getElementById('boxContainer').style.display = 'none';
    resetUI();
    
    // 聚焦到任务输入框
    document.getElementById('task').focus();
}

// 查看历史
async function viewHistory() {
    const historyContainer = document.getElementById('historyContainer');
    const historyList = document.getElementById('historyList');
    
    historyList.innerHTML = '<div style="text-align: center; padding: 20px; color: #999;">加载中...</div>';
    historyContainer.style.display = 'block';
    
    try {
        const response = await fetch('/api/history?limit=20');
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
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
            historyList.innerHTML = '<div style="text-align: center; padding: 20px; color: #999;">暂无历史记录</div>';
        }
    } catch (error) {
        console.error('Error:', error);
        historyList.innerHTML = '<div style="text-align: center; padding: 20px; color: #ff6b6b;">加载失败，请重试</div>';
    }
    
    historyContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// 关闭历史记录
function closeHistory() {
    document.getElementById('historyContainer').style.display = 'none';
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
                    
                    // 如果删除后没有记录了，显示提示
                    const historyList = document.getElementById('historyList');
                    if (historyList.children.length === 0) {
                        historyList.innerHTML = '<div style="text-align: center; padding: 20px; color: #999;">暂无历史记录</div>';
                    }
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

