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
		highlightUngroupedExtensions: 'false'
	};

	// Cache for storage values in service worker
	var storageCache = {};

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
		if (typeof STORAGE !== 'undefined') {
			// In service worker context, return from cache
			return storageCache[name] !== undefined ? storageCache[name] : defaults[name] || null;
		} else {
			// In regular pages, use localStorage
			return localStorage[name] || defaults[name] || null;
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
		if (defaults[name]) {
			callback(defaults[name]);
			return;
		}
		
		if (typeof STORAGE !== 'undefined') {
			STORAGE.get(name, function(result) {
				storageCache[name] = result;
				callback(result !== undefined ? result : defaults[name] || null);
			});
		} else {
			callback(localStorage[name] || defaults[name] || null);
		}
	};
	
	/**
	 * Set a configuration value
	 * @param {string} name
	 * @param {*} value
	 * @param {function} callback
	 */
	this.set = function(name, value, callback) {
		if (typeof STORAGE !== 'undefined') {
			STORAGE.set(name, value, function() {
				storageCache[name] = value;
				if (callback) callback();
			});
		} else {
			localStorage[name] = value;
			if (callback) callback();
		}
	};
	
	/**
	 * Initialize storage cache (for service worker)
	 * @param {function} callback
	 */
	this.initStorage = function(callback) {
		if (typeof STORAGE !== 'undefined') {
			var keys = Object.keys(defaults);
			STORAGE.getMultiple(keys, function(result) {
				storageCache = result;
				if (callback) callback();
			});
		} else {
			if (callback) callback();
		}
	};
}

var CONFIG = new Configuration();