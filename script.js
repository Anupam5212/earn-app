// Dummy user data
let user = null;
let earnings = [
    { date: '2024-06-01', desc: 'Signup Bonus', amount: 100 },
    { date: '2024-06-03', desc: 'Referral', amount: 50 },
    { date: '2024-06-05', desc: 'Task Complete', amount: 200 }
];

// Dummy users data
let users = [
    { username: 'user1', earnings: [
        { date: '2024-06-01', desc: 'Signup Bonus', amount: 100 },
        { date: '2024-06-03', desc: 'Referral', amount: 50 }
    ]},
    { username: 'user2', earnings: [
        { date: '2024-06-02', desc: 'Signup Bonus', amount: 100 },
        { date: '2024-06-04', desc: 'Task Complete', amount: 200 }
    ]}
];
let withdrawalRequests = [
    { user: 'user1', amount: 50, date: '2024-06-06' },
    { user: 'user2', amount: 100, date: '2024-06-07' }
];

// Auth Section
const authSection = document.getElementById('auth-section');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const showSignup = document.getElementById('show-signup');
const showLogin = document.getElementById('show-login');
const notification = document.getElementById('notification');

// Admin login toggle
const showAdminLogin = document.getElementById('show-admin-login');
const adminLoginForm = document.getElementById('admin-login-form');
const adminLogoutBtn = document.getElementById('admin-logout-btn');

// Login toggle buttons
const userLoginBtn = document.getElementById('user-login-btn');
const adminLoginBtn = document.getElementById('admin-login-btn');

const adminPanel = document.getElementById('admin-panel');

userLoginBtn.onclick = () => {
    userLoginBtn.classList.add('active');
    adminLoginBtn.classList.remove('active');
    loginForm.style.display = 'flex';
    adminLoginForm.style.display = 'none';
    signupForm.style.display = 'none';
};
adminLoginBtn.onclick = () => {
    adminLoginBtn.classList.add('active');
    userLoginBtn.classList.remove('active');
    loginForm.style.display = 'none';
    adminLoginForm.style.display = 'flex';
    signupForm.style.display = 'none';
};

showSignup.onclick = (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    signupForm.style.display = 'flex';
    adminLoginForm.style.display = 'none';
    userLoginBtn.classList.remove('active');
    adminLoginBtn.classList.remove('active');
};
showLogin.onclick = (e) => {
    e.preventDefault();
    signupForm.style.display = 'none';
    loginForm.style.display = 'flex';
    adminLoginForm.style.display = 'none';
    userLoginBtn.classList.add('active');
    adminLoginBtn.classList.remove('active');
};

// User Login with Firebase
loginForm.onsubmit = (e) => {
    e.preventDefault();
    const email = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            user = { username: email };
            showDashboard();
            showNotification('Login successful!');
        })
        .catch((error) => {
            showNotification('Login failed: ' + error.message);
        });
};
// User Signup with Firebase
signupForm.onsubmit = (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            user = { username: email };
            showDashboard();
            showNotification('Signup successful!');
        })
        .catch((error) => {
            showNotification(error.message);
        });
};

document.getElementById('logout-btn').onclick = () => {
    user = null;
    dashboard.style.display = 'none';
    authSection.style.display = 'block';
    showNotification('Logged out!');
};

function showDashboard() {
    authSection.style.display = 'none';
    dashboard.style.display = 'block';
    document.getElementById('user-name').textContent = user.username;
    updateEarnings();
    renderHistory();
}

function updateEarnings() {
    let total = earnings.reduce((sum, e) => sum + e.amount, 0);
    document.getElementById('total-earnings').textContent = `₹${total}`;
    document.getElementById('available-balance').textContent = `₹${total}`;
}

function renderHistory() {
    const tbody = document.getElementById('history-body');
    tbody.innerHTML = '';
    earnings.forEach(e => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${e.date}</td><td>${e.desc}</td><td>₹${e.amount}</td>`;
        tbody.appendChild(tr);
    });
}

document.getElementById('withdraw-form').onsubmit = (e) => {
    e.preventDefault();
    const amount = parseInt(document.getElementById('withdraw-amount').value);
    let total = earnings.reduce((sum, e) => sum + e.amount, 0);
    if(amount > 0 && amount <= total) {
        earnings.push({ date: new Date().toISOString().slice(0,10), desc: 'Withdrawal', amount: -amount });
        updateEarnings();
        renderHistory();
        showNotification('Withdrawal request submitted!');
    } else {
        showNotification('Invalid amount!');
    }
    document.getElementById('withdraw-amount').value = '';
};

function showNotification(msg) {
    notification.textContent = msg;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 2000);
}

// Admin login form submit
adminLoginForm.onsubmit = (e) => {
    e.preventDefault();
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    if(username === 'admin' && password === 'admin') {
        authSection.style.display = 'none';
        dashboard.style.display = 'none';
        adminPanel.style.display = 'block';
        renderAdminSummary();
        renderUsersList();
        renderAdminEarnings();
        renderWithdrawalRequests();
        showNotification('Admin login successful!');
    } else {
        showNotification('Invalid admin credentials!');
    }
};

adminLogoutBtn.onclick = () => {
    adminPanel.style.display = 'none';
    authSection.style.display = 'block';
    showNotification('Admin logged out!');
};

function showAdminPanel() {
    authSection.style.display = 'none';
    dashboard.style.display = 'none';
    adminPanel.style.display = 'block';
    renderAdminSummary();
    renderUsersList();
    renderAdminEarnings();
    renderWithdrawalRequests();
}

function renderAdminSummary() {
    // Total Users
    document.getElementById('admin-total-users').textContent = users.length;
    // Total Earnings
    let total = 0;
    users.forEach(u => {
        u.earnings.forEach(e => { total += e.amount; });
    });
    document.getElementById('admin-total-earnings').textContent = '₹' + total;
    // Pending Withdrawals
    document.getElementById('admin-pending-withdrawals').textContent = withdrawalRequests.length;
}

function renderUsersList() {
    const ul = document.getElementById('users-list');
    ul.innerHTML = '';
    users.forEach(u => {
        const li = document.createElement('li');
        li.textContent = u.username;
        ul.appendChild(li);
    });
}
function renderAdminEarnings() {
    const tbody = document.getElementById('admin-earnings-body');
    tbody.innerHTML = '';
    users.forEach(u => {
        u.earnings.forEach(e => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${u.username}</td><td>${e.date}</td><td>${e.desc}</td><td>₹${e.amount}</td>`;
            tbody.appendChild(tr);
        });
    });
}
function renderWithdrawalRequests() {
    const ul = document.getElementById('withdrawal-requests');
    ul.innerHTML = '';
    withdrawalRequests.forEach(w => {
        const li = document.createElement('li');
        li.textContent = `${w.user} - ₹${w.amount} (${w.date})`;
        ul.appendChild(li);
    });
}
// Admin notification form
const adminNotifyForm = document.getElementById('admin-notify-form');
adminNotifyForm.onsubmit = (e) => {
    e.preventDefault();
    const msg = document.getElementById('notify-message').value;
    showNotification('Notification sent: ' + msg);
    document.getElementById('notify-message').value = '';
};

// Watch Ad & Earn logic with real ad modal
const watchAdBtn = document.getElementById('watch-ad-btn');
const adEarnResult = document.getElementById('ad-earn-result');
const adModal = document.getElementById('ad-modal');
const closeAdModalBtn = document.getElementById('close-ad-modal');
let adRewardGiven = false;
if (watchAdBtn) {
    watchAdBtn.onclick = () => {
        adEarnResult.textContent = '';
        adModal.style.display = 'flex';
        closeAdModalBtn.disabled = true;
        adRewardGiven = false;
        setTimeout(() => {
            closeAdModalBtn.disabled = false;
            adRewardGiven = true;
        }, 15000); // 15 sec ad watch simulation
    };
}
if (closeAdModalBtn) {
    closeAdModalBtn.onclick = () => {
        adModal.style.display = 'none';
        if (adRewardGiven) {
            // Random coins: 5, 10, 20, 30, 50 (5 ka chance sabse zyada)
            const coinsArr = [5,5,5,10,10,20,30,50];
            const coins = coinsArr[Math.floor(Math.random() * coinsArr.length)];
            const rupees = Math.floor(coins / 10);
            earnings.push({ date: new Date().toISOString().slice(0,10), desc: 'Watch Ad', amount: rupees });
            updateEarnings();
            renderHistory();
            adEarnResult.textContent = `🎉 Aapko ${coins} coins (₹${rupees}) mile!`;
        } else {
            adEarnResult.textContent = 'Ad poora dekhein reward ke liye!';
        }
    };
}

const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('data-target');
        
        pages.forEach(page => {
            page.classList.remove('active');
            if (page.id === targetId) {
                page.classList.add('active');
            }
        });

        navLinks.forEach(navLink => {
            navLink.classList.remove('active');
        });
        link.classList.add('active');
    });
}); 