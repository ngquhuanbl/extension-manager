import Observer, { Conditions } from "../../patterns/observer";

type Position = UIPosition;

interface UIConditions extends Conditions {
  position: Position;
}

/**
 * Manage all components by their locations in UI
 */
 class UIManager extends Observer<UIConditions> {
  static instance: UIManager | null =  null;
  /**
   * pos: A hash table keeping track of components located at observed UI positions.
   * Component ID are used to represent a component
   */
  private pos: Map<Position, Array<ComponentID>>;


  private constructor() {
    super();
    this.pos = new Map();
  }

  static getInstance() {
    if (this.instance === null) {
      this.instance = new UIManager();
    }

    return this.instance;
  }

  /**
   * Return IDs of components located at the given position
   * @param position The UI position string
   * @returns {Array<string>} IDs of components located at the given position
   */
  getComponentIDsByPosition(position: Position) {
    return this.pos.get(position) || null;
  }

  /**
   * Register a component to a UI position using its ID
   * @param position The UI position string
   * @param componentID The component ID
   */
  insertItem(position: Position, componentID: ComponentID) {
    const IDList = this.pos.get(position) || [];

    if (IDList.includes(componentID)) return;

    IDList.push(componentID);

    this.pos.set(position, IDList);

    // Notify subscribers
    const conditions: Conditions = {
      position,
    }
    this.notify(conditions);
  }

  /**
   * Cancl registration of a component located at a UI position using its ID
   * @param position The UI position string
   * @param componentID The component ID
   */
  removeItem(position: Position, componentID: ComponentID) {
    let IDList = this.pos.get(position) || [];

    if (!IDList.includes(componentID)) return;

    IDList = IDList.filter((currentId) => currentId !== componentID);

    this.pos.set(position, IDList);

    // Notify subscribers
    const conditions: Conditions = {
      position,
    }
    this.notify(conditions);
  }
}

export default UIManager
