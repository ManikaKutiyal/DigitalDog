const hungerFill = document.getElementById("hunger-bar");
const happinessFill = document.getElementById("happiness-bar");
const energyFill = document.getElementById("energy-bar");
const petNameText = document.getElementById("pet-name-text");
const petEmoji = document.getElementById("pet-face");
const message = document.getElementById("message");
const healthFill = document.getElementById("health-bar");
const dogVideo = document.getElementById("dog-video");
let isDead = false;

let petState = {
    name: "Bruno",
    emoji: "🐶",
    hunger: 80,
    happiness: 80,
    energy: 80,
};

function showVideo(fileName, duration = null) {
    dogVideo.src = `assets/${fileName}`;
    dogVideo.load();
    dogVideo.play();

    if (duration) {
        setTimeout(() => {
            showVideo("dog-idle.mp4");
        }, duration);
    }
}

document.getElementById("save-name").addEventListener("click", () => {
    const nameInput = document.getElementById("pet-name-input").value.trim();
    if (nameInput){
        petState.name = nameInput;
        localStorage.setItem("petState", JSON.stringify(petState));
        updateDisplay()
        message.innerText = `Aww! ${petState.name} loves you`;
    }
});

function updateDisplay() {
    hungerFill.style.width = `${petState.hunger}%`;
    happinessFill.style.width = `${petState.happiness}%`;
    energyFill.style.width = `${petState.energy}%`;

    const health = Math.floor((petState.hunger + petState.happiness+petState.energy)/3);
    healthFill.style.width = `${health}%`;

    if(health > 60) healthFill.style.backgroundColor = "green";
    else if (health > 30) healthFill.style.backgroundColor = "orange";
    else healthFill.style.backgroundColor = "red"

    petNameText.innerText = petState.name;
    petEmoji.innerText = petState.emoji;
    updateButton();

    if (health <= 0 && !isDead){
        handleDeath();
    }
}

function handleDeath (){
    isDead = true;
    document.querySelectorAll("button").forEach(btn => btn.disabled = true);

    document.body.classList.add("shake");

    const grave = document.createElement("div");
    grave.id = "gravestone";
    grave.innerHTML = `
        <h1>${petState.name} has died</h1>
        <p>Neglected and Forgotten...</p>
        <button onclick = "resetPet()">Adopt New Pet</button>
        `;

    document.body.appendChild(grave);
    const thump = new Audio("assets/thump.mp3");
    thump.play();
}

function changeStat(stat, amount){
    petState[stat] = Math.max(0, Math.min(100, petState[stat] + amount));
    localStorage.setItem("petState", JSON.stringify(petState));
    updateDisplay();
}

function updateButton(){
    document.getElementById("feed-btn").disabled = petState.hunger >= 100;
    document.getElementById("sleep-btn").disabled = petState.energy >= 100;
    document.getElementById("play-btn").disabled = petState.energy <= 0 || petState.happiness >=100;

    const buttons = document.querySelectorAll("button");
    buttons.forEach(btn => {
        btn.style.opacity = btn.disabled ? "0.5" : "1";
        btn.style.cursor = btn.disabled ? "not-allowed" : "pointer";
    });
}

document.getElementById("feed-btn").addEventListener("click", () => {
    if (petState.hunger >= 100){
        message.innerText = `${petState.name} is already full`;
        return;
    }
    changeStat("hunger", 10);
    message.innerText = `${petState.name} enjoyed the meal`;
    showVideo("dog-eating.mp4", 4000);
});

document.getElementById("play-btn").addEventListener("click", () => {
    if (petState.energy <= 0){
        message.innerText = `${petState.name} is too tired to play! Let them Rest!`;
        return;
    }
    changeStat("happiness", 10);
    changeStat("energy", -5);
    message.innerText = `${petState.name} had fun playing`;
    showVideo("dog-playing.mp4", 3700);
});

document.getElementById("sleep-btn").addEventListener("click", () => {
    if(petState.energy >= 100){
        message.innerText = `${petState.name} is already well rested!`;
        return;
    }
    changeStat("energy", 10);
    changeStat("hunger", -5);
    message.innerText = `${petState.name} took a nap`;
    showVideo("dog-sleeping.mp4", 5000);
});

setInterval(() =>{
    changeStat("hunger", -2);
    changeStat("happiness", -1);
    changeStat("energy", -1);

    let warnings = [];
    if (petState.hunger <= 20) warnings.push(`${petState.name} is hungry!`);
    if (petState.energy <= 20) warnings.push(`${petState.name} is tired`);
    if (petState.happiness <= 20) warnings.push(`${petState.name} need love`);
    if (warnings.length > 0){
        message.innerText = warnings.join(" | ");
    }
}, 5000);

function resetPet(){
    petState = {
        name: "Bruno",
        emoji: "🐶",
        hunger: 80,
        happiness: 100,
        energy: 80,
    };
    localStorage.setItem("petState", JSON.stringify(petState));
    isDead = false;

    localStorage.removeItem("dogAdopted");
    showVideo("dog-adopted.mp4", 7000);
    localStorage.setItem("dogAdopted", "true");

    const grave = document.getElementById("gravestone");
    if (grave) grave.remove();

    document.body.classList.remove("shake");

    document.querySelectorAll("button").forEach(btn => btn.disabled = false);
    updateDisplay();
    message.innerText = "you've adopted a new pet!";
}

async function getDogFact() {
    try{
        const res = await fetch('https://dogapi.dog/api/facts');
        const data = await res.json();
        document.getElementById("fact-box").textContent = `"${data.facts[0]}"`;
        } 
        catch (err) {
            document.getElementById("fact-box").textContent = "Oops! Your dog is feeling quiet right now.";
            console.error("Error fetching pet fact:", err);
        }
}
document.getElementById("talkBtn").addEventListener("click", getDogFact);

const savedState = localStorage.getItem("petState");
if(savedState) {
    petState = JSON.parse(savedState);
}

if (!localStorage.getItem("dogAdopted")) {
    showVideo("dog-adopted.mp4", 7000);
    localStorage.setItem("dogAdopted", "true");
} else {
    showVideo("dog-idle.mp4");
}



updateDisplay();
