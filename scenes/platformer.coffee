{width, height} = require "../pixie"

{Container, Graphics, Point} = PIXI

MapReader = require "../lib/map-reader"
MapChunk = require "../models/map-chunk"
Player = require "../models/player"
Panzoom = require "../lib/panzoom"

loader = new PIXI.loaders.Loader

module.exports = (renderer) ->
  # Create a container object called the `stage`
  stage = new Container()
  world = new Container() # Panable and zoomable game area
  overlay = new Container() # UI and fixed position things

  player = null
  chunk = null

  Panzoom(renderer, world)

  stage.addChild world
  stage.addChild overlay

  worldCursor = new Graphics()
  worldCursor.lineStyle 5, 0x00FF00
  worldCursor.drawRect 0, 0, 32, 32
  worldCursor.alpha = 0.5

  world.addChild worldCursor

  viewToWorld = (x, y) ->
    new Point x / world.scale.x + world.pivot.x, y / world.scale.y + world.pivot.y

  renderer.view.addEventListener 'mousedown', (e) ->
    {top, left} = e.currentTarget.getBoundingClientRect()

    x = e.clientX - left
    y = e.clientY - top

    console.log x, y

    {x, y} = viewToWorld(x, y)

    console.log x, y
    
    tileX = Math.floor(x / 32)
    tileY = Math.floor(y / 32)

    worldCursor.x = tileX * 32
    worldCursor.y = tileY * 32

    chunk?.addTile tileX, tileY

  loader.add([
    {name: "pika", url: "https://2.pixiecdn.com/sprites/137922/original.png?1"}
    {name: "sheet", url: "https://danielx.whimsy.space/axe-blaster/platformertiles.png"}
    {name: "map", url: "https://danielx.whimsy.space/axe-blaster/map.png"}
    {name: "theme", url: "https://danielx.whimsy.space/axe-blaster/Theme to Red Ice.ogg"}
    {name: "fxx", url: "https://danielx.whimsy.space/axe-blaster/sound.fxx"}
  ])
  .on "progress", ({progress}) ->
    ;# progressElement.value = progress
  .load ->
    chunk = MapChunk loader.resources.sheet.texture, MapReader(loader.resources.map.texture.baseTexture.source)
    world.addChild chunk

    player = Player(loader.resources.pika.texture)
    player.velocity.set(100, -1000)

    # Load FXX Data into global audio player
    audio.loadData loader.resources.fxx.data

    player.on "jump", ->
      audio.play("jump")

    player.on "land", ->
      audio.play("land")

    world.addChild(player)
    # Make sure worldCursor is last
    world.addChild worldCursor

  stage.update = (dt, game) ->
    # Handle player collisions
    # Handle player input
    if player
      player.update(dt, chunk.children)

      # Update camera
      world.pivot.x = player.x - (width / world.scale.x) / 2
      world.pivot.y = player.y - (height / world.scale.y) / 2

      game.debugText """
        pivot: #{world.pivot}
        scale: #{world.scale}

        player.bounds: #{player.bounds}
        player.velocity: #{player.velocity}
      """

  return stage
