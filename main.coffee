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
# game.setScene introScene
game.setScene platformerScene

introScene.on "complete", ->
  game.setScene platformerScene

SystemClient = require "system-client"
{system, application} = SystemClient()

system.ready()
.then ->
  application.observeSignal "fxx", (value) ->
    console.log "obsv", value
    audio.loadData value
.catch ->
