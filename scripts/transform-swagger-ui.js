// Transpiles the vendored swagger-ui-dist bundles to ES2017.
// swagger-ui 5.x ships modern syntax (e.g. `??=`); older mobile WebKits fail
// to parse it and render a white screen. This rewrites the served files in
// place after every install/build. Skips silently when esbuild is absent
// (e.g. production-only installs without dev dependencies — the Dockerfile
// copies the transformed files from the build stage instead).
try {
	require.resolve('esbuild')
} catch {
	console.log('esbuild not installed — skipping swagger-ui transform')
	process.exit(0)
}

const esbuild = require('esbuild')
const fs = require('fs')
const path = require('path')

const dir = path.join(__dirname, '..', 'node_modules', 'swagger-ui-dist')
const files = [
	'swagger-ui-bundle.js',
	'swagger-ui-standalone-preset.js',
	'swagger-ui.js',
]

let changed = 0
for (const name of files) {
	const file = path.join(dir, name)
	if (!fs.existsSync(file)) continue
	const source = fs.readFileSync(file, 'utf8')
	const { code } = esbuild.transformSync(source, {
		loader: 'js',
		target: 'es2017',
		minify: false,
		sourcemap: false,
	})
	if (code !== source) {
		fs.writeFileSync(file, code)
		changed++
	}
}
console.log(`swagger-ui transform: ${changed} file(s) rewritten to ES2017`)
