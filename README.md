# Pixel-Art

[![Build Status](https://travis-ci.org/hunsalz/pixel-art.svg?branch=master)](https://travis-ci.org/hunsalz/pixel-art)
[![License](https://img.shields.io/badge/license-MIT%20License-blue.svg)](http://doge.mit-license.org)

## Watch [Pixel-Art-App ↗](https://hunsalz.github.io/pixel-art/) live.

Pixel-Art-App is a [Polymer 2.0](https://www.polymer-project.org/2.0/) app to draw pictures on a Neopixel matrix. Size of the matrix is alterable in the source files. App can be served directly from ESP8266 with SPIFFS or from any other host system that is able to open a WebSocket connection to the ESP.

## Hardware listing

* (NodeMCU) ESP8266
* Neopixel matrix (e.g. TODO)
* A bunch of wires

## Pictures of hardware assembling

TODO

## Impressions

TODO 

## Setup Pixel-Art

1. Install Polymer dependencies
```
npm install -g polymer-cli
cd pixel-art-app/
polymer install
```

2. Build bundled app
```
polymer-bundler index.html --inline-scripts --inline-css --strip-comments > ../Esp8266/data/www/index.build.html && gzip ../Esp8266/data/www/index.build.html
```

3. Upload sketch to ESP8266

Rename `config.h.template` to `config.h` and insert your WiFi settings.

4. Upload bundled app to ESP8266

A [plugin](https://github.com/esp8266/arduino-esp8266fs-plugin) is available for Arduino IDE.

5. Browse to http://esp8266.local/ to load app.