A class that extends node.js `events` to create custom event listeners for apps relying on web3

github: https://github.com/Schwartz10/web3-event-manager

### Configuration:

`npm install web3-event-manager`

Wherever you require web3-event-manager, create a new instance of the class:

```js
import Web3Manager from 'web3-event-manager'
const web3EventManager = new Web3Manager()
```

When you want the web3EventManager to start listening for changes, run:

`web3EventManager.start()`

If you want the web3EventManager to stop listening for changes, run:

`web3EventManager.stop()`

### Events to listen for:

Currently, the web3EventManager will fire callbacks, passing this data object when it hears change events.
Further descriptions can be found below the table.

| Event       | Data          |
|:------------|--------------|
|`web3Change` | `{ data: { hasWeb3: bool, web3: web3Obj } }` |
|`accountChange` | `{ data: { unlockedAccount: bool, account: address or null } }` |
|`networkChange` | `{ data: { currentNetworkId: num, onCorrectNetwork: bool } }` |

_web3Change:_
`web3EventManager.on('web3Change', callback)`

Will fire the callback with a boolean if the user has a web3 object in their browser. The web3 object is accessible via the data object.
To stop listening, call:

`web3EventManager.removeListener('web3Change', callback)`

_accountChange:_
`web3EventManager.on('accountChange', callback)`

Will fire the callback with a boolean if the user has an unlocked ethereum account. The unlocked account's address is also provided in the data object.
To stop listening, call:

`web3EventManager.removeListener('accountChange', callback)`

_networkChange:_
`web3EventManager.on('networkChange', callback)`

Will fire the callback with a number representing the networkId of the network protocol the web3 object corresponds to. If the Web3EventManager was constructed with a required network (see Web3EventManager arguments), the data returned will provide a boolean if the user is on the required network (and true if no required network was provided).
To stop listening, call:

`web3EventManager.removeListener('networkChange', callback)`

### Instantiating the Web3Manager with arguments:

The Web3Manager currently takes 3 optional arguments:<br><br>
(1) interval (number) - instructs the Web3Manager to check for updates every (number) of milliseconds<br>
(2) requiredNetwork (number) - tells the Web3Manager that the user must be connected to a requiredNetwork<br>
(3) localProvider (string (localhost...)) - instructs the Web3Manager to construct the web3 object out of the localProvider, instead of the current provider injected into the browser by metamask, mist, or other related services.<br>

If you wish to use these, simply call:

`const Web3EventManager = new Web3Manager(interval, requiredNetwork, localProvider)`


