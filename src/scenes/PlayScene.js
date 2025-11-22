import Phaser from 'phaser';
import { openPurchaseModal } from '../premium/purchase.js';

export default class PlayScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PlayScene' });
        this.isPremium = false;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Create a gradient background effect
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
        graphics.fillRect(0, 0, width, height);

        // Title
        const title = this.add.text(width / 2, 100, 'Premium Web Game', {
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
        const player = this.add.circle(width / 2, height / 2, 30, 0x00ff88);
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
        const instructions = this.add.text(width / 2, height - 150,
            'Use Arrow Keys to Move\nClick "Buy Premium" for Exclusive Content!', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            fill: '#ffffff',
            align: 'center'
        });
        instructions.setOrigin(0.5);

        // Premium status display
        this.premiumStatus = this.add.text(20, 20, 'Status: Free Player', {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            fill: '#ffaa00',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });

        // Create "Buy Premium" button
        const buttonBg = this.add.graphics();
        buttonBg.fillStyle(0xff0066, 1);
        buttonBg.fillRoundedRect(width / 2 - 100, height - 80, 200, 50, 10);
        buttonBg.setInteractive(new Phaser.Geom.Rectangle(width / 2 - 100, height - 80, 200, 50), Phaser.Geom.Rectangle.Contains);

        const buttonText = this.add.text(width / 2, height - 55, 'Buy Premium', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#ffffff'
        });
        buttonText.setOrigin(0.5);

        // Button hover effect
        buttonBg.on('pointerover', () => {
            buttonBg.clear();
            buttonBg.fillStyle(0xff3388, 1);
            buttonBg.fillRoundedRect(width / 2 - 100, height - 80, 200, 50, 10);
        });

        buttonBg.on('pointerout', () => {
            if (!this.isPremium) {
                buttonBg.clear();
                buttonBg.fillStyle(0xff0066, 1);
                buttonBg.fillRoundedRect(width / 2 - 100, height - 80, 200, 50, 10);
            }
        });

        // Button click handler
        buttonBg.on('pointerdown', async () => {
            try {
                const result = await openPurchaseModal({
                    itemId: 'premium_upgrade',
                    price: 9.99,
                    currency: 'USD'
                });

                if (result.success) {
                    this.upgradeToPremium();
                }
            } catch (error) {
                console.error('Purchase failed:', error);
            }
        });

        // Check localStorage for premium status
        if (localStorage.getItem('premiumUnlocked') === 'true') {
            this.upgradeToPremium();
        }

        // Particle emitter for visual flair (premium feature preview)
        this.particles = this.add.particles(0, 0, 'dummy0', {
            speed: { min: -100, max: 100 },
            scale: { start: 0.5, end: 0 },
            blendMode: 'ADD',
            lifespan: 2000,
            frequency: 100,
            tint: 0x00ff88,
            alpha: 0.6
        });
        this.particles.stop(); // Only active for premium users
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

        // Premium particle effect follows player
        if (this.isPremium) {
            this.particles.setPosition(this.player.x, this.player.y);
        }
    }

    upgradeToPremium() {
        this.isPremium = true;
        localStorage.setItem('premiumUnlocked', 'true');

        // Update status text
        this.premiumStatus.setText('Status: Premium Player ⭐');
        this.premiumStatus.setStyle({ fill: '#00ff88' });

        // Enable particle effects
        this.particles.start();

        // Change player color
        this.player.setFillStyle(0xffaa00);

        // Show success message
        const successText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 100,
            '🎉 Premium Unlocked! 🎉',
            {
                fontSize: '32px',
                fontFamily: 'Arial, sans-serif',
                fontStyle: 'bold',
                fill: '#ffaa00',
                stroke: '#000000',
                strokeThickness: 4
            }
        );
        successText.setOrigin(0.5);

        // Fade out success message
        this.tweens.add({
            targets: successText,
            alpha: 0,
            y: successText.y - 50,
            duration: 3000,
            onComplete: () => successText.destroy()
        });
    }
}
