import { getPlayerIndex, printConsole } from "isaacscript-common";
import BlackBaby from "./Characters/BlackBaby";
import Character from "./Characters/Character";
import Mod from "./Mod";
import BlackBabyAxe from "./Tears/BlackBabyAxe";

type PlayerIndex = int;

const PLAYER_TYPE_BLACK_BABY = Isaac.GetPlayerTypeByName("Black Baby", false);
const PLAYER_TYPE_TAINTED_BLACK_BABY = Isaac.GetPlayerTypeByName(
  "Black Baby",
  true,
);

class BindingOfBlackBaby {
  private evalPlayerTypes = new Map<PlayerIndex, PlayerType>();

  private characters = new Map<PlayerIndex, Character>();

  constructor() {}

  Init() {
    this.AddCallbacks();

    printConsole(`${Mod.Name} initialized.`);
  }

  private AddCallbacks() {
    Mod.AddCallback(ModCallbacks.MC_POST_PLAYER_INIT, this.PostPlayerInit);
    Mod.AddCallback(ModCallbacks.MC_POST_PLAYER_UPDATE, this.PostPlayerUpdate);
    Mod.AddCallback(ModCallbacks.MC_POST_GAME_END, this.PostGameEnd);

    BlackBabyAxe.StaticLoad();
  }

  private PostPlayerInit = (player: EntityPlayer): void => {
    this.LoadCharacter(player);
  };

  private PostPlayerUpdate = (player: EntityPlayer): void => {
    this.evaluatePlayerType(player);
  };

  private evaluatePlayerType(player: EntityPlayer): void {
    let oldType = this.evalPlayerTypes.get(getPlayerIndex(player));
    if (oldType === player.GetPlayerType()) return;

    this.LoadCharacter(player);
  }

  private LoadCharacter(player: EntityPlayer): void {
    let playerType = player.GetPlayerType();

    this.evalPlayerTypes.set(getPlayerIndex(player), playerType);

    // unload the old character in case they got morphed from another modded
    // character
    let oldCharacter = this.characters.get(getPlayerIndex(player));
    if (oldCharacter) {
      oldCharacter.Unload();
      this.characters.delete(getPlayerIndex(player));
    }

    // load in the new character
    let newCharacter: Character | undefined = undefined;
    switch (playerType) {
      case PLAYER_TYPE_BLACK_BABY:
      case PLAYER_TYPE_TAINTED_BLACK_BABY:
        newCharacter = new BlackBaby(player);
    }

    if (newCharacter) {
      newCharacter.Load();
      this.characters.set(getPlayerIndex(player), newCharacter);
    }
  }

  private PostGameEnd = () => {
    for (let char of this.characters.values()) {
      char.Unload();
    }
    this.characters.clear();

    this.evalPlayerTypes.clear();
  };
}

export function main(): void {
  const bindingOfBlackBaby = new BindingOfBlackBaby();

  bindingOfBlackBaby.Init();
}
