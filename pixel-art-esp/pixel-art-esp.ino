#ifdef ESP32
  #include <ESPmDNS.h>            // https://github.com/espressif/arduino-esp32/blob/master/libraries/ESPmDNS/src/ESPmDNS.h
  #include <WebServer.h>          // https://github.com/espressif/arduino-esp32/blob/master/libraries/WebServer/src/WebServer.h
  #include <WiFiMulti.h>          // https://github.com/espressif/arduino-esp32/blob/master/libraries/WiFi/src/WiFiMulti.h
#else
  #include <ESP8266mDNS.h>        // https://github.com/esp8266/Arduino/blob/master/libraries/ESP8266mDNS/src/ESP8266mDNS.h
  #include <ESP8266WebServer.h>   // https://github.com/esp8266/Arduino/blob/master/libraries/ESP8266WebServer/src/ESP8266WebServer.h
  #include <ESP8266WiFiMulti.h>   // https://github.com/esp8266/Arduino/tree/master/libraries/ESP8266WiFi/src/ESP8266WiFiMulti.h
#endif

#include <StreamString.h>         // https://github.com/espressif/arduino-esp32/blob/master/cores/esp32/StreamString.h
                                  // https://github.com/esp8266/Arduino/blob/master/cores/esp8266/StreamString.h

#include "FastLED.h"              // https://github.com/FastLED/FastLED

#include <EspUtils.h>             // https://github.com/hunsalz/EspUtils

#include "config.h"
#include "html.h"

using namespace espUtils;

#define NUM_LEDS 64
#define DATA_PIN 4

#ifdef ESP32
  WiFiMulti wifiMulti;
  WebServer server(80);
#else
  ESP8266WiFiMulti wifiMulti;
  ESP8266WebServer server(80);
#endif

WebSocketsServerListener webSocketsServerListener;
WebSocketsServer webSocketsServer = WebSocketsServer(81);
CRGB leds[NUM_LEDS];

unsigned long nextLoopInterval = 0;

void setup() {
 
  // init Serial with desired baud rate
  Logging::init(115200);
  VERBOSE_FP(F("Serial baud rate is [%lu]"), Serial.baudRate());

  // WiFi AP setup
  setupWiFiAp(WIFI_AP_SSID, WIFI_AP_PSK, WIFI_MODE_APSTA);

  // WiFi setup
  wifiMulti.addAP(WIFI_SSID_1, WIFI_PSK_1);
  wifiMulti.addAP(WIFI_SSID_2, WIFI_PSK_2);
  setupWiFiSta(wifiMulti, WIFI_MODE_APSTA);

  // MDNS setup
  const char* hostname = "esp8266";
  if (MDNS.begin(hostname)) {
    // add service to MDNS-SD
    MDNS.addService("http", "tcp", 80);
    VERBOSE_FP(F("MDNS enabled to http://%s.local"), hostname);
  } else {
     ERROR_FP(F("MDNS failed for http://%s.local"), hostname);
  }
  // add service to MDNS
  MDNS.addService("http", "tcp", 80);

  // setup matrix
  FastLED.addLeds<WS2811, DATA_PIN, RGB>(leds, NUM_LEDS);
  FastLED.show();

  server.on("/ap", HTTP_GET, []() {
  
    StreamString* payload = new StreamString();
    size_t size = serializeWiFiAp(*payload);
    server.send(200, APPLICATION_JSON, *payload); 
  });
  server.on("/sta", HTTP_GET, []() {
  
    StreamString* payload = new StreamString();
    size_t size = serializeWiFiSta(*payload);
    server.send(200, APPLICATION_JSON, *payload); 
  });
  server.on("/esp", HTTP_GET, []() {
  
    StreamString* payload = new StreamString();
    size_t size = serializeESP(*payload);
    server.send(200, APPLICATION_JSON, *payload); 
  });
  server.on("/matrix", HTTP_GET, []() {
    WARNING("TODO");
  });

  // add static ws test resource
  server.on("/", []() {
    server.send_P(200, TEXT_HTML, WS_TEST_HTML);
  });

  // define specific ws listener handler
  webSocketsServerListener.onTextMessage([](uint8_t num, WStype_t type, uint8_t *payload, size_t length) {

    // try to parse payload as json
    DynamicJsonDocument docRequest;
    DeserializationError err = deserializeJson(docRequest, payload);
    if (err) {
      VERBOSE_F("Reading request failed: %s", err.c_str());
      webSocketsServer.sendTXT(num, "Received an unexpected message.");
    } else {
      // map json request
      JsonObject request = docRequest.as<JsonObject>();
      // TODO

      // create json response
      DynamicJsonDocument docResponse;
      JsonObject response = docResponse.to<JsonObject>();
      
      // TODO
      response["echo"] = "success";


      // send response message
      StreamString* msg = new StreamString();
      serializeJson(response, *msg);
      webSocketsServer.sendTXT(num, *msg);
    }
  });

  // register ws listener
  webSocketsServer.onEvent([](uint8_t num, WStype_t type, uint8_t *payload, size_t length) {
    webSocketsServerListener.onEvent(num, type, payload, length);
  });

  // start web server
  server.begin();

  VERBOSE_FP(F("========================="));
  VERBOSE_FP(F("Setup finished. Have fun."));
  VERBOSE_FP(F("========================="));
}

void loop() {
  
  server.handleClient();

  if (millis() > nextLoopInterval) {  
    nextLoopInterval = millis() + LOOP_INTERVAL;
    
    VERBOSE("LOOP");

    #ifdef ESP8266
      MDNS.update();
    #endif

    int i = webSocketsServer.connectedClients(true);
    VERBOSE_FP(F("Send WebSocket pong and received %d ping message(s)."), i);
  }

  // reserve time for core processes
  delay(100);
}
