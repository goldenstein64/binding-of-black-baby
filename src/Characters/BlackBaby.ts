import type { TearVariant } from "isaac-typescript-definitions";
import {
  CacheFlag,
  ModCallback,
  PlayerSpriteLayer,
  SkinColor,
} from "isaac-typescript-definitions";
import { ModCallbackCustom } from "isaacscript-common";
import { Mod } from "../Mod";
import { Character } from "./Character";

const TEAR_VARIANT_BLACK_BABY_AXE = Isaac.GetEntityVariantByName(
  "Black Baby Axe",
) as TearVariant;

export class BlackBaby extends Character {
  private readonly player: EntityPlayer;

  constructor(player: EntityPlayer) {
    super(player);
    this.player = player;
  }

  load(): void {
    this.addCallbacks();
    this.addStats();
  }

  unload(): void {
    this.removeCallbacks();
  }

  private addCallbacks() {
    Mod.AddCallbackCustom(
      ModCallbackCustom.POST_PLAYER_UPDATE_REORDERED,
      this.postPlayerUpdate,
    );
    Mod.AddCallback(ModCallback.POST_TEAR_INIT, this.postTearInit);
    Mod.AddCallback(
      ModCallback.EVALUATE_CACHE,
      this.giveTearArc,
      CacheFlag.RANGE,
    );
    Mod.AddCallback(
      ModCallback.EVALUATE_CACHE,
      this.giveTearDelay,
      CacheFlag.FIRE_DELAY,
    );
    Mod.AddCallback(
      ModCallback.EVALUATE_CACHE,
      this.giveTearDamage,
      CacheFlag.DAMAGE,
    );
  }

  private addStats() {
    this.player.AddCacheFlags(CacheFlag.ALL);
    this.player.EvaluateItems();
  }

  private removeCallbacks() {
    Mod.RemoveCallbackCustom(
      ModCallbackCustom.POST_PLAYER_UPDATE_REORDERED,
      this.postPlayerUpdate,
    );
    Mod.RemoveCallback(ModCallback.POST_TEAR_INIT, this.postTearInit);
    Mod.RemoveCallback(ModCallback.EVALUATE_CACHE, this.giveTearArc);
    Mod.RemoveCallback(ModCallback.EVALUATE_CACHE, this.giveTearDelay);
    Mod.RemoveCallback(ModCallback.EVALUATE_CACHE, this.giveTearDamage);
  }

  private readonly postPlayerUpdate = (player: EntityPlayer) => {
    if (!this.represents(player)) {
      return;
    }

    this.resetAppearance();
  };

  private resetAppearance() {
    this.player.ClearCostumes();

    const playerSprite = this.owner.GetSprite();
    if (this.player.GetBodyColor() !== SkinColor.WHITE) {
      playerSprite.ReplaceSpritesheet(
        PlayerSpriteLayer.BODY,
        "gfx/characters/costumes/Character_BlackBaby.png",
      );
      playerSprite.LoadGraphics();
    }

    if (this.player.GetHeadColor() !== SkinColor.WHITE) {
      playerSprite.ReplaceSpritesheet(
        PlayerSpriteLayer.HEAD,
        "gfx/characters/costumes/Character_BlackBaby.png",
      );
      playerSprite.LoadGraphics();
    }
  }

  private readonly postTearInit = (tear: EntityTear) => {
    const spawner = tear.SpawnerEntity;
    if (!spawner) {
      return;
    }

    const spawnerPlayer = spawner.ToPlayer();
    if (!spawnerPlayer || !this.represents(spawnerPlayer)) {
      return;
    }

    tear.ChangeVariant(TEAR_VARIANT_BLACK_BABY_AXE);
  };

  private readonly giveTearArc = (player: EntityPlayer) => {
    print("tear arc added");
    player.TearFallingAcceleration++;
    // player.TearFallingSpeed = 1;
  };

  private readonly giveTearDelay = (player: EntityPlayer) => {
    // player.FireDelay -= 1;
    player.MaxFireDelay += 4;
  };

  private readonly giveTearDamage = (player: EntityPlayer) => {
    player.Damage += 1.5;
  };
}
