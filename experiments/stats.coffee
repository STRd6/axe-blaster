# Experiment to see null-update fps for a baseline

Stats = require "../lib/stats.min"
stats = new Stats
document.body.appendChild stats.dom

gameLoop = ->
  requestAnimationFrame gameLoop

  stats.begin()
  stats.end()

gameLoop()
