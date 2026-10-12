/**
 * CYBER PINBALL ARCADE - 2026 EDITION
 * Engine: Canvas 2D + Web Audio API Procedural Synthesizer + Vector Physics Engine
 * Author: Codex Monorepo / Antigravity AI
 */

// ==========================================
// 1. WEB AUDIO API SYNTHESIZER
// ==========================================
class CyberAudioEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.isMuted = false;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
                this.masterGain = this.ctx.createGain();
                this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
                this.masterGain.connect(this.ctx.destination);
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setMuted(muted) {
        this.isMuted = muted;
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.3, this.ctx.currentTime);
        }
    }

    playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.4, pitchDecay = true) {
        if (this.isMuted || !this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const now = this.ctx.currentTime;

            osc.type = type;
            osc.frequency.setValueAtTime(freq, now);
            if (pitchDecay) {
                osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq * 0.4), now + duration);
            }

            gain.gain.setValueAtTime(gainVal, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(now);
            osc.stop(now + duration);
        } catch (e) {
            // Silently ignore audio context hiccups
        }
    }

    playFlipper(isUp) {
        if (this.isMuted || !this.ctx) return;
        this.playTone(isUp ? 280 : 160, 'triangle', 0.06, 0.35, true);
    }

    playBumper(pitchOffset = 0) {
        if (this.isMuted || !this.ctx) return;
        const baseFreq = 520 + pitchOffset * 80;
        this.playTone(baseFreq, 'sine', 0.18, 0.6, false);
        this.playTone(baseFreq * 1.5, 'triangle', 0.12, 0.3, true);
    }

    playSlingshot() {
        if (this.isMuted || !this.ctx) return;
        this.playTone(400, 'sawtooth', 0.08, 0.45, true);
        this.playTone(180, 'square', 0.09, 0.35, true);
    }

    playRollover(index = 0) {
        if (this.isMuted || !this.ctx) return;
        const scale = [440, 494, 554, 659, 740]; // Cyber A-major pentatonic
        const freq = scale[index % scale.length];
        this.playTone(freq, 'sine', 0.15, 0.4, false);
    }

    playDropTarget() {
        if (this.isMuted || !this.ctx) return;
        this.playTone(320, 'square', 0.12, 0.4, true);
    }

    playJackpot() {
        if (this.isMuted || !this.ctx) return;
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        notes.forEach((note, i) => {
            setTimeout(() => this.playTone(note, 'triangle', 0.22, 0.5, false), i * 70);
        });
    }

    playPlungerLaunch(powerRatio) {
        if (this.isMuted || !this.ctx) return;
        this.playTone(120 + powerRatio * 350, 'sawtooth', 0.25, 0.5, true);
    }

    playDrain() {
        if (this.isMuted || !this.ctx) return;
        const notes = [300, 240, 180, 120, 80];
        notes.forEach((note, i) => {
            setTimeout(() => this.playTone(note, 'sawtooth', 0.18, 0.4, true), i * 90);
        });
    }

    playCoin() {
        if (this.isMuted || !this.ctx) return;
        this.playTone(987.77, 'sine', 0.09, 0.5, false); // B5
        setTimeout(() => this.playTone(1318.51, 'sine', 0.25, 0.5, false), 90); // E6
    }

    playTilt() {
        if (this.isMuted || !this.ctx) return;
        this.playTone(110, 'sawtooth', 0.4, 0.7, false);
    }

    playNudge() {
        if (this.isMuted || !this.ctx) return;
        this.playTone(90, 'triangle', 0.1, 0.5, true);
    }
}

// ==========================================
// 2. VECTOR MATH & PHYSICS UTILITIES
// ==========================================
class Vec2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    set(x, y) { this.x = x; this.y = y; return this; }
    add(v) { this.x += v.x; this.y += v.y; return this; }
    sub(v) { this.x -= v.x; this.y -= v.y; return this; }
    mult(n) { this.x *= n; this.y *= n; return this; }
    dot(v) { return this.x * v.x + this.y * v.y; }
    magSq() { return this.x * this.x + this.y * this.y; }
    mag() { return Math.sqrt(this.magSq()); }
    normalize() {
        const m = this.mag();
        if (m > 0.0001) { this.x /= m; this.y /= m; }
        return this;
    }
    copy() { return new Vec2(this.x, this.y); }
}

// ==========================================
// 3. PARTICLE & FX SYSTEM
// ==========================================
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.popups = [];
    }

    emitSparks(x, y, count = 12, color = '#00f0ff') {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.5 + Math.random() * 4.5;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color,
                life: 1.0,
                decay: 0.02 + Math.random() * 0.03,
                size: 2 + Math.random() * 3
            });
        }
    }

    emitScorePopup(x, y, text, color = '#ffe600') {
        this.popups.push({
            x, y,
            text,
            color,
            life: 1.0,
            vy: -1.2,
            scale: 1.2
        });
    }

    update() {
        // Update sparks
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.96;
            p.vy *= 0.96;
            p.life -= p.decay;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Update popups
        for (let i = this.popups.length - 1; i >= 0; i--) {
            const pop = this.popups[i];
            pop.y += pop.vy;
            pop.life -= 0.022;
            pop.scale = Math.max(0.9, pop.scale * 0.98);
            if (pop.life <= 0) {
                this.popups.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        // Draw sparks
        ctx.save();
        this.particles.forEach(p => {
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();

        // Draw popups
        ctx.save();
        ctx.font = 'bold 15px "Orbitron", sans-serif';
        ctx.textAlign = 'center';
        this.popups.forEach(pop => {
            ctx.globalAlpha = Math.max(0, pop.life);
            ctx.fillStyle = pop.color;
            ctx.shadowColor = pop.color;
            ctx.shadowBlur = 10;
            ctx.fillText(pop.text, pop.x, pop.y);
        });
        ctx.restore();
    }

    clear() {
        this.particles = [];
        this.popups = [];
    }
}

// ==========================================
// 4. GAME OBJECTS (FLIPPERS, BUMPERS, TARGETS)
// ==========================================

class Flipper {
    constructor(x, y, length, baseAngleDeg, activeAngleDeg, isLeft) {
        this.pivot = new Vec2(x, y);
        this.length = length;
        this.baseAngle = (baseAngleDeg * Math.PI) / 180;
        this.activeAngle = (activeAngleDeg * Math.PI) / 180;
        this.currentAngle = this.baseAngle;
        this.angularVelocity = 0;
        this.isLeft = isLeft;
        this.isPressed = false;
        this.thickness = 10;
        this.tipRadius = 5;
        this.swingSpeed = 0.32; // Radians per tick
        this.returnSpeed = 0.22;
    }

    update() {
        const targetAngle = this.isPressed ? this.activeAngle : this.baseAngle;
        const prevAngle = this.currentAngle;

        if (this.isLeft) {
            if (this.isPressed) {
                this.currentAngle = Math.max(this.activeAngle, this.currentAngle - this.swingSpeed);
            } else {
                this.currentAngle = Math.min(this.baseAngle, this.currentAngle + this.returnSpeed);
            }
        } else {
            if (this.isPressed) {
                this.currentAngle = Math.min(this.activeAngle, this.currentAngle + this.swingSpeed);
            } else {
                this.currentAngle = Math.max(this.baseAngle, this.currentAngle - this.returnSpeed);
            }
        }

        this.angularVelocity = this.currentAngle - prevAngle;
    }

    getTip() {
        return new Vec2(
            this.pivot.x + Math.cos(this.currentAngle) * this.length,
            this.pivot.y + Math.sin(this.currentAngle) * this.length
        );
    }

    draw(ctx) {
        const tip = this.getTip();
        ctx.save();
        ctx.strokeStyle = this.isLeft ? '#00f0ff' : '#ff00e5';
        ctx.fillStyle = this.isLeft ? 'rgba(0, 240, 255, 0.4)' : 'rgba(255, 0, 229, 0.4)';
        ctx.shadowColor = this.isLeft ? '#00f0ff' : '#ff00e5';
        ctx.shadowBlur = 12;
        ctx.lineWidth = this.thickness;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(this.pivot.x, this.pivot.y);
        ctx.lineTo(tip.x, tip.y);
        ctx.stroke();

        // Pivot cap
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.pivot.x, this.pivot.y, 6, 0, Math.PI * 2);
        ctx.fill();

        // Tip glow
        ctx.fillStyle = this.isLeft ? '#00f0ff' : '#ff00e5';
        ctx.beginPath();
        ctx.arc(tip.x, tip.y, this.tipRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

class Bumper {
    constructor(x, y, radius, label, color, scoreValue) {
        this.pos = new Vec2(x, y);
        this.radius = radius;
        this.label = label;
        this.color = color;
        this.scoreValue = scoreValue;
        this.hitAnim = 0; // Animation counter
    }

    trigger() {
        this.hitAnim = 1.0;
    }

    update() {
        if (this.hitAnim > 0) {
            this.hitAnim = Math.max(0, this.hitAnim - 0.06);
        }
    }

    draw(ctx) {
        ctx.save();
        const glowScale = 1 + this.hitAnim * 0.25;
        const r = this.radius * glowScale;

        // Outer glow circle
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15 + this.hitAnim * 25;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3 + this.hitAnim * 4;

        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, r, 0, Math.PI * 2);
        ctx.stroke();

        // Inner fill
        const gradient = ctx.createRadialGradient(
            this.pos.x, this.pos.y, 2,
            this.pos.x, this.pos.y, r
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.4, this.color);
        gradient.addColorStop(1, 'rgba(10, 0, 30, 0.8)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, r - 3, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 11px "Orbitron", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 4;
        ctx.fillText(this.label, this.pos.x, this.pos.y);

        ctx.restore();
    }
}

class Slingshot {
    constructor(p1, p2, p3, isLeft, color = '#ff00e5') {
        this.p1 = p1; // Top
        this.p2 = p2; // Outer corner
        this.p3 = p3; // Bottom inner
        this.isLeft = isLeft;
        this.color = color;
        this.hitAnim = 0;
    }

    trigger() {
        this.hitAnim = 1.0;
    }

    update() {
        if (this.hitAnim > 0) {
            this.hitAnim = Math.max(0, this.hitAnim - 0.08);
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.strokeStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10 + this.hitAnim * 20;
        ctx.lineWidth = 3 + this.hitAnim * 3;
        ctx.fillStyle = this.hitAnim > 0 ? 'rgba(255, 0, 229, 0.35)' : 'rgba(20, 5, 40, 0.6)';

        ctx.beginPath();
        ctx.moveTo(this.p1.x, this.p1.y);
        ctx.lineTo(this.p2.x, this.p2.y);
        ctx.lineTo(this.p3.x, this.p3.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Kicker band line (p1 to p3)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2 + this.hitAnim * 2;
        ctx.beginPath();
        ctx.moveTo(this.p1.x, this.p1.y);
        ctx.lineTo(this.p3.x, this.p3.y);
        ctx.stroke();

        ctx.restore();
    }
}

class DropTarget {
    constructor(x, y, width, height, char, color = '#00f0ff') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.char = char;
        this.color = color;
        this.isDown = false;
        this.hitAnim = 0;
    }

    hit() {
        if (!this.isDown) {
            this.isDown = true;
            this.hitAnim = 1.0;
            return true;
        }
        return false;
    }

    reset() {
        this.isDown = false;
        this.hitAnim = 0;
    }

    draw(ctx) {
        ctx.save();
        if (this.isDown) {
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        } else {
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 10;
            ctx.fillStyle = 'rgba(0, 240, 255, 0.25)';
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.strokeRect(this.x, this.y, this.width, this.height);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px "Orbitron", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.char, this.x + this.width / 2, this.y + this.height / 2);
        }
        ctx.restore();
    }
}

class RolloverLane {
    constructor(x, y, width, letter) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.letter = letter;
        this.isLit = false;
    }

    trigger() {
        this.isLit = !this.isLit;
        return this.isLit;
    }

    draw(ctx) {
        ctx.save();
        const color = this.isLit ? '#ffe600' : '#444466';
        ctx.shadowColor = this.isLit ? '#ffe600' : 'transparent';
        ctx.shadowBlur = this.isLit ? 12 : 0;
        ctx.fillStyle = color;
        ctx.font = '900 13px "Orbitron", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.letter, this.x + this.width / 2, this.y);

        // Arrow or line marker
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x + 3, this.y + 6);
        ctx.lineTo(this.x + this.width / 2, this.y + 12);
        ctx.lineTo(this.x + this.width - 3, this.y + 6);
        ctx.stroke();

        ctx.restore();
    }
}

// ==========================================
// 5. MAIN PINBALL GAME ENGINE
// ==========================================
class CyberPinballGame {
    constructor() {
        this.canvas = document.getElementById('pinballCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.audio = new CyberAudioEngine();
        this.particles = new ParticleSystem();

        // Game state
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('cyber_pinball_high_score') || '0', 10);
        this.ballsLeft = 3;
        this.multiplier = 1;
        this.isPaused = false;
        this.isGameOver = false;
        this.gameStarted = false;
        this.soundEnabled = true;
        this.eventLog = [];

        // Ball Saver
        this.ballSaverTime = 0;
        this.maxBallSaverDuration = 600; // ~10 seconds at 60fps

        // Plunger Spring
        this.plungerCharge = 0; // 0 to 1
        this.isPlungerCharging = false;
        this.plungerMaxForce = 21.5;

        // Tilt System
        this.nudgeCount = 0;
        this.lastNudgeTime = 0;
        this.isTilted = false;
        this.tiltTimer = 0;

        // Ball Trail
        this.ballHistory = [];

        // Physics Constants
        this.gravity = new Vec2(0, 0.22); // Table slope gravity
        this.tableFriction = 0.994;
        this.ballRadius = 9;

        // Initialize Ball
        this.ball = {
            pos: new Vec2(475, 700),
            vel: new Vec2(0, 0),
            radius: this.ballRadius,
            inPlungerLane: true,
            isDead: false
        };

        this.initTableLayout();
        this.bindEvents();
        this.updateUI();

        // Start Game Loop
        this.lastFrameTime = performance.now();
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    initTableLayout() {
        // Table Boundaries & Static Wall Segments
        this.walls = [
            // Outer right plunger lane wall
            { p1: new Vec2(495, 120), p2: new Vec2(495, 780), color: '#b400ff' },
            // Inner right plunger lane partition
            { p1: new Vec2(455, 200), p2: new Vec2(455, 780), color: '#b400ff' },
            // Top curved arch approx segments
            { p1: new Vec2(495, 120), p2: new Vec2(470, 40), color: '#00f0ff' },
            { p1: new Vec2(470, 40), p2: new Vec2(370, 10), color: '#00f0ff' },
            { p1: new Vec2(370, 10), p2: new Vec2(130, 10), color: '#00f0ff' },
            { p1: new Vec2(130, 10), p2: new Vec2(30, 40), color: '#00f0ff' },
            { p1: new Vec2(30, 40), p2: new Vec2(5, 120), color: '#00f0ff' },
            // Outer left wall
            { p1: new Vec2(5, 120), p2: new Vec2(5, 780), color: '#00f0ff' },

            // Left Inlane / Outlane Guides
            { p1: new Vec2(40, 520), p2: new Vec2(40, 680), color: '#00f0ff' },
            { p1: new Vec2(40, 680), p2: new Vec2(140, 750), color: '#00f0ff' },
            { p1: new Vec2(90, 550), p2: new Vec2(90, 670), color: '#00f0ff' },
            { p1: new Vec2(90, 670), p2: new Vec2(140, 680), color: '#00f0ff' },

            // Right Inlane / Outlane Guides
            { p1: new Vec2(420, 520), p2: new Vec2(420, 680), color: '#ff00e5' },
            { p1: new Vec2(420, 680), p2: new Vec2(360, 750), color: '#ff00e5' },
            { p1: new Vec2(370, 550), p2: new Vec2(370, 670), color: '#ff00e5' },
            { p1: new Vec2(370, 670), p2: new Vec2(360, 680), color: '#ff00e5' },

            // Top Deflector near top arch
            { p1: new Vec2(455, 200), p2: new Vec2(420, 140), color: '#ffe600' },
            { p1: new Vec2(80, 140), p2: new Vec2(30, 200), color: '#ffe600' }
        ];

        // 3 Glowing Bumpers
        this.bumpers = [
            new Bumper(175, 250, 24, 'CYBER', '#00f0ff', 250),
            new Bumper(325, 250, 24, 'MATRIX', '#ff00e5', 250),
            new Bumper(250, 340, 28, 'NEON', '#ffe600', 500)
        ];

        // 2 Slingshots
        this.slingshots = [
            new Slingshot(new Vec2(95, 550), new Vec2(60, 630), new Vec2(130, 665), true, '#00f0ff'),
            new Slingshot(new Vec2(365, 550), new Vec2(400, 630), new Vec2(330, 665), false, '#ff00e5')
        ];

        // Drop Targets (CYBER: C, Y, B)
        this.dropTargets = [
            new DropTarget(45, 270, 16, 26, 'C', '#00f0ff'),
            new DropTarget(45, 310, 16, 26, 'Y', '#00f0ff'),
            new DropTarget(45, 350, 16, 26, 'B', '#00f0ff')
        ];

        // Rollover Lanes (L-E-V-E-L)
        this.rolloverLanes = [
            new RolloverLane(120, 95, 35, 'L'),
            new RolloverLane(170, 85, 35, 'E'),
            new RolloverLane(232, 80, 35, 'V'),
            new RolloverLane(295, 85, 35, 'E'),
            new RolloverLane(345, 95, 35, 'L')
        ];

        // 2 Flippers
        // Left flipper pivot (140, 680), Right flipper pivot (360, 680)
        this.leftFlipper = new Flipper(140, 680, 78, 28, -26, true);
        this.rightFlipper = new Flipper(360, 680, 78, 152, 206, false);
    }

    bindEvents() {
        // Keyboard controls
        window.addEventListener('keydown', (e) => {
            if (e.repeat) return;
            this.audio.init();

            if (!this.gameStarted) {
                this.startGame();
                return;
            }

            if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
                if (!this.isTilted) {
                    this.leftFlipper.isPressed = true;
                    this.audio.playFlipper(true);
                }
            } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
                if (!this.isTilted) {
                    this.rightFlipper.isPressed = true;
                    this.audio.playFlipper(true);
                }
            } else if (e.code === 'Space') {
                if (this.isGameOver) {
                    this.restartGame();
                } else if (this.ball.inPlungerLane) {
                    this.isPlungerCharging = true;
                }
            } else if (e.code === 'KeyP') {
                this.togglePause();
            } else if (e.code === 'KeyN' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
                this.nudgeTable();
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
                this.leftFlipper.isPressed = false;
                if (!this.isTilted) this.audio.playFlipper(false);
            } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
                this.rightFlipper.isPressed = false;
                if (!this.isTilted) this.audio.playFlipper(false);
            } else if (e.code === 'Space') {
                if (this.isPlungerCharging) {
                    this.launchBall();
                }
            }
        });

        // UI Buttons
        document.getElementById('btn-sound').addEventListener('click', () => {
            this.soundEnabled = !this.soundEnabled;
            this.audio.setMuted(!this.soundEnabled);
            this.updateUI();
            this.logEvent('system', `SONIDO: ${this.soundEnabled ? 'ACTIVADO' : 'SILENCIADO'}`);
        });

        document.getElementById('btn-restart').addEventListener('click', () => {
            this.restartGame();
        });

        document.getElementById('btn-insert-coin-overlay').addEventListener('click', () => {
            this.insertCoin();
        });

        ['coin-slot-1', 'coin-slot-2'].forEach(id => {
            const slot = document.getElementById(id);
            if (slot) {
                slot.addEventListener('click', () => this.insertCoin());
            }
        });

        // Mobile Touch Controls
        const btnLeft = document.getElementById('touch-left-flipper');
        const btnRight = document.getElementById('touch-right-flipper');
        const btnPlunger = document.getElementById('touch-plunger');
        const btnNudge = document.getElementById('touch-nudge');

        const bindTouch = (el, onStart, onEnd) => {
            if (!el) return;
            el.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.audio.init();
                if (!this.gameStarted) this.startGame();
                el.classList.add('active');
                onStart();
            });
            el.addEventListener('touchend', (e) => {
                e.preventDefault();
                el.classList.remove('active');
                onEnd();
            });
            el.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.audio.init();
                if (!this.gameStarted) this.startGame();
                el.classList.add('active');
                onStart();
            });
            el.addEventListener('mouseup', (e) => {
                e.preventDefault();
                el.classList.remove('active');
                onEnd();
            });
        };

        bindTouch(btnLeft,
            () => { if (!this.isTilted) { this.leftFlipper.isPressed = true; this.audio.playFlipper(true); } },
            () => { this.leftFlipper.isPressed = false; if (!this.isTilted) this.audio.playFlipper(false); }
        );

        bindTouch(btnRight,
            () => { if (!this.isTilted) { this.rightFlipper.isPressed = true; this.audio.playFlipper(true); } },
            () => { this.rightFlipper.isPressed = false; if (!this.isTilted) this.audio.playFlipper(false); }
        );

        bindTouch(btnPlunger,
            () => {
                if (this.isGameOver) this.restartGame();
                else if (this.ball.inPlungerLane) this.isPlungerCharging = true;
            },
            () => { if (this.isPlungerCharging) this.launchBall(); }
        );

        bindTouch(btnNudge, () => this.nudgeTable(), () => {});
    }

    insertCoin() {
        this.audio.init();
        this.audio.playCoin();
        this.logEvent('score', '+1 CRÉDITO INSERTADO');
        this.particles.emitSparks(475, 750, 20, '#ffe600');
        if (!this.gameStarted || this.isGameOver) {
            this.startGame();
        }
    }

    startGame() {
        this.gameStarted = true;
        this.isGameOver = false;
        this.score = 0;
        this.ballsLeft = 3;
        this.multiplier = 1;
        this.ballSaverTime = this.maxBallSaverDuration;
        this.resetDropTargets();
        this.resetRolloverLanes();
        this.resetBallToPlunger();

        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('gameover-screen').classList.add('hidden');
        document.getElementById('pause-screen').classList.add('hidden');
        document.getElementById('tilt-screen').classList.add('hidden');

        this.updateUI();
        this.logEvent('system', 'SISTEMA INICIADO — PARTIDA LISTA');
        this.logEvent('system', 'MANTÉN ESPACIO PARA LANZAR');
    }

    restartGame() {
        this.startGame();
    }

    resetBallToPlunger() {
        this.ball.pos.set(475, 720);
        this.ball.vel.set(0, 0);
        this.ball.inPlungerLane = true;
        this.ball.isDead = false;
        this.plungerCharge = 0;
        this.isPlungerCharging = false;
        this.ballSaverTime = this.maxBallSaverDuration;
        this.ballHistory = [];
    }

    launchBall() {
        this.isPlungerCharging = false;
        const force = Math.max(8, this.plungerCharge * this.plungerMaxForce);
        this.ball.vel.set(0, -force);
        this.ball.inPlungerLane = false;
        this.audio.playPlungerLaunch(this.plungerCharge);
        this.particles.emitSparks(this.ball.pos.x, this.ball.pos.y + 15, 15, '#ffe600');
        this.logEvent('system', `BOLA LANZADA (${Math.round(this.plungerCharge * 100)}% POTENCIA)`);
        this.plungerCharge = 0;
    }

    nudgeTable() {
        if (this.isTilted || this.ball.inPlungerLane) return;

        const now = performance.now();
        if (now - this.lastNudgeTime < 4000) {
            this.nudgeCount++;
        } else {
            this.nudgeCount = 1;
        }
        this.lastNudgeTime = now;

        // Shake canvas cabinet
        const cabinet = document.getElementById('canvasWrapper');
        cabinet.classList.remove('table-tilt-shake');
        void cabinet.offsetWidth; // Trigger reflow
        cabinet.classList.add('table-tilt-shake');

        if (this.nudgeCount >= 3) {
            // TILT LOCKOUT!
            this.isTilted = true;
            this.tiltTimer = 180; // ~3s
            this.leftFlipper.isPressed = false;
            this.rightFlipper.isPressed = false;
            this.audio.playTilt();
            document.getElementById('tilt-screen').classList.remove('hidden');
            this.logEvent('tilt', '¡¡ TILT !! SACUDIDA EXCESIVA');
        } else {
            this.audio.playNudge();
            const nudgeDir = (Math.random() - 0.5) * 2.8;
            this.ball.vel.x += nudgeDir;
            this.ball.vel.y -= 1.8;
            this.logEvent('system', `SACUDIDA (${this.nudgeCount}/3)`);
        }
    }

    togglePause() {
        if (this.isGameOver || !this.gameStarted) return;
        this.isPaused = !this.isPaused;
        document.getElementById('pause-screen').classList.toggle('hidden', !this.isPaused);
        this.logEvent('system', this.isPaused ? 'JUEGO PAUSADO' : 'JUEGO REANUDADO');
    }

    addScore(pts, reason = '') {
        const total = pts * this.multiplier;
        this.score += total;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('cyber_pinball_high_score', this.highScore.toString());
        }
        this.updateUI();
        if (reason) {
            this.logEvent('score', `+${total.toLocaleString()} ${reason}`);
        }
    }

    resetDropTargets() {
        this.dropTargets.forEach(t => t.reset());
    }

    resetRolloverLanes() {
        this.rolloverLanes.forEach(r => r.isLit = false);
    }

    updateUI() {
        document.getElementById('score').textContent = this.score.toString().padStart(7, '0');
        document.getElementById('high-score').textContent = this.highScore.toString().padStart(7, '0');
        document.getElementById('balls-left').textContent = this.ballsLeft;
        document.getElementById('multiplier').textContent = `x${this.multiplier}`;
        document.getElementById('btn-sound').textContent = `SONIDO: ${this.soundEnabled ? 'ON' : 'OFF'}`;

        const saverEl = document.getElementById('ball-saver-status');
        if (saverEl) {
            if (this.ballSaverTime > 0) {
                saverEl.textContent = 'ACTIVO';
                saverEl.style.color = '#00f0ff';
            } else {
                saverEl.textContent = 'INACTIVO';
                saverEl.style.color = '#7d7da0';
            }
        }
    }

    logEvent(type, message) {
        this.eventLog.push({ type, message });
        const logElement = document.getElementById('event-log');
        if (logElement) {
            const div = document.createElement('div');
            div.className = `log-entry ${type}`;
            div.textContent = `> ${message}`;
            logElement.appendChild(div);
            if (logElement.children.length > 25) {
                logElement.removeChild(logElement.children[0]);
            }
            logElement.scrollTop = logElement.scrollHeight;
        }
    }

    // ==========================================
    // 6. PHYSICS SIMULATION STEP
    // ==========================================
    updatePhysics() {
        if (this.isPaused || !this.gameStarted || this.isGameOver) return;

        // Tilt lockout timer
        if (this.isTilted) {
            this.tiltTimer--;
            if (this.tiltTimer <= 0) {
                this.isTilted = false;
                this.nudgeCount = 0;
                document.getElementById('tilt-screen').classList.add('hidden');
            }
        }

        // Ball saver timer
        if (this.ballSaverTime > 0) {
            this.ballSaverTime--;
            if (this.ballSaverTime === 0) {
                this.updateUI();
                this.logEvent('system', 'SALVA-BOLAS EXPIRADO');
            }
        }

        // Plunger spring charging
        if (this.isPlungerCharging) {
            this.plungerCharge = Math.min(1.0, this.plungerCharge + 0.025);
        }

        // Update flippers
        this.leftFlipper.update();
        this.rightFlipper.update();

        // Update animated objects
        this.bumpers.forEach(b => b.update());
        this.slingshots.forEach(s => s.update());
        this.particles.update();

        // Plunger lane idle ball
        if (this.ball.inPlungerLane) {
            this.ball.pos.set(475, 720 + this.plungerCharge * 18);
            this.ball.vel.set(0, 0);
            return;
        }

        // Sub-stepping for tunneling prevention (4 sub-steps per frame)
        const subSteps = 4;
        for (let step = 0; step < subSteps; step++) {
            // Apply forces
            this.ball.vel.add(new Vec2(this.gravity.x / subSteps, this.gravity.y / subSteps));
            this.ball.vel.mult(Math.pow(this.tableFriction, 1 / subSteps));

            // Cap max velocity
            const speed = this.ball.vel.mag();
            if (speed > 24) {
                this.ball.vel.mult(24 / speed);
            }

            // Move ball
            this.ball.pos.x += this.ball.vel.x / subSteps;
            this.ball.pos.y += this.ball.vel.y / subSteps;

            // Collisions with walls
            this.walls.forEach(w => this.collideBallWithSegment(w.p1, w.p2, 0.72));

            // Collisions with Bumpers
            this.bumpers.forEach(bumper => {
                const diff = this.ball.pos.copy().sub(bumper.pos);
                const dist = diff.mag();
                const minDist = this.ball.radius + bumper.radius;
                if (dist < minDist && dist > 0.0001) {
                    const normal = diff.copy().normalize();
                    // Move out of penetration
                    this.ball.pos = bumper.pos.copy().add(normal.copy().mult(minDist + 0.5));
                    // Dynamic impulse bounce
                    const impulse = 8.5;
                    this.ball.vel = normal.copy().mult(impulse);

                    bumper.trigger();
                    this.particles.emitSparks(bumper.pos.x, bumper.pos.y, 14, bumper.color);
                    this.particles.emitScorePopup(bumper.pos.x, bumper.pos.y - 20, `+${bumper.scoreValue * this.multiplier}`, bumper.color);
                    this.audio.playBumper(this.bumpers.indexOf(bumper));
                    this.addScore(bumper.scoreValue, `GOLPE EN ${bumper.label}`);
                }
            });

            // Collisions with Slingshots
            this.slingshots.forEach(sling => {
                // Check kicker line (p1 to p3)
                const collided = this.collideBallWithSegment(sling.p1, sling.p3, 0.85);
                if (collided) {
                    sling.trigger();
                    const kickDir = sling.isLeft ? new Vec2(1, -0.6).normalize() : new Vec2(-1, -0.6).normalize();
                    this.ball.vel.add(kickDir.mult(6.5));
                    this.particles.emitSparks(this.ball.pos.x, this.ball.pos.y, 12, sling.color);
                    this.particles.emitScorePopup(this.ball.pos.x, this.ball.pos.y - 15, `+${150 * this.multiplier}`, sling.color);
                    this.audio.playSlingshot();
                    this.addScore(150, 'SLINGSHOT');
                }
            });

            // Collisions with Drop Targets
            this.dropTargets.forEach(target => {
                if (!target.isDown) {
                    if (this.ball.pos.x + this.ball.radius > target.x &&
                        this.ball.pos.x - this.ball.radius < target.x + target.width &&
                        this.ball.pos.y + this.ball.radius > target.y &&
                        this.ball.pos.y - this.ball.radius < target.y + target.height) {
                        
                        target.hit();
                        this.ball.vel.x = Math.abs(this.ball.vel.x) + 2; // Bounce right
                        this.particles.emitSparks(target.x + 8, target.y + 13, 16, target.color);
                        this.particles.emitScorePopup(target.x + 8, target.y - 10, `+${300 * this.multiplier}`, target.color);
                        this.audio.playDropTarget();
                        this.addScore(300, `DIANA ${target.char}`);

                        // Check if all targets down -> JACKPOT!
                        if (this.dropTargets.every(t => t.isDown)) {
                            this.audio.playJackpot();
                            this.addScore(2500, '★ CYBER JACKPOT ★');
                            this.particles.emitSparks(250, 400, 35, '#ffe600');
                            this.particles.emitScorePopup(250, 380, '★ JACKPOT +2,500 ★', '#ffe600');
                            this.logEvent('jackpot', '¡¡ CYBER JACKPOT COMPLETADO !!');
                            setTimeout(() => this.resetDropTargets(), 1500);
                        }
                    }
                }
            });

            // Rollover Lanes Check
            this.rolloverLanes.forEach((lane, idx) => {
                if (this.ball.pos.x > lane.x && this.ball.pos.x < lane.x + lane.width &&
                    Math.abs(this.ball.pos.y - lane.y) < 14) {
                    if (!lane.isLit) {
                        lane.isLit = true;
                        this.audio.playRollover(idx);
                        this.particles.emitSparks(lane.x + lane.width / 2, lane.y, 8, '#ffe600');
                        this.addScore(200, `CARRIL ${lane.letter}`);

                        // Check if all lanes lit -> Multiplier Up!
                        if (this.rolloverLanes.every(l => l.isLit)) {
                            this.multiplier = Math.min(5, this.multiplier + 1);
                            this.audio.playJackpot();
                            this.addScore(1000, `MULTIPLICADOR A x${this.multiplier}`);
                            this.particles.emitScorePopup(250, 120, `MULTIPLICADOR x${this.multiplier}!`, '#00ff88');
                            this.logEvent('score', `¡BONIFICACIÓN! MULTIPLICADOR A x${this.multiplier}`);
                            setTimeout(() => this.resetRolloverLanes(), 1200);
                        }
                    }
                }
            });

            // Collisions with Flippers
            this.collideBallWithFlipper(this.leftFlipper);
            this.collideBallWithFlipper(this.rightFlipper);
        }

        // Record ball history for glowing trail
        this.ballHistory.push(this.ball.pos.copy());
        if (this.ballHistory.length > 8) {
            this.ballHistory.shift();
        }

        // Check Drain (bottom of table)
        if (this.ball.pos.y > 780) {
            if (this.ballSaverTime > 0) {
                // Save Ball!
                this.audio.playCoin();
                this.logEvent('system', '¡SALVA-BOLAS ACTIVADO!');
                this.particles.emitSparks(this.ball.pos.x, 750, 25, '#00f0ff');
                this.resetBallToPlunger();
            } else {
                // Ball Lost
                this.audio.playDrain();
                this.ballsLeft--;
                this.multiplier = 1;
                this.updateUI();
                this.logEvent('system', `BOLA PERDIDA — QUEDAN ${this.ballsLeft}`);

                if (this.ballsLeft <= 0) {
                    this.gameOver();
                } else {
                    this.resetBallToPlunger();
                }
            }
        }
    }

    collideBallWithSegment(p1, p2, restitution = 0.75) {
        const seg = p2.copy().sub(p1);
        const segLenSq = seg.magSq();
        if (segLenSq === 0) return false;

        const toBall = this.ball.pos.copy().sub(p1);
        let t = toBall.dot(seg) / segLenSq;
        t = Math.max(0, Math.min(1, t));

        const closest = p1.copy().add(seg.mult(t));
        const diff = this.ball.pos.copy().sub(closest);
        const dist = diff.mag();

        if (dist < this.ball.radius && dist > 0.0001) {
            const normal = diff.copy().normalize();
            this.ball.pos = closest.copy().add(normal.copy().mult(this.ball.radius + 0.2));

            // Reflect velocity: v' = v - (1 + e) * (v . n) * n
            const vn = this.ball.vel.dot(normal);
            if (vn < 0) {
                this.ball.vel.sub(normal.mult((1 + restitution) * vn));
            }
            return true;
        }
        return false;
    }

    collideBallWithFlipper(flipper) {
        const p1 = flipper.pivot;
        const p2 = flipper.getTip();
        const seg = p2.copy().sub(p1);
        const segLen = seg.mag();
        if (segLen === 0) return;

        const segNorm = seg.copy().normalize();
        const toBall = this.ball.pos.copy().sub(p1);
        let t = toBall.dot(segNorm) / segLen;
        t = Math.max(0, Math.min(1, t));

        const closest = p1.copy().add(segNorm.mult(t * segLen));
        const diff = this.ball.pos.copy().sub(closest);
        const dist = diff.mag();
        const effectiveRadius = this.ball.radius + flipper.thickness / 2;

        if (dist < effectiveRadius && dist > 0.0001) {
            const normal = diff.copy().normalize();
            this.ball.pos = closest.copy().add(normal.copy().mult(effectiveRadius + 0.5));

            // Calculate rotational velocity at contact point: V_tan = omega * r
            const contactDist = t * segLen;
            const linearVelocityOfBlade = flipper.angularVelocity * contactDist * 55;

            // Normal impulse
            let vn = this.ball.vel.dot(normal);
            if (vn < 0) {
                this.ball.vel.sub(normal.copy().mult((1 + 0.65) * vn));
            }

            // Flipper swing kick
            if (Math.abs(flipper.angularVelocity) > 0.01) {
                const kickImpulse = normal.copy().mult(Math.abs(linearVelocityOfBlade));
                this.ball.vel.add(kickImpulse);
                this.particles.emitSparks(closest.x, closest.y, 8, flipper.isLeft ? '#00f0ff' : '#ff00e5');
                this.addScore(50);
            }
        }
    }

    gameOver() {
        this.isGameOver = true;
        document.getElementById('final-score').textContent = this.score.toLocaleString();
        document.getElementById('gameover-screen').classList.remove('hidden');
        this.audio.playGameOver();
        this.logEvent('system', '=== GAME OVER ===');
    }

    // ==========================================
    // 7. RENDER PASS (CANVAS 2D)
    // ==========================================
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Cyber Grid Table Background
        this.drawTableBackground();

        // Rollover Lanes
        this.rolloverLanes.forEach(l => l.draw(this.ctx));

        // Drop Targets
        this.dropTargets.forEach(t => t.draw(this.ctx));

        // Slingshots
        this.slingshots.forEach(s => s.draw(this.ctx));

        // Bumpers
        this.bumpers.forEach(b => b.draw(this.ctx));

        // Static Table Walls
        this.drawWalls();

        // Ball Saver Laser Gate
        if (this.ballSaverTime > 0) {
            this.drawBallSaverGate();
        }

        // Flippers
        this.leftFlipper.draw(this.ctx);
        this.rightFlipper.draw(this.ctx);

        // Plunger Power Gauge & Spring
        this.drawPlungerSpring();

        // Ball & Glowing Motion Trail
        this.drawBall();

        // Particles & Floating Scores
        this.particles.draw(this.ctx);
    }

    drawTableBackground() {
        const ctx = this.ctx;
        // Background dark gradient
        const bgGrad = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        bgGrad.addColorStop(0, '#100024');
        bgGrad.addColorStop(0.5, '#070012');
        bgGrad.addColorStop(1, '#020005');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Cyber Grid Lines
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let x = 30; x < 460; x += 30) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.canvas.height);
            ctx.stroke();
        }
        for (let y = 30; y < this.canvas.height; y += 30) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(460, y);
            ctx.stroke();
        }

        // Decorative Center Cyber Rings
        ctx.strokeStyle = 'rgba(180, 0, 255, 0.12)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(250, 420, 110, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
        ctx.beginPath();
        ctx.arc(250, 420, 140, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }

    drawWalls() {
        const ctx = this.ctx;
        ctx.save();
        this.walls.forEach(w => {
            ctx.strokeStyle = w.color;
            ctx.shadowColor = w.color;
            ctx.shadowBlur = 8;
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(w.p1.x, w.p1.y);
            ctx.lineTo(w.p2.x, w.p2.y);
            ctx.stroke();
        });
        ctx.restore();
    }

    drawBallSaverGate() {
        const ctx = this.ctx;
        ctx.save();
        const pulse = 0.5 + 0.5 * Math.sin(performance.now() * 0.01);
        ctx.strokeStyle = `rgba(0, 240, 255, ${0.4 + pulse * 0.6})`;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 15;
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 4]);

        ctx.beginPath();
        ctx.moveTo(140, 750);
        ctx.lineTo(360, 750);
        ctx.stroke();

        ctx.fillStyle = '#00f0ff';
        ctx.font = 'bold 9px "Share Tech Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('LASER BARRIER ACTIVE', 250, 744);

        ctx.restore();
    }

    drawPlungerSpring() {
        const ctx = this.ctx;
        ctx.save();

        const plungerY = 740 + this.plungerCharge * 20;

        // Plunger spring coils
        ctx.strokeStyle = '#ffe600';
        ctx.shadowColor = '#ffe600';
        ctx.shadowBlur = 6;
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(475, 780);
        ctx.lineTo(475, plungerY);
        ctx.stroke();

        // Plunger tip cap
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(465, plungerY - 6, 20, 6);

        // Vertical charge gauge on right edge
        if (this.isPlungerCharging) {
            const gaugeHeight = 100 * this.plungerCharge;
            ctx.fillStyle = '#ffe600';
            ctx.shadowColor = '#ffe600';
            ctx.shadowBlur = 12;
            ctx.fillRect(492, 780 - gaugeHeight, 5, gaugeHeight);
        }

        ctx.restore();
    }

    drawBall() {
        const ctx = this.ctx;
        ctx.save();

        // Motion Trail
        this.ballHistory.forEach((pos, idx) => {
            const alpha = (idx + 1) / (this.ballHistory.length * 2.2);
            ctx.fillStyle = `rgba(0, 255, 136, ${alpha})`;
            ctx.shadowColor = '#00ff88';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, this.ball.radius * (0.6 + alpha * 0.4), 0, Math.PI * 2);
            ctx.fill();
        });

        // Ball Chrome & Neon Glow
        const grad = ctx.createRadialGradient(
            this.ball.pos.x - 3, this.ball.pos.y - 3, 1,
            this.ball.pos.x, this.ball.pos.y, this.ball.radius
        );
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.5, '#00ff88');
        grad.addColorStop(1, '#005533');

        ctx.fillStyle = grad;
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(this.ball.pos.x, this.ball.pos.y, this.ball.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // ==========================================
    // 8. GAME LOOP (60 FPS)
    // ==========================================
    gameLoop(timestamp) {
        this.updatePhysics();
        this.draw();
        requestAnimationFrame((t) => this.gameLoop(t));
    }
}

// Instantiate game on page load
window.addEventListener('DOMContentLoaded', () => {
    window.pinballGame = new CyberPinballGame();
});