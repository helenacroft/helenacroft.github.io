var menu = {

    preload : function() {    
        game.load.image('menu', './assets/menu.png');
        game.load.spritesheet('button', './assets/lifes.png');
    },

    create: function () {      
        game.stage.backgroundColor = '#182d3b';
        this.button = game.add.button(game.world.centerX - 27, game.world.centerY, 'button', this.startGame, this, 2, 1, 0);
        this.button.scale.setTo(1.2,1.2);        
         
        this.text = game.add.text(120, 250, 'Click rabbit to start a new game');       
        
        this.text.font = 'Arial Black';
        this.text.fontSize = 30;
        this.text.fontWeight = 'bold';
        this.text.fill = 'white';
        
    },
    startGame : function(){
        this.state.start('main');
    }

};