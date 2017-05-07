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

    // CONSTANTS
    static GRAVITY: number = 1000;
    static MOVE_VELOCITY: number = 400;
    static JUMP_VELOCITY: number = SimpleGame.MOVE_VELOCITY + SimpleGame.MOVE_VELOCITY * 0.55;

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

        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        // add red block to represent player
        this.block = this.game.add.sprite(0, 0, "block");
        this.block.width = 32;
        this.block.height = 32;

        this.game.physics.arcade.enable(this.block);

        this.block.body.bounce.y = 0.2;
        this.block.body.gravity.y = SimpleGame.GRAVITY;

        this.block.body.collideWorldBounds = true;

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

        this.block.body.velocity.x = 0;

        if (this.cursors.left.isDown) {
            this.block.body.velocity.x = -SimpleGame.MOVE_VELOCITY;

        }
        else if (this.cursors.right.isDown) {
            this.block.body.velocity.x = SimpleGame.MOVE_VELOCITY;

        }

        if (this.cursors.up.isDown && this.block.body.onFloor()) {
            this.block.body.velocity.y = -SimpleGame.JUMP_VELOCITY;
        }
    }

    render() {

    }
}

window.onload = () => {
    let game = new SimpleGame();
};