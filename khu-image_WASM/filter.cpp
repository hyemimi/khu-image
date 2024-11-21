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
}
