if (window.DarkReader) {
  window.DarkReader.disable();
}

import('https://esm.run/darkreader').then((module) => {
  window.DarkReader = module;
  const { disable } = module;
  disable();
});
