/* eslint-env browser */

var inset = function inset() {
  // Each user canvas will have its own hidden canvas.
  // This WeakMap is to track user canvas to hidden canvas.
  var map = new WeakMap();
  var prototype = CanvasRenderingContext2D.prototype;

  // Needed for the drawing of the insets.
  var fillRect = prototype.fillRect;

  // These need to have the shadow filled in.
  var fillFunctions = ['fillRect', 'fill'];

  // These should not be filled, and instead just called on the hidden canvas
  // directly.
  var passThroughFunctions = ['beginPath', 'closePath', 'moveTo', 'lineTo', 'bezierCurveTo', 'quadraticCurveTo', 'arc', 'arcTo', 'rect'];

  // Get the corresponding hidden canvas for specified user canvas.
  // Will return a new hidden canvas if none exists.
  function getHiddenCanvas(userCanvas) {
    var hiddenCanvas = void 0;
    if (map.has(userCanvas)) {
      hiddenCanvas = map.get(userCanvas);
    } else {
      hiddenCanvas = document.createElement('canvas');
      map.set(userCanvas, hiddenCanvas);
    }
    return hiddenCanvas;
  }

  // Override "method" to call "callback" if shadowInset = true.
  function overrideIfInset(methodName, callback) {
    var original = prototype[methodName];

    // Monkey patching!!!
    prototype[methodName] = function () {
      if (this.shadowInset === true) {
        callback(this, original, arguments);
      } else {
        original.apply(this, arguments);
      }
    };
  }

  // Set marker property on prototype to control whether shadow is inset or not.
  prototype.shadowInset = false;

  // Set up pass-through functions that just re-apply to the hidden canvas.
  passThroughFunctions.forEach(function (func) {
    overrideIfInset(func, function (userCtx, original, args) {
      var userCanvas = userCtx.canvas;
      var canvas = getHiddenCanvas(userCanvas);
      var ctx = canvas.getContext('2d');

      // Reset canvas size, if necessary.
      // Need buffer to make sure that shapes drawn right on the edge
      // still have shadow.
      var buffer = Math.max(userCanvas.width, userCanvas.height);
      resetSize(canvas, userCanvas, buffer);

      // Apply function to original and hidden canvases.
      original.apply(ctx, args);
      original.apply(userCtx, args);
    });
  });

  // Set up fill functions to actually draw the shadow.
  fillFunctions.forEach(function (func) {
    overrideIfInset(func, function (userCtx, original, args) {
      var userCanvas = userCtx.canvas;
      var canvas = getHiddenCanvas(userCanvas);
      var ctx = canvas.getContext('2d');

      // Reset canvas size, if necessary.
      // Need buffer to make sure that shapes drawn right on the edge
      // still have shadow.
      var buffer = Math.max(userCanvas.width, userCanvas.height);
      resetSize(canvas, userCanvas, buffer);

      // Perform draw operation on hidden canvas.
      original.apply(ctx, args);

      // Invert alpha channel.
      ctx.globalCompositeOperation = 'xor';
      ctx.fillStyle = 'black';
      fillRect.apply(ctx, [-buffer, -buffer, canvas.width, canvas.height]);

      // Use user canvas shadows on hidden canvas, and remove shadows
      // on user canvas.
      swapShadows(ctx, userCtx);

      // Draw itself again using drop-shadow filter, allowing buffer for
      // shadow to overflow user canvas. The result is the inset shadow
      // that we're after.
      ctx.drawImage(canvas, -buffer, -buffer);

      // Perform the actual draw operation that the user requested.
      original.apply(userCtx, args);

      // Composite the shadow from the hidden canvas onto the user canvas.
      userCtx.drawImage(canvas, buffer, buffer, userCanvas.width, userCanvas.height, 0, 0, userCanvas.width, userCanvas.height);

      // Re-apply shadows back to user canvas, and remove shadows from
      // hidden canvas.
      swapShadows(ctx, userCtx);
    });
  });

  // Reset size of destCanvas to match srcCanvas, with a buffer around the edge.
  function resetSize(destCanvas, srcCanvas, buffer) {
    var newWidth = srcCanvas.width + 2 * buffer;
    var newHeight = srcCanvas.height + 2 * buffer;
    var newSize = destCanvas.width !== newWidth || destCanvas.height !== newHeight;

    if (newSize) {
      if (destCanvas.width !== newWidth) destCanvas.width = newWidth;
      if (destCanvas.height !== newHeight) destCanvas.height = newHeight;
      destCanvas.getContext('2d').translate(buffer, buffer);
    }
  }

  // Swap shadow properties of ctx1 and ctx2.
  function swapShadows(ctx1, ctx2) {
    var shadowProps = ['shadowBlur', 'shadowOffsetX', 'shadowOffsetY', 'shadowColor'];
    shadowProps.forEach(function (prop) {
      // Swap prop!
      var prop1 = ctx1[prop];
      ctx1[prop] = ctx2[prop];
      ctx2[prop] = prop1;
    });
  }
};

// Only do initialization once.
if (!window._inset) {
  window._inset = true;
  inset();
}

// No export, side-effect only.
