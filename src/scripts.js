import Alpine from 'alpinejs'
window.Alpine = Alpine

const store = {
	navShown: true
}
Alpine.store(store)

// JS must be evaluated after DOM is ready
// <script defer...> would do it, but it doesn't work on inlined script
window.addEventListener('DOMContentLoaded', () => {
	Alpine.start()
})

// set data after Alpine init
document.addEventListener('alpine:init', () => {
	const libJSON = JSON.parse(document.getElementById('json-libdoc').innerText)
	Alpine.data('lib', () => ({
		...libJSON
	}))
})
