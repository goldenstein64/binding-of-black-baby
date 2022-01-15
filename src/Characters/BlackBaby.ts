import { getPlayerIndex } from "isaacscript-common";
import Mod from "../Mod";
import Character from "./Character";

const GAME = Game();

const chargeSprite = Sprite();
chargeSprite.Load("gfx/chargebar.anm2", true);
chargeSprite.LoadGraphics();

const TEAR_VARIANT_BLACK_BABY_AXE =
  Isaac.GetEntityVariantByName("Black Baby Axe");

function toChargingFrame(value: number): number {
  return Math.ceil(100 * value);
}

export default class BlackBaby extends Character {
  private chargeCounter = 0;

  constructor(player: EntityPlayer) {
    super(player);
  }

  Load() {
    this.AddCallbacks();

    this.AddStats();
  }

  Unload() {
    this.RemoveCallbacks();
  }

  private AddCallbacks() {
    Mod.AddCallback(ModCallbacks.MC_POST_PLAYER_UPDATE, this.PostPlayerUpdate);
    Mod.AddCallback(ModCallbacks.MC_POST_TEAR_INIT, this.PostTearInit);
    Mod.AddCallback(ModCallbacks.MC_EVALUATE_CACHE, this.GiveTearArc);
  }

  private AddStats() {
    this.player.AddCacheFlags(CacheFlag.CACHE_TEARFLAG);
    this.player.EvaluateItems();
  }

  private RemoveCallbacks() {
    Mod.RemoveCallback(
      ModCallbacks.MC_POST_PLAYER_UPDATE,
      this.PostPlayerUpdate,
    );

    Mod.RemoveCallback(ModCallbacks.MC_POST_TEAR_INIT, this.PostTearInit);
    Mod.RemoveCallback(ModCallbacks.MC_EVALUATE_CACHE, this.GiveTearArc);
  }

  private PostPlayerUpdate = (player: EntityPlayer) => {
    if (!this.represents(player)) return;

    player.ClearCostumes();

    let playerSprite = player.GetSprite();
    if (player.GetBodyColor() !== SkinColor.SKIN_WHITE) {
      playerSprite.ReplaceSpritesheet(
        PlayerSpriteLayer.SPRITE_BODY,
        "gfx/characters/costumes/Character_BlackBaby.png",
      );
      playerSprite.LoadGraphics();
    }

    if (player.GetHeadColor() !== SkinColor.SKIN_WHITE) {
      playerSprite.ReplaceSpritesheet(
        PlayerSpriteLayer.SPRITE_HEAD,
        "gfx/characters/costumes/Character_BlackBaby.png",
      );
      playerSprite.LoadGraphics();
    }
  };

  private PostTearInit = (tear: EntityTear) => {
    let spawner = tear.SpawnerEntity;
    if (!spawner) return;

    let spawnerPlayer = spawner.ToPlayer();
    if (!spawnerPlayer) return;

    if (getPlayerIndex(spawnerPlayer) !== getPlayerIndex(this.player)) return;

    tear.ChangeVariant(TEAR_VARIANT_BLACK_BABY_AXE);
  };

  private GiveTearArc = (player: EntityPlayer, flags: CacheFlag) => {
    if ((flags & CacheFlag.CACHE_TEARFLAG) !== 0) {
      player.TearFallingAcceleration = 1;
      player.TearFallingSpeed = 30;
    }
  };
}
