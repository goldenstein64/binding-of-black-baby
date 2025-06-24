import type { TearVariant } from "isaac-typescript-definitions";
import { ModCallback, EntityType, SoundEffect, EffectVariant, TearFlag } from "isaac-typescript-definitions";
import Mod from "../Mod";
import { spawnEffect } from "isaacscript-common";

const SFX_MANAGER = SFXManager();

const TEAR_VARIANT_BLACK_BABY_AXE =
  Isaac.GetEntityVariantByName("Black Baby Axe") as TearVariant;

export default class BlackBabyAxe {
  static StaticLoad(): void {
    Mod.AddCallback(
      ModCallback.POST_ENTITY_REMOVE,
      BlackBabyAxe.PostEntityRemove,
      EntityType.TEAR,
    );
  }

  static StaticUnload(): void {
    Mod.RemoveCallback(
      ModCallback.POST_ENTITY_REMOVE,
      BlackBabyAxe.PostEntityRemove,
    );
  }

  private static readonly PostEntityRemove = (entity: Entity) => {
    const tear = entity.ToTear();

    if (tear === undefined || tear.Variant !== TEAR_VARIANT_BLACK_BABY_AXE) {
      return;
    }

    const flagsLeft = tear.TearFlags.band(TearFlag.EXPLOSIVE);
    if (flagsLeft !== TearFlag.NORMAL) {
      return;
    }

    spawnEffect(EffectVariant.SCYTHE_BREAK, 0, tear.Position)
    SFX_MANAGER.Play(SoundEffect.SCYTHE_BREAK);
  };
}
