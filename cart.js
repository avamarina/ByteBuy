let cart = JSON.parse(localStorage.getItem('cart')) || []

function updateCartCount() {
	const cartCounts = document.querySelectorAll('.cart-count')
	const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
	cartCounts.forEach(count => {
		count.textContent = totalItems
	})
}

function addToCart(product) {
	if (!product || !product.id) {
		console.error('Invalid product data:', product)
		return
	}

	const existingItem = cart.find(item => item.id === product.id)

	if (existingItem) {
		existingItem.quantity += 1
	} else {
		cart.push({
			...product,
			quantity: 1,
		})
	}

	localStorage.setItem('cart', JSON.stringify(cart))

	updateCartCount()

	showToast(`${product.title} добавлен в корзину`)
}

function removeFromCart(productId) {
	cart = cart.filter(item => item.id !== productId)
	localStorage.setItem('cart', JSON.stringify(cart))
	updateCartCount()
	renderCart()
}

function updateQuantity(productId, newQuantity) {
	const item = cart.find(item => item.id === productId)
	if (item) {
		item.quantity = Math.max(1, parseInt(newQuantity))
		localStorage.setItem('cart', JSON.stringify(cart))
		updateCartCount()
		renderCart()
	}
}

function showToast(message) {
	const toast = document.createElement('div')
	toast.className = 'toast'
	toast.textContent = message
	document.body.appendChild(toast)

	setTimeout(() => {
		toast.remove()
	}, 3000)
}

function renderCart() {
	const cartItems = document.getElementById('cart-items')
	if (!cartItems) return

	if (cart.length === 0) {
		cartItems.innerHTML = `
            <div class="cart-empty">
                <h3>Корзина пуста</h3>
                <p>Добавьте товары из каталога</p>
                <a href="index.html" class="btn btn-primary">Перейти к товарам</a>
            </div>
        `
		return
	}

	let total = 0
	cartItems.innerHTML =
		cart
			.map(item => {
				const itemTotal = item.price * item.quantity
				total += itemTotal

				return `
            <div class="cart-item">
                <div class="row align-items-center">
                    <div class="col-md-2">
                        <img src="${item.image}" alt="${
					item.title
				}" class="img-fluid">
                    </div>
                    <div class="col-md-4">
                        <h5 class="cart-item-title">${item.title}</h5>
                        <div class="cart-item-price">${item.price.toLocaleString()} ₸</div>
                    </div>
                    <div class="col-md-3">
                        <div class="cart-item-quantity">
                            <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantity(${
															item.id
														}, ${item.quantity - 1})">-</button>
                            <input type="number" value="${item.quantity}" 
                                   onchange="updateQuantity(${
																			item.id
																		}, this.value)" min="1">
                            <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantity(${
															item.id
														}, ${item.quantity + 1})">+</button>
                        </div>
                    </div>
                    <div class="col-md-2">
                        <div class="cart-item-price">${itemTotal.toLocaleString()} ₸</div>
                    </div>
                    <div class="col-md-1">
                        <button class="btn btn-danger btn-sm" onclick="removeFromCart(${
													item.id
												})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `
			})
			.join('') +
		`
        <div class="cart-total">
            <h3>Итого: <span class="cart-total-price">${total.toLocaleString()} ₸</span></h3>
            <button class="btn btn-primary" onclick="checkout()">Оформить заказ</button>
        </div>
    `
}

function checkout() {
	if (cart.length === 0) {
		showToast('Корзина пуста')
		return
	}

	showToast('Заказ успешно оформлен!')
	cart = []
	localStorage.removeItem('cart')
	updateCartCount()
	renderCart()
}

document.addEventListener('DOMContentLoaded', () => {
	updateCartCount()
	renderCart()
})
