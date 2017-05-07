/*
 * Super Simple and Small 2D Platformer Game
 */
var SimpleGame = (function () {
    function SimpleGame() {
        this.game = new Phaser.Game(800, 600, Phaser.AUTO, "phaser", { preload: this.preload, create: this.create, update: this.update, render: this.render });
    }
    SimpleGame.prototype.preload = function () {
        this.game.load.image('block', 'assets/placeholder.png'); // will use for the player object
        this.game.load.image('logo', 'assets/pantsuweb2.png');
        // loading tilemap stuff
        this.game.load.tilemap("tilemap", "assets/levels/level1.json", null, Phaser.Tilemap.TILED_JSON);
        this.game.load.image("tiles", "assets/spritesheet.png"); // tile spritesheet 
    };
    SimpleGame.prototype.create = function () {
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL; // will set it to RESIZE later for         responsiveness
        //        this.logo = this.game.add.sprite(this.game.world.centerX, this.game.world.ce        nterY, 'logo');
        //        this.logo.scale.s        etTo(0.2, 0.2);
        //        this.logo.anchor.setTo(0.5, 0.5);
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        // add red block to represent player
        this.block = this.game.add.sprite(0, 0, "block");
        this.map = this.game.add.tilemap("tilemap");
        this.map.addTilesetImage("blocks", "tiles");
        this.platformLayer = this.map.createLayer("platform");
        this.map.setCollisionBetween(1, 10000, true, this.platformLayer);
        this.platformLayer.resizeWorld();
    };
    SimpleGame.prototype.update = function () {
    };
    SimpleGame.prototype.render = function () {
    };
    return SimpleGame;
}());
window.onload = function () {
    var game = new SimpleGame();
};
