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
     * Boot state for only loading the loading screen
     */
    var BootState = (function (_super) {
        __extends(BootState, _super);
        function BootState() {
            return _super.call(this) || this;
        }
        BootState.prototype.init = function () {
            this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL; // will set it to RESIZE later for responsiveness
            // setting the background color
            this.game.stage.backgroundColor = "#312341";
        };
        BootState.prototype.preload = function () {
            this.game.load.image("loadingScreen", "assets/pantsuweb2.png");
        };
        BootState.prototype.create = function () {
            this.game.state.start("PreloadState");
        };
        return BootState;
    }(Phaser.State));
    PlatformerGame.BootState = BootState;
    // enum for movement directions
    var Direction;
    (function (Direction) {
        Direction[Direction["Left"] = 0] = "Left";
        Direction[Direction["Right"] = 1] = "Right";
    })(Direction = PlatformerGame.Direction || (PlatformerGame.Direction = {}));
    /*
     * Preload state for actually loading assets
     */
    var PreloadState = (function (_super) {
        __extends(PreloadState, _super);
        function PreloadState() {
            return _super.call(this) || this;
        }
        PreloadState.prototype.preload = function () {
            // display the loading screen image
            var loadingScreenImage = this.game.add.image(this.game.world.centerX, this.game.world.centerY, "loadingScreen");
            loadingScreenImage.anchor.set(0.5, 0.5);
            loadingScreenImage.scale.set(0.3, 0.3);
            // also display Pantsu Web brand name text
            var textStyle = { font: "8.7em Impact, sans-serif", fill: "#ffffff", align: "center" };
            var welcomeMessage = this.game.add.text(this.game.world.centerX, 0, "Pantsu Web", textStyle);
            // just making the brand name text display directly below the loading screen
            welcomeMessage.y = loadingScreenImage.y + loadingScreenImage.height / 2 + welcomeMessage.height / 2;
            welcomeMessage.anchor.set(0.5, 0.5);
            // now load assets
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
            this.game.load.audio("hazard_sound", "assets/sounds/hazard.wav");
        };
        PreloadState.prototype.create = function () {
            this.game.state.start("GameState");
        };
        return PreloadState;
    }(Phaser.State));
    PlatformerGame.PreloadState = PreloadState;
    /*
     * The main game running state
     */
    var GameState = (function (_super) {
        __extends(GameState, _super);
        function GameState() {
            return _super.call(this) || this;
        }
        GameState.prototype.create = function () {
            var _this = this;
            // add sounds
            this.jumpSound = this.game.add.audio("jump_sound");
            this.collectSound = this.game.add.audio("collect_sound");
            this.hazardSound = this.game.add.audio("hazard_sound");
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
            this.collectibles.forEach(function (child) {
                child.anchor.setTo(0.5, 0.5); // set the anchor of all collectibles to be the center for the tween animations
            }, this);
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
            // The player's avatar's physics body will be disabled if they touch the lava hazards, so stop
            // controlling their movement if they're dead.
            if (!this.player.body.enable) {
                return;
            }
            if (this.player.body.onFloor()) {
                this.player.body.velocity.y = -GameState.JUMP_VELOCITY;
                this.jumpSound.play();
            }
        };
        /*
         * controls player horizontal movement
         */
        GameState.prototype.movePlayer = function (direction) {
            if (!this.player.body.enable) {
                return;
            }
            // If the player is in mid-air, decrease their movement speed by 1/4.
            var speedModifier = 0;
            if (!this.player.body.onFloor()) {
                speedModifier = 1 / 4 * GameState.MOVE_VELOCITY;
            }
            if (direction === PlatformerGame.Direction.Left) {
                this.player.body.velocity.x = -GameState.MOVE_VELOCITY - speedModifier;
            }
            else if (direction === PlatformerGame.Direction.Right) {
                this.player.body.velocity.x = GameState.MOVE_VELOCITY - speedModifier;
            }
        };
        GameState.prototype.collectibleOverlapCallback = function (player, collectible) {
            // translate and scale tweens
            var duration = 500; // duration of the tween combination
            this.game.add.tween(collectible).to({ y: collectible.y - 30 }, duration, null, true);
            var lastTween = this.game.add.tween(collectible.scale).to({ x: 0, y: 0 }, duration, null, true);
            // stop colliding now
            collectible.body.checkCollision.none = true;
            // kill the collectible once the tweens complete
            lastTween.onComplete.add(function () {
                collectible.kill();
            }, this);
            this.collectSound.play();
        };
        /*
         * Kills the player and restarts the GameState
         */
        GameState.prototype.hazardCollideCallback = function (player) {
            var _this = this;
            // disable the player's avatar's physics body
            player.body.enable = false;
            this.hazardSound.play();
            // Make player avatar rotate, scale, and alpha fade, then restart the GameState           
            var duration = 1750;
            this.game.add.tween(player).to({ angle: player.angle + 360 * 5 }, duration, null, true);
            this.game.add.tween(player.scale).to({ x: 0, y: 0 }, duration, null, true);
            this.game.add.tween(player).to({ alpha: 0 }, duration, null, true)
                .onComplete.add(function () {
                _this.game.state.start("GameState");
            }, this);
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
                this.movePlayer(PlatformerGame.Direction.Left);
            }
            else if (this.cursors.right.isDown || this.isRightButtonPressed) {
                this.movePlayer(PlatformerGame.Direction.Right);
            }
            if (this.cursors.up.isDown || this.isAButtonPressed) {
                this.makePlayerJump();
            }
            // listening for gamepad controller input        
            if (this.game.input.gamepad.supported && this.game.input.gamepad.active && this.pad1.connected) {
                if (this.pad1.isDown(Phaser.Gamepad.XBOX360_DPAD_LEFT) || this.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) < -0.1) {
                    this.movePlayer(PlatformerGame.Direction.Left);
                }
                else if (this.pad1.isDown(Phaser.Gamepad.XBOX360_DPAD_RIGHT) || this.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) > 0.1) {
                    this.movePlayer(PlatformerGame.Direction.Right);
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
    GameState.CONTROLS_ALPHA_VALUE = 0.4; // transparency value for on screen controls
    PlatformerGame.GameState = GameState;
    var Game = (function () {
        function Game() {
            this.game = new Phaser.Game(800, 600, Phaser.AUTO, "phaser");
            /* The boot state will contain an init() for the scale manager and will load the loading screen,
             * while the preloader will display the loading screen and load assets and then start the main game state.
             */
            this.game.state.add("BootState", BootState, true);
            this.game.state.add("PreloadState", PreloadState);
            this.game.state.add("GameState", GameState);
        }
        return Game;
    }());
    PlatformerGame.Game = Game;
})(PlatformerGame || (PlatformerGame = {}));
window.onload = function () {
    var game = new PlatformerGame.Game();
};
