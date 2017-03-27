/* eslint-env browser */
;(function () {
  var c = document.createElement('canvas')
  var ctx = c.getContext('2d')

  // This is mainly just for testing, to make sure the script ran.
  window.Inset = 'Inset'

  // Needed for the drawing of the insets.
  var fillRect = CanvasRenderingContext2D.prototype.fillRect

  // These need to have the shadow filled in.
  var fillFunctions = ['fillRect', 'fill']

  // These should not be filled, and instead just called on the hidden canvas
  // directly.
  var passThroughFunctions = [
    'beginPath',
    'closePath',
    'moveTo',
    'lineTo',
    'bezierCurveTo',
    'quadraticCurveTo',
    'arc',
    'arcTo',
    'rect'
  ]

  // Override the method method to call "callback" if shadowInset = true.
  function overrideIfInset (object, methodName, callback) {
    var original = object[methodName]
    object[methodName] = function () {
      if (this.shadowInset === true) {
        callback(this, original, arguments)
      } else {
        original.apply(this, arguments)
      }
    }
  }

  // Set up pass-through functions that just re-apply to the hidden canvas.
  for (let i = 0; i < passThroughFunctions.length; i++) {
    var passThroughFunction = passThroughFunctions[i]
    overrideIfInset(
      CanvasRenderingContext2D.prototype,
      passThroughFunction,
      function (otherCtx, original, args) {
        // Reset canvas size, if necessary.
        var canvas = otherCtx.canvas
        var buffer = Math.max(canvas.width, canvas.height)
        resetSize(c, canvas, buffer)

        // Apply function to original and hidden canvases.
        original.apply(ctx, args)
        original.apply(otherCtx, args)
      }
    )
  }

  // Set up fill functions to actually draw the shadow.
  for (let i = 0; i < fillFunctions.length; i++) {
    var fillFunction = fillFunctions[i]
    overrideIfInset(
      CanvasRenderingContext2D.prototype,
      fillFunction,
      function (otherCtx, original, args) {
        var canvas = otherCtx.canvas

        // Need buffer to make sure that shapes draw rihgt on the edge still have shadow.
        var buffer = Math.max(canvas.width, canvas.height)
        resetSize(c, canvas, buffer)

        // Draw image.
        original.apply(ctx, args)

        // Invert alpha channel.
        ctx.globalCompositeOperation = 'xor'
        ctx.fillStyle = 'black'
        fillRect.apply(ctx, [-buffer, -buffer, c.width, c.height])

        // Draw itself again using drop-shadow filter, cutting off buffer.
        swapShadows(ctx, otherCtx)
        ctx.drawImage(c, -buffer, -buffer)

        // Draw shadow onto original canvas.
        original.apply(otherCtx, args)

        // Draw the actual thing we were drawing.
        otherCtx.drawImage(
          c,
          buffer,
          buffer,
          canvas.width,
          canvas.height,
          0,
          0,
          canvas.width,
          canvas.height
        )

        swapShadows(ctx, otherCtx)
      }
    )
  }

  function resetSize (destCanvas, srcCanvas, buffer) {
    var newWidth = srcCanvas.width + 2 * buffer
    var newHeight = srcCanvas.height + 2 * buffer
    var newSize = destCanvas.width !== newWidth ||
      destCanvas.height !== newHeight

    if (newSize) {
      if (destCanvas.width !== newWidth) destCanvas.width = newWidth
      if (destCanvas.height !== newHeight) destCanvas.height = newHeight
      destCanvas.getContext('2d').translate(buffer, buffer)
    }
  }

  // Swap shadow properties of ctx1 and ctx2.
  function swapShadows (ctx1, ctx2) {
    var shadowProps = [
      'shadowBlur',
      'shadowOffsetX',
      'shadowOffsetY',
      'shadowColor'
    ]
    for (var i = 0; i < shadowProps.length; i++) {
      var s = shadowProps[i]
      var s1 = ctx1[s]
      ctx1[s] = ctx2[s]
      ctx2[s] = s1
    }
  }
})()
