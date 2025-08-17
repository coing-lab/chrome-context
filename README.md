Contexts: Extension Groups & One‑Click Switch
======================

Group your extensions into work/personal/whatev Contexts and switch them on/off with one click to keep Chrome fast, focused and private.

Usage
-----

<!-- You may install this extension from its google chrome webstore page

https://chrome.google.com/webstore/detail/aalnjolghjkkogicompabhhbbkljnlka -->

Download it, go to chrome://extensions and enable the "Developer mode" toggle in upper right, then drag and drop the downloaded folder onto that page or use the Load unpacked button to navigate to the folder.


Bugs and Features
-----------------

If you found a bug or have a feature request, please create an issue here on GitHub.

https://github.com/coing-lab/chrome-context/issues


Why you need this
-----------------

Work clean. Switch smarter.
Contexts lets you group your Chrome extensions into purpose‑built contexts (e.g., Work, Personal, Shopping, Testing) and toggle the right set with one click—without leaving the page.

Why it’s better
	•	Faster Chrome: load only what you need right now to reduce overhead.
	•	Focused setups: flip between Work vs. Personal without juggling profiles.
	•	Consistency: keep a baseline of always‑enabled tools while swapping task‑specific ones.
	•	Less fiddling: stop hunting through chrome://extensions to enable/disable one by one.  ￼

What you can do
	•	Create & name contexts for different workflows.
	•	One‑click activate/deactivate a context from the popup.
	•	Mark extensions as Always On (included across all contexts).
	•	See & toggle individual extensions directly in the popup.
	•	Configure, reorder, import/export contexts on the Options page.
	•	Optional prompt when a new extension is installed—add it to contexts on the spot.

Getting started (30 seconds)
	1.	Install and open the popup.
	2.	Create “Work” and “Personal” contexts.
	3.	Add extensions to each; mark your must‑haves Always On.
	4.	Click your context to switch—done.

Permissions & privacy
Designed around the Management scope needed to list and toggle your installed extensions and save settings; nothing extra. 
Notifications only appear when you add new extensions so you can quickly file them into your Contexts.
Your data is stored locally in your browser. Chrome sync (optional) stores data on Google's servers for cross-device access.


Changelog
---------

### 0.420 ###

New features:
+ MV3 support for Chrome & Chrome Web Store
+ Flat design update for 2025
+ Options linked from Popup
+ Options page simplified
+ Rebrand, new project maintainer

Bug fixes:
+ Chrome Sync Save & Load from server works again

### 0.414 ###

Bug fixes:
+ misc

### 0.410 ###

New features:
+ Ability to manage individual extensions from the popup (#29)

Bug fixes:
+ options page not responding - replacing webkitNotifications with Chrome notifications / HTML5 notifications

Other:
+ Grunt support

### 0.400 ###

New features:
+ syncing configuration via Chrome Sync
+ displaying status of each context in the popup (enabled-green/disabled-red/partial-yellow)
+ displaying status of extensions on the options page (enabled-red/disabled-green)
+ possibility to use extension icon instead of context icon
+ preserving state of 'highlight ungrouped extensions' checkbox

Bugs fixed:
+ cloned context partially inactive until options page was refreshed

Other:
+ Thanks to Thiago Talma (@thiagomt) who contributed huge part of this update.
+ Disabling 'ask what to do' option for browsers that no longer support HTML notifications (#23)
+ Codebase improved thanks to the WebStorm

### 0.300 ###

New features:
+ importing/exporting configuration
+ highlighting ungrouped extensions on options page
+ new default action for new extensions: 'add to always-enabled'
+ new action in notification window: 'add to always-enabled'

Bugs fixed:
+ notification window showing up when no contexts are available
+ formatting bug in notification window

Other:
+ core functionality was rewritten using OOP (still far from perfect though)

### 0.200 ###

New features:
+ enabling/disabling multiple contexts ("+" and "-" buttons in the popup)
+ possibility to duplicate contexts on options page
+ always enabled extensions

Contributors
------

**Zachary Wiles**
+ https://github.com/ezdub

**Konrad Dzwinel**
initial author
+ https://github.com/kdzwinel


License
-------

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
