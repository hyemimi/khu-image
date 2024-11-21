let Module = {};  // Emscripten 모듈
let imageData, canvas, ctx;

// 이미지 로딩 및 캔버스 초기화
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

// 필터 적용 함수
function applyFilter(filterType) {
    if (!imageData) return;
    
    const width = imageData.width;
    const height = imageData.height;
    const dataPtr = Module._malloc(imageData.data.length);
    Module.HEAPU8.set(imageData.data, dataPtr);

    // 필터 선택
    if (filterType === "grayscale") {
        Module.ccall("apply_grayscale", null, ["number", "number", "number"], [dataPtr, width, height]);
    } else if (filterType === "sepia") {
        Module.ccall("apply_sepia", null, ["number", "number", "number"], [dataPtr, width, height]);
    } else if (filterType === "invert") {
        Module.ccall("apply_invert", null, ["number", "number", "number"], [dataPtr, width, height]);
    }

    // 메모리에서 결과 가져오기
    const resultData = new Uint8ClampedArray(Module.HEAPU8.subarray(dataPtr, dataPtr + imageData.data.length));
    imageData.data.set(resultData);
    ctx.putImageData(imageData, 0, 0);

    Module._free(dataPtr);
}
