// Import required classes
importScripts(
    '/js/classes/Configuration.class.js',
    '/js/classes/ExtensionsManager.class.js',
    '/js/classes/ContextsManager.class.js',
    '/js/classes/IconAnimation.class.js',
    '/js/classes/ExtensionNotification.class.js',
    '/js/classes/Storage.class.js'
);

var contextsManager = new ContextsManager();
var extensionsManager = new ExtensionsManager();
var iconAnimation;

// Service worker initialization
self.addEventListener('install', function(event) {
    console.log('Service Worker installed');
});

self.addEventListener('activate', function(event) {
    console.log('Service Worker activated');
    // Check if we've already initialized in this session
    if (!self.initialized) {
        self.initialized = true;
        init();
    }
});

function init() {
    console.log('Background init started');
    // Initialize storage first
    CONFIG.initStorage(function() {
        console.log('Background storage initialized');
        // Debug storage state
        CONFIG.debugStorage();
        
        // Initialize contexts manager
        contextsManager.init(function() {
            console.log('ContextsManager initialized, contexts:', contextsManager.getContextsList().map(function(c) { return c.name; }));
        });
        
        // Create a simple icon animation that doesn't use DOM
        iconAnimation = {
            animate: function(icon) {
                try {
                    var iconPath = icon.startsWith('chrome-extension://') ? icon : chrome.runtime.getURL(icon);
                    chrome.action.setIcon({path: iconPath});
                    setTimeout(() => {
                        try {
                            chrome.action.setIcon({path: chrome.runtime.getURL("icons/context.png")});
                        } catch (e) {
                            console.error('Failed to reset icon:', e);
                        }
                    }, 1500);
                } catch (e) {
                    console.error('Failed to set icon:', icon, e);
                }
            }
        };

        // Use async check to ensure storage is properly loaded
        CONFIG.getAsync('firstRun', function(firstRunValue) {
            console.log('Background checking firstRun value:', firstRunValue);
            if(firstRunValue == 'yes') {
                console.log('Opening config due to firstRun = yes');
                openConfig();
                // Ensure firstRun is set to 'no' after opening config
                CONFIG.set('firstRun', 'no', function() {
                    console.log('firstRun set to no in background');
                });
            } else {
                console.log('firstRun is not yes, not opening config');
            }
        });
    });
}

/*CONTEXT CHANGING*/
function reloadConfiguration(callback) {
	//show animation
	iconAnimation.animate("icons/context_cog.png");

	//reload list of all extensions and always enabled extensions
	extensionsManager.init(function() {
		// Also reload contexts
		contextsManager.init(function() {
			console.log('Reloaded contexts:', contextsManager.getContextsList().map(function(c) { return c.name; }));
			if (callback) callback();
		});
	});
}

function enableAllExtensions() {
	reloadConfiguration(function() {
		extensionsManager.enableAllExtensions();
	});
}

function disableAllExtensions() {
	reloadConfiguration(function() {
		extensionsManager.disableAllExtensions();
	});
}

function changeContext(selectedContext) {
	reloadConfiguration(function() {
		//change context
		var context = contextsManager.getContext(selectedContext);

		if(context) {
			var allExtensions = extensionsManager.getExtensionsList();
			var enableList = [];
			var disableList = [];

			//check which extensions should be enabled and which should be disabled
			for(var i in allExtensions) {
				var extension = allExtensions[i];
				var found = false;

				//first, check if extension should be always enabled, if not, check if it is enabled in given context
				if(extensionsManager.isAlwaysEnabled(extension.id)) {
					found = true;
				} else {
					found = contextsManager.isInContext(context, extension);
				}

				if(found) {
					enableList.push(extension);
				} else {
					disableList.push(extension);
				}
			}

			//disable extensions first, then enable extensions
			extensionsManager.disableExtensions(disableList, function(){
				extensionsManager.enableExtensions(enableList);
			});
		}
	});
}

function activateContext(selectedContext) {
	reloadConfiguration(function() {
		//activate context
		var context = contextsManager.getContext(selectedContext);

		if(context){
			var allExtensions = extensionsManager.getExtensionsList();
			var enableList = [];

			//check which extensions should be enabled
			for(var i in allExtensions) {
				var extension = allExtensions[i];
				var found = false;

				//first, check if extension should be always enabled, if not, check if it is enabled in given context
				if(extensionsManager.isAlwaysEnabled(extension.id)) {
					found = true;
				} else {
					found = contextsManager.isInContext(context, extension);
				}

				if(found) {
					enableList.push(extension);
				}
			}

			//enable extensions
			extensionsManager.enableExtensions(enableList);
		}
	});
}

function deactivateContext(selectedContext) {
	console.log('deactivateContext called with:', selectedContext);
	console.log('Available contexts:', contextsManager.getContextsList().map(function(c) { return c.name; }));
	
	reloadConfiguration(function() {
		//deactivate context
		var context = contextsManager.getContext(selectedContext);
		console.log('Found context:', context);

		if(context){
			console.log('Context found, proceeding with deactivation');
			var allExtensions = extensionsManager.getExtensionsList();
			console.log('All extensions count:', allExtensions.length);
			var disableList = [];

			//check which extensions should be disabled
			for(var i in allExtensions) {
				var extension = allExtensions[i];
				var found = false;

				//skip always enabled extensions
				if(extensionsManager.isAlwaysEnabled(extension.id)) {
					console.log('Skipping always enabled extension:', extension.name);
					continue;
				} else {
					found = contextsManager.isInContext(context, extension);
					console.log('Extension', extension.name, 'in context', selectedContext, ':', found);
				}

				if(found) {
					disableList.push(extension);
					console.log('Added to disable list:', extension.name);
				}
			}

			console.log('Final disable list length:', disableList.length);
			//disable extensions
			extensionsManager.disableExtensions(disableList, function() {
				console.log('Deactivated context:', selectedContext, 'disabled extensions:', disableList.length);
			});
		} else {
			console.error('Context not found:', selectedContext);
			console.log('This might be because:');
			console.log('1. The context was deleted but popup still references it');
			console.log('2. Context data got corrupted');
			console.log('3. Timing issue - context list not loaded yet');
			console.log('Available contexts after reload:', contextsManager.getContextsList().map(function(c) { return c.name; }));
		}
	});
}

function configUpdated() {
    CONFIG.initStorage(function() {
        contextsManager.init(function() {
            extensionsManager.init(function() {
                iconAnimation.animate("icons/context_wrench.png");
            });
        });
    });
}

/* NEW EXTENSION INSTALLATION */
var newestExtension;

function getNewestExtension() {
	return newestExtension;
}

chrome.management.onInstalled.addListener(function(extdata) {
	//ignore themes
	if(extdata.type === 'theme') {
		return;
	}

	//if app support is disabled do nothing
	if(extdata.isApp && CONFIG.get('appsSupport') !== 'true') {
		return;
	}

	//check if extension exist in list of known extensions - hack to distinguish between extension installation and update
	if( extensionsManager.getExtensionData( extdata.id ) ) {
		return;//just an update
	}

	var contexts = contextsManager.getContextsList();

	if(contexts.length > 0 && CONFIG.get('newExtensionAction') === 'add_to_all') {
		for(var i in contexts) {
			contextsManager.addExtensionToContext( contexts[i], extdata.id );
		}

		contextsManager.save(function() {
			configUpdated();
		});
	} else if(CONFIG.get('newExtensionAction') === 'add_to_always_enabled') {
		extensionsManager.addExtensionToAlwaysEnabled( extdata.id );
		extensionsManager.save(function() {
			configUpdated();
		});
	} else if (CONFIG.get('newExtensionAction') === 'ask') {
		//fetching last (biggest) icon if it exists, otherwise using Context icon
		var icon = (extdata.icons && extdata.icons.length) ? (extdata.icons[extdata.icons.length - 1].url) : ('icons/context-128.png');

		var notification = new ExtensionNotification({
			icon: icon,
			title: chrome.i18n.getMessage("extension_installed_1") + ' ' + extdata.name + ' ' + chrome.i18n.getMessage("extension_installed_2"),
			body: chrome.i18n.getMessage("open_notification"),
			onclick: function () {
				var w = 300,
					h = 400,
					t = screen.height - h - 10,
					l = screen.width - w - 10;

				chrome.windows.create({
					'url': 'notification.html',
					'type': 'popup',
					'focused': true,
					'width': w,
					'height': h,
					'top': t,
					'left': l
				});
			}
		});

		newestExtension = extdata;
		notification.show();
	}
});

chrome.management.onUninstalled.addListener(function(extid) {
	//remove extension from all contexts
	var contexts = contextsManager.getContextsList();
	for(var i in contexts) {
		contextsManager.removeExtensionFromContext( contexts[i], extid );
	}
	contextsManager.save(function() {
		//remove extension from always enabled extensions
		extensionsManager.removeExtensionFromAlwaysEnabled( extid );
		extensionsManager.save(function() {
			//update list of known extensions
			extensionsManager.init();
		});
	});
});

//open extension config page
function openConfig() {
	chrome.tabs.query({}, function(tabs) {

		for(var i= 0, l=tabs.length; i<l;i++) {
			var tab = tabs[i];
			if(tab.url.indexOf(chrome.runtime.getURL("options.html")) === 0) {
				chrome.tabs.update(tab.id, {
					url: chrome.runtime.getURL("options.html"),
					active: true
				});
				return;
			}
		}

		chrome.tabs.create({
			url:chrome.runtime.getURL("options.html"),
			active: true
		});
	});
}

// Message listeners for popup communication
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('Background received message:', request.action, request);
    
    switch(request.action) {
        case 'enableAllExtensions':
            console.log('Handling enableAllExtensions');
            enableAllExtensions();
            break;
        case 'disableAllExtensions':
            console.log('Handling disableAllExtensions');
            disableAllExtensions();
            break;
        case 'changeContext':
            console.log('Handling changeContext:', request.contextName);
            changeContext(request.contextName);
            break;
        case 'activateContext':
            console.log('Handling activateContext:', request.contextName);
            activateContext(request.contextName);
            break;
        case 'deactivateContext':
            console.log('Handling deactivateContext:', request.contextName);
            deactivateContext(request.contextName);
            break;
        case 'getNewestExtension':
            sendResponse(getNewestExtension());
            break;
        case 'configUpdated':
            configUpdated();
            break;
        default:
            console.error('Unknown action:', request.action);
    }
    return true; // Keep the message channel open for async responses
});

// Initialize immediately for service worker
init();
