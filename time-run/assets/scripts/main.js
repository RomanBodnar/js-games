class Game {
    constructor(canvas, context) {
        this.canvas = canvas;
        this.context = context;
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        this.baseHeight = 720;
        this.baseWidth = 2400;

        this.ratio = this.height / this.baseHeight;

        this.player = new Player(this);
        this.sound = new AudioControl();
        this.background = new Background(this);
        this.obstacles = [];
        this.numberOfObstacles = 15;

        this.gravity = 0.5;
        this.speed;
        this.minSpeed;
        this.maxSpeed;
        this.score;
        this.gameOver;
        this.timer;
        this.bottomMargin;

        this.message1;
        this.message2;
        this.smallFont;
        this.largeFont;

        this.eventTimer = 0;
        this.eventInterval = 150;
        this.eventUpdate = false;

        this.touchStartX;
        this.swipeDistance = 30;

        this.debug = false;

        this.resize(window.innerWidth, window.innerHeight);

        window.addEventListener('resize', (e) => {
            this.resize(e.currentTarget.innerWidth, e.currentTarget.innerHeight);
        });

        // mouse controls
        this.canvas.addEventListener('mousedown', e => {
            this.player.flap();
        });
        this.canvas.addEventListener('mouseup', e => {
            setTimeout(() => {
                this.player.wingsUp();
            }, 70);
        });

        // keyboard controls
        window.addEventListener('keydown', e => {
            if (e.key === ' ' || e.key === 'Enter') {
                this.player.flap();
            }
            if (e.key === 'Shift' || e.key.toLowerCase() === 'c') {
                this.player.startCharge();
            }
        });
        window.addEventListener('keyup', e => {
            this.player.wingsUp();
        });

        // touch controls
        this.canvas.addEventListener('touchstart', e => {

            this.touchStartX = e.changedTouches[0].pageX;
        });
        this.canvas.addEventListener('touchmove', e => {
            e.preventDefault();
        });
        this.canvas.addEventListener('touchend', e => {
            if (e.changedTouches[0].pageX - this.touchStartX > this.swipeDistance) {
                this.player.startCharge();
            } else {
                this.player.flap();
            }
        });
    }

    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;

        this.context.fillStyle = 'gold';
        this.context.textAlign = 'right';
        this.context.lineWidth = 3;
        this.context.strokeStyle = 'white';

        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.ratio = this.height / this.baseHeight;
        this.gravity = 0.15 * this.ratio; // gravity is scaled with the height of the canvas
        this.speed = 3 * this.ratio;
        this.minSpeed = this.speed;
        this.maxSpeed = this.speed * 5;
        this.bottomMargin = Math.floor(50 * this.ratio); // margin at the bottom of the canvas
        this.smallFont = Math.ceil(20 * this.ratio);
        this.largeFont = Math.ceil(45 * this.ratio);
        this.context.font = this.smallFont + 'px Bungee';

        this.background.resize();
        this.player.resize();
        this.createObstacles();
        this.obstacles.forEach(obstacle => {
            obstacle.resize();
        });
        this.score = 0;
        this.gameOver = false;
        this.timer = 0;
    }

    render(deltaTime) {
        if (!this.gameOver) this.timer += deltaTime;

        this.handlePeriodicEvents(deltaTime);

        this.background.draw();
        this.background.update();
        this.drawStatusText();
        this.player.draw();
        this.player.update();
        this.obstacles.forEach(obstacle => {
            obstacle.update();
            obstacle.draw();
        });
    }

    createObstacles() {
        this.obstacles = [];
        const firstX = this.baseHeight * this.ratio;
        const obstacleSpacing = 600 * this.ratio;;
        for (let i = 0; i < this.numberOfObstacles; i++) {
            const x = firstX + (i * obstacleSpacing);
            this.obstacles.push(new Obstacle(this, x));
        }
    }

    checkCollision(a, b) {
        const dx = a.collisionX - b.collisionX;
        const dy = a.collisionY - b.collisionY;
        const distance = Math.hypot(dx, dy);
        const sumOfRadii = a.collisionRadius + b.collisionRadius;
        return distance <= sumOfRadii;
    }

    formatTimer() {
        return (this.timer * 0.001).toFixed(1);
    }

    handlePeriodicEvents(deltaTime) {
        if (this.eventTimer < this.eventInterval) {
            this.eventTimer += deltaTime;
            this.eventUpdate = false;
        } else {
            this.eventTimer = this.eventTimer % this.eventInterval; // count for extra time
            this.eventUpdate = true;
        }

    }

    triggerGaveOver() {
        if (this.gameOver) {
            return;
        }

        this.gameOver = true;
        if (this.obstacles.length <= 0) {
            this.sound.play(this.sound.win);
            this.message1 = 'Nailed it!';
            this.message2 = 'Can you do it faster than ' + this.formatTimer() + ' seconds?';
        } else {
            this.sound.play(this.sound.lose);
            this.message1 = 'Getting rusty?';
            this.message2 = 'Collision time: ' + this.formatTimer() + ' seconds';
        }
    }

    drawStatusText() {
        this.context.save();
        this.context.fillText('Score: ' + this.score, this.width - this.smallFont, this.largeFont);
        this.context.textAlign = 'left';
        this.context.fillText('Timer: ' + this.formatTimer(), this.smallFont, this.largeFont);

        if (this.gameOver) {
            this.context.textAlign = 'center';
            this.context.font = this.largeFont + 'px Bungee';
            this.context.fillText(this.message1, this.width * 0.5, this.height * 0.5 - this.largeFont, this.width);
            this.context.font = this.smallFont + 'px Bungee';
            this.context.fillText(this.message2, this.width * 0.5, this.height * 0.5 - this.smallFont, this.width);
            this.context.fillText("Press 'R' to try again!", this.width * 0.5, this.height * 0.5, this.width);
        }

        if (this.player.energy <= this.player.minEnergy) {
            this.context.fillStyle = 'red';
        } else if (this.player.energy >= this.player.maxEnergy) {
            this.context.fillStyle = 'orange';
        }
        for (let i = 0; i < this.player.energy; i++) {
            this.context.fillRect(20, this.height - 30 - i * this.player.barSize, this.player.barSize * 5, this.player.barSize);
        }

        this.context.restore();
    }
}

window.addEventListener('load', () => {
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 720;
    canvas.height = 720;

    const game = new Game(canvas, ctx);

    let lastTime = 0;
    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        //ctx.clearRect(0, 0, canvas.width, canvas.height); // remove previous frame
        game.render(deltaTime);
        // if(!game.gameOver) {
        //     requestAnimationFrame(animate);
        // }
        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
});