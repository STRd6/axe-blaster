###
Create the renderer and game loop.
Append stats and things to the dom

Calls the active scene's update method and renders it in the PIXI renderer.
###

{loader, Container, Point, Rectangle, Sprite, Text, Texture} = PIXI

# Scenes are PIXI.Containers extended with an update method
nullScene = new Container
nullScene.update = ->

module.exports = ({width, height}) ->
  renderer = PIXI.autoDetectRenderer width, height,
    antialias: false
    transparent: false
    resolution: 1

  contentElement = document.createElement "content"

  debugText = document.createElement "pre"
  debugText.classList.add "debug"
  contentElement.appendChild debugText

  contentElement.appendChild(renderer.view)

  activeScene = nullScene
  nextScene = activeScene

  self =
    element: contentElement
    renderer: renderer
    setScene: (scene) ->
      nextScene = scene
    debugText: (text) ->
      debugText.textContent = text

  # Start the game loop, updating and rendering the activeScene every frame
  dt = 1 / 60
  gameLoop = ->
    requestAnimationFrame gameLoop

    stats.begin()

    # Need to switch scenes at frame transition to prevent rendering the new
    # secene before it updates
    if nextScene != activeScene
      activeScene.emit("exit")
      activeScene = nextScene
      activeScene.emit("enter")

    activeScene.update(dt, self)
    # Tell the `renderer` to `render` the `stage`
    renderer.render activeScene

    stats.end()

  gameLoop()

  return self
