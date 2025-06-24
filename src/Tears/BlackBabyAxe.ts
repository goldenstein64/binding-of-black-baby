import type { TearVariant } from "isaac-typescript-definitions";
import {
  EffectVariant,
  EntityType,
  ModCallback,
  SoundEffect,
  TearFlag,
} from "isaac-typescript-definitions";
import { spawnEffect } from "isaacscript-common";
import { Mod } from "../Mod";

const SFX_MANAGER = SFXManager();

const TEAR_VARIANT_BLACK_BABY_AXE = Isaac.GetEntityVariantByName(
  "Black Baby Axe",
) as TearVariant;

function postEntityRemove(entity: Entity) {
  const tear = entity.ToTear();

  if (tear === undefined || tear.Variant !== TEAR_VARIANT_BLACK_BABY_AXE) {
    return;
  }

  const flagsLeft = tear.TearFlags.band(TearFlag.EXPLOSIVE);
  if (flagsLeft !== TearFlag.NORMAL) {
    return;
  }

  spawnEffect(EffectVariant.SCYTHE_BREAK, 0, tear.Position);
  SFX_MANAGER.Play(SoundEffect.SCYTHE_BREAK);
}

export function load(): void {
  Mod.AddCallback(
    ModCallback.POST_ENTITY_REMOVE,
    postEntityRemove,
    EntityType.TEAR,
  );
}

// ts-prune-ignore-next
export function unload(): void {
  Mod.RemoveCallback(ModCallback.POST_ENTITY_REMOVE, postEntityRemove);
}
