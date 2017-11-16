(function(pkg) {
  (function() {
  var annotateSourceURL, cacheFor, circularGuard, defaultEntryPoint, fileSeparator, generateRequireFn, global, isPackage, loadModule, loadPackage, loadPath, normalizePath, publicAPI, rootModule, startsWith,
    __slice = [].slice;

  fileSeparator = '/';

  global = self;

  defaultEntryPoint = "main";

  circularGuard = {};

  rootModule = {
    path: ""
  };

  loadPath = function(parentModule, pkg, path) {
    var cache, localPath, module, normalizedPath;
    if (startsWith(path, '/')) {
      localPath = [];
    } else {
      localPath = parentModule.path.split(fileSeparator);
    }
    normalizedPath = normalizePath(path, localPath);
    cache = cacheFor(pkg);
    if (module = cache[normalizedPath]) {
      if (module === circularGuard) {
        throw "Circular dependency detected when requiring " + normalizedPath;
      }
    } else {
      cache[normalizedPath] = circularGuard;
      try {
        cache[normalizedPath] = module = loadModule(pkg, normalizedPath);
      } finally {
        if (cache[normalizedPath] === circularGuard) {
          delete cache[normalizedPath];
        }
      }
    }
    return module.exports;
  };

  normalizePath = function(path, base) {
    var piece, result;
    if (base == null) {
      base = [];
    }
    base = base.concat(path.split(fileSeparator));
    result = [];
    while (base.length) {
      switch (piece = base.shift()) {
        case "..":
          result.pop();
          break;
        case "":
        case ".":
          break;
        default:
          result.push(piece);
      }
    }
    return result.join(fileSeparator);
  };

  loadPackage = function(pkg) {
    var path;
    path = pkg.entryPoint || defaultEntryPoint;
    return loadPath(rootModule, pkg, path);
  };

  loadModule = function(pkg, path) {
    var args, content, context, dirname, file, module, program, values;
    if (!(file = pkg.distribution[path])) {
      throw "Could not find file at " + path + " in " + pkg.name;
    }
    if ((content = file.content) == null) {
      throw "Malformed package. No content for file at " + path + " in " + pkg.name;
    }
    program = annotateSourceURL(content, pkg, path);
    dirname = path.split(fileSeparator).slice(0, -1).join(fileSeparator);
    module = {
      path: dirname,
      exports: {}
    };
    context = {
      require: generateRequireFn(pkg, module),
      global: global,
      module: module,
      exports: module.exports,
      PACKAGE: pkg,
      __filename: path,
      __dirname: dirname
    };
    args = Object.keys(context);
    values = args.map(function(name) {
      return context[name];
    });
    Function.apply(null, __slice.call(args).concat([program])).apply(module, values);
    return module;
  };

  isPackage = function(path) {
    if (!(startsWith(path, fileSeparator) || startsWith(path, "." + fileSeparator) || startsWith(path, ".." + fileSeparator))) {
      return path.split(fileSeparator)[0];
    } else {
      return false;
    }
  };

  generateRequireFn = function(pkg, module) {
    var fn;
    if (module == null) {
      module = rootModule;
    }
    if (pkg.name == null) {
      pkg.name = "ROOT";
    }
    if (pkg.scopedName == null) {
      pkg.scopedName = "ROOT";
    }
    fn = function(path) {
      var otherPackage;
      if (typeof path === "object") {
        return loadPackage(path);
      } else if (isPackage(path)) {
        if (!(otherPackage = pkg.dependencies[path])) {
          throw "Package: " + path + " not found.";
        }
        if (otherPackage.name == null) {
          otherPackage.name = path;
        }
        if (otherPackage.scopedName == null) {
          otherPackage.scopedName = "" + pkg.scopedName + ":" + path;
        }
        return loadPackage(otherPackage);
      } else {
        return loadPath(module, pkg, path);
      }
    };
    fn.packageWrapper = publicAPI.packageWrapper;
    fn.executePackageWrapper = publicAPI.executePackageWrapper;
    return fn;
  };

  publicAPI = {
    generateFor: generateRequireFn,
    packageWrapper: function(pkg, code) {
      return ";(function(PACKAGE) {\n  var src = " + (JSON.stringify(PACKAGE.distribution.main.content)) + ";\n  var Require = new Function(\"PACKAGE\", \"return \" + src)({distribution: {main: {content: src}}});\n  var require = Require.generateFor(PACKAGE);\n  " + code + ";\n})(" + (JSON.stringify(pkg, null, 2)) + ");";
    },
    executePackageWrapper: function(pkg) {
      return publicAPI.packageWrapper(pkg, "require('./" + pkg.entryPoint + "')");
    },
    loadPackage: loadPackage
  };

  if (typeof exports !== "undefined" && exports !== null) {
    module.exports = publicAPI;
  } else {
    global.Require = publicAPI;
  }

  startsWith = function(string, prefix) {
    return string.lastIndexOf(prefix, 0) === 0;
  };

  cacheFor = function(pkg) {
    if (pkg.cache) {
      return pkg.cache;
    }
    Object.defineProperty(pkg, "cache", {
      value: {}
    });
    return pkg.cache;
  };

  annotateSourceURL = function(program, pkg, path) {
    return "" + program + "\n//# sourceURL=" + pkg.scopedName + "/" + path;
  };

  return publicAPI;

}).call(this);

  window.require = Require.generateFor(pkg);
})({
  "source": {
    "README.md": {
      "path": "README.md",
      "content": "# axe-blaster\n\nLearning Pixi.js\n\nhttps://github.com/kittykatattack/learningPixi\n",
      "mode": "100644",
      "type": "blob"
    },
    "experiments/phaser/test.js": {
      "path": "experiments/phaser/test.js",
      "content": "// deps:  \"https://cdn.jsdelivr.net/npm/phaser-ce@2.9.1/build/phaser.js\"\n\nvar game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });\n\nfunction preload() {\n    game.load.crossOrigin = \"anonymous\";\n\n    game.load.tilemap('map', 'https://examples.phaser.io/assets/tilemaps/maps/collision_test.json', null, Phaser.Tilemap.TILED_JSON);\n    game.load.image('ground_1x1', 'https://examples.phaser.io/assets/tilemaps/tiles/ground_1x1.png');\n    game.load.image('walls_1x2', 'https://examples.phaser.io/assets/tilemaps/tiles/walls_1x2.png');\n    game.load.image('tiles2', 'https://examples.phaser.io/assets/tilemaps/tiles/tiles2.png');\n    game.load.image('ship', 'https://examples.phaser.io/assets/sprites/thrust_ship2.png');\n\n}\n\nvar ship;\nvar map;\nvar layer;\nvar cursors;\n\nfunction create() {\n\n    game.physics.startSystem(Phaser.Physics.P2JS);\n\n    game.stage.backgroundColor = '#2d2d2d';\n\n    map = game.add.tilemap('map');\n\n    map.addTilesetImage('ground_1x1');\n    map.addTilesetImage('walls_1x2');\n    map.addTilesetImage('tiles2');\n\n    layer = map.createLayer('Tile Layer 1');\n\n    layer.resizeWorld();\n\n    //  Set the tiles for collision.\n    //  Do this BEFORE generating the p2 bodies below.\n    map.setCollisionBetween(1, 12);\n\n    //  Convert the tilemap layer into bodies. Only tiles that collide (see above) are created.\n    //  This call returns an array of body objects which you can perform addition actions on if\n    //  required. There is also a parameter to control optimising the map build.\n    game.physics.p2.convertTilemap(map, layer);\n\n    ship = game.add.sprite(200, 200, 'ship');\n    game.physics.p2.enable(ship);\n\n    game.camera.follow(ship);\n\n    //  By default the ship will collide with the World bounds,\n    //  however because you have changed the size of the world (via layer.resizeWorld) to match the tilemap\n    //  you need to rebuild the physics world boundary as well. The following\n    //  line does that. The first 4 parameters control if you need a boundary on the left, right, top and bottom of your world.\n    //  The final parameter (false) controls if the boundary should use its own collision group or not. In this case we don't require\n    //  that, so it's set to false. But if you had custom collision groups set-up then you would need this set to true.\n    game.physics.p2.setBoundsToWorld(true, true, true, true, false);\n\n    //  Even after the world boundary is set-up you can still toggle if the ship collides or not with this:\n    // ship.body.collideWorldBounds = false;\n\n    cursors = game.input.keyboard.createCursorKeys();\n\n}\n\nfunction update() {\n\n    if (cursors.left.isDown)\n    {\n        ship.body.rotateLeft(100);\n    }\n    else if (cursors.right.isDown)\n    {\n        ship.body.rotateRight(100);\n    }\n    else\n    {\n        ship.body.setZeroRotation();\n    }\n\n    if (cursors.up.isDown)\n    {\n        ship.body.thrust(400);\n    }\n    else if (cursors.down.isDown)\n    {\n        ship.body.reverse(400);\n    }\n\n}\n\nfunction render() {\n\n}\n",
      "mode": "100644",
      "type": "blob"
    },
    "experiments/stats.coffee": {
      "path": "experiments/stats.coffee",
      "content": "# Experiment to see null-update fps for a baseline\n\nStats = require \"../lib/stats.min\"\nstats = new Stats\ndocument.body.appendChild stats.dom\n\ngameLoop = ->\n  requestAnimationFrame gameLoop\n\n  stats.begin()\n  stats.end()\n\ngameLoop()\n",
      "mode": "100644",
      "type": "blob"
    },
    "lib/map-reader.coffee": {
      "path": "lib/map-reader.coffee",
      "content": "module.exports = (source) ->\n  # Export 1 bit map data\n  {width, height} = source\n\n  canvas = document.createElement \"canvas\"\n\n  canvas.width = source.width\n  canvas.height = source.height\n\n  context = canvas.getContext(\"2d\")\n  context.drawImage(source, 0, 0)\n\n  imageData = context.getImageData(0, 0, width, height)\n\n  extract = (data, n) ->\n    data[n*4 + 3] && 1 # Only Alpha\n\n  data = new Uint8Array(width * height)\n\n  data.forEach (_, i) ->\n    data[i] = extract(imageData.data, i)\n\n  # debug view\n  ->\n    y = 0\n    while y < height\n      console.log data.slice(y * 64, (y + 1) * 64).join(\"\")\n      y += 1\n\n  width: width\n  height: height\n  data: data\n",
      "mode": "100644",
      "type": "blob"
    },
    "lib/stats.min.js": {
      "path": "lib/stats.min.js",
      "content": "// stats.js - http://github.com/mrdoob/stats.js\r\n(function(f,e){\"object\"===typeof exports&&\"undefined\"!==typeof module?module.exports=e():\"function\"===typeof define&&define.amd?define(e):f.Stats=e()})(this,function(){var f=function(){function e(a){c.appendChild(a.dom);return a}function u(a){for(var d=0;d<c.children.length;d++)c.children[d].style.display=d===a?\"block\":\"none\";l=a}var l=0,c=document.createElement(\"div\");c.style.cssText=\"position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000\";c.addEventListener(\"click\",function(a){a.preventDefault();\r\nu(++l%c.children.length)},!1);var k=(performance||Date).now(),g=k,a=0,r=e(new f.Panel(\"FPS\",\"#0ff\",\"#002\")),h=e(new f.Panel(\"MS\",\"#0f0\",\"#020\"));if(self.performance&&self.performance.memory)var t=e(new f.Panel(\"MB\",\"#f08\",\"#201\"));u(0);return{REVISION:16,dom:c,addPanel:e,showPanel:u,begin:function(){k=(performance||Date).now()},end:function(){a++;var c=(performance||Date).now();h.update(c-k,200);if(c>g+1E3&&(r.update(1E3*a/(c-g),100),g=c,a=0,t)){var d=performance.memory;t.update(d.usedJSHeapSize/\r\n1048576,d.jsHeapSizeLimit/1048576)}return c},update:function(){k=this.end()},domElement:c,setMode:u}};f.Panel=function(e,f,l){var c=Infinity,k=0,g=Math.round,a=g(window.devicePixelRatio||1),r=80*a,h=48*a,t=3*a,v=2*a,d=3*a,m=15*a,n=74*a,p=30*a,q=document.createElement(\"canvas\");q.width=r;q.height=h;q.style.cssText=\"width:80px;height:48px\";var b=q.getContext(\"2d\");b.font=\"bold \"+9*a+\"px Helvetica,Arial,sans-serif\";b.textBaseline=\"top\";b.fillStyle=l;b.fillRect(0,0,r,h);b.fillStyle=f;b.fillText(e,t,v);\r\nb.fillRect(d,m,n,p);b.fillStyle=l;b.globalAlpha=.9;b.fillRect(d,m,n,p);return{dom:q,update:function(h,w){c=Math.min(c,h);k=Math.max(k,h);b.fillStyle=l;b.globalAlpha=1;b.fillRect(0,0,r,m);b.fillStyle=f;b.fillText(g(h)+\" \"+e+\" (\"+g(c)+\"-\"+g(k)+\")\",t,v);b.drawImage(q,d+a,m,n-a,p,d,m,n-a,p);b.fillRect(d+n-a,m,a,p);b.fillStyle=l;b.globalAlpha=.9;b.fillRect(d+n-a,m,a,g((1-h/w)*p))}}};return f});",
      "mode": "100644",
      "type": "blob"
    },
    "main.coffee": {
      "path": "main.coffee",
      "content": "require \"./setup\"\n\n# FPS Display\nStats = require \"./lib/stats.min\"\nstats = new Stats\ndocument.body.appendChild stats.dom\n\nMapReader = require \"./lib/map-reader\"\nMapChunk = require \"./models/map-chunk\"\nPlayer = require \"./models/player\"\n\n{width, height, name} = require \"./pixie\"\n\ntau = 2 * Math.PI\n\n{loader, Container, Point, Rectangle, Sprite, Text, Texture} = PIXI\n\nloader.add([\n  {name: \"pika\", url: \"https://2.pixiecdn.com/sprites/137922/original.png?1\"}\n  {name: \"sheet\", url: \"https://danielx.whimsy.space/axe-blaster/platformertiles.png\"}\n  {name: \"map\", url: \"https://danielx.whimsy.space/axe-blaster/map.png\"}\n]).load ->\n  renderer = PIXI.autoDetectRenderer width, height,\n    antialias: false\n    transparent: false\n    resolution: 1\n\n  document.body.appendChild(renderer.view)\n\n  # Create a container object called the `stage`\n  stage = new Container()\n  world = new Container() # Panable and zoomable game area\n  overlay = new Container() # UI and fixed position things\n\n  stage.addChild world\n  stage.addChild overlay\n\n  debugText = new Text \"test\",\n    fill: 0xFFFFFF\n  overlay.addChild debugText\n\n  chunk = MapChunk loader.resources.sheet.texture, MapReader(loader.resources.map.texture.baseTexture.source)\n  world.addChild chunk\n\n  player = Player(loader.resources.pika.texture)\n  player.velocity.set(100, -1000)\n  world.addChild(player)\n\n  # Pan with middle click and Zoom with mouse wheel\n  do ->\n    mouse = renderer.plugins.interaction.mouse\n    active = false\n\n    prev = new Point\n\n    renderer.view.addEventListener \"mousedown\", (e) ->\n      return unless e.button is 1\n\n      active = true\n      prev.copy mouse.global\n\n    # Attach to document so it doesn't get stuck if the mouse is released outside of the renderer view\n    document.addEventListener \"mouseup\", (e) ->\n      return unless e.button is 1\n      active = false\n\n    # Attach event to document so we can track pans where the cursor is outside of the renderer view\n    document.addEventListener \"mousemove\", (e) ->\n      return unless active\n\n      deltaX = mouse.global.x - prev.x\n      deltaY = mouse.global.y - prev.y\n      prev.copy mouse.global\n\n      # Do the panning\n      world.pivot.x -= deltaX / world.scale.x\n      world.pivot.y -= deltaY / world.scale.y\n\n    renderer.view.addEventListener \"mousewheel\", (e) ->\n      e.preventDefault()\n\n      deltaZoom = Math.pow 2, (-e.deltaY / Math.abs(e.deltaY))\n\n      # Get previous local\n      prevPosition = world.toLocal(mouse.global)\n\n      world.scale.x *= deltaZoom\n      world.scale.y *= deltaZoom\n\n      # Prevent it from going beyond the zero :P\n      if world.scale.x < 0.125\n        world.scale.set 0.125\n\n      if world.scale.x > 8\n        world.scale.set 8\n\n      # Zoom in at the mouse position\n      newPosition = world.toLocal(mouse.global)\n      world.pivot.x -= newPosition.x - prevPosition.x\n      world.pivot.y -= newPosition.y - prevPosition.y\n\n  update = (dt) ->\n    # Handle player collisions\n\n    # Handle player input\n    player.update(dt, chunk.children)\n\n    debugText.text = \"\"\"\n      pivot: #{world.pivot}\n      scale: #{world.scale}\n\n      player.bounds: #{player.bounds}\n      player.velocity: #{player.velocity}\n    \"\"\"\n\n  dt = 1 / 60\n  gameLoop = ->\n    requestAnimationFrame gameLoop\n\n    stats.begin()\n\n    update(dt)\n\n    # Tell the `renderer` to `render` the `stage`\n    renderer.render stage\n\n    stats.end()\n\n  gameLoop()\n",
      "mode": "100644",
      "type": "blob"
    },
    "models/map-chunk.coffee": {
      "path": "models/map-chunk.coffee",
      "content": "{Container, Sprite, Texture, Rectangle} = PIXI\n\nmodule.exports = (texture, mapData) ->\n  blockTexture = new Texture(texture, new Rectangle(32, 32, 32, 32))\n\n  container = new Container\n\n  (({data, width, height}) ->\n    data.forEach (value, i) ->\n      x = i % width\n      y = (i / width)|0\n\n      if value\n        block = new Sprite(blockTexture)\n        block.x = x * 32\n        block.y = y * 32\n        container.addChild(block)\n  )(mapData)\n\n  return container\n",
      "mode": "100644",
      "type": "blob"
    },
    "models/player.coffee": {
      "path": "models/player.coffee",
      "content": "{Point, Rectangle, Sprite} = PIXI\n\n{abs, clamp, sign} = Math\n\n{hitTestRectangle2} = require \"../lib/util\"\n\n{keydown} = require(\"../lib/keyboard\")\n\nmodule.exports = (texture) ->\n  player = new Sprite(texture)\n\n  {position} = player\n\n  bounds = new Rectangle\n  residual = new Point\n  velocity = new Point\n\n  gravity = 3600 # pixels / s^2\n  jumpImpulse = -1000\n  movementAcceleration = 900\n  airAcceleration = 300\n\n  # Rate at which x velocity slows when on the ground\n  groundFriction = 240\n  airFriction = 120\n\n  player.x = 256\n  player.y = 256\n\n  player.scale.set(0.5)\n  player.anchor.set(0.5)\n\n  standing = false\n\n  updateInput = (dt) ->\n    movementX = 0\n\n    if keydown(\"ArrowLeft\")\n      movementX = -1\n\n    if keydown(\"ArrowRight\")\n      movementX = +1\n\n    if keydown(\"ArrowUp\") and standing\n      velocity.y = jumpImpulse\n\n    if standing\n      acc = movementAcceleration\n    else\n      acc = airAcceleration\n\n    if movementX is -sign(velocity.x)\n      velocity.x += 2 * movementX * acc * dt\n    else\n      velocity.x += movementX * acc * dt\n\n  player.update = (dt, collisionGeometry) ->\n    updateInput(dt)\n\n    if standing\n      friction = groundFriction\n    else\n      friction = airFriction\n\n    velocity.x = approach velocity.x, 0, friction * dt\n\n    # gravity\n    velocity.y += gravity * dt\n\n    dx = velocity.x * dt + residual.x\n    dy = velocity.y * dt + residual.y\n\n    # This is the 'global' bounds and is affected by the scale and offset of the\n    # parent container, not really what we want\n    # player.getBounds true, bounds\n\n    # This is the bounds 'inside' the sprite and is affected by the scale and anchor\n    # of the player, also not what we want\n    # player.getLocalBounds bounds\n\n    # Therefore we get the bounds ourself, the player's position within the 'world'\n    # without being affected by any pan and zoom the camera has applied\n\n    # Update bounds\n    bounds.x = player.x\n    bounds.y = player.y\n    bounds.width = player.width\n    bounds.height = player.height\n\n    # Check Collisions one pixel at a time\n    # Carry residual over into next frame\n    signX = sign(dx)\n    residual.x = dx - (dx|0)\n    n = abs(dx|0)\n    while n > 0\n      n--\n      bounds.x += signX\n\n      if !collides(bounds, collisionGeometry)\n        player.x += signX\n      else\n        velocity.x = 0\n        residual.x = 0\n\n    # Reset to existing bounds\n    bounds.x = player.x\n\n    signY = sign(dy)\n    residual.y = dy - (dy|0)\n    n = abs(dy|0)\n    while n > 0\n      n--\n      bounds.y += signY\n\n      if !collides(bounds, collisionGeometry)\n        player.y += signY\n      else\n        velocity.y = 0\n        residual.y = 0\n\n    # Check for floor beneath\n    bounds.y = player.y + 1\n    standing = collides(bounds, collisionGeometry)\n\n  Object.assign player, {\n    bounds\n    velocity\n  }\n\n  return player\n\ngetTileBounds = (tile, rect) ->\n  rect.x = tile.x + tile.width/2\n  rect.y = tile.y + tile.height/2\n  rect.width = tile.width\n  rect.height = tile.height\n\n  return rect\n\ntestRect = new Rectangle\n\ncollides = (bounds, objects) ->\n  i = 0\n  length = objects.length\n\n  while i < length\n    result = hitTestRectangle2(bounds, getTileBounds(objects[i], testRect))\n    if result\n      return result\n    i += 1\n\napproach = (value, target, maxDelta) ->\n  value + clamp(target - value, -maxDelta, maxDelta)\n",
      "mode": "100644",
      "type": "blob"
    },
    "pixie.cson": {
      "path": "pixie.cson",
      "content": "name: \"Axe Blaster\"\nversion: \"0.1.0\"\nwidth: 1280\nheight: 720\nremoteDependencies: [\n  \"https://pixijs.download/v4.6.0/pixi.min.js\"\n]\nentryPoint: \"main\"\n",
      "mode": "100644",
      "type": "blob"
    },
    "setup.coffee": {
      "path": "setup.coffee",
      "content": "styleNode = document.createElement(\"style\")\nstyleNode.innerHTML = require('./style')\ndocument.head.appendChild(styleNode)\n\n# Extend PIXI points with a decent default toString\n{ObservablePoint, Point, Rectangle} = PIXI\npointToString = ->\n  \"#{@x}, #{@y}\"\nObservablePoint::toString = pointToString\nPoint::toString = pointToString\n\nRectangle::toString = ->\n  \"#{@x},#{@y},#{@width},#{@height}\"\n\n# Math extensions\n{min, max} = Math\nMath.clamp = (number, lower, upper) ->\n  max(min(number, upper), lower)\n",
      "mode": "100644",
      "type": "blob"
    },
    "style.styl": {
      "path": "style.styl",
      "content": "html\n  display: flex\n  height: 100%\n\nbody\n  display: flex\n  flex: 1\n  margin: 0\n\nbody > canvas\n  margin: auto\n",
      "mode": "100644",
      "type": "blob"
    },
    "lib/util.coffee": {
      "path": "lib/util.coffee",
      "content": "{abs} = Math\n\nmodule.exports =\n  hitTestRectangle: (r1, r2) ->\n    # Find the center points of each sprite\n    r1.centerX = r1.x + r1.width / 2;\n    r1.centerY = r1.y + r1.height / 2;\n    r2.centerX = r2.x + r2.width / 2;\n    r2.centerY = r2.y + r2.height / 2;\n  \n    # Find the half-widths and half-heights of each sprite\n    r1.halfWidth = r1.width / 2;\n    r1.halfHeight = r1.height / 2;\n    r2.halfWidth = r2.width / 2;\n    r2.halfHeight = r2.height / 2;\n  \n    # Calculate the distance vector between the sprites\n    vx = r1.centerX - r2.centerX;\n    vy = r1.centerY - r2.centerY;\n  \n    # Figure out the combined half-widths and half-heights\n    combinedHalfWidths = r1.halfWidth + r2.halfWidth;\n    combinedHalfHeights = r1.halfHeight + r2.halfHeight;\n  \n    # Check for a collision on the x axis\n    return abs(vx) < combinedHalfWidths and abs(vy) < combinedHalfHeights\n\n  # NOTE: x, y values are center of rects\n  hitTestRectangle2: (a, b) ->\n    return (abs(a.x - b.x) * 2 < (a.width + b.width)) &&\n           (abs(a.y - b.y) * 2 < (a.height + b.height))\n",
      "mode": "100644"
    },
    "lib/keyboard.coffee": {
      "path": "lib/keyboard.coffee",
      "content": "# Keyboard event handling to answer the simple question: is this key down?\n\nmodule.exports = do ->\n  down = {}\n\n  window.addEventListener \"keydown\", ({key}) ->\n    console.log \"down\", key\n    down[key] = true\n  window.addEventListener \"keyup\", ({key}) ->\n    console.log \"up\", key\n    down[key] = false\n\n  keydown: (name) ->\n    down[name]\n",
      "mode": "100644"
    }
  },
  "distribution": {
    "experiments/phaser/test": {
      "path": "experiments/phaser/test",
      "content": "// deps:  \"https://cdn.jsdelivr.net/npm/phaser-ce@2.9.1/build/phaser.js\"\n\nvar game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });\n\nfunction preload() {\n    game.load.crossOrigin = \"anonymous\";\n\n    game.load.tilemap('map', 'https://examples.phaser.io/assets/tilemaps/maps/collision_test.json', null, Phaser.Tilemap.TILED_JSON);\n    game.load.image('ground_1x1', 'https://examples.phaser.io/assets/tilemaps/tiles/ground_1x1.png');\n    game.load.image('walls_1x2', 'https://examples.phaser.io/assets/tilemaps/tiles/walls_1x2.png');\n    game.load.image('tiles2', 'https://examples.phaser.io/assets/tilemaps/tiles/tiles2.png');\n    game.load.image('ship', 'https://examples.phaser.io/assets/sprites/thrust_ship2.png');\n\n}\n\nvar ship;\nvar map;\nvar layer;\nvar cursors;\n\nfunction create() {\n\n    game.physics.startSystem(Phaser.Physics.P2JS);\n\n    game.stage.backgroundColor = '#2d2d2d';\n\n    map = game.add.tilemap('map');\n\n    map.addTilesetImage('ground_1x1');\n    map.addTilesetImage('walls_1x2');\n    map.addTilesetImage('tiles2');\n\n    layer = map.createLayer('Tile Layer 1');\n\n    layer.resizeWorld();\n\n    //  Set the tiles for collision.\n    //  Do this BEFORE generating the p2 bodies below.\n    map.setCollisionBetween(1, 12);\n\n    //  Convert the tilemap layer into bodies. Only tiles that collide (see above) are created.\n    //  This call returns an array of body objects which you can perform addition actions on if\n    //  required. There is also a parameter to control optimising the map build.\n    game.physics.p2.convertTilemap(map, layer);\n\n    ship = game.add.sprite(200, 200, 'ship');\n    game.physics.p2.enable(ship);\n\n    game.camera.follow(ship);\n\n    //  By default the ship will collide with the World bounds,\n    //  however because you have changed the size of the world (via layer.resizeWorld) to match the tilemap\n    //  you need to rebuild the physics world boundary as well. The following\n    //  line does that. The first 4 parameters control if you need a boundary on the left, right, top and bottom of your world.\n    //  The final parameter (false) controls if the boundary should use its own collision group or not. In this case we don't require\n    //  that, so it's set to false. But if you had custom collision groups set-up then you would need this set to true.\n    game.physics.p2.setBoundsToWorld(true, true, true, true, false);\n\n    //  Even after the world boundary is set-up you can still toggle if the ship collides or not with this:\n    // ship.body.collideWorldBounds = false;\n\n    cursors = game.input.keyboard.createCursorKeys();\n\n}\n\nfunction update() {\n\n    if (cursors.left.isDown)\n    {\n        ship.body.rotateLeft(100);\n    }\n    else if (cursors.right.isDown)\n    {\n        ship.body.rotateRight(100);\n    }\n    else\n    {\n        ship.body.setZeroRotation();\n    }\n\n    if (cursors.up.isDown)\n    {\n        ship.body.thrust(400);\n    }\n    else if (cursors.down.isDown)\n    {\n        ship.body.reverse(400);\n    }\n\n}\n\nfunction render() {\n\n}\n",
      "type": "blob"
    },
    "experiments/stats": {
      "path": "experiments/stats",
      "content": "(function() {\n  var Stats, gameLoop, stats;\n\n  Stats = require(\"../lib/stats.min\");\n\n  stats = new Stats;\n\n  document.body.appendChild(stats.dom);\n\n  gameLoop = function() {\n    requestAnimationFrame(gameLoop);\n    stats.begin();\n    return stats.end();\n  };\n\n  gameLoop();\n\n}).call(this);\n",
      "type": "blob"
    },
    "lib/map-reader": {
      "path": "lib/map-reader",
      "content": "(function() {\n  module.exports = function(source) {\n    var canvas, context, data, extract, height, imageData, width;\n    width = source.width, height = source.height;\n    canvas = document.createElement(\"canvas\");\n    canvas.width = source.width;\n    canvas.height = source.height;\n    context = canvas.getContext(\"2d\");\n    context.drawImage(source, 0, 0);\n    imageData = context.getImageData(0, 0, width, height);\n    extract = function(data, n) {\n      return data[n * 4 + 3] && 1;\n    };\n    data = new Uint8Array(width * height);\n    data.forEach(function(_, i) {\n      return data[i] = extract(imageData.data, i);\n    });\n    (function() {\n      var y, _results;\n      y = 0;\n      _results = [];\n      while (y < height) {\n        console.log(data.slice(y * 64, (y + 1) * 64).join(\"\"));\n        _results.push(y += 1);\n      }\n      return _results;\n    });\n    return {\n      width: width,\n      height: height,\n      data: data\n    };\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "lib/stats.min": {
      "path": "lib/stats.min",
      "content": "// stats.js - http://github.com/mrdoob/stats.js\r\n(function(f,e){\"object\"===typeof exports&&\"undefined\"!==typeof module?module.exports=e():\"function\"===typeof define&&define.amd?define(e):f.Stats=e()})(this,function(){var f=function(){function e(a){c.appendChild(a.dom);return a}function u(a){for(var d=0;d<c.children.length;d++)c.children[d].style.display=d===a?\"block\":\"none\";l=a}var l=0,c=document.createElement(\"div\");c.style.cssText=\"position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000\";c.addEventListener(\"click\",function(a){a.preventDefault();\r\nu(++l%c.children.length)},!1);var k=(performance||Date).now(),g=k,a=0,r=e(new f.Panel(\"FPS\",\"#0ff\",\"#002\")),h=e(new f.Panel(\"MS\",\"#0f0\",\"#020\"));if(self.performance&&self.performance.memory)var t=e(new f.Panel(\"MB\",\"#f08\",\"#201\"));u(0);return{REVISION:16,dom:c,addPanel:e,showPanel:u,begin:function(){k=(performance||Date).now()},end:function(){a++;var c=(performance||Date).now();h.update(c-k,200);if(c>g+1E3&&(r.update(1E3*a/(c-g),100),g=c,a=0,t)){var d=performance.memory;t.update(d.usedJSHeapSize/\r\n1048576,d.jsHeapSizeLimit/1048576)}return c},update:function(){k=this.end()},domElement:c,setMode:u}};f.Panel=function(e,f,l){var c=Infinity,k=0,g=Math.round,a=g(window.devicePixelRatio||1),r=80*a,h=48*a,t=3*a,v=2*a,d=3*a,m=15*a,n=74*a,p=30*a,q=document.createElement(\"canvas\");q.width=r;q.height=h;q.style.cssText=\"width:80px;height:48px\";var b=q.getContext(\"2d\");b.font=\"bold \"+9*a+\"px Helvetica,Arial,sans-serif\";b.textBaseline=\"top\";b.fillStyle=l;b.fillRect(0,0,r,h);b.fillStyle=f;b.fillText(e,t,v);\r\nb.fillRect(d,m,n,p);b.fillStyle=l;b.globalAlpha=.9;b.fillRect(d,m,n,p);return{dom:q,update:function(h,w){c=Math.min(c,h);k=Math.max(k,h);b.fillStyle=l;b.globalAlpha=1;b.fillRect(0,0,r,m);b.fillStyle=f;b.fillText(g(h)+\" \"+e+\" (\"+g(c)+\"-\"+g(k)+\")\",t,v);b.drawImage(q,d+a,m,n-a,p,d,m,n-a,p);b.fillRect(d+n-a,m,a,p);b.fillStyle=l;b.globalAlpha=.9;b.fillRect(d+n-a,m,a,g((1-h/w)*p))}}};return f});",
      "type": "blob"
    },
    "main": {
      "path": "main",
      "content": "(function() {\n  var Container, MapChunk, MapReader, Player, Point, Rectangle, Sprite, Stats, Text, Texture, height, loader, name, stats, tau, width, _ref;\n\n  require(\"./setup\");\n\n  Stats = require(\"./lib/stats.min\");\n\n  stats = new Stats;\n\n  document.body.appendChild(stats.dom);\n\n  MapReader = require(\"./lib/map-reader\");\n\n  MapChunk = require(\"./models/map-chunk\");\n\n  Player = require(\"./models/player\");\n\n  _ref = require(\"./pixie\"), width = _ref.width, height = _ref.height, name = _ref.name;\n\n  tau = 2 * Math.PI;\n\n  loader = PIXI.loader, Container = PIXI.Container, Point = PIXI.Point, Rectangle = PIXI.Rectangle, Sprite = PIXI.Sprite, Text = PIXI.Text, Texture = PIXI.Texture;\n\n  loader.add([\n    {\n      name: \"pika\",\n      url: \"https://2.pixiecdn.com/sprites/137922/original.png?1\"\n    }, {\n      name: \"sheet\",\n      url: \"https://danielx.whimsy.space/axe-blaster/platformertiles.png\"\n    }, {\n      name: \"map\",\n      url: \"https://danielx.whimsy.space/axe-blaster/map.png\"\n    }\n  ]).load(function() {\n    var chunk, debugText, dt, gameLoop, overlay, player, renderer, stage, update, world;\n    renderer = PIXI.autoDetectRenderer(width, height, {\n      antialias: false,\n      transparent: false,\n      resolution: 1\n    });\n    document.body.appendChild(renderer.view);\n    stage = new Container();\n    world = new Container();\n    overlay = new Container();\n    stage.addChild(world);\n    stage.addChild(overlay);\n    debugText = new Text(\"test\", {\n      fill: 0xFFFFFF\n    });\n    overlay.addChild(debugText);\n    chunk = MapChunk(loader.resources.sheet.texture, MapReader(loader.resources.map.texture.baseTexture.source));\n    world.addChild(chunk);\n    player = Player(loader.resources.pika.texture);\n    player.velocity.set(100, -1000);\n    world.addChild(player);\n    (function() {\n      var active, mouse, prev;\n      mouse = renderer.plugins.interaction.mouse;\n      active = false;\n      prev = new Point;\n      renderer.view.addEventListener(\"mousedown\", function(e) {\n        if (e.button !== 1) {\n          return;\n        }\n        active = true;\n        return prev.copy(mouse.global);\n      });\n      document.addEventListener(\"mouseup\", function(e) {\n        if (e.button !== 1) {\n          return;\n        }\n        return active = false;\n      });\n      document.addEventListener(\"mousemove\", function(e) {\n        var deltaX, deltaY;\n        if (!active) {\n          return;\n        }\n        deltaX = mouse.global.x - prev.x;\n        deltaY = mouse.global.y - prev.y;\n        prev.copy(mouse.global);\n        world.pivot.x -= deltaX / world.scale.x;\n        return world.pivot.y -= deltaY / world.scale.y;\n      });\n      return renderer.view.addEventListener(\"mousewheel\", function(e) {\n        var deltaZoom, newPosition, prevPosition;\n        e.preventDefault();\n        deltaZoom = Math.pow(2, -e.deltaY / Math.abs(e.deltaY));\n        prevPosition = world.toLocal(mouse.global);\n        world.scale.x *= deltaZoom;\n        world.scale.y *= deltaZoom;\n        if (world.scale.x < 0.125) {\n          world.scale.set(0.125);\n        }\n        if (world.scale.x > 8) {\n          world.scale.set(8);\n        }\n        newPosition = world.toLocal(mouse.global);\n        world.pivot.x -= newPosition.x - prevPosition.x;\n        return world.pivot.y -= newPosition.y - prevPosition.y;\n      });\n    })();\n    update = function(dt) {\n      player.update(dt, chunk.children);\n      return debugText.text = \"pivot: \" + world.pivot + \"\\nscale: \" + world.scale + \"\\n\\nplayer.bounds: \" + player.bounds + \"\\nplayer.velocity: \" + player.velocity;\n    };\n    dt = 1 / 60;\n    gameLoop = function() {\n      requestAnimationFrame(gameLoop);\n      stats.begin();\n      update(dt);\n      renderer.render(stage);\n      return stats.end();\n    };\n    return gameLoop();\n  });\n\n}).call(this);\n",
      "type": "blob"
    },
    "models/map-chunk": {
      "path": "models/map-chunk",
      "content": "(function() {\n  var Container, Rectangle, Sprite, Texture;\n\n  Container = PIXI.Container, Sprite = PIXI.Sprite, Texture = PIXI.Texture, Rectangle = PIXI.Rectangle;\n\n  module.exports = function(texture, mapData) {\n    var blockTexture, container;\n    blockTexture = new Texture(texture, new Rectangle(32, 32, 32, 32));\n    container = new Container;\n    (function(_arg) {\n      var data, height, width;\n      data = _arg.data, width = _arg.width, height = _arg.height;\n      return data.forEach(function(value, i) {\n        var block, x, y;\n        x = i % width;\n        y = (i / width) | 0;\n        if (value) {\n          block = new Sprite(blockTexture);\n          block.x = x * 32;\n          block.y = y * 32;\n          return container.addChild(block);\n        }\n      });\n    })(mapData);\n    return container;\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "models/player": {
      "path": "models/player",
      "content": "(function() {\n  var Point, Rectangle, Sprite, abs, approach, clamp, collides, getTileBounds, hitTestRectangle2, keydown, sign, testRect;\n\n  Point = PIXI.Point, Rectangle = PIXI.Rectangle, Sprite = PIXI.Sprite;\n\n  abs = Math.abs, clamp = Math.clamp, sign = Math.sign;\n\n  hitTestRectangle2 = require(\"../lib/util\").hitTestRectangle2;\n\n  keydown = require(\"../lib/keyboard\").keydown;\n\n  module.exports = function(texture) {\n    var airAcceleration, airFriction, bounds, gravity, groundFriction, jumpImpulse, movementAcceleration, player, position, residual, standing, updateInput, velocity;\n    player = new Sprite(texture);\n    position = player.position;\n    bounds = new Rectangle;\n    residual = new Point;\n    velocity = new Point;\n    gravity = 3600;\n    jumpImpulse = -1000;\n    movementAcceleration = 900;\n    airAcceleration = 300;\n    groundFriction = 240;\n    airFriction = 120;\n    player.x = 256;\n    player.y = 256;\n    player.scale.set(0.5);\n    player.anchor.set(0.5);\n    standing = false;\n    updateInput = function(dt) {\n      var acc, movementX;\n      movementX = 0;\n      if (keydown(\"ArrowLeft\")) {\n        movementX = -1;\n      }\n      if (keydown(\"ArrowRight\")) {\n        movementX = +1;\n      }\n      if (keydown(\"ArrowUp\") && standing) {\n        velocity.y = jumpImpulse;\n      }\n      if (standing) {\n        acc = movementAcceleration;\n      } else {\n        acc = airAcceleration;\n      }\n      if (movementX === -sign(velocity.x)) {\n        return velocity.x += 2 * movementX * acc * dt;\n      } else {\n        return velocity.x += movementX * acc * dt;\n      }\n    };\n    player.update = function(dt, collisionGeometry) {\n      var dx, dy, friction, n, signX, signY;\n      updateInput(dt);\n      if (standing) {\n        friction = groundFriction;\n      } else {\n        friction = airFriction;\n      }\n      velocity.x = approach(velocity.x, 0, friction * dt);\n      velocity.y += gravity * dt;\n      dx = velocity.x * dt + residual.x;\n      dy = velocity.y * dt + residual.y;\n      bounds.x = player.x;\n      bounds.y = player.y;\n      bounds.width = player.width;\n      bounds.height = player.height;\n      signX = sign(dx);\n      residual.x = dx - (dx | 0);\n      n = abs(dx | 0);\n      while (n > 0) {\n        n--;\n        bounds.x += signX;\n        if (!collides(bounds, collisionGeometry)) {\n          player.x += signX;\n        } else {\n          velocity.x = 0;\n          residual.x = 0;\n        }\n      }\n      bounds.x = player.x;\n      signY = sign(dy);\n      residual.y = dy - (dy | 0);\n      n = abs(dy | 0);\n      while (n > 0) {\n        n--;\n        bounds.y += signY;\n        if (!collides(bounds, collisionGeometry)) {\n          player.y += signY;\n        } else {\n          velocity.y = 0;\n          residual.y = 0;\n        }\n      }\n      bounds.y = player.y + 1;\n      return standing = collides(bounds, collisionGeometry);\n    };\n    Object.assign(player, {\n      bounds: bounds,\n      velocity: velocity\n    });\n    return player;\n  };\n\n  getTileBounds = function(tile, rect) {\n    rect.x = tile.x + tile.width / 2;\n    rect.y = tile.y + tile.height / 2;\n    rect.width = tile.width;\n    rect.height = tile.height;\n    return rect;\n  };\n\n  testRect = new Rectangle;\n\n  collides = function(bounds, objects) {\n    var i, length, result;\n    i = 0;\n    length = objects.length;\n    while (i < length) {\n      result = hitTestRectangle2(bounds, getTileBounds(objects[i], testRect));\n      if (result) {\n        return result;\n      }\n      i += 1;\n    }\n  };\n\n  approach = function(value, target, maxDelta) {\n    return value + clamp(target - value, -maxDelta, maxDelta);\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "pixie": {
      "path": "pixie",
      "content": "module.exports = {\"name\":\"Axe Blaster\",\"version\":\"0.1.0\",\"width\":1280,\"height\":720,\"remoteDependencies\":[\"https://pixijs.download/v4.6.0/pixi.min.js\"],\"entryPoint\":\"main\"};",
      "type": "blob"
    },
    "setup": {
      "path": "setup",
      "content": "(function() {\n  var ObservablePoint, Point, Rectangle, max, min, pointToString, styleNode;\n\n  styleNode = document.createElement(\"style\");\n\n  styleNode.innerHTML = require('./style');\n\n  document.head.appendChild(styleNode);\n\n  ObservablePoint = PIXI.ObservablePoint, Point = PIXI.Point, Rectangle = PIXI.Rectangle;\n\n  pointToString = function() {\n    return \"\" + this.x + \", \" + this.y;\n  };\n\n  ObservablePoint.prototype.toString = pointToString;\n\n  Point.prototype.toString = pointToString;\n\n  Rectangle.prototype.toString = function() {\n    return \"\" + this.x + \",\" + this.y + \",\" + this.width + \",\" + this.height;\n  };\n\n  min = Math.min, max = Math.max;\n\n  Math.clamp = function(number, lower, upper) {\n    return max(min(number, upper), lower);\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "style": {
      "path": "style",
      "content": "module.exports = \"html {\\n  display: flex;\\n  height: 100%;\\n}\\nbody {\\n  display: flex;\\n  flex: 1;\\n  margin: 0;\\n}\\nbody > canvas {\\n  margin: auto;\\n}\\n\";",
      "type": "blob"
    },
    "lib/util": {
      "path": "lib/util",
      "content": "(function() {\n  var abs;\n\n  abs = Math.abs;\n\n  module.exports = {\n    hitTestRectangle: function(r1, r2) {\n      var combinedHalfHeights, combinedHalfWidths, vx, vy;\n      r1.centerX = r1.x + r1.width / 2;\n      r1.centerY = r1.y + r1.height / 2;\n      r2.centerX = r2.x + r2.width / 2;\n      r2.centerY = r2.y + r2.height / 2;\n      r1.halfWidth = r1.width / 2;\n      r1.halfHeight = r1.height / 2;\n      r2.halfWidth = r2.width / 2;\n      r2.halfHeight = r2.height / 2;\n      vx = r1.centerX - r2.centerX;\n      vy = r1.centerY - r2.centerY;\n      combinedHalfWidths = r1.halfWidth + r2.halfWidth;\n      combinedHalfHeights = r1.halfHeight + r2.halfHeight;\n      return abs(vx) < combinedHalfWidths && abs(vy) < combinedHalfHeights;\n    },\n    hitTestRectangle2: function(a, b) {\n      return (abs(a.x - b.x) * 2 < (a.width + b.width)) && (abs(a.y - b.y) * 2 < (a.height + b.height));\n    }\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "lib/keyboard": {
      "path": "lib/keyboard",
      "content": "(function() {\n  module.exports = (function() {\n    var down;\n    down = {};\n    window.addEventListener(\"keydown\", function(_arg) {\n      var key;\n      key = _arg.key;\n      console.log(\"down\", key);\n      return down[key] = true;\n    });\n    window.addEventListener(\"keyup\", function(_arg) {\n      var key;\n      key = _arg.key;\n      console.log(\"up\", key);\n      return down[key] = false;\n    });\n    return {\n      keydown: function(name) {\n        return down[name];\n      }\n    };\n  })();\n\n}).call(this);\n",
      "type": "blob"
    }
  },
  "progenitor": {
    "url": "https://danielx.net/editor/"
  },
  "config": {
    "name": "Axe Blaster",
    "version": "0.1.0",
    "width": 1280,
    "height": 720,
    "remoteDependencies": [
      "https://pixijs.download/v4.6.0/pixi.min.js"
    ],
    "entryPoint": "main"
  },
  "version": "0.1.0",
  "entryPoint": "main",
  "remoteDependencies": [
    "https://pixijs.download/v4.6.0/pixi.min.js"
  ],
  "repository": {
    "branch": "master",
    "default_branch": "master",
    "full_name": "STRd6/axe-blaster",
    "homepage": null,
    "description": "Platform game in phaser",
    "html_url": "https://github.com/STRd6/axe-blaster",
    "url": "https://api.github.com/repos/STRd6/axe-blaster",
    "publishBranch": "gh-pages"
  },
  "dependencies": {}
});