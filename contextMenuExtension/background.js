chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "myContextMenuItem",
    title: "Ask from AI",
    contexts: ["selection", "link", "image", "page"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "myContextMenuItem") {
    let content = "";
    if (info.selectionText) {
      content = info.selectionText;
    } else if (info.linkUrl) {
      content = info.linkUrl;
    } else if (info.srcUrl) {
      content = info.srcUrl;
    } else {
      content = info.pageUrl;
    }

    if (tab.id) {
      await chrome.sidePanel.open({ tabId: tab.id });
      chrome.runtime.sendMessage({ type: "openSidePanel", content: content });
    }
  }
});
