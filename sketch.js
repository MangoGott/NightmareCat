const SIZE = 256;
let inputImg, inputCanvas, output, statusMsg, pix2pix, clearBtn, transferBtn, currentColor, currentStroke;
let capture;

let buffer;
let result;
let lines;
let w = 640, h = 480;


function setup() {
  inputCanvas = createCanvas(SIZE, SIZE);
  inputCanvas.class('border-box').parent('input');

  capture = createCapture(VIDEO);
  capture.hide();
  // Selcect output div container
  output = select('#output');
  statusMsg = select('#status');

  buffer = new jsfeat.matrix_t(w, h, jsfeat.U8C1_t);
	stroke('red');
  strokeWeight(2);

  transferBtn = select('#transferBtn');

  stroke(5);
  pixelDensity(1);

  // Select a pre-trained model
  //pix2pix = ml5.pix2pix('model/maps.pict', modelLoaded);
  //pix2pix = ml5.pix2pix('model/edges2pikachu.pict', modelLoaded);
  pix2pix = ml5.pix2pix('model/edges2cats_AtoB.pict', modelLoaded);
  //pix2pix = ml5.pix2pix('model/PixFace.pict', modelLoaded);
  //pix2pix = ml5.pix2pix('model/PixFaceLightLight.pict', modelLoaded);
}

function draw() {
 
  capture.loadPixels();
    if (capture.pixels.length > 0) {    
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
        //Invert the image
        for (var i = 0; i < n; i++) {
            buffer.data[i] = 255 - buffer.data[i];
        }
        result = jsfeatToP5(buffer, result);
        image(result, 0, 0, w, h);
      
  translate(result.width, 0);
  scale(-1, 1);
  image(result, 180, 0); 
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

function modelLoaded() {
  statusMsg.html('Model Loaded!');

  transferBtn.mousePressed(function() {
    transfer();
  });
}

function drawImage() {
  inputImg.resize(570, 0)
}

function transfer() {
  statusMsg.html('Transfering...');

  const canvasElement = select('canvas').elt;

  pix2pix.transfer(canvasElement, function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result && result.src) {
      statusMsg.html('Done!');
      output.elt.src = result.src;
    }
  });
}
