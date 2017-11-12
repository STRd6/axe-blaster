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
    "pixie.cson": {
      "path": "pixie.cson",
      "content": "name: \"Axe Blaster\"\nversion: \"0.1.0\"\nwidth: 1280\nheight: 720\nremoteDependencies: [\n  \"https://pixijs.download/v4.6.0/pixi.min.js\"\n]\nentryPoint: \"main\"\n",
      "mode": "100644"
    },
    "main.coffee": {
      "path": "main.coffee",
      "content": "global.require = require\nglobal.PACKAGE = PACKAGE\n\nstyleNode = document.createElement(\"style\")\nstyleNode.innerHTML = require('./style')\ndocument.head.appendChild(styleNode)\n\n{width, height, name} = require \"./pixie\"\n\ntau = 2 * Math.PI\n\n{loader, Container, Rectangle, Sprite, Texture} = PIXI\n\nloader.add([\n  {name: \"pika\", url: \"https://2.pixiecdn.com/sprites/137922/original.png?1\"}\n  {name: \"sheet\", url: \"https://danielx.whimsy.space/axe-blaster/platformertiles.png\"}\n]).load ->\n  renderer = PIXI.autoDetectRenderer width, height,\n    antialias: false\n    transparent: false\n    resolution: 1\n\n  document.body.appendChild(renderer.view)\n\n  # Create a container object called the `stage`\n  stage = new Container()\n\n  blocksTextures = [0, 1, 2].map (n) ->\n    t = new Texture(loader.resources[\"sheet\"].texture, new Rectangle(32 * n, 0, 32, 32))\n\n  blocksTextures.forEach (t, n) ->\n    block = new Sprite(t)\n    stage.addChild(block)\n    block.x = 64 + 32 * n\n    block.y = 64\n\n  texture = loader.resources[\"pika\"].texture\n  sprite = new Sprite(texture)\n\n  stage.addChild(sprite)\n\n  sprite.x = width / 2\n  sprite.y = height / 2\n\n  sprite.scale.set(2)\n  sprite.anchor.set(0.5)\n  sprite.rotation = 0.5 * tau\n\n  update = ->\n    sprite.x += 1\n\n  gameLoop = ->\n    requestAnimationFrame gameLoop\n\n    update()\n\n    # Tell the `renderer` to `render` the `stage`\n    renderer.render stage\n\n  gameLoop()\n",
      "mode": "100644"
    },
    "style.styl": {
      "path": "style.styl",
      "content": "html\n  display: flex\n  height: 100%\n\nbody\n  display: flex\n  flex: 1\n  margin: 0\n\nbody > canvas\n  margin: auto\n",
      "mode": "100644"
    },
    "phaser/test.js": {
      "path": "phaser/test.js",
      "content": "// deps:  \"https://cdn.jsdelivr.net/npm/phaser-ce@2.9.1/build/phaser.js\"\n\nvar game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });\n\nfunction preload() {\n    game.load.crossOrigin = \"anonymous\";\n\n    game.load.tilemap('map', 'https://examples.phaser.io/assets/tilemaps/maps/collision_test.json', null, Phaser.Tilemap.TILED_JSON);\n    game.load.image('ground_1x1', 'https://examples.phaser.io/assets/tilemaps/tiles/ground_1x1.png');\n    game.load.image('walls_1x2', 'https://examples.phaser.io/assets/tilemaps/tiles/walls_1x2.png');\n    game.load.image('tiles2', 'https://examples.phaser.io/assets/tilemaps/tiles/tiles2.png');\n    game.load.image('ship', 'https://examples.phaser.io/assets/sprites/thrust_ship2.png');\n\n}\n\nvar ship;\nvar map;\nvar layer;\nvar cursors;\n\nfunction create() {\n\n    game.physics.startSystem(Phaser.Physics.P2JS);\n\n    game.stage.backgroundColor = '#2d2d2d';\n\n    map = game.add.tilemap('map');\n\n    map.addTilesetImage('ground_1x1');\n    map.addTilesetImage('walls_1x2');\n    map.addTilesetImage('tiles2');\n    \n    layer = map.createLayer('Tile Layer 1');\n\n    layer.resizeWorld();\n\n    //  Set the tiles for collision.\n    //  Do this BEFORE generating the p2 bodies below.\n    map.setCollisionBetween(1, 12);\n\n    //  Convert the tilemap layer into bodies. Only tiles that collide (see above) are created.\n    //  This call returns an array of body objects which you can perform addition actions on if\n    //  required. There is also a parameter to control optimising the map build.\n    game.physics.p2.convertTilemap(map, layer);\n\n    ship = game.add.sprite(200, 200, 'ship');\n    game.physics.p2.enable(ship);\n\n    game.camera.follow(ship);\n\n    //  By default the ship will collide with the World bounds,\n    //  however because you have changed the size of the world (via layer.resizeWorld) to match the tilemap\n    //  you need to rebuild the physics world boundary as well. The following\n    //  line does that. The first 4 parameters control if you need a boundary on the left, right, top and bottom of your world.\n    //  The final parameter (false) controls if the boundary should use its own collision group or not. In this case we don't require\n    //  that, so it's set to false. But if you had custom collision groups set-up then you would need this set to true.\n    game.physics.p2.setBoundsToWorld(true, true, true, true, false);\n\n    //  Even after the world boundary is set-up you can still toggle if the ship collides or not with this:\n    // ship.body.collideWorldBounds = false;\n\n    cursors = game.input.keyboard.createCursorKeys();\n\n}\n\nfunction update() {\n\n    if (cursors.left.isDown)\n    {\n        ship.body.rotateLeft(100);\n    }\n    else if (cursors.right.isDown)\n    {\n        ship.body.rotateRight(100);\n    }\n    else\n    {\n        ship.body.setZeroRotation();\n    }\n\n    if (cursors.up.isDown)\n    {\n        ship.body.thrust(400);\n    }\n    else if (cursors.down.isDown)\n    {\n        ship.body.reverse(400);\n    }\n\n}\n\nfunction render() {\n\n}\n",
      "mode": "100644"
    }
  },
  "distribution": {
    "pixie": {
      "path": "pixie",
      "content": "module.exports = {\"name\":\"Axe Blaster\",\"version\":\"0.1.0\",\"width\":1280,\"height\":720,\"remoteDependencies\":[\"https://pixijs.download/v4.6.0/pixi.min.js\"],\"entryPoint\":\"main\"};",
      "type": "blob"
    },
    "main": {
      "path": "main",
      "content": "(function() {\n  var Container, Rectangle, Sprite, Texture, height, loader, name, styleNode, tau, width, _ref;\n\n  global.require = require;\n\n  global.PACKAGE = PACKAGE;\n\n  styleNode = document.createElement(\"style\");\n\n  styleNode.innerHTML = require('./style');\n\n  document.head.appendChild(styleNode);\n\n  _ref = require(\"./pixie\"), width = _ref.width, height = _ref.height, name = _ref.name;\n\n  tau = 2 * Math.PI;\n\n  loader = PIXI.loader, Container = PIXI.Container, Rectangle = PIXI.Rectangle, Sprite = PIXI.Sprite, Texture = PIXI.Texture;\n\n  loader.add([\n    {\n      name: \"pika\",\n      url: \"https://2.pixiecdn.com/sprites/137922/original.png?1\"\n    }, {\n      name: \"sheet\",\n      url: \"https://danielx.whimsy.space/axe-blaster/platformertiles.png\"\n    }\n  ]).load(function() {\n    var blocksTextures, gameLoop, renderer, sprite, stage, texture, update;\n    renderer = PIXI.autoDetectRenderer(width, height, {\n      antialias: false,\n      transparent: false,\n      resolution: 1\n    });\n    document.body.appendChild(renderer.view);\n    stage = new Container();\n    blocksTextures = [0, 1, 2].map(function(n) {\n      var t;\n      return t = new Texture(loader.resources[\"sheet\"].texture, new Rectangle(32 * n, 0, 32, 32));\n    });\n    blocksTextures.forEach(function(t, n) {\n      var block;\n      block = new Sprite(t);\n      stage.addChild(block);\n      block.x = 64 + 32 * n;\n      return block.y = 64;\n    });\n    texture = loader.resources[\"pika\"].texture;\n    sprite = new Sprite(texture);\n    stage.addChild(sprite);\n    sprite.x = width / 2;\n    sprite.y = height / 2;\n    sprite.scale.set(2);\n    sprite.anchor.set(0.5);\n    sprite.rotation = 0.5 * tau;\n    update = function() {\n      return sprite.x += 1;\n    };\n    gameLoop = function() {\n      requestAnimationFrame(gameLoop);\n      update();\n      return renderer.render(stage);\n    };\n    return gameLoop();\n  });\n\n}).call(this);\n",
      "type": "blob"
    },
    "style": {
      "path": "style",
      "content": "module.exports = \"html {\\n  display: flex;\\n  height: 100%;\\n}\\nbody {\\n  display: flex;\\n  flex: 1;\\n  margin: 0;\\n}\\nbody > canvas {\\n  margin: auto;\\n}\\n\";",
      "type": "blob"
    },
    "phaser/test": {
      "path": "phaser/test",
      "content": "// deps:  \"https://cdn.jsdelivr.net/npm/phaser-ce@2.9.1/build/phaser.js\"\n\nvar game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });\n\nfunction preload() {\n    game.load.crossOrigin = \"anonymous\";\n\n    game.load.tilemap('map', 'https://examples.phaser.io/assets/tilemaps/maps/collision_test.json', null, Phaser.Tilemap.TILED_JSON);\n    game.load.image('ground_1x1', 'https://examples.phaser.io/assets/tilemaps/tiles/ground_1x1.png');\n    game.load.image('walls_1x2', 'https://examples.phaser.io/assets/tilemaps/tiles/walls_1x2.png');\n    game.load.image('tiles2', 'https://examples.phaser.io/assets/tilemaps/tiles/tiles2.png');\n    game.load.image('ship', 'https://examples.phaser.io/assets/sprites/thrust_ship2.png');\n\n}\n\nvar ship;\nvar map;\nvar layer;\nvar cursors;\n\nfunction create() {\n\n    game.physics.startSystem(Phaser.Physics.P2JS);\n\n    game.stage.backgroundColor = '#2d2d2d';\n\n    map = game.add.tilemap('map');\n\n    map.addTilesetImage('ground_1x1');\n    map.addTilesetImage('walls_1x2');\n    map.addTilesetImage('tiles2');\n    \n    layer = map.createLayer('Tile Layer 1');\n\n    layer.resizeWorld();\n\n    //  Set the tiles for collision.\n    //  Do this BEFORE generating the p2 bodies below.\n    map.setCollisionBetween(1, 12);\n\n    //  Convert the tilemap layer into bodies. Only tiles that collide (see above) are created.\n    //  This call returns an array of body objects which you can perform addition actions on if\n    //  required. There is also a parameter to control optimising the map build.\n    game.physics.p2.convertTilemap(map, layer);\n\n    ship = game.add.sprite(200, 200, 'ship');\n    game.physics.p2.enable(ship);\n\n    game.camera.follow(ship);\n\n    //  By default the ship will collide with the World bounds,\n    //  however because you have changed the size of the world (via layer.resizeWorld) to match the tilemap\n    //  you need to rebuild the physics world boundary as well. The following\n    //  line does that. The first 4 parameters control if you need a boundary on the left, right, top and bottom of your world.\n    //  The final parameter (false) controls if the boundary should use its own collision group or not. In this case we don't require\n    //  that, so it's set to false. But if you had custom collision groups set-up then you would need this set to true.\n    game.physics.p2.setBoundsToWorld(true, true, true, true, false);\n\n    //  Even after the world boundary is set-up you can still toggle if the ship collides or not with this:\n    // ship.body.collideWorldBounds = false;\n\n    cursors = game.input.keyboard.createCursorKeys();\n\n}\n\nfunction update() {\n\n    if (cursors.left.isDown)\n    {\n        ship.body.rotateLeft(100);\n    }\n    else if (cursors.right.isDown)\n    {\n        ship.body.rotateRight(100);\n    }\n    else\n    {\n        ship.body.setZeroRotation();\n    }\n\n    if (cursors.up.isDown)\n    {\n        ship.body.thrust(400);\n    }\n    else if (cursors.down.isDown)\n    {\n        ship.body.reverse(400);\n    }\n\n}\n\nfunction render() {\n\n}\n",
      "type": "blob"
    }
  },
  "progenitor": {
    "url": "https://danielx.net/editor/zine2/"
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