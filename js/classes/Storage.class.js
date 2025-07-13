function Storage() {
	"use strict";
	
	// Check if we're in a service worker context
	var isServiceWorker = typeof self !== 'undefined' && self.ServiceWorkerGlobalScope && self instanceof ServiceWorkerGlobalScope;
	
	/**
	 * Get a value from storage
	 * @param {string} key
	 * @param {function} callback
	 */
	this.get = function(key, callback) {
		if (isServiceWorker) {
			// Use chrome.storage in service worker
			chrome.storage.local.get([key], function(result) {
				callback(result[key]);
			});
		} else {
			// Use localStorage in regular pages
			callback(localStorage[key]);
		}
	};
	
	/**
	 * Set a value in storage
	 * @param {string} key
	 * @param {*} value
	 * @param {function} callback
	 */
	this.set = function(key, value, callback) {
		if (isServiceWorker) {
			// Use chrome.storage in service worker
			var data = {};
			data[key] = value;
			chrome.storage.local.set(data, callback || function() {});
		} else {
			// Use localStorage in regular pages
			localStorage[key] = value;
			if (callback) callback();
		}
	};
	
	/**
	 * Get multiple values from storage
	 * @param {Array} keys
	 * @param {function} callback
	 */
	this.getMultiple = function(keys, callback) {
		if (isServiceWorker) {
			// Use chrome.storage in service worker
			chrome.storage.local.get(keys, callback);
		} else {
			// Use localStorage in regular pages
			var result = {};
			keys.forEach(function(key) {
				result[key] = localStorage[key];
			});
			callback(result);
		}
	};
	
	/**
	 * Set multiple values in storage
	 * @param {Object} data
	 * @param {function} callback
	 */
	this.setMultiple = function(data, callback) {
		if (isServiceWorker) {
			// Use chrome.storage in service worker
			chrome.storage.local.set(data, callback || function() {});
		} else {
			// Use localStorage in regular pages
			for (var key in data) {
				localStorage[key] = data[key];
			}
			if (callback) callback();
		}
	};
}

var STORAGE = new Storage(); 