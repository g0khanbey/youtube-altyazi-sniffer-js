 
const script = document.createElement("script");
script.src = chrome.runtime.getURL("injected.js");
(document.head || document.documentElement).appendChild(script);
 
window.addEventListener("message", (event) => {
    if (event.data && event.data.type === "CC_URL") {
        console.log("[Content] URL alındı → popup'a gönderiliyor:", event.data.url);
        chrome.runtime.sendMessage({ subtitleUrl: event.data.url });
    }
});
