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
    "lib/keyboard.coffee": {
      "path": "lib/keyboard.coffee",
      "content": "# Keyboard event handling to answer the simple question: is this key down?\n\nmodule.exports = do ->\n  down = {}\n\n  window.addEventListener \"keydown\", ({key}) ->\n    down[key] = true\n  window.addEventListener \"keyup\", ({key}) ->\n    down[key] = false\n\n  keydown: (name) ->\n    down[name]\n",
      "mode": "100644",
      "type": "blob"
    },
    "lib/map-reader.coffee": {
      "path": "lib/map-reader.coffee",
      "content": "module.exports = (source) ->\n  # Export 1 bit map data\n  {width, height} = source\n\n  canvas = document.createElement \"canvas\"\n\n  canvas.width = source.width\n  canvas.height = source.height\n\n  context = canvas.getContext(\"2d\")\n  context.drawImage(source, 0, 0)\n\n  imageData = context.getImageData(0, 0, width, height)\n\n  extract = (data, n) ->\n    data[n*4 + 3] && 1 # Only Alpha\n\n  data = new Uint8Array(width * height)\n\n  data.forEach (_, i) ->\n    data[i] = extract(imageData.data, i)\n\n  # debug view\n  ->\n    y = 0\n    while y < height\n      console.log data.slice(y * 64, (y + 1) * 64).join(\"\")\n      y += 1\n\n  width: width\n  height: height\n  data: data\n",
      "mode": "100644",
      "type": "blob"
    },
    "lib/panzoom.coffee": {
      "path": "lib/panzoom.coffee",
      "content": "{Point} = PIXI\n\n###\nPan with middle click and Zoom with mouse wheel.\n\nThe renderer tracks mouse interactions, though we also need to attach some\nevents on the document so we scroll smoothly and detect releases when the mouse\nmoves outside of the renderer element.\n\nThe pan and zoom is accomplished by transforming the scale and pivot of a\ngiven container so that it can be panned and zoomed independently of any\nUI/Overlay objects.\n###\nmodule.exports = (renderer, world) ->\n  mouse = renderer.plugins.interaction.mouse\n  active = false\n\n  prev = new Point\n\n  renderer.view.addEventListener \"mousedown\", (e) ->\n    return unless e.button is 1\n\n    active = true\n    prev.copy mouse.global\n\n  # Attach to document so it doesn't get stuck if the mouse is released outside of the renderer view\n  document.addEventListener \"mouseup\", (e) ->\n    return unless e.button is 1\n    active = false\n\n  # Attach event to document so we can track pans where the cursor is outside of the renderer view\n  document.addEventListener \"mousemove\", (e) ->\n    return unless active\n\n    deltaX = mouse.global.x - prev.x\n    deltaY = mouse.global.y - prev.y\n    prev.copy mouse.global\n\n    # Do the panning\n    world.pivot.x -= deltaX / world.scale.x\n    world.pivot.y -= deltaY / world.scale.y\n\n  renderer.view.addEventListener \"mousewheel\", (e) ->\n    e.preventDefault()\n\n    deltaZoom = Math.pow 2, (-e.deltaY / Math.abs(e.deltaY))\n\n    # Get previous local\n    prevPosition = world.toLocal(mouse.global)\n\n    world.scale.x *= deltaZoom\n    world.scale.y *= deltaZoom\n\n    # Prevent it from going beyond the zero :P\n    if world.scale.x < 0.125\n      world.scale.set 0.125\n\n    if world.scale.x > 8\n      world.scale.set 8\n\n    # Zoom in at the mouse position\n    newPosition = world.toLocal(mouse.global)\n    world.pivot.x -= newPosition.x - prevPosition.x\n    world.pivot.y -= newPosition.y - prevPosition.y\n",
      "mode": "100644",
      "type": "blob"
    },
    "lib/stats.min.js": {
      "path": "lib/stats.min.js",
      "content": "// stats.js - http://github.com/mrdoob/stats.js\r\n(function(f,e){\"object\"===typeof exports&&\"undefined\"!==typeof module?module.exports=e():\"function\"===typeof define&&define.amd?define(e):f.Stats=e()})(this,function(){var f=function(){function e(a){c.appendChild(a.dom);return a}function u(a){for(var d=0;d<c.children.length;d++)c.children[d].style.display=d===a?\"block\":\"none\";l=a}var l=0,c=document.createElement(\"div\");c.style.cssText=\"position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000\";c.addEventListener(\"click\",function(a){a.preventDefault();\r\nu(++l%c.children.length)},!1);var k=(performance||Date).now(),g=k,a=0,r=e(new f.Panel(\"FPS\",\"#0ff\",\"#002\")),h=e(new f.Panel(\"MS\",\"#0f0\",\"#020\"));if(self.performance&&self.performance.memory)var t=e(new f.Panel(\"MB\",\"#f08\",\"#201\"));u(0);return{REVISION:16,dom:c,addPanel:e,showPanel:u,begin:function(){k=(performance||Date).now()},end:function(){a++;var c=(performance||Date).now();h.update(c-k,200);if(c>g+1E3&&(r.update(1E3*a/(c-g),100),g=c,a=0,t)){var d=performance.memory;t.update(d.usedJSHeapSize/\r\n1048576,d.jsHeapSizeLimit/1048576)}return c},update:function(){k=this.end()},domElement:c,setMode:u}};f.Panel=function(e,f,l){var c=Infinity,k=0,g=Math.round,a=g(window.devicePixelRatio||1),r=80*a,h=48*a,t=3*a,v=2*a,d=3*a,m=15*a,n=74*a,p=30*a,q=document.createElement(\"canvas\");q.width=r;q.height=h;q.style.cssText=\"width:80px;height:48px\";var b=q.getContext(\"2d\");b.font=\"bold \"+9*a+\"px Helvetica,Arial,sans-serif\";b.textBaseline=\"top\";b.fillStyle=l;b.fillRect(0,0,r,h);b.fillStyle=f;b.fillText(e,t,v);\r\nb.fillRect(d,m,n,p);b.fillStyle=l;b.globalAlpha=.9;b.fillRect(d,m,n,p);return{dom:q,update:function(h,w){c=Math.min(c,h);k=Math.max(k,h);b.fillStyle=l;b.globalAlpha=1;b.fillRect(0,0,r,m);b.fillStyle=f;b.fillText(g(h)+\" \"+e+\" (\"+g(c)+\"-\"+g(k)+\")\",t,v);b.drawImage(q,d+a,m,n-a,p,d,m,n-a,p);b.fillRect(d+n-a,m,a,p);b.fillStyle=l;b.globalAlpha=.9;b.fillRect(d+n-a,m,a,g((1-h/w)*p))}}};return f});\n",
      "mode": "100644",
      "type": "blob"
    },
    "lib/util.coffee": {
      "path": "lib/util.coffee",
      "content": "{abs} = Math\n\nmodule.exports =\n  hitTestRectangle: (r1, r2) ->\n    # Find the center points of each sprite\n    r1.centerX = r1.x + r1.width / 2;\n    r1.centerY = r1.y + r1.height / 2;\n    r2.centerX = r2.x + r2.width / 2;\n    r2.centerY = r2.y + r2.height / 2;\n\n    # Find the half-widths and half-heights of each sprite\n    r1.halfWidth = r1.width / 2;\n    r1.halfHeight = r1.height / 2;\n    r2.halfWidth = r2.width / 2;\n    r2.halfHeight = r2.height / 2;\n\n    # Calculate the distance vector between the sprites\n    vx = r1.centerX - r2.centerX;\n    vy = r1.centerY - r2.centerY;\n\n    # Figure out the combined half-widths and half-heights\n    combinedHalfWidths = r1.halfWidth + r2.halfWidth;\n    combinedHalfHeights = r1.halfHeight + r2.halfHeight;\n\n    # Check for a collision on the x axis\n    return abs(vx) < combinedHalfWidths and abs(vy) < combinedHalfHeights\n\n  # NOTE: x, y values are center of rects\n  hitTestRectangle2: (a, b) ->\n    return (abs(a.x - b.x) * 2 < (a.width + b.width)) &&\n           (abs(a.y - b.y) * 2 < (a.height + b.height))\n",
      "mode": "100644",
      "type": "blob"
    },
    "main.coffee": {
      "path": "main.coffee",
      "content": "require \"./setup\"\n\nGame = require \"./models/game\"\n\nIntro = require \"./scenes/intro\"\nPlatformer = require \"./scenes/platformer\"\n\n{width, height} = require \"./pixie\"\n\ngame = Game\n  width: width\n  height: height\n\ndocument.body.appendChild game.element\n\nintroScene = Intro()\n\nplatformerScene = Platformer(game.renderer)\n# game.setScene introScene\ngame.setScene platformerScene\n\nintroScene.on \"complete\", ->\n  game.setScene platformerScene\n",
      "mode": "100644",
      "type": "blob"
    },
    "models/game.coffee": {
      "path": "models/game.coffee",
      "content": "###\nCreate the renderer and game loop.\nAppend stats and things to the dom\n\nCalls the active scene's update method and renders it in the PIXI renderer.\n###\n\n{loader, Container, Point, Rectangle, Sprite, Text, Texture} = PIXI\n\n# Scenes are PIXI.Containers extended with an update method\nnullScene = new Container\nnullScene.update = ->\n\nmodule.exports = ({width, height}) ->\n  renderer = PIXI.autoDetectRenderer width, height,\n    antialias: false\n    transparent: false\n    resolution: 1\n\n  contentElement = document.createElement \"content\"\n\n  debugText = document.createElement \"pre\"\n  debugText.classList.add \"debug\"\n  contentElement.appendChild debugText\n\n  contentElement.appendChild(renderer.view)\n\n  activeScene = nullScene\n  nextScene = activeScene\n\n  self =\n    element: contentElement\n    renderer: renderer\n    setScene: (scene) ->\n      nextScene = scene\n    debugText: (text) ->\n      debugText.textContent = text\n\n  # Start the game loop, updating and rendering the activeScene every frame\n  dt = 1 / 60\n  gameLoop = ->\n    requestAnimationFrame gameLoop\n\n    stats.begin()\n\n    # Need to switch scenes at frame transition to prevent rendering the new\n    # secene before it updates\n    if nextScene != activeScene\n      activeScene.emit(\"exit\")\n      activeScene = nextScene\n      activeScene.emit(\"enter\")\n\n    activeScene.update(dt, self)\n    # Tell the `renderer` to `render` the `stage`\n    renderer.render activeScene\n\n    stats.end()\n\n  gameLoop()\n\n  return self\n",
      "mode": "100644",
      "type": "blob"
    },
    "models/map-chunk.coffee": {
      "path": "models/map-chunk.coffee",
      "content": "{Container, Sprite, Text, Texture, Rectangle} = PIXI\n\nautoTileIndexes = [\n  [1, 1]\n  [4, 2]\n  [4, 0, 2]\n  [0, 2]\n  [4, 0]\n  [4, 1]\n  [0, 0]\n  [0, 1]\n  [4, 2, 2] # 8\n  [2, 2]\n  [4, 1, 2]\n  [1, 2]\n  [2, 0] # 12\n  [2, 1]\n  [1, 0]\n  [1, 1]\n]\n\nneighbors = [\n  [0, -1]\n  [1, 0]\n  [0, 1]\n  [-1, 0]\n]\n\ngetAutoTileIndex = (index, {width, height, data}) ->\n  x = index % width\n  y = (index / width)|0\n\n  neighbors.reduce (acc, [dx, dy], n) ->\n    m = Math.pow(2, n)\n\n    px = x + dx\n    py = y + dy\n\n    if (0 <= px < width) and (0 <= py < height)\n      acc + data[py * width + px] * m\n    else\n      acc + m\n  , 0\n\nmodule.exports = (texture, mapData) ->\n  tileTextures = autoTileIndexes.map ([x, y, rotate]) ->\n    new Texture(texture, new Rectangle(32 * x, 32 * y, 32, 32), null, null, rotate)\n\n  defaultTexture = tileTextures[0]\n\n  container = new Container\n\n  (({data, width, height}) ->\n    data.forEach (value, i) ->\n      x = i % width\n      y = (i / width)|0\n\n      if value\n        tIndex = getAutoTileIndex(i, mapData)\n        tex = tileTextures[tIndex] or defaultTexture\n        block = new Sprite(tex)\n        block.x = x * 32\n        block.y = y * 32\n        container.addChild(block)\n\n        # debug tile index\n        # block.addChild new Text(tIndex, fill: \"#FFF\")\n  )(mapData)\n\n  return container\n",
      "mode": "100644",
      "type": "blob"
    },
    "models/player.coffee": {
      "path": "models/player.coffee",
      "content": "{Point, Rectangle, Sprite} = PIXI\n\n{abs, clamp, sign} = Math\n\n{hitTestRectangle2} = require \"../lib/util\"\n\n{keydown} = require(\"../lib/keyboard\")\n\nmodule.exports = (texture) ->\n  player = new Sprite(texture)\n\n  {position} = player\n\n  bounds = new Rectangle\n  residual = new Point\n  velocity = new Point\n\n  gravity = 3600 # pixels / s^2\n  jumpImpulse = -1350\n  jumpDirectionalImpulse = 120\n  movementAcceleration = 900\n\n  maxVelocityX = 600\n  maxVelocityY = 1800\n\n  # Rate at which x velocity slows when on the ground\n  groundFriction = 3600\n  airFriction = 120\n\n  movementX = 0\n\n  standing = false\n  jumpCount = 0 # Track double jumps, etc\n  lastStanding = 0 # seconds since player was last standing on the ground\n  lastJumping = 100 # seconds since player last jumped\n  jumpReleased = true # if the player has released the jump button since pressing it\n  fastFall = false # when holding down fall faster\n  lastDirection = 1\n\n  player.x = 256\n  player.y = 256\n\n  player.scale.set(0.5)\n  player.anchor.set(0.5)\n\n  updateInput = (dt) ->\n    movementX = 0\n\n    unless keydown(\"ArrowUp\")\n      unless jumpReleased # short jump\n        if velocity.y <= -900\n          velocity.y += 750\n      jumpReleased = true\n\n    if keydown(\"ArrowLeft\")\n      lastDirection = movementX = -1\n\n    if keydown(\"ArrowRight\")\n      lastDirection = movementX = +1\n\n    fastFall = keydown(\"ArrowDown\") or 0\n\n    if keydown(\"ArrowUp\") and lastJumping >= 0.25 and jumpReleased\n      jumpReleased = false\n      lastJumping = 0\n      velocity.x += movementX * jumpDirectionalImpulse\n\n      if lastStanding <= 0.1 # Jump\n        jumpCount = 1\n        velocity.y = jumpImpulse\n        player.emit(\"jump\")\n      else if jumpCount < 2 # Double Jump / Air Jump\n        # The player can get two jumps of this style by walking off a ledge then\n        # doing their first jump\n        ratio = (5 - jumpCount) / 6\n        velocity.y = ratio * jumpImpulse\n        jumpCount += 1\n        player.emit(\"jump\")\n    else\n      lastJumping += dt\n\n    acc = movementAcceleration\n\n    if movementX is -sign(velocity.x)\n      velocity.x += 2 * movementX * acc * dt\n    else\n      velocity.x += movementX * acc * dt\n\n  player.update = (dt, collisionGeometry) ->\n    updateInput(dt)\n\n    if !movementX\n      if standing\n        friction = groundFriction\n      else\n        friction = airFriction\n    else\n      friction = 0\n\n    velocity.x = approach velocity.x, 0, friction * dt\n\n    # gravity is doubled when fastFalling\n    velocity.y += gravity * (fastFall + 1) * dt\n\n    # Clamp velocity to max\n    if velocity.x > maxVelocityX\n      velocity.x = maxVelocityX\n    if velocity.x < -maxVelocityX\n      velocity.x = -maxVelocityX\n\n    if velocity.y > maxVelocityY\n      velocity.y = maxVelocityY\n    if velocity.y < -maxVelocityY\n      velocity.y = -maxVelocityY\n\n    dx = velocity.x * dt + residual.x\n    dy = velocity.y * dt + residual.y\n\n    # This is the 'global' bounds and is affected by the scale and offset of the\n    # parent container, not really what we want\n    # player.getBounds true, bounds\n\n    # This is the bounds 'inside' the sprite and is affected by the scale and anchor\n    # of the player, also not what we want\n    # player.getLocalBounds bounds\n\n    # Therefore we get the bounds ourself, the player's position within the 'world'\n    # without being affected by any pan and zoom the camera has applied\n\n    # Update bounds\n    bounds.x = player.x\n    bounds.y = player.y\n    bounds.width = player.width\n    bounds.height = player.height\n\n    # Check Collisions one pixel at a time\n    # Carry residual over into next frame\n    signX = sign(dx)\n    residual.x = dx - (dx|0)\n    n = abs(dx|0)\n    while n > 0\n      n--\n      bounds.x += signX\n\n      if !collides(bounds, collisionGeometry)\n        player.x += signX\n      else\n        velocity.x = 0\n        residual.x = 0\n\n    # Reset to existing bounds\n    bounds.x = player.x\n\n    signY = sign(dy)\n    residual.y = dy - (dy|0)\n    n = abs(dy|0)\n    while n > 0\n      n--\n      bounds.y += signY\n\n      if !collides(bounds, collisionGeometry)\n        player.y += signY\n      else\n        velocity.y = 0\n        residual.y = 0\n\n    # Check for floor beneath\n    bounds.y = player.y + 1\n    standing = collides(bounds, collisionGeometry)\n\n    # Landed if we weren't standing and now we are\n    if lastStanding > 0.1 and standing\n      player.emit \"land\"\n\n    if standing\n      lastStanding = 0\n      jumpCount = 0\n    else\n      lastStanding += dt\n\n    # Should just be lastDirection but the placeholder sprite is facing left and larger\n    player.scale.x = -1/2 * lastDirection\n\n  Object.assign player, {\n    bounds\n    velocity\n  }\n\n  return player\n\ngetTileBounds = (tile, rect) ->\n  rect.x = tile.x + tile.width/2\n  rect.y = tile.y + tile.height/2\n  rect.width = tile.width\n  rect.height = tile.height\n\n  return rect\n\ntestRect = new Rectangle\n\ncollides = (bounds, objects) ->\n  i = 0\n  length = objects.length\n\n  while i < length\n    result = hitTestRectangle2(bounds, getTileBounds(objects[i], testRect))\n    if result\n      return result\n    i += 1\n\napproach = (value, target, maxDelta) ->\n  value + clamp(target - value, -maxDelta, maxDelta)\n",
      "mode": "100644",
      "type": "blob"
    },
    "notes/movement.md": {
      "path": "notes/movement.md",
      "content": "Movement\n========\n\nThese are some cool ways to move.\n\nDouble Jump - Jump again while in the air\nShort Jump - Jump less high if a player releases jump soon after pressing it\nLate Jump - Jump a frame or two after moving off a ledge\nForward/Backward Jump - Gain an impulse when holding a direction when jumping\nFast Fall - Drop faster when holding down\n",
      "mode": "100644",
      "type": "blob"
    },
    "notes/performance.md": {
      "path": "notes/performance.md",
      "content": "Performance\n===========\n\nI'm trying to do this with zero allocations every update frame. Previously I did\na lot more with \"nice\" APIs but this time it's all about zero allocations.\n\nI want to use all the perf to handle many projectiles and lots of crazy interactions.\n",
      "mode": "100644",
      "type": "blob"
    },
    "pixie.cson": {
      "path": "pixie.cson",
      "content": "name: \"Axe Blaster\"\nversion: \"0.1.0\"\nwidth: 1280\nheight: 720\nentryPoint: \"main\" # \"experiments/intro\"\npublish:\n  s3:\n    basePath: \"public/danielx.net\"\ndependencies:\n  fxz: \"STRd6/fxz:master\"\nremoteDependencies: [\n  \"https://pixijs.download/v4.6.0/pixi.js\"\n]\n",
      "mode": "100644",
      "type": "blob"
    },
    "scenes/intro.coffee": {
      "path": "scenes/intro.coffee",
      "content": "###\nAn intro that presents the following title cards:\n\n- Whimsy.Space Games\n\n- in association with\n  Daniel X. Moore\n\n###\n\n{width, height} = require \"../pixie\"\n\n{Container, Graphics, Point, Rectangle, Sprite, Text, Texture} = PIXI\n\nloader = new PIXI.loaders.Loader\n\n{min, max} = Math\n\nstage = new Container()\n\nwhiteBg = new Graphics()\nwhiteBg.beginFill 0xFFFFFF\nwhiteBg.drawRect 100, 100, width, height\nstage.addChild whiteBg\n\n# Fade to black bg\nbg = new Graphics()\nbg.beginFill 0x000000\nbg.drawRect 0, 0, width, height\nbg.alpha = 0\nstage.addChild bg\n\ntoLetters = (letters) ->\n  letters.split(\"\").map (letter) ->\n    new Text letter,\n      align: \"center\"\n      fill: \"black\"\n      fontSize: \"128px\"\n      fontFamily: \"courier\"\n\nletterSprites = toLetters(\"Whimsy.Space\").map (text, i) ->\n  shift = (i * 5 + 5) % 12 - 128\n  text.x = (i + 3) * width / 18\n  text.y = height / 2 + shift\n  text.visible = true\n\n  stage.addChild text\n\n  return text\n.concat toLetters(\"Games\").map (text, i) ->\n  shift = ((i * 5 + 7)) % 12\n  text.x = (i + 6.5) * width / 18\n  text.y = height / 2 + shift\n  text.visible = true\n\n  stage.addChild text\n\n  return text\n\n# In Association With\nassocText = do ->\n  text = new Text \"in association with\\n\\nDANIEL X. MOORE\",\n    align: \"center\"\n    fill: \"white\"\n    fontFamily: \"helvetica\"\n    fontSize: \"64px\"\n    fontStyle: \"bold italic\"\n\n  text.alpha = 0\n  text.anchor.set 0.5\n  text.x = width / 2\n  text.y = height / 2\n\n  stage.addChild text\n\n  return text\n\ntimings = [\n  0.063\n  0.189\n  0.333\n  0.578\n  0.817\n  1.091\n  1.448\n  1.747\n  1.925\n  2.131\n  2.308\n  2.472\n  3.765\n  3.998\n  4.153\n  4.330\n  4.728\n]\n\nmodule.exports = ->\n  stage.update = (dt) ->\n    if loaded and t is 0 # First update after loading\n      loader.resources.typing.data.play()\n\n    if t >= 10\n      stage.emit('complete')\n\n    letterSprites.forEach (letter, i) ->\n      letter.visible = t > timings[i]\n\n    bg.alpha = max((t - 5.25)/0.875, 0)\n    assocText.alpha = max((t - 6.5)/0.875, 0)\n\n    if t > 8.375\n      assocText.alpha = 1 - max((t - 8.375)/0.875, 0)\n\n    if loaded\n      t += dt\n\n  dt = 1 / 60\n  t = 0\n  loaded = false\n\n  loader.add([\n    {name: \"typing\", url: \"https://danielx.whimsy.space/axe-blaster/type.ogg\"}\n  ])\n  .load ->\n    loaded = true\n\n  return stage\n",
      "mode": "100644",
      "type": "blob"
    },
    "scenes/platformer.coffee": {
      "path": "scenes/platformer.coffee",
      "content": "{width, height} = require \"../pixie\"\n\n{Container} = PIXI\n\naudioContext = new AudioContext\n\nMapReader = require \"../lib/map-reader\"\nMapChunk = require \"../models/map-chunk\"\nPlayer = require \"../models/player\"\nPanzoom = require \"../lib/panzoom\"\n\nFXXPlayer = require \"../lib/fxx-player\"\n\nloader = new PIXI.loaders.Loader\n\nplayAudio = (audio, volume=1, repeat) ->\n  audio.volume = volume\n  audio.play()\n\nmodule.exports = (renderer) ->\n  # Create a container object called the `stage`\n  stage = new Container()\n  world = new Container() # Panable and zoomable game area\n  overlay = new Container() # UI and fixed position things\n\n  Panzoom(renderer, world)\n\n  stage.addChild world\n  stage.addChild overlay\n\n  player = null\n  chunk = null\n\n  loader.add([\n    {name: \"pika\", url: \"https://2.pixiecdn.com/sprites/137922/original.png?1\"}\n    {name: \"sheet\", url: \"https://danielx.whimsy.space/axe-blaster/platformertiles.png\"}\n    {name: \"map\", url: \"https://danielx.whimsy.space/axe-blaster/map.png\"}\n    {name: \"theme\", url: \"https://danielx.whimsy.space/axe-blaster/Theme to Red Ice.ogg\"}\n    {name: \"fxx\", url: \"https://danielx.whimsy.space/axe-blaster/sound.fxx\"}\n  ])\n  .on \"progress\", ({progress}) ->\n    ;# progressElement.value = progress\n  .load ->\n    chunk = MapChunk loader.resources.sheet.texture, MapReader(loader.resources.map.texture.baseTexture.source)\n    world.addChild chunk\n\n    player = Player(loader.resources.pika.texture)\n    player.velocity.set(100, -1000)\n\n    console.log loader.resources.fxx.data\n\n    fxxPlayer = FXXPlayer(loader.resources.fxx.data, audioContext)\n\n    player.on \"jump\", ->\n      fxxPlayer.play(\"jump\")\n\n    player.on \"land\", ->\n      fxxPlayer.play(\"land\")\n\n    world.addChild(player)\n\n  stage.update = (dt, game) ->\n    # Handle player collisions\n    # Handle player input\n    if player\n      player.update(dt, chunk.children)\n\n      # Update camera\n      world.pivot.x = player.x - (width / world.scale.x) / 2\n      world.pivot.y = player.y - (height / world.scale.y) / 2\n\n      game.debugText \"\"\"\n        pivot: #{world.pivot}\n        scale: #{world.scale}\n\n        player.bounds: #{player.bounds}\n        player.velocity: #{player.velocity}\n      \"\"\"\n\n  return stage\n",
      "mode": "100644",
      "type": "blob"
    },
    "setup.coffee": {
      "path": "setup.coffee",
      "content": "styleNode = document.createElement(\"style\")\nstyleNode.innerHTML = require('./style')\ndocument.head.appendChild(styleNode)\n\n# FPS Display\nStats = require \"./lib/stats.min\"\nglobal.stats = new Stats\ndocument.body.appendChild stats.dom\n\n# Extend PIXI points with a decent default toString\n{ObservablePoint, Point, Rectangle} = PIXI\npointToString = ->\n  \"#{@x}, #{@y}\"\nObservablePoint::toString = pointToString\nPoint::toString = pointToString\n\nRectangle::toString = ->\n  \"#{@x},#{@y},#{@width},#{@height}\"\n\n# Add resource type mappings\n{Resource} = PIXI.loaders\nResource._xhrTypeMap['fxx'] = Resource.XHR_RESPONSE_TYPE.BUFFER\n\n# Math extensions\n{min, max} = Math\nMath.clamp = (number, lower, upper) ->\n  max(min(number, upper), lower)\n",
      "mode": "100644",
      "type": "blob"
    },
    "style.styl": {
      "path": "style.styl",
      "content": "html\n  background-color: black\n  display: flex\n  height: 100%\n\nbody\n  display: flex\n  flex: 1\n  margin: 0\n\nbody > canvas\n  display: block\n  margin: auto\n  position: relative\n\nbody > content\n  display: block\n  margin: auto\n  position: relative\n\n  > pre.debug\n    color: white\n    margin: 1em\n    pointer-events: none\n    position: absolute\n\n  > progress\n    bottom: 0\n    left: 0\n    margin: auto\n    position: absolute\n    right: 0\n    top: 0\n\n    &[value=\"100\"]\n      display: none\n",
      "mode": "100644",
      "type": "blob"
    },
    "lib/fxx-player.coffee": {
      "path": "lib/fxx-player.coffee",
      "content": "FXZ = require \"fxz\"\n\nmodule.exports = (fxxBuffer, context) ->\n  context ?= new AudioContext\n  sounds = {}\n\n  parseName = (nameBuffer) ->\n    lastNull = nameBuffer.indexOf(0)\n\n    if lastNull >= 0\n      nameBuffer = nameBuffer.slice(0, lastNull)\n\n    name = new TextDecoder(\"utf-8\").decode(nameBuffer)\n\n  fxxData = new Uint8Array(fxxBuffer)\n  l = fxxData.length\n\n  numEntries = Math.floor (l - 8) / 116\n\n  # Populate data entries\n  data = {}\n  n = 0\n  while n < numEntries\n    # Parse Name\n    p = n * 116 + 8\n    name = parseName fxxData.slice(p, p + 16)\n\n    # Synthesize Waveform\n    buffer = fxxData.slice(p + 16, p + 116)\n    sounds[name] = FXZ buffer.buffer, context\n    n += 1\n\n  play: (name) ->\n    audioBuffer = sounds[name]\n\n    node = new AudioBufferSourceNode context,\n      buffer: audioBuffer\n    node.connect context.destination\n\n    node.start()\n",
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
    "lib/keyboard": {
      "path": "lib/keyboard",
      "content": "(function() {\n  module.exports = (function() {\n    var down;\n    down = {};\n    window.addEventListener(\"keydown\", function(_arg) {\n      var key;\n      key = _arg.key;\n      return down[key] = true;\n    });\n    window.addEventListener(\"keyup\", function(_arg) {\n      var key;\n      key = _arg.key;\n      return down[key] = false;\n    });\n    return {\n      keydown: function(name) {\n        return down[name];\n      }\n    };\n  })();\n\n}).call(this);\n",
      "type": "blob"
    },
    "lib/map-reader": {
      "path": "lib/map-reader",
      "content": "(function() {\n  module.exports = function(source) {\n    var canvas, context, data, extract, height, imageData, width;\n    width = source.width, height = source.height;\n    canvas = document.createElement(\"canvas\");\n    canvas.width = source.width;\n    canvas.height = source.height;\n    context = canvas.getContext(\"2d\");\n    context.drawImage(source, 0, 0);\n    imageData = context.getImageData(0, 0, width, height);\n    extract = function(data, n) {\n      return data[n * 4 + 3] && 1;\n    };\n    data = new Uint8Array(width * height);\n    data.forEach(function(_, i) {\n      return data[i] = extract(imageData.data, i);\n    });\n    (function() {\n      var y, _results;\n      y = 0;\n      _results = [];\n      while (y < height) {\n        console.log(data.slice(y * 64, (y + 1) * 64).join(\"\"));\n        _results.push(y += 1);\n      }\n      return _results;\n    });\n    return {\n      width: width,\n      height: height,\n      data: data\n    };\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "lib/panzoom": {
      "path": "lib/panzoom",
      "content": "(function() {\n  var Point;\n\n  Point = PIXI.Point;\n\n\n  /*\n  Pan with middle click and Zoom with mouse wheel.\n  \n  The renderer tracks mouse interactions, though we also need to attach some\n  events on the document so we scroll smoothly and detect releases when the mouse\n  moves outside of the renderer element.\n  \n  The pan and zoom is accomplished by transforming the scale and pivot of a\n  given container so that it can be panned and zoomed independently of any\n  UI/Overlay objects.\n   */\n\n  module.exports = function(renderer, world) {\n    var active, mouse, prev;\n    mouse = renderer.plugins.interaction.mouse;\n    active = false;\n    prev = new Point;\n    renderer.view.addEventListener(\"mousedown\", function(e) {\n      if (e.button !== 1) {\n        return;\n      }\n      active = true;\n      return prev.copy(mouse.global);\n    });\n    document.addEventListener(\"mouseup\", function(e) {\n      if (e.button !== 1) {\n        return;\n      }\n      return active = false;\n    });\n    document.addEventListener(\"mousemove\", function(e) {\n      var deltaX, deltaY;\n      if (!active) {\n        return;\n      }\n      deltaX = mouse.global.x - prev.x;\n      deltaY = mouse.global.y - prev.y;\n      prev.copy(mouse.global);\n      world.pivot.x -= deltaX / world.scale.x;\n      return world.pivot.y -= deltaY / world.scale.y;\n    });\n    return renderer.view.addEventListener(\"mousewheel\", function(e) {\n      var deltaZoom, newPosition, prevPosition;\n      e.preventDefault();\n      deltaZoom = Math.pow(2, -e.deltaY / Math.abs(e.deltaY));\n      prevPosition = world.toLocal(mouse.global);\n      world.scale.x *= deltaZoom;\n      world.scale.y *= deltaZoom;\n      if (world.scale.x < 0.125) {\n        world.scale.set(0.125);\n      }\n      if (world.scale.x > 8) {\n        world.scale.set(8);\n      }\n      newPosition = world.toLocal(mouse.global);\n      world.pivot.x -= newPosition.x - prevPosition.x;\n      return world.pivot.y -= newPosition.y - prevPosition.y;\n    });\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "lib/stats.min": {
      "path": "lib/stats.min",
      "content": "// stats.js - http://github.com/mrdoob/stats.js\r\n(function(f,e){\"object\"===typeof exports&&\"undefined\"!==typeof module?module.exports=e():\"function\"===typeof define&&define.amd?define(e):f.Stats=e()})(this,function(){var f=function(){function e(a){c.appendChild(a.dom);return a}function u(a){for(var d=0;d<c.children.length;d++)c.children[d].style.display=d===a?\"block\":\"none\";l=a}var l=0,c=document.createElement(\"div\");c.style.cssText=\"position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000\";c.addEventListener(\"click\",function(a){a.preventDefault();\r\nu(++l%c.children.length)},!1);var k=(performance||Date).now(),g=k,a=0,r=e(new f.Panel(\"FPS\",\"#0ff\",\"#002\")),h=e(new f.Panel(\"MS\",\"#0f0\",\"#020\"));if(self.performance&&self.performance.memory)var t=e(new f.Panel(\"MB\",\"#f08\",\"#201\"));u(0);return{REVISION:16,dom:c,addPanel:e,showPanel:u,begin:function(){k=(performance||Date).now()},end:function(){a++;var c=(performance||Date).now();h.update(c-k,200);if(c>g+1E3&&(r.update(1E3*a/(c-g),100),g=c,a=0,t)){var d=performance.memory;t.update(d.usedJSHeapSize/\r\n1048576,d.jsHeapSizeLimit/1048576)}return c},update:function(){k=this.end()},domElement:c,setMode:u}};f.Panel=function(e,f,l){var c=Infinity,k=0,g=Math.round,a=g(window.devicePixelRatio||1),r=80*a,h=48*a,t=3*a,v=2*a,d=3*a,m=15*a,n=74*a,p=30*a,q=document.createElement(\"canvas\");q.width=r;q.height=h;q.style.cssText=\"width:80px;height:48px\";var b=q.getContext(\"2d\");b.font=\"bold \"+9*a+\"px Helvetica,Arial,sans-serif\";b.textBaseline=\"top\";b.fillStyle=l;b.fillRect(0,0,r,h);b.fillStyle=f;b.fillText(e,t,v);\r\nb.fillRect(d,m,n,p);b.fillStyle=l;b.globalAlpha=.9;b.fillRect(d,m,n,p);return{dom:q,update:function(h,w){c=Math.min(c,h);k=Math.max(k,h);b.fillStyle=l;b.globalAlpha=1;b.fillRect(0,0,r,m);b.fillStyle=f;b.fillText(g(h)+\" \"+e+\" (\"+g(c)+\"-\"+g(k)+\")\",t,v);b.drawImage(q,d+a,m,n-a,p,d,m,n-a,p);b.fillRect(d+n-a,m,a,p);b.fillStyle=l;b.globalAlpha=.9;b.fillRect(d+n-a,m,a,g((1-h/w)*p))}}};return f});\n",
      "type": "blob"
    },
    "lib/util": {
      "path": "lib/util",
      "content": "(function() {\n  var abs;\n\n  abs = Math.abs;\n\n  module.exports = {\n    hitTestRectangle: function(r1, r2) {\n      var combinedHalfHeights, combinedHalfWidths, vx, vy;\n      r1.centerX = r1.x + r1.width / 2;\n      r1.centerY = r1.y + r1.height / 2;\n      r2.centerX = r2.x + r2.width / 2;\n      r2.centerY = r2.y + r2.height / 2;\n      r1.halfWidth = r1.width / 2;\n      r1.halfHeight = r1.height / 2;\n      r2.halfWidth = r2.width / 2;\n      r2.halfHeight = r2.height / 2;\n      vx = r1.centerX - r2.centerX;\n      vy = r1.centerY - r2.centerY;\n      combinedHalfWidths = r1.halfWidth + r2.halfWidth;\n      combinedHalfHeights = r1.halfHeight + r2.halfHeight;\n      return abs(vx) < combinedHalfWidths && abs(vy) < combinedHalfHeights;\n    },\n    hitTestRectangle2: function(a, b) {\n      return (abs(a.x - b.x) * 2 < (a.width + b.width)) && (abs(a.y - b.y) * 2 < (a.height + b.height));\n    }\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "main": {
      "path": "main",
      "content": "(function() {\n  var Game, Intro, Platformer, game, height, introScene, platformerScene, width, _ref;\n\n  require(\"./setup\");\n\n  Game = require(\"./models/game\");\n\n  Intro = require(\"./scenes/intro\");\n\n  Platformer = require(\"./scenes/platformer\");\n\n  _ref = require(\"./pixie\"), width = _ref.width, height = _ref.height;\n\n  game = Game({\n    width: width,\n    height: height\n  });\n\n  document.body.appendChild(game.element);\n\n  introScene = Intro();\n\n  platformerScene = Platformer(game.renderer);\n\n  game.setScene(platformerScene);\n\n  introScene.on(\"complete\", function() {\n    return game.setScene(platformerScene);\n  });\n\n}).call(this);\n",
      "type": "blob"
    },
    "models/game": {
      "path": "models/game",
      "content": "\n/*\nCreate the renderer and game loop.\nAppend stats and things to the dom\n\nCalls the active scene's update method and renders it in the PIXI renderer.\n */\n\n(function() {\n  var Container, Point, Rectangle, Sprite, Text, Texture, loader, nullScene;\n\n  loader = PIXI.loader, Container = PIXI.Container, Point = PIXI.Point, Rectangle = PIXI.Rectangle, Sprite = PIXI.Sprite, Text = PIXI.Text, Texture = PIXI.Texture;\n\n  nullScene = new Container;\n\n  nullScene.update = function() {};\n\n  module.exports = function(_arg) {\n    var activeScene, contentElement, debugText, dt, gameLoop, height, nextScene, renderer, self, width;\n    width = _arg.width, height = _arg.height;\n    renderer = PIXI.autoDetectRenderer(width, height, {\n      antialias: false,\n      transparent: false,\n      resolution: 1\n    });\n    contentElement = document.createElement(\"content\");\n    debugText = document.createElement(\"pre\");\n    debugText.classList.add(\"debug\");\n    contentElement.appendChild(debugText);\n    contentElement.appendChild(renderer.view);\n    activeScene = nullScene;\n    nextScene = activeScene;\n    self = {\n      element: contentElement,\n      renderer: renderer,\n      setScene: function(scene) {\n        return nextScene = scene;\n      },\n      debugText: function(text) {\n        return debugText.textContent = text;\n      }\n    };\n    dt = 1 / 60;\n    gameLoop = function() {\n      requestAnimationFrame(gameLoop);\n      stats.begin();\n      if (nextScene !== activeScene) {\n        activeScene.emit(\"exit\");\n        activeScene = nextScene;\n        activeScene.emit(\"enter\");\n      }\n      activeScene.update(dt, self);\n      renderer.render(activeScene);\n      return stats.end();\n    };\n    gameLoop();\n    return self;\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "models/map-chunk": {
      "path": "models/map-chunk",
      "content": "(function() {\n  var Container, Rectangle, Sprite, Text, Texture, autoTileIndexes, getAutoTileIndex, neighbors;\n\n  Container = PIXI.Container, Sprite = PIXI.Sprite, Text = PIXI.Text, Texture = PIXI.Texture, Rectangle = PIXI.Rectangle;\n\n  autoTileIndexes = [[1, 1], [4, 2], [4, 0, 2], [0, 2], [4, 0], [4, 1], [0, 0], [0, 1], [4, 2, 2], [2, 2], [4, 1, 2], [1, 2], [2, 0], [2, 1], [1, 0], [1, 1]];\n\n  neighbors = [[0, -1], [1, 0], [0, 1], [-1, 0]];\n\n  getAutoTileIndex = function(index, _arg) {\n    var data, height, width, x, y;\n    width = _arg.width, height = _arg.height, data = _arg.data;\n    x = index % width;\n    y = (index / width) | 0;\n    return neighbors.reduce(function(acc, _arg1, n) {\n      var dx, dy, m, px, py;\n      dx = _arg1[0], dy = _arg1[1];\n      m = Math.pow(2, n);\n      px = x + dx;\n      py = y + dy;\n      if (((0 <= px && px < width)) && ((0 <= py && py < height))) {\n        return acc + data[py * width + px] * m;\n      } else {\n        return acc + m;\n      }\n    }, 0);\n  };\n\n  module.exports = function(texture, mapData) {\n    var container, defaultTexture, tileTextures;\n    tileTextures = autoTileIndexes.map(function(_arg) {\n      var rotate, x, y;\n      x = _arg[0], y = _arg[1], rotate = _arg[2];\n      return new Texture(texture, new Rectangle(32 * x, 32 * y, 32, 32), null, null, rotate);\n    });\n    defaultTexture = tileTextures[0];\n    container = new Container;\n    (function(_arg) {\n      var data, height, width;\n      data = _arg.data, width = _arg.width, height = _arg.height;\n      return data.forEach(function(value, i) {\n        var block, tIndex, tex, x, y;\n        x = i % width;\n        y = (i / width) | 0;\n        if (value) {\n          tIndex = getAutoTileIndex(i, mapData);\n          tex = tileTextures[tIndex] || defaultTexture;\n          block = new Sprite(tex);\n          block.x = x * 32;\n          block.y = y * 32;\n          return container.addChild(block);\n        }\n      });\n    })(mapData);\n    return container;\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "models/player": {
      "path": "models/player",
      "content": "(function() {\n  var Point, Rectangle, Sprite, abs, approach, clamp, collides, getTileBounds, hitTestRectangle2, keydown, sign, testRect;\n\n  Point = PIXI.Point, Rectangle = PIXI.Rectangle, Sprite = PIXI.Sprite;\n\n  abs = Math.abs, clamp = Math.clamp, sign = Math.sign;\n\n  hitTestRectangle2 = require(\"../lib/util\").hitTestRectangle2;\n\n  keydown = require(\"../lib/keyboard\").keydown;\n\n  module.exports = function(texture) {\n    var airFriction, bounds, fastFall, gravity, groundFriction, jumpCount, jumpDirectionalImpulse, jumpImpulse, jumpReleased, lastDirection, lastJumping, lastStanding, maxVelocityX, maxVelocityY, movementAcceleration, movementX, player, position, residual, standing, updateInput, velocity;\n    player = new Sprite(texture);\n    position = player.position;\n    bounds = new Rectangle;\n    residual = new Point;\n    velocity = new Point;\n    gravity = 3600;\n    jumpImpulse = -1350;\n    jumpDirectionalImpulse = 120;\n    movementAcceleration = 900;\n    maxVelocityX = 600;\n    maxVelocityY = 1800;\n    groundFriction = 3600;\n    airFriction = 120;\n    movementX = 0;\n    standing = false;\n    jumpCount = 0;\n    lastStanding = 0;\n    lastJumping = 100;\n    jumpReleased = true;\n    fastFall = false;\n    lastDirection = 1;\n    player.x = 256;\n    player.y = 256;\n    player.scale.set(0.5);\n    player.anchor.set(0.5);\n    updateInput = function(dt) {\n      var acc, ratio;\n      movementX = 0;\n      if (!keydown(\"ArrowUp\")) {\n        if (!jumpReleased) {\n          if (velocity.y <= -900) {\n            velocity.y += 750;\n          }\n        }\n        jumpReleased = true;\n      }\n      if (keydown(\"ArrowLeft\")) {\n        lastDirection = movementX = -1;\n      }\n      if (keydown(\"ArrowRight\")) {\n        lastDirection = movementX = +1;\n      }\n      fastFall = keydown(\"ArrowDown\") || 0;\n      if (keydown(\"ArrowUp\") && lastJumping >= 0.25 && jumpReleased) {\n        jumpReleased = false;\n        lastJumping = 0;\n        velocity.x += movementX * jumpDirectionalImpulse;\n        if (lastStanding <= 0.1) {\n          jumpCount = 1;\n          velocity.y = jumpImpulse;\n          player.emit(\"jump\");\n        } else if (jumpCount < 2) {\n          ratio = (5 - jumpCount) / 6;\n          velocity.y = ratio * jumpImpulse;\n          jumpCount += 1;\n          player.emit(\"jump\");\n        }\n      } else {\n        lastJumping += dt;\n      }\n      acc = movementAcceleration;\n      if (movementX === -sign(velocity.x)) {\n        return velocity.x += 2 * movementX * acc * dt;\n      } else {\n        return velocity.x += movementX * acc * dt;\n      }\n    };\n    player.update = function(dt, collisionGeometry) {\n      var dx, dy, friction, n, signX, signY;\n      updateInput(dt);\n      if (!movementX) {\n        if (standing) {\n          friction = groundFriction;\n        } else {\n          friction = airFriction;\n        }\n      } else {\n        friction = 0;\n      }\n      velocity.x = approach(velocity.x, 0, friction * dt);\n      velocity.y += gravity * (fastFall + 1) * dt;\n      if (velocity.x > maxVelocityX) {\n        velocity.x = maxVelocityX;\n      }\n      if (velocity.x < -maxVelocityX) {\n        velocity.x = -maxVelocityX;\n      }\n      if (velocity.y > maxVelocityY) {\n        velocity.y = maxVelocityY;\n      }\n      if (velocity.y < -maxVelocityY) {\n        velocity.y = -maxVelocityY;\n      }\n      dx = velocity.x * dt + residual.x;\n      dy = velocity.y * dt + residual.y;\n      bounds.x = player.x;\n      bounds.y = player.y;\n      bounds.width = player.width;\n      bounds.height = player.height;\n      signX = sign(dx);\n      residual.x = dx - (dx | 0);\n      n = abs(dx | 0);\n      while (n > 0) {\n        n--;\n        bounds.x += signX;\n        if (!collides(bounds, collisionGeometry)) {\n          player.x += signX;\n        } else {\n          velocity.x = 0;\n          residual.x = 0;\n        }\n      }\n      bounds.x = player.x;\n      signY = sign(dy);\n      residual.y = dy - (dy | 0);\n      n = abs(dy | 0);\n      while (n > 0) {\n        n--;\n        bounds.y += signY;\n        if (!collides(bounds, collisionGeometry)) {\n          player.y += signY;\n        } else {\n          velocity.y = 0;\n          residual.y = 0;\n        }\n      }\n      bounds.y = player.y + 1;\n      standing = collides(bounds, collisionGeometry);\n      if (lastStanding > 0.1 && standing) {\n        player.emit(\"land\");\n      }\n      if (standing) {\n        lastStanding = 0;\n        jumpCount = 0;\n      } else {\n        lastStanding += dt;\n      }\n      return player.scale.x = -1 / 2 * lastDirection;\n    };\n    Object.assign(player, {\n      bounds: bounds,\n      velocity: velocity\n    });\n    return player;\n  };\n\n  getTileBounds = function(tile, rect) {\n    rect.x = tile.x + tile.width / 2;\n    rect.y = tile.y + tile.height / 2;\n    rect.width = tile.width;\n    rect.height = tile.height;\n    return rect;\n  };\n\n  testRect = new Rectangle;\n\n  collides = function(bounds, objects) {\n    var i, length, result;\n    i = 0;\n    length = objects.length;\n    while (i < length) {\n      result = hitTestRectangle2(bounds, getTileBounds(objects[i], testRect));\n      if (result) {\n        return result;\n      }\n      i += 1;\n    }\n  };\n\n  approach = function(value, target, maxDelta) {\n    return value + clamp(target - value, -maxDelta, maxDelta);\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "pixie": {
      "path": "pixie",
      "content": "module.exports = {\"name\":\"Axe Blaster\",\"version\":\"0.1.0\",\"width\":1280,\"height\":720,\"entryPoint\":\"main\",\"publish\":{\"s3\":{\"basePath\":\"public/danielx.net\"}},\"dependencies\":{\"fxz\":\"STRd6/fxz:master\"},\"remoteDependencies\":[\"https://pixijs.download/v4.6.0/pixi.js\"]};",
      "type": "blob"
    },
    "scenes/intro": {
      "path": "scenes/intro",
      "content": "\n/*\nAn intro that presents the following title cards:\n\n- Whimsy.Space Games\n\n- in association with\n  Daniel X. Moore\n */\n\n(function() {\n  var Container, Graphics, Point, Rectangle, Sprite, Text, Texture, assocText, bg, height, letterSprites, loader, max, min, stage, timings, toLetters, whiteBg, width, _ref;\n\n  _ref = require(\"../pixie\"), width = _ref.width, height = _ref.height;\n\n  Container = PIXI.Container, Graphics = PIXI.Graphics, Point = PIXI.Point, Rectangle = PIXI.Rectangle, Sprite = PIXI.Sprite, Text = PIXI.Text, Texture = PIXI.Texture;\n\n  loader = new PIXI.loaders.Loader;\n\n  min = Math.min, max = Math.max;\n\n  stage = new Container();\n\n  whiteBg = new Graphics();\n\n  whiteBg.beginFill(0xFFFFFF);\n\n  whiteBg.drawRect(100, 100, width, height);\n\n  stage.addChild(whiteBg);\n\n  bg = new Graphics();\n\n  bg.beginFill(0x000000);\n\n  bg.drawRect(0, 0, width, height);\n\n  bg.alpha = 0;\n\n  stage.addChild(bg);\n\n  toLetters = function(letters) {\n    return letters.split(\"\").map(function(letter) {\n      return new Text(letter, {\n        align: \"center\",\n        fill: \"black\",\n        fontSize: \"128px\",\n        fontFamily: \"courier\"\n      });\n    });\n  };\n\n  letterSprites = toLetters(\"Whimsy.Space\").map(function(text, i) {\n    var shift;\n    shift = (i * 5 + 5) % 12 - 128;\n    text.x = (i + 3) * width / 18;\n    text.y = height / 2 + shift;\n    text.visible = true;\n    stage.addChild(text);\n    return text;\n  }).concat(toLetters(\"Games\").map(function(text, i) {\n    var shift;\n    shift = (i * 5 + 7) % 12;\n    text.x = (i + 6.5) * width / 18;\n    text.y = height / 2 + shift;\n    text.visible = true;\n    stage.addChild(text);\n    return text;\n  }));\n\n  assocText = (function() {\n    var text;\n    text = new Text(\"in association with\\n\\nDANIEL X. MOORE\", {\n      align: \"center\",\n      fill: \"white\",\n      fontFamily: \"helvetica\",\n      fontSize: \"64px\",\n      fontStyle: \"bold italic\"\n    });\n    text.alpha = 0;\n    text.anchor.set(0.5);\n    text.x = width / 2;\n    text.y = height / 2;\n    stage.addChild(text);\n    return text;\n  })();\n\n  timings = [0.063, 0.189, 0.333, 0.578, 0.817, 1.091, 1.448, 1.747, 1.925, 2.131, 2.308, 2.472, 3.765, 3.998, 4.153, 4.330, 4.728];\n\n  module.exports = function() {\n    var dt, loaded, t;\n    stage.update = function(dt) {\n      if (loaded && t === 0) {\n        loader.resources.typing.data.play();\n      }\n      if (t >= 10) {\n        stage.emit('complete');\n      }\n      letterSprites.forEach(function(letter, i) {\n        return letter.visible = t > timings[i];\n      });\n      bg.alpha = max((t - 5.25) / 0.875, 0);\n      assocText.alpha = max((t - 6.5) / 0.875, 0);\n      if (t > 8.375) {\n        assocText.alpha = 1 - max((t - 8.375) / 0.875, 0);\n      }\n      if (loaded) {\n        return t += dt;\n      }\n    };\n    dt = 1 / 60;\n    t = 0;\n    loaded = false;\n    loader.add([\n      {\n        name: \"typing\",\n        url: \"https://danielx.whimsy.space/axe-blaster/type.ogg\"\n      }\n    ]).load(function() {\n      return loaded = true;\n    });\n    return stage;\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "scenes/platformer": {
      "path": "scenes/platformer",
      "content": "(function() {\n  var Container, FXXPlayer, MapChunk, MapReader, Panzoom, Player, audioContext, height, loader, playAudio, width, _ref;\n\n  _ref = require(\"../pixie\"), width = _ref.width, height = _ref.height;\n\n  Container = PIXI.Container;\n\n  audioContext = new AudioContext;\n\n  MapReader = require(\"../lib/map-reader\");\n\n  MapChunk = require(\"../models/map-chunk\");\n\n  Player = require(\"../models/player\");\n\n  Panzoom = require(\"../lib/panzoom\");\n\n  FXXPlayer = require(\"../lib/fxx-player\");\n\n  loader = new PIXI.loaders.Loader;\n\n  playAudio = function(audio, volume, repeat) {\n    if (volume == null) {\n      volume = 1;\n    }\n    audio.volume = volume;\n    return audio.play();\n  };\n\n  module.exports = function(renderer) {\n    var chunk, overlay, player, stage, world;\n    stage = new Container();\n    world = new Container();\n    overlay = new Container();\n    Panzoom(renderer, world);\n    stage.addChild(world);\n    stage.addChild(overlay);\n    player = null;\n    chunk = null;\n    loader.add([\n      {\n        name: \"pika\",\n        url: \"https://2.pixiecdn.com/sprites/137922/original.png?1\"\n      }, {\n        name: \"sheet\",\n        url: \"https://danielx.whimsy.space/axe-blaster/platformertiles.png\"\n      }, {\n        name: \"map\",\n        url: \"https://danielx.whimsy.space/axe-blaster/map.png\"\n      }, {\n        name: \"theme\",\n        url: \"https://danielx.whimsy.space/axe-blaster/Theme to Red Ice.ogg\"\n      }, {\n        name: \"fxx\",\n        url: \"https://danielx.whimsy.space/axe-blaster/sound.fxx\"\n      }\n    ]).on(\"progress\", function(_arg) {\n      var progress;\n      progress = _arg.progress;\n    }).load(function() {\n      var fxxPlayer;\n      chunk = MapChunk(loader.resources.sheet.texture, MapReader(loader.resources.map.texture.baseTexture.source));\n      world.addChild(chunk);\n      player = Player(loader.resources.pika.texture);\n      player.velocity.set(100, -1000);\n      console.log(loader.resources.fxx.data);\n      fxxPlayer = FXXPlayer(loader.resources.fxx.data, audioContext);\n      player.on(\"jump\", function() {\n        return fxxPlayer.play(\"jump\");\n      });\n      player.on(\"land\", function() {\n        return fxxPlayer.play(\"land\");\n      });\n      return world.addChild(player);\n    });\n    stage.update = function(dt, game) {\n      if (player) {\n        player.update(dt, chunk.children);\n        world.pivot.x = player.x - (width / world.scale.x) / 2;\n        world.pivot.y = player.y - (height / world.scale.y) / 2;\n        return game.debugText(\"pivot: \" + world.pivot + \"\\nscale: \" + world.scale + \"\\n\\nplayer.bounds: \" + player.bounds + \"\\nplayer.velocity: \" + player.velocity);\n      }\n    };\n    return stage;\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "setup": {
      "path": "setup",
      "content": "(function() {\n  var ObservablePoint, Point, Rectangle, Resource, Stats, max, min, pointToString, styleNode;\n\n  styleNode = document.createElement(\"style\");\n\n  styleNode.innerHTML = require('./style');\n\n  document.head.appendChild(styleNode);\n\n  Stats = require(\"./lib/stats.min\");\n\n  global.stats = new Stats;\n\n  document.body.appendChild(stats.dom);\n\n  ObservablePoint = PIXI.ObservablePoint, Point = PIXI.Point, Rectangle = PIXI.Rectangle;\n\n  pointToString = function() {\n    return \"\" + this.x + \", \" + this.y;\n  };\n\n  ObservablePoint.prototype.toString = pointToString;\n\n  Point.prototype.toString = pointToString;\n\n  Rectangle.prototype.toString = function() {\n    return \"\" + this.x + \",\" + this.y + \",\" + this.width + \",\" + this.height;\n  };\n\n  Resource = PIXI.loaders.Resource;\n\n  Resource._xhrTypeMap['fxx'] = Resource.XHR_RESPONSE_TYPE.BUFFER;\n\n  min = Math.min, max = Math.max;\n\n  Math.clamp = function(number, lower, upper) {\n    return max(min(number, upper), lower);\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "style": {
      "path": "style",
      "content": "module.exports = \"html {\\n  background-color: #000;\\n  display: flex;\\n  height: 100%;\\n}\\nbody {\\n  display: flex;\\n  flex: 1;\\n  margin: 0;\\n}\\nbody > canvas {\\n  display: block;\\n  margin: auto;\\n  position: relative;\\n}\\nbody > content {\\n  display: block;\\n  margin: auto;\\n  position: relative;\\n}\\nbody > content > pre.debug {\\n  color: #fff;\\n  margin: 1em;\\n  pointer-events: none;\\n  position: absolute;\\n}\\nbody > content > progress {\\n  bottom: 0;\\n  left: 0;\\n  margin: auto;\\n  position: absolute;\\n  right: 0;\\n  top: 0;\\n}\\nbody > content > progress[value=\\\"100\\\"] {\\n  display: none;\\n}\\n\";",
      "type": "blob"
    },
    "lib/fxx-player": {
      "path": "lib/fxx-player",
      "content": "(function() {\n  var FXZ;\n\n  FXZ = require(\"fxz\");\n\n  module.exports = function(fxxBuffer, context) {\n    var buffer, data, fxxData, l, n, name, numEntries, p, parseName, sounds;\n    if (context == null) {\n      context = new AudioContext;\n    }\n    sounds = {};\n    parseName = function(nameBuffer) {\n      var lastNull, name;\n      lastNull = nameBuffer.indexOf(0);\n      if (lastNull >= 0) {\n        nameBuffer = nameBuffer.slice(0, lastNull);\n      }\n      return name = new TextDecoder(\"utf-8\").decode(nameBuffer);\n    };\n    fxxData = new Uint8Array(fxxBuffer);\n    l = fxxData.length;\n    numEntries = Math.floor((l - 8) / 116);\n    data = {};\n    n = 0;\n    while (n < numEntries) {\n      p = n * 116 + 8;\n      name = parseName(fxxData.slice(p, p + 16));\n      buffer = fxxData.slice(p + 16, p + 116);\n      sounds[name] = FXZ(buffer.buffer, context);\n      n += 1;\n    }\n    return {\n      play: function(name) {\n        var audioBuffer, node;\n        audioBuffer = sounds[name];\n        node = new AudioBufferSourceNode(context, {\n          buffer: audioBuffer\n        });\n        node.connect(context.destination);\n        return node.start();\n      }\n    };\n  };\n\n}).call(this);\n",
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
    "entryPoint": "main",
    "publish": {
      "s3": {
        "basePath": "public/danielx.net"
      }
    },
    "dependencies": {
      "fxz": "STRd6/fxz:master"
    },
    "remoteDependencies": [
      "https://pixijs.download/v4.6.0/pixi.js"
    ]
  },
  "version": "0.1.0",
  "entryPoint": "main",
  "remoteDependencies": [
    "https://pixijs.download/v4.6.0/pixi.js"
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
  "dependencies": {
    "fxz": {
      "source": {
        "README.md": {
          "path": "README.md",
          "content": "FXZ\n===\n\nA recreation of sfxr. Wish me luck! All credit for the synth goes to [Dr. Petter](http://www.drpetter.se/project_sfxr.html),\nI just ported a port and wrote down a binary format :)\n\nGoals\n-----\n\n- [ ] An embeddable synthesizer in < 1kb js (minified and gzipped)\n- [x] A binary format for saving and loading effects in 100 bytes\n- [ ] Synth implementations in common languages (C, C#, Java, Lua, etc.)\n\nFXZ Binary Format Specification\n-------------------------------\n\nFXZ data is 100 bytes long. All multi-byte numeric types are little endian.\n\n| Offset | Size | Type    | Field            | Range  |\n|--------|------|---------|------------------|--------|\n|  0     | 3    | ascii   | Magic Number     | 'fxz'  |\n|  3     | 1    | uint8   | version          | 1      |\n|  4     | 1    | uint8   | wave shape       | 0-3    |\n|  5     | 3    | -       | unused           | 0      |\n|  8     | 4    | float32 | attack time      | [ 0,1] |\n| 12     | 4    | float32 | sustain time     | [ 0,1] |\n| 16     | 4    | float32 | sustain punch    | [ 0,1] |\n| 20     | 4    | float32 | decay time       | [ 0,1] |\n| 24     | 4    | float32 | start frequency  | [ 0,1] |\n| 28     | 4    | float32 | frequency cutoff | [ 0,1] |\n| 32     | 4    | float32 | frequency slide  | [-1,1] |\n| 36     | 4    | float32 | delta slide      | [-1,1] |\n| 40     | 4    | float32 | vibrato depth    | [ 0,1] |\n| 44     | 4    | float32 | vibrato speed    | [ 0,1] |\n| 48     | 4    | float32 | arp amount       | [-1,1] |\n| 52     | 4    | float32 | arp change speed | [ 0,1] |\n| 56     | 4    | float32 | Square duty      | [ 0,1] |\n| 60     | 4    | float32 | Duty sweep       | [-1,1] |\n| 64     | 4    | float32 | Repeat speed     | [ 0,1] |\n| 68     | 4    | float32 | Flanger offset   | [-1,1] |\n| 72     | 4    | float32 | Flanger sweep    | [-1,1] |\n| 76     | 4    | float32 | LPF cutoff       | [ 0,1] |\n| 80     | 4    | float32 | LPF cutoff sweep | [-1,1] |\n| 84     | 4    | float32 | LPF resonance    | [ 0,1] |\n| 88     | 4    | float32 | HPF cutoff       | [ 0,1] |\n| 92     | 4    | float32 | HPF cutoff sweep | [-1,1] |\n| 96     | 4    | float32 | Volume           | [ 0,1] |\n\nRecommended MIME type `application/fxz`.\n\nRecommended file extension `.fxz`.\n\nFXX Binary Format Specification\n-------------------------------\n\nFXX is an FXZ Pack. It can contain up to uint32max entries. The size of the\npack is `8 + 116 * numberOfEntries` bytes. It adds 16 byte identifiers to each\nentry so they can be named. If you want them nameless to save those bytes you\ncan glob up fxz data, just smash them all together, I don't think it warrants a\nformal specification.\n\nAll multi-byte numeric types are little endian.\n\n| Offset | Size | Type    | Field            | Range        |\n|--------|------|---------|------------------|--------------|\n|  0     | 3    | ascii   | Magic Number     | 'fxx'        |\n|  3     | 1    | uint8   | version          | 1            |\n|  4     | 4    | uint32  | # of entries     | 0-4294967295 |\n|  *     | 16   | ascii   | fxz entry name   |              |\n|  *+16  | 100  | fxz     | fxz entry data   | valid fxz    |\n\n`* = 8 + n * 116` where `n = [0, 1, ..., numberOfEntries-1]`\n\nRecommended MIME type `application/fxx`.\n\nRecommended file extension `.fxx`.\n\nStatus\n------\n\nCurrently in beta. I want to review the synth and see if I can adjust the params\nto reduce the amount that create empty or \"bad\" sounds. Juice the most\ninformation out of those bits!\n\nI also want to investigate using the full float32 range or expanding the\nrecommended range and see what impact that will have, but I need to learn more\nabout how the synth operates to be sure. This could also involve humanizing the\nunits somewhat but it will require learning a lot more about the internals of\nthe synthesis.\n\nGlossary\n--------\n\n- freq: frequency\n- LPF: Low pass filter\n- vol: Volume\n",
          "mode": "100644",
          "type": "blob"
        },
        "fxz.js": {
          "path": "fxz.js",
          "content": "// Synthesize an AudioBuffer from the param data\nmodule.exports = (function() {\n  // Sound generation parameters are on [0,1] unless noted SIGNED & thus on [-1,1]\n  function Params() {\n    // Wave shape\n    this.shape = 0;\n\n    // Envelope\n    this.attack = 0;    // Attack time\n    this.sustain = 0.3; // Sustain time\n    this.punch = 0;     // Sustain punch\n    this.decay = 0.4;   // Decay time\n\n    // Tone\n    this.freq = 0.3;    // Start frequency\n    this.freqLimit = 0;   // Min frequency cutoff\n    this.freqSlide = 0;    // Slide (SIGNED)\n    this.freqSlideDelta = 0;   // Delta slide (SIGNED)\n    // Vibrato\n    this.vibDepth = 0; // Vibrato depth\n    this.vibSpeed = 0;    // Vibrato speed\n\n    // Tonal change\n    this.arpMod = 0;      // Change amount (SIGNED)\n    this.arpSpeed = 0;    // Change speed\n\n    // Square wave duty (proportion of time signal is high vs. low)\n    this.duty = 0;         // Square duty\n    this.dutySweep = 0;    // Duty sweep (SIGNED)\n\n    // Repeat\n    this.repeatSpeed = 0; // Repeat speed\n\n    // Flanger\n    this.flangerOffset = 0;   // Flanger offset (SIGNED)\n    this.flangerSweep = 0;     // Flanger sweep (SIGNED)\n\n    // Low-pass filter\n    this.lpf = 1;     // Low-pass filter cutoff\n    this.lpfSweep = 0;     // Low-pass filter cutoff sweep (SIGNED)\n    this.lpfResonance = 0;// Low-pass filter resonance\n    // High-pass filter\n    this.hpf = 0;     // High-pass filter cutoff\n    this.hpfSweep = 0;     // High-pass filter cutoff sweep (SIGNED)\n\n    // Sample parameters\n    this.vol = 0.5;\n  }\n\n  function FXZ(ps, audioContext) {\n    // Handle binary format\n    if (ps instanceof ArrayBuffer) {\n      ps = Serializer.deserialize(ps, new Params());\n    }\n\n    var m = Math;\n    var floor = m.floor,\n      pow = m.pow,\n      abs = m.abs,\n      random = m.random;\n\n    var SQUARE = 0,\n      SAWTOOTH = 1,\n      SINE = 2,\n      NOISE = 3,\n      OVERSAMPLING = 8,\n      sampleRate = 44100;\n\n    var i,\n      elapsedSinceRepeat,\n      period,\n      periodMax,\n      enableFrequencyCutoff,\n      periodMult,\n      periodMultSlide,\n      dutyCycle,\n      dutyCycleSlide,\n      arpeggioMultiplier,\n      arpeggioTime;\n\n    function initForRepeat() {\n      elapsedSinceRepeat = 0;\n\n      period = 100 / (ps.freq * ps.freq + 0.001);\n      periodMax = 100 / (ps.freqLimit * ps.freqLimit + 0.001);\n      enableFrequencyCutoff = (ps.freqLimit > 0);\n      periodMult = 1 - pow(ps.freqSlide, 3) * 0.01;\n      periodMultSlide = -pow(ps.freqSlideDelta, 3) * 0.000001;\n\n      dutyCycle = 0.5 - ps.duty * 0.5;\n      dutyCycleSlide = -ps.dutySweep * 0.00005;\n\n      if (ps.arpMod >= 0)\n        arpeggioMultiplier = 1 - pow(ps.arpMod, 2) * 0.9;\n      else\n        arpeggioMultiplier = 1 + pow(ps.arpMod, 2) * 10;\n      arpeggioTime = floor(pow(1 - ps.arpSpeed, 2) * 20000 + 32);\n      if (ps.arpSpeed === 1)\n        arpeggioTime = 0;\n    }\n\n    initForRepeat();\n\n    // Waveform shape\n    var waveShape = parseInt(ps.shape);\n\n    // Filter\n    var fltw = pow(ps.lpf, 3) * 0.1;\n    var enableLowPassFilter = (ps.lpf != 1);\n    var fltw_d = 1 + ps.lpfSweep * 0.0001;\n    var fltdmp = 5 / (1 + pow(ps.lpfResonance, 2) * 20) * (0.01 + fltw);\n    if (fltdmp > 0.8)\n      fltdmp=0.8;\n    var flthp = pow(ps.hpf, 2) * 0.1;\n    var flthp_d = 1 + ps.hpfSweep * 0.0003;\n\n    // Vibrato\n    var vibratoSpeed = pow(ps.vibSpeed, 2) * 0.01;\n    var vibratoAmplitude = ps.vibDepth * 0.5;\n\n    // Envelope\n    var envelopeLength = [\n      floor(ps.attack * ps.attack * 100000),\n      floor(ps.sustain * ps.sustain * 100000),\n      floor(ps.decay * ps.decay * 100000)\n    ];\n    var envelopePunch = ps.punch;\n\n    // Flanger\n    var flangerOffset = pow(ps.flangerOffset, 2) * 1020;\n    if (ps.flangerOffset < 0)\n      flangerOffset = -flangerOffset;\n    var flangerOffsetSlide = pow(ps.flangerSweep, 2) * 1;\n    if (ps.flangerSweep < 0)\n      flangerOffsetSlide = -flangerOffsetSlide;\n\n    // Repeat\n    var repeatTime = floor(pow(1 - ps.repeatSpeed, 2) * 20000 + 32);\n    if (ps.repeatSpeed === 0)\n      repeatTime = 0;\n\n    var gain = pow(2, ps.vol) - 1;\n\n    var fltp = 0;\n    var fltdp = 0;\n    var fltphp = 0;\n\n    // TODO: Deterministic output! Don't randomize noise buffer here\n    var noise_buffer = [];\n    for (i = 0; i < 32; ++i)\n      noise_buffer[i] = random() * 2 - 1;\n\n    var envelopeStage = 0;\n    var envelopeElapsed = 0;\n\n    var vibratoPhase = 0;\n\n    var phase = 0;\n    var ipp = 0;\n    var flanger_buffer = [];\n    for (i = 0; i < 1024; ++i)\n      flanger_buffer[i] = 0;\n\n    var num_clipped = 0;\n\n    var buffer = [];\n\n    for(var t = 0; ; ++t) {\n\n      // Repeats\n      if (repeatTime !== 0 && ++elapsedSinceRepeat >= repeatTime)\n        initForRepeat();\n\n      // Arpeggio (single)\n      if(arpeggioTime !== 0 && t >= arpeggioTime) {\n        arpeggioTime = 0;\n        period *= arpeggioMultiplier;\n      }\n\n      // Frequency slide, and frequency slide slide!\n      periodMult += periodMultSlide;\n      period *= periodMult;\n      if(period > periodMax) {\n        period = periodMax;\n        if (enableFrequencyCutoff)\n          break;\n      }\n\n      // Vibrato\n      var rfperiod = period;\n      if (vibratoAmplitude > 0) {\n        vibratoPhase += vibratoSpeed;\n        rfperiod = period * (1 + m.sin(vibratoPhase) * vibratoAmplitude);\n      }\n      var iperiod = floor(rfperiod);\n      if (iperiod < OVERSAMPLING)\n        iperiod = OVERSAMPLING;\n\n      // Square wave duty cycle\n      dutyCycle += dutyCycleSlide;\n      if (dutyCycle < 0)\n        dutyCycle = 0;\n      if (dutyCycle > 0.5)\n        dutyCycle = 0.5;\n\n      // Volume envelope\n      if (++envelopeElapsed > envelopeLength[envelopeStage]) {\n        envelopeElapsed = 0;\n        if (++envelopeStage > 2)\n          break;\n      }\n      var env_vol;\n      var envf = envelopeElapsed / envelopeLength[envelopeStage];\n      if (envelopeStage === 0) {         // Attack\n        env_vol = envf;\n      } else if (envelopeStage === 1) {  // Sustain\n        env_vol = 1 + (1 - envf) * 2 * envelopePunch;\n      } else {                           // Decay\n        env_vol = 1 - envf;\n      }\n\n      // Flanger step\n      flangerOffset += flangerOffsetSlide;\n      var iphase = abs(floor(flangerOffset));\n      if (iphase > 1023)\n        iphase = 1023;\n\n      if (flthp_d !== 0) {\n        flthp *= flthp_d;\n        if (flthp < 0.00001)\n          flthp = 0.00001;\n        if (flthp > 0.1)\n          flthp = 0.1;\n      }\n\n      // 8x oversampling\n      var sample = 0;\n      for (var si = 0; si < OVERSAMPLING; ++si) {\n        var sub_sample = 0;\n        phase++;\n        if (phase >= iperiod) {\n          phase %= iperiod;\n          if (waveShape === NOISE)\n            for(var i = 0; i < 32; ++i)\n              noise_buffer[i] = random() * 2 - 1;\n        }\n\n        // Base waveform\n        var fp = phase / iperiod;\n        if (waveShape === SQUARE) {\n          if (fp < dutyCycle)\n            sub_sample=0.5;\n          else\n            sub_sample=-0.5;\n        } else if (waveShape === SAWTOOTH) {\n          if (fp < dutyCycle)\n            sub_sample = -1 + 2 * fp/dutyCycle;\n          else\n            sub_sample = 1 - 2 * (fp-dutyCycle)/(1-dutyCycle);\n        } else if (waveShape === SINE) {\n          sub_sample = m.sin(fp * 2 * m.PI);\n        } else if (waveShape === NOISE) {\n          sub_sample = noise_buffer[floor(phase * 32 / iperiod)];\n        } else {\n          throw \"ERROR: Bad wave type: \" + waveShape;\n        }\n\n        // Low-pass filter\n        var pp = fltp;\n        fltw *= fltw_d;\n        if (fltw < 0)\n          fltw = 0;\n        if (fltw > 0.1)\n          fltw = 0.1;\n        if (enableLowPassFilter) {\n          fltdp += (sub_sample - fltp) * fltw;\n          fltdp -= fltdp * fltdmp;\n        } else {\n          fltp = sub_sample;\n          fltdp = 0;\n        }\n        fltp += fltdp;\n\n        // High-pass filter\n        fltphp += fltp - pp;\n        fltphp -= fltphp * flthp;\n        sub_sample = fltphp;\n\n        // Flanger\n        flanger_buffer[ipp & 1023] = sub_sample;\n        sub_sample += flanger_buffer[(ipp - iphase + 1024) & 1023];\n        ipp = (ipp + 1) & 1023;\n\n        // final accumulation and envelope application\n        sample += sub_sample * env_vol;\n      }\n\n      sample = sample / OVERSAMPLING;\n      sample *= gain;\n\n      buffer.push(sample);\n    }\n\n    // Create buffer\n    var audioBuffer = audioContext.createBuffer(1, buffer.length || 1, sampleRate);\n    audioBuffer.getChannelData(0).set(new Float32Array(buffer));\n\n    return audioBuffer;\n  };\n\n  var Serializer = FXZ.Serializer = require(\"./serializer\");\n  FXZ.Params = Params;\n\n  return FXZ;\n})();\n",
          "mode": "100644",
          "type": "blob"
        },
        "pixie.cson": {
          "path": "pixie.cson",
          "content": "name: \"FXZ\"\nversion: \"0.3.2\"\nentryPoint: \"fxz\"\npublish:\n  s3:\n    basePath: \"public/danielx.net\"\n",
          "mode": "100644",
          "type": "blob"
        },
        "serializer.coffee": {
          "path": "serializer.coffee",
          "content": "module.exports =\n  serialize: (params) ->\n    buffer = new ArrayBuffer(100)\n\n    dataView = new DataView(buffer)\n\n    Object.keys(params).forEach (key, i) ->\n      param = params[key]\n      if i is 0\n        # 4 byte fxz header\n        \"fxz\".split(\"\").forEach (s, n) ->\n          dataView.setUint8(n, s.charCodeAt(0))\n        # version\n        dataView.setUint8(3, 1)\n        # byte 4 shape\n        dataView.setUint8(4, param)\n        # bytes 5, 6, 7 unused for now\n      else\n        # Little endian float32s for the other 23 fields\n        dataView.setFloat32((i + 1) * 4, param, true)\n\n    return buffer\n\n  deserialize: (buffer, params) ->\n    dataView = new DataView(buffer)\n\n    Object.keys(params).forEach (key, i) ->\n      if i is 0\n        # 4 byte fxz header\n        \"fxz\".split(\"\").forEach (s, n) ->\n          charCode = s.charCodeAt(0)\n          if charCode != dataView.getUint8(n)\n            throw new Error \"Unknown file format: expected '#{s}' (#{charCode}) at byte #{n}\"\n        # version\n        version = dataView.getUint8(3)\n        if version != 1\n          throw new Error \"Unknown version '#{version}': expected 1\"\n        # byte 4 shape\n        params[key] = dataView.getUint8(4)\n        # bytes 5, 6, 7 unused for now\n      else\n        # Little endian float32s for the other 23 fields\n        params[key] = dataView.getFloat32((i + 1) * 4, true)\n\n    return params\n",
          "mode": "100644",
          "type": "blob"
        },
        "test/params.coffee": {
          "path": "test/params.coffee",
          "content": "global.FXZ = require \"../fxz\"\n\nconsole.log FXZ\n\nequalEnough = (a, b, precision=5) ->\n  console.log \"equalEnough\", a, b\n  assert.equal a.toFixed(precision), b.toFixed(precision)\n\nrand = Math.random\n\ndescribe \"FXZ\", ->\n  it \"should expose Params\", ->\n    assert FXZ.Params\n\n  it \"should expose Serializer\", ->\n    assert FXZ.Serializer\n\n  describe \"Serialization\", ->\n    it \"should serialize and deserialize\", ->\n      {Params, Serializer} = FXZ\n      {serialize, deserialize} = Serializer\n\n      p1 = new Params\n      # Randomize values\n      Object.keys(p1).forEach (key, i) ->\n        if i > 0\n          p1[key] = rand()\n\n      buffer = serialize p1\n\n      assert.equal buffer.byteLength, 100\n\n      p2 = deserialize(buffer, new Params)\n\n      Object.keys(p1).forEach (key, i) ->\n        if i > 0\n          equalEnough p1[key], p2[key]\n",
          "mode": "100644",
          "type": "blob"
        }
      },
      "distribution": {
        "fxz": {
          "path": "fxz",
          "content": "// Synthesize an AudioBuffer from the param data\nmodule.exports = (function() {\n  // Sound generation parameters are on [0,1] unless noted SIGNED & thus on [-1,1]\n  function Params() {\n    // Wave shape\n    this.shape = 0;\n\n    // Envelope\n    this.attack = 0;    // Attack time\n    this.sustain = 0.3; // Sustain time\n    this.punch = 0;     // Sustain punch\n    this.decay = 0.4;   // Decay time\n\n    // Tone\n    this.freq = 0.3;    // Start frequency\n    this.freqLimit = 0;   // Min frequency cutoff\n    this.freqSlide = 0;    // Slide (SIGNED)\n    this.freqSlideDelta = 0;   // Delta slide (SIGNED)\n    // Vibrato\n    this.vibDepth = 0; // Vibrato depth\n    this.vibSpeed = 0;    // Vibrato speed\n\n    // Tonal change\n    this.arpMod = 0;      // Change amount (SIGNED)\n    this.arpSpeed = 0;    // Change speed\n\n    // Square wave duty (proportion of time signal is high vs. low)\n    this.duty = 0;         // Square duty\n    this.dutySweep = 0;    // Duty sweep (SIGNED)\n\n    // Repeat\n    this.repeatSpeed = 0; // Repeat speed\n\n    // Flanger\n    this.flangerOffset = 0;   // Flanger offset (SIGNED)\n    this.flangerSweep = 0;     // Flanger sweep (SIGNED)\n\n    // Low-pass filter\n    this.lpf = 1;     // Low-pass filter cutoff\n    this.lpfSweep = 0;     // Low-pass filter cutoff sweep (SIGNED)\n    this.lpfResonance = 0;// Low-pass filter resonance\n    // High-pass filter\n    this.hpf = 0;     // High-pass filter cutoff\n    this.hpfSweep = 0;     // High-pass filter cutoff sweep (SIGNED)\n\n    // Sample parameters\n    this.vol = 0.5;\n  }\n\n  function FXZ(ps, audioContext) {\n    // Handle binary format\n    if (ps instanceof ArrayBuffer) {\n      ps = Serializer.deserialize(ps, new Params());\n    }\n\n    var m = Math;\n    var floor = m.floor,\n      pow = m.pow,\n      abs = m.abs,\n      random = m.random;\n\n    var SQUARE = 0,\n      SAWTOOTH = 1,\n      SINE = 2,\n      NOISE = 3,\n      OVERSAMPLING = 8,\n      sampleRate = 44100;\n\n    var i,\n      elapsedSinceRepeat,\n      period,\n      periodMax,\n      enableFrequencyCutoff,\n      periodMult,\n      periodMultSlide,\n      dutyCycle,\n      dutyCycleSlide,\n      arpeggioMultiplier,\n      arpeggioTime;\n\n    function initForRepeat() {\n      elapsedSinceRepeat = 0;\n\n      period = 100 / (ps.freq * ps.freq + 0.001);\n      periodMax = 100 / (ps.freqLimit * ps.freqLimit + 0.001);\n      enableFrequencyCutoff = (ps.freqLimit > 0);\n      periodMult = 1 - pow(ps.freqSlide, 3) * 0.01;\n      periodMultSlide = -pow(ps.freqSlideDelta, 3) * 0.000001;\n\n      dutyCycle = 0.5 - ps.duty * 0.5;\n      dutyCycleSlide = -ps.dutySweep * 0.00005;\n\n      if (ps.arpMod >= 0)\n        arpeggioMultiplier = 1 - pow(ps.arpMod, 2) * 0.9;\n      else\n        arpeggioMultiplier = 1 + pow(ps.arpMod, 2) * 10;\n      arpeggioTime = floor(pow(1 - ps.arpSpeed, 2) * 20000 + 32);\n      if (ps.arpSpeed === 1)\n        arpeggioTime = 0;\n    }\n\n    initForRepeat();\n\n    // Waveform shape\n    var waveShape = parseInt(ps.shape);\n\n    // Filter\n    var fltw = pow(ps.lpf, 3) * 0.1;\n    var enableLowPassFilter = (ps.lpf != 1);\n    var fltw_d = 1 + ps.lpfSweep * 0.0001;\n    var fltdmp = 5 / (1 + pow(ps.lpfResonance, 2) * 20) * (0.01 + fltw);\n    if (fltdmp > 0.8)\n      fltdmp=0.8;\n    var flthp = pow(ps.hpf, 2) * 0.1;\n    var flthp_d = 1 + ps.hpfSweep * 0.0003;\n\n    // Vibrato\n    var vibratoSpeed = pow(ps.vibSpeed, 2) * 0.01;\n    var vibratoAmplitude = ps.vibDepth * 0.5;\n\n    // Envelope\n    var envelopeLength = [\n      floor(ps.attack * ps.attack * 100000),\n      floor(ps.sustain * ps.sustain * 100000),\n      floor(ps.decay * ps.decay * 100000)\n    ];\n    var envelopePunch = ps.punch;\n\n    // Flanger\n    var flangerOffset = pow(ps.flangerOffset, 2) * 1020;\n    if (ps.flangerOffset < 0)\n      flangerOffset = -flangerOffset;\n    var flangerOffsetSlide = pow(ps.flangerSweep, 2) * 1;\n    if (ps.flangerSweep < 0)\n      flangerOffsetSlide = -flangerOffsetSlide;\n\n    // Repeat\n    var repeatTime = floor(pow(1 - ps.repeatSpeed, 2) * 20000 + 32);\n    if (ps.repeatSpeed === 0)\n      repeatTime = 0;\n\n    var gain = pow(2, ps.vol) - 1;\n\n    var fltp = 0;\n    var fltdp = 0;\n    var fltphp = 0;\n\n    // TODO: Deterministic output! Don't randomize noise buffer here\n    var noise_buffer = [];\n    for (i = 0; i < 32; ++i)\n      noise_buffer[i] = random() * 2 - 1;\n\n    var envelopeStage = 0;\n    var envelopeElapsed = 0;\n\n    var vibratoPhase = 0;\n\n    var phase = 0;\n    var ipp = 0;\n    var flanger_buffer = [];\n    for (i = 0; i < 1024; ++i)\n      flanger_buffer[i] = 0;\n\n    var num_clipped = 0;\n\n    var buffer = [];\n\n    for(var t = 0; ; ++t) {\n\n      // Repeats\n      if (repeatTime !== 0 && ++elapsedSinceRepeat >= repeatTime)\n        initForRepeat();\n\n      // Arpeggio (single)\n      if(arpeggioTime !== 0 && t >= arpeggioTime) {\n        arpeggioTime = 0;\n        period *= arpeggioMultiplier;\n      }\n\n      // Frequency slide, and frequency slide slide!\n      periodMult += periodMultSlide;\n      period *= periodMult;\n      if(period > periodMax) {\n        period = periodMax;\n        if (enableFrequencyCutoff)\n          break;\n      }\n\n      // Vibrato\n      var rfperiod = period;\n      if (vibratoAmplitude > 0) {\n        vibratoPhase += vibratoSpeed;\n        rfperiod = period * (1 + m.sin(vibratoPhase) * vibratoAmplitude);\n      }\n      var iperiod = floor(rfperiod);\n      if (iperiod < OVERSAMPLING)\n        iperiod = OVERSAMPLING;\n\n      // Square wave duty cycle\n      dutyCycle += dutyCycleSlide;\n      if (dutyCycle < 0)\n        dutyCycle = 0;\n      if (dutyCycle > 0.5)\n        dutyCycle = 0.5;\n\n      // Volume envelope\n      if (++envelopeElapsed > envelopeLength[envelopeStage]) {\n        envelopeElapsed = 0;\n        if (++envelopeStage > 2)\n          break;\n      }\n      var env_vol;\n      var envf = envelopeElapsed / envelopeLength[envelopeStage];\n      if (envelopeStage === 0) {         // Attack\n        env_vol = envf;\n      } else if (envelopeStage === 1) {  // Sustain\n        env_vol = 1 + (1 - envf) * 2 * envelopePunch;\n      } else {                           // Decay\n        env_vol = 1 - envf;\n      }\n\n      // Flanger step\n      flangerOffset += flangerOffsetSlide;\n      var iphase = abs(floor(flangerOffset));\n      if (iphase > 1023)\n        iphase = 1023;\n\n      if (flthp_d !== 0) {\n        flthp *= flthp_d;\n        if (flthp < 0.00001)\n          flthp = 0.00001;\n        if (flthp > 0.1)\n          flthp = 0.1;\n      }\n\n      // 8x oversampling\n      var sample = 0;\n      for (var si = 0; si < OVERSAMPLING; ++si) {\n        var sub_sample = 0;\n        phase++;\n        if (phase >= iperiod) {\n          phase %= iperiod;\n          if (waveShape === NOISE)\n            for(var i = 0; i < 32; ++i)\n              noise_buffer[i] = random() * 2 - 1;\n        }\n\n        // Base waveform\n        var fp = phase / iperiod;\n        if (waveShape === SQUARE) {\n          if (fp < dutyCycle)\n            sub_sample=0.5;\n          else\n            sub_sample=-0.5;\n        } else if (waveShape === SAWTOOTH) {\n          if (fp < dutyCycle)\n            sub_sample = -1 + 2 * fp/dutyCycle;\n          else\n            sub_sample = 1 - 2 * (fp-dutyCycle)/(1-dutyCycle);\n        } else if (waveShape === SINE) {\n          sub_sample = m.sin(fp * 2 * m.PI);\n        } else if (waveShape === NOISE) {\n          sub_sample = noise_buffer[floor(phase * 32 / iperiod)];\n        } else {\n          throw \"ERROR: Bad wave type: \" + waveShape;\n        }\n\n        // Low-pass filter\n        var pp = fltp;\n        fltw *= fltw_d;\n        if (fltw < 0)\n          fltw = 0;\n        if (fltw > 0.1)\n          fltw = 0.1;\n        if (enableLowPassFilter) {\n          fltdp += (sub_sample - fltp) * fltw;\n          fltdp -= fltdp * fltdmp;\n        } else {\n          fltp = sub_sample;\n          fltdp = 0;\n        }\n        fltp += fltdp;\n\n        // High-pass filter\n        fltphp += fltp - pp;\n        fltphp -= fltphp * flthp;\n        sub_sample = fltphp;\n\n        // Flanger\n        flanger_buffer[ipp & 1023] = sub_sample;\n        sub_sample += flanger_buffer[(ipp - iphase + 1024) & 1023];\n        ipp = (ipp + 1) & 1023;\n\n        // final accumulation and envelope application\n        sample += sub_sample * env_vol;\n      }\n\n      sample = sample / OVERSAMPLING;\n      sample *= gain;\n\n      buffer.push(sample);\n    }\n\n    // Create buffer\n    var audioBuffer = audioContext.createBuffer(1, buffer.length || 1, sampleRate);\n    audioBuffer.getChannelData(0).set(new Float32Array(buffer));\n\n    return audioBuffer;\n  };\n\n  var Serializer = FXZ.Serializer = require(\"./serializer\");\n  FXZ.Params = Params;\n\n  return FXZ;\n})();\n",
          "type": "blob"
        },
        "pixie": {
          "path": "pixie",
          "content": "module.exports = {\"name\":\"FXZ\",\"version\":\"0.3.2\",\"entryPoint\":\"fxz\",\"publish\":{\"s3\":{\"basePath\":\"public/danielx.net\"}}};",
          "type": "blob"
        },
        "serializer": {
          "path": "serializer",
          "content": "(function() {\n  module.exports = {\n    serialize: function(params) {\n      var buffer, dataView;\n      buffer = new ArrayBuffer(100);\n      dataView = new DataView(buffer);\n      Object.keys(params).forEach(function(key, i) {\n        var param;\n        param = params[key];\n        if (i === 0) {\n          \"fxz\".split(\"\").forEach(function(s, n) {\n            return dataView.setUint8(n, s.charCodeAt(0));\n          });\n          dataView.setUint8(3, 1);\n          return dataView.setUint8(4, param);\n        } else {\n          return dataView.setFloat32((i + 1) * 4, param, true);\n        }\n      });\n      return buffer;\n    },\n    deserialize: function(buffer, params) {\n      var dataView;\n      dataView = new DataView(buffer);\n      Object.keys(params).forEach(function(key, i) {\n        var version;\n        if (i === 0) {\n          \"fxz\".split(\"\").forEach(function(s, n) {\n            var charCode;\n            charCode = s.charCodeAt(0);\n            if (charCode !== dataView.getUint8(n)) {\n              throw new Error(\"Unknown file format: expected '\" + s + \"' (\" + charCode + \") at byte \" + n);\n            }\n          });\n          version = dataView.getUint8(3);\n          if (version !== 1) {\n            throw new Error(\"Unknown version '\" + version + \"': expected 1\");\n          }\n          return params[key] = dataView.getUint8(4);\n        } else {\n          return params[key] = dataView.getFloat32((i + 1) * 4, true);\n        }\n      });\n      return params;\n    }\n  };\n\n}).call(this);\n",
          "type": "blob"
        },
        "test/params": {
          "path": "test/params",
          "content": "(function() {\n  var equalEnough, rand;\n\n  global.FXZ = require(\"../fxz\");\n\n  console.log(FXZ);\n\n  equalEnough = function(a, b, precision) {\n    if (precision == null) {\n      precision = 5;\n    }\n    console.log(\"equalEnough\", a, b);\n    return assert.equal(a.toFixed(precision), b.toFixed(precision));\n  };\n\n  rand = Math.random;\n\n  describe(\"FXZ\", function() {\n    it(\"should expose Params\", function() {\n      return assert(FXZ.Params);\n    });\n    it(\"should expose Serializer\", function() {\n      return assert(FXZ.Serializer);\n    });\n    return describe(\"Serialization\", function() {\n      return it(\"should serialize and deserialize\", function() {\n        var Params, Serializer, buffer, deserialize, p1, p2, serialize;\n        Params = FXZ.Params, Serializer = FXZ.Serializer;\n        serialize = Serializer.serialize, deserialize = Serializer.deserialize;\n        p1 = new Params;\n        Object.keys(p1).forEach(function(key, i) {\n          if (i > 0) {\n            return p1[key] = rand();\n          }\n        });\n        buffer = serialize(p1);\n        assert.equal(buffer.byteLength, 100);\n        p2 = deserialize(buffer, new Params);\n        return Object.keys(p1).forEach(function(key, i) {\n          if (i > 0) {\n            return equalEnough(p1[key], p2[key]);\n          }\n        });\n      });\n    });\n  });\n\n}).call(this);\n",
          "type": "blob"
        }
      },
      "progenitor": {
        "url": "https://danielx.net/editor/"
      },
      "config": {
        "name": "FXZ",
        "version": "0.3.2",
        "entryPoint": "fxz",
        "publish": {
          "s3": {
            "basePath": "public/danielx.net"
          }
        }
      },
      "version": "0.3.2",
      "entryPoint": "fxz",
      "repository": {
        "branch": "master",
        "default_branch": "master",
        "full_name": "STRd6/fxz",
        "homepage": "http://danielx.net/fxz-edit/",
        "description": "Simple and efficient sound effects generator and file format. A port of sfxr to HTML5.",
        "html_url": "https://github.com/STRd6/fxz",
        "url": "https://api.github.com/repos/STRd6/fxz",
        "publishBranch": "gh-pages"
      },
      "dependencies": {}
    }
  }
});