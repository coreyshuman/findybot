/*
* Name: Findybot
* Description: IFTTT + Particle Photon + 252 Watts of Power!
* Author: Dustin Dobransky, Corey Shuuman
* Date: 2019-08-06
*/

// Libraries
#include <ArduinoJson.h>
#include "gfx.h"
#include "defines.h"

StaticJsonBuffer<3000> jsonBuffer;


// gfx shared
extern uint16_t likelyColor;
extern uint16_t unlikelyColor;
extern bool enableTextScrolling;

// Controlled via IFTTT
bool enableDisplay = false;

extern uint16_t red;
extern uint16_t green;
extern uint16_t blue;
extern uint16_t magenta;
extern uint16_t orange;
extern uint16_t cyan;
extern uint16_t purple;
extern uint16_t white;

extern uint16_t colors[];
extern uint8_t colorCount;

extern ColorName colorNames[];


// IFTTT > Particle Photon subscribe event handler function prototype
void IFTTTEventHandler(const char *event, const char *data);

// Webhook response handler function prototypes
void azureFunctionEventResponseHandler(const char *event, const char *data);

// Program
void setup()
{
  Serial.begin();
  Serial.println("FindyBot3000");

  // Handle incoming IFTTT command
  Particle.subscribe("Findybot_", azureFunctionEventResponseHandler, MY_DEVICES);

  // Handle Azure Function web hook response
  Particle.subscribe("hook-response/callAzureFunctionEvent", azureFunctionEventResponseHandler, MY_DEVICES);

  // Start FindyBot3000 with the display off
  pinMode(POWER_SUPPLY_RELAY_PIN, OUTPUT);
  digitalWrite(POWER_SUPPLY_RELAY_PIN, OFF);
  delay(1000);

  GFX_setup();
  likelyColor = green;
  unlikelyColor = red;

  setDisplay(ON);

  greenRedGradientTest();
}

void loop()
{
  if (!enableDisplay)      return;
  GFX_loop();
}



struct CommandHandler
{
  const char* command;
  void (*handle) (const char* data);
};

// Requires AzureFunction
const char* FindItem = "FindItem";
const char* FindTags = "FindTags";
const char* InsertItem = "InsertItem";
const char* RemoveItem = "RemoveItem";
const char* AddTags = "AddTags";
const char* SetQuantity = "SetQuantity";
const char* UpdateQuantity = "UpdateQuantity";
const char* ShowAllBoxes = "ShowAllBoxes";
const char* BundleWith = "BundleWith";
const char* HowMany = "HowMany";

// Processed on Particle Photon
const char* Welcome = "Welcome";
const char* SetBrightness = "SetBrightness";
const char* SetDisplay = "SetDisplay";
const char* SetScrollText = "SetScrollText";
const char* ChangeColors = "ChangeColors";
const char* UnknownCommand = "UnknownCommand";


// Function callbacks
const CommandHandler commands[] =
{
  { FindItem, findItem },
  { FindTags, findTags },
  { InsertItem, insertItem },
  { RemoveItem, removeItem },
  { AddTags, addTags },
  { SetQuantity, setQuantity},
  { UpdateQuantity, updateQuantity},
  { SetBrightness, setBrightness },
  { SetDisplay, setDisplay },
  { SetScrollText, setScrollText },
  { ShowAllBoxes, showAllBoxes },
  { BundleWith, bundleWith },
  { HowMany, howMany },
  { ChangeColors, changeColors },
  { Welcome, welcome }
};

void IFTTTEventHandler(const char* event, const char* data)
{
  if (event == NULL || data == NULL) return;

  Serial.printlnf("IFTTTEventHandler event: %s, data: %s", event, data);

  // loop through each command until a match is found; then call the associated handler
  for (CommandHandler cmd : commands) {
    if (strstr(event, cmd.command)) {
      cmd.handle(data);
      break;
    }
  }
}

void callAzureFunction(const char* command, const char* payload, bool isJson = false)
{
  char jsonData[255];
  if (isJson) {
    sprintf(jsonData, "{\"command\":\"%s\", \"data\":%s}", command, payload);
  } else {
    sprintf(jsonData, "{\"command\":\"%s\", \"data\":\"%s\"}", command, payload);
  }
  Serial.println(jsonData);

  // This event is tied to a webhook created in Particle Console
  // https://console.particle.io/integrations
  // The webhook calls an Azure Function with a json payload
  Particle.publish("callAzureFunctionEvent", jsonData, PRIVATE);
}

/* ============= IFTTT ASSISTANT EVENT HANDLERS ============= */

void findItem(const char *data)
{
  callAzureFunction(FindItem, data);
}

void findTags(const char *data)
{
  callAzureFunction(FindTags, data);
}

void insertItem(const char *data)
{
  callAzureFunction(InsertItem, data, true);
}

void removeItem(const char *data)
{
  callAzureFunction(RemoveItem, data);
}

void addTags(const char *data)
{
  callAzureFunction(AddTags, data);
}

void setQuantity(const char *data)
{
  callAzureFunction(SetQuantity, data, true);
}

void updateQuantity(const char *data)
{
  callAzureFunction(UpdateQuantity, data, true);
}

void showAllBoxes(const char *data)
{
  callAzureFunction(ShowAllBoxes, data);
}

void bundleWith(const char *data)
{
  callAzureFunction(BundleWith, data, true);
}

void howMany(const char *data)
{
  callAzureFunction(HowMany, data);
}

void changeColors(const char *data)
{
  if (data == NULL) return;

  int len = strlen(data)+1;
  char buff[len];
  memcpy(buff, data, len);

  char *token = strtok(buff, " to ");
  if (token == NULL) return;
  /* cts todo
  for(ColorName c : colorNames) {
    if (strcasestr(c.name, token)) {
      likelyColor = c.color;
      Serial.printlnf("likelyColor: %s", c.name);
      break;
    }
  }
  token = strtok(NULL, " to ");
  if (token == NULL) return;
  for(ColorName c : colorNames) {
    if (strcasestr(c.name, token)) {
      unlikelyColor = c.color;
      Serial.printlnf("unlikelyColor: %s", c.name);
      break;
    }
  }
  */
}

void welcome(const char* data)
{
  if (data == NULL) return;

  char* tmp = "W E L C O M E  ";
  strcat(tmp, (char*)data);
  String s(tmp);
  s = s.toUpperCase();

  GFX_setString(s);
  setDisplay(ON);
}

// Turn the LED matrix power supply relay on or off
void setDisplay(const char *data)
{
  if (data == NULL) return;

  if (strstr(data, "on")) {
    setDisplay(true);
  } else if (strstr(data, "off")) {
    setDisplay(false);
  }
}

// Set the brightness of the LED matrix, from 1 to 100, inclusive
void setBrightness(const char *data)
{
  if (data == NULL) return;

  String brightnessText = data;
  int brightness = brightnessText.toInt();

  GFX_setBrightness(brightness);
}

void setScrollText(const char *data)
{
  setStateFromText(enableTextScrolling, data);
}

void setStateFromText(bool& variable, const char *onOffText)
{
  if (strcmp(onOffText, "on") == 0) {
    variable = true;
  }
  else if (strcmp(onOffText, "off") == 0) {
    variable = false;
  }
}

/* ============= WEBHOOK RESPONSE HANDLERS ============= */

struct ResponseHandler
{
  const char* command;
  void (*handle) (JsonObject& response);
};

const ResponseHandler responseHandlers[] =
{
  { FindItem, findItemResponseHandler },
  { FindTags, findTagsResponseHandler },
  { InsertItem, insertItemResponseHandler },
  { RemoveItem, removeItemResponseHandler },
  { AddTags, addTagsResponseHandler },
  { SetQuantity, setQuantityResponseHandler },
  { UpdateQuantity, updateQuantityResponseHandler },
  { ShowAllBoxes, showAllBoxesResponseHandler },
  { BundleWith, bundleWithResponseHandler },
  { HowMany, howManyResponseHandler },
  { Welcome, welcomeResponseHandler },
  { UnknownCommand, unknownCommandResponseHandler }
};

char msg[600];
// This function handles the webhook-response from the Azure Function
void azureFunctionEventResponseHandler(const char *event, const char *data)
{
  Serial.printlnf("azureFunctionEventResponseHandler\nevent: %s\ndata: %s", event, data);
  if (data == NULL) return;


  jsonBuffer.clear(); // Aha! This is what I needed to fix multiple FindItem calls.
  JsonObject& responseJson = jsonBuffer.parseObject(data);

  if (!responseJson.success()) {
    Serial.println("Parsing JSON failed");
    return;
  }

  const char* cmd = responseJson["Command"];

  Serial.print("Command: ");
  Serial.println(cmd);

  for (ResponseHandler responseHandler : responseHandlers) {
    if (strcmp(cmd, responseHandler.command) == 0) {
      responseHandler.handle(responseJson);
      break;
    }
  }
}

void welcomeResponseHandler(JsonObject& json)
{
  const char* data = json["Message"];

  char* tmp = "W E L C O M E  ";
  strcat(tmp, (char*)data);
  String s(tmp);
  s = s.toUpperCase();

  GFX_setString(s);
  setDisplay(ON);
}

void findItemResponseHandler(JsonObject& json)
{
  int count = json["Count"];
  if (count <= 0) {
    Serial.println("Item not found");
    dispayItemNotFound();
  } else {
    JsonObject& result = json["Result"][0];

    const char* item = result["Name"];
    int quantity = result["Quantity"];
    int row = result["Row"];
    int col = result["Col"];

    setDisplay(ON);
    lightOneBox(row, col, green);

    Serial.printlnf("item: %s, row: %d, col: %d, quantity: %d", item, row, col, quantity);

    GFX_setString(item);
  }
}

void findTagsResponseHandler(JsonObject& json)
{
  const char* cmd = json["Command"];
  int count = json["Count"];
  int numTags = json["Tags"];

  if (count <= 0) {
    Serial.println("FindTags returned 0 items");
    return;
  }

  JsonArray& items = json["Result"];

  setDisplay(ON);
  GFX_clear();

  for (int i = 0; i < count; i++)
  {
     //const char* name = items[i]["Name"];
     JsonArray& info = items[i];
     int row = info[0];
     int col = info[1];
     float confidence = ((float)info[2])/numTags;

     //Serial.printlnf("Name: %s, Row: %d, Col: %d, Confidence: %f", name, row, col, confidence);
     Serial.printlnf("Row: %d, Col: %d, Confidence: %f", row, col, confidence);

     GFX_lightBox(row, col, gradientBetween(unlikelyColor, likelyColor, normalize(confidence, 1.0/numTags, 1.0)));
  }

  GFX_update();
}

// Normalize a number between a specific range.
// ex: normalize(0.8, 0.5, 1.0) => .8 is 3/5 between range,
// function returns 3/5 => 0.6
float normalize(float value, float start, float end)
{
    if (start == end) return value;
    return (value - start) / (end - start);
}

void insertItemResponseHandler(JsonObject& json)
{
  bool success = json["Success"];

  if (!success) {
    Serial.println("InsertItem failed");
    return;
  }

  int row = json["Row"];
  int col = json["Col"];

  lightOneBox(row, col, green);

  Serial.printlnf("row: %d, col: %d", row, col);
}

void removeItemResponseHandler(JsonObject& json)
{
  Serial.println("removeItemResponseHandler");

  if (!json["Success"]) {
    Serial.println("RemoveItem failed");
    return;
  }
}

void addTagsResponseHandler(JsonObject& json)
{
  Serial.println("addTagsResponseHandler");

  if (!json["Success"]) {
    Serial.println("AddTags failed");
    return;
  }
}

// Modifying quantity triggers FindItem response handler
void setQuantityResponseHandler(JsonObject& json)
{
  Serial.println("setQuantityResponseHandler");

  if (!json["Success"]) {
    Serial.println("SetQuantity failed");
    return;
  }

  JsonObject& result = json["Result"][0];
  int row = result["Row"];
  int col = result["Col"];

  lightOneBox(row, col, green);

  Serial.printlnf("row: %d, col: %d", row, col);
}

void updateQuantityResponseHandler(JsonObject& json)
{
  Serial.println("updateQuantityResponseHandler");

  if (!json["Success"]) {
    Serial.println("UpdateQuantity failed");
    return;
  }

  JsonObject& result = json["Result"][0];
  int row = result["Row"];
  int col = result["Col"];

  lightOneBox(row, col, green);

  Serial.printlnf("row: %d, col: %d", row, col);
}

void showAllBoxesResponseHandler(JsonObject& json)
{
  Serial.println("showAllBoxesResponseHandler");

  int count = json["Count"];

  if (count == 0)
  {
    Serial.println("ShowAllBoxes returned 0 entries");
    return;
  }

  const char* coordsJson = json["Coords"];
  GFX_clear();

  for (int i = 0; i < count*2; i += 2)
  {
    int row = coordsJson[i] - 'a';
    int col = coordsJson[i+1] - 'a';
    //Serial.printf("[%d,%d],", row, col);
    GFX_lightBox(row, col, colors[r(0, colorCount-1)]);
  }
  //Serial.println();

  GFX_update();
}

void bundleWithResponseHandler(JsonObject& json)
{
  Serial.println("bundleWithResponseHandler");

  if (!json["Success"]) {
    Serial.println("UpdateQuantity failed");
    return;
  }

  const char* newItem = json["NewItem"];
  int row = json["Row"];
  int col = json["Col"];
  int quantity = json["Quantity"];

  const char* existingItem = json["ExistingItem"];

  lightOneBox(row, col, green);

  Serial.printlnf("NewItem: %s, row: %d, col: %d, quantity: %d, ExistingItem: %s", newItem, row, col, quantity, existingItem);
}

void howManyResponseHandler(JsonObject& json)
{
  Serial.println("howManyResponseHandler");

  if (!json["Success"]) {
    Serial.println("HowMany failed");
    return;
  }

  int quantity = json["Quantity"];
  int row = json["Row"];
  int col = json["Col"];

/* cts todo
  matrix.fillScreen(0);
  matrix.setCursor(3, 0);
  matrix.print(quantity);
  lightBox(row, col, green);
  matrix.show();
  */
}

void unknownCommandResponseHandler(JsonObject& json)
{
  Serial.println("unknownCommandResponseHandler");
  const char* unknownCmd = json["Command"];
  Serial.println(unknownCmd);
}

/* =============== HELPER FUNCTIONS =============== */

void dispayItemNotFound()
{
  setDisplay(ON);
  GFX_showNotFound();
}

void lightOneBox(int row, int col, uint16_t color) {
  GFX_clear();
  GFX_lightBox(row, col, color);
  GFX_update();
}

void setDisplay(bool state)
{
  if (enableDisplay == state) return;

  if (state) {
    digitalWrite(POWER_SUPPLY_RELAY_PIN, ON);
    // Give the power supply a moment to warm up if it was turned off
    // Datasheet suggests 20-50ms warm up time to support full load
    delay(1000);
  } else {
    digitalWrite(POWER_SUPPLY_RELAY_PIN, OFF);
  }

  enableDisplay = state;
}


// Generate a random number between minRand and maxRand
int r(int minRand, int maxRand)
{
  return rand() % (maxRand-minRand+1) + minRand;
}