/* eslint-env mocha */
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "testPathRect" }] */
/* global expectCanvasToEqualImg */

function testPathRect () {
  let canvas
  let ctx

  beforeEach(() => {
    canvas = document.createElement('canvas')
    ctx = canvas.getContext('2d')
  })

  // Draw a rectangle using "ctx.rect()", and "ctx.fill()".
  function pathRect (x, y, w, h) {
    ctx.beginPath()
    ctx.rect(x, y, w, h)
    ctx.closePath()
    ctx.fill()
  }

  describe('path (rect)', () => {
    it('draws with no shadow', (done) => {
      ctx.fillStyle = 'red'
      pathRect(50, 50, 200, 50)

      // Load expected image.
      const imageSource = 'img/path-rect/no-shadow.png'
      expectCanvasToEqualImg(canvas, imageSource, done)
    })

    it('draws with a normal shadow', (done) => {
      ctx.fillStyle = 'red'
      ctx.shadowColor = 'black'
      ctx.shadowBlur = 15
      pathRect(50, 50, 200, 50)

      // Load expected image.
      const imageSource = 'img/path-rect/normal-shadow.png'
      expectCanvasToEqualImg(canvas, imageSource, done)
    })

    it('draws with an inset shadow', (done) => {
      ctx.fillStyle = 'red'
      ctx.shadowInset = true
      ctx.shadowColor = 'black'
      ctx.shadowBlur = 35
      pathRect(50, 50, 200, 50)

      // Load expected image.
      const imageSource = 'img/path-rect/inset-shadow.png'
      expectCanvasToEqualImg(canvas, imageSource, done)
    })

    it('draws transparent with an inset shadow', (done) => {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'
      pathRect(50, 50, 200, 50)

      ctx.shadowInset = true
      ctx.shadowColor = 'black'
      ctx.shadowBlur = 35
      pathRect(0, 0, 175, canvas.height)

      // Load expected image.
      const imageSource = 'img/path-rect/transparent-inset-shadow.png'
      expectCanvasToEqualImg(canvas, imageSource, done)
    })

    it('draws a normal shadow and an inset shadow', (done) => {
      ctx.fillStyle = 'red'
      ctx.shadowInset = true
      ctx.shadowColor = 'black'
      ctx.shadowBlur = 35
      pathRect(50, 50, 200, 50)

      // This one is a little weird. The transparent fill-style means you
      // can actually see some of the non-inset shadow inside the box.
      ctx.shadowInset = false
      ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'
      pathRect(25, 25, 250, 100)

      // Load expected image.
      const imageSource = 'img/path-rect/normal-and-inset-shadows.png'
      expectCanvasToEqualImg(canvas, imageSource, done)
    })

    it('draws with an inset shadow, filling the entire canvas', (done) => {
      ctx.fillStyle = 'red'
      ctx.shadowInset = true
      ctx.shadowColor = 'black'
      ctx.shadowBlur = 15
      pathRect(0, 0, 300, 150)

      // Load expected image.
      const imageSource = 'img/path-rect/inset-shadow-full.png'
      expectCanvasToEqualImg(canvas, imageSource, done)
    })
  })
}
