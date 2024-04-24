const options = {
  brightness: 100,
  contrast: 90,
  sepia: 10,
}

if (window.DarkReader) {
  window.DarkReader.enable(options);
}

import('https://esm.run/darkreader').then((module) => {
  window.DarkReader = module;
  const { enable } = module;
  enable(options);
});
