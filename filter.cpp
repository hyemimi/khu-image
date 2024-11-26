#include <cstdint>
#include <vector>
#include <cmath>
#include <emscripten.h>

// 이미지 필터 함수 정의
extern "C" {

// 그레이스케일 필터
EMSCRIPTEN_KEEPALIVE
void apply_grayscale(uint8_t* imageData, int width, int height) {
    int size = width * height * 4;
    for (int i = 0; i < size; i += 4) {
        uint8_t r = imageData[i];
        uint8_t g = imageData[i + 1];
        uint8_t b = imageData[i + 2];
        uint8_t gray = static_cast<uint8_t>(0.299 * r + 0.587 * g + 0.114 * b);
        imageData[i] = imageData[i + 1] = imageData[i + 2] = gray;
    }
}

// 세피아 필터
EMSCRIPTEN_KEEPALIVE
void apply_sepia(uint8_t* imageData, int width, int height) {
    int size = width * height * 4;
    for (int i = 0; i < size; i += 4) {
        uint8_t r = imageData[i];
        uint8_t g = imageData[i + 1];
        uint8_t b = imageData[i + 2];
        imageData[i] = std::min(255, static_cast<int>(0.393 * r + 0.769 * g + 0.189 * b));
        imageData[i + 1] = std::min(255, static_cast<int>(0.349 * r + 0.686 * g + 0.168 * b));
        imageData[i + 2] = std::min(255, static_cast<int>(0.272 * r + 0.534 * g + 0.131 * b));
    }
}

// 색상 반전 필터
EMSCRIPTEN_KEEPALIVE
void apply_invert(uint8_t* imageData, int width, int height) {
    int size = width * height * 4;
    for (int i = 0; i < size; i += 4) {
        imageData[i] = 255 - imageData[i];
        imageData[i + 1] = 255 - imageData[i + 1];
        imageData[i + 2] = 255 - imageData[i + 2];
    }
}

// Gaussian Blur 필터
EMSCRIPTEN_KEEPALIVE
void apply_gaussian(uint8_t* imageData, int width, int height) {
    const int kernelSize = 5;
    const int kernel[kernelSize][kernelSize] = {
        {1, 4, 6, 4, 1},
        {4, 16, 24, 16, 4},
        {6, 24, 36, 24, 6},
        {4, 16, 24, 16, 4},
        {1, 4, 6, 4, 1}
    };
    const int kernelSum = 256;

    std::vector<uint8_t> output(imageData, imageData + width * height * 4);

    for (int y = 0; y < height; y++) {
        for (int x = 0; x < width; x++) {
            int r = 0, g = 0, b = 0;

            for (int ky = -2; ky <= 2; ky++) {
                for (int kx = -2; kx <= 2; kx++) {
                    int px = std::min(width - 1, std::max(0, x + kx));
                    int py = std::min(height - 1, std::max(0, y + ky));
                    int weight = kernel[ky + 2][kx + 2];
                    int index = (py * width + px) * 4;

                    r += imageData[index] * weight;
                    g += imageData[index + 1] * weight;
                    b += imageData[index + 2] * weight;
                }
            }

            int index = (y * width + x) * 4;
            output[index] = r / kernelSum;
            output[index + 1] = g / kernelSum;
            output[index + 2] = b / kernelSum;
        }
    }

    std::copy(output.begin(), output.end(), imageData);
}

// Histogram Equalization 필터
EMSCRIPTEN_KEEPALIVE
void apply_histogram(uint8_t* imageData, int width, int height) {
    int size = width * height * 4;
    std::vector<int> histogram(256, 0);

    // 1. 히스토그램 계산
    for (int i = 0; i < size; i += 4) {
        uint8_t gray = static_cast<uint8_t>(0.299 * imageData[i] + 0.587 * imageData[i + 1] + 0.114 * imageData[i + 2]);
        histogram[gray]++;
        imageData[i] = imageData[i + 1] = imageData[i + 2] = gray; // 그레이스케일 변환
    }

    // 2. 누적 분포 계산 (CDF)
    std::vector<int> cdf(256, 0);
    cdf[0] = histogram[0];
    for (int i = 1; i < 256; i++) {
        cdf[i] = cdf[i - 1] + histogram[i];
    }

    // 3. CDF 정규화
    int cdfMin = *std::find_if(cdf.begin(), cdf.end(), [](int value) { return value > 0; });
    int pixelCount = width * height;
    std::vector<uint8_t> lookupTable(256);
    for (int i = 0; i < 256; i++) {
        lookupTable[i] = static_cast<uint8_t>(std::round(((cdf[i] - cdfMin) / static_cast<float>(pixelCount - cdfMin)) * 255));
    }

    // 4. 픽셀 값 매핑
    for (int i = 0; i < size; i += 4) {
        uint8_t equalized = lookupTable[imageData[i]];
        imageData[i] = imageData[i + 1] = imageData[i + 2] = equalized;
    }
}

// Threshold 필터: Grayscale 변환 후 이진화
extern "C" void EMSCRIPTEN_KEEPALIVE apply_threshold(uint8_t* imageData, int width, int height, uint8_t threshold) {
    int size = width * height * 4;
    for (int i = 0; i < size; i += 4) {
        // Grayscale 계산 (R, G, B 가중치)
        uint8_t gray = static_cast<uint8_t>(
            0.299 * imageData[i] + 0.587 * imageData[i + 1] + 0.114 * imageData[i + 2]
        );
        uint8_t value = (gray >= threshold) ? 255 : 0;
        imageData[i] = imageData[i + 1] = imageData[i + 2] = value; // R, G, B에 동일한 값 설정
    }
}

// 간단한 Canny Edge Detection 필터: Grayscale 변환 후 에지 검출
extern "C" void EMSCRIPTEN_KEEPALIVE apply_canny(uint8_t* imageData, int width, int height) {
    int size = width * height;
    std::vector<uint8_t> gray(size);

    // 1. Grayscale 변환 (R, G, B 가중치 사용)
    for (int i = 0; i < size; i++) {
        gray[i] = static_cast<uint8_t>(
            0.299 * imageData[i * 4] + 0.587 * imageData[i * 4 + 1] + 0.114 * imageData[i * 4 + 2]
        );
    }

    // 2. Sobel 필터를 사용한 에지 강도 계산
    std::vector<uint8_t> edges(size);
    for (int y = 1; y < height - 1; y++) {
        for (int x = 1; x < width - 1; x++) {
            int gx = (-1 * gray[(y - 1) * width + (x - 1)] + 1 * gray[(y - 1) * width + (x + 1)])
                   + (-2 * gray[y * width + (x - 1)]       + 2 * gray[y * width + (x + 1)])
                   + (-1 * gray[(y + 1) * width + (x - 1)] + 1 * gray[(y + 1) * width + (x + 1)]);

            int gy = (-1 * gray[(y - 1) * width + (x - 1)] - 2 * gray[(y - 1) * width + x] - 1 * gray[(y - 1) * width + (x + 1)])
                   + ( 1 * gray[(y + 1) * width + (x - 1)] + 2 * gray[(y + 1) * width + x] + 1 * gray[(y + 1) * width + (x + 1)]);

            int magnitude = std::sqrt(gx * gx + gy * gy);
            edges[y * width + x] = static_cast<uint8_t>(std::min(255, magnitude));
        }
    }

    // 3. 결과를 이미지 데이터에 적용
    for (int i = 0; i < size; i++) {
        uint8_t value = edges[i];
        imageData[i * 4] = imageData[i * 4 + 1] = imageData[i * 4 + 2] = value; // R, G, B에 동일한 값 설정
    }
}

}



