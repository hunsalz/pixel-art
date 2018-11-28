[![Build Status](https://travis-ci.org/hunsalz/web-socket.svg?branch=master)](https://travis-ci.org/hunsalz/web-socket)
[![License](https://img.shields.io/badge/license-MIT%20License-blue.svg)](http://doge.mit-license.org)
[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/hunsalz/web-socket)

# Watch  [\<web-socket\>↗](https://hunsalz.github.io/web-socket) live

A [Polymer 3.0](https://polymer-library.polymer-project.org/3.0/docs/devguide/feature-overview) element to ease the usage of [WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket).

## Install dependencies and run the demo locally

1. Build \<web-socket\> in the repo directory:

```
$ polymer build
```

2. Run the demo automatically in your browser:

```
$ polymer serve --open
```

## Usage

Example of `<web-socket>`:

```html
<web-socket url="{{url}}"
            protocols="{{protocols}}"
            state="{{state}}"
            last-request="{{request}}"
            last-response="{{response}}"
            last-error="{{error}}"
            retry
            connect-attempts="{{connectAttempts}}">
</web-socket>
```

Attributes explained:

* __url__ = Describes the WebSocket server URL
* __protocols__ = Describes a single protocol string or a collection of protocol strings
* __state__ = Provides the current state of the WebSocket connection. Notifies about [WebSocket.readyState](https://developer.mozilla.org/en/docs/Web/API/WebSocket#Ready_state_constants) changes.
* __last-request__ = The most recent request made by this web-socket element.
* __last-response__ = The most recent response received by this web-socket element.
* __last-error__ = The most recent error received by this web-socket element. If any error occurred.
* __retry__ = Redelivers messages after a connection break-down
* __connectAttempts__ = Counts and notify re-connection attempts

## Run your own prototype WebSocket-Server without great effort

Almost all demo references uses *wss://echo.websocket.org/* as WebSocket-Server. This [demo](https://hunsalz.github.io/web-socket) makes no difference. If you search for a local alternative, you can get up and running in minutes with [httpwebsockethandler](https://github.com/SevenW/httpwebsockethandler) by [SevenW](https://github.com/SevenW).