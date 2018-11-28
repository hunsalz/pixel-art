import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { GestureEventListeners } from '@polymer/polymer/lib/mixins/gesture-event-listeners.js';
import { setPassiveTouchGestures } from '@polymer/polymer/lib/utils/settings.js';

import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/iron-icons/editor-icons.js';

import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-styles/paper-styles.js';

import '@hunsalz/web-socket/web-socket.js';

class PixelArtApp extends GestureEventListeners(PolymerElement) {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }

        .container {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          overflow: hidden;
          background: var(--paper-blue-grey-800);
          @apply --layout-flex;
        }

        .boxing {
          display: inline-flex;  
          justify-content: center;
          width: 100%;
          height: 100%;
          @apply --layout-flex;
          @apply --layout-center;
        }

        .colors {
          @apply --layout-center;
        }

        .matrix {
          display: inline-flex;
          @apply --layout-flex;
        }

        .row {
          width: 100%;
          height: 100%;
          @apply --layout-vertical;
        }

        .pixel {
          width: 100%;
          height: 100%;
          background: #000000;
          border: 1px solid var(--paper-orange-700);
        }

        paper-icon-button {
          color: white;
        }

        @media screen and (orientation: landscape) {
          .container {
            @apply --layout-horizontal;
          }
          .boxing {
            @apply --layout-horizontal;
          }
          .colors {
            width: 10vh;
            height: 80vh;
            @apply --layout-vertical;
          }
          .color {
            width: 10vh;
            height: 100%;
          }
          .matrix {
            width: 80vh;
            height: 80vh;
          }
        }

        @media screen and (orientation: portrait) {
          .container {
            @apply --layout-vertical;
          }
          .boxing {
            @apply --layout-vertical;
          }
          .colors {
            width: 80vw;
            height: 10vw;
            @apply --layout-horizontal;
          }
          .color {
            width: 100%;
            height: 10vw;
          }
          .matrix {
            min-width: 80vw;
            min-height: 80vw;
          }
        }
      </style>
      
      <!-- service components -->

      <web-socket id="ws" url="[[url]]" state="{{state}}"></web-socket>

      <!-- UI components -->
      
      <div class="container">

        <div class="boxing">
          <div id="colors" class="colors">
            <div class="color" style="background: #FFFFFF; padding: 4px" on-tap="__setColor"></div>
            <div class="color" style="background: #000000" on-tap="__setColor"></div>
            <div class="color" style="background: #B22222" on-tap="__setColor"></div>
            <div class="color" style="background: #008000" on-tap="__setColor"></div>
            <div class="color" style="background: #00008B" on-tap="__setColor"></div>
            <div class="color" style="background: #FFFF00" on-tap="__setColor"></div>
            <div class="color" style="background: #40E0D0" on-tap="__setColor"></div>
            <div class="color" style="background: #EE82EE" on-tap="__setColor"></div>
          </div>
        </div>

        <div class="boxing">
          <div id="matrix" class="matrix">
            <template is="dom-repeat" items="{{columns}}" index-as="y">
              <div class="row">
                <template is="dom-repeat" items="{{rows}}" index-as="x">
                  <div id="[[__index(x, y)]]" class="pixel" on-click="__setPixelColor"></div>
                </template>
              </div>
            </template>
          </div>
        </div>

        <div class="boxing">
          <paper-icon-button icon="editor:format-color-fill" on-tap="__reset" role="button" tabindex="0" aria-disabled="false"></paper-icon-button>
        </div>

      </div>
    `;
  }
  static get properties() {
    return {
      url: {
        type: String,
        notify: true,
        computed: '__computeWSUrl()'
      },
      state: {
        type: Number,
        observer: '__handleWSStateChanges',
        notify: true
      },
      color: {
        type: String,
        value: 'rgb(255, 255, 255)' // default is white and expected in rgb() notation
      },
      columns: {
        type: Array,
        value: new Array(8),
        readOnly: true
      },
      rows: {
        type: Array,
        value: new Array(8),
        readOnly: true
      }
    };
  }

  constructor() {
    super();

    // set passive gestures globally for all elements using Polymer gestures
    setPassiveTouchGestures(true);
  }

  /**
   * Calculate a 8x8 matrix index from top left (0) to bottom right (63).
   */
  __index(x, y) {
    return (x * 8) + y;
  }

  /**
   * Log WS state changes.
   */
  __handleWSStateChanges() {
    console.log("WS state: " + this.state);
  }

  /**
   * Set a new color value.
   */
  __setColor(event) {
    // save color value
    this.color = event.target.style.background;
    // palette effect ...
    // set color values back to default
    var nodes = this.$.colors.querySelectorAll('div');
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].style.padding = '0px';
    }
    // highlight selected color
    event.target.style.padding = '4px';
  }

  /**
   * Set target pixel corresponding to current color value and notify change via WS.  
   */
  __setPixelColor(event) {

    event.target.style.background = this.color;

    this.$.ws.send({ pixel: event.target.id, rgb: this.__parseRGB2Hex(this.color) });
  }

  __reset(event) {

    // set active color to all pixels at once
    var nodes = this.$.matrix.querySelectorAll('div');
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].style.background = this.color;
    }

    this.$.ws.send({ reset: "all", rgb: this.__parseRGB2Hex(this.color) });
  }

  /**
   * Return RGB-object from CSS 'rgb(red, green, blue)' string.
   */
  __parseRGB(rgb) {

    let matches = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
    return { 'r': matches[1], 'g': matches[2], 'b': matches[3] };
  }

  /**
   * Return RGB as Hex value from CSS 'rgb(red, green, blue)' string.
   */
  __parseRGB2Hex(rgb) {

    let obj = this.__parseRGB(rgb);
    function hex(x) {
      return ("0" + parseInt(x).toString(16)).slice(-2);
    }
    //return hex(obj.r) + hex(obj.g) + hex(obj.b);
    return hex(obj.g) + hex(obj.r) + hex(obj.b);
  }

  __computeWSUrl() {

    console.log(window.location.hostname);
    console.log("hostname.endsWith(github.io)", window.location.hostname.endsWith("github.io"));

    let hostname = window.location.hostname;
    if (hostname === "127.0.0.1" || hostname.endsWith("github.io")) {
      let wsUrlDev = "wss://echo.websocket.org/";
      console.warn(hostname + " is defined as dev environment. Use " + wsUrlDev + " as mock service.");
      return wsUrlDev;
    } else {
      return "wss://echo.websocket.org/"; // URL must match with device preferences
      //return "ws://" + window.location.hostname + ':8000/matrix'; // URL must match with device preferences
    }
  }
}

window.customElements.define('pixel-art-app', PixelArtApp);