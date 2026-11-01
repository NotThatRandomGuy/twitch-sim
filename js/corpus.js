// Jitter — chat corpus (stage 1: ported from the original simulator; replaced by a much
// larger, categorised corpus in stage 2).
window.JitterCorpus = {
    nameBases: ["PixelPilot", "GhostMode", "NovaKnight", "VibeCheck", "TurboToast", "ChatChampion"],
    emotes: {
        "KEKW": "😂", "LUL": "😆", "OMEGALUL": "🤣", "Pog": "😮", "PogChamp": "😮", "POGGERS": "😲", "monkaS": "😰",
        "Sadge": "😢", "PepeHands": "😭", "Kappa": "😏", "EZ": "😎", "5Head": "🧠", "Pepega": "🤪", "catJAM": "🐱",
        "peepoClap": "👏", "FeelsGoodMan": "😊", "FeelsBadMan": "😞", "GIGACHAD": "🗿", "Prayge": "🙏", "HUH": "🤨",
        "Clueless": "🙂", "Bedge": "😴", "modCheck": "👀", "NODDERS": "🙆", "NOPERS": "🙅", "D:": "😨", "YEP": "👍",
        "Jebaited": "🎣", "BibleThump": "😢", "DansGame": "🤢", "NotLikeThis": "🤦", "ResidentSleeper": "😴",
        "SeemsGood": "👍", "4Head": "😁", "HeyGuys": "👋", "VoHiYo": "🙌", "PauseChamp": "😶", "Copium": "🫠",
        "Okayge": "🙂", "Susge": "🧐", "widepeepoHappy": "😄", "PETTHEMODS": "🤚", "WICKED": "😈", "Hmm": "🤔",
        "jitterHype": "🔥", "jitterLove": "💚", "jitterGG": "🏆", "jitterRIP": "💀", "jitterW": "🇼", "jitterL": "🇱"
    },
    chatThoughts: {
        reactions: [
            "that was actually so clean", "the confidence is back", "that timing was ridiculous", "okay that was a huge brain play",
            "wait that worked??", "the recovery was kind of insane", "this is the content i came here for", "we are so back",
            "that was way too close for no reason", "the patience there was beautiful", "i thought that was chalked", "that was a free clip",
            "you are locked in today", "the read was perfect", "my heart stopped for a second", "that was the most stressful ten seconds ever",
            "the vibes are immaculate tonight", "that play changed the whole game", "this run is getting serious", "that was a certified gamer moment",
            "no notes honestly", "how did you even see that", "the comeback arc is real", "i need that replay immediately",
            "you made that look way easier than it was", "chat witnessed history", "that was such a good adjustment", "the crowd goes wild"
        ],
        thoughts: [
            "i have snacks ready for the rest of this stream", "why is this somehow more stressful than my own games", "i looked away for one second and missed everything",
            "this is exactly why i never uninstall this game", "my wifi could never handle a moment like that", "i would have folded instantly there",
            "the soundtrack in my head is getting dramatic", "someone clip the last minute please", "i am pretending i knew that was the plan",
            "this stream is carrying my entire evening", "my dog is judging me for yelling at the screen", "i need a hydration check after that",
            "the chat delay makes these moments ten times funnier", "this is better than anything i had planned tonight", "my keyboard would have been in danger there",
            "i can feel the panic through the screen", "this is why i watch live instead of highlights", "the amount of trust i have in this play is concerning",
            "that was the exact opposite of how my last match went", "i am seated for the next round", "the energy in here is so good",
            "i missed the beginning but i picked a great time to arrive", "not me holding my breath at my desk", "this game always finds a new way to surprise me",
            "the group chat is about to hear about this", "that would have ended my stream personally", "i am learning so much and retaining none of it",
            "this has been such a fun watch", "the emotional damage would have been permanent", "i respect the commitment to the bit"
        ],
        suggestions: [
            "maybe slow it down a little on the next push", "save that play for when they least expect it", "try holding that angle for one more second",
            "you should absolutely run that strategy back", "honestly the patient route looks better here", "check the other side before you commit",
            "do one warmup round after this and you will be unstoppable", "take the safe reset and make them come to you", "i vote for the risky play tbh",
            "keep the pressure on them now", "you could bait them into that same mistake again", "wait for the cooldown before the next fight",
            "do not let chat convince you to throw this", "one more round and then a snack break", "try the weird route just for science",
            "that setup is working so well keep using it", "play your own pace and make them chase you", "we need the tactical pause",
            "i think the high ground is the move here", "save the big play for the final round", "just trust your first instinct",
            "someone remind them to reload", "go for it chat believes", "play boring and secure the win", "the next move should be maximum chaos",
            "take a breath you have plenty of time", "please do the thing you were talking about earlier", "that flank would be so funny right now",
            "use the momentum while they are tilted", "i think chat has collectively decided on the left side"
        ],
        roasts: [
            "that aim took the scenic route", "respectfully the controller disconnected for a second", "the crosshair was sightseeing", "we are calling that a warning shot",
            "the confidence was there and that is what matters", "that wall is your biggest fan", "the plan was amazing until the last two seconds",
            "i have seen loading screens with more urgency", "the button press had good intentions", "chat please pretend we did not see that",
            "the opponent owes you a thank you card", "that was a very creative way to miss", "the panic was visible from space",
            "the map is winning the mental battle", "we blame lag and move on", "that was not a misplay that was a content decision",
            "the respawn screen is getting familiar", "someone put the tutorial back on just for a second", "the universe said not today",
            "i admire the commitment to making this interesting", "that was almost unbelievably almost", "the game heard you talking trash",
            "the mechanics are on lunch break", "that was a bold choice and i support it", "the next one is definitely landing"
        ]
    },
    raidThoughts: [
        "raid party has arrived hey everyone", "hello from the raid we brought snacks and good vibes", "our streamer sent us over and the timing is perfect",
        "raiders checking in this stream is already so fun", "we just got here and chat is already unhinged i love it", "the raid train has parked here",
        "coming in hot from the raid what did we miss", "our whole crew is here now lets go", "the raid party chose a great stream to land in",
        "hi new chat this is such a cozy vibe", "we followed the raid and immediately got a clutch play", "raiders are seated",
        "sending love from the other channel keep cooking", "the raid crew is ready for maximum chaos", "we were told there would be good gameplay",
        "hello hello the raid has entered the building", "new here from the raid but already invested", "we brought hype not pressure probably",
        "this is the smoothest raid landing ever", "the raid party is clipping that one", "we heard the vibes were good and they were right",
        "our streamer passed the torch and we are here for it", "raid squad reporting for duty", "the chat move was seamless wow",
        "came from the raid and instantly understood the hype", "we are all cheering from the raid side", "the raid sent me and now i am staying",
        "hello from the raid please continue doing exactly that", "raiders in chat say hi", "we arrived just in time for the good part",
        "the raid crew has collectively decided this is our new favorite moment", "we came for the raid and stayed for the chaos",
        "warm welcome from the raid party", "raid energy activated", "we were not ready for that play but here we are",
        "the whole raid chat is nodding in approval", "great raid destination 10 out of 10", "new viewers from the raid sending all the luck",
        "we made it over safely and the vibes are immaculate", "raid squad is locked in now"
    ]
};
