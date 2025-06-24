import type { PlayerType } from "isaac-typescript-definitions";
import { ModCallback } from "isaac-typescript-definitions";
import { getPlayerIndex, log, ModCallbackCustom } from "isaacscript-common";
import { BlackBaby } from "./Characters/BlackBaby";
import type { Character } from "./Characters/Character";
import { Mod } from "./Mod";
import * as BlackBabyAxe from "./Tears/BlackBabyAxe";

type PlayerIndex = int;

const PLAYER_TYPE_BLACK_BABY = Isaac.GetPlayerTypeByName("Black Baby", false);
const PLAYER_TYPE_TAINTED_BLACK_BABY = Isaac.GetPlayerTypeByName(
  "Black Baby",
  true,
);

class BindingOfBlackBaby {
  private readonly evalPlayerTypes = new Map<PlayerIndex, PlayerType>();

  private readonly characters = new Map<PlayerIndex, Character>();

  addCallbacks() {
    Mod.AddCallback(ModCallback.POST_PLAYER_INIT, this.postPlayerInit);
    Mod.AddCallbackCustom(
      ModCallbackCustom.POST_PLAYER_UPDATE_REORDERED,
      this.postPlayerUpdate,
    );
    Mod.AddCallbackCustom(
      ModCallbackCustom.POST_GAME_STARTED_REORDERED,
      this.postGameStarted,
      undefined,
    );
    Mod.AddCallback(ModCallback.POST_GAME_END, this.postGameEnd);

    BlackBabyAxe.load();
  }

  private readonly postPlayerInit = (player: EntityPlayer): void => {
    this.loadCharacter(player);
  };

  private readonly postPlayerUpdate = (player: EntityPlayer) => {
    this.evaluatePlayerType(player);
  };

  private readonly postGameStarted = () => {
    for (const char of this.characters.values()) {
      char.unload();
    }
    this.characters.clear();

    this.evalPlayerTypes.clear();
  };

  private readonly postGameEnd = () => {
    for (const char of this.characters.values()) {
      char.unload();
    }
    this.characters.clear();

    this.evalPlayerTypes.clear();
  };

  private evaluatePlayerType(player: EntityPlayer): void {
    const oldType = this.evalPlayerTypes.get(getPlayerIndex(player));
    if (oldType === player.GetPlayerType()) {
      return;
    }

    this.loadCharacter(player);
  }

  private loadCharacter(player: EntityPlayer): void {
    const playerType = player.GetPlayerType();

    this.evalPlayerTypes.set(getPlayerIndex(player), playerType);

    // Unload the old character in case they got morphed from another modded character.
    const oldCharacter = this.characters.get(getPlayerIndex(player));
    if (oldCharacter) {
      oldCharacter.unload();
      this.characters.delete(getPlayerIndex(player));
    }

    // Load in the new character.
    let newCharacter: Character | undefined;
    switch (playerType) {
      case PLAYER_TYPE_BLACK_BABY:
      case PLAYER_TYPE_TAINTED_BLACK_BABY: {
        newCharacter = new BlackBaby(player);
        break;
      }

      default: {
        break;
      }
    }

    if (newCharacter) {
      newCharacter.load();
      this.characters.set(getPlayerIndex(player), newCharacter);
    }
  }
}

export function main(): void {
  const bindingOfBlackBaby = new BindingOfBlackBaby();
  bindingOfBlackBaby.addCallbacks();
  log(`${Mod.Name} initialized.`);
}
