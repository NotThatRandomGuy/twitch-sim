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
| **Chat generation** | Each tick picks a username (from the big list or built-in bases, with Twitch-style `_`/digit suffixes), a message and a user colour, then schedules the next tick. 85% of ticks are fast (10–300 ms) and the rest are 1–3 s pauses, producing bursty, chat-like pacing. The *Chat speed* slider scales this from 0.25× to 4×. |
| **Badges & emotes** | Messages are rendered with Twitch-style badges (broadcaster, mod, VIP, sub, Prime) and emote keywords (`KEKW`, `PogChamp`, `Sadge`, …) rendered as emote glyphs with a tooltip. `@mentions`, `cheer100`-style bits and links are highlighted. |
| **Raids** | Press **R** (or the *Raid* button, or `/raid`) to get an incoming raid request. Accepting adds 1,800–2,300 viewers, posts a raid alert and makes ~40% of subsequent messages raider greetings. One raid per stream, exactly like the original. |
| **Cheers** | Every 30–90 s while live, a viewer cheers 100–1,000 bits. The cheer fades in over the video for 10 s and is also shown as a highlighted chat line. |
| **Your messages** | Type in the chat box to speak as the broadcaster. Slash commands: `/me`, `/pin <text>`, `/unpin`, `/clear`, `/title <text>`, `/game <text>`, `/raid`, `/help`. Click any username to @-mention them. Clicking the emote button opens an emote picker. |
| **Video source** | Upload a local video file, use your webcam (stays in-browser) or paste a YouTube URL / ID. Player overlay has play/pause, mute/volume, clip, settings, theater and fullscreen controls. |
| **Channel info** | Click the streamer name, stream title or category to edit them inline (Enter saves, Esc cancels). Follow and Subscribe buttons toggle state; Share copies the page URL. |
| **Chat UX** | Auto-scroll pauses when you scroll up ("Chat paused due to scroll"), timestamps can be toggled, chat and the left sidebar can be collapsed, the list is capped at 250 lines. |

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
js/corpus.js      chat corpus, emote table
js/generator.js   username / message generator (window.Generator)
js/app.js         UI wiring and simulation loop (window.Jitter for debugging)
data/             word & username lists loaded at runtime when served over HTTP
```

To re-theme, change the `--brand*` variables at the top of `css/styles.css`.

## Roadmap

- **Stage 1 (this commit):** Jitter branding, Twitch-like UI, restructured project, all original features preserved.
- **Stage 2:** realistic message generation (large categorised corpus, Markov chains with backoff, templates, chatter personas, moods and event-aware replies).
- **Stage 3:** extra stream events (gift subs, follows, hype train, random moments) and polish.
