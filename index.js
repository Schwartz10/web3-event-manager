import EventEmitter from 'events';
import { getWeb3FromWindow } from './utils';

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
  async fetchWeb3Data (){
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
      const currentNetworkId = Number(web3.version.network);

      // if component received a validNetwork prop, we make sure the user is on the valid network
      const onCorrectNetwork = this.requiredNetwork ?
      this.requiredNetwork === currentNetworkId : true;

      // valid network refers to the previous bool value kept on redux store
      const changedToValidNetwork = onCorrectNetwork && !this.validNetwork;

      if (changedToValidNetwork) {
        this.validNetwork = true;
        this.emit('networkChange', true);
      }

      /* ------------- checks for unlocked account change -------------- */
      const [ account ] = await web3.eth.getAccounts();
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
    }
  }
}
