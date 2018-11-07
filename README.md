# d.messenger
Distributed messenger.

This is a messenger that is able to communicate without using a server connection. Messages will be send over IOTA Tangle and WebRtc is using to update online status. This project was build during a university task and is a proof of concept for blockchain technologies and peer2peer communication.

Feel free to fork the project or contribute to this project to make it usable as opensource independently messenger.

Right now you should be able to send and resive messages. Check the feature list or simply clone the porject and try it your self. **Messages will not be encripted, every one can read your messages - feature need to be implemented**

## Features
- [x] send and store messages in the tangle
- [x] get all chats from seed
- [x] contact request
- [x] contact approve
- [x] online status
- [x] group chat
- [ ] send messages if both users are online over webRTC
- [x] login with different seeds
- [ ] local PoW (switch between local and remote PoW)
- [ ] use local browser storage
- [ ] ....and a lot more

### following NFR are on the task list
- [ ] implement a suitable ui
- [ ] encryption 
- [ ] security audit
- [ ] handle IOTA snapthots

## Installation

### Prerequisites
Node.js (8+)

### Instructions
1. Clone this repo
```
git clone https://github.com/dvincenz/d.messenger.git
```

2. Go to the d.messenger directory
```
cd d.messenger
```

3. Install the shared dependencies
```
npm install
```

4. Run the d.messenger
```
npm start
```

5. Check your browser on Port 3000

## License
Copyright 2018 @dvincenz, Dumeni Vincenz

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
