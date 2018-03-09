// Define an object that holds data about the currently drawn mandelbrot (not good practise to define globally)
var currentMandelbrot = {
    width: 0,        
    height: 0,        
    xmin: 0.0,        
    xmax: 0.0,        
    ymin: 0.0,        
    ymax: 0.0,        
}

// This function defined the pixel color for each interation value based on type of coloring
// Coloring method proposed by third party; calculations not obvious
function definePixelColorsGlow(pixelColors, maxIterations, color_variation) {

    // These values are for coloring the image
    var r0 = 0; var g0 = 0; var b0 = 0;
    var rweigth = 60; var gweight = 30; var bweight = 1;        
    if (color_variation === "red") {
        rweigth = 1; gweight = 30; bweight = 60;        
    } else if (color_variation === "green") {
        rweigth = 30; gweight = 1; bweight = 60;        
    }

    while (r0 == g0 || r0 == b0 || g0 == b0) {
        r0 = Math.pow(2, Math.ceil(rweigth * 3 + 3));
        g0 = Math.pow(2, Math.ceil(gweight * 3 + 3));
        b0 = Math.pow(2, Math.ceil(bweight * 3 + 3));
    }

    var r1 = 256 / r0; var g1 = 256 / g0; var b1 = 256 / b0;

    for (i=0; i <= maxIterations; i++) {
        pixelColors[0][i] = i % r0 * r1;     // red
        pixelColors[1][i] = i % g0 * g1;     // green
        pixelColors[2][i] = i % b0 * b1;     // blue
        pixelColors[3][i] = 255;             // alpha
    }

}

// Function that creates color scheme based on gradients
function definePixelColorsGrade(pixelColors, maxIterations, color_variation) {
    
    if (color_variation === "white") {
        for (i=0; i <= maxIterations; i++) {
            pixelColors[0][i] = i / 256 * 255;     // red
            pixelColors[1][i] = i / 256 * 255;     // green
            pixelColors[2][i] = i / 256 * 255;     // blue
            pixelColors[3][i] = 255;               // alpha
        }
    } else if (color_variation === "black") {
        for (i=0; i <= maxIterations; i++) {
            pixelColors[0][i] = 255 - i / 256 * 255;     // red
            pixelColors[1][i] = 255 - i / 256 * 255;    // green
            pixelColors[2][i] = 255 - i / 256 * 255;    // blue
            pixelColors[3][i] = 255;           // alpha
        }
    } else if (color_variation === "red-black") {
        for (i=0; i <= maxIterations; i++) {
            pixelColors[0][i] = i / 256 * 255;     // red
            pixelColors[1][i] = 0;    // green
            pixelColors[2][i] = 0;    // blue
            pixelColors[3][i] = 255;           // alpha
        }
    } else if (color_variation === "red-white") {
        for (i=0; i <= maxIterations; i++) {
            pixelColors[0][i] = 255;     // red
            pixelColors[1][i] = 255 - i / 256 * 255;    // green
            pixelColors[2][i] = 255 - i / 256 * 255;    // blue
            pixelColors[3][i] = 255;           // alpha
        }
    } else if (color_variation === "rainbow") {
        for (i=0; i <= parseInt(maxIterations/3); i++) {
            pixelColors[0][i] = 255 - 3*i / 256 * 255;     // red
            pixelColors[1][i] = 255 - 3*i / 256 * 255;    // green
            pixelColors[2][i] = 255;    // blue
            pixelColors[3][i] = 255;           // alpha
        }
        for (i=parseInt(maxIterations/3); i <= parseInt(maxIterations*2/3); i++) {
            pixelColors[0][i] = 255 - 3/2*i / 256 * 255;     // red
            pixelColors[1][i] = 255;    // green
            pixelColors[2][i] = 255 - 3/2*i / 256 * 255;    // blue
            pixelColors[3][i] = 255;           // alpha
        }
        for (i= parseInt(maxIterations*2/3); i <= maxIterations; i++) {
            pixelColors[0][i] = 255;     // red
            pixelColors[1][i] = 255 - i / 256 * 255;    // green
            pixelColors[2][i] = 255 - i / 256 * 255;    // blue
            pixelColors[3][i] = 255;           // alpha
        }
    }
    
}
    

// This function checks if a number as been entered for a specified text box
function checkIfNumberEntered(default_value, dom_element, isInteger) {

    if (isNaN(parseInt($(dom_element).val()))) {
        $(dom_element).val(default_value); // If not a number entered fill in the default value
    } else {
        if (isInteger) {
            default_value = parseInt($(dom_element).val()); // If it is a number use it
            $(dom_element).val(default_value); // If not a number entered fill in the default value
        } else {
            default_value = parseFloat($(dom_element).val()); // If it is a number use it            
        }
    }
    return default_value;

}

// Function that precalculated the float value for x in the imaginary plane based on pixel position and stores in array
// Used to speed up process by not having to make the same calculation for each row
function calcFloatValuesForX(x_values, xmin, xmax, xr) {

    for(var kx = 0; kx < xr; kx++) {
        x_values[kx] = xmin + (xmax - xmin) * kx / xr;
    }

}

// Main function that collects parameters and draws the Mandelbrot baased on these parameters
function drawFractal(result) {

    // Define canvas size and check user entered parameters
    var canvas_width = checkIfNumberEntered($(window).width()-2, '#canvas_width', true);
    var canvas_height = checkIfNumberEntered($(window).height()-2, '#canvas_height', true);

    // Define the area in the imaginary plane which should be rendered; check user parameters
    xmin_default = -2.0; xmax_default = 0.7;
    var xmin = checkIfNumberEntered(xmin_default, '#x_real_min', false); 
    var xmax = checkIfNumberEntered(xmax_default, '#x_real_max', false); 

    // Calculate y min and max default based on image width and xmin and ymin
    var ydefault = (canvas_height/canvas_width) * (xmax - xmin) / 2;
    var ymax = checkIfNumberEntered(-ydefault, '#y_img_min', false); 
    var ymin = checkIfNumberEntered(ydefault, '#y_img_max', false); 

    // Get the coloring scheme the user has selected
    var coloring_scheme_func = definePixelColorsGlow;
    var color_variation = "";
    switch ($('#color_scheme').val()) {
        case "black-blue-black":
            coloring_scheme_func = definePixelColorsGlow;
            color_variation = "blue";
            break;
        case "black-red-black":
            coloring_scheme_func = definePixelColorsGlow;
            color_variation = "red";
            break;
        case "black-green-black":
            coloring_scheme_func = definePixelColorsGlow;
            color_variation = "green";
            break;
        case "black-grey-white":
            coloring_scheme_func = definePixelColorsGrade;
            color_variation = "white";
            break;
        case "white-grey-black":
            coloring_scheme_func = definePixelColorsGrade;
            color_variation = "black";
            break;
        case "red-black":
            coloring_scheme_func = definePixelColorsGrade;
            color_variation = "red-black";
            break;
        case "red-white":
            coloring_scheme_func = definePixelColorsGrade;
            color_variation = "red-white";
            break;
        case "rainbow":
            coloring_scheme_func = definePixelColorsGrade;
            color_variation = "rainbow";
            break;
    }

    // Set values of object defining the current drawing to be used for graphical zooming
    currentMandelbrot.width = canvas_width;
    currentMandelbrot.height = canvas_height;
    currentMandelbrot.xmin = xmin;
    currentMandelbrot.xmax = xmax;
    currentMandelbrot.ymin = ymin;
    currentMandelbrot.ymax = ymax;
        
    // Get a reference to the canvas and store in a local variable
    var canvas = $('#canvas').get(0);
    
    // Set canvas dimensions
    canvas.width = canvas_width;
    canvas.height = canvas_height;
    canvas.style.width = canvas_width + "px";
    canvas.style.height = canvas_height + "px";

    // Create a 2d context object to use for the drawing
    var context = canvas.getContext('2d');

    // Define the maximum number of iterations; should probably allow for multi cut off points for different colors (user defined)
    var maxIt = 256;
    
    // Create array that will hold the different rgb values for different number of iterations
    var pixelColors = [[],[],[],[]];

    // Call function that defines the pixel colors
    coloring_scheme_func(pixelColors, maxIt, color_variation)

    // Get the width and height of the image (canvas) by pulling from html element, but both should probably be set programatically at later stage
    var xr = context.canvas.width;
    var yr = context.canvas.height;

    // Create an ImageData object (with black transparent pixels) for the canvas' 2d context
    var imgData = context.createImageData(xr, yr);

    // Create a reference to a one dimensional array that holds the pixel RGBA values; 
    // The RGBA values are stored as four values after each other in a list pixel after pixel
    var pixRGBA = imgData.data;

    // Initiate vlues of pixel location and calculation variables
    var x = 0.0; var y = 0.0;
    var zx = 0.0; var zy = 0.0;
    var zx2 = 0.0; var zy2 = 0.0;

    // Calculate the number of pixels for statitics
    result.pixels = xr * yr;
    
    // Call function that creates array with x-values to reduce number of calculations
    var x_values = [];
    calcFloatValuesForX(x_values, xmin, xmax, xr);

    // We capture the time just before iterations since calculations before are constant independent of number of iterations
    result.beforeiterations = Date.now();

    // Loop over all the points in the image 
    for (var ky = 0; ky < yr; ky++) {
        // Calclulate the float value representing the imaginary value of the point
        y = ymin + (ymax - ymin) * ky / yr;
        for(var kx = 0; kx < xr; kx++) {
            // Retrieve x-values as float from array with precalculated values
            x = x_values[kx];
            zx = x; zy = y;
            
            // Check how many loops that can be carried out with condition met or max nr of iterations done
            for(var i = 0; i < maxIt; i++) {
                zx2 = zx * zx; // Do the multiplication once
                zy2 = zy * zy; // Do the multiplication once
                if(zx2 + zy2 > 4.0) break; // Mandelbrot specific rule for breaking the iteration
                zy = 2.0 * zx * zy + y;
                zx = zx2 - zy2 + x;
            }
            result.iterations = result.iterations + i;

            // Set ipr to the index value of the R in the pixel array  
            var ipr = (xr * ky + kx) * 4;

            pixRGBA[ipr] = pixelColors[0][i];       // red
            pixRGBA[ipr + 1] = pixelColors[1][i];   // green
            pixRGBA[ipr + 2] = pixelColors[2][i];   // blue
            pixRGBA[ipr + 3] = pixelColors[3][i];   // alpha

        }

    }
    result.aftereiterations = Date.now();    
    context.putImageData(imgData, 0, 0);
}

// Function that formats numbers to use comma separator for thousands
function formatWithComma(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
} 

function printResult(result) {
    $("#result").html(
        '<table id="result-table">' +
        // '<tr><td>Start time:</td><td align="right">' + result.starttime + '</tr></td>' +
        // '<tr><td>Before iterations:</td><td align="right">' + result.beforeiterations + '</tr></td>' +
        // '<tr><td>After iterations:</td><td align="right">' + result.aftereiterations + '</tr></td>' +
        // '<tr><td>End time:</td><td align="right">' + result.endtime + '</tr></td>' +
        '<tr><td>Iteration time (ms):</td><td align="right">' + formatWithComma(result.aftereiterations - result.beforeiterations) + '</tr></td>' +
        // '<tr><td>Total time (ms):</td><td align"right">' + (result.endtime - result.starttime) + '</tr></td>' +
        // '<tr><td>Pixels:</td><td align="right">' + result.pixels + '</tr></td>' +
        '<tr><td>Iterations:</td><td align="right">' + formatWithComma(result.iterations) + '</tr></td>' +
        '<tr><td>Iterations/ms:</td><td align="right">' + formatWithComma(parseInt(1/(result.aftereiterations - result.beforeiterations) * result.iterations)) + '</tr></td>' +
        '</table>'
    );
}


// Function that kicks off the drawing of the fractal and capturing of statistics
function initiateFractalDraw() {

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

}

function drawFromJcrop() {
    // Draw based on current selection
    initiateFractalDraw();
    // Get reference to jcrop and release the current selection so that it is removed after the mandelbrot is redrawn
    JcropAPI = $('#canvas').data('Jcrop');
    JcropAPI.release();
}

// Function that calculates points in the xy-plane when using graphic area selector
function calculatePoints(c) {

    // Calculate what values in xy-plane the coordinates are corresponding to
    new_xmin = currentMandelbrot.xmin + (c.x / (currentMandelbrot.width - 1)) * (currentMandelbrot.xmax - currentMandelbrot.xmin);
    new_xmax = currentMandelbrot.xmin + (c.x2 / (currentMandelbrot.width - 1)) * (currentMandelbrot.xmax - currentMandelbrot.xmin);
    new_ymin = -(currentMandelbrot.ymin + (c.y2 / (currentMandelbrot.height - 1)) * (currentMandelbrot.ymax - currentMandelbrot.ymin));
    new_ymax = -(currentMandelbrot.ymin + (c.y / (currentMandelbrot.height - 1)) * (currentMandelbrot.ymax - currentMandelbrot.ymin));

    $('#x_real_min').val(new_xmin);
    $('#x_real_max').val(new_xmax);
    $('#y_img_min').val(new_ymin);
    $('#y_img_max').val(new_ymax);
    
}

// Function that initiates the graphical selector tool
function initiateJcrop() {
    
    // Eneble and define zooming using Jcrop third party plugin
    var this_canvas = $('#canvas');
    var myAspectRatio = checkIfNumberEntered($('#canvas').get(0).width, '#canvas_width', true) / checkIfNumberEntered($('#canvas').get(0).height, '#canvas_height', true);
    this_canvas.Jcrop({
        onChange: calculatePoints,
        onSelect: drawFromJcrop,
        allowSelect: true,
        allowMove: true,
        allowResize: true,
        aspectRatio: myAspectRatio
    });
    $('.jcrop-holder').css('position','absolute');

}

// Function that loads an image in a new tab or window
function canvasAsImageInNewWindow() {
    var dataURL = canvas.toDataURL("image/png");
    var newTab = window.open(dataURL, 'Image');
    newTab.focus();
}

// This code is executed as soon as the document has been loaded
$(document).ready(function() {

    // Hook up click event for draw button
    $('#btn_draw_fractal').on('click', function(evt) {
        initiateFractalDraw();
        initiateJcrop();
    });

    // Hook up click event to show image in new window
    $('#btn_image_in-New_window').on('click', function(evt) {
        canvasAsImageInNewWindow();
    });

    // Start drawing first time
    initiateFractalDraw();

    // Set light box div to visible (since it is initially hidden to avoid showing at inital loading)
    $('#mylightbox').css('visibility', 'visible')
    
    // Enable graphical selection tool
    initiateJcrop();

});
