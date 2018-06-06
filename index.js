'use strict'
const assert = require('assert')
const pretty = require('pretty')

function HtmlWebpackPrettyPlugin(options) {
  this.name = 'HtmlWebpackPrettyPlugin'
  assert.equal(options, undefined, `${this.name} does not accept options`)
}

HtmlWebpackPrettyPlugin.prototype.pretty = function(htmlPluginData, callback) {
  const options = htmlPluginData.plugin.options.pretty || {}
  assert.strictEqual(
    options,
    Object(options),
    'Pretty options must be an object'
  )

  const result = Object.assign(htmlPluginData, {
    html: pretty(htmlPluginData.html, options)
  })

  if (callback) {
    callback(null, result)
    return
  }

  return Promise.resolve(result)
}

HtmlWebpackPrettyPlugin.prototype.apply = function(compiler) {
  if (!compiler.hooks) {
    // Webpack <= 3
    compiler.plugin('compilation', this.applyCompilation.bind(this))
    return
  }

  // Webpack 4
  compiler.hooks.compilation.tap(this.name, this.applyCompilation.bind(this))
}

HtmlWebpackPrettyPlugin.prototype.applyCompilation = function(compilation) {
  if (!compilation.hooks) {
    // Webpack <= 3
    compilation.plugin(
      'html-webpack-plugin-after-html-processing',
      this.pretty.bind(this)
    )
    return
  }

  if (!compilation.hooks.htmlWebpackPluginAfterHtmlProcessing) {
    throw new Error(
      `HtmlWebpackPlugin must be installed and initialized before ${this.name}.`
    )
  }

  // Webpack 4
  compilation.hooks.htmlWebpackPluginAfterHtmlProcessing.tapAsync(
    this.name,
    this.pretty.bind(this)
  )
}

module.exports = HtmlWebpackPrettyPlugin
