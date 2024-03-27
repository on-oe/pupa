import { useEffect, useState } from "react";

export function useBrowser() {
  const [currentTabId, setCurrentTabId] = useState<number | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);

  useEffect(() => {
    const onTabsUpdated: Parameters<
      typeof chrome.tabs.onUpdated.addListener
    >[0] = (tabId, changeInfo) => {
      if (tabId === currentTabId && changeInfo.url) {
        setCurrentUrl(changeInfo.url);
      }
    };
    chrome.tabs.onUpdated.addListener(onTabsUpdated);

    return () => {
      chrome.tabs.onUpdated.removeListener(onTabsUpdated);
    };
  }, [currentTabId]);

  useEffect(() => {
    const onTabsActivated: Parameters<
      typeof chrome.tabs.onActivated.addListener
    >[0] = (activeInfo) => {
      setCurrentTabId(activeInfo.tabId);
    };
    chrome.tabs.onActivated.addListener(onTabsActivated);

    return () => {
      chrome.tabs.onActivated.removeListener(onTabsActivated);
    };
  }, []);

  return { currentUrl } as const;
}
