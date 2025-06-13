// Card stacks data
const stacks = {
    aronson: [
        "JS", "KC", "5C", "2H", "9S", "AS", "3H", "6C", "8D", "AC", 
        "10S", "QH", "3D", "QC", "8H", "6S", "5S", "9H", "KD", "2D", 
        "JH", "3S", "8S", "7C", "5D", "2C", "4C", "9C", "7S", "JD", 
        "10C", "KH", "4H", "7D", "4D", "10D", "JC", "QS", "6D", "4S", 
        "2S", "7H", "9D", "10H", "KS", "5H", "AH", "3C", "QD", "6H", 
        "8C", "AD"
    ],
    mnemonica: [
        "AS", "2S", "4C", "2H", "7D", "3C", "4H", "6D", "AH", "5H", 
        "9S", "2D", "QH", "3D", "QC", "8H", "6S", "5S", "9H", "KC", 
        "2C", "JH", "3S", "8S", "6H", "10H", "5D", "KD", "2S", "3H", 
        "8D", "5C", "KS", "JD", "8C", "10S", "KH", "JC", "7S", "10C", 
        "AD", "4S", "7H", "4D", "AC", "9C", "JS", "QD", "7C", "QS", 
        "10D", "6C"
    ],
    sistebbins: []
};

// Generate Si Stebbins stack (3, 7, 11, 2 pattern)
// Starting with Ace of Clubs
function generateSiStebbins() {
    const suits = ['C', 'H', 'S', 'D'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    
    let currentSuitIndex = 0;
    let currentValueIndex = 0;
    
    for (let i = 0; i < 52; i++) {
        stacks.sistebbins.push(values[currentValueIndex] + suits[currentSuitIndex]);
        
        // Move to next value (adding 3, wrapping around if needed)
        currentValueIndex = (currentValueIndex + 3) % 13;
        
        // Move to next suit
        currentSuitIndex = (currentSuitIndex + 1) % 4;
    }
}

generateSiStebbins();

// Card value mapping for display
const cardValueMap = {
    'A': 'A',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9',
    '10': '10',
    'J': 'J',
    'Q': 'Q',
    'K': 'K'
};

// Quiz state
let currentStack = '';
let quizMode = '';
let currentQuestion = '';
let currentAnswer = '';
let currentOptions = [];
let score = 0;
let streak = 0;
let bestStreak = 0;
let totalQuestions = 0;
let askedQuestions = [];
let incorrectAttempts = 0;

// DOM elements
const stackSelection = document.getElementById('stackSelection');
const quizContainer = document.getElementById('quizContainer');
const stackTitle = document.getElementById('stackTitle');
const cardToPositionBtn = document.getElementById('cardToPositionBtn');
const positionToCardBtn = document.getElementById('positionToCardBtn');
const homeBtn = document.getElementById('homeBtn');
const questionContainer = document.querySelector('.quiz-question-container');
const question = document.getElementById('question');
const optionsContainer = document.getElementById('optionsContainer');
const nextBtn = document.getElementById('nextBtn');
const startOverBtn = document.getElementById('startOverBtn');
const feedback = document.getElementById('feedback');
const resultContainer = document.getElementById('resultContainer');
const stats = document.getElementById('stats');
const restartBtn = document.getElementById('restartBtn');

// Event listeners
document.querySelectorAll('.stack-btn').forEach(button => {
    button.addEventListener('click', () => {
        currentStack = button.dataset.stack;
        stackSelection.classList.add('hidden');
        quizContainer.classList.remove('hidden');
        stackTitle.textContent = `${getStackDisplayName(currentStack)} Stack`;
    });
});

cardToPositionBtn.addEventListener('click', () => {
    quizMode = 'cardToPosition';
    startQuiz();
});

positionToCardBtn.addEventListener('click', () => {
    quizMode = 'positionToCard';
    startQuiz();
});

homeBtn.addEventListener('click', goHome);
nextBtn.addEventListener('click', nextQuestion);
startOverBtn.addEventListener('click', startOver);
restartBtn.addEventListener('click', restart);

// Helper functions
function getStackDisplayName(stack) {
    switch(stack) {
        case 'aronson': return 'Aronson';
        case 'mnemonica': return 'Mnemonica';
        case 'sistebbins': return 'Si Stebbins';
        default: return '';
    }
}

function getCardName(cardCode) {
    // Extract value and suit
    let value, suit;
    if (cardCode.length === 2) {
        value = cardCode[0];
        suit = cardCode[1];
    } else if (cardCode.length === 3) {
        value = cardCode.substring(0, 2);
        suit = cardCode[2];
    }
    
    // Get display value
    const valueDisplay = cardValueMap[value] || value;
    
    // Get suit symbol and color
    let suitSymbol, color;
    switch(suit) {
        case 'C':
            suitSymbol = '♣';
            color = 'black';
            break;
        case 'S':
            suitSymbol = '♠';
            color = 'black';
            break;
        case 'H':
            suitSymbol = '♥';
            color = 'red';
            break;
        case 'D':
            suitSymbol = '♦';
            color = 'red';
            break;
    }
    
    // For position to card mode, return formatted card
    if (quizMode === 'positionToCard') {
        return valueDisplay + suitSymbol;
    } 
    // For card to position mode, just return the position number
    else {
        return cardCode;
    }
}

function startQuiz() {
    document.querySelector('.quiz-mode-selection').classList.add('hidden');
    questionContainer.classList.remove('hidden');
    score = 0;
    streak = 0;
    bestStreak = 0;
    totalQuestions = 0;
    askedQuestions = [];
    nextQuestion();
}

function generateOptions(correctAnswer) {
    let options = [correctAnswer];
    
    if (quizMode === 'cardToPosition') {
        // Generate 3 wrong position numbers
        while (options.length < 4) {
            const randomPosition = Math.floor(Math.random() * 52) + 1;
            if (!options.includes(randomPosition.toString())) {
                options.push(randomPosition.toString());
            }
        }
    } else {
        // Generate 3 wrong cards
        const allCards = [];
        for (let i = 0; i < stacks[currentStack].length; i++) {
            const card = getCardName(stacks[currentStack][i]);
            if (card !== correctAnswer) {
                allCards.push(card);
            }
        }
        
        // Randomly select 3 wrong cards
        while (options.length < 4 && allCards.length > 0) {
            const randomIndex = Math.floor(Math.random() * allCards.length);
            options.push(allCards[randomIndex]);
            allCards.splice(randomIndex, 1);
        }
    }
    
    // Shuffle options
    return options.sort(() => Math.random() - 0.5);
}

function generateQuestion() {
    if (quizMode === 'cardToPosition') {
        // Random card from the stack
        const randomIndex = Math.floor(Math.random() * stacks[currentStack].length);
        const card = stacks[currentStack][randomIndex];
        const cardDisplay = getCardDisplay(card);
        currentQuestion = `What is the position of ${cardDisplay}?`;
        currentAnswer = (randomIndex + 1).toString(); // Position is 1-based
        currentOptions = generateOptions(currentAnswer);
        return card;
    } else {
        // Random position
        const randomPosition = Math.floor(Math.random() * stacks[currentStack].length) + 1;
        currentQuestion = `What card is at position ${randomPosition}?`;
        const card = stacks[currentStack][randomPosition - 1];
        currentAnswer = getCardName(card);
        currentOptions = generateOptions(currentAnswer);
        return randomPosition;
    }
}

// Function to get card display with color
function getCardDisplay(cardCode) {
    // Extract value and suit
    let value, suit;
    if (cardCode.length === 2) {
        value = cardCode[0];
        suit = cardCode[1];
    } else if (cardCode.length === 3) {
        value = cardCode.substring(0, 2);
        suit = cardCode[2];
    }
    
    // Get display value
    const valueDisplay = cardValueMap[value] || value;
    
    // Get suit symbol and color
    let suitSymbol, color;
    switch(suit) {
        case 'C':
            suitSymbol = '♣';
            color = 'black';
            break;
        case 'S':
            suitSymbol = '♠';
            color = 'black';
            break;
        case 'H':
            suitSymbol = '♥';
            color = 'red';
            break;
        case 'D':
            suitSymbol = '♦';
            color = 'red';
            break;
    }
    
    return `<span class="card-option" style="color: ${color}">${valueDisplay}${suitSymbol}</span>`;
}

function createOptions() {
    optionsContainer.innerHTML = '';
    incorrectAttempts = 0;
    
    currentOptions.forEach((option, index) => {
        const optionBtn = document.createElement('button');
        optionBtn.className = 'option-btn';
        
        if (quizMode === 'positionToCard') {
            // For position to card, we need to color the cards
            const value = option.slice(0, -1);
            const suitSymbol = option.slice(-1);
            let color = 'black';
            if (suitSymbol === '♥' || suitSymbol === '♦') {
                color = 'red';
            }
            optionBtn.innerHTML = `<span class="card-option" style="color: ${color}">${value}${suitSymbol}</span>`;
        } else {
            // For card to position, just show the position number
            optionBtn.textContent = option;
        }
        
        optionBtn.addEventListener('click', () => {
            checkAnswer(option, optionBtn);
        });
        
        optionsContainer.appendChild(optionBtn);
    });
}

function nextQuestion() {
    feedback.classList.add('hidden');
    nextBtn.classList.add('hidden');
    startOverBtn.classList.add('hidden');
    
    // Generate a new question that hasn't been asked yet
    let questionKey;
    do {
        questionKey = generateQuestion();
    } while (askedQuestions.includes(questionKey) && askedQuestions.length < stacks[currentStack].length);
    
    // If we've asked all possible questions or reached 10 questions, end the quiz
    if (askedQuestions.length >= stacks[currentStack].length || totalQuestions >= 10) {
        endQuiz();
        return;
    }
    
    askedQuestions.push(questionKey);
    question.innerHTML = currentQuestion; // Use innerHTML to render HTML in question
    createOptions();
    totalQuestions++;
    
    // Update streak display
    updateStreakDisplay();
}

function checkAnswer(selectedAnswer, selectedButton) {
    let isCorrect = selectedAnswer === currentAnswer;
    
    if (isCorrect) {
        // Correct answer
        selectedButton.classList.add('correct');
        
        // Only increment score if first attempt was correct
        if (incorrectAttempts === 0) {
            score++;
            streak++;
            if (streak > bestStreak) {
                bestStreak = streak;
            }
        }
        
        // Show feedback and next button
        feedback.textContent = "Correct!";
        feedback.classList.add('correct');
        feedback.classList.remove('incorrect');
        feedback.classList.remove('hidden');
        
        // Disable all buttons
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.disabled = true;
        });
        
        nextBtn.classList.remove('hidden');
        startOverBtn.classList.remove('hidden');
        
        // If we've asked 10 questions, update the next button text
        if (totalQuestions >= 9) {
            nextBtn.textContent = "See Results";
        }
    } else {
        // Incorrect answer
        selectedButton.classList.add('incorrect');
        selectedButton.disabled = true;
        incorrectAttempts++;
        
        // Reset streak on wrong answer
        streak = 0;
        
        // Show feedback
        feedback.textContent = "Try again!";
        feedback.classList.add('incorrect');
        feedback.classList.remove('correct');
        feedback.classList.remove('hidden');
        
        // Show start over button after first incorrect attempt
        startOverBtn.classList.remove('hidden');
    }
    
    // Update streak display
    updateStreakDisplay();
}

function updateStreakDisplay() {
    // Update streak display if it exists
    const streakDisplay = document.getElementById('streakDisplay');
    if (streakDisplay) {
        streakDisplay.textContent = `Current Streak: ${streak} | Best Streak: ${bestStreak}`;
    }
}

function endQuiz() {
    quizContainer.classList.add('hidden');
    resultContainer.classList.remove('hidden');
    stats.textContent = `Final Score: ${score} out of ${totalQuestions} | Best Streak: ${bestStreak}`;
}

function startOver() {
    // Reset the quiz with the same stack and mode
    score = 0;
    streak = 0;
    totalQuestions = 0;
    askedQuestions = [];
    
    feedback.classList.add('hidden');
    nextBtn.classList.add('hidden');
    startOverBtn.classList.add('hidden');
    
    // Start with a new question
    nextQuestion();
}

function restart() {
    resultContainer.classList.add('hidden');
    stackSelection.classList.remove('hidden');
    nextBtn.textContent = "Next Question";
}

function goHome() {
    // Reset quiz state
    score = 0;
    streak = 0;
    bestStreak = 0;
    totalQuestions = 0;
    askedQuestions = [];
    
    // Hide quiz and show stack selection
    quizContainer.classList.add('hidden');
    questionContainer.classList.add('hidden');
    document.querySelector('.quiz-mode-selection').classList.remove('hidden');
    stackSelection.classList.remove('hidden');
    
    // Reset UI elements
    feedback.classList.add('hidden');
    nextBtn.classList.add('hidden');
    startOverBtn.classList.add('hidden');
    nextBtn.textContent = "Next Question";
}
