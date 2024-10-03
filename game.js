const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

let score = 0;
let activeWords = [];
const wordSpeed = 2; // Verlaagde snelheid voor de vallende woorden
let currentTarget = null;  // Houd het huidige doelwoord bij
let lives = 3; // Start met 3 levens

// Nederlandse vervoegingen (boven als doelwoord)
const dutchWords = [
    "Ik heb", "Jij hebt", "Hij heeft", "Wij hebben", "Jullie hebben", "Zij hebben",
    "Ik was", "Jij was", "Hij was", "Wij waren", "Jullie waren", "Zij waren"
];

// Duitse vervoegingen (vallende woorden)
const germanWords = [
    "Habe", "Hast", "Hat", "Haben", "Habt", "Hatten", 
    "Bin", "Bist", "Ist", "Sind", "Seid", "Waren"
];

// Maak een mapping tussen de Nederlandse en Duitse woorden zodat ze bij elkaar passen
const wordMapping = {
    "Ik heb": "Habe",
    "Jij hebt": "Hast",
    "Hij heeft": "Hat",
    "Wij hebben": "Haben",
    "Jullie hebben": "Habt",
    "Zij hebben": "Haben",
    "Ik was": "Bin",
    "Jij was": "Bist",
    "Hij was": "Ist",
    "Wij waren": "Sind",
    "Jullie waren": "Seid",
    "Zij waren": "Waren"
};

// Woord object
function Word(text, x, y) {
    this.text = text;
    this.x = x;
    this.y = y;
    this.isDestroyed = false;
}

// Voeg een willekeurig Duits woord toe op een willekeurige positie bovenin het canvas
function spawnWord() {
    const randomWord = germanWords[Math.floor(Math.random() * germanWords.length)];
    const xPosition = Math.random() * (canvas.width - 100);
    activeWords.push(new Word(randomWord, xPosition, 0));
}

// Kies een willekeurig Nederlands woord als doelwoord en toon het
function chooseTargetWord() {
    if (activeWords.length > 0) {
        const randomIndex = Math.floor(Math.random() * dutchWords.length);
        const dutchTarget = dutchWords[randomIndex];  // Kies een willekeurig Nederlands woord
        currentTarget = wordMapping[dutchTarget];  // Koppel het Nederlandse woord aan het Duitse doelwoord
        updateTargetWordDisplay(dutchTarget);  // Werk het doelwoord in de UI bij
    }
}

// Werk het doelwoord (Nederlands) in de HTML bij (boven het canvas)
function updateTargetWordDisplay(dutchTarget) {
    const targetWordElement = document.getElementById("currentTargetWord");
    targetWordElement.textContent = dutchTarget;
}

// Beweeg de woorden en controleer of ze uit beeld zijn
function moveWords() {
    activeWords.forEach(word => {
        word.y += wordSpeed; // Verander deze waarde voor langzamere beweging
        if (word.y > canvas.height) {
            word.isDestroyed = true;
        }
    });
}

// Tekenen van de woorden
function drawWords() {
    activeWords.forEach(word => {
        if (!word.isDestroyed) {
            ctx.font = "30px Arial";
            ctx.fillStyle = "black";  // Alle woorden worden zwart weergegeven
            ctx.fillText(word.text, word.x, word.y);
        }
    });
}

// Schieten op woorden door erop te klikken
canvas.addEventListener('click', function(event) {
    const mouseX = event.clientX - canvas.offsetLeft;
    const mouseY = event.clientY - canvas.offsetTop;

    activeWords.forEach(word => {
        if (mouseX > word.x && mouseX < word.x + ctx.measureText(word.text).width
            && mouseY > word.y - 30 && mouseY < word.y) {

            // Ongeacht of het het juiste woord is, verwijder het woord
            word.isDestroyed = true;

            // Controleer of het het juiste Duitse woord is (dat overeenkomt met het doelwoord)
            if (word.text === currentTarget) {
                score += 10;  // Voeg punten toe voor het juiste woord
                document.getElementById("score").textContent = score;
                chooseTargetWord();  // Kies een nieuw doelwoord
            } else {
                lives--;  // Verminder levens bij een foutieve klik
                updateLifeIndicators();  // Update levensindicatoren
                document.getElementById("score").textContent = score;

                // Als levens op zijn, reset het spel
                if (lives <= 0) {
                    alert("Je hebt geen levens meer! Het spel wordt gereset."); // Toon bericht
                    resetGame(); // Reset het spel
                }
            }
        }
    });
});

// Update levensindicatoren op het scherm
function updateLifeIndicators() {
    const lifeIndicatorsElement = document.getElementById("lifeIndicators");
    lifeIndicatorsElement.innerHTML = "";  // Leeg de huidige indicatoren

    for (let i = 0; i < lives; i++) {
        const life = document.createElement("div");
        life.classList.add("life");
        lifeIndicatorsElement.appendChild(life);  // Voeg een leven toe
    }
}

// Reset het spel
function resetGame() {
    score = 0;
    lives = 3;
    activeWords = [];
    currentTarget = null;
    document.getElementById("score").textContent = score;
    updateLifeIndicators();  // Reset de levensindicatoren

    // Start het spel opnieuw
    chooseTargetWord();
    spawnWord();
    gameLoop();  // Start de game loop opnieuw
}

// Spel loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    moveWords();
    drawWords();

    // Verwijder vernietigde woorden
    activeWords = activeWords.filter(word => !word.isDestroyed);

    // Elke paar seconden een nieuw Duits woord toevoegen
    if (Math.random() < 0.01 && activeWords.length < 5) {
        spawnWord();
        if (!currentTarget) {
            chooseTargetWord();  // Kies een doelwoord als er nog geen is
        }
    }

    requestAnimationFrame(gameLoop);
}

// Start het spel
updateLifeIndicators();  // Initieel levens weergeven
gameLoop();
