import type { TearVariant } from "isaac-typescript-definitions";
import { CacheFlag, ModCallback, PlayerSpriteLayer, SkinColor } from "isaac-typescript-definitions";
import Mod from "../Mod";
import Character from "./Character";

const TEAR_VARIANT_BLACK_BABY_AXE =
  Isaac.GetEntityVariantByName("Black Baby Axe") as TearVariant;

export default class BlackBaby extends Character {
  private readonly player: EntityPlayer;

  constructor(player: EntityPlayer) {
    super(player);
    this.player = player;
  }

  Load(): void {
    this.AddCallbacks();
    this.AddStats();
  }

  Unload(): void {
    this.RemoveCallbacks();
  }

  private AddCallbacks() {
    Mod.AddCallback(ModCallback.POST_PLAYER_UPDATE, this.PostPlayerUpdate);
    Mod.AddCallback(ModCallback.POST_TEAR_INIT, this.PostTearInit);
    Mod.AddCallback(
      ModCallback.EVALUATE_CACHE,
      this.GiveTearArc,
      CacheFlag.RANGE,
    );
    Mod.AddCallback(
      ModCallback.EVALUATE_CACHE,
      this.GiveTearDelay,
      CacheFlag.FIRE_DELAY,
    );
    Mod.AddCallback(
      ModCallback.EVALUATE_CACHE,
      this.GiveTearDamage,
      CacheFlag.DAMAGE,
    );
  }

  private AddStats() {
    this.player.AddCacheFlags(CacheFlag.ALL);
    this.player.EvaluateItems();
  }

  private RemoveCallbacks() {
    Mod.RemoveCallback(
      ModCallback.POST_PLAYER_UPDATE,
      this.PostPlayerUpdate,
    );
    Mod.RemoveCallback(ModCallback.POST_TEAR_INIT, this.PostTearInit);
    Mod.RemoveCallback(ModCallback.EVALUATE_CACHE, this.GiveTearArc);
    Mod.RemoveCallback(ModCallback.EVALUATE_CACHE, this.GiveTearDelay);
    Mod.RemoveCallback(ModCallback.EVALUATE_CACHE, this.GiveTearDamage);
  }

  private readonly PostPlayerUpdate = (player: EntityPlayer) => {
    if (!this.Represents(player)) {return;}

    this.ResetAppearance();
  };

  private ResetAppearance() {
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

  private readonly PostTearInit = (tear: EntityTear) => {
    const spawner = tear.SpawnerEntity;
    if (!spawner) {return;}

    const spawnerPlayer = spawner.ToPlayer();
    if (!spawnerPlayer || !this.Represents(spawnerPlayer)) {return;}

    tear.ChangeVariant(TEAR_VARIANT_BLACK_BABY_AXE);
  };

  private readonly GiveTearArc = (player: EntityPlayer) => {
    print("tear arc added");
    player.TearFallingAcceleration++;
    // player.TearFallingSpeed = 1;
  };

  private readonly GiveTearDelay = (player: EntityPlayer) => {
    // player.FireDelay -= 1;
    player.MaxFireDelay += 4;
  };

  private readonly GiveTearDamage = (player: EntityPlayer) => {
    player.Damage += 1.5;
  };
}
