// Disable right-click and hotkeys
document.addEventListener("contextmenu", function(e) {
    e.preventDefault();
});

document.addEventListener("keydown", function(e) {
    if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J")) ||
        (e.ctrlKey && e.key === "U")
    ) {
        e.preventDefault();
    }
});

// DevTools Detection - Attempt to close tab
(function() {
    let devtoolsOpen = false;
    const element = new Image();

    Object.defineProperty(element, 'id', {
        get: function () {
            devtoolsOpen = true;
            throw new Error("DevTools detected");
        }
    });

    setInterval(function () {
        devtoolsOpen = false;
        console.dir(element);
        if (devtoolsOpen) {
            alert("Developer tools are not allowed!");
            window.open('', '_self').close();
        }
    }, 1000);
})();

// FIXED: Parse URL with better handling
function getParams() {
    const url = new URL(window.location.href);
    
    // Get everything after '?' in the original URL string
    const queryString = window.location.search;
    
    if (!queryString) {
        console.error("No parameters found in URL");
        return null;
    }
    
    // Remove the leading '?'
    let params = queryString.substring(1);
    
    let mpdUrl = "";
    let drmScheme = "";
    let keyId = "";
    let key = "";
    
    // Check if there's a pipe separator
    if (params.includes('|')) {
        const [mpdPart, drmPart] = params.split('|');
        mpdUrl = decodeURIComponent(mpdPart);
        
        // Parse the DRM parameters
        const drmParams = new URLSearchParams(drmPart);
        drmScheme = drmParams.get("drmScheme");
        const drmLicense = drmParams.get("drmLicense");
        
        if (drmLicense) {
            const [id, k] = drmLicense.split(':');
            keyId = id;
            key = k;
        }
    } 
    // Alternative: If parameters are directly in URL without pipe
    else {
        const searchParams = new URLSearchParams(params);
        mpdUrl = decodeURIComponent(searchParams.get("file") || "");
        drmScheme = searchParams.get("drmScheme");
        const drmLicense = searchParams.get("drmLicense");
        
        if (drmLicense) {
            const [id, k] = drmLicense.split(':');
            keyId = id;
            key = k;
        }
    }
    
    // If still no mpdUrl, use the current page URL's path without query
    if (!mpdUrl && window.location.href.includes('.mpd')) {
        mpdUrl = window.location.href.split('?')[0];
        
        // Extract DRM from the query
        const searchParams = new URLSearchParams(params);
        drmScheme = searchParams.get("drmScheme");
        const drmLicense = searchParams.get("drmLicense");
        
        if (drmLicense) {
            const [id, k] = drmLicense.split(':');
            keyId = id;
            key = k;
        }
    }
    
    console.log("Parsed MPD URL:", mpdUrl);
    console.log("DRM Scheme:", drmScheme);
    console.log("Key ID:", keyId);
    
    return {
        file: mpdUrl,
        drm: {
            scheme: drmScheme,
            keyId: keyId,
            key: key,
        },
    };
}

// Initialize player when DOM is ready
document.addEventListener("DOMContentLoaded", function() {
    const params = getParams();
    
    if (!params || !params.file) {
        console.error("No valid MPD URL found");
        alert("Invalid stream URL format. Please check the link.");
        return;
    }
    
    const { file, drm } = params;
    
    const playerConfig = {
        file: file,
        type: "dash",
        autostart: true,
        mute: false,
        image: "WhatsApp Image 2025-02-22 at 5.19.53 PM.jpeg"
    };
    
    // Add DRM configuration if available
    if (drm.scheme && drm.keyId && drm.key) {
        playerConfig.drm = {
            [drm.scheme]: {
                keyId: drm.keyId,
                key: drm.key
            }
        };
        console.log("DRM configured with", drm.scheme);
    } else {
        console.log("No DRM credentials provided, attempting playback without DRM");
    }
    
    // Setup JW Player
    jwplayer("jwplayerDiv").setup(playerConfig);
    
    // Error handling
    jwplayer("jwplayerDiv").on('error', function(e) {
        console.error("Player error:", e);
        alert("Playback error: " + (e.message || "Unknown error"));
    });
});
