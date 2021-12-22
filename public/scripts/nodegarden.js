// modified from https://github.com/pakastin/nodegarden

// The MIT License (MIT)

// Copyright (c) 2015 Juha Lindstedt

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

(function () {
  "use strict";

  function defined(a, b) {
    return a != null ? a : b;
  }

  var targetFPS = 1000 / 60;

  var Node = function Node(garden) {
    this.garden = garden;
    this.reset();
  };

  Node.prototype.reset = function reset(ref) {
    if (ref === void 0) ref = {};
    var x = ref.x;
    var y = ref.y;
    var vx = ref.vx;
    var vy = ref.vy;
    var m = ref.m;

    this.x = defined(x, Math.random() * this.garden.width);
    this.y = defined(y, Math.random() * this.garden.height);
    this.vx = defined(vx, Math.random() * 0.5 - 0.25);
    this.vy = defined(vy, Math.random() * 0.5 - 0.25);
    this.m = defined(m, Math.random() * 2.5 + 0.5);
  };

  Node.prototype.addForce = function addForce(force, direction) {
    this.vx += (force * direction.x) / this.m;
    this.vy += (force * direction.y) / this.m;
  };

  Node.prototype.distanceTo = function distanceTo(node) {
    var x = node.x - this.x;
    var y = node.y - this.y;
    var total = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));

    return { x: x, y: y, total: total };
  };

  Node.prototype.update = function update(deltaTime) {
    this.x += (this.vx * deltaTime) / targetFPS;
    this.y += (this.vy * deltaTime) / targetFPS;

    if (
      this.x > this.garden.width + 50 ||
      this.x < -50 ||
      this.y > this.garden.height + 50 ||
      this.y < -50
    ) {
      // if node over screen limits - reset to a init position
      this.reset();
    }
  };

  Node.prototype.squaredDistanceTo = function squaredDistanceTo(node) {
    return (
      (node.x - this.x) * (node.x - this.x) +
      (node.y - this.y) * (node.y - this.y)
    );
  };

  Node.prototype.collideTo = function collideTo(node) {
    node.vx =
      (node.m * node.vx) / (this.m + node.m) +
      (this.m * this.vx) / (this.m + node.m);
    node.vy =
      (node.m * node.vy) / (this.m + node.m) +
      (this.m * this.vy) / (this.m + node.m);

    this.reset();
  };

  Node.prototype.render = function render() {
    this.garden.ctx.beginPath();
    this.garden.ctx.arc(this.x, this.y, this.getDiameter(), 0, 2 * Math.PI);
    this.garden.ctx.fill();
  };

  Node.prototype.getDiameter = function getDiameter() {
    return this.m;
  };

  var devicePixelRatio = window.devicePixelRatio;
  if (devicePixelRatio === void 0) devicePixelRatio = 1;
  var requestAnimationFrame = window.requestAnimationFrame;

  var NodeGarden = function NodeGarden(container) {
    var this$1 = this;

    this.nodes = [];
    this.container = container;
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.started = false;

    if (devicePixelRatio && devicePixelRatio !== 1) {
      // if retina screen, scale canvas
      this.canvas.style.transform = "scale(" + 1 / devicePixelRatio + ")";
      this.canvas.style.transformOrigin = "0 0";
    }
    this.canvas.id = "nodegarden";

    window.addEventListener("mousedown", function (e) {
      //e.preventDefault();
      var bcr = container.getBoundingClientRect();
      var scrollPos = {
        x: window.scrollX,
        y: window.scrollY,
      };
      // Add mouse node
      var mouseNode = new Node(this$1);
      mouseNode.x = (e.pageX - scrollPos.x - bcr.left) * devicePixelRatio;
      mouseNode.y = (e.pageY - scrollPos.y - bcr.top) * devicePixelRatio;
      mouseNode.m = 15;

      mouseNode.update = function () {};
      mouseNode.reset = function () {};
      mouseNode.render = function () {};

      this$1.nodes.unshift(mouseNode);

      window.addEventListener("mousemove", function (e) {
        mouseNode.x = (e.pageX - scrollPos.x - bcr.left) * devicePixelRatio;
        mouseNode.y = (e.pageY - scrollPos.y - bcr.top) * devicePixelRatio;
      });

      window.addEventListener("mouseup", function (e) {
        for (var i = 0; i < this$1.nodes.length; i++) {
          if (this$1.nodes[i] === mouseNode) {
            this$1.nodes.splice(i--, 1);
            break;
          }
        }
      });
    });

    this.container.appendChild(this.canvas);
    this.resize();
  };

  NodeGarden.prototype.start = function start() {
    if (!this.playing) {
      this.playing = true;
      this.render(true);
    }
  };

  NodeGarden.prototype.stop = function stop() {
    if (this.playing) {
      this.playing = false;
    }
  };

  NodeGarden.prototype.resize = function resize() {
    this.width = this.container.clientWidth * devicePixelRatio;
    this.height = this.container.clientHeight * devicePixelRatio;
    this.area = this.width * this.height;

    // calculate nodes needed
    this.nodes.length = (Math.sqrt(this.area) / 25) | 0;

    // set canvas size
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // set node dots color
    this.ctx.fillStyle = "hsl(253deg 54% 70%)";

    // create nodes
    for (var i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i]) {
        continue;
      }
      this.nodes[i] = new Node(this);
    }
  };

  NodeGarden.prototype.render = function render(start, time) {
    var this$1 = this;

    if (!this.playing) {
      return;
    }

    if (start) {
      requestAnimationFrame(function (time) {
        this$1.render(true, time);
      });
    }

    var deltaTime = time - (this.lastTime || time);

    this.lastTime = time;

    // clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);

    // update links
    for (var i = 0; i < this.nodes.length - 1; i++) {
      var nodeA = this.nodes[i];
      for (var j = i + 1; j < this.nodes.length; j++) {
        var nodeB = this.nodes[j];
        var squaredDistance = nodeA.squaredDistanceTo(nodeB);

        // calculate gravity force
        var force = (3 * (nodeA.m * nodeB.m)) / squaredDistance;

        var opacity = force * 100;

        if (opacity < 0.025) {
          continue;
        }

        if (
          squaredDistance <=
          (nodeA.m / 2 + nodeB.m / 2) * (nodeA.m / 2 + nodeB.m / 2)
        ) {
          // collision: remove smaller or equal - never both of them
          if (nodeA.m <= nodeB.m) {
            nodeA.collideTo(nodeB);
          } else {
            nodeB.collideTo(nodeA);
          }
          continue;
        }

        var distance = nodeA.distanceTo(nodeB);

        // calculate gravity direction
        var direction = {
          x: distance.x / distance.total,
          y: distance.y / distance.total,
        };

        // draw gravity lines
        this.ctx.beginPath();
        this.ctx.strokeStyle =
          "rgba(191,191,191," + (opacity < 1 ? opacity : 1) + ")";
        this.ctx.moveTo(nodeA.x, nodeA.y);
        this.ctx.lineTo(nodeB.x, nodeB.y);
        this.ctx.stroke();

        nodeA.addForce(force, direction);
        nodeB.addForce(-force, direction);
      }
    }

    // render and update nodes
    for (var i$1 = 0; i$1 < this.nodes.length; i$1++) {
      this.nodes[i$1].render();
      this.nodes[i$1].update(deltaTime || 0);
    }
  };

  var pixelRatio = window.devicePixelRatio;
  var $container = document.getElementById("nodegardencontainer");

  var nodeGarden = new NodeGarden($container);

  // start simulation
  nodeGarden.start();

  var resetNode = 0;

  $container.addEventListener("click", function (e) {
    var bcr = $container.getBoundingClientRect();
    var scrollPos = {
      x: window.scrollX,
      y: window.scrollY,
    };
    resetNode++;
    if (resetNode > nodeGarden.nodes.length - 1) {
      resetNode = 1;
    }
    nodeGarden.nodes[resetNode].reset({
      x: (e.pageX - scrollPos.x - bcr.left) * pixelRatio,
      y: (e.pageY - scrollPos.y - bcr.top) * pixelRatio,
      vx: 0,
      vy: 0,
    });
  });

  window.addEventListener("resize", function () {
    nodeGarden.resize();
  });
})();
