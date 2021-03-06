const EventEmitter = require('events');
const { getWeb3FromWindow } = require('./utils');

module.exports = class web3Manager extends EventEmitter {
  constructor(interval, requiredNetwork, localProvider){
    super();
    this.web3 = null;
    this.account = null;
    this.currentNetworkId = null;
    this.onCorrectNetwork = false;
    this.requiredNetwork = requiredNetwork || null;
    this.interval = interval || 500;
    this.localProvider = localProvider || null;
    this.intervalID = null;
  }
  start(){
    this.intervalID = setInterval(this.fetchWeb3Data.bind(this), this.interval);
  }
  stop(){
    clearInterval(this.intervalID);
  }
  fetchWeb3Data (){
    const web3 = getWeb3FromWindow(this.localProvider);
    /* --  we only dispatch actions if anything important CHANGED -- */

    if (web3){
      // dispatches an action if a web3 instance was recently created
      if (!this.web3) {
        this.web3 = web3;
        const eventData = {
          data: { hasWeb3: true, web3 }
        }
        this.emit('web3Change', eventData);
      }

      /* ---------- ensures the user is on the right network ----------- */
      let currentNetworkId;
      return web3.eth.net.getId().then(id => {
        currentNetworkId = id
        // if component received a validNetwork prop, we make sure the user is on the valid network
        const onCorrectNetwork = this.requiredNetwork ?
        this.requiredNetwork === currentNetworkId : true;

        // valid network refers to the previous bool value kept on redux store
        const changedNetwork = currentNetworkId !== this.currentNetworkId;

        if (changedNetwork) {
          this.onCorrectNetwork = onCorrectNetwork;
          this.currentNetworkId = currentNetworkId;
          const eventData = {
            data: { currentNetworkId, onCorrectNetwork }
          }
          this.emit('networkChange', eventData);
        }

        return web3.eth.getAccounts();
      })
      .then(([ account ]) => {
        /* ------------- checks for unlocked account change -------------- */
        const unlockedAccount = !!account;
        const recentlyChangedAccount = account && account !== this.account;
        const recentlyLoggedOut = !account && this.account;

        // if an important account changed, dispatch the appropriate action
        if (recentlyChangedAccount || recentlyLoggedOut) {
          this.account = account;
          const eventData = {
            data: { unlockedAccount, account }
          }
          this.emit('accountChange', eventData);
        }
      })
    }
    else {
      // return a promise so we don't have errors where its required
      return Promise.resolve(undefined)
    }
  }
}
