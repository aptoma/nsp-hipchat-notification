'use strict';

const request = require('request-prom');
const path = require('path');
const nsp = require('nsp');

module.exports = function (token, room, projectName) {
	const pkgPath = path.join(process.cwd(), 'package.json');
	const shrinkwrapPath = path.join(process.cwd(), 'npm-shrinkwrap.json');

	nsp.check({package: pkgPath, shrinkwrap: shrinkwrapPath}, (err, result) => {
		if (err) {
			console.log('NSP check failed', err);
		}

		if (!err && !result.length) {
			console.log('NSP check completed, no vulnerabilities found');
			return;
		}

		const body = err ? createBody(`NSP check failed: ${err.message}`) : createBody(createResultMessage(projectName, result));

		notificationRequest(room, token, body)
			.then(() => {
				console.log('Notification sent');
			})
			.catch((err) => {
				console.log('Failed to send notification to hipchat', err);
			});
	});
};

function createBody(message) {
	return {
		color: 'red',
		message,
		notify: true,
		message_format: 'html' // eslint-disable-line
	};
}

function createResultMessage(projectName, result) {
	const ids = {};
	const advisories = result
		.filter((r) => {
			if (!ids[r.id]) {
				ids[r.id] = r;
				return r;
			}
		})
		.map((r) => `<p><a href="${r.advisory}">(${r.module}) - ${r.title}</a></p>`);
	const num = Object.keys(ids).length;
	const vuln = num > 1 ? 'vulnerabilities' : 'vulnerability';
	const header = `<p>Found (${num}) ${vuln} in <a href="https://github.com/${projectName}">${projectName}</a></p>`;
	return header + advisories.join('');
}

function notificationRequest(room, token, body) {
	const httpOptions = {
		url: `http://api.hipchat.com/v2/room/${room}/notification?auth_token=${token}`,
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	};

	return request(httpOptions);
}
