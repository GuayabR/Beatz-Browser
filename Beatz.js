/**
 * Title: Beatz VI
 * Author: Victor//GuayabR
 * Date: 16/05/2024
 * Version: NOTES VI v6.0 test (release.version.subversion.bugfix)
 * GitHub Repository: https://github.com/GuayabR/Beatz
 **/

var notes = [];
var noteSpeed = 4.5; // Speed at which notes fall 0.29/500 7/-550 3/-60
var noteOffset = -390;
let noteSpawnY = 270;
let hitType;
const bpm = 348; // Beats per minute
const beattime = 60 / bpm; // timestamp for one beat in seconds
const noteTypes = ["Left", "Up", "Down", "Right"];
const noteSize = 60; // Uniform size for square notes
const hitRange = 55; // Range within which a note is considered hit
const targetYPositionStart = 495; // New start of the hit zone
const targetYPositionEnd = 625; // End of the hit zone
// Early/Late and Perfect hit zones
const perfectRange = 20; // 10 pixels on either side for perfect hit
const targetYPosition = 600; // Y-position of stationary hit blocks
let points = 0;
let streak = 0;
let misses = 0;
let perfects = 0;
let earlys = 0;
let lates = 0;
let recording = false; // To track if we're recording key presses
let recordedNotes = []; // Store recorded notes
let starttime; // Track game start timestamp for recording
let customNotes = { notes: Array, isV1Format: Boolean }; // Store custom notes for playback
let resetButton, startRecordButton, stopRecordButton, autoHitButton, importButton, copyButton; // Buttons for recording, auto-hit, import, and copy
let lastRecordedNotes = []; // To store the last 3 recorded notes

let autoHitEnabled = false;

let currentSong = document.getElementById("song");

let isV1Format = false; // Flag to check if imported notes are in V1 format

// Update mappings for encoding and decoding note types with the new format
const noteTypeMap = { Left: "L", Down: "D", Up: "U", Right: "R" };
const reverseNoteTypeMap = { L: "Left", D: "Down", U: "Up", R: "Right" };

const defaultKeybinds = {
    up: ["S"],
    left: ["A"],
    down: ["K"],
    right: ["L"],
    pause: ["ESCAPE"],
    autoHit: ["1"],
    previous: ["Q"],
    restart: ["R"],
    next: ["E"],
    randomize: ["T"],
    toggleNoteStyle: ["C"],
    fullscreen: ["F"],
    openSongList: ["O"],
    openSettings: ["P"]
};

// Update the key bindings object to use the new note type casing
const keyBindings = {
    [defaultKeybinds.left]: "Left",
    [defaultKeybinds.up]: "Up",
    [defaultKeybinds.down]: "Down",
    [defaultKeybinds.right]: "Right"
};

// CONSTANTS

const VERSION = "NOTES VI v6.0";
var PUBLICVERSION = `VI (6.0)`;
console.log("Version: " + VERSION);

const canvas = document.getElementById("myCanvas");

const ctx = canvas.getContext("2d");

const WIDTH = 1280;

const HEIGHT = 720;

// Update the noteXPositions object to reflect the change in note type capitalization
const noteXPositions = {
    Left: WIDTH / 2 - 115 - 28,
    Up: WIDTH / 2 - 37 - 28,
    Down: WIDTH / 2 + 37 - 28,
    Right: WIDTH / 2 + 115 - 28
};

/**
 * Left: WIDTH / 2 - 115,
    Up: WIDTH / 2 - 39,
    Down: WIDTH / 2 + 39,
    Right: WIDTH / 2 + 115
 */

var noteYpos = 550;

console.log("Constants loaded.");

// VARIABLES

var timestamp;

var gameStarted = false;

var maxStreak = 0;

// Initialize variables for timestamp tracking
let lastTimetamp = 0;
let timestampDelta = 0;
let lastFrametimestamp = 0;
let FPS = 0;
let globaltimestamp;

// Track the state of highlighted stationary notes
const highlightedNotes = {
    left: false,
    up: false,
    down: false,
    right: false
};

// Track if a key is being held down for each note type
const keyHeldDown = {
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

    images.note[type].onload = () => console.log(`Loaded: Resources/Note${type}.png`);
    images.notePress[type].onload = () => console.log(`Loaded: Resources/Note${type}Press.png`);

    images.note[type].src = `Resources/Note${type}.png`;
    images.notePress[type].src = `Resources/Note${type}Press.png`;
});

// Preload discolored images for recorded notes
noteTypes.forEach((type) => {
    images.note[`RecNote${type}`] = new Image();
    images.note[`RecNote${type}`].src = `Resources/RecNote${type}.png`;
});

images.background.src = "Resources/starSystem.jpg";

let noteGenerationIntervalRef = null; // for random note generation interval
let recordedNoteGenTimeouts = []; // Array to store setTimeout references

// Note generator (for custom sequence or random)
function generateNotes() {
    // Load recorded notes for the next game
    const savedNotes = localStorage.getItem("recordedNotes");
    if (savedNotes) {
        try {
            customNotes = JSON.parse(savedNotes);
            console.log("Loaded saved notes from localStorage:", customNotes);
        } catch (err) {
            console.log("Notes found in localStorage are not a valid JSON.", err);
        }
    } else {
        console.log("No saved notes found. Using random notes.");
    }
    const beatInterval = beattime * 1000; // Convert to milliseconds
    var duration = currentSong.duration * 1000; // Get the song duration in milliseconds
    const numberOfNotes = Math.floor(duration / beatInterval); // Calculate the number of notes

    if (recording) {
        console.log("Recording mode: No random notes are generated.");
        return; // Skip note generation if recording
    }

    if (customNotes.V1Format == false) {
        isV1Format = true;
        console.log("Version 1 delay applied");
    } else {
        console.log("Version 1 delay was not detected.", isV1Format);
    }

    if (customNotes) {
        console.log("Custom notes exists", customNotes);
        if (customNotes.notes) {
            console.log("Custom notes has notes", customNotes.notes);

            console.log("Playing custom recorded notes.");
            // Generate notes based on recorded custom notes
            customNotes.notes.forEach((note) => {
                let notetimestamp;
                if (noteOffset !== 0) {
                    notetimestamp = note.timestamp + noteOffset;
                } else {
                    notetimestamp = note.timestamp;
                }

                // If not in V1 format, subtract 1080 from the timestamp
                if (isV1Format) {
                    notetimestamp -= 1080;
                    console.log("Decreased 1080ms from the note timestamp.");
                }

                if (notetimestamp < duration) {
                    // Store the timeout reference
                    recordedNoteGenTimeouts.push(
                        setTimeout(() => {
                            if (gameStarted) {
                                notes.push({
                                    type: note.type,
                                    y: -noteSpawnY,
                                    x: noteXPositions[note.type], // Position based on custom X coordinates
                                    timestamp: note.timestamp
                                });
                            }
                        }, notetimestamp)
                    ); // Use the recorded timestamp
                }
            });
        } else {
            console.log("Generating random notes.");
            // Generate random notes
            let noteCounter = 0;

            // Store the interval reference
            noteGenerationIntervalRef = setInterval(() => {
                if (gameStarted) {
                    const songTime = currentSong.currentTime * 1000; // Get current timestamp of the song in ms
                    if (songTime >= duration) {
                        clearInterval(noteGenerationIntervalRef); // Stop generating notes when song ends
                        return;
                    }

                    const noteType = noteTypes[Math.floor(Math.random() * noteTypes.length)];
                    notes.push({
                        type: noteType,
                        y: -noteSpawnY,
                        x: noteXPositions[noteType] // Position based on custom X coordinates
                    });

                    noteCounter++;
                    if (noteCounter >= numberOfNotes) {
                        clearInterval(noteGenerationIntervalRef); // Stop generating notes when duration is reached
                    }
                }
            }, beatInterval);
        }
    }
}

function drawNotes() {
    ctx.drawImage(images.background, 0, 0, canvas.width, canvas.height);

    // Draw stationary hit blocks
    noteTypes.forEach((type) => {
        const x = noteXPositions[type];
        const imageToDraw = highlightedNotes[type] ? images.notePress[type] : images.note[type];

        if (imageToDraw.complete && imageToDraw.naturalWidth !== 0) {
            ctx.drawImage(imageToDraw, x, noteYpos, noteSize, noteSize);
        } else {
            ctx.fillStyle = "white";
            ctx.fillRect(x, 550, noteSize, noteSize);
        }
    });

    // Draw falling notes, including recorded "fake" notes
    notes.forEach((note) => {
        const noteType = note.type.charAt(0).toUpperCase() + note.type.slice(1);
        const noteImage = noteType.startsWith("Rec") ? images.note[noteType] : images.note[noteType.replace("Rec", "")];

        if (noteImage && noteImage.complete && noteImage.naturalWidth !== 0) {
            ctx.drawImage(noteImage, note.x, note.y, noteSize, noteSize);
        } else {
            ctx.fillStyle = "white";
            ctx.fillRect(note.x, note.y, noteSize, noteSize);
        }
    });

    // Draw points on canvas
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.font = "30px Arial";
    ctx.fillText(`Points: ${points}`, 10, 30);

    // Draw points on canvas
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.font = "30px Arial";
    ctx.fillText(`Total Misses: ${misses}`, 10, 70);

    // Draw points on canvas
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.font = "30px Arial";
    ctx.fillText(`Perfects: ${perfects}`, 10, 110);

    // Draw points on canvas
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.font = "20px Arial";
    ctx.fillText(`Early: ${earlys}`, 10, 140);

    // Draw points on canvas
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.font = "20px Arial";
    ctx.fillText(`Lates: ${lates}`, 10, 170);

    // Current + Max streak
    if (!recording) {
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText(streak, WIDTH / 2, HEIGHT / 2 - 120);
        ctx.font = "15px Arial";
        ctx.fillText(maxStreak, WIDTH / 2, HEIGHT / 2 - 160);
    }

    if (hitType && !recording) {
        ctx.font = "38px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`${hitType}!`, WIDTH / 2, HEIGHT / 2 - 40);
    }

    // Display "Recording Notes" if recording
    if (recording) {
        ctx.textAlign = "center";
        ctx.fillStyle = "red";
        ctx.font = "30px Arial";
        ctx.fillText("Recording Notes", WIDTH / 2, 50);
    }

    // Display the last 3 recorded notes
    if (lastRecordedNotes.length > 0) {
        ctx.fillStyle = "yellow";
        ctx.font = "18px Arial";
        ctx.textAlign = "left";
        const reversedNotes = [...lastRecordedNotes].reverse();
        reversedNotes.forEach((note, index) => {
            ctx.fillText(note, 10, 200 + index * 20);
        });
    }
}

function startRecording() {
    recording = true;
    console.log("Recording started.");
    recordedNotes = []; // Clear any previous recording
    lastRecordedNotes = []; // Clear recent notes display
    resetGame(); // Automatically reset the game when recording starts
    starttimestamp = Date.now(); // Reset start timestamp for accurate timestamps

    noteYpos = HEIGHT / 2 - 300;

    // Hide start button, show stop button
    startRecordButton.style.display = "none";
    stopRecordButton.style.display = "inline-block";
}

// Function to stop recording and save notes
function stopRecording() {
    recording = false;
    console.log("Recording stopped.");

    // Save recorded notes to localStorage
    if (recordedNotes.length > 0) {
        localStorage.removeItem("recordedNotes"); // Clear saved notes in localStorage
        localStorage.setItem("recordedNotes", JSON.stringify({ notes: recordedNotes, V1Format: false }));
        customNotes = { notes: [], isV1Format: false };
        customNotes.notes = recordedNotes;

        console.log("Saved notes:", recordedNotes);
        console.log(customNotes);
    } else console.log("No notes were recorded.");

    noteYpos = 550;
    // Show start button, hide stop button
    startRecordButton.style.display = "inline-block";
    stopRecordButton.style.display = "none";
}

// Helper function to capitalize the first letter of a string
function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Encode the notes into a compact format
function encodeNotes(notes) {
    return notes
        .map((note) => {
            // Capitalize the note type before encoding
            const type = capitalizeFirstLetter(note.type);
            const typeChar = noteTypeMap[type];
            return `${typeChar}/${note.timestamp}`; // Encoding as "TypeChar/timestamp"
        })
        .join(",");
}

// Decode the compact format back into an array of notes, with V1Format flag
function decodeNotes(encodedNotes) {
    let V1Format = false; // Flag to indicate if the notes are in V1 format

    // If the encoded notes start with V1., set the V1Format flag to true
    if (encodedNotes.startsWith("V1.")) {
        V1Format = true;
        encodedNotes = encodedNotes.slice(3); // Remove the "V1." prefix
    }

    const decodedNotes = encodedNotes.split(",").map((noteStr) => {
        const [typeChar, timestampStr] = noteStr.split("/");
        return {
            type: capitalizeFirstLetter(reverseNoteTypeMap[typeChar]),
            timestamp: parseInt(timestampStr)
        };
    });

    // Add the V1Format key to the decoded notes
    return { notes: decodedNotes, V1Format };
}

async function importNotes() {
    try {
        const clipboardText = await navigator.clipboard.readText();

        if (isValidJSONArray(clipboardText)) {
            // If it's valid JSON and an array, treat it as a regular notes array
            const notes = JSON.parse(clipboardText);

            if (Array.isArray(notes) && notes.length > 0 && notes[0].notes) {
                // Handle the specific array of objects format with "notes" property
                isV1Format = notes[0].V1Format || false; // Extract V1Format if present
                customNotes = notes[0].notes; // Load the "notes" array
            } else if (Array.isArray(notes)) {
                // Directly load the notes if it's an array
                isV1Format = notes.V1Format || false; // Extract V1Format if present
                customNotes = notes.notes || notes; // Load the notes
            } else {
                throw new Error("Invalid JSON structure: Expected an array or an object with a 'notes' property.");
            }

            localStorage.setItem("recordedNotes", JSON.stringify({ notes: customNotes, V1Format: isV1Format }));
            console.log("Imported notes (array format):", customNotes);

            // Show confirmation popup
            window.alert("Imported notes successfully.");
        } else if (clipboardText.includes("{") && clipboardText.includes("notes")) {
            // Handle object with a "notes" property
            const notesObject = JSON.parse(clipboardText);

            if (notesObject.notes && Array.isArray(notesObject.notes)) {
                isV1Format = notesObject.V1Format || false; // Extract V1Format if present
                customNotes = notesObject.notes; // Load the "notes" array

                localStorage.setItem("recordedNotes", JSON.stringify({ notes: customNotes, V1Format: isV1Format }));
                console.log("Imported notes (object with 'notes' property):", customNotes);

                // Show confirmation popup
                window.alert("Imported notes successfully.");
            } else {
                throw new Error("Invalid JSON structure: 'notes' property must be an array.");
            }
        } else if (clipboardText.includes("/")) {
            // Treat it as an encoded notes string
            const decoded = decodeNotes(clipboardText);
            isV1Format = decoded.V1Format; // Set isV1Format based on the decoded data
            customNotes = decoded.notes;
            localStorage.setItem("recordedNotes", JSON.stringify({ notes: decoded.notes, V1Format: decoded.V1Format }));
            console.log("Imported notes (encoded format):", decoded.notes);

            // Show confirmation popup
            window.alert("Imported notes successfully.");
        } else {
            console.error("Clipboard data is not in a recognized format.");

            // Show confirmation popup
            if (
                window.confirm(
                    "Notes are not in a recognized format. (Clipboard must be an array, or an encoded format like 'T (type)/timestamp'). Do you wish to see the pasted clipboard text?"
                )
            ) {
                window.alert(clipboardText);
                console.log(clipboardText);
            }
        }
    } catch (err) {
        console.error("Failed to read clipboard data:", err);
    }
}

// Copy recorded notes to clipboard in the custom encoded format
function copyNotesToClipboard() {
    const savedNotes = localStorage.getItem("recordedNotes");
    if (!savedNotes) {
        window.alert("No custom notes found in localStorage. Record some!");
        return;
    }

    const notes = JSON.parse(savedNotes);
    const encodedNotes = encodeNotes(notes.notes || notes); // Encode only the note array part

    if (window.confirm("Do you wish to copy your notes in an encoded format or as an array format?")) {
        navigator.clipboard
            .writeText(`${encodedNotes}`)
            .then(() => {
                console.log("Copied encoded notes to clipboard in encoded format:", encodedNotes);
            })
            .catch((err) => {
                console.error("Failed to copy notes to clipboard:", err);
            });
    } else {
        navigator.clipboard
            .writeText(`${savedNotes}`)
            .then(() => {
                console.log("Copied notes as an array to clipboard in encoded format:", savedNotes);
            })
            .catch((err) => {
                console.error("Failed to copy notes to clipboard:", err);
            });
    }
}

// Function to check if a string is a valid JSON array
function isValidJSONArray(str) {
    try {
        const parsed = JSON.parse(str);
        return Array.isArray(parsed);
    } catch (e) {
        return false;
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
    if (currentSong) currentSong.pause(); // Pause currentSong
    currentSong.currentTime = 0; // Reset currentSong
    notes = []; // Clear notes array
    points = 0; // Reset points
    customNotes = []; // Clear custom notes

    // Clear any existing note generation interval
    if (noteGenerationIntervalRef) {
        console.log("Random Gen Interval:", noteGenerationIntervalRef);
        clearInterval(noteGenerationIntervalRef); // Stop any ongoing note generation
        noteGenerationIntervalRef = null; // Reset the reference
    }

    // Clear any existing recorded note generation timeouts
    if (recordedNoteGenTimeouts.length > 0) {
        console.log("Clearing recorded timeouts:", recordedNoteGenTimeouts);
        recordedNoteGenTimeouts.forEach((timeout) => clearTimeout(timeout)); // Clear all stored timeouts
        recordedNoteGenTimeouts = []; // Reset the array
    }

    // Automatically start the game again with saved notes
    startGame();
}

// Create buttons
window.onload = function () {
    // Reset button
    resetButton = document.getElementById("resetButton");
    resetButton.innerText = "Reset Game";
    resetButton.onclick = resetGame;
    document.body.appendChild(resetButton);

    // Create Start Recording button
    startRecordButton = document.getElementById("recordButton");
    startRecordButton.innerText = "Start Recording";
    startRecordButton.onclick = startRecording;
    document.body.appendChild(startRecordButton);

    // Create Stop Recording button (hidden by default)
    stopRecordButton = document.getElementById("stopRecordingButton");
    stopRecordButton.innerText = "Stop Recording";
    stopRecordButton.style.display = "none"; // Hidden initially
    stopRecordButton.onclick = stopRecording;
    document.body.appendChild(stopRecordButton);

    // Create Auto-Hit button
    autoHitButton = document.getElementById("toggleAutoHit");
    autoHitButton.innerText = "Auto-Hit";
    autoHitButton.onclick = toggleAutoHit;
    document.body.appendChild(autoHitButton);

    // Create Import Notes button
    importButton = document.getElementById("importButton");
    importButton.innerText = "Import Notes";
    importButton.onclick = importNotes;
    document.body.appendChild(importButton);

    // Create Copy Notes button
    copyButton = document.getElementById("encodeButton");
    copyButton.innerText = "Copy Notes";
    copyButton.onclick = copyNotesToClipboard;
    document.body.appendChild(copyButton);
};

document.addEventListener("keydown", (event) => {
    const noteType = keyBindings[event.key.toUpperCase()];
    if (event.key === "Enter" && !gameStarted) {
        resetGame(); // Start the game when Enter is pressed
    } else if (gameStarted && noteType && !keyHeldDown[noteType]) {
        if (recording) {
            const timestamp = Date.now() - starttimestamp;
            recordedNotes.push({
                type: noteType,
                timestamp: timestamp - 1080
            });
            lastRecordedNotes.push(`Recorded: ${noteType}, at ${timestamp}ms`);
            if (lastRecordedNotes.length > 26) {
                lastRecordedNotes.shift(); // Keep only the last 10 entries
            }
            notes.push({
                type: `RecNote${noteType}`,
                y: HEIGHT / 2 - 300,
                x: noteXPositions[noteType]
            });
            console.log(`Recorded note: ${noteType} at ${timestamp}ms`);
        }

        highlightedNotes[noteType] = true;

        for (let i = 0; i < notes.length; i++) {
            if (notes[i].type === noteType && !notes[i].type.startsWith("rec")) {
                const noteY = notes[i].y;
                const savedtimestamp = notes[i].timestamp;

                if (noteY >= targetYPositionStart && noteY <= targetYPositionEnd) {
                    const distanceFromCenter = Math.abs(noteY - (targetYPositionStart + targetYPositionEnd) / 2);

                    if (distanceFromCenter <= perfectRange) {
                        hitType = "Perfect"; // Within perfect range
                        points++; // Reward for perfect hit
                        perfects++;
                    } else {
                        hitType = noteY < (targetYPositionStart + targetYPositionEnd) / 2 ? "Early" : "Late";
                        points += 0.5; // Normal points for early or late hits
                        if (hitType == "Early") earlys++;
                        else if (hitType == "Late") lates++;
                    }

                    streak++;
                    if (streak > maxStreak) {
                        maxStreak = streak;
                    }

                    if (noteOffset > 0 || (noteOffset < 0 && savedtimestamp))
                        console.log(
                            `${hitType} hit on note: ${noteType}, saved at ${savedtimestamp}ms, ${savedtimestamp + noteOffset} with an offset of ${noteOffset}`
                        );
                    else if (noteOffset == 0 && savedtimestamp) console.log(`${hitType} hit on note: ${noteType}, saved at ${savedtimestamp}ms`);
                    else if (!savedtimestamp) console.log(`${hitType} hit on note: ${noteType}`);
                    playSoundEffect("Resources/SFX/hoverBtn.mp3", 0.75);
                    notes.splice(i, 1);
                    break;
                }
            }
        }
    }
});

document.addEventListener("keyup", (event) => {
    const noteType = keyBindings[event.key.toUpperCase()];
    if (noteType) {
        highlightedNotes[noteType] = false;
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

function updateNotes(deltaTime) {
    const adjustedNoteSpeed = noteSpeed * (deltaTime / 6); // Adjust note speed based on deltaTime

    for (let i = 0; i < notes.length; i++) {
        const note = notes[i];
        note.y += adjustedNoteSpeed;

        // Check if the note is off the screen
        if (note.y > canvas.height) {
            if (!note.type.startsWith("Rec")) {
                notes.splice(i, 1);
                points--; // Decrease points for missed note
                streak = 0;
                hitType = "Miss";
                misses++;
                i--;
            } else {
                notes.splice(i, 1); // Just remove fake notes, no scoring penalty
                i--;
            }
        }
    }

    // Auto-hit logic for holding notes (optional)
    if (autoHitEnabled) {
        notes.forEach((note) => {
            if (Math.abs(note.y - 600) < hitRange) {
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
    }

    setTimeout(() => {
        document.dispatchEvent(new KeyboardEvent("keyup", { key: key }));
    }, Math.random() * (125 - 75) + 75);
}

// Start the game
function startGame() {
    gameStarted = true; // Set the game state to started
    console.log("Game started.");
    currentSong.play(); // Start playing the currentSong
    notes = [];
    starttime = Date.now(); // Set start timestamp for recording
    generateNotes(); // Start generating notes
    lastTime = performance.now(); // Initialize lastTimetamp with current timestamp
    gameLoop(lastTime); // Start the game loop with the current timestamp
}

// Game loop
function gameLoop(currentTime) {
    const deltaTime = currentTime - lastTime; // Calculate delta timestamp
    lastTime = currentTime; // Update lastTimetamp to currenttimestamp

    if (gameStarted) {
        updateNotes(deltaTime); // Pass deltaTime to updateNotes
        drawNotes();
        requestAnimationFrame(gameLoop); // Request the next frame
    }
}
