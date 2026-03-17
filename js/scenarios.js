/* ===================================================
   SCENARIOS.JS — Six Pack Scenario Definitions
   30 real-world scenarios, randomized each session.

   Instrument state keys:
     asi:  { airspeed }               — knots
     ai:   { pitch, bank }            — degrees (pitch+ = nose up, bank+ = right wing down)
     alt:  { altitude }               — feet
     tc:   { turnRate, ballOffset }   — °/sec, -1..+1
     di:   { heading }                — degrees 0-360 magnetic
     vsi:  { vspeed }                 — ft/min
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
            ai:  { start: { pitch: 2,  bank: 0  }, end: { pitch: 2,  bank: 0  } },
            alt: { start: { altitude: 5500 }, end: { altitude: 5500 } },
            tc:  { start: { turnRate: 0,  ballOffset: 0 }, end: { turnRate: 0,  ballOffset: 0 } },
            di:  { start: { heading: 270 }, end: { heading: 270 } },
            vsi: { start: { vspeed: 0   }, end: { vspeed: 0   } }
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
            asi: { start: { airspeed: 120 }, end: { airspeed: 95  } },
            ai:  { start: { pitch: 2,  bank: 0   }, end: { pitch: 8,  bank: -20 } },
            alt: { start: { altitude: 4800 }, end: { altitude: 5100 } },
            tc:  { start: { turnRate: 0,  ballOffset: 0 }, end: { turnRate: -3, ballOffset: 0  } },
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
            tc:  { start: { turnRate: 0,  ballOffset: 0 }, end: { turnRate: 3,  ballOffset: 0  } },
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
            { text: 'Normal slow flight in landing configuration', correct: false },
            { text: 'Impending aerodynamic stall', correct: true },
            { text: 'Power-off glide at best glide speed', correct: false },
            { text: 'Steep turning climb', correct: false }
        ],
        explanation: 'Airspeed has dropped into the bottom of the white arc (~52 kts) — below the green arc. The AI shows an extreme nose-high attitude (~18°). The VSI has flipped from a positive climb to negative, signaling the wing is losing lift. This is an impending stall — immediate recovery required.',
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
        explanation: 'This is a graveyard spiral — the most dangerous unusual attitude. Bank is extreme (~65°) with a nose-low pitch. Airspeed is rapidly increasing toward Vne (red line). Altimeter is dropping very fast and VSI is pegged near -2000 ft/min. Recovery: level the wings first, THEN gently ease back pressure. Never just pull back in a steep bank — it tightens the spiral.',
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
        explanation: 'Airspeed has settled to ~78 kts — typical best-glide speed for a training aircraft. The AI shows a slight nose-down, wings-level attitude. Altimeter is slowly decreasing. VSI is steady between 500-800 ft/min down. The DI heading is constant — no turn. This is a pilot flying best-glide speed following engine failure.',
        instruments: {
            asi: { start: { airspeed: 95  }, end: { airspeed: 78  } },
            ai:  { start: { pitch: 0,  bank: 0 }, end: { pitch: -3, bank: 0 } },
            alt: { start: { altitude: 4500 }, end: { altitude: 4340 } },
            tc:  { start: { turnRate: 0, ballOffset: 0 }, end: { turnRate: 0, ballOffset: 0 } },
            di:  { start: { heading: 360 }, end: { heading: 360 } },
            vsi: { start: { vspeed: -150 }, end: { vspeed: -650 } }
        }
    },

    // --------------------------------------------------
    // 7. LEVEL LEFT STANDARD RATE TURN
    // --------------------------------------------------
    {
        id: 'level-left-standard',
        name: 'Level Left Standard Rate Turn',
        question: 'What is happening here?',
        answers: [
            { text: 'Level coordinated left turn at standard rate', correct: true },
            { text: 'Climbing left turn', correct: false },
            { text: 'Descending left turn', correct: false },
            { text: 'Slipping left turn — ball displaced', correct: false }
        ],
        explanation: 'The AI shows a 20° left bank with wings tilted left but no pitch change. Airspeed is constant. Altimeter and VSI show no altitude change — this is a level turn. The turn coordinator miniature aircraft is banked left at standard rate (3°/sec). The DI shows heading turning left. Ball centered = coordinated.',
        instruments: {
            asi: { start: { airspeed: 120 }, end: { airspeed: 120 } },
            ai:  { start: { pitch: 2,  bank: 0   }, end: { pitch: 2,  bank: -20 } },
            alt: { start: { altitude: 5000 }, end: { altitude: 5000 } },
            tc:  { start: { turnRate: 0,  ballOffset: 0 }, end: { turnRate: -3, ballOffset: 0  } },
            di:  { start: { heading: 360 }, end: { heading: 345 } },
            vsi: { start: { vspeed: 0   }, end: { vspeed: 0   } }
        }
    },

    // --------------------------------------------------
    // 8. LEVEL RIGHT STEEP TURN (45°)
    // --------------------------------------------------
    {
        id: 'level-right-steep',
        name: 'Level Right Steep Turn',
        question: 'What maneuver is depicted?',
        answers: [
            { text: 'Climbing right turn with 45° bank', correct: false },
            { text: 'Level right steep turn — 45° bank, maintaining altitude', correct: true },
            { text: 'Descending right turn', correct: false },
            { text: 'Standard rate right turn — 20° bank', correct: false }
        ],
        explanation: 'The AI shows a steep 45° right bank. Note the slight nose-up pitch (~5°) — in a steep turn, back pressure is needed to maintain altitude (the wings are producing less vertical lift). Airspeed is slightly reduced due to increased drag. VSI is near zero — altitude is being held. The DI shows a faster heading change due to the steeper bank angle.',
        instruments: {
            asi: { start: { airspeed: 120 }, end: { airspeed: 112 } },
            ai:  { start: { pitch: 2,  bank: 0  }, end: { pitch: 5,  bank: 45  } },
            alt: { start: { altitude: 5500 }, end: { altitude: 5500 } },
            tc:  { start: { turnRate: 0,  ballOffset: 0 }, end: { turnRate: 5,  ballOffset: 0  } },
            di:  { start: { heading: 270 }, end: { heading: 295 } },
            vsi: { start: { vspeed: 0   }, end: { vspeed: 50  } }
        }
    },

    // --------------------------------------------------
    // 9. STRAIGHT CLIMB (VY — BEST RATE)
    // --------------------------------------------------
    {
        id: 'straight-climb-vy',
        name: 'Straight Climb at Vy',
        question: 'What flight condition is depicted?',
        answers: [
            { text: 'Straight climb at best rate of climb speed', correct: true },
            { text: 'Level flight with power increase', correct: false },
            { text: 'Climbing left turn', correct: false },
            { text: 'Approach to stall in climb configuration', correct: false }
        ],
        explanation: 'Airspeed has decreased from cruise (~120 kts) to best rate-of-climb speed (Vy, ~80 kts). The AI shows nose-high attitude (~8°) with wings perfectly level — no bank. The altimeter is rising and VSI indicates ~700 ft/min. The DI shows no heading change. This is a textbook straight climb at Vy.',
        instruments: {
            asi: { start: { airspeed: 120 }, end: { airspeed: 80  } },
            ai:  { start: { pitch: 2,  bank: 0 }, end: { pitch: 8,  bank: 0 } },
            alt: { start: { altitude: 3000 }, end: { altitude: 3300 } },
            tc:  { start: { turnRate: 0, ballOffset: 0 }, end: { turnRate: 0, ballOffset: 0 } },
            di:  { start: { heading: 90  }, end: { heading: 90  } },
            vsi: { start: { vspeed: 50  }, end: { vspeed: 700 } }
        }
    },

    // --------------------------------------------------
    // 10. CRUISE DESCENT — POWER REDUCTION
    // --------------------------------------------------
    {
        id: 'cruise-descent',
        name: 'Cruise Descent — Power Reduction',
        question: 'What does this instrument picture indicate?',
        answers: [
            { text: 'Straight wings-level descent — power reduced', correct: true },
            { text: 'Descent with right bank developing', correct: false },
            { text: 'Emergency descent at maximum speed', correct: false },
            { text: 'Engine failure — power-off glide', correct: false }
        ],
        explanation: 'The AI shows a slight nose-down attitude (~3°) with wings perfectly level. Airspeed is stable as the pilot maintains speed with pitch. Altimeter is slowly falling, VSI shows ~500 ft/min descent. DI heading is constant. This is a controlled, powered descent — possibly a cruise descent or step-down.',
        instruments: {
            asi: { start: { airspeed: 120 }, end: { airspeed: 120 } },
            ai:  { start: { pitch: 2,  bank: 0 }, end: { pitch: -3, bank: 0 } },
            alt: { start: { altitude: 8500 }, end: { altitude: 8280 } },
            tc:  { start: { turnRate: 0, ballOffset: 0 }, end: { turnRate: 0, ballOffset: 0 } },
            di:  { start: { heading: 45  }, end: { heading: 45  } },
            vsi: { start: { vspeed: 0   }, end: { vspeed: -500 } }
        }
    },

    // --------------------------------------------------
    // 11. GO-AROUND / MISSED APPROACH
    // --------------------------------------------------
    {
        id: 'go-around',
        name: 'Go-Around / Missed Approach',
        question: 'What procedure is being executed?',
        answers: [
            { text: 'Steep approach with full flaps', correct: false },
            { text: 'Go-around or missed approach — full power applied', correct: true },
            { text: 'Spin recovery', correct: false },
            { text: 'Takeoff rotation from short field', correct: false }
        ],
        explanation: 'Airspeed is transitioning from slow approach speed (70 kts) upward as full power is applied. The AI rapidly changes from a nose-low approach attitude to a nose-high climb attitude. VSI reverses from negative (descent) to strongly positive (climb). This is the classic go-around picture — the pilot has abandoned the approach and is climbing away.',
        instruments: {
            asi: { start: { airspeed: 70  }, end: { airspeed: 85  } },
            ai:  { start: { pitch: -3, bank: 0 }, end: { pitch: 8,  bank: 0 } },
            alt: { start: { altitude: 800 }, end: { altitude: 950  } },
            tc:  { start: { turnRate: 0, ballOffset: 0 }, end: { turnRate: 0, ballOffset: 0 } },
            di:  { start: { heading: 270 }, end: { heading: 270 } },
            vsi: { start: { vspeed: -400 }, end: { vspeed: 700 } }
        }
    },

    // --------------------------------------------------
    // 12. FINAL APPROACH — VISUAL/IFR
    // --------------------------------------------------
    {
        id: 'final-approach',
        name: 'Final Approach',
        question: 'What phase of flight is depicted?',
        answers: [
            { text: 'Final approach — stabilized, on glidepath', correct: true },
            { text: 'Engine failure glide', correct: false },
            { text: 'Cruise descent to cruise altitude', correct: false },
            { text: 'Descending right turn to base leg', correct: false }
        ],
        explanation: 'Airspeed has stabilized at ~75 kts — approach speed. AI shows a gentle nose-down attitude with wings level. Altimeter is steadily decreasing. VSI shows a controlled -500 ft/min — consistent with a 3° glidepath. DI heading is constant, pointing toward the runway. This is a stabilized visual or instrument approach.',
        instruments: {
            asi: { start: { airspeed: 90  }, end: { airspeed: 75  } },
            ai:  { start: { pitch: -1, bank: 0 }, end: { pitch: -2, bank: 0 } },
            alt: { start: { altitude: 2500 }, end: { altitude: 2220 } },
            tc:  { start: { turnRate: 0, ballOffset: 0 }, end: { turnRate: 0, ballOffset: 0 } },
            di:  { start: { heading: 360 }, end: { heading: 360 } },
            vsi: { start: { vspeed: -350 }, end: { vspeed: -500 } }
        }
    },

    // --------------------------------------------------
    // 13. TAKEOFF CLIMBOUT
    // --------------------------------------------------
    {
        id: 'takeoff-climbout',
        name: 'Takeoff Climbout',
        question: 'What phase of flight is this?',
        answers: [
            { text: 'Go-around from a low approach', correct: false },
            { text: 'Takeoff climbout just after rotation', correct: true },
            { text: 'Climb after engine restart', correct: false },
            { text: 'Straight climb returning to altitude after descent', correct: false }
        ],
        explanation: 'Airspeed is building from rotation speed (~65 kts) as the aircraft accelerates in the climb. AI shows nose-up attitude (~8°) and wings level. Most noticeably, altitude starts very low — the aircraft just left the runway. VSI is strongly positive (~800 ft/min). DI is steady on runway heading.',
        instruments: {
            asi: { start: { airspeed: 65  }, end: { airspeed: 88  } },
            ai:  { start: { pitch: 5,  bank: 0 }, end: { pitch: 8,  bank: 0 } },
            alt: { start: { altitude: 80  }, end: { altitude: 430  } },
            tc:  { start: { turnRate: 0, ballOffset: 0 }, end: { turnRate: 0, ballOffset: 0 } },
            di:  { start: { heading: 180 }, end: { heading: 180 } },
            vsi: { start: { vspeed: 300 }, end: { vspeed: 800 } }
        }
    },

    // --------------------------------------------------
    // 14. BASE-TO-FINAL TURN
    // --------------------------------------------------
    {
        id: 'base-to-final',
        name: 'Base-to-Final Turn',
        question: 'What traffic pattern segment is being flown?',
        answers: [
            { text: 'Turning from crosswind to downwind', correct: false },
            { text: 'Turning from downwind to base', correct: false },
            { text: 'Turning from base to final — descending left turn', correct: true },
            { text: 'Level left turn at pattern altitude', correct: false }
        ],
        explanation: 'A descending left turn: AI shows left bank (~25°) with a slight nose-down attitude. Airspeed is at approach speed (~82 kts). Altimeter is decreasing — the aircraft is descending through the turn. VSI is negative. DI shows heading turning toward the runway. This is the base-to-final turn, typically flown below 300 ft AGL.',
        instruments: {
            asi: { start: { airspeed: 90  }, end: { airspeed: 82  } },
            ai:  { start: { pitch: -1, bank: 0   }, end: { pitch: -3, bank: -22 } },
            alt: { start: { altitude: 1000 }, end: { altitude: 850  } },
            tc:  { start: { turnRate: 0,  ballOffset: 0 }, end: { turnRate: -2.5, ballOffset: 0 } },
            di:  { start: { heading: 270 }, end: { heading: 255 } },
            vsi: { start: { vspeed: -300 }, end: { vspeed: -600 } }
        }
    },

    // --------------------------------------------------
    // 15. SPIN ENTRY / DEPARTURE FROM CONTROLLED FLIGHT
    // --------------------------------------------------
    {
        id: 'spin-entry',
        name: 'Spin Entry / Departure',
        question: 'What critical departure from controlled flight is occurring?',
        answers: [
            { text: 'Coordinated steep climbing turn', correct: false },
            { text: 'Normal stall recovery with wings level', correct: false },
            { text: 'Spin entry — departure from controlled flight', correct: true },
            { text: 'Cross-controlled approach turn', correct: false }
        ],
        explanation: 'The aircraft is departing controlled flight into a spin. Airspeed rapidly drops to near zero (stall). The AI shows a nose-high attitude breaking to an extreme bank — one wing has stalled before the other. VSI reverses sharply. The turn coordinator shows a rapid, yawing rotation and the ball is severely displaced (uncoordinated). Immediate recovery: PARE (Power off, Ailerons neutral, Rudder opposite spin direction, Elevator forward).',
        instruments: {
            asi: { start: { airspeed: 62  }, end: { airspeed: 28  } },
            ai:  { start: { pitch: 16, bank: 0   }, end: { pitch: 10, bank: -35 } },
            alt: { start: { altitude: 4500 }, end: { altitude: 4440 } },
            tc:  { start: { turnRate: -0.5, ballOffset: 0.3 }, end: { turnRate: -7, ballOffset: 1.0 } },
            di:  { start: { heading: 090 }, end: { heading: 070 } },
            vsi: { start: { vspeed: 150 }, end: { vspeed: -800 } }
        }
    },

    // --------------------------------------------------
    // 16. NOSE-HIGH UNUSUAL ATTITUDE
    // --------------------------------------------------
    {
        id: 'nose-high-unusual',
        name: 'Nose-High Unusual Attitude',
        question: 'What unusual attitude requires immediate recovery?',
        answers: [
            { text: 'Excessive nose-high attitude — stall imminent', correct: true },
            { text: 'Normal power-on climb', correct: false },
            { text: 'Chandelle maneuver at completion', correct: false },
            { text: 'Steep turn with altitude gain', correct: false }
        ],
        explanation: 'AI shows extreme nose-high attitude (~25°) — well beyond a normal climb attitude. Airspeed is critically low (~45 kts, below the bottom of the white arc). VSI has reversed — the wing is no longer generating enough lift to climb. A slight bank is developing. Recovery: reduce angle of attack immediately (lower nose), add full power, level the wings.',
        instruments: {
            asi: { start: { airspeed: 60  }, end: { airspeed: 45  } },
            ai:  { start: { pitch: 18, bank: -3  }, end: { pitch: 25, bank: -8  } },
            alt: { start: { altitude: 7000 }, end: { altitude: 7080 } },
            tc:  { start: { turnRate: -1, ballOffset: 0.2 }, end: { turnRate: -2, ballOffset: 0.4 } },
            di:  { start: { heading: 360 }, end: { heading: 357 } },
            vsi: { start: { vspeed: 300 }, end: { vspeed: -80  } }
        }
    },

    // --------------------------------------------------
    // 17. SPATIAL DISORIENTATION — UNNOTICED GRAVEYARD TURN
    // --------------------------------------------------
    {
        id: 'graveyard-turn',
        name: 'Unnoticed Bank — Graveyard Turn Entry',
        question: 'What dangerous situation is developing unnoticed by the pilot?',
        answers: [
            { text: 'Pilot-commanded standard rate right turn', correct: false },
            { text: 'Aircraft in level flight with slight crosswind', correct: false },
            { text: 'Spatial disorientation — unnoticed bank and altitude loss developing', correct: true },
            { text: 'Recovery from turbulence-induced bank', correct: false }
        ],
        explanation: 'A classic "graveyard turn" entry driven by spatial disorientation. Bank is gradually developing (~30° right) without the pilot noticing. As the bank increases, the nose drops, airspeed increases slightly, and altitude slowly bleeds off. VSI is going negative. The DI heading is changing right. Without instrument scan, this leads to the graveyard spiral. This kills VFR pilots who inadvertently enter IMC.',
        instruments: {
            asi: { start: { airspeed: 120 }, end: { airspeed: 128 } },
            ai:  { start: { pitch: 2,  bank: 0   }, end: { pitch: 0,  bank: 30  } },
            alt: { start: { altitude: 5000 }, end: { altitude: 4950 } },
            tc:  { start: { turnRate: 0,  ballOffset: 0 }, end: { turnRate: 3,  ballOffset: 0.1 } },
            di:  { start: { heading: 270 }, end: { heading: 283 } },
            vsi: { start: { vspeed: 0   }, end: { vspeed: -350 } }
        }
    },

    // --------------------------------------------------
    // 18. STRONG UPDRAFT / MOUNTAIN WAVE
    // --------------------------------------------------
    {
        id: 'mountain-wave',
        name: 'Strong Updraft / Mountain Wave',
        question: 'What atmospheric phenomenon is the aircraft experiencing?',
        answers: [
            { text: 'Pilot-commanded rapid climb with full power', correct: false },
            { text: 'Strong updraft — mountain wave or thermal', correct: true },
            { text: 'Engine runaway — overspeed condition', correct: false },
            { text: 'Zoom climb after speed buildup', correct: false }
        ],
        explanation: 'Airspeed is slightly reduced (the updraft has pushed the nose up into a gentle climb attitude). The AI shows wings level with mild pitch up. But the VSI is showing a dramatic climb rate of 1500 ft/min — far more than the attitude/power combination would normally produce. Altimeter rising fast. DI steady — no turn. This is an orographic updraft (mountain wave) or strong thermal. In IFR, this is dangerous if you exceed your clearance altitude.',
        instruments: {
            asi: { start: { airspeed: 120 }, end: { airspeed: 112 } },
            ai:  { start: { pitch: 2,  bank: 0 }, end: { pitch: 5,  bank: 0 } },
            alt: { start: { altitude: 9200 }, end: { altitude: 9700 } },
            tc:  { start: { turnRate: 0, ballOffset: 0 }, end: { turnRate: 0, ballOffset: 0 } },
            di:  { start: { heading: 90  }, end: { heading: 90  } },
            vsi: { start: { vspeed: 100 }, end: { vspeed: 1500 } }
        }
    },

    // --------------------------------------------------
    // 19. EMERGENCY DESCENT — CABIN DEPRESSURIZATION
    // --------------------------------------------------
    {
        id: 'emergency-descent',
        name: 'Emergency Descent',
        question: 'What emergency procedure is being executed?',
        answers: [
            { text: 'Normal cruise descent to pattern altitude', correct: false },
            { text: 'Steep spiral dive — loss of control', correct: false },
            { text: 'Emergency descent — rapid altitude loss, wings level', correct: true },
            { text: 'Power-off glide after engine failure', correct: false }
        ],
        explanation: 'The pilot is executing an emergency descent (e.g., cabin depressurization or engine fire requiring descent to breathable air). Wings are level (AI shows level, no bank). Nose is significantly down (~15°). Airspeed is increasing rapidly — approaching the yellow arc. VSI is pegged at -2000 ft/min. DI heading is steady — this is NOT a spiral; it is a controlled emergency descent.',
        instruments: {
            asi: { start: { airspeed: 130 }, end: { airspeed: 168 } },
            ai:  { start: { pitch: 0,  bank: 0 }, end: { pitch: -15, bank: 0 } },
            alt: { start: { altitude: 12000 }, end: { altitude: 11100 } },
            tc:  { start: { turnRate: 0, ballOffset: 0 }, end: { turnRate: 0, ballOffset: 0 } },
            di:  { start: { heading: 270 }, end: { heading: 270 } },
            vsi: { start: { vspeed: 0   }, end: { vspeed: -2000 } }
        }
    },

    // --------------------------------------------------
    // 20. POWER-ON DEPARTURE STALL
    // --------------------------------------------------
    {
        id: 'departure-stall',
        name: 'Power-On Departure Stall',
        question: 'What stall scenario is developing?',
        answers: [
            { text: 'Normal takeoff climbout at Vy', correct: false },
            { text: 'Power-on departure stall — nose too high in climb', correct: true },
            { text: 'Chandelle maneuver at full bank', correct: false },
            { text: 'Airspeed indicator failure', correct: false }
        ],
        explanation: 'Full power has been applied but the nose pitch is far too high (~22°) — a common training accident scenario. Airspeed is decreasing rapidly from 80 kts toward a full power stall despite the engine running. VSI goes from strongly positive to reversing. The AOA (angle of attack) is too high regardless of engine power. Recovery: lower the nose to reduce AOA, then maintain coordinated flight.',
        instruments: {
            asi: { start: { airspeed: 80  }, end: { airspeed: 48  } },
            ai:  { start: { pitch: 12, bank: 0 }, end: { pitch: 22, bank: 0 } },
            alt: { start: { altitude: 3500 }, end: { altitude: 3680 } },
            tc:  { start: { turnRate: 0, ballOffset: 0 }, end: { turnRate: 0, ballOffset: 0.1 } },
            di:  { start: { heading: 360 }, end: { heading: 360 } },
            vsi: { start: { vspeed: 800 }, end: { vspeed: -150 } }
        }
    },

    // --------------------------------------------------
    // 21. RECOVERY FROM STEEP SPIRAL
    // --------------------------------------------------
    {
        id: 'spiral-recovery',
        name: 'Recovery from Steep Spiral',
        question: 'What recovery procedure is being flown?',
        answers: [
            { text: 'Normal steep turn being rolled out', correct: false },
            { text: 'Unusual attitude recovery — wings leveling, speed decreasing', correct: true },
            { text: 'Stall recovery with airspeed building', correct: false },
            { text: 'Go-around from a steep approach', correct: false }
        ],
        explanation: 'The pilot is recovering from a graveyard spiral. Bank is rolling out from steep (65°) toward wings level. As the wings level, the lift vector is restored and the descent rate decreases dramatically. Airspeed is decreasing from high speed back toward cruise. The correct sequence was: wings level first (AI), then gentle back pressure to arrest the descent.',
        instruments: {
            asi: { start: { airspeed: 175 }, end: { airspeed: 130 } },
            ai:  { start: { pitch: -15, bank: 65 }, end: { pitch: 0,   bank: 5  } },
            alt: { start: { altitude: 5200 }, end: { altitude: 5050 } },
            tc:  { start: { turnRate: 9,  ballOffset: 0.8 }, end: { turnRate: 0.5, ballOffset: 0 } },
            di:  { start: { heading: 180 }, end: { heading: 185 } },
            vsi: { start: { vspeed: -2000 }, end: { vspeed: -250 } }
        }
    },

    // --------------------------------------------------
    // 22. LEVELING OFF AT CRUISE ALTITUDE
    // --------------------------------------------------
    {
        id: 'level-off-cruise',
        name: 'Leveling Off at Cruise Altitude',
        question: 'What transition is being made?',
        answers: [
            { text: 'Transitioning from cruise to a descent', correct: false },
            { text: 'Leveling off and accelerating to cruise speed after a climb', correct: true },
            { text: 'Go-around from low altitude', correct: false },
            { text: 'Recovering from nose-low unusual attitude', correct: false }
        ],
        explanation: 'The aircraft is transitioning from climb to cruise flight. AI pitch is reducing from ~8° (climb) to ~2° (cruise attitude) as the pilot lowers the nose at the target altitude. Airspeed is accelerating from climb speed (~80 kts) to cruise speed (~120 kts) as the nose comes down. VSI is decreasing toward zero. Altimeter is stabilizing.',
        instruments: {
            asi: { start: { airspeed: 82  }, end: { airspeed: 118 } },
            ai:  { start: { pitch: 8,  bank: 0 }, end: { pitch: 2,  bank: 0 } },
            alt: { start: { altitude: 7450 }, end: { altitude: 7500 } },
            tc:  { start: { turnRate: 0, ballOffset: 0 }, end: { turnRate: 0, ballOffset: 0 } },
            di:  { start: { heading: 45  }, end: { heading: 45  } },
            vsi: { start: { vspeed: 600 }, end: { vspeed: 0   } }
        }
    },

    // --------------------------------------------------
    // 23. OVERBANKED STEEP TURN — INCIPIENT LOSS OF CONTROL
    // --------------------------------------------------
    {
        id: 'overbanked-turn',
        name: 'Overbanked Steep Turn — Incipient LOC',
        question: 'What is going wrong in this steep turn?',
        answers: [
            { text: 'Normal 60° bank steep turn', correct: false },
            { text: 'Bank angle increasing beyond intended — altitude and speed diverging', correct: true },
            { text: 'Coordinated recovery from unusual attitude', correct: false },
            { text: 'Level steep turn with altitude holding', correct: false }
        ],
        explanation: 'The bank started at 45° (normal steep turn) but is overbanking to 70° without correction. As the bank steepens, lift is increasingly directed sideways rather than upward, so the nose drops and airspeed increases. Altitude is bleeding off rapidly. This is the entry to a graveyard spiral — the pilot must immediately reduce bank and restore altitude.',
        instruments: {
            asi: { start: { airspeed: 115 }, end: { airspeed: 135 } },
            ai:  { start: { pitch: 3,  bank: 45 }, end: { pitch: -5, bank: 70  } },
            alt: { start: { altitude: 6000 }, end: { altitude: 5820 } },
            tc:  { start: { turnRate: 5,  ballOffset: 0.3 }, end: { turnRate: 8,  ballOffset: 0.6 } },
            di:  { start: { heading: 90  }, end: { heading: 125 } },
            vsi: { start: { vspeed: 50  }, end: { vspeed: -1200 } }
        }
    },

    // --------------------------------------------------
    // 24. HOLDING PATTERN — STANDARD ENTRY TURN
    // --------------------------------------------------
    {
        id: 'holding-turn',
        name: 'Holding Pattern — Standard Rate Turn',
        question: 'What instrument procedure does this depict?',
        answers: [
            { text: 'Normal cruise with shallow bank', correct: false },
            { text: 'Holding pattern — level standard rate right turn', correct: true },
            { text: 'Right traffic pattern turn', correct: false },
            { text: 'Climbing right turn to cruise altitude', correct: false }
        ],
        explanation: 'In IFR holding patterns, standard rate turns (3°/sec, 20° bank at typical speeds) are used. AI shows 20° right bank with level pitch, altitude is constant, VSI reads zero, and airspeed is stable. The DI heading is turning right at a steady rate. This is the inbound or outbound turning leg of a holding pattern.',
        instruments: {
            asi: { start: { airspeed: 120 }, end: { airspeed: 120 } },
            ai:  { start: { pitch: 2,  bank: 0  }, end: { pitch: 2,  bank: 20  } },
            alt: { start: { altitude: 7000 }, end: { altitude: 7000 } },
            tc:  { start: { turnRate: 0,  ballOffset: 0 }, end: { turnRate: 3,  ballOffset: 0  } },
            di:  { start: { heading: 90  }, end: { heading: 108 } },
            vsi: { start: { vspeed: 0   }, end: { vspeed: 0   } }
        }
    },

    // --------------------------------------------------
    // 25. DOWNWIND LEG — TRAFFIC PATTERN
    // --------------------------------------------------
    {
        id: 'downwind-leg',
        name: 'Downwind Leg — Traffic Pattern',
        question: 'What traffic pattern leg is being flown?',
        answers: [
            { text: 'Cruise flight at altitude', correct: false },
            { text: 'Downwind leg — level at pattern altitude', correct: true },
            { text: 'Crosswind leg after departure', correct: false },
            { text: 'Final approach at reduced airspeed', correct: false }
        ],
        explanation: 'Level flight at pattern altitude (~1800 ft AGL), airspeed reduced to ~100 kts (pattern speed with reduced power, pre-flap). AI shows wings level. VSI zero — altitude held. DI shows a reciprocal heading to the runway (aircraft flying parallel but opposite direction to the runway). This is the downwind leg — where the pilot checks off the landing checklist.',
        instruments: {
            asi: { start: { airspeed: 110 }, end: { airspeed: 100 } },
            ai:  { start: { pitch: 2,  bank: 0 }, end: { pitch: 2,  bank: 0 } },
            alt: { start: { altitude: 1800 }, end: { altitude: 1800 } },
            tc:  { start: { turnRate: 0, ballOffset: 0 }, end: { turnRate: 0, ballOffset: 0 } },
            di:  { start: { heading: 180 }, end: { heading: 180 } },
            vsi: { start: { vspeed: 0  }, end: { vspeed: 0  } }
        }
    },

    // --------------------------------------------------
    // 26. INADVERTENT IMC — VFR INTO CLOUDS
    // --------------------------------------------------
    {
        id: 'inadvertent-imc',
        name: 'Inadvertent IMC — Spatial Disorientation',
        question: 'What dangerous situation is this VFR pilot experiencing?',
        answers: [
            { text: 'Intentional IFR flight in cloud', correct: false },
            { text: 'Turbulence-induced bank correction', correct: false },
            { text: 'VFR pilot in IMC — spatial disorientation developing into spiral entry', correct: true },
            { text: 'Standard instrument departure in cloud', correct: false }
        ],
        explanation: 'A VFR pilot has entered IMC (cloud). Without visual references, they experience the "leans" — spatial disorientation. The aircraft is in a 35° left bank they cannot feel. Airspeed is increasing as the nose drops. Altitude is bleeding off. Heading is changing left. VSI is developing a descent. Statistics show VFR pilots in IMC average ~178 seconds before loss of control. The fix: trust the instruments, level the wings.',
        instruments: {
            asi: { start: { airspeed: 120 }, end: { airspeed: 132 } },
            ai:  { start: { pitch: 2,  bank: -5  }, end: { pitch: -1, bank: -35 } },
            alt: { start: { altitude: 4500 }, end: { altitude: 4420 } },
            tc:  { start: { turnRate: -0.5, ballOffset: 0.1 }, end: { turnRate: -3.5, ballOffset: 0.2 } },
            di:  { start: { heading: 360 }, end: { heading: 347 } },
            vsi: { start: { vspeed: 0   }, end: { vspeed: -450 } }
        }
    },

    // --------------------------------------------------
    // 27. POST-STALL RECOVERY
    // --------------------------------------------------
    {
        id: 'stall-recovery',
        name: 'Stall Recovery',
        question: 'What is being accomplished in this scenario?',
        answers: [
            { text: 'Go-around with late power application', correct: false },
            { text: 'Stall recovery — airspeed rebuilding, nose coming down', correct: true },
            { text: 'Leveling off from a descent', correct: false },
            { text: 'Engine restart after failure', correct: false }
        ],
        explanation: 'The aircraft is recovering from a stall. AI shows the nose dropping from a high angle (~18°) back to a normal attitude (~5°). Airspeed is rapidly rebuilding from near-stall speed (~52 kts) back toward normal as the AOA is reduced and lift is restored. VSI transitions from negative (brief altitude loss in recovery) back toward positive. Wings are being leveled. The pilot has correctly reduced AOA to stop the stall.',
        instruments: {
            asi: { start: { airspeed: 52  }, end: { airspeed: 82  } },
            ai:  { start: { pitch: 18, bank: -3  }, end: { pitch: 5,  bank: 0   } },
            alt: { start: { altitude: 4100 }, end: { altitude: 4020 } },
            tc:  { start: { turnRate: -1, ballOffset: 0.3 }, end: { turnRate: 0,  ballOffset: 0   } },
            di:  { start: { heading: 180 }, end: { heading: 180 } },
            vsi: { start: { vspeed: -200 }, end: { vspeed: 400 } }
        }
    },

    // --------------------------------------------------
    // 28. PARTIAL POWER ECONOMY CLIMB
    // --------------------------------------------------
    {
        id: 'economy-climb',
        name: 'Partial Power Economy Climb',
        question: 'How does this climb differ from a best-rate climb?',
        answers: [
            { text: 'It is identical to a best-rate-of-climb profile', correct: false },
            { text: 'Partial power climb — slower climb rate, higher airspeed', correct: true },
            { text: 'Best-angle climb at Vx — steeper nose, slower speed', correct: false },
            { text: 'Descent profile with power reduction', correct: false }
        ],
        explanation: 'This is an economy/cruise climb — higher airspeed (~100 kts vs Vy ~80) with a shallower nose attitude (~5° vs ~8°). The result is a lower climb rate (~300 ft/min). This is used for long cross-countries to prioritize engine cooling and faster groundspeed over climb efficiency. Compare to Vy: same direction, lower nose, faster speed, less VSI.',
        instruments: {
            asi: { start: { airspeed: 110 }, end: { airspeed: 100 } },
            ai:  { start: { pitch: 3,  bank: 0 }, end: { pitch: 5,  bank: 0 } },
            alt: { start: { altitude: 5000 }, end: { altitude: 5150 } },
            tc:  { start: { turnRate: 0, ballOffset: 0 }, end: { turnRate: 0, ballOffset: 0 } },
            di:  { start: { heading: 270 }, end: { heading: 270 } },
            vsi: { start: { vspeed: 100 }, end: { vspeed: 300 } }
        }
    },

    // --------------------------------------------------
    // 29. CROSSWIND TAKEOFF — WING-LOW CRAB CORRECTION
    // --------------------------------------------------
    {
        id: 'crosswind-takeoff',
        name: 'Crosswind Takeoff Climbout',
        question: 'What crosswind correction technique is being applied during climbout?',
        answers: [
            { text: 'Normal straight-ahead climbout — no wind', correct: false },
            { text: 'Crosswind correction — slight bank into wind to track runway centerline', correct: true },
            { text: 'Turning on course after departure', correct: false },
            { text: 'Recovery from wind shear on climbout', correct: false }
        ],
        explanation: 'The aircraft is climbing but maintaining a slight bank into the crosswind (right bank ~8°) with opposite rudder to keep the nose straight — the wing-low crosswind technique. AI shows nose-up with a slight right bank. Turn coordinator shows right bank but ball is slightly left (opposite rudder applied). DI heading is steady — tracking the runway extended centerline despite the crosswind.',
        instruments: {
            asi: { start: { airspeed: 70  }, end: { airspeed: 82  } },
            ai:  { start: { pitch: 7,  bank: 3  }, end: { pitch: 8,  bank: 8  } },
            alt: { start: { altitude: 200 }, end: { altitude: 520  } },
            tc:  { start: { turnRate: 0.5, ballOffset: -0.1 }, end: { turnRate: 1,  ballOffset: -0.3 } },
            di:  { start: { heading: 270 }, end: { heading: 270 } },
            vsi: { start: { vspeed: 400 }, end: { vspeed: 650 } }
        }
    },

    // --------------------------------------------------
    // 30. WIND SHEAR ON FINAL — AIRSPEED LOSS
    // --------------------------------------------------
    {
        id: 'wind-shear-final',
        name: 'Wind Shear on Final Approach',
        question: 'What hazardous condition is the pilot encountering?',
        answers: [
            { text: 'Normal airspeed deceleration for landing flare', correct: false },
            { text: 'Engine failure on final approach', correct: false },
            { text: 'Wind shear — sudden airspeed loss requiring immediate go-around', correct: true },
            { text: 'Pilot-induced oscillation on approach', correct: false }
        ],
        explanation: 'Wind shear on final: the aircraft transitions from a headwind to a tailwind (or calm air), causing a sudden loss of indicated airspeed — from 80 kts down to 62 kts. The nose-low approach attitude remains but the AI and VSI both show the aircraft sinking rapidly below the glidepath as lift decreases. Altitude is dropping faster than expected. This requires immediate full power and go-around. Wind shear below 1000 ft AGL is fatal if not recognized.',
        instruments: {
            asi: { start: { airspeed: 80  }, end: { airspeed: 62  } },
            ai:  { start: { pitch: -2, bank: 0 }, end: { pitch: -5, bank: 0 } },
            alt: { start: { altitude: 600 }, end: { altitude: 460  } },
            tc:  { start: { turnRate: 0, ballOffset: 0 }, end: { turnRate: 0, ballOffset: 0 } },
            di:  { start: { heading: 360 }, end: { heading: 360 } },
            vsi: { start: { vspeed: -450 }, end: { vspeed: -1100 } }
        }
    }

];

// Number of scenarios per training session.
// Set to SCENARIOS.length to always use all 30.
window.QUIZ_LENGTH = window.SCENARIOS.length;
