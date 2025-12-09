
if (!location.pathname.startsWith("/watch")) {
    console.log("Injected.js devre dışı: video sayfası değil.");
} else {

    console.log("Injected.js aktif!");

    let subtitleURL = null;

    function hookPlayerResponse() {
        const orig = Object.defineProperty;
        Object.defineProperty(window, "ytInitialPlayerResponse", {
            set(v) {
                try {
                    const tracks =
                        v?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
                    if (tracks && tracks.length > 0) {
                        subtitleURL = tracks[0].baseUrl;
                        console.log("Altyazı URL bulundu:", subtitleURL);
                    }
                } catch (e) {}

                orig(window, "ytInitialPlayerResponse", {
                    value: v,
                    writable: true
                });
            }
        });
    }

    hookPlayerResponse();

    (function(open) {
        XMLHttpRequest.prototype.open = function(method, url) {
            if (url.includes("timedtext")) {
                subtitleURL = url;
                console.log("XHR ile altyazı yakalandı:", url);
            }
            return open.apply(this, arguments);
        };
    })(XMLHttpRequest.prototype.open);

    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
        if (msg === "getSubtitleUrl") {
            sendResponse(subtitleURL);
        }
    });
}
