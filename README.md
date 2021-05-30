# Multimirror Js

This library represents a custom connector to socket-io

## Usage

1st: Use multimirror connector in your bootstrap.js

```js
import Echo from "laravel-echo"
window.io = require('socket.io-client')
import Multimirror from 'multimirror-js';


	window.Echo = new Echo({
		broadcaster: Multimirror,
		host: 'http://localhost:6001'
	});


	window.Echo.private('test-channel')
            .listen('TestEvent', (e) => {
		console.log('private-channel', e)
        })	  
```