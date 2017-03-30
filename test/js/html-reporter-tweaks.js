document.addEventListener('click', onTestExpand, {passive: true})

function onTestExpand (event) {
  var src = event.srcElement
  if (src.tagName === 'H2') {
    src.classList.toggle('expanded')
  }
}
