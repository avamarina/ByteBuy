;(function () {
	const canvas = document.getElementById('particle-bg-canvas')
	if (!canvas) return
	const ctx = canvas.getContext('2d')
	let particles = []
	const mouse = { x: null, y: null }
	const particleCount = 420
	function resizeCanvas() {
		canvas.width = window.innerWidth
		canvas.height = window.innerHeight
	}
	resizeCanvas()
	window.addEventListener('resize', resizeCanvas)
	window.addEventListener('mousemove', event => {
		mouse.x = event.x
		mouse.y = event.y
	})
	class Particle {
		constructor() {
			this.x = Math.random() * canvas.width
			this.y = Math.random() * canvas.height
			this.size = Math.random() * 22 + 8
			this.speedX = Math.random() * 2 - 1
			this.speedY = Math.random() * 2 - 1
			this.text = Math.random() > 0.5 ? '1' : '0'
		}
		update() {
			if (mouse.x && mouse.y) {
				let dx = mouse.x - this.x
				let dy = mouse.y - this.y
				let distance = Math.sqrt(dx * dx + dy * dy)
				let force = 100 / distance
				if (distance < 100) {
					this.x -= dx * force * 0.01
					this.y -= dy * force * 0.01
				}
			}
			this.x += this.speedX
			this.y += this.speedY
			if (this.x < 0 || this.x > canvas.width) this.speedX *= -1
			if (this.y < 0 || this.y > canvas.height) this.speedY *= -1
		}
		draw() {
			ctx.font = `${this.size}px monospace`
			ctx.fillStyle = 'rgba(0, 255, 204, 0.7)'
			ctx.fillText(this.text, this.x, this.y)
		}
	}
	particles = []
	for (let i = 0; i < particleCount; i++) {
		particles.push(new Particle())
	}
	function animate() {
		ctx.clearRect(0, 0, canvas.width, canvas.height)
		particles.forEach(particle => {
			particle.update()
			particle.draw()
		})
		requestAnimationFrame(animate)
	}
	animate()
	canvas.style.position = 'fixed'
	canvas.style.top = '0'
	canvas.style.left = '0'
	canvas.style.width = '100vw'
	canvas.style.height = '100vh'
	canvas.style.zIndex = '0'
	canvas.style.pointerEvents = 'none'
	canvas.style.userSelect = 'none'
})()
