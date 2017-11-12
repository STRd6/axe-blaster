global.require = require
global.PACKAGE = PACKAGE

styleNode = document.createElement("style")
styleNode.innerHTML = require('./style')
document.head.appendChild(styleNode)

{width, height, name} = require "./pixie"

tau = 2 * Math.PI

{loader, Container, Rectangle, Sprite, Texture} = PIXI

loader.add([
  {name: "pika", url: "https://2.pixiecdn.com/sprites/137922/original.png?1"}
  {name: "sheet", url: "https://danielx.whimsy.space/axe-blaster/platformertiles.png"}
]).load ->
  renderer = PIXI.autoDetectRenderer width, height,
    antialias: false
    transparent: false
    resolution: 1

  document.body.appendChild(renderer.view)

  # Create a container object called the `stage`
  stage = new Container()

  blocksTextures = [0, 1, 2].map (n) ->
    t = new Texture(loader.resources["sheet"].texture, new Rectangle(32 * n, 0, 32, 32))

  blocksTextures.forEach (t, n) ->
    block = new Sprite(t)
    stage.addChild(block)
    block.x = 64 + 32 * n
    block.y = 64

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

    update()

    # Tell the `renderer` to `render` the `stage`
    renderer.render stage

  gameLoop()
