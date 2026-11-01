// Jitter — chat corpus
// Everything the generator draws from lives here so it can be tuned without touching logic.
// Placeholders: {streamer} {game} {game2} {other} {n} {country} {food} {song} {hours} {raider}
window.JitterCorpus = (() => {
    const emotes = {
        // global-ish
        "KEKW": "😂", "LUL": "😆", "LULW": "😆", "OMEGALUL": "🤣", "Pog": "😮", "PogChamp": "😮", "PogU": "😮", "POGGERS": "😲", "monkaS": "😰", "monkaW": "😱",
        "Sadge": "😢", "PepeHands": "😭", "Kappa": "😏", "EZ": "😎", "5Head": "🧠", "Pepega": "🤪", "catJAM": "🐱", "ratJAM": "🐀", "peepoClap": "👏",
        "FeelsGoodMan": "😊", "FeelsBadMan": "😞", "FeelsStrongMan": "😤", "GIGACHAD": "🗿", "Prayge": "🙏", "HUH": "🤨", "Clueless": "🙂", "Bedge": "😴",
        "modCheck": "👀", "NODDERS": "🙆", "NOPERS": "🙅", "D:": "😨", "YEP": "👍", "NOP": "👎", "Jebaited": "🎣", "BibleThump": "😢", "DansGame": "🤢",
        "NotLikeThis": "🤦", "ResidentSleeper": "😴", "SeemsGood": "👍", "4Head": "😁", "HeyGuys": "👋", "VoHiYo": "🙌", "PauseChamp": "😶", "Copium": "🫠",
        "Okayge": "🙂", "Susge": "🧐", "widepeepoHappy": "😄", "peepoSad": "🥺", "PETTHEMODS": "🤚", "WICKED": "😈", "Hmm": "🤔", "Aware": "😐",
        "Deadge": "💀", "Madge": "😡", "Wokege": "😳", "Pepelaugh": "😏", "PepeLaugh": "😏", "pepeMeltdown": "🫨", "COPIUM": "🫠", "Weirdge": "😬",
        "EZ Clap": "👏", "Clap": "👏", "PepoG": "🤓", "peepoLeave": "🚪", "peepoArrive": "🏃", "ICANT": "😩", "LETSGO": "🔥", "HYPERS": "🤩", "Stare": "😐",
        "o7": "🫡", "<3": "❤️", "xdd": "😆", "xD": "😆",
        // channel emotes
        "jitterHype": "🔥", "jitterLove": "💚", "jitterGG": "🏆", "jitterRIP": "💀", "jitterW": "🇼", "jitterL": "🇱", "jitterLurk": "👁️", "jitterPog": "😲",
        "jitterLaugh": "😹", "jitterSip": "🍵", "jitterHi": "👋", "jitterSad": "😿", "jitterClap": "👏", "jitterRage": "🤬", "jitterThink": "🤔"
    };

    // Emotes grouped by feeling so the right ones get picked for the right messages.
    const emoteSets = {
        laugh: ["KEKW", "LUL", "LULW", "OMEGALUL", "ICANT", "jitterLaugh", "xdd", "4Head", "PepeLaugh"],
        hype: ["Pog", "PogChamp", "PogU", "POGGERS", "jitterPog", "jitterHype", "LETSGO", "HYPERS", "GIGACHAD", "EZ", "peepoClap", "jitterClap", "catJAM", "ratJAM", "FeelsStrongMan"],
        sad: ["Sadge", "PepeHands", "peepoSad", "FeelsBadMan", "BibleThump", "jitterSad", "Deadge", "jitterRIP", "NotLikeThis", "Copium", "COPIUM"],
        scared: ["monkaS", "monkaW", "PauseChamp", "D:", "Prayge", "pepeMeltdown"],
        confused: ["HUH", "Hmm", "jitterThink", "Susge", "Clueless", "Aware", "Stare", "Weirdge", "modCheck", "DansGame"],
        agree: ["YEP", "NODDERS", "SeemsGood", "Okayge", "Clap", "widepeepoHappy", "FeelsGoodMan", "jitterW"],
        disagree: ["NOP", "NOPERS", "Madge", "jitterL", "jitterRage", "Kappa", "Jebaited"],
        love: ["<3", "jitterLove", "widepeepoHappy", "FeelsGoodMan", "peepoClap", "HeyGuys", "VoHiYo", "jitterHi"],
        sleepy: ["Bedge", "ResidentSleeper", "jitterSip", "jitterLurk", "peepoLeave"],
        salute: ["o7", "jitterGG", "Prayge", "jitterRIP"]
    };

    // Lines used both verbatim and to train the Markov chain. Written the way people actually type
    // in a mid-sized Twitch chat: lowercase, little punctuation, short.
    const general = [
        "wait what just happened", "okay that was actually clean", "no shot that worked", "bro is cooking", "chat is this real", "this is the content",
        "i cannot believe that just happened", "we are so back", "its so over", "nah thats crazy", "that was so close", "how did he survive that",
        "the way i screamed", "im losing it", "he did it again", "every single time", "called it", "i said this 5 minutes ago", "told you chat",
        "this run is actually insane", "we got this", "lock in", "LOCK IN CHAT", "stay calm stay calm", "ok ok ok we are fine", "we are not fine",
        "its fine everything is fine", "nothing to see here", "pretend that didnt happen", "chat we dont talk about that", "clip that", "CLIP IT",
        "someone clip that please", "that goes on the highlight reel", "yt moment", "this is going in the vod", "i need that as a gif",
        "i just got here what did i miss", "first time here this is fun", "lurking but had to say that was sick", "back from the kitchen what happened",
        "ok im invested now", "ive been watching for 3 hours when did that happen", "i blinked and missed it", "the one time i look at my phone",
        "my stream froze at the worst moment", "refresh and it was already over", "did anyone else lag or just me", "stream died for me for a sec",
        "audio is fine for me", "video is fine here", "no issues on my end", "1080 looks good", "frames are a little choppy", "chat is moving so fast",
        "chat calm down", "chat is wild tonight", "chat is unhinged", "chat is actually cooked", "chat why are we like this", "this chat is a fever dream",
        "the chat delay makes this so much funnier", "reading chat is a mistake", "dont read chat", "chat lies", "never trust chat", "chat was right for once",
        "trust the process", "the plan is coming together", "whats the plan here", "is there a plan", "there was never a plan", "improvising i see",
        "ok that was a smart play actually", "big brain", "galaxy brain move", "200 iq", "negative iq play", "the brain was off for that one",
        "he knows", "he doesnt know", "he has no idea", "oh he knows", "about to find out", "this is gonna be good", "here we go", "here we go again",
        "its happening", "something is about to happen i can feel it", "jinxed it", "you jinxed it", "never say that out loud", "dont say that",
        "famous last words", "well that aged poorly", "that aged like milk", "instant karma", "the universe said no", "the game said no",
        "the game is rigged", "scripted", "that is so scripted lol", "unlucky", "so unlucky", "thats just bad luck", "rng hates you today", "rng diff",
        "skill issue", "massive skill issue", "diff", "gap", "thats a gap", "just better", "outplayed", "got outplayed hard", "he was cracked",
        "that guy was cheating 100%", "sus movement", "report that guy", "the lobby is sweaty", "sweat lobby", "casual lobby my foot",
        "why are they all so good", "everyone in this lobby is a pro", "the enemy team is built different", "your team is throwing",
        "team diff", "the teammates are not helping", "randoms doing random things", "classic randoms", "solo queue experience", "this is why i dont play ranked",
        "gg", "ggs", "gg wp", "ggwp", "gg ez", "gg go next", "go next", "next game", "one more", "one more please", "just one more", "last one?",
        "ok last game and then sleep", "sleep is for the weak", "its 3am for me and i regret nothing", "work in 5 hours worth it",
        "watching this instead of studying", "my exam is tomorrow and im here", "productivity is a myth", "this stream is my personality now",
        "i should be doing laundry", "dishes can wait", "dinner is burning but i cant leave", "my dog wants to go out but i cant miss this",
        "my cat is watching with me", "cat approved stream", "the dog is asleep on my feet so i physically cannot leave", "cozy stream vibes",
        "comfy", "this is so comfy", "the vibes tonight are immaculate", "good vibes only", "vibes are good", "the vibe is unmatched",
        "the music is a vibe", "song name?", "what song is this", "this song slaps", "the playlist tonight is fire", "who made this playlist",
        "lower the game audio a bit", "game audio is loud", "mic is a little quiet", "mic sounds great today", "new mic?", "you sound different today",
        "cam is frozen", "cam froze", "cam is back", "the face cam reaction was priceless", "the face when that happened", "his face lmao",
        "the silence after that was deafening", "the sigh", "that sigh said everything", "the disappointment is real", "the pain",
        "i felt that", "felt that in my soul", "pain", "that hurt to watch", "i cant watch", "watching through my fingers", "why do i watch this",
        "i come here to relax and this is what i get", "my blood pressure", "this is bad for my heart", "stress stream", "we are stressed",
        "breathe chat", "deep breaths", "hydrate", "drink water", "water break", "posture check", "stretch your hands", "take a break after this one",
        "eat something please", "when did you last eat", "snack check", "whats for dinner tonight", "im hungry now thanks", "pizza stream when",
        "the pizza arrived at the perfect time", "good morning chat", "good evening everyone", "hello from the night shift", "hi from work dont tell my boss",
        "hey chat", "hi everyone", "hey hey", "yo", "sup", "hello", "hi", "evening", "morning", "hello chat how we doing", "how is everyone doing tonight",
        "doing good how about you", "better now that stream is on", "tired but here", "long day but this helps", "rough day but chat makes it better",
        "this stream is the best part of my day", "needed this today", "thanks for streaming", "ty for the stream", "love this community",
        "best chat on the platform", "underrated streamer fr", "how is this channel not bigger", "deserves way more viewers", "share this stream with friends",
        "follow if you havent", "sub hype", "subbed", "just subbed lets go", "resubbed for another month", "finally got prime back", "used my prime here",
        "gifted subs pog", "ty for the gift", "thanks for the gifted sub", "who gifted me omg", "i got a gift sub lets go", "gift bombs incoming",
        "new sub emote is cute", "the new emotes are so good", "we need a new emote for that", "emote idea: his face right now", "spam the emote",
        "emote only mode when", "mods are asleep post emotes", "mods are awake nvm", "mods?", "mod abuse", "free him", "justice", "rip bozo",
        "timed out for speaking facts", "banned for being right", "worth it", "no regrets", "i stand by what i said", "i said what i said",
        "ratio", "L", "W", "W streamer", "W chat", "L chat", "L take", "W take", "hot take", "cold take", "based", "cringe", "mid", "peak",
        "peak gaming", "peak content", "top tier", "elite", "goated", "goat", "the goat", "he is him", "hes him", "hes the one", "built different",
        "different breed", "certified", "certified classic", "certified moment", "movie", "this is cinema", "cinema", "absolute cinema",
        "better than the movie", "the lore is getting deep", "lore drop", "new lore unlocked", "character development", "the arc continues",
        "redemption arc", "villain arc", "its his villain arc", "tragic hero", "a hero's journey", "the sequel is going to be wild",
        "same", "same tbh", "real", "true", "facts", "fr", "fr fr", "ong", "no cap", "cap", "thats cap", "deadass", "lowkey yeah", "highkey", "big facts",
        "this", "^", "^^", "^ this", "+1", "+2", "-2", "agreed", "disagree", "nah", "nope", "yep", "yes", "YES", "no", "NO", "maybe", "idk", "idc",
        "ok", "k", "kk", "sure", "alright", "fine", "cool", "nice", "noice", "nice one", "clean", "smooth", "crisp", "sick", "dope", "fire", "lit",
        "insane", "crazy", "wild", "nuts", "mental", "unreal", "ridiculous", "absurd", "illegal", "straight to jail", "criminal", "thats a crime",
        "unbelievable", "no words", "speechless", "im speechless", "what", "wat", "huh", "?", "??", "???", "bruh", "bro", "my guy", "dude", "man",
        "lmao", "lmaooo", "lol", "lool", "haha", "hahaha", "im dead", "im crying", "crying", "dying", "im wheezing", "help", "stop", "STOP",
        "pls", "please", "cmon", "come on", "lets go", "LETS GO", "LETS GOOO", "yes yes yes", "no no no", "oh no", "oh no no no", "uh oh", "welp",
        "oof", "yikes", "big yikes", "rip", "F", "f", "o7", "7", "respect", "salute", "gn chat", "night everyone", "cya", "bye chat", "gotta go sadly",
        "logging off see you tomorrow", "ok bed time for real", "see you next stream", "wait for the raid then sleep", "staying for the raid",
        "whos getting raided", "raid who", "raid incoming?", "ending soon?", "how long is stream today", "how many hours in", "when did stream start",
        "schedule?", "stream tomorrow?", "what time tomorrow", "is there stream this weekend", "day 4 of asking for minecraft", "play minecraft",
        "variety stream when", "horror game night when", "viewer games when", "subs only lobby when", "tournament when", "collab with pixelmoth when",
        "whats next after this", "what game next", "next game?", "the sequel is better", "the first one was better", "play the dlc", "do the dlc",
        "do the side quest", "theres a chest behind you", "you missed loot", "go back theres an item", "the door on the left", "other left",
        "look up", "look at the map", "check the map", "map", "reload", "RELOAD", "heal", "HEAL", "hp", "low hp", "youre low", "youre one shot",
        "behind you", "BEHIND YOU", "left side", "right side", "top", "bottom", "hes top", "hes on the roof", "in the bush", "sniper", "theres a sniper",
        "dont push", "push push push", "go go go", "wait", "WAIT", "not yet", "now", "NOW", "run", "RUN", "jump", "crouch", "slide", "dodge", "roll",
        "parry", "block", "backseat gaming at its finest", "sorry for backseating", "ok no more backseating", "chat stop backseating", "let him play",
        "let him cook", "hes cooking", "hes cooked", "cooked", "chef", "michelin star play", "dinner is served", "burnt", "raw", "undercooked",
        "i trust him", "in him we trust", "we believe", "believe", "faith", "faithful", "the faithful remain", "doubters out", "haters silent",
        "doubt", "x", "doubt x", "press x to doubt", "copium", "hopium", "coping", "hard cope", "cope and seethe", "mald", "malding", "tilted",
        "tilt incoming", "hes tilted", "the tilt is real", "stay calm", "dont tilt", "tilt proof", "zen mode", "monk mode", "unbothered", "locked in",
        "focused", "the focus", "tunnel vision", "zone", "in the zone", "flow state", "hes in the zone dont talk to him", "shh", "quiet chat hes focusing",
        "slow mode?", "chat is too fast", "cant read anything", "speed reading chat", "i can only read every 5th message", "chat is a blur"
    ];

    // Longer, more conversational lines (great Markov fodder)
    const conversational = [
        "honestly this is the most fun ive had watching a stream in weeks", "i was about to go to bed but now i have to see how this ends",
        "my friend told me about this channel and now im addicted", "i never understood this game until i started watching here",
        "the way you explain stuff while playing is really helpful", "i learned more in this stream than in ten hours of tutorials",
        "this is the kind of stream i put on while working and then end up not working", "i swear every time i join something crazy happens",
        "the energy today is on another level compared to yesterday", "yesterday was chaos but today is somehow worse in the best way",
        "i cant tell if this is going really well or really badly", "the fact that this is working at all is a miracle",
        "no one is going to believe me when i describe this tomorrow", "my roommate just asked why i screamed and i had no answer",
        "i was eating and almost choked when that happened", "i spit out my drink thanks a lot", "my keyboard is now covered in coffee",
        "this is exactly why i never uninstall this game", "i would have rage quit twenty minutes ago", "the patience on display is unreal",
        "the fact that you stayed calm through that is wild to me", "i would have thrown my controller through the wall",
        "that would have ended my gaming career on the spot", "i respect the commitment even though it did not work",
        "the idea was good the execution was questionable", "the plan was solid until the game decided otherwise",
        "its always the one time you dont check the corner", "it is never the enemy you see that gets you", "the game only cheats when it matters",
        "the amount of times this exact thing has happened is suspicious", "at this point its a running joke", "this is lore now",
        "i feel like the game is personally targeting you today", "the servers are definitely having a moment", "lag spikes at the worst possible time",
        "my own internet would never survive this", "imagine doing this on a controller", "imagine doing this with viewers watching",
        "doing this with a thousand people watching is stressful enough", "i would freeze if that many people watched me play",
        "stream snipers are not even a problem compared to this", "the game itself is the real stream sniper", "the ai in this game is terrifying",
        "the ai is either dumb as rocks or a literal genius there is no in between", "enemies in this game have aimbot i swear",
        "the hitboxes in this game are a war crime", "the hit registration is a suggestion at best", "the physics engine is doing its own thing",
        "the boss design in this section is actually mean", "whoever designed this level has never played a video game", "this map is cursed",
        "this is my least favorite map and nothing has changed my mind", "this level alone made me quit the game years ago",
        "the soundtrack in this area is incredible though", "the music is doing a lot of heavy lifting here", "the ambient sound in this game is so good",
        "the voice acting in this game is surprisingly good", "the writing in this part is genuinely funny", "the dialogue is making me laugh more than it should",
        "i forgot how good this game looks", "graphics have no right to be this good", "for a game this old it holds up really well",
        "this game aged like fine wine", "the remaster did this scene justice", "the original was better fight me", "the sequel improved everything except the story",
        "i played this years ago and remembered none of this", "i have 400 hours in this game and never saw that", "ok i did not know you could do that",
        "wait you can do that", "since when can you do that", "that is a mechanic i have never seen used", "that trick is going straight into my runs",
        "i am taking notes right now", "someone tell the speedrun discord about that", "that might actually save a few seconds", "that is a real strat",
        "that is not a real strat and im impressed it worked", "sometimes the dumbest plan is the best plan", "chaos is a valid strategy",
        "speed over safety every time", "safe play is boring play", "the greedy play actually paid off this time", "greed is a disease and you have it",
        "the greed is going to get you one day", "that was so greedy and i loved every second", "respect the greed",
        "ok but the recovery after that mistake was perfect", "mistakes were made but we move on", "a mistake is only a mistake if you dont learn from it",
        "the learning curve on this game is a wall", "this game teaches you by killing you", "dying is the tutorial", "the real game starts now",
        "first time blind playthroughs are the best content", "please do not spoil anything for him", "no spoilers chat seriously", "spoilers get banned here",
        "i am so jealous that you get to experience this for the first time", "i would pay to forget this game and play it again",
        "that ending is going to hit so hard", "wait until you see what happens next", "the next part is my favorite", "oh you are going to love this section",
        "oh you are going to hate this section", "good luck with the next boss", "the next boss took me two days", "this fight is where runs go to die",
        "the final boss of this stream is staying awake", "the real boss is the sleep schedule", "i have work in four hours and i am still here",
        "a reasonable adult would go to sleep right now", "sleep is temporary stream is forever", "one more episode energy but with streams",
        "i told myself one hour three hours ago", "time flies when chat is this unhinged", "how is it already midnight", "this stream ate my entire evening",
        "best way to spend a sunday honestly", "monday is going to hurt but this was worth it", "weekends exist for this exact purpose",
        "the fact that this is free is insane", "i would pay for this and i kind of do", "worth every penny of my sub", "the sub was worth it for the emotes alone",
        "i only subbed for the emotes and stayed for the community", "the community here is so welcoming", "chat is actually nice here for once",
        "this is the only chat that does not give me a headache", "mods are doing great tonight", "shoutout to the mods for dealing with us",
        "the mods deserve a raise", "whoever is running the bot tonight is on fire", "the alerts are so well made", "the overlay looks clean",
        "new overlay looks great", "the new scene transition is slick", "is that a new camera", "the lighting looks different today", "new setup looks good",
        "the room looks so cozy", "i want that lamp", "where did you get that chair", "the desk setup is goals", "the keyboard sounds so satisfying",
        "the mouse clicks are asmr", "the typing sounds are weirdly relaxing", "i could fall asleep to this stream", "this is my sleep stream",
        "this is my background noise stream and i mean that in the best way", "half the viewers are asleep and that is fine",
        "lurkers are the backbone of this channel", "lurking respectfully", "lurk mode activated", "back from lurking to say hi", "i never type but had to",
        "first message ever in this chat", "been watching for a year and finally made an account", "long time lurker first time chatter",
        "i never talk in chat but that deserved a message", "ok that one got me to type", "typing just to say that was sick", "well done honestly"
    ];

    const questions = [
        "what game is this", "is this game good", "is this game worth buying", "is it on sale", "how much is this game", "is it on console", "does it have multiplayer",
        "how long is this game", "how many hours in are you", "how long have you been live", "what did i miss", "did i miss anything", "did something happen",
        "whats the goal today", "what are we doing today", "what happened to the last run", "why did you die", "how did that hit", "how did that not hit",
        "how is that possible", "how do you do that", "how do you move like that", "is that a glitch", "is that intended", "is that allowed", "is this ranked",
        "is this a new patch", "did they nerf that", "did they buff that", "did you see the update notes", "whats your sens", "what mouse is that", "what keyboard",
        "what headset", "what chair", "specs?", "what gpu", "fps?", "what settings", "are you on controller", "controller or mnk", "whats your rank",
        "whats your main", "who do you main", "favorite map?", "favorite weapon?", "favorite game of all time?", "first game you ever played?",
        "how long have you been streaming", "how long have you played this game", "how did you get into streaming", "do you stream every day",
        "whats the schedule", "when is the next stream", "stream tomorrow?", "are you streaming this weekend", "how long are you streaming today",
        "are you doing the new event", "are you playing the dlc", "will you play the sequel", "are you going to do a hardcore run", "speedrun when",
        "when minecraft", "when horror games", "when viewer games", "can i play with you", "can viewers join", "is there a discord", "whats the discord link",
        "do you have a youtube", "are the vods on youtube", "where can i watch the vods", "do you have socials", "whats your twitter", "are clips allowed",
        "can i clip this", "is this the first time playing", "blind playthrough?", "have you played the first one", "have you seen the ending",
        "do you know what happens next", "do you know about the secret room", "did you get the item back there", "did you check the chest", "why not take the loot",
        "are you going to craft that", "are you using that", "whats the build", "whats the strat", "what are we doing here", "where are we going", "why are we here",
        "is the stream lagging for anyone else", "is it just me or is the audio off", "anyone else buffering", "is the cam frozen for everyone", "did the stream die",
        "where is everyone from", "anyone else from europe here", "any aussies up", "is anyone else watching at 4am", "what time is it for you",
        "what timezone are you in", "where do you live roughly", "whats the weather like there", "is it cold where you are", "how was your day",
        "how are you feeling today", "are you sick", "you ok?", "did you sleep", "have you eaten", "whats for dinner", "coffee or tea", "cats or dogs",
        "whats your dogs name", "is that your cat", "can we see the cat", "pet cam when", "whats that on your desk", "what are you drinking", "energy drink?",
        "whats the song", "song name", "who is this artist", "is this your playlist", "can you turn the music up", "can you turn the game down",
        "can you say hi to my friend", "can you wish my brother happy birthday", "can i get a shoutout", "can you read my message", "did you see my question",
        "why is chat so fast", "why is slow mode on", "why did he get timed out", "who is that", "who are you playing with", "who is on your team",
        "did you win", "did we win", "are we winning", "is this winnable", "is it over", "is it joever", "are we back", "how many wins today", "whats the score"
    ];

    const streamerDirected = [
        "@{streamer} whats your sens", "@{streamer} how long have you been playing {game}", "@{streamer} can you say hi to my friend", "@{streamer} what mouse",
        "@{streamer} favorite map", "@{streamer} are you doing the new update", "@{streamer} how are you this good", "@{streamer} viewer games later?",
        "@{streamer} do you have a discord", "@{streamer} when are you playing {game2}", "@{streamer} play {game2} after this", "@{streamer} drink water",
        "@{streamer} you missed a chest", "@{streamer} check the map", "@{streamer} the door on the left", "@{streamer} hows your day going",
        "@{streamer} hi from {country}", "@{streamer} you sound tired go sleep after this", "@{streamer} that was insane", "@{streamer} W",
        "@{streamer} are the vods on youtube", "@{streamer} stream schedule?", "@{streamer} happy {n} months of streaming", "@{streamer} whats the build",
        "@{streamer} controller or mnk", "@{streamer} first time here love the vibe", "@{streamer} the audio is a little low", "@{streamer} cam frozen",
        "@{streamer} ty for the stream", "@{streamer} can you turn the music up a bit", "@{streamer} what are you drinking", "@{streamer} whats your rank",
        "@{streamer} have you tried the other route", "@{streamer} try crouching there", "@{streamer} the boss is weak to fire", "@{streamer} save before this part",
        "@{streamer} did you see my question", "@{streamer} read chat", "@{streamer} you are muted", "@{streamer} shoutout pls its my birthday",
        "@{streamer} is this blind", "@{streamer} no spoilers right", "@{streamer} you should speedrun this", "@{streamer} how many hours in {game} do you have"
    ];

    const gameTalk = [
        "{game} is so good", "i love {game}", "{game} has the best soundtrack", "is {game} worth it", "should i buy {game}", "{game} on sale rn",
        "never played {game} but this looks fun", "{game} music hits different", "{game} players are built different", "the {game} community is unhinged",
        "day 3 of {game} content lets go", "{game} speedrun when", "{game} at 2am is a different game", "{game} without sleep is the real challenge",
        "i have way too many hours in {game}", "{game} ruined other games for me", "{game} is peak", "{game} is mid dont @ me", "{game} is better than {game2}",
        "{game2} is better than {game} and you know it", "play {game2} next", "when {game2}", "{game2} stream when", "we need a {game2} night",
        "{game} servers are a mess tonight", "the {game} devs need to fix that", "{game} patch when", "the new {game} update broke everything",
        "classic {game} moment", "only in {game}", "{game} things", "thats {game} for you", "{game} is {game}", "peak {game}", "{game} never changes"
    ];

    const backseat = [
        "go left", "go right", "other left", "no the other way", "turn around", "behind you", "look up", "look down", "check the corner", "clear the corner first",
        "heal first", "reload before you push", "use your ult", "use the ability", "save the ability", "dont waste it", "wait for the cooldown", "cooldown is up",
        "you have a grenade", "throw the nade", "use the item", "equip the better one", "swap weapons", "crouch", "jump", "slide", "dont jump there", "walk dont run",
        "sprint", "sneak", "stealth it", "just rush", "aggressive play here", "play safe", "play slow", "take your time", "no rush", "hurry", "timer is running",
        "the timer", "watch the timer", "watch your hp", "hp low", "youre one shot", "pot", "flask", "estus", "drink", "eat", "rest", "save", "SAVE", "quicksave",
        "did you save", "save first please", "save before boss", "manual save", "autosave is a lie", "bonfire", "checkpoint", "respawn point there",
        "fast travel", "teleport back", "open the map", "mark it on the map", "follow the marker", "ignore the marker", "side quest first", "main quest first",
        "talk to the npc", "read the note", "read the sign", "check inventory", "sell the junk", "craft it", "upgrade it", "level up", "spend the points",
        "put points in stamina", "vitality is the move", "max the main weapon", "block", "parry", "dodge roll", "roll into it", "roll away", "space it", "bait it",
        "wait for the opening", "punish the recovery", "attack now", "stop attacking", "greedy", "too greedy", "one more hit", "dont take the extra hit",
        "back off", "disengage", "regroup", "rotate", "rotate now", "zone is closing", "storm is coming", "high ground", "take high ground", "dont peek",
        "peek", "jiggle peek", "pre fire that corner", "hold the angle", "swing wide", "they are pushing", "theyre flanking", "flank", "split", "stick together",
        "stay with the team", "dont solo", "wait for team", "go in", "GO IN", "commit", "dont commit", "run away", "leave", "just leave", "retreat", "tactical retreat"
    ];

    const salty = [
        "that was a throw", "massive throw", "threw it", "how do you miss that", "bro", "bro what", "what was that", "what are you doing", "why", "WHY",
        "why would you do that", "explain that one", "chat explain", "i dont understand", "that makes no sense", "unbelievable", "every time", "every single time",
        "again?", "not again", "here we go again", "same mistake", "same thing as last time", "did we learn nothing", "learn the pattern", "the pattern is so simple",
        "its not that hard", "my grandma could do that", "a bot could do that", "the bot did it better", "i could do that with my eyes closed", "you had one job",
        "one job", "literally one job", "bruh", "bruhhh", "bruh moment", "cringe", "painful", "painful to watch", "unwatchable", "unsubbing", "unfollowed",
        "im out", "im done", "done with this", "thats it im going to bed", "cant watch this", "the throw of the century", "world record throw", "rip run",
        "run is dead", "reset", "just reset", "restart", "time to reset", "that run was cooked anyway", "dead run", "it was over the moment you did that",
        "it was over before it started", "gg", "its over", "its so over", "pack it up", "finished", "done", "cooked", "burnt to a crisp", "we lost",
        "L", "huge L", "big L", "L + ratio", "L streamer", "L chat told him", "chat told you", "we told you", "we literally said that", "listen to chat for once",
        "this is why you read chat", "skill issue", "skill diff", "aim diff", "brain diff", "hands diff", "hands cold", "warm up your hands", "aim is off today",
        "aim went on vacation", "the crosshair was sightseeing", "that aim took the scenic route", "shooting the air", "shooting at ghosts", "where were you aiming",
        "blind", "are you blind", "hes blind", "he didnt see it", "right in front of you", "it was RIGHT THERE", "literally right there", "it was on screen",
        "the item was on screen for 10 seconds", "you walked past it twice", "three times now", "the door was open", "the door is right there", "no the other door",
        "wrong door", "wrong way", "wrong button", "fat fingered it", "misinput", "controller drift", "blame the controller", "blame lag", "blame the game",
        "blame chat", "blame the cat", "its the keyboards fault", "the mouse slipped", "my mouse also slips exactly when i miss", "excuses", "no excuses",
        "cope", "copium overdose", "stop coping", "the cope is strong", "delusional", "delulu", "in denial", "denial stage", "anger stage", "bargaining stage",
        "acceptance soon", "grief has five stages and we are on all of them", "the audacity", "the disrespect", "disrespectful", "humbled", "got humbled",
        "humbling experience", "reality check", "touch grass", "go outside", "uninstall", "delete the game", "refund it", "return the game", "ban the game",
        "jail", "straight to jail", "arrested for that", "call the police", "crime", "war crime", "illegal", "that should be illegal", "report", "reported",
        "mods ban him", "ban the streamer", "timeout the streamer", "free timeout", "mods do your thing", "mods where are you", "mods are asleep"
    ];

    const wholesome = [
        "you got this", "you can do it", "we believe in you", "proud of you", "so proud of this community", "best community", "love this chat", "love you all",
        "youre doing great", "doing amazing", "great job", "well played", "nicely done", "beautiful", "gorgeous play", "so clean", "chefs kiss", "perfect",
        "flawless", "no notes", "10/10", "take your time no rush", "no pressure", "you dont have to do it perfectly", "its just a game have fun", "having fun is what matters",
        "as long as youre having fun", "this is why i watch", "i come here for the vibes", "the vibes are perfect", "cozy", "so cozy", "comfy stream",
        "thanks for being here", "thanks for streaming today", "thank you for this", "really needed this today", "this made my day", "made my week",
        "you always cheer me up", "this stream is therapy", "cheaper than therapy", "better than therapy", "my safe place", "home", "feels like home",
        "sending love", "sending hugs", "virtual hug", "hugs", "<3", "<3 <3 <3", "hearts", "love", "respect", "mad respect", "big respect", "huge respect",
        "gg to everyone", "gg all", "everyone did great", "good game chat", "we did it together", "team effort", "we are a team", "we", "us", "ours",
        "the win is ours", "we won together", "we lost together and thats ok", "tomorrow is another day", "next time", "next time for sure", "well get it",
        "we will get it", "we got this next time", "almost", "so close", "close one", "next run is the one", "i can feel it", "the one", "this is the one",
        "good luck", "gl", "glhf", "gl on the next one", "break a leg", "rooting for you", "cheering from the couch", "cheering quietly at work", "silent cheering",
        "clapping at my desk", "standing ovation", "applause", "bravo", "encore", "take a bow", "legend", "absolute legend", "king", "queen", "royalty",
        "icon", "iconic", "living legend", "the greatest", "the best", "best streamer", "favorite streamer", "my favorite", "my comfort streamer", "comfort stream",
        "hydrate pls", "drink water <3", "eat something later ok", "take care of yourself", "rest after this", "sleep well later", "dont overwork", "your health first",
        "happy birthday!", "happy anniversary", "congrats", "congrats on the milestone", "congrats on affiliate", "congrats on partner", "well deserved", "earned it",
        "you earned this", "hard work pays off", "the grind is paying off", "watching you grow has been amazing", "ive been here since 50 viewers", "og viewer",
        "day one viewer", "here since the beginning", "proud day one", "remember when it was 20 of us", "look how far weve come", "so happy for you", "yay"
    ];

    const greetings = [
        "hi from {country}", "hello from {country}", "greetings from {country}", "{country} gang", "any {country} viewers here", "watching from {country} at 4am",
        "good morning from {country}", "good night from {country}", "its already tomorrow here in {country}", "lunch break stream from {country}",
        "hey chat", "hi everyone", "hello hello", "yo whats up", "sup chat", "evening all", "morning all", "hi {streamer}", "hello {streamer}", "hey {streamer} hows it going",
        "hi {streamer} hi chat", "hiii", "heyyy", "hellooo", "o/", "\\o", "o/ chat", "waves", "hi im new", "new here", "new viewer", "first stream here",
        "found you through a clip", "came from the clip on reddit", "youtube sent me", "tiktok brought me here", "a friend recommended this channel", "raid brought me here last week and i stayed",
        "back again", "im back", "back from dinner", "back from work", "back from class", "back from the gym", "back from walking the dog", "returned", "i have returned",
        "ok im here now you can start the good part", "the main character has arrived", "sorry im late", "late but here", "better late than never", "did i miss it",
        "just woke up", "just got home", "just finished work", "finally home", "long day", "finally off work", "weekend baby", "friday feeling", "monday survived"
    ];

    const tech = [
        "is the stream lagging for anyone else", "stream froze", "froze for me", "buffering", "its buffering", "buffer gang", "refresh fixed it", "f5", "try refreshing",
        "fine for me", "no lag here", "works for me", "smooth here", "crisp 1080 here", "720 gang rise up", "source quality is chefs kiss", "bitrate dropped", "bitrate",
        "pixels", "pixelated", "potato quality for a sec", "looks fine now", "its back", "we are back", "audio desync", "audio is off by a second", "audio is late",
        "lips dont match", "mic peaking", "mic is peaking a little", "mic is quiet", "cant hear you", "mic muted?", "youre muted", "MUTED", "unmute", "we cant hear you",
        "we can hear you now", "audio fixed", "game audio too loud", "music too loud", "music a bit loud over voice", "can barely hear the game", "discord audio is loud",
        "cam froze", "cam frozen", "cam is a painting", "cam back", "face cam gone", "where did the cam go", "no cam?", "cam off today?", "alerts not showing",
        "my sub alert didnt show", "alert delayed", "bot is dead", "the bot is broken", "!commands broken", "chat delay is huge", "chat delay", "low latency on?",
        "is the vod going up", "vod?", "will this be on youtube", "clip it for the vod", "mobile viewer here", "watching on tv", "watching on the toilet dont judge",
        "phone is at 3%", "charger where", "data is gonna die", "im on 480 to save data", "wifi is fighting for its life", "neighbors wifi carrying me rn"
    ];

    const food = [
        "whats for dinner chat", "i just made pasta", "ordering pizza", "pizza time", "anyone else hungry", "im hungry now", "snack break", "chips and stream",
        "ramen at 2am hits different", "cereal for dinner again", "making a sandwich brb", "coffee number 4", "tea gang", "energy drink number 3 of the day",
        "cooking while watching", "burnt my toast because of that play", "dinner is getting cold", "eating with chat is the best", "whats everyone eating",
        "tacos", "tacos tonight", "sushi night", "leftovers again", "mom made dinner", "takeout gang", "meal prep sunday", "fridge is empty", "ordered food 40 mins ago still waiting",
        "food arrived", "food is here", "delivery guy heard me scream", "chewing loudly in solidarity", "{food} tonight", "{food} supremacy", "{food} is the move",
        "anyone else craving {food}", "i could go for some {food} rn", "{food} > everything", "stream snack: {food}"
    ];

    const copypasta = [
        "I am once again asking chat to calm down", "Please do not spoil the ending, we have viewers who are seeing this for the first time",
        "ATTENTION CHAT: the streamer is currently in a flow state. Please refrain from backseating. Thank you for your cooperation.",
        "This message was sent from the future. It gets worse.", "Day {n} of watching {streamer}: still no idea what the plan is",
        "Dear {streamer}, on behalf of the entire chat, we would like to formally request that you check the corner next time. Sincerely, Chat",
        "mods i would like to report a crime: the play that just happened", "it is with a heavy heart that i announce that the run is dead",
        "scientists have discovered that watching {streamer} play {game} raises blood pressure by 40%", "{streamer} viewers when the stream starts: 🏃🏃🏃",
        "roses are red violets are blue the loot was right there and you walked past it too", "me: i will go to bed early. {streamer}: *goes live*",
        "if you are reading this you are legally obligated to drink some water", "according to all known laws of aviation that should not have worked",
        "breaking news: local streamer discovers door after 20 minutes", "this is your daily reminder that the chest behind you is still there",
        "WE ARE NOT MAD WE ARE JUST DISAPPOINTED", "stay hydrated stay seated stay winning", "fun fact: this is the {n}th time this exact thing has happened",
        "chat is now entering emote only mode (in spirit)", "petition to rename the channel to {streamer}MissesEverything", "pov: you are the enemy and you just got lucky",
        "me explaining to my family why i screamed: 'he missed the jump'", "no thoughts head empty only {game}", "the five stages of {game}: denial anger bargaining depression {game}"
    ];

    // Short, emote-heavy bursts (very common in real chats)
    const shortBursts = [
        "W", "L", "F", "o7", "gg", "ez", "EZ", "lol", "lmao", "LMAO", "LMAOOO", "?", "??", "???", "!", "!!", "no", "NO", "yes", "YES", "nah", "yep", "bruh", "bro",
        "wait", "WAIT", "what", "WHAT", "HUH", "huh", "rip", "RIP", "pog", "POG", "lets go", "LETS GO", "LETS GOOOO", "nooo", "noooo", "yesss", "sheesh", "sheeeesh",
        "ayo", "ayo?", "pause", "hold on", "oh no", "oh", "ohhh", "ooooh", "oof", "yikes", "nice", "clean", "sick", "insane", "cracked", "clutch", "CLUTCH", "nt", "unlucky",
        "true", "real", "facts", "same", "fr", "ong", "this", "^", "+2", "-2", "ratio", "based", "mid", "peak", "W chat", "L chat", "gg ez", "ggs", "wp", "o7 o7",
        "7", "F in chat", "clip", "CLIP IT", "clip that", "omg", "OMG", "omfg", "jesus", "dude", "man", "cmon", "pls", "stop", "STOP", "help", "im dead", "crying",
        "wtf", "WTF", "how", "HOW", "why", "WHY", "ok", "k", "ye", "nope", "nahhh", "ayy", "woo", "WOOO", "hype", "HYPE", "pogg", "poggers", "monka", "sadge", "copium"
    ];

    const commands = ["!drops", "!discord", "!socials", "!uptime", "!followage", "!rank", "!sens", "!specs", "!song", "!lurk", "!schedule", "!commands", "!game", "!title", "!watchtime", "!points", "!hug {other}", "!love {streamer}"];

    // Replies when the broadcaster types in chat
    const streamerReplies = {
        greeting: ["hi {streamer}!", "hey {streamer}", "hello!!", "HeyGuys", "hiii", "hello {streamer} <3", "heyyy", "hi hi", "o/", "{streamer}!!", "he said hi to us", "HE SAID HI", "hi back"],
        question: ["yes", "no", "yes!", "nope", "maybe", "idk", "definitely", "absolutely not", "100%", "probably", "i think so", "nah", "yes do it", "no dont", "go for it", "why not", "i vote yes", "i vote no", "chat says yes", "chat says no", "yes yes yes", "NO", "YES", "depends", "sure", "if you want", "up to you", "your call", "trust", "do it"],
        thanks: ["np", "<3", "ofc", "anytime", "no problem!", "ty for streaming", "thank YOU", "we love you", "jitterLove", "always", "of course", "np np"],
        laugh: ["KEKW", "LUL", "lmao", "he laughed", "the laugh", "OMEGALUL", "his laugh is contagious", "lmaooo", "haha", "ICANT"],
        generic: ["he read my message Pog", "HE READ IT", "noticed", "he talks to chat Pog", "W interaction", "facts", "true", "real", "based", "fair", "fair enough", "agreed", "ok ok", "makes sense", "that tracks", "understandable", "valid", "respect", "ok but why", "sure buddy", "copium", "doubt", "x", "we will see", "sounds like a plan", "famous last words", "clip that statement", "noted", "writing that down", "screenshotted", "remember he said that", "quote of the day", "hes right", "hes wrong but ok", "nah", "yes", "no", "lol", "lmao", "W", "L take", "W take", "interesting", "hmm", "Hmm", "ok {streamer}", "ok", "say less", "bet", "cool", "nice", "poggers", "YEP", "NOP", "NODDERS", "NOPERS", "Okayge"],
        mentionReply: ["@{streamer} {reply}", "{reply}", "{reply}", "{reply}"]
    };

    // Reactions to events
    const events = {
        raid: ["{raider} RAID", "{raider}Love {raider}Love {raider}Love", "hi from {raider}'s chat", "{raider} sent us", "RAID", "we come in peace", "raiders here o/", "new viewer from the raid hi",
            "{raider} said this stream is good", "hello new chat", "hi {streamer} we are from {raider}", "raid train choo choo", "{raider} <3 {streamer}", "what did we walk into",
            "ok this looks fun", "what game is this", "we were sent here by {raider}", "{raider} gang", "hi hi hi", "raid hype", "RAID HYPE", "HeyGuys HeyGuys", "wave", "o/ o/ o/",
            "we brought snacks", "following", "followed", "new follow from the raid", "{raider} raid pog", "RAIDERS", "incoming", "hello from the other side", "raid squad"],
        raidWelcome: ["welcome raiders", "welcome everyone!", "hi raiders", "WELCOME", "welcome welcome", "hello raiders o/", "welcome to the chaos", "thanks for the raid {raider}", "ty for the raid", "raid pog", "welcome new friends", "hi new people", "make yourselves at home", "welcome the water is fine", "you came at a good time"],
        sub: ["welcome to the fam", "sub hype", "pog sub", "welcome!", "ty for the sub", "new sub welcome", "{other} welcome", "another one", "SUB HYPE", "welcome to the club", "jitterLove jitterLove", "lets go {other}", "W sub", "nice", "welcome in", "enjoy the emotes", "good choice"],
        gift: ["ty for the gifts {other}", "TY {other}", "{other} is a legend", "gifted subs pog", "W gifter", "thank you {other}!!", "gift bomb!!", "{other} <3", "did i get one", "i got one ty!!", "omg thank you {other}", "GIFTED", "gift hype", "{other} is him", "ty ty ty", "legend", "{other} W", "sub hype", "the generosity", "{other} out here feeding the chat"],
        follow: ["welcome", "new follow pog", "welcome {other}", "hi {other}", "follow hype"],
        hypeTrain: ["HYPE TRAIN", "choo choo", "all aboard", "hype train lets go", "LEVEL UP", "keep it going", "we can hit level 5", "HYPERS", "train is moving", "CHOO CHOO", "dont let it die", "feed the train", "hype hype hype", "TRAIN", "next level", "level {n}!!"],
        clip: ["clipped", "already clipped", "i clipped it", "clip it", "CLIP", "that clip is going viral", "clip of the stream", "clip of the year", "ok that is going in the highlights"],
        titleChange: ["new title KEKW", "title update", "the title lol", "lmao the title", "accurate title", "title is a lie", "title checks out"],
        gameChange: ["finally {game}", "{game} pog", "ew {game}", "{game}!!!", "oh {game} time", "oh we are playing {game} now", "{game} lets go", "wait {game}?", "{game} stream lets go", "not {game} again", "yes {game}"],
        moment: ["WHAT", "NO WAY", "HOLY", "LETS GOOOO", "YOOOO", "AYOOO", "INSANE", "CLIP IT", "CLUTCH", "WHAT WAS THAT", "HOW", "GG", "W", "SHEEEESH", "NO SHOT", "ARE YOU KIDDING", "WOOOO", "YESSSS", "CRACKED", "HE IS HIM", "HES HIM", "GOAT", "BUILT DIFFERENT", "POGGERS", "I CANT BELIEVE IT"],
        fail: ["NOOOO", "oh no", "F", "rip", "RIP", "pain", "it hurts", "Sadge", "PepeHands", "NotLikeThis", "nooooo", "so close", "unlucky", "NO", "WHY", "bruh", "ouch", "oof", "jitterRIP", "Deadge", "run dead", "next time", "F in chat", "pack it up", "its over"]
    };

    // Peer replies (chatters talking to each other)
    const peerReplies = ["@{other} fr", "@{other} same", "@{other} no way", "@{other} this", "@{other} true", "@{other} lmao", "@{other} KEKW", "@{other} facts", "@{other} real",
        "@{other} i was thinking the same thing", "@{other} nah", "@{other} what", "@{other} yes", "@{other} no", "@{other} agreed", "@{other} lol", "@{other} ok and", "@{other} based",
        "@{other} cope", "@{other} ratio", "@{other} W take", "@{other} L take", "@{other} exactly", "@{other} say it louder", "@{other} hi!", "@{other} welcome", "@{other} same here",
        "@{other} +1", "@{other} thats what i said", "@{other} big if true", "@{other} doubt", "@{other} source?", "@{other} trust me bro", "@{other} ok buddy", "@{other} you good?",
        "@{other} go to sleep", "@{other} same energy", "@{other} you get it", "@{other} finally someone said it", "@{other} <3", "@{other} ily", "@{other} marry me", "@{other} lmaooo"];

    // Ironically quoted "wisdom" pulled from the phrases list in data/ (loaded at runtime); formats to wrap them in.
    const quoteFormats = ['"{quote}" - {streamer} 2024', '"{quote}" - {streamer}, probably', '{quote}. - sun tzu', '"{quote}" - chat right now', 'the vibe rn: {quote}', 'this stream in one sentence: {quote}', '"{quote}" me watching this'];

    const countries = ["germany", "brazil", "the uk", "canada", "australia", "france", "mexico", "the netherlands", "sweden", "japan", "poland", "spain", "italy", "norway", "argentina",
        "finland", "portugal", "chile", "india", "the philippines", "new zealand", "ireland", "denmark", "texas", "ohio", "california", "florida", "new york", "scotland", "belgium", "turkey", "korea", "singapore", "south africa"];
    const foods = ["pizza", "ramen", "tacos", "sushi", "wings", "fries", "burgers", "nachos", "pasta", "curry", "dumplings", "pho", "burritos", "pancakes", "cereal", "popcorn", "hot pot", "kebab", "noodles", "ice cream"];
    const games = ["Minecraft", "Elden Ring", "Valorant", "Apex", "Fortnite", "League", "Stardew", "Terraria", "Hollow Knight", "Celeste", "Dark Souls", "Mario Kart", "Rocket League", "Overwatch", "Baldur's Gate 3", "Hades", "Among Us", "Phasmophobia", "Lethal Company", "Balatro", "Slay the Spire", "Dead by Daylight", "Sea of Thieves", "Skyrim", "Cuphead", "Tetris", "Portal", "Halo", "Doom", "Pokemon"];

    // Username building blocks (combined with the big list from data/ when available)
    const nameAdjectives = ["silent", "crispy", "sleepy", "spicy", "cosmic", "tiny", "mega", "shadow", "pixel", "toxic", "salty", "lucky", "lazy", "frozen", "neon", "retro", "turbo", "cozy", "angry", "sneaky", "quiet", "loud", "soggy", "fuzzy", "rusty", "golden", "dark", "lil", "big", "xx", "the", "not", "just", "real", "fake", "average", "random", "chaotic", "feral", "cursed", "blessed", "hungry", "tired", "caffeinated", "unhinged", "local", "certified", "professional", "casual", "sweaty", "mild", "wild", "grumpy", "happy", "sad", "void", "ghost", "cyber", "hyper", "ultra", "omega", "alpha", "sigma", "based"];
    const nameNouns = ["potato", "noodle", "goblin", "wizard", "panda", "raccoon", "moth", "toast", "ghost", "knight", "pilot", "gamer", "duck", "frog", "cat", "dog", "fox", "wolf", "bear", "otter", "sloth", "pigeon", "goose", "crab", "shrimp", "taco", "burrito", "pickle", "waffle", "bagel", "muffin", "cookie", "biscuit", "nugget", "bean", "pea", "onion", "garlic", "lemon", "mango", "peach", "plum", "kiwi", "melon", "viking", "ninja", "pirate", "samurai", "robot", "cyborg", "alien", "zombie", "vampire", "witch", "gremlin", "lurker", "enjoyer", "andy", "main", "fan", "hater", "gaming", "plays", "tv", "live", "vods", "clips", "guy", "girl", "dude", "bro", "mom", "dad", "uncle", "grandma", "boi", "lad", "lass", "kid", "man", "person", "entity", "thing", "being"];
    const nameHandles = ["pixelmoth", "notaspeedrunner", "quietcoder", "sleepy_sam", "ChefByte", "VoidWalker_TV", "TacticalTurnip", "GrandmaGaming", "RetroRewind", "Kaz_Plays", "LongLiveTheEmpire",
        "xX_DarkSlayer_Xx", "ttv_nova", "GhostMode", "NovaKnight", "VibeCheck", "TurboToast", "ChatChampion", "lurkingloaf", "mango_milk", "beansontoast", "ok_but_why", "literallyafrog",
        "KebabKnight", "sadge_enjoyer", "MinecraftSteve_", "yourmomsfavorite", "big_chungus_2", "aimbotAndy", "Shrimp_Fried_Rice", "noscopeNancy", "just_here_to_lurk", "WifiWarrior",
        "pepega_prime", "toaster_bath", "crouton_cat", "Dr_Pickle", "unlucky_unicorn", "goose_on_the_loose", "deadinside_dave", "MidnightMango", "notabot9000", "CaffeineCrisis",
        "MilkTeaMaster", "SoggyCerealFan", "grass_toucher", "AverageEnjoyer", "RTX_Off", "frameratefred", "lag_lord", "PingKing", "CtrlAltDefeat", "NullPointerException", "SegFaultSally"];

    // Twitch-style default name colours (the same 15 the real site hands out) plus a few custom ones
    const colors = ["#FF0000", "#0000FF", "#008000", "#B22222", "#FF7F50", "#9ACD32", "#FF4500", "#2E8B57", "#DAA520", "#D2691E", "#5F9EA0", "#1E90FF", "#FF69B4", "#8A2BE2", "#00FF7F"];
    const customColors = ["#19e0b1", "#8f6bff", "#ff8a5c", "#4cc9f0", "#f72585", "#b5e48c", "#ffd166", "#06d6a0", "#ef476f", "#118ab2", "#f4a261", "#e9c46a", "#a8dadc", "#cdb4db", "#ffafcc"];

    return { emotes, emoteSets, general, conversational, questions, streamerDirected, gameTalk, backseat, salty, wholesome, greetings, tech, food, copypasta, shortBursts, commands,
        streamerReplies, events, peerReplies, quoteFormats, countries, foods, games, nameAdjectives, nameNouns, nameHandles, colors, customColors };
})();
