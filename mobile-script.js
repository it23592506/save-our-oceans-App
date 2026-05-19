// SaveTheSea 2.0 Mobile App JavaScript

// Global variables
let currentPage = 'login-page';
let currentQuestionIndex = 0;
let quizScore = 0;
let quizStartTime = null;
let userProfile = {
    name: 'Ocean Guardian',
    email: 'user@example.com',
    points: 156,
    reportsCount: 12,
    badgesCount: 8
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize the application
function initializeApp() {
    console.log('Initializing SaveTheSea 2.0 Mobile App...');
    
    // Show loading screen briefly
    setTimeout(() => {
        hideLoadingScreen();
        // Check if user is logged in (simulate)
        if (localStorage.getItem('isLoggedIn') === 'true') {
            showPage('home-page');
        } else {
            showPage('login-page');
        }
    }, 2000);
    
    // Initialize service worker if available
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered:', registration))
            .catch(error => console.log('SW registration failed:', error));
    }
    
    // Add event listeners
    setupEventListeners();
    
    // Update user interface with profile data
    updateUserInterface();
}

// Hide loading screen
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
}

// Show specific page
function showPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Show requested page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        currentPage = pageId;
        
        // Update navigation if applicable
        updateNavigation(pageId);
        
        // Page-specific initialization
        switch (pageId) {
            case 'quiz-page':
                initializeQuiz();
                break;
            case 'facts-page':
                loadDailyFacts();
                break;
            case 'articles-page':
                loadArticles();
                break;
            case 'home-page':
                updateDashboard();
                break;
        }
        
        // Scroll to top
        window.scrollTo(0, 0);
    }
}

// Update navigation active state
function updateNavigation(pageId) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        item.setAttribute('aria-pressed', 'false');
    });
    
    // Find matching nav item
    const pageToNavMap = {
        'home-page': 0,
        'facts-page': 1,
        'articles-page': 1, // Falls under Learn
        'report-page': 2,
        'communities-page': 3,
        'profile-page': 4
    };
    
    const navIndex = pageToNavMap[pageId];
    if (navIndex !== undefined && navItems[navIndex]) {
        navItems[navIndex].classList.add('active');
        navItems[navIndex].setAttribute('aria-pressed', 'true');
    }
}

// Authentication Functions
function login(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    
    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    // Simulate login process
    showLoadingState('Signing in...');
    
    setTimeout(() => {
        // Store login state
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        if (remember) {
            localStorage.setItem('rememberMe', 'true');
        }
        
        // Update user profile
        userProfile.email = email;
        
        hideLoadingState();
        showNotification('Welcome back, Ocean Guardian!', 'success');
        showPage('home-page');
    }, 1500);
}

function signup(event) {
    event.preventDefault();
    
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('phone').value;
    const location = document.getElementById('location').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const terms = document.getElementById('terms').checked;
    
    // Validation
    if (!fullName || !email || !phone || !location || !password || !confirmPassword) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    if (!terms) {
        showNotification('Please accept the terms and conditions', 'error');
        return;
    }
    
    // Simulate signup process
    showLoadingState('Creating your account...');
    
    setTimeout(() => {
        // Store user data
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userName', fullName);
        
        // Update user profile
        userProfile.name = fullName;
        userProfile.email = email;
        
        hideLoadingState();
        showNotification('Welcome to SaveTheSea 2.0!', 'success');
        showPage('home-page');
    }, 2000);
}

function forgotPassword(event) {
    event.preventDefault();
    
    const email = document.getElementById('forgotEmail').value;
    
    if (!email) {
        showNotification('Please enter your email address', 'error');
        return;
    }
    
    showLoadingState('Sending reset link...');
    
    setTimeout(() => {
        hideLoadingState();
        showNotification('Password reset link sent to your email', 'success');
        showPage('login-page');
    }, 1500);
}

function socialLogin(provider) {
    showLoadingState(`Signing in with ${provider}...`);
    
    setTimeout(() => {
        localStorage.setItem('isLoggedIn', 'true');
        userProfile.name = 'Ocean Guardian';
        
        hideLoadingState();
        showNotification(`Welcome! Signed in with ${provider}`, 'success');
        showPage('home-page');
    }, 1500);
}

function logout() {
    if (confirm('Are you sure you want to sign out?')) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('rememberMe');
        
        showNotification('Signed out successfully', 'info');
        showPage('login-page');
    }
}

// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.parentNode.querySelector('.toggle-password i');
    
    if (input.type === 'password') {
        input.type = 'text';
        button.classList.remove('fa-eye');
        button.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        button.classList.remove('fa-eye-slash');
        button.classList.add('fa-eye');
    }
}

// Quiz Functions
function initializeQuiz() {
    currentQuestionIndex = 0;
    quizScore = 0;
    quizStartTime = Date.now();
    
    // Hide all questions and results
    document.querySelectorAll('.question-card').forEach(card => {
        card.classList.remove('active');
    });
    
    document.getElementById('quiz-results').style.display = 'none';
    
    // Show first question
    showQuestion(1);
    updateQuizProgress();
}

function showQuestion(questionNumber) {
    // Hide all questions
    document.querySelectorAll('.question-card').forEach(card => {
        card.classList.remove('active');
    });
    
    // Show target question
    const questionCard = document.querySelector(`[data-question="${questionNumber}"]`);
    if (questionCard) {
        questionCard.classList.add('active');
        currentQuestionIndex = questionNumber;
        updateQuizProgress();
    }
}

function selectAnswer(button, isCorrect) {
    // Remove previous selections
    const options = button.parentNode.querySelectorAll('.quiz-option');
    options.forEach(option => {
        option.classList.remove('selected');
    });
    
    // Mark selected answer
    button.classList.add('selected');
    
    // Update score if correct
    if (isCorrect) {
        quizScore++;
    }
    
    // Show result after brief delay
    setTimeout(() => {
        options.forEach(option => {
            if (option.dataset.answer === 'correct') {
                option.classList.add('correct');
            } else if (option.classList.contains('selected') && !isCorrect) {
                option.classList.add('wrong');
            }
        });
        
        // Move to next question or show results
        setTimeout(() => {
            if (currentQuestionIndex < 3) { // Only 3 questions in demo
                showQuestion(currentQuestionIndex + 1);
            } else {
                showQuizResults();
            }
        }, 1500);
    }, 500);
}

function updateQuizProgress() {
    const progressBar = document.getElementById('quiz-progress');
    const currentQuestionElement = document.getElementById('current-question');
    const totalQuestions = 3; // Demo has 3 questions
    
    if (progressBar && currentQuestionElement) {
        const progress = (currentQuestionIndex / totalQuestions) * 100;
        progressBar.style.width = `${progress}%`;
        currentQuestionElement.textContent = currentQuestionIndex;
    }
}

function showQuizResults() {
    // Hide all questions
    document.querySelectorAll('.question-card').forEach(card => {
        card.classList.remove('active');
    });
    
    // Calculate results
    const totalQuestions = 3;
    const percentage = Math.round((quizScore / totalQuestions) * 100);
    const timeTaken = Math.round((Date.now() - quizStartTime) / 1000);
    const pointsEarned = quizScore * 10;
    
    // Update results display
    document.getElementById('final-score').textContent = quizScore;
    document.getElementById('correct-answers').textContent = quizScore;
    document.getElementById('time-taken').textContent = `${Math.floor(timeTaken / 60)}:${String(timeTaken % 60).padStart(2, '0')}`;
    document.getElementById('points-earned').textContent = pointsEarned;
    
    // Update message based on score
    const messageElement = document.getElementById('score-message');
    if (percentage === 100) {
        messageElement.innerHTML = '<h3>Ocean Expert!</h3><p>Perfect score! You\'re a true ocean conservation champion!</p>';
    } else if (percentage >= 70) {
        messageElement.innerHTML = '<h3>Ocean Guardian!</h3><p>Great job! You have excellent knowledge of ocean conservation.</p>';
    } else if (percentage >= 50) {
        messageElement.innerHTML = '<h3>Ocean Explorer!</h3><p>Good start! Keep learning to become an ocean conservation expert.</p>';
    } else {
        messageElement.innerHTML = '<h3>Ocean Learner!</h3><p>Every journey starts with a single step. Keep exploring and learning!</p>';
    }
    
    // Show results
    document.getElementById('quiz-results').style.display = 'block';
    
    // Update user points
    userProfile.points += pointsEarned;
    updateUserInterface();
    
    // Save quiz completion
    const quizHistory = JSON.parse(localStorage.getItem('quizHistory') || '[]');
    quizHistory.push({
        date: new Date().toISOString(),
        score: quizScore,
        total: totalQuestions,
        percentage: percentage,
        timeTaken: timeTaken,
        pointsEarned: pointsEarned
    });
    localStorage.setItem('quizHistory', JSON.stringify(quizHistory));
}

function restartQuiz() {
    // Reset all option states
    document.querySelectorAll('.quiz-option').forEach(option => {
        option.classList.remove('selected', 'correct', 'wrong');
    });
    
    initializeQuiz();
}

function shareQuizResult() {
    const score = document.getElementById('final-score').textContent;
    const shareText = `I just scored ${score}/3 on the SaveTheSea 2.0 Ocean Conservation Quiz! 🌊 Join me in protecting our oceans! #SaveTheSea #OceanConservation`;
    
    if (navigator.share) {
        navigator.share({
            title: 'SaveTheSea 2.0 Quiz Result',
            text: shareText,
            url: window.location.href
        });
    } else {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
            showNotification('Quiz result copied to clipboard!', 'success');
        });
    }
}

// Facts Functions
function loadDailyFacts() {
    // Update fact of the day with current date
    const factDate = document.querySelector('.fact-title p');
    if (factDate) {
        factDate.textContent = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    // Animate fact cards on load
    const factCards = document.querySelectorAll('.fact-card');
    factCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.style.animation = 'fadeInUp 0.6s ease forwards';
    });
}

function expandFact(factId) {
    // This would typically show a detailed view of the fact
    showNotification('Opening detailed fact view...', 'info');
    // In a real app, this would navigate to a detailed fact page
}

function shareFact(factId) {
    const shareText = 'Check out this amazing ocean fact from SaveTheSea 2.0! 🌊 #OceanFacts #SaveTheSea';
    
    if (navigator.share) {
        navigator.share({
            title: 'Ocean Fact - SaveTheSea 2.0',
            text: shareText,
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(shareText).then(() => {
            showNotification('Fact shared to clipboard!', 'success');
        });
    }
}

function likeFact(factId) {
    const likeButton = event.target.closest('.fact-action-btn');
    const heartIcon = likeButton.querySelector('i');
    const likeCount = likeButton.querySelector('span:not(.sr-only)');
    
    // Toggle heart icon
    if (heartIcon.classList.contains('fas')) {
        heartIcon.classList.remove('fas');
        heartIcon.classList.add('far');
        likeButton.style.color = '#666';
        
        // Decrease count (simulate)
        const currentCount = parseInt(likeCount.textContent.replace('k', '')) * 1000;
        likeCount.textContent = Math.round((currentCount - 1) / 1000 * 10) / 10 + 'k';
    } else {
        heartIcon.classList.remove('far');
        heartIcon.classList.add('fas');
        likeButton.style.color = '#ff6b6b';
        
        // Increase count (simulate)
        const currentCount = parseInt(likeCount.textContent.replace('k', '')) * 1000;
        likeCount.textContent = Math.round((currentCount + 1) / 1000 * 10) / 10 + 'k';
    }
}

// Articles Functions
function loadArticles() {
    // Animate article cards
    const articleCards = document.querySelectorAll('.article-card');
    articleCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.style.animation = 'fadeInUp 0.6s ease forwards';
    });
}

function filterArticles(category) {
    // Update active filter tab
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Filter articles (in real app, would filter based on category)
    const articles = document.querySelectorAll('.article-card');
    articles.forEach(article => {
        if (category === 'all') {
            article.style.display = 'block';
        } else {
            // Check if article has the category tag
            const tags = article.querySelectorAll('.tag');
            let hasCategory = false;
            tags.forEach(tag => {
                if (tag.classList.contains(category) || tag.textContent.toLowerCase().includes(category)) {
                    hasCategory = true;
                }
            });
            article.style.display = hasCategory ? 'block' : 'none';
        }
    });
    
    showNotification(`Showing ${category === 'all' ? 'all' : category} articles`, 'info');
}

function openArticle(articleId) {
    showNotification('Opening article...', 'info');
    // In a real app, this would navigate to the full article
    console.log('Opening article:', articleId);
}

// Dashboard Functions
function updateDashboard() {
    // Update greeting based on time of day
    const hour = new Date().getHours();
    const greetingElement = document.querySelector('.user-greeting h2');
    
    if (greetingElement) {
        let greeting = 'Hello';
        if (hour < 12) greeting = 'Good Morning';
        else if (hour < 18) greeting = 'Good Afternoon';
        else greeting = 'Good Evening';
        
        greetingElement.textContent = `${greeting}, Ocean Guardian!`;
    }
    
    // Update activity timestamps
    updateActivityTimestamps();
}

function updateActivityTimestamps() {
    const activityTimes = document.querySelectorAll('.activity-time');
    activityTimes.forEach((timeElement, index) => {
        const hoursAgo = [2, 24, 72][index] || 1;
        timeElement.textContent = formatTimeAgo(hoursAgo);
    });
}

function formatTimeAgo(hoursAgo) {
    if (hoursAgo < 24) {
        return `${hoursAgo} ${hoursAgo === 1 ? 'hour' : 'hours'} ago`;
    } else {
        const daysAgo = Math.floor(hoursAgo / 24);
        return `${daysAgo} ${daysAgo === 1 ? 'day' : 'days'} ago`;
    }
}

// UI Helper Functions
function updateUserInterface() {
    // Update user stats in various places
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length >= 3) {
        statNumbers[0].textContent = userProfile.reportsCount;
        statNumbers[1].textContent = userProfile.points;
        statNumbers[2].textContent = userProfile.badgesCount;
    }
    
    // Update user name in greeting
    const greetingElements = document.querySelectorAll('.user-greeting h2');
    greetingElements.forEach(element => {
        element.textContent = `Hello, ${userProfile.name}!`;
    });
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 16px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        animation: slideDown 0.3s ease;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-triangle';
        case 'warning': return 'exclamation-circle';
        default: return 'info-circle';
    }
}

function getNotificationColor(type) {
    switch (type) {
        case 'success': return '#2ecc71';
        case 'error': return '#ff6b6b';
        case 'warning': return '#ffd93d';
        default: return '#0066cc';
    }
}

function showLoadingState(message) {
    // Create loading overlay
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <p>${message}</p>
        </div>
    `;
    
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        color: white;
        text-align: center;
    `;
    
    document.body.appendChild(overlay);
}

function hideLoadingState() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Event Listeners Setup
function setupEventListeners() {
    // Handle back button
    window.addEventListener('popstate', function(event) {
        if (currentPage !== 'login-page') {
            showPage('home-page');
        }
    });
    
    // Handle online/offline status
    window.addEventListener('online', function() {
        showNotification('You are back online!', 'success');
    });
    
    window.addEventListener('offline', function() {
        showNotification('You are offline. Some features may be limited.', 'warning');
    });
    
    // Handle orientation change
    window.addEventListener('orientationchange', function() {
        setTimeout(() => {
            // Recalculate layouts if needed
            console.log('Orientation changed');
        }, 100);
    });
}

// Touch and gesture handling
let touchStartY = 0;
let touchStartX = 0;

function handleTouchStart(event) {
    touchStartY = event.touches[0].clientY;
    touchStartX = event.touches[0].clientX;
}

function handleTouchMove(event) {
    if (!touchStartY || !touchStartX) return;
    
    const touchEndY = event.touches[0].clientY;
    const touchEndX = event.touches[0].clientX;
    
    const diffY = touchStartY - touchEndY;
    const diffX = touchStartX - touchEndX;
    
    // Implement pull-to-refresh
    if (diffY < -100 && Math.abs(diffX) < 50 && window.scrollY === 0) {
        // Pull to refresh logic
        if (currentPage === 'home-page') {
            showNotification('Refreshing...', 'info');
            setTimeout(() => {
                updateDashboard();
                showNotification('Updated!', 'success');
            }, 1000);
        }
    }
}

// Add touch event listeners
document.addEventListener('touchstart', handleTouchStart, { passive: true });
document.addEventListener('touchmove', handleTouchMove, { passive: true });

// PWA Installation
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install button
    showInstallPrompt();
});

function showInstallPrompt() {
    const installBanner = document.createElement('div');
    installBanner.innerHTML = `
        <div class="install-banner">
            <div class="install-content">
                <i class="fas fa-download"></i>
                <div class="install-text">
                    <h4>Install SaveTheSea 2.0</h4>
                    <p>Get quick access to ocean conservation tools</p>
                </div>
                <button onclick="installApp()" class="install-btn">Install</button>
                <button onclick="this.parentElement.parentElement.remove()" class="install-close">×</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(installBanner);
}

function installApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            }
            deferredPrompt = null;
        });
    }
}

// Export functions for global use
window.showPage = showPage;
window.login = login;
window.signup = signup;
window.forgotPassword = forgotPassword;
window.socialLogin = socialLogin;
window.logout = logout;
window.togglePassword = togglePassword;
window.selectAnswer = selectAnswer;
window.restartQuiz = restartQuiz;
window.shareQuizResult = shareQuizResult;
window.expandFact = expandFact;
window.shareFact = shareFact;
window.likeFact = likeFact;
window.openArticle = openArticle;
window.installApp = installApp;

// Additional Functions for Report Page
function startReport(type) {
    showNotification(`Starting ${type} pollution report...`, 'info');
    // In real app, would navigate to report form
    console.log('Starting report for:', type);
}

function showHelp(topic) {
    showNotification('Opening help guide...', 'info');
    console.log('Showing help for:', topic);
}

// Community Functions  
function switchCommunitiesTab(tab) {
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    showNotification(`Showing ${tab} communities`, 'info');
    console.log('Switching to tab:', tab);
}

function openCommunity(communityId) {
    showNotification('Opening community details...', 'info');
    console.log('Opening community:', communityId);
}

function joinCommunity(event, communityId) {
    event.stopPropagation();
    
    const button = event.target;
    if (button.textContent === 'Join') {
        button.textContent = 'Joined';
        button.style.background = '#2ecc71';
        showNotification('Successfully joined community!', 'success');
        
        // Update user stats
        userProfile.points += 10;
        updateUserInterface();
    }
    
    console.log('Joining community:', communityId);
}

function showCreateCommunity() {
    showNotification('Opening community creation form...', 'info');
    console.log('Creating new community');
}

// Campaign Functions
function joinCampaign(campaignId) {
    showLoadingState('Joining campaign...');
    
    setTimeout(() => {
        hideLoadingState();
        showNotification('Successfully joined campaign!', 'success');
        
        // Update user stats
        userProfile.points += 25;
        updateUserInterface();
        
        // Update UI to show joined state
        const campaignCard = event.target.closest('.campaign-card');
        if (campaignCard) {
            campaignCard.classList.add('joined');
        }
    }, 1000);
    
    console.log('Joining campaign:', campaignId);
}

function shareCampaign(campaignId) {
    const shareText = 'Join me in the Clean Ocean Challenge 2024! Together we can protect our oceans. 🌊 #SaveTheSea #OceanConservation';
    
    if (navigator.share) {
        navigator.share({
            title: 'Clean Ocean Challenge 2024',
            text: shareText,
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(shareText).then(() => {
            showNotification('Campaign details copied to clipboard!', 'success');
        });
    }
    
    console.log('Sharing campaign:', campaignId);
}

function viewCampaign(campaignId) {
    showNotification('Opening campaign details...', 'info');
    console.log('Viewing campaign:', campaignId);
}

// Profile Functions
function editProfile() {
    showNotification('Opening profile editor...', 'info');
    console.log('Editing profile');
}

function openSettings() {
    showNotification('Opening settings...', 'info');
    console.log('Opening settings');
}

function changeProfilePicture() {
    showNotification('Opening camera/gallery...', 'info');
    console.log('Changing profile picture');
}

function shareProfile() {
    const shareText = `Check out my ocean conservation profile on SaveTheSea 2.0! I've made ${userProfile.reportsCount} reports and earned ${userProfile.points} points protecting our oceans. 🌊`;
    
    if (navigator.share) {
        navigator.share({
            title: 'My SaveTheSea Profile',
            text: shareText,
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(shareText).then(() => {
            showNotification('Profile details copied to clipboard!', 'success');
        });
    }
}

// Additional Helper Functions
function openModal(modalId) {
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.id = modalId;
    modalOverlay.className = 'modal-overlay';
    modalOverlay.innerHTML = getModalContent(modalId);
    
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: modalFadeIn 0.3s ease;
    `;
    
    document.body.appendChild(modalOverlay);
    
    // Close modal when clicking outside
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closeModal(modalId);
        }
    });
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.animation = 'modalFadeOut 0.3s ease';
        setTimeout(() => modal.remove(), 300);
    }
}

function getModalContent(modalId) {
    switch (modalId) {
        case 'notifications-modal':
            return `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Notifications</h3>
                        <button onclick="closeModal('notifications-modal')" class="close-btn">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="notification-item new">
                            <div class="notification-icon success">
                                <i class="fas fa-check"></i>
                            </div>
                            <div class="notification-text">
                                <h4>Report Verified</h4>
                                <p>Your plastic pollution report was verified</p>
                                <span class="notification-time">2 hours ago</span>
                            </div>
                        </div>
                        <div class="notification-item">
                            <div class="notification-icon info">
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="notification-text">
                                <h4>New Community Event</h4>
                                <p>Beach cleanup this Saturday at Galle Face</p>
                                <span class="notification-time">1 day ago</span>
                            </div>
                        </div>
                        <div class="notification-item">
                            <div class="notification-icon quiz">
                                <i class="fas fa-trophy"></i>
                            </div>
                            <div class="notification-text">
                                <h4>Achievement Unlocked</h4>
                                <p>You earned the "Quiz Master" badge</p>
                                <span class="notification-time">3 days ago</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        case 'settings-modal':
            return `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Settings</h3>
                        <button onclick="closeModal('settings-modal')" class="close-btn">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="settings-section">
                            <h4>Notifications</h4>
                            <div class="setting-item">
                                <span>Push Notifications</span>
                                <label class="toggle-switch">
                                    <input type="checkbox" checked>
                                    <span class="slider"></span>
                                </label>
                            </div>
                            <div class="setting-item">
                                <span>Email Updates</span>
                                <label class="toggle-switch">
                                    <input type="checkbox" checked>
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                        <div class="settings-section">
                            <h4>Privacy</h4>
                            <div class="setting-item">
                                <span>Share Location</span>
                                <label class="toggle-switch">
                                    <input type="checkbox">
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                        <div class="settings-section">
                            <h4>Account</h4>
                            <button class="setting-btn" onclick="logout()">Sign Out</button>
                            <button class="setting-btn danger" onclick="deleteAccount()">Delete Account</button>
                        </div>
                    </div>
                </div>
            `;
        case 'terms-modal':
            return `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Terms & Conditions</h3>
                        <button onclick="closeModal('terms-modal')" class="close-btn">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="terms-content">
                            <h4>SaveTheSea 2.0 Terms of Service</h4>
                            <p>By using SaveTheSea 2.0, you agree to help protect our oceans and marine ecosystems through responsible reporting and community participation.</p>
                            <h4>User Responsibilities</h4>
                            <ul>
                                <li>Provide accurate information when reporting pollution</li>
                                <li>Respect community guidelines and other users</li>
                                <li>Use the platform for legitimate conservation efforts</li>
                            </ul>
                            <h4>Privacy Policy</h4>
                            <p>We protect your personal information and only use location data to improve pollution reporting accuracy.</p>
                        </div>
                        <div class="modal-actions">
                            <button class="modal-btn primary" onclick="closeModal('terms-modal')">Accept</button>
                        </div>
                    </div>
                </div>
            `;
        default:
            return '<div class="modal-content"><p>Modal content not found</p></div>';
    }
}

function deleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        showLoadingState('Deleting account...');
        setTimeout(() => {
            hideLoadingState();
            showNotification('Account deleted successfully', 'info');
            localStorage.clear();
            showPage('login-page');
        }, 2000);
    }
}

// Enhanced Animation Support
const animationStyles = `
    @keyframes modalFadeIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
    }
    
    @keyframes modalFadeOut {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(0.9); }
    }
    
    @keyframes slideDown {
        from { transform: translateY(-100px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes slideUp {
        from { transform: translateY(0); opacity: 1; }
        to { transform: translateY(-100px); opacity: 0; }
    }
    
    .modal-content {
        background: white;
        border-radius: 16px;
        max-width: 400px;
        width: 90%;
        max-height: 80vh;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid #e9ecef;
        background: #f8f9fa;
    }
    
    .modal-header h3 {
        font-size: 1.2rem;
        font-weight: 600;
        color: #003d7a;
        margin: 0;
    }
    
    .close-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        color: #666;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s ease;
    }
    
    .close-btn:hover {
        background: rgba(0, 0, 0, 0.1);
    }
    
    .modal-body {
        padding: 20px;
        max-height: 60vh;
        overflow-y: auto;
    }
    
    .notification-item {
        display: flex;
        gap: 12px;
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 8px;
        transition: all 0.2s ease;
    }
    
    .notification-item.new {
        background: rgba(0, 102, 204, 0.05);
        border-left: 3px solid #0066cc;
    }
    
    .notification-icon {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 0.9rem;
        flex-shrink: 0;
    }
    
    .notification-text h4 {
        font-size: 0.95rem;
        font-weight: 600;
        color: #003d7a;
        margin-bottom: 4px;
    }
    
    .notification-text p {
        font-size: 0.85rem;
        color: #666;
        margin-bottom: 4px;
        line-height: 1.4;
    }
    
    .notification-time {
        font-size: 0.75rem;
        color: #888;
    }
    
    .settings-section {
        margin-bottom: 24px;
    }
    
    .settings-section h4 {
        font-size: 1rem;
        font-weight: 600;
        color: #003d7a;
        margin-bottom: 12px;
    }
    
    .setting-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;
    }
    
    .setting-item:last-child {
        border-bottom: none;
    }
    
    .toggle-switch {
        position: relative;
        width: 50px;
        height: 24px;
    }
    
    .toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }
    
    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: 0.4s;
        border-radius: 24px;
    }
    
    .slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: 0.4s;
        border-radius: 50%;
    }
    
    input:checked + .slider {
        background-color: #0066cc;
    }
    
    input:checked + .slider:before {
        transform: translateX(26px);
    }
    
    .setting-btn {
        width: 100%;
        padding: 12px;
        border: none;
        border-radius: 8px;
        background: #f8f9fa;
        color: #666;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        margin-bottom: 8px;
    }
    
    .setting-btn:hover {
        background: #e9ecef;
    }
    
    .setting-btn.danger {
        background: rgba(255, 107, 107, 0.1);
        color: #ff6b6b;
    }
    
    .setting-btn.danger:hover {
        background: #ff6b6b;
        color: white;
    }
    
    .terms-content h4 {
        font-size: 1rem;
        font-weight: 600;
        color: #003d7a;
        margin: 16px 0 8px 0;
    }
    
    .terms-content p {
        font-size: 0.9rem;
        color: #666;
        line-height: 1.5;
        margin-bottom: 12px;
    }
    
    .terms-content ul {
        margin-left: 20px;
        margin-bottom: 16px;
    }
    
    .terms-content li {
        font-size: 0.9rem;
        color: #666;
        line-height: 1.5;
        margin-bottom: 4px;
    }
    
    .modal-actions {
        border-top: 1px solid #e9ecef;
        padding: 16px 0 0 0;
        margin-top: 20px;
    }
    
    .modal-btn {
        width: 100%;
        padding: 12px;
        border: none;
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .modal-btn.primary {
        background: #0066cc;
        color: white;
    }
    
    .modal-btn.primary:hover {
        background: #003d7a;
    }
`;

// Inject animation styles
const styleSheet = document.createElement('style');
styleSheet.textContent = animationStyles;
document.head.appendChild(styleSheet);

console.log('SaveTheSea 2.0 Mobile App initialized successfully!');