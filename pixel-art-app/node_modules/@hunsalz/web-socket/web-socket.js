import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';

/**
 * `web-socket`
 * An element to ease usage of WebSockets.
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class WebSocket extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          display: none;
        }
      </style>
    `;
  }

  static get properties() {
    return {
      // constant values according to https://developer.mozilla.org/en-US/docs/Web/API/WebSocket#Ready_state_constants
      CONNECTING: {
        type: Number,
        value: 0,
        readOnly: true
      },
      OPEN: {
        type: Number,
        value: 1,
        readOnly: true
      },
      CLOSING: {
        type: Number,
        value: 2,
        readOnly: true
      },
      CLOSED: {
        type: Number,
        value: 3,
        readOnly: true
      },
      /**
       * Server URL of WebSocket
       * @type {String}
       */
      url: {
        type: String,
        notify: true
      },
      /**
       * An optional property to provide a single protocol string or an array of protocol strings
       * @type {Array}
       */
      protocols: {
        type: Array,
        value: [],
        notify: true
      },
      /**
       * The current state of the WebSocket connection.
       * Notifies about state changes according to https://developer.mozilla.org/en/docs/Web/API/WebSocket#Ready_state_constants
       * @type {Number}
       */
      state: {
        type: Number,
        value: -1, // -1 = undefined, a ws connect is outstanding
        notify: true,
        readOnly: true
      },
      /**
       * The most recent request made by this web-socket element.
       * @type {Object}
       */
      lastRequest: {
        type: Object,
        notify: true,
        readOnly: true
      },
      /**
       * The most recent response received by this web-socket element.
       * @type {Object}
       */
      lastResponse: {
        type: Object,
        notify: true,
        readOnly: true
      },
      /**
       * The most recent error received by this web-socket element. If any error occurred.
       * @type {Object}
       */
      lastError: {
        type: Object,
        notify: true,
        readOnly: true
      },
      /**
       * If a WebSocket connection breaks down all messages are still collected. 
       * If 'retry' is true all messages get redelivered in the same order they appeared. 
       * @type {Boolean}
       */
      retry: {
        type: Boolean,
        value: true
      },
      /**
       * Internal cache of messages ready to send
       * @type Array
       */
      messages: {
        type: Array,
        value: [],
        readOnly: true
      },
      connectAttempts: {
        type: Number,
        value: 1, // anticipate first connect
        readOnly: true,
        notify: true
      },
      ws: {
        type: Object,
        notify: true,
        computed: '__computeWS(url, protocols, connectAttempts)'
      }
    };
  }

  /**
   * Close WebSocket connection when the element is detached from a document.
   */
  disconnectedCallback() {
    close();
  }

  /**
   * Callback function that's called when websocket connection is open
   * and ready to send and receive data.
   */
  onOpen(event) {
    this._setState(this.ws.readyState); // notify about state changes actively
    console.info(this.id + " : WebSocket to [%s] established.", this.ws.url, event);
    if (this.retry) { // retry to send all cached messages
      var self = this;
      this.messages.forEach(function () {
        self.__send();
      });
    } else {
      this._setMessages([]); // discard all cached messages
    }
  }

  /**
   * Callback function that's called when websocket connection is closed.
   * @param {*} event 
   */
  onClose(event) {
    this._setState(this.ws.readyState); // notify about state changes actively
    if (event.wasClean === true) {
      console.info(this.id + " : WebSocket [%s] closed.", this.url, event);
    } else {
      console.info(this.id + " : WebSocket [%s] was closed.", this.url, event);
    }
  }

  /**
   * Callback function that's called when a message is received from the server.
   * @param {*} event 
   */
  onMessage(event) {
    console.info(this.id + " : WebSocket [%s] received message.", this.url, event); 
    this._setLastResponse(event.data);
  }

  /**
   * Callback function that's called when an error occurs.
   * @param {*} event 
   */
  onError(event) {
    console.error(this.id + " : WebSocket to [%s] returns error.", this.url, event);
    this._setLastError(event);
  }

  /**
   * Transmits data to the server over the WebSocket connection.
   * @param {*} message
   * @param {*} asJson default = false
   */
  send(message, asJson = false) {

    if (asJson) {
      this.messages.push(JSON.stringify(message));
    } else {
      this.messages.push(message);
    }
    this.__send();
  }

  /**
   * Called internally to transmit the first queued message
   */
  __send() {
    var ws = this.__getWebSocket();
    if (ws && ws.readyState === this.OPEN) {
      let message = this.messages.shift();
      try {
        ws.send(message);
      } catch (err) {
        console.error(this.id + " : Failed to send message to [%s] WebSocket.", ws.url, err);
        this._setLastError(err);
      }
      this._setLastRequest(message);
    } else {
      console.warn(this.id + " : WebSocket connection to [%s] isn't open.", ws.url);
    }
  }

  /**
   * Open WebSocket connection programmatically.
   */
  open() {
    this.__getWebSocket();
  }

  /**
   * Close WebSocket connection programmatically.
   * If the connection is already closed, this method does nothing.
   * 
   * Note: WebSocket connection is closed when element is detached automatically.
   */
  close() {
    if (this.ws && this.ws.readyState === this.OPEN) {
      this.ws.close();
    } else {
      console.warn(this.id + ": WebSocket connection isn't stated as open.", this.ws);
    }
  }

  /**
   * Provides a new or an existing WebSocket connection.
   */
  __getWebSocket() {
    console.log(this.ws);
    if (!this.ws || this.ws.readyState === this.CLOSED) {
      this._setConnectAttempts(this.connectAttempts + 1); // trigger re-compute WS by incrementing connect attempts
    }
    return this.ws;
  }

  /**
   * Called internally to create a new WebSocket connection.
   * @param {*} url 
   * @param {*} protocols 
   * @param {*} connectAttempts 
   */
  __computeWS(url, protocols, connectAttempts) {
    if (url && protocols) {
      var ws = new window.WebSocket(this.url, this.protocols);
      // bind WebSocket events to component events
      ws.onopen = this.onOpen.bind(this);
      ws.onclose = this.onClose.bind(this);
      ws.onmessage = this.onMessage.bind(this);
      ws.onerror = this.onError.bind(this);
      console.info("WebSocket initialized.", ws.url);
      this.dispatchEvent(new CustomEvent('websocket-initialized', { bubbles: true, composed: true }));
      return ws;
    } else {
      console.error("Initializing WebSocket failed! Check your server url: [%s].", url);
      return null;
    }
  }
}

window.customElements.define('web-socket', WebSocket);