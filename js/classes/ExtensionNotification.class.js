function ExtensionNotification(options) {
	"use strict";
	var useChromeNotifications = (typeof chrome !== 'undefined' && chrome.notifications && typeof chrome.notifications.create === 'function');
	var defaults = { icon: 'icons/context-128.png', title: '', body: '' };
	var settings = Object.assign({}, defaults, options || {});
	var notification = null;

	this.show = function () {
		//ATM only osx, windows and chrome os support chrome.notifications
		if (useChromeNotifications) {
			notification = chrome.notifications.create(settings.title, {
				type: "basic",
				title: settings.title,
				message: settings.body,
				iconUrl: settings.icon
			}, function (notificationID) {
				notification = notificationID;
			});

			if(settings.onclick) {
				chrome.notifications.onClicked.addListener(function(notificationID) {
					if(notification === notificationID) {
						settings.onclick();
					}
				});
			}
		} else if (typeof window !== 'undefined' && typeof window.Notification !== 'undefined') {
			//we use default HTML5 notifications for Linux
			notification = new Notification(settings.title, {body: settings.body, icon: settings.icon});

			if(settings.onclick) {
				notification.onclick = settings.onclick;
			}
		}
	};
}