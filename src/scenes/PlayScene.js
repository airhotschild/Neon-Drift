import Phaser from 'phaser';

export default class PlayScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PlayScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Game state
        this.isGameOver = false;
        this.score = 0;
        this.gameSpeed = 200;
        this.obstacleTimer = 0;
        this.obstacles = [];

        // Get high score from localStorage
        this.highScore = parseInt(localStorage.getItem('neonDriftHighScore') || '0');

        // Create a gradient background effect
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
        graphics.fillRect(0, 0, width, height);

        // Title (smaller and top-left)
        const title = this.add.text(20, 20, 'Neon Drift', {
            fontSize: '28px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#00ff88',
            stroke: '#000000',
            strokeThickness: 4
        });

        // Score display
        this.scoreText = this.add.text(width / 2, 40, '0', {
            fontSize: '48px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        });
        this.scoreText.setOrigin(0.5, 0);

        // High score display
        this.highScoreText = this.add.text(width - 20, 20, `Best: ${this.highScore}`, {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            fill: '#ffaa00',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.highScoreText.setOrigin(1, 0);

        // Create player
        const player = this.add.circle(150, height / 2, 25, 0xffaa00);
        this.physics.add.existing(player);
        player.body.setGravityY(1200);
        player.body.setCollideWorldBounds(false); // Don't bounce, we'll handle manually
        player.body.setBounce(0);
        this.player = player;

        // Add pulsing animation to player
        this.tweens.add({
            targets: player,
            scaleX: 1.15,
            scaleY: 1.15,
            duration: 400,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Create particle trail
        const particleGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        particleGraphics.fillStyle(0xffffff);
        particleGraphics.fillCircle(4, 4, 4);
        particleGraphics.generateTexture('particle', 8, 8);
        particleGraphics.destroy();

        this.particles = this.add.particles(0, 0, 'particle', {
            speed: { min: -50, max: -150 },
            scale: { start: 0.6, end: 0 },
            blendMode: 'ADD',
            lifespan: 600,
            frequency: 50,
            tint: 0xffaa00,
            alpha: 0.8
        });

        // Instructions (only show at start)
        this.instructionsText = this.add.text(width / 2, height / 2 + 80,
            'Press SPACE or UP to Jump\nAvoid the obstacles!', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            fill: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4
        });
        this.instructionsText.setOrigin(0.5);

        // Fade out instructions after 3 seconds
        this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: this.instructionsText,
                alpha: 0,
                duration: 1000,
                onComplete: () => this.instructionsText.destroy()
            });
        });

        // Game over text (hidden initially)
        this.gameOverText = this.add.text(width / 2, height / 2 - 50,
            'GAME OVER', {
            fontSize: '64px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#ff0066',
            stroke: '#000000',
            strokeThickness: 8
        });
        this.gameOverText.setOrigin(0.5);
        this.gameOverText.setVisible(false);

        // Restart text (hidden initially)
        this.restartText = this.add.text(width / 2, height / 2 + 40,
            'Press SPACE to Restart', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        });
        this.restartText.setOrigin(0.5);
        this.restartText.setVisible(false);

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Ground lines for visual effect
        this.createGroundLines();
    }

    createGroundLines() {
        const height = this.cameras.main.height;
        const groundY = height - 50;

        this.groundLines = this.add.graphics();
        this.groundLines.lineStyle(2, 0x00ff88, 0.5);

        for (let i = 0; i < 10; i++) {
            const x = i * 100;
            this.groundLines.lineBetween(x, groundY, x + 50, groundY);
        }
    }

    update(time, delta) {
        if (this.isGameOver) {
            // Check for restart
            if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
                this.restartGame();
            }
            return;
        }

        // Check if player hit top or bottom of screen
        const height = this.cameras.main.height;
        if (this.player.y - this.player.radius <= 0 ||
            this.player.y + this.player.radius >= height) {
            this.gameOver();
            return;
        }

        // Jump control
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
            Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            this.jump();
        }

        // Update particle trail
        this.particles.setPosition(this.player.x, this.player.y);

        // Move ground lines
        this.groundLines.x -= this.gameSpeed * delta / 1000;
        if (this.groundLines.x <= -100) {
            this.groundLines.x = 0;
        }

        // Spawn obstacles
        this.obstacleTimer += delta;
        if (this.obstacleTimer > 1500) {
            this.spawnObstacle();
            this.obstacleTimer = 0;
        }

        // Update obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.x -= this.gameSpeed * delta / 1000;

            // Check collision
            if (this.checkCollision(this.player, obstacle)) {
                this.gameOver();
                return;
            }

            // Score point when passing obstacle
            if (!obstacle.scored && obstacle.x + obstacle.width < this.player.x) {
                obstacle.scored = true;
                this.addScore();
            }

            // Remove off-screen obstacles
            if (obstacle.x + obstacle.width < 0) {
                obstacle.destroy();
                this.obstacles.splice(i, 1);
            }
        }

        // Gradually increase difficulty
        if (this.score > 0 && this.score % 10 === 0) {
            this.gameSpeed = 200 + this.score * 2;
        }

        // Rotate player based on velocity
        this.player.rotation = Phaser.Math.Clamp(this.player.body.velocity.y * 0.001, -0.5, 0.5);
    }

    jump() {
        if (!this.isGameOver) {
            this.player.body.setVelocityY(-500);

            // Jump animation
            this.tweens.add({
                targets: this.player,
                scaleX: 1.3,
                scaleY: 1.3,
                duration: 100,
                yoyo: true
            });
        }
    }

    spawnObstacle() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Random obstacle type
        const type = Phaser.Math.Between(0, 2);
        let obstacle;

        if (type === 0) {
            // Bottom spike
            obstacle = this.createSpike(width, height - 100, false);
        } else if (type === 1) {
            // Top spike
            obstacle = this.createSpike(width, 150, true);
        } else {
            // Double obstacle (gap in middle)
            this.createSpike(width, 150, true);
            obstacle = this.createSpike(width, height - 100, false);
        }
    }

    createSpike(x, y, fromTop) {
        const height = fromTop ? Phaser.Math.Between(80, 150) : Phaser.Math.Between(80, 150);
        const color = Phaser.Display.Color.HSVToRGB(Phaser.Math.FloatBetween(0, 1), 1, 1).color;

        const spike = this.add.rectangle(x, y, 40, height, color);
        spike.setOrigin(0.5, fromTop ? 0 : 1);
        this.physics.add.existing(spike, true);

        spike.width = 40;
        spike.height = height;
        spike.scored = false;

        // Glow effect
        this.tweens.add({
            targets: spike,
            alpha: 0.7,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        this.obstacles.push(spike);
        return spike;
    }

    checkCollision(player, obstacle) {
        const playerBounds = player.getBounds();
        const obstacleBounds = obstacle.getBounds();

        return Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, obstacleBounds);
    }

    addScore() {
        this.score++;
        this.scoreText.setText(this.score);

        // Score animation
        this.tweens.add({
            targets: this.scoreText,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 100,
            yoyo: true
        });

        // Flash player color
        this.player.setFillStyle(0x00ff88);
        this.time.delayedCall(100, () => {
            this.player.setFillStyle(0xffaa00);
        });
    }

    gameOver() {
        if (this.isGameOver) return;

        this.isGameOver = true;

        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('neonDriftHighScore', this.highScore.toString());
            this.highScoreText.setText(`Best: ${this.highScore}`);

            // New record celebration
            this.tweens.add({
                targets: this.highScoreText,
                scaleX: 1.5,
                scaleY: 1.5,
                duration: 200,
                yoyo: true,
                repeat: 3
            });
        }

        // Show game over
        this.gameOverText.setVisible(true);
        this.restartText.setVisible(true);

        // Flash player
        this.player.setFillStyle(0xff0066);

        // Stop particles
        this.particles.stop();

        // Game over animation
        this.tweens.add({
            targets: [this.gameOverText, this.restartText],
            scaleX: { from: 0, to: 1 },
            scaleY: { from: 0, to: 1 },
            duration: 500,
            ease: 'Bounce.easeOut'
        });
    }

    restartGame() {
        // Clear obstacles
        this.obstacles.forEach(obstacle => obstacle.destroy());
        this.obstacles = [];

        // Reset state
        this.isGameOver = false;
        this.score = 0;
        this.gameSpeed = 200;
        this.obstacleTimer = 0;

        // Reset player
        this.player.setPosition(150, this.cameras.main.height / 2);
        this.player.body.setVelocity(0, 0);
        this.player.setFillStyle(0xffaa00);
        this.player.rotation = 0;

        // Reset UI
        this.scoreText.setText('0');
        this.gameOverText.setVisible(false);
        this.restartText.setVisible(false);

        // Restart particles
        this.particles.start();
    }
}
