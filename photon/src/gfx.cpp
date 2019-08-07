#include <neomatrix.h>
#include <Adafruit_GFX.h>
#include <neopixel.h>
#include "defines.h"
#include "gfx.h"

const PROGMEM unsigned char fire[] = {
  0B00010000,
  0B01100100,
  0B11100010,
  0B01110000,
  0B00111000,
  0B00000000
};

const PROGMEM unsigned char smile[] = {
  0B00000000, 0B00000000,
  0B00011100, 0B00111000,
  0B00100010, 0B01000100,
  0B00000000, 0B00000000,
  0B11000000, 0B00000011,
  0B01100000, 0B00000110,
  0B00011111, 0B11111000,
  0B00000000, 0B00000000
};

const int boxLedOffsetByColumnTop[] = {
  0,
  0+4,
  0+4+3,
  0+4+3+4,
  0+4+3+4+4,
  0+4+3+4+4+3,
  0+4+3+4+4+3+4,
  0+4+3+4+4+3+4+3,
  0+4+3+4+4+3+4+3+6,
  0+4+3+4+4+3+4+3+6+4,
  0+4+3+4+4+3+4+3+6+4+3,
  0+4+3+4+4+3+4+3+6+4+3+4,
  0+4+3+4+4+3+4+3+6+4+3+4+4,
  0+4+3+4+4+3+4+3+6+4+3+4+4+3,
  0+4+3+4+4+3+4+3+6+4+3+4+4+3+4,
  0+4+3+4+4+3+4+3+6+4+3+4+4+3+4+3
};

const int boxLedWidthByColumnTop[] = {
  4, 3, 4, 3, 3, 4, 3, 4,
  4, 3, 4, 3, 3, 4, 3, 4
};

const int boxLedOffsetByColumnBottom[] = {
  0,
  0+8,
  0+8+7,
  0+8+7+7,
  0+8+7+7+9,
  0+8+7+7+9+8,
  0+8+7+7+9+8+7,
  0+8+7+7+9+8+7+7,
};

const int boxLedWidthByColumnBottom[] = {
  7, 6, 6, 7, 7, 6, 6, 7
};

// Variables
Adafruit_NeoMatrix matrix = Adafruit_NeoMatrix(
    LED_COLS,        // columns
    LED_ROWS,        // rows
    PIXEL_PIN, // data pin
    NEO_MATRIX_TOP + NEO_MATRIX_LEFT + NEO_MATRIX_ROWS + NEO_MATRIX_ZIGZAG,
    PIXEL_TYPE
);

uint16_t red = matrix.Color(255, 0, 0);
uint16_t green = matrix.Color(0, 255, 0);
uint16_t blue = matrix.Color(0, 0, 255);
uint16_t magenta = matrix.Color(255, 0, 255);
uint16_t orange = matrix.Color(255, 165, 0);
uint16_t cyan = matrix.Color(0, 255, 255);
uint16_t purple = matrix.Color(128,0,128);
uint16_t white = matrix.Color(255, 255, 255);

uint16_t colors[] = {
  red,
  green,
  blue,
  magenta,
  orange,
  cyan
};

ColorName colorNames[] = {
  { "red", red },
  { "green", green },
  { "blue", blue },
  { "magenta", magenta },
  { "orange", orange },
  { "cyan", cyan },
  { "white", white },
  { "purple", purple }
};

bool enableTextScrolling = false;

// Controlled locally
bool enableLightAllBoxes = false;
bool enableRainbowLeds = false;

uint16_t likelyColor;
uint16_t unlikelyColor;

uint8_t colorCount = sizeof(colors) / sizeof(uint16_t);

int scrollPosition = matrix.width();
int scrollCount = 0;

String text = "H I ";
int textLength = 0;

int sRow, sCol;
uint16_t sColor;
bool sSet = false;

void scrollDisplay();
void lightBoxes();
void rainbowLeds();
int rr(int minRand, int maxRand);
uint32_t Wheel(uint8_t WheelPos);

/********************* FUNCTIONS *********************** */
void GFX_setup() {    
    textLength = text.length();
    matrix.begin();
    matrix.setTextWrap(false);
    matrix.setBrightness(30);
    matrix.setTextColor(matrix.Color(255,0,255));
}

void GFX_loop() {
    if (enableLightAllBoxes) lightBoxes();
    if (enableTextScrolling) scrollDisplay();
    if (enableRainbowLeds)   rainbowLeds();
}

void GFX_setString(String s) {
  for(int i = 0; i < s.length(); i++) {
    text += ' ';
    text += s[i];
  }

  textLength = text.length();
  enableTextScrolling = true;
}

void GFX_setBrightness(int brightness) {
    if (0 < brightness && brightness <= 100) {
    matrix.setBrightness(map(brightness, 0, 100, 0, 255));
    matrix.show();
  }
}

void GFX_clear() {
    matrix.fillScreen(0);
}

void GFX_update() {
    matrix.show();
}

void GFX_lightBox(int row, int col, uint16_t color)
{
  //  if (!((0 <= row && row < 8 && 0 <= col && col < 16)
  //     || (8 <= row && row < 14 && 0 <= col && col < 8))) return;

  int ledCount;
  int ledOffset;

    sRow = row;
    sCol = col;
    sColor = green;
    sSet = true;

  if (row < 8 && col < 16) {
    ledCount = boxLedWidthByColumnTop[col];
    ledOffset = boxLedOffsetByColumnTop[col];
  } else if (row < 16 && col < 8) {
    ledCount = boxLedWidthByColumnBottom[col];
    ledOffset = boxLedOffsetByColumnBottom[col];
  } else {
    Serial.printlnf("Invalid. Row: %d, Col: %d\n", row, col);
  }

  //Serial.printlnf("row: %d, col: %d, count: %d, offset: %d", row, col, ledCount, ledOffset);

  //matrix.fillScreen(0);

  for (int i = 0; i < ledCount; i++) {
    matrix.drawPixel(ledOffset + i, row, color);
  }

  //matrix.show();
}

void GFX_showNotFound() {
    matrix.fillScreen(0);
    matrix.drawPixel(29, 7, red);
    matrix.drawPixel(30, 7, red);
    matrix.show();
}

void scrollDisplay()
{
  static const int smileOffset = 16+8;

  matrix.fillScreen(0);
  matrix.setCursor(scrollPosition, 0);
  matrix.print(text);

  for (int i = 0; i < textLength/2 + (smileOffset/LED_MATRIX_CHAR_WIDTH)-2; i++) {
    matrix.drawBitmap(scrollPosition + i*LED_MATRIX_CHAR_WIDTH*2, 8, fire, 8, 6, colors[0 /*(scrollCount+i)%colorCount*/]);
  }

  matrix.drawBitmap(scrollPosition + textLength*LED_MATRIX_CHAR_WIDTH + 8, 0, smile, 16, 8, colors[2]);

  // Change the text color on the next scroll through
  if (--scrollPosition < -textLength*LED_MATRIX_CHAR_WIDTH - smileOffset) {
    scrollPosition = matrix.width();
    if(++scrollCount >= colorCount) scrollCount = 0;
    matrix.setTextColor(colors[scrollCount]);
  }

  if (sSet) {
    GFX_lightBox(sRow, sCol, sColor);
  }

  matrix.show();
  //delay(10);
}

// Light each led-mapped box on the organizer one by one
void lightBoxes()
{
  for (int row = 0; row < 8; row++) {
    for (int col = 0; col < 16; col++) {
      GFX_lightBox(row, col, colors[rr(0, colorCount)]);
      delay(50);
    }
  }
  for (int row = 8; row < 14; row++) {
    for (int col = 0; col < 8; col++) {
      GFX_lightBox(row, col, colors[rr(0, colorCount)]);
      delay(50);
    }
  }
  while(true) {
    delay(1000);
  }
}

// weight = 0 -> col0, weight = 0.5 -> 50/50 col0/col1, weight = 1 -> col1
uint16_t getGradientColor(uint16_t col0, uint16_t col1, float value)
{
  uint8_t red = 0, green = 0, blue = 0;
  uint8_t r = (col0 & 0xF800) >> 8;
  uint8_t g = (col0 & 0x07E0) >> 3;
  uint8_t b = (col0 & 0x1F) << 3;
  // r = (r * 255) / 31;
  // g = (g * 255) / 63;
  // b = (b * 255) / 31;

  if (r > 0) red = r;
  if (g > 0) green = g;
  if (b > 0) blue = b;

  r = (col1 & 0xF800) >> 8;
  g = (col1 & 0x07E0) >> 3;
  b = (col1 & 0x1F) << 3;

  if (r > 0) red = r;
  if (g > 0) green = g;
  if (b > 0) blue = b;

  if (red & blue) {
    red = value <= 0.5 ? 255 : (255 - 255*(value-0.5)*2);
    blue = value <= 0.5 ? 255 * (value*2) : 255;
  }
  else if (red & green) {
    red = value <= 0.5 ? 255 : (255 - 255*(value-0.5)*2);
    green = value <= 0.5 ? 255 * (value*2) : 255;
  } else { // green & blue
    green = value <= 0.5 ? 255 : (255 - 255*(value-0.5)*2);
    blue = value <= 0.5 ? 255 * (value*2) : 255;
  }
  return matrix.Color(red, green, blue);
}

uint16_t gradientBetween(uint16_t col0, uint16_t col1, float value)
{
  uint8_t r0 = (col0 & 0xF800) >> 8;
  uint8_t g0 = (col0 & 0x07E0) >> 3;
  uint8_t b0 = (col0 & 0x1F) << 3;
  r0 = (r0 * 255) / 31;
  g0 = (g0 * 255) / 63;
  b0 = (b0 * 255) / 31;

  uint8_t r1 = (col1 & 0xF800) >> 8;
  uint8_t g1 = (col1 & 0x07E0) >> 3;
  uint8_t b1 = (col1 & 0x1F) << 3;
  r1 = (r1 * 255) / 31;
  g1 = (g1 * 255) / 63;
  b1 = (b1 * 255) / 31;

  // Linearly interpolate values
  // uint8_t red = (1.0-value) * r0 + value * r1 + 0.5;
  // uint8_t green = (1.0-value) * g0 + value * g1 + 0.5;
  // uint8_t blue = (1.0-value) * b0 + value * b1 + 0.5;

  uint8_t red = (r1-r0) * value + r0;
  uint8_t green = (g1-g0) * value + g0;
  uint8_t blue = (b1-b0) * value + b0;

  return matrix.Color(red, green, blue);
}

// 0.0 = Red, 0.5 = Yellow, 1.0 = Green
uint16_t getGreenRedValue(float value)
{
  int red = value <= 0.5 ? 255 : (255 - 255*(value-0.5)*2);
  int green = value <= 0.5 ? 255 * (value*2) : 255;
  return matrix.Color(red, green, 0);
}

void greenRedGradientTest()
{
  int row = 0;

  matrix.fillScreen(0);

  for (int i = 0; i < LED_COLS; i++)
  {
    int red = min(255 * (((float)i)/LED_COLS_HALF), 255);
    int green = (i < LED_COLS_HALF) ? 255 : (255 - 255*(((float)(i - LED_COLS_HALF))/LED_COLS_HALF));
    matrix.drawPixel(i, row, matrix.Color(red, 0, 0));
    matrix.drawPixel(i, row+1, matrix.Color(0, green, 0));
    matrix.drawPixel(i, row+2, matrix.Color(red, green, 0));
  }

  for (int i = 0; i < LED_COLS; i++)
  {
    matrix.drawPixel(i, row+3, getGreenRedValue(((float)i)/LED_COLS));
  }

  for (int i = 0; i < LED_COLS; i++)
  {
    matrix.drawPixel(i, row+4, getGradientColor(green, blue, ((float)i)/LED_COLS));
    matrix.drawPixel(i, row+5, gradientBetween(green, blue, ((float)i)/LED_COLS));

    matrix.drawPixel(i, row+6, getGradientColor(blue, red, ((float)i)/LED_COLS));
    matrix.drawPixel(i, row+7, gradientBetween(red, blue, ((float)i)/LED_COLS));

    matrix.drawPixel(i, row+8, getGradientColor(red, green, ((float)i)/LED_COLS));
    matrix.drawPixel(i, row+9, gradientBetween(red, green, ((float)i)/LED_COLS));

    // matrix.drawPixel(i, row+9, betterGradient(green, blue, ((float)i)/LED_COLS));
    // matrix.drawPixel(i, row+10, betterGradient(blue, red, ((float)i)/LED_COLS));
    // matrix.drawPixel(i, row+11, betterGradient(red, green, ((float)i)/LED_COLS));
    matrix.drawPixel(i, row+10, getGradientColor(cyan, orange, ((float)i)/LED_COLS));
    matrix.drawPixel(i, row+11, gradientBetween(cyan, orange, ((float)i)/LED_COLS));
    matrix.drawPixel(i, row+12, gradientBetween(purple, orange, ((float)i)/LED_COLS));
    matrix.drawPixel(i, row+13, gradientBetween(white, blue, ((float)i)/LED_COLS));
  }

  matrix.show();

  delay(1000);
}

// Light all LEDs in the matrix with a rainbow effect
void rainbowLeds()
{
  static int offset = 0;
  for (int row = 0; row < 14; row++) {
    for (int col = 0; col < 60; col++) {
      matrix.drawPixel(col, row, Wheel((row*col+offset)%255));
    }
  }
  offset++;
  matrix.show();
  delay(1000);
}

// Borrowed from: https://learn.adafruit.com/multi-tasking-the-arduino-part-3/utility-functions
uint32_t Wheel(uint8_t WheelPos)
{
  WheelPos = 255 - WheelPos;
  if(WheelPos < 85) {
    return matrix.Color(255 - WheelPos * 3, 0, WheelPos * 3);
  }
  if(WheelPos < 170) {
    WheelPos -= 85;
    return matrix.Color(0, WheelPos * 3, 255 - WheelPos * 3);
  }
  WheelPos -= 170;
  return matrix.Color(WheelPos * 3, 255 - WheelPos * 3, 0);
}

// Generate a random number between minRand and maxRand
int rr(int minRand, int maxRand)
{
  return rand() % (maxRand-minRand+1) + minRand;
}