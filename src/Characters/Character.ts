import { getPlayerIndex } from "isaacscript-common";
import Loadable from "../Loadable";

export default abstract class Character implements Loadable {
  constructor(protected player: EntityPlayer) {}

  abstract Load(): void;

  abstract Unload(): void;

  protected represents(player: EntityPlayer): boolean {
    return getPlayerIndex(player) === getPlayerIndex(this.player);
  }
}
