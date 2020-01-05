var NUM_ROW = 6;
var NUM_COL = 5;
var canW = 505;
var canH = 606;
var blockW = 101, blockH = 83; //all elements used in this game have this dimension, so here generally call them block;
var TOP_OFFSET = 0.25 * blockH;
var EnemyStartX = -blockW;
var PlayerStartX = Math.floor(NUM_COL/2) * blockW;
var PlayerStartY = (NUM_ROW -1)* blockH - TOP_OFFSET;


//Enemy that player will be avoiding
var Enemy = function(x,y,speed) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    this.x = x;
    this.y = y;
    this.speed = speed;
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // Multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.

    //if ememy moves outside of the canvas, move it back to the leftmost
    // start position and update its speed to another random speed.
    if(this.x > canW){
        this.x = EnemyStartX;
    }
    //if enemy is still inside canvas, update its position to move it
    //a step right.
    else{
        this.x += this.speed * dt;
    }


};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};
Enemy.prototype.enemySpeedUp = function(increment){

};
// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function(x,y){
    this.sprite = 'images/char-boy.png';
    this.x = x;
    this.y = y;
};
//This method handles player's movement, collision, and other actions.
Player.prototype.update = function(){
        this.handleInput();
};
/* Draw player picture on the screen*/
Player.prototype.render = function(){
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/* identify each keyboard input with its updating in position */
Player.prototype.handleInput = function(keyChar){
    if(keyChar == 'left' && this.x > 0){
        this.x -= blockW;
    }
    else if(keyChar == 'right' && this.x < canW - blockW){
        this.x += blockW;
    }
    else if(keyChar == 'up' && this.y > 0){
        this.y -= blockH;
        if(this.y < blockH - TOP_OFFSET){
            this.y = -10; // adjust the char to avoid printing outside of canvas.
        }
    }
    else if(keyChar == 'down' && this.y <= PlayerStartY - blockH)
        this.y += blockH;
};
var Item = function(x,y,sprite){
    this.sprite = sprite;
    this.x = x;
    this.y = y;
};
// Items only need to be rendered, because they are static objects in canvas
Item.prototype.render = function(){
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};
//store created item prototype into an variable for future use of chaining.
var ItemPrototype = Object.create(Item.prototype);

//The subclass Heart
var Heart = function(x,y,sprite){
    Item.call(this, x, y, sprite);
};
//chain the prototype to Item
Heart.prototype = ItemPrototype;

//The subclass Gem
var Gem = function(x,y, sprite){
    Item.call(this, x, y, sprite);

};
//chain the prototype to Item
Gem.prototype = ItemPrototype;

var randomizeItemStartPos = function(){
    var ItemStartPos = {};
    //set the x value so that items have half the chance to appear on screen;
    ItemStartPos.x = Math.floor(Math.random() *  (NUM_COL+ 5))* blockW;
    ItemStartPos.y = Math.floor(Math.random() * (NUM_ROW - 3)+1) * blockH - TOP_OFFSET;
    return ItemStartPos;
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies =[];
//
var numEnemyTrails = 3;  //there are 3 enemy trails at level 1.
var numEnemyPerRow = 2;  //each enemytrial will have 2 enemies at level 1.
var speedMultiplier = 100; // speed multiplier of enemy at level 1.
for(var i = 0 ; i < numEnemyTrails; i++ ){
    for(var j = 0; j < numEnemyPerRow; j++){
        var enemy = new Enemy(EnemyStartX, (i+1) * blockH - TOP_OFFSET, Math.random()*speedMultiplier + 5);
        allEnemies.push(enemy);
    }
}
// instantiate player object
var player = new Player(PlayerStartX,PlayerStartY);
// instantiate heart object
var heart = new Heart(randomizeItemStartPos().x, randomizeItemStartPos().y, "images/Heart.png");

//instantiate gem object
var gems = [];
var numGems = 4;
var gemSprites = ['images/Gem Blue.png','images/Gem Green.png','images/Gem Orange.png'];
for(var i = 0; i < Math.floor(Math.random()* numGems); i++){
    var gem = new Gem(this.randomizeItemStartPos().x, this.randomizeItemStartPos().y, gemSprites[Math.floor(Math.random() * gemSprites.length)] );
    gems.push(gem);
}
// This listens for key presses and sends the keys to your
// Player.handleInput() method.
var pressed = function(e){
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
};
document.addEventListener('keyup', pressed);
