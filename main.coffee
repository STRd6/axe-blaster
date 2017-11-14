require "./setup"

# FPS Display
Stats = require "./lib/stats.min"
stats = new Stats
document.body.appendChild stats.dom

MapReader = require "./lib/map-reader"
MapChunk = require "./models/map-chunk"

{width, height, name} = require "./pixie"

tau = 2 * Math.PI

{loader, Container, Point, Rectangle, Sprite, Texture} = PIXI

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

  chunk = MapChunk loader.resources["sheet"].texture, MapReader(loader.resources.map.texture.baseTexture.source)
  stage.addChild chunk

  texture = loader.resources["pika"].texture
  sprite = new Sprite(texture)

  stage.addChild(sprite)

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
      stage.pivot.x -= deltaX / stage.scale.x
      stage.pivot.y -= deltaY / stage.scale.y

    # Zoom
    document.addEventListener "mousewheel", (e) ->
      e.preventDefault()

      console.log e.deltaY
      deltaZoom = e.deltaY / 1000

      # Get previous local
      prevPosition = stage.toLocal(mouse.global)

      stage.scale.x -= deltaZoom
      stage.scale.y -= deltaZoom

      # Prevent it from going beyond the zero :P
      if stage.scale.x <= 0
        stage.scale.set 0.1

      # Zoom in at the mouse position
      newPosition = stage.toLocal(mouse.global)
      stage.pivot.x -= newPosition.x - prevPosition.x
      stage.pivot.y -= newPosition.y - prevPosition.y

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
