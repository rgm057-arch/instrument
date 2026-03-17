/* ===================================================
   APP.JS — Six Pack Instrument Trainer
   Quiz state machine, animation controller, scoring
   =================================================== */

// ---------------------------------------------------
// Math helpers
// ---------------------------------------------------

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function lerpHeading(a, b, t) {
    let diff = b - a;
    if (diff > 180)  diff -= 360;
    if (diff < -180) diff += 360;
    return ((a + diff * t) + 360) % 360;
}

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// ---------------------------------------------------
// DOM refs
// ---------------------------------------------------

const dom = {
    // Screens
    introScreen:    document.getElementById('intro-screen'),
    trainerPanel:   document.getElementById('trainer-panel'),
    questionPanel:  document.getElementById('question-panel'),
    feedbackPanel:  document.getElementById('feedback-panel'),
    completeScreen: document.getElementById('complete-screen'),

    // Header
    scenarioCounter: document.getElementById('scenario-counter'),
    scoreTracker:    document.getElementById('score-tracker'),
    statusText:      document.getElementById('status-text'),

    // Progress
    progressFill: document.getElementById('progress-fill'),

    // Question
    questionText: document.getElementById('question-text'),
    answerGrid:   document.getElementById('answer-grid'),

    // Feedback
    feedbackIcon:        document.getElementById('feedback-icon'),
    feedbackResult:      document.getElementById('feedback-result'),
    feedbackExplanation: document.getElementById('feedback-explanation'),
    btnNext:             document.getElementById('btn-next'),

    // Complete
    finalScore: document.getElementById('final-score'),
    finalGrade: document.getElementById('final-grade'),

    // Buttons
    btnStart: document.getElementById('btn-start'),
    btnRetry: document.getElementById('btn-retry'),

    // SVG elements
    svgASI: document.getElementById('svg-asi'),
    svgAI:  document.getElementById('svg-ai'),
    svgALT: document.getElementById('svg-alt'),
    svgTC:  document.getElementById('svg-tc'),
    svgDI:  document.getElementById('svg-di'),
    svgVSI: document.getElementById('svg-vsi'),
};

// ---------------------------------------------------
// Screen Management
// ---------------------------------------------------

const screens = [
    dom.introScreen,
    dom.trainerPanel,
    dom.questionPanel,
    dom.feedbackPanel,
    dom.completeScreen
];

function showOnly(...active) {
    screens.forEach(s => s.classList.add('hidden'));
    active.forEach(s => s.classList.remove('hidden'));
}

// ---------------------------------------------------
// Instrument initialization
// ---------------------------------------------------

const instruments = {};

function initInstruments() {
    instruments.asi = new window.Instruments.ASI(dom.svgASI);
    instruments.ai  = new window.Instruments.AI(dom.svgAI);
    instruments.alt = new window.Instruments.ALT(dom.svgALT);
    instruments.tc  = new window.Instruments.TC(dom.svgTC);
    instruments.di  = new window.Instruments.DI(dom.svgDI);
    instruments.vsi = new window.Instruments.VSI(dom.svgVSI);

    for (const inst of Object.values(instruments)) {
        inst.init();
    }
}

// ---------------------------------------------------
// State interpolation
// ---------------------------------------------------

function interpolateState(scenario, t) {
    const result = {};
    for (const key of ['asi', 'ai', 'alt', 'tc', 'di', 'vsi']) {
        result[key] = {};
        const s = scenario.instruments[key].start;
        const e = scenario.instruments[key].end;
        for (const prop of Object.keys(s)) {
            if (prop === 'heading') {
                result[key][prop] = lerpHeading(s[prop], e[prop], t);
            } else {
                result[key][prop] = lerp(s[prop], e[prop], t);
            }
        }
    }
    return result;
}

// ---------------------------------------------------
// Animation Controller
// ---------------------------------------------------

const ANIM_DURATION = 3000; // ms

class AnimationController {
    constructor() {
        this.rafId = null;
        this.startTime = null;
        this.scenario = null;
        this.onComplete = null;
    }

    start(scenario, onComplete) {
        this.stop();
        this.scenario = scenario;
        this.onComplete = onComplete;
        this.startTime = performance.now();
        dom.progressFill.style.width = '0%';
        this.rafId = requestAnimationFrame(ts => this._tick(ts));
    }

    _tick(timestamp) {
        const elapsed = timestamp - this.startTime;
        const rawT = Math.min(elapsed / ANIM_DURATION, 1.0);
        const t = easeInOut(rawT);

        // Update all instruments
        const state = interpolateState(this.scenario, t);
        for (const key of ['asi', 'ai', 'alt', 'tc', 'di', 'vsi']) {
            instruments[key].render(state[key]);
        }

        // Update progress bar (use rawT for linear bar fill)
        dom.progressFill.style.width = (rawT * 100) + '%';

        if (rawT < 1.0) {
            this.rafId = requestAnimationFrame(ts => this._tick(ts));
        } else {
            this.rafId = null;
            if (this.onComplete) this.onComplete();
        }
    }

    stop() {
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }
}

// ---------------------------------------------------
// Score Tracker
// ---------------------------------------------------

class ScoreTracker {
    constructor() { this.reset(); }

    reset() {
        this.correct = 0;
        this.total = 0;
        this.history = [];
    }

    record(scenarioId, isCorrect) {
        this.total++;
        if (isCorrect) this.correct++;
        this.history.push({ scenarioId, isCorrect });
        this._updateDisplay();
    }

    _updateDisplay() {
        dom.scoreTracker.textContent = `${this.correct} / ${this.total}`;
    }

    get percentage() {
        return this.total ? Math.round(100 * this.correct / this.total) : 0;
    }

    gradeText() {
        const p = this.percentage;
        if (p === 100) return 'Perfect — Instrument Proficient';
        if (p >= 83)  return 'Excellent — Above Minimums';
        if (p >= 66)  return 'Good — Continue Training';
        if (p >= 50)  return 'Marginal — Review Needed';
        return 'Unsatisfactory — Ground Study Required';
    }
}

// ---------------------------------------------------
// Quiz Controller
// ---------------------------------------------------

class QuizController {
    constructor() {
        this.scenarios = [];
        this.currentIndex = 0;
        this.animCtrl = new AnimationController();
        this.score = new ScoreTracker();
        this.questionStartTime = 0;
    }

    start() {
        this.score.reset();
        this.scenarios = shuffle([...window.SCENARIOS]).slice(0, window.QUIZ_LENGTH);
        this.currentIndex = 0;
        this._loadScenario();
    }

    _loadScenario() {
        const scenario = this.scenarios[this.currentIndex];

        // Update header
        dom.scenarioCounter.textContent = `${this.currentIndex + 1} / ${this.scenarios.length}`;
        dom.scoreTracker.textContent = `${this.score.correct} / ${this.score.total}`;

        // Snap instruments to start state
        for (const key of ['asi', 'ai', 'alt', 'tc', 'di', 'vsi']) {
            instruments[key].setState(scenario.instruments[key].start);
        }
        dom.progressFill.style.width = '0%';
        dom.statusText.textContent = 'Observe the instruments...';

        showOnly(dom.trainerPanel);

        // Brief pause at start state so user can orient, then animate
        setTimeout(() => {
            dom.statusText.textContent = 'Watch carefully — 3 seconds...';
            this.animCtrl.start(scenario, () => {
                // Animation complete — instruments frozen at end state
                dom.statusText.textContent = 'Instruments frozen. What happened?';
                dom.progressFill.style.width = '100%';
                setTimeout(() => this._showQuestion(scenario), 400);
            });
        }, 600);
    }

    _showQuestion(scenario) {
        dom.questionText.textContent = scenario.question;

        // Build shuffled answer buttons (shuffle answers so correct isn't always same position)
        const shuffledAnswers = shuffle(scenario.answers.map((a, i) => ({ ...a, origIdx: i })));
        const letters = ['A', 'B', 'C', 'D'];

        dom.answerGrid.innerHTML = '';
        shuffledAnswers.forEach((answer, i) => {
            const btn = document.createElement('button');
            btn.className = 'answer-btn';
            btn.innerHTML = `<span class="answer-letter">${letters[i]}</span>${answer.text}`;
            btn.addEventListener('click', () => this._submitAnswer(scenario, answer.correct, shuffledAnswers, btn));
            dom.answerGrid.appendChild(btn);
        });

        this.questionStartTime = Date.now();
        showOnly(dom.trainerPanel, dom.questionPanel);
    }

    _submitAnswer(scenario, isCorrect, allAnswers, clickedBtn) {
        // Disable all buttons
        const allBtns = dom.answerGrid.querySelectorAll('.answer-btn');
        allBtns.forEach(b => {
            b.disabled = true;
            b.style.pointerEvents = 'none';
        });

        // Mark clicked button and reveal correct answer
        clickedBtn.classList.add(isCorrect ? 'correct' : 'wrong');
        if (!isCorrect) {
            // Highlight the correct answer
            allBtns.forEach((b, i) => {
                if (allAnswers[i] && allAnswers[i].correct) {
                    b.classList.add('correct');
                }
            });
        }

        this.score.record(scenario.id, isCorrect);

        // Show feedback after brief pause
        setTimeout(() => this._showFeedback(scenario, isCorrect), 500);
    }

    _showFeedback(scenario, isCorrect) {
        dom.feedbackIcon.textContent = isCorrect ? '✓' : '✗';
        dom.feedbackResult.textContent = isCorrect ? 'Correct!' : 'Incorrect';
        dom.feedbackResult.className = isCorrect ? 'correct' : 'wrong';
        dom.feedbackExplanation.textContent = scenario.explanation;

        const isLast = this.currentIndex >= this.scenarios.length - 1;
        dom.btnNext.textContent = isLast ? 'View Results →' : 'Next Scenario →';

        showOnly(dom.trainerPanel, dom.feedbackPanel);
    }

    next() {
        this.currentIndex++;
        if (this.currentIndex >= this.scenarios.length) {
            this._showComplete();
        } else {
            this._loadScenario();
        }
    }

    _showComplete() {
        dom.finalScore.textContent = `${this.score.correct} / ${this.score.total}`;
        dom.finalGrade.textContent = this.score.gradeText();
        showOnly(dom.completeScreen);
    }
}

// ---------------------------------------------------
// App Bootstrap
// ---------------------------------------------------

let quiz;

document.addEventListener('DOMContentLoaded', () => {
    initInstruments();

    // Set initial instrument positions on intro (for visual flair — optional neutral state)
    const neutral = {
        asi: { airspeed: 0 },
        ai:  { pitch: 0, bank: 0 },
        alt: { altitude: 0 },
        tc:  { turnRate: 0, ballOffset: 0 },
        di:  { heading: 360 },
        vsi: { vspeed: 0 }
    };
    for (const key of ['asi', 'ai', 'alt', 'tc', 'di', 'vsi']) {
        instruments[key].setState(neutral[key]);
    }

    quiz = new QuizController();

    // Wire buttons
    dom.btnStart.addEventListener('click', () => {
        showOnly(dom.trainerPanel);
        quiz.start();
    });

    dom.btnNext.addEventListener('click', () => {
        quiz.next();
    });

    dom.btnRetry.addEventListener('click', () => {
        quiz.start();
    });
});
