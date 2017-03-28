/* eslint-env mocha */
/* global expect, expectCanvasToEqualImg */

// Note: if this ever ends up running on PhantomJS, will need to
// handle the ES6 syntax. Either remove it or transpile to ES5.
describe('inset', () => {
  let canvas
  let ctx

  beforeEach(() => {
    canvas = document.createElement('canvas')
    ctx = canvas.getContext('2d')
  })

  it('is installed', () => {
    expect(window._inset).to.not.be.undefined
  })

  describe('fillRect', () => {
    it('draws with no shadow', (done) => {
      ctx.fillStyle = 'red'
      ctx.fillRect(50, 50, 200, 50)

      // Load expected image.
      const imageSource = 'img/fill-rect-no-shadow.png'
      expectCanvasToEqualImg(canvas, imageSource, done)
    })

    it('draws with a normal shadow', (done) => {
      ctx.fillStyle = 'red'
      ctx.shadowColor = 'black'
      ctx.shadowBlur = 15
      ctx.fillRect(50, 50, 200, 50)

      // Load expected image.
      const imageSource = 'img/fill-rect-normal-shadow.png'
      expectCanvasToEqualImg(canvas, imageSource, done)
    })

    // TODO: Don't use the same hidden canvas for every user canvas.
    // it('draws with an inset shadow', (done) => {
    //   ctx.fillStyle = 'red'
    //   ctx.shadowInset = true
    //   ctx.shadowColor = 'black'
    //   ctx.shadowBlur = 35
    //   ctx.fillRect(50, 50, 200, 50)

    //   // Load expected image.
    //   const imageSource = 'img/fill-rect-inset-shadow-full.png'
    //   expectCanvasToEqualImg(canvas, imageSource, done)
    // })

    it('draws with an inset shadow, filling the entire canvas', (done) => {
      ctx.fillStyle = 'red'
      ctx.shadowInset = true
      ctx.shadowColor = 'black'
      ctx.shadowBlur = 15
      ctx.fillRect(0, 0, 300, 150)

      // Load expected image.
      const imageSource = 'img/fill-rect-inset-shadow-full.png'
      expectCanvasToEqualImg(canvas, imageSource, done)
    })
  })
})
