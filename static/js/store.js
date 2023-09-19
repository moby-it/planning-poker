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
    if (property === 'users') {
      if (currentUserChangedRole(store.users, value)) {
        const newUser = value.find(u => u.username === store.username);
        const role = newUser.isVoter ? 'voter' : 'spectator';
        history.pushState(null, null, `${window.location.pathname}?username=${newUser.username}&role=${role}`);
      }
    }
    if (property === 'roundStatus') {
      target.prevRoundStatus = target.roundStatus;
    }
    target[property] = value;
    window.dispatchEvent(new Event('planningupdate'));
    return true;
  }
});
function currentUserChangedRole(oldUsers, users) {
  if (!oldUsers?.length || !users?.length) return false;
  const oldUser = oldUsers.find(u => u.username === store.username);
  const newUser = users.find(u => u.username === store.username);
  return oldUser.isVoter !== newUser.isVoter;
}
export default proxiedStore;