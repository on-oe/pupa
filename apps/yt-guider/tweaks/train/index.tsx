import React from 'react';
import { createRoot } from 'react-dom/client';
import { TrainApp } from './train-app';
import { createContainer } from './utils/container';

function init() {
  const container = createContainer();
  const app = createRoot(container);
  app.render(<TrainApp />);
}

function listen() {
  init();
}

listen();
