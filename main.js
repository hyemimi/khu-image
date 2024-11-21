import './style.css'
import { JSapplyGrayscale, JSapplyInvert, JSapplySepia } from './jsFilter';

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

/** 이미지 필터 - js */
function applyFilter(filterType) {

  // 원본 이미지 데이터를 복사하여 사용
  let imageData = new ImageData(new Uint8ClampedArray(originalImageData.data), originalImageData.width, originalImageData.height);

  switch (filterType) {
    case 'JSgrayscale':
      imageData = JSapplyGrayscale(imageData);
      console.log(imageData);
      break;
    case 'JSsepia':
      imageData = JSapplySepia(imageData);
      console.log(imageData);
      break;
    case 'JSinvert':
      imageData = JSapplyInvert(imageData);
      console.log(imageData);
      break;
  }
  
  // 캔버스에 필터 적용된 이미지 데이터 다시 그리기
  ctx.putImageData(imageData, 0, 0);
}

document.getElementById('JSgrayscaleRange').addEventListener('click', () => applyFilter('JSgrayscale'));
document.getElementById('JSsepiaRange').addEventListener('click', () => applyFilter('JSsepia'));
document.getElementById('JSinvertRange').addEventListener('click', () => applyFilter('JSinvert'));


/**WASM */
// Real-time filter application function
function applyWASMFilter(filterType) {
  let imageData = new ImageData(new Uint8ClampedArray(originalImageData?.data), originalImageData?.width, originalImageData?.height);
  
  if (!imageData) return;

  const width = imageData.width;
  const height = imageData.height;
  const dataPtr = Module._malloc(imageData.data.length);
  Module.HEAPU8.set(imageData.data, dataPtr);

  switch (filterType) {
    case 'WASMgrayscale':
      Module.ccall("apply_grayscale", null, ["number", "number", "number"], [dataPtr, width, height]);
      console.log(imageData);
      break;
    case 'WASMsepia':
      Module.ccall("apply_sepia", null, ["number", "number", "number"], [dataPtr, width, height]);
      console.log(imageData);
      break;
    case 'WASMinvert':
      Module.ccall("apply_invert", null, ["number", "number", "number"], [dataPtr, width, height]);
      console.log(imageData);
      break;
  }

  // Update the canvas with the new image data
  const resultData = new Uint8ClampedArray(Module.HEAPU8.subarray(dataPtr, dataPtr + imageData.data.length));
  imageData.data.set(resultData);
  ctx.putImageData(imageData, 0, 0);

  Module._free(dataPtr);
}

// Attach the applyFilter function to each slider’s input event
document.getElementById("WASMgrayscaleRange").addEventListener("click", () => applyWASMFilter('WASMgrayscale'));
document.getElementById("WASMsepiaRange").addEventListener("click", () => applyWASMFilter('WASMsepia'));
document.getElementById("WASMinvertRange").addEventListener("click", () => applyWASMFilter('WASMinvert'));


