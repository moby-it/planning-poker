
const store = {
  users: [],
  roundStatus: null,
  prevRoundStatus: null,
  votes: null,
  isRevealable() {
    return this.roundStatus === 'revealable';
  },
  revealing() {
    return this.roundStatus === 'revealing';
  },
  revealed() {
    return this.roundStatus === 'revealed';
  },
  averageStoryPoints() {
    const voteSum = Object.entries(this.votes).reduce((prev, curr) => prev + curr);
    return voteSum / Object.keys(this.votes).length;
  },
  get role() {
    const url = new URLSearchParams(window.location.search);
    return url.get('role');
  },
  get username() {
    const url = new URLSearchParams(window.location.search);
    return url.get('username');
  }
};

const proxiedStore = new Proxy(store, {
  set(target, property, value) {
    target[property] = value;
    switch (property) {
      case 'users':
        window.dispatchEvent(new Event('app:users:update'));
        break;
      case 'roundStatus':
        target.prevRoundStatus = target.roundStatus;
        window.dispatchEvent(new Event('app:roundStatus:update'));
        break;
      case 'votes':
        window.dispatchEvent(new Event('app:votes:update'));
        break;
    }
    return true;
  }
});
export default proxiedStore;