import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import swordIcon from "../../../../resources/images/SwordIconWhite.svg";
import xIcon from "../../../../resources/images/XIcon.svg";
import { EventBus } from "../../../core/EventBus";
import { CloseViewEvent } from "../../InputHandler";
import { Layer } from "./Layer";
import {
  CenterButtonElement,
  MenuElement,
  MenuElementParams,
} from "./RadialMenuElements";

/**
 * Mobile-friendly action panel that displays territory actions as large, tappable buttons
 * instead of the radial menu wheel used on desktop
 */
@customElement("mobile-action-panel")
export class MobileActionPanel extends LitElement implements Layer {
  @property({ type: Boolean })
  private isVisible: boolean = false;

  @state()
  private menuItems: MenuElement[] = [];

  @state()
  private params: MenuElementParams | null = null;

  @state()
  private currentSubmenuStack: MenuElement[][] = [];

  private eventBus: EventBus;

  static styles = css`
    :host {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 9999;
      pointer-events: none;
    }

    :host([visible]) {
      display: block;
      pointer-events: all;
    }

    .backdrop {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(2px);
    }

    .panel {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      max-width: 90vw;
      max-height: 70vh;
      background: rgba(30, 30, 35, 0.95);
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      overflow-y: auto;
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        transform: translateX(-50%) translateY(100%);
        opacity: 0;
      }
      to {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
      }
    }

    .close-button {
      position: absolute;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: rgba(255, 70, 70, 0.9);
      border: 2px solid rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
      transition: all 0.2s ease;
      z-index: 10000;
    }

    .close-button:active {
      transform: scale(0.95);
      background: rgba(255, 50, 50, 1);
    }

    .close-button img {
      width: 28px;
      height: 28px;
      filter: brightness(0) invert(1);
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
      margin-bottom: 8px;
    }

    .action-button {
      min-height: 80px;
      padding: 12px;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      background: var(--button-color, rgba(60, 60, 70, 0.8));
      color: white;
      font-family: Arial, sans-serif;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      text-align: center;
    }

    .action-button:active {
      transform: scale(0.96);
      border-color: rgba(255, 255, 255, 0.4);
    }

    .action-button.disabled {
      opacity: 0.4;
      cursor: not-allowed;
      background: rgba(80, 80, 80, 0.5);
    }

    .action-button img {
      width: 32px;
      height: 32px;
      filter: brightness(0) invert(1);
    }

    .action-button.has-submenu::after {
      content: "›";
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 24px;
      font-weight: bold;
      opacity: 0.7;
    }

    .back-button {
      width: 100%;
      min-height: 44px;
      margin-bottom: 12px;
      padding: 12px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 12px;
      background: rgba(80, 80, 100, 0.8);
      color: white;
      font-family: Arial, sans-serif;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s ease;
    }

    .back-button:active {
      transform: scale(0.98);
      background: rgba(100, 100, 120, 0.9);
    }

    .back-button::before {
      content: "‹";
      font-size: 24px;
      font-weight: bold;
    }
  `;

  constructor(eventBus: EventBus) {
    super();
    this.eventBus = eventBus;
  }

  init() {
    this.eventBus.on(CloseViewEvent, () => {
      this.hidePanel();
    });
  }

  showPanel(
    params: MenuElementParams,
    rootMenu: MenuElement,
    centerButton: CenterButtonElement,
    screenX?: number,
    screenY?: number,
  ) {
    this.params = params;
    this.currentSubmenuStack = [];

    // Get the initial menu items
    let items: MenuElement[] = [];
    if (rootMenu.subMenu) {
      items = rootMenu
        .subMenu(params)
        .filter((item) =>
          item.displayed === undefined
            ? true
            : typeof item.displayed === "function"
              ? item.displayed(params)
              : item.displayed,
        );
    }

    // Add center button action as a primary action button at the top
    // This handles direct attacks (ground attacks)
    const centerButtonItem: MenuElement = {
      id: "center_action",
      name: "Attack",
      disabled: centerButton.disabled,
      icon: swordIcon,
      color: "#ff0000",
      action: centerButton.action,
    };

    // Insert the center button action at the beginning if not disabled
    if (!centerButton.disabled(params)) {
      this.menuItems = [centerButtonItem, ...items];
    } else {
      this.menuItems = items;
    }

    this.isVisible = true;
    this.setAttribute("visible", "");
    this.requestUpdate();
  }

  hidePanel() {
    this.isVisible = false;
    this.removeAttribute("visible");
    this.menuItems = [];
    this.params = null;
    this.currentSubmenuStack = [];
    this.requestUpdate();
  }

  private handleActionClick(item: MenuElement) {
    if (!this.params || item.disabled(this.params)) {
      return;
    }

    // Check if this item has a submenu
    if (item.subMenu) {
      const submenu = item.subMenu(this.params);
      if (submenu && submenu.length > 0) {
        // Navigate to submenu
        this.currentSubmenuStack.push(this.menuItems);
        this.menuItems = submenu.filter((subItem) =>
          subItem.displayed === undefined
            ? true
            : typeof subItem.displayed === "function"
              ? subItem.displayed(this.params!)
              : subItem.displayed,
        );
        this.requestUpdate();
        return;
      }
    }

    // Execute the action
    if (item.action && this.params) {
      item.action(this.params);
    }

    this.hidePanel();
  }

  private handleBackClick() {
    const previousMenu = this.currentSubmenuStack.pop();
    if (previousMenu) {
      this.menuItems = previousMenu;
      this.requestUpdate();
    }
  }

  private handleBackdropClick() {
    this.hidePanel();
  }

  private handleCloseClick(event: Event) {
    event.stopPropagation();
    this.hidePanel();
  }

  render() {
    if (!this.isVisible || !this.params) {
      return html``;
    }

    const hasBack = this.currentSubmenuStack.length > 0;

    return html`
      <div class="backdrop" @click="${this.handleBackdropClick}"></div>
      <div class="panel" @click="${(e: Event) => e.stopPropagation()}">
        ${hasBack
          ? html`
              <button class="back-button" @click="${this.handleBackClick}">
                Back
              </button>
            `
          : ""}
        <div class="actions-grid">
          ${this.menuItems.map((item) => {
            const disabled = item.disabled(this.params!);
            const hasSubmenu = item.subMenu !== undefined;
            const color = item.color ?? "rgba(60, 60, 70, 0.8)";

            return html`
              <button
                class="action-button ${disabled ? "disabled" : ""} ${hasSubmenu
                  ? "has-submenu"
                  : ""}"
                style="--button-color: ${disabled
                  ? "rgba(80, 80, 80, 0.5)"
                  : color}"
                @click="${() => this.handleActionClick(item)}"
                ?disabled="${disabled}"
              >
                ${item.icon
                  ? html`<img src="${item.icon}" alt="${item.name}" />`
                  : ""}
                <span>${item.text ?? item.name}</span>
              </button>
            `;
          })}
        </div>
      </div>
      <button class="close-button" @click="${this.handleCloseClick}">
        <img src="${xIcon}" alt="Close" />
      </button>
    `;
  }

  tick() {
    // Update menu items if needed based on game state changes
  }

  renderLayer(context: CanvasRenderingContext2D) {
    // No canvas rendering needed - this is a DOM component
  }

  shouldTransform(): boolean {
    return false;
  }

  redraw() {
    // No redraw needed
  }

  isMenuVisible(): boolean {
    return this.isVisible;
  }
}
