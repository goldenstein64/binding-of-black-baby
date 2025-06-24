import { getLastFrameOfAnimation, VectorZero } from "isaacscript-common";

const GAME = Game();

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

const CHARGE_BAR_OFFSET = Vector(12, -35);

enum Animations {
  CHARGING = "Charging",
  START_CHARGED = "StartCharged",
  CHARGED = "Charged",
  DISAPPEAR = "Disappear",
}

let fakeSprite: Sprite | undefined = Sprite();
fakeSprite.Load("gfx/chargebar.anm2", true);

enum FinalAnimFrames {
  CHARGING = getLastFrameOfAnimation(fakeSprite, Animations.CHARGING),
  START_CHARGED = getLastFrameOfAnimation(
    fakeSprite,
    Animations.START_CHARGED,
  ),
  CHARGED = getLastFrameOfAnimation(fakeSprite, Animations.CHARGED),
  DISAPPEAR = getLastFrameOfAnimation(fakeSprite, Animations.DISAPPEAR),
}

fakeSprite = undefined;

export default class ChargeBar {
  private readonly chargeSprite = Sprite();
  private remainingCharge = 0;
  private totalCharge = 1;
  private frame = FinalAnimFrames.DISAPPEAR;
  private isEvenFrame = true;
  animationName: Animations = Animations.DISAPPEAR;

  private readonly player: EntityPlayer;

  constructor(player: EntityPlayer) {
    this.player = player;
    this.chargeSprite.Load("gfx/chargebar.anm2", true);
  }

  StartChargingFor(seconds: number) {
    this.totalCharge = Math.ceil(seconds * 60);
    this.remainingCharge = 0;
    this.animationName = Animations.CHARGING;
    this.frame = 0;
  }

  Disappear() {
    if (this.animationName === Animations.DISAPPEAR) {return;}
    this.animationName = Animations.DISAPPEAR;
    this.frame = 0;
  }

  IsIdle() {
    return this.animationName === Animations.DISAPPEAR;
  }

  IsCharged() {
    return (
      this.animationName === Animations.CHARGED ||
      this.animationName === Animations.START_CHARGED
    );
  }

  Update() {
    this.isEvenFrame = !this.isEvenFrame;
    switch (this.animationName) {
      case Animations.CHARGING: {
        this.updateCharging();
        break;
      }

      case Animations.START_CHARGED: {
        this.updateStartCharged();
        break;
      }

      case Animations.CHARGED: {
        this.updateCharged();
        break;
      }

      case Animations.DISAPPEAR: {
        this.updateDisappear();
        break;
      }
    }
  }

  UpdateRender() {
    let room = GAME.GetRoom();

    let screenPosition = room
      .WorldToScreenPosition(this.player.Position)
      .add(CHARGE_BAR_OFFSET);

    this.chargeSprite.SetFrame(this.animationName, this.frame);
    this.chargeSprite.Render(screenPosition, VectorZero, VectorZero);
  }

  private updateCharging() {
    this.remainingCharge++;

    if (this.remainingCharge < this.totalCharge) {
      let ratio = this.remainingCharge / this.totalCharge;
      this.frame = clamp(
        Math.floor(FinalAnimFrames.CHARGING * ratio + 0.5),
        0,
        FinalAnimFrames.CHARGING,
      );
    } else {
      this.animationName = Animations.START_CHARGED;
      this.frame = 0;
    }
  }

  private updateStartCharged() {
    if (this.isEvenFrame) {return;}
    if (this.frame < FinalAnimFrames.START_CHARGED) {
      this.frame++;
    } else {
      this.animationName = Animations.CHARGED;
    }
  }

  private updateCharged() {
    if (this.isEvenFrame) {return;}
    this.frame = (this.frame % FinalAnimFrames.CHARGED) + 1;
  }

  private updateDisappear() {
    if (this.isEvenFrame) {return;}
    if (this.frame < FinalAnimFrames.DISAPPEAR) {
      this.frame++;
    }
  }

  Remove() {
    this.chargeSprite.Reset();
  }
}
