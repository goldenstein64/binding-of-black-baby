import { getPlayerIndex, log, ModCallbackCustom } from "isaacscript-common";
import type { PlayerType } from "isaac-typescript-definitions";
import { ModCallback } from "isaac-typescript-definitions";
import BlackBaby from "./Characters/BlackBaby";
import type Character from "./Characters/Character";
import Mod from "./Mod";
import BlackBabyAxe from "./Tears/BlackBabyAxe";

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
    Mod.AddCallback(ModCallback.POST_PLAYER_INIT, (player) => {
      this.loadCharacter(player);
    });
    Mod.AddCallbackCustom(ModCallbackCustom.POST_PLAYER_UPDATE_REORDERED, (player) => {
      this.evaluatePlayerType(player);
    })
    Mod.AddCallbackCustom(ModCallbackCustom.POST_GAME_STARTED_REORDERED, () => {
    for (const char of this.characters.values()) {
      char.Unload();
    }
    this.characters.clear();

    this.evalPlayerTypes.clear();
  }, undefined);
    Mod.AddCallback(ModCallback.POST_GAME_END, () => {
      for (const char of this.characters.values()) {
        char.Unload();
      }
      this.characters.clear();

      this.evalPlayerTypes.clear();
    });

    BlackBabyAxe.StaticLoad();
  }

  private readonly postPlayerInit = (player: EntityPlayer): void => {
    this.loadCharacter(player);
  };

  private evaluatePlayerType(player: EntityPlayer): void {
    const oldType = this.evalPlayerTypes.get(getPlayerIndex(player));
    if (oldType === player.GetPlayerType()) {return;}

    this.loadCharacter(player);
  }

  private loadCharacter(player: EntityPlayer): void {
    const playerType = player.GetPlayerType();

    this.evalPlayerTypes.set(getPlayerIndex(player), playerType);

    // Unload the old character in case they got morphed from another modded character.
    const oldCharacter = this.characters.get(getPlayerIndex(player));
    if (oldCharacter) {
      oldCharacter.Unload();
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

      default: { break; }
    }

    if (newCharacter) {
      newCharacter.Load();
      this.characters.set(getPlayerIndex(player), newCharacter);
    }
  }
}

export function main(): void {
  const bindingOfBlackBaby = new BindingOfBlackBaby();
  bindingOfBlackBaby.addCallbacks();
  log(`${Mod.Name} initialized.`);
}
