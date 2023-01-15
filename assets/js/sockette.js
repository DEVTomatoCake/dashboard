// Took from https://raw.githubusercontent.com/lukeed/sockette/66bf604bd51f914680a69600099ba7060bc10c09/src/index.js
// Modified by booky10

const sockette = (url, opts = {}) => {
	const reconnectMaxAttempts = opts.maxAttempts || 7;
	let reconnectAttempts = 0;
	let reconnectTimer = 1;

	const object = {};
	let websocket;

	object.open = () => {
		websocket = new WebSocket(url, []);

		if (opts.onMessage) websocket.onmessage = opts.onMessage;

		websocket.onopen = event => {
			reconnectAttempts = 0;
			if (opts.onOpen) opts.onOpen(event);
		};

		websocket.onclose = event => {
			if (event.code !== 1000 && event.code !== 1001 && event.code !== 1005) object.reconnect(event);
			if (opts.onClose) opts.onClose(event);
		};

		websocket.onerror = event => {
			if (event && event.code == "ECONNREFUSED") object.reconnect(event);
			if (opts.onError) opts.onError(event);
		};
	};

	object.reconnect = event => {
		if (reconnectTimer && reconnectAttempts++ < reconnectMaxAttempts) {
			reconnectTimer = setTimeout(() => {
				if (opts.onReconnect) opts.onReconnect(event);
				object.open();
			}, opts.timeout || 1000);
		} else if (opts.onMaxTries) opts.onMaxTries(event);
	};

	object.send = string => {
		if (typeof string == "object") string = JSON.stringify(string);
		websocket.send(string);
	};

	object.close = (code, reason) => {
		reconnectTimer = clearTimeout(reconnectTimer);
		websocket.close(code || 1000, reason);
	};

	object.open();
	return object;
};
