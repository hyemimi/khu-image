
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
