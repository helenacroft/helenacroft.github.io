var mainState = {

    preload: function() {
        game.load.image('background', 'assets/background_1.png');     
        game.load.spritesheet('player', 'assets/player_spritesheet.png', 150, 207, 6);
        game.load.image('ground', 'assets/grass.png');
        game.load.spritesheet('enemy1', 'assets/enemy_spritesheet.png', 120, 159, 4);
        game.load.image('platform', 'assets/grass.png');
        game.load.spritesheet('coin', 'assets/coin_spritesheet.png',84, 84, 6);
        game.load.image('wall', 'assets/grass.png');    
        game.load.image('carrot', 'assets/carrot.png');
        game.load.image('bullet', 'assets/bullet.png');
        game.load.image('grass', 'assets/grass_brown.png');
        game.load.image('mushroom', 'assets/mushroom.png');
        game.load.image('coins', 'assets/coin_gold.png');
        game.load.image('lifes', 'assets/lifes.png');
        game.load.image('carrots', 'assets/carrots.png');
        game.load.image('extraLife', 'assets/carrot_gold.png');
        game.load.image('key', 'assets/key_blue.png');
        game.load.image('door_closedTop', 'assets/door_closedTop.png');
        game.load.image('door_closedMid', 'assets/door_closedMid.png');
        game.load.image('door_openTop', 'assets/door_openTop.png');
        game.load.image('door_openMid', 'assets/door_openMid.png');
    },
    create: function() {
        game.physics.setBoundsToWorld();
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.stage.backgroundColor = '#FFFFFF';
        this.background = game.add.sprite(0,0, 'background');
        this.background.scale.setTo(0.4,0.3);
        game.world.enableBody = true;

        this.coinIcon = this.game.make.image(0, 0, 'coins');

        scoreString = 'Score : ';
        scoreText = game.add.text(10, 10, scoreString + score, { font: '20px Arial'});

        levelString = 'Level: ';
        levelText = game.add.text(200, 10, levelString + stage, { font: '20px Arial'});

        shootsString = 'Shoots: ';
        shootsText = game.add.text(400, 10, shootsString + shoots, { font: '20px Arial'});

        this.lifes = game.add.group();
        game.add.text(game.world.width - 70, 10, 'Lives : ', { font: '20px Arial'});
        for (var i = 0; i < lifes; i++) {
            var life = this.lifes.create(game.world.width - 20- (30 * i), 50, 'lifes');
            life.scale.setTo(0.4,0.4);
            life.anchor.setTo(0.5, 0.5);
            //life.angle = 90;
            life.alpha = 0.6;
        }

        var level = generateLevel();
        var doorParts =  createDoor(level);
        this.closedDoor = game.add.group();
        this.openDoor = game.add.group();
        this.key = createKey();

        for(var i = 0;i < doorParts.length;i++) {
            game.physics.enable(doorParts[i]);
            doorParts[i].body.allowGravity = false;
            doorParts[i].body.immovable = true;
            if(i%2) {
                this.openDoor.add(doorParts[i]);
                this.openDoor.visible = false;
            } else {
                this.closedDoor.add(doorParts[i]);
                this.closedDoor.visible = false;
            }

        }

        this.player = game.add.sprite(40 ,game.world.height - 80, 'player');
        this.player.animations.add('stand', [2]);
        this.player.animations.add('walk', [4, 5], 8, true); // 8fps looped
        this.player.animations.add('jump', [1]);
        this.player.animations.add('fall', [0]);
        this.player.animations.play('stand');
        this.player.scale.setTo(0.15,0.15);
        this.player.anchor.set(0.5, 0);
        this.player.body.collideWorldBounds = true;
        this.player.checkWorldBounds = true;
        this.player.body.gravity.y = 500;


        this.cursor = game.input.keyboard.createCursorKeys();
        this.fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        this.ground = game.add.group();
        this.platforms = game.add.group();
        this.coins = game.add.group();
        this.walls = game.add.group();
        this.enemies = game.add.group();
        this.carrots = game.add.group();
        this.bullets = game.add.group();

        this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
        this.bullets.enableBody = true;
        this.bullets.createMultiple(10, 'bullet');
        this.bullets.setAll('anchor.x', 0.5);
        this.bullets.setAll('anchor.y', 0.5);
        this.bullets.setAll('outOfBoundsKill', true);
        this.bullets.setAll('checkWorldBounds', true);

        for(var i = 0; i< level.length ;i++ ) {
            for(var j = 0; j < level[i].length; j++) {
                if(level[i][j] == 'g') {
                    this.ground.add(createGroundBlock(i,j));
                } else if(level[i][j] == 'p') {
                    this.platforms.add(createPlatform(i,j));
                } else if(level[i][j] == 'e' || level[i][j] == 'b'){
                    this.walls.add(createWall(i,j));
                } else if(level[i][j] == "!") {
                    this.enemies.add(createEnemy(i,j));
                } else if(level[i][j] == "c") {

                    if(Math.floor(Math.random()*2)){
                        this.coins.add(createCoin(i,j));
                    }

                }
            }
        }

    },

    update: function() {
        game.physics.arcade.collide(this.player, this.ground);
        game.physics.arcade.collide(this.player, this.platforms);
        game.physics.arcade.collide(this.player, this.enemies, this.enemyCoollision, null, this);
        game.physics.arcade.collide(this.player, this.coins, this.collectCoin);
        game.physics.arcade.collide(this.enemies, this.ground);
        game.physics.arcade.collide(this.enemies, this.platforms);      
        game.physics.arcade.collide(this.enemies, this.walls);
        game.physics.arcade.collide(this.player, this.key, this.keyCollision, null, this);
        
        
         if (this.player.body.velocity.x < 0) {
            this.player.scale.x = -0.15;
        }
        else if (this.player.body.velocity.x > 0) {
            this.player.scale.x = 0.15;
        }
        
        this.enemies.forEach(function(item){
            if (item.body.velocity.x < 0) {
            item.scale.x = -0.2;
        }
        else if (item.body.velocity.x > 0) {
            item.scale.x = 0.2;
        }
            
        });
         
    
        
        if (this.player.body.velocity.y < 0) {
            this.player.animations.play('jump');        
        } else if (this.player.body.velocity.y >= 0 && !this.player.body.touching.down) {
            this.player.animations.play('fall');
        } else if (this.player.body.velocity.x !== 0 && this.player.body.touching.down) {
            this.player.animations.play( 'walk');
        } else {
            this.player.animations.play('stand');
        }
        
        if(playerHasKey) game.physics.arcade.collide(this.player, this.closedDoor, this.doorCollision, null, this);
        game.physics.arcade.overlap(this.bullets, this.enemies, this.collisionHandler, null, this);
        if (this.cursor.left.isDown) {
            this.player.body.velocity.x = -250;
        } else if (this.cursor.right.isDown) {
            this.player.body.velocity.x = 250;
        } else {
            this.player.body.velocity.x = 0;
        }
        if (this.cursor.up.isDown && this.player.body.touching.down) {
            this.player.body.velocity.y = -400;
        }
        if(this.fireButton.isDown) {
            this.fire();
        }

    },

    doorCollision: function(player, door) {
        if(!playerHasKey) return;
        console.log(door);
        door.kill();
        this.openDoor.visible = true;       
        player.body.velocity.x = 0;
        player.body.enable = false;
        setTimeout(function() { 
            player.kill();
            stage++;
            this.restartGame();           
        },500);
    },
    keyCollision: function(player,key) {
        key.kill();
        this.closedDoor.visible = true;
        playerHasKey = true;
    },
    collisionHandler: function(bullet, enemy) {
        bullet.kill();
        enemy.kill();
    },
    fire: function() {
        if (game.time.now > bulletTime && shoots >=2) {
            for(var i = 0; i < 2; i++) {
                var bullet = this.bullets.getFirstExists(false);
                console.log(this.bullets.length);
                bullet.scale.setTo(0.2,0.2);
                if(bullet) {
                    bullet.reset(this.player.x, this.player.y + 15);
                    bullet.body.velocity.x = i > 0 ? -400 : 400 ;
                    bulletTime = game.time.now + 200;
                }

            }
            shoots-=2;
            shootsText.text = shootsString + shoots;
        }
    },
    reset: function() {
        bullet.kill();
    },
    collectCoin: function(player, coin) {
        coin.kill();
        score += 1;
        scoreText.text = scoreString + score;
        if(score > 10 && shoots <= 8) {          
            shoots+=2;
            shootsText.text = shootsString + shoots;
            score-=10;            
        } 
        scoreText.text = scoreString + score;
    },
    enemyCoollision: function(player, enemy) {
        if(player.body.velocity.y > 0) {
            enemy.kill();
        }
        else {
            console.log(this.lifes);
            life = this.lifes.getFirstAlive();
            if (life) {
                life.kill();
            }
            restartGame();
        }

    }

};

// Initialize the game and start our state
var game = new Phaser.Game(800, 640);
game.state.add('menu', menu);
game.state.add('main', mainState);
game.state.start('menu');

var score = 0;
var stage = 1;
var enemyCount = 1;
var bulletTime = 0;
var shoots = 10;
var lifes = 3;
var maxLifes = Math.ceil(stage/10);
var playerHasKey = false;

function restartGame() {
    if(lifes == 0) {
        score = 0;
        stage = 1;
        enemyCount = 1;
        bulletTime = 0;
        shoots = 10;
        lifes = 3;
        playerHasKey = false;
    } else {
        lifes--;
        playerHasKey = false;
    }
    game.state.restart();

}

function createDoor(level){
    var line = Math.ceil(Math.random()*3) * 3 + 1;
    var row = Math.ceil(Math.random()*19);
    if(level[line-1][row]!='p') line = 1;
    var top1 = game.add.sprite(0 + row * 40, game.world.height - line*40 - 80, 'door_closedTop');
    var middle1 = game.add.sprite(0 + row * 40, game.world.height - line*40 -40, 'door_closedMid')
    top1.scale.setTo(0.5,0.5);
    top1.anchor.set(0, -0.4);
    middle1.scale.setTo(0.5,0.6);
    var top2 = game.add.sprite(0 + row * 40, game.world.height - line*40 - 80, 'door_openTop');
    var middle2 = game.add.sprite(0 + row * 40, game.world.height - line*40 -40, 'door_openMid')
    top2.scale.setTo(0.5,0.5);
    top2.anchor.set(0, -0.4);
    middle2.scale.setTo(0.5,0.6);
    return [top1, top2,middle1, middle2];

}


function createKey() {


    var i = Math.floor(Math.random()*13)+1;
    var j = Math.floor(Math.random()*18)+1;
    if(i%3==0){
        if(i+1 < 19) {
            i++;
        }else {
            j--;
        }

    }

    var key = game.add.sprite(0 + j * 40, game.world.height - i*40 - 40, 'key');
    key.scale.setTo(0.4,0.4);
    key.y -= 3;
    this.game.add.tween(key)
        .to({y: key.y + 6}, 800, Phaser.Easing.Sinusoidal.InOut)
        .yoyo(true)
        .loop()
        .start();
    return key;
}
function generateLevel() {
    var level = new Array(14);
    var emptySpace = new Array(20);
    emptySpace.fill('');

    emptySpace.push('/n');
    level.fill(emptySpace);
    var ground = new Array(20);
    ground.fill('g');
    level = [ground].concat(level);
    generatePlatforms(level);
    generateCoins(level);
    return level;
}
function generateCoins(level) {

    for(var i = 0; i < level.length; i++) {
        console.log(level[i]+ "!!!!!" + i);
        for(var j = 0; j < level[i].length; j++) {
            if(level[i][j] == '') {
                if(Math.floor(Math.random()*(16/Math.ceil(stage/10))) == 4)
                    level[i][j] = 'c';
            }
        }

    }
    for(var i = 0; i < level.length; i++) {
        console.log(level[i]);
    }
}

function generatePlatforms(level) {
    var platforms = {};

    var platromsRows = [ [], [], [], [] ];
    for(var i = 0; i < 4 ; i++ ) {
        platforms[i] = [];
        for(var j = 0; j < 20; ) {
            var platform = Math.round(Math.random()*3)+2;
            var data = {};
            data.begin = j;
            var space = Math.round(Math.random()*3)+1;
            while(platform && j<20) {
                platromsRows[i][j++]='p';
                platform--;
            }
            data.end = j-1;
            platforms[i].push(data);
            while(space && j<20) {
                platromsRows[i][j++]='';
                space--;
            }

        }

        platromsRows[i].push('/n');
        level[3 + i*3] = platromsRows[i];
    }
    var underPlatformRows =  [ [], [], [], [] ];
    for(var i = 0; i < 4; i++) {
        for(var j = 1; j < 20; j++) {
            if(platromsRows[i][j-1] != platromsRows[i][j]) {
                if( platromsRows[i][j-1] == 'p') {
                    underPlatformRows[i][j] = 'e';
                    underPlatformRows[i][j-1] = '';
                    j++;
                } else {
                    underPlatformRows[i][j-1] = 'b';
                    underPlatformRows[i][j] = '';
                }
            } else {
                underPlatformRows[i][j]='';
                underPlatformRows[i][j-1] = '';
            }

        }
        generateEnemies(underPlatformRows[i],platforms[i]);
        underPlatformRows[i].push('/n');
        level[4+ i*3] = underPlatformRows[i];
    }
}

function generateEnemies(arr, platform) {
    for(var i = 0; i < platform.length; i++) {
        var willBeGenerated = true;
        for(var j = 0; j < 4 - Math.ceil(stage/10);j++){
            willBeGenerated = willBeGenerated && Math.floor(Math.random()*2) ;
        }
        if(willBeGenerated ){
            var begin = platform[i].begin;
            var end = platform[i].end;
            var pos = Math.round(Math.random()*(end- begin))+begin;
            arr[pos] = '!';
        }
    }
}

function createGroundBlock(i,j) {
    var block = game.add.sprite(0 + j* 40, game.world.height - i*40 - 40, 'ground');
    block.scale.setTo(0.6,0.6);
    block.body.immovable = true;
    return block;
}
function createPlatform(i,j) {
    var platform = game.add.sprite(0 + j * 40, game.world.height - i*40 - 40, 'platform');
    platform.scale.setTo(0.6,0.6);
    platform.body.immovable = true;
    return platform;
}
function createWall(i,j) {
    var wall = game.add.sprite(0 + j * 40, game.world.height - i*40 - 40, 'wall');
    wall.scale.setTo(0.6,0.6);
    wall.visible = false;
    wall.body.immovable = true;
    return wall;
}
function createEnemy(i,j) {
    var enemy = game.add.sprite(0 + j * 40, game.world.height - i*40 - 40, 'enemy1');
    enemy.animations.add('walk', [2,3], 6, true);  
    enemy.animations.play('walk');   
    enemy.anchor.set(0, -0.2);
    enemy.scale.setTo(0.2,0.2);
    enemy.body.velocity.x = 30;
    enemy.body.collideWorldBounds = true;
    enemy.checkWorldBounds = true;
    enemy.body.bounce.set(1);
    return enemy;
}
function createCoin(i,j) {
    var coin = game.add.sprite(0 + j * 40, game.world.height - i*40 - 40, 'coin');
    coin.animations.add('rotate', [0, 1, 2, 3 ,4, 5 ,0], 6);  
    coin.animations.play('rotate', 6, true);
    coin.anchor.set(-0.6, -1);
    coin.scale.setTo(0.2,0.2);
    return coin;
}





