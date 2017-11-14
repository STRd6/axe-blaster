module.exports = (source) ->
  # Export 1 bit map data
  {width, height} = source

  canvas = document.createElement "canvas"

  canvas.width = source.width
  canvas.height = source.height

  context = canvas.getContext("2d")
  context.drawImage(source, 0, 0)

  imageData = context.getImageData(0, 0, width, height)

  extract = (data, n) ->
    data[n*4 + 3] && 1 # Only Alpha

  data = new Uint8Array(width * height)

  data.forEach (_, i) ->
    data[i] = extract(imageData.data, i)

  # debug view
  ->
    y = 0
    while y < height
      console.log data.slice(y * 64, (y + 1) * 64).join("")
      y += 1

  width: width
  height: height
  data: data
