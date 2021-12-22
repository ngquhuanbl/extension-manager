import ObserverWithConditions from "patterns/observer";
import { createAPIPath } from "UI/utils/api";
type FriendlistID = string;
export type FriendlistLoader = () => Promise<Array<FriendInfo>>;

class FriendlistManager extends ObserverWithConditions<{}> {
  private static instance: FriendlistManager | null = null;

  private loaders: Map<FriendlistID, FriendlistLoader> = new Map();


  private constructor() {
    super();
    // add default loader
    this.registerFriendlist("DEFAULT", async () => {
      const res = await fetch(createAPIPath("/contact"));
      return await res.json();
    });
  }
  static getInstance() {
    if (this.instance === null) {
      this.instance = new FriendlistManager();
    }
    return this.instance;
  }

  registerFriendlist(id: FriendlistID, loader: FriendlistLoader) {
    this.loaders.set(id, loader);

    this.notifyAll();
  }


  removeFriendlist(id: FriendlistID) {
    this.loaders.delete(id);

    this.notifyAll();
  }

  async getData() {
    let loaderFuncList: FriendlistLoader[] = [];
    this.loaders.forEach((value) => {
      loaderFuncList.push(value);
    });

    const res = await Promise.all(loaderFuncList.map((loader) => loader()));

    return res.reduce((prevValue, currentValue) => {
      console.log(currentValue);
      return [...prevValue, ...currentValue];
    }, []);
  }
}

export default FriendlistManager;
