###
An intro that presents the following title cards:

- Whimsy.Space Games

- in association with
  Daniel X. Moore

###

{width, height} = require "../pixie"

{Container, Graphics, Point, Rectangle, Sprite, Text, Texture} = PIXI

loader = new PIXI.loaders.Loader

{min, max} = Math

stage = new Container()

whiteBg = new Graphics()
whiteBg.beginFill 0xFFFFFF
whiteBg.drawRect 100, 100, width, height
stage.addChild whiteBg

# Fade to black bg
bg = new Graphics()
bg.beginFill 0x000000
bg.drawRect 0, 0, width, height
bg.alpha = 0
stage.addChild bg

toLetters = (letters) ->
  letters.split("").map (letter) ->
    new Text letter,
      align: "center"
      fill: "black"
      fontSize: "128px"
      fontFamily: "courier"

letterSprites = toLetters("Whimsy.Space").map (text, i) ->
  shift = (i * 5 + 5) % 12 - 128
  text.x = (i + 3) * width / 18
  text.y = height / 2 + shift
  text.visible = true

  stage.addChild text

  return text
.concat toLetters("Games").map (text, i) ->
  shift = ((i * 5 + 7)) % 12
  text.x = (i + 6.5) * width / 18
  text.y = height / 2 + shift
  text.visible = true

  stage.addChild text

  return text

# In Association With
assocText = do ->
  text = new Text "in association with\n\nDANIEL X. MOORE",
    align: "center"
    fill: "white"
    fontFamily: "helvetica"
    fontSize: "64px"
    fontStyle: "bold italic"

  text.alpha = 0
  text.anchor.set 0.5
  text.x = width / 2
  text.y = height / 2

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
  1.747
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

module.exports = ->
  stage.update = (dt) ->
    if loaded and t is 0 # First update after loading
      loader.resources.typing.data.play()

    if t >= 10
      stage.emit('complete')

    letterSprites.forEach (letter, i) ->
      letter.visible = t > timings[i]

    bg.alpha = max((t - 5.25)/0.875, 0)
    assocText.alpha = max((t - 6.5)/0.875, 0)

    if t > 8.375
      assocText.alpha = 1 - max((t - 8.375)/0.875, 0)

    if loaded
      t += dt

  dt = 1 / 60
  t = 0
  loaded = false

  loader.add([
    {name: "typing", url: "https://danielx.whimsy.space/axe-blaster/type.ogg"}
  ])
  .load ->
    loaded = true

  return stage
