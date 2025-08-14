function ConfigurationBackupExporter() {
	"use strict";
	var extensionsManager;

	/**
	 * Creates dump (base64 encoded JSON) of whole configuration. Value is returned via callback.
	 * @param {function(string)} callback
	 * @param {ContextsManager=} existingContextsManager - Optional existing contexts manager instance
	 * @param {ExtensionsManager=} existingExtensionsManager - Optional existing extensions manager instance
	 */
	this.exportConfig = function (callback, existingContextsManager, existingExtensionsManager) {
		console.log('ConfigurationBackupExporter.exportConfig called');
		console.log('existingContextsManager provided:', !!existingContextsManager);
		console.log('existingExtensionsManager provided:', !!existingExtensionsManager);
		
		// Use existing managers if provided, otherwise create new ones
		var contextsManager = existingContextsManager || new ContextsManager();
		extensionsManager = existingExtensionsManager || new ExtensionsManager(function () {
			var contexts = contextsManager.getContextsList();
			console.log('Exporting contexts:', contexts);
			var alwaysEnabledExtensions = extensionsManager.getAlwaysEnabledExtensionsIds();
			console.log('Exporting always enabled extensions:', alwaysEnabledExtensions);
			var extensionsNamesDictionary = createExtensionsNamesDictionary(contexts, alwaysEnabledExtensions);

			var cleanConfig = {
				"version": CONFIG.get("configBackupFormatVersion"),
				"contexts": contexts,
				"alwaysEnabledExtensions": alwaysEnabledExtensions,
				"extensionsNamesDictionary": extensionsNamesDictionary,
				"advancedOptions": {
					"appsSupport": CONFIG.get("appsSupport"),
					"newExtensionAction": CONFIG.get("newExtensionAction"),
					"showLoadAllBtn": CONFIG.get("showLoadAllBtn")
				}
			};

			var encodedConfig = Base64.encode(JSON.stringify(cleanConfig));
			console.log('Exported config length:', encodedConfig.length);
			console.log('Clean config:', cleanConfig);

			if (typeof callback === 'function') {
				callback(encodedConfig);
			}
		});
		
		// If we're using existing managers, we need to handle the case where ExtensionsManager is already initialized
		if (existingExtensionsManager && existingExtensionsManager.getExtensionsList().length > 0) {
			console.log('Using existing ExtensionsManager, calling callback directly');
			var contexts = contextsManager.getContextsList();
			console.log('Exporting contexts (existing manager):', contexts);
			var alwaysEnabledExtensions = extensionsManager.getAlwaysEnabledExtensionsIds();
			console.log('Exporting always enabled extensions (existing manager):', alwaysEnabledExtensions);
			var extensionsNamesDictionary = createExtensionsNamesDictionary(contexts, alwaysEnabledExtensions);

			var cleanConfig = {
				"version": CONFIG.get("configBackupFormatVersion"),
				"contexts": contexts,
				"alwaysEnabledExtensions": alwaysEnabledExtensions,
				"extensionsNamesDictionary": extensionsNamesDictionary,
				"advancedOptions": {
					"appsSupport": CONFIG.get("appsSupport"),
					"newExtensionAction": CONFIG.get("newExtensionAction"),
					"showLoadAllBtn": CONFIG.get("showLoadAllBtn")
				}
			};

			var encodedConfig = Base64.encode(JSON.stringify(cleanConfig));
			console.log('Exported config length (existing manager):', encodedConfig.length);
			console.log('Clean config (existing manager):', cleanConfig);

			if (typeof callback === 'function') {
				callback(encodedConfig);
			}
		}
	};

	var createExtensionsNamesDictionary = function (contexts, alwaysEnabledExtensions) {
		var extid, cindex, eindex;
		var extensionsNamesDictionary = {};

		for (cindex in contexts) {
			var context = contexts[cindex];

			for (eindex in context.extensions) {
				extid = context.extensions[eindex].id;

				extensionsNamesDictionary[extid] = '';
			}
		}

		for (var i = 0; i < alwaysEnabledExtensions.length; i++) {
			extid = alwaysEnabledExtensions[i];

			extensionsNamesDictionary[extid] = '';
		}

		for (extid in extensionsNamesDictionary) {
			var extension = extensionsManager.getExtensionData(extid);

			if (extension) {
				extensionsNamesDictionary[extid] = extension.name;
			}
		}

		return extensionsNamesDictionary;
	};
}