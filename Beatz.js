/**
 * Title: Beatz VI
 * Author: Victor//GuayabR
 * Date: 16/05/2024
 * Version: NOTES VI v6.0 test (release.version.subversion.bugfix)
 * GitHub Repository: https://github.com/GuayabR/Beatz
 **/

var notes = [];
var noteSpeed = 3.5; // Speed at which notes fall | S0.29/Y-500 | S2/Y-250 | S2.5/Y-110 | S3/Y0 | S3.5Y26 | S4Y193 | S4.5/Y270 | S5/Y360 | S5.5/Y467 | S6/Y540 | S6.5Y610 | S7/Y720 | S8/Y910
var noteOffset = 0;
let noteSpawnY = 60;
let hitType;
let hitTypeID = -2;
let BPM = 118; // Beats per minute
let beattime = (60 / BPM) * 1000;
let noteMode = 4;
const noteTypes = [
    "Upleft",
    "Downleft",
    "Left",
    "Up",
    "Down",
    "Right",
    "Upright",
    "Downright"
    //"SwipeUpleft",
    //"SwipeUpright",
    //"SwipeLeft",
    //"SwipeUp",
    //"SwipeDown",
    //"SwipeRight",
    //"SwipeDownright",
    //"SwipeUpright"
];
// Define fallback colors for each note type
const noteColors = {
    Upleft: "#FF69B4", // Pink
    Downleft: "#1E90FF", // Slightly Dark Blue
    Left: "#FF0000", // Red
    Up: "#00FF00", // Green
    Down: "#FFFF00", // Yellow
    Right: "#00FFFF", // Cyan
    Upright: "#FF0000", // Red
    Downright: "#800080" // Purple
};
var noteSize = 74; // Uniform size for square notes
var leftNoteSize = 74;
var upNoteSize = 74;
var downNoteSize = 74;
var rightNoteSize = 74;
var upLeftNoteSize = 74;
var downLeftNoteSize = 74;
var upRightNoteSize = 74;
var downRightNoteSize = 74;
var fontSize = 40;
var bpmPulseFontSize = 40;
var hitPulseFontSize = 40;
var smallFontSize = 40;
const targetYPositionStart = 320; // New start of the hit zone
const targetYPositionEnd = 680; // End of the hit zone
// Early/Late and Perfect hit zones
const perfectRange = 35; // 35 pixels on either side for perfect hit
const absolutePerfectRange = 16; // 16 pixels on either side for an absolute perfect hit
const exactRange = 2; // 3 Pixels on either side for an exact hit
const targetYPosition = 500; // Y-position of stationary hit blocks
let points = 0;
let streak = 0;
let misses = 0;
let exactHits = 0;
let insanes = 0;
let perfects = 0;
let earlys = 0;
let lates = 0;
let accuracy = 100;
let noteProgress = 0;
let recording = false; // To track if we're recording key presses
let recordedNotes = []; // Store recorded notes
let starttime; // Track game start timestamp for recording
let customNotes = {}; // Store custom notes for playback
let lastRecordedNotes = []; // To store the last 3 recorded notes
var hitArray = {
    exact: [],
    insane: [],
    hitPerfect: [],
    hitEarly: [],
    hitLate: [],
    missed: []
};

let pulseToBPM = true;
let pulseToHits = true;
let pulseBPMinterval;

let fullscreen = false;

const canvas = document.getElementById("myCanvas");

const ctx = canvas.getContext("2d");

// Enable high-quality rendering
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = "high";

ctx.textRendering = "geometricPrecision";

// Ensure scaling is crisp
canvas.style.imageRendering = "auto"; // Options: "crisp-edges", "pixelated", "auto"

const backgroundOverlay = document.getElementById("backgroundOverlay");

const canvasContainer = document.getElementById("canvasContainer");

var drawLanes = false;

let autoHitEnabled = false;

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        canvasContainer.requestFullscreen().catch((err) => {
            logError(`Error attempting to enable full-screen mode: ${err} | ${err.message} | ${err.name}`);
        });
        console.log("Entered Fullscreen");
        document.body.classList.add("fullscreen"); // Add fullscreen class to body
        fullscreen = true;
    } else {
        document.exitFullscreen();
        console.log("Exited Fullscreen");
        document.body.classList.remove("fullscreen"); // Remove fullscreen class from body
        fullscreen = false;
    }
}

// Listen for fullscreen change events to adjust the styles of elements
document.addEventListener("fullscreenchange", function () {
    if (document.fullscreenElement === canvasContainer) {
        // Adjust styles when entering fullscreen mode
        canvas.style.cursor = "none";
        backgroundOverlay.style.cursor = "none";

        adjustCanvasForFullscreen();
    } else {
        // Reset styles when exiting fullscreen mode
        backgroundOverlay.style.cursor = "default";
        canvas.style.cursor = "default";

        resetCanvasFromFullscreen();
    }
});

// Function to adjust canvas styles for fullscreen
function adjustCanvasForFullscreen() {
    // Get the aspect ratios
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;
    const canvasAspectRatio = canvas.width / canvas.height;
    const containerAspectRatio = containerWidth / containerHeight;

    // Maintain aspect ratio while filling the fullscreen
    if (canvasAspectRatio > containerAspectRatio) {
        canvas.style.width = "100%";
        canvas.style.height = "auto";
    } else {
        canvas.style.width = "auto";
        canvas.style.height = "100%";
    }
}

// Function to reset canvas styles when exiting fullscreen mode
function resetCanvasFromFullscreen() {
    canvas.style.width = ""; // Reset width to default
    canvas.style.height = ""; // Reset height to default
    canvas.style.position = "absolute";
    canvas.style.top = "50%";
    canvas.style.left = "50%";
    canvas.style.transform = "translate(-50%, -50%)";
}

// Update mappings for encoding and decoding note types with the new format
const noteTypeMap = {
    // Swipes
    SwipeUpleft: "SUL",
    SwipeDownleft: "SDL",
    SwipeLeft: "SL",
    SwipeUp: "SU",
    SwipeDown: "SD",
    SwipeRight: "SR",
    SwipeDownright: "SDR",
    SwipeUpright: "SUR",
    // Normal
    Downleft: "DL",
    Upleft: "UL",
    Left: "L",
    Down: "D",
    Up: "U",
    Right: "R",
    Upright: "UR",
    Downright: "DR"
};
const reverseNoteTypeMap = {
    // Swipes
    SUL: "SwipeUpleft",
    SDL: "SwipeDownleft",
    SL: "SwipeLeft",
    SU: "SwipeUp",
    SD: "SwipeDown",
    SR: "SwipeRight",
    SDR: "SwipeDownright",
    SUR: "SwipeUpright",
    // Normal
    DL: "Downleft",
    UL: "Upleft",
    L: "Left",
    D: "Down",
    U: "Up",
    R: "Right",
    UR: "Upright",
    DR: "Downright"
};

const defaultKeybinds = {
    leftswipe: ["KeyC"],
    upleft: ["Digit1"],
    downleft: ["Digit2"],
    left: ["Digit3", "KeyA", "ArrowLeft"],
    up: ["Digit4", "KeyS", "ArrowUp"],
    down: ["Digit9", "KeyK", "ArrowDown"],
    right: ["Digit0", "KeyL", "ArrowRight"],
    downright: ["Minus"],
    upright: ["Equal"],
    rightswipe: ["Comma"],
    pause: ["Escape"],
    autoHit: ["Backspace"],
    previous: ["KeyV"],
    restart: ["KeyB"],
    next: ["KeyN"],
    randomize: ["KeyG"],
    changeNoteStyle: ["KeyU"],
    fullscreen: ["KeyF"],
    openSongList: ["KeyO"],
    openSettings: ["KeyP"],
    record: ["ControlLeft+ShiftLeft+Enter"]
};

const keyBindings = {};

// Convert the array values in defaultKeybinds into proper key-value pairs
for (const [direction, keys] of Object.entries(defaultKeybinds)) {
    keys.forEach((key) => {
        keyBindings[key] = direction.charAt(0).toUpperCase() + direction.slice(1); // Capitalize first letter
    });
}

// CONSTANTS

const VERSION = "NOTES X v6.2";
var PUBLICVERSION = `X (v6.2)`;
console.log("Version: " + VERSION);

const WIDTH = 1280;

const HEIGHT = 720;

var noteSpacing = 80; // Adjust this value to change spacing
const noteOrder = ["Upleft", "Downleft", "Left", "Up", "Down", "Right", "Downright", "Upright"];
const centerX = WIDTH / 2;
const baseOffset = ((noteOrder.length - 1) / 2) * noteSpacing; // Centers the notes dynamically

var noteXPositions = {};
noteOrder.forEach((note, index) => {
    noteXPositions[note] = centerX + (index - (noteOrder.length - 1) / 2) * noteSpacing;
});

function newNoteSpacing(newSpacing) {
    noteOrder.forEach((note, index) => {
        noteXPositions[note] = centerX + (index - (noteOrder.length - 1) / 2) * newSpacing;
    });

    noteSpacing = newSpacing;
}

function getNoteXPosition(noteType) {
    let baseType = noteType;
    if (baseType.startsWith("Swipe")) {
        baseType = baseType.replace("Swipe", "");
    }

    return baseType;
}

var noteYpos = 500;

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
    downleft: false,
    upleft: false,
    left: false,
    up: false,
    down: false,
    right: false,
    upright: false,
    downright: false
};

// Track if a key is being held down for each note type
const keyHeldDown = {
    downleft: false,
    upleft: false,
    left: false,
    up: false,
    down: false,
    right: false,
    upright: false,
    downright: false
};

// Define image paths to cycle through (includes null for invisible notes)
const noteImagePaths = [
    "Resources/Arrows/Note", // Normal notes
    "Resources/Arrows/Note", // Pressed state (will append 'Press' to type later)
    "Resources/Arrows/technoNotes/technoNote",
    "Resources/Arrows/technoNotes/technoNote", // Pressed state
    "Resources/Arrows/paraNotes/paraNote",
    "Resources/Arrows/paraNotes/paraNote", // Pressed state
    "Resources/Arrows/Old/Note",
    "Resources/Arrows/Old/Note", // Pressed state
    "Resources/Arrows/RecordingNotes/RecNote",
    null // Note bars option
];

const beatLineImage = new Image();
beatLineImage.src = "Resources/Arrows/beatLine.png";

let currentNoteStyleIndex = 2;
let currentFallingStyleIndex = 2;
let currentPressStyleIndex = 2;
let currentRecStyleIndex = 8;
let currentStaticStyleIndex = 2;

function updateNoteImages() {
    noteTypes.forEach((type) => {
        if (type === "beatLine") {
            images.fallingNote[type].src = beatLineImage.src; // Fixed beatLine image
            return;
        }

        const path = noteImagePaths[currentNoteStyleIndex];

        if (path) {
            const normalPath = `${path}${type}.png`;
            const pressedPath = `${path}${type}Press.png`;

            // Determine which style is being used and log it
            const fallingPath = currentFallingStyleIndex % 2 === 0 ? normalPath : pressedPath;
            console.log(`[Falling] ${type}: ${fallingPath.includes("Press") ? "Pressed" : "Normal"}`);

            const staticPath = currentStaticStyleIndex % 2 === 0 ? normalPath : pressedPath;
            console.log(`[Static] ${type}: ${staticPath.includes("Press") ? "Pressed" : "Normal"}`);

            const pressPath = currentPressStyleIndex % 2 === 0 ? normalPath : pressedPath;
            console.log(`[Press] ${type}: ${pressPath.includes("Press") ? "Pressed" : "Normal"}`);

            const recPath = currentRecStyleIndex % 2 === 0 ? normalPath : pressedPath;
            console.log(`[Rec] ${type}: ${recPath.includes("Press") ? "Pressed" : "Normal"}`);

            // Apply styles
            images.fallingNote[type].src = fallingPath;
            images.staticNote[type].src = staticPath;
            images.notePress[type].src = pressPath;
            images.recNote[type].src = recPath;
        } else {
            images.fallingNote[type].src = "";
            images.staticNote[type].src = "";
            images.notePress[type].src = "";
            images.recNote[type].src = "";
        }
    });
}

// Change note style
function changeNoteStyle() {
    currentNoteStyleIndex = (currentNoteStyleIndex + 1) % noteImagePaths.length;

    updateNoteImages();
    console.log(`Changed all note styles to: ${noteImagePaths[currentNoteStyleIndex] || "Bars"}`);
}

// Change falling note style
function changeFallingNoteStyle() {
    currentFallingStyleIndex = (currentFallingStyleIndex + 1) % noteImagePaths.length;

    noteTypes.forEach((type) => {
        if (type === "beatLine") return;
        const path = noteImagePaths[currentFallingStyleIndex];
        const normalPath = `${path}${type}.png`;
        const pressedPath = `${path}${type}Press.png`;
        const selectedPath = currentFallingStyleIndex % 2 === 0 ? normalPath : pressedPath;
        images.fallingNote[type].src = selectedPath;
        console.log(`[Falling] ${type}: ${selectedPath.includes("Press") ? "Pressed" : "Normal"}`);
    });
}

// Change press note style
function changePressStyle() {
    currentPressStyleIndex = (currentPressStyleIndex + 1) % noteImagePaths.length;

    noteTypes.forEach((type) => {
        const path = noteImagePaths[currentPressStyleIndex];
        const normalPath = `${path}${type}.png`;
        const pressedPath = `${path}${type}Press.png`;
        const selectedPath = currentPressStyleIndex % 2 === 0 ? normalPath : pressedPath;
        images.notePress[type].src = selectedPath;
        console.log(`[Press] ${type}: ${selectedPath.includes("Press") ? "Pressed" : "Normal"}`);
    });
}

// Change recording note style
function changeRecStyle() {
    currentRecStyleIndex = (currentRecStyleIndex + 1) % noteImagePaths.length;

    noteTypes.forEach((type) => {
        const path = noteImagePaths[currentRecStyleIndex];
        const normalPath = `${path}${type}.png`;
        const pressedPath = `${path}${type}Press.png`;
        const selectedPath = currentRecStyleIndex % 2 === 0 ? normalPath : pressedPath;
        images.recNote[type].src = selectedPath;
        console.log(`[Rec] ${type}: ${selectedPath.includes("Press") ? "Pressed" : "Normal"}`);
    });
}

// Change stationary note style
function changeStaticStyle() {
    currentStaticStyleIndex = (currentStaticStyleIndex + 1) % noteImagePaths.length;

    noteTypes.forEach((type) => {
        const path = noteImagePaths[currentStaticStyleIndex];
        const normalPath = `${path}${type}.png`;
        const pressedPath = `${path}${type}Press.png`;
        const selectedPath = currentStaticStyleIndex % 2 === 0 ? normalPath : pressedPath;
        images.staticNote[type].src = selectedPath;
        console.log(`[Static] ${type}: ${selectedPath.includes("Press") ? "Pressed" : "Normal"}`);
    });
}

// Preload images
const images = {
    background: new Image(),
    fallingNote: {},
    staticNote: {},
    notePress: {},
    recNote: {}
    //swipeNote: {}
};

noteTypes.forEach((type) => {
    images.fallingNote[type] = new Image();
    images.staticNote[type] = new Image();
    images.notePress[type] = new Image();
    images.recNote[type] = new Image();
    //images.swipeNote[type] = new Image();\

    //images.swipeNote[type].src = `Resources/Arrows/SwipeNotes/${type}.png`;
});

images.background.src = "Resources/defaultBG.png";

let currentSong = document.getElementById("song");

let currentSongIndex;

const loadedImages = {};

var loadedChart = false;

function loadBeatzSavedChart() {
    // Load recordedBeatzFileData from localStorage
    const savedBeatzFileData = localStorage.getItem("recordedBeatzFileData");

    if (savedBeatzFileData) {
        try {
            const beatzData = JSON.parse(savedBeatzFileData);
            console.log("parsed data", beatzData);

            // Apply values to the respective variables
            let { song, charter, fileNoteMode, fileBPM, fileNoteSpeed, fileNoteSpawnY, fileNotes } = beatzData;

            // Apply to global variables
            customNotes = fileNotes; // Notes from saved data
            BPM = fileBPM; // BPM from saved data
            noteSpeed = fileNoteSpeed; // Note speed from saved data
            noteSpawnY = fileNoteSpawnY; // Note spawn Y from saved data
            noteMode = fileNoteMode;

            beattime = (60 / BPM) * 1000;

            // Find the song in "Resources/Songs" and set it to currentSong.src
            const songPath = `Resources/Songs/${song}.mp3`;
            const songFile = new Audio(songPath);
            if (songFile.canPlayType) {
                currentSong.src = songPath; // Set the source of the current song
            } else {
                throw new Error(`Song "${song}" not found in "Resources/Songs".`);
            }

            loadedChart = true;

            console.log("Loaded saved Beatz file data from localStorage:", beatzData);
        } catch (err) {
            console.log("Error loading Beatz file data from localStorage:", err);
        }
    } else {
        console.log("No saved Beatz file data found in localStorage.");
    }
}

document.addEventListener("DOMContentLoaded", function () {
    loadBeatzSavedChart();

    updateNoteImages();

    document.getElementById("importButton").addEventListener("click", importBeatzFile);
});

let noteGenerationIntervalRef = null; // for random note generation interval
let recordedNoteGenTimeouts = []; // Array to store setTimeout references

let noteCounter = 0;
var duration; // Get the song duration in milliseconds
var numberOfNotes; // Calculate the number of notes

// Note generator (for custom sequence or random)
function generateNotes() {
    if (recording) {
        console.log("Recording mode: No random notes are generated.");
        return; // Skip note generation if recording
    }

    duration = currentSong.duration * 1000;

    // Generate notes based on imported file
    if (customNotes.length > 0) {
        console.log("Custom notes exist", customNotes);

        customNotes.forEach((note) => {
            let notetimestamp = note.timestamp + noteOffset;
            if (notetimestamp < duration) {
                recordedNoteGenTimeouts.push(
                    setTimeout(() => {
                        if (note.type === "Effect") {
                            if (note.newBPM) {
                                newBpmPulseInterval(note.newBPM, note.FSinc, note.smallFSinc, note.bpmPulseInc);
                                console.log("new bpm", note.newBPM);
                            }
                            if (note.newSpeed) {
                                noteSpeed = note.newSpeed;
                                console.log("new speed", note.newSpeed);
                            }
                            if (note.newSpawnY) {
                                noteSpawnY = note.newSpawnY;
                                console.log("new spawn y", note.newSpawnY);
                            }
                        } else {
                            let noteX = getNoteXPosition(note.type);

                            // Push note to array with corrected X position and initial opacity of 0
                            const newNote = {
                                type: note.type,
                                y: -noteSpawnY - 75,
                                x: noteXPositions[noteX],
                                timestamp: note.timestamp,
                                faded: false,
                                opacity: 0, // Start with opacity 0
                                scale: 1
                            };

                            notes.push(newNote); // Add the note to the notes array

                            // Gradually fade the note in
                            let fadeDuration = 150; // 300 ms fade-in duration
                            let fadeSteps = 30; // Smooth fading in steps
                            let fadeAmount = 1 / fadeSteps;

                            let fadeInterval1 = setInterval(() => {
                                newNote.opacity += fadeAmount;

                                if (newNote.opacity >= 1) {
                                    clearInterval(fadeInterval1); // Stop the fade when opacity reaches 1
                                }
                            }, fadeDuration / fadeSteps); // Update every frame (~60fps)
                        }
                    }, notetimestamp)
                );
            }
        });
    } else {
        console.log("Generating random notes.");
        // Generate random notes
        duration = currentSong.duration * 1000;
        numberOfNotes = Math.floor(duration / beattime);

        // Filter noteTypes to only include directional notes (Up, Down, Left, Right)
        const directionalNotes = ["Up", "Down", "Left", "Right"];

        // Store the interval reference
        noteGenerationIntervalRef = setInterval(() => {
            if (gameStarted) {
                const songTime = currentSong.currentTime * 1000; // Get current timestamp of the song in ms
                if (songTime >= duration) {
                    clearInterval(noteGenerationIntervalRef); // Stop generating notes when song ends
                    return;
                }

                const noteType = directionalNotes[Math.floor(Math.random() * directionalNotes.length)];
                notes.push({
                    type: noteType,
                    y: -noteSpawnY,
                    x: noteXPositions[noteType], // Position based on custom X coordinates
                    faded: false,
                    opacity: 1,
                    scale: 1
                });

                noteCounter++;
                if (noteCounter >= numberOfNotes) {
                    clearInterval(noteGenerationIntervalRef); // Stop generating notes when duration is reached
                }
            }
        }, beattime);
    }
}

let hitTypeOpacity = 1; // Opacity for fade-out effect
let hitTypeTimeout = null; // Timeout reference
let hitTypeFadeInterval = null; // Fade-out interval reference

let beatLineOpacity = 0.2;

function drawNotes() {
    //if (!fullscreen) ctx.drawImage(images.background, 0, 0, WIDTH, HEIGHT);

    // Define which notes should be drawn based on noteMode
    let allowedNotes = [];
    if (noteMode === 1) {
        allowedNotes = ["Up"];
    } else if (noteMode === 2) {
        allowedNotes = ["Up", "Down"];
    } else if (noteMode === 3) {
        allowedNotes = ["Up", "Down", "Right"];
    } else if (noteMode === 4) {
        allowedNotes = ["Left", "Up", "Down", "Right"];
    } else if (noteMode === 5) {
        allowedNotes = ["Downleft", "Left", "Up", "Down", "Right"];
    } else if (noteMode === 6) {
        allowedNotes = ["Downleft", "Left", "Up", "Down", "Right", "Downright"];
    } else if (noteMode === 7) {
        allowedNotes = ["Downleft", "Left", "Up", "Down", "Right", "Downright", "Upright"];
    } else if (noteMode >= 8) {
        allowedNotes = [...noteTypes]; // All notes
        noteMode = 8;
    }

    // Draw stationary hit blocks with individual note sizes
    allowedNotes.forEach((type) => {
        let currentNoteSize;

        // Assign the correct note size based on the note type
        switch (type) {
            case "Upleft":
                currentNoteSize = upLeftNoteSize;
                break;
            case "Downleft":
                currentNoteSize = downLeftNoteSize;
                break;
            case "Left":
                currentNoteSize = leftNoteSize;
                break;
            case "Up":
                currentNoteSize = upNoteSize;
                break;
            case "Down":
                currentNoteSize = downNoteSize;
                break;
            case "Upright":
                currentNoteSize = upRightNoteSize;
                break;
            case "Downright":
                currentNoteSize = downRightNoteSize;
                break;
            case "Right":
                currentNoteSize = rightNoteSize;
                break;
            default:
                currentNoteSize = noteSize;
                break;
        }

        const x = noteXPositions[type] - currentNoteSize / 2;
        const imageToDraw = highlightedNotes[type] ? images.notePress[type] : images.staticNote[type];

        if (imageToDraw.complete && imageToDraw.naturalWidth !== 0) {
            const diagonalNotes = ["Upleft", "Downleft", "Upright", "Downright"];
            const sizeDifference = currentNoteSize - noteSize || 0;
            const adjustedNoteYpos = (diagonalNotes.includes(type) ? noteYpos + 3 : noteYpos) - sizeDifference / 2;

            ctx.drawImage(imageToDraw, x, adjustedNoteYpos, currentNoteSize, currentNoteSize);
        } else {
            ctx.fillStyle = noteColors[type] || "white"; // Use the defined color or fallback to white
            const sizeDifference = currentNoteSize - noteSize || 0;
            ctx.fillRect(x, noteYpos + 31 - sizeDifference / 2, currentNoteSize, currentNoteSize - 64);
        }
    });

    notes.forEach((note) => {
        // Other drawing code remains the same...
        let noteType = note.type.startsWith("RecNote") ? note.type.replace("RecNote", "") : note.type;

        // Special case for beatLine
        if (noteType === "beatLine") {
            if (beatLineImage && beatLineImage.complete && beatLineImage.naturalWidth !== 0) {
                ctx.globalAlpha = beatLineOpacity;
                ctx.drawImage(beatLineImage, note.x - 400, note.y, 800, 5);
                ctx.globalAlpha = 1;
            }
            return; // Skip the rest of the function
        }

        // Only draw notes if they are in the allowed list
        if (!allowedNotes.includes(noteType)) {
            return;
        }

        let noteImage = note.type.startsWith("RecNote") ? images.recNote[noteType] : images.fallingNote[noteType];

        if (noteImage && noteImage.complete && noteImage.naturalWidth !== 0) {
            // Apply opacity if the note is faded
            if (note.faded) {
                ctx.filter = "grayscale(60%)"; // Apply 50% desaturation
            }

            ctx.globalAlpha = note.opacity; // Set faded opacity
            currentNoteSize = noteSize * note.scale;
            const sizeDifference = currentNoteSize - noteSize;

            // Draw the note image
            ctx.drawImage(noteImage, note.x - currentNoteSize / 2, note.y - sizeDifference / 2, currentNoteSize, currentNoteSize);

            // Reset the filter and alpha
            ctx.filter = "none";
            ctx.globalAlpha = 1; // Reset alpha
        } else {
            if (note.faded) {
                ctx.filter = "grayscale(80%)"; // Apply 50% desaturation
            }

            ctx.globalAlpha = note.opacity; // Set faded opacity for fallback drawing
            ctx.fillStyle = noteColors[noteType] || "white"; // Use the defined color or fallback to white
            ctx.fillRect(note.x - noteSize / 2, note.y + 31, noteSize, 10);
            ctx.filter = "none";
            ctx.globalAlpha = 1; // Reset alpha
        }
    });

    // Draw lanes
    if (drawLanes) {
        noteTypes.forEach((type) => {
            const x = noteXPositions[type] - 7;

            ctx.fillStyle = "white";
            ctx.fillRect(x, 500, 3, 175);
        });

        ctx.fillStyle = "white";
        ctx.fillRect(noteXPositions["Right"] + 68, 500, 3, 175);
    }

    // Set initial Y position
    let yOffset = 110;

    if (!recording) {
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = `${hitPulseFontSize - 12}px Poppins`;
        ctx.fillText(`${noteProgress.toFixed(2)}%`, WIDTH / 2, HEIGHT - 10);
    }

    // Draw accuracy & points
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.font = "30px Poppins";
    ctx.fillText(`Accuracy: ${accuracy.toFixed(2)}%`, 10, 30);

    const roundedPoints = Math.round(points);
    const pointsText = roundedPoints.toLocaleString();
    ctx.fillText(`Points: ${pointsText}`, 10, 70);

    // Conditionally draw "insane's"
    if (insanes > 0) {
        ctx.font = "34px Poppins";
        ctx.fillText(`INSANES: ${insanes}`, 10, yOffset);
        yOffset += 40; // Increase spacing for next text
    }

    // Draw the rest dynamically
    const textLines = [
        { label: "Perfects", value: perfects },
        { label: "Early", value: earlys },
        { label: "Lates", value: lates },
        { label: "Misses", value: misses }
    ];

    ctx.font = "30px Poppins";
    textLines.forEach((line) => {
        ctx.fillText(`${line.label}: ${line.value}`, 10, yOffset);
        yOffset += 40; // Space each line by 40 pixels
    });

    // Current + Max streak
    if (!recording) {
        ctx.font = `${fontSize - 10}px Poppins`;
        ctx.textAlign = "center";
        ctx.fillText(streak, WIDTH / 2, HEIGHT / 2 - 120);
        ctx.font = `${fontSize - 25}px Poppins`;
        ctx.fillText(maxStreak, WIDTH / 2, HEIGHT / 2 - 160);
    }

    // Check if the hit was insane and apply styles accordingly
    let isExact = hitTypeID === -1;
    let isinsane = hitTypeID === 0; // Adjust the condition based on how you track insane hits
    let isPerfect = hitTypeID === 1;

    // Now draw the hitType with special styling for "insane" hits
    if (hitType && hitTypeOpacity > 0) {
        ctx.font = `600 ${fontSize + 5}px Poppins`;
        ctx.textAlign = "center";

        if (isinsane) {
            // Apply gold color and glow effect for insane hits
            ctx.fillStyle = `rgba(255, 223, 0, ${hitTypeOpacity})`; // Gold color
            ctx.shadowColor = "rgba(255, 223, 0, 0.8)"; // Golden shine
            ctx.shadowBlur = 10; // Shine effect
        } else if (isPerfect) {
            // Apply gold color and glow effect for Insane hits
            ctx.fillStyle = `rgba(60, 230, 255, ${hitTypeOpacity})`; // Blue color
            ctx.shadowColor = "rgba(0, 102, 255, 0.8)"; // Blue shine
            ctx.shadowBlur = 50; // Shine effect
        } else if (isExact) {
            // Apply gold color and glow effect for Insane hits
            ctx.fillStyle = `rgba(60, 255, 0, ${hitTypeOpacity})`; // Blue color
            ctx.shadowColor = "rgba(67, 150, 0, 0.8)"; // Red shine
            ctx.shadowBlur = 60; // Shine effect
        } else {
            // Regular text for other hit types (like Perfect, Miss, etc.)
            ctx.fillStyle = `rgba(255, 255, 255, ${hitTypeOpacity})`;
            ctx.shadowColor = "transparent"; // No shadow for non-Insane hits
        }

        ctx.fillText(`${hitType}`, WIDTH / 2, HEIGHT / 2 - 40);
    }

    // Reset shadow properties after the text
    ctx.shadowColor = "transparent"; // Reset shadow

    // Reset fill style after transparency effect
    ctx.fillStyle = "white";

    // Handle recording text
    if (recording) {
        ctx.textAlign = "center";
        ctx.fillStyle = "red";
        ctx.font = "30px Poppins";
        ctx.fillText("Recording Notes", WIDTH / 2, 50);
    }

    // Show last recorded notes
    if (lastRecordedNotes.length > 0 && recording) {
        ctx.fillStyle = "yellow";
        ctx.font = "15px Poppins";
        ctx.textAlign = "right";
        const reversedNotes = [...lastRecordedNotes].reverse();
        reversedNotes.forEach((note, index) => {
            ctx.fillText(note, WIDTH - 10, 15 + index * 20);
        });
    }
}

function showHitType() {
    hitTypeOpacity = 1; // Reset opacity to full

    // Clear any existing timeouts and intervals
    if (hitTypeTimeout) {
        clearTimeout(hitTypeTimeout); // Clear any existing timeout
    }
    if (hitTypeFadeInterval) {
        clearInterval(hitTypeFadeInterval); // Clear any existing interval
    }

    // Start the 1-second delay before fading out
    hitTypeTimeout = setTimeout(() => {
        // Fade-out over 0.75 seconds (750ms)
        let fadeDuration = 300; // 0.75 seconds
        let fadeSteps = 30; // Number of frames for smooth fading
        let fadeAmount = 1 / fadeSteps;

        hitTypeFadeInterval = setInterval(() => {
            hitTypeOpacity -= fadeAmount;
            if (hitTypeOpacity <= 0) {
                hitTypeOpacity = 0;
                hitType = null; // Clear text after fade
                clearInterval(hitTypeFadeInterval); // Stop fade interval
            }
        }, fadeDuration / fadeSteps); // Update opacity every frame
    }, 600); // Wait 1 second before starting fade-out
}

function handleFadedNotes() {
    // Loop through all notes to apply the fading process
    notes.forEach((note) => {
        // Check if the note is already faded, has opacity <= 0.3, or its scale is already less than 1
        if (note.opacity <= 0.3 || note.scale < 0.8) {
            return; // Skip this note and do nothing if it's already faded, opacity is low, or scale is less than 1
        }

        // Check if the note has been marked as faded and its opacity is still greater than 0
        if (note.faded && note.opacity > 0) {
            // Start fading immediately without waiting for 0.5 seconds
            let fadeDuration = 250; // 0.5 seconds fade duration
            let fadeSteps = 30; // Smooth fading in steps
            let fadeAmount = 1 / fadeSteps;

            note.opacity = 0.5;

            // Intervals to reduce opacity over time
            let fadeInterval = setInterval(() => {
                // Reduce opacity of the note gradually
                note.opacity -= fadeAmount;
                note.scale -= fadeAmount * 0.7;

                // If the note has fully faded out, remove it from the array
                if (note.opacity <= 0.3) {
                    note.opacity = 0.3;
                    clearInterval(fadeInterval); // Stop fading the note
                }
            }, fadeDuration / fadeSteps); // Update opacity every frame
        }
    });
}

function startRecording() {
    recording = true;
    console.log("Recording started.");
    recordedNotes = [];
    lastRecordedNotes = [];
    noteMode = 8;

    resetGame(); // Reset game before recording

    requestAnimationFrame(() => {
        starttimestamp = Date.now();
        noteYpos = HEIGHT / 2 - 300;

        var startRecordButton = document.getElementById("recordButton");
        var stopRecordButton = document.getElementById("stopRecordingButton");

        startRecordButton.style.display = "none";
        stopRecordButton.style.display = "inline-block";
    });
}

// Function to stop recording and save notes
function stopRecording() {
    recording = false;
    console.log("Recording stopped.");

    // Save recorded notes to localStorage
    if (recordedNotes.length > 0) {
        localStorage.removeItem("recordedNotes"); // Clear saved notes in localStorage
        localStorage.setItem("recordedNotes", JSON.stringify({ notes: recordedNotes }));
        customNotes = { notes: [] };
        customNotes = recordedNotes;

        console.log("Saved notes:", recordedNotes);
        console.log(customNotes);
    } else console.log("No notes were recorded.");

    noteYpos = 500;

    var startRecordButton = document.getElementById("recordButton");
    var stopRecordButton = document.getElementById("stopRecordingButton");

    // Show start button, hide stop button
    startRecordButton.style.display = "inline-block";
    stopRecordButton.style.display = "none";
}

// Helper function to capitalize the first letter of a string
function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function decodeBeatzFile(content) {
    const sections = content.split("\\"); // Split by backslashes

    let song = "";
    let charter = "";
    let decodedNoteMode = 0;
    let decodedBPM = 0;
    let decodedNoteSpeed = 0;
    let decodedNoteSpawnY = 0;
    let notesLine = "";

    sections.forEach((section) => {
        if (section.startsWith("Song:")) {
            song = section.replace("Song:", "").trim();
        } else if (section.startsWith("Charter:")) {
            charter = section.replace("Charter:", "").trim();
        } else if (section.startsWith("noteMode:")) {
            decodedNoteMode = parseInt(section.replace("noteMode:", "").trim(), 10);
        } else if (section.startsWith("BPM:")) {
            decodedBPM = parseInt(section.replace("BPM:", "").trim(), 10);
        } else if (section.startsWith("noteSpeed:")) {
            decodedNoteSpeed = parseFloat(section.replace("noteSpeed:", "").trim(), 10);
        } else if (section.startsWith("noteSpawnY:")) {
            decodedNoteSpawnY = parseInt(section.replace("noteSpawnY:", "").trim(), 10);
        } else if (section.startsWith("Notes:")) {
            notesLine = section.replace("Notes:", "").trim();
        }
    });

    let notesFromFile = [];

    if (notesLine.includes("/")) {
        notesFromFile = notesLine
            .split(",")
            .map((noteStr) => {
                // Updated regex to handle normal notes and effect notes
                const match = noteStr.match(/((?:S)?[LRUD]{1,2}|E)\/(\d+)(?:!([^!]+))?/);

                if (!match) return null;

                console.log("Notes match the pattern.", match, noteStr);

                const [_, typeChar, timestampStr, propertiesStr] = match;
                let noteObj = {
                    type: typeChar === "E" ? "Effect" : capitalizeFirstLetter(reverseNoteTypeMap[typeChar]),
                    timestamp: parseInt(timestampStr, 10),
                    newBPM: undefined,
                    newSpeed: undefined,
                    newSpawnY: undefined,
                    FSinc: undefined,
                    smallFSinc: undefined,
                    bpmPulseInc: undefined
                };

                if (propertiesStr) {
                    // Split properties into key-value pairs and apply them
                    propertiesStr.split(";").forEach((prop) => {
                        const [key, value] = prop.split("=");

                        if (key && value !== undefined) {
                            const cleanKey = key.replace(/^!/, "");
                            noteObj[cleanKey] = isNaN(value) ? value : parseFloat(value);
                        }
                    });
                }

                return noteObj;
            })
            .filter((note) => note !== null); // Filter out null values for malformed notes
    }

    return {
        song,
        charter,
        decodedNoteMode,
        decodedBPM,
        decodedNoteSpeed,
        decodedNoteSpawnY,
        decodedNotes: notesFromFile
    };
}

async function importBeatzFile(event) {
    const file = event.target.files[0];
    if (!file || !file.name.endsWith(".beatz")) {
        alert("Please select a valid .beatz file.");
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target.result;
        const { song, charter, decodedNotes, decodedNoteMode, decodedBPM, decodedNoteSpeed, decodedNoteSpawnY } = decodeBeatzFile(content);

        customNotes = decodedNotes;
        noteMode = decodedNoteMode;
        BPM = decodedBPM;
        noteSpeed = decodedNoteSpeed;
        noteSpawnY = decodedNoteSpawnY;

        localStorage.setItem(
            "recordedBeatzFileData",
            JSON.stringify({
                song,
                charter,
                fileNoteMode: noteMode,
                fileBPM: decodedBPM,
                fileNoteSpeed: decodedNoteSpeed,
                fileNoteSpawnY: decodedNoteSpawnY,
                fileNotes: customNotes
            })
        );

        // Find the song in "Resources/Songs" and set it to currentSong.src
        const songPath = `Resources/Songs/${song}.mp3`;
        const songFile = new Audio(songPath);
        if (songFile.canPlayType) {
            currentSong.src = songPath; // Set the source of the current song
        } else {
            throw new Error(`Song "${song}" not found in "Resources/Songs".`);
        }

        localStorage.setItem("recordedNotes", JSON.stringify({ notes: customNotes }));

        console.log("Imported Song:", song);
        console.log("Charter:", charter);
        console.log("Note Mode:", decodedNoteMode);
        console.log("Decoded Notes:", decodedNotes);
        console.log("BPM:", decodedBPM);
        console.log("Note Speed:", decodedNoteSpeed);
        console.log("Note Spawn Y:", decodedNoteSpawnY);

        alert("Notes imported successfully.");
    };

    reader.readAsText(file);
}

// Prompt the user for import choice and then call the appropriate function
document.getElementById("importButton").addEventListener("click", () => {
    const importChoice = prompt("How would you like to import the notes? Type 'clip' to import from clipboard, or 'file' to import from a .beatz file.");

    if (importChoice === "clip") {
        importNotes();
    } else if (importChoice === "file") {
        document.getElementById("fileInput").click(); // Opens file picker
    } else {
        alert("Invalid choice. Please type 'clipboard' or 'file'.");
    }
});

document.getElementById("fileInput").addEventListener("change", importBeatzFile);

// Function to handle exporting notes
document.getElementById("encodeButton").addEventListener("click", () => {
    const exportChoice = prompt("How would you like to export the notes? Type 'clip' to export to clipboard, or 'file' to export to a .beatz file.");

    if (exportChoice === "clip") {
        copyNotesToClipboard(); // Call your existing function to export to clipboard
    } else if (exportChoice === "file") {
        exportNotesToFile(); // Call the new function to export to a file
    } else {
        alert("Invalid choice. Please type 'clip' or 'file'.");
    }
});

// Function to export notes to a file
function exportNotesToFile() {
    const savedNotes = localStorage.getItem("recordedNotes");
    if (!savedNotes) {
        window.alert("No custom notes found in localStorage. Record some!");
        return;
    }

    const notes = JSON.parse(savedNotes);
    const encodedNotes = encodeNotes(notes.notes || notes); // Encode only the note array part

    // Determine the noteMode based on the types of notes
    let userNoteMode = 4; // Default value
    const noteTypes = encodedNotes.split(","); // Assuming encodedNotes are comma-separated

    // Check if any of the notes contain DL, DR, UL, or UR
    noteTypes.forEach((note) => {
        if (note.includes("DL") || note.includes("DR")) {
            userNoteMode = 6;
        } else if (note.includes("UL") || note.includes("UR")) {
            userNoteMode = 8;
        }
    });

    const username = prompt("Type username:");
    const songName = currentSong.path;
    const userBPM = BPM;
    const userNoteSpeed = prompt("Type Note Speed:");
    const userNoteSpawnY = prompt("Type Spawn of Notes (Y position):");

    // Format the content in the required structure
    const content = `Song: ${songName}\\Charter: ${username}\\noteMode: ${userNoteMode}\\BPM: ${userBPM}\\noteSpeed: ${userNoteSpeed}\\noteSpawnY: ${userNoteSpawnY}\\Notes:${encodedNotes}`;

    // Create a Blob with the content
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });

    // Create a temporary link to trigger the download
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${songName}-${username}.beatz`; // Set the download filename
    link.click(); // Trigger the download

    alert(`Notes exported to ${songName}-${username}.beatz successfully.`);
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

// Decode the compact format back into an array of notes
function decodeNotes(encodedNotes) {
    const decodedNotes = encodedNotes.split(",").map((noteStr) => {
        const [typeChar, timestampStr] = noteStr.split("/");
        return {
            type: capitalizeFirstLetter(reverseNoteTypeMap[typeChar]),
            timestamp: parseInt(timestampStr)
        };
    });

    return { notes: decodedNotes };
}

async function importNotes() {
    try {
        const clipboardText = await navigator.clipboard.readText();

        if (isValidJSONArray(clipboardText)) {
            // If it's valid JSON and an array, treat it as a regular notes array
            const notes = JSON.parse(clipboardText);

            if (Array.isArray(notes) && notes.length > 0 && notes[0].notes) {
                // Handle the specific array of objects format with "notes" property
                customNotes = notes[0].notes; // Load the "notes" array
            } else if (Array.isArray(notes)) {
                // Directly load the notes if it's an array
                customNotes = notes.notes || notes; // Load the notes
            } else {
                throw new Error("Invalid JSON structure: Expected an array or an object with a 'notes' property.");
            }

            localStorage.setItem("recordedNotes", JSON.stringify({ notes: customNotes }));
            console.log("Imported notes (array format):", customNotes);

            // Show confirmation popup
            window.alert("Imported notes successfully.");
        } else if (clipboardText.includes("{") && clipboardText.includes("notes")) {
            // Handle object with a "notes" property
            const notesObject = JSON.parse(clipboardText);

            if (notesObject.notes && Array.isArray(notesObject.notes)) {
                customNotes = notesObject.notes; // Load the "notes" array

                localStorage.setItem("recordedNotes", JSON.stringify({ notes: customNotes }));
                console.log("Imported notes (object with 'notes' property):", customNotes);

                // Show confirmation popup
                window.alert("Imported notes successfully.");
            } else {
                throw new Error("Invalid JSON structure: 'notes' property must be an array.");
            }
        } else if (clipboardText.includes("/")) {
            // Treat it as an encoded notes string
            const decoded = decodeNotes(clipboardText);
            customNotes = decoded.notes;
            localStorage.setItem("recordedNotes", JSON.stringify({ notes: decoded.notes }));
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
        window.alert("Failed to read clipboard data.", err);
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

    navigator.clipboard
        .writeText(`${encodedNotes}`)
        .then(() => {
            console.log("Copied encoded notes to clipboard in encoded format:", encodedNotes);
            window.alert("Saved notes to clipboard succesfully.");
        })
        .catch((err) => {
            console.error("Failed to copy notes to clipboard:", err);
            window.alert("Failed to copy notes to clipboard.", err);
        });
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

// Function to determine the swipe side
function getSwipeSide(noteType) {
    let cutSide = noteType.replace(/^Swipe/, ""); // Remove "Swipe" prefix

    for (const side in swipeSideMap) {
        if (swipeSideMap[side].includes(cutSide)) {
            return side;
        }
    }
    return null; // If not found
}

// Helper function to get the appropriate keybind for a swipe note
function getKeybindForSwipe(noteType) {
    const swipeSide = getSwipeSide(noteType);
    if (!swipeSide) return null;

    return swipeSide === "left" ? "KeyC" : "Comma"; // "C" for left swipes, "Comma" for right swipes
}

// Swipe side categorization
const swipeSideMap = {
    left: ["Upleft", "Downleft", "Left", "Up"],
    right: ["Down", "Right", "Upright", "Downright"]
};

const keysPressed = {}; // Track which keys are currently held down

function calculatePoints(distanceFromCenter) {
    const scoreDivisor = getScoreDivisor();
    const noteCount = customNotes.length > 0 ? customNotes.length : numberOfNotes; // Use numberOfNotes if customNotes is empty
    const basePoints = scoreDivisor / noteCount;

    if (distanceFromCenter <= perfectRange) {
        // Perfect or Insane hit → full points
        return basePoints;
    } else {
        // Early/Late → scaled points
        const maxMissableDistance = targetYPositionEnd - targetYPositionStart;
        const normalizedDistance = Math.min(distanceFromCenter - perfectRange, maxMissableDistance - perfectRange);
        const maxOffset = maxMissableDistance - perfectRange;

        const scaledPoints = basePoints * 0.5 - (normalizedDistance / maxOffset) * basePoints * 0.4;
        return Math.max(scaledPoints, basePoints * 0.1); // Minimum 10% points
    }
}

function getScoreDivisor() {
    const noteCount = customNotes.length;
    if (noteCount >= 5400) return 1000000;
    if (noteCount >= 4000) return 750000;
    if (noteCount >= 2750) return 500000;
    if (noteCount >= 1750) return 5000000;
    if (noteCount >= 1100) return 100000;
    if (noteCount >= 800) return 75000;
    return 50000;
}

let lastHitDistance; // Distance from perfect center (Y=500)

// Updated keypress logic
document.addEventListener("keydown", (event) => {
    keysPressed[event.code] = true; // Store the event.code instead of event.key

    // Detect Ctrl + Shift + Enter for recording only
    if (keysPressed["ControlLeft"] && keysPressed["ShiftLeft"] && event.code === "Enter") {
        if (recording) stopRecording();
        else startRecording();
        return; // Prevents `startGame()` from being called
    }

    // If game is not started and Enter is pressed (without Ctrl + Shift), start the game
    if (!gameStarted && event.code === "Enter") {
        startGame();
        backgroundOverlay.style.backgroundImage = 'url("Resources/defaultBG.png")';
    }

    let key = event.code; // Use event.code to differentiate keys

    if (!keyBindings[key]) {
        console.warn(`Key ${key} not found in keyBindings.`);
    }

    const noteType = keyBindings[key];

    if (noteType) {
        switch (noteType) {
            case "AutoHit":
                toggleAutoHit();
                break;
            case "Fullscreen":
                toggleFullscreen();
                break;
            case "Restart":
                resetGame();
                break;
            default:
                break;
        }
    }

    if (gameStarted && noteType && !keyHeldDown[noteType]) {
        // Check if the note is a swipe note and enforce swipe keybinds
        if (noteType.startsWith("Swipe")) {
            const expectedKeybind = getKeybindForSwipe(noteType);
            console.warn(`Key for ${noteType}. Expected: ${expectedKeybind}, but got: ${key}`);

            if (expectedKeybind !== key) {
                console.error(`Incorrect key for ${noteType}. Expected: ${expectedKeybind}, but got: ${key}`);
                return; // Prevent hitting the note with the wrong keybind
            }
        }

        if (recording) {
            const timestamp = Date.now() - starttimestamp;
            recordedNotes.push({
                type: noteType,
                timestamp: timestamp - 1080
            });
            lastRecordedNotes.push(`Recorded: ${noteType}, at ${timestamp}ms`);
            if (lastRecordedNotes.length > 36) {
                lastRecordedNotes.shift(); // Keep only the last 10 entries
            }
            notes.push({
                type: `RecNote${noteType}`,
                y: HEIGHT / 2 - 300,
                x: noteXPositions[noteType],
                faded: false,
                opacity: 1,
                scale: 1
            });
            console.log(`Recorded note: ${noteType} at ${timestamp}ms`);
        }

        highlightedNotes[noteType] = true;

        const sizeIncrease = currentNoteStyleIndex === 9 || currentStaticStyleIndex === 9 ? 5 : 10;

        switch (noteType) {
            case "Upleft":
                upLeftNoteSize += sizeIncrease;
                break;
            case "Downleft":
                downLeftNoteSize += sizeIncrease;
                break;
            case "Left":
                leftNoteSize += sizeIncrease;
                break;
            case "Up":
                upNoteSize += sizeIncrease;
                break;
            case "Down":
                downNoteSize += sizeIncrease;
                break;
            case "Right":
                rightNoteSize += sizeIncrease;
                break;
            case "Downright":
                downRightNoteSize += sizeIncrease;
                break;
            case "Upright":
                upRightNoteSize += sizeIncrease;
                break;
            default:
                console.log("No note type found");
        }

        for (let i = 0; i < notes.length; i++) {
            if (notes[i].type === noteType && !notes[i].type.startsWith("rec") && !notes[i].faded) {
                const noteY = notes[i].y;
                const savedtimestamp = notes[i].timestamp;

                if (noteY >= targetYPositionStart && noteY <= targetYPositionEnd) {
                    const distanceFromCenter = Math.abs(noteY - targetYPosition); // Compare to targetYPosition (500)

                    if (distanceFromCenter <= exactRange) {
                        // ✅ EXACT hit (Check first so it doesn't get counted as PERFECT or INSANE)
                        hitType = "EXACT";
                        hitTypeID = -1;
                        exactHits++; // Count exact hits properly
                        hitArray.exact.push({ type: notes[i].type, timestamp: savedtimestamp });
                    } else if (distanceFromCenter <= absolutePerfectRange) {
                        // 🎯 INSANE hit
                        hitType = "INSANE";
                        hitTypeID = 0;
                        insanes++;
                        hitArray.insane.push({ type: notes[i].type, timestamp: savedtimestamp });
                    } else if (distanceFromCenter <= perfectRange) {
                        // 🌟 PERFECT hit
                        hitType = "Perfect!";
                        hitTypeID = 1;
                        perfects++;
                        hitArray.hitPerfect.push({ type: notes[i].type, timestamp: savedtimestamp });
                    } else {
                        // ⏳ EARLY / LATE hits
                        hitType = noteY < targetYPosition ? "Early" : "Late";
                        hitTypeID = noteY < targetYPosition ? "3" : "2";

                        const earnedPoints = calculatePoints(distanceFromCenter);
                        points += earnedPoints;
                        console.log(`Points earned: ${earnedPoints.toFixed(2)} (${hitType})`);

                        if (hitType === "Early") {
                            earlys++;
                            hitArray.hitEarly.push({ type: notes[i].type, timestamp: savedtimestamp });
                        } else {
                            lates++;
                            hitArray.hitLate.push({ type: notes[i].type, timestamp: savedtimestamp });
                        }

                        // 🔻 Fade instead of removing it immediately
                        notes[i].faded = true;
                        handleFadedNotes();
                    }

                    // ✅ Calculate points after detecting hit type
                    const earnedPoints = calculatePoints(distanceFromCenter);
                    points += earnedPoints;
                    console.log(`Points earned: ${earnedPoints.toFixed(2)} (${hitType})`);

                    // ✅ Remove the note immediately for exact/insane/perfect hits
                    if (hitType === "EXACT" || hitType === "INSANE" || hitType === "Perfect!") {
                        notes.splice(i, 1);
                    }

                    showHitType(hitType);
                    lastHitDistance = noteY - targetYPosition; // Use exact center
                    updateAccuracy(lastHitDistance);

                    updateNoteProgress();
                    onNoteHit();

                    streak++;
                    if (pulseToHits) {
                        fontSize += 6;
                        smallFontSize += 3;
                        hitPulseFontSize += 5;
                    }
                    if (streak > maxStreak) {
                        maxStreak = streak;
                    }

                    break; // Stop checking after hitting one note
                }
            }
        }
    }
});

document.addEventListener("keyup", (event) => {
    const noteType = keyBindings[event.code];
    if (noteType) {
        highlightedNotes[noteType] = false;
    }
    delete keysPressed[event.code]; // Remove key from tracking
});

// Function to play a sound
function playSoundEffect(audioPath, vol) {
    const audio = new Audio(audioPath);
    audio.volume = vol;
    audio.play().catch((error) => {
        console.error("Audio playback failed:", error);
    });
}

let displayedLineX = WIDTH / 2; // Start in the middle
let targetLineX = WIDTH / 2; // Target position for animation
let previousHits = []; // Store previous hits
let lastDistanceFromCenter = null; // Track last received distance
const maxOpacity = 1.0;
const fadedOpacity = 0.1;
var maxBars = 20;

setInterval(() => {
    if (previousHits[0]) previousHits.shift();
}, 500);

function drawAccuracyBar(distanceFromCenter, deltaTime) {
    const barX = WIDTH / 2 - 150; // Centered bar
    const barY = 600;
    const barWidth = 300;
    const barHeight = 15;

    // Create gradient from left (red) to center (green) to right (red)
    const gradient = ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
    gradient.addColorStop(0, "red");
    gradient.addColorStop(0.175, "#ff7300");
    gradient.addColorStop(0.3, "#ffee00");
    gradient.addColorStop(0.5, "#00FF00");
    gradient.addColorStop(0.7, "#ffee00");
    gradient.addColorStop(0.825, "#ff7300");
    gradient.addColorStop(1, "red");

    // Draw accuracy bar
    ctx.fillStyle = gradient;
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Store previous hit position only when distance changes
    if (distanceFromCenter !== lastDistanceFromCenter) {
        previousHits.push(displayedLineX);
        lastDistanceFromCenter = distanceFromCenter;
    }

    // Limit the number of stored hits
    if (previousHits.length > maxBars) {
        previousHits.shift();
    }

    // Clamp target position within the bar
    targetLineX = Math.max(barX, Math.min(barX + barWidth / 2 + distanceFromCenter, barX + barWidth));

    // Smoothly animate the latest hit marker
    const divisor = distanceFromCenter > 3 ? 8 : 6;

    const speed = (barWidth / 100) * (deltaTime / divisor);
    if (displayedLineX < targetLineX) {
        displayedLineX = Math.min(displayedLineX + speed, targetLineX);
    } else if (displayedLineX > targetLineX) {
        displayedLineX = Math.max(displayedLineX - speed, targetLineX);
    }

    // Draw previous hits with faded opacity
    ctx.strokeStyle = "rgba(255, 255, 255, " + fadedOpacity + ")";
    ctx.lineWidth = 5;
    previousHits.forEach((hitX) => {
        ctx.beginPath();
        ctx.moveTo(hitX, barY - 10);
        ctx.lineTo(hitX, barY + barHeight + 10);
        ctx.stroke();
    });

    // Draw the most recent moving hit with full opacity
    ctx.strokeStyle = "rgba(255, 255, 255, " + maxOpacity + ")";
    ctx.beginPath();
    ctx.moveTo(displayedLineX, barY - 10);
    ctx.lineTo(displayedLineX, barY + barHeight + 10);
    ctx.stroke();
}

function updateAccuracy(distanceFromCenter) {
    const totalHits = insanes + perfects + lates + earlys + misses;

    if (totalHits > 0) {
        let accuracyPoints = 0;

        if (distanceFromCenter <= absolutePerfectRange) {
            accuracyPoints = 1; // Absolute perfect hit
        } else if (distanceFromCenter >= perfectRange) {
            accuracyPoints = 1 - (distanceFromCenter - absolutePerfectRange) / (perfectRange - absolutePerfectRange);
        }

        // Weighted hits calculation with different weights for insane and perfect hits
        const weightedHits = insanes + perfects + lates * accuracyPoints + earlys * accuracyPoints;
        accuracy = (weightedHits / totalHits) * 100;
    } else {
        accuracy = 100;
    }
}

function updateNoteProgress() {
    const totalNotes = customNotes.length > 0 ? customNotes.length : numberOfNotes;
    const totalHits = insanes + perfects + earlys + lates;

    if (totalHits > 0) {
        noteProgress = (totalHits / totalNotes) * 100;
    } else {
        noteProgress = 0;
    }
}

let lastMissed = false; // Flag to track if the last note was missed

function updateNotes(deltaTime) {
    const adjustedNoteSpeed = noteSpeed * (deltaTime / 6); // Adjust note speed based on deltaTime

    for (let i = 0; i < notes.length; i++) {
        const note = notes[i];
        note.y += adjustedNoteSpeed;
        const noteType = notes[i].type;
        const savedtimestamp = notes[i].timestamp;

        // Check if the note is off the screen
        if (note.y > HEIGHT + noteSize) {
            if (!noteType.startsWith("Rec") && noteType !== "beatLine" && !note.faded) {
                // Only call showHitType if the last note wasn't missed
                hitArray.missed.push({ type: noteType, timestamp: savedtimestamp });
                streak = 0;
                hitType = "Miss";
                misses++;
                updateAccuracy(); // Update accuracy when a note is missed

                if (!lastMissed) {
                    showHitType(); // Call the function to display the missed hit type
                    lastMissed = true; // Mark that a note was missed
                }

                notes.splice(i, 1); // Remove the missed note
                i--; // Adjust index after removing the note
            } else {
                notes.splice(i, 1);
                i--;
            }
        }
    }

    // Auto-hit logic for holding notes (optional)
    if (autoHitEnabled) {
        notes.forEach((note) => {
            if (note.type == "beatLine" || note.type.includes("Rec")) return;

            if (note.y > 498 && !note.faded) {
                // realistic Math.random() * (565 - 465) + 465
                simulateKeyPress(note.type); // Only auto-hit non-faded notes
            }
        });
    }
}

// Simulate key press for a note type
function simulateKeyPress(noteType) {
    const keyCode = Object.keys(keyBindings).find((code) => keyBindings[code] === noteType);

    if (keyCode) {
        // Trigger keydown event with correct event.code
        document.dispatchEvent(new KeyboardEvent("keydown", { code: keyCode }));

        setTimeout(
            () => {
                // Trigger keyup event after a short delay
                document.dispatchEvent(new KeyboardEvent("keyup", { code: keyCode }));
            },
            Math.random() * (125 - 50) + 50
        );
    } else {
        console.warn(`No keybinding found for noteType: ${noteType}`);
    }
}

// Reset lastMissed flag if a note was hit
// This function is called when a note is hit (after the above logic)
function onNoteHit() {
    lastMissed = false; // Reset missed flag
}

function formatTimeWithDecimal(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const fractionalSeconds = (seconds % 1).toFixed(2).substring(2); // Get two decimal places for fractional seconds
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`; // Formats time as mm:ss.xx
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`; // Formats time as mm:ss
}

// Start the game
function startGame() {
    gameStarted = true;
    console.log("Game started.");
    currentSong.play();
    notes = [];
    starttime = Date.now();
    generateNotes();

    previousHits = [];

    lastTime = performance.now(); // ✅ Properly reset lastTime
    requestAnimationFrame(gameLoop);

    if (pulseToBPM) {
        if (currentSong.src.includes("Space%20Invaders.mp3")) {
            setTimeout(() => {
                console.log("pulse started with a 692 delay");

                newBpmPulseInterval(BPM);
            }, 692);
        } else if (currentSong.src.includes("Endgame.mp3")) {
            setTimeout(() => {
                console.log("pulse started with a 300 delay");

                newBpmPulseInterval(BPM);
            }, 300);
        } else {
            console.log("pulse started with no delay");
            newBpmPulseInterval(BPM);
        }
    }
}

function newBpmPulseInterval(newBpm, fontSizeIncrease = 0, smallFSincrease = 0, bmpPulseFSincrease = 0) {
    fontSize += 6 + fontSizeIncrease; // Increase by 6
    smallFontSize += 3 + smallFSincrease;
    bpmPulseFontSize += 5 + bmpPulseFSincrease;

    backgroundOverlay.style.transition = `none`;
    backgroundOverlay.style.transform = `scale(1.0${1 + fontSizeIncrease})`;

    setTimeout(() => {
        backgroundOverlay.style.transition = `transform ${beattime / 4}ms ease-out`;
        backgroundOverlay.style.transform = "scale(1)";
    }, beattime * 0.15);

    // Check if BPM pulse should stop
    if (pulseBPMinterval) {
        clearInterval(pulseBPMinterval);
        pulseBPMinterval = null; // Prevent repeated calls
    }

    BPM = newBpm;
    beattime = (60 / newBpm) * 1000;

    pulseBPMinterval = setInterval(() => {
        fontSize += 6 + fontSizeIncrease; // Increase by 6
        smallFontSize += 3 + smallFSincrease;
        bpmPulseFontSize += 5 + bmpPulseFSincrease;
        // Scale the background overlay up by 0.5%
        backgroundOverlay.style.transition = `none`;
        backgroundOverlay.style.transform = "scale(1.01)";

        setTimeout(() => {
            backgroundOverlay.style.transition = `transform ${beattime / 2}ms ease-out`;
            backgroundOverlay.style.transform = "scale(1)";
        }, beattime * 0.15);

        // Generate beatLine every beat time
        setTimeout(() => {
            notes.push({
                type: "beatLine",
                y: -noteSpawnY,
                x: WIDTH / 2 // Centered
            });
        }, 320);
    }, beattime);

    console.log("Applied new BPM pulse with increases:", fontSizeIncrease, smallFSincrease, bmpPulseFSincrease, pulseBPMinterval);
}

// Reset the game
function resetGame() {
    gameStarted = false;
    console.log("Game reset.");
    if (currentSong) currentSong.pause();
    currentSong.currentTime = 0;
    notes = [];
    points = 0;
    streak = 0;
    maxStreak = 0;
    insanes = 0;
    perfects = 0;
    earlys = 0;
    lates = 0;
    misses = 0;
    accuracy = 100;
    lastHitDistance = 0;

    // Check if BPM pulse should stop
    if (pulseBPMinterval) {
        clearInterval(pulseBPMinterval);
        pulseBPMinterval = null; // Prevent repeated calls
    }

    if (noteGenerationIntervalRef) {
        clearInterval(noteGenerationIntervalRef);
        noteGenerationIntervalRef = null;
    }

    if (recordedNoteGenTimeouts.length > 0) {
        recordedNoteGenTimeouts.forEach((timeout) => clearTimeout(timeout));
        recordedNoteGenTimeouts = [];
    }

    requestAnimationFrame(() => startGame());
}

let lastTime = performance.now();
let frameCount = 0;
let fps = 0;
let globalDelta;
let fpsLastUpdate = performance.now();

// Game loop
function gameLoop(currentTime) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const deltaTime = Math.max(currentTime - lastTime, 0.0001); // Prevents zero deltaTime
    lastTime = currentTime;

    globalDelta = deltaTime;

    // Calculate FPS every frame
    fps = 1000 / deltaTime;
    frameCount++;

    if (gameStarted) {
        updateNotes(deltaTime);
        drawNotes();
        requestAnimationFrame(gameLoop);
    }

    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.font = "15px Poppins";
    ctx.fillText(`FPS: ${fps.toFixed(2)} | Frame count: ${frameCount}`, WIDTH / 2, HEIGHT - 50);
    ctx.fillText(`Delta: ${deltaTime.toFixed(2)} | Timestamp: ${lastTime.toFixed(2)}`, WIDTH / 2, HEIGHT - 70);

    ctx.textAlign = "left";
    ctx.fillStyle = "white";
    ctx.font = "15px Poppins";
    ctx.fillText(`Visible notes: ${notes.length}`, 10, HEIGHT - 10);
    ctx.fillText(`Notes hit: ${insanes + perfects + earlys + lates}`, 10, HEIGHT - 30);
    ctx.fillText(`Total notes: ${customNotes.length || numberOfNotes}`, 10, HEIGHT - 50);

    // Filter out "beatLine" notes before iterating
    const filteredNotes = notes.filter((note) => note.type !== "beatLine");

    filteredNotes.forEach((note, index) => {
        if (index < 19) {
            ctx.fillText(`Note ${index + 1}:`, 10, HEIGHT / 2 - 70 + index * 20);
            ctx.fillText(`${note.type}`, 70, HEIGHT / 2 - 70 + index * 20);

            // Check if note type is diagonal
            const diagonalNotes = ["Upleft", "Downleft", "Upright", "Downright", "RecNoteUpleft", "RecNoteDownleft", "RecNoteUpright", "RecNoteDownright"];
            let yTextXPos = recording ? 180 : 120; // Default positions
            if (recording && diagonalNotes.includes(note.type)) {
                yTextXPos += 25; // Move further for diagonal notes
            }

            ctx.fillText(`Y = ${note.y.toFixed(3)}`, yTextXPos, HEIGHT / 2 - 70 + index * 20);
        } else if (index === 19) {
            ctx.fillText(`... (${filteredNotes.length - 19})`, recording ? 270 : 210, HEIGHT / 2 - 70 + (index - 1) * 20); // Add triple dots if more than 19
        }
    });

    // Font size pulsing logic with deltaTime scaling
    if (pulseToBPM || pulseToHits) {
        const targetFontSizeChange = 0.4;
        const targetSmallFontSizeChange = 0.5;
        const targetNoteSizeChange = 0.3;
        const scaleFactor = deltaTime / (1000 / 165); // Normalize for 165Hz

        fontSize += (fontSize > 40 ? -1 : 1) * targetFontSizeChange * scaleFactor;
        bpmPulseFontSize += (bpmPulseFontSize > 40 ? -1 : 1) * targetFontSizeChange * scaleFactor;
        hitPulseFontSize += (hitPulseFontSize > 40 ? -1 : 1) * targetFontSizeChange * scaleFactor;
        smallFontSize += (smallFontSize > 30 ? -1 : 1) * targetSmallFontSizeChange * scaleFactor;

        // Note size adjustment logic
        const adjustNoteSize = (size) => {
            // If the note size is over 75, reset to 74
            if (size > 85) {
                return 84;
            }
            // If the note size is under 60, reset to 61
            if (size < 60) {
                return 61;
            }
            // Adjust size: decrease if over 68, increase if under 68
            if (size > 72) {
                return size - targetNoteSizeChange * scaleFactor;
            } else if (size < 72) {
                return size + targetNoteSizeChange * scaleFactor;
            }
            // If it is exactly 68, no change
            return size;
        };

        // Apply the size adjustments to all note types
        upLeftNoteSize = adjustNoteSize(upLeftNoteSize);
        downLeftNoteSize = adjustNoteSize(downLeftNoteSize);
        leftNoteSize = adjustNoteSize(leftNoteSize);
        upNoteSize = adjustNoteSize(upNoteSize);
        downNoteSize = adjustNoteSize(downNoteSize);
        rightNoteSize = adjustNoteSize(rightNoteSize);
        downRightNoteSize = adjustNoteSize(downRightNoteSize);
        upRightNoteSize = adjustNoteSize(upRightNoteSize);

        // Clamp font sizes
        fontSize = Math.max(12, Math.min(fontSize, 64));
        bpmPulseFontSize = Math.max(12, Math.min(bpmPulseFontSize, 64));
        hitPulseFontSize = Math.max(12, Math.min(hitPulseFontSize, 64));
        smallFontSize = Math.max(10, Math.min(smallFontSize, 35));
    }

    // Check if BPM pulse should stop
    if (!pulseToBPM && pulseBPMinterval) {
        clearInterval(pulseBPMinterval);
        pulseBPMinterval = null; // Prevent repeated calls
    }

    // Progress bar logic
    const currentSongTime = currentSong?.currentTime || 0;
    const duration = currentSong.duration || 1;
    const progressWidth = (WIDTH * currentSongTime) / duration;

    ctx.fillStyle = "red";

    if (!recording) {
        ctx.fillRect(0, 0, progressWidth, 5);
    } else {
        ctx.fillRect(0, HEIGHT - 5, progressWidth, 5);
    }

    // Display current time and duration
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `${bpmPulseFontSize - 15}px Poppins`;
    ctx.textAlign = "center";

    const formattedCurrentTime = formatTimeWithDecimal(currentSongTime);
    const formattedDuration = formatTime(duration);
    if (recording) ctx.fillText(`${formattedCurrentTime} / ${formattedDuration}`, WIDTH / 2, HEIGHT - 10);
    else ctx.fillText(`${formattedCurrentTime} / ${formattedDuration}`, WIDTH / 2, 30);

    if (!recording) drawAccuracyBar(lastHitDistance, deltaTime);
}

