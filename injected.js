(function() {
    console.log("[Altyazı cozucu] Başladı ()");

    function createPanel() {
        const sec = document.querySelector("#secondary");
        if (!sec) return setTimeout(createPanel, 300);
        if (document.getElementById("safe-sub-panel")) return;

        const panel = document.createElement("div");
        panel.id = "safe-sub-panel";
        panel.style.width = "100%";
        panel.style.maxHeight = "260px";
        panel.style.background = "#111";
        panel.style.color = "#fff";
        panel.style.padding = "10px";
        panel.style.marginTop = "20px";
        panel.style.overflowY = "auto";
        panel.style.border = "1px solid #333";
        panel.style.borderRadius = "8px";
        panel.style.fontSize = "14px";

        const txt = document.createElement("div");
        txt.style.fontWeight = "bold";
        txt.textContent = "Altyazı yüklenmesi için altyazıları 1 kere açıp kapatın…";
        panel.appendChild(txt);

        sec.prepend(panel);
    }
    createPanel();

    function showText(text) {
        const panel = document.getElementById("safe-sub-panel");
        if (!panel) return;

        const pre = document.createElement("pre");
        pre.style.whiteSpace = "pre-wrap";
        pre.style.margin = "0";
        pre.textContent = text;

        panel.replaceChildren(pre);
    }

    async function parseSubs(url) {
        showText("Altyazı indiriliyor…");

        const raw = await fetch(url, { _bypassSubSniffer: true }).then(r => r.text());
        let out = "";

        if (raw.trim().startsWith("{")) {
            const data = JSON.parse(raw);
            if (data.events) {
                data.events.forEach(ev => {
                    if (ev.segs) {
                        ev.segs.forEach(seg => {
                            if (seg.utf8) out += seg.utf8;
                        });
                        out += "\n";
                    }
                });
            }
        } else {
            const xml = new DOMParser().parseFromString(raw, "text/xml");
            const list = [...xml.querySelectorAll("text")];
            out = list.map(x => x.textContent.replace(/\\n/g," ")).join("\n");
        }

        // 🔥 ÇİFT BOŞ SATIR → TEK BOŞ SATIR
        out = out.replace(/\n\s*\n/g, "\n");

        showText(out);
    }

    const oldOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
        if (url.includes("timedtext")) parseSubs(url);
        return oldOpen.apply(this, arguments);
    };

    const oldFetch = window.fetch;
    window.fetch = function(input, init) {
        const url = typeof input === "string" ? input : input.url;

        if (init && init._bypassSubSniffer) {
            return oldFetch(input, init);
        }

        if (url.includes("timedtext")) parseSubs(url);

        return oldFetch(input, init);
    };

    async function autoCC() {
        const btn = await new Promise(resolve => {
            const t = setInterval(() => {
                const el = document.querySelector(".ytp-subtitles-button");
                if (el) {
                    clearInterval(t);
                    resolve(el);
                }
            }, 200);
        });

        btn.click();
        await new Promise(r => setTimeout(r, 150));
        btn.click();
        await new Promise(r => setTimeout(r, 150));
        btn.click();
    }
    autoCC();
})();
