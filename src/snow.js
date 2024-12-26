class Snowflake {
    constructor(canvas, initialScatter = false, isInBall = false) {
        this.canvas = canvas;
        this.reset(initialScatter, isInBall);
    }

    reset(initialScatter = false, isInBall = false) {
        this.x = Math.random() * this.canvas.width;
        this.y = initialScatter ? Math.random() * this.canvas.height : 0;
        if(isInBall) {
            this.size = Math.random() * 1.5 + 1.5;
            this.speed = Math.random() * 1 + 0.5;
        } else {
            this.size = Math.random() * 3 + 2;
            this.speed = Math.random() * 1 + 0.25;
        }
        this.wind = Math.random() * 0.5 - 0.25;
        this.isInBall = isInBall;
    }

    update() {
        this.y += this.speed;
        this.x += this.wind;

        if (this.y > this.canvas.height) {
            this.reset();
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
    }
}

export function initSnow() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    // opacity 0.5
    canvas.style.opacity = '0.5';
    canvas.style.zIndex = '-1';
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    const snowflakes = [];
    const numberOfSnowflakes = 100;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Create snowflakes with initial scatter
    for (let i = 0; i < numberOfSnowflakes; i++) {
        snowflakes.push(new Snowflake(canvas, true));
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        snowflakes.forEach(snowflake => {
            snowflake.update();
            snowflake.draw(ctx);
        });

        requestAnimationFrame(animate);
    }

    animate();
}

export function initSnowInBall() {
    const snowBall = document.querySelector('.snow-ball');
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    snowBall.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const snowflakes = [];
    const numberOfSnowflakes = 50;

    function resizeCanvas() {
        const rect = snowBall.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Modified Snowflake reset to keep within circular bounds
    function isInBall(x, y) {
        // only if y is outside the ball
        return y < canvas.height;
    }

    // Create snowflakes with initial scatter
    for (let i = 0; i < numberOfSnowflakes; i++) {
        const snowflake = new Snowflake(canvas, true, true);
        // Override update method for this snowflake
        snowflake.update = function() {
            this.y += this.speed;
            this.x += this.wind;

            if (!isInBall(this.x, this.y)) {
                // Reset to random position at top of ball
                const angle = Math.random() * Math.PI;
                const radius = Math.min(canvas.width, canvas.height) / 2;
                this.x = canvas.width/2 + Math.cos(angle) * radius * Math.random();
                this.y = 0;
            }
        };
        snowflakes.push(snowflake);
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Create circular clip
        ctx.save();
        ctx.beginPath();
        ctx.arc(canvas.width/2, canvas.height/2, Math.min(canvas.width/2, canvas.height/2), 0, Math.PI * 2);
        ctx.clip();
        
        snowflakes.forEach(snowflake => {
            snowflake.update();
            snowflake.draw(ctx);
        });
        
        ctx.restore();
        requestAnimationFrame(animate);
    }

    animate();
}