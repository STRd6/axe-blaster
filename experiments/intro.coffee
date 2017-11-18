require "../setup"

{width, height, name} = require "../pixie"

{loader, Container, Point, Rectangle, Sprite, Text, Texture} = PIXI

renderer = PIXI.autoDetectRenderer width, height,
  antialias: false
  transparent: false
  resolution: 1

renderer.backgroundColor = 0xFFFFFF

document.body.appendChild renderer.view

stage = new Container()


letterSprites = "Whimsy.Space".split("").map (letter, i) ->
  text = new Text letter,
    align: "center"
    fill: "black"
    fontSize: "128px"
    fontFamily: "courier"

  shift = ((i * 3 + 37)) % 12
  text.x = (i + 3) * width / 18
  text.y = height / 2 + shift
  text.visible = true

  stage.addChild text

  return text

global.letterSprites = letterSprites

dt = 1 / 60
t = 0
loaded = false
gameLoop = ->
  requestAnimationFrame gameLoop

  letterSprites.forEach (letter, i) ->
    letter.visible = i / 4 <= t

  # Tell the `renderer` to `render` the `stage`
  renderer.render stage

  t += dt

gameLoop()

loader.add([
  {name: "typing", url: "https://danielx.whimsy.space/axe-blaster/type.ogg"}
])
.load ->
  loaded = true
  loader.resources.typing.data.play()
