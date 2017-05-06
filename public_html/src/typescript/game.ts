/*
 * Super Simple and Small 2D Platformer Game
 */
 
class SimpleGame {
    
    game: Phaser.Game;
    block: Phaser.Sprite;
    
    constructor() {
        this.game = new Phaser.Game(800, 600, Phaser.AUTO, "phaser", {preload: this.preload, create: this.create, update: this.update, render: this.render});
    }
    
    preload() {
        this.game.load.image('block', 'assets/placeholder.png');
    }
    
    create() {
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL; // will set it to RESIZE later for responsiveness
        
        this.block = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'block');
        this.block.anchor.setTo(0.5, 0.5);
    }
    
    update() {
        
    }
    
    render() {
        
    }
}

window.onload = () => {
    let game = new SimpleGame();
};