import { Text } from './text';

export enum LevelOperations {
  INCREASE,
  DECREASE,
  SET_VALUE,
}

export class Level extends Text {
  private levelValue: number;

  constructor(scene: Phaser.Scene, x: number, y: number, initScore = 0) {
    super(scene, x, y, `Level: ${initScore}`);

    scene.add.existing(this);

    this.levelValue = initScore;
  }

  public changeValue(operation: LevelOperations, value: number): void {
    switch (operation) {
      case LevelOperations.INCREASE:
        this.levelValue += value;
        break;
      case LevelOperations.DECREASE:
        this.levelValue -= value;
        break;
      case LevelOperations.SET_VALUE:
        this.levelValue = value;
        break;
      default:
        break;
    }

    this.setText(`Level: ${this.levelValue}`);
  }

  public getValue(): number {
    return this.levelValue;
  }
}
