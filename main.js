import './style.css'
import { JSapplyGrayscale, JSapplySepia, JSapplyInvert, JSapplyGaussianBlur, JSapplyHistogramEqualization, JSapplyThreshold, JSapplyCanny } from './jsFilter';

const upload = document.getElementById("upload");
const canvas = document.getElementById("imageCanvas");
const ctx = canvas.getContext('2d');
let originalImageData;


// 파일 업로드
upload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  const img = new Image();
  img.src = URL.createObjectURL(file);
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  };
});

function applyFilter(filterType) {
  let imageData = new ImageData(new Uint8ClampedArray(originalImageData.data), originalImageData.width, originalImageData.height);
  if (!imageData) return;

  const width = imageData.width;
  const height = imageData.height;
  let totalTime = 0;

  for (let i = 0; i < 50; i++) {
    const startTime = window.performance.now();

    switch (filterType) {
      case 'JS Grayscale':
        imageData = JSapplyGrayscale(imageData);
        break;
      case 'JS Sepia':
        imageData = JSapplySepia(imageData);
        break;
      case 'JS Invert':
        imageData = JSapplyInvert(imageData);
        break;
      case 'JS Gaussian Blur':
        imageData = JSapplyGaussianBlur(imageData, width, height);
        break;
      case 'JS Histogram Equalization':
        imageData = JSapplyHistogramEqualization(imageData);
        break;
      case 'JS Threshold':
        imageData = JSapplyThreshold(imageData, 128);
        break;
      case 'JS Canny Edge Detection':
        imageData = JSapplyCanny(imageData, width, height);
        break;
    }
    const endTime = window.performance.now();
    totalTime += (endTime - startTime);
    if(i == 0) ctx.putImageData(imageData, 0, 0);
  }
  console.log(`${filterType}`, (totalTime / 50), 'ms');
}

document.getElementById('JSgrayscaleRange').addEventListener('click', () => applyFilter('JS Grayscale'));
document.getElementById('JSsepiaRange').addEventListener('click', () => applyFilter('JS Sepia'));
document.getElementById('JSinvertRange').addEventListener('click', () => applyFilter('JS Invert'));
document.getElementById('JSgaussianRange').addEventListener('click', () => applyFilter('JS Gaussian Blur'));
document.getElementById('JShistogramRange').addEventListener('click', () => applyFilter('JS Histogram Equalization'));
document.getElementById('JSthresholdRange').addEventListener('click', () => applyFilter('JS Threshold', 128)); // 임계값 128
document.getElementById('JScannyRange').addEventListener('click', () => applyFilter('JS Canny Edge Detection'));

function applyWASMFilter(filterType) {
  let imageData = new ImageData(new Uint8ClampedArray(originalImageData?.data), originalImageData?.width, originalImageData?.height);
  if (!imageData) return;

  const width = imageData.width;
  const height = imageData.height;
  const dataPtr = Module._malloc(imageData.data.length);

  try {
    let wasmTotalTime = 0;

    for (let i = 0; i < 50; i++) {
      Module.HEAPU8.set(imageData.data, dataPtr);

      const startTime = window.performance.now();
      switch (filterType) {
        case 'WASM Grayscale':
          Module.ccall("apply_grayscale", null, ["number", "number", "number"], [dataPtr, width, height]);
          break;
        case 'WASM Sepia':
          Module.ccall("apply_sepia", null, ["number", "number", "number"], [dataPtr, width, height]);
          break;
        case 'WASM Invert':
          Module.ccall("apply_invert", null, ["number", "number", "number"], [dataPtr, width, height]);
          break;
        case 'WASM Gaussian Blur':
          Module.ccall("apply_gaussian", null, ["number", "number", "number"], [dataPtr, width, height]);
          break;
        case 'WASM Histogram Equalization':
          Module.ccall("apply_histogram", null, ["number", "number", "number"], [dataPtr, width, height]);
          break;
        case 'WASM Threshold':
          Module.ccall("apply_threshold", null, ["number", "number", "number", "number"], [dataPtr, width, height, 128]);
          break;
          case 'WASM Canny Edge Detection':
          Module.ccall("apply_canny", null, ["number", "number", "number"], [dataPtr, width, height]);
          break;
      }

      const endTime = window.performance.now();
      wasmTotalTime += (endTime - startTime);
    }

    console.log(`${filterType}`, wasmTotalTime / 50, 'ms');

    // 필터 처리된 데이터 복사
    const resultData = Module.HEAPU8.subarray(dataPtr, dataPtr + imageData.data.length);
    imageData.data.set(resultData);
    ctx.putImageData(imageData, 0, 0);
  } finally {
    // 메모리 해제
    Module._free(dataPtr);
  }
}


document.getElementById("WASMgrayscaleRange").addEventListener("click", () => applyWASMFilter('WASM Grayscale'));
document.getElementById("WASMsepiaRange").addEventListener("click", () => applyWASMFilter('WASM Sepia'));
document.getElementById("WASMinvertRange").addEventListener("click", () => applyWASMFilter('WASM Invert'));
document.getElementById("WASMgaussianRange").addEventListener("click", () => applyWASMFilter('WASM Gaussian Blur'));
document.getElementById("WASMhistogramRange").addEventListener("click", () => applyWASMFilter('WASM Histogram Equalization'));
document.getElementById("WASMthresholdRange").addEventListener("click", () => applyWASMFilter('WASM Threshold', 128)); // 임계값 128
document.getElementById("WASMcannyRange").addEventListener("click", () => applyWASMFilter('WASM Canny Edge Detection'));
