(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

/* eslint-env browser */

var inset = function inset() {
  // Each user canvas will have its own hidden canvas.
  // This WeakMap is to track user canvas to hidden canvas.
  var map = new WeakMap();
  var prototype = CanvasRenderingContext2D.prototype;

  // Needed for the drawing of the insets.
  var fillRect = prototype.fillRect;
  var drawImage = prototype.drawImage;

  // These need to have the shadow filled in.
  var fillFunctions = ["fill", "fillRect", "drawImage"];

  // These should not be filled, and instead just called on the hidden canvas
  // directly.
  var passThroughFunctions = ["beginPath", "closePath", "moveTo", "lineTo", "bezierCurveTo", "quadraticCurveTo", "arc", "arcTo", "rect"];

  // Get the corresponding hidden canvas for specified user canvas.
  // Will return a new hidden canvas if none exists.
  function getHiddenCanvas(userCanvas) {
    var hiddenCanvas = void 0;
    if (map.has(userCanvas)) {
      hiddenCanvas = map.get(userCanvas);
    } else {
      hiddenCanvas = document.createElement("canvas");
      document.body.appendChild(hiddenCanvas);
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
      var ctx = canvas.getContext("2d");

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
      var ctx = canvas.getContext("2d");

      // Reset canvas size, if necessary.
      // Need buffer to make sure that shapes drawn right on the edge
      // still have shadow.
      var buffer = Math.max(userCanvas.width, userCanvas.height);
      resetSize(canvas, userCanvas, buffer);

      // Perform draw operation on hidden canvas.
      original.apply(ctx, args);

      // Invert alpha channel.
      ctx.globalCompositeOperation = "xor";
      ctx.fillStyle = "black";
      fillRect.apply(ctx, [-buffer, -buffer, canvas.width, canvas.height]);

      var userCtxShadows = getShadows(userCtx);
      var noShadows = getShadows(ctx);

      // Use user canvas shadows on hidden canvas, and remove shadows
      // on user canvas.
      swapShadows(ctx, userCtx);

      /*
       Need to do another XOR of the inverted hidden canvas. Currently, we rely
      on the "drawImage.apply" below, since that is also doing an XOR. Instead,
      we should save the inverted hidden canvas image, clear the hidden canvas,
      draw the inverted shape with shadow props, then XOR with the inverted
      canvas image. Maybe?
       */

      // Draw itself again using drop-shadow filter, allowing buffer for
      // shadow to overflow user canvas. The result is the inset shadow
      // that we're after.
      drawImage.apply(ctx, [canvas, -buffer, -buffer]);

      // Perform the actual draw operation that the user requested.
      original.apply(userCtx, args);

      // Composite the shadow from the hidden canvas onto the user canvas.
      drawImage.apply(userCtx, [canvas, buffer, buffer, userCanvas.width, userCanvas.height, 0, 0, userCanvas.width, userCanvas.height]);

      // Clear hidden canvas.
      // ctx.clearRect(-buffer, -buffer, canvas.width, canvas.height);

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
      destCanvas.getContext("2d").translate(buffer, buffer);
    }
  }

  var shadowProps = ["shadowBlur", "shadowOffsetX", "shadowOffsetY", "shadowColor"];

  // Swap shadow properties of ctx1 and ctx2.
  function swapShadows(ctx1, ctx2) {
    shadowProps.forEach(function (prop) {
      // Swap prop!
      var prop1 = ctx1[prop];
      ctx1[prop] = ctx2[prop];
      ctx2[prop] = prop1;
    });
  }

  // Returns an object containing the shadow properties for a Context. This
  // should mainly be used with "setShadows()".
  function getShadows(ctx) {
    var shadows = {};
    shadowProps.forEach(function (prop) {
      shadows[prop] = ctx[prop];
    });
    return shadows;
  }

  // Applies the specified shadow properties to a Context.
  
};

// Only do initialization once.
if (typeof CanvasRenderingContext2D.prototype.shadowInset === "undefined") {
  inset();
}

// No export, side-effect only.

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zZXQuanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9pbnNldC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZW52IGJyb3dzZXIgKi9cblxuY29uc3QgaW5zZXQgPSAoKSA9PiB7XG4gIC8vIEVhY2ggdXNlciBjYW52YXMgd2lsbCBoYXZlIGl0cyBvd24gaGlkZGVuIGNhbnZhcy5cbiAgLy8gVGhpcyBXZWFrTWFwIGlzIHRvIHRyYWNrIHVzZXIgY2FudmFzIHRvIGhpZGRlbiBjYW52YXMuXG4gIGNvbnN0IG1hcCA9IG5ldyBXZWFrTWFwKCk7XG4gIGNvbnN0IHByb3RvdHlwZSA9IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRC5wcm90b3R5cGU7XG5cbiAgLy8gTmVlZGVkIGZvciB0aGUgZHJhd2luZyBvZiB0aGUgaW5zZXRzLlxuICBjb25zdCBmaWxsUmVjdCA9IHByb3RvdHlwZS5maWxsUmVjdDtcbiAgY29uc3QgZHJhd0ltYWdlID0gcHJvdG90eXBlLmRyYXdJbWFnZTtcblxuICAvLyBUaGVzZSBuZWVkIHRvIGhhdmUgdGhlIHNoYWRvdyBmaWxsZWQgaW4uXG4gIGNvbnN0IGZpbGxGdW5jdGlvbnMgPSBbXCJmaWxsXCIsIFwiZmlsbFJlY3RcIiwgXCJkcmF3SW1hZ2VcIl07XG5cbiAgLy8gVGhlc2Ugc2hvdWxkIG5vdCBiZSBmaWxsZWQsIGFuZCBpbnN0ZWFkIGp1c3QgY2FsbGVkIG9uIHRoZSBoaWRkZW4gY2FudmFzXG4gIC8vIGRpcmVjdGx5LlxuICBjb25zdCBwYXNzVGhyb3VnaEZ1bmN0aW9ucyA9IFtcbiAgICBcImJlZ2luUGF0aFwiLFxuICAgIFwiY2xvc2VQYXRoXCIsXG4gICAgXCJtb3ZlVG9cIixcbiAgICBcImxpbmVUb1wiLFxuICAgIFwiYmV6aWVyQ3VydmVUb1wiLFxuICAgIFwicXVhZHJhdGljQ3VydmVUb1wiLFxuICAgIFwiYXJjXCIsXG4gICAgXCJhcmNUb1wiLFxuICAgIFwicmVjdFwiXG4gIF07XG5cbiAgLy8gR2V0IHRoZSBjb3JyZXNwb25kaW5nIGhpZGRlbiBjYW52YXMgZm9yIHNwZWNpZmllZCB1c2VyIGNhbnZhcy5cbiAgLy8gV2lsbCByZXR1cm4gYSBuZXcgaGlkZGVuIGNhbnZhcyBpZiBub25lIGV4aXN0cy5cbiAgZnVuY3Rpb24gZ2V0SGlkZGVuQ2FudmFzKHVzZXJDYW52YXMpIHtcbiAgICBsZXQgaGlkZGVuQ2FudmFzO1xuICAgIGlmIChtYXAuaGFzKHVzZXJDYW52YXMpKSB7XG4gICAgICBoaWRkZW5DYW52YXMgPSBtYXAuZ2V0KHVzZXJDYW52YXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBoaWRkZW5DYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChoaWRkZW5DYW52YXMpO1xuICAgICAgbWFwLnNldCh1c2VyQ2FudmFzLCBoaWRkZW5DYW52YXMpO1xuICAgIH1cbiAgICByZXR1cm4gaGlkZGVuQ2FudmFzO1xuICB9XG5cbiAgLy8gT3ZlcnJpZGUgXCJtZXRob2RcIiB0byBjYWxsIFwiY2FsbGJhY2tcIiBpZiBzaGFkb3dJbnNldCA9IHRydWUuXG4gIGZ1bmN0aW9uIG92ZXJyaWRlSWZJbnNldChtZXRob2ROYW1lLCBjYWxsYmFjaykge1xuICAgIGNvbnN0IG9yaWdpbmFsID0gcHJvdG90eXBlW21ldGhvZE5hbWVdO1xuXG4gICAgLy8gTW9ua2V5IHBhdGNoaW5nISEhXG4gICAgcHJvdG90eXBlW21ldGhvZE5hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5zaGFkb3dJbnNldCA9PT0gdHJ1ZSkge1xuICAgICAgICBjYWxsYmFjayh0aGlzLCBvcmlnaW5hbCwgYXJndW1lbnRzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9yaWdpbmFsLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8vIFNldCBtYXJrZXIgcHJvcGVydHkgb24gcHJvdG90eXBlIHRvIGNvbnRyb2wgd2hldGhlciBzaGFkb3cgaXMgaW5zZXQgb3Igbm90LlxuICBwcm90b3R5cGUuc2hhZG93SW5zZXQgPSBmYWxzZTtcblxuICAvLyBTZXQgdXAgcGFzcy10aHJvdWdoIGZ1bmN0aW9ucyB0aGF0IGp1c3QgcmUtYXBwbHkgdG8gdGhlIGhpZGRlbiBjYW52YXMuXG4gIHBhc3NUaHJvdWdoRnVuY3Rpb25zLmZvckVhY2goZnVuYyA9PiB7XG4gICAgb3ZlcnJpZGVJZkluc2V0KGZ1bmMsICh1c2VyQ3R4LCBvcmlnaW5hbCwgYXJncykgPT4ge1xuICAgICAgY29uc3QgdXNlckNhbnZhcyA9IHVzZXJDdHguY2FudmFzO1xuICAgICAgY29uc3QgY2FudmFzID0gZ2V0SGlkZGVuQ2FudmFzKHVzZXJDYW52YXMpO1xuICAgICAgY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcblxuICAgICAgLy8gUmVzZXQgY2FudmFzIHNpemUsIGlmIG5lY2Vzc2FyeS5cbiAgICAgIC8vIE5lZWQgYnVmZmVyIHRvIG1ha2Ugc3VyZSB0aGF0IHNoYXBlcyBkcmF3biByaWdodCBvbiB0aGUgZWRnZVxuICAgICAgLy8gc3RpbGwgaGF2ZSBzaGFkb3cuXG4gICAgICBjb25zdCBidWZmZXIgPSBNYXRoLm1heCh1c2VyQ2FudmFzLndpZHRoLCB1c2VyQ2FudmFzLmhlaWdodCk7XG4gICAgICByZXNldFNpemUoY2FudmFzLCB1c2VyQ2FudmFzLCBidWZmZXIpO1xuXG4gICAgICAvLyBBcHBseSBmdW5jdGlvbiB0byBvcmlnaW5hbCBhbmQgaGlkZGVuIGNhbnZhc2VzLlxuICAgICAgb3JpZ2luYWwuYXBwbHkoY3R4LCBhcmdzKTtcbiAgICAgIG9yaWdpbmFsLmFwcGx5KHVzZXJDdHgsIGFyZ3MpO1xuICAgIH0pO1xuICB9KTtcblxuICAvLyBTZXQgdXAgZmlsbCBmdW5jdGlvbnMgdG8gYWN0dWFsbHkgZHJhdyB0aGUgc2hhZG93LlxuICBmaWxsRnVuY3Rpb25zLmZvckVhY2goZnVuYyA9PiB7XG4gICAgb3ZlcnJpZGVJZkluc2V0KGZ1bmMsICh1c2VyQ3R4LCBvcmlnaW5hbCwgYXJncykgPT4ge1xuICAgICAgY29uc3QgdXNlckNhbnZhcyA9IHVzZXJDdHguY2FudmFzO1xuICAgICAgY29uc3QgY2FudmFzID0gZ2V0SGlkZGVuQ2FudmFzKHVzZXJDYW52YXMpO1xuICAgICAgY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcblxuICAgICAgLy8gUmVzZXQgY2FudmFzIHNpemUsIGlmIG5lY2Vzc2FyeS5cbiAgICAgIC8vIE5lZWQgYnVmZmVyIHRvIG1ha2Ugc3VyZSB0aGF0IHNoYXBlcyBkcmF3biByaWdodCBvbiB0aGUgZWRnZVxuICAgICAgLy8gc3RpbGwgaGF2ZSBzaGFkb3cuXG4gICAgICBjb25zdCBidWZmZXIgPSBNYXRoLm1heCh1c2VyQ2FudmFzLndpZHRoLCB1c2VyQ2FudmFzLmhlaWdodCk7XG4gICAgICByZXNldFNpemUoY2FudmFzLCB1c2VyQ2FudmFzLCBidWZmZXIpO1xuXG4gICAgICAvLyBQZXJmb3JtIGRyYXcgb3BlcmF0aW9uIG9uIGhpZGRlbiBjYW52YXMuXG4gICAgICBvcmlnaW5hbC5hcHBseShjdHgsIGFyZ3MpO1xuXG4gICAgICAvLyBJbnZlcnQgYWxwaGEgY2hhbm5lbC5cbiAgICAgIGN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSBcInhvclwiO1xuICAgICAgY3R4LmZpbGxTdHlsZSA9IFwiYmxhY2tcIjtcbiAgICAgIGZpbGxSZWN0LmFwcGx5KGN0eCwgWy1idWZmZXIsIC1idWZmZXIsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodF0pO1xuXG4gICAgICBjb25zdCB1c2VyQ3R4U2hhZG93cyA9IGdldFNoYWRvd3ModXNlckN0eCk7XG4gICAgICBjb25zdCBub1NoYWRvd3MgPSBnZXRTaGFkb3dzKGN0eCk7XG5cbiAgICAgIC8vIFVzZSB1c2VyIGNhbnZhcyBzaGFkb3dzIG9uIGhpZGRlbiBjYW52YXMsIGFuZCByZW1vdmUgc2hhZG93c1xuICAgICAgLy8gb24gdXNlciBjYW52YXMuXG4gICAgICBzd2FwU2hhZG93cyhjdHgsIHVzZXJDdHgpO1xuXG4gICAgICAvKlxuXG4gICAgICBOZWVkIHRvIGRvIGFub3RoZXIgWE9SIG9mIHRoZSBpbnZlcnRlZCBoaWRkZW4gY2FudmFzLiBDdXJyZW50bHksIHdlIHJlbHlcbiAgICAgIG9uIHRoZSBcImRyYXdJbWFnZS5hcHBseVwiIGJlbG93LCBzaW5jZSB0aGF0IGlzIGFsc28gZG9pbmcgYW4gWE9SLiBJbnN0ZWFkLFxuICAgICAgd2Ugc2hvdWxkIHNhdmUgdGhlIGludmVydGVkIGhpZGRlbiBjYW52YXMgaW1hZ2UsIGNsZWFyIHRoZSBoaWRkZW4gY2FudmFzLFxuICAgICAgZHJhdyB0aGUgaW52ZXJ0ZWQgc2hhcGUgd2l0aCBzaGFkb3cgcHJvcHMsIHRoZW4gWE9SIHdpdGggdGhlIGludmVydGVkXG4gICAgICBjYW52YXMgaW1hZ2UuIE1heWJlP1xuXG4gICAgICAqL1xuXG4gICAgICAvLyBEcmF3IGl0c2VsZiBhZ2FpbiB1c2luZyBkcm9wLXNoYWRvdyBmaWx0ZXIsIGFsbG93aW5nIGJ1ZmZlciBmb3JcbiAgICAgIC8vIHNoYWRvdyB0byBvdmVyZmxvdyB1c2VyIGNhbnZhcy4gVGhlIHJlc3VsdCBpcyB0aGUgaW5zZXQgc2hhZG93XG4gICAgICAvLyB0aGF0IHdlJ3JlIGFmdGVyLlxuICAgICAgZHJhd0ltYWdlLmFwcGx5KGN0eCwgW2NhbnZhcywgLWJ1ZmZlciwgLWJ1ZmZlcl0pO1xuXG4gICAgICAvLyBQZXJmb3JtIHRoZSBhY3R1YWwgZHJhdyBvcGVyYXRpb24gdGhhdCB0aGUgdXNlciByZXF1ZXN0ZWQuXG4gICAgICBvcmlnaW5hbC5hcHBseSh1c2VyQ3R4LCBhcmdzKTtcblxuICAgICAgLy8gQ29tcG9zaXRlIHRoZSBzaGFkb3cgZnJvbSB0aGUgaGlkZGVuIGNhbnZhcyBvbnRvIHRoZSB1c2VyIGNhbnZhcy5cbiAgICAgIGRyYXdJbWFnZS5hcHBseSh1c2VyQ3R4LCBbXG4gICAgICAgIGNhbnZhcyxcbiAgICAgICAgYnVmZmVyLFxuICAgICAgICBidWZmZXIsXG4gICAgICAgIHVzZXJDYW52YXMud2lkdGgsXG4gICAgICAgIHVzZXJDYW52YXMuaGVpZ2h0LFxuICAgICAgICAwLFxuICAgICAgICAwLFxuICAgICAgICB1c2VyQ2FudmFzLndpZHRoLFxuICAgICAgICB1c2VyQ2FudmFzLmhlaWdodFxuICAgICAgXSk7XG5cbiAgICAgIC8vIENsZWFyIGhpZGRlbiBjYW52YXMuXG4gICAgICAvLyBjdHguY2xlYXJSZWN0KC1idWZmZXIsIC1idWZmZXIsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG5cbiAgICAgIC8vIFJlLWFwcGx5IHNoYWRvd3MgYmFjayB0byB1c2VyIGNhbnZhcywgYW5kIHJlbW92ZSBzaGFkb3dzIGZyb21cbiAgICAgIC8vIGhpZGRlbiBjYW52YXMuXG4gICAgICBzd2FwU2hhZG93cyhjdHgsIHVzZXJDdHgpO1xuICAgIH0pO1xuICB9KTtcblxuICAvLyBSZXNldCBzaXplIG9mIGRlc3RDYW52YXMgdG8gbWF0Y2ggc3JjQ2FudmFzLCB3aXRoIGEgYnVmZmVyIGFyb3VuZCB0aGUgZWRnZS5cbiAgZnVuY3Rpb24gcmVzZXRTaXplKGRlc3RDYW52YXMsIHNyY0NhbnZhcywgYnVmZmVyKSB7XG4gICAgdmFyIG5ld1dpZHRoID0gc3JjQ2FudmFzLndpZHRoICsgMiAqIGJ1ZmZlcjtcbiAgICB2YXIgbmV3SGVpZ2h0ID0gc3JjQ2FudmFzLmhlaWdodCArIDIgKiBidWZmZXI7XG4gICAgdmFyIG5ld1NpemUgPVxuICAgICAgZGVzdENhbnZhcy53aWR0aCAhPT0gbmV3V2lkdGggfHwgZGVzdENhbnZhcy5oZWlnaHQgIT09IG5ld0hlaWdodDtcblxuICAgIGlmIChuZXdTaXplKSB7XG4gICAgICBpZiAoZGVzdENhbnZhcy53aWR0aCAhPT0gbmV3V2lkdGgpIGRlc3RDYW52YXMud2lkdGggPSBuZXdXaWR0aDtcbiAgICAgIGlmIChkZXN0Q2FudmFzLmhlaWdodCAhPT0gbmV3SGVpZ2h0KSBkZXN0Q2FudmFzLmhlaWdodCA9IG5ld0hlaWdodDtcbiAgICAgIGRlc3RDYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpLnRyYW5zbGF0ZShidWZmZXIsIGJ1ZmZlcik7XG4gICAgfVxuICB9XG5cbiAgY29uc3Qgc2hhZG93UHJvcHMgPSBbXG4gICAgXCJzaGFkb3dCbHVyXCIsXG4gICAgXCJzaGFkb3dPZmZzZXRYXCIsXG4gICAgXCJzaGFkb3dPZmZzZXRZXCIsXG4gICAgXCJzaGFkb3dDb2xvclwiXG4gIF07XG5cbiAgLy8gU3dhcCBzaGFkb3cgcHJvcGVydGllcyBvZiBjdHgxIGFuZCBjdHgyLlxuICBmdW5jdGlvbiBzd2FwU2hhZG93cyhjdHgxLCBjdHgyKSB7XG4gICAgc2hhZG93UHJvcHMuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgIC8vIFN3YXAgcHJvcCFcbiAgICAgIHZhciBwcm9wMSA9IGN0eDFbcHJvcF07XG4gICAgICBjdHgxW3Byb3BdID0gY3R4Mltwcm9wXTtcbiAgICAgIGN0eDJbcHJvcF0gPSBwcm9wMTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFJldHVybnMgYW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIHNoYWRvdyBwcm9wZXJ0aWVzIGZvciBhIENvbnRleHQuIFRoaXNcbiAgLy8gc2hvdWxkIG1haW5seSBiZSB1c2VkIHdpdGggXCJzZXRTaGFkb3dzKClcIi5cbiAgZnVuY3Rpb24gZ2V0U2hhZG93cyhjdHgpIHtcbiAgICB2YXIgc2hhZG93cyA9IHt9O1xuICAgIHNoYWRvd1Byb3BzLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICBzaGFkb3dzW3Byb3BdID0gY3R4W3Byb3BdO1xuICAgIH0pO1xuICAgIHJldHVybiBzaGFkb3dzO1xuICB9XG5cbiAgLy8gQXBwbGllcyB0aGUgc3BlY2lmaWVkIHNoYWRvdyBwcm9wZXJ0aWVzIHRvIGEgQ29udGV4dC5cbiAgZnVuY3Rpb24gc2V0U2hhZG93cyhjdHgsIHNoYWRvd3MpIHtcbiAgICBzaGFkb3dQcm9wcy5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgY3R4W3Byb3BdID0gc2hhZG93c1twcm9wXTtcbiAgICB9KTtcbiAgfVxufTtcblxuLy8gT25seSBkbyBpbml0aWFsaXphdGlvbiBvbmNlLlxuaWYgKHR5cGVvZiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQucHJvdG90eXBlLnNoYWRvd0luc2V0ID09PSBcInVuZGVmaW5lZFwiKSB7XG4gIGluc2V0KCk7XG59XG5cbi8vIE5vIGV4cG9ydCwgc2lkZS1lZmZlY3Qgb25seS5cbiJdLCJuYW1lcyI6WyJpbnNldCIsIm1hcCIsIldlYWtNYXAiLCJwcm90b3R5cGUiLCJDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQiLCJmaWxsUmVjdCIsImRyYXdJbWFnZSIsImZpbGxGdW5jdGlvbnMiLCJwYXNzVGhyb3VnaEZ1bmN0aW9ucyIsImdldEhpZGRlbkNhbnZhcyIsInVzZXJDYW52YXMiLCJoaWRkZW5DYW52YXMiLCJoYXMiLCJnZXQiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJib2R5IiwiYXBwZW5kQ2hpbGQiLCJzZXQiLCJvdmVycmlkZUlmSW5zZXQiLCJtZXRob2ROYW1lIiwiY2FsbGJhY2siLCJvcmlnaW5hbCIsInNoYWRvd0luc2V0IiwiYXJndW1lbnRzIiwiYXBwbHkiLCJmb3JFYWNoIiwiZnVuYyIsInVzZXJDdHgiLCJhcmdzIiwiY2FudmFzIiwiY3R4IiwiZ2V0Q29udGV4dCIsImJ1ZmZlciIsIk1hdGgiLCJtYXgiLCJ3aWR0aCIsImhlaWdodCIsImdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiIsImZpbGxTdHlsZSIsInVzZXJDdHhTaGFkb3dzIiwiZ2V0U2hhZG93cyIsIm5vU2hhZG93cyIsInJlc2V0U2l6ZSIsImRlc3RDYW52YXMiLCJzcmNDYW52YXMiLCJuZXdXaWR0aCIsIm5ld0hlaWdodCIsIm5ld1NpemUiLCJ0cmFuc2xhdGUiLCJzaGFkb3dQcm9wcyIsInN3YXBTaGFkb3dzIiwiY3R4MSIsImN0eDIiLCJwcm9wMSIsInByb3AiLCJzaGFkb3dzIl0sIm1hcHBpbmdz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
