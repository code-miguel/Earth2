const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;

// Connect to mongo
mongo.connect('mongodb://127.0.0.1/mongochat', (err, db) => {
	if(err) {
		throw err;
	}


	console.log('Hey Miguel, MongoDB connected Yay!!');

	// Connect to Socket.io
	client.on('connection', (socket) => {
		//we want to create a collection for mongoDB called "chat"
		let chat = db.collection('chats');

		//Create function to send status
		sendStatus = (s) => {
			socket.emit('status', s);  //pass something from server to client
		}

		//Get chats from mongo collection
		chat.find().limit(100).sort({_id:1}).toArray((err, res) => {
			if(err){
				throw err;
			}

			//Emit the message
			socket.emit('output', res); //res is result


		});

		// Handle imput events
		socket.on('input', (data) => {
			let name = data.name;
			let message = data.message;

			//Check for name and message
			if(name == '' || message == ''){
				//send error status
				sendStatus('Please enter a name and message');
			} else {
				// insert message
				chat.insert({name: name, message: message}, () => {
					client.emit('output', [data]);	

					// Send status object
					sendStatus({  //pass in object
						message: "Message sent",
						clear: true
					});

				});
			}
		});

		// Handle clear
		socket.on('clear', (data) =>{
			//remove all chats from collection
			chat.remove({}, () => {
				//Emit cleard
				socket.emit('cleared');
			});
		});

	});


});
