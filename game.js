const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const audio = document.getElementById("gameAudio");
const notesArray = [];
const noteSpeed = 3.5; // Speed at which notes fall
const bpm = 140; // Beats per minute
const beatTime = 60 / bpm; // Time for one beat in seconds
const noteTypes = ["left", "up", "down", "right"];
const noteSize = 50; // Uniform size for square notes
const noteSpacing = 15; // Fixed separation between notes on X axis
const hitRange = 50; // Range within which a note is considered hit
let gameStarted = false; // Game state variable
let score = 0; // Initialize score
let recording = false; // To track if we're recording key presses
let recordedNotes = []; // Store recorded notes
let startTime; // Track game start time for recording
let customNotes = []; // Store custom notes for playback
let startRecordButton, stopRecordButton, autoHitButton, importButton, copyButton; // Buttons for recording, auto-hit, import, and copy

// Track the state of highlighted stationary notes
const highlightedNotes = {
    left: false,
    up: false,
    down: false,
    right: false
};

// Preload images
const images = {
    background: new Image(),
    note: {},
    notePress: {}
};

noteTypes.forEach((type) => {
    images.note[type] = new Image();
    images.notePress[type] = new Image();
    images.note[type].src = `Resources/Note${type}.png`;
    images.notePress[type].src = `Resources/Note${type}Press.png`;
});

images.background.src = "Resources/starSystem.jpg";

// Set keybinds
const keyBindings = {
    A: "left",
    S: "up",
    K: "down",
    L: "right"
};

// Reset button
const resetButton = document.createElement("button");
resetButton.innerText = "Reset Game";
resetButton.onclick = resetGame;
document.body.appendChild(resetButton);

// Flag to determine if auto-hit is enabled
let autoHitEnabled = false;

// Note generator (for custom sequence or random)
function generateNotes() {
    const beatInterval = beatTime * 1000; // Convert to milliseconds

    if (customNotes.length > 0) {
        console.log("Playing custom recorded notes.");
        // Generate notes based on recorded custom notes
        customNotes.forEach((note) => {
            setTimeout(() => {
                if (gameStarted) {
                    notesArray.push({
                        type: note.type,
                        y: 0,
                        x: noteTypes.indexOf(note.type) * (noteSize + noteSpacing) + canvas.width / 2 - ((noteSize + noteSpacing) * (noteTypes.length - 1)) / 2 // Position based on type
                    });
                }
            }, note.timestamp); // Use the recorded timestamp
        });
    } else {
        console.log("Generating random notes.");
        // Generate random notes
        setInterval(() => {
            if (gameStarted) {
                const noteType = noteTypes[Math.floor(Math.random() * noteTypes.length)];
                notesArray.push({
                    type: noteType,
                    y: 0,
                    x: noteTypes.indexOf(noteType) * (noteSize + noteSpacing) + canvas.width / 2 - ((noteSize + noteSpacing) * (noteTypes.length - 1)) / 2 // Position based on type
                });
            }
        }, beatInterval);
    }
}

// Function to start recording
function startRecording() {
    recording = true;
    console.log("Recording started.");
    recordedNotes = []; // Clear any previous recording
    localStorage.removeItem("recordedNotes"); // Clear saved notes in localStorage
    resetGame(); // Automatically reset the game when recording starts
    startTime = Date.now(); // Reset start time for accurate timestamps

    // Hide start button, show stop button
    startRecordButton.style.display = "none";
    stopRecordButton.style.display = "inline-block";
}

// Function to stop recording and save notes
function stopRecording() {
    recording = false;
    console.log("Recording stopped.");

    // Save recorded notes to localStorage
    localStorage.setItem("recordedNotes", JSON.stringify(recordedNotes));
    console.log("Saved notes:", recordedNotes);

    // Show start button, hide stop button
    startRecordButton.style.display = "inline-block";
    stopRecordButton.style.display = "none";
}

// Import notes from clipboard
async function importNotes() {
    try {
        const clipboardText = await navigator.clipboard.readText();
        const notes = JSON.parse(clipboardText);
        if (Array.isArray(notes)) {
            customNotes = notes;
            localStorage.setItem("recordedNotes", JSON.stringify(notes));
            console.log("Imported notes:", notes);

            // Show confirmation popup
            if (window.confirm("Notes imported successfully. The page will reload to apply the changes.")) {
                location.reload(); // Reload page to apply imported notes
            }
        } else {
            console.error("Clipboard data is not a valid notes array.");
        }
    } catch (err) {
        console.error("Failed to read clipboard data:", err);
    }
}

// Copy recorded notes to clipboard
function copyNotesToClipboard() {
    const savedNotes = localStorage.getItem("recordedNotes");
    if (savedNotes) {
        navigator.clipboard
            .writeText(savedNotes)
            .then(() => {
                console.log("Copied notes to clipboard:", JSON.parse(savedNotes));
            })
            .catch((err) => {
                console.error("Failed to copy notes to clipboard:", err);
            });
    } else {
        console.error("No recorded notes found in localStorage.");
    }
}

// Toggle auto-hit mode
function toggleAutoHit() {
    autoHitEnabled = !autoHitEnabled;
    console.log(`Auto-hit ${autoHitEnabled ? "enabled" : "disabled"}.`);
}

// Reset the game
function resetGame() {
    gameStarted = false; // Stop the game
    audio.pause(); // Pause audio
    audio.currentTime = 0; // Reset audio
    notesArray.length = 0; // Clear notes array
    score = 0; // Reset score
    customNotes = []; // Clear custom notes

    // Load recorded notes for the next game
    const savedNotes = localStorage.getItem("recordedNotes");
    if (savedNotes) {
        customNotes = JSON.parse(savedNotes);
        console.log("Loaded saved notes from localStorage:", customNotes);
    } else {
        console.log("No saved notes found. Using random notes.");
    }

    // Automatically start the game again with saved notes
    startGame();
}

// Draw notes and stationary hit blocks on canvas
function drawNotes() {
    // Draw background image
    ctx.drawImage(images.background, 0, 0, canvas.width, canvas.height);

    // Calculate the center position for alignment
    const centerX = canvas.width / 2;

    // Draw stationary hit blocks (Y position: 600)
    noteTypes.forEach((type, index) => {
        const x = index * (noteSize + noteSpacing) + centerX - ((noteSize + noteSpacing) * (noteTypes.length - 1)) / 2;
        const imageToDraw = highlightedNotes[type] ? images.notePress[type] : images.note[type];
        ctx.drawImage(imageToDraw, x, 600, noteSize, noteSize); // Stationary blocks
    });

    // Draw falling notes
    notesArray.forEach((note) => {
        ctx.drawImage(images.note[note.type], note.x, note.y, noteSize, noteSize); // Draw note with texture
    });

    // Draw score on canvas
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText(`Score: ${score}`, 10, 30); // Display score

    // Display "Recording Notes" if recording
    if (recording) {
        ctx.fillStyle = "red";
        ctx.font = "30px Arial";
        ctx.fillText("Recording Notes", canvas.width / 2 - 100, 50); // Display text in the middle of the canvas
    }
}

// Create buttons
window.onload = function () {
    // Create Start Recording button
    startRecordButton = document.createElement("button");
    startRecordButton.innerText = "Start Recording";
    startRecordButton.onclick = startRecording;
    document.body.appendChild(startRecordButton);

    // Create Stop Recording button (hidden by default)
    stopRecordButton = document.createElement("button");
    stopRecordButton.innerText = "Stop Recording";
    stopRecordButton.style.display = "none"; // Hidden initially
    stopRecordButton.onclick = stopRecording;
    document.body.appendChild(stopRecordButton);

    // Create Auto-Hit button
    autoHitButton = document.createElement("button");
    autoHitButton.innerText = "Auto-Hit";
    autoHitButton.onclick = toggleAutoHit;
    document.body.appendChild(autoHitButton);

    // Create Import Notes button
    importButton = document.createElement("button");
    importButton.innerText = "Import Notes";
    importButton.onclick = importNotes;
    document.body.appendChild(importButton);

    // Create Copy Notes button
    copyButton = document.createElement("button");
    copyButton.innerText = "Copy Notes";
    copyButton.onclick = copyNotesToClipboard;
    document.body.appendChild(copyButton);
};

// Handle key press and release events
document.addEventListener("keydown", (event) => {
    const noteType = keyBindings[event.key.toUpperCase()];
    if (event.key === "Enter" && !gameStarted) {
        startGame(); // Start the game when Enter is pressed
    } else if (gameStarted && noteType) {
        if (recording) {
            // Record the key press with timestamp if recording
            const timestamp = Date.now() - startTime - 1100; // Subtract 1000ms (1 second) from the timestamp
            recordedNotes.push({
                type: noteType,
                timestamp: timestamp
            });
            console.log(`Recorded note: ${noteType} at ${timestamp}ms`);
        }

        // Highlight the corresponding stationary note
        highlightedNotes[noteType] = true;

        // Check for note hit
        for (let i = 0; i < notesArray.length; i++) {
            if (notesArray[i].type === noteType && Math.abs(notesArray[i].y - 600) < hitRange) {
                notesArray.splice(i, 1); // Remove note if hit
                score++; // Increase score for hitting note
                playSoundEffect("Resources/SFX/hoverBtn.mp3", 1);
                break;
            }
        }
    }
});

// Function to play a sound
function playSoundEffect(audioPath, vol) {
    const audio = new Audio(audioPath);
    audio.volume = vol;
    audio.play().catch((error) => {
        console.error("Audio playback failed:", error);
    });
}

document.addEventListener("keyup", (event) => {
    const noteType = keyBindings[event.key.toUpperCase()];
    if (noteType) {
        // Stop highlighting the stationary note
        highlightedNotes[noteType] = false;
    }
});

let lastTime = 0; // To track the time of the last frame

// Update notes positions
function updateNotes(deltaTime) {
    const adjustedNoteSpeed = noteSpeed * (deltaTime / 6); // Adjust note speed based on deltaTime

    for (let i = 0; i < notesArray.length; i++) {
        notesArray[i].y += adjustedNoteSpeed;
        if (notesArray[i].y > canvas.height) {
            notesArray.splice(i, 1);
            score--; // Decrease score for missed note
            i--;
        }
    }

    // Auto-hit logic
    if (autoHitEnabled) {
        notesArray.forEach((note) => {
            if (Math.abs(note.y - 650) < hitRange) {
                // Simulate key press
                simulateKeyPress(note.type);
            }
        });
    }
}

// Simulate key press for a note type
function simulateKeyPress(noteType) {
    const key = Object.keys(keyBindings).find((k) => keyBindings[k] === noteType);
    if (key) {
        // Trigger key down event
        document.dispatchEvent(new KeyboardEvent("keydown", { key: key }));

        // Wait 50 ms and trigger key up event
        setTimeout(() => {
            document.dispatchEvent(new KeyboardEvent("keyup", { key: key }));
        }, 100);
    }
}

// Start the game
function startGame() {
    gameStarted = true; // Set the game state to started
    console.log("Game started.");
    audio.play(); // Start playing the audio
    startTime = Date.now(); // Set start time for recording
    generateNotes(); // Start generating notes
    lastTime = performance.now(); // Initialize lastTime with current time
    gameLoop(lastTime); // Start the game loop with the current time
}

// Game loop
function gameLoop(currentTime) {
    const deltaTime = currentTime - lastTime; // Calculate delta time
    lastTime = currentTime; // Update lastTime to currentTime

    if (gameStarted) {
        updateNotes(deltaTime); // Pass deltaTime to updateNotes
        drawNotes();
        requestAnimationFrame(gameLoop); // Request the next frame
    }
}
