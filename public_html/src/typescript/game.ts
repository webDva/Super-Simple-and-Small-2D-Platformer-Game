/*
 * Super Simple and Small 2D Platformer Game
 */

module PlatformerGame {
    /*
     * Boot state for only loading the loading screen
     */
    export class BootState extends Phaser.State {
        constructor() {
            super();
        }

        init() {
            this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL; // will set it to RESIZE later for responsiveness

            // setting the background color
            this.game.stage.backgroundColor = "#312341";
        }

        preload() {
            this.game.load.image("loadingScreen", "assets/pantsuweb2.png");
        }

        create() {
            this.game.state.start("PreloadState");
        }
    }

    // enum for movement directions
    export enum Movement {
        Left,
        Right,
        Jump
    }

    /*
     * Preload state for actually loading assets
     */
    export class PreloadState extends Phaser.State {
        constructor() {
            super();
        }

        preload() {
            // display the loading screen image
            let loadingScreenImage = this.game.add.image(this.game.world.centerX, this.game.world.centerY, "loadingScreen");
            loadingScreenImage.anchor.set(0.5, 0.5);
            loadingScreenImage.scale.set(0.3, 0.3);

            // also display Pantsu Web brand name text
            let textStyle = {font: "8.7em Impact, sans-serif", fill: "#ffffff", align: "center"};
            let welcomeMessage = this.game.add.text(this.game.world.centerX, 0, "Pantsu Web", textStyle);
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
        }

        create() {
            this.game.state.start("GameState");
        }
    }

    /*
     * The main game running state
     */
    export class GameState extends Phaser.State {

        game: Phaser.Game;

        // sprites
        player: Phaser.Sprite;
        logo: Phaser.Sprite;

        // sounds
        jumpSound: Phaser.Sound;
        collectSound: Phaser.Sound;
        hazardSound: Phaser.Sound;

        // keyboard cursor key controls
        cursors: Phaser.CursorKeys;

        // tiled map stuff
        map: Phaser.Tilemap;
        platformLayer: Phaser.TilemapLayer;
        hazardsLayer: Phaser.TilemapLayer;
        collectibles: Phaser.Group;

        // collectibles counters
        collected: number;
        totalCollectibles: number;
        scoreText: Phaser.Text;
        isGameWon: boolean = false; // so the game won't countionusly add the text sprite to the screen

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

        // only one gamepad (XBOX 360 controller)
        pad1: Phaser.SinglePad;

        // CONSTANTS
        static GRAVITY: number = 1000;
        static MOVE_VELOCITY: number = 365;
        static JUMP_VELOCITY: number = GameState.MOVE_VELOCITY + GameState.MOVE_VELOCITY * 0.38;
        static CONTROLS_ALPHA_VALUE: number = 0.4; // transparency value for on screen controls

        constructor() {
            super();
        }

        create() {
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
            this.player.body.tilePadding = new Phaser.Point(130, 130); // Extra padding so the player won't skip over tilemap collisions
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
            this.collectibles.forEach((child: Phaser.Sprite) => {
                child.anchor.setTo(0.5, 0.5); // set the anchor of all collectibles to be the center for the tween animations
            }, this);

            // add animations to the collectibles
            this.collectibles.callAll("animations.add", "animations", "hover", [0, 1, 2, 1], 5, true);
            this.collectibles.callAll("animations.play", "animations", "hover");

            // create counters for collectibles
            this.totalCollectibles = this.collectibles.length;
            this.collected = 0;

            // display text for collected and total collectibles
            let textStyle = {font: "4em Impact, sans-serif", fill: "#ffd133", align: "center"};
            this.scoreText = this.game.add.text(this.game.width, 0, this.collected + "/" + this.totalCollectibles, textStyle);
            this.scoreText.anchor.setTo(1, 0);
            this.scoreText.fixedToCamera = true;

            // add oncscreen controls to the screen, but only if touch is available
            if (this.game.device.touch) {
                this.aButton = this.game.add.button(630, 390, "aButton", null, this);
                this.aButton.fixedToCamera = true; // stay in one place like a UI button
                this.aButton.alpha = GameState.CONTROLS_ALPHA_VALUE; // set transparency
                this.aButton.events.onInputDown.add(() => {
                    this.isAButtonPressed = true;
                });
                this.aButton.events.onInputUp.add(() => {
                    this.isAButtonPressed = false;
                });

                this.leftButton = this.game.add.button(40, 380, "leftButton", null, this);
                this.leftButton.fixedToCamera = true;
                this.leftButton.alpha = GameState.CONTROLS_ALPHA_VALUE;
                this.leftButton.events.onInputDown.add(() => {
                    this.isLeftButtonPressed = true;
                });
                this.leftButton.events.onInputUp.add(() => {
                    this.isLeftButtonPressed = false;
                });

                this.rightButton = this.game.add.button(180, 380, "rightButton", null, this);
                this.rightButton.fixedToCamera = true;
                this.rightButton.alpha = GameState.CONTROLS_ALPHA_VALUE;
                this.rightButton.events.onInputDown.add(() => {
                    this.isRightButtonPressed = true;
                });
                this.rightButton.events.onInputUp.add(() => {
                    this.isRightButtonPressed = false;
                });
            }

            // add gamepad controls support for XBOX 360 controller
            this.game.input.gamepad.start();
            this.pad1 = this.game.input.gamepad.pad1;
        }

        /*
         * controls player horizontal movement
         */
        movePlayer(direction: PlatformerGame.Movement) {
            // The player's avatar's physics body will be disabled if they touch the lava hazards, so stop
            // controlling their movement if they're dead.
            if (!this.player.body.enable) {
                return;
            }

            // If the player is in mid-air, decrease their movement speed by 10%.
            let speedModifier = 0;
            if (!this.player.body.onFloor()) {
                speedModifier = 0.10 * GameState.MOVE_VELOCITY;
            }

            if (direction === PlatformerGame.Movement.Left) {
                this.player.body.velocity.x = -GameState.MOVE_VELOCITY - speedModifier;
            } else if (direction === PlatformerGame.Movement.Right) {
                this.player.body.velocity.x = GameState.MOVE_VELOCITY - speedModifier;
            } else if (direction === PlatformerGame.Movement.Jump) {
                // checks to see if the player is on the ground, then jumps and plays jumping sound
                if (this.player.body.onFloor()) {
                    this.player.body.velocity.y = -GameState.JUMP_VELOCITY;
                    this.jumpSound.play();
                }
            }
        }

        collectibleOverlapCallback(player: Phaser.Sprite, collectible: Phaser.Sprite) {
            // translate and scale tweens
            const duration = 500; // duration of the tween combination
            this.game.add.tween(collectible).to({y: collectible.y - 30}, duration, null, true);
            let lastTween = this.game.add.tween(collectible.scale).to({x: 0, y: 0}, duration, null, true);

            // stop colliding now
            collectible.body.checkCollision.none = true;

            // kill the collectible once the tweens complete
            lastTween.onComplete.add(() => {
                collectible.kill();
            }, this);

            this.collectSound.play();

            // update collected collectibles counter
            this.collected++;
            this.scoreText.text = this.collected + "/" + this.totalCollectibles;
        }

        /*
         * Kills the player and restarts the GameState
         */
        hazardCollideCallback(player: Phaser.Sprite) {
            // disable the player's avatar's physics body
            player.body.enable = false;
            this.hazardSound.play();

            // Make player avatar rotate, scale, and alpha fade, then restart the GameState           
            const duration = 1750;
            this.game.add.tween(player).to({angle: player.angle + 360 * 5}, duration, null, true);
            this.game.add.tween(player.scale).to({x: 0, y: 0}, duration, null, true);
            this.game.add.tween(player).to({alpha: 0}, duration, null, true)
                .onComplete.add(() => {
                    this.game.state.start("GameState");
                }, this);
        }

        update() {
            // collisions for the player avatar
            this.game.physics.arcade.collide(this.player, this.platformLayer); // player collides with platform layer tiles
            this.game.physics.arcade.collide(this.player, this.hazardsLayer, this.hazardCollideCallback, null, this);
            this.game.physics.arcade.overlap(this.player, this.collectibles, this.collectibleOverlapCallback, null, this);

            // Display a victory/win message if the player collects all collectibles, and that's it!
            if (this.collected === this.totalCollectibles) {
                if (!this.isGameWon) {
                    this.isGameWon = true;

                    let textStyle = {font: "8em Impact, sans-serif", fill: "#9d00ff", align: "center"};
                    let winText = this.game.add.text(this.game.camera.width / 2, this.game.camera.height / 2, "You win!", textStyle);
                    winText.anchor.setTo(0.5, 0.5);
                    winText.fixedToCamera = true;
                    winText.alpha = 0.90;
                }
            }

            // reset the player's avatar's velocity so it won't move forever
            this.player.body.velocity.x = 0;

            // processing cursor keys or onscreen controls input to move the player avatar
            if (this.cursors.left.isDown || this.isLeftButtonPressed) {
                this.movePlayer(PlatformerGame.Movement.Left);
            }
            else if (this.cursors.right.isDown || this.isRightButtonPressed) {
                this.movePlayer(PlatformerGame.Movement.Right);
            }
            if (this.cursors.up.isDown || this.isAButtonPressed) {
                this.movePlayer(PlatformerGame.Movement.Jump);
            }

            // listening for gamepad controller input        
            if (this.game.input.gamepad.supported && this.game.input.gamepad.active && this.pad1.connected) {
                if (this.pad1.isDown(Phaser.Gamepad.XBOX360_DPAD_LEFT) || this.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) < -0.1) {
                    this.movePlayer(PlatformerGame.Movement.Left);
                }
                else if (this.pad1.isDown(Phaser.Gamepad.XBOX360_DPAD_RIGHT) || this.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) > 0.1) {
                    this.movePlayer(PlatformerGame.Movement.Right);
                }
                if (this.pad1.isDown(Phaser.Gamepad.XBOX360_A)) {
                    this.movePlayer(PlatformerGame.Movement.Jump);
                }
            }
        }
    }

    export class Game {
        game: Phaser.Game;

        constructor() {
            this.game = new Phaser.Game(800, 600, Phaser.AUTO, "phaser");

            /* The boot state will contain an init() for the scale manager and will load the loading screen,
             * while the preloader will display the loading screen and load assets and then start the main game state.
             */
            this.game.state.add("BootState", BootState, true);
            this.game.state.add("PreloadState", PreloadState);
            this.game.state.add("GameState", GameState);
        }
    }
}

window.onload = () => {
    let game = new PlatformerGame.Game();
};