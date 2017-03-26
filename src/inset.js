/* eslint-env browser */
;(function () {
  var c = document.createElement('canvas')
  var ctx = c.getContext('2d')

  // Needed for the drawing of the insets.
  var fillRect = CanvasRenderingContext2D.prototype.fillRect

  var replacements = ['fillRect']

  // Override the "fillRect" method.
  function override (object, methodName, callback) {
    var original = object[methodName]
    object[methodName] = function () {
      if (this.shadowInset === true) {
        callback(this, original, arguments)
      } else {
        original.apply(this, arguments)
      }
    }
  }

  for (var i = 0; i < replacements.length; i++) {
    var replacement = replacements[i]
    override(
      CanvasRenderingContext2D.prototype,
      replacement,
      function (otherCtx, original, args) {
        var canvas = otherCtx.canvas

        // Need buffer to make sure that shapes draw rihgt on the edge still have shadow.
        var buffer = Math.max(canvas.width, canvas.height)
        c.width = canvas.width + (2 * buffer)
        c.height = canvas.height + (2 * buffer)

        ctx.translate(buffer, buffer)

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
        otherCtx.drawImage(c, buffer, buffer, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height)

        swapShadows(ctx, otherCtx)
      }
    )
  }

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
