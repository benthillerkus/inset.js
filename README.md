# Inset.js

[![Standard JavaScript Style](https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat-square)](http://standardjs.com/)

Inset shadows for HTML's `<canvas>` element.

Currently supports inset shadows on shapes draw with `fillRect`, or shapes draw using the path functions (`beginPath`, `moveTo`, `lineTo`, `arc`, `arcTo`, etc.) and then `fill`.

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

## Example

http://codepen.io/patlillis/pen/vxaery

## Testing

Tests are performed using [Mocha](https://mochajs.org/), along with a little help from the excellent [imagediff](https://github.com/HumbleSoftware/js-imagediff) library. Since this project relies on the browser-based `Canvas` API, tests are run in a browser-like environment.

To run tests locally, first clone this repo and install all the necessary NPM packages.

```bash
git clone https://github.com/patlillis/inset
cd inset
npm install
```

### Command line

Command line tests are performed using [PhantomJS](http://phantomjs.org/) (hooked into Mocha with [phantom-js-core](https://github.com/nathanboktae/mocha-phantomjs-core)). Once you have run `npm install`, it should be as simple as

```bash
npm test
```

Test results will be displayed in the terminal.

### Manual

To run the tests yourself manually in a browser, open your local copy of
[manual.html](test/manual.html) in your favorite browser of choice.

Test results will be displayed in a lovely interactive UI using Mocha's [HTML](https://mochajs.org/#html) reporter. As a bonus, it will also display image diffs of all Canvas tests.

## License

MIT. © 2017 Pat Lillis

[![Built With Love](http://forthebadge.com/images/badges/built-with-love.svg)](http://forthebadge.com)
