/*
 * Super Simple and Small 2D Platformer Game
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var PlatformerGame;
(function (PlatformerGame) {
    /*
     * The main game running state
     */
    var GameState = (function (_super) {
        __extends(GameState, _super);
        function GameState() {
            return _super.call(this) || this;
        }
        GameState.prototype.preload = function () {
            this.game.load.image('block', 'assets/placeholder.png'); // will use for the player object
            this.game.load.image('logo', 'assets/pantsuweb2.png');
            // loading tilemap stuff
            this.game.load.tilemap("tilemap", "assets/levels/level1.json", null, Phaser.Tilemap.TILED_JSON);
            this.game.load.spritesheet("tiles", "assets/levels/spritesheet.png", 32, 32); // tile spritesheet 
            // load sprites for the onscreen controller
            this.game.load.image("aButton", "assets/controls/abutton.png");
            this.game.load.image("leftButton", "assets/controls/leftarrow.png");
            this.game.load.image("rightButton", "assets/controls/rightarrow.png");
        };
        GameState.prototype.create = function () {
            var _this = this;
            this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL; // will set it to RESIZE later for responsiveness
            this.game.physics.startSystem(Phaser.Physics.ARCADE);
            // add red block to represent player
            this.block = this.game.add.sprite(0, 0, "block");
            this.block.width = 32;
            this.block.height = 32;
            this.game.physics.arcade.enable(this.block);
            this.block.body.bounce.y = 0.2;
            this.block.body.gravity.y = GameState.GRAVITY;
            this.block.body.collideWorldBounds = true;
            this.game.camera.follow(this.block); // make camera follow player
            // add cursor keys controls
            this.cursors = this.game.input.keyboard.createCursorKeys();
            // add tiled map
            this.map = this.game.add.tilemap("tilemap");
            this.map.addTilesetImage("blocks", "tiles");
            // add platform layer to the game
            this.platformLayer = this.map.createLayer("platform");
            this.map.setCollisionBetween(1, 10000, true, this.platformLayer); // got to do something about that arbitrary 10000
            this.platformLayer.resizeWorld(); // resize the world to the size of the platform layer
            // add collectibles to the game
            this.collectibles = this.game.add.group();
            this.collectibles.enableBody = true;
            // create sprites for all objects in collectibles group layer
            this.map.createFromObjects("collectibles", 1, "tiles", 0, true, false, this.collectibles);
            // add oncscreen controls to the screen, but only if touch is available
            if (this.game.device.touch) {
                this.aButton = this.game.add.button(630, 390, "aButton", null, this);
                this.aButton.fixedToCamera = true; // stay in one place like a UI button
                this.aButton.events.onInputDown.add(function () {
                    _this.isAButtonPressed = true;
                });
                this.aButton.events.onInputUp.add(function () {
                    _this.isAButtonPressed = false;
                });
                this.leftButton = this.game.add.button(40, 380, "leftButton", null, this);
                this.leftButton.fixedToCamera = true;
                this.leftButton.events.onInputDown.add(function () {
                    _this.isLeftButtonPressed = true;
                });
                this.leftButton.events.onInputUp.add(function () {
                    _this.isLeftButtonPressed = false;
                });
                this.rightButton = this.game.add.button(180, 380, "rightButton", null, this);
                this.rightButton.fixedToCamera = true;
                this.rightButton.events.onInputDown.add(function () {
                    _this.isRightButtonPressed = true;
                });
                this.rightButton.events.onInputUp.add(function () {
                    _this.isRightButtonPressed = false;
                });
            }
            // add gamepad controls support for XBOX 360 controller
            this.game.input.gamepad.start();
            this.pad1 = this.game.input.gamepad.pad1;
        };
        GameState.prototype.update = function () {
            this.game.physics.arcade.collide(this.block, this.platformLayer); // player collides with platform layer tiles
            this.game.physics.arcade.overlap(this.block, this.collectibles, function (player, collectible) {
                collectible.kill();
            }, null, this);
            // reset the player's avatar's velocity so it won't move forever
            this.block.body.velocity.x = 0;
            // processing cursor keys or onscreen controls input to move the player avatar
            if (this.cursors.left.isDown || this.isLeftButtonPressed) {
                this.block.body.velocity.x = -GameState.MOVE_VELOCITY;
            }
            else if (this.cursors.right.isDown || this.isRightButtonPressed) {
                this.block.body.velocity.x = GameState.MOVE_VELOCITY;
            }
            if ((this.cursors.up.isDown || this.isAButtonPressed) && this.block.body.onFloor()) {
                this.block.body.velocity.y = -GameState.JUMP_VELOCITY;
            }
            // listening for gamepad controller input        
            if (this.game.input.gamepad.supported && this.game.input.gamepad.active && this.pad1.connected) {
                if (this.pad1.isDown(Phaser.Gamepad.XBOX360_DPAD_LEFT) || this.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) < -0.1) {
                    this.block.body.velocity.x = -GameState.MOVE_VELOCITY;
                }
                else if (this.pad1.isDown(Phaser.Gamepad.XBOX360_DPAD_RIGHT) || this.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) > 0.1) {
                    this.block.body.velocity.x = GameState.MOVE_VELOCITY;
                }
                if (this.pad1.isDown(Phaser.Gamepad.XBOX360_A) && this.block.body.onFloor()) {
                    this.block.body.velocity.y = -GameState.JUMP_VELOCITY;
                }
            }
        };
        GameState.prototype.render = function () {
        };
        return GameState;
    }(Phaser.State));
    // CONSTANTS
    GameState.GRAVITY = 1000;
    GameState.MOVE_VELOCITY = 400;
    GameState.JUMP_VELOCITY = GameState.MOVE_VELOCITY + GameState.MOVE_VELOCITY * 0.55;
    PlatformerGame.GameState = GameState;
    var Game = (function () {
        function Game() {
            this.game = new Phaser.Game(800, 600, Phaser.AUTO, "phaser");
            // add game states to the Phaser.Game
            this.game.state.add("GameState", GameState, false);
            // start the first state
            this.game.state.start("GameState", true, true);
        }
        return Game;
    }());
    PlatformerGame.Game = Game;
})(PlatformerGame || (PlatformerGame = {}));
window.onload = function () {
    var game = new PlatformerGame.Game();
};
