const Web3 = require( 'web3');

module.exports = {getWeb3FromWindow: function getWeb3FromWindow(localProvider){
  let { web3 } = window;
  if (localProvider) {
    const provider = new Web3.providers.HttpProvider(localProvider);
    web3 = new Web3(provider);
    return web3;
  }
  else if (typeof web3 !== 'undefined') {
    // create new web3 instance with currentProvider
    web3 = new Web3(web3.currentProvider);
    return web3;
  }
  // if metamask did not inject web3 and we have no localProvider
  else {
    return null;
  }
}
}
