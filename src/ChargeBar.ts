import { getLastFrameOfAnimation, VectorZero } from "isaacscript-common";

const GAME = Game();

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

const CHARGE_BAR_OFFSET = Vector(12, -35);

enum Animation {
  CHARGING = "Charging",
  START_CHARGED = "StartCharged",
  CHARGED = "Charged",
  DISAPPEAR = "Disappear",
}

const FinalAnimFrames = (() => {
  const fakeSprite: Sprite = Sprite();
  fakeSprite.Load("gfx/chargebar.anm2", true);
  return {
    CHARGING: getLastFrameOfAnimation(fakeSprite, Animation.CHARGING),
    START_CHARGED: getLastFrameOfAnimation(fakeSprite, Animation.START_CHARGED),
    CHARGED: getLastFrameOfAnimation(fakeSprite, Animation.CHARGED),
    DISAPPEAR: getLastFrameOfAnimation(fakeSprite, Animation.DISAPPEAR),
  } as const;
})();

export class ChargeBar {
  private readonly chargeSprite = Sprite();
  private remainingCharge = 0;
  private totalCharge = 1;
  private frame = FinalAnimFrames.DISAPPEAR;
  private isEvenFrame = true;
  animationName: Animation = Animation.DISAPPEAR;

  private readonly player: EntityPlayer;

  constructor(player: EntityPlayer) {
    this.player = player;
    this.chargeSprite.Load("gfx/chargebar.anm2", true);
  }

  startChargingFor(seconds: number): void {
    this.totalCharge = Math.ceil(seconds * 60);
    this.remainingCharge = 0;
    this.animationName = Animation.CHARGING;
    this.frame = 0;
  }

  disappear(): void {
    if (this.animationName === Animation.DISAPPEAR) {
      return;
    }
    this.animationName = Animation.DISAPPEAR;
    this.frame = 0;
  }

  isIdle(): boolean {
    return this.animationName === Animation.DISAPPEAR;
  }

  isCharged(): boolean {
    return (
      this.animationName === Animation.CHARGED ||
      this.animationName === Animation.START_CHARGED
    );
  }

  update(): void {
    this.isEvenFrame = !this.isEvenFrame;
    switch (this.animationName) {
      case Animation.CHARGING: {
        this.updateCharging();
        break;
      }

      case Animation.START_CHARGED: {
        this.updateStartCharged();
        break;
      }

      case Animation.CHARGED: {
        this.updateCharged();
        break;
      }

      case Animation.DISAPPEAR: {
        this.updateDisappear();
        break;
      }
    }
  }

  updateRender(): void {
    const room = GAME.GetRoom();

    const screenPosition = room
      .WorldToScreenPosition(this.player.Position)
      .add(CHARGE_BAR_OFFSET);

    this.chargeSprite.SetFrame(this.animationName, this.frame);
    this.chargeSprite.Render(screenPosition, VectorZero, VectorZero);
  }

  private updateCharging(): void {
    this.remainingCharge++;

    if (this.remainingCharge < this.totalCharge) {
      const ratio = this.remainingCharge / this.totalCharge;
      this.frame = clamp(
        Math.floor(FinalAnimFrames.CHARGING * ratio + 0.5),
        0,
        FinalAnimFrames.CHARGING,
      );
    } else {
      this.animationName = Animation.START_CHARGED;
      this.frame = 0;
    }
  }

  private updateStartCharged(): void {
    if (this.isEvenFrame) {
      return;
    }
    if (this.frame < FinalAnimFrames.START_CHARGED) {
      this.frame++;
    } else {
      this.animationName = Animation.CHARGED;
    }
  }

  private updateCharged(): void {
    if (this.isEvenFrame) {
      return;
    }
    this.frame = (this.frame % FinalAnimFrames.CHARGED) + 1;
  }

  private updateDisappear(): void {
    if (this.isEvenFrame) {
      return;
    }
    if (this.frame < FinalAnimFrames.DISAPPEAR) {
      this.frame++;
    }
  }

  remove(): void {
    this.chargeSprite.Reset();
  }
}
