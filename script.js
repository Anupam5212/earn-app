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
const adTimer = document.getElementById('ad-timer');
let adRewardGiven = false;
let adTimerInterval = null;
let adWatchTime = 30; // 30 seconds ad watch time
let dailyAdCount = 0;
let lastAdDate = null;

// Check daily ad limit
function checkDailyAdLimit() {
    const today = new Date().toDateString();
    if (lastAdDate !== today) {
        dailyAdCount = 0;
        lastAdDate = today;
    }
    return dailyAdCount < 10; // Maximum 10 ads per day
}

// Load real Profitableratecpm ad
function loadAdsterraAd() {
    const adContainer = document.getElementById('adsterra-ad-container');
    const demoAd = document.getElementById('demo-ad');
    
    // Check if real ad is loaded
    const realAdScript = adContainer.querySelector('script[src*="profitableratecpm"]');
    
    if (realAdScript) {
        // Real ad is present, hide demo ad initially
        if (demoAd) {
            demoAd.style.display = 'none';
        }
        
        // Add a delay to let the real ad load
        setTimeout(() => {
            // Check if ad loaded successfully by looking for ad elements
            const adElements = adContainer.querySelectorAll('iframe, img, div[id*="ad"], div[class*="ad"], a[href*="profitableratecpm"]');
            
            if (adElements.length === 0) {
                // Real ad failed to load, show demo ad
                if (demoAd) {
                    demoAd.style.display = 'block';
                    demoAd.innerHTML = `
                        <div class="ad-placeholder">
                            <h4>📺 Demo Advertisement</h4>
                            <p>Real ad failed to load. Using demo mode.</p>
                            <div class="ad-progress">
                                <div class="progress-bar"></div>
                            </div>
                            <div style="margin-top: 15px; font-size: 0.85rem; color: #6c757d;">
                                <strong>Demo Mode:</strong> 30 seconds timer
                            </div>
                        </div>
                    `;
                }
                return false; // Demo mode
            } else {
                // Real ad loaded successfully
                console.log('Real ad loaded successfully');
                return true; // Real ad mode
            }
        }, 3000); // Wait 3 seconds for ad to load
        
        return true; // Assume real ad mode initially
    } else {
        // No real ad script found, show demo ad
        if (demoAd) {
            demoAd.style.display = 'block';
        }
        return false; // Demo mode
    }
}

if (watchAdBtn) {
    watchAdBtn.onclick = () => {
        // Check daily limit
        if (!checkDailyAdLimit()) {
            adEarnResult.innerHTML = `
                <div style="color: #dc3545; font-weight: bold;">
                    ⚠️ Daily Limit Reached
                </div>
                <div style="margin-top: 5px; font-size: 0.9rem; color: #6c757d;">
                    Aap aaj 10 ads dekh chuke hain. Kal fir try karein.
                </div>
            `;
            return;
        }
        
        adEarnResult.textContent = '';
        adModal.style.display = 'flex';
        closeAdModalBtn.disabled = true;
        adRewardGiven = false;
        
        // Load ad (real or demo)
        const isRealAd = loadAdsterraAd();
        
        // Show appropriate loading message
        const demoAd = document.getElementById('demo-ad');
        if (demoAd) {
            if (isRealAd) {
                demoAd.innerHTML = `
                    <div class="ad-placeholder">
                        <h4>📺 Real Advertisement</h4>
                        <p>Loading real ad from Profitableratecpm...</p>
                        <div class="ad-progress">
                            <div class="progress-bar"></div>
                        </div>
                        <div style="margin-top: 15px; font-size: 0.85rem; color: #6c757d;">
                            <strong>Real Ad Mode:</strong> 30 seconds timer
                        </div>
                    </div>
                `;
                demoAd.style.display = 'block';
            } else {
                demoAd.innerHTML = `
                    <div class="ad-placeholder">
                        <h4>📺 Demo Advertisement</h4>
                        <p>Demo mode - Real ad will appear when available</p>
                        <div class="ad-progress">
                            <div class="progress-bar"></div>
                        </div>
                        <div style="margin-top: 15px; font-size: 0.85rem; color: #6c757d;">
                            <strong>Demo Mode:</strong> 30 seconds timer
                        </div>
                    </div>
                `;
                demoAd.style.display = 'block';
            }
        }
        
        // Start timer
        let timeLeft = adWatchTime;
        adTimer.textContent = timeLeft;
        
        adTimerInterval = setInterval(() => {
            timeLeft--;
            adTimer.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(adTimerInterval);
                closeAdModalBtn.disabled = false;
                adRewardGiven = true;
                adTimer.textContent = '0';
                
                // Enable close button with visual feedback
                closeAdModalBtn.style.background = '#28a745';
                closeAdModalBtn.textContent = '✅ Ad Complete - Claim Reward';
            }
        }, 1000);
        
        // Start progress bar animation
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.animation = 'none';
            setTimeout(() => {
                progressBar.style.animation = `progress ${adWatchTime}s linear forwards`;
            }, 100);
        }
    };
}

if (closeAdModalBtn) {
    closeAdModalBtn.onclick = () => {
        adModal.style.display = 'none';
        
        // Reset close button
        closeAdModalBtn.style.background = '#f76b1c';
        closeAdModalBtn.textContent = 'Close Ad';
        
        // Clear timer
        if (adTimerInterval) {
            clearInterval(adTimerInterval);
            adTimerInterval = null;
        }
        
        if (adRewardGiven) {
            // Increment daily ad count
            dailyAdCount++;
            
            // Enhanced reward system with better distribution
            const rewards = [
                { coins: 5, chance: 40 },   // 40% chance for 5 coins
                { coins: 10, chance: 25 },  // 25% chance for 10 coins
                { coins: 15, chance: 20 },  // 20% chance for 15 coins
                { coins: 25, chance: 10 },  // 10% chance for 25 coins
                { coins: 50, chance: 5 }    // 5% chance for 50 coins
            ];
            
            // Calculate reward based on chances
            const random = Math.random() * 100;
            let cumulativeChance = 0;
            let selectedReward = rewards[0];
            
            for (const reward of rewards) {
                cumulativeChance += reward.chance;
                if (random <= cumulativeChance) {
                    selectedReward = reward;
                    break;
                }
            }
            
            const coins = selectedReward.coins;
            const rupees = Math.floor(coins / 10);
            
            earnings.push({ 
                date: new Date().toISOString().slice(0,10), 
                desc: 'Watch Ad Reward', 
                amount: rupees 
            });
            
            updateEarnings();
            renderHistory();
            
            // Show success message with animation
            adEarnResult.innerHTML = `
                <div style="color: #f76b1c; font-weight: bold; font-size: 1.1rem;">
                    🎉 Congratulations! 🎉
                </div>
                <div style="margin-top: 8px; color: #28a745; font-size: 1rem;">
                    Aapko ${coins} coins (₹${rupees}) mile!
                </div>
                <div style="margin-top: 5px; font-size: 0.85rem; color: #6c757d;">
                    Aaj ${dailyAdCount}/10 ads dekh liye hain
                </div>
                <div style="margin-top: 3px; font-size: 0.8rem; color: #17a2b8;">
                    ${isRealAd ? '✅ Real Ad Watched' : '📺 Demo Ad Watched'}
                </div>
            `;
            
            showNotification(`Ad watch complete! +${coins} coins earned!`);
        } else {
            adEarnResult.innerHTML = `
                <div style="color: #dc3545; font-weight: bold;">
                    ⚠️ Ad Complete Karein
                </div>
                <div style="margin-top: 5px; font-size: 0.9rem; color: #6c757d;">
                    Reward ke liye ad poora dekhein (${adWatchTime} seconds)
                </div>
            `;
        }
    };
} 