{width, height} = require "../pixie"

{Container} = PIXI

MapReader = require "../lib/map-reader"
MapChunk = require "../models/map-chunk"
Player = require "../models/player"
Panzoom = require "../lib/panzoom"

loader = new PIXI.loaders.Loader

playAudio = (audio, volume=1, repeat) ->
  audio.volume = volume
  audio.play()

module.exports = (renderer) ->
  # Create a container object called the `stage`
  stage = new Container()
  world = new Container() # Panable and zoomable game area
  overlay = new Container() # UI and fixed position things

  Panzoom(renderer, world)

  stage.addChild world
  stage.addChild overlay

  player = null
  chunk = null

  loader.add([
    {name: "pika", url: "https://2.pixiecdn.com/sprites/137922/original.png?1"}
    {name: "sheet", url: "https://danielx.whimsy.space/axe-blaster/platformertiles.png"}
    {name: "map", url: "https://danielx.whimsy.space/axe-blaster/map.png"}
    {name: "theme", url: "https://danielx.whimsy.space/axe-blaster/Theme to Red Ice.ogg"}
    {name: "jump", url: "https://danielx.whimsy.space/axe-blaster/jump.wav"}
  ])
  .on "progress", ({progress}) ->
    ;# progressElement.value = progress
  .load ->
    chunk = MapChunk loader.resources.sheet.texture, MapReader(loader.resources.map.texture.baseTexture.source)
    world.addChild chunk

    player = Player(loader.resources.pika.texture)
    player.velocity.set(100, -1000)

    jumpSound = loader.resources.jump.data
    player.on "jump", ->
      if jumpSound.playing
        jumpSound.stop()
      jumpSound.play()

    world.addChild(player)

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
