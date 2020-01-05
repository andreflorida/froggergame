var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

    var date = new Date();
    var time = 0;

    canvas.width = canW;
    canvas.height = canH;
    doc.body.appendChild(canvas);

    var start = true;
    var collideEnemy = false;
    var collideGoal = false;
    var collideHeart = false;
    var collideGem = false;
    var score = 0;
    var lifeCount = 3;
    var levelCount = 1;
    var record = 0;
    var delay = 0;
    var collideBlueGem = false;
    var collideGreenGem = false;
    var collideRedGem = false;
    var gameOver = false;
    var bestScore = 0;
    var bestLevel = 1;

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */

        if(start){
                var now = Date.now(),
                    dt = (now - lastTime) / 1000.0;

            /* Call our update/render functions, pass along the time delta to
             * our update function since it may be used for smooth animation.
             */
                update(dt); //set start to false in collision, already done
                render();

            /* Set our lastTime variable which is used to determine the time delta
             * for the next time this function is called.
             */
                lastTime = now;
            /* Check if game over, then show game over window and wait for
             * player to hit reset. This guarantees that the background animation
             * will still be playing while game over window is showed up.
             */
                if(gameOver){
                    gameOverWindow();
                    document.addEventListener("keydown", function space(event){
                        if(event.keyCode == 32){
                            reset();
                            //unbind the space listener
                            document.removeEventListener("keydown", space);
                        }
                    });

                }

            /* Use the browser's requestAnimationFrame function to call this
             * function again as soon as the browser is able to draw another frame.
             */
                win.requestAnimationFrame(main);

        }
        else{ //frame is stopped

             if(collideHeart || collideGem){
                    delay = 0;   // if player collides with items, then no need to
                                //pause.
                 }
                 else{
                    delay = 200; // if player wins or lose, then need to pause.
                 }
             setTimeout(refresh, delay);
             //start running program by getting next frame
             win.requestAnimationFrame(main);
           }
    }


    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        reset();
        lastTime = Date.now();
        main();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        updateEntities(dt);
        checkCollisions();

    }

    /* This is called by the update function and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        allEnemies.forEach(function(enemy) {
                enemy.update(dt);
        });
        player.update();
    }

    function checkCollisions() {
        //Check if player collides with enemies -lose
        allEnemies.forEach(function(enemy){
            if(player.y == enemy.y && player.x + blockW - 30 > enemy.x && player.x + 30 < enemy.x + blockW){
                collideEnemy = true;
                if(collideEnemy){
                    start = false;
                }
            }
        });
        //if player collides goal, then go to refresh() to update score and
        //player position.
        if(player.y < blockH - TOP_OFFSET){
            collideGoal = true;
            start = false;
        }
        //if player collides heart, go to refresh(),then throw heart out of screen
        if(player.x == heart.x && player.y == heart.y){
            collideHeart = true;
            if(collideHeart){
                start = false;
                // make heart disappear when collides with player
                heart.x = -100;
                heart.y = -100;
            }
        }
        // check player collision with gems
        gems.forEach(function(gem){
            if(player.x + 10 > gem.x && player.x < gem.x +10 && player.y + 10 > gem.y && player.y < gem.y + 10){
                collideGem = true;
                if(collideGem){
                    start = false;
                    gem.x = -100;
                    gem.y = -100;
                    if(gemSprites.indexOf(gem.sprite) === 0){
                        collideBlueGem = true;
                    }
                    else if(gemSprites.indexOf(gem.sprite) == 1){
                        collideGreenGem = true;
                    }
                    else if(gemSprites.indexOf(gem.sprite) == 2){
                        collideRedGem = true;
                    }
                }
            }
        });
    }
    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
                'images/water-block.png',   // Top row is water
                'images/stone-block.png',   // Row 1 of 3 of stone
                'images/stone-block.png',   // Row 2 of 3 of stone
                'images/stone-block.png',   // Row 3 of 3 of stone
                'images/grass-block.png',   // Row 1 of 2 of grass
                'images/grass-block.png'    // Row 2 of 2 of grass
            ],
            numRows = NUM_ROW,
            numCols = NUM_COL,
            row, col;

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }
        //draw text on the image created
        ctx.font = "20px Comic Sans MS";
        ctx.fillStyle = "#ffff66";
        ctx.textAlign = "start";
        ctx.fillText("Score:  " + score, 10, 80);
        //draw time count down
        //ctx.fillStyle = "yellow";
        ctx.fillText("Life:  x " + lifeCount, 10, 570);
        //draw level count up
        ctx.fillText("Level:  " + levelCount, 412, 80);
        renderEntities();
    }

    /* This function is called by the render function and is called on each game
     * tick. Its purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */


    function renderEntities() {

        heart.render();
        gems.forEach(function(gem){
            gem.render();
        });
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });
        //render player over other items to place it at the top layer
        player.render();
    }

    /* This function renders the game over window while player uses up its life.
     */
    function gameOverWindow() {
        //generating gameover window
                ctx.fillStyle = "black";
                ctx.textAlign = "center";
                ctx.fillStyle = "rgba(255,255,255,0.9)";
                ctx.fillRect(127,180,250,230);
                ctx.fillStyle = "black";
                ctx.textAlign = "center";
                ctx.fillStyle = "red";
                ctx.font = "60px Comic Sans MS";
                ctx.fillText('GAME  OVER', 250, 210); // Record
                ctx.font = "22px Arial";
                ctx.textAlign = "center";
                ctx.fillStyle = "black";

                ctx.fillText('Best level: ' + bestLevel, 250, 320); // Best level
                ctx.fillText('Best score: ' + bestScore, 250, 280); // Best score
                ctx.font = "15px Arial";
                ctx.fillText('Press space to start again', 250, 400);

    }
    /* This function handles the updating of socre, life, level, and position when
     * collisions happen. It also keep track of the best score for game record
     * setting purpose.
     */
    function refresh() {
        //if player wins or loses, refresh position of player

        //if player wins, increases level and score. (can have requirement of passing each level)
        if(collideGoal){
            //update score when player wins
            player.x = PlayerStartX;
            player.y = PlayerStartY;
            score += 1000;
            levelCount ++;
            //speed up enemies by a certain amount
            for(var i = 0; i < allEnemies.length; i++){
                 allEnemies[i].speed += 20;
            }
            //TODO: for each new level, generate items randomly again
            gems.forEach(function(gem){
                gem.x = this.randomizeItemStartPos().x;
                gem.y = this.randomizeItemStartPos().y;
                gem.sprite = gemSprites[Math.floor(Math.random() * gemSprites.length)];

            });

            heart.x = randomizeItemStartPos().x;
            heart.y = randomizeItemStartPos().y;
        }
        //when player collects heart, increase life by one
        else if(collideHeart){
            lifeCount++;
            score += 10;

        }
        //when collides gem, increase score corresponding to each gem's value
        else if(collideGem){
            if(collideBlueGem){
                score += 100;
            }
            else if(collideGreenGem){
                score += 200;
            }
            else if(collideRedGem){
                score += 500;
            }
        }
        //when collides enemy, reset player's position, decrease life by 1
        //if life is used up, then go to game over screen in reset function
        else if(collideEnemy){
            player.x = PlayerStartX;
            player.y = PlayerStartY;
            if(lifeCount > 0){
                lifeCount--;
            }else{
             //this is a condition which tells the program to generate game over window
                gameOver = true;
                //update record
                if(bestScore < score){
                    bestScore = score;
                }
                if(bestLevel < levelCount){
                    bestLevel = levelCount;
                }
                //unbind controller
                document.removeEventListener('keyup', pressed);
            }
        }

        start = true;
        collideGoal = false;
        collideEnemy = false;
        collideHeart = false;
        collideGem = false;

    }
    /* This function resets all the global variables except for game record variables,
     * enemies' speed, and unbind the movement controller with its listener.
     * Basically this resets the game upon user's calling when game is over.
     */
    function reset() {
        //reset all global variables
            collideEnemy = false;
            collideGoal = false;
            collideHeart = false;
            collideGem = false;
            score = 0;
            lifeCount = 3;
            levelCount = 1;
            record = 0;
            delay = 0;
            collideBlueGem = false;
            collideGreenGem = false;
            collideRedGem = false;

            //reset enemy speed to level 1
            allEnemies.forEach(function(enemy){
                enemy.speed = Math.random()*speedMultiplier + 5;
            });
            //add back controller
            document.addEventListener('keyup', pressed);
            gameOver = false;


   }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-boy.png',
        'images/Heart.png',
        'images/Gem Blue.png',
        'images/Gem Green.png',
        'images/Gem Orange.png'

    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developers can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
})(this);
