(function () {
    'use strict';

    // ── Configuration ──────────────────────────────────────────
    const CONFIG = {
        totalDuration: 180,           // 3 minutes in seconds
        inclusionPhase: 60,           // first 60 seconds
        inclusionProb: 0.33,          // 33% chance ball comes to me
        exclusionProb: 0.05,          // 5% chance ball comes to me
        cpuThrowDelayMin: 2000,       // min delay for CPU throw (ms)
        cpuThrowDelayMax: 4000,       // max delay for CPU throw (ms)
        ballAnimDuration: 600,        // ball flight time (ms)
    };

    // ── Player IDs ─────────────────────────────────────────────
    const PLAYER_1 = '1';
    const PLAYER_2 = '2';
    const PLAYER_ME = 'me';
    const CPU_PLAYERS = [PLAYER_1, PLAYER_2];
    const ALL_PLAYERS = [PLAYER_1, PLAYER_2, PLAYER_ME];

    // ── DOM references ─────────────────────────────────────────
    const dom = {
        gameArea: document.getElementById('game-area'),
        ball: document.getElementById('ball'),
        timer: document.getElementById('timer'),
        startScreen: document.getElementById('start-screen'),
        endScreen: document.getElementById('end-screen'),
        startBtn: document.getElementById('start-btn'),
        nextBtn: document.getElementById('next-btn'),
        players: {
            [PLAYER_1]: document.getElementById('player1'),
            [PLAYER_2]: document.getElementById('player2'),
            [PLAYER_ME]: document.getElementById('player-me'),
        },
    };

    // ── Game state ─────────────────────────────────────────────
    let state = {
        running: false,
        elapsed: 0,                   // seconds elapsed
        ballHolder: null,             // current holder ID
        waitingForUser: false,        // true when user must pick a target
        animating: false,             // true during ball flight
        timerInterval: null,
        cpuTimeout: null,
        userWaitStart: null,          // timestamp when ball arrived to user
    };

    // ── Data tracking (internal, not displayed) ────────────────
    let data = {
        totalThrows: 0,
        throwsByPlayer: { [PLAYER_1]: 0, [PLAYER_2]: 0, [PLAYER_ME]: 0 },
        receivedByPlayer: { [PLAYER_1]: 0, [PLAYER_2]: 0, [PLAYER_ME]: 0 },
        userWaitTimes: [],            // ms waited each time ball wasn't coming
        userReceiveTimestamps: [],    // elapsed seconds when user got ball
        throwLog: [],                 // { from, to, elapsedSec }
    };

    // ── Helpers ────────────────────────────────────────────────

    function getPlayerCenter(playerId) {
        const el = dom.players[playerId];
        const avatar = el.querySelector('.player-avatar');
        const rect = avatar.getBoundingClientRect();
        const areaRect = dom.gameArea.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2 - areaRect.left,
            y: rect.top + rect.height / 2 - areaRect.top,
        };
    }

    function positionBallAt(playerId) {
        const pos = getPlayerCenter(playerId);
        dom.ball.style.left = (pos.x - 14) + 'px';
        dom.ball.style.top = (pos.y - 14) + 'px';
    }

    function formatTime(seconds) {
        const remaining = Math.max(0, CONFIG.totalDuration - seconds);
        const m = Math.floor(remaining / 60);
        const s = remaining % 60;
        return m + ':' + String(s).padStart(2, '0');
    }

    function randomBetween(min, max) {
        return min + Math.random() * (max - min);
    }

    function isExclusionPhase() {
        return state.elapsed >= CONFIG.inclusionPhase;
    }

    // Pick who the CPU throws to (other than themselves)
    function cpuPickTarget(from) {
        const others = ALL_PLAYERS.filter(p => p !== from);
        const probMe = isExclusionPhase() ? CONFIG.exclusionProb : CONFIG.inclusionProb;
        const probOther = 1 - probMe;

        const r = Math.random();
        // others[0] or others[1]: one of them is 'me', the other is a CPU
        const meIndex = others.indexOf(PLAYER_ME);
        const otherIndex = meIndex === 0 ? 1 : 0;

        if (r < probMe) {
            return others[meIndex];
        } else {
            return others[otherIndex];
        }
    }

    // ── Ball animation ─────────────────────────────────────────

    function animateBall(from, to, callback) {
        state.animating = true;
        const start = getPlayerCenter(from);
        const end = getPlayerCenter(to);
        const duration = CONFIG.ballAnimDuration;
        const startTime = performance.now();

        // Remove has-ball class from sender
        dom.players[from].classList.remove('has-ball');

        function step(now) {
            const t = Math.min((now - startTime) / duration, 1);
            // Ease out cubic
            const ease = 1 - Math.pow(1 - t, 3);

            const x = start.x + (end.x - start.x) * ease;
            // Add arc: parabolic offset
            const arcHeight = -80 * Math.sin(Math.PI * t);
            const y = start.y + (end.y - start.y) * ease + arcHeight;

            dom.ball.style.left = (x - 14) + 'px';
            dom.ball.style.top = (y - 14) + 'px';

            if (t < 1) {
                requestAnimationFrame(step);
            } else {
                state.animating = false;
                callback();
            }
        }

        requestAnimationFrame(step);
    }

    // ── Throw logic ────────────────────────────────────────────

    function throwBall(from, to) {
        if (!state.running) return;

        // Record data
        data.totalThrows++;
        data.throwsByPlayer[from]++;
        data.throwLog.push({ from: from, to: to, elapsedSec: state.elapsed });

        // Clear user waiting state
        if (from === PLAYER_ME) {
            state.waitingForUser = false;
            dom.players[PLAYER_ME].classList.remove('waiting-for-input');
            removeClickableFromAll();
        }

        animateBall(from, to, function () {
            if (!state.running) return;
            receiveBall(to);
        });
    }

    function receiveBall(playerId) {
        state.ballHolder = playerId;
        data.receivedByPlayer[playerId]++;
        positionBallAt(playerId);
        dom.players[playerId].classList.add('has-ball');

        if (playerId === PLAYER_ME) {
            data.userReceiveTimestamps.push(state.elapsed);
            // Record wait time if we were tracking
            if (state.userWaitStart !== null) {
                data.userWaitTimes.push(Date.now() - state.userWaitStart);
            }
            state.userWaitStart = null;
            onUserTurn();
        } else {
            // Start tracking user wait time if not already
            if (state.userWaitStart === null) {
                state.userWaitStart = Date.now();
            }
            scheduleCpuThrow(playerId);
        }
    }

    function onUserTurn() {
        state.waitingForUser = true;
        dom.players[PLAYER_ME].classList.add('waiting-for-input');

        // Make other players clickable
        CPU_PLAYERS.forEach(function (id) {
            dom.players[id].classList.add('clickable');
        });
    }

    function removeClickableFromAll() {
        ALL_PLAYERS.forEach(function (id) {
            dom.players[id].classList.remove('clickable');
        });
    }

    function scheduleCpuThrow(cpuId) {
        const delay = randomBetween(CONFIG.cpuThrowDelayMin, CONFIG.cpuThrowDelayMax);
        state.cpuTimeout = setTimeout(function () {
            if (!state.running || state.ballHolder !== cpuId) return;
            const target = cpuPickTarget(cpuId);
            throwBall(cpuId, target);
        }, delay);
    }

    // ── Click handlers ─────────────────────────────────────────

    function onPlayerClick(e) {
        if (!state.running || !state.waitingForUser || state.animating) return;

        const playerEl = e.currentTarget;
        const targetId = playerEl.dataset.player;

        if (targetId === PLAYER_ME) return;
        if (!playerEl.classList.contains('clickable')) return;

        throwBall(PLAYER_ME, targetId);
    }

    // ── Timer ──────────────────────────────────────────────────

    function startTimer() {
        state.timerInterval = setInterval(function () {
            state.elapsed++;
            dom.timer.textContent = formatTime(state.elapsed);
            if (state.elapsed >= CONFIG.totalDuration) {
                endGame();
            }
        }, 1000);
    }

    // ── Game lifecycle ─────────────────────────────────────────

    function startGame() {
        dom.startScreen.classList.add('hidden');
        state.running = true;
        state.elapsed = 0;
        dom.timer.textContent = formatTime(0);

        // Reset data
        data = {
            totalThrows: 0,
            throwsByPlayer: { [PLAYER_1]: 0, [PLAYER_2]: 0, [PLAYER_ME]: 0 },
            receivedByPlayer: { [PLAYER_1]: 0, [PLAYER_2]: 0, [PLAYER_ME]: 0 },
            userWaitTimes: [],
            userReceiveTimestamps: [],
            throwLog: [],
        };

        // Give ball to a random CPU to start
        const startPlayer = CPU_PLAYERS[Math.floor(Math.random() * CPU_PLAYERS.length)];
        dom.ball.classList.remove('hidden');
        state.ballHolder = startPlayer;
        positionBallAt(startPlayer);
        dom.players[startPlayer].classList.add('has-ball');
        data.receivedByPlayer[startPlayer]++;

        startTimer();
        scheduleCpuThrow(startPlayer);
    }

    function endGame() {
        state.running = false;
        clearInterval(state.timerInterval);
        clearTimeout(state.cpuTimeout);

        state.waitingForUser = false;
        removeClickableFromAll();
        dom.players[PLAYER_ME].classList.remove('waiting-for-input');
        ALL_PLAYERS.forEach(function (id) {
            dom.players[id].classList.remove('has-ball');
        });
        dom.ball.classList.add('hidden');

        // Log collected data to console for research purposes
        console.log('=== Cyberball Game Data ===');
        console.log('Total throws:', data.totalThrows);
        console.log('Throws by player:', data.throwsByPlayer);
        console.log('Received by player:', data.receivedByPlayer);
        console.log('User receive timestamps (sec):', data.userReceiveTimestamps);
        console.log('User wait times (ms):', data.userWaitTimes);
        console.log('Full throw log:', data.throwLog);
        console.log('===========================');

        // Expose data on window for external collection
        window.cyberballData = JSON.parse(JSON.stringify(data));

        dom.endScreen.classList.remove('hidden');
    }

    // ── Event binding ──────────────────────────────────────────

    dom.startBtn.addEventListener('click', startGame);

    dom.nextBtn.addEventListener('click', function () {
        // Placeholder for navigation to next step
        alert('다음 단계로 이동합니다.');
    });

    // Bind click on CPU players for user throw target selection
    CPU_PLAYERS.forEach(function (id) {
        dom.players[id].addEventListener('click', onPlayerClick);
    });

    // Reposition ball on resize
    window.addEventListener('resize', function () {
        if (state.ballHolder && !state.animating) {
            positionBallAt(state.ballHolder);
        }
    });

})();
