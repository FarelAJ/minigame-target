interface GameState {
    score: number;
    timeLeft: number;
    isPlaying: boolean;
    highScore: number;
    gameInterval?: number;
    targetTimeout?: number;
}

class TargetGame {
    private state: GameState;
    private readonly GAME_DURATION = 30;
    private readonly MIN_TARGET_SIZE = 30;
    private readonly MAX_TARGET_SIZE = 60;
    private readonly TARGET_TIMEOUT_MIN = 500;
    private readonly TARGET_TIMEOUT_MAX = 1500;

    constructor() {
        this.state = {
            score: 0,
            timeLeft: this.GAME_DURATION,
            isPlaying: false,
            highScore: this.loadHighScore()
        };

        this.initializeElements();
        this.setupEventListeners();
        this.updateHighScoreDisplay();
    }

    private initializeElements(): void {
        // Update UI elements
        document.getElementById('highScore')!.textContent = this.state.highScore.toString();
        document.getElementById('timer')!.textContent = this.state.timeLeft.toString();
        document.getElementById('score')!.textContent = '0';
    }

    private setupEventListeners(): void {
        document.getElementById('startButton')?.addEventListener('click', () => this.startGame());
        document.getElementById('resetButton')?.addEventListener('click', () => this.resetGame());
        document.getElementById('playAgainButton')?.addEventListener('click', () => this.resetGame());
        
        const target = document.getElementById('target');
        if (target) {
            target.addEventListener('click', (e) => this.handleTargetClick(e));
        }
    }

    private startGame(): void {
        this.state.isPlaying = true;
        this.state.score = 0;
        this.state.timeLeft = this.GAME_DURATION;
        
        // Update UI
        document.getElementById('score')!.textContent = '0';
        document.getElementById('startButton')!.setAttribute('disabled', 'true');
        document.getElementById('resetButton')!.removeAttribute('disabled');
        document.getElementById('gameOver')!.classList.add('hidden');

        // Start game loop
        this.state.gameInterval = window.setInterval(() => this.updateGame(), 1000);
        this.spawnTarget();
    }

    private updateGame(): void {
        this.state.timeLeft--;
        document.getElementById('timer')!.textContent = this.state.timeLeft.toString();

        if (this.state.timeLeft <= 0) {
            this.endGame();
        }
    }

    private spawnTarget(): void {
        if (!this.state.isPlaying) return;

        const gameArea = document.getElementById('gameArea')!;
        const target = document.getElementById('target')!;
        
        // Random position
        const size = Math.random() * (this.MAX_TARGET_SIZE - this.MIN_TARGET_SIZE) + this.MIN_TARGET_SIZE;
        const maxX = gameArea.clientWidth - size;
        const maxY = gameArea.clientHeight - size;
        
        target.style.width = `${size}px`;
        target.style.height = `${size}px`;
        target.style.left = `${Math.random() * maxX}px`;
        target.style.top = `${Math.random() * maxY}px`;
        target.style.display = 'block';

        // Schedule next target spawn
        const timeout = Math.random() * (this.TARGET_TIMEOUT_MAX - this.TARGET_TIMEOUT_MIN) + this.TARGET_TIMEOUT_MIN;
        this.state.targetTimeout = window.setTimeout(() => {
            if (this.state.isPlaying) {
                target.style.display = 'none';
                this.spawnTarget();
            }
        }, timeout);
    }

    private handleTargetClick(e: Event): void {
        if (!this.state.isPlaying) return;

        const target = e.target as HTMLElement;
        target.classList.add('hit');
        
        // Update score
        this.state.score += 10;
        document.getElementById('score')!.textContent = this.state.score.toString();

        // Clear current timeout and spawn new target
        if (this.state.targetTimeout) {
            clearTimeout(this.state.targetTimeout);
        }
        
        // Remove hit animation and hide target
        setTimeout(() => {
            target.classList.remove('hit');
            target.style.display = 'none';
            this.spawnTarget();
        }, 300);
    }

    private endGame(): void {
        this.state.isPlaying = false;
        
        // Clear intervals and timeouts
        if (this.state.gameInterval) {
            clearInterval(this.state.gameInterval);
        }
        if (this.state.targetTimeout) {
            clearTimeout(this.state.targetTimeout);
        }

        // Update high score if needed
        if (this.state.score > this.state.highScore) {
            this.state.highScore = this.state.score;
            this.saveHighScore();
            this.updateHighScoreDisplay();
        }

        // Show game over screen
        document.getElementById('finalScore')!.textContent = this.state.score.toString();
        document.getElementById('gameOver')!.classList.remove('hidden');
        document.getElementById('target')!.style.display = 'none';
        document.getElementById('startButton')!.removeAttribute('disabled');
        document.getElementById('resetButton')!.setAttribute('disabled', 'true');
    }

    private resetGame(): void {
        if (this.state.gameInterval) {
            clearInterval(this.state.gameInterval);
        }
        if (this.state.targetTimeout) {
            clearTimeout(this.state.targetTimeout);
        }

        document.getElementById('gameOver')!.classList.add('hidden');
        this.startGame();
    }

    private loadHighScore(): number {
        const savedScore = localStorage.getItem('targetGameHighScore');
        return savedScore ? parseInt(savedScore) : 0;
    }

    private saveHighScore(): void {
        localStorage.setItem('targetGameHighScore', this.state.highScore.toString());
    }

    private updateHighScoreDisplay(): void {
        document.getElementById('highScore')!.textContent = this.state.highScore.toString();
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TargetGame();
});