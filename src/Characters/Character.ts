import type { Loadable } from "../Loadable";

export abstract class Character implements Loadable {
  protected readonly owner: Entity;

  constructor(owner: Entity) {
    this.owner = owner;
  }

  abstract load(): void;

  abstract unload(): void;

  protected represents(entity: Entity): boolean {
    return GetPtrHash(entity) === GetPtrHash(this.owner);
  }
}
