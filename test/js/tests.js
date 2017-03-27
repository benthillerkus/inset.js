/* eslint-env mocha */
/* global expect, expectCanvasesToBeEqual */

describe('inset', function () {
  it('works', function () {
    expect(true).to.equal(true)
  })

  it('is installed', function () {
    expect(window.Inset).to.not.be.undefined
  })

  it('does stuff', function () {
    var c = document.createElement('canvas')
    var ctx = c.getContext('2d')
    ctx.fillRect(0, 0, 300, 150)

    var c2 = document.createElement('canvas')
    var ctx2 = c2.getContext('2d')
    ctx2.fillRect(0, 0, 300, 150)

    expectCanvasesToBeEqual(c, c2)

    // Load expected image.
    // TODO: make this work, resolve CORS issues.
    // var imageSource = 'http://localhost:8080/test/img/fill-rect-full.png'
    // expectCanvasToEqualImg(c, imageSource)
  })

  it('post-stuff', function () {
    expect(window.Inset).to.not.be.undefined
  })
})
