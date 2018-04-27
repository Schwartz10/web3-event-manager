import EventEmitter from 'events';
import Web3 from 'web3'

export default class web3Manager extends EventEmitter {
  constructor(interval, requiredNetwork, localProvider){
    super();
    this.web3 = null;
    this.account = null;
    this.validNetwork = false;
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
  hasWeb3(callback){
    // registers the listener for hasWeb3 and provides callback to tell class what to do when hasWeb3 event fires
    this.on('hasWeb3', (web3) => callback(web3));
  }
  loggedInToNewAccount(callback){
    this.on('loggedInToNewAccount', (account) => callback(account));
  }
  onValidNetwork(callback){
    this.on('onValidNetwork', (onValidNetwork) => callback(this.onValidNetwork));
  }
  async fetchWeb3Data (){
    const web3 = this.getWeb3FromWindow();
    /* --  we only dispatch actions if anything important CHANGED -- */

    if (web3){
      // dispatches an action if a web3 instance was recently created
      if (!this.web3) {
        this.web3 = web3;
        this.emit('hasWeb3', web3);
      }

      /* ---------- ensures the user is on the right network ----------- */
      const currentNetworkId = Number(web3.version.network);

      // if component received a validNetwork prop, we make sure the user is on the valid network
      const onCorrectNetwork = this.requiredNetwork ?
      this.requiredNetwork === currentNetworkId : true;

      // valid network refers to the previous bool value kept on redux store
      const changedToValidNetwork = onCorrectNetwork && !this.validNetwork;

      if (changedToValidNetwork) {
        this.validNetwork = true;
        this.emit('onValidNetwork', true);
      }

      /* ------------- checks for unlocked account change -------------- */
      const [ account ] = await web3.eth.getAccounts();
      const recentlyChangedAccount = account && account !== this.account;
      const recentlyLoggedOut = !account && this.account;

      // if an important account changed, dispatch the appropriate action
      if (recentlyChangedAccount || recentlyLoggedOut) {
        this.account = account;
        this.emit('loggedInToNewAccount', account);
      }
    }
  }
  getWeb3FromWindow(){
    let { web3 } = window;
    if (this.localProvider) {
      const provider = new Web3.providers.HttpProvider(this.localProvider);
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
