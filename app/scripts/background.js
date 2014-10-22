'use strict';

chrome.runtime.onInstalled.addListener(function (details) {
  console.log('previousVersion', details.previousVersion);
});

chrome.browserAction.setBadgeText({text: '\'Allo'});

//example of using a message handler from the inject scripts
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  chrome.pageAction.show(sender.tab.id);
  sendResponse();
});


function menuItemClicked(/*info, tab*/) {
  // launchPopup(function (newWindow) {
  //   // called once newWindow is created
  //   setTimeout(function () {
  //     chrome.tabs.sendMessage(newWindow.tabs[0].id, {
  //       type: "selectionText",
  //       text: info.selectionText || info.linkUrl
  //     });
  //   }, 200);
  // });
}


// Create the context menu item
chrome.contextMenus.create({
  title: 'Sherlocke: Prioritize this',
  contexts: ['selection', 'link', 'editable'],
  onclick: menuItemClicked
});
