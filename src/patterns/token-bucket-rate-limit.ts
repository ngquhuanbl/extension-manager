interface TokenState {
  tokenCount: number;
  timestamp: number;
}

type StateKey = string;

class TokenStateDB {
  private state = new Map<StateKey, TokenState>();

  getState(key: StateKey) {
    return this.state.get(key);
  }

  updateState(
    key: StateKey,
    oldState: TokenState | undefined,
    newState: TokenState
  ) {
    if (this.state.get(key) !== oldState) {
      throw new Error("Attempted to take multiple tokens simultaneously");
    }
    this.state.set(key, newState);
  }
}

export interface BucketOptions {
  interval: number;
  bucketCapacity: number;
}

class TokenBucketRateLimit {
  private static instance: TokenBucketRateLimit | null = null;

  private db = new TokenStateDB();

  static getInstance() {
    if (this.instance === null) {
      this.instance = new TokenBucketRateLimit();
    }
    return this.instance;
  }

  static getCurrentTokenState(
    oldState: TokenState,
    options: BucketOptions,
    now: number
  ) {
    const { tokenCount: oldTokenCount, timestamp: oldTimestamp } = oldState;
    const { interval, bucketCapacity } = options;
    const increase = Math.floor((now - oldTimestamp) / interval);
    const newTokenCount = Math.min(oldTokenCount + increase, bucketCapacity);
    const newTimestamp =
      newTokenCount < bucketCapacity ? oldTimestamp + interval * increase : now;
    return { tokenCount: newTokenCount, timestamp: newTimestamp };
  }

  static getTokenStateAfterTakingToken(
    oldState: TokenState | undefined,
    options: BucketOptions,
    now: number
  ) {
    const { tokenCount, timestamp } = oldState
      ? TokenBucketRateLimit.getCurrentTokenState(oldState, options, now)
      : { tokenCount: options.bucketCapacity, timestamp: now };
    if (tokenCount > 0 && now >= timestamp) {
      // if there is a token available and the timestamp is in the past
      // take the token and leave the timestamp un-changed
      return { tokenCount: tokenCount - 1, timestamp };
    }
    // update the timestamp to a time when a token will be available, leaving
    // the token count at 0
    return { tokenCount, timestamp: timestamp + options.interval };
  }

  async takeToken(
    key: StateKey,
    options: BucketOptions,
    successTokenCallback: GenericFunction,
    preRenewTokenCallback: GenericFunction,
    postRenewTokenCallback: GenericFunction
  ) {
    const now = Date.now();
    const oldState = this.db.getState(key);
    const newState = TokenBucketRateLimit.getTokenStateAfterTakingToken(
      oldState,
      options,
      now
    );
    // N.B. updateState should throw if current state
    // doesn't match oldState to avoid concurrent token usage
    this.db.updateState(key, oldState, newState);
    if (newState.timestamp - now > 0) {
      // Push to rate limit queue
      preRenewTokenCallback();
      await new Promise<void>((resolve) =>
        setTimeout(() => {
          // Push all rate limit queue to command queue
          postRenewTokenCallback();
          resolve();
        }, newState.timestamp - now)
      );
    } else {
      successTokenCallback();
    }
  }
}

export default TokenBucketRateLimit;
