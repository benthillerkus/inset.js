/* eslint-env browser, mocha */
/* eslint no-unused-vars: "warn" */
/* global chai, expect, imagediff, phantom */

function get (element, content) {
  element = document.createElement(element)
  if (element && content) {
    element.innerHTML = content
  }
  return element
}

function getCanvas (width, height) {
  var canvas = document.createElement('canvas')
  if (width) canvas.width = width
  if (height) canvas.height = height
  return canvas
}

function toCanvas (object) {
  var data = imagediff.toImageData(object)
  var canvas = getCanvas(data.width, data.height)
  var context = canvas.getContext('2d')

  context.putImageData(data, 0, 0)
  return canvas
}

function expectCanvasesToBeEqual (c1, c2) {
  if (typeof document !== 'undefined') {
    // Calculate diff.
    var diff = imagediff.diff(c1, c2)
    var areEqual = imagediff.equal(c1, c2)

    // Only output fancy diff if not running in PhantomJS.
    // TODO: print diff to file if running in PhantomJS.
    if (!phantom) insertDiff(c1, c2, diff, areEqual)
    var errorMessage = 'canvases did not match.'
    expect(areEqual, errorMessage).to.be.true
  }
}

function expectCanvasToEqualImg (c, imgUrl, done) {
  if (typeof document !== 'undefined') {
    // Fetch image.
    var img = new Image()
    img.onload = function () {
      var diff = imagediff.diff(c, img)
      var areEqual = imagediff.equal(c, img)

      // Only output fancy diff if not running in PhantomJS.
      // TODO: print diff to file if running in PhantomJS.
      if (!phantom) insertDiff(c, img, diff, areEqual)

      var errorMessage = 'canvas did not match image ' + imgUrl + '.'
      done(areEqual ? undefined : new chai.AssertionError(errorMessage))
    }
    img.src = imgUrl
  }
}

function insertDiff (c1, c2, diff, areEqual) {
  // Get current state of UI, so we know where to put the diff.
  var suites = document.querySelectorAll('#mocha-report .suite')
  var suite = suites[suites.length - 1]
  var index = suite.children[1].children.length

  setTimeout(function () {
    var div = get('div')
    var a = get('div', '<div>Actual:</div>')
    var b = get('div', '<div>Expected:</div>')
    var c = get('div', '<div>Diff:</div>')
    var canvas = getCanvas()
    var context

    canvas.height = diff.height
    canvas.width = diff.width

    div.style.overflow = 'hidden'
    a.style.float = 'left'
    b.style.float = 'left'
    c.style.float = 'left'

    context = canvas.getContext('2d')
    context.putImageData(diff, 0, 0)

    a.appendChild(toCanvas(c1))
    b.appendChild(toCanvas(c2))
    c.appendChild(canvas)

    div.appendChild(a)
    div.appendChild(b)

    if (!areEqual) {
      div.appendChild(c)
    }

    var li = suite.querySelector('ul').children[index]
    var pre = li.querySelector('pre:not(.error)')
    var code = pre.querySelector('code')

    pre.insertBefore(div, code)
  }, 250)
}
