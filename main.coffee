require "./setup"

Game = require "./models/game"

Intro = require "./scenes/intro"
Platformer = require "./scenes/platformer"

{width, height} = require "./pixie"

game = Game
  width: width
  height: height

document.body.appendChild game.element

introScene = Intro()

platformerScene = Platformer(game.renderer)
game.setScene introScene

introScene.on "complete", ->
  game.setScene platformerScene
