// ================================================================
// PostGenius AI - Main Application
// Core functionality for forms, validation, and interactions
// ================================================================

// Form Validation
class FormValidator {
    constructor(formId) {
        this.form = document.getElementById(formId);
        this.errors = {};
    }

    validate() {
        this.errors = {};
        const inputs = this.form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            const value = input.value.trim();
            const type = input.type;
            
            // Required field validation
            if (input.hasAttribute('required') && !value) {
                this.addError(input.name, getTranslation('error_required'));
            }
            
            // Email validation
            if (type === 'email' && value && !this.isValidEmail(value)) {
                this.addError(input.name, getTranslation('error_email'));
            }
            
            // Password validation
            if (input.name === 'password' && value && value.length < 8) {
                this.addError(input.name, getTranslation('error_password'));
            }
            
            // Password match validation
            if (input.name === 'confirmPassword') {
                const passwordField = this.form.querySelector('input[name="password"]');
                if (passwordField && value !== passwordField.value) {
                    this.addError(input.name, getTranslation('error_match'));
                }
            }
        });
        
        return Object.keys(this.errors).length === 0;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    addError(fieldName, message) {
        this.errors[fieldName] = message;
        const field = this.form.querySelector(`[name="${fieldName}"]`);
        if (field) {
            field.classList.add('input-error');
            field.style.borderColor = 'var(--secondary)';
        }
    }

    clearErrors() {
        this.form.querySelectorAll('.error-message').forEach(el => el.remove());
        this.form.querySelectorAll('input, textarea, select').forEach(el => {
            el.classList.remove('input-error');
            el.style.borderColor = '';
        });
    }

    showErrors() {
        this.clearErrors();
        Object.entries(this.errors).forEach(([fieldName, message]) => {
            const field = this.form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                const errorEl = document.createElement('div');
                errorEl.className = 'error-message';
                errorEl.textContent = message;
                errorEl.style.cssText = 'color: var(--secondary); font-size: 0.85rem; margin-top: 0.25rem;';
                field.parentNode.insertBefore(errorEl, field.nextSibling);
            }
        });
    }
}

// Copy to Clipboard
function copyToClipboard(text, elementId = null) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification(getTranslation('success_copy'));
        if (elementId) {
            const button = document.getElementById(elementId);
            if (button) {
                const originalText = button.textContent;
                button.textContent = '✓ Copied';
                button.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                setTimeout(() => {
                    button.textContent = originalText;
                    button.style.background = '';
                }, 2000);
            }
        }
    }).catch(err => console.error('Failed to copy:', err));
}

// Notification System
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: ${type === 'success' ? 'linear-gradient(135deg, #a855f7, #ec4899)' : '#ef4444'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        font-weight: 600;
        z-index: 10000;
        animation: slide-in-up-animation 0.3s ease;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'fade-out 0.3s ease';
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Smooth Page Transitions
function navigateTo(page) {
    document.body.style.opacity = '0';
    document.body.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        window.location.href = page;
    }, 300);
}

// Loading Animation
function showLoading(element, duration = 2000) {
    const originalContent = element.innerHTML;
    element.innerHTML = '<div class="spinner-loader"></div>';
    element.disabled = true;
    
    setTimeout(() => {
        element.innerHTML = originalContent;
        element.disabled = false;
    }, duration);
}

// Particles Background
function createFloatingParticles(container, count = 50) {
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.width = Math.random() * 5 + 2 + 'px';
        particle.style.height = particle.style.width;
        particle.style.left = Math.random() * 100 + '%';
        particle.style.bottom = '-10px';
        particle.style.animationDelay = Math.random() * 2 + 's';
        particle.style.animationDuration = Math.random() * 4 + 6 + 's';
        container.appendChild(particle);
    }
}

// Smooth scroll behavior
function smoothScroll(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Get query parameters
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Add page entrance animation
    document.body.style.opacity = '1';
    document.body.style.transform = 'translateY(0)';
    document.body.style.transition = 'all 0.5s ease';
    
    // Handle form focus effects
    document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(input => {
        input.addEventListener('focus', function() {
            this.style.transformOrigin = 'center';
            this.style.transform = 'scale(1.02)';
        });
        
        input.addEventListener('blur', function() {
            this.style.transform = 'scale(1)';
        });
    });

    // Handle button hover effects
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Create particles if container exists
    const particlesContainer = document.getElementById('particles');
    if (particlesContainer) {
        createFloatingParticles(particlesContainer, 50);
    }
});

// Debounce function for search and filter operations
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Add to style tag
const style = document.createElement('style');
style.textContent = `
    .input-error {
        border-color: var(--secondary) !important;
        background: rgba(236, 72, 153, 0.1) !important;
    }

    @keyframes fade-out {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);

// Export for use in other modules
window.AppUtils = {
    FormValidator,
    copyToClipboard,
    showNotification,
    navigateTo,
    showLoading,
    createFloatingParticles,
    smoothScroll,
    getQueryParam,
    debounce,
    throttle,
    getTranslation
};
