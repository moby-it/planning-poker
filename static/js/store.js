const store = {
  users: [],
  roundStatus: null,
  votes: [],
  isRevealable() {
    return this.roundStatus === 'revealable';
  },
  revealing() {
    return this.roundStatus === 'revealing';
  },
  revealed() {
    return this.roundStatus === 'revealed';
  }
};
const proxiedStore = new Proxy(store, {
  set(target, property, value) {
    console.log('proxy set');
    target[property] = value;
    if (property === 'users')
      window.dispatchEvent(new Event('planningupdate'));
    return true;
  }
});
export default proxiedStore;