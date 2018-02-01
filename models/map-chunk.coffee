{Container, Sprite, Text, Texture, Rectangle} = PIXI

{hitTestRectangle} = require "../lib/util"

TILE_WIDTH = TILE_HEIGHT = 32

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

getAutoTileIndex = (x, y, {width, height, data}) ->
  neighbors.reduce (acc, [dx, dy], n) ->
    m = Math.pow(2, n)

    px = x + dx
    py = y + dy

    if (0 <= px < width) and (0 <= py < height)
      acc + data[py * width + px] * m
    else
      acc + m
  , 0

# We're assuming that i has been checked for the correct width, height bounds
getAutoTileTexture = (x, y, mapData, tileTextures) ->
  index = getAutoTileIndex(x, y, mapData)

  tileTextures[index] or tileTextures[0]

module.exports = (texture, mapData) ->
  tileTextures = autoTileIndexes.map ([x, y, rotate]) ->
    rect = new Rectangle(TILE_WIDTH * x, TILE_HEIGHT * y, TILE_WIDTH, TILE_HEIGHT)

    new Texture(texture, rect, null, null, rotate)

  container = new Container

  {data, width, height} = mapData

  data.forEach (value, i) ->
    x = i % width
    y = (i / width)|0

    if value
      tex = getAutoTileTexture(x, y, mapData, tileTextures)

      block = new Sprite(tex)
      block.x = x * TILE_WIDTH
      block.y = y * TILE_HEIGHT
      container.addChild(block)

      # debug tile index
      # block.addChild new Text(tIndex, fill: "#FFF")

  addTile = (x, y) ->
    return unless 0 <= x < width
    return unless 0 <= y < height

    i = x + y * width

    # Don't add if already present
    return if mapData.data[i]

    # Update map data with added tile
    mapData.data[i] = true

    tex = getAutoTileTexture(x, y, mapData, tileTextures)

    block = new Sprite(tex)
    block.x = x * TILE_WIDTH
    block.y = y * TILE_HEIGHT

    rect = new Rectangle block.x - 1, block.y - 1, block.width + 2, block.height + 2
    # Update nearby tiles with correct auto-tile texture
    container.children.forEach (child) ->
      if hitTestRectangle(rect, child)
        child.texture = getAutoTileTexture(child.x / TILE_WIDTH, child.y / TILE_HEIGHT, mapData, tileTextures)

    container.addChild(block)

  container.addTile = addTile

  return container
