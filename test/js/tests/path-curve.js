/* eslint-env mocha */
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "testPathCurve" }] */
/* global expectCanvasToEqualImg */

function testPathCurve () {
  let canvas
  let ctx

  beforeEach(() => {
    canvas = document.createElement('canvas')
    ctx = canvas.getContext('2d')
  })

  function drawBezierCurve (offset = {x: 0, y: 0}) {
    ctx.save()
    ctx.translate(offset.x, offset.y)

    ctx.beginPath()
    ctx.moveTo(111, 111)
    ctx.bezierCurveTo(59, 0, 50, 34, 21, 17)
    ctx.bezierCurveTo(0, 111, 0, 50, 111, 111)
    ctx.fill()

    ctx.restore()
  }

  function drawQuadraticCurve (offset = {x: 0, y: 0}) {
    ctx.save()
    ctx.translate(offset.x, offset.y)

    ctx.beginPath()
    ctx.moveTo(160, 40)
    ctx.quadraticCurveTo(290, 26, 290, 133)
    ctx.quadraticCurveTo(150, 140, 160, 40)
    ctx.closePath()
    ctx.fill()

    ctx.restore()
  }

  describe('path (arc)', () => {
    it('draws with no shadow', (done) => {
      ctx.fillStyle = 'red'
      drawBezierCurve()
      drawQuadraticCurve()

      // Load expected image.
      const imageSource = 'img/path-curve/no-shadow.png'
      expectCanvasToEqualImg(canvas, imageSource, done)
    })

    it('draws with a normal shadow', (done) => {
      ctx.fillStyle = 'red'
      ctx.shadowColor = 'black'
      ctx.shadowBlur = 15
      drawBezierCurve()
      drawQuadraticCurve()

      // Load expected image.
      const imageSource = 'img/path-curve/normal-shadow.png'
      expectCanvasToEqualImg(canvas, imageSource, done)
    })

    it('draws with an inset shadow', (done) => {
      ctx.fillStyle = 'red'
      ctx.shadowInset = true
      ctx.shadowColor = 'black'
      ctx.shadowBlur = 35
      drawBezierCurve()
      drawQuadraticCurve()

      // Load expected image.
      const imageSource = 'img/path-curve/inset-shadow.png'
      expectCanvasToEqualImg(canvas, imageSource, done)
    })

    it('draws transparent with an inset shadow', (done) => {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'
      drawBezierCurve()
      drawQuadraticCurve()

      ctx.shadowInset = true
      ctx.shadowColor = 'black'
      ctx.shadowBlur = 35
      drawBezierCurve({x: 0, y: 15})
      drawQuadraticCurve({x: 0, y: 15})

      // Load expected image.
      const imageSource = 'img/path-curve/transparent-inset-shadow.png'
      expectCanvasToEqualImg(canvas, imageSource, done)
    })

    it('draws a normal shadow and an inset shadow', (done) => {
      ctx.fillStyle = 'red'
      ctx.shadowInset = true
      ctx.shadowColor = 'black'
      ctx.shadowBlur = 35
      drawBezierCurve()
      drawQuadraticCurve()

      // This one is a little weird. The transparent fill-style means you
      // can actually see some of the non-inset shadow inside the box.
      ctx.shadowInset = false
      ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'
      drawBezierCurve({x: 10, y: 5})
      drawQuadraticCurve({x: 10, y: 5})

      // Load expected image.
      const imageSource = 'img/path-curve/normal-and-inset-shadows.png'
      expectCanvasToEqualImg(canvas, imageSource, done)
    })
  })
}
