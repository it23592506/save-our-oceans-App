// Global state management
const AppState = {
    currentTab: 'home',
    user: {
        points: 1250,
        challenges: 15,
        badges: 8
    },
    challenges: {
        'plastic-free': {
            progress: 60,
            daysCompleted: 4,
            totalDays: 7
        }
    }
};

// DOM elements
const tabContents = document.querySelectorAll('.tab-content');
const navItems = document.querySelectorAll('.nav-item');

// Tab navigation functionality
function switchTab(tabName) {
    // Hide all tab contents
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all nav items and update aria-pressed
    navItems.forEach(item => {
        item.classList.remove('active');
        item.setAttribute('aria-pressed', 'false');
    });
    
    // Show selected tab content
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
        selectedTab.setAttribute('aria-hidden', 'false');
    }
    
    // Add active class to clicked nav item and update aria-pressed
    const selectedNavItem = document.querySelector(`[onclick="switchTab('${tabName}')"]`);
    if (selectedNavItem) {
        selectedNavItem.classList.add('active');
        selectedNavItem.setAttribute('aria-pressed', 'true');
    }
    
    // Update app state
    AppState.currentTab = tabName;
    
    // Add entrance animation
    if (selectedTab) {
        selectedTab.style.animation = 'none';
        // Force reflow
        selectedTab.getBoundingClientRect();
        selectedTab.style.animation = 'fadeIn 0.5s ease';
    }
    
    // Announce tab change to screen readers
    announceToScreenReader(`Switched to ${tabName} tab`);
}

// Hero section scroll to action
function scrollToAction() {
    // Switch to Act tab when CTA button is clicked
    switchTab('act');
    
    // Add a smooth scroll effect
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    
    // Add visual feedback
    const ctaButton = document.querySelector('.cta-button');
    ctaButton.style.transform = 'scale(0.95)';
    setTimeout(() => {
        ctaButton.style.transform = 'scale(1)';
    }, 150);
}

// Article functionality
function openArticle(articleType) {
    const articles = {
        pollution: {
            title: 'Ocean Pollution Crisis',
            content: 'Every year, 8 million tons of plastic waste enter our oceans, creating massive garbage patches and harming marine life. Learn about the sources of ocean pollution and what we can do to prevent it.'
        },
        coral: {
            title: 'Coral Reef Ecosystems',
            content: 'Coral reefs support 25% of all marine species despite covering less than 1% of the ocean floor. These vibrant underwater gardens are threatened by climate change, pollution, and overfishing.'
        },
        acidification: {
            title: 'Ocean Acidification',
            content: 'As oceans absorb excess CO2 from the atmosphere, they become more acidic, threatening shell-forming organisms and disrupting the marine food chain.'
        }
    };
    
    const article = articles[articleType];
    if (article) {
        // Create modal or navigate to detailed view
        showArticleModal(article);
    }
}

function showArticleModal(article) {
    // Create modal element
    const modal = document.createElement('div');
    modal.className = 'article-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${article.title}</h2>
                <button class="close-modal" onclick="closeArticleModal()">&times;</button>
            </div>
            <div class="modal-body">
                <p>${article.content}</p>
                <div class="modal-actions">
                    <button class="share-btn" onclick="shareArticle('${article.title}')">
                        <i class="fas fa-share"></i> Share
                    </button>
                    <button class="bookmark-btn" onclick="bookmarkArticle('${article.title}')">
                        <i class="fas fa-bookmark"></i> Bookmark
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal styles
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        animation: fadeIn 0.3s ease;
    `;
    
    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.cssText = `
        background: white;
        border-radius: 15px;
        max-width: 90%;
        max-height: 80%;
        overflow-y: auto;
        animation: slideUp 0.3s ease;
    `;
    
    document.body.appendChild(modal);
}

function closeArticleModal() {
    const modal = document.querySelector('.article-modal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

function shareArticle(title) {
    if (navigator.share) {
        navigator.share({
            title: title,
            text: `Check out this article about ocean conservation: ${title}`,
            url: window.location.href
        });
    } else {
        // Fallback for browsers that don't support Web Share API
        const shareText = `Check out this article about ocean conservation: ${title} - ${window.location.href}`;
        navigator.clipboard.writeText(shareText).then(() => {
            showNotification('Article link copied to clipboard!');
        });
    }
}

function bookmarkArticle(title) {
    showNotification(`"${title}" bookmarked!`);
    // Here you would typically save to local storage or user account
}

// Challenge functionality
function startChallenge(challengeId) {
    showNotification('Challenge started! Good luck!');
    // Update UI and state
    updateChallengeButton(challengeId, 'continue', 'Continue Challenge');
}

function continueChallenge(challengeId) {
    // Simulate progress update
    if (challengeId === 'plastic-free') {
        AppState.challenges['plastic-free'].daysCompleted++;
        AppState.challenges['plastic-free'].progress = (AppState.challenges['plastic-free'].daysCompleted / 7) * 100;
        
        updateProgressBar('plastic-free');
        
        if (AppState.challenges['plastic-free'].daysCompleted >= 7) {
            completeChallenge('plastic-free');
        } else {
            showNotification('Day completed! Keep going!');
        }
    }
}

function updateProgressBar(challengeId) {
    const progressBar = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    
    if (progressBar && challengeId === 'plastic-free') {
        const challenge = AppState.challenges['plastic-free'];
        progressBar.style.width = challenge.progress + '%';
        progressText.textContent = `${challenge.daysCompleted}/7 days completed`;
    }
}

function completeChallenge(challengeId) {
    showNotification('🎉 Challenge completed! You earned 200 points and the Eco Warrior badge!');
    AppState.user.points += 200;
    AppState.user.badges++;
    updateUserStats();
}

function updateChallengeButton(challengeId, action, text) {
    const challengeCards = document.querySelectorAll('.challenge-card');
    challengeCards.forEach(card => {
        const button = card.querySelector('.challenge-btn');
        if (button && card.querySelector('.challenge-title').textContent.includes('Plastic Free')) {
            button.className = `challenge-btn ${action}`;
            button.textContent = text;
            button.onclick = action === 'continue' ? () => continueChallenge(challengeId) : () => startChallenge(challengeId);
        }
    });
}

// User interaction functions
function updateUserStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers[0].textContent = AppState.user.points.toLocaleString();
    statNumbers[1].textContent = AppState.user.challenges;
    statNumbers[2].textContent = AppState.user.badges;
}

// Community interactions
function likePost(event, postId) {
    const likeButton = event.target.closest('.like-btn');
    const currentLikes = parseInt(likeButton.textContent.match(/\d+/)[0]);
    
    // Toggle like
    const isLiked = likeButton.classList.contains('liked');
    if (isLiked) {
        likeButton.innerHTML = `<i class="fas fa-heart"></i> ${currentLikes - 1}`;
        likeButton.classList.remove('liked');
        announceToScreenReader('Post unliked');
    } else {
        likeButton.innerHTML = `<i class="fas fa-heart"></i> ${currentLikes + 1}`;
        likeButton.classList.add('liked');
        likeButton.style.color = '#e74c3c';
        announceToScreenReader('Post liked');
    }
}

// Accessibility functions
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

// Privacy and Settings Functions
function showPrivacyModal() {
    const modal = createModal('Privacy Policy', `
        <div class="privacy-content">
            <h3>Data Collection & Usage</h3>
            <p>Save The Sea 2.0 is designed with privacy in mind:</p>
            <ul>
                <li><strong>No Personal Data Collection:</strong> We don't collect or store personal information</li>
                <li><strong>Local Storage Only:</strong> All progress data stays on your device</li>
                <li><strong>Mock Data:</strong> All statistics shown are for demonstration purposes</li>
                <li><strong>No Tracking:</strong> We don't track your browsing or activities</li>
            </ul>
            
            <h3>Permissions</h3>
            <ul>
                <li><strong>Location:</strong> Only requested for nearby cleanup events (optional)</li>
                <li><strong>Notifications:</strong> For challenge reminders (with your consent)</li>
                <li><strong>Camera:</strong> For challenge photo submissions (optional)</li>
            </ul>
            
            <h3>Data Security</h3>
            <p>Since this is a prototype using mock data, no real personal information is processed or stored.</p>
            
            <p><em>This app was created for the KDU Save The Sea competition and uses simulated data only.</em></p>
        </div>
    `);
    document.body.appendChild(modal);
}

function showAccessibilitySettings() {
    const modal = createModal('Accessibility Settings', `
        <div class="accessibility-settings">
            <div class="setting-group">
                <h3>Visual Settings</h3>
                <label class="setting-option">
                    <input type="checkbox" id="high-contrast" onchange="toggleHighContrast()">
                    <span>High Contrast Mode</span>
                </label>
                <label class="setting-option">
                    <input type="checkbox" id="reduced-motion" onchange="toggleReducedMotion()">
                    <span>Reduce Animations</span>
                </label>
                <label class="setting-option">
                    <span>Font Size</span>
                    <select id="font-size" onchange="changeFontSize()">
                        <option value="normal">Normal</option>
                        <option value="large">Large</option>
                        <option value="extra-large">Extra Large</option>
                    </select>
                </label>
            </div>
            
            <div class="setting-group">
                <h3>Navigation</h3>
                <label class="setting-option">
                    <input type="checkbox" id="keyboard-nav" checked disabled>
                    <span>Keyboard Navigation (Always Enabled)</span>
                </label>
                <label class="setting-option">
                    <input type="checkbox" id="screen-reader" checked disabled>
                    <span>Screen Reader Support (Always Enabled)</span>
                </label>
            </div>
        </div>
    `);
    document.body.appendChild(modal);
}

function showNotificationSettings() {
    const modal = createModal('Notification Settings', `
        <div class="notification-settings">
            <div class="setting-group">
                <h3>Challenge Reminders</h3>
                <label class="setting-option">
                    <input type="checkbox" id="daily-reminders">
                    <span>Daily Challenge Reminders</span>
                </label>
                <label class="setting-option">
                    <input type="checkbox" id="progress-updates">
                    <span>Progress Updates</span>
                </label>
            </div>
            
            <div class="setting-group">
                <h3>Community Updates</h3>
                <label class="setting-option">
                    <input type="checkbox" id="event-notifications">
                    <span>Beach Cleanup Events</span>
                </label>
                <label class="setting-option">
                    <input type="checkbox" id="achievement-alerts">
                    <span>Achievement Celebrations</span>
                </label>
            </div>
            
            <div class="setting-group">
                <h3>Ocean Alerts</h3>
                <label class="setting-option">
                    <input type="checkbox" id="critical-alerts" checked>
                    <span>Critical Ocean Health Alerts</span>
                </label>
            </div>
        </div>
    `);
    document.body.appendChild(modal);
}

function createModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'settings-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeSettingsModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="close-modal" onclick="closeSettingsModal()" aria-label="Close modal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closeSettingsModal()">Close</button>
            </div>
        </div>
    `;
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    `;
    
    return modal;
}

function closeSettingsModal() {
    const modal = document.querySelector('.settings-modal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Accessibility feature toggles
function toggleHighContrast() {
    document.body.classList.toggle('high-contrast');
    announceToScreenReader('High contrast mode toggled');
}

function toggleReducedMotion() {
    document.body.classList.toggle('reduced-motion');
    announceToScreenReader('Animation settings changed');
}

function changeFontSize() {
    const fontSize = document.getElementById('font-size').value;
    document.body.className = document.body.className.replace(/font-size-\w+/g, '');
    document.body.classList.add(`font-size-${fontSize}`);
    announceToScreenReader(`Font size changed to ${fontSize}`);
}

// Notification system
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #27ae60;
        color: white;
        padding: 15px 25px;
        border-radius: 25px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 3000;
        font-weight: 600;
        animation: slideDown 0.3s ease;
        max-width: 90%;
        text-align: center;
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Alert interactions
function dismissAlert(alertElement) {
    alertElement.style.animation = 'slideUp 0.3s ease';
    setTimeout(() => {
        alertElement.remove();
    }, 300);
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Set up initial state
    switchTab('home');
    
    // Add click handlers for challenge buttons
    const challengeButtons = document.querySelectorAll('.challenge-btn');
    challengeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const challengeCard = this.closest('.challenge-card');
            const challengeTitle = challengeCard.querySelector('.challenge-title').textContent;
            
            if (challengeTitle.includes('Plastic Free')) {
                if (this.classList.contains('continue')) {
                    continueChallenge('plastic-free');
                } else {
                    startChallenge('plastic-free');
                }
            } else if (challengeTitle.includes('Beach Cleanup')) {
                startChallenge('beach-cleanup');
            } else if (challengeTitle.includes('Awareness Campaign')) {
                startChallenge('awareness-campaign');
            }
        });
    });
    
    // Add click handlers for like buttons
    const likeButtons = document.querySelectorAll('.like-btn');
    likeButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            likePost(event, 'post-id');
        });
    });
    
    // Add click handlers for alert dismissal
    const alertCards = document.querySelectorAll('.alert-card');
    alertCards.forEach(alert => {
        alert.addEventListener('click', () => dismissAlert(alert));
        alert.style.cursor = 'pointer';
        alert.title = 'Click to dismiss';
    });
    
    // Add wave animation to hero section
    animateWaves();
    
    // Add scroll effects
    addScrollEffects();
    
    // Initialize progress bars
    updateProgressBar('plastic-free');
});

// Wave animation
function animateWaves() {
    const waves = document.querySelectorAll('.wave');
    waves.forEach((wave, index) => {
        wave.style.animationDelay = `${index * -2}s`;
    });
}

// Scroll effects
function addScrollEffects() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeIn 0.6s ease';
            }
        });
    }, {
        threshold: 0.1
    });
    
    // Observe all cards and sections
    const observeElements = document.querySelectorAll('.stat-card, .alert-card, .article-card, .challenge-card, .feed-item');
    observeElements.forEach(el => observer.observe(el));
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            transform: translate(-50%, -100%);
            opacity: 0;
        }
        to {
            transform: translate(-50%, 0);
            opacity: 1;
        }
    }
    
    @keyframes slideUp {
        from {
            transform: translate(-50%, 0);
            opacity: 1;
        }
        to {
            transform: translate(-50%, -100%);
            opacity: 0;
        }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
    
    .modal-content {
        animation: slideUp 0.3s ease;
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid #f0f0f0;
    }
    
    .modal-header h2 {
        color: #2c3e50;
        margin: 0;
    }
    
    .close-modal {
        background: none;
        border: none;
        font-size: 2rem;
        color: #7f8c8d;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .close-modal:hover {
        color: #e74c3c;
    }
    
    .modal-body {
        padding: 20px;
    }
    
    .modal-body p {
        color: #7f8c8d;
        line-height: 1.6;
        margin-bottom: 20px;
    }
    
    .modal-actions {
        display: flex;
        gap: 10px;
    }
    
    .share-btn, .bookmark-btn {
        background: #3498db;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 25px;
        cursor: pointer;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: background 0.3s ease;
    }
    
    .share-btn:hover, .bookmark-btn:hover {
        background: #2980b9;
    }
    
    .bookmark-btn {
        background: #f39c12;
    }
    
    .bookmark-btn:hover {
        background: #d68910;
    }
    
    .liked {
        color: #e74c3c !important;
    }
`;

document.head.appendChild(style);

// Service Worker for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
            console.log('SW registered: ', registration);
        }).catch(function(registrationError) {
            console.log('SW registration failed: ', registrationError);
        });
    });
}

// Export functions for global access
window.switchTab = switchTab;
window.scrollToAction = scrollToAction;
window.openArticle = openArticle;
window.closeArticleModal = closeArticleModal;
window.shareArticle = shareArticle;
window.bookmarkArticle = bookmarkArticle;
window.showPrivacyModal = showPrivacyModal;
window.showAccessibilitySettings = showAccessibilitySettings;
window.showNotificationSettings = showNotificationSettings;
window.closeSettingsModal = closeSettingsModal;
window.toggleHighContrast = toggleHighContrast;
window.toggleReducedMotion = toggleReducedMotion;
window.changeFontSize = changeFontSize;