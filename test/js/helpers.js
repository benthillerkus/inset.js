/* eslint-env browser, mocha */
/* eslint no-unused-vars: "warn" */
/* global expect, imagediff, phantom */

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
    var diff = imagediff.diff(c1, c2)
    var areEqual = imagediff.equal(c1, c2)

    // Only output fancy diff if not running in PhantomJS.
    if (!phantom) {
      var suites = document.querySelectorAll('#mocha-report .suite')
      var suite = suites[suites.length - 1]
      var index = suite.children[1].children.length
      insertDiff(suite, index, c1, c2, diff, areEqual)
    }

    expect(areEqual).to.be.true
  }

  function insertDiff (suite, index, c1, c2, diff, areEqual) {
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
}

// TODO: re-add and make this work.
// function expectCanvasToEqualImg (c, imgUrl) {
//   if (typeof (document) !== undefined) {
//     var suite = document.querySelector('#mocha-report .suite:last-child')
//     var index = suite.children[1].children.length

//     var img = new Image()
//     // img.crossOrigin = "anonymous"
//     img.onload = function () {
//       var diff = imagediff.diff(c, img)
//       var areEqual = imagediff.equal(c, img)
//       insertDiff(suite, index, c1, img, diff, areEqual)
//       expect(areEqual).to.be.true
//       done()
//     }
//   // img.src = imgUrl
//   }

//   function insertDiff (suite, index, c, img, diff, areEqual) {
//     setTimeout(function () {
//       var div = get('div'),
//         a = get('div', '<div>Actual:</div>'),
//         b = get('div', '<div>Expected:</div>'),
//         c = get('div', '<div>Diff:</div>'),
//         canvas = getCanvas(),
//         context

//       canvas.height = diff.height
//       canvas.width = diff.width

//       div.style.overflow = 'hidden'
//       a.style.float = 'left'
//       b.style.float = 'left'
//       c.style.float = 'left'

//       context = canvas.getContext('2d')
//       context.putImageData(diff, 0, 0)

//       a.appendChild(toCanvas(c))
//       b.appendChild(toCanvas(img))
//       c.appendChild(canvas)

//       div.appendChild(a)
//       div.appendChild(b)

//       if (!areEqual) {
//         div.appendChild(c)
//       }

//       var li = suite.querySelector('ul').children[index]
//       var pre = li.querySelector('pre:not(.error)')
//       var code = pre.querySelector('code')

//       pre.insertBefore(div, code)
//     }, 250)
//   }
// }
