// Jitter — message / username generator (stage 1: ported logic behind a stable API).
(function () {
    const C = window.JitterCorpus;
    const COLORS = ["#FF0000", "#0000FF", "#008000", "#B22222", "#FF7F50", "#9ACD32", "#FF4500", "#2E8B57", "#DAA520", "#D2691E", "#5F9EA0", "#1E90FF", "#FF69B4", "#8A2BE2", "#00FF7F"];
    const EMOTE_NAMES = Object.keys(C.emotes);
    let names = C.nameBases.slice();
    let words = ["wow", "that", "play", "was", "wild", "chat", "huge", "nice", "clip", "crazy"];
    let lastChat = "", lastRaid = "";

    const rand = n => Math.floor(Math.random() * n);
    const pick = (items, prev = "") => {
        if (items.length < 2) return items[0];
        let c; do { c = items[rand(items.length)]; } while (c === prev);
        return c;
    };
    const withEmote = (m, chance = 0.48) => Math.random() < chance ? `${m} ${pick(EMOTE_NAMES)}` : m;

    function username() {
        let name = names[rand(names.length)];
        if (Math.random() < 0.3) name += Math.random() < 0.5 ? "_" : "-";
        if (Math.random() < 0.5) name += rand(9999) + 1;
        return name;
    }

    function message() {
        const t = Math.random(); let m;
        if (t < 0.36) m = pick(C.chatThoughts.reactions, lastChat);
        else if (t < 0.66) m = pick(C.chatThoughts.thoughts, lastChat);
        else if (t < 0.91) m = pick(C.chatThoughts.suggestions, lastChat);
        else m = pick(C.chatThoughts.roasts, lastChat);
        lastChat = m;
        return withEmote(m);
    }

    function raidMessage() {
        const m = pick(C.raidThoughts, lastRaid);
        lastRaid = m;
        return withEmote(m, 0.62);
    }

    window.Generator = {
        EMOTES: C.emotes,
        COLORS,
        init({ names: n, words: w } = {}) { if (n && n.length) names = n; if (w && w.length) words = w; },
        stats: () => ({ names: names.length, words: words.length }),
        username, message, raidMessage,
        cheerMessage: message,
        color: () => COLORS[rand(COLORS.length)]
    };
})();
