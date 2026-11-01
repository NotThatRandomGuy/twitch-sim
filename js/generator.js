// Jitter — chat generator
// Produces realistic Twitch-style chat by mixing several sources:
//   * a trigram Markov chain (with bigram backoff) trained on the corpus
//   * verbatim corpus lines from mood/topic-weighted categories
//   * slot-filled templates ({streamer}, {game}, {other}, ...)
//   * emote/short bursts, peer replies, commands, copypasta and ironic "quotes"
// then runs the result through per-chatter style transforms (caps, elongation, typos, emotes).
// Chat is spoken by a pool of recurring "chatter" personas so the same names show up again.
(function () {
    "use strict";
    const C = window.JitterCorpus;
    const EMOTE_NAMES = Object.keys(C.emotes);

    // ------------------------------------------------------------------ helpers
    const rand = n => Math.floor(Math.random() * n);
    const chance = p => Math.random() < p;
    const pick = arr => arr[rand(arr.length)];
    const pickNot = (arr, prev) => { if (arr.length < 2) return arr[0]; let c; do { c = pick(arr); } while (c === prev); return c; };
    const between = (a, b) => a + rand(b - a + 1);
    function weighted(table) { // table: {key: weight}
        let total = 0; for (const k in table) total += table[k];
        let r = Math.random() * total;
        for (const k in table) { r -= table[k]; if (r <= 0) return k; }
        return Object.keys(table)[0];
    }
    const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

    // ------------------------------------------------------------------ Markov chain (order 2 + backoff)
    class Markov {
        constructor() { this.tri = new Map(); this.bi = new Map(); this.lines = new Set(); }
        train(lines) {
            for (const raw of lines) {
                const line = raw.trim(); if (!line) continue;
                this.lines.add(line.toLowerCase());
                const seq = ["<s>", "<s>", ...line.split(/\s+/), "</s>"];
                for (let i = 0; i + 2 < seq.length; i++) {
                    const k2 = `${seq[i]} ${seq[i + 1]}`, k1 = seq[i + 1], nxt = seq[i + 2];
                    (this.tri.get(k2) || this.tri.set(k2, []).get(k2)).push(nxt);
                    (this.bi.get(k1) || this.bi.set(k1, []).get(k1)).push(nxt);
                }
            }
        }
        generate(minLen = 2, maxLen = 16) {
            for (let attempt = 0; attempt < 8; attempt++) {
                let w1 = "<s>", w2 = "<s>", out = [], ended = false;
                while (out.length < maxLen) {
                    let opts = this.tri.get(`${w1} ${w2}`);
                    // back off to the bigram table when the trigram context is sparse — this is what creates novel recombinations
                    if (!opts || (opts.length < 3 && chance(0.3))) opts = this.bi.get(w2) || opts;
                    if (!opts) break;
                    const nxt = pick(opts);
                    if (nxt === "</s>") { ended = true; break; }
                    out.push(nxt); w1 = w2; w2 = nxt;
                }
                if (out.length < minLen || (!ended && chance(0.7))) continue;
                const text = out.join(" ");
                if (/(\b\w+\b)(?:\s+\1\b){2,}/i.test(text)) continue; // "the the the"
                if (attempt < 5 && this.lines.has(text.toLowerCase()) && chance(0.5)) continue; // prefer novel lines
                return text;
            }
            return pick(C.general);
        }
    }
    const markov = new Markov();
    markov.train([...C.general, ...C.conversational, ...C.questions, ...C.salty, ...C.wholesome, ...C.backseat, ...C.tech, ...C.food, ...C.greetings, ...C.gameTalk]);

    // ------------------------------------------------------------------ data from /data (optional)
    let bigNames = null, bigWords = null, quotes = null;
    const NAME_OK = /^[A-Za-z][A-Za-z0-9_]{2,19}$/;
    // The external lists are scraped data; keep obviously offensive fragments out of generated names.
    const BLOCKED = /(nigg|fag|retard|rape|nazi|hitler|kkk|cunt|whore|slut|sperm|penis|vagina|dick|cock|pussy|anal|sex|porn|fuck|shit|bitch|ass(?:hole|es)?$|tits|boob|jew|chink|spic|kike|tranny|dyke|molest|pedo|suicide|kill|muslim|islam|jesus|christ|allah|hindu|negro|terror|isis)/i;
    const clean = s => !BLOCKED.test(s);
    function init({ names, words, phrases } = {}) {
        if (names && names.length) bigNames = names;
        if (words && words.length) bigWords = words.filter(w => /^[a-z]{4,9}$/.test(w) && clean(w));
        if (phrases && phrases.length) quotes = phrases.map(p => p.replace(/\t.*$/, "").trim()).filter(p => p.length > 8 && p.length < 70);
    }
    const stats = () => ({ names: bigNames ? bigNames.length : C.nameHandles.length, words: bigWords ? bigWords.length : C.nameNouns.length, quotes: quotes ? quotes.length : 0 });

    // ------------------------------------------------------------------ usernames
    const NUM_SUFFIX = () => pick([() => between(1, 99), () => between(100, 999), () => between(1000, 9999), () => pick([69, 420, 1337, 777, 99, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 123, 321, 7, 0]), () => `_${between(1, 99)}`, () => `_${between(1990, 2010)}`])();
    function caseStyle(s) { const r = Math.random(); return r < 0.5 ? s : r < 0.8 ? cap(s) : r < 0.95 ? s.toLowerCase() : s.toUpperCase(); }
    function bigListName() {
        if (!bigNames) return null;
        for (let i = 0; i < 12; i++) { const n = bigNames[rand(bigNames.length)]; if (NAME_OK.test(n) && !/^(null|admin|info|test|user)$/i.test(n) && clean(n)) return n; }
        return null;
    }
    function wordPart() { return bigWords && chance(0.5) ? pick(bigWords) : pick(C.nameNouns); }
    function username() {
        const style = Math.random(); let name;
        if (style < 0.42 && bigNames) {
            name = caseStyle(bigListName() || pick(C.nameHandles));
            const r = Math.random();
            if (r < 0.35) name += NUM_SUFFIX(); else if (r < 0.45) name += `_${wordPart()}`; else if (r < 0.5) name = `${name}TTV`; else if (r < 0.53) name = `ttv_${name.toLowerCase()}`; else if (r < 0.55) name = `xX_${name}_Xx`;
        } else if (style < 0.8) {
            const a = pick(C.nameAdjectives), b = wordPart();
            const r = Math.random();
            name = r < 0.4 ? cap(a) + cap(b) : r < 0.65 ? `${a}_${b}` : r < 0.8 ? a + b : r < 0.9 ? cap(b) + cap(a) : `${cap(a)}${cap(b)}${cap(wordPart())}`;
            if (chance(0.4)) name += NUM_SUFFIX();
        } else {
            name = pick(C.nameHandles);
            if (chance(0.3)) name += NUM_SUFFIX();
        }
        name = name.replace(/[^A-Za-z0-9_]/g, "").slice(0, 25);
        return name.length >= 3 && clean(name) ? name : `user${between(1000, 99999)}`;
    }
    const color = () => chance(0.15) ? pick(C.customColors) : pick(C.colors);

    // ------------------------------------------------------------------ chatter personas
    const pool = []; const byName = new Map();
    const recent = []; // recently active chatter names (for @replies)
    const MODS = ["Nightbot", "mod_marie", "SirLurksALot", "k8_moderates"];
    function makeChatter(opts = {}) {
        const sub = opts.sub ?? chance(0.28);
        const badges = [];
        if (opts.mod) badges.push("mod"); else if (opts.vip) badges.push("vip");
        if (sub) badges.push(chance(0.06) ? "founder" : "sub"); else if (chance(0.09)) badges.push("prime");
        if (chance(0.02)) badges.push("turbo");
        const ch = {
            name: opts.name || username(), color: opts.color || color(), badges,
            emoteRate: 0.15 + Math.random() * 0.6, caps: Math.random() < 0.2 ? Math.random() * 0.3 : 0.02,
            chatty: opts.mod ? 2.2 : 0.25 + Math.random() * 2.2, typos: Math.random() < 0.25 ? Math.random() * 0.08 : 0,
            proper: chance(0.08), favEmotes: [pick(EMOTE_NAMES), pick(EMOTE_NAMES), pick(EMOTE_NAMES)],
            count: 0, raider: !!opts.raider, backseater: chance(0.15), salty: chance(0.12), nice: chance(0.3), joined: Date.now()
        };
        if (ch.name === "Nightbot") { ch.badges = ["mod"]; ch.color = "#5f9ea0"; ch.chatty = 0.3; ch.bot = true; }
        return ch;
    }
    function addChatter(ch) { if (byName.has(ch.name)) return byName.get(ch.name); pool.push(ch); byName.set(ch.name, ch); return ch; }
    function seedPool() {
        MODS.forEach(n => addChatter(makeChatter({ name: n, mod: true, sub: true })));
        ["pixelmoth", "notaspeedrunner"].forEach(n => addChatter(makeChatter({ name: n, vip: true, sub: true })));
        for (let i = 0; i < 70; i++) addChatter(makeChatter());
    }
    seedPool();
    function poolCap(viewers) { return Math.min(700, Math.max(90, Math.round(viewers * 0.12))); }
    function pickChatter(ctx = {}) {
        const viewers = ctx.viewers || 1400;
        const newcomerRate = ctx.raidActive ? 0.45 : 0.22;
        if (chance(newcomerRate) || pool.length < 20) {
            const ch = addChatter(makeChatter({ raider: !!ctx.raidActive && chance(0.8) }));
            if (pool.length > poolCap(viewers)) { // evict a random low-activity non-mod regular
                const idx = pool.findIndex(c => !c.badges.includes("mod") && c.count < 2 && c !== ch);
                if (idx >= 0) { byName.delete(pool[idx].name); pool.splice(idx, 1); }
            }
            return ch;
        }
        // weighted by chattiness; raiders favoured while a raid is fresh
        let total = 0; const w = pool.map(c => { const v = c.chatty * (ctx.raidActive && c.raider ? 2 : 1) * (c.bot ? 0.2 : 1); total += v; return v; });
        let r = Math.random() * total;
        for (let i = 0; i < pool.length; i++) { r -= w[i]; if (r <= 0) return pool[i]; }
        return pool[pool.length - 1];
    }
    function noteSpoke(ch) { ch.count++; ch.last = Date.now(); recent.push(ch.name); if (recent.length > 40) recent.shift(); }
    const otherName = (not) => { const cands = recent.filter(n => n !== not); return cands.length ? pick(cands) : pick(pool).name; };
    function onRaid(raider, size) {
        const n = Math.min(60, Math.max(15, Math.round(size / 40)));
        for (let i = 0; i < n; i++) addChatter(makeChatter({ raider: true, sub: chance(0.1) }));
        state.raider = raider;
    }

    // ------------------------------------------------------------------ mood / topic state
    const MOODS = ["chill", "hype", "salty", "wholesome"];
    const state = { mood: "chill", moodMode: "auto", moodUntil: 0, topic: null, topicUntil: 0, wave: null, raider: null, lastTexts: [] };
    const WEIGHTS = {
        chill: { short: 16, emoteOnly: 8, markov: 22, general: 14, conversational: 10, questions: 8, streamerDirected: 4, gameTalk: 4, backseat: 4, salty: 3, wholesome: 6, greetings: 4, tech: 2, food: 2, copypasta: 1, commands: 2, peer: 5, quote: 1 },
        hype: { short: 28, emoteOnly: 22, markov: 12, general: 10, conversational: 3, questions: 2, streamerDirected: 2, gameTalk: 2, backseat: 3, salty: 2, wholesome: 6, greetings: 1, tech: 1, food: 0, copypasta: 1, commands: 1, peer: 3, quote: 0 },
        salty: { short: 16, emoteOnly: 10, markov: 14, general: 8, conversational: 4, questions: 4, streamerDirected: 3, gameTalk: 2, backseat: 10, salty: 24, wholesome: 1, greetings: 1, tech: 1, food: 0, copypasta: 2, commands: 1, peer: 5, quote: 1 },
        wholesome: { short: 10, emoteOnly: 10, markov: 20, general: 8, conversational: 12, questions: 6, streamerDirected: 6, gameTalk: 3, backseat: 1, salty: 0, wholesome: 24, greetings: 8, tech: 1, food: 2, copypasta: 1, commands: 1, peer: 5, quote: 1 }
    };
    const TOPICS = ["tech", "food", "greetings", "questions", "gameTalk", "backseat", "streamerDirected"];
    function tick(now = Date.now()) { // called by the app every few seconds
        if (state.moodMode === "auto" && now > state.moodUntil) {
            state.mood = weighted({ chill: 50, hype: 18, salty: 15, wholesome: 17 });
            state.moodUntil = now + between(25000, 70000);
        }
        if (now > state.topicUntil) {
            state.topic = chance(0.45) ? pick(TOPICS) : null;
            state.topicUntil = now + (state.topic ? between(15000, 45000) : between(20000, 60000));
        }
    }
    function setMood(m) { if (m === "auto") { state.moodMode = "auto"; state.moodUntil = 0; } else { state.moodMode = "manual"; state.mood = m; } }
    function startWave(token, n) { state.wave = { token, remaining: n }; }

    // ------------------------------------------------------------------ slot filling
    // Chatters rarely type a full title like "Call of Duty: Ghosts" — they say "cod" or "ghosts".
    function shortGame(game) {
        const base = game.split(/[:\-–(]/)[0].trim();
        const words = base.split(/\s+/).filter(w => !/^(the|of|a|an|and)$/i.test(w));
        const r = Math.random();
        if (words.length >= 3 && r < 0.45) return words.map(w => w[0]).join("").toLowerCase();
        if (game.includes(":") && r < 0.75) return chance(0.5) ? base : game.split(":")[1].trim();
        return r < 0.9 ? base : game;
    }
    function fill(text, ctx = {}, self = "") {
        const game = ctx.game || "the game", streamer = ctx.streamer || "the streamer";
        return text.replace(/\{(\w+)\}/g, (_, k) => {
            switch (k) {
                case "streamer": return streamer;
                case "game": return shortGame(game);
                case "game2": return pickNot(C.games, game);
                case "other": return ctx.other || otherName(self);
                case "n": return ctx.n ?? between(2, 99);
                case "hours": return between(1, 9);
                case "country": return pick(C.countries);
                case "food": return pick(C.foods);
                case "raider": return (ctx.raid && ctx.raid.name) || state.raider || "the raid";
                case "quote": return quotes ? pick(quotes) : pick(C.conversational);
                case "reply": return pick(C.streamerReplies.generic);
                default: return "";
            }
        });
    }

    // ------------------------------------------------------------------ emote selection by sentiment
    const SENTI = [
        [/\b(lmao+|lol+|haha+|funny|crying|im dead|dying|wheezing|comedy|cinema)\b/i, "laugh"],
        [/\b(rip|f|pain|sad|unlucky|dead|over|lost|noo+|cooked|throw|threw)\b/i, "sad"],
        [/\b(lets go+|insane|clutch|pog+|w|clean|sick|cracked|goat|huge|hype|win|won|gg)\b/i, "hype"],
        [/\b(what|how|huh|why|wait|sus|explain)\b|\?/i, "confused"],
        [/\b(love|thanks|ty|welcome|hi|hello|hey|<3|proud|cozy|comfy)\b/i, "love"],
        [/\b(scary|scared|careful|dont|oh no|uh oh|behind you|low|one shot)\b/i, "scared"],
        [/\b(true|facts|real|same|agreed|yes|yep|based)\b/i, "agree"],
        [/\b(nah|nope|no|cap|wrong|cringe|mid)\b/i, "disagree"],
        [/\b(sleep|bed|tired|lurk|gn|night)\b/i, "sleepy"]
    ];
    function emoteFor(text, ch) {
        for (const [re, set] of SENTI) if (re.test(text)) return pick(C.emoteSets[set]);
        if (chance(0.3)) return pick(ch.favEmotes);
        return pick(C.emoteSets[state.mood === "hype" ? "hype" : state.mood === "salty" ? "disagree" : state.mood === "wholesome" ? "love" : "agree"]);
    }

    // ------------------------------------------------------------------ style transforms
    const ELONGATE_OK = /^(no+|go+|yes+|lol|bro+|what|why|omg|noo+|yesss|wait|stop|pls+|please|lets|yo+|woo+|ayo+|sheesh|nooo|help|ok|hi+|hey+|hello+|gg|ez|same|true|real|bruh|nah|nice|wow|oh+|ah+|ew+|ugh+|nooo+)$/i;
    function elongate(word) {
        const m = word.match(/^(.*?)([aeiouyhs])([!?.]*)$/i);
        if (!m) return word;
        return m[1] + m[2].repeat(between(3, 6)) + m[3];
    }
    function typo(word) {
        if (word.length < 5 || /[^a-z]/.test(word)) return word; // skip names, emotes, anything with capitals/punctuation
        const i = between(1, word.length - 3);
        return word.slice(0, i) + word[i + 1] + word[i] + word.slice(i + 2);
    }
    function stylize(text, ch, opts = {}) {
        const mood = state.mood;
        const isCaps = text === text.toUpperCase() && /[A-Z]/.test(text);
        const isEmoteOnly = text.split(/\s+/).every(t => C.emotes[t]);
        if (isEmoteOnly) return text;
        let words = text.split(" ");
        // elongation ("nooooo", "letsgoooo")
        const eRate = mood === "hype" ? 0.22 : 0.07;
        words = words.map((w, i) => (ELONGATE_OK.test(w) && chance(eRate) && (i === words.length - 1 || words.length <= 3)) ? elongate(w) : w);
        // typos
        if (ch.typos) words = words.map(w => chance(ch.typos) ? typo(w) : w);
        text = words.join(" ");
        // casing
        if (!isCaps) {
            if (chance(ch.caps + (mood === "hype" ? 0.12 : 0)) && words.length <= 8) text = text.toUpperCase();
            else if (ch.proper) text = cap(text) + (/[.!?]$/.test(text) || chance(0.5) ? "" : ".");
            else if (chance(0.06)) text = cap(text);
        }
        // trailing punctuation flavour
        if (!ch.proper) {
            text = text.replace(/\.$/, "");
            if (/[!?]$/.test(text) && chance(0.3)) text += text.slice(-1).repeat(between(1, 3));
            else if (text === text.toUpperCase() && /[A-Z]{3,}/.test(text) && chance(0.35)) text += "!".repeat(between(1, 4));
            else if (chance(0.03)) text += "...";
        }
        // suffix slang
        if (chance(0.07) && !/[?]$/.test(text)) text += " " + pick(["lol", "lmao", "xd", "haha", "fr", "ngl", "tbh", "lmaooo", "💀", "😭"]);
        // emotes
        const er = ch.emoteRate * (mood === "hype" ? 1.5 : mood === "chill" ? 0.85 : 1) * (opts.emoteScale ?? 1);
        if (chance(er)) {
            const e = emoteFor(text, ch);
            const reps = mood === "hype" && chance(0.4) ? between(2, 4) : 1;
            const es = Array(reps).fill(e).join(" ");
            text = chance(0.82) ? `${text} ${es}` : `${es} ${text}`;
        }
        return text;
    }

    // ------------------------------------------------------------------ message composition
    function fromCategory(cat, ctx, ch) {
        switch (cat) {
            case "short": return pick(C.shortBursts);
            case "emoteOnly": { const set = pick(ch.favEmotes.concat(C.emoteSets[state.mood === "hype" ? "hype" : state.mood === "salty" ? "sad" : "agree"])); return Array(state.mood === "hype" ? between(1, 6) : between(1, 3)).fill(set).join(" "); }
            case "markov": return markov.generate();
            case "peer": return pick(C.peerReplies);
            case "quote": return quotes ? pick(C.quoteFormats) : pick(C.copypasta);
            case "commands": return pick(C.commands);
            default: return pick(C[cat] || C.general);
        }
    }
    function pickCategory(ch) {
        const w = Object.assign({}, WEIGHTS[state.mood]);
        if (state.topic) w[state.topic] = (w[state.topic] || 2) * 4;
        if (ch.backseater) w.backseat *= 3;
        if (ch.salty) { w.salty *= 2.5; w.wholesome *= 0.3; }
        if (ch.nice) { w.wholesome *= 1.8; w.salty *= 0.4; }
        if (ch.bot) return "commands";
        if (state.emoteOnly) return "emoteOnly";
        if (ch.raider && state.raider && chance(0.3)) return "raidline";
        return weighted(w);
    }
    function isDuplicate(text) { return text.length > 12 && state.lastTexts.includes(text.toLowerCase()); }
    function remember(text) { state.lastTexts.push(text.toLowerCase()); if (state.lastTexts.length > 40) state.lastTexts.shift(); }

    function next(ctx = {}) {
        const ch = pickChatter(ctx);
        let text;
        if (ch.bot && !state.emoteOnly) text = pick(["Remember to follow the channel rules: be kind, no spoilers, no self-promo.", "Drink water! Hydration check.", `Follow ${ctx.streamer || "the streamer"} on socials with !socials`, "Clips are enabled! Use the clip button for great moments.", "Want to support the stream? !sub !bits !merch", "Chat is in low-latency mode.", "Enjoying the stream? Hit that follow button!"]);
        else if (state.wave && state.wave.remaining > 0 && chance(0.55) && !state.emoteOnly) { state.wave.remaining--; text = Array(between(1, 4)).fill(state.wave.token).join(" "); if (chance(0.3)) text = `${pick(C.shortBursts)} ${text}`; }
        else {
            for (let i = 0; i < 4; i++) {
                const cat = pickCategory(ch);
                text = cat === "raidline" ? pick(C.events.raid) : fromCategory(cat, ctx, ch);
                text = fill(text, ctx, ch.name);
                if (!isDuplicate(text)) break;
            }
            text = stylize(text, ch);
        }
        if (state.wave && state.wave.remaining <= 0) state.wave = null;
        remember(text);
        const firstTime = ch.count === 0 && !ch.badges.length && chance(0.3);
        noteSpoke(ch);
        return { chatter: ch, text, firstTime };
    }
    const message = (ctx = {}) => next(ctx).text;
    function raidMessage(ctx = {}) {
        const ch = pickChatter(Object.assign({ raidActive: true }, ctx));
        const text = stylize(fill(pick(ch.raider ? C.events.raid : C.events.raidWelcome), ctx, ch.name), ch, { emoteScale: 1.3 });
        noteSpoke(ch);
        return text;
    }
    function cheerMessage(ctx = {}) {
        const ch = pickChatter(ctx);
        const src = chance(0.5) ? C.wholesome : chance(0.5) ? C.conversational : C.streamerDirected;
        return stylize(fill(pick(src), ctx, ch.name), ch, { emoteScale: 0.6 });
    }

    // ------------------------------------------------------------------ reactions (events + replies to the broadcaster)
    function burst(lines, count, ctx, spreadMs, opts = {}) {
        const out = [];
        for (let i = 0; i < count; i++) {
            const ch = pickChatter(Object.assign({}, ctx, { raidActive: opts.raiders }));
            if (opts.raidersOnly && !ch.raider && chance(0.7)) continue;
            let text = fill(pick(lines), ctx, ch.name);
            if (opts.prefixMention && chance(0.3)) text = `@${ctx.streamer} ${text}`;
            text = stylize(text, ch, { emoteScale: opts.emoteScale ?? 1 });
            noteSpoke(ch);
            out.push({ chatter: ch, text, delay: Math.round(Math.random() ** 1.4 * spreadMs) + 150 });
        }
        return out.sort((a, b) => a.delay - b.delay);
    }
    function react(type, ctx = {}) {
        const E = C.events;
        switch (type) {
            case "raid": {
                startWave(pick(["HeyGuys", "jitterHi", "VoHiYo", "jitterLove", "peepoArrive"]), between(10, 20));
                return [...burst(E.raid, between(14, 26), ctx, 9000, { raiders: true, emoteScale: 1.3 }), ...burst(E.raidWelcome, between(5, 9), ctx, 7000)];
            }
            case "sub": return burst(E.sub, between(3, 6), ctx, 5000, { emoteScale: 1.2 });
            case "gift": startWave("jitterLove", between(4, 8)); return burst(E.gift, between(6, 14), ctx, 8000, { emoteScale: 1.2 });
            case "follow": return burst(E.follow, between(1, 2), ctx, 3000);
            case "hypeTrain": startWave("HYPERS", between(6, 10)); return burst(E.hypeTrain, between(5, 10), ctx, 6000, { emoteScale: 1.4 });
            case "moment": { setMoodBoost("hype", 20000); startWave(pick(C.emoteSets.hype), between(10, 18)); return burst(E.moment, between(12, 24), ctx, 6000, { emoteScale: 1.5 }); }
            case "fail": { setMoodBoost(chance(0.6) ? "salty" : "chill", 20000); startWave(pick(C.emoteSets.sad), between(8, 14)); return burst(E.fail, between(10, 20), ctx, 6000, { emoteScale: 1.5 }); }
            case "clip": return burst(E.clip, between(2, 4), ctx, 4000);
            case "titleChange": return burst(E.titleChange, between(2, 5), ctx, 6000);
            case "gameChange": return burst(E.gameChange, between(4, 10), ctx, 8000);
            case "pin": return burst(["pinned KEKW", "the pin", "pin is law", "read the pin", "PINNED"], between(1, 3), ctx, 4000);
            case "resub": return burst(E.resub, between(2, 5), ctx, 5000, { emoteScale: 1.2 });
            case "timeout": startWave(pick(["KEKW", "o7", "PETTHEMODS"]), between(3, 7)); return burst(E.timeout, between(5, 10), ctx, 6000);
            case "slowMode": return burst(E.slowMode, between(3, 6), ctx, 12000);
            case "brb": return burst(E.brb, between(4, 8), ctx, 10000);
            case "back": return burst(E.back, between(5, 10), ctx, 5000, { emoteScale: 1.3 });
            case "smallCheer": { const ch = pickChatter(ctx); const bits = pick([1, 5, 10, 25, 50, 100, 100, 200]); noteSpoke(ch); return [{ chatter: ch, text: fill(pick(E.smallCheer), ctx, ch.name).replace("{bits}", bits), delay: 100, bits }]; }
            default: return [];
        }
    }
    function setMoodBoost(mood, ms) { if (state.moodMode !== "auto") return; state.mood = mood; state.moodUntil = Date.now() + ms; }
    function repliesToStreamer(text, ctx = {}) {
        const R = C.streamerReplies, t = text.toLowerCase();
        let lines;
        if (/\b(hi|hello|hey|yo|sup|morning|evening|welcome|hola)\b/.test(t)) lines = R.greeting;
        else if (/\b(thanks|thank you|ty|appreciate|tysm)\b/.test(t)) lines = R.thanks;
        else if (/\b(lol|lmao|haha|kekw|lul)\b/.test(t)) lines = R.laugh;
        else if (/\?/.test(t)) lines = R.question;
        else lines = R.generic;
        const emoteInMsg = text.split(/\s+/).find(w => C.emotes[w]);
        if (emoteInMsg) startWave(emoteInMsg, between(4, 9));
        const mentioned = (text.match(/@(\w+)/g) || []).map(m => m.slice(1)).filter(n => byName.has(n));
        const out = burst(lines, between(2, 6), ctx, 5000, { prefixMention: true, emoteScale: 1.1 });
        mentioned.forEach(n => { const ch = byName.get(n); out.unshift({ chatter: ch, text: stylize(fill(pick(["@{streamer} " + pick(["yes?", "hi!!", "omg he noticed me", "HE SAID MY NAME", "me?", "hello!", "ty!!", "o7", "yes sir", "pog", "im famous now", "clip it i got noticed"])]), ctx, ch.name), ch), delay: between(400, 1500) }); });
        return out.sort((a, b) => a.delay - b.delay);
    }

    // ------------------------------------------------------------------ public API
    window.Generator = {
        EMOTES: C.emotes, EMOTE_SETS: C.emoteSets, COLORS: C.colors,
        init, stats, username, color, tick, setMood, startWave, onRaid, pickChatter, makeChatter, addChatter,
        setEmoteOnly: v => { state.emoteOnly = !!v; }, emoteOnly: () => !!state.emoteOnly,
        mood: () => state.mood, topic: () => state.topic, chatters: () => pool, recent: () => recent.slice(),
        next, message, raidMessage, cheerMessage, react, repliesToStreamer, fill,
        markov: () => markov
    };
})();
