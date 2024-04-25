function main() {
  const href = window.location.href;
  const data = {
    href,
  };
  chrome.runtime.sendMessage({ name: "openPage", data });
}

main();
