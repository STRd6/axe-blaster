{Point} = PIXI

###
Pan with middle click and Zoom with mouse wheel.

The renderer tracks mouse interactions, though we also need to attach some
events on the document so we scroll smoothly and detect releases when the mouse
moves outside of the renderer element.

The pan and zoom is accomplished by transforming the scale and pivot of a
given container so that it can be panned and zoomed independently of any
UI/Overlay objects.
###
module.exports = (renderer, world) ->
  mouse = renderer.plugins.interaction.mouse
  active = false

  prev = new Point

  renderer.view.addEventListener "mousedown", (e) ->
    return unless e.button is 1

    active = true
    prev.copy mouse.global

  # Attach to document so it doesn't get stuck if the mouse is released outside of the renderer view
  document.addEventListener "mouseup", (e) ->
    return unless e.button is 1
    active = false

  # Attach event to document so we can track pans where the cursor is outside of the renderer view
  document.addEventListener "mousemove", (e) ->
    return unless active

    deltaX = mouse.global.x - prev.x
    deltaY = mouse.global.y - prev.y
    prev.copy mouse.global

    # Do the panning
    world.pivot.x -= deltaX / world.scale.x
    world.pivot.y -= deltaY / world.scale.y

  renderer.view.addEventListener "mousewheel", (e) ->
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
