import fs from "node:fs";
const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"));

/**
 * After changing, please reload the extension at `chrome://extensions`
 * @type {chrome.runtime.ManifestV3}
 */
const manifest = {
  manifest_version: 3,
  default_locale: "en",
  /**
   * if you want to support multiple languages, you can use the following reference
   * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Internationalization
   */
  name: "Pupa",
  version: packageJson.version,
  description: "learning english",
  permissions: [
    "tabs",
    "storage",
    "sidePanel",
    "activeTab",
    "scripting",
    "declarativeNetRequest",
    "browsingData",
    "webRequest",
    "nativeMessaging",
  ],
  host_permissions: ["<all_urls>"],
  side_panel: {
    default_path: "src/pages/sidepanel/index.html",
  },
  background: {
    service_worker: "src/pages/background/index.js",
    type: "module",
  },
  icons: {
    128: "icon-128.png",
  },
  content_scripts: [
    {
      // matches: ['https://www.youtube.com/*'],
      matches: ["<all_urls>"],
      js: ["src/pages/content/index.js"],
      run_at: "document_start",
    },
  ],
  // devtools_page: 'src/pages/devtools/index.html',
  web_accessible_resources: [
    {
      resources: [
        "assets/js/*.js",
        "assets/css/*.css",
        "icon-128.png",
        "icon-34.png",
      ],
      matches: ["*://*/*"],
    },
  ],
  externally_connectable: {
    matches: ["<all_urls>"],
  },
};

export default manifest;
