{Container, Sprite, Texture, Rectangle} = PIXI

module.exports = (texture, mapData) ->
  blockTexture = new Texture(texture, new Rectangle(32, 32, 32, 32))

  container = new Container

  (({data, width, height}) ->
    data.forEach (value, i) ->
      x = i % width
      y = (i / width)|0

      if value
        block = new Sprite(blockTexture)
        block.x = x * 32
        block.y = y * 32
        container.addChild(block)
  )(mapData)

  return container
