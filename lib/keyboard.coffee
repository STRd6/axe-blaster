# Keyboard event handling to answer the simple question: is this key down?

module.exports = do ->
  down = {}

  window.addEventListener "keydown", ({key}) ->
    console.log "down", key
    down[key] = true
  window.addEventListener "keyup", ({key}) ->
    console.log "up", key
    down[key] = false

  keydown: (name) ->
    down[name]
