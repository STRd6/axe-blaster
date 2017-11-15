styleNode = document.createElement("style")
styleNode.innerHTML = require('./style')
document.head.appendChild(styleNode)

# Extend PIXI points with a decent default toString
{ObservablePoint, Point} = PIXI
pointToString = -> 
  "#{@x}, #{@y}"
ObservablePoint::toString = pointToString
Point::toString = pointToString
