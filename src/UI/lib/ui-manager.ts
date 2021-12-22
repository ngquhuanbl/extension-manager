import ObserverWithConditions, { Conditions } from "../../patterns/observer";

interface PositionComponent {
  id: ComponentID;
  status: PositionComponentStatus;
}

interface UIConditions extends Conditions {
  position: Position;
}

/**
 * Manage all components by their locations in UI
 */
 class UIManager extends ObserverWithConditions<UIConditions> {
  static instance: UIManager | null =  null;
  /**
   * pos: A hash table keeping track of components located at observed UI positions.
   * Component ID are used to represent a component
   */
  private pos: Map<Position, Array<PositionComponent>>;


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
   * @returns Position components located at the given position
   */
  getPositionComponentByPosition(position: Position) {
    return this.pos.get(position) || null;
  }

  /**
   * Register a component to a UI position using its ID
   * @param position The UI position string
   * @param componentID The component ID
   */
  insertItem(position: Position, componentID: ComponentID, initialStatus: PositionComponentStatus = 'ACTIVE') {
    const componentList = this.pos.get(position) || [];

    const hasComponentAlreadyInserted = componentList.findIndex(({ id }) => id === componentID) !== -1;

    if (hasComponentAlreadyInserted) return;

    componentList.push({
      id: componentID,
      status: initialStatus
    })

    this.pos.set(position, componentList);

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
    let componentList = this.pos.get(position);

    if (!componentList) return;

    const hasComponentAlreadyInserted = componentList.findIndex(({ id }) => id === componentID) !== -1;

    if (!hasComponentAlreadyInserted) return;

    componentList = componentList.filter(({ id }) => id !== componentID);

    this.pos.set(position, componentList);

    // Notify subscribers
    const conditions: Conditions = {
      position,
    }
    this.notify(conditions);
  }

  setComponentStatus(position: Position, componentID: ComponentID, status: PositionComponentStatus) {
    const componentList = this.pos.get(position);

    if (!componentList) return;

    const componentIndex = componentList.findIndex(({ id }) => id === componentID);
    const hasComponentAlreadyInserted = componentIndex !== -1;

    if (!hasComponentAlreadyInserted) return;

    componentList[componentIndex].status = status;

    this.pos.set(position, componentList);

    // Notify subscribers
    const conditions: Conditions = {
      position,
    }
    this.notify(conditions);
  }
}

export default UIManager
