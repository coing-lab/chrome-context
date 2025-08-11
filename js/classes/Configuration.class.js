function Configuration() {
	"use strict";
	var constants = {
		iconsPath: 'icons/dortmund/',
		icons: ['home', 'search', 'world', 'heart', 'lightbulb', 'basket', 'customers', 'hire-me', 'administrative-docs', 'comment', 'config', 'finished-work', 'settings', 'star'],
		extensionName: 'Context',
		configBackupFormatVersion: 1
	};

	var defaults = {
		appsSupport: 'false',
		extensionEnableDelay: 200,//ms
		showLoadAllBtn: 'true',
		newExtensionAction: 'ask',
		firstRun: 'yes',
		highlightUngroupedExtensions: 'true'
	};

	// Cache for storage values in service worker
	var storageCache = {};

	// Check if we're in a service worker context
	var isServiceWorker = typeof self !== 'undefined' && self.ServiceWorkerGlobalScope && self instanceof ServiceWorkerGlobalScope;

	/**
	 * Returns value of a config parameter (constant, user setting or default setting) with provided name.
	 * Returns null if no matching parameter is found.
	 * @param {string} name
	 * @returns {string|Array|number|null}
	 */
	this.get = function (name) {
		// For constants and defaults, return immediately
		if (constants[name]) {
			return constants[name];
		}
		if (defaults[name]) {
			return defaults[name];
		}
		
		// For storage values
		if (isServiceWorker && typeof STORAGE !== 'undefined') {
			// In service worker context, return from cache
			var cachedValue = storageCache[name] !== undefined ? storageCache[name] : defaults[name] || null;
			console.log('Service worker get:', name, '=', cachedValue);
			return cachedValue;
		} else {
			// In regular pages, use localStorage
			try {
				var localValue = localStorage[name] || defaults[name] || null;
				console.log('localStorage get:', name, '=', localValue);
				return localValue;
			} catch (e) {
				// Fallback to defaults if localStorage is not available
				console.error('localStorage error for', name, ':', e);
				return defaults[name] || null;
			}
		}
	};
	
	/**
	 * Async version of get for service worker compatibility
	 * @param {string} name
	 * @param {function} callback
	 */
	this.getAsync = function(name, callback) {
		if (constants[name]) {
			callback(constants[name]);
			return;
		}
		
		if (isServiceWorker && typeof STORAGE !== 'undefined') {
			STORAGE.get(name, function(result) {
				storageCache[name] = result;
				// If result is undefined, it means the value wasn't found in storage
				// so we should use the default value
				var finalValue = result !== undefined ? result : defaults[name] || null;
				console.log('Service worker getAsync:', name, '=', finalValue, '(from storage:', result, ')');
				callback(finalValue);
			});
		} else {
			try {
				var localValue = localStorage[name];
				var finalValue = localValue !== undefined ? localValue : defaults[name] || null;
				console.log('localStorage getAsync:', name, '=', finalValue, '(from storage:', localValue, ')');
				callback(finalValue);
			} catch (e) {
				console.error('localStorage getAsync error for', name, ':', e);
				callback(defaults[name] || null);
			}
		}
	};
	
	/**
	 * Set a configuration value
	 * @param {string} name
	 * @param {*} value
	 * @param {function} callback
	 */
	this.set = function(name, value, callback) {
		console.log('Setting config:', name, '=', value);
		if (isServiceWorker && typeof STORAGE !== 'undefined') {
			STORAGE.set(name, value, function() {
				storageCache[name] = value;
				console.log('Service worker set complete:', name, '=', value);
				if (callback) callback();
			});
		} else {
			try {
				localStorage[name] = value;
				console.log('localStorage set complete:', name, '=', value);
				if (callback) callback();
			} catch (e) {
				console.error('Failed to save to localStorage:', e);
				if (callback) callback();
			}
		}
	};
	
	/**
	 * Initialize storage cache (for service worker)
	 * @param {function} callback
	 */
	this.initStorage = function(callback) {
		console.log('initStorage called, isServiceWorker:', isServiceWorker);
		if (isServiceWorker && typeof STORAGE !== 'undefined') {
			var keys = Object.keys(defaults);
			console.log('Loading keys from storage:', keys);
			STORAGE.getMultiple(keys, function(result) {
				console.log('Storage initialization result:', result);
				storageCache = result;
				if (callback) callback();
			});
		} else {
			console.log('Not in service worker, skipping storage cache init');
			if (callback) callback();
		}
	};

	/**
	 * Reset firstRun state (for debugging)
	 * @param {function} callback
	 */
	this.resetFirstRun = function(callback) {
		console.log('Resetting firstRun state');
		this.set('firstRun', 'yes', function() {
			console.log('firstRun reset to yes');
			if (callback) callback();
		});
	};

	/**
	 * Debug method to check current storage state
	 */
	this.debugStorage = function() {
		console.log('=== Storage Debug Info ===');
		console.log('isServiceWorker:', isServiceWorker);
		console.log('STORAGE available:', typeof STORAGE !== 'undefined');
		console.log('storageCache:', storageCache);
		
		if (!isServiceWorker) {
			try {
				console.log('localStorage firstRun:', localStorage['firstRun']);
				console.log('localStorage keys:', Object.keys(localStorage));
			} catch (e) {
				console.error('localStorage access error:', e);
			}
		}
		
		console.log('defaults:', defaults);
		console.log('========================');
	};
}

var CONFIG = new Configuration();