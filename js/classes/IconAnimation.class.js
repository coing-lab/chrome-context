function IconAnimation(config) {
	"use strict";
	var animationFrames = 36,
		animationSpeed = 10,//ms
		rotation = 0,
		defaultIcon = config.defaultIcon || "icons/context.png";

	this.animate = function (icon) {
		chrome.action.setIcon({path: icon});
		setTimeout(animateFlip, 1500);
	};

	var ease = function (x) {
		return (1 - Math.sin(Math.PI / 2 + x * Math.PI)) / 2;
	};

	var animateFlip = function () {
		rotation += 1 / animationFrames;
		if (rotation <= 1) {
			setTimeout(animateFlip, animationSpeed);
		} else {
			rotation = 0;
			chrome.action.setIcon({path: defaultIcon});
		}
	};

	// Set initial icon
	chrome.action.setIcon({path: defaultIcon});
}