{Point, Rectangle, Sprite} = PIXI

{abs, sign} = Math

module.exports = (texture) ->
  player = new Sprite(texture)

  {position} = player

  bounds = new Rectangle
  residual = new Point
  velocity = new Point

  gravity = 3600

  player.x = 256
  player.y = 256

  player.scale.set(0.5)
  player.anchor.set(0.5)

  player.update = (dt, collisionGeometry) ->
    # gravity
    velocity.y += gravity * dt

    dx = velocity.x * dt
    dy = velocity.y * dt

    # Update bounds
    bounds.x = player.x - player.width/2
    bounds.y = player.y - player.height/2
    bounds.width = player.width
    bounds.height = player.height

    # Check Collisions one pixel at a time
    #TODO Reduce the # of calls to collides
    signX = sign(dx)
    n = abs(dx|0)
    while n > 0
      n--
      bounds.x += signX

      if !collides(bounds, collisionGeometry)
        player.x += signX
      else
        velocity.x = 0

    #TODO Reduce the # of calls to collides
    signY = sign(dy)
    n = abs(dy|0)
    while n > 0
      n--
      bounds.y += signY

      if !collides(bounds, collisionGeometry)
        player.y += signY
      else
        velocity.y = 0

  Object.assign player, {
    bounds
    velocity
  }

  return player

collide = ->

collides = (bounds, objects) ->
  return false
  # TODO: actual collisions

  i = 0
  length = objects.length

  while i < length
    result = collide(bounds, objects[i].getBounds())
    if result
      return result
