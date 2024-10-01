import './style.scss'


const upload = document.getElementById("upload");
const canvas = document.getElementById("imageCanvas");
const ctx = canvas.getContext('2d');
let originalImageData;

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

/** 이미지 필터 */

const grayscaleRange = document.getElementById('grayscaleRange');
const sepiaRange = document.getElementById('sepiaRange');
const invertRange = document.getElementById('invertRange');

grayscaleRange.addEventListener('input', () => applyFilter('grayscale', grayscaleRange.value));
sepiaRange.addEventListener('input', () => applyFilter('sepia', sepiaRange.value));
invertRange.addEventListener('input', () => applyFilter('invert', invertRange.value));


function applyFilter(filterType, percentage) {
  // 슬라이더 값을 비율로 변환 (0에서 1 사이 값)
  const intensity = percentage / 100;

  // 원본 이미지 데이터를 복사하여 사용
  let imageData = new ImageData(new Uint8ClampedArray(originalImageData.data), originalImageData.width, originalImageData.height);

  switch (filterType) {
    case 'grayscale':
      imageData = applyGrayscale(imageData, intensity);
      console.log(imageData);
      break;
    case 'sepia':
      imageData = applySepia(imageData, intensity);
      console.log(imageData);
      break;
    case 'invert':
      imageData = applyInvert(imageData, intensity);
      console.log(imageData);
      break;
  }
  
  // 캔버스에 필터 적용된 이미지 데이터 다시 그리기
  ctx.putImageData(imageData, 0, 0);
}

// 그레이스케일 필터: 슬라이더 강도에 따라 조정
function applyGrayscale(imageData, intensity) {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = data[i] + (avg - data[i]) * intensity;       // Red
    data[i + 1] = data[i + 1] + (avg - data[i + 1]) * intensity; // Green
    data[i + 2] = data[i + 2] + (avg - data[i + 2]) * intensity; // Blue
  }
  return imageData;
}

// 세피아 필터: 슬라이더 강도에 따라 조정
function applySepia(imageData, intensity) {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const red = data[i];
    const green = data[i + 1];
    const blue = data[i + 2];

    data[i] = red + (red * 0.393 + green * 0.769 + blue * 0.189 - red) * intensity;
    data[i + 1] = green + (red * 0.349 + green * 0.686 + blue * 0.168 - green) * intensity;
    data[i + 2] = blue + (red * 0.272 + green * 0.534 + blue * 0.131 - blue) * intensity;
  }
  return imageData;
}

// 색상 반전 필터: 슬라이더 강도에 따라 조정
function applyInvert(imageData, intensity) {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = data[i] + (255 - data[i]) * intensity;        // Red
    data[i + 1] = data[i + 1] + (255 - data[i + 1]) * intensity; // Green
    data[i + 2] = data[i + 2] + (255 - data[i + 2]) * intensity; // Blue
  }
  return imageData;
}



