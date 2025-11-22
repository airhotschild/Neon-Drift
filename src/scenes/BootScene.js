import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Create a loading bar
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 30, 320, 50);

        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading Neon Drift...',
            style: {
                font: '20px monospace',
                fill: '#00ff88'
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        const percentText = this.make.text({
            x: width / 2,
            y: height / 2,
            text: '0%',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);

        // Simulate loading progress
        let progress = 0;
        const timer = this.time.addEvent({
            delay: 50,
            callback: () => {
                progress += 0.05;
                if (progress > 1) progress = 1;

                percentText.setText(parseInt(progress * 100) + '%');
                progressBar.clear();
                progressBar.fillStyle(0x00ff88, 1);
                progressBar.fillRect(width / 2 - 150, height / 2 - 20, 300 * progress, 30);

                if (progress >= 1) {
                    timer.remove();
                    this.time.delayedCall(200, () => {
                        this.scene.start('PlayScene');
                    });
                }
            },
            loop: true
        });
    }
}
