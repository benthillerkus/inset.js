/* eslint-env mocha */
/* global expect, expectCanvasToEqualImg */

describe('inset', function () {
  it('is installed', function () {
    expect(window.Inset).to.not.be.undefined
  })

  it('makes the shadow inset', function (done) {
    var c = document.createElement('canvas')
    var ctx = c.getContext('2d')
    ctx.fillStyle = 'red'
    ctx.shadowInset = true
    ctx.shadowColor = 'black'
    ctx.shadowBlur = 15
    ctx.fillRect(0, 0, 300, 150)

    // Load expected image.
    var imageSource = 'img/fill-rect-full.png'
    expectCanvasToEqualImg(c, imageSource, done)
  })
})
