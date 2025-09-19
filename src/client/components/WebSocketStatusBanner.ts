import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { translateText } from "../Utils";

@customElement("websocket-status-banner")
export class WebSocketStatusBanner extends LitElement {
  @state() private isVisible: boolean = false;
  @state() private wsConnected: boolean = false;

  static styles = css`
    .banner {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 9999;
      background: linear-gradient(90deg, #f59e0b, #d97706);
      color: white;
      padding: 12px 20px;
      text-align: center;
      font-weight: 500;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      transform: translateY(-100%);
      transition: transform 0.3s ease-in-out;
    }

    .banner.visible {
      transform: translateY(0);
    }

    .banner.connected {
      background: linear-gradient(90deg, #10b981, #059669);
    }

    .banner-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .loading-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .check-icon {
      width: 16px;
      height: 16px;
      fill: currentColor;
    }

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  `;

  connectedCallback() {
    super.connectedCallback();

    // Listen for lobby join events
    document.addEventListener("join-lobby", this.handleJoinLobby.bind(this));
    document.addEventListener("leave-lobby", this.handleLeaveLobby.bind(this));

    // Listen for websocket connection events
    document.addEventListener(
      "websocket-connected",
      this.handleWebSocketConnected.bind(this),
    );
    document.addEventListener(
      "websocket-disconnected",
      this.handleWebSocketDisconnected.bind(this),
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("join-lobby", this.handleJoinLobby.bind(this));
    document.removeEventListener(
      "leave-lobby",
      this.handleLeaveLobby.bind(this),
    );
    document.removeEventListener(
      "websocket-connected",
      this.handleWebSocketConnected.bind(this),
    );
    document.removeEventListener(
      "websocket-disconnected",
      this.handleWebSocketDisconnected.bind(this),
    );
  }

  private handleJoinLobby() {
    this.isVisible = true;
    this.wsConnected = false;
  }

  private handleLeaveLobby() {
    this.isVisible = false;
    this.wsConnected = false;
  }

  private handleWebSocketConnected() {
    if (this.isVisible) {
      this.wsConnected = true;
      // Hide the banner after a short delay to show success
      setTimeout(() => {
        this.isVisible = false;
      }, 2000);
    }
  }

  private handleWebSocketDisconnected() {
    this.wsConnected = false;
  }

  render() {
    if (!this.isVisible) return html``;

    return html`
      <div
        class="banner ${this.isVisible ? "visible" : ""} ${this.wsConnected
          ? "connected"
          : ""}"
      >
        <div class="banner-content">
          ${this.wsConnected
            ? html`
                <svg class="check-icon" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                ${translateText("websocket.connected")}
              `
            : html`
                <div class="loading-spinner"></div>
                ${translateText("websocket.connecting")}
              `}
        </div>
      </div>
    `;
  }
}
