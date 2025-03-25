class TargetGame {
    constructor() {
        this.score = 0;
        this.timeLeft = 30;
        this.isPlaying = false;
        this.highScores = this.loadHighScores();
        this.gameInterval = null;
        this.targetTimeout = null;
        this.playerName = '';
        this.currentStreak = 0;
        // Initialize Web Audio API
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.sounds = {
            hit: () => this.playSound(600, 0.1, 'square'),
            streak: () => this.playSound(800, 0.15, 'sine'),
            gameOver: () => this.playSound(200, 0.3, 'sawtooth')
        };

        this.initializeElements();
        this.setupEventListeners();
        this.updateHighScoreDisplay();
    }

    initializeElements() {
        document.getElementById('timer').textContent = this.timeLeft;
        document.getElementById('score').textContent = '0';
        this.updateHighScoreDisplay();
        this.updateHighScoresTable();
    }

    updateHighScoresTable() {
        const tbody = document.querySelector('#highScoresTable tbody');
        tbody.innerHTML = '';

        this.highScores.forEach((score, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${score.name}</td>
                <td>${score.score}</td>
                <td>${score.date}</td>
            `;
            tbody.appendChild(row);
        });

        // Fill empty rows if less than 5 scores
        for (let i = this.highScores.length; i < 5; i++) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${i + 1}</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
            `;
            tbody.appendChild(row);
        }
    }

    setupEventListeners() {
        document.getElementById('startButton').addEventListener('click', () => this.startGame());
        document.getElementById('resetButton').addEventListener('click', () => this.resetGame());
        document.getElementById('playAgainButton').addEventListener('click', () => this.resetGame());
        
        const target = document.getElementById('target');
        target.addEventListener('click', (e) => this.handleTargetClick(e));
    }

    startGame() {
        const nameInput = document.getElementById('playerName');
        this.playerName = nameInput.value.trim();
        
        if (!this.playerName) {
            alert('Please enter your name first!');
            return;
        }
        
        nameInput.setAttribute('disabled', 'true');
        this.isPlaying = true;
        this.score = 0;
        this.timeLeft = 30;
        this.currentStreak = 0;
        
        document.getElementById('score').textContent = '0';
        document.getElementById('startButton').setAttribute('disabled', 'true');
        document.getElementById('resetButton').removeAttribute('disabled');
        document.getElementById('gameOver').classList.add('hidden');
        document.getElementById('newHighScore').classList.add('hidden');
        document.getElementById('streakBonus').classList.add('hidden');

        this.gameInterval = setInterval(() => this.updateGame(), 1000);
        this.spawnTarget();
    }

    updateGame() {
        this.timeLeft--;
        document.getElementById('timer').textContent = this.timeLeft;

        if (this.timeLeft <= 0) {
            this.endGame();
        }
    }

    spawnTarget() {
        if (!this.isPlaying) return;

        const gameArea = document.getElementById('gameArea');
        const target = document.getElementById('target');
        
        // Make targets progressively smaller and faster as score increases
        const minSize = Math.max(20, 40 - Math.floor(this.score / 100));
        const maxSize = Math.max(40, 60 - Math.floor(this.score / 200));
        const size = Math.random() * (maxSize - minSize) + minSize;
        
        const maxX = gameArea.clientWidth - size;
        const maxY = gameArea.clientHeight - size;
        
        target.style.width = `${size}px`;
        target.style.height = `${size}px`;
        target.style.left = `${Math.random() * maxX}px`;
        target.style.top = `${Math.random() * maxY}px`;
        target.style.display = 'block';

        // Targets disappear faster as score increases
        const minTimeout = Math.max(300, 500 - Math.floor(this.score / 50));
        const maxTimeout = Math.max(800, 1500 - Math.floor(this.score / 25));
        const timeout = Math.random() * (maxTimeout - minTimeout) + minTimeout;
        
        this.targetTimeout = setTimeout(() => {
            if (this.isPlaying) {
                target.style.display = 'none';
                this.currentStreak = 0; // Reset streak when target is missed
                this.spawnTarget();
            }
        }, timeout);
    }

    handleTargetClick(e) {
        if (!this.isPlaying) return;

        const target = e.target;
        target.classList.add('hit');
        
        // Calculate score based on target size
        const targetSize = parseFloat(target.style.width);
        const baseScore = Math.round(100 - targetSize); // Smaller targets = higher score
        
        // Apply streak bonus
        this.currentStreak++;
        let streakBonus = 0;
        if (this.currentStreak > 2) {
            streakBonus = Math.min(baseScore * (this.currentStreak - 2) * 0.5, baseScore * 2);
            this.showStreakBonus(streakBonus);
            this.sounds.streak();
        }

        const totalScore = baseScore + streakBonus;
        this.score += totalScore;
        document.getElementById('score').textContent = this.score;

        // Play hit sound
        this.sounds.hit();

        if (this.targetTimeout) {
            clearTimeout(this.targetTimeout);
        }
        
        setTimeout(() => {
            target.classList.remove('hit');
            target.style.display = 'none';
            this.spawnTarget();
        }, 300);
    }

    showStreakBonus(bonus) {
        const streakBonus = document.getElementById('streakBonus');
        const bonusPoints = document.getElementById('bonusPoints');
        
        bonusPoints.textContent = Math.round(bonus);
        streakBonus.style.left = `${Math.random() * 80 + 10}%`;
        streakBonus.style.top = `${Math.random() * 80 + 10}%`;
        streakBonus.classList.remove('hidden');
        
        setTimeout(() => {
            streakBonus.classList.add('hidden');
        }, 1000);
    }

    endGame() {
        this.isPlaying = false;
        this.currentStreak = 0;
        
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
        }
        if (this.targetTimeout) {
            clearTimeout(this.targetTimeout);
        }

        // Play game over sound
        this.sounds.gameOver();

        const isNewHighScore = this.isNewHighScore();
        if (isNewHighScore) {
            this.saveHighScore();
            this.updateHighScoreDisplay();
            document.getElementById('newHighScore').classList.remove('hidden');
        } else {
            document.getElementById('newHighScore').classList.add('hidden');
        }

        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').classList.remove('hidden');
        document.getElementById('target').style.display = 'none';
        document.getElementById('streakBonus').classList.add('hidden');
        document.getElementById('startButton').removeAttribute('disabled');
        document.getElementById('resetButton').setAttribute('disabled', 'true');
        document.getElementById('playerName').removeAttribute('disabled');
        
        // Update high scores table
        this.updateHighScoresTable();
    }

    resetGame() {
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
        }
        if (this.targetTimeout) {
            clearTimeout(this.targetTimeout);
        }

        document.getElementById('gameOver').classList.add('hidden');
        document.getElementById('newHighScore').classList.add('hidden');
        document.getElementById('playerName').value = '';
        document.getElementById('playerName').removeAttribute('disabled');
        this.updateHighScoresTable();
        
        // Reset score and timer display
        document.getElementById('score').textContent = '0';
        document.getElementById('timer').textContent = '30';
        this.score = 0;
        this.timeLeft = 30;
    }

    loadHighScores() {
        const savedScores = localStorage.getItem('targetGameHighScores');
        return savedScores ? JSON.parse(savedScores) : [];
    }

    saveHighScore() {
        const newScore = {
            name: this.playerName,
            score: this.score,
            date: new Date().toLocaleDateString()
        };

        this.highScores.push(newScore);
        this.highScores.sort((a, b) => b.score - a.score);
        this.highScores = this.highScores.slice(0, 5); // Keep top 5 scores
        
        localStorage.setItem('targetGameHighScores', JSON.stringify(this.highScores));
    }

    updateHighScoreDisplay() {
        const topScore = this.highScores[0]?.score || 0;
        document.getElementById('highScore').textContent = `${topScore} (${this.highScores[0]?.name || 'None'})`;
    }

    isNewHighScore() {
        return this.score > (this.highScores[4]?.score || 0);
    }

    playSound(frequency, duration, type = 'sine') {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TargetGame();
});