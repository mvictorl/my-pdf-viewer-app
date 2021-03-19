// Get link to pdf.js library (load in index.html)
var pdfjsLib = window['pdfjs-dist/build/pdf']
pdfjsLib.GlobalWorkerOptions.workerSrc = './pdf.worker.js'

// Set canvas
var canvas = document.getElementById('pdf_renderer')
var ctx = canvas.getContext('2d')

// Trigger on render in progress for exclude overlap renderes
var renderInProgress = false

// State current PDF document
var myState = {
	pdf: null, // Source PDF document
	currentPage: 1, // Current page of PDF document
	scale: 1, // Scale view of PDF document
}

// Loading PDF file and call render() function
var loadingTask = pdfjsLib.getDocument('./New_Horizons.pdf')
loadingTask.promise.then(
	pdf => {
		console.log('PDF loaded...')
		myState.pdf = pdf
		render()
	},
	error => {
		console.error(error)
	}
)

// Render function - insert page of PDF document to canvas
function render() {
	if (!renderInProgress) {
		myState.pdf.getPage(myState.currentPage).then(page => {
			renderInProgress = true
			console.log('Page loaded...')

			// Get viewport PDF document with myState.scale
			var viewport = page.getViewport(myState)

			// Set canvas width & height according viewport of PDF document
			canvas.width = viewport.width
			canvas.height = viewport.height

			var renderContext = {
				canvasContext: ctx,
				viewport: viewport,
			}

			var renderTask = page.render(renderContext)
			renderTask.promise.then(() => {
				console.log('Page rendered....')
				renderInProgress = false
			})
		})
	}
}

/*
 ** Handling control events of HTML elements
 */

// Add listner of Pervious button
document.getElementById('go_previous').addEventListener('click', e => {
	if (myState.pdf == null || myState.currentPage == 1) return

	myState.currentPage -= 1
	document.getElementById('current_page').value = myState.currentPage
	render()
})

// Add listner of Next button
document.getElementById('go_next').addEventListener('click', e => {
	if (
		myState.pdf !== null &&
		myState.currentPage < myState.pdf._pdfInfo.numPages
	) {
		myState.currentPage += 1
		document.getElementById('current_page').value = myState.currentPage
		render()
	}
})

// Add listner of manual choose page's number by input to field & confirm it Enter-key
document.getElementById('current_page').addEventListener('keypress', e => {
	if (myState.pdf == null) return
	// If key matches of the Enter key
	if (e.key === 'Enter') {
		var inputVal = document.getElementById('current_page')
		var desiredPage = inputVal.valueAsNumber

		if (desiredPage < 0) {
			myState.currentPage = 1
		} else {
			myState.currentPage =
				desiredPage <= myState.pdf._pdfInfo.numPages
					? desiredPage
					: myState.pdf._pdfInfo.numPages
		}
		inputVal.value = myState.currentPage
		render()
	}
})

// Add listner of Zoom-in button
document.getElementById('zoom_in').addEventListener('click', e => {
	if (myState.pdf == null) return
	myState.scale += 0.1
	render()
})

// Add listner of Zoom-out button
document.getElementById('zoom_out').addEventListener('click', e => {
	if (myState.pdf == null) return
	myState.scale -= 0.1
	render()
})
