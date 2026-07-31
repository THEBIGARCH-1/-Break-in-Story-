const storyData = {
    start: {
        text: "You stand in front of the quiet manor at midnight. Rain pours down softly. You need to recover the stolen memory drive inside. Where do you check first?",
        choices: [
            { text: "Try the back porch window", nextNode: "back_window" },
            { text: "Check the basement cellar doors", nextNode: "cellar" }
        ]
    },
    back_window: {
        text: "The back window is unlocked! You carefully slide it up and step into a dark kitchen. You hear a clock ticking loudly.",
        choices: [
            { text: "Search the kitchen drawers for a keycard", nextNode: "kitchen_search" },
            { text: "Head out into the main hallway", nextNode: "hallway" }
        ]
    },
    cellar: {
        text: "The cellar doors are locked with a heavy padlock, but you notice a rusted crowbar resting against a nearby wooden crate.",
        choices: [
            { text: "Use the crowbar on the cellar lock", nextNode: "hallway" },
            { text: "Go back to the rear of the house", nextNode: "start" }
        ]
    },
    kitchen_search: {
        text: "You find an old brass key in the drawer marked 'Study'. This might unlock the main security room!",
        choices: [
            { text: "Proceed to the main hallway", nextNode: "hallway" }
        ]
    },
    hallway: {
        text: "You reach the main hallway. The security room is down the hall to the left, and the stairs lead up to the master bedroom.",
        choices: [
            { text: "Enter the security room", nextNode: "start" },
            { text: "Go upstairs", nextNode: "start" }
        ]
    }
};

let currentNode = 'start';

const menuScreen = document.getElementById('menu-screen');
const storyScreen = document.getElementById('story-screen');
const newGameBtn = document.getElementById('new-game-btn');
const loadGameBtn = document.getElementById('load-game-btn');
const quickSaveBtn = document.getElementById('quick-save-btn');
const storyText = document.getElementById('story-text');
const choicesBox = document.getElementById('choices-box');
const saveStatus = document.getElementById('save-status');

function checkSaveData() {
    const savedProgress = localStorage.getItem('breakin_game_save');
    if (savedProgress) {
        loadGameBtn.disabled = false;
        saveStatus.textContent = "Saved game found!";
    } else {
        loadGameBtn.disabled = true;
    }
}

newGameBtn.addEventListener('click', () => {
    currentNode = 'start';
    showStoryScreen();
    renderNode(currentNode);
});

quickSaveBtn.addEventListener('click', () => {
    localStorage.setItem('breakin_game_save', currentNode);
    quickSaveBtn.textContent = "Saved!";
    setTimeout(() => { quickSaveBtn.textContent = "Quick Save"; }, 1500);
    checkSaveData();
});

loadGameBtn.addEventListener('click', () => {
    const savedNode = localStorage.getItem('breakin_game_save');
    if (savedNode && storyData[savedNode]) {
        currentNode = savedNode;
        showStoryScreen();
        renderNode(currentNode);
    }
});

function showStoryScreen() {
    menuScreen.classList.add('hidden');
    storyScreen.classList.remove('hidden');
}

function renderNode(nodeKey) {
    const node = storyData[nodeKey];
    storyText.textContent = node.text;
    choicesBox.innerHTML = '';

    node.choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = choice.text;
        btn.addEventListener('click', () => {
            currentNode = choice.nextNode;
            renderNode(currentNode);
        });
        choicesBox.appendChild(btn);
    });
}

checkSaveData();
