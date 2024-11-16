// DOM元素获取
const loginBtn = document.getElementById('loginBtn');
const enterClassBtn = document.getElementById('enterClassBtn');
const complaintBtn = document.getElementById('complaintBtn');
const addScoreBtn = document.getElementById('addScoreBtn');
const deductScoreBtn = document.getElementById('deductScoreBtn');
const managerButtons = document.getElementById('managerButtons');

// Modal窗口
const loginModal = document.getElementById('loginModal');
const cipherModal = document.getElementById('cipherModal');
const addScoreModal = document.getElementById('addScoreModal');
const deductScoreModal = document.getElementById('deductScoreModal');

// 关闭所有modal的函数
const closeAllModals = () => {
    [loginModal, cipherModal, addScoreModal, deductScoreModal].forEach(modal => {
        modal.style.display = 'none';
    });
};

// 打开指定modal的函数
const openModal = (modal) => {
    closeAllModals();
    modal.style.display = 'block';
};

// 关闭按钮事件监听
document.querySelectorAll('.closeModal').forEach(button => {
    button.addEventListener('click', closeAllModals);
});

// 点击modal外部关闭
window.addEventListener('click', (e) => {
    [loginModal, cipherModal, addScoreModal, deductScoreModal].forEach(modal => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// 检查登录状态
const checkLoginStatus = () => {
    return document.cookie.includes('manager=');
};

// 检查班级访问权限
const checkClassAccess = () => {
    return document.cookie.includes('class_access=true');
};

// 更新UI状态
const updateUIState = () => {
    const isLoggedIn = checkLoginStatus();
    const hasClassAccess = checkClassAccess();
    
    managerButtons.classList.toggle('hidden', !isLoggedIn);
    loginBtn.textContent = isLoggedIn ? '已登录' : '登录班级管理者';
    loginBtn.disabled = isLoggedIn;
    
    fetchAndDisplayScores();
};

// 格式化显示时间
const formatTime = (timestamp) => {
    const [day, month, hour] = timestamp.split('/');
    return `${month}月${day}日 ${hour}:00`;
};

// 显示分数记录
const displayScoreHistory = (logs, hasClassAccess) => {
    const historyDiv = document.getElementById('scoreHistory');
    historyDiv.innerHTML = '<h2>记录历史</h2>';
    
    logs.forEach(log => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        let content = `${formatTime(log.timestamp)} - 第${log.group}组 `;
        content += `${log.score > 0 ? '加' : '扣'}${Math.abs(log.score)}分 `;
        
        if (hasClassAccess) {
            content += `| 执行者: ${log.operator} | ${log.type === 'add' ? '加分对象' : '扣分对象'}: ${log.target} `;
            content += `| 原因: ${log.reason}`;
        }
        
        historyItem.textContent = content;
        historyDiv.appendChild(historyItem);
    });
};

// 显示得分情况
const displayGroupScores = (groupsScores) => {
    const scoresDiv = document.getElementById('groupScores');
    scoresDiv.innerHTML = '';
    
    // 计算所有组的总分
    const groupTotals = {};
    for (const [group, scores] of Object.entries(groupsScores)) {
        groupTotals[group] = scores.add + scores.deduct;
    }
    
    // 找出最高分
    const maxScore = Math.max(...Object.values(groupTotals));
    
    // 找出所有并列第一的组
    const leadingGroups = Object.entries(groupTotals)
        .filter(([_, score]) => score === maxScore)
        .map(([group, _]) => group)
        .sort((a, b) => a - b);
    
    // 显示每个组的信息
    for (const [group, scores] of Object.entries(groupsScores)) {
        const total = scores.add + scores.deduct;
        const card = document.createElement('div');
        card.className = 'group-card';
        if (total === maxScore) {
            card.classList.add('leading-group');
        }
        card.innerHTML = `
            <h3>第${group}组</h3>
            <p>总分: ${total}</p>
            <p>加分: +${scores.add}</p>
            <p>扣分: ${scores.deduct}</p>
        `;
        scoresDiv.appendChild(card);
    }
    
    // 显示领先组信息
    const leadingText = leadingGroups.length > 1 
        ? `当前并列第一: 第${leadingGroups.join('组、第')}组`
        : `当前领先: 第${leadingGroups[0]}组`;
    document.getElementById('leadingGroup').textContent = leadingText;
};

// 获取并显示分数
const fetchAndDisplayScores = async () => {
    try {
        const response = await fetch('/api/get_scores');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.status === 'error') {
            throw new Error(data.message || '获取数据失败');
        }
        
        displayGroupScores(data.groups_scores);
        displayScoreHistory(data.logs, checkClassAccess());
    } catch (error) {
        console.error('获取分数失败:', error);
    }
};

// 事件监听器设置
loginBtn.addEventListener('click', () => {
    if (!checkLoginStatus()) {
        openModal(loginModal);
    }
});

enterClassBtn.addEventListener('click', () => {
    if (!checkClassAccess()) {
        openModal(cipherModal);
    }
});

complaintBtn.addEventListener('click', () => {
    window.location.href = 'https://1poz.top';
});

addScoreBtn.addEventListener('click', () => openModal(addScoreModal));
deductScoreBtn.addEventListener('click', () => openModal(deductScoreModal));

// 登录表单提交
document.getElementById('loginSubmit').addEventListener('click', async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        if (data.status === 'success') {
            closeAllModals();
            updateUIState();
        } else {
            alert('登录失败: ' + data.message);
        }
    } catch (error) {
        console.error('登录失败:', error);
        alert('登录失败');
    }
});

// 班级密码验证
document.getElementById('cipherSubmit').addEventListener('click', async () => {
    const cipher = document.getElementById('classPassword').value;
    
    try {
        const response = await fetch('/api/verify_class_cipher', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ cipher })
        });
        
        const data = await response.json();
        if (data.status === 'success') {
            closeAllModals();
            updateUIState();
        } else {
            alert('验证失败: ' + data.message);
        }
    } catch (error) {
        console.error('验证失败:', error);
        alert('验证失败');
    }
});

// 加分提交
document.getElementById('addScoreSubmit').addEventListener('click', async () => {
    const group = document.getElementById('addGroup').value;
    const score = parseFloat(document.getElementById('addScore').value);
    const target = document.getElementById('addTarget').value;
    const reason = document.getElementById('addReason').value;
    
    if (!group || !score || !target || !reason) {
        alert('请填写所有字段');
        return;
    }
    
    try {
        const response = await fetch('/api/add_score', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ group, score, target, reason })
        });
        
        const data = await response.json();
        if (data.status === 'success') {
            closeAllModals();
            fetchAndDisplayScores();
        } else {
            alert('加分失败: ' + data.message);
        }
    } catch (error) {
        console.error('加分失败:', error);
        alert('加分失败');
    }
});

// 扣分提交
document.getElementById('deductScoreSubmit').addEventListener('click', async () => {
    const group = document.getElementById('deductGroup').value;
    const score = parseFloat(document.getElementById('deductScore').value);
    const target = document.getElementById('deductTarget').value;
    const reason = document.getElementById('deductReason').value;
    
    if (!group || !score || !target || !reason) {
        alert('请填写所有字段');
        return;
    }
    
    try {
        const response = await fetch('/api/deduct_score', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ group, score, target, reason })
        });
        
        const data = await response.json();
        if (data.status === 'success') {
            closeAllModals();
            fetchAndDisplayScores();
        } else {
            alert('扣分失败: ' + data.message);
        }
    } catch (error) {
        console.error('扣分失败:', error);
        alert('扣分失败');
    }
});

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    updateUIState();
});

// 定期刷新数据
setInterval(fetchAndDisplayScores, 30000); // 每30秒刷新一次