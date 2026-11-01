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

Add `?autostart` to the URL (e.g. `http://localhost:8000/?autostart`) to go live
immediately when the page loads.

## How it works

| Area | What happens |
| --- | --- |
| **Go live / End stream** | The *Simulation* panel under the chat starts the chat loop, uptime clock, viewer-count drift and the cheer scheduler. Ending the stream posts `STREAM ENDED` and stops everything. |
| **Chat generation** | See [Message generation](#message-generation) below. Each tick asks the generator for a chatter + message, renders it, then schedules the next tick. 85% of ticks are fast (10–300 ms) and the rest are 1–3 s pauses, producing bursty, chat-like pacing. Pace also scales with viewer count, and the *Chat speed* slider scales it from 0.25× to 4×. |
| **Badges & emotes** | Messages are rendered with Twitch-style badges (broadcaster, mod, VIP, sub, founder, Prime, Turbo) and emote keywords (`KEKW`, `PogChamp`, `Sadge`, channel emotes like `jitterHype`, …) rendered as emote glyphs with a tooltip. `@mentions`, `cheer100`-style bits and links are highlighted; dark name colours are brightened for legibility like Twitch does. |
| **Raids** | Press **R** (or the *Raid* button, or `/raid`) to get an incoming raid request. Accepting adds 1,800–2,300 viewers, posts a raid alert, floods chat with raiders (new personas spamming the raiding channel's emotes and greetings) and regulars welcoming them. ~40% of messages are raid-flavoured for the first two minutes and that share fades out over the next few. One raid per stream, exactly like the original. |
| **Cheers** | Every 30–90 s while live, a viewer cheers 100–1,000 bits. The cheer fades in over the video for 10 s and is also shown as a highlighted chat line. |
| **Your messages** | Type in the chat box to speak as the broadcaster — **chat answers you**: greetings get greeted back, questions get yes/no/idk-style votes, thanks get `np <3`, emotes you use get echoed, and anyone you `@mention` reacts. Slash commands: `/me`, `/pin <text>`, `/unpin`, `/clear`, `/title <text>`, `/game <text>`, `/raid`, `/help`. Click any username to @-mention them. Clicking the emote button opens an emote picker. Changing the title/category, subscribing, pinning or clipping also triggers reactions. |
| **Mood** | The *Mood* selector forces chat into Chill / Hype / Salty / Wholesome, or leaves it on *Auto*, where the mood drifts every 25–70 s and short-lived "topics" (tech issues, food, greetings, questions, backseating…) take over for 15–45 s — so several people ask "song name?" at once, like a real chat. |
| **Video source** | Upload a local video file, use your webcam (stays in-browser) or paste a YouTube URL / ID. Player overlay has play/pause, mute/volume, clip, settings, theater and fullscreen controls. |
| **Channel info** | Click the streamer name, stream title or category to edit them inline (Enter saves, Esc cancels). Follow and Subscribe buttons toggle state; Share copies the page URL. |
| **Chat UX** | Auto-scroll pauses when you scroll up ("Chat paused due to scroll"), timestamps can be toggled, chat and the left sidebar can be collapsed, the list is capped at 250 lines. |

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
data/             word, username and phrase lists loaded at runtime when served over HTTP
```

To re-theme, change the `--brand*` variables at the top of `css/styles.css`. To change what chat says,
edit the arrays in `js/corpus.js`; to change *how* it says it, tune `WEIGHTS` and `stylize()` in
`js/generator.js`. You can poke the generator from the dev console, e.g. `Generator.next({streamer:"x", game:"y"})`
or `Generator.markov().generate()`.

## Roadmap

- **Stage 1:** Jitter branding, Twitch-like UI, restructured project, all original features preserved.
- **Stage 2 (this commit):** realistic message generation (large categorised corpus, Markov chains with backoff, templates, chatter personas, moods/topics, event-aware reactions and replies to the broadcaster).
- **Stage 3:** extra stream events (gift subs, follows, hype train, random moments) and polish.
