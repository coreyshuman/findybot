#ifndef _GFX__H
#define _GFX__H

struct ColorName {
  const char* name;
  uint16_t color;
};

void GFX_setup();
void GFX_loop();

void GFX_setString(String s);
void GFX_showError(String s);
void GFX_setBrightness(int brightness);
void GFX_lightBox(int row, int col, uint16_t color);
void GFX_clear();
void GFX_update();
void GFX_showNotFound();

void greenRedGradientTest();
uint16_t getGradientColor(uint16_t col0, uint16_t col1, float value);
uint16_t gradientBetween(uint16_t col0, uint16_t col1, float value);

#endif