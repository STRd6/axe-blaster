FXZ = require "fxz"

module.exports = (fxxBuffer, context) ->
  context ?= new AudioContext
  sounds = {}

  parseName = (nameBuffer) ->
    lastNull = nameBuffer.indexOf(0)

    if lastNull >= 0
      nameBuffer = nameBuffer.slice(0, lastNull)

    name = new TextDecoder("utf-8").decode(nameBuffer)

  fxxData = new Uint8Array(fxxBuffer)
  l = fxxData.length

  numEntries = Math.floor (l - 8) / 116

  # Populate data entries
  data = {}
  n = 0
  while n < numEntries
    # Parse Name
    p = n * 116 + 8
    name = parseName fxxData.slice(p, p + 16)

    # Synthesize Waveform
    buffer = fxxData.slice(p + 16, p + 116)
    sounds[name] = FXZ buffer.buffer, context
    n += 1

  play: (name) ->
    audioBuffer = sounds[name]

    node = new AudioBufferSourceNode context,
      buffer: audioBuffer
    node.connect context.destination

    node.start()
