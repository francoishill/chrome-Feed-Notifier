var notifIDCounter = 1;

var notificationOptionsById = {};

chrome.notifications.onClicked.addListener(function(notificationId) {
    chrome.tabs.create({ url: notificationOptionsById[notificationId].additionalContext.entryUrl });
    chrome.notifications.clear(notificationId, null);
    /*chrome.notifications.getAll(function(notifications) {
        // console.log("Click id: ", notificationId, notificationOptionsById[notificationId], "notifications", notifications);
    });*/
})

function showNewNotification(notificationOptions, additionalContext) {
    var thisNotifId = (notifIDCounter++).toString();
    
    var createdCallback = function(notificationId) {
        notificationOptionsById[notificationId] = {
            notificationOptions: notificationOptions,
            additionalContext: additionalContext,
        };
        // console.log("Saved id", notificationId);
    };
    chrome.notifications.create(thisNotifId, notificationOptions, createdCallback);

    /*notification.onClicked = function () {
        chrome.tabs.create({ url: entry.url() });
        notification.close();
    };*/
}
