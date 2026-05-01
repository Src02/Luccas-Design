class ParticleEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: null, y: null, radius: 220 };
        
        this.config = {
            particleColor: '#00f2ff',
            lineColor: '#00f2ff',
            // Densidade sugerida: 125 desktop / 50 mobile
            particleCount: window.innerWidth < 768 ? 50 : 125,
            connectDistance: 160, 
            particleSpeed: 0.7,
            repulsionForce: 5,
            glowStrength: 10 // Intensidade do brilho nas conexões
        };

        this.init();
    }

    init() {
        this.handleResize();
        this.setupEventListeners();
        this.animate();
    }

    setupEventListeners() {
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        window.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
        window.addEventListener('resize', () => this.handleResize());
    }

    handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.createParticles();
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.config.particleCount; i++) {
            this.particles.push(new Particle(this.canvas, this.config));
        }
    }

    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.config.connectDistance) {
                    const opacity = (1 - distance / this.config.connectDistance);
                    
                    this.ctx.beginPath();
                    // Efeito de brilho nas linhas próximas ao mouse ou mais curtas
                    this.ctx.shadowBlur = distance < 80 ? this.config.glowStrength : 0;
                    this.ctx.shadowColor = this.config.lineColor;
                    
                    this.ctx.strokeStyle = this.config.lineColor;
                    this.ctx.globalAlpha = opacity * 0.4;
                    this.ctx.lineWidth = 0.8;
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
        this.ctx.shadowBlur = 0; // Reseta o brilho para não afetar outros elementos
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            particle.update(this.mouse);
            particle.draw(this.ctx);
        });

        this.drawConnections();
        requestAnimationFrame(() => this.animate());
    }
}

class Particle {
    constructor(canvas, config) {
        this.canvas = canvas;
        this.config = config;
        this.reset();
    }

    reset() {
        this.x = Math.random() * this.canvas.width;
        this.y = Math.random() * this.canvas.height;
        this.vx = (Math.random() - 0.5) * this.config.particleSpeed;
        this.vy = (Math.random() - 0.5) * this.config.particleSpeed;
        this.radius = 1.5;
    }

    update(mouse) {
        this.x += this.vx;
        this.y += this.vy;

        // Repulsão Suave (Quadrática)
        if (mouse.x != null) {
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouse.radius) {
                const ratio = 1 - (distance / mouse.radius);
                const smoothForce = ratio * ratio * this.config.repulsionForce; 
                
                this.x += (dx / distance) * smoothForce;
                this.y += (dy / distance) * smoothForce;
            }
        }

        // Rebote infinito
        if (this.x < 0 || this.x > this.canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > this.canvas.height) this.vy *= -1;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.config.particleColor;
        ctx.globalAlpha = 0.6;
        ctx.fill();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ParticleEngine('bg-canvas');
});