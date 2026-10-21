// ES5 polyfills for runtime APIs the vendored swagger-ui bundle expects but
// older iOS WebKits lack (Object.hasOwn/at/findLast need iOS 15.3/15.4+).
// Each is feature-detected; on modern browsers this block is a no-op.
// Prepended to the swagger-ui bundles by scripts/transform-swagger-ui.js.
if (!Object.hasOwn) {
	Object.defineProperty(Object, 'hasOwn', {
		value: function (object, property) {
			if (object == null) throw new TypeError('Cannot convert undefined or null to object')
			return Object.prototype.hasOwnProperty.call(Object(object), property)
		},
		configurable: true, enumerable: false, writable: true,
	})
}
if (!String.prototype.replaceAll) {
	String.prototype.replaceAll = function (search, replacement) {
		if (search instanceof RegExp) {
			if (!search.global) throw new TypeError('replaceAll requires a global RegExp')
			return this.replace(search, replacement)
		}
		return this.split(search).join(replacement)
	}
}
if (!Promise.allSettled) {
	Promise.allSettled = function (promises) {
		return Promise.all(Array.from(promises, function (p) {
			return Promise.resolve(p).then(
				function (v) { return { status: 'fulfilled', value: v } },
				function (e) { return { status: 'rejected', reason: e } }
			)
		}))
	}
}
if (!Object.fromEntries) {
	Object.fromEntries = function (entries) {
		var obj = {}
		Array.from(entries).forEach(function (entry) { obj[entry[0]] = entry[1] })
		return obj
	}
}
if (!Array.prototype.at) {
	var __at = function (index) {
		index = Math.trunc(index) || 0
		if (index < 0) index += this.length
		if (index < 0 || index >= this.length) return undefined
		return this[index]
	}
	Object.defineProperty(Array.prototype, 'at', { value: __at, configurable: true, writable: true, enumerable: false })
	if (typeof String.prototype.at !== 'function') {
		Object.defineProperty(String.prototype, 'at', { value: __at, configurable: true, writable: true, enumerable: false })
	}
}
if (!Array.prototype.findLast) {
	Object.defineProperty(Array.prototype, 'findLast', {
		value: function (predicate) {
			for (var i = this.length - 1; i >= 0; i--) if (predicate(this[i], i, this)) return this[i]
			return undefined
		}, configurable: true, writable: true, enumerable: false,
	})
	Object.defineProperty(Array.prototype, 'findLastIndex', {
		value: function (predicate) {
			for (var i = this.length - 1; i >= 0; i--) if (predicate(this[i], i, this)) return i
			return -1
		}, configurable: true, writable: true, enumerable: false,
	})
}
if (typeof queueMicrotask !== 'function') {
	queueMicrotask = function (callback) { return Promise.resolve().then(callback) }
}
if (typeof ResizeObserver !== 'function') {
	ResizeObserver = function () {
		this.observe = function () {}
		this.unobserve = function () {}
		this.disconnect = function () {}
	}
}
