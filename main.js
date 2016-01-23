function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    while ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + this.startX,
				  vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

function Villan(game) {													//startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse
    var sheet = ASSET_MANAGER.getAsset("img/fantasy-spritesheet.png");
	this.animation = new Animation(sheet, 192 + 32, 128, 32, 32, 0.05, 1, true, false);
	this.telOutAnimation = new Animation(sheet, 192 + 96, 128, 32, 32, 0.05, 9, false, true);
    this.telInAnimation = new Animation(sheet, 192 + 96, 128, 32, 32, 0.05, 9, false, false);
    this.telInAnimation = new Animation(sheet, 192 + 96, 128, 32, 32, 0.05, 9, false, false);
	this.downAnimation = new Animation(sheet, 192, 128, 32, 32, 0.2, 3, true, false);
	this.leftAnimation = new Animation(sheet, 192, 128 + 32, 32, 32, 0.2, 3, true, false);
	this.rightAnimation = new Animation(sheet, 192, 128 + 64, 32, 32, 0.2, 3, true, false);
	this.upAnimation = new Animation(sheet, 192, 128 + 96, 32, 32, 0.2, 3, true, false);
	this.telIn = true;
	this.telOut = false;
	this.down = this.up = this.left = this.right = false;
    Entity.call(this, game, 200, 200);
}

Villan.prototype = new Entity();
Villan.prototype.constructor = Villan;

Villan.prototype.update = function () {
    if (this.game.map[32]) this.telOut = true;
    if (this.game.map[37] && !this.game.map[39]) {
		this.left = true;
		this.animation.startY = 128 + 32;
		this.x -= 1.5;
	} else this.left = false;
    if (this.game.map[39] && !this.game.map[37]) {
		this.right = true;
		this.x += 1.5;
		this.animation.startY = 128 + 64;
	} else this.right = false;
    if (this.game.map[38] && !this.game.map[40]) {
		this.up = true;
		this.y -= 1.5;
		this.animation.startY = 128 + 96;
	} else this.up = false;
    if (this.game.map[40] && !this.game.map[38]) {
		this.down = true;
		this.y += 1.5;
		this.animation.startY = 128;
	} else this.down = false;
    if (this.telOut) {
		this.game.map[32] = false;
        if (this.telOutAnimation.isDone()) {
            this.telOutAnimation.elapsedTime = 0;
            this.telOut = false;
			this.telIn = true;
			this.x = Math.round(Math.random() * (400 - 32));
			this.y = Math.round(Math.random() * (400 - 32));
        }
    } else if (this.telIn) {
		if (this.telInAnimation.isDone()) {
            this.telInAnimation.elapsedTime = 0;
            this.telIn = false;
        }
	} 
    Entity.prototype.update.call(this);
}

Villan.prototype.draw = function (ctx) {
    if (this.telOut) {
        this.telOutAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    } else if (this.telIn) {
		this.telInAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);	
	} else if (this.up) {
		this.upAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);	
	} else if (this.down) {
		this.downAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);	
	} else if (this.left) {
		this.leftAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);	
	} else if (this.right) {
		this.rightAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);	
	} else {
        this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    Entity.prototype.draw.call(this);
}

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("img/fantasy-spritesheet.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da shield");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');
	
    var gameEngine = new GameEngine();
    var villan = new Villan(gameEngine);

    gameEngine.addEntity(villan);
 
    gameEngine.init(ctx);
    gameEngine.start();
	console.log(gameEngine);
});
