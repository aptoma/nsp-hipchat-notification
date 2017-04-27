# @aptoma/nsp-hipchat-notification

Module for running nsp check on travis and send notification to hipchat

## Installation

This module is installed via npm:

	$ npm install @aptoma/nsp-hipchat-notification


## Examples

Add `NSP_HIPCHAT_NOTIFICATION` environment variable to your travis build

	travis encrypt -a 'NSP_HIPCHAT_NOTIFICATION=<hipchatToken>@<hipchatRoomName>

In your .travis.yml add

	after_script:
	  - node_modules/.bin/nsp-hipchat-notification
