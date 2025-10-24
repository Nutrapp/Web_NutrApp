
// Initialize AOS (Animate On Scroll)
AOS.init({
    duration: 1000,
    once: true,
    offset: 100
});

// Loading Screen
window.addEventListener('load', function () {
    const loadingScreen = document.getElementById('loadingScreen');
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 1000);
});

// Scroll Progress Bar
window.addEventListener('scroll', function () {
    const scrollProgress = document.getElementById('scrollProgress');
    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = (scrollTop / scrollHeight) * 100;
    scrollProgress.style.width = scrollPercent + '%';
});

// Back to Top Button
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', function () {
    if (window.pageYOffset > 300) {
        backToTop.classList.add('show');
    } else {
        backToTop.classList.remove('show');
    }
});

backToTop.addEventListener('click', function () {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', function () {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Active navigation link
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section');

window.addEventListener('scroll', function () {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
});

// Interactive Quiz
const quizQuestions = [
    {
        question: "Você sente desconforto abdominal após consumir pães ou massas?",
        options: ["Sempre ou quase sempre", "Às vezes", "Raramente ou nunca"],
        values: [2, 1, 0]
    },
    {
        question: "Você experimenta fadiga ou cansaço após refeições com glúten?",
        options: ["Frequentemente", "Ocasionalmente", "Nunca"],
        values: [2, 1, 0]
    },
    {
        question: "Você tem problemas de pele (eczema, dermatite)?",
        options: ["Sim, frequentemente", "Às vezes", "Não"],
        values: [2, 1, 0]
    },
    {
        question: "Você sente dores de cabeça após consumir alimentos com glúten?",
        options: ["Sim, regularmente", "Ocasionalmente", "Não"],
        values: [2, 1, 0]
    },
    {
        question: "Você tem histórico familiar de doença celíaca ou intolerância ao glúten?",
        options: ["Sim", "Não tenho certeza", "Não"],
        values: [2, 1, 0]
    }
];

let currentQuestion = 0;
let totalScore = 0;

function displayQuestion() {
    const questionText = document.getElementById('questionText');
    const quizOptions = document.getElementById('quizOptions');
    const nextButton = document.getElementById('nextQuestion');
    const resultButton = document.getElementById('showResult');

    if (currentQuestion < quizQuestions.length) {
        const question = quizQuestions[currentQuestion];
        questionText.textContent = question.question;

        quizOptions.innerHTML = '';
        question.options.forEach((option, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'quiz-option';
            optionDiv.textContent = option;
            optionDiv.dataset.value = question.values[index];
            quizOptions.appendChild(optionDiv);
        });

        // Add click handlers to options
        document.querySelectorAll('.quiz-option').forEach(option => {
            option.addEventListener('click', function () {
                document.querySelectorAll('.quiz-option').forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');

                if (currentQuestion === quizQuestions.length - 1) {
                    resultButton.style.display = 'inline-block';
                    nextButton.style.display = 'none';
                } else {
                    nextButton.style.display = 'inline-block';
                    resultButton.style.display = 'none';
                }
            });
        });
    }
}

function nextQuestion() {
    const selectedOption = document.querySelector('.quiz-option.selected');
    if (selectedOption) {
        totalScore += parseInt(selectedOption.dataset.value);
        currentQuestion++;
        displayQuestion();
    }
}

function showQuizResult() {
    const selectedOption = document.querySelector('.quiz-option.selected');
    if (selectedOption) {
        totalScore += parseInt(selectedOption.dataset.value);
    }

    const quizContent = document.getElementById('quizContent');
    const quizResult = document.getElementById('quizResult');

    let resultText = '';
    let resultClass = '';

    if (totalScore >= 7) {
        resultText = `
                    <h3><i class="fas fa-exclamation-triangle me-2"></i>Alta Probabilidade</h3>
                    <p>Seus sintomas sugerem uma possível intolerância ao glúten. Recomendamos fortemente que consulte um médico gastroenterologista para avaliação adequada e exames específicos.</p>
                    <div class="mt-3">
                        <strong>Próximos passos:</strong>
                        <ul class="text-start mt-2">
                            <li>Agende consulta médica</li>
                            <li>Mantenha um diário alimentar</li>
                            <li>Não elimine o glúten antes dos exames</li>
                        </ul>
                    </div>
                `;
        resultClass = 'bg-danger';
    } else if (totalScore >= 4) {
        resultText = `
                    <h3><i class="fas fa-question-circle me-2"></i>Probabilidade Moderada</h3>
                    <p>Alguns sintomas podem estar relacionados ao glúten. Vale a pena observar mais atentamente sua reação aos alimentos e considerar uma consulta médica.</p>
                    <div class="mt-3">
                        <strong>Sugestões:</strong>
                        <ul class="text-start mt-2">
                            <li>Observe padrões alimentares</li>
                            <li>Considere consulta médica</li>
                            <li>Mantenha registro de sintomas</li>
                        </ul>
                    </div>
                `;
        resultClass = 'bg-warning';
    } else {
        resultText = `
                    <h3><i class="fas fa-check-circle me-2"></i>Baixa Probabilidade</h3>
                    <p>Com base nas suas respostas, é menos provável que você tenha intolerância ao glúten. No entanto, se continuar com sintomas, consulte um profissional de saúde.</p>
                    <div class="mt-3">
                        <strong>Mantenha-se saudável:</strong>
                        <ul class="text-start mt-2">
                            <li>Continue uma dieta equilibrada</li>
                            <li>Observe mudanças nos sintomas</li>
                            <li>Consulte médico se necessário</li>
                        </ul>
                    </div>
                `;
        resultClass = 'bg-success';
    }

    quizContent.style.display = 'none';
    quizResult.innerHTML = resultText;
    quizResult.className = `quiz-result show ${resultClass}`;
}

// Initialize quiz
document.getElementById('nextQuestion').addEventListener('click', nextQuestion);
document.getElementById('showResult').addEventListener('click', showQuizResult);
displayQuestion();

// Add parallax effect to hero section
window.addEventListener('scroll', function () {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Add typing effect to hero title
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

// Initialize typing effect after page load
window.addEventListener('load', function () {
    setTimeout(() => {
        const heroTitle = document.querySelector('.hero h1');
        if (heroTitle) {
            const originalText = heroTitle.textContent;
            typeWriter(heroTitle, originalText, 150);
        }
    }, 1500);
});

// Add mouse trail effect
const trail = [];
const trailLength = 10;

document.addEventListener('mousemove', function (e) {
    trail.push({ x: e.clientX, y: e.clientY });
    if (trail.length > trailLength) {
        trail.shift();
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.info-card, .symptom-item, .tip-card, .food-item').forEach(element => {
    observer.observe(element);
});

// Add click sound effect (optional)
function playClickSound() {
    // You can add audio here if desired
    // const audio = new Audio('click-sound.mp3');
    // audio.play();
}

// Add click effects to buttons
document.querySelectorAll('button, .btn, .nav-link').forEach(element => {
    element.addEventListener('click', function (e) {
        playClickSound();

        // Add ripple effect
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');

        this.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
            .ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: ripple-animation 0.6s linear;
                pointer-events: none;
            }
            
            @keyframes ripple-animation {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
document.head.appendChild(style);
