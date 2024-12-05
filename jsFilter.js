export function JSapplyGrayscale(imageData) {
  const width = imageData.width;
  const height = imageData.height;
  const input = imageData.data; // 원본 데이터
  const output = new Uint8ClampedArray(input.length); // 새로운 데이터 생성

  for (let i = 0; i < input.length; i += 4) {
    const r = input[i];
    const g = input[i + 1];
    const b = input[i + 2];
    const gray = Math.floor(0.299 * r + 0.587 * g + 0.114 * b);

    output[i] = output[i + 1] = output[i + 2] = gray; // Grayscale 적용
    output[i + 3] = input[i + 3]; // Alpha 채널 유지
  }

  return new ImageData(output, width, height); // 새로운 ImageData 반환
}

export function JSapplySepia(imageData) {
  const width = imageData.width;
  const height = imageData.height;
  const input = imageData.data;
  const output = new Uint8ClampedArray(input.length);

  for (let i = 0; i < input.length; i += 4) {
    const r = input[i];
    const g = input[i + 1];
    const b = input[i + 2];

    output[i] = Math.min(0.393 * r + 0.769 * g + 0.189 * b, 255); // R'
    output[i + 1] = Math.min(0.349 * r + 0.686 * g + 0.168 * b, 255); // G'
    output[i + 2] = Math.min(0.272 * r + 0.534 * g + 0.131 * b, 255); // B'
    output[i + 3] = input[i + 3]; // Alpha 채널 유지
  }

  return new ImageData(output, width, height);
}

export function JSapplyInvert(imageData) {
  const width = imageData.width;
  const height = imageData.height;
  const input = imageData.data;
  const output = new Uint8ClampedArray(input.length);

  for (let i = 0; i < input.length; i += 4) {
    output[i] = 255 - input[i];       // Red
    output[i + 1] = 255 - input[i + 1]; // Green
    output[i + 2] = 255 - input[i + 2]; // Blue
    output[i + 3] = input[i + 3];       // Alpha 채널 유지
  }

  return new ImageData(output, width, height);
}

export function JSapplyGaussianBlur(imageData, width, height) {
  const input = imageData.data;
  const output = new Uint8ClampedArray(input.length);
  const kernel = [1, 4, 6, 4, 1, 4, 16, 24, 16, 4, 6, 24, 36, 24, 6, 4, 16, 24, 16, 4, 1, 4, 6, 4, 1];
  const kernelSize = 5;
  const kernelSum = kernel.reduce((a, b) => a + b, 0);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0;

      for (let ky = -2; ky <= 2; ky++) {
        for (let kx = -2; kx <= 2; kx++) {
          const px = Math.min(width - 1, Math.max(0, x + kx));
          const py = Math.min(height - 1, Math.max(0, y + ky));
          const weight = kernel[(ky + 2) * kernelSize + (kx + 2)];
          const index = (py * width + px) * 4;

          r += input[index] * weight;
          g += input[index + 1] * weight;
          b += input[index + 2] * weight;
        }
      }

      const index = (y * width + x) * 4;
      output[index] = r / kernelSum;
      output[index + 1] = g / kernelSum;
      output[index + 2] = b / kernelSum;
      output[index + 3] = input[index + 3]; // Alpha 채널 유지
    }
  }

  return new ImageData(output, width, height);
}

export function JSapplyHistogramEqualization(imageData) {
  const width = imageData.width;
  const height = imageData.height;
  const input = imageData.data;
  const output = new Uint8ClampedArray(input.length);
  const histogram = new Array(256).fill(0);

  // 1. 그레이스케일 변환
  for (let i = 0; i < input.length; i += 4) {
    const gray = Math.floor(0.299 * input[i] + 0.587 * input[i + 1] + 0.114 * input[i + 2]);
    input[i] = input[i + 1] = input[i + 2] = gray; // 그레이스케일 변환
  }

  // 2. 히스토그램 계산
  for (let i = 0; i < input.length; i += 4) {
    histogram[input[i]]++;
  }

  // 3. 누적 분포 계산 (CDF)
  const cdf = new Array(256).fill(0);
  cdf[0] = histogram[0];
  for (let i = 1; i < 256; i++) {
    cdf[i] = cdf[i - 1] + histogram[i];
  }

  // 4. CDF 정규화
  const cdfMin = cdf.find(value => value > 0); // 최소 CDF 값
  const pixelCount = input.length / 4; // 전체 픽셀 수
  const lookupTable = new Array(256);
  for (let i = 0; i < 256; i++) {
    lookupTable[i] = Math.floor(((cdf[i] - cdfMin) / (pixelCount - cdfMin)) * 255); // Math.floor 사용
  }

  // 5. 픽셀 값 매핑
  for (let i = 0; i < input.length; i += 4) {
    const gray = input[i]; // 그레이스케일 값을 그대로 사용
    const equalized = lookupTable[gray];
    output[i] = output[i + 1] = output[i + 2] = equalized; // R, G, B 동일
    output[i + 3] = input[i + 3]; // Alpha 채널 유지
  }

  return new ImageData(output, width, height);
}


export function JSapplyThreshold(imageData, threshold) {
  const width = imageData.width;
  const height = imageData.height;
  const input = imageData.data;
  const output = new Uint8ClampedArray(input.length);

  for (let i = 0; i < input.length; i += 4) {
    const gray = 0.299 * input[i] + 0.587 * input[i + 1] + 0.114 * input[i + 2];
    const value = gray >= threshold ? 255 : 0;

    output[i] = output[i + 1] = output[i + 2] = value; // R, G, B에 동일한 값
    output[i + 3] = input[i + 3]; // Alpha 채널 유지
  }

  return new ImageData(output, width, height);
}

export function JSapplyCanny(imageData, width, height) {
  const input = imageData.data;
  const grayscale = new Uint8Array(width * height);
  const output = new Uint8ClampedArray(input.length);

  // 1. Grayscale 변환 (R, G, B 가중치 사용)
  for (let i = 0; i < input.length; i += 4) {
    grayscale[i / 4] = Math.round(
      0.299 * input[i] + 0.587 * input[i + 1] + 0.114 * input[i + 2]
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
      const magnitude = Math.sqrt(gx * gx + gy * gy);
      edges[y * width + x] = Math.min(255, Math.round(magnitude));
    }
  }

  // 3. 에지 강도를 새로운 ImageData에 복사
  for (let i = 0; i < input.length; i += 4) {
    const edge = edges[i / 4];
    output[i] = output[i + 1] = output[i + 2] = edge; // R, G, B 동일
    output[i + 3] = input[i + 3]; // Alpha 채널 유지
  }

  return new ImageData(output, width, height);
}