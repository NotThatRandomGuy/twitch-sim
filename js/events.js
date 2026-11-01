// Jitter — stream events: subs, gift bombs, follows, cheers in chat, hype train, big moments,
// moderation, viewer dynamics and the broadcaster's moderation / channel-mode commands.
(function () {
    "use strict";
    const J = window.Jitter, G = window.Generator, C = window.JitterCorpus;
    const { state, $, fmt } = J;
    const rand = n => Math.floor(Math.random() * n);
    const between = (a, b) => a + rand(b - a + 1);
    const chance = p => Math.random() < p;
    const pick = a => a[rand(a.length)];
    const weighted = t => { let s = 0; for (const k in t) s += t[k]; let r = Math.random() * s; for (const k in t) { r -= t[k]; if (r <= 0) return k; } };

    // ---------------------------------------------------------------- counters
    const counters = { followers: 48213, subs: 1104, bitsToday: 0, giftsToday: 0, newSubsToday: 0, timeouts: 0 };
    const short = n => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
    function renderCounters() {
        $("follower-count").textContent = short(counters.followers); $("about-followers").textContent = short(counters.followers);
        $("about-subs").textContent = short(counters.subs);
    }
    renderCounters();

    // ---------------------------------------------------------------- hype train
    const train = { active: false, level: 0, points: 0, goal: 0, endsAt: 0, timer: null, contributions: [], top: new Map() };
    const LEVEL_GOALS = [1600, 2400, 3400, 4800, 6400];
    const el = { box: $("hype-train"), title: $("ht-title"), timer: $("ht-timer"), fill: $("ht-fill"), sub: $("ht-sub") };
    function contribute(name, points, kind) {
        const now = Date.now();
        train.contributions.push({ name, points, kind, at: now });
        train.contributions = train.contributions.filter(c => now - c.at < 300000);
        if (!train.active) {
            const recent = train.contributions.filter(c => now - c.at < 120000);
            if (recent.length >= 3) startTrain(recent); // 3 contributions in 2 minutes kicks it off
            return;
        }
        train.points += points; train.top.set(name, (train.top.get(name) || 0) + points);
        if (train.points >= train.goal) levelUp();
        renderTrain();
    }
    function startTrain(seed) {
        train.active = true; train.level = 1; train.goal = LEVEL_GOALS[0]; train.points = 0; train.top = new Map();
        seed.forEach(c => { train.points += c.points; train.top.set(c.name, (train.top.get(c.name) || 0) + c.points); });
        train.endsAt = Date.now() + 300000;
        el.box.classList.add("visible");
        J.appendAlert("", "A Hype Train has started!", "Cheer or subscribe in the next 5 minutes to level it up", "i-bits");
        J.react("hypeTrain"); J.notify();
        clearInterval(train.timer); train.timer = setInterval(tickTrain, 1000);
        if (train.points >= train.goal) levelUp();
        renderTrain();
    }
    function levelUp() {
        while (train.points >= train.goal && train.level < 5) { train.points -= train.goal; train.level++; train.goal = LEVEL_GOALS[train.level - 1]; }
        if (train.level >= 5 && train.points >= train.goal) { train.points = train.goal; }
        train.endsAt = Date.now() + 300000;
        J.appendSystemMessage(`Hype Train reached Level ${train.level}!`);
        J.react("hypeTrain", { n: train.level }); J.toast(`Hype Train Level ${train.level}!`);
        if (train.level >= 5 && train.points >= train.goal) endTrain(true);
    }
    function tickTrain() {
        const left = Math.max(0, train.endsAt - Date.now());
        el.timer.textContent = `${Math.floor(left / 60000)}:${String(Math.floor((left % 60000) / 1000)).padStart(2, "0")}`;
        if (left <= 0) endTrain(false);
    }
    function endTrain(completed) {
        clearInterval(train.timer); train.active = false;
        el.box.classList.remove("visible");
        const top = [...train.top.entries()].sort((a, b) => b[1] - a[1])[0];
        J.appendAlert("", completed ? "Hype Train completed at Level 5!" : `Hype Train ended at Level ${train.level}`, top ? `Top contributor: ${top[0]} (${fmt(top[1])} points)` : "", "i-bits");
        J.scheduleLines(G.react(completed ? "moment" : "clip", J.ctx()).slice(0, 8));
        train.contributions = [];
    }
    function renderTrain() {
        el.title.textContent = `Hype Train — Level ${train.level}`;
        el.fill.style.width = `${Math.min(100, (train.points / train.goal) * 100)}%`;
        el.sub.textContent = `${fmt(train.points)} / ${fmt(train.goal)} · ${train.contributions.length} contributors`;
    }

    // ---------------------------------------------------------------- individual events
    const giftTiers = { 1: 30, 5: 35, 10: 20, 20: 10, 50: 4, 100: 1 };
    function doSub(opts = {}) {
        const ch = G.pickChatter(J.ctx());
        const prime = chance(0.3), tier = prime ? "Prime" : chance(0.85) ? "Tier 1" : chance(0.8) ? "Tier 2" : "Tier 3";
        const resub = !opts.forceNew && ch.badges.includes("sub") && chance(0.7);
        const months = resub ? between(2, 48) : 1;
        if (!ch.badges.some(b => ["sub", "founder", "mod"].includes(b))) ch.badges.push("sub");
        counters.subs++; counters.newSubsToday++;
        const note = chance(0.6) ? G.fill(pick(resub ? ["{n} months lets go", "still here", "best {n} months", "another month of this nonsense", "{n} months and counting", "love this community", "take my money", "worth every penny", "cant stop wont stop", "for the emotes obviously", "happy to be here"] : ["finally subbed", "had to do it", "first sub ever", "for the emotes", "love the stream", "keep it up!", "take my money", "hi im new", "you earned it", "prime sub lets go", "been lurking for months, had to"]).replace("{n}", months), J.ctx(), ch.name) : "";
        J.appendAlert("", resub ? `${ch.name} resubscribed with ${tier} — ${months} months!` : `${ch.name} subscribed with ${tier}!`, note ? `"${note}"` : (resub ? "They've been subscribed for " + months + " months" : "Welcome to the community!"), "i-star");
        if (note) J.appendChatMessage(ch.name, note, ch.color, { badges: ch.badges, highlight: true });
        J.react(resub ? "resub" : "sub", { n: months, other: ch.name });
        contribute(ch.name, tier === "Tier 3" ? 2500 : tier === "Tier 2" ? 1000 : 500, "sub");
        renderCounters(); J.notify();
    }
    function doGift(count) {
        count = count || +weighted(giftTiers);
        const gifter = G.pickChatter(J.ctx());
        const recipients = [];
        for (let i = 0; i < count; i++) { const r = G.pickChatter(J.ctx()); if (!r.badges.includes("sub")) r.badges.push("sub"); recipients.push(r.name); }
        counters.subs += count; counters.giftsToday += count;
        J.appendAlert("gift", `${gifter.name} is gifting ${count} Tier 1 sub${count > 1 ? "s" : ""} to the community!`, `They've gifted ${counters.giftsToday} in total · ${count <= 5 ? "to " + recipients.join(", ") : recipients.slice(0, 3).join(", ") + ` and ${count - 3} others`}`, "i-gift");
        if (count >= 10) { J.toast(`${gifter.name} just gifted ${count} subs!`); G.startWave("jitterLove", between(8, 16)); }
        J.react("gift", { other: gifter.name });
        contribute(gifter.name, 500 * count, "gift");
        renderCounters(); J.notify();
    }
    function doFollow() {
        const n = between(1, 3);
        counters.followers += n;
        if (chance(0.35)) { const ch = G.pickChatter(J.ctx()); J.appendAlert("follow", `${ch.name} just followed!`, "", "i-heart-fill"); J.react("follow", { other: ch.name }); }
        renderCounters();
    }
    function doSmallCheer() {
        const [line] = G.react("smallCheer", J.ctx());
        if (!line) return;
        J.appendChatMessage(line.chatter.name, line.text, line.chatter.color, { badges: line.chatter.badges, highlight: line.bits >= 100 });
        counters.bitsToday += line.bits;
        contribute(line.chatter.name, line.bits, "bits");
    }
    function doMoment() {
        J.react("moment");
        bumpTarget(between(40, 160), 180000);
        if (chance(0.5)) setTimeout(() => state.streaming && J.appendSystemMessage(`${J.streamerName()}'s clip "${G.fill(pick(["NO WAY", "the clutch", "he actually did it", "insane {game} play", "???", "chat went wild"]), J.ctx())}" is trending`), 8000);
    }
    function doFail() { J.react("fail"); bumpTarget(-between(10, 60), 120000); }
    function doTimeout(name, seconds, reason) {
        const pool = G.chatters().filter(c => !c.badges.includes("mod") && !c.bot && c.count > 0);
        const target = name ? { name } : pick(pool.length ? pool : G.chatters());
        const mod = pick(G.chatters().filter(c => c.badges.includes("mod") && !c.bot));
        counters.timeouts++;
        J.appendSystemMessage(seconds ? `${target.name} has been timed out for ${seconds} seconds${reason ? ` (${reason})` : ""}.` : `${target.name} has been permanently banned${reason ? ` (${reason})` : ""}.`);
        document.querySelectorAll(".chat-line").forEach(l => { const u = l.querySelector(".chat-username"); if (u && u.textContent === target.name) { const t = l.querySelector(".chat-text"); if (t) { t.textContent = "<message deleted>"; t.style.color = "var(--text-faint)"; } } });
        if (mod && chance(0.5)) setTimeout(() => state.streaming && J.appendChatMessage(mod.name, pick(["no spoilers please", "keep it civil", "read the rules", "we don't do that here", "be nice or be gone", "last warning for everyone", "thank you", "and stay out", "chill out chat", "ok that's enough"]), mod.color, { badges: mod.badges }), between(800, 2500));
        J.react("timeout");
    }
    function doSlowMode(on) {
        state.slowMode = on;
        J.appendSystemMessage(on ? "This room is now in slow mode. You may send messages every 30 seconds." : "This room is no longer in slow mode.");
        if (on) J.react("slowMode");
    }
    function doEmoteOnly(on) {
        G.setEmoteOnly(on);
        J.appendSystemMessage(on ? "This room is now in emote-only mode." : "This room is no longer in emote-only mode.");
        $("user-chat-input").placeholder = on ? "Emote-only mode" : "Send a message";
    }
    let brb = false;
    function doBrb(on) {
        brb = on;
        J.appendSystemMessage(on ? `${J.streamerName()} will be right back.` : `${J.streamerName()} is back!`);
        J.react(on ? "brb" : "back");
        if (!on) bumpTarget(between(10, 40), 60000);
    }

    // ---------------------------------------------------------------- viewer dynamics (slow trend on top of app.js's ±5 jitter)
    const dyn = { baseline: state.viewers, bumps: [] };
    function bumpTarget(amount, ms) { dyn.bumps.push({ amount, until: Date.now() + ms, total: ms }); }
    setInterval(() => {
        if (!state.streaming) return;
        const now = Date.now();
        dyn.bumps = dyn.bumps.filter(b => b.until > now);
        // raids: keep ~35% of the raid long-term, let the rest leave over ~10 minutes
        let target = dyn.baseline + dyn.bumps.reduce((s, b) => s + b.amount * ((b.until - now) / b.total), 0);
        if (state.raidAccepted && state.raider) { const age = now - state.raidAt; target += state.raider.size * (0.35 + 0.65 * Math.max(0, 1 - age / 600000)); }
        if (brb) target -= dyn.baseline * 0.12;
        if (train.active) target += 60;
        dyn.baseline += (Math.random() - 0.5) * 6 + (dyn.baseline < 600 ? 1 : 0); // gentle random walk, grows a little over a stream
        J.setViewers(state.viewers + (target - state.viewers) * 0.08);
    }, 4000);

    // ---------------------------------------------------------------- scheduler
    let nextEventAt = 0;
    const EVENT_WEIGHTS = { follow: 30, smallCheer: 14, sub: 14, gift: 6, moment: 9, fail: 8, timeout: 5, brbToggle: 2, slowToggle: 1 };
    function scheduleNext() { nextEventAt = Date.now() + between(7000, 32000); }
    setInterval(() => {
        if (!state.streaming || !$("events-toggle").checked || Date.now() < nextEventAt) return;
        scheduleNext();
        const boost = train.active ? 2 : 1;
        const w = Object.assign({}, EVENT_WEIGHTS, { sub: EVENT_WEIGHTS.sub * boost, gift: EVENT_WEIGHTS.gift * boost, smallCheer: EVENT_WEIGHTS.smallCheer * boost });
        if (brb) { w.moment = 0; w.fail = 0; }
        switch (weighted(w)) {
            case "follow": doFollow(); break;
            case "smallCheer": doSmallCheer(); break;
            case "sub": doSub(); break;
            case "gift": doGift(); break;
            case "moment": doMoment(); break;
            case "fail": doFail(); break;
            case "timeout": doTimeout(null, pick([60, 300, 600, 600, 0]), pick(["spoilers", "spam", "be nice", "", "", "self-promo"])); break;
            case "brbToggle": if (!brb) { doBrb(true); setTimeout(() => brb && state.streaming && doBrb(false), between(45000, 120000)); } break;
            case "slowToggle": doSlowMode(!state.slowMode); if (!state.slowMode) break; setTimeout(() => state.slowMode && state.streaming && doSlowMode(false), between(60000, 180000)); break;
        }
    }, 1000);
    document.addEventListener("jitter:start", () => { scheduleNext(); dyn.baseline = state.viewers; });
    document.addEventListener("jitter:stop", () => { if (train.active) { clearInterval(train.timer); train.active = false; el.box.classList.remove("visible"); } if (brb) brb = false; });

    // ---------------------------------------------------------------- buttons & commands
    $("hype-trigger-btn").addEventListener("click", () => { if (!state.streaming) return J.toast("Go live first."); doMoment(); });
    $("sub-trigger-btn").addEventListener("click", () => { if (!state.streaming) return J.toast("Go live first."); doGift(pick([5, 10, 20, 50])); });
    Object.assign(J.commands, {
        timeout: arg => { const [name, secs] = arg.split(" "); doTimeout(name, +secs || 600); },
        ban: arg => doTimeout(arg.split(" ")[0] || null, 0),
        slow: arg => doSlowMode(arg !== "off"),
        slowoff: () => doSlowMode(false),
        emoteonly: arg => doEmoteOnly(arg !== "off"),
        emoteonlyoff: () => doEmoteOnly(false),
        brb: () => doBrb(true),
        back: () => doBrb(false),
        sub: () => doSub({ forceNew: true }),
        gift: arg => doGift(+arg || 5),
        hype: () => doMoment(),
        fail: () => doFail(),
        stats: () => J.appendSystemMessage(`Today: ${counters.newSubsToday} new subs, ${counters.giftsToday} gifted, ${fmt(counters.bitsToday)} bits, ${counters.timeouts} timeouts · ${G.chatters().length} chatters in pool · mood ${G.mood()}`)
    });

    // Press S for a surprise sub, G for a gift bomb (ignored while typing)
    document.addEventListener("keydown", e => {
        const tag = e.target.tagName.toLowerCase();
        if (tag === "input" || tag === "textarea" || tag === "select" || !state.streaming || e.altKey || e.ctrlKey || e.metaKey) return;
        if (e.key.toLowerCase() === "s") doSub({ forceNew: true });
        if (e.key.toLowerCase() === "g") doGift();
        if (e.key.toLowerCase() === "h") doMoment();
    });

    // ?demo — scripted showcase of the event system (pairs well with ?autostart)
    if (new URLSearchParams(location.search).has("demo")) {
        document.addEventListener("jitter:start", () => {
            const steps = [[3000, () => doSub({ forceNew: true })], [6000, () => doSmallCheer()], [9000, () => doGift(10)], [13000, () => doMoment()],
                [17000, () => { $("raid-trigger-btn").click(); setTimeout(() => $("accept-raid-btn").click(), 1500); }], [24000, () => doTimeout(null, 600, "spoilers")],
                [28000, () => doSub()], [32000, () => doFail()], [38000, () => doBrb(true)], [50000, () => doBrb(false)]];
            steps.forEach(([t, fn]) => setTimeout(() => state.streaming && fn(), t));
        }, { once: true });
    }

    J.events = { counters, train, doSub, doGift, doFollow, doMoment, doFail, doTimeout, doSlowMode, doEmoteOnly, doBrb };
})();
