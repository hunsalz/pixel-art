import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { setPassiveTouchGestures } from '@polymer/polymer/lib/utils/settings.js';

import '@polymer/iron-input/iron-input.js';
import '@polymer/iron-icons/notification-icons.js';

import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-input/paper-input-container.js';
import '@polymer/paper-input/paper-input-error.js';
import '@polymer/paper-styles/paper-styles.js';

import '../web-socket.js';

class EchoDemo extends PolymerElement {
  static get template() {
    return html`
    <style>
      :host() {
        display: inline-block;
      }

      .container {
        display: inline-flex;
        align-items: center;
        width: 100%;
      }

      input {
        outline: none;
        box-shadow: none;
        padding: 0;
        width: 100%;
        max-width: 100%;
        background: transparent;
        border: none;
        color: var(--paper-input-container-input-color, var(--primary-text-color));
        -webkit-appearance: none;
        text-align: inherit;
        vertical-align: bottom;
        /* Firefox sets a min-width on the input, which can cause layout issues */
        min-width: 0;
        @apply --paper-font-subhead;
        @apply --paper-input-container-input;
      }

      paper-input-container {
        width: 100%;
      }

      paper-input {
        width: 100%;
      }

      paper-icon-button {
        background-color: var(--paper-pink-700);
        color: white;
        border-radius: 6px;
      }

      paper-icon-button:hover {
        background-color: var(--paper-pink-500);
        color: white;
        border-radius: 6px;
      }
    </style>
    
    <!-- service components -->

    <web-socket id="ws" auto url="[[url]]" state="{{state}}" last-response="{{response}}" last-error="{{error}}">
    </web-socket>

    <!-- UI components -->

    <div class="container">
      <paper-input-container always-float-label auto-validate attr-for-value="url">
        <label slot="label">URL</label>
        <iron-input slot="input" bind-value="{{url}}">
          <input value="{{url::input}}">
        </iron-input>
        <paper-input-error id="error" slot="add-on">Failed to establish connection.</paper-input-error>
      </paper-input-container>
      <paper-icon-button icon="{{__toggleIcon(state)}}" on-click="__toggleWSState"></paper-icon-button>
    </div>
    <template is="dom-repeat" items="[[messages]]">
      <pre>[[item.author]]: [[item.text]]</pre>
    </template>
    <paper-input id="input" autofocus value="{{message}}"></paper-input>
    <paper-button raised on-click="__send">Send</paper-button>
    `;
  }

  static get properties() {
    return {
      url: {
        type: String,
        value: 'wss://echo.websocket.org/',
        observer: '__handleUrlChanges',
        notify: true
      },
      messages: {
        type: Array,
        value: [],
        notify: true
      },
      state: {
        type: Number,
        notify: true
      },
      response: {
        type: Object,
        observer: '__handleResponse'
      },
      error: {
        type: Object,
        observer: '__handleError'
      }
    };
  }

  constructor() {
    super();

    // set passive gestures globally for all elements using Polymer gestures
    setPassiveTouchGestures(true);
  }

  /**
   * Toggle ws state icon.
   */
  __toggleIcon(state) {  
    switch (state) {
      case 1:
        return 'notification:sync';
      case 2:
        return 'notification:sync-problem';
      default:
        return 'notification:sync-disabled';
    }
  }
  
  /**
   * Toggle ws state.
   */
  __toggleWSState() {
    if (this.state === 1) {
      this.$.ws.close();
    } else {
      this.$.ws.open();
    }
    this.$.input.focus();
  }

  /**
   * Send a message.
   */
  __send() {
    this.$.ws.send(this.message);
    this.push('messages', {
      author: 'you',
      text: this.message
    });
    this.message = '';
    this.$.input.focus();
  }

  /**
   * Handle ws server response.
   */
  __handleResponse() {
    this.push('messages', {
      author: 'server',
      text: this.response
    });
  }

  /**
   * Handle ws errors.
   */
  __handleError() {
    this.$.error.update({ invalid: true });
  }

  /**
   * Handle any URL changes.
   */
  __handleUrlChanges() {
    if (this.$.ws.state === 1) {
      this.$.ws.close();
    }
    // overwrite any error message before
    this.$.error.update({ invalid: false });
  }
}

window.customElements.define('echo-demo', EchoDemo);