let words = loadWords();

let progress =
    JSON.parse(
        localStorage.getItem(
            "linguaflow_progress"
        ) || "{}"
    );

let streak =
    Number(
        localStorage.getItem(
            "linguaflow_streak"
        ) || 0
    );

let lastPracticeDate =
    localStorage.getItem(
        "linguaflow_last_date"
    ) || "";


let selectedLevel = 1;

let quizWords = [];

let currentIndex = 0;

let currentWord = null;

let currentMode = null;

let sessionScore = 0;


const quotes = [
    "You don't need to learn everything today. Just don't stop.",
    "Small progress is still progress.",
    "Consistency beats motivation.",
    "One word today is one less word tomorrow.",
    "Practice smarter, not harder.",
    "Your future self will thank you.",
    "Keep showing up.",
    "You are building something every day."
];



/* =========================
   LEVEL SYSTEM
========================= */

function setLevel(level) {

    selectedLevel = level;


    const level1 =
        document.getElementById(
            "level1Btn"
        );

    const level2 =
        document.getElementById(
            "level2Btn"
        );


    level1.classList.toggle(
        "active",
        level === 1
    );

    level2.classList.toggle(
        "active",
        level === 2
    );


    document.getElementById(
        "levelTitle"
    ).textContent =
        `Level ${level}`;


    document.getElementById(
        "levelDescription"
    ).textContent =
        level === 1
            ? "Say it and listen"
            : "Understand the meaning";
}



/* =========================
   NAVIGATION
========================= */

function showPage(id) {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove(
                "active"
            );

        });


    document
        .getElementById(id)
        .classList.add("active");


    document
        .querySelectorAll(".nav-btn")
        .forEach(btn => {

            btn.classList.remove(
                "active"
            );

        });


    if (id === "homePage") {

        document
            .getElementById("navHome")
            .classList.add("active");

    }


    if (id === "quizPage") {

        document
            .getElementById("navPractice")
            .classList.add("active");

    }


    if (id === "wordsPage") {

        document
            .getElementById("navWords")
            .classList.add("active");

    }
}



/* =========================
   HOME
========================= */

function updateHome() {

    document.getElementById(
        "totalWords"
    ).textContent =
        words.length;


    let mastered = 0;

    let weak = 0;


    words.forEach(word => {

        const item =
            progress[
            word.chinese
            ];


        if (!item) return;


        if (item.correct >= 3) {
            mastered++;
        }


        if (
            item.wrong >
            item.correct
        ) {
            weak++;
        }

    });


    document.getElementById(
        "masteredWords"
    ).textContent =
        mastered;


    document.getElementById(
        "weakWords"
    ).textContent =
        weak;


    document.getElementById(
        "streak"
    ).textContent =
        streak;


    document.getElementById(
        "progressBar"
    ).style.width =
        Math.min(
            100,
            (
                mastered /
                Math.max(
                    words.length,
                    1
                )
            ) * 100
        ) + "%";


    const quote =
        quotes[
        new Date().getDate()
        % quotes.length
        ];


    document.getElementById(
        "quoteText"
    ).textContent =
        quote;
}



/* =========================
   START PRACTICE
========================= */

function startPractice() {

    if (words.length === 0) {

        alert(
            "Please add vocabulary first."
        );

        showPage("wordsPage");

        return;
    }


    let pool = [...words];


    pool.sort(
        () =>
            Math.random() - 0.5
    );


    const weak =
        pool.filter(word => {

            const item =
                progress[
                word.chinese
                ];


            if (!item) {
                return false;
            }


            return (
                item.wrong >
                item.correct
            );

        });


    const normal =
        pool.filter(
            word =>
                !weak.includes(word)
        );


    quizWords =
        [...weak, ...normal]
            .slice(0, 10);


    quizWords.sort(
        () =>
            Math.random() - 0.5
    );


    currentIndex = 0;

    sessionScore = 0;


    showPage("quizPage");

    loadQuestion();
}



/* =========================
   QUESTION
========================= */

function loadQuestion() {

    if (
        currentIndex >=
        quizWords.length
    ) {

        finishPractice();

        return;
    }


    currentWord =
        quizWords[
        currentIndex
        ];


    /*
        LEVEL 1

        1. Say it in Chinese
        2. Listen & Remember
    */

    if (selectedLevel === 1) {

        const level1Modes = [
            "meaningToChinese",
            "audioToMeaning"
        ];


        currentMode =
            level1Modes[
            Math.floor(
                Math.random() *
                level1Modes.length
            )
            ];

    }


    /*
        LEVEL 2

        What does this mean?
    */

    if (selectedLevel === 2) {

        currentMode =
            "chineseToMeaning";

    }


    const question =
        document.getElementById(
            "question"
        );


    const modeLabel =
        document.getElementById(
            "modeLabel"
        );


    const playButton =
        document.getElementById(
            "questionPlayButton"
        );


    const answer =
        document.getElementById(
            "answer"
        );


    const rating =
        document.getElementById(
            "rating"
        );


    const showButton =
        document.getElementById(
            "showAnswerBtn"
        );


    question.className =
        "question";


    answer.classList.remove(
        "show"
    );


    rating.classList.remove(
        "show"
    );


    showButton.style.display =
        "inline-block";


    playButton.classList.add(
        "hidden"
    );


    /*
        MODE 1
        SAY IT IN CHINESE
    */

    if (
        currentMode ===
        "meaningToChinese"
    ) {

        modeLabel.textContent =
            "Say it in Chinese";


        question.textContent =
            currentWord.meaning;


        question.classList.add(
            "myanmar"
        );

    }


    /*
        MODE 2
        LISTEN & REMEMBER
    */

    if (
        currentMode ===
        "audioToMeaning"
    ) {

        modeLabel.textContent =
            "Listen & Remember";


        question.textContent =
            "🔊";


        playButton.classList.remove(
            "hidden"
        );


        /*
            Automatically plays once.
            User can replay anytime.
        */

        setTimeout(
            () => {
                playCurrentAudio();
            },
            500
        );

    }


    /*
        LEVEL 2
        WHAT DOES THIS MEAN?
    */

    if (
        currentMode ===
        "chineseToMeaning"
    ) {

        modeLabel.textContent =
            "What does this mean?";


        question.textContent =
            currentWord.chinese;


        playButton.classList.remove(
            "hidden"
        );

    }


    document.getElementById(
        "questionNumber"
    ).textContent =
        currentIndex + 1;


    document.getElementById(
        "questionTotal"
    ).textContent =
        quizWords.length;


    document.getElementById(
        "quizMode"
    ).textContent =
        `Level ${selectedLevel}`;


    document.getElementById(
        "quizProgress"
    ).style.width =
        (
            currentIndex /
            quizWords.length *
            100
        ) + "%";
}



/* =========================
   SHOW ANSWER
========================= */

function showAnswer() {

    document.getElementById(
        "answerChinese"
    ).textContent =
        currentWord.chinese;


    document.getElementById(
        "answerPinyin"
    ).textContent =
        currentWord.pinyin;


    document.getElementById(
        "answerMeaning"
    ).textContent =
        currentWord.meaning;


    document
        .getElementById("answer")
        .classList.add("show");


    document
        .getElementById("rating")
        .classList.add("show");


    document
        .getElementById(
            "showAnswerBtn"
        )
        .style.display =
        "none";


    /*
        Replay is available
        after answer is shown too.
    */

    document
        .getElementById(
            "questionPlayButton"
        )
        .classList.remove(
            "hidden"
        );
}



/* =========================
   RATE ANSWER
========================= */

function rateAnswer(
    isCorrect
) {

    const key =
        currentWord.chinese;


    if (!progress[key]) {

        progress[key] = {
            correct: 0,
            wrong: 0
        };

    }


    if (isCorrect) {

        progress[key].correct++;

        sessionScore++;

    } else {

        progress[key].wrong++;

    }


    localStorage.setItem(
        "linguaflow_progress",
        JSON.stringify(
            progress
        )
    );


    currentIndex++;

    loadQuestion();
}



/* =========================
   AUDIO
========================= */

function playCurrentAudio() {

    if (!currentWord) {
        return;
    }


    const text =
        currentWord.chinese;


    const googleTTS =
        "https://translate.google.com/translate_tts" +
        "?ie=UTF-8" +
        "&q=" +
        encodeURIComponent(text) +
        "&tl=zh-CN" +
        "&client=tw-ob";


    const audio =
        new Audio(
            googleTTS
        );


    audio.play()
        .catch(() => {

            browserSpeak(
                text
            );

        });
}



/*
    Browser fallback
*/

function browserSpeak(
    text
) {

    if (
        !(
            "speechSynthesis"
            in window
        )
    ) {
        return;
    }


    speechSynthesis.cancel();


    const utterance =
        new SpeechSynthesisUtterance(
            text
        );


    utterance.lang =
        "zh-CN";


    utterance.rate =
        0.78;


    utterance.pitch =
        1;


    speechSynthesis.speak(
        utterance
    );
}



/* =========================
   FINISH
========================= */

function finishPractice() {

    document.getElementById(
        "finalScore"
    ).textContent =
        sessionScore;


    document.getElementById(
        "finalTotal"
    ).textContent =
        quizWords.length;


    let message;


    /*
        10 / 10
    */

    if (
        sessionScore ===
        quizWords.length
    ) {

        message =
            "ပုလဲလေးကတော်လိုက်တာ ဘာမုန့်စားမလဲ";

    }


    /*
        5 - 9
    */

    else if (
        sessionScore >= 5
    ) {

        message =
            "မဆိုးပါဖူး မေ့နေတာတွေပြန်ကျက်အုန်း";

    }


    /*
        0 - 4
    */

    else {

        message =
            "ပြန်ကျက်အုန်း";

    }


    document.getElementById(
        "finalMessage"
    ).textContent =
        message;


    updateStreak();

    updateHome();

    showPage(
        "completePage"
    );
}



/* =========================
   STREAK
========================= */

function updateStreak() {

    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    if (
        lastPracticeDate ===
        today
    ) {
        return;
    }


    if (lastPracticeDate) {

        const previous =
            new Date(
                lastPracticeDate
            );


        const current =
            new Date(today);


        const difference =
            Math.round(
                (
                    current -
                    previous
                ) /
                (
                    1000 *
                    60 *
                    60 *
                    24
                )
            );


        if (
            difference === 1
        ) {

            streak++;

        } else {

            streak = 1;

        }

    } else {

        streak = 1;

    }


    lastPracticeDate =
        today;


    localStorage.setItem(
        "linguaflow_streak",
        streak
    );


    localStorage.setItem(
        "linguaflow_last_date",
        lastPracticeDate
    );
}



/* =========================
   WORD MANAGEMENT
========================= */

function loadWords() {

    const saved =
        localStorage.getItem(
            "linguaflow_words"
        );


    if (saved) {

        try {

            return JSON.parse(
                saved
            );

        } catch (error) {

            return [
                ...WORD_DATA
            ];

        }

    }


    return [
        ...WORD_DATA
    ];
}



function renderWords() {

    const container =
        document.getElementById(
            "wordList"
        );


    container.innerHTML = "";


    words.forEach(
        (
            word,
            index
        ) => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "word-item";


            item.innerHTML = `

                <div>

                    <div class="word-chinese">
                        ${escapeHTML(
                word.chinese
            )}
                    </div>

                    <div class="word-info">
                        ${escapeHTML(
                word.pinyin
            )}
                        ·
                        ${escapeHTML(
                word.meaning
            )}
                    </div>

                </div>


                <button
                    class="delete-btn"
                    onclick="deleteWord(${index})"
                >
                    ×
                </button>

            `;


            container.appendChild(
                item
            );

        }
    );
}



function addWord() {

    const chinese =
        document.getElementById(
            "inputChinese"
        )
            .value
            .trim();


    const pinyin =
        document.getElementById(
            "inputPinyin"
        )
            .value
            .trim();


    const meaning =
        document.getElementById(
            "inputMeaning"
        )
            .value
            .trim();


    if (
        !chinese ||
        !pinyin ||
        !meaning
    ) {

        alert(
            "Please complete all fields."
        );

        return;
    }


    words.push({
        chinese,
        pinyin,
        meaning
    });


    saveWords();


    document.getElementById(
        "inputChinese"
    ).value = "";


    document.getElementById(
        "inputPinyin"
    ).value = "";


    document.getElementById(
        "inputMeaning"
    ).value = "";


    renderWords();

    updateHome();
}



function deleteWord(
    index
) {

    words.splice(
        index,
        1
    );


    saveWords();

    renderWords();

    updateHome();
}



function saveWords() {

    localStorage.setItem(
        "linguaflow_words",
        JSON.stringify(
            words
        )
    );
}



function resetData() {

    if (
        !confirm(
            "Reset all vocabulary data?"
        )
    ) {
        return;
    }


    localStorage.removeItem(
        "linguaflow_words"
    );


    words = [
        ...WORD_DATA
    ];


    renderWords();

    updateHome();
}



function escapeHTML(
    text
) {

    const element =
        document.createElement(
            "div"
        );


    element.textContent =
        text;


    return element.innerHTML;
}



/* =========================
   INIT
========================= */

setLevel(1);

renderWords();

updateHome();