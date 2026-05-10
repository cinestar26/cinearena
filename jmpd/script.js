
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
                    window.open('', '_self').close(); // Attempts to close the tab
                }
            }, 1000);
        })();
   


      function getParams() {
        const url = new URL(window.location.href);
        const [mpdUrlPart, drmPart] = url.search.slice(1).split('|');
        const mpdUrl = decodeURIComponent(mpdUrlPart);
        const searchParams = new URLSearchParams(drmPart);

        const drmScheme = searchParams.get("drmScheme");
        const drmLicense = searchParams.get("drmLicense"); // Format: keyId:key

        let keyId = "", key = "";
        if (drmLicense) {
          [keyId, key] = drmLicense.split(':');
        }

        return {
          file: mpdUrl,
          drm: {
            scheme: drmScheme,
            keyId,
            key,
          },
        };
      }

      const { file, drm } = getParams();

      jwplayer("jwplayerDiv").setup({
        file: file,
        type: "dash",
        drm: {
          [drm.scheme]: {
            keyId: drm.keyId,
            key: drm.key,
          },
        },
        autostart: true,
        mute: false,
        image: "WhatsApp Image 2025-02-22 at 5.19.53 PM.jpeg"
      });
   

