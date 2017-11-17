styleNode = document.createElement("style")
styleNode.innerHTML = require('./style')
document.head.appendChild(styleNode)

# Extend PIXI points with a decent default toString
{ObservablePoint, Point, Rectangle} = PIXI
pointToString = ->
  "#{@x}, #{@y}"
ObservablePoint::toString = pointToString
Point::toString = pointToString

Rectangle::toString = ->
  "#{@x},#{@y},#{@width},#{@height}"

# Math extensions
{min, max} = Math
Math.clamp = (number, lower, upper) ->
  max(min(number, upper), lower)