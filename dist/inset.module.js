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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zZXQubW9kdWxlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvaW5zZXQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWVudiBicm93c2VyICovXG5cbmNvbnN0IGluc2V0ID0gKCkgPT4ge1xuICAvLyBFYWNoIHVzZXIgY2FudmFzIHdpbGwgaGF2ZSBpdHMgb3duIGhpZGRlbiBjYW52YXMuXG4gIC8vIFRoaXMgV2Vha01hcCBpcyB0byB0cmFjayB1c2VyIGNhbnZhcyB0byBoaWRkZW4gY2FudmFzLlxuICBjb25zdCBtYXAgPSBuZXcgV2Vha01hcCgpO1xuICBjb25zdCBwcm90b3R5cGUgPSBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQucHJvdG90eXBlO1xuXG4gIC8vIE5lZWRlZCBmb3IgdGhlIGRyYXdpbmcgb2YgdGhlIGluc2V0cy5cbiAgY29uc3QgZmlsbFJlY3QgPSBwcm90b3R5cGUuZmlsbFJlY3Q7XG4gIGNvbnN0IGRyYXdJbWFnZSA9IHByb3RvdHlwZS5kcmF3SW1hZ2U7XG5cbiAgLy8gVGhlc2UgbmVlZCB0byBoYXZlIHRoZSBzaGFkb3cgZmlsbGVkIGluLlxuICBjb25zdCBmaWxsRnVuY3Rpb25zID0gW1wiZmlsbFwiLCBcImZpbGxSZWN0XCIsIFwiZHJhd0ltYWdlXCJdO1xuXG4gIC8vIFRoZXNlIHNob3VsZCBub3QgYmUgZmlsbGVkLCBhbmQgaW5zdGVhZCBqdXN0IGNhbGxlZCBvbiB0aGUgaGlkZGVuIGNhbnZhc1xuICAvLyBkaXJlY3RseS5cbiAgY29uc3QgcGFzc1Rocm91Z2hGdW5jdGlvbnMgPSBbXG4gICAgXCJiZWdpblBhdGhcIixcbiAgICBcImNsb3NlUGF0aFwiLFxuICAgIFwibW92ZVRvXCIsXG4gICAgXCJsaW5lVG9cIixcbiAgICBcImJlemllckN1cnZlVG9cIixcbiAgICBcInF1YWRyYXRpY0N1cnZlVG9cIixcbiAgICBcImFyY1wiLFxuICAgIFwiYXJjVG9cIixcbiAgICBcInJlY3RcIlxuICBdO1xuXG4gIC8vIEdldCB0aGUgY29ycmVzcG9uZGluZyBoaWRkZW4gY2FudmFzIGZvciBzcGVjaWZpZWQgdXNlciBjYW52YXMuXG4gIC8vIFdpbGwgcmV0dXJuIGEgbmV3IGhpZGRlbiBjYW52YXMgaWYgbm9uZSBleGlzdHMuXG4gIGZ1bmN0aW9uIGdldEhpZGRlbkNhbnZhcyh1c2VyQ2FudmFzKSB7XG4gICAgbGV0IGhpZGRlbkNhbnZhcztcbiAgICBpZiAobWFwLmhhcyh1c2VyQ2FudmFzKSkge1xuICAgICAgaGlkZGVuQ2FudmFzID0gbWFwLmdldCh1c2VyQ2FudmFzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaGlkZGVuQ2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaGlkZGVuQ2FudmFzKTtcbiAgICAgIG1hcC5zZXQodXNlckNhbnZhcywgaGlkZGVuQ2FudmFzKTtcbiAgICB9XG4gICAgcmV0dXJuIGhpZGRlbkNhbnZhcztcbiAgfVxuXG4gIC8vIE92ZXJyaWRlIFwibWV0aG9kXCIgdG8gY2FsbCBcImNhbGxiYWNrXCIgaWYgc2hhZG93SW5zZXQgPSB0cnVlLlxuICBmdW5jdGlvbiBvdmVycmlkZUlmSW5zZXQobWV0aG9kTmFtZSwgY2FsbGJhY2spIHtcbiAgICBjb25zdCBvcmlnaW5hbCA9IHByb3RvdHlwZVttZXRob2ROYW1lXTtcblxuICAgIC8vIE1vbmtleSBwYXRjaGluZyEhIVxuICAgIHByb3RvdHlwZVttZXRob2ROYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuc2hhZG93SW5zZXQgPT09IHRydWUpIHtcbiAgICAgICAgY2FsbGJhY2sodGhpcywgb3JpZ2luYWwsIGFyZ3VtZW50cyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvcmlnaW5hbC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvLyBTZXQgbWFya2VyIHByb3BlcnR5IG9uIHByb3RvdHlwZSB0byBjb250cm9sIHdoZXRoZXIgc2hhZG93IGlzIGluc2V0IG9yIG5vdC5cbiAgcHJvdG90eXBlLnNoYWRvd0luc2V0ID0gZmFsc2U7XG5cbiAgLy8gU2V0IHVwIHBhc3MtdGhyb3VnaCBmdW5jdGlvbnMgdGhhdCBqdXN0IHJlLWFwcGx5IHRvIHRoZSBoaWRkZW4gY2FudmFzLlxuICBwYXNzVGhyb3VnaEZ1bmN0aW9ucy5mb3JFYWNoKGZ1bmMgPT4ge1xuICAgIG92ZXJyaWRlSWZJbnNldChmdW5jLCAodXNlckN0eCwgb3JpZ2luYWwsIGFyZ3MpID0+IHtcbiAgICAgIGNvbnN0IHVzZXJDYW52YXMgPSB1c2VyQ3R4LmNhbnZhcztcbiAgICAgIGNvbnN0IGNhbnZhcyA9IGdldEhpZGRlbkNhbnZhcyh1c2VyQ2FudmFzKTtcbiAgICAgIGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG5cbiAgICAgIC8vIFJlc2V0IGNhbnZhcyBzaXplLCBpZiBuZWNlc3NhcnkuXG4gICAgICAvLyBOZWVkIGJ1ZmZlciB0byBtYWtlIHN1cmUgdGhhdCBzaGFwZXMgZHJhd24gcmlnaHQgb24gdGhlIGVkZ2VcbiAgICAgIC8vIHN0aWxsIGhhdmUgc2hhZG93LlxuICAgICAgY29uc3QgYnVmZmVyID0gTWF0aC5tYXgodXNlckNhbnZhcy53aWR0aCwgdXNlckNhbnZhcy5oZWlnaHQpO1xuICAgICAgcmVzZXRTaXplKGNhbnZhcywgdXNlckNhbnZhcywgYnVmZmVyKTtcblxuICAgICAgLy8gQXBwbHkgZnVuY3Rpb24gdG8gb3JpZ2luYWwgYW5kIGhpZGRlbiBjYW52YXNlcy5cbiAgICAgIG9yaWdpbmFsLmFwcGx5KGN0eCwgYXJncyk7XG4gICAgICBvcmlnaW5hbC5hcHBseSh1c2VyQ3R4LCBhcmdzKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgLy8gU2V0IHVwIGZpbGwgZnVuY3Rpb25zIHRvIGFjdHVhbGx5IGRyYXcgdGhlIHNoYWRvdy5cbiAgZmlsbEZ1bmN0aW9ucy5mb3JFYWNoKGZ1bmMgPT4ge1xuICAgIG92ZXJyaWRlSWZJbnNldChmdW5jLCAodXNlckN0eCwgb3JpZ2luYWwsIGFyZ3MpID0+IHtcbiAgICAgIGNvbnN0IHVzZXJDYW52YXMgPSB1c2VyQ3R4LmNhbnZhcztcbiAgICAgIGNvbnN0IGNhbnZhcyA9IGdldEhpZGRlbkNhbnZhcyh1c2VyQ2FudmFzKTtcbiAgICAgIGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG5cbiAgICAgIC8vIFJlc2V0IGNhbnZhcyBzaXplLCBpZiBuZWNlc3NhcnkuXG4gICAgICAvLyBOZWVkIGJ1ZmZlciB0byBtYWtlIHN1cmUgdGhhdCBzaGFwZXMgZHJhd24gcmlnaHQgb24gdGhlIGVkZ2VcbiAgICAgIC8vIHN0aWxsIGhhdmUgc2hhZG93LlxuICAgICAgY29uc3QgYnVmZmVyID0gTWF0aC5tYXgodXNlckNhbnZhcy53aWR0aCwgdXNlckNhbnZhcy5oZWlnaHQpO1xuICAgICAgcmVzZXRTaXplKGNhbnZhcywgdXNlckNhbnZhcywgYnVmZmVyKTtcblxuICAgICAgLy8gUGVyZm9ybSBkcmF3IG9wZXJhdGlvbiBvbiBoaWRkZW4gY2FudmFzLlxuICAgICAgb3JpZ2luYWwuYXBwbHkoY3R4LCBhcmdzKTtcblxuICAgICAgLy8gSW52ZXJ0IGFscGhhIGNoYW5uZWwuXG4gICAgICBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gXCJ4b3JcIjtcbiAgICAgIGN0eC5maWxsU3R5bGUgPSBcImJsYWNrXCI7XG4gICAgICBmaWxsUmVjdC5hcHBseShjdHgsIFstYnVmZmVyLCAtYnVmZmVyLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHRdKTtcblxuICAgICAgY29uc3QgdXNlckN0eFNoYWRvd3MgPSBnZXRTaGFkb3dzKHVzZXJDdHgpO1xuICAgICAgY29uc3Qgbm9TaGFkb3dzID0gZ2V0U2hhZG93cyhjdHgpO1xuXG4gICAgICAvLyBVc2UgdXNlciBjYW52YXMgc2hhZG93cyBvbiBoaWRkZW4gY2FudmFzLCBhbmQgcmVtb3ZlIHNoYWRvd3NcbiAgICAgIC8vIG9uIHVzZXIgY2FudmFzLlxuICAgICAgc3dhcFNoYWRvd3MoY3R4LCB1c2VyQ3R4KTtcblxuICAgICAgLypcblxuICAgICAgTmVlZCB0byBkbyBhbm90aGVyIFhPUiBvZiB0aGUgaW52ZXJ0ZWQgaGlkZGVuIGNhbnZhcy4gQ3VycmVudGx5LCB3ZSByZWx5XG4gICAgICBvbiB0aGUgXCJkcmF3SW1hZ2UuYXBwbHlcIiBiZWxvdywgc2luY2UgdGhhdCBpcyBhbHNvIGRvaW5nIGFuIFhPUi4gSW5zdGVhZCxcbiAgICAgIHdlIHNob3VsZCBzYXZlIHRoZSBpbnZlcnRlZCBoaWRkZW4gY2FudmFzIGltYWdlLCBjbGVhciB0aGUgaGlkZGVuIGNhbnZhcyxcbiAgICAgIGRyYXcgdGhlIGludmVydGVkIHNoYXBlIHdpdGggc2hhZG93IHByb3BzLCB0aGVuIFhPUiB3aXRoIHRoZSBpbnZlcnRlZFxuICAgICAgY2FudmFzIGltYWdlLiBNYXliZT9cblxuICAgICAgKi9cblxuICAgICAgLy8gRHJhdyBpdHNlbGYgYWdhaW4gdXNpbmcgZHJvcC1zaGFkb3cgZmlsdGVyLCBhbGxvd2luZyBidWZmZXIgZm9yXG4gICAgICAvLyBzaGFkb3cgdG8gb3ZlcmZsb3cgdXNlciBjYW52YXMuIFRoZSByZXN1bHQgaXMgdGhlIGluc2V0IHNoYWRvd1xuICAgICAgLy8gdGhhdCB3ZSdyZSBhZnRlci5cbiAgICAgIGRyYXdJbWFnZS5hcHBseShjdHgsIFtjYW52YXMsIC1idWZmZXIsIC1idWZmZXJdKTtcblxuICAgICAgLy8gUGVyZm9ybSB0aGUgYWN0dWFsIGRyYXcgb3BlcmF0aW9uIHRoYXQgdGhlIHVzZXIgcmVxdWVzdGVkLlxuICAgICAgb3JpZ2luYWwuYXBwbHkodXNlckN0eCwgYXJncyk7XG5cbiAgICAgIC8vIENvbXBvc2l0ZSB0aGUgc2hhZG93IGZyb20gdGhlIGhpZGRlbiBjYW52YXMgb250byB0aGUgdXNlciBjYW52YXMuXG4gICAgICBkcmF3SW1hZ2UuYXBwbHkodXNlckN0eCwgW1xuICAgICAgICBjYW52YXMsXG4gICAgICAgIGJ1ZmZlcixcbiAgICAgICAgYnVmZmVyLFxuICAgICAgICB1c2VyQ2FudmFzLndpZHRoLFxuICAgICAgICB1c2VyQ2FudmFzLmhlaWdodCxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgdXNlckNhbnZhcy53aWR0aCxcbiAgICAgICAgdXNlckNhbnZhcy5oZWlnaHRcbiAgICAgIF0pO1xuXG4gICAgICAvLyBDbGVhciBoaWRkZW4gY2FudmFzLlxuICAgICAgLy8gY3R4LmNsZWFyUmVjdCgtYnVmZmVyLCAtYnVmZmVyLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuXG4gICAgICAvLyBSZS1hcHBseSBzaGFkb3dzIGJhY2sgdG8gdXNlciBjYW52YXMsIGFuZCByZW1vdmUgc2hhZG93cyBmcm9tXG4gICAgICAvLyBoaWRkZW4gY2FudmFzLlxuICAgICAgc3dhcFNoYWRvd3MoY3R4LCB1c2VyQ3R4KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgLy8gUmVzZXQgc2l6ZSBvZiBkZXN0Q2FudmFzIHRvIG1hdGNoIHNyY0NhbnZhcywgd2l0aCBhIGJ1ZmZlciBhcm91bmQgdGhlIGVkZ2UuXG4gIGZ1bmN0aW9uIHJlc2V0U2l6ZShkZXN0Q2FudmFzLCBzcmNDYW52YXMsIGJ1ZmZlcikge1xuICAgIHZhciBuZXdXaWR0aCA9IHNyY0NhbnZhcy53aWR0aCArIDIgKiBidWZmZXI7XG4gICAgdmFyIG5ld0hlaWdodCA9IHNyY0NhbnZhcy5oZWlnaHQgKyAyICogYnVmZmVyO1xuICAgIHZhciBuZXdTaXplID1cbiAgICAgIGRlc3RDYW52YXMud2lkdGggIT09IG5ld1dpZHRoIHx8IGRlc3RDYW52YXMuaGVpZ2h0ICE9PSBuZXdIZWlnaHQ7XG5cbiAgICBpZiAobmV3U2l6ZSkge1xuICAgICAgaWYgKGRlc3RDYW52YXMud2lkdGggIT09IG5ld1dpZHRoKSBkZXN0Q2FudmFzLndpZHRoID0gbmV3V2lkdGg7XG4gICAgICBpZiAoZGVzdENhbnZhcy5oZWlnaHQgIT09IG5ld0hlaWdodCkgZGVzdENhbnZhcy5oZWlnaHQgPSBuZXdIZWlnaHQ7XG4gICAgICBkZXN0Q2FudmFzLmdldENvbnRleHQoXCIyZFwiKS50cmFuc2xhdGUoYnVmZmVyLCBidWZmZXIpO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHNoYWRvd1Byb3BzID0gW1xuICAgIFwic2hhZG93Qmx1clwiLFxuICAgIFwic2hhZG93T2Zmc2V0WFwiLFxuICAgIFwic2hhZG93T2Zmc2V0WVwiLFxuICAgIFwic2hhZG93Q29sb3JcIlxuICBdO1xuXG4gIC8vIFN3YXAgc2hhZG93IHByb3BlcnRpZXMgb2YgY3R4MSBhbmQgY3R4Mi5cbiAgZnVuY3Rpb24gc3dhcFNoYWRvd3MoY3R4MSwgY3R4Mikge1xuICAgIHNoYWRvd1Byb3BzLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICAvLyBTd2FwIHByb3AhXG4gICAgICB2YXIgcHJvcDEgPSBjdHgxW3Byb3BdO1xuICAgICAgY3R4MVtwcm9wXSA9IGN0eDJbcHJvcF07XG4gICAgICBjdHgyW3Byb3BdID0gcHJvcDE7XG4gICAgfSk7XG4gIH1cblxuICAvLyBSZXR1cm5zIGFuIG9iamVjdCBjb250YWluaW5nIHRoZSBzaGFkb3cgcHJvcGVydGllcyBmb3IgYSBDb250ZXh0LiBUaGlzXG4gIC8vIHNob3VsZCBtYWlubHkgYmUgdXNlZCB3aXRoIFwic2V0U2hhZG93cygpXCIuXG4gIGZ1bmN0aW9uIGdldFNoYWRvd3MoY3R4KSB7XG4gICAgdmFyIHNoYWRvd3MgPSB7fTtcbiAgICBzaGFkb3dQcm9wcy5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgc2hhZG93c1twcm9wXSA9IGN0eFtwcm9wXTtcbiAgICB9KTtcbiAgICByZXR1cm4gc2hhZG93cztcbiAgfVxuXG4gIC8vIEFwcGxpZXMgdGhlIHNwZWNpZmllZCBzaGFkb3cgcHJvcGVydGllcyB0byBhIENvbnRleHQuXG4gIGZ1bmN0aW9uIHNldFNoYWRvd3MoY3R4LCBzaGFkb3dzKSB7XG4gICAgc2hhZG93UHJvcHMuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgIGN0eFtwcm9wXSA9IHNoYWRvd3NbcHJvcF07XG4gICAgfSk7XG4gIH1cbn07XG5cbi8vIE9ubHkgZG8gaW5pdGlhbGl6YXRpb24gb25jZS5cbmlmICh0eXBlb2YgQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELnByb3RvdHlwZS5zaGFkb3dJbnNldCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICBpbnNldCgpO1xufVxuXG4vLyBObyBleHBvcnQsIHNpZGUtZWZmZWN0IG9ubHkuXG4iXSwibmFtZXMiOlsiaW5zZXQiLCJtYXAiLCJXZWFrTWFwIiwicHJvdG90eXBlIiwiQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEIiwiZmlsbFJlY3QiLCJkcmF3SW1hZ2UiLCJmaWxsRnVuY3Rpb25zIiwicGFzc1Rocm91Z2hGdW5jdGlvbnMiLCJnZXRIaWRkZW5DYW52YXMiLCJ1c2VyQ2FudmFzIiwiaGlkZGVuQ2FudmFzIiwiaGFzIiwiZ2V0IiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiYm9keSIsImFwcGVuZENoaWxkIiwic2V0Iiwib3ZlcnJpZGVJZkluc2V0IiwibWV0aG9kTmFtZSIsImNhbGxiYWNrIiwib3JpZ2luYWwiLCJzaGFkb3dJbnNldCIsImFyZ3VtZW50cyIsImFwcGx5IiwiZm9yRWFjaCIsImZ1bmMiLCJ1c2VyQ3R4IiwiYXJncyIsImNhbnZhcyIsImN0eCIsImdldENvbnRleHQiLCJidWZmZXIiLCJNYXRoIiwibWF4Iiwid2lkdGgiLCJoZWlnaHQiLCJnbG9iYWxDb21wb3NpdGVPcGVyYXRpb24iLCJmaWxsU3R5bGUiLCJ1c2VyQ3R4U2hhZG93cyIsImdldFNoYWRvd3MiLCJub1NoYWRvd3MiLCJyZXNldFNpemUiLCJkZXN0Q2FudmFzIiwic3JjQ2FudmFzIiwibmV3V2lkdGgiLCJuZXdIZWlnaHQiLCJuZXdTaXplIiwidHJhbnNsYXRlIiwic2hhZG93UHJvcHMiLCJzd2FwU2hhZG93cyIsImN0eDEiLCJjdHgyIiwicHJvcDEiLCJwcm9wIiwic2hhZG93cyJdLCJt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
