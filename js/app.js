// Jitter — live stream simulator: UI + simulation loop
(function () {
    "use strict";
    const $ = id => document.getElementById(id);
    const rand = n => Math.floor(Math.random() * n);
    const randBetween = (a, b) => a + Math.random() * (b - a);
    const fmt = n => n.toLocaleString();

    // ---------------------------------------------------------------- DOM
    const chatBox = $("chat-box"), toggleBtn = $("toggle-stream"), subBtn = $("sub-button"), followBtn = $("follow-button");
    const viewerDisplay = $("viewer-count"), playerViewers = $("player-viewer-count");
    const raidModal = $("raid-modal"), player = $("player"), streamVideo = $("stream-video"), youtubeFrame = $("youtube-frame");
    const fileInput = $("video-file-input"), sourceStatus = $("source-status"), youtubeInputRow = $("youtube-input-row"), youtubeUrlInput = $("youtube-url-input");
    const superChat = $("super-chat"), superChatLabel = $("super-chat-label"), superChatMessage = $("super-chat-message");
    const liveBadge = $("live-badge"), uptimeEls = [$("uptime"), $("player-uptime")];
    const userChatInput = $("user-chat-input"), sendChatBtn = $("send-chat-btn");
    const chatPausedBtn = $("chat-paused"), toastStack = $("toast-stack");

    // ---------------------------------------------------------------- State
    const state = {
        streaming: false, raidAccepted: false, viewers: 1402, subscribed: false, following: false,
        chatTimer: null, uptimeStart: null, uptimeTimer: null, speed: 1, mood: "auto",
        webcamStream: null, uploadedVideoUrl: null, chatPaused: false, bits: 2500, lines: 0,
        superChatTimer: null, superChatHideTimer: null, superChatClearTimer: null,
        raider: null
    };
    const MAX_LINES = 250;
    const streamerName = () => $("my-streamer-name").textContent.trim();
    const gameName = () => $("game-name").textContent.trim();

    // ---------------------------------------------------------------- Toasts
    function toast(text, kind = "") {
        const el = document.createElement("div");
        el.className = `toast ${kind}`; el.textContent = text;
        toastStack.appendChild(el);
        setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 260); }, 3200);
    }

    // ---------------------------------------------------------------- Chat rendering
    const BADGE_ICONS = { broadcaster: "i-camera", mod: "i-sword", vip: "i-diamond", sub: "i-star", founder: "i-crown", prime: "i-crown", turbo: "i-bits", staff: "i-sword" };
    const BADGE_TIPS = { broadcaster: "Broadcaster", mod: "Moderator", vip: "VIP", sub: "Subscriber", founder: "Founder", prime: "Prime Gaming", turbo: "Turbo", staff: "Staff" };
    function badgeEl(type) {
        const b = document.createElement("span");
        b.className = `badge ${type}`; b.title = BADGE_TIPS[type] || type;
        b.innerHTML = `<svg><use href="#${BADGE_ICONS[type] || "i-star"}"/></svg>`;
        return b;
    }
    const URL_RE = /^(https?:\/\/|www\.)[^\s]+$/i, CHEER_RE = /^(cheer|pogchamp|kappa|uni|party)(\d+)$/i;
    function renderText(text) {
        const frag = document.createDocumentFragment();
        const me = streamerName().toLowerCase();
        text.split(/(\s+)/).forEach(tok => {
            if (!tok) return;
            if (/^\s+$/.test(tok)) return frag.appendChild(document.createTextNode(tok));
            const emote = Generator.EMOTES[tok];
            let el;
            if (emote) { el = document.createElement("span"); el.className = "emote"; el.title = tok; el.textContent = emote; }
            else if (tok.startsWith("@") && tok.length > 1) { el = document.createElement("span"); el.className = "mention-tag"; el.textContent = tok; }
            else if (CHEER_RE.test(tok)) { el = document.createElement("span"); el.className = "cheer"; el.textContent = tok.replace(CHEER_RE, (m, p, n) => `${Generator.EMOTES.jitterHype || "🔥"} ${n}`); el.title = `${tok.match(CHEER_RE)[2]} bits`; }
            else if (URL_RE.test(tok)) { el = document.createElement("span"); el.className = "link"; el.textContent = tok; }
            else return frag.appendChild(document.createTextNode(tok));
            frag.appendChild(el);
        });
        return frag;
    }
    function timestampEl() {
        const t = document.createElement("span");
        t.className = "chat-timestamp";
        t.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        return t;
    }
    function pushLine(line) {
        chatBox.appendChild(line);
        if (++state.lines > MAX_LINES) { chatBox.firstElementChild.remove(); state.lines--; }
        if (!state.chatPaused) chatBox.scrollTop = chatBox.scrollHeight;
    }
    function appendChatMessage(user, msg, color, opts = {}) {
        const line = document.createElement("div");
        line.className = "chat-line";
        if (opts.highlight) line.classList.add("highlight");
        if (opts.firstTime) line.classList.add("first-time");
        if (new RegExp(`@${streamerName().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(msg) && !opts.self) line.classList.add("mention");
        if (opts.firstTime) { const ft = document.createElement("span"); ft.className = "first-tag"; ft.textContent = "First message"; line.appendChild(ft); }
        line.appendChild(timestampEl());
        if (opts.badges && opts.badges.length) { const bs = document.createElement("span"); bs.className = "chat-badges"; opts.badges.forEach(b => bs.appendChild(badgeEl(b))); line.appendChild(bs); }
        const name = document.createElement("span");
        name.className = "chat-username"; name.style.color = color; name.textContent = user;
        name.addEventListener("click", () => { userChatInput.value = `@${user} ${userChatInput.value}`.trimEnd() + " "; userChatInput.focus(); });
        const text = document.createElement("span");
        text.className = "chat-text"; text.appendChild(renderText(msg));
        line.append(name, document.createTextNode(": "), text);
        pushLine(line);
    }
    function appendSystemMessage(text) {
        const line = document.createElement("div");
        line.className = "chat-line system";
        line.append(timestampEl(), document.createTextNode(text));
        pushLine(line);
    }
    function appendAlert(kind, title, sub, icon) {
        const el = document.createElement("div");
        el.className = `chat-alert ${kind}`;
        el.innerHTML = `<div class="alert-title"><svg class="icon"><use href="#${icon}"/></svg><span></span></div>${sub ? '<div class="alert-sub"></div>' : ""}`;
        el.querySelector(".alert-title span").textContent = title;
        if (sub) el.querySelector(".alert-sub").textContent = sub;
        pushLine(el);
    }

    // Pause autoscroll when the user scrolls up (like Twitch)
    chatBox.addEventListener("scroll", () => {
        const atBottom = chatBox.scrollHeight - chatBox.scrollTop - chatBox.clientHeight < 40;
        state.chatPaused = !atBottom;
        chatPausedBtn.classList.toggle("visible", state.chatPaused);
    });
    chatPausedBtn.addEventListener("click", () => { state.chatPaused = false; chatPausedBtn.classList.remove("visible"); chatBox.scrollTop = chatBox.scrollHeight; });
    $("timestamps-toggle").addEventListener("change", e => chatBox.classList.toggle("show-timestamps", e.target.checked));
    $("clear-chat-btn").addEventListener("click", () => { chatBox.innerHTML = ""; state.lines = 0; appendSystemMessage("Chat was cleared by a moderator."); });

    // ---------------------------------------------------------------- Viewers / uptime / live state
    function setViewers(n) {
        state.viewers = Math.max(0, Math.round(n));
        viewerDisplay.textContent = playerViewers.textContent = fmt(state.viewers);
    }
    function tickUptime() {
        const s = Math.floor((Date.now() - state.uptimeStart) / 1000);
        const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
        uptimeEls.forEach(el => el.textContent = `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`);
    }
    function setLive(on) {
        liveBadge.textContent = on ? "Live" : "Offline";
        liveBadge.classList.toggle("offline", !on);
        $("channel-avatar-wrap").classList.toggle("offline", !on);
        if (on) { state.uptimeStart = state.uptimeStart || Date.now(); tickUptime(); state.uptimeTimer = setInterval(tickUptime, 1000); }
        else { clearInterval(state.uptimeTimer); }
    }
    setInterval(() => {
        if (!state.streaming) return;
        const change = rand(5) + 1;
        setViewers(state.viewers + (Math.random() > 0.5 ? change : -change));
    }, randBetween(2000, 5000));

    // ---------------------------------------------------------------- Left sidebar
    const SIDE_CHANNELS = [
        ["LongLiveTheEmpire", "Halo Infinite", "#8f6bff"], ["pixelmoth", "Stardew Valley", "#ff8a5c"], ["Kaz_Plays", "Elden Ring", "#2ec4b6"],
        ["notaspeedrunner", "Celeste", "#ffd166"], ["ChefByte", "Just Chatting", "#ff4f8b"], ["GrandmaGaming", "Minecraft", "#4cc9f0"],
        ["VoidWalker_TV", "Apex Legends", "#b5179e"], ["quietcoder", "Software & Game Dev", "#06d6a0"], ["TacticalTurnip", "Rocket League", "#f77f00"],
        ["sleepy_sam", "Animal Crossing", "#90be6d"], ["RetroRewind", "Retro", "#577590"]
    ];
    const sideList = $("side-list");
    const sideState = SIDE_CHANNELS.map(([n, g, c], i) => ({ n, g, c, v: i < 8 ? rand(12000) + 40 : 0, live: i < 8 }));
    function renderSidebar() {
        sideList.innerHTML = "";
        sideState.forEach(ch => {
            const row = document.createElement("div");
            row.className = `ch-row ${ch.live ? "" : "offline"}`; row.title = ch.n;
            row.innerHTML = `<div class="ch-avatar" style="background:${ch.c}">${ch.n[0].toUpperCase()}</div><div class="ch-meta"><div class="ch-name"></div><div class="ch-game"></div></div><div class="ch-live">${ch.live ? (ch.v >= 1000 ? (ch.v / 1000).toFixed(1) + "K" : ch.v) : "Offline"}</div>`;
            row.querySelector(".ch-name").textContent = ch.n; row.querySelector(".ch-game").textContent = ch.g;
            row.addEventListener("click", () => toast(`${ch.n} is only here for decoration — this simulator has one channel.`));
            sideList.appendChild(row);
        });
    }
    renderSidebar();
    setInterval(() => { sideState.forEach(ch => { if (ch.live) ch.v = Math.max(1, ch.v + rand(61) - 30); }); renderSidebar(); }, 8000);
    $("collapse-left-btn").addEventListener("click", () => $("left-sidebar").classList.toggle("collapsed"));
    $("collapse-chat-btn").addEventListener("click", () => document.body.classList.add("chat-collapsed"));
    $("chat-expand-btn").addEventListener("click", () => document.body.classList.remove("chat-collapsed"));

    // ---------------------------------------------------------------- Video sources
    function setActiveSource(id) { document.querySelectorAll(".source-btn").forEach(b => b.classList.toggle("active", b.id === id)); player.classList.toggle("has-source", !!id); }
    function stopCurrentMedia() {
        if (state.webcamStream) { state.webcamStream.getTracks().forEach(t => t.stop()); state.webcamStream = null; }
        if (state.uploadedVideoUrl) { URL.revokeObjectURL(state.uploadedVideoUrl); state.uploadedVideoUrl = null; }
        streamVideo.pause(); streamVideo.removeAttribute("src"); streamVideo.srcObject = null; streamVideo.load();
        youtubeFrame.removeAttribute("src"); player.classList.remove("youtube-active");
    }
    function getYouTubeVideoId(value) {
        const trimmed = value.trim();
        if (/^[\w-]{11}$/.test(trimmed)) return trimmed;
        try {
            const url = new URL(trimmed);
            if (url.hostname.includes("youtu.be")) return url.pathname.split("/").filter(Boolean)[0] || null;
            if (url.hostname.includes("youtube.com")) return url.searchParams.get("v") || (url.pathname.match(/\/(?:embed|shorts|live)\/([\w-]{11})/) || [])[1] || null;
        } catch (_) { }
        return null;
    }
    $("upload-source-btn").addEventListener("click", () => { youtubeInputRow.classList.remove("visible"); fileInput.click(); });
    fileInput.addEventListener("change", () => {
        const file = fileInput.files[0]; if (!file) return;
        stopCurrentMedia();
        state.uploadedVideoUrl = URL.createObjectURL(file);
        streamVideo.src = state.uploadedVideoUrl; streamVideo.loop = true; streamVideo.muted = true;
        setActiveSource("upload-source-btn");
        sourceStatus.textContent = `Now previewing uploaded video: ${file.name}`;
        streamVideo.play().catch(() => { sourceStatus.textContent += " — press play to start it."; });
        fileInput.value = "";
    });
    $("webcam-source-btn").addEventListener("click", async () => {
        youtubeInputRow.classList.remove("visible");
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { sourceStatus.textContent = "Webcam access is not supported by this browser."; return; }
        try {
            stopCurrentMedia();
            state.webcamStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            streamVideo.srcObject = state.webcamStream; streamVideo.muted = true; streamVideo.loop = false;
            setActiveSource("webcam-source-btn");
            sourceStatus.textContent = "Webcam preview is live. Camera access stays in your browser.";
            await streamVideo.play();
        } catch (e) { sourceStatus.textContent = "Camera access was not granted. Allow it in your browser and try again."; }
    });
    $("youtube-source-btn").addEventListener("click", () => { youtubeInputRow.classList.toggle("visible"); youtubeUrlInput.focus(); });
    function loadYouTubeVideo() {
        const id = getYouTubeVideoId(youtubeUrlInput.value);
        if (!id) { sourceStatus.textContent = "Please enter a valid YouTube URL or 11-character video ID."; return; }
        stopCurrentMedia();
        youtubeFrame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&mute=1&rel=0`;
        player.classList.add("youtube-active");
        setActiveSource("youtube-source-btn");
        sourceStatus.textContent = "YouTube video loaded into your stream preview.";
    }
    $("load-youtube-btn").addEventListener("click", loadYouTubeVideo);
    youtubeUrlInput.addEventListener("keydown", e => { if (e.key === "Enter") loadYouTubeVideo(); });
    $("clear-source-btn").addEventListener("click", () => { stopCurrentMedia(); setActiveSource(null); youtubeInputRow.classList.remove("visible"); sourceStatus.textContent = "Source cleared. Choose a source to begin your stream preview."; });
    window.addEventListener("beforeunload", stopCurrentMedia);

    // Player controls
    const playBtn = $("pc-play"), muteBtn = $("pc-mute"), volume = $("pc-volume");
    function syncPlayUI() { playBtn.innerHTML = `<svg class="icon"><use href="#${streamVideo.paused ? "i-play" : "i-pause"}"/></svg>`; playBtn.dataset.tip = streamVideo.paused ? "Play (space)" : "Pause (space)"; }
    function syncMuteUI() { muteBtn.innerHTML = `<svg class="icon"><use href="#${streamVideo.muted || streamVideo.volume === 0 ? "i-mute" : "i-volume"}"/></svg>`; muteBtn.dataset.tip = streamVideo.muted ? "Unmute (m)" : "Mute (m)"; }
    function togglePlay() { if (player.classList.contains("youtube-active")) return toast("Use the YouTube player controls for embedded video."); if (!streamVideo.src && !streamVideo.srcObject) return; streamVideo.paused ? streamVideo.play().catch(() => { }) : streamVideo.pause(); }
    function toggleMute() { streamVideo.muted = !streamVideo.muted; if (!streamVideo.muted && streamVideo.volume === 0) streamVideo.volume = 0.5; volume.value = streamVideo.muted ? 0 : streamVideo.volume; syncMuteUI(); }
    playBtn.addEventListener("click", togglePlay);
    muteBtn.addEventListener("click", toggleMute);
    volume.addEventListener("input", () => { streamVideo.volume = +volume.value; streamVideo.muted = +volume.value === 0; syncMuteUI(); });
    streamVideo.addEventListener("play", syncPlayUI); streamVideo.addEventListener("pause", syncPlayUI);
    streamVideo.volume = 0.5; syncPlayUI(); syncMuteUI();
    function toggleTheater() { document.body.classList.toggle("theater"); }
    function toggleFullscreen() { document.fullscreenElement ? document.exitFullscreen() : player.requestFullscreen?.(); }
    function makeClip() { toast("Clip created! (Simulated — nothing was saved.)"); if (state.streaming) appendSystemMessage(`${streamerName()} created a clip: "${$("stream-title").textContent.slice(0, 40)}"`); }
    $("pc-theater").addEventListener("click", toggleTheater);
    $("pc-fullscreen").addEventListener("click", toggleFullscreen);
    $("pc-clip").addEventListener("click", makeClip);
    $("pc-settings").addEventListener("click", () => toast("Quality: Auto (1080p60) · Latency: Low"));

    // ---------------------------------------------------------------- Editable channel text
    function makeEditable(el, onSave) {
        const beginEdit = () => {
            if (el.dataset.editing === "true") return;
            el.dataset.editing = "true";
            const input = document.createElement("input");
            input.id = el.id; input.className = `${el.className} editable-input`; input.value = el.textContent;
            input.setAttribute("aria-label", `Edit ${el.title.replace("Click to edit ", "")}`);
            input.style.width = `${Math.max(el.offsetWidth + 24, 150)}px`;
            const save = () => { const v = input.value.trim(); if (v && v !== el.textContent) { el.textContent = v; onSave?.(v); } el.dataset.editing = "false"; input.replaceWith(el); };
            input.addEventListener("blur", save, { once: true });
            input.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); input.blur(); } if (e.key === "Escape") { input.value = el.textContent; input.blur(); } });
            el.replaceWith(input); input.focus(); input.select();
        };
        el.addEventListener("click", beginEdit);
        el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); beginEdit(); } });
    }
    function syncStreamerName() {
        const n = streamerName();
        $("about-name").textContent = n; $("chat-identity-name").textContent = n; $("pin-by").textContent = n;
        $("nav-avatar").textContent = n[0].toUpperCase(); document.title = `${n} - Jitter`;
    }
    makeEditable($("stream-title"), v => { if (state.streaming) appendSystemMessage(`Stream title updated: ${v}`); });
    makeEditable($("game-name"), v => { if (state.streaming) appendSystemMessage(`${streamerName()} is now playing ${v}`); });
    makeEditable($("my-streamer-name"), syncStreamerName);
    syncStreamerName();

    // ---------------------------------------------------------------- Follow / sub / share
    followBtn.addEventListener("click", () => {
        state.following = !state.following;
        followBtn.classList.toggle("following", state.following);
        followBtn.classList.toggle("primary", !state.following);
        followBtn.innerHTML = `<svg class="icon sm"><use href="#${state.following ? "i-heart-fill" : "i-heart"}"/></svg><span>${state.following ? "Following" : "Follow"}</span>`;
        if (state.following) toast(`You are now following ${streamerName()}!`);
    });
    subBtn.addEventListener("click", () => {
        state.subscribed = !state.subscribed;
        subBtn.classList.toggle("subscribed", state.subscribed);
        subBtn.querySelector("span").textContent = state.subscribed ? "Subscribed" : "Subscribe";
        if (state.subscribed) { toast(`Subscribed to ${streamerName()} — Tier 1`); if (state.streaming) appendAlert("", `You just subscribed to ${streamerName()}!`, "Tier 1 · Welcome to the community", "i-star"); }
    });
    $("share-button").addEventListener("click", async () => { try { await navigator.clipboard.writeText(location.href); toast("Link copied to clipboard"); } catch (_) { toast(location.href); } });
    $("nav-bits").addEventListener("click", e => { e.preventDefault(); state.bits += 500; $("bits-balance").textContent = fmt(state.bits); toast("Added 500 bits (free in the simulator)."); });
    $("chat-settings-btn").addEventListener("click", () => { $("sim-panel").classList.remove("collapsed"); $("sim-panel").scrollIntoView({ behavior: "smooth", block: "end" }); });
    $("chat-users-btn").addEventListener("click", () => toast(`${fmt(state.viewers)} viewers · ${fmt(Math.round(state.viewers * 0.07))} chatters · 3 moderators`));
    $("nav-notifications").addEventListener("click", () => { $("notif-dot").style.display = "none"; toast("No new notifications."); });

    // ---------------------------------------------------------------- Emote picker
    const emotePicker = $("emote-picker"), emoteGrid = $("emote-grid");
    Object.entries(Generator.EMOTES).forEach(([name, glyph]) => {
        const b = document.createElement("button"); b.type = "button"; b.title = name; b.textContent = glyph;
        b.addEventListener("click", () => { userChatInput.value = `${userChatInput.value.trimEnd()} ${name} `.trimStart(); userChatInput.focus(); });
        emoteGrid.appendChild(b);
    });
    $("emote-btn").addEventListener("click", e => { e.stopPropagation(); emotePicker.classList.toggle("visible"); });
    document.addEventListener("click", e => { if (!emotePicker.contains(e.target)) emotePicker.classList.remove("visible"); });

    // ---------------------------------------------------------------- User chat input
    function sendUserMessage() {
        const text = userChatInput.value.trim();
        if (!text) return;
        if (text.startsWith("/")) { handleCommand(text); userChatInput.value = ""; return; }
        const cheer = text.match(/\bcheer(\d+)\b/i);
        if (cheer) { const n = +cheer[1]; if (n > state.bits) return toast("Not enough bits."); state.bits -= n; $("bits-balance").textContent = fmt(state.bits); }
        appendChatMessage(streamerName(), text, "#FFD700", { badges: ["broadcaster"], self: true });
        userChatInput.value = "";
        emotePicker.classList.remove("visible");
        document.dispatchEvent(new CustomEvent("jitter:usermessage", { detail: { text } }));
    }
    function handleCommand(cmd) {
        const [name, ...rest] = cmd.slice(1).split(" ");
        const arg = rest.join(" ");
        switch (name.toLowerCase()) {
            case "me": appendChatMessage(streamerName(), arg, "#FFD700", { badges: ["broadcaster"], self: true }); break;
            case "clear": chatBox.innerHTML = ""; state.lines = 0; appendSystemMessage("Chat was cleared by a moderator."); break;
            case "pin": $("pin-text").textContent = arg; $("chat-pinned").classList.toggle("visible", !!arg); break;
            case "unpin": $("chat-pinned").classList.remove("visible"); break;
            case "title": if (arg) { $("stream-title").textContent = arg; appendSystemMessage(`Stream title updated: ${arg}`); } break;
            case "game": if (arg) { $("game-name").textContent = arg; appendSystemMessage(`${streamerName()} is now playing ${arg}`); } break;
            case "raid": openRaidPrompt(); break;
            case "help": appendSystemMessage("Commands: /me, /clear, /pin <text>, /unpin, /title <text>, /game <text>, /raid, /help"); break;
            default: appendSystemMessage(`Unknown command: /${name}. Try /help`);
        }
    }
    sendChatBtn.addEventListener("click", sendUserMessage);
    userChatInput.addEventListener("keydown", e => { if (e.key === "Enter") sendUserMessage(); });

    // ---------------------------------------------------------------- Cheer (super chat) overlay — 1s in, 10s hold, 1s out, every 30–90s
    function clearSuperChat() {
        clearTimeout(state.superChatTimer); clearTimeout(state.superChatHideTimer); clearTimeout(state.superChatClearTimer);
        state.superChatTimer = state.superChatHideTimer = state.superChatClearTimer = null;
        superChat.classList.remove("visible"); superChatLabel.textContent = ""; superChatMessage.textContent = "";
    }
    function scheduleSuperChat() {
        if (!state.streaming || state.superChatTimer) return;
        state.superChatTimer = setTimeout(showSuperChat, rand(60001) + 30000);
    }
    function showSuperChat() {
        state.superChatTimer = null;
        if (!state.streaming) return;
        const username = Generator.username(), bits = rand(901) + 100, msg = Generator.cheerMessage();
        superChatLabel.innerHTML = `<svg class="icon"><use href="#i-bits"/></svg><span></span>`;
        superChatLabel.querySelector("span").textContent = `${username} cheered ${fmt(bits)} bits`;
        superChatMessage.textContent = msg;
        appendChatMessage(username, `cheer${bits} ${msg}`, Generator.color(), { highlight: true, badges: Math.random() < 0.5 ? ["sub"] : [] });
        requestAnimationFrame(() => superChat.classList.add("visible"));
        state.superChatHideTimer = setTimeout(() => {
            if (!state.streaming) return;
            superChat.classList.remove("visible");
            state.superChatClearTimer = setTimeout(() => { superChatLabel.textContent = ""; superChatMessage.textContent = ""; state.superChatHideTimer = state.superChatClearTimer = null; scheduleSuperChat(); }, 1000);
        }, 11000);
    }

    // ---------------------------------------------------------------- Chat loop
    const speedSlider = $("speed-slider"), speedVal = $("speed-val");
    speedSlider.addEventListener("input", () => { state.speed = 0.25 * Math.pow(2, speedSlider.value / 25); speedVal.textContent = `${state.speed.toFixed(state.speed < 1 ? 2 : 1)}×`; });
    $("mood-select").addEventListener("change", e => { state.mood = e.target.value; });
    $("sim-head").addEventListener("click", () => $("sim-panel").classList.toggle("collapsed"));

    function createChatMessage() {
        if (!state.streaming) return;
        const user = Generator.username();
        // 40% chance to pull a raider message instead of a typical message while a raid is active
        const msg = state.raidAccepted && Math.random() < 0.40 ? Generator.raidMessage() : Generator.message();
        const badges = [];
        const r = Math.random();
        if (r < 0.02) badges.push("mod"); else if (r < 0.04) badges.push("vip"); else if (r < 0.30) badges.push("sub"); else if (r < 0.36) badges.push("prime");
        appendChatMessage(user, msg, Generator.color(), { badges, firstTime: Math.random() < 0.02 });

        const burstChance = state.raidAccepted ? 0.95 : 0.85;
        const base = Math.random() < burstChance ? randBetween(10, 300) : randBetween(1000, 3000);
        state.chatTimer = setTimeout(createChatMessage, base / state.speed);
    }

    function setToggleUI() {
        toggleBtn.classList.remove("loading");
        toggleBtn.classList.toggle("live", state.streaming);
        toggleBtn.classList.toggle("primary", !state.streaming);
        toggleBtn.textContent = state.streaming ? "End stream" : "Go live";
    }
    toggleBtn.addEventListener("click", () => {
        state.streaming = !state.streaming;
        setToggleUI(); setLive(state.streaming);
        if (state.streaming) {
            appendSystemMessage(`${streamerName()} is now live! Welcome to the chat room.`);
            createChatMessage(); scheduleSuperChat();
            document.dispatchEvent(new CustomEvent("jitter:start"));
        } else {
            clearTimeout(state.chatTimer); clearSuperChat();
            appendSystemMessage("STREAM ENDED");
            state.uptimeStart = null;
            document.dispatchEvent(new CustomEvent("jitter:stop"));
        }
    });

    // ---------------------------------------------------------------- Raids (press R)
    const RAIDERS = [["LongLiveTheEmpire", "Halo Infinite"], ["pixelmoth", "Stardew Valley"], ["Kaz_Plays", "Elden Ring"], ["VoidWalker_TV", "Apex Legends"], ["TacticalTurnip", "Rocket League"]];
    function openRaidPrompt() {
        if (state.raidAccepted) return toast("A raid already landed this stream.");
        const [name, game] = RAIDERS[rand(RAIDERS.length)];
        state.raider = { name, game, size: rand(500) + 1800 }; // Between 1800 and 2300
        $("raid-from").textContent = name; $("raid-game").textContent = game; $("raid-size").textContent = fmt(state.raider.size); $("raid-avatar").textContent = name[0].toUpperCase();
        raidModal.classList.add("visible"); $("notif-dot").style.display = "block";
    }
    document.addEventListener("keydown", e => {
        const tag = e.target.tagName.toLowerCase();
        if (tag === "input" || tag === "textarea" || tag === "select" || e.target.isContentEditable) return;
        const k = e.key.toLowerCase();
        if (k === "r" && !e.altKey && !state.raidAccepted) openRaidPrompt();
        else if (k === "t" && e.altKey) { e.preventDefault(); toggleTheater(); }
        else if (k === "x" && e.altKey) { e.preventDefault(); makeClip(); }
        else if (k === "f") toggleFullscreen();
        else if (k === "m") toggleMute();
        else if (k === " ") { e.preventDefault(); togglePlay(); }
        else if (k === "escape") document.body.classList.remove("theater");
    });
    $("raid-trigger-btn").addEventListener("click", openRaidPrompt);
    $("reject-raid-btn").addEventListener("click", () => { raidModal.classList.remove("visible"); toast(`Declined raid from ${state.raider?.name || "channel"}.`); });
    $("accept-raid-btn").addEventListener("click", () => {
        raidModal.classList.remove("visible");
        state.raidAccepted = true; // Locks out future raids
        const spike = state.raider.size;
        setViewers(state.viewers + spike);
        if (state.streaming) appendAlert("raid", `${state.raider.name} is raiding with a party of ${fmt(spike)}!`, `Welcome, raiders from ${state.raider.game}!`, "i-raid");
        toast(`${state.raider.name} raided with ${fmt(spike)} viewers!`);
        document.dispatchEvent(new CustomEvent("jitter:raid", { detail: state.raider }));
    });

    // ---------------------------------------------------------------- Data loading
    async function loadDictionaries() {
        let loaded = false, names = null, words = null;
        try {
            const w = await fetch("data/google-10000-english-usa.txt");
            if (w.ok) { words = (await w.text()).split(/\r?\n/).filter(l => l.trim()); loaded = true; }
            const u = await fetch("data/xato-net-10-million-usernames-dup.txt");
            if (u.ok) { names = (await u.text()).split(/\r?\n/).filter(l => l.trim()); loaded = true; }
        } catch (e) { console.warn("Word lists unavailable (open via a local server to load them):", e.message); }
        Generator.init({ names, words });
        toggleBtn.disabled = false; setToggleUI();
        const s = Generator.stats();
        appendSystemMessage(loaded ? `Welcome to the chat room! Loaded ${fmt(s.names)} usernames and ${fmt(s.words)} words.` : "Welcome to the chat room! Running with built-in sample data (start a local server to load the full word lists).");
        if (new URLSearchParams(location.search).has("autostart")) toggleBtn.click();
    }
    setViewers(state.viewers);
    loadDictionaries();

    window.Jitter = { state, toast, appendChatMessage, appendSystemMessage, appendAlert, setViewers, streamerName, gameName };
})();
