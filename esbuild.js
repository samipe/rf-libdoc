const esbuild = require('esbuild')
const { htmlPlugin } = require('@craftamap/esbuild-plugin-html')
const readline = require('readline')
const open = require('open')
const fs = require('fs')

const { MODE, PWD } = process.env
const isDev = MODE === 'dev'
const isProd = MODE === 'prod'

const template = fs.readFileSync('./src/template.html', 'utf8')

esbuild.build({
	entryPoints: ['src/scripts.js'],
	bundle: true,
	metafile: true,
	watch: isDev,
	minify: isProd, // todo: lz-string compression and run-time decoding?
	target: 'es2017',
	outdir: './',
	write: false,
	plugins: [
		htmlPlugin({
			files: [
				{
					entryPoints: ['src/scripts.js'],
					filename: 'build.html',
					htmlTemplate: './src/template.html',
					scriptLoading: 'module',
					define: { "script": 'asd' }
				}
			]
		})
	]
})
.then(({ metafile, outputFiles }) => {

	// inline scripts to html head - onelined in prod for easier reading
	let injected = template.replace('/*jsBundle*/', isProd ? outputFiles[0].text.replace(/\r?\n|\r/g, '') : outputFiles[0].text)
	// for dev, inline also test json
	if (isDev) injected = injected.replace('/*libJSON*/', fs.readFileSync('devdata.json', 'utf8'))
	// save file
	fs.writeFileSync('build.html', injected)

	// start dev server (updates not working yet)
	if (isDev) {
		console.log('Watching changes')
		console.log('To preview page, open build.html')
		const openPrompt = readline.createInterface({ input: process.stdin, output: process.stdout })
		openPrompt.question('Open preview in default browser? (Y/n) ', function (answer) {
			if (answer.toLowerCase() === 'y') open(`file://${PWD}/build.html`)
			openPrompt.close()
		})
	}

	// build size report
	if (isProd) {
		console.log(esbuild.analyzeMetafileSync(metafile))
	}

})
.catch(() => process.exit(1))
