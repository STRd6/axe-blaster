global.require = require
global.PACKAGE = PACKAGE

styleNode = document.createElement("style")
styleNode.innerHTML = require('./style')
document.head.appendChild(styleNode)

{width, height, name} = require "./pixie"

PIXI.loader.add([
  "https://2.pixiecdn.com/sprites/137922/original.png?1"
]).load ->
  texture = PIXI.loader.resources["https://2.pixiecdn.com/sprites/137922/original.png?1"].texture
  sprite = new PIXI.Sprite(texture)

  renderer = PIXI.autoDetectRenderer width, height,
    antialias: false
    transparent: false
    resolution: 1

  document.body.appendChild(renderer.view)

  # Create a container object called the `stage`
  stage = new PIXI.Container()
  stage.addChild(sprite)

  # Tell the `renderer` to `render` the `stage`
  renderer.render(stage)
