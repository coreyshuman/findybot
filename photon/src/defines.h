#ifndef _DEFINES__H
#define _DEFINES__H

// Constants
#define PIXEL_PIN D3
#define PIXEL_COUNT 60*14
#define PIXEL_TYPE WS2812B
#define POWER_SUPPLY_RELAY_PIN D0

#define LED_ROWS 8+6
#define LED_COLS 60
#define LED_COLS_HALF (LED_COLS/2)

// The width, in LEDs, that a single character consumes on the LED matrix
#define LED_MATRIX_CHAR_WIDTH 6

#define ON true
#define OFF false

#endif