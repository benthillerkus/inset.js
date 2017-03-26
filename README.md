# Inset.js

[![Standard JavaScript Style](https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat-square)](http://standardjs.com/)

Inset shadows for HTML's `<canvas>` element.

## Usage

Simply set 

```javascript
ctx.shadowInset = true;
```

and then draw a shape as you normally would. For example:

```javascript
var c = document.getElementById('canvas');
var ctx = c.getContext('2d');

ctx.shadowInset = true;
ctx.shadowBlur = 15;
ctx.shadowColor = 'black';

ctx.fillStyle = 'red';
ctx.fillRect(0, 0, c.width, c.height);
```

## Caveat

Currently, only `fillRect` is supported. Support for other methods on `CanvasRenderingContext2D` is planned, and coming soon. Stay tuned!

## Example

http://codepen.io/patlillis/pen/vxaery

## License

MIT. © 2017 Pat Lillis

[![Built With Love](http://forthebadge.com/images/badges/built-with-love.svg)](http://forthebadge.com)
