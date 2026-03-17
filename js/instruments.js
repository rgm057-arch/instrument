/* ===================================================
   INSTRUMENTS.JS — SVG Six Pack Instrument Rendering
   All instruments use a 200×200 viewBox, center (100,100)
   =================================================== */

window.Instruments = {};

// ---------------------------------------------------
// SVG Utilities
// ---------------------------------------------------

function svgEl(tag, attrs = {}) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [k, v] of Object.entries(attrs)) {
        el.setAttribute(k, v);
    }
    return el;
}

// 0° = 12 o'clock, positive = clockwise
function polarToXY(cx, cy, r, angleDeg) {
    const rad = (angleDeg - 90) * Math.PI / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function makeArcPath(cx, cy, r, startAngle, endAngle) {
    const s = polarToXY(cx, cy, r, startAngle);
    const e = polarToXY(cx, cy, r, endAngle);
    const large = (endAngle - startAngle) > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

function drawBezel(svg) {
    // Outer black ring
    svg.appendChild(svgEl('circle', { cx: 100, cy: 100, r: 99, fill: '#0a0a0a' }));
    // Bezel gradient ring
    svg.appendChild(svgEl('circle', { cx: 100, cy: 100, r: 96, fill: 'none', stroke: '#3a3a3a', 'stroke-width': 6 }));
    svg.appendChild(svgEl('circle', { cx: 100, cy: 100, r: 93, fill: '#111' }));
}

function drawCenterDot(svg, r = 4, color = '#ddd') {
    svg.appendChild(svgEl('circle', { cx: 100, cy: 100, r, fill: color }));
}

// ---------------------------------------------------
// Base Instrument Class
// ---------------------------------------------------

class Instrument {
    constructor(svgElement) {
        this.svg = svgElement;
        this.svg.style.background = '#111';
    }
    init() {}
    setState(state) { this.render(state); }
    render(state) {}
}

// ---------------------------------------------------
// AIRSPEED INDICATOR (ASI)
// ---------------------------------------------------

window.Instruments.ASI = class ASI extends Instrument {
    init() {
        const svg = this.svg;
        drawBezel(svg);

        // Face background
        svg.appendChild(svgEl('circle', { cx: 100, cy: 100, r: 90, fill: '#0d0d0d' }));

        // Color arcs — drawn on radius 80, sweep: 0kts at -130°, 220kts at +130°
        const ktsToAngle = k => -130 + (k / 220) * 260;
        const arcR = 80, arcW = 8;

        // White arc (flap range): 40-85 kts
        svg.appendChild(svgEl('path', {
            d: makeArcPath(100, 100, arcR - 4, ktsToAngle(40), ktsToAngle(85)),
            stroke: '#ffffff', 'stroke-width': arcW - 2, fill: 'none', 'stroke-linecap': 'round'
        }));
        // Green arc: 65-165 kts
        svg.appendChild(svgEl('path', {
            d: makeArcPath(100, 100, arcR, ktsToAngle(65), ktsToAngle(165)),
            stroke: '#00cc44', 'stroke-width': arcW, fill: 'none'
        }));
        // Yellow arc: 165-200 kts
        svg.appendChild(svgEl('path', {
            d: makeArcPath(100, 100, arcR, ktsToAngle(165), ktsToAngle(200)),
            stroke: '#ffcc00', 'stroke-width': arcW, fill: 'none'
        }));
        // Red radial tick at Vne (200 kts)
        const vne = polarToXY(100, 100, arcR + 5, ktsToAngle(200));
        const vne2 = polarToXY(100, 100, arcR - arcW - 2, ktsToAngle(200));
        svg.appendChild(svgEl('line', {
            x1: vne2.x, y1: vne2.y, x2: vne.x, y2: vne.y,
            stroke: '#ff2222', 'stroke-width': 3
        }));

        // Tick marks and labels
        for (let kts = 0; kts <= 220; kts += 10) {
            const angle = ktsToAngle(kts);
            const isMajor = kts % 20 === 0;
            const outer = polarToXY(100, 100, 88, angle);
            const inner = polarToXY(100, 100, isMajor ? 74 : 80, angle);
            svg.appendChild(svgEl('line', {
                x1: inner.x, y1: inner.y, x2: outer.x, y2: outer.y,
                stroke: '#bbb', 'stroke-width': isMajor ? 2 : 1
            }));
            if (isMajor && kts >= 40 && kts <= 200) {
                const lp = polarToXY(100, 100, 65, angle);
                const t = svgEl('text', {
                    x: lp.x, y: lp.y,
                    'text-anchor': 'middle',
                    'dominant-baseline': 'middle',
                    fill: '#ccc',
                    'font-size': '10',
                    'font-family': 'Courier New'
                });
                t.textContent = kts;
                svg.appendChild(t);
            }
        }

        // Needle — points toward 12 o'clock at 0°, rotated by transform
        const needleG = svgEl('g', { id: `${this.svg.id}-needle`, transform: 'rotate(0, 100, 100)' });
        needleG.appendChild(svgEl('polygon', {
            points: '100,22 97,105 103,105',
            fill: '#ffffff'
        }));
        needleG.appendChild(svgEl('polygon', {
            points: '100,178 97,105 103,105',
            fill: '#555'
        }));
        svg.appendChild(needleG);
        drawCenterDot(svg, 5, '#ccc');

        this._needle = needleG;
        this._ktsToAngle = ktsToAngle;
    }

    render({ airspeed }) {
        const angle = this._ktsToAngle(Math.max(0, Math.min(220, airspeed)));
        this._needle.setAttribute('transform', `rotate(${angle}, 100, 100)`);
    }
};

// ---------------------------------------------------
// ATTITUDE INDICATOR (AI)
// ---------------------------------------------------

window.Instruments.AI = class AI extends Instrument {
    init() {
        const svg = this.svg;
        drawBezel(svg);

        // Clip circle for gyro world
        const defs = svgEl('defs');
        const clip = svgEl('clipPath', { id: `${svg.id}-clip` });
        clip.appendChild(svgEl('circle', { cx: 100, cy: 100, r: 88 }));
        defs.appendChild(clip);
        svg.appendChild(defs);

        // World group (sky + earth), clipped
        const worldG = svgEl('g', { 'clip-path': `url(#${svg.id}-clip)` });
        const innerG = svgEl('g', { id: `${svg.id}-world` });

        // Earth (bottom half — appears below horizon)
        innerG.appendChild(svgEl('rect', {
            x: -200, y: 0, width: 600, height: 400,
            fill: '#7a4a20'
        }));
        // Sky (top half)
        innerG.appendChild(svgEl('rect', {
            x: -200, y: -400, width: 600, height: 400,
            fill: '#1a5fa0'
        }));
        // Horizon line
        innerG.appendChild(svgEl('rect', {
            x: -200, y: -2, width: 600, height: 4,
            fill: '#ffffff'
        }));

        // Pitch lines
        const pitchAngles = [-20, -15, -10, -5, 5, 10, 15, 20];
        pitchAngles.forEach(deg => {
            const py = -(deg * 2.5);
            const isLong = Math.abs(deg) % 10 === 0;
            const w = isLong ? 50 : 30;
            innerG.appendChild(svgEl('line', {
                x1: 100 - w, y1: 100 + py,
                x2: 100 + w, y2: 100 + py,
                stroke: '#ffffff', 'stroke-width': 1.5
            }));
            // Degree labels on the long marks
            if (isLong) {
                const label = svgEl('text', {
                    x: 100 - w - 8, y: 100 + py,
                    'text-anchor': 'end',
                    'dominant-baseline': 'middle',
                    fill: '#ffffff',
                    'font-size': '9',
                    'font-family': 'Courier New'
                });
                label.textContent = Math.abs(deg);
                innerG.appendChild(label);
            }
        });

        worldG.appendChild(innerG);
        svg.appendChild(worldG);

        // Bank angle arc (fixed, on top of clip)
        const bankAngles = [-60, -45, -30, -20, -10, 0, 10, 20, 30, 45, 60];
        bankAngles.forEach(deg => {
            // arc goes from -60° to +60° centered at top of dial
            const angle = deg - 90; // offset so 0° is at top
            const outer = polarToXY(100, 100, 88, deg - 90 + (-90 + 90));
            // actually: bank arc is at top, 0 bank = 12 o'clock
            // tick at top of instrument
            const r1 = 88, r2 = deg % 30 === 0 ? 80 : 83;
            const p1 = polarToXY(100, 100, r1, deg - 90);
            const p2 = polarToXY(100, 100, r2, deg - 90);
            svg.appendChild(svgEl('line', {
                x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y,
                stroke: '#fff', 'stroke-width': deg === 0 ? 2.5 : 1.5
            }));
        });

        // Fixed bank pointer triangle at top
        const bp = svgEl('polygon', {
            points: '100,16 96,24 104,24',
            fill: '#ffffff'
        });
        svg.appendChild(bp);

        // Fixed miniature aircraft symbol
        const acG = svgEl('g');
        // fuselage dot
        acG.appendChild(svgEl('circle', { cx: 100, cy: 100, r: 3, fill: '#f0a500' }));
        // left wing
        acG.appendChild(svgEl('rect', { x: 68, y: 98, width: 26, height: 4, rx: 2, fill: '#f0a500' }));
        // right wing
        acG.appendChild(svgEl('rect', { x: 106, y: 98, width: 26, height: 4, rx: 2, fill: '#f0a500' }));
        // tail
        acG.appendChild(svgEl('rect', { x: 97, y: 108, width: 6, height: 10, rx: 2, fill: '#f0a500' }));
        svg.appendChild(acG);

        // Moving bank pointer (inverted triangle, moves with bank)
        const movingBankG = svgEl('g', { id: `${svg.id}-bank-ptr` });
        movingBankG.appendChild(svgEl('polygon', {
            points: '100,28 96,20 104,20',
            fill: '#f0a500'
        }));
        svg.appendChild(movingBankG);

        this._world = innerG;
        this._bankPtr = movingBankG;
    }

    render({ pitch, bank }) {
        const pitchPx = pitch * 2.5;
        this._world.setAttribute('transform',
            `rotate(${-bank}, 100, 100) translate(0, ${-pitchPx})`);
        this._bankPtr.setAttribute('transform',
            `rotate(${bank}, 100, 100)`);
    }
};

// ---------------------------------------------------
// ALTIMETER
// ---------------------------------------------------

window.Instruments.ALT = class ALT extends Instrument {
    init() {
        const svg = this.svg;
        drawBezel(svg);
        svg.appendChild(svgEl('circle', { cx: 100, cy: 100, r: 90, fill: '#0d0d0d' }));

        // Scale markings — 0-9 (each = 100 ft, full rotation = 1000 ft)
        for (let i = 0; i < 10; i++) {
            const angle = (i / 10) * 360;
            const outer = polarToXY(100, 100, 86, angle);
            const inner = polarToXY(100, 100, 78, angle);
            svg.appendChild(svgEl('line', {
                x1: inner.x, y1: inner.y, x2: outer.x, y2: outer.y,
                stroke: '#ccc', 'stroke-width': 2
            }));
            // Minor ticks at every 2 (20 ft)
            for (let j = 1; j < 5; j++) {
                const minAngle = angle + (j / 5) * 36;
                const mo = polarToXY(100, 100, 86, minAngle);
                const mi = polarToXY(100, 100, 82, minAngle);
                svg.appendChild(svgEl('line', {
                    x1: mi.x, y1: mi.y, x2: mo.x, y2: mo.y,
                    stroke: '#777', 'stroke-width': 1
                }));
            }
            // Number label
            const lp = polarToXY(100, 100, 68, angle);
            const t = svgEl('text', {
                x: lp.x, y: lp.y,
                'text-anchor': 'middle', 'dominant-baseline': 'middle',
                fill: '#ccc', 'font-size': '12', 'font-family': 'Courier New', 'font-weight': 'bold'
            });
            t.textContent = i;
            svg.appendChild(t);
        }

        // Kollsman window (cosmetic barometric pressure window at 3 o'clock)
        const kw = svgEl('g');
        kw.appendChild(svgEl('rect', { x: 138, y: 92, width: 32, height: 16, rx: 3, fill: '#1a1a2e', stroke: '#444', 'stroke-width': 1 }));
        const kwText = svgEl('text', {
            x: 154, y: 100, 'text-anchor': 'middle', 'dominant-baseline': 'middle',
            fill: '#8888cc', 'font-size': '8', 'font-family': 'Courier New'
        });
        kwText.textContent = '29.92';
        kw.appendChild(kwText);
        svg.appendChild(kw);

        // 10,000 ft needle — short, wide
        const n10k = svgEl('g', { id: `${svg.id}-n10k` });
        n10k.appendChild(svgEl('polygon', {
            points: '100,42 97,100 103,100',
            fill: '#888'
        }));
        n10k.appendChild(svgEl('polygon', {
            points: '100,158 97,100 103,100',
            fill: '#444'
        }));
        svg.appendChild(n10k);

        // 1,000 ft needle — medium length
        const n1k = svgEl('g', { id: `${svg.id}-n1k` });
        n1k.appendChild(svgEl('polygon', {
            points: '100,30 97.5,100 102.5,100',
            fill: '#ccc'
        }));
        n1k.appendChild(svgEl('polygon', {
            points: '100,165 97.5,100 102.5,100',
            fill: '#444'
        }));
        svg.appendChild(n1k);

        // 100 ft needle — long, thin
        const n100 = svgEl('g', { id: `${svg.id}-n100` });
        n100.appendChild(svgEl('polygon', {
            points: '100,22 98.5,100 101.5,100',
            fill: '#ffffff'
        }));
        n100.appendChild(svgEl('polygon', {
            points: '100,160 98.5,100 101.5,100',
            fill: '#555'
        }));
        svg.appendChild(n100);

        drawCenterDot(svg, 5, '#ccc');

        this._n10k = n10k;
        this._n1k  = n1k;
        this._n100 = n100;
    }

    render({ altitude }) {
        const alt = Math.max(0, altitude);
        const a100  = (alt % 1000)  / 1000  * 360;
        const a1k   = (alt % 10000) / 10000 * 360;
        const a10k  = alt           / 100000 * 360;
        this._n100.setAttribute('transform',  `rotate(${a100},  100, 100)`);
        this._n1k.setAttribute('transform',   `rotate(${a1k},   100, 100)`);
        this._n10k.setAttribute('transform',  `rotate(${a10k},  100, 100)`);
    }
};

// ---------------------------------------------------
// TURN COORDINATOR (TC)
// ---------------------------------------------------

window.Instruments.TC = class TC extends Instrument {
    init() {
        const svg = this.svg;
        drawBezel(svg);
        svg.appendChild(svgEl('circle', { cx: 100, cy: 100, r: 90, fill: '#0f0f1a' }));

        // Standard rate marks (wings at ±20° = standard rate = 3°/s)
        const marks = [
            { x: 52, label: 'L' },
            { x: 148, label: 'R' }
        ];
        marks.forEach(m => {
            svg.appendChild(svgEl('line', {
                x1: m.x, y1: 55, x2: m.x, y2: 70,
                stroke: '#ffffff', 'stroke-width': 2
            }));
        });

        // "L" and "R" labels
        const lText = svgEl('text', { x: 38, y: 68, 'text-anchor': 'middle', 'dominant-baseline': 'middle', fill: '#ccc', 'font-size': '14', 'font-family': 'Courier New', 'font-weight': 'bold' });
        lText.textContent = 'L';
        svg.appendChild(lText);
        const rText = svgEl('text', { x: 162, y: 68, 'text-anchor': 'middle', 'dominant-baseline': 'middle', fill: '#ccc', 'font-size': '14', 'font-family': 'Courier New', 'font-weight': 'bold' });
        rText.textContent = 'R';
        svg.appendChild(rText);

        // Miniature aircraft (rotates to show bank/turn rate)
        const acG = svgEl('g', { id: `${svg.id}-aircraft` });
        // fuselage
        acG.appendChild(svgEl('line', { x1: 100, y1: 74, x2: 100, y2: 110, stroke: '#ffffff', 'stroke-width': 3, 'stroke-linecap': 'round' }));
        // left wing
        acG.appendChild(svgEl('line', { x1: 60, y1: 95, x2: 100, y2: 95, stroke: '#ffffff', 'stroke-width': 4, 'stroke-linecap': 'round' }));
        // right wing
        acG.appendChild(svgEl('line', { x1: 100, y1: 95, x2: 140, y2: 95, stroke: '#ffffff', 'stroke-width': 4, 'stroke-linecap': 'round' }));
        // tail horizontal
        acG.appendChild(svgEl('line', { x1: 88, y1: 106, x2: 112, y2: 106, stroke: '#ffffff', 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
        svg.appendChild(acG);

        // Slip/skid inclinometer tube (curved bottom area)
        const tubeY = 148;
        svg.appendChild(svgEl('path', {
            d: `M 62,${tubeY} Q 100,${tubeY - 10} 138,${tubeY}`,
            stroke: '#555', 'stroke-width': 14, fill: 'none', 'stroke-linecap': 'round'
        }));
        svg.appendChild(svgEl('path', {
            d: `M 62,${tubeY} Q 100,${tubeY - 10} 138,${tubeY}`,
            stroke: '#222', 'stroke-width': 10, fill: 'none', 'stroke-linecap': 'round'
        }));
        // Center mark on tube
        svg.appendChild(svgEl('line', {
            x1: 100, y1: tubeY - 12, x2: 100, y2: tubeY + 2,
            stroke: '#444', 'stroke-width': 1.5
        }));
        // Outer marks
        [-20, 20].forEach(dx => {
            svg.appendChild(svgEl('line', {
                x1: 100 + dx, y1: tubeY - 11, x2: 100 + dx, y2: tubeY + 1,
                stroke: '#444', 'stroke-width': 1.5
            }));
        });

        // Ball (slip/skid indicator)
        const ball = svgEl('circle', {
            id: `${svg.id}-ball`,
            cx: 100, cy: tubeY - 4,
            r: 7, fill: '#111',
            stroke: '#aaa', 'stroke-width': 1.5
        });
        svg.appendChild(ball);

        this._aircraft = acG;
        this._ball = ball;
        this._tubeY = tubeY;
    }

    render({ turnRate, ballOffset }) {
        // Standard rate = 3°/s → wing tilt 20°
        const wingAngle = Math.max(-30, Math.min(30, turnRate * (20 / 3)));
        this._aircraft.setAttribute('transform', `rotate(${wingAngle}, 100, 95)`);

        // Ball offset: -1 (full left) to +1 (full right)
        const bx = 100 + (ballOffset * 22);
        this._ball.setAttribute('cx', bx);
        this._ball.setAttribute('cy', this._tubeY - 4);
    }
};

// ---------------------------------------------------
// HEADING INDICATOR / DIRECTIONAL GYRO (DI)
// ---------------------------------------------------

window.Instruments.DI = class DI extends Instrument {
    init() {
        const svg = this.svg;
        drawBezel(svg);

        // Clip
        const defs = svgEl('defs');
        const clip = svgEl('clipPath', { id: `${svg.id}-clip` });
        clip.appendChild(svgEl('circle', { cx: 100, cy: 100, r: 88 }));
        defs.appendChild(clip);
        svg.appendChild(defs);

        svg.appendChild(svgEl('circle', { cx: 100, cy: 100, r: 88, fill: '#111' }));

        // Compass rose group — the whole thing rotates
        const roseG = svgEl('g', {
            id: `${svg.id}-rose`,
            'clip-path': `url(#${svg.id}-clip)`
        });

        // Cardinal and intercardinal labels
        const cardinals = [
            { h: 0,   l: 'N' },
            { h: 90,  l: 'E' },
            { h: 180, l: 'S' },
            { h: 270, l: 'W' },
            { h: 45,  l: 'NE' },
            { h: 135, l: 'SE' },
            { h: 225, l: 'SW' },
            { h: 315, l: 'NW' }
        ];

        // Tick marks every 5°
        for (let h = 0; h < 360; h += 5) {
            const isMajor30 = h % 30 === 0;
            const isMajor10 = h % 10 === 0;
            const r1 = 88;
            const r2 = isMajor30 ? 72 : isMajor10 ? 78 : 83;
            const p1 = polarToXY(100, 100, r1, h);
            const p2 = polarToXY(100, 100, r2, h);
            roseG.appendChild(svgEl('line', {
                x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y,
                stroke: isMajor30 ? '#ddd' : '#666',
                'stroke-width': isMajor30 ? 2 : 1
            }));
            // Every 30°, draw degree number (except cardinal directions)
            if (isMajor30) {
                const isCardinal = cardinals.slice(0, 4).some(c => c.h === h);
                if (!isCardinal) {
                    const lp = polarToXY(100, 100, 63, h);
                    const t = svgEl('text', {
                        x: lp.x, y: lp.y,
                        'text-anchor': 'middle', 'dominant-baseline': 'middle',
                        fill: '#aaa', 'font-size': '9', 'font-family': 'Courier New'
                    });
                    t.textContent = h / 10 < 10 ? '0' + (h / 10) : '' + (h / 10);
                    roseG.appendChild(t);
                }
            }
        }

        // Cardinal and intercardinal labels
        cardinals.forEach(({ h, l }) => {
            const lp = polarToXY(100, 100, 63, h);
            const isMain = l.length === 1;
            const t = svgEl('text', {
                x: lp.x, y: lp.y,
                'text-anchor': 'middle', 'dominant-baseline': 'middle',
                fill: l === 'N' ? '#ff4444' : '#dddddd',
                'font-size': isMain ? '13' : '9',
                'font-family': 'Courier New',
                'font-weight': 'bold'
            });
            t.textContent = l;
            roseG.appendChild(t);
        });

        svg.appendChild(roseG);

        // Fixed lubber line (reference index at 12 o'clock — what the aircraft is pointing at)
        svg.appendChild(svgEl('polygon', {
            points: '100,14 95,26 105,26',
            fill: '#f0a500'
        }));
        svg.appendChild(svgEl('polygon', {
            points: '100,186 95,174 105,174',
            fill: '#444'
        }));

        // Center
        drawCenterDot(svg, 4, '#888');

        this._rose = roseG;
    }

    render({ heading }) {
        // Rose rotates opposite to heading (turning right → rose turns left)
        this._rose.setAttribute('transform', `rotate(${-heading}, 100, 100)`);
    }
};

// ---------------------------------------------------
// VERTICAL SPEED INDICATOR (VSI)
// ---------------------------------------------------

window.Instruments.VSI = class VSI extends Instrument {
    init() {
        const svg = this.svg;
        drawBezel(svg);
        svg.appendChild(svgEl('circle', { cx: 100, cy: 100, r: 90, fill: '#0d0d0d' }));

        // VSI scale: 0 ft/min = 9 o'clock (270°/left)
        // +2000 = 12 o'clock (0°/top)
        // -2000 = slightly past 6 o'clock but we'll use symmetric ±150° from 9 o'clock
        // Layout: 9 o'clock = 0, up-clockwise = climb, down-clockwise = descent
        // Angle for vspeed: 270 + (vspeed/2000)*150 degrees (from SVG top/12 o'clock = 0°)
        const vsiToAngle = vs => 270 - (vs / 2000) * 150;

        const labels = [
            { vs: 2000, label: '2' },
            { vs: 1000, label: '1' },
            { vs: 500,  label: '½' },
            { vs: 0,    label: '0' },
            { vs: -500, label: '½' },
            { vs: -1000,label: '1' },
            { vs: -2000,label: '2' }
        ];

        // Background arc (scale extent)
        svg.appendChild(svgEl('path', {
            d: makeArcPath(100, 100, 80, vsiToAngle(2000), vsiToAngle(-2000)),
            stroke: '#333', 'stroke-width': 10, fill: 'none'
        }));

        // Tick marks
        const ticks = [2000, 1500, 1000, 500, 0, -500, -1000, -1500, -2000];
        ticks.forEach(vs => {
            const angle = vsiToAngle(vs);
            const isMajor = vs % 1000 === 0;
            const r1 = 85, r2 = isMajor ? 72 : 78;
            const p1 = polarToXY(100, 100, r1, angle);
            const p2 = polarToXY(100, 100, r2, angle);
            svg.appendChild(svgEl('line', {
                x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y,
                stroke: '#ccc', 'stroke-width': isMajor ? 2.5 : 1.5
            }));
        });

        // Labels
        labels.forEach(({ vs, label }) => {
            const angle = vsiToAngle(vs);
            const lp = polarToXY(100, 100, 61, angle);
            const t = svgEl('text', {
                x: lp.x, y: lp.y,
                'text-anchor': 'middle', 'dominant-baseline': 'middle',
                fill: '#ccc', 'font-size': '11', 'font-family': 'Courier New',
                'font-weight': 'bold'
            });
            t.textContent = label;
            svg.appendChild(t);
        });

        // UP / DN labels
        const upT = svgEl('text', { x: 75, y: 48, 'text-anchor': 'middle', fill: '#888', 'font-size': '9', 'font-family': 'Courier New' });
        upT.textContent = 'UP';
        svg.appendChild(upT);
        const dnT = svgEl('text', { x: 75, y: 152, 'text-anchor': 'middle', fill: '#888', 'font-size': '9', 'font-family': 'Courier New' });
        dnT.textContent = 'DN';
        svg.appendChild(dnT);

        // "×100" label
        const unitT = svgEl('text', { x: 100, y: 128, 'text-anchor': 'middle', fill: '#666', 'font-size': '8', 'font-family': 'Courier New' });
        unitT.textContent = '×100 FT/MIN';
        svg.appendChild(unitT);

        // Needle
        const needleG = svgEl('g', { id: `${svg.id}-needle` });
        needleG.appendChild(svgEl('polygon', {
            points: '100,26 97.5,105 102.5,105',
            fill: '#ffffff'
        }));
        needleG.appendChild(svgEl('polygon', {
            points: '100,158 97.5,105 102.5,105',
            fill: '#555'
        }));
        svg.appendChild(needleG);
        drawCenterDot(svg, 5, '#ccc');

        this._needle = needleG;
        this._vsiToAngle = vsiToAngle;
    }

    render({ vspeed }) {
        const clamped = Math.max(-2000, Math.min(2000, vspeed));
        const angle = this._vsiToAngle(clamped);
        this._needle.setAttribute('transform', `rotate(${angle}, 100, 100)`);
    }
};
