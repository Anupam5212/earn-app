document.addEventListener('DOMContentLoaded', () => {
    // Dummy user data
    let user = null;
    let earnings = [
        { date: '2024-06-01', desc: 'Signup Bonus', amount: 100 },
        { date: '2024-06-03', desc: 'Referral', amount: 50 },
        { date: '2024-06-05', desc: 'Task Complete', amount: 200 }
    ];

    // Dummy users data for admin
    let users = [
        { username: 'user1@test.com', earnings: [{ date: '2024-06-01', desc: 'Signup Bonus', amount: 100 }] },
        { username: 'user2@test.com', earnings: [{ date: '2024-06-02', desc: 'Signup Bonus', amount: 100 }] }
    ];
    let withdrawalRequests = [
        { user: 'user1@test.com', amount: 50, date: '2024-06-06' },
        { user: 'user2@test.com', amount: 100, date: '2024-06-07' }
    ];

    // --- Element Selections ---
    const authSection = document.getElementById('auth-section');
    const dashboard = document.getElementById('dashboard');
    const adminPanel = document.getElementById('admin-panel');
    const notification = document.getElementById('notification');

    // Auth forms
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const adminLoginForm = document.getElementById('admin-login-form');
    
    // Auth toggles
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');
    const userLoginBtn = document.getElementById('user-login-btn');
    const adminLoginBtn = document.getElementById('admin-login-btn');

    // Sidenav and navigation
    const menuBtn = document.getElementById('menu-btn');
    const sidenav = document.getElementById('sidenav');
    const closeBtn = document.querySelector('.sidenav .close-btn');
    const overlay = document.getElementById('overlay');
    const navLinks = document.querySelectorAll('.sidenav .nav-link');
    const pages = document.querySelectorAll('.page');

    // Ad Modal
    const watchAdBtn = document.getElementById('watch-ad-btn');
    const adModal = document.getElementById('ad-modal');
    const closeAdModal = document.getElementById('close-ad-modal');
    const adEarnResult = document.getElementById('ad-earn-result');

    // --- Functions ---
    function showNotification(msg, isError = false) {
        notification.textContent = msg;
        notification.className = `notification ${isError ? 'error' : 'success'}`;
        notification.style.display = 'block';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }

    // --- Sidenav Logic ---
    function openNav() {
        if (sidenav) sidenav.style.left = "0";
        if (overlay) overlay.classList.add('active');
    }

    function closeNav() {
        if (sidenav) sidenav.style.left = "-250px";
        if (overlay) overlay.classList.remove('active');
    }
    
    // --- Page Navigation ---
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');
            
            pages.forEach(page => page.classList.remove('active'));
            const targetPage = document.getElementById(targetId);
            if (targetPage) targetPage.classList.add('active');

            navLinks.forEach(navLink => navLink.classList.remove('active'));
            link.classList.add('active');
            
            closeNav(); // Close sidenav after navigation
        });
    });

    // --- Authentication Logic ---
    function showDashboardView() {
        authSection.style.display = 'none';
        adminPanel.style.display = 'none';
        dashboard.style.display = 'block';
        document.getElementById('user-name').textContent = user.username;
        updateEarnings();
        renderHistory();
    }

    function showAdminPanelView() {
        authSection.style.display = 'none';
        dashboard.style.display = 'none';
        adminPanel.style.display = 'block';
        // Add admin data rendering functions here
    }
    
    function showAuthView() {
        user = null;
        dashboard.style.display = 'none';
        adminPanel.style.display = 'none';
        authSection.style.display = 'block';
    }

    // Auth form toggles
    userLoginBtn.addEventListener('click', () => {
        userLoginBtn.classList.add('active');
        adminLoginBtn.classList.remove('active');
        loginForm.style.display = 'flex';
        adminLoginForm.style.display = 'none';
        signupForm.style.display = 'none';
    });
    
    adminLoginBtn.addEventListener('click', () => {
        adminLoginBtn.classList.add('active');
        userLoginBtn.classList.remove('active');
        loginForm.style.display = 'none';
        adminLoginForm.style.display = 'flex';
        signupForm.style.display = 'none';
    });
    
    showSignup.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        adminLoginForm.style.display = 'none';
        signupForm.style.display = 'flex';
    });
    
    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        signupForm.style.display = 'none';
        adminLoginForm.style.display = 'none';
        loginForm.style.display = 'flex';
    });

    // Firebase Auth
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                user = { username: email };
                showDashboardView();
                showNotification('Login successful!');
            })
            .catch((error) => showNotification(error.message, true));
    });

    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('signup-username').value;
        const password = document.getElementById('signup-password').value;
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                user = { username: email };
                showDashboardView();
                showNotification('Signup successful!');
            })
            .catch((error) => showNotification(error.message, true));
    });

    adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('admin-username').value;
        const password = document.getElementById('admin-password').value;
        if (username === 'admin' && password === 'admin') {
            showAdminPanelView();
            showNotification('Admin login successful!');
        } else {
            showNotification('Invalid admin credentials!', true);
        }
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
        showAuthView();
        showNotification('Logged out!');
    });
    
    document.getElementById('admin-logout-btn').addEventListener('click', () => {
        showAuthView();
        showNotification('Admin logged out!');
    });


    // --- Dashboard & Earnings Logic ---
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
    
    document.getElementById('withdraw-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = parseInt(document.getElementById('withdraw-amount').value);
        let total = earnings.reduce((sum, e) => sum + e.amount, 0);
        if (amount > 0 && amount <= total) {
            earnings.push({ date: new Date().toISOString().slice(0, 10), desc: 'Withdrawal', amount: -amount });
            updateEarnings();
            renderHistory();
            showNotification('Withdrawal request submitted!');
        } else {
            showNotification('Invalid amount!', true);
        }
        document.getElementById('withdraw-amount').value = '';
    });
    
    // --- Ad Modal Logic ---
    watchAdBtn.addEventListener('click', () => {
        adModal.style.display = 'flex';
        closeAdModal.disabled = true;

        setTimeout(() => {
            closeAdModal.disabled = false;
        }, 15000); // 15 seconds
    });

    closeAdModal.addEventListener('click', () => {
        adModal.style.display = 'none';
        const earned = Math.floor(Math.random() * 10) + 1; // Earn 1-10 coins
        earnings.push({ date: new Date().toISOString().slice(0, 10), desc: 'Watched Ad', amount: earned });
        updateEarnings();
        renderHistory(); // Update history on the dashboard page
        showNotification(`You earned ₹${earned}!`);
    });


    // --- Event Listeners ---
    menuBtn.addEventListener('click', openNav);
    closeBtn.addEventListener('click', closeNav);
    overlay.addEventListener('click', closeNav);

}); 