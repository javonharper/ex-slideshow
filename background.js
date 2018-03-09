// @format

console.log('hello from background.js')

chrome.browserAction.onClicked.addListener(tab => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    var activeTab = tabs[0]

    chrome.tabs.sendMessage(activeTab.id, { message: 'clicked_browser_action' })
  })
})

chrome.commands.onCommand.addListener(function(command) {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    var activeTab = tabs[0]

    chrome.tabs.sendMessage(activeTab.id, { message: 'clicked_browser_action' })
  })
})
