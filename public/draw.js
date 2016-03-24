// Tandygram!

// Initial application configuration
// Base size of our tangram
var baseSize = 500;
// Speed of rotation (higher is slower)
var rotateSpeed = 8;

// Placeholder active shape until it is set
var activeShape = undefined;

// Pick random color scheme using randomColor
// https://github.com/davidmerfield/randomColor
var colorSchemes = [
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'purple',
  'pink',
  'monochrome'
];

var randomScheme = Math.floor(Math.random() * 8);

colors = randomColor({
  hue: colorSchemes[randomScheme],
  count: 8
});

var observeActive = function(activeId){
  shapes.forEach(function(shape) {
    if (shape.id === activeId) {
      shape.attr({
        stroke: colors[7],
        strokeWidth: baseSize/150
      });

      // Get the shapes dom node and make it the last
      // one inside the parent
      shapeEl = shape.node;
      shapeEl.parentNode.appendChild(shapeEl);

      activeShape = shape;
    } else {
      shape.active = false;
      shape.attr({
        strokeWidth: 0
      })
    }
  })
};

var rotate = function(paper, element, degrees) {
  element.matrix.rotate(degrees, element.centerX, element.centerY);
  element.degrees += degrees;
  element.transform(element.matrix);
};

var s = Snap("#tandy-svg");
var rightTriA = rightTriangle(s, 0, 0, baseSize);
var rightTriB = rightTriangle(s, 0, 0, baseSize);
var rightTriC = rightTriangle(s, 0, 0, baseSize * (Math.sqrt(2) / 2));
var rightTriD = rightTriangle(s, 0, 0, baseSize / 2);
var rightTriE = rightTriangle(s, 0, 0, baseSize / 2 );
var squareA = square(s, 0, 0, baseSize * (Math.sqrt(2) / 4));
var parallelogramA = parallelogram(s, 0, 0, baseSize / 2);

shapes = [
    rightTriA,
    rightTriB,
    rightTriC,
    rightTriD,
    rightTriE,
    squareA,
    parallelogramA
];

shapes.forEach(function(shape, index) {
  shape.id = index;
  shape.attr({
    fill: colors[index]
  });
  shape.drag();
});

//hammer touch events for rotating the shapes on mobile wo buttons
var tandyShape = document.getElementById('tandy-svg');
var mc = new Hammer.Manager(tandyShape);
var lastRotation = 0;
var rotating = false;
mc.add(new Hammer.Pan({ threshold: 1, pointers: 0 })).recognizeWith(mc.get('pan'));
mc.add(new Hammer.Rotate({ threshold: 0 }));

mc.on("rotate", onRotate);
mc.on("rotateend", function(){
  rotating = false
});

function onRotate(event) {
  console.log(lastRotation, deltaRotation);
  if (rotating) {
    var deltaRotation = Math.abs(event.rotation - lastRotation)
    if (event.rotation > lastRotation) {
      rotate(s, activeShape, deltaRotation);
    } else {
      rotate(s, activeShape, -1 * deltaRotation);
    }
    lastRotation = event.rotation;
  } else {
    lastRotation = event.rotation;
    rotating = true;
  }

}

//keyboard events for rotating on desktop
var rotateRightInterval = false;
var rotateLeftInterval = false;

document.addEventListener('keydown', function(event){
  if (activeShape && event.keyCode == 39) {
    if (!rotateRightInterval) {
      rotateRightInterval = setInterval(function(){
        rotate(s, activeShape, 1);
      }, rotateSpeed);
    }
  } else if (activeShape && event.keyCode == 37) {
    if (!rotateLeftInterval) {
      rotateLeftInterval = setInterval(function(){
        rotate(s, activeShape, -1);
      }, rotateSpeed);
    }
  }
});

// Unset rotation so things don't spin out forever
document.addEventListener('keyup', function(event){
  if (event.keyCode == 39) {
    clearInterval(rotateRightInterval);
    rotateRightInterval = false;
  } else if (event.keyCode == 37) {
    clearInterval(rotateLeftInterval);
    rotateLeftInterval = false;
  }
});

// Simple saving
var saveButton = document.querySelector('[data-button-save]');
var sampleRequest = {"members":
    [
      {
        "shape": 1,
        "x": 200,
        "y": 200,
        "rotation": 1.0003,
        "color": {"R": 24, "G": 25, "B": 26 }

      }, {
      "shape": 2,
      "x": 400,
      "y": 400,
      "rotation": 0.045,
      "color": {"R": 1, "G": 2, "B": 3 }

    }
    ],
  "clientId": "MAC123123",
  "name": "Lucas"
};

window.addEventListener('keyup', function(event) {
  if (event.keyCode == 71) {
    var shapeObjects = {
      name: "Blake",
      client: "Mac",
      members: []
    };

    shapes.forEach(function(shape){
      var shapeJson = {
        id: shape.id,
        type: shape.type,
        size: shape.size,
        color: shape.attr('fill'),
        degrees: shape.degrees,
        e: shape.matrix.e,
        f: shape.matrix.f
      };

      shapeObjects.members.push(shapeJson);
    });

    document.getElementById('jsonOut').value = JSON.stringify(shapeObjects);
  }
});

saveButton.addEventListener('click', function(event) {

  var request = new XMLHttpRequest();
  request.open('POST', 'http://localhost:8080/api/composites', true);
  request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
  request.send(JSON.stringify(sampleRequest));
});