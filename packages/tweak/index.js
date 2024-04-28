export function sendMessage(message) {
  dispatchEvent(
    new CustomEvent(
      'pupa-tweak-message-__PUPA_APPLICATION_ID__-__PUPA_TWEAK_NAME__',
      {
        detail: message,
      },
    ),
  );
}

export function onSettingsChange(callback) {
  const handler = (e) => {
    const settings = JSON.parse(e.detail);
    callback(settings);
  };
  const eventName = `pupa-settings-change-__PUPA_APPLICATION_ID__`;
  globalThis.addEventListener(eventName, handler);

  return () => {
    globalThis.removeEventListener(eventName, handler);
  };
}
