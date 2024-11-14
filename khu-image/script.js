let Module = {};  // Emscripten module
let imageData, canvas, ctx;

// Initialize canvas and load image
document.getElementById("imageInput").addEventListener("change", function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            canvas = document.getElementById("canvas");
            ctx = canvas.getContext("2d");
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
});

// Real-time filter application function
function applyFilter() {
    if (!imageData) return;

    const width = imageData.width;
    const height = imageData.height;
    const dataPtr = Module._malloc(imageData.data.length);
    Module.HEAPU8.set(imageData.data, dataPtr);

    // Get slider values for each filter
    const grayscaleValue = document.getElementById("grayscaleSlider").value;
    const sepiaValue = document.getElementById("sepiaSlider").value;
    const invertValue = document.getElementById("invertSlider").value;

    // Apply filters with slider values
    Module.ccall("apply_grayscale", null, ["number", "number", "number", "number"], [dataPtr, width, height, grayscaleValue]);
    Module.ccall("apply_sepia", null, ["number", "number", "number", "number"], [dataPtr, width, height, sepiaValue]);
    Module.ccall("apply_invert", null, ["number", "number", "number", "number"], [dataPtr, width, height, invertValue]);

    // Update the canvas with the new image data
    const resultData = new Uint8ClampedArray(Module.HEAPU8.subarray(dataPtr, dataPtr + imageData.data.length));
    imageData.data.set(resultData);
    ctx.putImageData(imageData, 0, 0);

    Module._free(dataPtr);
}

// Attach the applyFilter function to each slider’s input event
document.getElementById("grayscaleSlider").addEventListener("input", applyFilter);
document.getElementById("sepiaSlider").addEventListener("input", applyFilter);
document.getElementById("invertSlider").addEventListener("input", applyFilter);
