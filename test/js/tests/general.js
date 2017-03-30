/* eslint-env browser, mocha */
/* global expect, testFillRect, testPathStraightLine,
   testPathArc, testPathRect, testPathCurve */

describe('Inset.js', () => {
  it('adds insetShadow prop to CanvasRenderingContext2D prototype', () => {
    expect(CanvasRenderingContext2D.prototype.shadowInset).to.not.be.undefined
  })

  testFillRect()
  testPathStraightLine()
  testPathArc()
  testPathRect()
  testPathCurve()
})
