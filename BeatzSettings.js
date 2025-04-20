/**
 * Title: Beatz X Settings
 * Author: Victor//GuayabR
 * Date: 02/09/2025
 * Version: NOTES X v7 test (release.version.subversion.bugfix)
 * GitHub Repository: https://github.com/GuayabR/Beatz-2
 **/

var noteOffset = 0;

let resumeDelay = 1000;

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

let beatLineOpacity = 0.175;
let pulseToBPM = true;
let pulseToHits = true;
let pulseBGtoBPM = true;

var pulseNotesOnClick = true;
var pulseNotesOnHit = false;

var maxNoteSize = 90;
var maxFontSize = 64;
var maxBpmPulseFontSize = 64;
var maxHitPulseFontSize = 64;
var maxSmallFontSize = 35;

var fadeOutHitTypeText = true;

var fadeEarlyLateNotes = false;
var fadeSpawnedNotes = true;

var accurateAutoHit = true;

var drawLanes = false;

var upscroll = false;

var doubleInputPrevention = true;

var flashNotesOnHit = true;
var colorFlashWithTypes = true;
var flashWithTypes = ["EXACT", "INSANE"];
var exactTypeColor = "noteColor"; //"rgba(0, 255, 0, "; // rgba color ("rgba(num, num, num, ") or "noteColor"
var insaneTypeColor = "noteColor"; //"rgba(255, 215, 0, "; // rgba color ("rgba(num, num, num, ") or "noteColor"
var perfectTypeColor = "rgba(100, 200, 255, "; // rgba color ("rgba(num, num, num, ") or "noteColor"
var earlyTypeColor = "rgba(100, 255, 255, "; // rgba color ("rgba(num, num, num, ") or "noteColor"
var lateTypeColor = "rgba(100, 255, 255, "; // rgba color ("rgba(num, num, num, ") or "noteColor"

var flashNotesOnClick = false;
var clickFlashColor = "rgba(255, 255, 255, "; // rgba color ("rgba(num, num, num, ") or "noteColor"

var quality = 1; // 0 = 480p sd, 1 = 720p hd, 2 = 1080p fhd

let performanceMode = false;

let backgroundVids = true;
let fallbackAlbumBG = true;
let blurCanvasOnVids = false;
let blurCanvasOnCovers = false;
let blurCanvasOnDefault = false;
let blurAmountOnVids = 5; // in pixels
let blurAmountOnCovers = 10; // in pixels
let blurAmountOnDefault = 10; // in pixels
let brightnessAmount = 0.3;
let maxBrightnessAmount = 0.8;

let pulseBGwithSound = true;
let brightenBGwithTreble = true;
let shakeScreenWithBass = true;

let exponentialCurveOnBG = true;
let exponentialCurveOnShake = true;

let bassThreshold = 0.55;
let shakeMultiplier = 1.5;

let bassMultiplier = 2;
let trebleMultiplier = 1;

var BAR_COUNT = 32;
var BAR_WIDTH = 14;
var GAP = 6;
var MAX_HEIGHT = 720 / 3;
var visualizerOpacity = 0.04;
var showVisualizer = true;
var visualizerReactionWithSong = "shakeBass"; // "scaleBass", "scaleAvg", "scaleTreble", "shakeBass", "shakeTreble", "shakeAvg"

var accuracyBar = true;
var accBarColors = ["red", "#ff7300", "#ffee00", "#00ff00", "#ffee00", "#ff7300", "red"];
var accBarGradientDirection = "left"; // left, right, top, bottom, middle, inverseMiddle, int value in degrees
var centerBlending = true;
var accBarRoundInside = true;
var accBarInsideRotatingGradient = false;

var accBarOutline = true;
var accBarOutlineThickness = 2;
var accBarOutlineColor = "white";
var accBarOutlineGradientDirection = "left"; // left, right, top, bottom, middle, inverseMiddle, int value in degrees
var accBarOutlineCenterBlending = true;
var accBarOutlineRotatingGradient = false;

var outlineCopiesInsideBarCols = false;
var accBarRoundCorner = 0;

var accBarShadow = true;
var accBarShadowCol = "black";
var accBarShadowSize = 10;

var accBarHitLineShadow = true;
var accBarHitLineShadowCol = "white";
var accBarHitLineShadowSize = "15";

var accBarWidth = 315;
var accBarHeight = 15;
var useLineOrImg = 0; // 0 = Line, 1 = Img
let showOffsetOnAccuracyBar = true; // Toggle showing the offset text
let showMSorPixels = 0; // 0 = milliseconds, 1 = pixels
var animateHitLine = true;
var fadedOpacity = 0.3;
var maxBars = 10;
var exactHit = false;
let fadeOutLinesAfterMax = false;
let fadeOutOldLines = true;
let fadeOutOffsetText = true;
let fadeOutHitLine = false;

var timeToFadePreviousLines = 2500;
var timeToFadeHitLine = 1500;
var timeToFadeHitType = 1000;
var timeToFadeOffsetText = 1250;

var timeToFadeOutPreviousLines = 750;
var timeToFadeOutHitLine = 500;
var timeToFadeOutHitType = 300;
var timeToFadeOutOffsetText = 350;

const settingsBtn = document.getElementById("settingsButton");
const modal = document.getElementById("miscSettingsModal");
const closeBtn = document.getElementById("closeSettings");

settingsBtn.addEventListener("click", () => {
    modal.style.display = "block";
});

closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
});

window.addEventListener("click", (e) => {
    if (e.target == modal) {
        modal.style.display = "none";
    }
});

document.querySelectorAll("#settingsForm input").forEach((input) => {
    input.addEventListener("change", () => {
        const id = input.id;
        const val = input.type === "checkbox" ? input.checked : input.type === "number" ? parseFloat(input.value) : input.value;
        window[id] = val;
    });
});

// - . / .- -- --- / .- -. --. .  /.--. . .-. --- / - ..- / -. --- / .-.. --- / ... .- -... . ... / -.-- / -. --- / ... . / --.- ..- . / .... .- -.-. . .-.

// AA AM aa AS AA² aE AL AT AF

// Thanks for playing Beatz X!
// - GuayabR
