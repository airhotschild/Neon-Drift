import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import PlayScene from './scenes/PlayScene.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#1a1a2e',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: [BootScene, PlayScene]
};

const game = new Phaser.Game(config);
