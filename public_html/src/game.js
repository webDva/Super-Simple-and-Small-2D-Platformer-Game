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
            this.game.load.image('player', 'assets/player_avatar.png');
            this.game.load.image('logo', 'assets/pantsuweb2.png');
            // loading tilemap stuff
            this.game.load.tilemap("tilemap", "assets/levels/level1.json", null, Phaser.Tilemap.TILED_JSON);
            this.game.load.spritesheet("tilesheet", "assets/levels/tile_spritesheet.png", 32, 32); // tile spritesheet 
            this.game.load.spritesheet("collectibles_animations", "assets/levels/collectibles_animations.png", 32, 32);
            // load sprites for the onscreen controller
            this.game.load.image("aButton", "assets/controls/abutton.png");
            this.game.load.image("leftButton", "assets/controls/leftarrow.png");
            this.game.load.image("rightButton", "assets/controls/rightarrow.png");
            // load sounds
            this.game.load.audio("jump_sound", "assets/sounds/jump.wav");
            this.game.load.audio("collect_sound", "assets/sounds/collect.wav");
            this.game.load.audio("zap_sound", "assets/sounds/zap.wav");
        };
        GameState.prototype.create = function () {
            var _this = this;
            this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL; // will set it to RESIZE later for responsiveness
            // add sounds
            this.jumpSound = this.game.add.audio("jump_sound");
            this.collectSound = this.game.add.audio("collect_sound");
            this.zapSound = this.game.add.audio("zap_sound");
            // setting the background color
            this.game.stage.backgroundColor = "#312341";
            // just using arcade physics for Super Simple Platformer for now
            this.game.physics.startSystem(Phaser.Physics.ARCADE);
            // player avatar
            this.player = this.game.add.sprite(0, 0, "player");
            this.game.physics.arcade.enable(this.player);
            this.player.body.bounce.y = 0.2;
            this.player.body.gravity.y = GameState.GRAVITY;
            this.player.body.collideWorldBounds = true;
            this.game.camera.follow(this.player); // make camera follow player
            // add cursor keys controls
            this.cursors = this.game.input.keyboard.createCursorKeys();
            // add tiled map
            this.map = this.game.add.tilemap("tilemap");
            this.map.addTilesetImage("tiles", "tilesheet");
            // add platform layer and hazards layer to the game
            this.platformLayer = this.map.createLayer("platform");
            this.hazardsLayer = this.map.createLayer("hazards");
            // setting collision between player and layers
            this.map.setCollisionByExclusion([], true, this.platformLayer);
            this.map.setCollisionByExclusion([], true, this.hazardsLayer);
            this.platformLayer.resizeWorld(); // resize the world to the size of the platform layer
            // add collectibles to the game
            this.collectibles = this.game.add.group();
            this.collectibles.enableBody = true;
            // create sprites for all objects in collectibles group layer
            this.map.createFromObjects("collectibles", 1, "collectibles_animations", 0, true, false, this.collectibles);
            // add animations to the collectibles
            this.collectibles.callAll("animations.add", "animations", "hover", [0, 1, 2, 1], 5, true);
            this.collectibles.callAll("animations.play", "animations", "hover");
            // add oncscreen controls to the screen, but only if touch is available
            if (this.game.device.touch) {
                this.aButton = this.game.add.button(630, 390, "aButton", null, this);
                this.aButton.fixedToCamera = true; // stay in one place like a UI button
                this.aButton.alpha = GameState.CONTROLS_ALPHA_VALUE; // set transparency
                this.aButton.events.onInputDown.add(function () {
                    _this.isAButtonPressed = true;
                });
                this.aButton.events.onInputUp.add(function () {
                    _this.isAButtonPressed = false;
                });
                this.leftButton = this.game.add.button(40, 380, "leftButton", null, this);
                this.leftButton.fixedToCamera = true;
                this.leftButton.alpha = GameState.CONTROLS_ALPHA_VALUE;
                this.leftButton.events.onInputDown.add(function () {
                    _this.isLeftButtonPressed = true;
                });
                this.leftButton.events.onInputUp.add(function () {
                    _this.isLeftButtonPressed = false;
                });
                this.rightButton = this.game.add.button(180, 380, "rightButton", null, this);
                this.rightButton.fixedToCamera = true;
                this.rightButton.alpha = GameState.CONTROLS_ALPHA_VALUE;
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
        /*
         * checks to see if the player is on the ground, then jumps and plays jumping sound
         */
        GameState.prototype.makePlayerJump = function () {
            if (this.player.body.onFloor()) {
                this.player.body.velocity.y = -GameState.JUMP_VELOCITY;
                this.jumpSound.play();
            }
        };
        GameState.prototype.collectibleOverlapCallback = function (player, collectible) {
            // just kill the collectibles for now
            collectible.kill();
            this.collectSound.play();
        };
        GameState.prototype.hazardCollideCallback = function (player) {
            // for now, just make the player jump really high when they collide with a hazard
            player.body.velocity.y = -GameState.JUMP_VELOCITY * 10;
            this.zapSound.play();
        };
        GameState.prototype.update = function () {
            // collisions for the player avatar
            this.game.physics.arcade.collide(this.player, this.platformLayer); // player collides with platform layer tiles
            this.game.physics.arcade.collide(this.player, this.hazardsLayer, this.hazardCollideCallback, null, this);
            this.game.physics.arcade.overlap(this.player, this.collectibles, this.collectibleOverlapCallback, null, this);
            // reset the player's avatar's velocity so it won't move forever
            this.player.body.velocity.x = 0;
            // processing cursor keys or onscreen controls input to move the player avatar
            if (this.cursors.left.isDown || this.isLeftButtonPressed) {
                this.player.body.velocity.x = -GameState.MOVE_VELOCITY;
            }
            else if (this.cursors.right.isDown || this.isRightButtonPressed) {
                this.player.body.velocity.x = GameState.MOVE_VELOCITY;
            }
            if (this.cursors.up.isDown || this.isAButtonPressed) {
                this.makePlayerJump();
            }
            // listening for gamepad controller input        
            if (this.game.input.gamepad.supported && this.game.input.gamepad.active && this.pad1.connected) {
                if (this.pad1.isDown(Phaser.Gamepad.XBOX360_DPAD_LEFT) || this.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) < -0.1) {
                    this.player.body.velocity.x = -GameState.MOVE_VELOCITY;
                }
                else if (this.pad1.isDown(Phaser.Gamepad.XBOX360_DPAD_RIGHT) || this.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) > 0.1) {
                    this.player.body.velocity.x = GameState.MOVE_VELOCITY;
                }
                if (this.pad1.isDown(Phaser.Gamepad.XBOX360_A)) {
                    this.makePlayerJump();
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
    GameState.CONTROLS_ALPHA_VALUE = 0.4;
    PlatformerGame.GameState = GameState;
    var Game = (function () {
        function Game() {
            this.game = new Phaser.Game(800, 600, Phaser.AUTO, "phaser");
            // add game states to the Phaser.Game
            this.game.state.add("GameState", GameState, false);
            /* create two new states: a boot and preloader
             * the boot state will contain an init for the scale manager and will load the loading screen,
             * while the preloader will display the loading screen and load assets and then start the next state
             */
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
