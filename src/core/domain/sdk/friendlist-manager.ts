import { createStandaloneToast } from "@chakra-ui/toast";
import ObserverWithConditions from "patterns/observer";
import { createAPIPath } from "UI/utils/api";
import ExtensionManager from "../extension-manager";

const toast = createStandaloneToast();

type FriendlistID = string;
export type FriendlistLoader = () => Promise<Array<FriendInfo>>;

export interface FriendlistLoaderData {
  extensionID?: ExtensionID;
  loader: FriendlistLoader;
}

class FriendlistManager extends ObserverWithConditions<{}> {
  private static instance: FriendlistManager | null = null;

  private loaders: Map<FriendlistID, FriendlistLoaderData> = new Map();

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

  registerFriendlist(
    id: FriendlistID,
    loader: FriendlistLoader,
    extensionID?: ExtensionID
  ) {
    this.loaders.set(id, { loader, extensionID });

    this.notifyAll();
  }

  removeFriendlist(id: FriendlistID) {
    this.loaders.delete(id);

    this.notifyAll();
  }

  async getData() {
    let loaderFuncList: FriendlistLoader[] = [];
    this.loaders.forEach(({ loader, extensionID }) => {
      if (extensionID) {
        try {
          const extensionInfo = ExtensionManager.getExtensionInfo(extensionID);

          if (!extensionInfo)
            throw new Error(
              `Non-existed extension matched the ID of value: ${extensionID}`
            );

          const { status } = extensionInfo;
          if (status === "ENABLED") loaderFuncList.push(loader);
        } catch (e: any) {
          const { message } = e;
          toast({
            title: message,
            status: "error",
            isClosable: true,
          });
        }
      } else loaderFuncList.push(loader);
    });

    const res = await Promise.all(loaderFuncList.map((loader) => loader()));

    return res.reduce((prevValue, currentValue) => {
      return [...prevValue, ...currentValue];
    }, []);
  }
}

export default FriendlistManager;
