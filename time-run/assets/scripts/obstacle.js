class Obstacle {
    constructor(game, x) {
        this.game = game;
        this.spriteWidth = 120;
        this.spriteHeight = 120;
        this.scalwedWidth = this.spriteWidth * this.game.ratio;
        this.scalwedHeight = this.spriteHeight * this.game.ratio;
        this.x = x;
        this.y = Math.random() * (this.game.height - this.scalwedHeight);

        // give an obstacle a circular collision area
        this.collisionX;
        this.collisionY;   
        this.collisionRadius;

        this.speedY = Math.random() < 0.5 ? this.game.ratio * -1.5 : this.game.ratio * 1.5;
        this.markedForDeletion = false;
        this.image = document.getElementById('smallGears');
        this.frameX = Math.floor(Math.random() * 4);
    }
    
    update() {
        this.x -= this.game.speed;
        this.y += this.speedY;

        this.collisionX = this.x + this.scalwedWidth * 0.5;
        this.collisionY = this.y + this.scalwedHeight * 0.5;

        if(!this.game.gameOver) {
            // bounce off the top and bottom of the canvas
            if(this.y <= 0 || this.y >= this.game.height - this.scalwedHeight) {
                this.speedY *= -1;
            }
        } else {
            this.speedY += 0.1;
        }

        if(this.isOffScreen()) {        
            this.markedForDeletion = true;
            this.game.obstacles = this.game.obstacles.filter(obstacle => !obstacle.markedForDeletion);
            
            this.game.score++;
            
            console.log(this.game.obstacles.length);

            if(this.game.obstacles.length <= 0) { 
                this.game.triggerGaveOver();
            }
        }

        if(this.game.checkCollision(this, this.game.player)) {
            this.game.player.collided = true;

            this.game.player.stopCharge();
            this.game.triggerGaveOver();
        }
    }

    draw() {
        this.game.context.drawImage(this.image, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.scalwedWidth, this.scalwedHeight);

        if(this.game.debug) {
            this.game.context.beginPath();
            this.game.context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
            this.game.context.stroke();
        }
    }

    resize() {
        this.scalwedWidth = this.spriteWidth * this.game.ratio;
        this.scalwedHeight = this.spriteHeight * this.game.ratio; 
        this.collisionRadius = this.scalwedWidth * 0.4;
    }

    isOffScreen() {
        return this.x < -this.scalwedWidth || this.y > this.game.height;
    }
}