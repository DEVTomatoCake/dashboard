// Modified by booky10 from https://raw.githubusercontent.com/lukeed/sockette/66bf604bd51f914680a69600099ba7060bc10c09/src/index.js

const sockette = (url, opts = {}) => {
	const reconnectMaxAttempts = 7;
	let reconnectAttempts = 0;
	let reconnectTimer = 1;

	const object = {};
	let websocket;

	object.open = () => {
		websocket = new WebSocket(url, []);

		websocket.onmessage = event => {
			console.log("Received message: " + event.data);

			if (opts.onMessage) opts.onMessage(event);
		};

		websocket.onopen = event => {
			reconnectAttempts = 0;
			if (opts.onOpen) opts.onOpen(event);
		};

		websocket.onclose = event => {
			console.log("Closed", event);

			if (event.code !== 1000 && event.code !== 1001 && event.code !== 1005) object.reconnect(event);
			if (opts.onClose) opts.onClose(event);
		};

		websocket.onerror = event => {
			if (event && event.code == "ECONNREFUSED") object.reconnect(event);
			if (opts.onError) opts.onError(event)
			else console.error("[WS] Error", event);
		};
	};

	object.reconnect = event => {
		if (reconnectTimer && reconnectAttempts++ < reconnectMaxAttempts) {
			reconnectTimer = setTimeout(() => {
				console.log("Reconnecting...", event);
				object.open();
			}, 3500);
		} else console.warn("[WS] Stopped reconnection attempts", event);
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
