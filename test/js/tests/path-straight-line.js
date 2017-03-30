/* eslint-env mocha */
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "testPathStraightLine" }] */
/* global expectCanvasToEqualImg */

function testPathStraightLine () {
  let canvas
  let ctx

  beforeEach(() => {
    canvas = document.createElement('canvas')
    ctx = canvas.getContext('2d')
  })

  function drawTriangle (offset = {x: 0, y: 0}) {
    ctx.save()
    ctx.translate(offset.x, offset.y)
    ctx.beginPath()
    ctx.moveTo(50, 50)
    ctx.lineTo((canvas.width / 2) - 50, canvas.height / 2)
    ctx.lineTo(50, canvas.height - 50)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  function drawConcave (offset = {x: 0, y: 0}) {
    ctx.save()
    ctx.translate(offset.x, offset.y)
    ctx.beginPath()
    ctx.moveTo(canvas.width / 2 + 50, 50)
    ctx.lineTo(canvas.width / 2 + 50, canvas.height - 50)
    ctx.lineTo(canvas.width * 3 / 4, canvas.height / 2)
    ctx.lineTo(canvas.width - 50, canvas.height - 50)
    ctx.lineTo(canvas.width - 50, 50)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  describe('path (straight line)', () => {
    it('draws with no shadow', (done) => {
      ctx.fillStyle = 'red'
      drawTriangle()
      drawConcave()

      // Load expected image.
      const imageSource = 'img/path-straight-line/no-shadow.png'
      expectCanvasToEqualImg(canvas, imageSource, done)
    })

    it('draws with a normal shadow', (done) => {
      ctx.fillStyle = 'red'
      ctx.shadowColor = 'black'
      ctx.shadowBlur = 15
      drawTriangle()
      drawConcave()

      // Load expected image.
      const imageSource = 'img/path-straight-line/normal-shadow.png'
      expectCanvasToEqualImg(canvas, imageSource, done)
    })

    it('draws with an inset shadow', (done) => {
      ctx.fillStyle = 'red'
      ctx.shadowInset = true
      ctx.shadowColor = 'black'
      ctx.shadowBlur = 35
      drawTriangle()
      drawConcave()

      // Load expected image.
      const imageSource = 'img/path-straight-line/inset-shadow.png'
      expectCanvasToEqualImg(canvas, imageSource, done)
    })

    it('draws transparent with an inset shadow', (done) => {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'
      drawTriangle()
      drawConcave()

      ctx.shadowInset = true
      ctx.shadowColor = 'black'
      ctx.shadowBlur = 35
      drawTriangle({x: 0, y: 15})
      drawConcave({x: 0, y: 15})

      // Load expected image.
      const imageSource = 'img/path-straight-line/transparent-inset-shadow.png'
      expectCanvasToEqualImg(canvas, imageSource, done)
    })

    it('draws a normal shadow and an inset shadow', (done) => {
      ctx.fillStyle = 'red'
      ctx.shadowInset = true
      ctx.shadowColor = 'black'
      ctx.shadowBlur = 35
      drawTriangle()
      drawConcave()

      // This one is a little weird. The transparent fill-style means you
      // can actually see some of the non-inset shadow inside the box.
      ctx.shadowInset = false
      ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'
      drawTriangle({x: 10, y: 5})
      drawConcave({x: 10, y: 5})

      // Load expected image.
      const imageSource = 'img/path-straight-line/normal-and-inset-shadows.png'
      expectCanvasToEqualImg(canvas, imageSource, done)
    })

    it('draws with an inset shadow, filling the entire canvas', (done) => {
      ctx.fillStyle = 'red'
      ctx.shadowInset = true
      ctx.shadowColor = 'black'
      ctx.shadowBlur = 15
      ctx.moveTo(0, 0)
      ctx.lineTo(canvas.width, 0)
      ctx.lineTo(canvas.width, canvas.height)
      ctx.lineTo(0, canvas.height)
      ctx.fill()

      // Load expected image.
      const imageSource = 'img/path-straight-line/inset-shadow-full.png'
      expectCanvasToEqualImg(canvas, imageSource, done)
    })
  })
}
