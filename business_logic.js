var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });

var enemy;
var player;
var cursors;
var guards;
var spaceKey;
var teacher;
var isPlaying = false;
var justStarted = true;
var gameLost = false;
var completedPath = true;
var currentSpeed = 0;

var enemyX = 0;
var enemyY = 0;
function preload() {
    gameOverText = game.add.text(game.world.centerX, game.world.centerY, "Loading HackLabs...", { font: "65px Segoe UI Light", fill: "#151515", align: "center" });
    gameOverText.anchor.setTo(0.5, 0.5);
    game.load.image('background', 'pic/background.jpg');
    game.load.spritesheet('player', 'pic/dude.png', 32, 48);
    game.load.spritesheet('enemy', 'pic/enemy.png', 32, 48);
    game.load.spritesheet('teacher', 'pic/teacher.png', 32, 48);
}

function playerSetup(player, game) {
    player = game.add.sprite(32, 60, 'player');
    player.anchor.set(0.5);

    //  and its physics settings
    game.physics.enable(player, Phaser.Physics.ARCADE);

    //player.body.drag.set(100);
    player.body.maxVelocity.set(200);
    player.body.collideWorldBounds = true;
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);
    return player;
}

function enemySetup(enemy, game) {
    enemy = game.add.sprite(100, 100, 'enemy');
    enemy.anchor.set(0.5);

    game.physics.enable(enemy, Phaser.Physics.ARCADE);

    enemy.body.maxVelocity.set(200);
    enemy.body.collideWorldBounds = true;
    enemy.animations.add('left', [0, 1, 2, 3], 10, true);
    enemy.animations.add('right', [5, 6, 7, 8], 10, true);
    return enemy;
}

function teacherSetup(teacher, game) {
    teacher = game.add.sprite(200, 200, 'teacher');
    teacher.anchor.set(0.5);
    game.physics.enable(teacher, Phaser.Physics.ARCADE);
    teacher.body.maxVelocity.set(200);
    teacher.body.collideWorldBounds = true;
    teacher.animations.add('left', [0, 1, 2, 3], 10, true);
    teacher.animations.add('right', [5, 6, 7, 8], 10, true);
    return teacher;
}

function create() {
    gameOverText.destroy();
    loadMenu();
}

function loadMenu() {
    gameBeginText = game.add.text(game.world.centerX, game.world.centerY, "Press \"Space\" to start", { font: "65px Arial", fill: "#151515", align: "center" });
    gameBeginText.anchor.setTo(0.5, 0.5);
    score = 0;
}

function loadGame(){
    score = 0;
    game.renderer.clearBeforeRender = false;
    game.renderer.roundPixels = true;
    game.add.tileSprite(0, 0, game.width, game.height, 'background');

    player = playerSetup(player, game);
    enemy = enemySetup(enemy, game);
    teacher = teacherSetup(teacher, game);

    cursors = game.input.keyboard.createCursorKeys();
    spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ]);

    scoreText = game.add.text(16, 16, 'Lab done: ' + score.toString(), {  fontSize: '32px', fill: '#000' });
}

function update() {
    if(justStarted){
        startGame();
    }

    if(isPlaying){
        play();
    }

    if (gameLost){
        gameOver(player, teacher, enemy);
    }
}

function startGame() {
    var spaceKeyStart = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    if(spaceKeyStart.downDuration(0.1)){
        gameBeginText.destroy();
        justStarted = false;
        isPlaying = true;
        loadGame();
    }
}

function play() {
    player.animations.stop();
    player.body.velocity.x = 0;
    movePlayer(player, cursors);

    if(spaceKey.isDown && areNearby(player, enemy, 1000)) {
        score += 0.05;
        scoreText.text = 'Lab done: ' + Math.round(score * 100) / 100 ;
    }

    if(Math.pow((player.body.x - teacher.body.x), 2) + Math.pow((player.body.y - teacher.body.y), 2) < 1000){
        score -= 0.15;
        scoreText.text = 'Lab done: ' + Math.round(score * 100) / 100 ;
    }
    
    if (score > 100){
        gameWin(player, teacher, enemy);
    }

    if(score < 0){
        gameLost = true;
    }
    
    screenWrap(player);
    moveEnemy(enemy);
    moveTeacher(teacher, player);    
}

function gameWin(player, teacher, enemy) {
    // body...
}

function movePlayer(player, cursors) {
    if (cursors.up.isDown)
    {
        player.body.y -= 4;
    }
    else 
    if (cursors.down.isDown)
    {
        player.body.y += 4;
    }

    if (cursors.left.isDown)
    {
        player.body.x -= 4;
        player.animations.play('left');
    }
    else
    if (cursors.right.isDown)
    {
        //player.angle = 90;
        player.body.x += 4;
        player.animations.play('right');
    }else{
        player.animations.stop();
        player.frame = 4;
    }
    return player;
}

function gameOver(player, teacher, enemy) {
    if(isPlaying){
        player.kill();
        teacher.kill();
        enemy.kill();
        scoreText.destroy();
        gameOverText = game.add.text(game.world.centerX, game.world.centerY, "You haven't reached IT\nPress \"Space\" to restart", { font: "65px Arial", fill: "#151515", align: "center" });
        gameOverText.anchor.setTo(0.5, 0.5);
    }

    isPlaying = false;
    var spaceKeyRestart = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    if(spaceKeyRestart.downDuration(0.1)){
        gameLost = false;
        isPlaying = true;

        loadGame();
    }
}

function removeText() {
    gameOverText.destroy();
}
 
function moveTeacher(teacher, player) {
    if(player.body.x > teacher.body.x){
        teacher.body.x += 1;
    }
    else
    {
        teacher.body.x -= 1;
    }

    if(player.body.y > teacher.body.y){
        teacher.body.y += 1;
    }else{
        teacher.body.y -= 1;
    }
}

function areNearby(player, enemy, distance){
    return Math.pow((player.body.x - enemy.body.x), 2) + Math.pow((player.body.y - enemy.body.y), 2) < distance;
}

function moveEnemy(enemy){

    if(!completedPath){
        enemy.body.velocity.setTo(enemyX, enemyY);
        if (enemy.body.x == enemyX && enemy.body.y == enemyY){
            completedPath = true;
        }
    }else{
        enemyX = 50 + Math.random() * 700;
        enemyy = 50 + Math.random() * 500;
        completedPath = false;
    }
    
    /*enemy.body.x += 7 - Math.random() * 14;
    enemy.body.y += 7 - Math.random() * 14;*/
}

function screenWrap (player) {

    if (player.x < 0)
    {

        player.x = game.width;
    }
    else if (player.x > game.width)
    {
        player.x = 0;
    }

    if (player.y < 0)
    {
        player.y = game.height;
    }
    else if (player.y > game.height)
    {
        player.y = 0;
    }
}

function render() {
}

game.state('start');
