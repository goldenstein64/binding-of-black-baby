import type Loadable from "../Loadable";

export default abstract class Character implements Loadable {
  protected readonly owner: Entity;

  constructor(owner: Entity) {
    this.owner = owner;
  }

  abstract Load(): void;

  abstract Unload(): void;

  protected Represents(entity: Entity): boolean {
    return GetPtrHash(entity) === GetPtrHash(this.owner);
  }
}
