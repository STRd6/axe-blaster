require "./setup"

# FPS Display
Stats = require "./lib/stats.min"
stats = new Stats
document.body.appendChild stats.dom

MapReader = require "./lib/map-reader"
MapChunk = require "./models/map-chunk"

{width, height, name} = require "./pixie"

tau = 2 * Math.PI

{loader, Container, ObservablePoint, Point, Rectangle, Sprite, Text, Texture} = PIXI

# Extend points with a decent default toString
ObservablePoint::toString = Point::toString = -> 
  "#{@x}, #{@y}"

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
  world = new Container()
  overlay = new Container()

  stage.addChild world
  stage.addChild overlay

  debugText = new Text "test",
    fill: 0xFFFFFF
  overlay.addChild debugText

  chunk = MapChunk loader.resources["sheet"].texture, MapReader(loader.resources.map.texture.baseTexture.source)
  world.addChild chunk

  texture = loader.resources["pika"].texture
  sprite = new Sprite(texture)

  world.addChild(sprite)

  sprite.x = width / 2
  sprite.y = height / 2

  sprite.scale.set(2)
  sprite.anchor.set(0.5)
  sprite.rotation = 0.5 * tau

  # Pan Tool
  do ->
    mouse = renderer.plugins.interaction.mouse
    active = false
    stage.interactive = true

    prev = new Point

    renderer.view.addEventListener "mousedown", (e) ->
      active = true
      prev.copy mouse.global
      console.log "down", mouse.global

    # Attach to document so it doesn't get stuck if the mouse is released outside of the renderer view
    document.addEventListener "mouseup", (e) ->
      active = false
      console.log "up", mouse.global

    # Attach event to document so we can track pans where the cursor is outside of the renderer view
    document.addEventListener "mousemove", (e) ->
      return unless active

      deltaX = mouse.global.x - prev.x
      deltaY = mouse.global.y - prev.y
      prev.copy mouse.global

      # Do the panning
      world.pivot.x -= deltaX / world.scale.x
      world.pivot.y -= deltaY / world.scale.y

    # Zoom
    document.addEventListener "mousewheel", (e) ->
      e.preventDefault()

      deltaZoom = Math.pow 2, (-e.deltaY / Math.abs(e.deltaY))

      # Get previous local
      prevPosition = world.toLocal(mouse.global)

      world.scale.x *= deltaZoom
      world.scale.y *= deltaZoom

      # Prevent it from going beyond the zero :P
      if world.scale.x < 0.125
        world.scale.set 0.125

      if world.scale.x > 8
        world.scale.set 8

      # Zoom in at the mouse position
      newPosition = world.toLocal(mouse.global)
      world.pivot.x -= newPosition.x - prevPosition.x
      world.pivot.y -= newPosition.y - prevPosition.y

  update = ->
    sprite.x += 1

    debugText.text = """
      pivot: #{world.pivot}
      scale: #{world.scale}
    """

  gameLoop = ->
    requestAnimationFrame gameLoop

    stats.begin()

    update()

    # Tell the `renderer` to `render` the `stage`
    renderer.render stage

    stats.end()

  gameLoop()
