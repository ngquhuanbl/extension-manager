import Observer from "./observer";

export const UI_POSITION_TOOLBAR = 'UI_POSITION/TOOLBAR';
export const UI_POSITION_CONTENT = 'UI_POSITION/CONTENT';

export type UIPosition = typeof UI_POSITION_TOOLBAR | typeof UI_POSITION_CONTENT;


/**
 * Manage all components by their locations in UI
 */
 class UIManager extends Observer {
  static instance: UIManager | null =  null;
  /**
   * pos: A hash table keeping track of components located at observed UI positions.
   * Component ID are used to qualify a component
   */
  private pos: Map<UIPosition, Array<ComponentID>>;


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
   * @param uiPosition The UI position string
   * @returns {Array<string>} IDs of components located at the given position
   */
  getComponentIDsByPosition(uiPosition: UIPosition) {
    return this.pos.get(uiPosition);
  }

  /**
   * Register a component to a UI position using its ID
   * @param uiPosition The UI position string
   * @param id The component ID
   */
  insertItem(uiPosition: UIPosition, id: ComponentID) {
    const IDList = this.pos.get(uiPosition) || [];

    if (IDList.includes(id)) return;

    IDList.push(id);

    this.pos.set(uiPosition, IDList);

    // Notify listeners
    this.notify();
  }

  /**
   * Cancl registration of a component located at a UI position using its ID
   * @param uiPosition The UI position string
   * @param id The component ID
   */
  removeItem(uiPosition: UIPosition, id: ComponentID) {
    let IDList = this.pos.get(uiPosition) || [];

    if (!IDList.includes(id)) return;

    IDList = IDList.filter((currentId) => currentId !== id);

    this.pos.set(uiPosition, IDList);

    // Notify listeners
    this.notify();
  }
}

export default UIManager
