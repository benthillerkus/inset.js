import uglify from 'rollup-plugin-uglify'
import config from './rollup.config.js'

const info = require('./package.json')

config.plugins.push(uglify())
config.targets = [{
  dest: info['browser:main'],
  format: 'iife'
}]

export default config
