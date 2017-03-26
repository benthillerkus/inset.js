/* eslint-env browser */
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
      c.width = canvas.width
      c.height = canvas.height

      // Draw image.
      original.apply(ctx, args)

      // Invert alpha channel.
      ctx.globalCompositeOperation = 'xor'
      ctx.fillStyle = 'black'
      fillRect.apply(ctx, [0, 0, c.width, c.height])

      // Draw itself again using drop-shadow filter.
      swapShadows(ctx, otherCtx)
      ctx.drawImage(c, 0, 0)

      // Draw shadow onto original canvas.
      original.apply(otherCtx, args)

      // Draw the actual thing we were drawing.
      otherCtx.drawImage(c, 0, 0)

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
