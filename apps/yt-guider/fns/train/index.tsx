import React from 'react';
import { createRoot } from 'react-dom/client';
import { TrainApp } from './train-app';
import { createContainer, RootID } from './utils/container';
import { PlayerID } from './utils/yt-control';

function init() {
  const container = createContainer();
  const app = createRoot(container);
  app.render(<TrainApp />);
}

function listen() {
  init();
  // const observer = new MutationObserver((mutations) => {
  //   mutations.forEach((mutation) => {
  //     if (mutation.type === 'childList') {
  //       mutation.addedNodes.forEach((node) => {
  //         if (
  //           (node as HTMLElement)?.id === PlayerID &&
  //           !document.getElementById(RootID)
  //         ) {
  //           init();
  //         }
  //       });
  //     }
  //   });
  // });

  // observer.observe(document.body, {
  //   childList: true,
  //   subtree: true,
  // });
}

listen();
