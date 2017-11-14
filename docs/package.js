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
      "content": "require \"./setup\"\n\n# FPS Display\nStats = require \"./lib/stats.min\"\nstats = new Stats\ndocument.body.appendChild stats.dom\n\nMapReader = require \"./lib/map-reader\"\nMapChunk = require \"./models/map-chunk\"\n\n{width, height, name} = require \"./pixie\"\n\ntau = 2 * Math.PI\n\n{loader, Container, Point, Rectangle, Sprite, Texture} = PIXI\n\nloader.add([\n  {name: \"pika\", url: \"https://2.pixiecdn.com/sprites/137922/original.png?1\"}\n  {name: \"sheet\", url: \"https://danielx.whimsy.space/axe-blaster/platformertiles.png\"}\n  {name: \"map\", url: \"https://danielx.whimsy.space/axe-blaster/map.png\"}\n]).load ->\n  renderer = PIXI.autoDetectRenderer width, height,\n    antialias: false\n    transparent: false\n    resolution: 1\n\n  document.body.appendChild(renderer.view)\n\n  # Create a container object called the `stage`\n  stage = new Container()\n\n  chunk = MapChunk loader.resources[\"sheet\"].texture, MapReader(loader.resources.map.texture.baseTexture.source)\n  stage.addChild chunk\n\n  texture = loader.resources[\"pika\"].texture\n  sprite = new Sprite(texture)\n\n  stage.addChild(sprite)\n\n  sprite.x = width / 2\n  sprite.y = height / 2\n\n  sprite.scale.set(2)\n  sprite.anchor.set(0.5)\n  sprite.rotation = 0.5 * tau\n\n  # Pan Tool\n  do ->\n    mouse = renderer.plugins.interaction.mouse\n    active = false\n    stage.interactive = true\n\n    prev = new Point\n\n    renderer.view.addEventListener \"mousedown\", (e) ->\n      active = true\n      prev.copy mouse.global\n      console.log \"down\", mouse.global\n\n    document.addEventListener \"mouseup\", (e) ->\n      active = false\n      console.log \"up\", mouse.global\n\n    document.addEventListener \"mousemove\", (e) ->\n      return unless active\n\n      deltaX = mouse.global.x - prev.x\n      deltaY = mouse.global.y - prev.y\n      prev.copy mouse.global\n\n      # Do the panning\n      stage.pivot.x -= deltaX / stage.scale.x\n      stage.pivot.y -= deltaY / stage.scale.y\n\n      # console.log \"move\", mouse.global, deltaX, deltaY\n\n    # Zoom test\n    document.addEventListener \"mousewheel\", (e) ->\n      e.preventDefault()\n\n      console.log e.deltaY\n      deltaZoom = e.deltaY / 1000\n      stage.scale.x -= deltaZoom\n      stage.scale.y -= deltaZoom\n      \n      # TODO: Zoom in at the mouse position\n\n  update = ->\n    sprite.x += 1\n\n  gameLoop = ->\n    requestAnimationFrame gameLoop\n\n    stats.begin()\n\n    update()\n\n    # Tell the `renderer` to `render` the `stage`\n    renderer.render stage\n\n    stats.end()\n\n  gameLoop()\n",
      "mode": "100644",
      "type": "blob"
    },
    "pixie.cson": {
      "path": "pixie.cson",
      "content": "name: \"Axe Blaster\"\nversion: \"0.1.0\"\nwidth: 1280\nheight: 720\nremoteDependencies: [\n  \"https://pixijs.download/v4.6.0/pixi.min.js\"\n]\nentryPoint: \"main\"\n",
      "mode": "100644",
      "type": "blob"
    },
    "style.styl": {
      "path": "style.styl",
      "content": "html\n  display: flex\n  height: 100%\n\nbody\n  display: flex\n  flex: 1\n  margin: 0\n\nbody > canvas\n  margin: auto\n",
      "mode": "100644",
      "type": "blob"
    },
    "experiments/phaser/test.js": {
      "path": "experiments/phaser/test.js",
      "content": "// deps:  \"https://cdn.jsdelivr.net/npm/phaser-ce@2.9.1/build/phaser.js\"\n\nvar game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });\n\nfunction preload() {\n    game.load.crossOrigin = \"anonymous\";\n\n    game.load.tilemap('map', 'https://examples.phaser.io/assets/tilemaps/maps/collision_test.json', null, Phaser.Tilemap.TILED_JSON);\n    game.load.image('ground_1x1', 'https://examples.phaser.io/assets/tilemaps/tiles/ground_1x1.png');\n    game.load.image('walls_1x2', 'https://examples.phaser.io/assets/tilemaps/tiles/walls_1x2.png');\n    game.load.image('tiles2', 'https://examples.phaser.io/assets/tilemaps/tiles/tiles2.png');\n    game.load.image('ship', 'https://examples.phaser.io/assets/sprites/thrust_ship2.png');\n\n}\n\nvar ship;\nvar map;\nvar layer;\nvar cursors;\n\nfunction create() {\n\n    game.physics.startSystem(Phaser.Physics.P2JS);\n\n    game.stage.backgroundColor = '#2d2d2d';\n\n    map = game.add.tilemap('map');\n\n    map.addTilesetImage('ground_1x1');\n    map.addTilesetImage('walls_1x2');\n    map.addTilesetImage('tiles2');\n\n    layer = map.createLayer('Tile Layer 1');\n\n    layer.resizeWorld();\n\n    //  Set the tiles for collision.\n    //  Do this BEFORE generating the p2 bodies below.\n    map.setCollisionBetween(1, 12);\n\n    //  Convert the tilemap layer into bodies. Only tiles that collide (see above) are created.\n    //  This call returns an array of body objects which you can perform addition actions on if\n    //  required. There is also a parameter to control optimising the map build.\n    game.physics.p2.convertTilemap(map, layer);\n\n    ship = game.add.sprite(200, 200, 'ship');\n    game.physics.p2.enable(ship);\n\n    game.camera.follow(ship);\n\n    //  By default the ship will collide with the World bounds,\n    //  however because you have changed the size of the world (via layer.resizeWorld) to match the tilemap\n    //  you need to rebuild the physics world boundary as well. The following\n    //  line does that. The first 4 parameters control if you need a boundary on the left, right, top and bottom of your world.\n    //  The final parameter (false) controls if the boundary should use its own collision group or not. In this case we don't require\n    //  that, so it's set to false. But if you had custom collision groups set-up then you would need this set to true.\n    game.physics.p2.setBoundsToWorld(true, true, true, true, false);\n\n    //  Even after the world boundary is set-up you can still toggle if the ship collides or not with this:\n    // ship.body.collideWorldBounds = false;\n\n    cursors = game.input.keyboard.createCursorKeys();\n\n}\n\nfunction update() {\n\n    if (cursors.left.isDown)\n    {\n        ship.body.rotateLeft(100);\n    }\n    else if (cursors.right.isDown)\n    {\n        ship.body.rotateRight(100);\n    }\n    else\n    {\n        ship.body.setZeroRotation();\n    }\n\n    if (cursors.up.isDown)\n    {\n        ship.body.thrust(400);\n    }\n    else if (cursors.down.isDown)\n    {\n        ship.body.reverse(400);\n    }\n\n}\n\nfunction render() {\n\n}\n",
      "mode": "100644"
    },
    "models/map-chunk.coffee": {
      "path": "models/map-chunk.coffee",
      "content": "{Container, Sprite, Texture, Rectangle} = PIXI\n\nmodule.exports = (texture, mapData) ->\n  blockTexture = new Texture(texture, new Rectangle(32, 32, 32, 32))\n  \n  container = new Container\n\n  (({data, width, height}) ->\n    data.forEach (value, i) ->\n      x = i % width\n      y = (i / width)|0\n\n      if value\n        block = new Sprite(blockTexture)\n        block.x = x * 32\n        block.y = y * 32\n        container.addChild(block)\n  )(mapData)\n\n  return container\n",
      "mode": "100644"
    },
    "setup.coffee": {
      "path": "setup.coffee",
      "content": "styleNode = document.createElement(\"style\")\nstyleNode.innerHTML = require('./style')\ndocument.head.appendChild(styleNode)\n\n",
      "mode": "100644"
    }
  },
  "distribution": {
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
      "content": "(function() {\n  var Container, MapChunk, MapReader, Point, Rectangle, Sprite, Stats, Texture, height, loader, name, stats, tau, width, _ref;\n\n  require(\"./setup\");\n\n  Stats = require(\"./lib/stats.min\");\n\n  stats = new Stats;\n\n  document.body.appendChild(stats.dom);\n\n  MapReader = require(\"./lib/map-reader\");\n\n  MapChunk = require(\"./models/map-chunk\");\n\n  _ref = require(\"./pixie\"), width = _ref.width, height = _ref.height, name = _ref.name;\n\n  tau = 2 * Math.PI;\n\n  loader = PIXI.loader, Container = PIXI.Container, Point = PIXI.Point, Rectangle = PIXI.Rectangle, Sprite = PIXI.Sprite, Texture = PIXI.Texture;\n\n  loader.add([\n    {\n      name: \"pika\",\n      url: \"https://2.pixiecdn.com/sprites/137922/original.png?1\"\n    }, {\n      name: \"sheet\",\n      url: \"https://danielx.whimsy.space/axe-blaster/platformertiles.png\"\n    }, {\n      name: \"map\",\n      url: \"https://danielx.whimsy.space/axe-blaster/map.png\"\n    }\n  ]).load(function() {\n    var chunk, gameLoop, renderer, sprite, stage, texture, update;\n    renderer = PIXI.autoDetectRenderer(width, height, {\n      antialias: false,\n      transparent: false,\n      resolution: 1\n    });\n    document.body.appendChild(renderer.view);\n    stage = new Container();\n    chunk = MapChunk(loader.resources[\"sheet\"].texture, MapReader(loader.resources.map.texture.baseTexture.source));\n    stage.addChild(chunk);\n    texture = loader.resources[\"pika\"].texture;\n    sprite = new Sprite(texture);\n    stage.addChild(sprite);\n    sprite.x = width / 2;\n    sprite.y = height / 2;\n    sprite.scale.set(2);\n    sprite.anchor.set(0.5);\n    sprite.rotation = 0.5 * tau;\n    (function() {\n      var active, mouse, prev;\n      mouse = renderer.plugins.interaction.mouse;\n      active = false;\n      stage.interactive = true;\n      prev = new Point;\n      renderer.view.addEventListener(\"mousedown\", function(e) {\n        active = true;\n        prev.copy(mouse.global);\n        return console.log(\"down\", mouse.global);\n      });\n      document.addEventListener(\"mouseup\", function(e) {\n        active = false;\n        return console.log(\"up\", mouse.global);\n      });\n      document.addEventListener(\"mousemove\", function(e) {\n        var deltaX, deltaY;\n        if (!active) {\n          return;\n        }\n        deltaX = mouse.global.x - prev.x;\n        deltaY = mouse.global.y - prev.y;\n        prev.copy(mouse.global);\n        stage.pivot.x -= deltaX / stage.scale.x;\n        return stage.pivot.y -= deltaY / stage.scale.y;\n      });\n      return document.addEventListener(\"mousewheel\", function(e) {\n        var deltaZoom;\n        e.preventDefault();\n        console.log(e.deltaY);\n        deltaZoom = e.deltaY / 1000;\n        stage.scale.x -= deltaZoom;\n        return stage.scale.y -= deltaZoom;\n      });\n    })();\n    update = function() {\n      return sprite.x += 1;\n    };\n    gameLoop = function() {\n      requestAnimationFrame(gameLoop);\n      stats.begin();\n      update();\n      renderer.render(stage);\n      return stats.end();\n    };\n    return gameLoop();\n  });\n\n}).call(this);\n",
      "type": "blob"
    },
    "pixie": {
      "path": "pixie",
      "content": "module.exports = {\"name\":\"Axe Blaster\",\"version\":\"0.1.0\",\"width\":1280,\"height\":720,\"remoteDependencies\":[\"https://pixijs.download/v4.6.0/pixi.min.js\"],\"entryPoint\":\"main\"};",
      "type": "blob"
    },
    "style": {
      "path": "style",
      "content": "module.exports = \"html {\\n  display: flex;\\n  height: 100%;\\n}\\nbody {\\n  display: flex;\\n  flex: 1;\\n  margin: 0;\\n}\\nbody > canvas {\\n  margin: auto;\\n}\\n\";",
      "type": "blob"
    },
    "experiments/phaser/test": {
      "path": "experiments/phaser/test",
      "content": "// deps:  \"https://cdn.jsdelivr.net/npm/phaser-ce@2.9.1/build/phaser.js\"\n\nvar game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });\n\nfunction preload() {\n    game.load.crossOrigin = \"anonymous\";\n\n    game.load.tilemap('map', 'https://examples.phaser.io/assets/tilemaps/maps/collision_test.json', null, Phaser.Tilemap.TILED_JSON);\n    game.load.image('ground_1x1', 'https://examples.phaser.io/assets/tilemaps/tiles/ground_1x1.png');\n    game.load.image('walls_1x2', 'https://examples.phaser.io/assets/tilemaps/tiles/walls_1x2.png');\n    game.load.image('tiles2', 'https://examples.phaser.io/assets/tilemaps/tiles/tiles2.png');\n    game.load.image('ship', 'https://examples.phaser.io/assets/sprites/thrust_ship2.png');\n\n}\n\nvar ship;\nvar map;\nvar layer;\nvar cursors;\n\nfunction create() {\n\n    game.physics.startSystem(Phaser.Physics.P2JS);\n\n    game.stage.backgroundColor = '#2d2d2d';\n\n    map = game.add.tilemap('map');\n\n    map.addTilesetImage('ground_1x1');\n    map.addTilesetImage('walls_1x2');\n    map.addTilesetImage('tiles2');\n\n    layer = map.createLayer('Tile Layer 1');\n\n    layer.resizeWorld();\n\n    //  Set the tiles for collision.\n    //  Do this BEFORE generating the p2 bodies below.\n    map.setCollisionBetween(1, 12);\n\n    //  Convert the tilemap layer into bodies. Only tiles that collide (see above) are created.\n    //  This call returns an array of body objects which you can perform addition actions on if\n    //  required. There is also a parameter to control optimising the map build.\n    game.physics.p2.convertTilemap(map, layer);\n\n    ship = game.add.sprite(200, 200, 'ship');\n    game.physics.p2.enable(ship);\n\n    game.camera.follow(ship);\n\n    //  By default the ship will collide with the World bounds,\n    //  however because you have changed the size of the world (via layer.resizeWorld) to match the tilemap\n    //  you need to rebuild the physics world boundary as well. The following\n    //  line does that. The first 4 parameters control if you need a boundary on the left, right, top and bottom of your world.\n    //  The final parameter (false) controls if the boundary should use its own collision group or not. In this case we don't require\n    //  that, so it's set to false. But if you had custom collision groups set-up then you would need this set to true.\n    game.physics.p2.setBoundsToWorld(true, true, true, true, false);\n\n    //  Even after the world boundary is set-up you can still toggle if the ship collides or not with this:\n    // ship.body.collideWorldBounds = false;\n\n    cursors = game.input.keyboard.createCursorKeys();\n\n}\n\nfunction update() {\n\n    if (cursors.left.isDown)\n    {\n        ship.body.rotateLeft(100);\n    }\n    else if (cursors.right.isDown)\n    {\n        ship.body.rotateRight(100);\n    }\n    else\n    {\n        ship.body.setZeroRotation();\n    }\n\n    if (cursors.up.isDown)\n    {\n        ship.body.thrust(400);\n    }\n    else if (cursors.down.isDown)\n    {\n        ship.body.reverse(400);\n    }\n\n}\n\nfunction render() {\n\n}\n",
      "type": "blob"
    },
    "models/map-chunk": {
      "path": "models/map-chunk",
      "content": "(function() {\n  var Container, Rectangle, Sprite, Texture;\n\n  Container = PIXI.Container, Sprite = PIXI.Sprite, Texture = PIXI.Texture, Rectangle = PIXI.Rectangle;\n\n  module.exports = function(texture, mapData) {\n    var blockTexture, container;\n    blockTexture = new Texture(texture, new Rectangle(32, 32, 32, 32));\n    container = new Container;\n    (function(_arg) {\n      var data, height, width;\n      data = _arg.data, width = _arg.width, height = _arg.height;\n      return data.forEach(function(value, i) {\n        var block, x, y;\n        x = i % width;\n        y = (i / width) | 0;\n        if (value) {\n          block = new Sprite(blockTexture);\n          block.x = x * 32;\n          block.y = y * 32;\n          return container.addChild(block);\n        }\n      });\n    })(mapData);\n    return container;\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "setup": {
      "path": "setup",
      "content": "(function() {\n  var styleNode;\n\n  styleNode = document.createElement(\"style\");\n\n  styleNode.innerHTML = require('./style');\n\n  document.head.appendChild(styleNode);\n\n}).call(this);\n",
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