function drawFractal(result) {

    // Get a reference to the canvas and store in a local variable
    var canvas = $('#canvas').get(0);
    // Create a 2d context object to use for the drawing
    var context = canvas.getContext('2d');

    // Get the width and height of the image (canvas) by pulling from html element, but both should probably be set programatically at later stage
    var xr = context.canvas.width;
    var yr = context.canvas.height;

    // Create an ImageData object (with black transparent pixels) for the canvas' 2d context
    var imgData = context.createImageData(xr, yr);

    // Create a reference to a one dimensional array that holds the pixel RGBA values; 
    // The RGBA values are stored as four values after each other in a list pixel after pixel
    var pixRGBA = imgData.data;

    // Define the area in the imaginary plane which should be rendered
    var xmin = -2.0; var xmax = 1.0;
    var ymin = -1.5; var ymax = 1.5;

    // These values are for coloring the image
    var r0 = 0; var g0 = 0; var b0 = 0;
    while(r0 == g0 || r0 == b0 || g0 == b0) {
        r0 = Math.pow(2, Math.ceil(60 * 3 + 3));
        g0 = Math.pow(2, Math.ceil(20 * 3 + 3));
        b0 = Math.pow(2, Math.ceil(1 * 3 + 3));
    }
    var r1 = 256 / r0; var g1 = 256 / g0; var b1 = 256 / b0;

    // Define the maximum number of iterations; should probably allow for multi cut off points for different colors (user defined)
    var maxIt = 256;

    var x = 0.0; var y = 0.0;
    var zx = 0.0; var zx0 = 0.0; var zy = 0.0;
    var zx2 = 0.0; var zy2 = 0.0;

    // We capture the time just before iterations since calculations before are constant independent of number of iterations
    result.pixels = xr * yr;
    result.beforeiterations = Date.now();
    
    // Loop over all the points in the image 
    for (var ky = 0; ky < yr; ky++) {
        // Calclulate the float value representing the imaginary value of the point
        y = ymin + (ymax - ymin) * ky / yr;
        for(var kx = 0; kx < xr; kx++) {
            // Calclulate the float value representing the real value of the point
            x = xmin + (xmax - xmin) * kx / xr;
            zx = x; zy = y;
            
            // Check how many loops that can be carried out with condition met or max nr of iterations done
            for(var i = 0; i < maxIt; i++) {
                zx2 = zx * zx; 
                zy2 = zy * zy;
                if(zx2 + zy2 > 4.0) break; // Mandelbrot specific rule for breaking the iteration
                zx0 = zx2 - zy2 + x;
                // zy = 2.0 * zx * zy + y;
                var zxy = zx * zy;
                zx = zx0;
                zy = zxy + zxy + y;
            }
            result.iterations = result.iterations + i;

            // Set p to the index value of the R in the pixel array  
            var ipr = (xr * ky + kx) * 4;

            // Define the pixel colors based on the number of iterations
            pixRGBA[ipr] = i % r0 * r1;     // red
            pixRGBA[ipr + 1] = i % g0 * g1; // green
            pixRGBA[ipr + 2] = i % b0 * b1; // blue
            pixRGBA[ipr + 3] = 255;           // alpha
        }

    }
    result.aftereiterations = Date.now();    
    context.putImageData(imgData, 0, 0);
}

function printResult(result) {
    $("#timer").html(
        'Start time:' + result.starttime + '<br />' +
        'Before iterations:' + result.beforeiterations + '<br />' +
        'After iterations:' + result.aftereiterations + '<br />' +
        'End time:' + result.endtime + '<br />' +
        'Iteration time (ms):' + (result.aftereiterations - result.beforeiterations) + '<br />' +
        'Total time (ms):' + (result.endtime - result.starttime) + '<br />' +
        'Pixels:' + result.pixels + '<br />' +
        'Iterations:' + result.iterations + '<br />' +
        'Iterations/ms:' + (1/(result.aftereiterations - result.beforeiterations) * result.iterations) + '<br />'
    );
}

// This code is executed as soon as the document has been loaded
$(document).ready(function() {

    var result = {
        starttime: 0,
        beforeiterations: 0,
        aftereiterations: 0,
        endtime: 0,
        pixels: 0,
        iterations: 0
    };

    result.starttime = Date.now();
    drawFractal(result);
    result.endtime = Date.now();
    printResult(result);
});
    