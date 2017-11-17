{Container, Sprite, Text, Texture, Rectangle} = PIXI

autoTileIndexes = [
  [1, 1]
  [4, 2]
  [4, 0, 2]
  [0, 2]
  [4, 0]
  [4, 1]
  [0, 0]
  [0, 1]
  [4, 2, 2] # 8
  [2, 2]
  [4, 1, 2]
  [1, 2]
  [2, 0] # 12
  [2, 1]
  [1, 0]
  [1, 1]
]

neighbors = [
  [0, -1]
  [1, 0]
  [0, 1]
  [-1, 0]
]

getAutoTileIndex = (index, {width, height, data}) ->
  x = index % width
  y = (index / width)|0
  
  neighbors.reduce (acc, [dx, dy], n) ->
    m = Math.pow(2, n)

    px = x + dx
    py = y + dy

    if (0 <= px < width) and (0 <= py < height)
      acc + data[py * width + px] * m
    else
      acc + m
  , 0

module.exports = (texture, mapData) ->
  tileTextures = autoTileIndexes.map ([x, y, rotate]) ->
    new Texture(texture, new Rectangle(32 * x, 32 * y, 32, 32), null, null, rotate)

  defaultTexture = tileTextures[0]

  container = new Container

  (({data, width, height}) ->
    data.forEach (value, i) ->
      x = i % width
      y = (i / width)|0

      if value
        tIndex = getAutoTileIndex(i, mapData)
        tex = tileTextures[tIndex] or defaultTexture
        block = new Sprite(tex)
        block.x = x * 32
        block.y = y * 32
        container.addChild(block)

        # debug tile index
        # block.addChild new Text(tIndex, fill: "#FFF")
  )(mapData)

  return container
