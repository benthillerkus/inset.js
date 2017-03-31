/* eslint-env mocha */
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "testPathArc" }] */
/* global expectCanvasToEqualImg */

function testPathArc () {
  let canvas
  let ctx

  beforeEach(() => {
    canvas = document.createElement('canvas')
    ctx = canvas.getContext('2d')
  })

  function drawArc (offset = {x: 0, y: 0}) {
    drawArcForContext(ctx, offset);
  }

  function drawArcForContext (context, offset = {x: 0, y: 0}) {
    context.save()
    context.translate(offset.x, offset.y)

    context.beginPath()
    context.arc(canvas.width / 4, canvas.height / 2, canvas.width / 2 - 140, Math.PI, 0)
    context.arc(canvas.width / 4, canvas.height / 2, canvas.width / 2 - 90, 0, Math.PI, true)
    context.closePath()
    context.fill()

    context.restore()
  }

  function drawArcTo (offset = {x: 0, y: 0}) {
    drawArcToForContext(ctx, offset)
  }

  function drawArcToForContext(context, offset = {x: 0, y: 0}) {
    const radius = 15

    context.save()
    context.translate(offset.x, offset.y)

    context.beginPath()
    // draw top and top right corner
    context.moveTo(canvas.width / 2 + 50 + radius, 50)
    context.arcTo(canvas.width - 50, 50, canvas.width - 50, 50 + radius, radius)
    // draw right side and bottom right corner
    context.arcTo(canvas.width - 50, canvas.height - 50, canvas.width - 50 - radius, canvas.height - 50, radius)
    // draw bottom and bottom left corner
    context.arcTo(canvas.width / 2 + 50, canvas.height - 50, canvas.width / 2 + 50, canvas.height - 50 - radius, radius)
    // draw left and top left corner
    context.arcTo(canvas.width / 2 + 50, 50, canvas.width / 2 + 50 + radius, 50, radius)

    context.closePath()
    context.fill()

    context.restore()
  }

  describe('path (arc)', () => {
    it('draws with no shadow', (done) => {
      ctx.fillStyle = 'red'
      drawArc()
      drawArcTo()

      // Load expected image.
      const imageSource = 'img/path-arc/no-shadow.png'
      expectCanvasToEqualImg(canvas, imageSource, done)
    })

    it('draws with a normal shadow', (done) => {
      ctx.fillStyle = 'red'
      ctx.shadowColor = 'black'
      ctx.shadowBlur = 15
      drawArc()
      drawArcTo()

      // Load expected image.
      const imageSource = 'img/path-arc/normal-shadow.png'
      expectCanvasToEqualImg(canvas, imageSource, done)
    })

    it('draws with an inset shadow', (done) => {
      ctx.fillStyle = 'red'
      ctx.shadowInset = true
      ctx.shadowColor = 'black'
      ctx.shadowBlur = 35
      drawArc()
      drawArcTo()

      // Load expected image.
      const imageSource = 'img/path-arc/inset-shadow.png'
      expectCanvasToEqualImg(canvas, imageSource, done)
    })

    it('draws transparent with an inset shadow', (done) => {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'
      drawArc()
      drawArcTo()

      ctx.shadowInset = true
      ctx.shadowColor = 'black'
      ctx.shadowBlur = 35
      drawArc({x: 0, y: 15})
      drawArcTo({x: 0, y: 15})

      // Load expected image.
      const imageSource = 'img/path-arc/transparent-inset-shadow.png'
      expectCanvasToEqualImg(canvas, imageSource, done)
    })

    it('draws a normal shadow and an inset shadow', (done) => {
      ctx.fillStyle = 'red'
      ctx.shadowInset = true
      ctx.shadowColor = 'black'
      ctx.shadowBlur = 35
      drawArc()
      drawArcTo()

      // This one is a little weird. The transparent fill-style means you
      // can actually see some of the non-inset shadow inside the box.
      ctx.shadowInset = false
      ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'
      drawArc({x: 10, y: 5})
      drawArcTo({x: 10, y: 5})

      // Load expected image.
      const imageSource = 'img/path-arc/normal-and-inset-shadows.png'
      expectCanvasToEqualImg(canvas, imageSource, done)
    })

    it('draws using multiple canvases', (done) => {
      const canvas2 = document.createElement('canvas')
      const ctx2 = canvas2.getContext('2d')

      // Draw shape on first canvas.
      ctx.fillStyle = 'red'
      ctx.shadowInset = true
      ctx.shadowColor = 'black'
      ctx.shadowBlur = 35
      drawArc()

      // Draw shape on second canvas. This one shouldn't have
      // a shadow, since "drawImage" will apply the shadow to
      // the original canvas.
      ctx2.fillStyle = 'red'
      drawArcToForContext(ctx2)

      // Composite second canvas onto first canvas.
      ctx.drawImage(canvas2, 0, 0)

      // Load expected image.
      const imageSource = 'img/path-arc/multiple-canvas.png'
      expectCanvasToEqualImg(canvas, imageSource, done)
    })
  })
}
