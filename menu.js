var menu = {

    preload : function() {
        // Loading images is required so that later on we can create sprites based on the them.
        // The first argument is how our image will be refered to, 
        // the second one is the path to our file.
        game.load.image('menu', './assets/menu.png');
    },

    create: function () {
        // Add a sprite to your game, here the sprite will be the game's logo
        // Parameters are : X , Y , image name (see above) 
        this.add.button(0, 0, 'menu',this.startGame,this);

    },
    startGame : function(){
        this.state.start('main');
    }

};