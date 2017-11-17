# Keyboard event handling to answer the simple question: is this key down?

module.exports = do ->
  down = {}

  window.addEventListener "keydown", ({key}) ->
    down[key] = true
  window.addEventListener "keyup", ({key}) ->
    down[key] = false

  keydown: (name) ->
    down[name]
