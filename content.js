let subtitleURL = null;

 
function hookPlayerResponse() {
    const orig = Object.defineProperty;
    Object.defineProperty(window, "ytInitialPlayerResponse", {
        set(v) {
            try {
                if (v?.captions?.playerCaptionsTracklistRenderer?.captionTracks) {
                    subtitleURL = v.captions.playerCaptionsTracklistRenderer.captionTracks[0].baseUrl;
                }
            } catch (e) {}
            orig(window, "ytInitialPlayerResponse", { value: v, writable: true });
        }
    });
}
hookPlayerResponse();
 
(function(open) {
    XMLHttpRequest.prototype.open = function(method, url) {
        if (url.includes("timedtext")) {
            subtitleURL = url;
        }
        return open.apply(this, arguments);
    };
})(XMLHttpRequest.prototype.open);

 
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg === "getSubtitleUrl") {
        sendResponse(subtitleURL);
    }
});
