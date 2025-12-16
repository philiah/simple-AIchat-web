const chatContainer = document.getElementById('chatContainer');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const charCount = document.getElementById('charCount');

// 自动调整输入框高度
messageInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    charCount.textContent = this.value.length;
});

// 回车发送（Shift+Enter换行）
messageInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// 发送按钮点击事件
sendButton.addEventListener('click', sendMessage);

// 发送消息函数
async function sendMessage() {
    const message = messageInput.value.trim();
    
    if (!message) {
        return;
    }
    
    // 禁用输入和按钮
    messageInput.disabled = true;
    sendButton.disabled = true;
    
    // 添加用户消息到聊天界面
    addMessage(message, 'user');
    
    // 清空输入框
    messageInput.value = '';
    messageInput.style.height = 'auto';
    charCount.textContent = '0';
    
    // 显示加载动画
    const loadingId = showLoading();
    
    try {
        // 调用后端API
        console.log('发送消息:', message);
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        });
        
        console.log('响应状态:', response.status, response.statusText);
        
        // 检查响应是否成功
        if (!response.ok) {
            // 尝试解析错误信息
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
            }
            removeLoading(loadingId);
            addMessage(`错误: ${errorData.error || '请求失败'}`, 'ai', true);
            console.error('API错误:', errorData);
            return;
        }
        
        const data = await response.json();
        console.log('收到回复:', data);
        
        // 移除加载动画
        removeLoading(loadingId);
        
        if (data.message) {
            // 添加AI回复
            addMessage(data.message, 'ai');
        } else if (data.error) {
            // 显示错误消息
            addMessage(`错误: ${data.error}`, 'ai', true);
        } else {
            addMessage('错误: 收到无效的响应', 'ai', true);
        }
    } catch (error) {
        removeLoading(loadingId);
        console.error('网络错误:', error);
        addMessage(`网络错误: ${error.message}。请检查后端服务器是否正在运行。`, 'ai', true);
    } finally {
        // 恢复输入和按钮
        messageInput.disabled = false;
        sendButton.disabled = false;
        messageInput.focus();
    }
}

// 添加消息到聊天界面
function addMessage(text, sender, isError = false) {
    // 移除欢迎消息
    const welcomeMsg = chatContainer.querySelector('.welcome-message');
    if (welcomeMsg) {
        welcomeMsg.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = isError ? 'message-content error-message' : 'message-content';
    contentDiv.textContent = text;
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = getCurrentTime();
    
    messageDiv.appendChild(contentDiv);
    messageDiv.appendChild(timeDiv);
    chatContainer.appendChild(messageDiv);
    
    // 滚动到底部
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// 显示加载动画
function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message ai';
    loadingDiv.id = 'loading-' + Date.now();
    
    const loadingContent = document.createElement('div');
    loadingContent.className = 'loading';
    loadingContent.innerHTML = `
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
    `;
    
    loadingDiv.appendChild(loadingContent);
    chatContainer.appendChild(loadingDiv);
    
    // 滚动到底部
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    return loadingDiv.id;
}

// 移除加载动画
function removeLoading(loadingId) {
    const loadingElement = document.getElementById(loadingId);
    if (loadingElement) {
        loadingElement.remove();
    }
}

// 获取当前时间
function getCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

// 页面加载时聚焦输入框
window.addEventListener('load', () => {
    messageInput.focus();
});
