function Storage() {
	"use strict";
	
	// Check if we're in a service worker context
	var isServiceWorker = typeof self !== 'undefined' && self.ServiceWorkerGlobalScope && self instanceof ServiceWorkerGlobalScope;
	
	// For Chrome extensions, always use chrome.storage.local if available
	// This ensures consistency between service worker and regular pages
	var useChromeStorage = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
	
	/**
	 * Get a value from storage
	 * @param {string} key
	 * @param {function} callback
	 */
	this.get = function(key, callback) {
		console.log('Storage.get called for key:', key);
		if (useChromeStorage) {
			// Use chrome.storage for Chrome extensions (both service worker and regular pages)
			chrome.storage.local.get([key], function(result) {
				console.log('Storage.get result for', key, ':', result);
				callback(result[key]);
			});
		} else {
			// Use localStorage in regular pages (fallback)
			try {
				var value = localStorage[key];
				console.log('Storage.get from localStorage for', key, ':', value);
				callback(value);
			} catch (e) {
				console.error('Failed to read from localStorage:', e);
				callback(undefined);
			}
		}
	};
	
	/**
	 * Set a value in storage
	 * @param {string} key
	 * @param {*} value
	 * @param {function} callback
	 */
	this.set = function(key, value, callback) {
		console.log('Storage.set called for key:', key, 'value:', value);
		if (useChromeStorage) {
			// Use chrome.storage for Chrome extensions (both service worker and regular pages)
			var data = {};
			data[key] = value;
			chrome.storage.local.set(data, function() {
				console.log('Storage.set completed for key:', key);
				if (callback) callback();
			});
		} else {
			// Use localStorage in regular pages (fallback)
			try {
				localStorage[key] = value;
				console.log('Storage.set to localStorage completed for key:', key);
				if (callback) callback();
			} catch (e) {
				console.error('Failed to write to localStorage:', e);
				if (callback) callback();
			}
		}
	};
	
	/**
	 * Get multiple values from storage
	 * @param {Array} keys
	 * @param {function} callback
	 */
	this.getMultiple = function(keys, callback) {
		if (useChromeStorage) {
			// Use chrome.storage for Chrome extensions (both service worker and regular pages)
			chrome.storage.local.get(keys, callback);
		} else {
			// Use localStorage in regular pages (fallback)
			try {
				var result = {};
				keys.forEach(function(key) {
					result[key] = localStorage[key];
				});
				callback(result);
			} catch (e) {
				console.error('Failed to read multiple from localStorage:', e);
				callback({});
			}
		}
	};
	
	/**
	 * Set multiple values in storage
	 * @param {Object} data
	 * @param {function} callback
	 */
	this.setMultiple = function(data, callback) {
		if (useChromeStorage) {
			// Use chrome.storage for Chrome extensions (both service worker and regular pages)
			chrome.storage.local.set(data, callback || function() {});
		} else {
			// Use localStorage in regular pages (fallback)
			try {
				for (var key in data) {
					localStorage[key] = data[key];
				}
				if (callback) callback();
			} catch (e) {
				console.error('Failed to write multiple to localStorage:', e);
				if (callback) callback();
			}
		}
	};
}

var STORAGE = new Storage(); 