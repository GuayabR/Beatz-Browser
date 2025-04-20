/**
 * Title: Beatz X Initialization
 * Author: Victor//GuayabR
 * Date: 02/09/2025
 * Version: NOTES X v7 test (release.version.subversion.bugfix)
 * GitHub Repository: https://github.com/GuayabR/Beatz-2
 **/

function detectDevice() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;

    const isMobile = /android|iphone|ipad|ipod|iemobile|blackberry|mobile|opera mini/i.test(ua.toLowerCase());
    const isTablet = /tablet|ipad/i.test(ua.toLowerCase());
    const isAndroid = /android/i.test(ua);
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    const isWindows = /Windows/i.test(ua);
    const isMac = /Macintosh/i.test(ua);
    const isLinux = /Linux/i.test(ua);
    const isChromeOS = /CrOS/i.test(ua);

    let brand = "Unknown";
    if (isAndroid) brand = "Android";
    else if (isIOS) brand = "iOS";
    else if (isChromeOS) brand = "Chromebook";
    else if (isWindows) brand = "Windows";
    else if (isMac) brand = "macOS";
    else if (isLinux) brand = "Linux";

    // Look for manufacturer in user agent (like Samsung, Huawei, etc.)
    const knownManufacturers = ["Samsung", "Huawei", "Xiaomi", "OnePlus", "ASUS", "Lenovo", "Nokia", "Sony"];
    for (let m of knownManufacturers) {
        if (ua.toLowerCase().includes(m.toLowerCase())) {
            brand = m;
            break;
        }
    }

    const deviceType = isTablet ? "Tablet" : isMobile ? "Mobile" : "Desktop";

    return {
        deviceType,
        brand,
        userAgent: ua
    };
}

let userDevice = detectDevice();

function changeStylesheet(sheetName) {
    const link = document.getElementById("stylesheet");
    if (link) {
        link.href = sheetName;
    } else {
        // If no link element exists, create one
        const newLink = document.createElement("link");
        newLink.id = "stylesheet";
        newLink.rel = "stylesheet";
        newLink.href = sheetName;
        document.head.appendChild(newLink);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadBeatzSavedChart();

    updateNoteImages();

    isFileProtocol = window.location.protocol === "file:";

    if (userDevice.deviceType === "Mobile" || userDevice.deviceType === "Tablet") {
        changeStylesheet("mobileStyles.css");
        shakeScreenWithBass = false;
    }

    //readMP3Metadata(currentSong.src);

    document.getElementById("importButton").addEventListener("click", importBeatzFile);

    const backgroundOverlay = document.getElementById("backgroundOverlay");
    backgroundOverlay.style.backgroundImage = 'url("Resources/BeatzBannerX.jpg")';
});

const activeTouches = new Map(); // Track active touch points

let lastTime = Date.now();
