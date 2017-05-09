/*
 * Super Simple and Small 2D Platformer Game
 */

class SimpleGame {

    game: Phaser.Game;
    block: Phaser.Sprite;
    logo: Phaser.Sprite;

    cursors: Phaser.CursorKeys;

    // tiled map stuff
    map: Phaser.Tilemap;
    platformLayer: Phaser.TilemapLayer;
    collectibles: Phaser.Group;

    // onscreen controls sprites
    aButton: Phaser.Button;
    bButton: Phaser.Button;
    leftButton: Phaser.Button;
    rightButton: Phaser.Button;

    // booleans for button holding
    isAButtonPressed: boolean;
    isBButtonPressed: boolean;
    isLeftButtonPressed: boolean;
    isRightButtonPressed: boolean;

    // only one gamepad
    pad1: Phaser.SinglePad;

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
        this.game.load.spritesheet("tiles", "assets/levels/spritesheet.png", 32, 32); // tile spritesheet 

        // load sprites for the onscreen controller
        this.game.load.image("aButton", "assets/controls/abutton.png");
        this.game.load.image("leftButton", "assets/controls/leftarrow.png");
        this.game.load.image("rightButton", "assets/controls/rightarrow.png");
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

        // add collectibles to the game
        this.collectibles = this.game.add.group();
        this.collectibles.enableBody = true;

        // create sprites for all objects in collectibles group layer
        this.map.createFromObjects("collectibles", 1, "tiles", 0, true, false, this.collectibles);

        // add controls to the screen (should add code for determining if player is on desktop or mobile)
        this.aButton = this.game.add.button(525, 430, "aButton", null, this);
        this.aButton.fixedToCamera = true; // stay in one place like a UI button
        this.aButton.events.onInputDown.add(() => {
            this.isAButtonPressed = true;
        });
        this.aButton.events.onInputUp.add(() => {
            this.isAButtonPressed = false;
        });

        this.leftButton = this.game.add.button(40, 380, "leftButton", null, this);
        this.leftButton.fixedToCamera = true;
        this.leftButton.events.onInputDown.add(() => {
            this.isLeftButtonPressed = true;
        });
        this.leftButton.events.onInputUp.add(() => {
            this.isLeftButtonPressed = false;
        });

        this.rightButton = this.game.add.button(180, 380, "rightButton", null, this);
        this.rightButton.fixedToCamera = true;
        this.rightButton.events.onInputDown.add(() => {
            this.isRightButtonPressed = true;
        });
        this.rightButton.events.onInputUp.add(() => {
            this.isRightButtonPressed = false;
        });

        // start gamepad controls
        this.game.input.gamepad.start();
        this.pad1 = this.game.input.gamepad.pad1;
    }

    update() {
        this.game.physics.arcade.collide(this.block, this.platformLayer);
        this.game.physics.arcade.overlap(this.block, this.collectibles, (player: Phaser.Sprite, collectible: Phaser.Sprite) => {
            collectible.kill();
        }, null, this);

        this.block.body.velocity.x = 0;

        if (this.cursors.left.isDown || this.isLeftButtonPressed) {
            this.block.body.velocity.x = -SimpleGame.MOVE_VELOCITY;
        }
        else if (this.cursors.right.isDown || this.isRightButtonPressed) {
            this.block.body.velocity.x = SimpleGame.MOVE_VELOCITY;
        }

        if ((this.cursors.up.isDown || this.isAButtonPressed) && this.block.body.onFloor()) {
            this.block.body.velocity.y = -SimpleGame.JUMP_VELOCITY;
        }

        // listening for gamepad input        
        if (this.game.input.gamepad.supported && this.game.input.gamepad.active && this.pad1.connected) {
            if (this.pad1.isDown(Phaser.Gamepad.XBOX360_DPAD_LEFT) || this.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) < -0.1) {
                this.block.body.velocity.x = -SimpleGame.MOVE_VELOCITY;
            }

            else if (this.pad1.isDown(Phaser.Gamepad.XBOX360_DPAD_RIGHT) || this.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) > 0.1) {
                this.block.body.velocity.x = SimpleGame.MOVE_VELOCITY;
            }

            if (this.pad1.isDown(Phaser.Gamepad.XBOX360_A) && this.block.body.onFloor()) {
                this.block.body.velocity.y = -SimpleGame.JUMP_VELOCITY;
            }
        }
    }

    render() {

    }
}

window.onload = () => {
    let game = new SimpleGame();
};