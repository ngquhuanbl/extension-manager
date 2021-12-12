class Singleton {
  private static instance: Singleton | null = null;

  static getInstance() {
    if (this.instance === null) {
      this.instance = new Singleton();
    }
    return this.instance;
  }
}

export default Singleton;
