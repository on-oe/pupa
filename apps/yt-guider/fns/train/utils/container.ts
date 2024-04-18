import globalStyle from '../index.css?inline';
import appStyle from '../styles.scss?inline';
import { PlayerID } from './yt-control';

export const RootID = 'y-english-content-view-root';

export function createContainer() {
  const root = document.createElement('div');
  root.id = RootID;
  root.style.position = 'absolute';
  root.style.top = '0';
  root.style.left = '0';
  root.style.zIndex = '99999';

  const ytPlayer = document.getElementById(PlayerID);
  ytPlayer.append(root);

  const rootIntoShadow = document.createElement('div');
  rootIntoShadow.id = 'shadow-root';

  const shadowRoot = root.attachShadow({ mode: 'open' });
  shadowRoot.appendChild(rootIntoShadow);

  /** Inject styles into shadow dom */
  const styleElement = document.createElement('style');
  styleElement.innerHTML = globalStyle + appStyle;
  shadowRoot.appendChild(styleElement);

  return rootIntoShadow;
}

const SwitchContainerID = 'pp-train-switch-container';
export function createSwitchContainer() {
  const root = document.createElement('div');
  root.id = SwitchContainerID;

  const ytpLeftControls = document.querySelector('.ytp-left-controls');
  ytpLeftControls?.insertAdjacentElement('afterend', root);

  const rootIntoShadow = document.createElement('div');
  rootIntoShadow.id = 'shadow-root';
  rootIntoShadow.style.height = '100%';
  rootIntoShadow.style.display = 'flex';
  rootIntoShadow.style.alignItems = 'center';

  const shadowRoot = root.attachShadow({ mode: 'open' });

  /** Inject styles into shadow dom */
  const styleElement = document.createElement('style');
  styleElement.innerHTML = globalStyle + appStyle;

  shadowRoot.append(styleElement, rootIntoShadow);

  return rootIntoShadow;
}