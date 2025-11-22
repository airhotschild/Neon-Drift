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

        // Combo/Streak system
        this.combo = 0;
        this.comboMultiplier = 1;
        this.maxCombo = 0;

        // Power-ups
        this.powerUps = [];
        this.powerUpTimer = 0;
        this.activeShield = false;
        this.activeSloMo = false;
        this.activeMultiplier = 1;

        // Pause state
        this.isPaused = false;

        // Sound settings
        this.soundEnabled = true;
        this.musicEnabled = true;

        // Get high score from localStorage
        this.highScore = parseInt(localStorage.getItem('neonDriftHighScore') || '0');

        // Create a gradient background effect
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
        graphics.fillRect(0, 0, width, height);

        // Create starfield background with parallax layers
        this.createStarfield();

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

        // Combo display
        this.comboText = this.add.text(width / 2, 100, '', {
            fontSize: '32px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#00ff88',
            stroke: '#000000',
            strokeThickness: 4
        });
        this.comboText.setOrigin(0.5, 0);
        this.comboText.setVisible(false);

        // Create player (smaller for easier gameplay)
        const player = this.add.circle(150, height / 2, 18, 0xffaa00);
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

        // Create enhanced particle trail with rainbow gradient
        const particleGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        particleGraphics.fillStyle(0xffffff);
        particleGraphics.fillCircle(4, 4, 4);
        particleGraphics.generateTexture('particle', 8, 8);
        particleGraphics.destroy();

        // Rainbow trail particles
        this.particles = this.add.particles(0, 0, 'particle', {
            speed: { min: -50, max: -150 },
            scale: { start: 0.8, end: 0 },
            blendMode: 'ADD',
            lifespan: 800,
            frequency: 30,
            tint: [0xff0066, 0xffaa00, 0x00ff88, 0x00ccff, 0xaa00ff],
            alpha: { start: 0.9, end: 0 }
        });

        // Create explosion particle emitter (initially stopped)
        this.explosionParticles = this.add.particles(0, 0, 'particle', {
            speed: { min: 100, max: 300 },
            scale: { start: 1.2, end: 0 },
            blendMode: 'ADD',
            lifespan: 800,
            tint: [0xff0066, 0xff3366, 0xff6666],
            alpha: { start: 1, end: 0 },
            emitting: false
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

        // Pause overlay (hidden initially)
        this.pauseOverlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7);
        this.pauseOverlay.setOrigin(0);
        this.pauseOverlay.setVisible(false);

        this.pauseText = this.add.text(width / 2, height / 2 - 50,
            'PAUSED', {
            fontSize: '64px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#00ff88',
            stroke: '#000000',
            strokeThickness: 8
        });
        this.pauseText.setOrigin(0.5);
        this.pauseText.setVisible(false);

        this.pauseInstructions = this.add.text(width / 2, height / 2 + 40,
            'Press P or ESC to Resume', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        });
        this.pauseInstructions.setOrigin(0.5);
        this.pauseInstructions.setVisible(false);

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        // Create sounds
        this.createSounds();

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

    createStarfield() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Create 3 layers of stars with different speeds (parallax effect)
        this.starLayers = [];

        for (let layer = 0; layer < 3; layer++) {
            const stars = [];
            const starCount = 30 + layer * 20;
            const speed = (layer + 1) * 30;
            const size = 1 + layer * 0.5;
            const brightness = 0.3 + layer * 0.2;

            for (let i = 0; i < starCount; i++) {
                const star = this.add.circle(
                    Phaser.Math.Between(0, width + 200),
                    Phaser.Math.Between(0, height),
                    size,
                    0xffffff,
                    brightness
                );
                stars.push(star);

                // Add twinkling effect
                this.tweens.add({
                    targets: star,
                    alpha: brightness * 0.3,
                    duration: Phaser.Math.Between(1000, 3000),
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }

            this.starLayers.push({ stars, speed });
        }
    }

    createSounds() {
        // Sound effects are created dynamically using Web Audio API
        // No files to load - everything is synthesized in playSound()
    }

    playSound(soundName) {
        if (!this.soundEnabled) return;

        // Simple frequency-based beeps using Phaser's audio context
        const context = this.sound.context;
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        switch (soundName) {
            case 'jump':
                oscillator.frequency.value = 440; // A4
                gainNode.gain.setValueAtTime(0.3, context.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);
                oscillator.start(context.currentTime);
                oscillator.stop(context.currentTime + 0.1);
                break;
            case 'score':
                oscillator.frequency.value = 880;  // A5
                gainNode.gain.setValueAtTime(0.2, context.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.15);
                oscillator.start(context.currentTime);
                oscillator.stop(context.currentTime + 0.15);
                break;
            case 'collision':
                oscillator.type = 'sawtooth';
                oscillator.frequency.value = 100; // Low bass
                gainNode.gain.setValueAtTime(0.4, context.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
                oscillator.start(context.currentTime);
                oscillator.stop(context.currentTime + 0.3);
                break;
            case 'powerup':
                oscillator.frequency.value = 660; // E5
                gainNode.gain.setValueAtTime(0.3, context.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);
                oscillator.start(context.currentTime);
                oscillator.stop(context.currentTime + 0.2);
                // Add second note
                const osc2 = context.createOscillator();
                const gain2 = context.createGain();
                osc2.connect(gain2);
                gain2.connect(context.destination);
                osc2.frequency.value = 880;
                gain2.gain.setValueAtTime(0.3, context.currentTime + 0.1);
                gain2.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
                osc2.start(context.currentTime + 0.1);
                osc2.stop(context.currentTime + 0.3);
                break;
        }
    }

    update(time, delta) {
        // Handle pause toggle
        if (Phaser.Input.Keyboard.JustDown(this.pKey) ||
            Phaser.Input.Keyboard.JustDown(this.escKey)) {
            if (!this.isGameOver) {
                this.togglePause();
            }
        }

        // If paused, don't update game logic
        if (this.isPaused) {
            return;
        }

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

        // Animate starfield with parallax effect
        const width = this.cameras.main.width;
        this.starLayers.forEach(layer => {
            layer.stars.forEach(star => {
                star.x -= layer.speed * delta / 1000;
                if (star.x < -10) {
                    star.x = width + 10;
                    star.y = Phaser.Math.Between(0, height);
                }
            });
        });

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

        // Spawn power-ups
        this.powerUpTimer += delta;
        if (this.powerUpTimer > 8000) { // Every 8 seconds
            this.spawnPowerUp();
            this.powerUpTimer = 0;
        }

        // Update power-ups
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            powerUp.x -= (this.gameSpeed * 0.5) * delta / 1000; // Move slower than obstacles

            // Update icon position to match power-up
            if (powerUp.icon) {
                powerUp.icon.x = powerUp.x;
                powerUp.icon.y = powerUp.y;
            }

            // Check collection
            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                powerUp.x, powerUp.y
            );

            if (distance < 40) {
                this.collectPowerUp(powerUp);
                powerUp.destroy();
                if (powerUp.icon) powerUp.icon.destroy();
                this.powerUps.splice(i, 1);
                continue;
            }

            // Remove off-screen power-ups
            if (powerUp.x + 30 < 0) {
                powerUp.destroy();
                if (powerUp.icon) powerUp.icon.destroy();
                this.powerUps.splice(i, 1);
            }
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

            // Play jump sound
            this.playSound('jump');

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

        // Enhanced glow effect with pulsing
        this.tweens.add({
            targets: spike,
            alpha: 0.6,
            scaleX: 1.05,
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.obstacles.push(spike);
        return spike;
    }

    spawnPowerUp() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Random power-up type
        const types = ['shield', 'slowmo', 'multiplier'];
        const type = Phaser.Utils.Array.GetRandom(types);

        const y = Phaser.Math.Between(100, height - 100);

        let color, icon;
        if (type === 'shield') {
            color = 0x00ccff;
            icon = '🛡';
        } else if (type === 'slowmo') {
            color = 0xaa00ff;
            icon = '⏱';
        } else {
            color = 0xffff00;
            icon = '✨';
        }

        const powerUp = this.add.circle(width + 50, y, 20, color);
        powerUp.powerUpType = type;

        // Add icon text
        const iconText = this.add.text(width + 50, y, icon, {
            fontSize: '24px'
        });
        iconText.setOrigin(0.5);
        powerUp.icon = iconText;

        // Pulsing animation
        this.tweens.add({
            targets: [powerUp, iconText],
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        this.powerUps.push(powerUp);
    }

    collectPowerUp(powerUp) {
        const type = powerUp.powerUpType;

        // Play power-up sound
        this.playSound('powerup');

        if (type === 'shield') {
            this.activeShield = true;
            this.player.setFillStyle(0x00ccff);

            // Visual shield effect
            this.tweens.add({
                targets: this.player,
                alpha: 0.7,
                duration: 300,
                yoyo: true,
                repeat: 10
            });
        } else if (type === 'slowmo') {
            this.activeSloMo = true;
            this.gameSpeed *= 0.5;

            this.time.delayedCall(5000, () => {
                this.activeSloMo = false;
                this.gameSpeed *= 2;
            });
        } else if (type === 'multiplier') {
            this.activeMultiplier = 2;

            this.time.delayedCall(10000, () => {
                this.activeMultiplier = 1;
            });
        }

        // Collection effect
        const particles = this.add.particles(powerUp.x, powerUp.y, 'particle', {
            speed: { min: 50, max: 150 },
            scale: { start: 0.8, end: 0 },
            blendMode: 'ADD',
            lifespan: 400,
            tint: powerUp.fillColor,
            quantity: 15
        });

        this.time.delayedCall(500, () => particles.destroy());
    }

    checkCollision(player, obstacle) {
        const playerBounds = player.getBounds();
        const obstacleBounds = obstacle.getBounds();

        return Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, obstacleBounds);
    }

    addScore() {
        // Increment combo
        this.combo++;
        if (this.combo > this.maxCombo) {
            this.maxCombo = this.combo;
        }

        // Calculate score with combo multiplier
        const comboBonus = Math.floor(this.combo / 5);
        this.comboMultiplier = 1 + comboBonus;
        const scoreToAdd = this.comboMultiplier * this.activeMultiplier;

        this.score += scoreToAdd;
        this.scoreText.setText(this.score);

        // Play score sound
        this.playSound('score');

        // Update combo display
        if (this.combo >= 3) {
            this.comboText.setVisible(true);
            this.comboText.setText(`${this.combo}x COMBO!`);

            // Change color based on combo level
            if (this.combo >= 20) {
                this.comboText.setFill('#ff0066'); // Red for high combo
            } else if (this.combo >= 10) {
                this.comboText.setFill('#ffaa00'); // Orange for medium combo
            } else {
                this.comboText.setFill('#00ff88'); // Green for low combo
            }

            // Combo text animation
            this.tweens.add({
                targets: this.comboText,
                scaleX: 1.3,
                scaleY: 1.3,
                duration: 150,
                yoyo: true
            });
        }

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
            this.player.setFillStyle(this.activeShield ? 0x00ccff : 0xffaa00);
        });
    }

    gameOver() {
        if (this.isGameOver) return;

        // Check if player has shield
        if (this.activeShield) {
            // Shield absorbs the hit
            this.activeShield = false;
            this.player.setFillStyle(0xffaa00);

            // Flash effect
            this.cameras.main.flash(200, 0, 200, 255);

            // Reset combo but don't die
            this.combo = 0;
            this.comboText.setVisible(false);
            return;
        }

        this.isGameOver = true;

        // Play collision sound
        this.playSound('collision');

        // Reset combo
        this.combo = 0;
        this.comboText.setVisible(false);

        // Screen shake effect
        this.cameras.main.shake(500, 0.01);

        // Explosion particles at collision point
        this.explosionParticles.explode(30, this.player.x, this.player.y);

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

    togglePause() {
        this.isPaused = !this.isPaused;

        if (this.isPaused) {
            // Show pause menu
            this.pauseOverlay.setVisible(true);
            this.pauseText.setVisible(true);
            this.pauseInstructions.setVisible(true);

            // Pause physics
            this.physics.pause();

            // Pause tweens
            this.tweens.pauseAll();
        } else {
            // Hide pause menu
            this.pauseOverlay.setVisible(false);
            this.pauseText.setVisible(false);
            this.pauseInstructions.setVisible(false);

            // Resume physics
            this.physics.resume();

            // Resume tweens
            this.tweens.resumeAll();
        }
    }
}
