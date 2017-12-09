styleNode = document.createElement("style")
styleNode.innerHTML = require('./style')
document.head.appendChild(styleNode)

# FPS Display
Stats = require "./lib/stats.min"
global.stats = new Stats
document.body.appendChild stats.dom

# Extend PIXI points with a decent default toString
{ObservablePoint, Point, Rectangle} = PIXI
pointToString = ->
  "#{@x}, #{@y}"
ObservablePoint::toString = pointToString
Point::toString = pointToString

Rectangle::toString = ->
  "#{@x},#{@y},#{@width},#{@height}"

# Add resource type mappings
{Resource} = PIXI.loaders
Resource._xhrTypeMap['fxx'] = Resource.XHR_RESPONSE_TYPE.BUFFER

# Math extensions
{min, max} = Math
Math.clamp = (number, lower, upper) ->
  max(min(number, upper), lower)

# Global audio player
global.audio = require "./lib/audio-player"
