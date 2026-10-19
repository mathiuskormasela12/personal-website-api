// Transpiles the vendored swagger-ui-dist bundles to ES2017, prepends ES5
// polyfills for runtime APIs missing on older WebKits, and injects a boot
// diagnostic (scripts/transform-swagger-ui.js also patches the HTML template
// served by @nestjs/swagger so failures become visible on the page itself).
// Skips silently when esbuild is absent (e.g. production-only installs without
// dev dependencies — the Dockerfile copies the transformed files from the
// build stage instead).
try {
	require.resolve('esbuild')
} catch {
	const message = 'esbuild is not installed — swagger-ui bundles would stay ES2021 and break old mobile browsers'
	if (process.env.npm_lifecycle_event === 'postinstall') {
		// Production-only installs (--omit=dev) legitimately lack esbuild; the
		// Dockerfile copies the transformed files from the build stage instead.
		console.log(`${message} — skipping (postinstall, production install)`)
		process.exit(0)
	}
	console.error(message)
	process.exit(1)
}

const esbuild = require('esbuild')
const fs = require('fs')
const path = require('path')

// ES5 polyfills (see swagger-ui-polyfills.js) prepended to every transformed
// bundle: the vendored swagger-ui code calls APIs missing on older iOS WebKits
// (Object.hasOwn/at/findLast require iOS 15.3/15.4+).
const POLYFILLS = fs.readFileSync(path.join(__dirname, 'swagger-ui-polyfills.js'), 'utf8')
const POLYFILL_MARKER = 'Prepended to the swagger-ui bundles'

const TARGETS = [
	'swagger-ui-bundle.js',
	'swagger-ui-standalone-preset.js',
	'swagger-ui.js',
]

// --- 1) transpile + polyfill the JS bundles -------------------------------
let changed = 0
for (const name of TARGETS) {
	const file = path.join('node_modules', 'swagger-ui-dist', name)
	if (!fs.existsSync(file)) continue
	let source = fs.readFileSync(file, 'utf8')
	if (source.includes(POLYFILL_MARKER)) continue // already transformed + polyfilled
	const { code } = esbuild.transformSync(source, {
		loader: 'js',
		target: 'es2017',
		minify: false,
		sourcemap: false,
	})
	const output = POLYFILLS + code
	if (output !== source) {
		fs.writeFileSync(file, output)
		changed++
	}
}
console.log(`swagger-ui transform: ${changed} file(s) rewritten to ES2017`)

// --- 2) boot diagnostic ----------------------------------------------------
// The HTML page is generated from a template constant inside @nestjs/swagger.
// Inject a same-origin diagnostic script tag right before the bundles (an
// inline script would be blocked by helmet's CSP, hence the external file).
// If anything fails on the client (parse error, CSP block, missing asset),
// the page shows the reason in red at the top instead of a white screen.
const DIAGNOSTIC_JS = `/* Boot diagnostic: surfaces load/parse/CSP failures as visible text. */
(function () {
	function show(msg) {
		try {
			var d = document.getElementById('swagger-boot-diagnostic')
			if (!d) {
				d = document.createElement('pre')
				d.id = 'swagger-boot-diagnostic'
				d.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;margin:0;padding:8px;background:#fff;color:#b91c1c;font:12px monospace;white-space:pre-wrap;border-bottom:2px solid #b91c1c'
				(document.body || document.documentElement).appendChild(d)
			}
			d.textContent += (d.textContent ? '\\n' : '') + msg
		} catch (e) {}
	}
	window.addEventListener('error', function (e) {
		if (e.target && e.target.tagName === 'SCRIPT') {
			show('Failed to load script: ' + (e.target.src || '(inline)'))
		} else if (e.message) {
			show('Error: ' + e.message + (e.filename ? ' (' + e.filename + ':' + e.lineno + ')' : ''))
		}
	}, true)
	window.addEventListener('securitypolicyviolation', function (e) {
		show('CSP blocked ' + e.violatedDirective + ': ' + e.blockedURI)
	})
	window.addEventListener('unhandledrejection', function (e) {
		show('Unhandled rejection: ' + e.reason)
	})
	window.addEventListener('load', function () {
		setTimeout(function () {
			var rendered = document.querySelector(
				'#swagger-ui .information-container, #swagger-ui .opblock-tag-section'
			)
			if (!rendered) {
				show('Swagger UI did not render. Page JS: ' + (typeof window.ui) + ' — check the errors above or reload.')
			}
		}, 2500)
	})
})()
`

const distDir = path.join('node_modules', 'swagger-ui-dist')
fs.writeFileSync(path.join(distDir, 'swagger-boot-diagnostic.js'), DIAGNOSTIC_JS)

const templateFile = path.join('node_modules', '@nestjs', 'swagger', 'dist', 'swagger-ui', 'constants.js')
if (fs.existsSync(templateFile)) {
	let template = fs.readFileSync(templateFile, 'utf8')
	const marker = 'swagger-boot-diagnostic.js'
	if (!template.includes(marker)) {
		const anchor = '<div id="swagger-ui"></div>'
		if (template.includes(anchor)) {
			template = template.replace(
				anchor,
				anchor + '\n\n<script src="<% baseUrl %>swagger-boot-diagnostic.js"> </script>',
			)
			fs.writeFileSync(templateFile, template)
			console.log('swagger-ui transform: boot diagnostic injected into the HTML template')
		} else {
			console.log('swagger-ui transform: template anchor not found — diagnostic not injected')
		}
	}
} else {
	console.log('swagger-ui transform: @nestjs/swagger template file not found — diagnostic not injected')
}
