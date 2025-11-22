import Phaser from 'phaser';

export default class PlayScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PlayScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Create a gradient background effect
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
        graphics.fillRect(0, 0, width, height);

        // Title
        const title = this.add.text(width / 2, 100, 'Neon Drift', {
            fontSize: '48px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#00ff88',
            stroke: '#000000',
            strokeThickness: 6
        });
        title.setOrigin(0.5);

        // Add a glowing effect animation
        this.tweens.add({
            targets: title,
            alpha: { from: 1, to: 0.6 },
            duration: 1000,
            yoyo: true,
            repeat: -1
        });

        // Create interactive player sprite using graphics
        const player = this.add.circle(width / 2, height / 2, 30, 0xffaa00);
        this.physics.add.existing(player);
        player.body.setBounce(0.8);
        player.body.setCollideWorldBounds(true);

        // Add pulsing animation to player
        this.tweens.add({
            targets: player,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Add cursor key controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.player = player;

        // Instructions
        const instructions = this.add.text(width / 2, height - 100,
            'Use Arrow Keys to Move\nEnjoy the Neon Effects!', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            fill: '#ffffff',
            align: 'center'
        });
        instructions.setOrigin(0.5);

        // Create a small circle texture for particles programmatically
        const particleGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        particleGraphics.fillStyle(0xffffff);
        particleGraphics.fillCircle(4, 4, 4);
        particleGraphics.generateTexture('particle', 8, 8);
        particleGraphics.destroy();

        // Particle emitter for visual flair (always active)
        this.particles = this.add.particles(0, 0, 'particle', {
            speed: { min: -100, max: 100 },
            scale: { start: 0.5, end: 0 },
            blendMode: 'ADD',
            lifespan: 2000,
            frequency: 100,
            tint: 0x00ff88,
            alpha: 0.6
        });
    }

    update() {
        // Player movement
        if (this.cursors.left.isDown) {
            this.player.body.setVelocityX(-200);
        } else if (this.cursors.right.isDown) {
            this.player.body.setVelocityX(200);
        } else {
            this.player.body.setVelocityX(0);
        }

        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.body.setVelocityY(-400);
        }

        // Particle trail follows player
        this.particles.setPosition(this.player.x, this.player.y);
    }
}
