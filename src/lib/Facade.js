class Facade {
  constructor(public, ...args) {
    const implementation = new LimelightImplementation(target, options);

    api.forEach((prop) => {
      this[prop] = implementation[prop];
    });
  }
}