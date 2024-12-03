
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
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    data[i]     = Math.min(0.393 * r + 0.769 * g + 0.189 * b, 255); // R'
    data[i + 1] = Math.min(0.349 * r + 0.686 * g + 0.168 * b, 255); // G'
    data[i + 2] = Math.min(0.272 * r + 0.534 * g + 0.131 * b, 255); // B'
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

// Threshold 필터: Grayscale 변환 후 이진화
export function JSapplyThreshold(imageData, threshold) {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    // Grayscale 계산 (R, G, B 가중치)
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const value = gray >= threshold ? 255 : 0;
    data[i] = data[i + 1] = data[i + 2] = value; // R, G, B에 동일한 값 설정
    // Alpha 값(data[i + 3])은 그대로 유지
  }
  return imageData;
}

// 간단한 Canny Edge Detection: Grayscale 변환 후 Sobel 필터 기반
export function JSapplyCanny(imageData, width, height) {
  const data = imageData.data;
  const grayscale = new Uint8Array(width * height);

  // 1. Grayscale 변환 (R, G, B 가중치 사용)
  for (let i = 0; i < data.length; i += 4) {
    grayscale[i / 4] = Math.round(
      0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    );
  }

  // 2. Sobel 필터 적용 (Gx, Gy 계산)
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
  const edges = new Uint8Array(width * height);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0, gy = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const weightX = sobelX[(ky + 1) * 3 + (kx + 1)];
          const weightY = sobelY[(ky + 1) * 3 + (kx + 1)];
          const pixel = grayscale[(y + ky) * width + (x + kx)];
          gx += pixel * weightX;
          gy += pixel * weightY;
        }
      }
      // 에지 강도 계산
      const magnitude = Math.sqrt(gx * gx + gy * gy);
      edges[y * width + x] = Math.min(255, Math.round(magnitude));
    }
  }

  // 3. 에지 강도를 결과 이미지에 복사
  for (let i = 0; i < data.length; i += 4) {
    const edge = edges[i / 4];
    data[i] = data[i + 1] = data[i + 2] = edge; // R, G, B에 동일한 값 설정
    // Alpha 값(data[i + 3])은 그대로 유지
  }

  return imageData;
}