(function () {
    console.log("[Altyazı çözücü] Başladı");

    // Panel oluştur
    function createPanel() {
        const sec = document.querySelector("#secondary");
        if (!sec) return setTimeout(createPanel, 300);
        if (document.getElementById("safe-sub-panel")) return;

        const panel = document.createElement("div");
        panel.id = "safe-sub-panel";
        panel.style.cssText = [
            "width:100%",
            "max-height:260px",
            "background:#111",
            "color:#fff",
            "padding:10px",
            "margin-top:20px",
            "overflow-y:auto",
            "border:1px solid #333",
            "border-radius:8px",
            "font-size:14px",
            "box-sizing:border-box"
        ].join(";");

        const txt = document.createElement("div");
        txt.style.fontWeight = "bold";
        txt.textContent = "Altyazı yüklenmesi için altyazıları 1 kere açıp kapatın…";
        panel.appendChild(txt);

        sec.prepend(panel);
    }
    createPanel();

    // Panele metin yaz
    function showText(text) {
        const panel = document.getElementById("safe-sub-panel");
        if (!panel) return;

        const pre = document.createElement("pre");
        pre.style.cssText = "white-space:pre-wrap;margin:0";
        pre.textContent = text;
        panel.replaceChildren(pre);
    }

    // Altyazı URL'sini parse et
    async function parseSubs(url) {
        showText("Altyazı indiriliyor…");

        try {
            const raw = await oldFetch(url).then(r => r.text());
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
                out = [...xml.querySelectorAll("text")]
                    .map(x => x.textContent.replace(/\\n/g, " "))
                    .join("\n");
            }

            // Çift boş satırları tek yap
            out = out.replace(/\n\s*\n/g, "\n").trim();
            showText(out || "(Altyazı metni boş)");
        } catch (e) {
            showText("Hata: " + e.message);
        }
    }

    // Orijinal fetch'i sakla (kendi isteğimizde döngüye girmesin)
    const oldFetch = window.fetch;

    // XMLHttpRequest hook
    const oldOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
        if (typeof url === "string" && url.includes("timedtext")) {
            parseSubs(url);
        }
        return oldOpen.apply(this, arguments);
    };

    // Fetch hook
    window.fetch = function (input, init) {
        const url = typeof input === "string" ? input : (input && input.url);
        if (url && url.includes("timedtext")) {
            parseSubs(url);
        }
        return oldFetch(input, init);
    };

})();