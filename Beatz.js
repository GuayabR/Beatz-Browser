/**
 * Title: Beatz VI
 * Author: Victor//GuayabR
 * Date: 16/05/2024
 * Version: NOTES VI v6.0 test (release.version.subversion.bugfix)
 * GitHub Repository: https://github.com/GuayabR/Beatz
 **/

var notes = [];
var noteSpeed = 3.5; // Speed at which notes fall | S0.29/Y-500 | S2/Y-250 | S2.5/Y-110 | S3/Y50 | S3.5Y130 | S4Y255 | S4.5/Y354 | S5/Y467 | S5.5/Y540 | S6/Y610 | S6.5Y720 | S7/Y830 | S8/Y1010
let noteSpawnY = 0;
let hitType;
let hitTypeID = -2;
let BPM = 115; // Beats per minute
let beattime = (60 / BPM) * 1000;
let noteMode = 4;
let noteHitTimestamps = [];
let NPS = 0;
let punishment = "none";
let songCharter = "";

var pointsAvailable = parseInt(localStorage.getItem("pointsAvailable")) || 0;
var pointsGained = parseInt(localStorage.getItem("pointsGained")) || 0;

const noteTypes = ["Upleft", "Downleft", "Left", "Up", "Down", "Right", "Upright", "Downright"];

// Define fallback colors for each note type
const noteColors = {
    Upleft: "#FF69B4", // Pink
    Downleft: "#1E90FF", // Slightly Dark Blue
    Left: "#FF0000", // Red
    Up: "#00FF00", // Green
    Down: "#FFFF00", // Yellow
    Right: "#00FFFF", // Cyan
    Upright: "#FF0000", // Red
    Downright: "#7705fa" // Purple
};

var targetYPositionStart = 320; // New start of the hit zone
var targetYPositionEnd = 680; // End of the hit zone

// Early/Late and Perfect hit zones
const perfectRange = 50; // 35 pixels on either side for perfect hit
const absolutePerfectRange = 20; // 16 pixels on either side for an absolute perfect hit
const exactRange = 4; // 3 Pixels on either side for an exact hit
var targetYPosition = 500; // Y-position of stationary hit blocks

let points = 0;
let pointsRewarded = 0;
let streak = 0;
let misses = 0;
let exactHits = 0;
let insanes = 0;
let perfects = 0;
let earlys = 0;
let lates = 0;
let notesHit = 0;
let allTimeNotesHit = parseInt(localStorage.getItem("allTimeNotesHit")) || 0;
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

let pulseBPMinterval;

let pulseBGtoBPMinterval;

let fullscreen = false;

const canvas = document.getElementById("myCanvas");

const ctx = canvas.getContext("2d");

const canvas2 = document.getElementById("canvas2");

const ctx2 = canvas2.getContext("2d");

const canvas3 = document.getElementById("canvas3");

const ctx3 = canvas3.getContext("2d");

const backCanvas = document.getElementById("canvas-1");

const ctxBack = backCanvas.getContext("2d");

// Enable high-quality rendering
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = "high";

ctx.textRendering = "geometricPrecision";

let endScreenDrawn = false;

// Ensure scaling is crisp
canvas.style.imageRendering = "auto"; // Options: "crisp-edges", "pixelated", "auto"

const backgroundOverlay = document.getElementById("backgroundOverlay");

const canvasContainer = document.getElementById("canvasContainer");

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

function adjustCanvasForFullscreen() {
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;
    const canvases = document.querySelectorAll("#canvasContainer canvas");

    canvases.forEach((c) => {
        c.classList.add("fullscreenCanvas");

        // Only stretch if the viewport is larger than the default canvas size
        if (containerWidth >= 1280) {
            const aspectRatio = c.width / c.height;
            const containerAspectRatio = containerWidth / containerHeight;

            if (aspectRatio > containerAspectRatio) {
                c.style.width = "100%";
                c.style.height = "auto";
            } else {
                c.style.width = "auto";
                c.style.height = "100%";
            }
        } else {
            // Keep canvas at original size
            c.style.width = "1280px";
            c.style.height = "720px";
        }

        // Adjust z-index for layering
        c.style.zIndex = 1; // Ensure it stays above background overlay
    });

    // Adjust background overlay position and size for fullscreen
    backgroundOverlay.style.position = "absolute";
    backgroundOverlay.style.top = "0";
    backgroundOverlay.style.left = "0";
    backgroundOverlay.style.width = "100%";
    backgroundOverlay.style.height = "100%";
    backgroundOverlay.style.zIndex = "0"; // Stay behind canvas elements
}

function resetCanvasFromFullscreen() {
    const canvases = document.querySelectorAll("#canvasContainer canvas");

    canvases.forEach((c) => {
        c.classList.remove("fullscreenCanvas");
        c.style.width = "";
        c.style.height = "";
        c.style.position = "absolute";
        c.style.top = "50%";
        c.style.left = "50%";
        c.style.transform = "translate(-50%, -50%)";
        c.style.zIndex = 1; // Reset z-index to ensure it stays above background elements
    });

    // Reset background overlay if needed
    backgroundOverlay.style.position = "absolute";
    backgroundOverlay.style.top = "0";
    backgroundOverlay.style.left = "0";
    backgroundOverlay.style.width = "100%";
    backgroundOverlay.style.height = "100%";
    backgroundOverlay.style.zIndex = "0"; // Reset z-index for background overlay
}

// Update mappings for encoding and decoding note types with the new format
const noteTypeMap = {
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
    left: ["Digit3", "KeyA", "ArrowLeft", "KeyZ"],
    down: ["Digit4", "KeyS", "ArrowDown", "KeyX"],
    up: ["Digit9", "KeyK", "Semicolon", "ArrowUp", "KeyN"],
    right: ["Digit0", "KeyL", "Quote", "ArrowRight", "KeyM"],
    downright: ["Minus"],
    upright: ["Equal"],
    rightswipe: ["Comma"],
    pause: ["Escape"],
    autoHit: ["Backspace"],
    previous: ["KeyQ"],
    restart: ["KeyR"],
    next: ["KeyE"],
    randomize: ["KeyG"],
    randomizeChart: ["KeyT"],
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
const noteOrder = ["Upleft", "Downleft", "Left", "Down", "Up", "Right", "Downright", "Upright"];
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

    return baseType;
}

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

let currentNoteStyleIndex = 0;
let currentFallingStyleIndex = 0;
let currentPressStyleIndex = 0;
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

            // Apply values to the respective variables
            let { song, fileCharter, fileNoteMode, fileBPM, fileNoteSpeed, fileNoteSpawnY, fileNotes } = beatzData;

            // Apply to global variables
            customNotes = fileNotes; // Notes from saved data
            BPM = fileBPM; // BPM from saved data
            noteSpeed = fileNoteSpeed; // Note speed from saved data
            noteSpawnY = fileNoteSpawnY; // Note spawn Y from saved data
            noteMode = fileNoteMode;
            songCharter = fileCharter;

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

var isFileProtocol;

let noteGenerationIntervalRef = null; // for random note generation interval
let recordedNoteGenTimeouts = []; // Array to store setTimeout references

let noteCounter = 0;
var duration; // Get the song duration in milliseconds
var numberOfNotes; // Calculate the number of notes

function createPausableTimeout(callback, delay) {
    let start = performance.now();
    let remaining = delay;
    let timerId;
    let paused = false;

    const pause = () => {
        if (!paused) {
            clearTimeout(timerId);
            remaining -= performance.now() - start;
            paused = true;
        }
    };

    const resume = () => {
        if (paused) {
            start = performance.now();
            timerId = setTimeout(callback, remaining);
            paused = false;
        }
    };

    timerId = setTimeout(callback, delay);

    return {
        pause,
        resume,
        get timerId() {
            return timerId;
        }
    };
}

let gamePaused = false;
let gameLoopRef = null; // reference to requestAnimationFrame
let pausedBackgroundVideo = null;

let isCustomNotesActive = false; // Flag to track custom note generation

let pauseStartTime = 0; // Store the time when the game was paused

function pause() {
    if (!gameStarted || gamePaused) return;

    gamePaused = true;
    console.log("Game paused");

    // Store the start time of the pause
    pauseStartTime = Date.now();

    ctx3.fillStyle = "red";
    ctx3.font = "60px Poppins";
    ctx3.textAlign = "center";
    ctx3.fillText("Game Paused", WIDTH / 2, HEIGHT / 2);

    canvas3.style.backdropFilter = "blur(5px)";

    // Save current notes state with all attributes
    savedNotesOnPause = notes.map((note) => ({ ...note }));

    // Pause music
    if (currentSong && !currentSong.paused) {
        currentSong.pause();
        console.log("Music paused");
    }

    // Pause background video if playing
    const bgVideos = document.querySelectorAll("video");
    for (const video of bgVideos) {
        if (!video.paused) {
            video.pause();
            pausedBackgroundVideo = video;
            console.log("Background video paused");
            break;
        }
    }

    // Stop the game loop
    if (gameLoopRef !== null) {
        cancelAnimationFrame(gameLoopRef);
        gameLoopRef = null;
        console.log("Game loop paused");
    }

    if (volumePulseLoop !== null) {
        cancelAnimationFrame(volumePulseLoop);
        volumePulseLoop = null;
    }

    // Pause note generation
    pauseNoteGeneration();
}

function resume() {
    if (!gameStarted || !gamePaused) return;

    notes = []; // Reset the notes array
    console.log("Game resumed");

    gamePaused = false;

    canvas3.style.backdropFilter = "none";

    const resumeStart = Date.now();

    const countdownInterval = setInterval(() => {
        const timeLeft = Math.max(0, resumeDelay - (Date.now() - resumeStart));

        // Clear canvas3
        ctx3.clearRect(0, 0, canvas3.width, canvas3.height);

        // Draw countdown
        ctx3.fillStyle = "white";
        ctx3.font = "50px Poppins";
        ctx3.textAlign = "center";
        ctx3.fillText(`Resuming in ${(timeLeft / 1000).toFixed(1)} seconds`, WIDTH / 2, HEIGHT / 2);

        if (timeLeft <= 0) {
            clearInterval(countdownInterval);

            // Clear canvas3 after countdown
            ctx3.clearRect(0, 0, canvas3.width, canvas3.height);

            // Calculate how long the game was paused
            const pausedDuration = Date.now() - pauseStartTime;

            // Adjust lastTime by subtracting the paused duration
            lastTime += pausedDuration;

            // Restore notes state and reset saved notes
            notes = savedNotesOnPause.map((note) => ({ ...note }));
            savedNotesOnPause = [];

            // Resume music
            if (currentSong && currentSong.paused) {
                currentSong.play();
                console.log("Music resumed");
            }

            // Resume paused video
            if (pausedBackgroundVideo && pausedBackgroundVideo.paused) {
                pausedBackgroundVideo.play();
                pausedBackgroundVideo = null;
                console.log("Background video resumed");
            }

            // Resume game loop
            gameLoopRef = requestAnimationFrame(gameLoop);

            // Restart background visualizer
            if (pulseBGtoBPM) {
                if (volumePulseLoop) cancelAnimationFrame(volumePulseLoop);
                volumePulseLoop = requestAnimationFrame(animateBackgroundToVolume);
            }

            console.log("Game loop resumed");

            // Resume note generation based on the active mode
            if (!noteGenerationIntervalRef && !recording) {
                if (isCustomNotesActive) {
                    resumeCustomNoteGeneration();
                } else {
                    resumeRandomNoteGeneration();
                }
            }
        }
    }, 16); // roughly 60 FPS update for smoother countdown
}

function pauseRandomNoteGeneration() {
    clearInterval(noteGenerationIntervalRef);
    console.log("Random note generation paused");
}

function resumeRandomNoteGeneration() {
    // Only restart the interval if it's not already active
    if (!noteGenerationIntervalRef) {
        noteGenerationIntervalRef = setInterval(() => {
            if (gameStarted) {
                const songTime = currentSong.currentTime * 1000;
                if (songTime >= duration) {
                    clearInterval(noteGenerationIntervalRef); // Stop generating notes when song ends
                    console.log("Note generation stopped, song ended");
                    return;
                }

                const noteType = directionalNotes[Math.floor(Math.random() * directionalNotes.length)];
                const newNote = {
                    type: noteType,
                    y: -(noteSpawnY + (upscroll ? -HEIGHT : 0)),
                    x: noteXPositions[noteType], // Position based on custom X coordinates
                    timestamp: Date.now() - starttime,
                    faded: false,
                    opacity: 0, // Start with opacity 0 for random notes as well
                    scale: 1
                };

                // Always fade in random notes
                let fadeDuration = 150;
                let fadeSteps = 30;
                let fadeAmount = 1 / fadeSteps;

                let fadeInterval1 = setInterval(() => {
                    newNote.opacity += fadeAmount;

                    if (newNote.opacity >= 1) {
                        clearInterval(fadeInterval1); // Stop the fade when opacity reaches 1
                    }
                }, fadeDuration / fadeSteps); // Update every frame (~60fps)

                notes.push(newNote); // Add the random note to the notes array
                noteCounter++;
                console.log("Total notes:", noteCounter);

                if (noteCounter >= numberOfNotes) {
                    clearInterval(noteGenerationIntervalRef); // Stop generating notes when duration is reached
                    console.log("Note generation stopped, max notes reached");
                }
            }
        }, beattime);
        console.log("Random note generation resumed");
    }
}

function resumeCustomNoteGeneration() {
    if (!customNotes.length) return; // No custom notes to resume
    console.log("Resuming custom note generation");

    duration = currentSong.duration * 1000;
    let customNoteCounter = 0;

    // Loop over each custom note and schedule its generation
    customNotes.forEach((note) => {
        const delayFromNow = note.timestamp - currentSong.currentTime * 1000;
        if (delayFromNow >= 0) {
            const timeoutObj = createPausableTimeout(() => {
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
                    // Call shakeScreen if shake data exists
                    if (note.shake) {
                        const { strength, speed, duration, fade } = note.shake;
                        shakeScreen(strength, speed, duration, fade);
                    }
                } else {
                    // Handle Random note type by replacing it with a random directional one
                    if (note.type === "Random") {
                        const directionalNotes = ["Left", "Down", "Up", "Right"];
                        note.type = directionalNotes[Math.floor(Math.random() * directionalNotes.length)];
                    }

                    let spawnY = note.ownSpawnY || noteSpawnY; // Use the note's ownSpawnY if set, else use default

                    const newNote = {
                        type: note.type,
                        y: -(spawnY + (upscroll ? -1700 : 0)),
                        x: noteXPositions[getNoteXPosition(note.type)],
                        timestamp: note.timestamp,
                        newSpeed: note.newSpeed,
                        newSpawnY: note.newSpawnY,
                        ownSpeed: note.ownSpeed,
                        hold: note.hold,
                        spawnTime: performance.now(),
                        faded: false,
                        opacity: 0,
                        scale: 1,
                        shake: note.shake
                    };

                    notes.push(newNote);

                    if (spawnY < 75 && fadeSpawnedNotes) {
                        let fadeDuration = 150;
                        let fadeSteps = 30;
                        let fadeAmount = 1 / fadeSteps;

                        let fadeInterval1 = setInterval(() => {
                            newNote.opacity += fadeAmount;

                            if (newNote.opacity >= 1) {
                                clearInterval(fadeInterval1);
                            }
                        }, fadeDuration / fadeSteps);
                    } else {
                        newNote.opacity = 1;
                    }
                }

                customNoteCounter++;
            }, delayFromNow);

            timeoutObj.resume();
            recordedNoteGenTimeouts.push(timeoutObj);
        }
    });

    isCustomNotesActive = true; // Set the flag indicating custom notes are being generated
}

function pauseCustomNoteGeneration() {
    recordedNoteGenTimeouts.forEach((t) => t.pause?.());
    console.log("Custom note generation paused");
    isCustomNotesActive = false; // Set the flag to indicate no custom notes are active
}

function pauseNoteGeneration() {
    recordedNoteGenTimeouts.forEach((t) => t.pause?.());
    clearInterval(noteGenerationIntervalRef);
}

function resumeNoteGeneration() {
    recordedNoteGenTimeouts.forEach((t) => t.resume?.());
    if (!customNotes.length && !noteGenerationIntervalRef) {
        // Restart interval if you're using random generation
        clearInterval(noteGenerationIntervalRef); // prevent duplicate interval
        noteGenerationIntervalRef = setInterval(() => {
            if (gameStarted) {
                const songTime = currentSong.currentTime * 1000;
                if (songTime >= duration) {
                    clearInterval(noteGenerationIntervalRef);
                    return;
                }

                const noteType = directionalNotes[Math.floor(Math.random() * directionalNotes.length)];
                const newNote = {
                    type: noteType,
                    y: -(noteSpawnY + (upscroll ? -HEIGHT : 0)),
                    x: noteXPositions[noteType], // Position based on custom X coordinates
                    timestamp: Date.now() - starttime,
                    faded: false,
                    opacity: 0, // Start with opacity 0 for random notes as well
                    scale: 1
                };

                let fadeDuration = 150;
                let fadeSteps = 30;
                let fadeAmount = 1 / fadeSteps;

                let fadeInterval1 = setInterval(() => {
                    newNote.opacity += fadeAmount;
                    if (newNote.opacity >= 1) clearInterval(fadeInterval1);
                }, fadeDuration / fadeSteps);

                notes.push(newNote);
                noteCounter++;
                if (noteCounter >= numberOfNotes) {
                    clearInterval(noteGenerationIntervalRef);
                }
            }
        }, beattime);
    }
}

function generateNotes() {
    if (recording) {
        console.log("Recording mode: No random notes are generated.");
        return; // Skip note generation if recording
    }

    duration = currentSong.duration * 1000;

    // Generate notes based on imported file
    if (customNotes.length > 0) {
        console.log("Custom notes exist", customNotes);

        // ✅ Add 4000ms to timestamps if Magnolia.mp3 and backgroundVids is true
        let modifiedNotes = customNotes;
        if (currentSong.src.includes("Magnolia.mp3") && backgroundVids) {
            modifiedNotes = customNotes.map((note) => ({
                ...note,
                timestamp: note.timestamp + 5200
            }));
        } else if (currentSong.src.includes("FE!N.mp3") && backgroundVids) {
            modifiedNotes = customNotes.map((note) => ({
                ...note,
                timestamp: note.timestamp + 6500
            }));
        }

        modifiedNotes.forEach((note) => {
            let notetimestamp = note.timestamp + noteOffset;
            if (notetimestamp < duration) {
                isCustomNotesActive = true;
                const delayFromNow = notetimestamp - currentSong.currentTime * 1000;
                if (delayFromNow >= 0) {
                    const timeoutObj = createPausableTimeout(() => {
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
                            // Call shakeScreen if shake data exists
                            if (note.shake) {
                                const { strength, speed, duration, fade } = note.shake;
                                shakeScreen(strength, speed, duration, fade, true);
                            }
                        } else {
                            // Handle Random note type by replacing it with a random directional one
                            if (note.type === "Random") {
                                const directionalNotes = ["Left", "Down", "Up", "Right"];
                                note.type = directionalNotes[Math.floor(Math.random() * directionalNotes.length)];
                            }

                            let spawnY = note.ownSpawnY || noteSpawnY; // Use the note's ownSpawnY if set, else use default

                            // ⏱ Call simulateKeyPress after 1140ms
                            setTimeout(() => {
                                return;
                                simulateKeyPress(note.type);
                            }, 1140);

                            const newNote = {
                                type: note.type,
                                y: -(spawnY + (upscroll ? -1700 : 0)),
                                x: noteXPositions[getNoteXPosition(note.type)],
                                timestamp: note.timestamp,
                                newSpeed: note.newSpeed,
                                newSpawnY: note.newSpawnY,
                                ownSpeed: note.ownSpeed,
                                hold: note.hold,
                                spawnTime: performance.now(),
                                faded: false,
                                opacity: 0,
                                scale: 1,
                                shake: note.shake
                            };

                            notes.push(newNote);

                            if (spawnY < 75 && fadeSpawnedNotes) {
                                let fadeDuration = 150;
                                let fadeSteps = 30;
                                let fadeAmount = 1 / fadeSteps;

                                let fadeInterval1 = setInterval(() => {
                                    newNote.opacity += fadeAmount;

                                    if (newNote.opacity >= 1) {
                                        clearInterval(fadeInterval1);
                                    }
                                }, fadeDuration / fadeSteps);
                            } else {
                                newNote.opacity = 1;
                            }
                        }
                    }, delayFromNow);

                    timeoutObj.resume();

                    recordedNoteGenTimeouts.push(timeoutObj);
                }
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
                const newNote = {
                    type: noteType,
                    y: -(noteSpawnY + (upscroll ? -HEIGHT : 0)) - 50,
                    x: noteXPositions[noteType], // Position based on custom X coordinates
                    timestamp: Date.now() - starttime,
                    faded: false,
                    opacity: 0, // Start with opacity 0 for random notes as well
                    scale: 1
                };

                // Always fade in random notes
                let fadeDuration = 150; // 300 ms fade-in duration
                let fadeSteps = 30; // Smooth fading in steps
                let fadeAmount = 1 / fadeSteps;

                let fadeInterval1 = setInterval(() => {
                    newNote.opacity += fadeAmount;

                    if (newNote.opacity >= 1) {
                        clearInterval(fadeInterval1); // Stop the fade when opacity reaches 1
                    }
                }, fadeDuration / fadeSteps); // Update every frame (~60fps)

                notes.push(newNote); // Add the random note to the notes array
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

const whiteFlashes = {}; // { noteType: { opacity: 1, startTime: timestamp } }
const offscreenCanvas = document.createElement("canvas");
const offCtx = offscreenCanvas.getContext("2d");

const blocksByNote = new Map();
const orphanBlocks = [];
const holdNoteSources = [];

function drawNotes() {
    //if (!fullscreen) ctx.drawImage(images.background, 0, 0, WIDTH, HEIGHT);

    // Define which notes should be drawn based on noteMode
    let allowedNotes = [];
    if (noteMode === 1) {
        allowedNotes = ["Down"];
    } else if (noteMode === 2) {
        allowedNotes = ["Down", "Up"];
    } else if (noteMode === 3) {
        allowedNotes = ["Left", "Down", "Up"];
    } else if (noteMode === 4) {
        allowedNotes = ["Left", "Up", "Down", "Right"];
    } else if (noteMode === 5) {
        allowedNotes = ["Left", "Up", "Down", "Right", "Downright"];
    } else if (noteMode === 6) {
        allowedNotes = ["Downleft", "Left", "Up", "Down", "Right", "Downright"];
    } else if (noteMode === 7) {
        allowedNotes = ["Downleft", "Left", "Up", "Down", "Right", "Downright", "Upright"];
    } else if (noteMode >= 8) {
        allowedNotes = [...noteTypes]; // All notes
        noteMode = 8;
    }

    const now = performance.now();

    // Draw orphan blocks (from removed notes)
    for (let i = orphanBlocks.length - 1; i >= 0; i--) {
        const block = orphanBlocks[i];
        const timeSinceSpawn = now - block.spawnTime;

        const noteSpeedToUse = block.ownSpeed !== undefined ? block.ownSpeed : noteSpeed;
        const blockStartY = upscroll ? noteSpawnY - 1700 : -noteSpawnY;
        const yOffset = (upscroll ? -1 : 1) * noteSpeedToUse * (timeSinceSpawn / 6);
        const blockY = currentNoteStyleIndex == 9 ? blockStartY + yOffset + 20 : blockStartY + yOffset;

        const targetY = upscroll ? -HEIGHT : HEIGHT;
        const pastTargetY = upscroll ? blockY <= targetYPosition : currentNoteStyleIndex == 9 ? blockY >= targetYPosition + 30 : blockY >= targetYPosition + 19;
        const outOfBounds = upscroll ? blockY <= targetY : blockY >= targetY;

        // Get all the keys for this block type
        const keyBinding = Object.keys(keyBindings).filter((key) => keyBindings[key] === block.type);

        // Check if any of the keybinds are pressed
        const shouldDelete = outOfBounds || (pastTargetY && keyBinding.some((key) => keysPressed[key]));

        if (shouldDelete) {
            orphanBlocks.splice(i, 1);
            continue;
        }

        if (!(pastTargetY && keyBinding.some((key) => keysPressed[key]))) {
            // Get color and set opacity to 0.6
            const color = noteColors[block.type] || "#FFFFFF"; // Fallback to white if not found

            // If the color is in hex, convert to rgba with 0.6 opacity
            let rgbaColor;
            if (color.startsWith("#")) {
                rgbaColor = hexToRGBA(color, 0.6); // Convert hex to RGBA
            } else {
                // If already in rgb, adjust the opacity
                const rgb = hexToRgb(color); // Convert to RGB format
                rgbaColor = `rgba(${rgb}, 0.6)`; // Set the opacity
            }

            ctx.fillStyle = rgbaColor;
            ctx.fillRect(block.xPos, blockY, block.width, block.height);
        }
    }

    for (let s = holdNoteSources.length - 1; s >= 0; s--) {
        const note = holdNoteSources[s];
        if (!note.spawnTime || typeof note.hold !== "number") continue;

        const elapsed = now - note.spawnTime - 15;
        var blockInterval = 40;
        let blockHeight = 25;

        if (currentNoteStyleIndex === 9) {
            blockInterval = 10;
            blockHeight = 10;
        } else {
            if (noteSpeed == 3) {
                blockHeight = 20;
            } else if (noteSpeed == 3.5) {
                blockHeight = 23.6;
            } else if (noteSpeed == 4) {
                blockHeight = 27;
            } else if (noteSpeed == 4.5) {
                blockHeight = 30;
            } else if (noteSpeed == 5) {
                blockHeight = 33.6;
            } else if (noteSpeed == 5.5) {
                blockHeight = 37;
            } else if (noteSpeed == 6) {
                blockHeight = 40;
            } else if (noteSpeed == 7) {
                blockHeight = 46.9;
            }
        }

        const blockCount = Math.floor(Math.min(elapsed, note.hold) / blockInterval);

        if (!blocksByNote.has(note)) {
            blocksByNote.set(note, []);
        }

        const blocks = blocksByNote.get(note);
        const noteSpeedToUse = note.ownSpeed !== undefined ? note.ownSpeed : noteSpeed;

        for (let i = blocks.length; i < blockCount; i++) {
            const individualBlockSpawnTime = note.spawnTime + i * blockInterval;
            const timeSinceSpawn = now - individualBlockSpawnTime;
            const blockStartY = upscroll ? noteSpawnY - 1700 : -noteSpawnY;
            const yOffset = (upscroll ? -1 : 1) * noteSpeedToUse * (timeSinceSpawn / 6);
            const blockY = blockStartY + yOffset;

            const passedTargetY = upscroll ? blockY <= targetYPosition : blockY >= targetYPosition;
            if (passedTargetY && keysPressed[note.type]) {
                continue; // Skip creating blocks after hitting target while held
            }

            if (!blocks[i]) {
                blocks[i] = {
                    xPos: note.x - blockWidth / 2,
                    width: blockWidth,
                    height: blockHeight,
                    active: true,
                    spawnTime: individualBlockSpawnTime,
                    type: note.type
                };
            }

            const block = blocks[i];
            if (!block.active) continue;

            const reachedTargetY = upscroll ? blockY <= targetYPosition : blockY >= targetYPosition;

            if (reachedTargetY && keysPressed[note.type]) {
                block.active = false; // Deactivate so it doesn't get duplicated
                continue;
            }

            const isDuplicate = orphanBlocks.some((b) => b.spawnTime === block.spawnTime && b.xPos === block.xPos);
            if (!isDuplicate && !keysPressed[note.type]) {
                orphanBlocks.push({
                    ...block,
                    type: note.type,
                    ownSpeed: noteSpeedToUse,
                    spawnTime: individualBlockSpawnTime
                });
                block.active = false; // Mark as moved to orphan so it won't be pushed again
            }
        }

        // Remove from source list if block spawning is done
        if (elapsed >= note.hold) {
            holdNoteSources.splice(s, 1);
        }
    }

    // Move blocks of removed notes to orphanBlocks (only once)
    for (const [note, blocks] of blocksByNote.entries()) {
        if (!notes.includes(note)) {
            blocks.forEach((block) => {
                const alreadyExists = orphanBlocks.some((b) => b.spawnTime === block.spawnTime && b.xPos === block.xPos);
                if (!alreadyExists) {
                    orphanBlocks.push({ ...block });
                }
            });
            blocksByNote.delete(note);
        }
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
            const adjustedNoteYpos = (diagonalNotes.includes(type) ? targetYPosition + 3 : targetYPosition) - sizeDifference / 2;

            ctx.drawImage(imageToDraw, x, adjustedNoteYpos, currentNoteSize, currentNoteSize);

            if (whiteFlashes[type]) {
                const elapsed = performance.now() - whiteFlashes[type].startTime;
                const duration = 300; // ms
                if (elapsed >= duration) {
                    delete whiteFlashes[type];
                } else {
                    const alpha = 1 - elapsed / duration;

                    const img = imageToDraw;
                    if (img && img.complete) {
                        offscreenCanvas.width = currentNoteSize;
                        offscreenCanvas.height = currentNoteSize;
                        offCtx.clearRect(0, 0, currentNoteSize, currentNoteSize);

                        // Draw the image
                        offCtx.drawImage(img, 0, 0, currentNoteSize, currentNoteSize);

                        // Set blend mode to only affect opaque pixels
                        offCtx.globalCompositeOperation = "source-in";

                        // Colored fill with fading alpha
                        offCtx.fillStyle = `${whiteFlashes[type].color}${alpha})`;
                        offCtx.fillRect(0, 0, currentNoteSize, currentNoteSize);

                        // Reset blend mode
                        offCtx.globalCompositeOperation = "source-over";

                        // Draw from offscreen back to main canvas
                        ctx.drawImage(offscreenCanvas, x, adjustedNoteYpos);
                    }
                }
            }
        } else {
            ctx.fillStyle = noteColors[type] || "white";

            // Calculate the center of the circle
            const centerX = x + currentNoteSize / 2;
            const centerY = targetYPosition + 30; // Adjust as needed for alignment
            const radius = noteBlockHeight / 2;

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fill();

            if (whiteFlashes[type]) {
                const elapsed = performance.now() - whiteFlashes[type].startTime;
                const duration = 300; // ms
                if (elapsed >= duration) {
                    delete whiteFlashes[type];
                } else {
                    const alpha = 1 - elapsed / duration;
                    ctx.fillStyle = `${whiteFlashes[type].color}${alpha})`;
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, radius + 5, 0, Math.PI * 2); // Slightly larger radius for flash
                    ctx.fill();
                }
            }
        }
    });

    notes.forEach((note) => {
        // Other drawing code remains the same...
        let noteType = note.type.startsWith("RecNote") ? note.type.replace("RecNote", "") : note.type;

        // Handle hold notes and draw blocks individually
        if (note.hold && typeof note.hold === "number" && note.spawnTime && !holdNoteSources.includes(note)) {
            holdNoteSources.push(note);
        }

        // Special case for beatLine
        if (noteType === "beatLine" && beatLineOpacity > 0) {
            if (beatLineImage && beatLineImage.complete && beatLineImage.naturalWidth !== 0) {
                ctx.globalAlpha = beatLineOpacity;
                ctx.drawImage(beatLineImage, note.x - 400, note.y + noteSize / 2, 800, 5);
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
                ctx.filter = "grayscale(50%)"; // Apply 50% desaturation
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

            const centerX = note.x;
            const centerY = note.y + 30; // Adjusted to match the previous Y offset
            const radius = Math.min(noteBlockWidth, noteBlockHeight) / 2;

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fill();

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
    let yOffset = 90;

    if (!recording) {
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = `${hitPulseFontSize - 12}px Poppins`;
        ctx.fillText(`${noteProgress.toFixed(2)}%`, WIDTH / 2, upscroll ? 30 : HEIGHT - 10);
    }

    // Draw accuracy & points
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.font = "25px Poppins";
    ctx.fillText(`Accuracy: ${accuracy.toFixed(2)}%`, 10, 30);

    const roundedPoints = Math.round(points);
    const pointsText = roundedPoints.toLocaleString();
    ctx.fillText(`Points: ${pointsText}`, 10, 60);

    // Dynamically draw stats only if they are greater than 0
    const stats = [
        { label: "EXACTs", value: exactHits },
        { label: "INSANEs", value: insanes },
        { label: "Perfects", value: perfects },
        { label: "Early", value: earlys },
        { label: "Lates", value: lates },
        { label: "Misses", value: misses }
    ];

    ctx.font = "25px Poppins";
    stats.forEach((stat) => {
        if (stat.value > 0) {
            ctx.fillText(`${stat.label}: ${stat.value}`, 10, yOffset);
            yOffset += 30; // Increase spacing for next text
        }
    });

    // Current + Max streak
    if (!recording) {
        ctx.font = `${fontSize - 10}px Poppins`;
        ctx.textAlign = "center";
        ctx.fillText(streak, WIDTH / 2, HEIGHT / 2 - 120 + (upscroll ? 200 : 0));
        ctx.font = `${fontSize - 25}px Poppins`;
        ctx.fillText(maxStreak, WIDTH / 2, HEIGHT / 2 - 160 + (upscroll ? 200 : 0));
    }

    if (autoHitEnabled) {
        ctx.font = `${bpmPulseFontSize - 19}px Poppins`;
        ctx.textAlign = "center";
        ctx.fillText("Auto-hit Enabled", WIDTH / 2, HEIGHT / 2 - 240 + (upscroll ? 500 : 0));
    }

    // Check if the hit was insane and apply styles accordingly
    let isExact = hitTypeID === -1;
    let isinsane = hitTypeID === 0;
    let isPerfect = hitTypeID === 1;

    // Now draw the hitType with special styling for "insane" hits
    if (hitType && hitTypeOpacity > 0) {
        ctx2.font = `600 ${fontSize + 5}px Poppins`;
        ctx2.textAlign = "center";

        if (isinsane) {
            // Apply gold color and glow effect for insane hits
            ctx2.fillStyle = `rgba(255, 223, 0, ${hitTypeOpacity})`; // Gold color
            ctx2.shadowColor = "rgba(255, 223, 0, 0.8)"; // Golden shine
            ctx2.shadowBlur = 10; // Shine effect
        } else if (isPerfect) {
            // Apply gold color and glow effect for Insane hits
            ctx2.fillStyle = `rgba(60, 230, 255, ${hitTypeOpacity})`; // Blue color
            ctx2.shadowColor = "rgba(0, 102, 255, 0.8)"; // Blue shine
            ctx2.shadowBlur = 50; // Shine effect
        } else if (isExact) {
            // Apply gold color and glow effect for Insane hits
            ctx2.fillStyle = `rgba(60, 255, 0, ${hitTypeOpacity})`; // Blue color
            ctx2.shadowColor = "rgba(67, 150, 0, 0.8)"; // Red shine
            ctx2.shadowBlur = 60; // Shine effect
        } else {
            // Regular text for other hit types (like Perfect, Miss, etc.)
            ctx2.fillStyle = `rgba(255, 255, 255, ${hitTypeOpacity})`;
            ctx2.shadowColor = "transparent"; // No shadow for non-Insane hits
        }

        ctx2.fillText(`${hitType}`, WIDTH / 2, HEIGHT / 2 - 40);
    }

    // Reset shadow properties after the text
    ctx2.shadowColor = "transparent"; // Reset shadow

    if (pointsRewarded < calculatePoints(0)) {
        // Normalize the value between 0 and 1
        const t = Math.max(0, pointsRewarded / calculatePoints(0));

        // Interpolate from dark red (128, 0, 0) → red (255, 0, 0) → orange (255, 128, 0)
        // → yellow (255, 255, 0) → green (0, 255, 0)

        let r, g, b;

        if (t < 0.25) {
            // dark red → red
            const ratio = t / 0.25;
            r = 128 + ratio * (255 - 128);
            g = 0;
            b = 0;
        } else if (t < 0.5) {
            // red → orange
            const ratio = (t - 0.25) / 0.25;
            r = 255;
            g = ratio * 128;
            b = 0;
        } else if (t < 0.75) {
            // orange → yellow
            const ratio = (t - 0.5) / 0.25;
            r = 255;
            g = 128 + ratio * 127;
            b = 0;
        } else {
            // yellow → green
            const ratio = (t - 0.75) / 0.25;
            r = 255 - ratio * 255;
            g = 255;
            b = 0;
        }

        ctx2.fillStyle = `rgba(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)}, ${hitTypeOpacity})`;
    } else {
        // Always green for scores >= 50
        ctx2.fillStyle = `rgba(0, 255, 0, ${hitTypeOpacity})`;
    }

    ctx2.textAlign = "center";
    ctx2.font = `${fontSize - 16}px Poppins`;
    ctx2.fillText(`${Math.floor(pointsRewarded)}`, WIDTH / 2, HEIGHT / 2 + 10);

    // Reset fill style after transparency effect
    ctx2.fillStyle = "white";

    // Handle recording text
    if (recording) {
        ctx.textAlign = "center";
        ctx.fillStyle = "red";
        ctx.font = "30px Poppins";
        ctx.fillText("Recording Notes", WIDTH / 2, 34);

        ctx.fillStyle = "white";
        ctx.font = "18px Poppins";
        ctx.fillText(getSongTitle(currentSong.src), WIDTH / 2, 56);
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

    if (!recording) {
        const title = getSongTitle(currentSong.src);
        ctx.font = "26px Poppins";
        ctx.textAlign = "right";

        let line1 = "";
        let line2 = "";
        let lineCount = 1;

        if (title.length > 20) {
            const words = title.split(" ");

            for (let word of words) {
                if ((line1 + word).length <= 20) {
                    line1 += word + " ";
                } else {
                    line2 += word + " ";
                }
            }

            line1 = line1.trim();
            line2 = line2.trim();

            ctx.fillText(`Song: ${line1}`, WIDTH - 10, 30);
            ctx.font = "24px Poppins";
            ctx.fillText(line2, WIDTH - 10, 60);
            lineCount = 2;
        } else {
            ctx.fillText(`Song: ${title}`, WIDTH - 10, 30);
        }

        // Show BPM and noteSpeed based on line count
        ctx.font = "20px Poppins";
        ctx.fillText(`BPM: ${BPM}`, WIDTH - 10, 30 + lineCount * 30);
        ctx.fillText(`Speed: ${noteSpeed}`, WIDTH - 10, 30 + lineCount * 30 + 25);
        ctx.fillText(`Spawn Y: ${noteSpawnY}`, WIDTH - 10, 30 + lineCount * 30 + 50);
        ctx.fillText(`Charted by: ${songCharter}`, WIDTH - 10, 30 + lineCount * 30 + 75);
    }
}

function showHitType() {
    hitTypeOpacity = 1; // Reset opacity to full

    if (!fadeOutHitTypeText) {
        return;
    }

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
        let fadeDuration = timeToFadeOutHitType;
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
        const maxMissableDistance = targetYPosition + 80 - (targetYPosition - 80);
        const normalizedDistance = distanceFromCenter - perfectRange;
        const maxOffset = maxMissableDistance - perfectRange;

        // Scale the points based on distance from perfect hit
        const scaledPoints = basePoints - (normalizedDistance / maxOffset) * (basePoints * 0.9);
        return Math.max(scaledPoints, basePoints * 0.1); // Minimum 10% of base points
    }
}

function getScoreDivisor() {
    const noteCount = customNotes.length;
    if (noteCount >= 5000) return 1000000;
    if (noteCount >= 3175) return 750000;
    if (noteCount >= 2250) return 500000;
    if (noteCount >= 1650) return 250000;
    if (noteCount >= 1200) return 100000;
    if (noteCount >= 800) return 75000;
    return 50000;
}

function registerHit(noteType) {
    for (let i = 0; i < notes.length; i++) {
        if (notes[i].type === noteType && !notes[i].type.startsWith("rec") && !notes[i].faded) {
            const noteY = notes[i].y;
            const savedtimestamp = notes[i].timestamp;
            const distanceFromCenter = Math.abs(noteY - targetYPosition);

            const hitWindowTop = targetYPosition - 220;
            const hitWindowBottom = targetYPosition + 220;

            if (noteY >= hitWindowTop && noteY <= hitWindowBottom) {
                let earnedPoints = calculatePoints(distanceFromCenter);
                pointsRewarded = 0;

                const hitNote = notes[i]; // store before splice

                if (notes[i].hold > 0) {
                    const noteId = `${hitNote.type}_${savedtimestamp}`;
                    const totalPoints = earnedPoints;

                    let chunks;
                    if (hitNote.hold < 1000) {
                        chunks = 24;
                    } else if (hitNote.hold < 2000) {
                        chunks = 64;
                    } else if (hitNote.hold < 4000) {
                        chunks = 128;
                    } else if (hitNote.hold < 8000) {
                        chunks = 256;
                    } else if (hitNote.hold < 12000) {
                        chunks = 512;
                    } else {
                        chunks = 1024;
                    }

                    const interval = hitNote.hold / chunks;
                    let currentChunk = 0;

                    console.log(`Splitting ${totalPoints.toFixed(2)} points into ${chunks} chunks (interval: ${interval}ms)`);

                    const holdKeys = Object.keys(keyBindings).filter((k) => keyBindings[k] === hitNote.type);

                    // Process all the keybinds associated with the note type
                    holdKeys.forEach((holdKey) => {
                        console.log(`Splitting ${totalPoints.toFixed(2)} points into ${chunks} chunks (interval: ${interval}ms)`);

                        const intervalId = setInterval(() => {
                            //console.log(`[Hold Tick] Key: ${holdKey}, Pressed: ${keysPressed[holdKey]}, Chunk: ${currentChunk}/${chunks}`);

                            if (keysPressed[holdKey] && currentChunk < chunks) {
                                const chunkPoints = totalPoints / chunks;
                                points += chunkPoints;

                                if (!autoHitEnabled) {
                                    pointsGained += chunkPoints;
                                    pointsAvailable += chunkPoints;
                                    localStorage.setItem("pointsGained", pointsGained);
                                    localStorage.setItem("pointsAvailable", pointsAvailable);
                                }

                                pointsRewarded += chunkPoints;

                                showHitType();

                                //console.log(`Chunk ${currentChunk + 1}/${chunks}: +${chunkPoints.toFixed(2)} points`);
                                currentChunk++;
                            } else {
                                clearInterval(intervalId);
                                delete activeHoldNotes[noteId];
                            }
                        }, interval);

                        activeHoldNotes[noteId] = {
                            endTime: Date.now() + hitNote.hold,
                            intervalId
                        };
                    });
                }

                if (distanceFromCenter <= exactRange) {
                    hitType = "EXACT";
                    hitTypeID = -1;
                    exactHits++;
                    hitArray.exact.push({ type: notes[i].type, timestamp: savedtimestamp });
                    notes.splice(i, 1);
                } else if (distanceFromCenter <= absolutePerfectRange) {
                    hitType = "INSANE";
                    hitTypeID = 0;
                    insanes++;
                    hitArray.insane.push({ type: notes[i].type, timestamp: savedtimestamp });
                    notes.splice(i, 1);
                } else if (distanceFromCenter <= perfectRange) {
                    hitType = "Perfect!";
                    hitTypeID = 1;
                    perfects++;
                    hitArray.hitPerfect.push({ type: notes[i].type, timestamp: savedtimestamp });
                    notes.splice(i, 1);
                } else {
                    const isEarly = upscroll ? noteY > targetYPosition : noteY < targetYPosition;
                    hitType = isEarly ? "Early" : "Late";
                    hitTypeID = 3;

                    if (hitType === "Early" || hitType === "Late") {
                        if (punishment === "difficult") {
                            hitType = "Miss";
                            hitTypeID = 5;
                            misses++;
                            streak = 0;
                            notes.splice(i, 1);
                            updateAccuracy();
                            updateNoteProgress();
                            showHitType(hitType);
                            return;
                        }

                        if (punishment === "harsh") {
                            hitType = "Miss";
                            hitTypeID = 5;
                            misses++;
                            streak = 0;
                            points -= earnedPoints; // Subtract missed points
                            pointsRewarded = earnedPoints;
                            earnedPoints = 0;
                            notes.splice(i, 1);
                            updateAccuracy();
                            updateNoteProgress();
                            showHitType(hitType);
                            return;
                        }
                    }

                    if (hitType === "Early") {
                        earlys++;
                        hitArray.hitEarly.push({ type: notes[i].type, timestamp: savedtimestamp });
                    } else {
                        lates++;
                        hitArray.hitLate.push({ type: notes[i].type, timestamp: savedtimestamp });
                    }

                    if (fadeEarlyLateNotes) {
                        const tooEarly = upscroll ? noteY > targetYPosition + 105 : noteY < targetYPosition - 75;
                        const tooLate = upscroll ? noteY < targetYPosition - 75 : noteY > targetYPosition + 105;

                        if (tooEarly || tooLate) {
                            notes[i].faded = true;
                            handleFadedNotes();
                        } else {
                            notes.splice(i, 1);
                        }
                    } else {
                        notes.splice(i, 1);
                    }
                }

                if (flashNotesOnHit && flashWithTypes.includes(hitType)) {
                    let flashColor;

                    if (colorFlashWithTypes) {
                        let baseColor;
                        if (hitType === "EXACT") {
                            baseColor = exactTypeColor;
                        } else if (hitType === "INSANE") {
                            baseColor = insaneTypeColor;
                        } else if (hitType === "Perfect!") {
                            baseColor = perfectTypeColor;
                        } else if (hitType === "Early") {
                            baseColor = earlyTypeColor;
                        } else if (hitType === "Late") {
                            baseColor = lateTypeColor;
                        }

                        if (baseColor === "noteColor") {
                            // Use the note color from noteColors and convert to rgba format
                            const hex = noteColors[noteType];
                            if (hex && hex.startsWith("#")) {
                                const r = parseInt(hex.slice(1, 3), 16);
                                const g = parseInt(hex.slice(3, 5), 16);
                                const b = parseInt(hex.slice(5, 7), 16);
                                flashColor = `rgba(${r}, ${g}, ${b}, `;
                            } else {
                                flashColor = "rgba(255, 255, 255, "; // fallback
                            }
                        } else {
                            flashColor = baseColor;
                        }
                    } else {
                        flashColor = "rgba(255, 255, 255, ";
                    }

                    whiteFlashes[noteType] = {
                        opacity: 1,
                        startTime: performance.now(),
                        color: flashColor
                    };
                }

                notesHit++;
                if (!autoHitEnabled) {
                    allTimeNotesHit++;
                    localStorage.setItem("allTimeNotesHit", allTimeNotesHit);
                }

                showHitType(hitType);
                lastHitDistance = noteY - targetYPosition;
                lastHitOffset = savedtimestamp - (Date.now() - starttime - 1070);
                lastHitOffsetTime = Date.now();
                offsetTextOpacity = 1;

                updateAccuracy();
                updateNoteProgress();
                onNoteHit();
                registerNoteHit();

                let finalPoints = punishment === "harsh" && hitTypeID === 5 ? 0 : earnedPoints;
                if (!hitNote.hold) {
                    points += finalPoints;

                    if (!autoHitEnabled) {
                        pointsGained += finalPoints;
                        pointsAvailable += finalPoints;
                        localStorage.setItem("pointsGained", pointsGained);
                        localStorage.setItem("pointsAvailable", pointsAvailable);
                    }

                    pointsRewarded = finalPoints;

                    console.log(`Earned: ${finalPoints.toFixed(2)} | (${hitType} at ${savedtimestamp})`);
                } else {
                    // Still log the hit (just don't award all points at once)
                    console.log(`(Hold Start at ${savedtimestamp})`);
                    //console.table(hitNote);
                }

                if (hitTypeID !== 5) {
                    streak++;
                    if (streak > maxStreak) maxStreak = streak;
                }
                noteHitTimestamps.push(Date.now());

                if (pulseToHits) {
                    fontSize += 6;
                    smallFontSize += 3;
                    hitPulseFontSize += 5;
                }

                if (!pulseNotesOnClick && pulseNotesOnHit) {
                    const sizeDelta = (currentNoteStyleIndex === 9 || currentStaticStyleIndex === 9 ? 5 : 10) * (pulseNotesOutwards ? 1 : -1);

                    switch (noteType) {
                        case "Upleft":
                            upLeftNoteSize += sizeDelta;
                            break;
                        case "Downleft":
                            downLeftNoteSize += sizeDelta;
                            break;
                        case "Left":
                            leftNoteSize += sizeDelta;
                            break;
                        case "Up":
                            upNoteSize += sizeDelta;
                            break;
                        case "Down":
                            downNoteSize += sizeDelta;
                            break;
                        case "Right":
                            rightNoteSize += sizeDelta;
                            break;
                        case "Downright":
                            downRightNoteSize += sizeDelta;
                            break;
                        case "Upright":
                            upRightNoteSize += sizeDelta;
                            break;
                        default:
                            console.log("No note type found");
                    }
                }

                break;
            }
        }
    }

    // If no note matched at all, but we still pressed something (harsh punishment)
    if (punishment === "harsh" && hitType !== "Perfect!" && hitType !== "INSANE" && hitType !== "EXACT") {
        hitType = "Miss";
        hitTypeID = 5;
        misses++;
        streak = 0;
        showHitType(hitType);
        updateAccuracy();
        updateNoteProgress();
    }
}

setInterval(() => {
    const now = Date.now();
    noteHitTimestamps = noteHitTimestamps.filter((ts) => now - ts <= 1000);
    NPS = noteHitTimestamps.length;
}, 100);

let lastHitDistance; // Distance from perfect center (Y=500)

document.addEventListener("keydown", (event) => {
    keysPressed[event.code] = true; // Store the event.code instead of event.key

    if (event.repeat) return; // Ignore repeat keydown events, used for hold notes

    let key = event.code; // Use key code to differentiate keys

    // Prevent scrolling behavior for arrow keys
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)) {
        event.preventDefault();
    }

    // Detect Ctrl Shift Enter for recording only
    if (keysPressed["ControlLeft"] && keysPressed["ShiftLeft"] && key === "Enter") {
        if (recording) stopRecording();
        else startRecording();
        return; // Prevents startGame() from being called
    }

    // If game is not started and Enter is pressed (without Ctrl + Shift), start the game
    if (!gameStarted && key === "Enter") {
        startGame();
    }

    if (key === "Escape") {
        if (gamePaused) resume();
        else pause();
    }

    if (!keyBindings[key]) {
        console.log(`Key ${key} not found in keyBindings.`);
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
            case "RandomizeChart":
                randomizeChart();
                break;
            default:
                break;
        }
    }

    if (gameStarted && noteType && !keyHeldDown[noteType]) {
        if (doubleInputPrevention) {
            const now = performance.now();
            const lastPressed = lastKeyPressTimestamps[noteType] || 0;
            if (now - lastPressed >= doubleClickTime) {
                lastKeyPressTimestamps[noteType] = now;
                pressNote(noteType);
            } else {
                console.log(`Double input prevented for ${noteType}`);
            }
        } else {
            pressNote(noteType);
        }
    }
});

let lastKeyPressTimestamps = {};

const pressDurations = {}; // To store press durations
const holdThreshold = 175; // Threshold in milliseconds for a hold note

function pressNote(noteType) {
    if (recording && ["Left", "Up", "Down", "Right", "Upleft", "Downleft", "Upright", "Downright"].includes(noteType)) {
        const timestamp = Date.now() - starttime;

        // Record the note as a regular note
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

        // Track the press duration
        pressDurations[noteType] = {
            startTime: timestamp,
            type: noteType
        };
    }

    highlightedNotes[noteType] = true;

    if (pulseNotesOnClick) {
        const sizeDelta = (currentNoteStyleIndex === 9 || currentStaticStyleIndex === 9 ? 5 : 10) * (pulseNotesOutwards ? 1 : -1);

        switch (noteType) {
            case "Upleft":
                upLeftNoteSize += sizeDelta;
                break;
            case "Downleft":
                downLeftNoteSize += sizeDelta;
                break;
            case "Left":
                leftNoteSize += sizeDelta;
                break;
            case "Up":
                upNoteSize += sizeDelta;
                break;
            case "Down":
                downNoteSize += sizeDelta;
                break;
            case "Right":
                rightNoteSize += sizeDelta;
                break;
            case "Downright":
                downRightNoteSize += sizeDelta;
                break;
            case "Upright":
                upRightNoteSize += sizeDelta;
                break;
            default:
                console.log("No note type found");
        }
    }

    if (flashNotesOnClick) {
        let flashColor;

        if (clickFlashColor === "noteColor") {
            const hex = noteColors[noteType];
            if (hex && hex.startsWith("#")) {
                const r = parseInt(hex.slice(1, 3), 16);
                const g = parseInt(hex.slice(3, 5), 16);
                const b = parseInt(hex.slice(5, 7), 16);
                flashColor = `rgba(${r}, ${g}, ${b}, `;
            } else {
                flashColor = "rgba(255, 255, 255, "; // fallback
            }
        } else {
            flashColor = clickFlashColor;
        }

        whiteFlashes[noteType] = {
            opacity: 1,
            startTime: performance.now(),
            color: flashColor
        };
    }

    registerHit(noteType);
}

const activeHoldNotes = {}; // { noteId: { endTime, intervalId, pointsRemaining } }

document.addEventListener("keyup", (event) => {
    const noteType = keyBindings[event.code];

    // Check if the noteType exists (if there's a valid keybinding for the event)
    if (noteType) {
        if (recording) {
            const pressDuration = pressDurations[noteType];
            if (pressDuration) {
                const heldDuration = Date.now() - pressDuration.startTime - starttime;

                if (heldDuration >= holdThreshold) {
                    const originalNoteIndex = recordedNotes.findIndex((note) => note.type === noteType && note.timestamp === pressDuration.startTime - 1080);
                    if (originalNoteIndex !== -1) {
                        const holdNote = {
                            type: noteType,
                            timestamp: pressDuration.startTime - 1080,
                            hold: heldDuration
                        };
                        recordedNotes[originalNoteIndex] = holdNote;
                        console.log(`Replaced regular note with hold note at ${pressDuration.startTime}ms, duration: ${heldDuration}ms`);
                    }
                }

                Object.keys(activeHoldNotes).forEach((noteId) => {
                    if (noteId.startsWith(noteType)) {
                        clearInterval(activeHoldNotes[noteId].intervalId);
                        delete activeHoldNotes[noteId];
                    }
                });
            }
        }

        // ✅ Always remove from highlight, even if not recording
        highlightedNotes[noteType] = false;
    }

    // Remove the keycode from keysPressed to track that it's no longer pressed
    delete keysPressed[event.code];
});

// Function to play a sound
function playSoundEffect(audioPath, vol) {
    const audio = new Audio(audioPath);
    audio.volume = vol;
    audio.play().catch((error) => {
        console.error("Audio playback failed:", error);
    });
}

let activeLineOpacity = 1;
let lastHitTime = performance.now();
let fadeOutInterval = null;
let fadeInInterval = null;
let offsetTextFadeOutInterval = null;
let isHitLineFading = false;
let hasHitLineFadedOut = false;

function registerNoteHit() {
    lastHitTime = performance.now();

    isHitLineFading = false;
    hasHitLineFadedOut = false;

    // Cancel fade out if it was happening
    if (fadeOutInterval) {
        clearInterval(fadeOutInterval);
        fadeOutInterval = null;
    }

    activeLineOpacity = 1;

    lastHitOffsetTime = performance.now();
    offsetTextOpacity = 1;

    if (offsetTextFadeOutInterval) {
        clearInterval(offsetTextFadeOutInterval);
        offsetTextFadeOutInterval = null;
    }
}

let displayedLineX = WIDTH / 2; // Start in the middle
let targetLineX = WIDTH / 2; // Target position for animation
let previousHits = []; // Store previous hits
let lastDistanceFromCenter = null; // Track last received distance

let lastHitOffset = null;
let lastHitOffsetTime = null;
let offsetTextOpacity = 1;

let hitLineImg = new Image();

hitLineImg.src = "Resources/Arrows/hitLine.png";

function rgbaToHex(rgba) {
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d*\.?\d+))?\)/);
    if (!match) return null;

    let [, r, g, b, a] = match.map((x, i) => (i === 0 ? x : parseFloat(x)));
    r = Math.round(r).toString(16).padStart(2, "0");
    g = Math.round(g).toString(16).padStart(2, "0");
    b = Math.round(b).toString(16).padStart(2, "0");

    if (a !== undefined && !isNaN(a)) {
        a = Math.round(a * 255)
            .toString(16)
            .padStart(2, "0");
        return `#${r}${g}${b}${a}`;
    }

    return `#${r}${g}${b}`;
}

function hexToRGBA(hex, alpha) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})` : `rgba(255, 255, 255, ${alpha})`;
}

function hexToRgb(hex) {
    hex = hex.replace(/^#/, "");

    if (hex.length === 3) {
        hex = hex
            .split("")
            .map((char) => char + char)
            .join("");
    }

    const int = parseInt(hex, 16);
    const r = (int >> 16) & 255;
    const g = (int >> 8) & 255;
    const b = int & 255;

    return `${r},${g},${b}`;
}

let insideAngle = 0;
let outlineAngle = 0;

function drawAccuracyBar(distanceFromCenter, deltaTime) {
    const barX = WIDTH / 2 - accBarWidth / 2;
    const barY = upscroll ? 60 : 600;

    const now = performance.now();

    // Handle Outline Gradient Rotation (if enabled)
    if (accBarOutlineRotatingGradient) {
        outlineAngle += 0.3125 / deltaTime; // Adjust speed of rotation
        if (outlineAngle >= 360) outlineAngle = 0; // Reset rotation after 360 degrees
    }

    // Handle Inside Gradient Rotation (if enabled)
    if (accBarInsideRotatingGradient) {
        insideAngle += 1.25 / deltaTime; // Adjust speed of rotation
        if (insideAngle >= 360) insideAngle = 0; // Reset rotation after 360 degrees
    }

    // --- Outline Gradient ---
    // Handle outline gradient directions
    if (typeof accBarOutlineGradientDirection === "string" && !accBarOutlineRotatingGradient) {
        switch (accBarOutlineGradientDirection) {
            case "top":
                outlineAngle = 90;
                break;
            case "bottom":
                outlineAngle = 270;
                break;
            case "left":
                outlineAngle = 0;
                break;
            case "right":
                outlineAngle = 180;
                break;
            case "middle":
            case "inverse middle":
                break;
        }
    } else if (typeof accBarOutlineGradientDirection === "number") {
        outlineAngle = accBarOutlineGradientDirection;
    }

    // Handle Outline Gradient
    let outlineX0 = barX - accBarOutlineThickness,
        outlineY0 = barY - accBarOutlineThickness;
    let outlineX1 = outlineX0 + accBarWidth + accBarOutlineThickness * 2,
        outlineY1 = outlineY0;

    // Rotate the outline gradient based on angle
    if (outlineAngle !== null) {
        const radians = (outlineAngle * Math.PI) / 180;
        const halfW = (accBarWidth + accBarOutlineThickness * 2) / 2;
        const halfH = (accBarHeight + accBarOutlineThickness * 2) / 2;
        const cx = outlineX0 + halfW;
        const cy = outlineY0 + halfH;

        const dx = Math.cos(radians) * halfW;
        const dy = Math.sin(radians) * halfH;

        outlineX0 = cx - dx;
        outlineY0 = cy - dy;
        outlineX1 = cx + dx;
        outlineY1 = cy + dy;
    }

    if (Array.isArray(accBarOutlineColor)) {
        const allAreObjectsWithStops = accBarOutlineColor.every((c) => typeof c === "object" && c.color && typeof c.position === "number");

        const outlineGradient = ctx2.createLinearGradient(outlineX0, outlineY0, outlineX1, outlineY1);

        if (allAreObjectsWithStops) {
            accBarOutlineColor.forEach(({ color, position }) => {
                outlineGradient.addColorStop(position, color);
            });
        } else {
            let colorsToUse = [...accBarOutlineColor];

            if (accBarOutlineGradientDirection === "middle") {
                const reversed = [...colorsToUse].reverse();
                if (colorsToUse.length > 1) reversed.shift();
                colorsToUse = [...reversed, ...colorsToUse];

                if (accBarOutlineCenterBlengin && colorsToUse.length % 2 === 1) {
                    const centerIndex = Math.floor(colorsToUse.length / 2);
                    const centerColor = colorsToUse[centerIndex];
                    const transparent = `rgba(${hexToRgb(centerColor)},0)`;
                    colorsToUse.splice(centerIndex, 0, transparent);
                }
            } else if (accBarOutlineGradientDirection === "inverse middle") {
                const reversed = [...colorsToUse];
                if (reversed.length > 1) reversed.pop();
                colorsToUse = [...colorsToUse, ...reversed.reverse()];

                if (accBarOutlineCenterBlengin && colorsToUse.length % 2 === 1) {
                    const centerIndex = Math.floor(colorsToUse.length / 2);
                    const centerColor = colorsToUse[centerIndex];
                    const transparent = `rgba(${hexToRgb(centerColor)},0)`;
                    colorsToUse.splice(centerIndex, 0, transparent);
                }
            }

            colorsToUse.forEach((color, index) => {
                const position = index / (colorsToUse.length - 1);
                outlineGradient.addColorStop(position, color);
            });
        }

        ctx2.fillStyle = outlineGradient;
    } else {
        ctx2.fillStyle = accBarOutlineColor;
    }

    let outlineColors = accBarOutlineColor;
    if (outlineCopiesInsideBarCols && Array.isArray(accBarColors)) {
        outlineColors = accBarColors.map((c) => (typeof c === "object" && c.color ? c.color : c));
    }

    if (Array.isArray(outlineColors)) {
        const allAreObjectsWithStops = outlineColors.every((c) => typeof c === "object" && c.color && typeof c.position === "number");

        const outlineGradient = ctx2.createLinearGradient(outlineX0, outlineY0, outlineX1, outlineY1);

        if (allAreObjectsWithStops) {
            outlineColors.forEach(({ color, position }) => {
                outlineGradient.addColorStop(position, color);
            });
        } else {
            let colorsToUse = [...outlineColors];

            if (accBarOutlineGradientDirection === "middle") {
                const reversed = [...colorsToUse].reverse();
                if (colorsToUse.length > 1) reversed.shift();
                colorsToUse = [...reversed, ...colorsToUse];

                if (accBarOutlineCenterBlending && colorsToUse.length % 2 === 1) {
                    const centerIndex = Math.floor(colorsToUse.length / 2);
                    const centerColor = colorsToUse[centerIndex];
                    const transparent = `rgba(${hexToRgb(centerColor)},0)`;
                    colorsToUse.splice(centerIndex, 0, transparent);
                }
            } else if (accBarOutlineGradientDirection === "inverse middle") {
                const reversed = [...colorsToUse];
                if (reversed.length > 1) reversed.pop();
                colorsToUse = [...colorsToUse, ...reversed.reverse()];

                if (accBarOutlineCenterBlending && colorsToUse.length % 2 === 1) {
                    const centerIndex = Math.floor(colorsToUse.length / 2);
                    const centerColor = colorsToUse[centerIndex];
                    const transparent = `rgba(${hexToRgb(centerColor)},0)`;
                    colorsToUse.splice(centerIndex, 0, transparent);
                }
            }

            colorsToUse.forEach((color, index) => {
                const position = index / (colorsToUse.length - 1);
                outlineGradient.addColorStop(position, color);
            });
        }

        ctx2.fillStyle = outlineGradient;
    } else {
        ctx2.fillStyle = outlineColors;
    }

    // Apply shadow only to outline and line, not inside bar
    if (accBarShadow && accBarOutline) {
        ctx2.shadowColor = accBarShadowCol; // Set the shadow color
        ctx2.shadowBlur = accBarShadowSize; // Set the shadow blur size
    }

    // Draw outline with rounded corners (same as inside bar logic)
    if (accBarOutline) {
        if (accBarRoundCorner > 0) {
            const corner = accBarRoundCorner;
            ctx2.beginPath();
            ctx2.moveTo(barX - accBarOutlineThickness + corner, barY - accBarOutlineThickness);
            ctx2.lineTo(barX + accBarWidth + accBarOutlineThickness - corner, barY - accBarOutlineThickness);
            ctx2.quadraticCurveTo(
                barX + accBarWidth + accBarOutlineThickness,
                barY - accBarOutlineThickness,
                barX + accBarWidth + accBarOutlineThickness,
                barY - accBarOutlineThickness + corner
            );
            ctx2.lineTo(barX + accBarWidth + accBarOutlineThickness, barY + accBarHeight + accBarOutlineThickness - corner);
            ctx2.quadraticCurveTo(
                barX + accBarWidth + accBarOutlineThickness,
                barY + accBarHeight + accBarOutlineThickness,
                barX + accBarWidth + accBarOutlineThickness - corner,
                barY + accBarHeight + accBarOutlineThickness
            );
            ctx2.lineTo(barX - accBarOutlineThickness + corner, barY + accBarHeight + accBarOutlineThickness);
            ctx2.quadraticCurveTo(
                barX - accBarOutlineThickness,
                barY + accBarHeight + accBarOutlineThickness,
                barX - accBarOutlineThickness,
                barY + accBarHeight + accBarOutlineThickness - corner
            );
            ctx2.lineTo(barX - accBarOutlineThickness, barY + corner);
            ctx2.quadraticCurveTo(
                barX - accBarOutlineThickness,
                barY - accBarOutlineThickness,
                barX - accBarOutlineThickness + corner,
                barY - accBarOutlineThickness
            );
            ctx2.closePath();
            ctx2.fill();
        } else {
            ctx2.fillRect(
                barX - accBarOutlineThickness,
                barY - accBarOutlineThickness,
                accBarWidth + accBarOutlineThickness * 2,
                accBarHeight + accBarOutlineThickness * 2
            );
        }
    }

    // Reset shadow properties after drawing the hit line
    if (accBarShadow && accBarOutline) {
        ctx2.shadowColor = "transparent"; // Reset shadow to avoid affecting other parts
        ctx2.shadowBlur = 0;
    }

    // Inside Gradient Rotation Logic
    if (typeof accBarGradientDirection === "string" && !accBarInsideRotatingGradient) {
        switch (accBarGradientDirection) {
            case "top":
                insideAngle = 90;
                break;
            case "bottom":
                insideAngle = 270;
                break;
            case "left":
                insideAngle = 0;
                break;
            case "right":
                insideAngle = 180;
                break;
            case "middle":
            case "inverseMiddle":
                break; // custom handled below
        }
    } else if (typeof accBarGradientDirection === "number") {
        insideAngle = accBarGradientDirection;
    }

    // Handle Inside Gradient
    let insideX0 = barX,
        insideY0 = barY,
        insideX1 = barX + accBarWidth,
        insideY1 = barY;

    // Rotate the inside gradient based on angle
    if (insideAngle !== null) {
        const radians = (insideAngle * Math.PI) / 180;
        const halfW = accBarWidth / 2;
        const halfH = accBarHeight / 2;
        const cx = barX + halfW;
        const cy = barY + halfH;

        const dx = Math.cos(radians) * halfW;
        const dy = Math.sin(radians) * halfH;

        insideX0 = cx - dx;
        insideY0 = cy - dy;
        insideX1 = cx + dx;
        insideY1 = cy + dy;
    }

    // Prepare the gradient
    if (Array.isArray(accBarColors)) {
        const allAreObjectsWithStops = accBarColors.every((c) => typeof c === "object" && c.color && typeof c.position === "number");

        // Now apply the inside gradient rotation
        const insideGradient = ctx2.createLinearGradient(insideX0, insideY0, insideX1, insideY1);

        if (allAreObjectsWithStops) {
            accBarColors.forEach(({ color, position }) => {
                insideGradient.addColorStop(position, color);
            });
        } else {
            let colorsToUse = [...accBarColors];

            if (accBarGradientDirection === "middle") {
                const reversed = [...colorsToUse].reverse();
                if (colorsToUse.length > 1) reversed.shift();
                colorsToUse = [...reversed, ...colorsToUse];

                // Apply center blending
                if (centerBlending && colorsToUse.length % 2 === 1) {
                    const centerIndex = Math.floor(colorsToUse.length / 2);
                    const centerColor = colorsToUse[centerIndex];

                    const transparent = `rgba(${hexToRgb(centerColor)},0)`;
                    colorsToUse.splice(centerIndex, 0, transparent);
                }
            } else if (accBarGradientDirection === "inverseMiddle") {
                const reversed = [...colorsToUse];
                if (reversed.length > 1) reversed.pop();
                colorsToUse = [...colorsToUse, ...reversed.reverse()];

                // Apply center blending
                if (centerBlending && colorsToUse.length % 2 === 1) {
                    const centerIndex = Math.floor(colorsToUse.length / 2);
                    const centerColor = colorsToUse[centerIndex];

                    const transparent = `rgba(${hexToRgb(centerColor)},0)`;
                    colorsToUse.splice(centerIndex, 0, transparent);
                }
            }

            colorsToUse.forEach((color, index) => {
                const position = index / (colorsToUse.length - 1);
                insideGradient.addColorStop(position, color);
            });
        }

        ctx2.fillStyle = insideGradient;
    } else {
        ctx2.fillStyle = accBarColors;
    }

    // Apply shadow only to outline and line, not inside bar
    if (accBarShadow && !accBarOutline) {
        ctx2.shadowColor = accBarShadowCol; // Set the shadow color
        ctx2.shadowBlur = accBarShadowSize; // Set the shadow blur size
    }

    // Draw the inside bar and handle shadow
    if (accBarRoundCorner > 0) {
        const corner = accBarRoundCorner;
        ctx2.beginPath();
        ctx2.moveTo(barX + corner, barY);
        ctx2.lineTo(barX + accBarWidth - corner, barY);
        ctx2.quadraticCurveTo(barX + accBarWidth, barY, barX + accBarWidth, barY + corner);
        ctx2.lineTo(barX + accBarWidth, barY + accBarHeight - corner);
        ctx2.quadraticCurveTo(barX + accBarWidth, barY + accBarHeight, barX + accBarWidth - corner, barY + accBarHeight);
        ctx2.lineTo(barX + corner, barY + accBarHeight);
        ctx2.quadraticCurveTo(barX, barY + accBarHeight, barX, barY + accBarHeight - corner);
        ctx2.lineTo(barX, barY + corner);
        ctx2.quadraticCurveTo(barX, barY, barX + corner, barY);
        ctx2.closePath();
        ctx2.fill();
    } else {
        ctx2.fillRect(barX, barY, accBarWidth, accBarHeight);
    }

    // Reset shadow properties after drawing the hit line
    if (accBarShadow && !accBarOutline) {
        ctx2.shadowColor = "transparent"; // Reset shadow to avoid affecting other parts
        ctx2.shadowBlur = 0;
    }

    // Calculate the scale factor dynamically based on accBarWidth
    const baseWidth = 440; // The base width where scale is 1
    const scaleFactor = 1 + (accBarWidth - baseWidth) / baseWidth; // Linearly scale the factor

    // Calculate the targetLineX based on distanceFromCenter
    if (Math.abs(distanceFromCenter) < 6 && exactHit) {
        targetLineX = barX + accBarWidth / 2; // Position exactly at the center
    } else {
        targetLineX = barX + accBarWidth / 2 + distanceFromCenter * scaleFactor;
    }

    // Ensure targetLineX is within bounds of the accuracy bar
    targetLineX = Math.max(barX, Math.min(barX + accBarWidth, targetLineX));

    if (animateHitLine) {
        // Move the hit line across the accuracy bar smoothly
        const divisor = distanceFromCenter > 60 ? 4 : 8;
        const speed = (accBarWidth / 100) * (deltaTime / divisor);

        if (displayedLineX < targetLineX) {
            displayedLineX = Math.min(displayedLineX + speed, targetLineX);
        } else if (displayedLineX > targetLineX) {
            displayedLineX = Math.max(displayedLineX - speed, targetLineX);
        }
    } else {
        displayedLineX = targetLineX;
    }

    // Now for hit line shadow:
    if (accBarHitLineShadow) {
        ctx2.shadowColor = accBarHitLineShadowCol; // Set the shadow color for hit line
        ctx2.shadowBlur = accBarHitLineShadowSize; // Set the shadow blur size for hit line
    }

    // Draw active line or image depending on useLineOrImg
    if (useLineOrImg === 0) {
        // Draw active line
        ctx2.lineWidth = 5;
        ctx2.strokeStyle = `rgba(255, 255, 255, ${activeLineOpacity})`;
        ctx2.beginPath();
        ctx2.moveTo(displayedLineX, barY - 10);
        ctx2.lineTo(displayedLineX, barY + accBarHeight + 10);
        ctx2.stroke();
    } else if (useLineOrImg === 1) {
        // Draw active image (hit line image)
        ctx2.globalAlpha = activeLineOpacity; // Set opacity
        ctx2.drawImage(hitLineImg, displayedLineX - 4 / 2, barY - 15, 4, accBarHeight + 30); // Adjust width and height
        ctx2.globalAlpha = 1.0; // Reset opacity
    }

    // Reset shadow properties after drawing the hit line
    if (accBarHitLineShadow) {
        ctx2.shadowColor = "transparent"; // Reset shadow to avoid affecting other parts
        ctx2.shadowBlur = 0;
    }

    // Add new hit only when distance changes
    if (distanceFromCenter !== lastDistanceFromCenter) {
        const hit = { x: targetLineX, opacity: fadedOpacity, time: now };
        previousHits.push(hit);

        // Start fade-out after timeToRemoveHitLine
        if (fadeOutOldLines) {
            setTimeout(() => {
                let fadeDuration = timeToFadeOutPreviousLines;
                let fadeSteps = 30;
                let fadeAmount = hit.opacity / fadeSteps;

                hit.fadeInterval = setInterval(() => {
                    hit.opacity -= fadeAmount;
                    if (hit.opacity <= 0) {
                        hit.opacity = 0;
                        clearInterval(hit.fadeInterval); // Stop fading
                    }
                }, fadeDuration / fadeSteps);
            }, timeToFadePreviousLines); // Delay fade for timeToFadePreviousLines
        }

        lastDistanceFromCenter = distanceFromCenter;
    }

    // If we exceed maxBars, start fading out the oldest hit
    if (previousHits.length > maxBars) {
        if (!fadeOutLinesAfterMax) {
            previousHits.shift();
            return;
        }
        const oldestHit = previousHits[0];

        // Start fading out the oldest hit line
        const fadeDuration = timeToFadeOutPreviousLines; // Set your fade-out duration
        const fadeSteps = 30;
        const fadeAmount = oldestHit.opacity / fadeSteps;

        clearInterval(oldestHit.fadeInInterval);

        oldestHit.fadeInterval = setInterval(() => {
            oldestHit.opacity -= fadeAmount;
            if (oldestHit.opacity <= 0) {
                oldestHit.opacity = 0;
                clearInterval(oldestHit.fadeInterval); // Stop fading
            }
        }, fadeDuration / fadeSteps);
    }

    // Clean up hits that are fully faded
    previousHits = previousHits.filter((hit) => hit.opacity > 0);

    // Draw previous hits (either as a line or image)
    ctx2.lineWidth = 3;
    previousHits.forEach((hit) => {
        if (useLineOrImg === 0) {
            // Draw line for previous hits
            ctx2.strokeStyle = `rgba(255, 255, 255, ${hit.opacity})`;
            ctx2.beginPath();
            ctx2.moveTo(hit.x, barY - 7);
            ctx2.lineTo(hit.x, barY + accBarHeight + 7);
            ctx2.stroke();
        } else if (useLineOrImg === 1) {
            // Draw image for previous hits
            ctx2.globalAlpha = hit.opacity; // Set opacity for previous hits
            ctx2.drawImage(hitLineImg, hit.x - 4 / 2, barY - 15, 2, accBarHeight + 30); // Adjust width and height
            ctx2.globalAlpha = 1.0; // Reset opacity
        }
    });

    // Check for timeout since last hit, then fade out
    if (performance.now() - lastHitTime > timeToFadeHitLine && activeLineOpacity > 0 && !fadeOutInterval) {
        if (!fadeOutHitLine) return;
        const fadeDuration = timeToFadeOutHitLine;
        const fadeSteps = 30;
        const fadeAmount = activeLineOpacity / fadeSteps;

        fadeOutInterval = setInterval(() => {
            isHitLineFading = true;
            activeLineOpacity -= fadeAmount;
            if (activeLineOpacity <= 0) {
                activeLineOpacity = 0;
                clearInterval(fadeOutInterval);
                fadeOutInterval = null;
                isHitLineFading = false;
                hasHitLineFadedOut = true;
            }
        }, fadeDuration / fadeSteps);
    }

    // Offset text (for offset display if enabled)
    if (showOffsetOnAccuracyBar && lastHitOffset !== null && lastHitOffsetTime !== null) {
        const timeSinceOffset = performance.now() - lastHitOffsetTime;

        if (fadeOutOffsetText) {
            if (timeSinceOffset > timeToFadeOffsetText && offsetTextOpacity > 0 && !offsetTextFadeOutInterval) {
                const fadeDuration = timeToFadeOutOffsetText;
                const fadeSteps = 30;
                const fadeAmount = offsetTextOpacity / fadeSteps;

                offsetTextFadeOutInterval = setInterval(() => {
                    offsetTextOpacity -= fadeAmount;
                    if (offsetTextOpacity <= 0) {
                        offsetTextOpacity = 0;
                        clearInterval(offsetTextFadeOutInterval);
                        offsetTextFadeOutInterval = null;
                    }
                }, fadeDuration / fadeSteps);
            }
        }

        if (offsetTextOpacity > 0) {
            ctx2.fillStyle = `rgba(255, 255, 255, ${offsetTextOpacity})`;
            ctx2.font = "20px Poppins";
            ctx2.textAlign = "center";

            let offsetText = "";

            if (showMSorPixels === 0) {
                offsetText = `${lastHitOffset > 0 ? "+" : ""}${Math.round(lastHitOffset)}ms`;
            } else {
                const pixelOffset = Math.round(lastDistanceFromCenter);
                offsetText = `${pixelOffset > 0 ? "+" : ""}${pixelOffset}px`;
            }

            ctx2.fillText(offsetText, WIDTH / 2, upscroll ? barY + 45 : barY - 20);
        }
    }
}

function updateAccuracy() {
    const attemptedNotes = exactHits + insanes + perfects + lates + earlys + misses;

    if (attemptedNotes > 0) {
        const correctHits = exactHits + insanes + perfects;
        accuracy = (correctHits / attemptedNotes) * 100;
    } else {
        accuracy = 100;
    }
}

function updateNoteProgress() {
    const totalNotes = customNotes.length > 0 ? customNotes.length : numberOfNotes;

    if (notesHit >= -1) {
        noteProgress = (notesHit / totalNotes) * 100;
    } else {
        noteProgress = 0;
    }
}

let lastMissed = false; // Flag to track if the last note was missed

function updateNotes(deltaTime) {
    for (let i = 0; i < notes.length; i++) {
        const note = notes[i];

        // Use individual speed if defined, else use global noteSpeed
        const noteSpeedToUse = note.ownSpeed !== undefined ? note.ownSpeed : noteSpeed;

        // Update the note's position using the specific note's speed
        note.y += (upscroll ? -1 : 1) * noteSpeedToUse * (deltaTime / 6); // Reverse direction if upscroll is true

        const noteType = note.type;
        const savedtimestamp = note.timestamp;

        // Check if the note is off the screen
        if ((!upscroll && note.y > HEIGHT + noteSize) || (upscroll && note.y < -noteSize)) {
            if (!noteType.startsWith("Rec") && noteType !== "beatLine" && !note.faded) {
                hitArray.missed.push({ type: noteType, timestamp: savedtimestamp });
                streak = 0;
                hitType = "Miss";
                hitTypeID = 4;
                misses++;
                updateAccuracy();

                if (!lastMissed) {
                    showHitType();
                    lastMissed = true;
                }

                notes.splice(i, 1);
                i--;
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

            if (!accurateAutoHit) {
                if (upscroll ? note.y < 102 && !note.faded : note.y > Math.random() * (565 - 465) + 465 && !note.faded) {
                    simulateKeyPress(note); // Auto-hit the whole note, including its hold duration
                }
            } else {
                if (upscroll ? note.y < 102 && !note.faded : note.y > 498 && !note.faded) {
                    simulateKeyPress(note); // Auto-hit the whole note, including its hold duration
                }
            }
        });
    }
}

// Simulate key press for a note object (includes noteType and hold duration)
function simulateKeyPress(note) {
    const noteType = note.type;
    const keyCode = Object.keys(keyBindings).find((code) => keyBindings[code] === noteType);

    if (keyCode) {
        // Trigger keydown event with correct event.code
        document.dispatchEvent(new KeyboardEvent("keydown", { code: keyCode }));

        // If the note is a hold note, we simulate the press for the hold duration
        if (note.hold && note.hold > 0) {
            // Trigger keyup event after the duration of the hold
            setTimeout(() => {
                document.dispatchEvent(new KeyboardEvent("keyup", { code: keyCode }));
            }, note.hold + 10);
        } else {
            // If it's not a hold note, just trigger the keyup event after a short random delay
            setTimeout(() => {
                document.dispatchEvent(new KeyboardEvent("keyup", { code: keyCode }));
            }, 25);
        }
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

const epVideoStartTimes = {
    Dreamer: 36,
    Bloom: 253.23,
    Japan: 546.2,
    "For me": 758.7,
    Cities: 988,
    "Where U Are": 1168.68
};

// Function to get the background video filename based on the current song
function getBackgroundVideoPath(songPath) {
    if (!songPath) return null;

    // Extract song title without extension
    let fileName = songPath.split("/").pop();
    fileName = fileName.replace(/\.[^/.]+$/, ""); // Remove file extension
    fileName = decodeURIComponent(fileName); // Decode URI if necessary

    return `Resources/bgVideos/${fileName}.mp4`;
}

function startGame(rec = false, customSong = false) {
    const backgroundOverlay = document.getElementById("backgroundOverlay");
    let videoPath;
    const epTimestamp = epVideoStartTimes[getSongTitle(currentSong.src)];

    if (currentSong.src.includes("Idols.mp3")) {
        const options = ["Resources/bgVideos/Idols.mp4", "Resources/bgVideos/IdolsVid.mp4"];
        videoPath = options[Math.floor(Math.random() * options.length)];
    } else if (epTimestamp !== undefined) {
        videoPath = "Resources/bgVideos/Where U Are EP.mp4";
    } else {
        videoPath = getBackgroundVideoPath(currentSong.src);
    }

    // If backgroundVids is disabled, skip video logic entirely
    if (!backgroundVids) {
        video.remove(); // Just ensure no orphaned video element
        const fallback = () => playGame(true);

        if (video.readyState >= 3) {
            fallback(); // Already enough data to play
        } else {
            video.addEventListener("error", fallback, { once: true });
            video.addEventListener("canplaythrough", fallback, { once: true });
        }

        return;
    }
    // Create the video element
    const video = document.createElement("video");
    video.src = videoPath;
    video.autoplay = false;
    video.loop = false;
    video.muted = true;
    video.id = "backgroundVideo";
    video.style.opacity = "0";
    video.style.width = "100%";
    video.style.height = "100%";
    video.style.objectFit = "cover";
    video.style.zIndex = "0";
    video.style.filter = `brightness(${brightnessAmount / maxBrightnessAmount})`;
    video.style.transition = "opacity 3s ease-in-out, filter 1.5s ease-in-out"; // Added transition for brightness

    // Handle custom song logic
    if (customSong) {
        let mp3File = songFileInput.files[0];
        let videoFile = videoFileInput.files[0];

        if (mp3File && mp3File instanceof File && videoFile && videoFile instanceof File) {
            // If both MP3 and Video are selected
            currentSong.src = URL.createObjectURL(mp3File); // Play the MP3 as currentSong

            // Set the new video source
            const videoPath = URL.createObjectURL(videoFile);
            video.src = videoPath;
            video.muted = true; // Mute the video
            video.loop = true; // Loop the video
            video.style.objectFit = "auto";
        } else if (mp3File && mp3File instanceof File) {
            // If only MP3 is selected
            currentSong.src = URL.createObjectURL(mp3File);
        } else if (videoFile && videoFile instanceof File) {
            // If only Video is selected, treat video as currentSong
            const videoPath = URL.createObjectURL(videoFile);
            currentSong = video; // Treat the video as the currentSong
            video.src = videoPath;
            video.muted = false; // Use video audio
            video.loop = true; // Loop the video
            video.style.objectFit = "auto";
        } else {
            console.error("No valid MP3 or Video file selected");
        }
    }

    // Audio analyzer setup if customSong is true or if no mp3 was provided
    if (!isFileProtocol && !currentSong.src.includes(".mp3") && currentSong instanceof HTMLVideoElement) {
        // Set up the audio context if it's a video element (without MP3)
        try {
            if (!window.audioCtx) {
                window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

                // Create a splitter for stereo analysis
                window.splitter = audioCtx.createChannelSplitter(2);
                window.analyserLeft = audioCtx.createAnalyser();
                window.analyserRight = audioCtx.createAnalyser();

                analyserLeft.fftSize = 2048;
                analyserRight.fftSize = 2048;

                window.dataArrayLeft = new Uint8Array(analyserLeft.frequencyBinCount);
                window.dataArrayRight = new Uint8Array(analyserRight.frequencyBinCount);

                try {
                    window.sourceNode = audioCtx.createMediaElementSource(currentSong);
                    sourceNode.connect(splitter);
                    splitter.connect(analyserLeft, 0);
                    splitter.connect(analyserRight, 1);

                    // For audio playback
                    sourceNode.connect(audioCtx.destination);

                    console.log("Stereo AudioContext connected successfully.");
                } catch (err2) {
                    console.warn("Failed to create MediaElementSource:", err2);
                    window.analyserLeft = null;
                    window.analyserRight = null;
                    window.sourceNode = null;
                }
            }
        } catch (err) {
            console.warn("AudioContext init failed:", err);
        }
    }

    // Special case for Magnolia
    const isMagnolia = currentSong.src.includes("Magnolia.mp3");
    const isFEIN = currentSong.src.includes("FE!N.mp3");
    const isKOCMOC = currentSong.src.includes("KOCMOC.mp3");

    function playGame(playSong = true) {
        gameStarted = true;
        console.log("Game started.");

        if (upscroll) {
            targetYPosition = 100;
            targetYPositionStart = 200;
            targetYPositionEnd = 0;
        } else if (rec) {
            targetYPosition = HEIGHT / 2 - 300;
        } else {
            targetYPosition = 500;
            targetYPositionStart = 320;
            targetYPositionEnd = 680;
        }

        console.log(targetYPosition, targetYPositionStart, targetYPositionEnd);

        if (!currentSong) {
            console.error("No song loaded.");
            return;
        }

        if (playSong) currentSong.play();

        notes = [];
        starttime = Date.now();
        generateNotes();

        gameLoopRef = requestAnimationFrame(gameLoop);

        // Restart background visualizer
        if (pulseBGtoBPM) {
            if (volumePulseLoop) cancelAnimationFrame(volumePulseLoop);
            volumePulseLoop = requestAnimationFrame(animateBackgroundToVolume);
        }

        // Continue with game logic
        previousHits = [];
        lastTime = Date.now();

        backgroundOverlay.style.backgroundImage = 'url("Resources/defaultBG.png")'; // Restore image

        if (!isFileProtocol && currentSong instanceof HTMLAudioElement) {
            try {
                if (!window.audioCtx) {
                    window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

                    // Create a splitter for stereo analysis
                    window.splitter = audioCtx.createChannelSplitter(2);
                    window.analyserLeft = audioCtx.createAnalyser();
                    window.analyserRight = audioCtx.createAnalyser();

                    analyserLeft.fftSize = 2048;
                    analyserRight.fftSize = 2048;

                    window.dataArrayLeft = new Uint8Array(analyserLeft.frequencyBinCount);
                    window.dataArrayRight = new Uint8Array(analyserRight.frequencyBinCount);

                    try {
                        window.sourceNode = audioCtx.createMediaElementSource(currentSong);
                        sourceNode.connect(splitter);
                        splitter.connect(analyserLeft, 0);
                        splitter.connect(analyserRight, 1);

                        // For audio playback
                        sourceNode.connect(audioCtx.destination);

                        // Start the game loop as well (ensure gameLoop is running continuously)

                        console.log("Stereo AudioContext connected successfully.");
                    } catch (err2) {
                        console.warn("Failed to create MediaElementSource:", err2);
                        window.analyserLeft = null;
                        window.analyserRight = null;
                        window.sourceNode = null;
                    }
                }
            } catch (err) {
                console.warn("AudioContext init failed:", err);
            }
        }

        if (blurCanvasOnDefault) canvas.style.backdropFilter = `blur${blurAmountOnDefault}px`;

        if (pulseToBPM) {
            if (currentSong.src.includes("Space%20Invaders.mp3")) {
                setTimeout(() => {
                    console.log("pulse started with a 692 delay");
                    newBpmPulseInterval(BPM);
                }, 692);
            } else {
                console.log("pulse started with no delay");
                newBpmPulseInterval(BPM);
            }
        }

        currentSong.addEventListener("ended", () => {
            if (pulseBPMinterval) {
                clearInterval(pulseBPMinterval);
                pulseBPMinterval = null;
            }

            if (isMagnolia) {
                video.muted = false;
                video.style.filter = "brightness(1)"; // Increase brightness
            }

            if (fallbackAlbumBG) {
                backgroundOverlay.style.backgroundImage = 'url("Resources/defaultBG.png")';
                if (blurAmountOnDefault) canvas.style.backdropFilter = `blur(${blurAmountOnDefault}px)`;
                else canvas.style.backdropFilter = "none";

                const rotatingAlbum = backgroundOverlay.querySelector("div");
                if (rotatingAlbum) backgroundOverlay.removeChild(rotatingAlbum);
            }
        });

        // Show buttons
        const buttonsToShow = [
            "fullscreen",
            "settingsButton",
            "songVol",
            "hitSoundVol"
        ];
        buttonsToShow.forEach((id) => (document.getElementById(id).style.display = "inline"));

        // Hide start button
        document.getElementById("startButton").style.display = "none";
    }

    video.addEventListener("loadedmetadata", () => {
        // If video loads successfully, replace the background
        video.addEventListener("canplaythrough", () => {
            if (gameStarted) return;
            console.log(`Background video found: ${videoPath}`);

            // Append video and try to load
            backgroundOverlay.innerHTML = "";
            backgroundOverlay.appendChild(video);

            requestAnimationFrame(() => {
                video.style.transition = "opacity 0.3s ease";
                video.style.opacity = "1";
            });

            if (blurCanvasOnVids) canvas.style.backdropFilter = `blur(${blurAmountOnVids}px)`;
            else canvas.style.backdropFilter = "none";

            if (isMagnolia) {
                video.muted = false;
                video.style.filter = "brightness(1)";
                video.play().then(() => {
                    requestAnimationFrame(() => {
                        if (!gameStarted) {
                            playGame(false);
                        }
                    });
                });

                // Wait 4 seconds before fading out video and starting song
                setTimeout(() => {
                    // Fade out video

                    // Start playing the song and fade it in
                    currentSong.volume = 0;
                    currentSong.play();

                    setTimeout(() => {
                        video.muted = true;
                        currentSong.volume = 1;

                        setTimeout(() => {
                            video.style.filter = `brightness(${brightnessAmount})`;
                        }, 1500);
                    }, 650);
                }, 5200);
            } else if (isFEIN) {
                video.muted = false;
                video.style.filter = "brightness(1)";
                video.play().then(() => {
                    requestAnimationFrame(() => {
                        if (!gameStarted) {
                            playGame(false);
                        }
                    });
                });
                video.volume = 1;

                // Wait 4 seconds before fading out video and starting song
                setTimeout(() => {
                    // Fade out video

                    // Start playing the song and fade it in
                    currentSong.play();
                    video.muted = true;
                    video.style.filter = `brightness(${brightnessAmount})`;
                }, 7200);
            } else if (isKOCMOC) {
                video.loop = true;
                video.play().then(() => {
                    requestAnimationFrame(() => {
                        if (!gameStarted) {
                            playGame();
                        }
                    });
                });
            } else if (currentSong.src.includes("Powersound.mp3")) {
                video.loop = true;
                video.play();

                // Powersound special timed fade and restart using timeout
                setTimeout(() => {
                    // Create black overlay
                    const blackOverlay = document.createElement("div");
                    blackOverlay.id = "blackOverlay";
                    blackOverlay.style.position = "absolute";
                    blackOverlay.style.top = "0";
                    blackOverlay.style.left = "0";
                    blackOverlay.style.width = "100%";
                    blackOverlay.style.height = "100%";
                    blackOverlay.style.backgroundColor = "black";
                    blackOverlay.style.opacity = "0";
                    blackOverlay.style.transition = "opacity 1s ease-in-out";
                    blackOverlay.style.zIndex = "1"; // Above video

                    backgroundOverlay.appendChild(blackOverlay);

                    // Fade in black
                    requestAnimationFrame(() => {
                        blackOverlay.style.opacity = "1";
                    });

                    // After black fade-in, reset video
                    setTimeout(() => {
                        video.style.opacity = "0";

                        setTimeout(() => {
                            video.currentTime = 0;
                            video.play().then(() => {
                                requestAnimationFrame(() => {
                                    if (!gameStarted) {
                                        playGame();
                                    }
                                });
                            });
                            video.style.opacity = "1";

                            // Fade out black overlay
                            blackOverlay.style.opacity = "0";

                            // Clean up black overlay
                            setTimeout(() => {
                                if (blackOverlay.parentElement) {
                                    blackOverlay.parentElement.removeChild(blackOverlay);
                                }
                            }, 1000);
                        }, 1000);
                    }, 1000);
                }, 227000); // 230.3 seconds = 230300 ms

                // Prevent duplicate note generation if already started
            } else {
                if (epTimestamp !== undefined) {
                    video.currentTime = epTimestamp;
                }

                video.play().then(() => {
                    requestAnimationFrame(() => {
                        video.style.transition = "opacity 0.3s ease";
                        video.style.opacity = "1";

                        if (!gameStarted) {
                            playGame();
                        }
                    });
                });
            }
        });
    });

    video.addEventListener("error", () => {
        console.warn("No background video found, using default image or fallback album cover.");
        backgroundOverlay.innerHTML = ""; // Clear any previous content

        // Try fallback album cover
        if (fallbackAlbumBG) {
            const albumName = getSongTitle(currentSong.src);
            const albumPath = `Resources/Covers/${albumName}.jpg`;

            const testImg = new Image();
            testImg.src = albumPath;

            testImg.onload = () => {
                const albumContainer = document.createElement("div");
                albumContainer.className = "rotatingAlbumContainer";

                const albumImg = document.createElement("img");
                albumImg.src = albumPath;
                albumContainer.appendChild(albumImg);

                backgroundOverlay.appendChild(albumContainer);
                if (blurCanvasOnCovers) canvas.style.backdropFilter = `blur(${blurAmountOnCovers}px)`;
                else canvas.style.backdropFilter = "none";
            };

            testImg.onerror = () => {
                backgroundOverlay.style.backgroundImage = 'url("Resources/defaultBG.png")';
            };
        } else {
            backgroundOverlay.style.backgroundImage = 'url("Resources/defaultBG.png")';
        }

        if (!gameStarted) playGame();
    });

    let videoFaded = false; // Prevent multiple fade triggers

    video.addEventListener("timeupdate", () => {
        if (!videoFaded && video.duration - video.currentTime <= 3) {
            videoFaded = true;

            if (video.loop) {
                // Create black overlay
                const blackOverlay = document.createElement("div");
                blackOverlay.id = "blackOverlay";
                blackOverlay.style.position = "absolute";
                blackOverlay.style.top = "0";
                blackOverlay.style.left = "0";
                blackOverlay.style.width = "100%";
                blackOverlay.style.height = "100%";
                blackOverlay.style.backgroundColor = "black";
                blackOverlay.style.opacity = "0";
                blackOverlay.style.transition = "opacity 1s ease-in-out";
                blackOverlay.style.zIndex = "1"; // Above video

                backgroundOverlay.appendChild(blackOverlay);

                // Fade in black
                requestAnimationFrame(() => {
                    blackOverlay.style.opacity = "1";
                });

                // Fade out black when video loops
                setTimeout(() => {
                    blackOverlay.style.opacity = "0";

                    // Clean up overlay after fade out
                    setTimeout(() => {
                        if (blackOverlay.parentElement) {
                            blackOverlay.parentElement.removeChild(blackOverlay);
                        }
                        videoFaded = false;
                    }, 1000);
                }, 1000);
            } else {
                console.log("Video about to end, fading to image...");
                video.style.opacity = "0";

                setTimeout(() => {
                    backgroundOverlay.innerHTML = "";
                    backgroundOverlay.style.opacity = "1";

                    if (blurCanvasOnDefault) canvas.style.backdropFilter = `blur(${blurAmountOnDefault}px)`;
                    else canvas.style.backdropFilter = "none";
                }, 3000);
            }
        }
    });

    currentSong.addEventListener("ended", () => {
        if (video.loop) {
            video.loop = false;
        }

        if (volumePulseLoop) {
            cancelAnimationFrame(volumePulseLoop);
            volumePulseLoop = null;
            backgroundOverlay.style.transform = "scale(1)";
        }
    });
}

let volumePulseLoop = null;

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

    // Check if BPM pulse should stop
    if (pulseBGtoBPMinterval) {
        clearInterval(pulseBGtoBPMinterval);
        pulseBGtoBPMinterval = null; // Prevent repeated calls
    }

    BPM = newBpm;
    beattime = (60 / newBpm) * 1000;

    pulseBPMinterval = setInterval(() => {
        fontSize += 6 + fontSizeIncrease; // Increase by 6
        smallFontSize += 3 + smallFSincrease;
        bpmPulseFontSize += 5 + bmpPulseFSincrease;

        if (pulseBGtoBPM) {
            // Scale the background overlay up by 0.5%
            backgroundOverlay.style.transition = `none`;
            backgroundOverlay.style.transform = "scale(1.014)";

            setTimeout(() => {
                backgroundOverlay.style.transition = `transform ${beattime / 4}ms ease-out`;
                backgroundOverlay.style.transform = "scale(1)";
            }, beattime * 0.15);
        }

        // Generate beatLine every beat time
        notes.push({
            type: "beatLine",
            y: -(noteSpawnY + (upscroll ? -HEIGHT : 0)),
            x: WIDTH / 2 // Centered
        });
    }, beattime);

    console.log("Applied new BPM pulse with increases:", fontSizeIncrease, smallFSincrease, bmpPulseFSincrease);
}

var progressBarCol = "rgb(255, 255, 255)";

function animateBackgroundToVolume() {
    if (!analyserRight || !analyserLeft || isFileProtocol) return;
    const dataArray = dataArrayLeft.map((val, i) => (val + dataArrayRight[i]) / 2);
    analyserLeft.getByteFrequencyData(dataArrayLeft);
    analyserRight.getByteFrequencyData(dataArrayRight);

    const BASS_RANGE_SIZE = 32;
    const LOW_BASS_RANGE_SIZE = 8;
    const TREBLE_RANGE_START = 64;

    const bassRange = dataArray.slice(0, BASS_RANGE_SIZE);
    const lowBassRange = dataArray.slice(0, LOW_BASS_RANGE_SIZE);
    const trebleRange = dataArray.slice(TREBLE_RANGE_START);

    const bassAvg = bassRange.reduce((a, b) => a + b, 0) / bassRange.length;
    const lowBassAvg = lowBassRange.reduce((a, b) => a + b, 0) / lowBassRange.length;
    const overallAvg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    const trebleAvg = trebleRange.reduce((a, b) => a + b, 0) / trebleRange.length;

    const normalizedBass = bassAvg / 255;
    const normalizedLowBass = lowBassAvg / 255;
    const normalizedOverall = overallAvg / 255;
    const normalizedTreble = trebleAvg / 255;

    let boostedBassScale = normalizedBass;
    if (exponentialCurveOnBG) {
        if (normalizedBass > 0.9) {
            boostedBassScale *= 3;
        } else if (normalizedBass > 0.89) {
            boostedBassScale *= 2.9;
        } else if (normalizedBass > 0.88) {
            boostedBassScale *= 2.8;
        } else if (normalizedBass > 0.87) {
            boostedBassScale *= 2.67;
        } else if (normalizedBass > 0.86) {
            boostedBassScale *= 2.54;
        } else if (normalizedBass > 0.85) {
            boostedBassScale *= 2.3;
        } else if (normalizedBass > 0.81) {
            boostedBassScale *= 1.6;
        } else if (normalizedBass > 0.75) {
            boostedBassScale *= 1.13;
        } else if (normalizedBass > 0.65) {
            boostedBassScale *= 1;
        } else if (normalizedBass > 0.4) {
            boostedBassScale *= 0.9;
        }
    }

    let boostedShakeStrength = normalizedBass * shakeMultiplier;
    if (exponentialCurveOnShake) {
        if (shakeWithTreble) {
            if (normalizedTreble > 0.9) {
                boostedShakeStrength *= 3.2;
            } else if (normalizedTreble > 0.85) {
                boostedShakeStrength *= 2.8;
            } else if (normalizedTreble > 0.81) {
                boostedShakeStrength *= 2;
            } else if (normalizedTreble > 0.75) {
                boostedShakeStrength *= 1.3;
            } else if (normalizedTreble > 0.65) {
                boostedShakeStrength *= 1.1;
            }
        }
        if (normalizedBass > 0.9) {
            boostedShakeStrength *= 3;
        } else if (normalizedBass > 0.85) {
            boostedShakeStrength *= 2.3;
        } else if (normalizedBass > 0.81) {
            boostedShakeStrength *= 1.2;
        } else if (normalizedBass > 0.75) {
            boostedShakeStrength *= 0.8;
        } else if (normalizedBass > 0.65) {
            boostedShakeStrength *= 0.5;
        } else if (normalizedBass > 0.4) {
            boostedShakeStrength *= 0.2;
        }

        if (normalizedLowBass > 0.9) {
            boostedShakeStrength *= 1.5;
        } else if (normalizedLowBass > 0.85) {
            boostedShakeStrength *= 1.2;
        } else if (normalizedLowBass > 0.81) {
            boostedShakeStrength *= 1.05;
        }
    }

    const boostedOverall = Math.pow(normalizedOverall, 1.5);
    const mix = (boostedBassScale * bassMultiplier + boostedOverall * trebleMultiplier) / 2;

    if (pulseBGwithSound) {
        const bassPulseScale = 1 + mix * 0.07;
        const avgPulseScale = 1 + normalizedOverall * 0.07;
        const treblePulseScale = 1 + normalizedTreble * 0.07;

        backgroundOverlay.style.transform = `scale(${bassPulseScale})`;

        if (visualizerReactionWithSong === "scaleBass") {
            backCanvas.style.transform = `translate(-50%, -50%) scale(${bassPulseScale * 1.07})`;
        } else if (visualizerReactionWithSong === "scaleAvg") {
            backCanvas.style.transform = `translate(-50%, -50%) scale(${avgPulseScale * 1.07})`;
        } else if (visualizerReactionWithSong === "scaleTreble") {
            backCanvas.style.transform = `translate(-50%, -50%) scale(${treblePulseScale * 1.07})`;
        }
    }

    if (brightenBGwithTreble) {
        const brightness = Math.min(maxBrightnessAmount, Math.max(brightnessAmount, normalizedOverall * 2));

        backgroundOverlay.style.filter = `brightness(${brightness})`;
    }

    if (shakeScreenWithBass && normalizedBass > bassThreshold) {
        shakeScreen(boostedShakeStrength, 16, 40, 0);
    }

    if (visualizerReactionWithSong === "shakeBass" && normalizedBass > bassThreshold) {
        shakeScreen(boostedShakeStrength - 0.25, 16, 75, 0, true, backCanvas);
    } else if (visualizerReactionWithSong === "shakeAvg" && normalizedOverall > bassThreshold) {
        shakeScreen(boostedShakeStrength * shakeMultiplier, 16, 75, 0, true, backCanvas);
    } else if (visualizerReactionWithSong === "shakeTreble" && normalizedTreble > bassThreshold) {
        shakeScreen(boostedShakeStrength * shakeMultiplier + 0.2, 16, 75, 0, true, backCanvas);
    }

    const chunkSize = Math.floor(dataArrayLeft.length / barCount);
    const middleX = canvas2.width / 2;

    if (!gamePaused) {
        for (let i = 0; i < barCount; i++) {
            const start = i * chunkSize;
            const end = start + chunkSize;

            // Mirror from center: low (middle), high (outside)
            const isLeftSide = i < barCount / 2;
            const mirrorIndex = isLeftSide ? barCount / 2 - 1 - i : i - barCount / 2;

            const chunkL = dataArrayLeft.slice(mirrorIndex * chunkSize, (mirrorIndex + 1) * chunkSize);
            const chunkR = dataArrayRight.slice(mirrorIndex * chunkSize, (mirrorIndex + 1) * chunkSize);

            const avgL = chunkL.reduce((a, b) => a + b, 0) / chunkL.length;
            const avgR = chunkR.reduce((a, b) => a + b, 0) / chunkR.length;

            const intensityL = avgL / 255;
            const intensityR = avgR / 255;

            // Apply non-linear scaling
            const scaledL = Math.pow(intensityL, 2.21); // try 1.5–2.0 for smoother results
            const scaledR = Math.pow(intensityR, 2.21);

            const heightL = scaledL * barMaxHeight;
            const heightR = scaledR * barMaxHeight;

            ctxBack.fillStyle = rgbaToHex(visualizerColor); // Color for both bars
            ctxBack.globalAlpha = visualizerOpacity;

            // Draw left bar (mirror from center)
            const leftX = middleX - barGap / 2 - (barWidth + barGap) * i - barWidth; //- 180;
            ctxBack.fillRect(leftX, canvas2.height - heightL, barWidth, heightL);

            // Draw right bar (mirror from center)
            const rightX = middleX + barGap / 2 + (barWidth + barGap) * i; // + 7; //+ 180;
            ctxBack.fillRect(rightX, canvas2.height - heightR, barWidth, heightR);

            ctxBack.globalAlpha = "1";
        }
    }

    // Update progressBarCol based on frequency ranges
    const bassColor = [0, 0, 255]; // blue
    const avgColor = [255, 2, 127]; // pink

    // Interpolation function
    const lerpColor = (color1, color2, factor) => {
        return color1.map((c, i) => Math.floor(c + (color2[i] - c) * Math.min(1, factor)));
    };

    bassBlend = lerpColor(bassColor, avgColor, normalizedBass); // red → pink
    trebleBlend = lerpColor(avgColor, bassColor, normalizedOverall); // pink → magenta

    // Weighted blend based on normalized energy levels
    const totalWeight = normalizedLowBass + normalizedBass + normalizedTreble + normalizedOverall;
    const weights = [normalizedLowBass / totalWeight, normalizedBass / totalWeight, normalizedTreble / totalWeight, normalizedOverall / totalWeight];

    const finalRGB = [0, 0, 0];
    [bassBlend, trebleBlend].forEach((color, i) => {
        finalRGB[0] += color[0] * weights[i];
        finalRGB[1] += color[1] * weights[i];
        finalRGB[2] += color[2] * weights[i];
    });

    progressBarCol = `rgb(${Math.floor(finalRGB[0])}, ${Math.floor(finalRGB[1])}, ${Math.floor(finalRGB[2])})`;

    volumePulseLoop = requestAnimationFrame(animateBackgroundToVolume);
}

let bassBlend;
let trebleBlend;

var screenShaking = false;

function shakeScreen(strength = 6, speed = 16, duration = 1000, fade = 150, priority = false, shakeTargets = [canvas, canvas2, canvas3]) {
    if (screenShaking && !priority) {
        return;
    }

    screenShaking = true;

    let startTime = performance.now();
    let fadeStartTime = duration > 0 ? startTime + duration : startTime;
    let totalEndTime = fade > 0 ? fadeStartTime + fade : fadeStartTime;

    let lastShakeTime = 0;
    const frameSpeed = speed <= 0 ? 0 : speed;

    function getRandomOffset(currentStrength) {
        const offsetX = (Math.random() * 2 - 1) * currentStrength;
        const offsetY = (Math.random() * 2 - 1) * currentStrength;
        return { x: Math.round(offsetX), y: Math.round(offsetY) };
    }

    function applyTransform(el, x, y) {
        if (el) {
            el.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
        }
    }

    function clearTransform(el) {
        if (el) {
            el.style.transform = "translate(-50%, -50%)";
        }
    }

    function isArray(val) {
        return Array.isArray(val);
    }

    function clearTransforms() {
        if (isArray(shakeTargets)) {
            shakeTargets.forEach(clearTransform);
        } else {
            clearTransform(shakeTargets);
        }
        screenShaking = false;
    }

    function shakeFrame(time) {
        const elapsed = time - startTime;

        if (elapsed > totalEndTime || (fade === 0 && elapsed >= duration)) {
            clearTransforms();
            return;
        }

        if (frameSpeed === 0 || time - lastShakeTime >= frameSpeed) {
            let currentStrength = strength;

            if (fade > 0 && time > fadeStartTime) {
                const fadeElapsed = time - fadeStartTime;
                const fadeProgress = Math.min(fadeElapsed / fade, 1);
                currentStrength *= 1 - fadeProgress;
            }

            const { x, y } = getRandomOffset(currentStrength);

            if (isArray(shakeTargets)) {
                shakeTargets.forEach((el) => applyTransform(el, x, y));
            } else {
                applyTransform(shakeTargets, x, y);
            }

            lastShakeTime = time;
        }

        requestAnimationFrame(shakeFrame);
    }

    requestAnimationFrame(shakeFrame);

    setTimeout(
        () => {
            if (screenShaking) {
                clearTransforms();
            }
        },
        duration + fade + 32
    );
}

// Reset the game
function resetGame(rec = false) {
    gameStarted = false;
    console.log("Game reset.");
    if (currentSong) currentSong.pause();
    currentSong.currentTime = 0;
    notes = [];
    points = 0;
    streak = 0;
    maxStreak = 0;
    exactHits = 0;
    insanes = 0;
    perfects = 0;
    earlys = 0;
    lates = 0;
    misses = 0;
    accuracy = 100;
    noteProgress = 0;
    notesHit = 0;
    lastHitDistance = 0;

    if (pulseBPMinterval) {
        clearInterval(pulseBPMinterval);
        pulseBPMinterval = null;
    }

    if (noteGenerationIntervalRef) {
        clearInterval(noteGenerationIntervalRef);
        noteGenerationIntervalRef = null;
    }

    // Cancel ALL recorded note timeouts
    if (recordedNoteGenTimeouts.length > 0) {
        recordedNoteGenTimeouts.forEach((timeoutObj) => {
            timeoutObj.pause?.();
            if (timeoutObj.timerId) {
                clearTimeout(timeoutObj.timerId);
            }
        });
        recordedNoteGenTimeouts = [];
    }

    startGame(rec);
}

async function randomizeChart() {
    const response = await fetch("Charts");
    const text = await response.text();

    const beatzFiles = [...text.matchAll(/href="([^"]+\.beatz)"/g)].map((match) => decodeURIComponent(match[1]));

    if (beatzFiles.length === 0) {
        alert("No .beatz files found in the Charts folder.");
        return;
    }

    const randomIndex = Math.floor(Math.random() * beatzFiles.length);
    const selectedFile = beatzFiles[randomIndex];
    const filePath = `${selectedFile}`;

    try {
        const res = await fetch(filePath);
        const fileContent = await res.text();

        console.log("Loaded file content:\n", fileContent);

        // ✅ FIX: Use decodeBeatzFile directly, not importBeatzFile
        const { song, charter, decodedNotes, decodedNoteMode, decodedBPM, decodedNoteSpeed, decodedNoteSpawnY } = decodeBeatzFile(fileContent);

        customNotes = decodedNotes;
        noteMode = decodedNoteMode;
        BPM = decodedBPM;
        noteSpeed = decodedNoteSpeed;
        noteSpawnY = decodedNoteSpawnY;

        localStorage.setItem(
            "recordedBeatzFileData",
            JSON.stringify({
                song,
                fileCharter: charter,
                fileNoteMode: noteMode,
                fileBPM: decodedBPM,
                fileNoteSpeed: decodedNoteSpeed,
                fileNoteSpawnY: decodedNoteSpawnY,
                fileNotes: customNotes
            })
        );

        const songPath = `Resources/Songs/${song}.mp3`;
        const songFile = new Audio(songPath);
        if (songFile.canPlayType) {
            currentSong.src = songPath;
        } else {
            throw new Error(`Song "${song}" not found in "Resources/Songs".`);
        }

        localStorage.setItem("recordedNotes", JSON.stringify({ notes: customNotes }));

        console.log(`Randomized chart loaded: ${selectedFile}`);
        resetGame();
    } catch (err) {
        console.error("Failed to load or parse .beatz file:", err);
        alert("Failed to load randomized chart.");
    }
}

function togglePerformanceMode() {
    // Create the confirmation modal
    createPopUpModal({
        title: "Performance Mode Toggle",
        labels: ["You are about to toggle performance mode. The song playing will need to be restarted."],
        buttons: [
            {
                text: "OK",
                onClick: () => {
                    // Close the modal
                    closePopUpModal();
                    // Call resetGame function to reset the game (reset game should include any necessary logic)
                    resetGame();

                    // Proceed with toggling performance mode
                    performanceMode = !performanceMode;

                    if (performanceMode) {
                        pulseToBPM = false;
                        pulseToHits = false;
                        pulseNotesOnClick = false;
                        pulseNotesOnHit = false;
                        backgroundVids = false;
                        fallbackAlbumBG = false;
                        blurCanvasOnVids = false;
                        blurCanvasOnCovers = false;
                        blurCanvasOnDefault = false;
                        blurAmountOnVids = 0;
                        blurAmountOnCovers = 0;
                        blurAmountOnDefault = 0;
                        animateHitLine = false;
                        fadeEarlyLateNotes = false;
                        fadeSpawnedNotes = false;

                        console.log("Performance mode enabled");

                        // Stop and remove video if any
                        const backgroundVideo = document.getElementById("backgroundVideo");
                        if (backgroundVideo) {
                            backgroundVideo.pause(); // Stop the video
                            backgroundVideo.src = ""; // Remove the source to stop it from continuing
                            backgroundVideo.remove(); // Remove the video element from the DOM
                        }
                    } else {
                        pulseToBPM = true;
                        pulseToHits = true;
                        backgroundVids = true;
                        fallbackAlbumBG = false;
                        blurCanvasOnVids = false;
                        blurCanvasOnCovers = true;
                        blurCanvasOnDefault = false;
                        blurAmountOnVids = 25;
                        blurAmountOnCovers = 25;
                        blurAmountOnDefault = 5;
                        animateHitLine = true;
                        fadeEarlyLateNotes = false;
                        fadeSpawnedNotes = true;

                        console.log("Performance mode disabled");
                    }
                }
            },
            {
                text: "Cancel",
                onClick: () => {
                    // Close the modal without toggling performance mode
                    closePopUpModal();
                }
            }
        ]
    });
}

function createPopUpModal({ title, buttons = [], labels = [] }) {
    const modal = document.getElementById("popUpModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalLabels = document.getElementById("modalLabels");
    const modalButtons = document.getElementById("modalButtons");
    const closeModalButton = document.getElementById("closePopUpModal");

    // Set the title of the modal
    modalTitle.textContent = title;

    // Clear previous labels and buttons
    modalLabels.innerHTML = "";
    modalButtons.innerHTML = "";

    // Add labels dynamically
    labels.forEach((labelText) => {
        const label = document.createElement("label");
        label.textContent = labelText;
        modalLabels.appendChild(label);
        modalLabels.appendChild(document.createElement("br"));
    });

    // Add buttons dynamically
    buttons.forEach((buttonConfig) => {
        const button = document.createElement("button");
        button.textContent = buttonConfig.text || "Button";
        button.id = buttonConfig.id || `button-${Math.random().toString(36).substr(2, 9)}`;

        // Add any custom event handler for the button if provided
        if (buttonConfig.onClick) {
            button.addEventListener("click", buttonConfig.onClick);
        }

        modalButtons.appendChild(button);
    });

    // Show the modal with bounce-in animation
    modal.style.display = "block";
    modal.classList.remove("bounceOut"); // Remove bounceOut animation if any
    modal.classList.add("bounceIn"); // Apply bounceIn animation

    // Close modal event
    closeModalButton.addEventListener("click", () => {
        closePopUpModal();
    });

    // Close modal when clicking outside the modal content
    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            closePopUpModal();
        }
    });
}

function closePopUpModal() {
    const modal = document.getElementById("popUpModal");

    // Apply bounceOut animation
    modal.classList.remove("bounceIn"); // Remove bounceIn animation if any
    modal.classList.add("bounceOut"); // Apply bounceOut animation

    // Wait for the animation to complete before hiding the modal
    setTimeout(() => {
        modal.style.display = "none"; // Hide modal
        modal.classList.remove("bounceOut"); // Remove bounceOut class after animation
    }, 400); // Timeout duration to match animation duration
}

function drawEndScreen() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    endScreenDrawn = true;

    // Draw "Song completed!" text
    ctx.fillStyle = "white";
    ctx.font = "60px Poppins";
    ctx.textAlign = "center";
    ctx.fillText("Song completed!", WIDTH / 2, HEIGHT / 2 - 150);

    // Draw song information
    getCoverForEndScreen(currentSongPath);
    ctx.font = "30px Poppins";
    ctx.textAlign = "right";
    ctx.fillText("Song: " + getSongTitle(currentSongPath), WIDTH - 100, HEIGHT / 2);

    // Get the artist(s)
    let artists = getArtist(currentSongPath).split(", ");
    if (artists.length > 3) {
        ctx.fillText("Artist: " + artists.slice(0, 3).join(", ") + ",", WIDTH - 100, HEIGHT / 2 + 40);
        ctx.fillText(artists.slice(3).join(", "), WIDTH - 100, HEIGHT / 2 + 80);
        ctx.fillText("BPM: " + BPM, WIDTH - 100, HEIGHT / 2 + 120);
        ctx.fillText("Speed: " + noteSpeed, WIDTH - 100, HEIGHT / 2 + 160);
    } else {
        ctx.fillText("Artist: " + artists.join(", "), WIDTH - 100, HEIGHT / 2 + 40);
        ctx.fillText("BPM: " + BPM, WIDTH - 100, HEIGHT / 2 + 80);
        ctx.fillText("Speed: " + noteSpeed, WIDTH - 100, HEIGHT / 2 + 120);
    }

    // Draw statistical information
    ctx.textAlign = "left";
    ctx.fillText("Points: " + points, 100, HEIGHT / 2);
    ctx.fillText("Perfect Hits: " + perfects, 100, HEIGHT / 2 + 40);
    ctx.fillText("Early Hits: " + earlys, 100, HEIGHT / 2 + 80);
    ctx.fillText("Late Hits: " + lates, 100, HEIGHT / 2 + 120);
    ctx.fillText("Misses: " + misses, 100, HEIGHT / 2 + 160);

    // Draw maximum streak
    ctx.fillStyle = "white";
    ctx.font = "40px Poppins";
    ctx.textAlign = "center";
    ctx.fillText("Maximum streak: " + maxStreak, WIDTH / 2, HEIGHT / 2 + 200);
}

function loseGame(delta) {
    noteSpeed -= 0.25;
    currentSong.pause();
}

let ignoreMouse = false;

leftPressed = upPressed = downPressed = rightPressed = false;

const zoneFades = {};

for (const state of activeTouches.values()) {
    if (!state.pressedType) continue;
    switch (state.pressedType) {
        case "Left":
            leftPressed = true;
            break;
        case "Up":
            upPressed = true;
            break;
        case "Down":
            downPressed = true;
            break;
        case "Right":
            rightPressed = true;
            break;
    }
}

let canvasPressed = false;

function isWithinBounds(x, y, area) {
    return x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height;
}

function handleTouchOrMouse(event) {
    if (!["Mobile", "Tablet"].includes(userDevice.deviceType)) return;

    const rect = canvas3.getBoundingClientRect();
    const scaleFactor = canvas3.scaleFactor || 1;

    const touches = event.touches ? event.touches : [event];

    for (let i = 0; i < touches.length; i++) {
        const touch = touches[i];
        const x = (touch.clientX - rect.left) / scaleFactor;
        const y = (touch.clientY - rect.top) / scaleFactor;

        let pressedType = null;
        for (let zone of touchZones) {
            if (isWithinBounds(x, y, zone)) {
                pressedType = zone.noteType;
                break;
            }
        }

        const prevTouch = activeTouches.get(touch.identifier);
        const alreadyPressed = prevTouch?.pressedType === pressedType;

        if (event.touches) {
            activeTouches.set(touch.identifier, {
                leftPressed,
                upPressed,
                downPressed,
                rightPressed,
                coords: { x, y },
                pressedType
            });
        }

        // Only trigger a press if it's a new press type for this touch
        if (!alreadyPressed && pressedType) {
            console.log(`Pressed inside canvas at (${x.toFixed(2)}, ${y.toFixed(2)}) - Zone: ${pressedType}`);
            pressNote(pressedType, keyBindings[pressedType]);

            if (pressedType && noteColors[pressedType]) {
                zoneFades[pressedType] = 0.35;
            }
        }
    }

    updateGlobalState();
    checkCanvasPressed();
}

function handleTouchStart(e) {
    ignoreMouse = true; // Temporarily block mouse events
    handleTouchOrMouse(e);
}

function handleTouchEnd(e) {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        activeTouches.delete(touch.identifier);
    }

    setTimeout(() => {
        ignoreMouse = false;
    }, 100); // Delay can be tweaked

    updateGlobalState();
    checkCanvasPressed();
}

function handleMouseDown(e) {
    if (ignoreMouse || ["Mobile", "Tablet"].includes(userDevice.deviceType)) return;
    handleTouchOrMouse(e);
    checkCanvasPressed();
}

function handleMouseUp(e) {
    if (["Mobile", "Tablet"].includes(userDevice.deviceType)) return; // Ignore on mobile/tablet
    leftPressed = false;
    upPressed = false;
    downPressed = false;
    rightPressed = false;
    updateGlobalState();
    checkCanvasPressed();
}

function updateGlobalState() {
    leftPressed = Array.from(activeTouches.values()).some((state) => state.leftPressed);
    upPressed = Array.from(activeTouches.values()).some((state) => state.upPressed);
    downPressed = Array.from(activeTouches.values()).some((state) => state.downPressed);
    rightPressed = Array.from(activeTouches.values()).some((state) => state.rightPressed);
}

function checkCanvasPressed() {
    const isAnyPressed = leftPressed || upPressed || downPressed || rightPressed;
    if (isAnyPressed && !canvasPressed) {
        canvasPressed = true;
        console.log("Canvas press started");
    } else if (!isAnyPressed && canvasPressed) {
        canvasPressed = false;
        console.log("Canvas press ended");
    }
}

let touchControlsEnabled = false;
const touchZones = [];

let isCanvasPressed = false;

canvas3.addEventListener("touchstart", handleTouchStart, { passive: false });
canvas3.addEventListener("touchend", handleTouchEnd, { passive: false });
canvas3.addEventListener("touchcancel", handleTouchEnd, { passive: false });

canvas3.addEventListener("mousedown", handleMouseDown);
window.addEventListener("mouseup", handleMouseUp);

canvas3.addEventListener(
    "touchmove",
    (e) => {
        e.preventDefault(); // Prevent scrolling when swiping or dragging
    },
    { passive: false }
);

canvas3.addEventListener("gesturestart", (e) => {
    e.preventDefault(); // Prevent pinch zoom gesture (iOS)
});

function drawTouchZones() {
    if (!userDevice || !["Mobile", "Tablet"].includes(userDevice.deviceType)) return;

    touchControlsEnabled = true;
    touchZones.length = 0;

    const zoneWidth = WIDTH / noteMode;
    const zoneHeight = HEIGHT;

    const noteTypeMap = {
        4: ["Left", "Down", "Up", "Right"],
        6: ["Downleft", "Left", "Down", "Up", "Right", "Downright"],
        8: ["Upleft", "Downleft", "Left", "Down", "Up", "Right", "Downright", "Upright"]
    };

    const noteOrder = noteTypeMap[noteMode] || [];

    for (let i = 0; i < noteOrder.length; i++) {
        const x = i * zoneWidth;
        const y = 0;
        const width = zoneWidth;
        const height = zoneHeight;
        const noteType = noteOrder[i];

        touchZones.push({ x, y, width, height, noteType });

        const fade = zoneFades[noteType] || 0;
        if (fade > 0) {
            const color = noteColors[noteType] || "white";
            ctx.fillStyle = hexToRGBA(color, fade);
            ctx.fillRect(x, y, width, height);
        }

        ctx.strokeStyle = noteColors[noteType] || "white";
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, width, height);
    }
}

function fadeZoneFills() {
    for (const noteType in zoneFades) {
        if (zoneFades[noteType] > 0) {
            zoneFades[noteType] -= 0.01;
            if (zoneFades[noteType] < 0) zoneFades[noteType] = 0;
        }
    }
}

function drawActiveTouches() {
    if (!["Mobile", "Tablet"].includes(userDevice.deviceType)) return;

    const touches = Array.from(activeTouches.entries());
    const boxWidth = 250;
    const boxHeight = 40;
    const padding = 10;
    const startX = WIDTH - boxWidth - 20;
    let startY = HEIGHT / 2;

    ctx.font = "18px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.strokeStyle = "white";

    // Draw the total number of fingers
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(startX, startY, boxWidth, boxHeight);
    ctx.strokeRect(startX, startY, boxWidth, boxHeight);
    ctx.fillStyle = "white";
    ctx.fillText(`Fingers: ${touches.length}`, startX + padding, startY + boxHeight / 2);

    startY += boxHeight + 10;

    // Draw each touch's coordinates
    touches.forEach(([id, touchData], index) => {
        const coord = touchData?.coords;
        if (!coord) return;

        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(startX, startY, boxWidth, boxHeight);
        ctx.strokeRect(startX, startY, boxWidth, boxHeight);
        ctx.fillStyle = "white";
        ctx.fillText(`ID ${id}: (${coord.x.toFixed(0)}, ${coord.y.toFixed(0)})`, startX + padding, startY + boxHeight / 2);

        startY += boxHeight + 6;
    });
}

let frameCount = 0;
let fps = 0;
let globalDelta;

// Game loop
function gameLoop(currentTime) {
    ctxBack.clearRect(0, 0, backCanvas.width, backCanvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    ctx3.clearRect(0, 0, canvas3.width, canvas3.height);

    const deltaTime = Math.max(currentTime - lastTime, 0.0001); // Prevents zero deltaTime
    lastTime = currentTime;

    globalDelta = deltaTime;

    // Calculate FPS every frame
    fps = 1000 / deltaTime;
    frameCount++;

    if (gameStarted) {
        //drawSongInfo();
        fadeZoneFills();
        drawTouchZones();
        drawActiveTouches();
        drawNotes();
        updateNotes(deltaTime);
        gameLoopRef = requestAnimationFrame(gameLoop);
    }

    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.font = "15px Poppins";
    ctx.fillText(`Delta: ${deltaTime.toFixed(2)} | Timestamp: ${lastTime.toFixed(2)}`, WIDTH / 2, HEIGHT - 70);
    ctx.fillText(`FPS: ${fps.toFixed(2)} | Frame count: ${frameCount} | ${userDevice.brand}`, WIDTH / 2, HEIGHT - 50);

    // Filter out "beatLine" notes before iterating
    const filteredNotes = notes.filter((note) => note.type !== "beatLine");

    let totalNotes = recording ? recordedNotes.length : customNotes.length > 0 ? customNotes.length : numberOfNotes;

    ctx.textAlign = "left";
    ctx.fillStyle = "white";
    ctx.font = "15px Poppins";

    ctx.fillText(`NPS: ${NPS}`, 10, HEIGHT - 90);
    ctx.fillText(`Total notes: ${totalNotes}`, 10, HEIGHT - 70);
    ctx.fillText(`Points Gained/Available: ${pointsGained.toFixed(0)} | ${pointsAvailable.toFixed(0)}`, 10, HEIGHT - 50);

    filteredNotes.forEach((note, index) => {
        if (index < 17) {
            ctx.fillText(`Note ${index + 1}:`, 10, HEIGHT / 2 - 70 + index * 20);
            ctx.fillText(`${note.type}`, 70, HEIGHT / 2 - 70 + index * 20);

            // Check if note type is diagonal
            const diagonalNotes = ["Upleft", "Downleft", "Upright", "Downright", "RecNoteUpleft", "RecNoteDownleft", "RecNoteUpright", "RecNoteDownright"];
            let yTextXPos = recording ? 180 : 120; // Default positions
            if (recording && diagonalNotes.includes(note.type)) {
                yTextXPos += 25; // Move further for diagonal notes
            }

            ctx.fillText(`Y = ${note.y.toFixed(3)}`, yTextXPos, HEIGHT / 2 - 70 + index * 20);
        } else if (index === 17) {
            ctx.fillText(`... (${filteredNotes.length - 18})`, recording ? 270 : 210, HEIGHT / 2 - 70 + (index - 1) * 20); // Add triple dots if more than 19
        }
    });

    ctx.fillText(`Notes hit: ${notesHit} | All time: ${allTimeNotesHit}`, 10, HEIGHT - 30);
    ctx.fillText(`Visible notes: ${filteredNotes.length}`, 10, HEIGHT - 10);

    // Font size pulsing logic with deltaTime scaling
    if (pulseToBPM || pulseToHits) {
        const targetFontSizeChange = 0.4;
        const targetSmallFontSizeChange = 0.5;
        const targetNoteSizeChange = 0.3;
        const scaleFactor = deltaTime / (1000 / 165); // Normalize for 165Hz

        // Adjust font sizes based on conditions:
        if (fontSize < 40) {
            fontSize += targetFontSizeChange * scaleFactor;
        } else if (fontSize > 40) {
            fontSize -= targetFontSizeChange * scaleFactor;
        }

        if (bpmPulseFontSize < 40) {
            bpmPulseFontSize += targetFontSizeChange * scaleFactor;
        } else if (bpmPulseFontSize > 40) {
            bpmPulseFontSize -= targetFontSizeChange * scaleFactor;
        }

        if (hitPulseFontSize < 40) {
            hitPulseFontSize += targetFontSizeChange * scaleFactor;
        } else if (hitPulseFontSize > 40) {
            hitPulseFontSize -= targetFontSizeChange * scaleFactor;
        }

        if (smallFontSize < 30) {
            smallFontSize += targetSmallFontSizeChange * scaleFactor;
        } else if (smallFontSize > 30) {
            smallFontSize -= targetSmallFontSizeChange * scaleFactor;
        }

        // Note size adjustment logic
        const adjustNoteSize = (size) => {
            // If the note size is over 75, reset to 74
            if (size > maxNoteSize) {
                return maxNoteSize - 1;
            }
            // If the note size is under 60, reset to 61
            if (size < minNoteSize) {
                return minNoteSize + 1;
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
        fontSize = Math.max(12, Math.min(fontSize, maxFontSize));
        bpmPulseFontSize = Math.max(12, Math.min(bpmPulseFontSize, maxBpmPulseFontSize));
        hitPulseFontSize = Math.max(12, Math.min(hitPulseFontSize, maxHitPulseFontSize));
        smallFontSize = Math.max(10, Math.min(smallFontSize, maxSmallFontSize));
    }

    // Check if BPM pulse should stop
    if (!pulseToBPM && pulseBPMinterval) {
        clearInterval(pulseBPMinterval);
        pulseBPMinterval = null; // Prevent repeated calls
    }

    // Check if BPM pulse should stop
    if (!pulseBGtoBPM && pulseBGtoBPMinterval) {
        clearInterval(pulseBGtoBPMinterval);
        pulseBGtoBPMinterval = null; // Prevent repeated calls
    }

    if (upscroll) {
        targetYPositionStart = 400;
        targetYPositionEnd = 40;
    }

    // Progress bar logic
    const currentSongTime = currentSong?.currentTime || 0;
    const duration = currentSong.duration || 1;
    const progressWidth = (WIDTH * currentSongTime) / duration;

    if (!isFileProtocol) {
        const gradient = ctx.createLinearGradient(0, 0, progressWidth, 0);
        gradient.addColorStop(0, `rgb(${bassBlend[0]}, ${bassBlend[1]}, ${bassBlend[2]})`);
        gradient.addColorStop(1, `rgb(${trebleBlend[0]}, ${trebleBlend[1]}, ${trebleBlend[2]})`);
        ctx.fillStyle = gradient;
    } else {
        ctx.fillStyle = "red";
    }

    if (!recording && !upscroll) {
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

    if (recording || upscroll) {
        ctx.fillText(`${formattedCurrentTime} / ${formattedDuration}`, WIDTH / 2, HEIGHT - 10);
    } else {
        ctx.fillText(`${formattedCurrentTime} / ${formattedDuration}`, WIDTH / 2, 30);
    }

    if (!recording && accuracyBar) drawAccuracyBar(lastHitDistance, deltaTime);
}

// - . / .- -- --- / .- -. --. .  /.--. . .-. --- / - ..- / -. --- / .-.. --- / ... .- -... . ... / -.-- / -. --- / ... . / --.- ..- . / .... .- -.-. . .-.

// AA AM aa AS AA² aE AL AT AF

// Thanks for playing Beatz X!
// - GuayabR
