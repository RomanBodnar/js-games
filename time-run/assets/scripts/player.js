class Player {
    constructor(game) {
        this.game = game;
        this.x = 20;
        this.y;
        this.spriteWidth = 200;
        this.spriteHeight = 200;
        this.width;
        this.height;

        this.speedY;
        this.flapSpeed;

        this.collisionX;
        this.collisionY = this.y;
        this.collisionRadius;
        this.collided = false;

        this.energy = 30;
        this.maxEnergy = this.energy * 2;
        this.minEnergy = 15;
        this.charging = false;
        this.barSize;

        this.image = document.getElementById('player_fish');
        this.frameY = 0; // used for sprite animation
    }

    draw() {
        this.game.context.drawImage(this.image, 0, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
        
        if(this.game.debug) {
            this.game.context.beginPath();
            this.game.context.arc(this.collisionX /*+ this.collisionRadius * 0.9*/, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
            this.game.context.stroke();
        }
    }

    update() {
        this.handleEnergy();
        if (this.speedY >= 0) { this.wingsUp(); }

        this.y += this.speedY; // Move the player down
        this.collisionY = this.y + this.height * 0.5; // center the collision area
        if (!this.isTouchingBottom() && !this.charging) {
            this.speedY += this.game.gravity; // Apply gravity -- gravity is acceleration
        } else {
            this.speedY = 0; // Stop falling if touching the bottom

        }

        // bottom boundary
        if (this.isTouchingBottom()) {
            this.y = this.game.height - this.height - this.game.bottomMargin; // stop at the bottom
            this.speedY = 0; // Stop falling
            this.wingsIdle();
        }

    }

    resize() {
        this.width = this.spriteWidth * this.game.ratio;
        this.height = this.spriteHeight * this.game.ratio;
        this.y = this.game.height * 0.5 - this.height * 0.5; // center the player vertically

        this.speedY = -8 * this.game.ratio; // initial speed. with negative value, the player will move up, there will be a little jump
        this.flapSpeed = 5 * this.game.ratio; // speed when flapping

        this.collisionRadius = 50 * this.game.ratio; // give the player a circular collision area
        this.collisionX = this.x + this.width * 0.5  + this.collisionRadius * 0.9; // center the collision area
        this.collided = false; // reset the collision state
        this.barSize = Math.ceil(this.game.ratio * 5);
        this.frameY = 0; // reset the frame for sprite animation
        this.charging = false; // reset the charging state
    }

    startCharge() {
        if(this.energy >= this.minEnergy && !this.charging) {
            this.charging = true;
            this.game.speed = this.game.maxSpeed;
            this.wingsCharge();
            this.game.sound.play(this.game.sound.charge);
        } else {
            this.stopCharge();
        }
    }

    stopCharge() {
        this.charging = false;
        this.game.speed = this.game.minSpeed;
    }

    wingsIdle() {
        if(!this.charging)
            this.frameY = 0;
    }
    wingsDown() {
        if (!this.charging)
            this.frameY = 1;
    }
    wingsUp() {
        if (!this.charging)
            this.frameY = 2;
    }
    wingsCharge() {
        this.frameY = 3;
    }

    isTouchingTop() {
        return this.y <= 0;
    }

    isTouchingBottom() {
        return this.y >= this.game.height - this.height - this.game.bottomMargin;
    }

    handleEnergy() {
        if (this.game.eventUpdate) {
            if (this.energy < this.maxEnergy) {
                this.energy += 2; // increase energy
            }
            if (this.charging) {
                this.energy -= 6; // decrease energy
                if (this.energy <= 0) {
                    this.energy = 0;
                    this.stopCharge();
                }
            }
        }
    }

    flap() {
        this.stopCharge();
        if (!this.isTouchingTop()) {
            this.speedY = -this.flapSpeed; // Move the player up
            this.game.sound.play(this.game.sound.flapSounds[Math.floor(Math.random() * this.game.sound.flapSounds.length)]);
            this.wingsDown();
        }
    }
}