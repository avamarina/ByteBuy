let cartCount = 0

function updateCartCount(count) {
	cartCount = count
	const cartCountElem = document.getElementById('cart-count')
	if (cartCountElem) {
		cartCountElem.textContent = cartCount
	}
}

function addToCart() {
	updateCartCount(cartCount + 1)
}

const searchForm = document.querySelector('form[role="search"]')
if (searchForm) {
	searchForm.addEventListener('submit', function (e) {
		e.preventDefault()
	})
}

document.addEventListener('DOMContentLoaded', function () {
	function setActiveNav() {
		const navLinks = document.querySelectorAll('.navbar-nav .nav-link')
		const path = window.location.pathname.split('/').pop()
		navLinks.forEach(link => {
			const href = link.getAttribute('href')
			if (
				(path === '' && href.startsWith('index.html')) ||
				(path === 'index.html' && href.startsWith('index.html')) ||
				(path === 'catalog.html' && href.startsWith('catalog.html')) ||
				(path === 'cart.html' && href.startsWith('cart.html')) ||
				(path === 'contact.html' && href.startsWith('contact.html'))
			) {
				link.classList.add('active')
				link.setAttribute('aria-current', 'page')
			} else {
				link.classList.remove('active')
				link.removeAttribute('aria-current')
			}
		})
	}
	setActiveNav()
	window.addEventListener('hashchange', setActiveNav)
	window.addEventListener('popstate', setActiveNav)

	const sidebar = document.getElementById('sidebarFilter')
	const sidebarToggle = document.getElementById('sidebarToggle')
	const sidebarClose = document.getElementById('sidebarClose')
	if (sidebar && sidebarToggle) {
		sidebarToggle.addEventListener('click', () => {
			toggleFilter(true)
		})
		if (sidebarClose) {
			sidebarClose.addEventListener('click', () => {
				toggleFilter(false)
			})
		}

		document.addEventListener('mousedown', function (e) {
			if (
				sidebar.classList.contains('active') &&
				!e.target.closest('#sidebarFilter') &&
				!e.target.closest('#sidebarToggle') &&
				!e.target.closest('#sidebarClose')
			) {
				toggleFilter(false)
			}
		})
	}

	function setupShowMoreFilter() {
		const groups = document.querySelectorAll('.filter-group')
		groups.forEach(group => {
			const checks = group.querySelectorAll('.form-check')
			const showMore = group.querySelector('.show-more-link')
			if (checks.length <= 5 || !showMore) {
				showMore && (showMore.style.display = 'none')
				return
			}
			checks.forEach((el, i) => {
				if (i > 4) {
					el.style.display = 'none'
				} else {
					el.style.display = ''
				}
			})
			group.classList.remove('expanded')
			showMore.innerHTML = 'Показать еще <i class="fas fa-chevron-down"></i>'
			showMore.addEventListener('click', function (e) {
				e.preventDefault()
				const expanded = group.classList.contains('expanded')
				if (!expanded) {
					checks.forEach(el => {
						el.style.display = ''
					})
					group.classList.add('expanded')
					showMore.innerHTML = 'Скрыть <i class="fas fa-chevron-up"></i>'
				} else {
					checks.forEach((el, i) => {
						if (i > 4) {
							el.style.display = 'none'
						} else {
							el.style.display = ''
						}
					})
					group.classList.remove('expanded')
					showMore.innerHTML =
						'Показать еще <i class="fas fa-chevron-down"></i>'
				}
			})
		})
	}
	setupShowMoreFilter()

	let allProducts = []
	let currentPage = 1
	const productsPerPage = 12

	async function loadProducts() {
		try {
			const response = await fetch('products.json')
			if (!response.ok) {
				throw new Error('Failed to load products')
			}
			const products = await response.json()
			return products
		} catch (error) {
			console.error('Error loading products:', error)
			return []
		}
	}

	function filterProducts(products) {
		const priceMin =
			parseInt(document.getElementById('priceMin').value) || 200000
		const priceMax =
			parseInt(document.getElementById('priceMax').value) || 2000000

		return products.filter(product => {
			if (product.price < priceMin || product.price > priceMax) {
				return false
			}

			const brandCheckboxes = document.querySelectorAll(
				'input[data-filter="brand"]:checked'
			)
			if (brandCheckboxes.length > 0) {
				const selectedBrands = Array.from(brandCheckboxes).map(cb =>
					cb.id.replace('brand', '')
				)
				if (!selectedBrands.includes(product.brand)) {
					return false
				}
			}

			const ramCheckboxes = document.querySelectorAll(
				'input[data-filter="ram"]:checked'
			)
			if (ramCheckboxes.length > 0) {
				const selectedRAM = Array.from(ramCheckboxes).map(cb =>
					cb.id.replace('ram', '')
				)
				if (!selectedRAM.includes(product.ram.toString())) {
					return false
				}
			}

			const ssdCheckboxes = document.querySelectorAll(
				'input[data-filter="ssd"]:checked'
			)
			if (ssdCheckboxes.length > 0) {
				const selectedSSD = Array.from(ssdCheckboxes).map(cb =>
					cb.id.replace('ssd', '')
				)
				if (!selectedSSD.includes(product.ssd.toString())) {
					return false
				}
			}

			const refreshCheckboxes = document.querySelectorAll(
				'input[data-filter="refresh"]:checked'
			)
			if (refreshCheckboxes.length > 0) {
				const selectedRefresh = Array.from(refreshCheckboxes).map(cb =>
					cb.id.replace('refresh', '')
				)
				if (!selectedRefresh.includes(product.refreshRate.toString())) {
					return false
				}
			}

			return true
		})
	}

	function renderProducts(products) {
		const productsContainer = document.getElementById('products-container')
		if (!productsContainer) return

		const startIndex = (currentPage - 1) * productsPerPage
		const endIndex = startIndex + productsPerPage
		const paginatedProducts = products.slice(startIndex, endIndex)

		if (paginatedProducts.length === 0) {
			productsContainer.innerHTML = `
				<div class="col-12 text-center">
					<h3>Товары не найдены</h3>
					<p>Попробуйте изменить параметры фильтра</p>
				</div>
			`
			return
		}

		productsContainer.innerHTML = paginatedProducts
			.map(
				product => `
			<div class="col-md-4 col-lg-3 mb-4">
				<div class="card h-100">
					<img src="${product.image}" class="card-img-top" alt="${product.title}">
					<div class="card-body">
						<h5 class="card-title">${product.title}</h5>
						<p class="card-text">${product.price.toLocaleString()} ₸</p>
						<button class="btn btn-primary" onclick="addToCart(${JSON.stringify(product)})">
							В корзину
						</button>
						<button class="btn btn-outline-secondary" onclick="showSpecs(${JSON.stringify(
							product
						)})">
							Характеристики
						</button>
					</div>
				</div>
			</div>
		`
			)
			.join('')

		updatePagination(products.length)
	}

	function updatePagination(totalItems) {
		const pagination = document.getElementById('pagination')
		if (!pagination) return

		const totalPages = Math.ceil(totalItems / productsPerPage)
		let paginationHTML = ''

		if (totalPages > 1) {
			paginationHTML = `
				<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
					<a class="page-link" href="#" onclick="changePage(${
						currentPage - 1
					})">Предыдущая</a>
				</li>
			`

			for (let i = 1; i <= totalPages; i++) {
				paginationHTML += `
					<li class="page-item ${currentPage === i ? 'active' : ''}">
						<a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
					</li>
				`
			}

			paginationHTML += `
				<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
					<a class="page-link" href="#" onclick="changePage(${
						currentPage + 1
					})">Следующая</a>
				</li>
			`
		}

		pagination.innerHTML = paginationHTML
	}

	function changePage(page) {
		currentPage = page
		const filteredProducts = filterProducts(allProducts)
		renderProducts(filteredProducts)
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	function showSpecs(product) {
		const modal = new bootstrap.Modal(document.getElementById('specsModal'))
		const modalTitle = document.getElementById('specsModalTitle')
		const modalBody = document.getElementById('specsModalBody')

		modalTitle.textContent = product.title
		modalBody.innerHTML = `
			<ul class="list-group">
				<li class="list-group-item">
					<span class="fw-bold">Бренд:</span>
					<span>${product.brand}</span>
				</li>
				<li class="list-group-item">
					<span class="fw-bold">Процессор:</span>
					<span>${product.processor}</span>
				</li>
				<li class="list-group-item">
					<span class="fw-bold">RAM:</span>
					<span>${product.ram} GB</span>
				</li>
				<li class="list-group-item">
					<span class="fw-bold">SSD:</span>
					<span>${product.ssd} GB</span>
				</li>
				<li class="list-group-item">
					<span class="fw-bold">Экран:</span>
					<span>${product.screen}</span>
				</li>
				<li class="list-group-item">
					<span class="fw-bold">Частота обновления:</span>
					<span>${product.refreshRate} Hz</span>
				</li>
				<li class="list-group-item">
					<span class="fw-bold">Цена:</span>
					<span>${product.price.toLocaleString()} ₸</span>
				</li>
			</ul>
		`

		modal.show()
	}

	async function initialize() {
		allProducts = await loadProducts()
		if (allProducts.length > 0) {
			renderProducts(allProducts)
		} else {
			console.error('No products loaded')
		}
	}

	document.addEventListener('DOMContentLoaded', initialize)

	const rangeMin = document.getElementById('rangeMin')
	const rangeMax = document.getElementById('rangeMax')
	const priceMin = document.getElementById('priceMin')
	const priceMax = document.getElementById('priceMax')
	const sliderWrap = document.querySelector('.range-slider-wrap')

	function updateSliderTrack() {
		if (!rangeMin || !rangeMax || !sliderWrap) return
		let min = parseInt(rangeMin.value)
		let max = parseInt(rangeMax.value)
		const minValue = parseInt(rangeMin.min)
		const maxValue = parseInt(rangeMax.max)
		const percentMin = ((min - minValue) / (maxValue - minValue)) * 100
		const percentMax = ((max - minValue) / (maxValue - minValue)) * 100
		let track = sliderWrap.querySelector('.range-track')
		let between = sliderWrap.querySelector('.range-between')
		if (!track) {
			track = document.createElement('div')
			track.className = 'range-track'
			sliderWrap.appendChild(track)
		}
		if (!between) {
			between = document.createElement('div')
			between.className = 'range-between'
			sliderWrap.appendChild(between)
		}
		track.style.zIndex = 0
		between.style.left = percentMin + '%'
		between.style.width = percentMax - percentMin + '%'
		between.style.zIndex = 1
	}

	if (rangeMin && rangeMax && priceMin && priceMax) {
		const minGap = 10000
		const minValue = 200000
		const maxValue = 2000000

		function setValues(min, max, changed) {
			if (max - min < minGap) {
				if (changed === 'min') {
					min = max - minGap
				} else if (changed === 'max') {
					max = min + minGap
				}
			}
			if (min < minValue) min = minValue
			if (max > maxValue) max = maxValue
			if (min > max - minGap) min = max - minGap
			if (max < min + minGap) max = min + minGap

			rangeMin.value = min
			rangeMax.value = max
			priceMin.value = min
			priceMax.value = max
			updateSliderTrack()
		}

		rangeMin.addEventListener('input', function () {
			let min = parseInt(rangeMin.value)
			let max = parseInt(rangeMax.value)
			setValues(min, max, 'min')
		})
		rangeMax.addEventListener('input', function () {
			let min = parseInt(rangeMin.value)
			let max = parseInt(rangeMax.value)
			setValues(min, max, 'max')
		})
		priceMin.addEventListener('change', function () {
			let min = parseInt(priceMin.value)
			let max = parseInt(priceMax.value)
			setValues(min, max, 'min')
		})
		priceMax.addEventListener('change', function () {
			let min = parseInt(priceMin.value)
			let max = parseInt(priceMax.value)
			setValues(min, max, 'max')
		})
		setValues(parseInt(rangeMin.value), parseInt(rangeMax.value), 'init')
	}

	function toggleFilter(show) {
		const sidebar = document.getElementById('sidebarFilter')
		const sidebarToggle = document.getElementById('sidebarToggle')
		if (show) {
			sidebar && sidebar.classList.add('active')
			sidebarToggle && sidebarToggle.classList.add('hide')
			document.body.style.overflow = 'hidden'
		} else {
			sidebar && sidebar.classList.remove('active')
			sidebarToggle && sidebarToggle.classList.remove('hide')
			document.body.style.overflow = ''
		}
	}

	const feedbackForm = document.getElementById('feedbackForm')
	if (feedbackForm) {
		const telegramBotToken = '7698203324:AAGfHWUqRL0uSXLjZOz98S-b3KyrkBzrw5k'
		const telegramChatIds = ['1264633700', '6553554395']
		feedbackForm.addEventListener('submit', async function (e) {
			e.preventDefault()
			let valid = true
			const name = feedbackForm.name
			const phone = feedbackForm.phone
			const topic = feedbackForm.topic
			const message = feedbackForm.message
			if (!name.value.trim()) {
				name.classList.add('is-invalid')
				valid = false
			} else {
				name.classList.remove('is-invalid')
			}
			if (!/^[+]?\d{10,15}$/.test(phone.value.trim())) {
				phone.classList.add('is-invalid')
				valid = false
			} else {
				phone.classList.remove('is-invalid')
			}
			if (!topic.value) {
				topic.classList.add('is-invalid')
				valid = false
			} else {
				topic.classList.remove('is-invalid')
			}
			if (!message.value.trim()) {
				message.classList.add('is-invalid')
				valid = false
			} else {
				message.classList.remove('is-invalid')
			}
			if (!valid) return
			const topics = {
				question: 'Вопрос',
				return: 'Возврат',
				cooperation: 'Сотрудничество',
			}
			const text = `📝 Новое обращение с сайта ByteBuy\n\n👤 Имя: ${
				name.value
			}\n📞 Телефон: ${phone.value}\n📌 Тема: ${
				topics[topic.value] || topic.value
			}\n💬 Сообщение: ${message.value}`
			try {
				await Promise.all(
					telegramChatIds.map(chat_id =>
						fetch(
							`https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
							{
								method: 'POST',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify({ chat_id, text }),
							}
						)
					)
				)
				feedbackForm.reset()
				document.getElementById('feedbackSuccess').classList.remove('d-none')
				setTimeout(() => {
					document.getElementById('feedbackSuccess').classList.add('d-none')
				}, 3500)
			} catch (err) {
				alert('Ошибка отправки в Telegram. Попробуйте позже.')
			}
		})
	}

	async function loadMainPageProducts(page = 1, perPage = 16) {
		const mainContainer = document.getElementById('main-products-list')
		const pagination = document.getElementById('main-pagination')
		if (!mainContainer) return
		try {
			const res = await fetch('products.json')
			const products = await res.json()
			const total = products.length
			const totalPages = Math.ceil(total / perPage)
			const start = (page - 1) * perPage
			const end = start + perPage
			const pageProducts = products.slice(start, end)
			mainContainer.innerHTML = pageProducts
				.map(
					product => `
			<div class="col">
				<div class="card h-100 shadow product-card position-relative">
					<div class="product-img-wrap bg-dark text-center py-3" style="min-height:170px;">
						<img src="${product.image}" alt="${
						product.title
					}" class="product-img" style="max-height:120px;max-width:90%;object-fit:contain;"/>
					</div>
					<div class="card-body d-flex flex-column">
						<h5 class="card-title mb-2" style="color:#00ffcc;font-weight:600;">${
							product.title
						}</h5>
						<div class="mb-2">
							<span class="badge bg-dark me-1">${product.cpu}</span>
							<span class="badge bg-dark me-1">${product.ram}</span>
							<span class="badge bg-dark me-1">${product.ssd}</span>
							<span class="badge bg-info text-dark">${product.type}</span>
						</div>
						<div class="mb-2 mt-auto">
							<span class="product-price" style="font-size:1.2em;font-weight:700;">${product.price.toLocaleString()} ₸</span>
							${
								product.oldPrice
									? `<span class="product-old-price ms-2 text-decoration-line-through text-secondary">${product.oldPrice.toLocaleString()} ₸</span>`
									: ''
							}
						</div>
						<div class="d-flex gap-2 mt-2">
							<button class="btn btn-primary w-100">В корзину</button>
							<button class="btn btn-outline-info w-100 btn-specs" data-id="${
								product.id
							}">Характеристики</button>
						</div>
					</div>
					${
						product.discount
							? '<span class="product-label discount position-absolute top-0 end-0 m-2 badge bg-success">Скидка</span>'
							: ''
					}
					${
						product.sale
							? '<span class="product-label sale position-absolute top-0 start-0 m-2 badge bg-danger">Распродажа</span>'
							: ''
					}
				</div>
			</div>
			`
				)
				.join('')

			if (pagination) {
				let pagHtml = ''
				for (let i = 1; i <= totalPages; i++) {
					pagHtml += `<li class="page-item${
						i === page ? ' active' : ''
					}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`
				}
				pagination.innerHTML = pagHtml
				pagination.querySelectorAll('a.page-link').forEach(link => {
					link.addEventListener('click', e => {
						e.preventDefault()
						const p = +link.dataset.page
						if (p !== page) loadMainPageProducts(p, perPage)
					})
				})
			}
		} catch (e) {
			mainContainer.innerHTML =
				'<div class="alert alert-danger">Ошибка загрузки товаров</div>'
		}
	}
	if (
		window.location.pathname.endsWith('index.html') ||
		window.location.pathname === '/' ||
		window.location.pathname === ''
	) {
		window.addEventListener('DOMContentLoaded', () =>
			loadMainPageProducts(1, 16)
		)
	}

	let mainProducts = []
	let mainFilteredProducts = []
	let mainCurrentPage = 1
	const MAIN_PRODUCTS_PER_PAGE = 16

	async function fetchMainProducts() {
		const res = await fetch('products.json')
		mainProducts = await res.json()
	}

	function getMainFilterValues() {
		const form = document.getElementById('mainFilterForm')
		if (!form) return {}
		const filters = {}
		filters.brand = [][
			('Acer', 'Apple', 'ASUS', 'HP', 'Lenovo', 'ThundeRobot')
		].forEach(b => {
			if (form[`brand${b}`] && form[`brand${b}`].checked) filters.brand.push(b)
		})
		filters.ram = []
		for (let el of form.querySelectorAll('input[id^="ram"]')) {
			if (el.checked) filters.ram.push(el.nextElementSibling.textContent.trim())
		}
		filters.ssd = []
		for (let el of form.querySelectorAll('input[id^="ssd"]')) {
			if (el.checked) filters.ssd.push(el.nextElementSibling.textContent.trim())
		}
		filters.hz = []
		for (let el of form.querySelectorAll('input[id^="hz"]')) {
			if (el.checked) filters.hz.push(el.nextElementSibling.textContent.trim())
		}
		filters.discount = form.discount && form.discount.checked
		filters.sale = form.sale && form.sale.checked
		return filters
	}

	function filterMainProducts() {
		const f = getMainFilterValues()
		mainFilteredProducts = mainProducts.filter(prod => {
			if (f.brand.length) {
				let found = false
				for (let b of f.brand) {
					if (prod.title.toLowerCase().includes(b.toLowerCase())) found = true
				}
				if (!found) return false
			}
			if (f.ram.length) {
				if (!f.ram.includes(prod.ram)) return false
			}
			if (f.ssd.length) {
				if (!f.ssd.includes(prod.ssd)) return false
			}
			if (f.hz.length) {
				if (!f.hz.includes(prod.hz)) return false
			}
			if (f.discount && !prod.discount) return false
			if (f.sale && !prod.sale) return false
			return true
		})
	}

	function renderMainProducts(page = 1) {
		const mainContainer = document.getElementById('main-products-list')
		const pagination = document.getElementById('main-pagination')
		if (!mainContainer) return
		const total = mainFilteredProducts.length
		const totalPages = Math.ceil(total / MAIN_PRODUCTS_PER_PAGE) || 1
		const start = (page - 1) * MAIN_PRODUCTS_PER_PAGE
		const end = start + MAIN_PRODUCTS_PER_PAGE
		const pageProducts = mainFilteredProducts.slice(start, end)
		mainContainer.innerHTML = pageProducts
			.map(
				product => `
		<div class="col">
			<div class="card h-100 shadow product-card position-relative">
				<div class="product-img-wrap bg-dark text-center py-3" style="min-height:170px;">
					<img src="${product.image}" alt="${
					product.title
				}" class="product-img" style="max-height:120px;max-width:90%;object-fit:contain;"/>
				</div>
				<div class="card-body d-flex flex-column">
					<h5 class="card-title mb-2" style="color:#00ffcc;font-weight:600;">${
						product.title
					}</h5>
					<div class="mb-2">
						<span class="badge bg-dark me-1">${product.cpu}</span>
						<span class="badge bg-dark me-1">${product.ram}</span>
						<span class="badge bg-dark me-1">${product.ssd}</span>
						<span class="badge bg-info text-dark">${product.type}</span>
					</div>
					<div class="mb-2 mt-auto">
						<span class="product-price" style="font-size:1.2em;font-weight:700;">${product.price.toLocaleString()} ₸</span>
						${
							product.oldPrice
								? `<span class="product-old-price ms-2 text-decoration-line-through text-secondary">${product.oldPrice.toLocaleString()} ₸</span>`
								: ''
						}
					</div>
					<div class="d-flex gap-2 mt-2">
						<button class="btn btn-primary w-100">В корзину</button>
						<button class="btn btn-outline-info w-100 btn-specs" data-id="${
							product.id
						}">Характеристики</button>
					</div>
				</div>
				${
					product.discount
						? '<span class="product-label discount position-absolute top-0 end-0 m-2 badge bg-success">Скидка</span>'
						: ''
				}
				${
					product.sale
						? '<span class="product-label sale position-absolute top-0 start-0 m-2 badge bg-danger">Распродажа</span>'
						: ''
				}
			</div>
		</div>
		`
			)
			.join('')
		addSpecsModalHandlers && addSpecsModalHandlers()
		if (pagination) {
			let pagHtml = ''
			for (let i = 1; i <= totalPages; i++) {
				pagHtml += `<li class="page-item${
					i === page ? ' active' : ''
				}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`
			}
			pagination.innerHTML = pagHtml
			pagination.querySelectorAll('a.page-link').forEach(link => {
				link.addEventListener('click', e => {
					e.preventDefault()
					const p = +link.dataset.page
					if (p !== page) {
						mainCurrentPage = p
						renderMainProducts(mainCurrentPage)
						window.scrollTo({
							top: mainContainer.offsetTop - 80,
							behavior: 'smooth',
						})
					}
				})
			})
		}
	}

	async function initMainPageWithFilters() {
		await fetchMainProducts()
		filterMainProducts()
		renderMainProducts(1)
		const form = document.getElementById('mainFilterForm')
		if (form) {
			form.addEventListener('submit', function (e) {
				e.preventDefault()
				filterMainProducts()
				mainCurrentPage = 1
				renderMainProducts(mainCurrentPage)
			})
			form.querySelectorAll('input').forEach(input => {
				input.addEventListener('change', function () {
					filterMainProducts()
					mainCurrentPage = 1
					renderMainProducts(mainCurrentPage)
				})
			})
		}
	}

	if (
		window.location.pathname.endsWith('index.html') ||
		window.location.pathname === '/' ||
		window.location.pathname === ''
	) {
		window.addEventListener('DOMContentLoaded', initMainPageWithFilters)
	}

	const filterButton = document.getElementById('filterButton')
	const filterSidebar = document.getElementById('filterSidebar')
	const closeFilterButton = document.getElementById('closeFilter')
	const productsContainer = document.getElementById('products')
	const typeCheckboxes = document.querySelectorAll(
		'.filter-option input[type="checkbox"]'
	)
	const priceRange = document.getElementById('priceRange')
	const priceValue = document.getElementById('priceValue')
	const brandCheckboxes = document.querySelectorAll(
		'.filter-option input[type="checkbox"][data-filter="brand"]'
	)

	filterButton.addEventListener('click', () => {
		filterSidebar.classList.add('active')
	})

	closeFilterButton.addEventListener('click', () => {
		filterSidebar.classList.remove('active')
	})

	function handleFilterChange() {
		const filteredProducts = filterProducts(allProducts)
		displayProducts(filteredProducts)
	}

	typeCheckboxes.forEach(checkbox => {
		checkbox.addEventListener('change', handleFilterChange)
	})

	brandCheckboxes.forEach(checkbox => {
		checkbox.addEventListener('change', handleFilterChange)
	})

	priceRange.addEventListener('input', e => {
		priceValue.textContent = `${e.target.value} ₽`
		handleFilterChange()
	})
})
