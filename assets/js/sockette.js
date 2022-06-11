// Took from https://raw.githubusercontent.com/lukeed/sockette/66bf604bd51f914680a69600099ba7060bc10c09/src/index.js
// Modified by booky10

const sockette = (url, arguments = {}) => {
  	const reconnectMaxAttempts = arguments.maxAttempts || 7;
  	let reconnectAttempts = 0;
  	let reconnectTimer = 1;

  	const object = {};
  	let websocket;

  	object.open = () => {
		websocket = new WebSocket(url, []);

		if (arguments.onMessage) websocket.onmessage = arguments.onMessage;

		websocket.onopen = event => {
	  		reconnectAttempts = 0;
	  		if (arguments.onOpen) arguments.onOpen(event);
		};

		websocket.onclose = event => {
		  	if (event.code !== 1000 && event.code !== 1001 && event.code !== 1005) object.reconnect(event);
		  	if (arguments.onClose) arguments.onClose(event);
		};

		websocket.onerror = event => {
		  	if (event && event.code == "ECONNREFUSED") object.reconnect(event);
		  	if (arguments.onError) arguments.onError(event);
		};
	};

	object.reconnect = event => {
		if (reconnectTimer && reconnectAttempts++ < reconnectMaxAttempts) {
		  	reconnectTimer = setTimeout(() => {
				if (arguments.onReconnect) arguments.onReconnect(event);
				object.open();
		  	}, arguments.timeout || 1000);
		} else if (arguments.onMaxTries) arguments.onMaxTries(event);
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
