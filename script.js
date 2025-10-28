// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const contactForm = document.getElementById('contactForm');

// Mobile Navigation Toggle
function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.classList.toggle('no-scroll');
}

// Close mobile menu when clicking outside
function closeMobileMenu(e) {
    if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }
}

// Initialize event listeners
function initEventListeners() {
    // Mobile menu toggle
    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.classList.remove('no-scroll');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', closeMobileMenu);

    // Smooth Scrolling for Navigation Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '#0') return;
            
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Close mobile menu if open
                if (hamburger && hamburger.classList.contains('active')) {
                    hamburger.classList.remove('active');
                    navLinks.classList.remove('active');
                    document.body.classList.remove('no-scroll');
                }
                
                // Calculate the header offset
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                // Smooth scroll to the target
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Initialize form validation if form exists
    if (contactForm) {
        initFormValidation();
    }
}

// Form Validation and Submission
function initFormValidation() {
    const form = contactForm;
    const formElements = form.elements;
    const submitBtn = form.querySelector('button[type="submit"]');
    let isSubmitting = false;

    // Add input event listeners for real-time validation
    Array.from(formElements).forEach(element => {
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
            element.addEventListener('input', handleInputValidation);
            element.addEventListener('blur', handleInputValidation);
        }
    });

    // Handle form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (isSubmitting) return;
        
        // Validate all fields before submission
        let isValid = true;
        Array.from(formElements).forEach(element => {
            if (element.required && !element.value.trim()) {
                showError(element, 'This field is required');
                isValid = false;
            }
        });

        if (!isValid) return;

        // Disable submit button and show loading state
        isSubmitting = true;
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        try {
            const formData = new FormData(form);
            const formValues = Object.fromEntries(formData.entries());
            const { name, email, phone, message, 'contact-method': contactMethod, subject } = formValues;
            
            // Prepare the message content
            const messageContent = `New message from Kertai Milk Website:%0A%0A` +
                                `Name: ${name}%0A` +
                                `Email: ${email}%0A` +
                                `Phone: ${phone}%0A` +
                                `Subject: ${subject}%0A` +
                                `Preferred Contact Method: ${contactMethod}%0A%0A` +
                                `Message:%0A${message}`;
            
            // Send via WhatsApp
            const phoneNumber = '254112676725'; // Replace with actual business number
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${messageContent}`;
            
            // Open WhatsApp in a new tab
            window.open(whatsappUrl, '_blank');
            
            // Also send via email using Formspree or similar service
            const emailResponse = await fetch('https://formspree.io/f/your-form-id', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    email,
                    phone,
                    subject,
                    message,
                    contactMethod,
                    _subject: `New Contact from Kertai Milk Website: ${subject}`
                })
            });
            
            if (!emailResponse.ok) {
                throw new Error('Failed to send email');
            }
            
            // Show success message
            showFormMessage('success', 'Your message has been sent successfully! We\'ll get back to you soon.');
            
            // Reset form
            form.reset();
            
            // Remove any error messages
            document.querySelectorAll('.error-message').forEach(el => el.remove());
            
        } catch (error) {
            console.error('Form submission error:', error);
            showFormMessage('error', 'Something went wrong. Please try again later.');
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            isSubmitting = false;
        }
    });

    // Input validation handler
    function handleInputValidation(e) {
        const input = e.target;
        const value = input.value.trim();
        const isRequired = input.required;
        const type = input.type;
        const name = input.name;
        let isValid = true;
        let errorMessage = '';

        // Reset error state
        clearError(input);

        // Check required fields
        if (isRequired && !value) {
            errorMessage = 'This field is required';
            isValid = false;
        } 
        // Email validation
        else if (type === 'email' && value && !isValidEmail(value)) {
            errorMessage = 'Please enter a valid email address';
            isValid = false;
        }
        // Phone validation
        else if (name === 'phone' && value && !isValidPhone(value)) {
            errorMessage = 'Please enter a valid phone number';
            isValid = false;
        }

        // Show/hide error message
        if (!isValid) {
            showError(input, errorMessage);
        }
    }

    // Helper functions
    function showError(input, message) {
        clearError(input);
        
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        errorElement.style.color = '#e74c3c';
        errorElement.style.fontSize = '0.8rem';
        errorElement.style.marginTop = '5px';
        errorElement.style.display = 'block';
        
        input.parentNode.insertBefore(errorElement, input.nextSibling);
        input.classList.add('error');
    }

    function clearError(input) {
        const formGroup = input.closest('.form-group');
        if (!formGroup) return;
        
        const errorElement = formGroup.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
        
        input.classList.remove('error');
    }

    function showFormMessage(type, message) {
        // Remove any existing messages
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageElement = document.createElement('div');
        messageElement.className = `form-message ${type}`;
        messageElement.textContent = message;
        messageElement.style.padding = '15px';
        messageElement.style.margin = '15px 0';
        messageElement.style.borderRadius = '5px';
        messageElement.style.textAlign = 'center';
        messageElement.style.fontWeight = '500';
        
        if (type === 'success') {
            messageElement.style.backgroundColor = 'rgba(46, 204, 113, 0.1)';
            messageElement.style.color = '#27ae60';
            messageElement.style.border = '1px solid #2ecc71';
        } else {
            messageElement.style.backgroundColor = 'rgba(231, 76, 60, 0.1)';
            messageElement.style.color = '#e74c3c';
            messageElement.style.border = '1px solid #e74c3c';
        }

        // Insert message after the form title
        const formTitle = contactForm.querySelector('h3');
        if (formTitle) {
            formTitle.parentNode.insertBefore(messageElement, formTitle.nextSibling);
        } else {
            contactForm.prepend(messageElement);
        }

        // Auto-hide message after 5 seconds
        setTimeout(() => {
            messageElement.style.opacity = '0';
            messageElement.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                messageElement.remove();
            }, 500);
        }, 5000);
    }

    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    function isValidPhone(phone) {
        // Basic phone validation - accepts numbers, spaces, +, -, (, )
        const re = /^[+\s()\d-]{10,20}$/;
        return re.test(phone);
    }
}

// Enquire About Product
function enquireAboutProduct(productName) {
    const message = `I'm interested in ${productName}. Please provide more details.`;
    const messageField = document.querySelector('#message');
    
    if (messageField) {
        messageField.value = message;
        messageField.focus();
        
        // Smooth scroll to contact form
        setTimeout(() => {
            document.querySelector('.contact').scrollIntoView({ 
                behavior: 'smooth',
                block: 'center'
            });
        }, 100);
    }
}

// Animate elements on scroll
function initScrollAnimations() {
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.about-content, .product-card, .contact-method, .contact-form-container, .map-container, .stats, .value-item, .mission-box, .vision-box');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight * 0.85;
            
            if (elementPosition < screenPosition) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };
    
    // Initial check
    animateOnScroll();
    
    // Check on scroll with throttle
    let isScrolling;
    window.addEventListener('scroll', () => {
        window.clearTimeout(isScrolling);
        isScrolling = setTimeout(animateOnScroll, 50);
    }, { passive: true });
}

// Initialize the page
window.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    initScrollAnimations();
    
    // Add animation classes to elements
    document.querySelectorAll('.about-content, .product-card, .contact-method, .contact-form-container, .map-container, .stats, .value-item, .mission-box, .vision-box').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
    
    // Initialize any other components
    if (typeof displayProducts === 'function') {
        displayProducts();
    }
});
