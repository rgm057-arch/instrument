/* ===================================================
   SCENARIOS.JS — Six Pack Scenario Definitions
   Each scenario defines start + end states for all
   6 instruments, a question, 4 answers, and an
   explanation shown after answering.

   Instrument state keys:
     asi:  { airspeed }       — knots
     ai:   { pitch, bank }    — degrees (pitch+ = nose up, bank+ = right wing down)
     alt:  { altitude }       — feet
     tc:   { turnRate, ballOffset }  — °/sec, -1..+1
     di:   { heading }        — degrees 0-360 magnetic
     vsi:  { vspeed }         — ft/min
   =================================================== */

window.SCENARIOS = [

    // --------------------------------------------------
    // 1. STRAIGHT AND LEVEL CRUISE
    // --------------------------------------------------
    {
        id: 'straight-level',
        name: 'Straight and Level Cruise',
        question: 'What flight condition do these instruments indicate?',
        answers: [
            { text: 'Straight and level flight at cruise altitude', correct: true },
            { text: 'Shallow climbing turn to the left', correct: false },
            { text: 'Descending toward pattern altitude', correct: false },
            { text: 'Level right turn at cruise speed', correct: false }
        ],
        explanation: 'All instruments are stable and consistent. The AI shows level wings and a slight nose-up cruise attitude (~2°). Airspeed is steady in the green arc. Altimeter is not moving. VSI reads zero. DI heading is constant. This is the classic picture of straight and level flight.',
        instruments: {
            asi: { start: { airspeed: 120 }, end: { airspeed: 120 } },
            ai:  { start: { pitch: 2, bank: 0 }, end: { pitch: 2, bank: 0 } },
            alt: { start: { altitude: 5500 }, end: { altitude: 5500 } },
            tc:  { start: { turnRate: 0, ballOffset: 0 }, end: { turnRate: 0, ballOffset: 0 } },
            di:  { start: { heading: 270 }, end: { heading: 270 } },
            vsi: { start: { vspeed: 0 }, end: { vspeed: 0 } }
        }
    },

    // --------------------------------------------------
    // 2. CLIMBING LEFT TURN
    // --------------------------------------------------
    {
        id: 'climbing-left-turn',
        name: 'Climbing Left Turn',
        question: 'What maneuver is being performed?',
        answers: [
            { text: 'Straight climb with power increase', correct: false },
            { text: 'Climbing left turn', correct: true },
            { text: 'Descending right turn', correct: false },
            { text: 'Level coordinated left turn', correct: false }
        ],
        explanation: 'The AI shows nose-high pitch (~8°) and left bank (~20°). Airspeed is decreasing as energy is being converted to altitude. The altimeter is rising, VSI shows a 700 ft/min climb, and the DI heading is turning left. The turn coordinator ball is centered — coordinated flight.',
        instruments: {
            asi: { start: { airspeed: 120 }, end: { airspeed: 95 } },
            ai:  { start: { pitch: 2,  bank: 0  }, end: { pitch: 8,  bank: -20 } },
            alt: { start: { altitude: 4800 }, end: { altitude: 5100 } },
            tc:  { start: { turnRate: 0,  ballOffset: 0 }, end: { turnRate: -3, ballOffset: 0 } },
            di:  { start: { heading: 270 }, end: { heading: 252 } },
            vsi: { start: { vspeed: 100 }, end: { vspeed: 700 } }
        }
    },

    // --------------------------------------------------
    // 3. DESCENDING RIGHT TURN
    // --------------------------------------------------
    {
        id: 'descending-right-turn',
        name: 'Descending Right Turn',
        question: 'What maneuver is being performed?',
        answers: [
            { text: 'Climbing right turn', correct: false },
            { text: 'Level right turn with speed reduction', correct: false },
            { text: 'Descending right turn', correct: true },
            { text: 'Straight descent with right crosswind correction', correct: false }
        ],
        explanation: 'The AI shows a nose-low attitude (~5° below horizon) and right bank (~25°). Airspeed is increasing as the nose drops — gravity adds a forward component. The altimeter is falling, VSI is negative (~600 ft/min down), and the DI shows a heading change to the right.',
        instruments: {
            asi: { start: { airspeed: 120 }, end: { airspeed: 145 } },
            ai:  { start: { pitch: 2,  bank: 0  }, end: { pitch: -5, bank: 25  } },
            alt: { start: { altitude: 5500 }, end: { altitude: 5200 } },
            tc:  { start: { turnRate: 0,  ballOffset: 0 }, end: { turnRate: 3,  ballOffset: 0 } },
            di:  { start: { heading: 90  }, end: { heading: 108 } },
            vsi: { start: { vspeed: -50 }, end: { vspeed: -600 } }
        }
    },

    // --------------------------------------------------
    // 4. IMPENDING STALL
    // --------------------------------------------------
    {
        id: 'impending-stall',
        name: 'Impending Stall',
        question: 'What dangerous condition do these instruments indicate?',
        answers: [
            { text: 'Normal slow flight in the landing configuration', correct: false },
            { text: 'Impending aerodynamic stall', correct: true },
            { text: 'Power-off glide at best glide speed', correct: false },
            { text: 'Steep turning climb', correct: false }
        ],
        explanation: 'Airspeed has dropped into the bottom of the white arc (~52 kts) — below the bottom of the green arc (stall approach). The AI shows an extreme nose-high attitude (~18°). The VSI has flipped from a positive climb to negative, signaling the wing is no longer generating lift. This is an impending stall — immediate recovery action required.',
        instruments: {
            asi: { start: { airspeed: 75  }, end: { airspeed: 52  } },
            ai:  { start: { pitch: 10, bank: 0  }, end: { pitch: 18, bank: -3  } },
            alt: { start: { altitude: 3200 }, end: { altitude: 3350 } },
            tc:  { start: { turnRate: 0,  ballOffset: 0   }, end: { turnRate: -1, ballOffset: 0.2 } },
            di:  { start: { heading: 180 }, end: { heading: 178 } },
            vsi: { start: { vspeed: 300 }, end: { vspeed: -100 } }
        }
    },

    // --------------------------------------------------
    // 5. STEEP SPIRAL DIVE (UNUSUAL ATTITUDE)
    // --------------------------------------------------
    {
        id: 'steep-spiral-dive',
        name: 'Steep Spiral Dive',
        question: 'What emergency situation is developing?',
        answers: [
            { text: 'Steep spiral dive — immediate unusual attitude recovery required', correct: true },
            { text: 'Normal steep 60° bank turn', correct: false },
            { text: 'Power dive with level wings', correct: false },
            { text: 'Stabilized descent at high speed', correct: false }
        ],
        explanation: 'This is a graveyard spiral — the most dangerous unusual attitude. Bank is extreme (~65°) with a nose-low pitch. Airspeed is rapidly increasing toward the yellow arc and Vne (red line). Altimeter is dropping very fast and VSI is near -2000 ft/min. The DI shows rapid heading change. Recovery: level the wings first (AI), then gently pull out of the dive. Never just pull back with extreme bank — it will tighten the spiral.',
        instruments: {
            asi: { start: { airspeed: 130 }, end: { airspeed: 178 } },
            ai:  { start: { pitch: -5,  bank: 35 }, end: { pitch: -15, bank: 65  } },
            alt: { start: { altitude: 6000 }, end: { altitude: 5400 } },
            tc:  { start: { turnRate: 5,  ballOffset: 0.4 }, end: { turnRate: 9,  ballOffset: 0.8 } },
            di:  { start: { heading: 45  }, end: { heading: 90  } },
            vsi: { start: { vspeed: -800 }, end: { vspeed: -2000 } }
        }
    },

    // --------------------------------------------------
    // 6. STABILIZED GLIDE — ENGINE FAILURE
    // --------------------------------------------------
    {
        id: 'stabilized-glide',
        name: 'Stabilized Glide — Engine Failure',
        question: 'What scenario does this instrument picture indicate?',
        answers: [
            { text: 'Normal powered descent for landing', correct: false },
            { text: 'Engine failure — stabilized best-glide descent', correct: true },
            { text: 'Approach to stall in landing configuration', correct: false },
            { text: 'Cruise descent with reduced power', correct: false }
        ],
        explanation: 'Airspeed has settled to ~78 kts — typical best-glide speed for a training aircraft. The AI shows a slight nose-down, wings-level attitude. Altimeter is slowly decreasing. VSI is steady between 500-800 ft/min down — consistent with glide performance. The DI heading is constant — no turn. The ball is centered. This is a pilot flying best-glide speed following engine failure.',
        instruments: {
            asi: { start: { airspeed: 95  }, end: { airspeed: 78  } },
            ai:  { start: { pitch: 0, bank: 0 }, end: { pitch: -3, bank: 0 } },
            alt: { start: { altitude: 4500 }, end: { altitude: 4340 } },
            tc:  { start: { turnRate: 0, ballOffset: 0 }, end: { turnRate: 0, ballOffset: 0 } },
            di:  { start: { heading: 360 }, end: { heading: 360 } },
            vsi: { start: { vspeed: -150 }, end: { vspeed: -650 } }
        }
    }

];

// Number of scenarios to present per training session
// Increase to 30 (or SCENARIOS.length) when more scenarios are added
window.QUIZ_LENGTH = window.SCENARIOS.length;
