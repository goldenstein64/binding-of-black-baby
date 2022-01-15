import Mod from "../Mod";

const SFX_MANAGER = SFXManager();

const TEAR_VARIANT_BLACK_BABY_AXE =
  Isaac.GetEntityVariantByName("Black Baby Axe");

export default class BlackBabyAxe {
  static StaticLoad(): void {
    Mod.AddCallback(
      ModCallbacks.MC_POST_ENTITY_REMOVE,
      BlackBabyAxe.PostEntityRemove,
      EntityType.ENTITY_TEAR,
    );
  }

  static StaticUnload(): void {
    Mod.RemoveCallback(
      ModCallbacks.MC_POST_ENTITY_REMOVE,
      BlackBabyAxe.PostEntityRemove,
    );
  }

  private static PostEntityRemove = (entity: Entity) => {
    let tear = entity.ToTear()!;

    if (tear.Variant !== TEAR_VARIANT_BLACK_BABY_AXE) return;
    let effect = Isaac.Spawn(
      EntityType.ENTITY_EFFECT,
      EffectVariant.SCYTHE_BREAK,
      0,
      tear.Position,
      Vector(0, 0),
      tear,
    ).ToEffect()!;

    SFX_MANAGER.Play(SoundEffect.SOUND_SCYTHE_BREAK);
  };
}
