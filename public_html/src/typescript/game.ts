/*
 * Super Simple and Small 2D Platformer Game
 */

class SimpleGame {

    game: Phaser.Game;
    block: Phaser.Sprite;
    logo: Phaser.Sprite;
    
    cursors: Phaser.CursorKeys;

    // don't know if need these here
    map: Phaser.Tilemap;
    platformLayer: Phaser.TilemapLayer;

    constructor() {
        this.game = new Phaser.Game(800, 600, Phaser.AUTO, "phaser", {preload: this.preload, create: this.create, update: this.update, render: this.render});
    }

    preload() {
        this.game.load.image('block', 'assets/placeholder.png'); // will use for the player object
        this.game.load.image('logo', 'assets/pantsuweb2.png');

        // loading tilemap stuff
        this.game.load.tilemap("tilemap", "assets/levels/level1.json", null, Phaser.Tilemap.TILED_JSON);
        this.game.load.image("tiles", "assets/spritesheet.png"); // tile spritesheet 
    }

    create() {
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL; // will set it to RESIZE later for responsiveness

//        this.logo = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'logo');
//        this.logo.scale.s        etTo(0.2, 0.2);
//        this.logo.anchor.setTo(0.5, 0.5);

        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        // add red block to represent player
        this.block = this.game.add.sprite(0, 0, "block");
        this.block.width = 32;
        this.block.height = 32;
        
        this.game.physics.arcade.enable(this.block);
        
        this.block.body.bounce.y = 0.2;
        this.block.body.gravity.y = 2000;
        this.block.body.gravity.x = 20;
        this.block.body.velocity.x = 100;
        
        this.game.camera.follow(this.block);
        
        this.cursors = this.game.input.keyboard.createCursorKeys();

        this.map = this.game.add.tilemap("tilemap");
        this.map.addTilesetImage("blocks", "tiles");

        this.platformLayer = this.map.createLayer("platform");

        this.map.setCollisionBetween(1, 10000, true, this.platformLayer);

        this.platformLayer.resizeWorld();
    }

    update() {
        this.game.physics.arcade.collide(this.block, this.platformLayer);
    }

    render() {

    }
}

window.onload = () => {
    let game = new SimpleGame();
};