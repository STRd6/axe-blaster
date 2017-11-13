global.require = require
global.PACKAGE = PACKAGE

styleNode = document.createElement("style")
styleNode.innerHTML = require('./style')
document.head.appendChild(styleNode)

Stats = require "./lib/stats.min"
stats = new Stats
document.body.appendChild stats.dom

MapReader = require "./lib/map-reader"

{width, height, name} = require "./pixie"

tau = 2 * Math.PI

{loader, Container, Rectangle, Sprite, Texture} = PIXI

loader.add([
  {name: "pika", url: "https://2.pixiecdn.com/sprites/137922/original.png?1"}
  {name: "sheet", url: "https://danielx.whimsy.space/axe-blaster/platformertiles.png"}
  {name: "map", url: "https://danielx.whimsy.space/axe-blaster/map.png"}
]).load ->
  renderer = PIXI.autoDetectRenderer width, height,
    antialias: false
    transparent: false
    resolution: 1

  document.body.appendChild(renderer.view)

  # Create a container object called the `stage`
  stage = new Container()

  blockTexture = new Texture(loader.resources["sheet"].texture, new Rectangle(32, 32, 32, 32))

  mapData = MapReader(loader.resources.map.texture.baseTexture.source)
  (({data, width, height}) ->
    data.forEach (value, i) ->
      x = i % width
      y = (i / width)|0

      if value
        block = new Sprite(blockTexture)
        block.x = x * 32
        block.y = y * 32
        stage.addChild(block)
  )(mapData)

  texture = loader.resources["pika"].texture
  sprite = new Sprite(texture)

  stage.addChild(sprite)

  sprite.x = width / 2
  sprite.y = height / 2

  sprite.scale.set(2)
  sprite.anchor.set(0.5)
  sprite.rotation = 0.5 * tau

  update = ->
    sprite.x += 1

  gameLoop = ->
    requestAnimationFrame gameLoop

    stats.begin()

    update()
    # Tell the `renderer` to `render` the `stage`
    renderer.render stage

    stats.end()

  gameLoop()
