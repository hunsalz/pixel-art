#include <Esp8266Utils.h>     // https://github.com/hunsalz/esp8266utils
#include <Log4Esp.h>          // https://github.com/hunsalz/log4Esp

#include "FastLED.h"

#include "config.h"

#define NUM_LEDS 64
#define DATA_PIN 4

CRGB leds[NUM_LEDS];

// web server settings
const static int PORT = 80;

esp8266utils::WebSocketListener _wsl;

void setup() {
  // logger setup
  LOG.addLevelToAll(Appender::VERBOSE);
  LOG.addFormatterToAll(
      [](Print &output, Appender::Level level, const char *msg, va_list *args) {
        // output log level
        output.print(Appender::toString(level, true));
        output.print(Appender::DEFAULT_SEPARATOR);
        // output uptime of this program in milliseconds
        output.print(millis());
        output.print(Appender::DEFAULT_SEPARATOR);
        // output free heap space
        output.print(ESP.getFreeHeap());
        output.print(Appender::DEFAULT_SEPARATOR);
        // determine buffer length for formatted data
        size_t length = vsnprintf(NULL, 0, msg, *args) + 1;
        char buffer[length];
        // output formatted data
        vsnprintf(buffer, length, msg, *args);
        output.print(buffer);
      });

  // serial setup
  Serial.begin(115200);
  Serial.setDebugOutput(false);
  while (!Serial && !Serial.available()) {
  };
  Serial.println();
  LOG.verbose(F("Serial baud rate is [%d]"), Serial.baudRate());

  // setup matrix
  FastLED.addLeds<WS2811, DATA_PIN, RGB>(leds, NUM_LEDS);
  FastLED.show();

  // WiFi setup
  WIFI_STA_CFG.addAP(WIFI_SSID_1, WIFI_PSK_1);
  WIFI_STA_CFG.addAP(WIFI_SSID_2, WIFI_PSK_2);
  WIFI_STA_CFG.begin();

  // MDNS setup
  MDNS_CFG.begin("esp8266");
  MDNS.addService("http", "tcp", PORT);

  // file system setup to enable static web server content
  FILESYSTEM.begin();

  // web server setup
  SERVER.begin();
  // rewrite root context
  SERVER.getWebServer().rewrite("/", "/index.build.html");
  // handle static web resources
  SERVER.getWebServer().serveStatic("/", SPIFFS, "/www/", "max-age:15");
  // cache-control 15 seconds
  // add dynamic http resources
  SERVER.on("/fs", HTTP_GET, [](AsyncWebServerRequest* request) {
    SERVER.send(request, esp8266utils::APP_JSON, FILESYSTEM.getStorageDetails());
  });
  SERVER.on("/files", HTTP_GET, [](AsyncWebServerRequest* request) {
    SERVER.send(request, esp8266utils::APP_JSON, FILESYSTEM.getFileListing());
  });
  SERVER.on("/sta", HTTP_GET, [](AsyncWebServerRequest* request) {
    SERVER.send(request, esp8266utils::APP_JSON, WIFI_STA_CFG.getDetails());
  });
  SERVER.on("/esp", HTTP_GET, [](AsyncWebServerRequest* request) {
    SERVER.send(request, esp8266utils::APP_JSON, SYS_CFG.getDetails());
  });
  // add web socket support
  _wsl.onTextMessage([](AsyncWebSocket *ws, AsyncWebSocketClient *client, AwsEventType type, AwsFrameInfo *info, uint8_t *data, size_t len) {

    DynamicJsonBuffer buffer;
    JsonObject &json = buffer.parse((char *)data);

    json.prettyPrintTo(Serial);

    if (json.success() && json["pixel"].success() && json["color"].success()) {
      
      uint16_t pixel = json["pixel"];
      String color = json["color"];

      if (color == "red") leds[pixel] = CRGB::Green;
      if (color == "green") leds[pixel] = CRGB::Red;
      if (color == "blue") leds[pixel] = CRGB::Blue;
      if (color == "black") leds[pixel] = CRGB::Black;
      if (color == "white") leds[pixel] = CRGB::White;

      FastLED.show();
    } else {
      client->text(F("Received an unexpected message."));
    }
  });
  // add web socket
  AsyncWebSocket *webSocket = new AsyncWebSocket("/matrix");
  webSocket->onEvent([](AsyncWebSocket *ws, AsyncWebSocketClient *client, AwsEventType type, void *arg, uint8_t *data, size_t len) { 
    _wsl.onEvent(ws, client, type, arg, data, len);
  });
  SERVER.getWebServer().addHandler(webSocket);

  LOG.verbose(F("========================="));
  LOG.verbose(F("Setup finished. Have fun."));
  LOG.verbose(F("========================="));
}

void loop() {
  
  ESP.wdtDisable();
  if (SYS_CFG.nextLoopInterval()) {
       
    MDNS.update();

  }
  ESP.wdtEnable(30000);
  // reserve time for core processes
  delay(500);
}