
// 그레이스케일 필터: 슬라이더 강도에 따라 조정
export function JSapplyGrayscale(imageData) {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = data[i] + (avg - data[i]);       // Red
    data[i + 1] = data[i + 1] + (avg - data[i + 1]) ; // Green
    data[i + 2] = data[i + 2] + (avg - data[i + 2]) ; // Blue
  }
  return imageData;
}

// 세피아 필터: 슬라이더 강도에 따라 조정
export function JSapplySepia(imageData) {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const red = data[i];
    const green = data[i + 1];
    const blue = data[i + 2];

    data[i] = red + (red * 0.393 + green * 0.769 + blue * 0.189 - red);
    data[i + 1] = green + (red * 0.349 + green * 0.686 + blue * 0.168 - green);
    data[i + 2] = blue + (red * 0.272 + green * 0.534 + blue * 0.131 - blue);
  }
  return imageData;
}

// 색상 반전 필터: 슬라이더 강도에 따라 조정
export function JSapplyInvert(imageData) {
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i];     // Red
    data[i + 1] = 255 - data[i + 1]; // Green
    data[i + 2] = 255 - data[i + 2]; // Blue
    // Alpha 값(data[i + 3])은 그대로 유지
}
  return imageData;
}

// Gaussian Blur 필터
export function JSapplyGaussianBlur(imageData, width, height) {
  const data = imageData.data;
  const kernel = [1, 4, 6, 4, 1, 4, 16, 24, 16, 4, 6, 24, 36, 24, 6, 4, 16, 24, 16, 4, 1, 4, 6, 4, 1];
  const kernelSize = 5;
  const kernelSum = kernel.reduce((a, b) => a + b, 0);
  const output = new Uint8ClampedArray(data);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0;

      for (let ky = -2; ky <= 2; ky++) {
        for (let kx = -2; kx <= 2; kx++) {
          const px = Math.min(width - 1, Math.max(0, x + kx));
          const py = Math.min(height - 1, Math.max(0, y + ky));
          const weight = kernel[(ky + 2) * kernelSize + (kx + 2)];
          const index = (py * width + px) * 4;

          r += data[index] * weight;
          g += data[index + 1] * weight;
          b += data[index + 2] * weight;
        }
      }

      const index = (y * width + x) * 4;
      output[index] = r / kernelSum;
      output[index + 1] = g / kernelSum;
      output[index + 2] = b / kernelSum;
    }
  }

  imageData.data.set(output);
  return imageData;
}

// Histogram Equalization 필터
export function JSapplyHistogramEqualization(imageData) {
  const data = imageData.data;
  const histogram = new Array(256).fill(0);

  // 1. 히스토그램 계산
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    histogram[gray]++;
    data[i] = data[i + 1] = data[i + 2] = gray; // 그레이스케일 변환
  }

  // 2. 누적 분포 계산 (CDF)
  const cdf = new Array(256).fill(0);
  cdf[0] = histogram[0];
  for (let i = 1; i < 256; i++) {
    cdf[i] = cdf[i - 1] + histogram[i];
  }

  // 3. CDF 정규화
  const cdfMin = cdf.find(value => value > 0); // CDF의 최소값
  const pixelCount = (data.length / 4);
  const lookupTable = new Array(256);
  for (let i = 0; i < 256; i++) {
    lookupTable[i] = Math.round(((cdf[i] - cdfMin) / (pixelCount - cdfMin)) * 255);
  }

  // 4. 픽셀 값 매핑
  for (let i = 0; i < data.length; i += 4) {
    const equalized = lookupTable[data[i]];
    data[i] = data[i + 1] = data[i + 2] = equalized;
  }

  return imageData;
}