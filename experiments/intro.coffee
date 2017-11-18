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

toLetters = (letters) ->
  letters.split("").map (letter) ->
    new Text letter,
      align: "center"
      fill: "black"
      fontSize: "128px"
      fontFamily: "courier"

letterSprites = toLetters("Whimsy.Space").map (text, i) ->
  shift = ((i * 3 + 37)) % 12 - 128
  text.x = (i + 3) * width / 18
  text.y = height / 2 + shift
  text.visible = true

  stage.addChild text

  return text
.concat toLetters("Games").map (text, i) ->
  shift = ((i * 3 + 37)) % 12
  text.x = (i + 6.5) * width / 18
  text.y = height / 2 + shift
  text.visible = true

  stage.addChild text

  return text

timings = [
  0.063
  0.189
  0.333
  0.578
  0.817
  1.091
  1.448
  1.747 # [7]
  1.925
  2.131
  2.308
  2.472
  3.765
  3.998
  4.153
  4.330
  4.728
]

global.letterSprites = letterSprites

dt = 1 / 60
t = 0
loaded = false
gameLoop = ->
  requestAnimationFrame gameLoop

  letterSprites.forEach (letter, i) ->
    letter.visible = t > timings[i]

  # Tell the `renderer` to `render` the `stage`
  renderer.render stage

  if loaded
    t += dt

gameLoop()

loader.add([
  {name: "typing", url: "https://danielx.whimsy.space/axe-blaster/type.ogg"}
])
.load ->
  loaded = true
  loader.resources.typing.data.play()
