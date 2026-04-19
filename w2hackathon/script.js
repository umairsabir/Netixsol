const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");
const overlay = document.getElementById("overlay");
const closeBtn = document.getElementById("closeBtn");

const mainContent = document.getElementById("main-content");
const signupSection = document.getElementById("signup-section");
const loginSection = document.getElementById("login-section");
const headerh1 = document.getElementById("headerh1");
const headersvg = document.getElementById("headersvg");
const headerimg = document.getElementById("headerimg");
const headernav = document.getElementById("headernav");
const headerbell = document.getElementById("headerbell");
const header = document.getElementById("header");
const headerInitials = document.getElementById("headerInitials");
const qAvatarImg = document.getElementById("quizimg");
const qAvatarInitials = document.getElementById("quizInitials");
const progressAvatarImg = document.getElementById("progressimg");
const progressAvatarInitials = document.getElementById("progressInitials");
const scoreAvatarImg = document.getElementById("scoreimg");
const scoreAvatarInitials = document.getElementById("scoreInitials");
const reviewAvatarImg = document.getElementById("reviewimg");
const reviewAvatarInitials = document.getElementById("reviewInitials");
const pImg = document.getElementById("profileImg");
const pInitials = document.getElementById("profileInitials");



const quizselectsection = document.getElementById("quizselect");
const progressSection = document.getElementById("Progresssection");
const scoreSection = document.getElementById("Scoresection");
const reviewSection = document.getElementById("Reviewsection");
const personalsection = document.getElementById("personalsection");

const btn = document.getElementById("get-started-btn");
const signupbtn = document.getElementById("signupbtn");
const signupsigninbtn = document.getElementById("sign-in");
const loginbtn = document.getElementById("login-btn");
const loginsignupbtn = document.getElementById("loginsignup");
const toggle = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

// --- Quiz Data ---
const quizData = {
    "categories": [
        {
            "name": "Science",
            "questions": [
                { "question": "What planet is known as the Red Planet?", "options": [{ "text": "Earth", "isCorrect": false }, { "text": "Mars", "isCorrect": true }, { "text": "Jupiter", "isCorrect": false }, { "text": "Venus", "isCorrect": false }], "type": "single-choice" },
                { "question": "What gas do plants absorb from the atmosphere?", "options": [{ "text": "Oxygen", "isCorrect": false }, { "text": "Carbon Dioxide", "isCorrect": true }, { "text": "Nitrogen", "isCorrect": false }, { "text": "Hydrogen", "isCorrect": false }], "type": "single-choice" },
                { "question": "What is H2O commonly known as?", "options": [{ "text": "Salt", "isCorrect": false }, { "text": "Water", "isCorrect": true }, { "text": "Oxygen", "isCorrect": false }, { "text": "Hydrogen", "isCorrect": false }], "type": "single-choice" },
                { "question": "What force pulls objects toward Earth?", "options": [{ "text": "Magnetism", "isCorrect": false }, { "text": "Gravity", "isCorrect": true }, { "text": "Friction", "isCorrect": false }, { "text": "Energy", "isCorrect": false }], "type": "single-choice" },
                { "question": "Which organ pumps blood in the human body?", "options": [{ "text": "Brain", "isCorrect": false }, { "text": "Lungs", "isCorrect": false }, { "text": "Heart", "isCorrect": true }, { "text": "Kidney", "isCorrect": false }], "type": "single-choice" },
                { "question": "What is the hardest natural substance on Earth?", "options": [{ "text": "Gold", "isCorrect": false }, { "text": "Iron", "isCorrect": false }, { "text": "Diamond", "isCorrect": true }, { "text": "Silver", "isCorrect": false }], "type": "single-choice" },
                { "question": "Which gas is most abundant in the Earth's atmosphere?", "options": [{ "text": "Oxygen", "isCorrect": false }, { "text": "Nitrogen", "isCorrect": true }, { "text": "Carbon Dioxide", "isCorrect": false }, { "text": "Argon", "isCorrect": false }], "type": "single-choice" },
                { "question": "What is the center of an atom called?", "options": [{ "text": "Proton", "isCorrect": false }, { "text": "Neutron", "isCorrect": false }, { "text": "Nucleus", "isCorrect": true }, { "text": "Electron", "isCorrect": false }], "type": "single-choice" },
                { "question": "How many bones are in the adult human body?", "options": [{ "text": "206", "isCorrect": true }, { "text": "205", "isCorrect": false }, { "text": "210", "isCorrect": false }, { "text": "195", "isCorrect": false }], "type": "single-choice" },
                { "question": "What is the speed of light approx?", "options": [{ "text": "300,000 km/s", "isCorrect": true }, { "text": "150,000 km/s", "isCorrect": false }, { "text": "450,000 km/s", "isCorrect": false }, { "text": "600,000 km/s", "isCorrect": false }], "type": "single-choice" }
            ]
        },
        {
            "name": "History",
            "questions": [
                { "question": "Who was the first President of the USA?", "options": [{ "text": "Abraham Lincoln", "isCorrect": false }, { "text": "George Washington", "isCorrect": true }, { "text": "John Adams", "isCorrect": false }, { "text": "Thomas Jefferson", "isCorrect": false }], "type": "single-choice" },
                { "question": "In which year did World War II end?", "options": [{ "text": "1945", "isCorrect": true }, { "text": "1939", "isCorrect": false }, { "text": "1918", "isCorrect": false }, { "text": "1950", "isCorrect": false }], "type": "single-choice" },
                { "question": "Who discovered America?", "options": [{ "text": "Christopher Columbus", "isCorrect": true }, { "text": "Vasco da Gama", "isCorrect": false }, { "text": "Marco Polo", "isCorrect": false }, { "text": "Magellan", "isCorrect": false }], "type": "single-choice" },
                { "question": "Which ancient civilization built the pyramids?", "options": [{ "text": "Romans", "isCorrect": false }, { "text": "Greeks", "isCorrect": false }, { "text": "Egyptians", "isCorrect": true }, { "text": "Chinese", "isCorrect": false }], "type": "single-choice" },
                { "question": "Who was known as the Iron Man of India?", "options": [{ "text": "Mahatma Gandhi", "isCorrect": false }, { "text": "Sardar Patel", "isCorrect": true }, { "text": "Nehru", "isCorrect": false }, { "text": "Subhash Chandra Bose", "isCorrect": false }], "type": "single-choice" },
                { "question": "What year did the Titanic sink?", "options": [{ "text": "1912", "isCorrect": true }, { "text": "1910", "isCorrect": false }, { "text": "1914", "isCorrect": false }, { "text": "1920", "isCorrect": false }], "type": "single-choice" },
                { "question": "Who was the first woman to win a Nobel Prize?", "options": [{ "text": "Marie Curie", "isCorrect": true }, { "text": "Mother Teresa", "isCorrect": false }, { "text": "Ada Lovelace", "isCorrect": false }, { "text": "Florence Nightingale", "isCorrect": false }], "type": "single-choice" },
                { "question": "The Great Wall is located in which country?", "options": [{ "text": "Japan", "isCorrect": false }, { "text": "China", "isCorrect": true }, { "text": "India", "isCorrect": false }, { "text": "Korea", "isCorrect": false }], "type": "single-choice" },
                { "question": "Who was the primary author of the Declaration of Independence?", "options": [{ "text": "Ben Franklin", "isCorrect": false }, { "text": "Thomas Jefferson", "isCorrect": true }, { "text": "John Adams", "isCorrect": false }, { "text": "George Washington", "isCorrect": false }], "type": "single-choice" },
                { "question": "What was the capital of the Ottoman Empire?", "options": [{ "text": "Istanbul", "isCorrect": true }, { "text": "Ankara", "isCorrect": false }, { "text": "Cairo", "isCorrect": false }, { "text": "Baghdad", "isCorrect": false }], "type": "single-choice" }
            ]
        },
        {
            "name": "Literature",
            "questions": [
                { "question": "Who wrote 'Romeo and Juliet'?", "options": [{ "text": "William Shakespeare", "isCorrect": true }, { "text": "Charles Dickens", "isCorrect": false }, { "text": "Jane Austen", "isCorrect": false }, { "text": "Mark Twain", "isCorrect": false }], "type": "single-choice" },
                { "question": "Who is the author of 'Harry Potter'?", "options": [{ "text": "J.K. Rowling", "isCorrect": true }, { "text": "J.R.R. Tolkien", "isCorrect": false }, { "text": "George R.R. Martin", "isCorrect": false }, { "text": "C.S. Lewis", "isCorrect": false }], "type": "single-choice" },
                { "question": "Which novel begins with 'Call me Ishmael'?", "options": [{ "text": "Moby Dick", "isCorrect": true }, { "text": "Hamlet", "isCorrect": false }, { "text": "Macbeth", "isCorrect": false }, { "text": "Othello", "isCorrect": false }], "type": "single-choice" },
                { "question": "Who wrote 'Pride and Prejudice'?", "options": [{ "text": "Jane Austen", "isCorrect": true }, { "text": "Emily Bronte", "isCorrect": false }, { "text": "Charles Dickens", "isCorrect": false }, { "text": "Leo Tolstoy", "isCorrect": false }], "type": "single-choice" },
                { "question": "Who wrote 'The Odyssey'?", "options": [{ "text": "Homer", "isCorrect": true }, { "text": "Virgil", "isCorrect": false }, { "text": "Plato", "isCorrect": false }, { "text": "Aristotle", "isCorrect": false }], "type": "single-choice" },
                { "question": "In which book did Sherlock Holmes first appear?", "options": [{ "text": "A Study in Scarlet", "isCorrect": true }, { "text": "The Sign of Four", "isCorrect": false }, { "text": "The Hobbit", "isCorrect": false }, { "text": "Ulysses", "isCorrect": false }], "type": "single-choice" },
                { "question": "Who wrote '1984'?", "options": [{ "text": "George Orwell", "isCorrect": true }, { "text": "Aldous Huxley", "isCorrect": false }, { "text": "Ray Bradbury", "isCorrect": false }, { "text": "Isaac Asimov", "isCorrect": false }], "type": "single-choice" },
                { "question": "What is the name of the Hobbit in 'The Hobbit'?", "options": [{ "text": "Bilbo Baggins", "isCorrect": true }, { "text": "Frodo Baggins", "isCorrect": false }, { "text": "Samwise Gamgee", "isCorrect": false }, { "text": "Gandalf", "isCorrect": false }], "type": "single-choice" },
                { "question": "Who wrote 'The Great Gatsby'?", "options": [{ "text": "F. Scott Fitzgerald", "isCorrect": true }, { "text": "Ernest Hemingway", "isCorrect": false }, { "text": "William Faulkner", "isCorrect": false }, { "text": "John Steinbeck", "isCorrect": false }], "type": "single-choice" },
                { "question": "Which play features the character 'Oedipus'?", "options": [{ "text": "Oedipus Rex", "isCorrect": true }, { "text": "Antigone", "isCorrect": false }, { "text": "Medea", "isCorrect": false }, { "text": "The Clouds", "isCorrect": false }], "type": "single-choice" }
            ]
        },
        {
            "name": "Mathematics",
            "questions": [
                { "question": "What is 5 + 3?", "options": [{ "text": "6", "isCorrect": false }, { "text": "8", "isCorrect": true }, { "text": "10", "isCorrect": false }, { "text": "7", "isCorrect": false }], "type": "single-choice" },
                { "question": "What is 10 × 2?", "options": [{ "text": "20", "isCorrect": true }, { "text": "10", "isCorrect": false }, { "text": "15", "isCorrect": false }, { "text": "25", "isCorrect": false }], "type": "single-choice" },
                { "question": "What is the square root of 16?", "options": [{ "text": "2", "isCorrect": false }, { "text": "4", "isCorrect": true }, { "text": "6", "isCorrect": false }, { "text": "8", "isCorrect": false }], "type": "single-choice" },
                { "question": "What is 9 - 4?", "options": [{ "text": "3", "isCorrect": false }, { "text": "5", "isCorrect": true }, { "text": "6", "isCorrect": false }, { "text": "4", "isCorrect": false }], "type": "single-choice" },
                { "question": "What is 7 × 3?", "options": [{ "text": "21", "isCorrect": true }, { "text": "24", "isCorrect": false }, { "text": "18", "isCorrect": false }, { "text": "27", "isCorrect": false }], "type": "single-choice" },
                { "question": "What is 144 / 12?", "options": [{ "text": "12", "isCorrect": true }, { "text": "10", "isCorrect": false }, { "text": "14", "isCorrect": false }, { "text": "16", "isCorrect": false }], "type": "single-choice" },
                { "question": "What is 2 to the power of 5?", "options": [{ "text": "32", "isCorrect": true }, { "text": "16", "isCorrect": false }, { "text": "64", "isCorrect": false }, { "text": "25", "isCorrect": false }], "type": "single-choice" },
                { "question": "What is the value of Pi (to 2 decimal places)?", "options": [{ "text": "3.14", "isCorrect": true }, { "text": "3.12", "isCorrect": false }, { "text": "3.16", "isCorrect": false }, { "text": "3.18", "isCorrect": false }], "type": "single-choice" },
                { "question": "How many degrees are in a right angle?", "options": [{ "text": "90", "isCorrect": true }, { "text": "180", "isCorrect": false }, { "text": "45", "isCorrect": false }, { "text": "360", "isCorrect": false }], "type": "single-choice" },
                { "question": "What is 15% of 200?", "options": [{ "text": "30", "isCorrect": true }, { "text": "20", "isCorrect": false }, { "text": "40", "isCorrect": false }, { "text": "25", "isCorrect": false }], "type": "single-choice" }
            ]
        },
        {
            "name": "General Knowledge",
            "questions": [
                { "question": "What is the capital of France?", "options": [{ "text": "Berlin", "isCorrect": false }, { "text": "London", "isCorrect": false }, { "text": "Paris", "isCorrect": true }, { "text": "Madrid", "isCorrect": false }], "type": "single-choice" },
                { "question": "Which is the largest ocean on Earth?", "options": [{ "text": "Atlantic", "isCorrect": false }, { "text": "Indian", "isCorrect": false }, { "text": "Pacific", "isCorrect": true }, { "text": "Arctic", "isCorrect": false }], "type": "single-choice" },
                { "question": "In which continent is the Sahara Desert?", "options": [{ "text": "Asia", "isCorrect": false }, { "text": "Africa", "isCorrect": true }, { "text": "South America", "isCorrect": false }, { "text": "Australia", "isCorrect": false }], "type": "single-choice" },
                { "question": "Which country is home to the Kangaroo?", "options": [{ "text": "Australia", "isCorrect": true }, { "text": "New Zealand", "isCorrect": false }, { "text": "South Africa", "isCorrect": false }, { "text": "Brazil", "isCorrect": false }], "type": "single-choice" },
                { "question": "What is the currency of Japan?", "options": [{ "text": "Yuan", "isCorrect": false }, { "text": "Yen", "isCorrect": true }, { "text": "Won", "isCorrect": false }, { "text": "Dollar", "isCorrect": false }], "type": "single-choice" },
                { "question": "Which is the tallest mountain in the world?", "options": [{ "text": "K2", "isCorrect": false }, { "text": "Mount Everest", "isCorrect": true }, { "text": "Kangchenjunga", "isCorrect": false }, { "text": "Lhotse", "isCorrect": false }], "type": "single-choice" },
                { "question": "Who painted the Mona Lisa?", "options": [{ "text": "Van Gogh", "isCorrect": false }, { "text": "Da Vinci", "isCorrect": true }, { "text": "Picasso", "isCorrect": false }, { "text": "Monet", "isCorrect": false }], "type": "single-choice" },
                { "question": "Which language has the most native speakers?", "options": [{ "text": "English", "isCorrect": false }, { "text": "Spanish", "isCorrect": false }, { "text": "Mandarin Chinese", "isCorrect": true }, { "text": "Hindi", "isCorrect": false }], "type": "single-choice" },
                { "question": "What is the largest animal in the world?", "options": [{ "text": "African Elephant", "isCorrect": false }, { "text": "Blue Whale", "isCorrect": true }, { "text": "Giraffe", "isCorrect": false }, { "text": "Colossal Squid", "isCorrect": false }], "type": "single-choice" },
                { "question": "Which country invented tea?", "options": [{ "text": "India", "isCorrect": false }, { "text": "China", "isCorrect": true }, { "text": "Japan", "isCorrect": false }, { "text": "England", "isCorrect": false }], "type": "single-choice" }
            ]
        }
    ]
};

// --- Quiz State ---
let currentCategory = null;
let currentIndex = 0;
let userAnswers = []; // Store { question, selected, correct, isCorrect }
let timerSeconds = 30;
let timerInterval = null;
let currentUser = JSON.parse(sessionStorage.getItem("currentUser")) || null;
let isQuizActive = false;



const navContainer = headernav ? headernav.parentElement : null;
const menuBtnElem = document.getElementById("menuBtn");


// --- Navigation & UI Utilities ---
function hideAllSections() {
    [mainContent, signupSection, loginSection, quizselectsection, progressSection, scoreSection, reviewSection, personalsection].forEach(section => {
        if (section) section.classList.add("hidden");
    });
    header.classList.remove("hidden"); // Header is usually shown unless specific pages hide it
}

function updateHeaderForAuth() {
    if (navContainer) navContainer.style.setProperty('display', 'none', 'important');
    if (headerbell) headerbell.style.setProperty('display', 'none', 'important');
    
    // Hide the main avatar container (desktop & mobile)
    const hAvatars = document.querySelectorAll("#headerAvatar, #headerAvatarSecondary");
    hAvatars.forEach(av => av.style.setProperty('display', 'none', 'important'));
    
    if (menuBtnElem) menuBtnElem.style.setProperty('display', 'none', 'important');
    
    headerh1.innerHTML = "Quiz App";
    headersvg.classList.add("hidden");
}


function updateHeaderForQuiz() {
    headerh1.innerHTML = "Quiz App";
    headersvg.classList.add("hidden");
    headerimg.src = "/image/qprofile.png";
}

function resetHeader() {
    headerh1.innerHTML = "QuizMaster";
    headersvg.classList.remove("hidden");
    if (navContainer) navContainer.style.display = '';
    if (headerbell) headerbell.style.display = '';
    
    // Show the container
    const hAvatars = document.querySelectorAll("#headerAvatar, #headerAvatarSecondary");
    hAvatars.forEach(av => av.style.display = '');
    
    updateAvatar(); // Refresh avatar state
    
    if (menuBtnElem) menuBtnElem.style.display = '';
}


function updateAvatar() {
    const initial = (currentUser && currentUser.name) ? currentUser.name.charAt(0).toUpperCase() : "";

    // Target all avatar containers
    const containers = document.querySelectorAll(".avatar-container");

    containers.forEach(container => {
        const img = container.querySelector("img");
        const initials = container.querySelector("span");

        if (initial) {
            if (img) img.classList.add("hidden");
            if (initials) {
                initials.innerText = initial;
                initials.classList.remove("hidden");
            }
        } else {
            if (initials) initials.classList.add("hidden");
            if (img) {
                img.classList.remove("hidden");
                
                // Set correct default source based on ID
                if (container.id === "profileAvatar") {
                    img.src = "/image/p.png";
                } else if (container.id === "headerAvatar") {
                    img.src = "/image/profile.png";
                } else {
                    img.src = "/image/qprofile.png";
                }
            }
        }
    });

}





// Initial call
updateAvatar();




function openMenu() {
    mobileMenu.classList.remove("-translate-x-full");
    overlay.classList.remove("hidden");
}

function closeMenu() {
    mobileMenu.classList.add("-translate-x-full");
    overlay.classList.add("hidden");
}

if (menuBtn) menuBtn.addEventListener("click", openMenu);
if (closeBtn) closeBtn.addEventListener("click", closeMenu);
if (overlay) overlay.addEventListener("click", closeMenu);

// --- Auth Mockup Logic ---
btn.addEventListener("click", (e) => {
    e.preventDefault();
    hideAllSections();
    signupSection.classList.remove("hidden");
    resetHeader(); // Full header for Signup
});



signupbtn.addEventListener("click", (e) => {
    e.preventDefault();
    let name = document.getElementById("signupName").value.trim();
    let email = document.getElementById("signupEmail").value.trim();
    let pass = document.getElementById("signupPassword").value;
    let confirmPass = document.getElementById("signupconfirmPassword").value;

    if (!name || !email || !pass || !confirmPass) {
        alert("Please fill all fields.");
        return;
    }

    if (pass !== confirmPass) {
        alert("Passwords do not match.");
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];
    if (users.find(u => u.email === email)) {
        alert("User already exists with this email.");
        return;
    }

    let newUser = { name, email, password: pass, results: [] };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    alert("Signup successful! Please login.");
    hideAllSections();
    loginSection.classList.remove("hidden");
});

signupsigninbtn.addEventListener("click", () => {
    hideAllSections();
    loginSection.classList.remove("hidden");
    updateHeaderForAuth(); // Minimal header for Login
});

loginsignupbtn.addEventListener("click", () => {
    hideAllSections();
    signupSection.classList.remove("hidden");
    resetHeader(); // Full header for Signup
});


loginbtn.addEventListener("click", (e) => {
    e.preventDefault();
    let email = document.getElementById("loginEmail").value.trim();
    let pass = passwordInput.value;

    let users = JSON.parse(localStorage.getItem("users")) || [];
    let user = users.find(u => u.email === email && u.password === pass);

    if (user) {
        currentUser = user;
        sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
        updateAvatar(); // Update avatar immediately on login

        alert("Login successful!");
        showQuizSelection();
    } else {

        alert("Invalid email or password.");
    }
});

toggle.addEventListener("click", () => {
    passwordInput.type = passwordInput.type === "password" ? "text" : "password";
});

// --- Quiz Selection Logic ---
function showQuizSelection() {
    hideAllSections();
    header.classList.add("hidden"); // Following user design pattern of hiding header on quiz select
    quizselectsection.classList.remove("hidden");
}

// Category filter
document.querySelectorAll(".category-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const type = btn.getAttribute("data-type");
        const cards = document.querySelectorAll("#quizselect .cursor-pointer");

        // Clear active styles
        document.querySelectorAll(".category-btn").forEach(b => b.classList.replace("bg-blue-600", "bg-gray-200"));
        document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("text-white"));

        btn.classList.replace("bg-gray-200", "bg-blue-600");
        btn.classList.add("text-white");

        cards.forEach(card => {
            const cardTitle = card.querySelector("h3").innerText;
            if (type === "all" || cardTitle.includes(type) || (type === "General Knowledge" && cardTitle === "General Knowledge")) {
                card.classList.remove("hidden");
            } else {
                card.classList.add("hidden");
            }
        });
    });
});

// Individual Quiz Clicks
const quizItems = [
    { id: "quizgeneral", name: "General Knowledge" },
    { id: "quizScience", name: "Science" },
    { id: "quizHistory", name: "History" },
    { id: "quizLiterature", name: "Literature" },
    { id: "quizMathematics", name: "Mathematics" }
];

quizItems.forEach(item => {
    const el = document.getElementById(item.id);
    if (el) el.onclick = () => startQuiz(item.name);
});

// Category Filter Buttons
document.querySelectorAll(".category-btn").forEach(btn => {
    btn.onclick = () => {
        const type = btn.innerText.trim();
        
        // Update active style
        document.querySelectorAll(".category-btn").forEach(b => {
            b.classList.remove("bg-blue-600", "text-white");
            b.classList.add("bg-gray-200", "text-black");
        });
        btn.classList.replace("bg-gray-200", "bg-blue-600");
        btn.classList.add("text-white");

        // Filter Logic
        quizItems.forEach(item => {
            const el = document.getElementById(item.id);
            if (el) {
                if (type === "All" || item.name.toLowerCase().includes(type.toLowerCase())) {
                    el.classList.remove("hidden");
                } else {
                    el.classList.add("hidden");
                }
            }
        });
    };
});

// Featured Clicks
document.querySelectorAll("#featuredSection > div").forEach((card, idx) => {
    card.style.cursor = "pointer";
    card.onclick = () => {
        const names = ["Science", "History", "Literature"];
        startQuiz(names[idx]);
    };
});

// Search Logic
const searchInput = document.querySelector("#quizselect input[type='text']");
if (searchInput) {
    searchInput.oninput = (e) => {
        const term = e.target.value.toLowerCase();
        quizItems.forEach(item => {
            const el = document.getElementById(item.id);
            if (el) {
                if (item.name.toLowerCase().includes(term)) {
                    el.classList.remove("hidden");
                } else {
                    el.classList.add("hidden");
                }
            }
        });
    };
}


// --- Quiz Execution Logic ---
function startQuiz(categoryName) {
    if (!quizData) return;
    currentCategory = quizData.categories.find(c => c.name === categoryName);
    if (!currentCategory) return;

    currentIndex = 0;
    userAnswers = [];
    hideAllSections();
    header.classList.add("hidden");
    progressSection.classList.remove("hidden");

    isQuizActive = true;
    loadQuestion();
}


function loadQuestion() {
    const q = currentCategory.questions[currentIndex];
    const questionText = document.querySelector("#Progresssection h2");
    const optionDiv = document.getElementById("optiondiv");
    const progressText = document.getElementById("quizProgressText");
    const progressBar = document.getElementById("quizProgressBar");


    questionText.innerText = q.question;
    optionDiv.innerHTML = "";

    q.options.forEach((opt, idx) => {
        const label = document.createElement("label");
        label.className = "flex items-center gap-3 border rounded-lg p-4 cursor-pointer bg-white hover:bg-gray-50 transition";
        label.innerHTML = `
            <input type="radio" name="quiz-option" value="${idx}" class="accent-black">
            <span>${opt.text}</span>
        `;
        optionDiv.appendChild(label);
    });

    // Update Progress
    const total = currentCategory.questions.length;
    progressText.innerText = `Question ${currentIndex + 1} of ${total}`;
    progressBar.style.width = `${((currentIndex + 1) / total) * 100}%`;

    // Handle "Previous" button visibility
    const prevBtn = document.querySelector("#Progresssection .bg-gray-300");
    prevBtn.style.visibility = currentIndex === 0 ? "hidden" : "visible";

    startTimer();
}

function startTimer() {
    clearInterval(timerInterval);
    timerSeconds = 30; // 30 seconds per question
    updateTimerUI();

    timerInterval = setInterval(() => {
        timerSeconds--;
        updateTimerUI();
        if (timerSeconds <= 0) {
            handleNext();
        }
    }, 1000);
}

function updateTimerUI() {
    const secondsDisplay = document.querySelectorAll("#Progresssection .text-xl.font-semibold")[2];
    secondsDisplay.innerText = timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds;
}

function handleNext() {
    const selectedOption = document.querySelector('input[name="quiz-option"]:checked');
    const q = currentCategory.questions[currentIndex];

    let answerIndex = selectedOption ? parseInt(selectedOption.value) : -1;
    let isCorrect = answerIndex !== -1 && q.options[answerIndex].isCorrect;

    // Store result
    userAnswers[currentIndex] = {
        question: q.question,
        selected: answerIndex !== -1 ? q.options[answerIndex].text : "No Answer",
        correct: q.options.find(o => o.isCorrect).text,
        isCorrect: isCorrect
    };

    if (currentIndex < currentCategory.questions.length - 1) {
        currentIndex++;
        loadQuestion();
    } else {
        isQuizActive = false;
        finishQuiz();
    }
}


function handlePrev() {
    if (currentIndex > 0) {
        currentIndex--;
        loadQuestion();
    }
}

document.querySelector("#Progresssection button.bg-blue-600").onclick = handleNext;
document.querySelector("#Progresssection button.bg-gray-300").onclick = handlePrev;

function finishQuiz() {
    clearInterval(timerInterval);
    hideAllSections();
    scoreSection.classList.remove("hidden");
    header.classList.add("hidden");


    const correctCount = userAnswers.filter(a => a.isCorrect).length;
    const totalCount = currentCategory.questions.length;
    const scoreTitle = scoreSection.querySelector("h3");
    const scoreMsg = scoreSection.querySelector("p.text-gray-600");

    scoreTitle.innerText = `${correctCount} / ${totalCount}`;

    scoreMsg.innerText = `Congratulations, ${currentUser ? currentUser.name : 'User'}! You've completed the ${currentCategory.name} quiz with a score of ${correctCount} out of ${totalCount}. Your performance indicates a ${correctCount > 7 ? 'strong' : 'fair'} understanding of the subject matter.`;

    // Save to user history
    if (currentUser) {
        const result = {
            quizName: currentCategory.name,
            score: `${correctCount}/${totalCount}`,
            date: new Date().toISOString().split('T')[0]
        };

        let users = JSON.parse(localStorage.getItem("users")) || [];
        let userIdx = users.findIndex(u => u.email === currentUser.email);
        if (userIdx !== -1) {
            users[userIdx].results.push(result);
            localStorage.setItem("users", JSON.stringify(users));
            currentUser = users[userIdx];
            sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
        }

    }
}

// Score Page Buttons
scoreSection.querySelector("button.bg-blue-600").onclick = showReview;
scoreSection.querySelector("button.bg-gray-300").onclick = showQuizSelection;

function showReview() {
    hideAllSections();
    reviewSection.classList.remove("hidden");
    header.classList.add("hidden");


    const reviewContainer = reviewSection.querySelector(".space-y-8");
    reviewContainer.innerHTML = "";

    userAnswers.forEach((ans, idx) => {
        if (!ans.isCorrect) {
            const div = document.createElement("div");
            div.innerHTML = `
                <h3 class="font-semibold mb-2">Question ${idx + 1}</h3>
                <p class="mb-2">${ans.question}</p>
                <p class="text-red-500 text-sm">Your answer: ${ans.selected}</p>
                <p class="text-green-600 text-sm font-medium">Correct answer: ${ans.correct}</p>
            `;
            reviewContainer.appendChild(div);
        }
    });

    if (reviewContainer.innerHTML === "") {
        reviewContainer.innerHTML = "<p class='text-green-600 font-bold'>Amazing! You got everything right!</p>";
    }
}

reviewSection.querySelector("button.bg-blue-600").onclick = showQuizSelection;

// --- Profile Page Logic ---
function showProfile() {
    if (!currentUser) {
        alert("Please login to see your profile.");
        hideAllSections();
        loginSection.classList.remove("hidden");
        return;
    }
    hideAllSections();
    header.classList.add("hidden"); // Hide main header for profile page
    personalsection.classList.remove("hidden");


    // Fill profile info
    if (currentUser) {
        // Main Heading
        const pNameElement = document.getElementById("profileName");
        if (pNameElement) pNameElement.innerText = currentUser.name;

        // Personal Info Section
        const pdName = document.getElementById("profileDetailName");
        const pdEmail = document.getElementById("profileDetailEmail");
        if (pdName) pdName.innerText = currentUser.name;
        if (pdEmail) pdEmail.innerText = currentUser.email;

        // Update Joined Year
        const joinedElem = document.getElementById("joinedYear");
        if (joinedElem) joinedElem.innerText = `Joined ${new Date().getFullYear()}`;

        updateAvatar(); // Centralized avatar update
    }




    // Fill History
    const tbody = document.querySelector("#personalsection tbody");
    tbody.innerHTML = "";
    (currentUser.results || []).reverse().forEach(res => {
        const tr = document.createElement("tr");
        tr.className = "border-b";
        tr.innerHTML = `
            <td class="py-2">${res.quizName}</td>
            <td>${res.score}</td>
            <td>${res.date}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Navigation Links
document.getElementById("profilehome").onclick = showProfile;
document.querySelector("#personalsection a[href='index.html']").onclick = (e) => { e.preventDefault(); location.reload(); };
document.querySelector("#personalsection a:nth-of-type(1)").onclick = (e) => { e.preventDefault(); showQuizSelection(); };

document.getElementById("quizzeshome").onclick = (e) => {
    e.preventDefault();
    if (currentUser) showQuizSelection();
    else { hideAllSections(); loginSection.classList.remove("hidden"); }
};

document.getElementById("quizhome").onclick = (e) => {
    e.preventDefault();
    if (confirm("Go back to home?")) location.reload();
};

document.querySelectorAll("a").forEach(a => {
    if (a.innerText === "Quizzes" || a.id === "quizzeshome") {
        a.onclick = (e) => {
            e.preventDefault();
            if (currentUser) showQuizSelection();
            else { hideAllSections(); loginSection.classList.remove("hidden"); }
        };
    }
    if (a.innerText === "Profile" || a.id === "profilehome") {
        a.onclick = (e) => {
            e.preventDefault();
            showProfile();
        };
    }
    if (a.innerText === "Home") {
        a.onclick = (e) => {
            e.preventDefault();
            location.reload();
        };
    }
});

// Category filter button init
document.querySelector(".category-btn[data-type='all']").classList.replace("bg-gray-200", "bg-blue-600");
document.querySelector(".category-btn[data-type='all']").classList.add("text-white");

// --- Leaderboard and Notification Alerts ---
function addAlerts() {
    // Select all elements that might be Leaderboard links or Notification buttons
    const allElements = document.querySelectorAll('a, button, #headerbell');
    
    allElements.forEach(el => {
        const text = el.innerText.toLowerCase();
        const hasBellIcon = el.querySelector('.fa-bell') || el.classList.contains('fa-bell');
        const isLeaderboard = text.includes('leaderboard') || (el.id && el.id.toLowerCase().includes('leaderboard'));
        const isNotification = hasBellIcon || (el.id && el.id.toLowerCase().includes('bell'));

        if (isLeaderboard) {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                alert("Leaderboard feature is under development! Stay tuned.");
            });
        }

        if (isNotification) {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                alert("Notifications feature is coming soon!");
            });
        }
    });
}

// Initialize alerts
addAlerts();

// Global Navigation Guard for Quiz
document.addEventListener("click", (e) => {
    // Check if a link was clicked during an active quiz
    if (isQuizActive && e.target.closest("a")) {
        const link = e.target.closest("a");
        const text = link.innerText.toLowerCase();
        
        // If it's a navigation link
        if (text.includes("home") || text.includes("quiz") || text.includes("profile")) {
            if (!confirm("You are currently in a quiz! Do you really want to end the quiz and go to " + text + "?")) {
                e.preventDefault();
                e.stopImmediatePropagation();
            } else {
                isQuizActive = false;
                // Navigation will proceed via other listeners
            }
        }
    }
}, true);





