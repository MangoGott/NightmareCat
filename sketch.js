const SIZE = 256;
let inputImg, inputCanvas, output, statusMsg, pix2pix, clearBtn, transferBtn, currentColor, currentStroke;
let capture;

let buffer;
let result;
let lines;
let w = 640, h = 480;

//test

function setup() {
  // Create a canvas
  inputCanvas = createCanvas(SIZE, SIZE);
  inputCanvas.class('border-box').parent('input');

  // Display initial input image
  inputImg = loadImage('images/robin.jpg', drawImage);
  capture = createCapture(VIDEO);
  capture.hide();
  // Selcect output div container
  output = select('#output');
  statusMsg = select('#status');

 
  buffer = new jsfeat.matrix_t(w, h, jsfeat.U8C1_t);
	stroke('red');
  strokeWeight(2);



  // Get the buttons
  currentColor = color(203, 222, 174);
  currentStroke = 17;
  select('#green').mousePressed(() => currentColor = color(203, 222, 174));
  select('#black').mousePressed(() => currentColor = color(0, 0, 0));
  select('#pink').mousePressed(() => currentColor = color(255, 163, 244));
  select('#white').mousePressed(() => currentColor = color(255, 255, 255));
  select('#size').mouseReleased(() => currentStroke = select('#size').value());

  // Select 'transfer' button html element
  transferBtn = select('#transferBtn');

  // Select 'clear' button html element
  clearBtn = select('#clearBtn');
  // Attach a mousePressed event to the 'clear' button
  clearBtn.mousePressed(function() {
    clearCanvas();
  });

  // Set stroke to black
  stroke(5);
  pixelDensity(1);

  // Create a pix2pix method with a pre-trained model
  //pix2pix = ml5.pix2pix('model/maps.pict', modelLoaded);
  //pix2pix = ml5.pix2pix('model/edges2pikachu.pict', modelLoaded);
  pix2pix = ml5.pix2pix('model/edges2cats_AtoB.pict', modelLoaded);
  //pix2pix = ml5.pix2pix('model/PixFace.pict', modelLoaded);
  //pix2pix = ml5.pix2pix('model/PixFaceLightLight.pict', modelLoaded);
}

// Draw on the canvas when mouse is pressed
function draw() {
  if (mouseIsPressed) {
    stroke(currentColor);
    strokeWeight(currentStroke)
    line(mouseX, mouseY, pmouseX, pmouseY);
  }


  capture.loadPixels();
    if (capture.pixels.length > 0) { // don't forget this!        
        var blurSize = select('#blurSize').elt.value;
        var lowThreshold = select('#lowThreshold').elt.value;
        var highThreshold = select('#highThreshold').elt.value;
        
        blurSize = map(blurSize, 0, 100, 1, 12);
        lowThreshold = map(lowThreshold, 0, 100, 0, 255);
        highThreshold = map(highThreshold, 0, 100, 0, 255);
        
        jsfeat.imgproc.grayscale(capture.pixels, w, h, buffer);
        jsfeat.imgproc.gaussian_blur(buffer, buffer, blurSize, 0);
        jsfeat.imgproc.canny(buffer, buffer, lowThreshold, highThreshold);
        var n = buffer.rows * buffer.cols;
        // uncomment the following lines to invert the image
        for (var i = 0; i < n; i++) {
            buffer.data[i] = 255 - buffer.data[i];
        }
        result = jsfeatToP5(buffer, result);
        image(result, 0, 0, w, h);
      
    		
      	/*
      	lines = probabilisticHoughTransform(buffer.data, 
                                            640, 480, 
                                            1, PI/180, 
                                            50,0,0,50);
        for (let myLine of lines) {
          var x0 = myLine[0].x;
          var y0 = myLine[0].y;
          var x1 = myLine[1].x;
          var y1 = myLine[1].y;
          
          line(x0,y0,x1,y1);
          //console.log(myLine);
        }
        */
       //move image by the width of image to the left
  translate(result.width, 0);
  //then scale it by -1 in the x-axis
  //to flip the image
  scale(-1, 1);
  image(result, 180, 0);  //filter(GRAY);
  //filter(THRESHOLD,0.4);
    }

  
}

function jsfeatToP5(src, dst) {
  if (!dst || dst.width != src.cols || dst.height != src.rows) {
      dst = createImage(src.cols, src.rows);
  }
  var n = src.data.length;
  dst.loadPixels();
  var srcData = src.data;
  var dstData = dst.pixels;
  for (var i = 0, j = 0; i < n; i++) {
      var cur = srcData[i];
      dstData[j++] = cur;
      dstData[j++] = cur;
      dstData[j++] = cur;
      dstData[j++] = 255;
  }
  dst.updatePixels();
  return dst;
}


// A function to be called when the models have loaded
function modelLoaded() {
  // Show 'Model Loaded!' message
  statusMsg.html('Model Loaded!');
  // Call transfer function after the model is loaded
  //transfer();
  // Attach a mousePressed event to the transfer button
  transferBtn.mousePressed(function() {
    transfer();
  });
}

// Draw the input image to the canvas
function drawImage() {
  inputImg.resize(570, 0)
  //image(inputImg, -160, -40);
}

// Clear the canvas
function clearCanvas() {
  background(255);
}

function transfer() {
  // Update status message
  statusMsg.html('Transfering...');

  // Select canvas DOM element
  const canvasElement = select('canvas').elt;

  // Apply pix2pix transformation
  pix2pix.transfer(canvasElement, function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result && result.src) {
      statusMsg.html('Done!');
      // Create an image based result
      output.elt.src = result.src;
    }
  });
}
