{Point, Rectangle, Sprite} = PIXI

{abs, clamp, sign} = Math

{hitTestRectangle2} = require "../lib/util"

{keydown} = require("../lib/keyboard")

module.exports = (texture) ->
  player = new Sprite(texture)

  {position} = player

  bounds = new Rectangle
  residual = new Point
  velocity = new Point

  gravity = 3600 # pixels / s^2
  jumpImpulse = -1000
  movementAcceleration = 900
  airAcceleration = 300

  # Rate at which x velocity slows when on the ground
  groundFriction = 240
  airFriction = 120

  player.x = 256
  player.y = 256

  player.scale.set(0.5)
  player.anchor.set(0.5)

  standing = false

  updateInput = (dt) ->
    movementX = 0

    if keydown("ArrowLeft")
      movementX = -1

    if keydown("ArrowRight")
      movementX = +1

    if keydown("ArrowUp") and standing
      velocity.y = jumpImpulse

    if standing
      acc = movementAcceleration
    else
      acc = airAcceleration

    if movementX is -sign(velocity.x)
      velocity.x += 2 * movementX * acc * dt
    else
      velocity.x += movementX * acc * dt

  player.update = (dt, collisionGeometry) ->
    updateInput(dt)

    if standing
      friction = groundFriction
    else
      friction = airFriction

    velocity.x = approach velocity.x, 0, friction * dt

    # gravity
    velocity.y += gravity * dt

    dx = velocity.x * dt + residual.x
    dy = velocity.y * dt + residual.y

    # This is the 'global' bounds and is affected by the scale and offset of the
    # parent container, not really what we want
    # player.getBounds true, bounds

    # This is the bounds 'inside' the sprite and is affected by the scale and anchor
    # of the player, also not what we want
    # player.getLocalBounds bounds

    # Therefore we get the bounds ourself, the player's position within the 'world'
    # without being affected by any pan and zoom the camera has applied

    # Update bounds
    bounds.x = player.x
    bounds.y = player.y
    bounds.width = player.width
    bounds.height = player.height

    # Check Collisions one pixel at a time
    # Carry residual over into next frame
    signX = sign(dx)
    residual.x = dx - (dx|0)
    n = abs(dx|0)
    while n > 0
      n--
      bounds.x += signX

      if !collides(bounds, collisionGeometry)
        player.x += signX
      else
        velocity.x = 0
        residual.x = 0

    # Reset to existing bounds
    bounds.x = player.x

    signY = sign(dy)
    residual.y = dy - (dy|0)
    n = abs(dy|0)
    while n > 0
      n--
      bounds.y += signY

      if !collides(bounds, collisionGeometry)
        player.y += signY
      else
        velocity.y = 0
        residual.y = 0

    # Check for floor beneath
    bounds.y = player.y + 1
    standing = collides(bounds, collisionGeometry)

  Object.assign player, {
    bounds
    velocity
  }

  return player

getTileBounds = (tile, rect) ->
  rect.x = tile.x + tile.width/2
  rect.y = tile.y + tile.height/2
  rect.width = tile.width
  rect.height = tile.height

  return rect

testRect = new Rectangle

collides = (bounds, objects) ->
  i = 0
  length = objects.length

  while i < length
    result = hitTestRectangle2(bounds, getTileBounds(objects[i], testRect))
    if result
      return result
    i += 1

approach = (value, target, maxDelta) ->
  value + clamp(target - value, -maxDelta, maxDelta)
