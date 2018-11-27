# Pixel-Art

[![Build Status](https://travis-ci.org/hunsalz/pixel-art.svg?branch=master)](https://travis-ci.org/hunsalz/pixel-art)
[![License](https://img.shields.io/badge/license-MIT%20License-blue.svg)](http://doge.mit-license.org)

## Watch [Pixel-Art-App ↗](https://hunsalz.github.io/pixel-art/) live.

Pixel-Art-App is a [Progressive Web App](https://en.wikipedia.org/wiki/Progressive_web_applications) to draw pictures on a Neopixel matrix. Size of the matrix is alterable in the source files. App can be served directly from ESP8266 with SPIFFS.

## Features

* Use a [Progressive Web App](https://en.wikipedia.org/wiki/Progressive_web_applications) as controller. Add it without further installation to your homescreen.
* Use Web standard communication with [WebSockets](https://developer.mozilla.org/de/docs/WebSockets)
* Use cheap hardware components

## Hardware listing

* (NodeMCU) ESP8266
* Neopixel matrix (e.g. TODO)
* A bunch of wires

## Pictures of hardware assembling

TODO

## Impressions

TODO 

### Build Web-App with [Polymer 3.0](https://polymer-library.polymer-project.org/3.0/docs/devguide/feature-overview)

*Prerequisition: [Polymer CLI](https://www.npmjs.com/package/polymer-cli)*

1. Install all dependencies

Go to folder *tracked-racer-app*:

```
$ polymer install
```

2. Test app locally in your browser. 

```
$ polymer serve --open
```

_Note: By design this app runs locally on ESP8266 and depends on a WebSocket served by the WebServer of the ESP. For production adjust the WS endpoint._

3. Prepare for production

```
$ polymer build
```

4. Upload app to ESP8266

Finally upload app from __ESP8266/data/www__ folder to your ESP8266. Go to Arduino IDE __Tools > [ESP8266 Sketch Data Upload](https://github.com/esp8266/arduino-esp8266fs-plugin)__

*Note*: Close _Serial Monitor_ of Arduino IDE before uploading data. Otherwise upload will interrupt.

### *Compile & upload C++ code to ESP8266*

Load sketch __ESP8266.ino__ from __ESP8266__ folder in [Arduino IDE](https://www.arduino.cc/en/main/software).

Verify dependencies:

TODO

You can manage your additional includes by Arduino IDE __Sketch > Include Library > Manage Libraries__ or you checkout dependencies yourself by __git clone__ in your __library__ folder of your Arduino sketchbook location.

Using git allows you to easily update all libraries at once:

```
ls | xargs -I{} git -C {} pull
```

With all dependencies provided the code should compile and is ready for upload.

5. Browse to http://esp8266.local/ to load the app.