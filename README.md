# Jitter — Live Stream Simulator

Jitter is a single-page, fully client-side simulation of a Twitch-style live stream.
It renders a streaming site (navigation, channel list, player, channel info and a live
chat column) and drives a simulated chat room with generated viewers, raids, bit cheers,
subscriptions and other events. Nothing is sent anywhere: everything runs in your browser.

It is meant for things like testing overlays, practising moderation/streaming UIs, demos,
or just having a fake stream running on a second monitor.

## Running it

Jitter is plain HTML/CSS/JS with no build step.

**Option A — just open the file**

Double-click `index.html`. Everything works, but the big word lists in `data/` can't be
fetched over `file://`, so usernames fall back to a small built-in set.

**Option B — local server (recommended)**

Any static file server works. From the project folder:

```bash
# Python 3
python -m http.server 8000
# or Node
npx serve .
```

Then open <http://localhost:8000>. The simulator will load ~624k usernames and a 10k
English word list from `data/` and tell you so in chat.

URL flags:

- `?autostart` — go live immediately when the page loads.
- `?demo` — additionally run a scripted showcase (sub → cheer → gift bomb → hype moment → raid →
  timeout → resub → fail → BRB) over the first minute. `http://localhost:8000/?autostart&demo`

## How it works

| Area | What happens |
| --- | --- |
| **Go live / End stream** | The *Simulation* panel under the chat starts the chat loop, uptime clock, viewer-count drift and the cheer scheduler. Ending the stream posts `STREAM ENDED` and stops everything. |
| **Chat generation** | See [Message generation](#message-generation) below. Each tick asks the generator for a chatter + message, renders it, then schedules the next tick. 85% of ticks are fast (10–300 ms) and the rest are 1–3 s pauses, producing bursty, chat-like pacing. Pace also scales with viewer count, and the *Chat speed* slider scales it from 0.25× to 4×. |
| **Badges & emotes** | Messages are rendered with Twitch-style badges (broadcaster, mod, VIP, sub, founder, Prime, Turbo) and emote keywords (`KEKW`, `PogChamp`, `Sadge`, channel emotes like `jitterHype`, …) rendered as emote glyphs with a tooltip. `@mentions`, `cheer100`-style bits and links are highlighted; dark name colours are brightened for legibility like Twitch does. |
| **Raids** | Press **R** (or the *Raid* button, or `/raid`) to get an incoming raid request. Accepting adds 1,800–2,300 viewers, posts a raid alert, floods chat with raiders (new personas spamming the raiding channel's emotes and greetings) and regulars welcoming them. ~40% of messages are raid-flavoured for the first two minutes and that share fades out over the next few. One raid per stream, exactly like the original. |
| **Cheers** | Every 30–90 s while live, a viewer cheers 100–1,000 bits. The cheer fades in over the video for 10 s and is also shown as a highlighted chat line. |
| **Your messages** | Type in the chat box to speak as the broadcaster — **chat answers you**: greetings get greeted back, questions get yes/no/idk-style votes, thanks get `np <3`, emotes you use get echoed, and anyone you `@mention` reacts. Click any username to @-mention them. Clicking the emote button opens an emote picker. Changing the title/category, subscribing, pinning or clipping also triggers reactions. See [Slash commands](#slash-commands). |
| **Mood** | The *Mood* selector forces chat into Chill / Hype / Salty / Wholesome, or leaves it on *Auto*, where the mood drifts every 25–70 s and short-lived "topics" (tech issues, food, greetings, questions, backseating…) take over for 15–45 s — so several people ask "song name?" at once, like a real chat. |
| **Random events** | With *Random events* on, something happens every 7–32 s, weighted: follows (follower counter ticks up, sometimes an alert), small cheers in chat (`cheer50 …`), new subs and resubs (Prime / Tier 1–3, with months and a sub message), gift bombs (1–100 subs with recipient list), **big moments** (chat explodes in caps and emote waves, viewers spike), **fails** (`F`, `Sadge` waves, viewers dip), moderator timeouts/bans (offender's messages become `<message deleted>`, a mod posts a warning, chat says `rip bozo`), BRB breaks and slow mode. |
| **Hype Train** | Three contributions (subs, gifts, bits) within two minutes start a Hype Train. A bar above chat shows level (1–5), progress and a 5-minute timer that resets on each level-up; chat cheers it on and sub/cheer events become twice as likely while it runs. Ends with a summary alert naming the top contributor. |
| **Viewers** | On top of the original ±1–5 jitter, a slow trend pulls the count toward a target that includes the raid (65% of raiders leave over ~10 min, 35% stay), moment spikes, fail dips, BRB dips and a small Hype Train bonus. Chat pace follows the viewer count. |
| **Video source** | Upload a local video file, use your webcam (stays in-browser) or paste a YouTube URL / ID. Player overlay has play/pause, mute/volume, clip, settings, theater and fullscreen controls. |
| **Channel info** | Click the streamer name, stream title or category to edit them inline (Enter saves, Esc cancels). Follow and Subscribe buttons toggle state; Share copies the page URL. Follower and subscriber counts update live. |
| **Chat UX** | Auto-scroll pauses when you scroll up ("Chat paused due to scroll"), timestamps can be toggled, chat and the left sidebar can be collapsed, the list is capped at 250 lines. Simulation buttons: *Raid*, *Hype moment*, *Gift subs*, *Clear chat*. |

### Slash commands

Type these in the chat box as the broadcaster:

| Command | Effect |
| --- | --- |
| `/me <text>` | Action message |
| `/pin <text>` · `/unpin` | Pin a message above chat (chat reacts) |
| `/clear` | Clear chat |
| `/title <text>` · `/game <text>` | Change title / category (chat reacts) |
| `/raid` | Trigger the incoming-raid prompt |
| `/timeout <user> [seconds]` · `/ban <user>` | Moderate a chatter (their messages are deleted, chat reacts) |
| `/slow` · `/slowoff` | Toggle slow mode (chat pace drops, chat complains) |
| `/emoteonly` · `/emoteonlyoff` | Toggle emote-only mode (chat can only post emotes) |
| `/brb` · `/back` | Take a break / come back (chat reacts, viewers dip and recover) |
| `/sub` · `/gift [n]` · `/hype` · `/fail` | Fire an event manually |
| `/stats` | Print today's subs / gifts / bits / timeouts and generator state |
| `/help` | List commands |

Sending `cheer<n>` in your own message spends bits from your balance (top up with *Get Bits*).

### Message generation

Everything lives in `js/corpus.js` (data) and `js/generator.js` (logic). A message is produced in four steps:

1. **Pick a chatter.** Chat is spoken by a pool of recurring personas (regulars, 4 mods, 2 VIPs, a
   `Nightbot`), each with a colour, badges, favourite emotes, emote rate, caps/typo tendencies and a
   "chattiness" weight. ~22% of ticks introduce a brand-new name (sometimes flagged as a *First message*),
   and the pool grows with the viewer count. Raids inject a wave of raider personas.
2. **Pick a source**, weighted by the current mood/topic and the persona (backseaters backseat,
   salty people complain):
   * **Markov chain** — an order-2 (trigram) chain with bigram back-off trained on ~1,100 corpus lines.
     Back-off is what creates novel recombinations; outputs that are too long, stutter, or exactly
     duplicate a training line are usually rejected.
   * **Categorised corpus** — ~1,500 hand-written lines across general, conversational, questions,
     backseating, salty, wholesome, greetings, tech issues, food, game talk, copypasta and short bursts.
   * **Templates** with slots: `{streamer}`, `{game}` (shortened the way people really type it — "cod",
     "ghosts"), `{game2}`, `{other}` (a recently active chatter, for `@replies`), `{country}`,
     `{food}`, `{n}`…
   * **Emote-only spam**, `!commands`, peer replies, and ironic quotes built from the
     `11-miscellaneous-phrases.txt` list (`"A commendable restraint" - ThatGamerDude 2024`).
   * **Waves** — after a big moment, a raid, or when the broadcaster uses an emote, many chatters spam
     the same token for a while (herd behaviour).
3. **Fill slots and reject near-duplicates** of the last 40 messages.
4. **Stylise** per persona and mood: lowercase by default, occasional ALL CAPS (more when hyped),
   elongation (`noooo`, `LETS GOOOO`), adjacent-letter typos, trailing `!!`/`???`, `lol`/`fr` suffixes,
   and sentiment-matched emotes (laugh / hype / sad / scared / confused / agree / love…).

Usernames mix the 624k-name list (filtered to Twitch's `[A-Za-z0-9_]{3,20}` rules and scrubbed with a
blocklist), adjective+noun compounds (`SleepyGoblin_2004`, `crispy_noodle`), curated handles and suffix
styles (`TTV`, `xX_…_Xx`, years, `_42`).

### Keyboard shortcuts

| Key | Action |
| --- | --- |
| `R` | Trigger an incoming raid |
| `S` / `G` / `H` | New sub / gift bomb / hype moment |
| `Alt+T` | Theater mode (Esc exits) |
| `F` | Fullscreen player |
| `M` | Mute / unmute |
| `Space` | Play / pause the video |
| `Alt+X` | Create a (simulated) clip |

## Project layout

```
index.html        page structure
css/styles.css    Jitter theme (CSS variables at the top) and Twitch-style layout
js/corpus.js      chat corpus: categorised lines, templates, emotes, event reactions, name parts
js/generator.js   Markov chain, personas, moods/topics, stylising, reactions (window.Generator)
js/app.js         UI wiring and simulation loop (window.Jitter for debugging)
js/events.js      random events, hype train, viewer dynamics, moderation commands (window.Jitter.events)
data/             word, username and phrase lists loaded at runtime when served over HTTP
```

Everything is vanilla JS with no dependencies; the modules talk through `window.JitterCorpus`,
`window.Generator` and `window.Jitter`, so you can drive it from the console (e.g.
`Jitter.events.doGift(50)`, `Generator.setMood("salty")`).

To re-theme, change the `--brand*` variables at the top of `css/styles.css`. To change what chat says,
edit the arrays in `js/corpus.js`; to change *how* it says it, tune `WEIGHTS` and `stylize()` in
`js/generator.js`. You can poke the generator from the dev console, e.g. `Generator.next({streamer:"x", game:"y"})`
or `Generator.markov().generate()`.

## History

- **Stage 1:** Jitter branding, Twitch-like UI, restructured project, all original features preserved.
- **Stage 2:** realistic message generation (large categorised corpus, Markov chains with backoff, templates, chatter personas, moods/topics, event-aware reactions and replies to the broadcaster).
- **Stage 3:** stream events (subs, resubs, gift bombs, follows, cheers, moments, fails, timeouts, BRB, slow/emote-only mode), Hype Train, live follower/sub counters, viewer dynamics, moderation slash commands, `?demo` mode.
