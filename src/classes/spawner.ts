import { Math, Scene } from 'phaser';
import { Level1 } from 'src/scenes';

import { EVENTS_NAME } from '../consts';
import { Actor } from './actor';
import { Enemy } from './enemy';
import { Player } from './player';
import { Text } from './text';

export class Spawner extends Actor {
  private target: Player;
  private SPAWN_RADIUS = 25;
  private ACTIVATION_RADIUS = 150;
  private COOL_DOWN_DURATION = 120;
  private coolDownTimer = 0;
  private MIN_SPAWNS = 0;
  private MAX_SPAWNS = 3;
  private levelUpHandler: () => void;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    texture: string,
    target: Player,
    frame?: string | number,
  ) {
    super(scene, x, y, texture, frame);
    this.target = target;
    this.alpha = 0;

    // ADD TO SCENE
    scene.add.existing(this);

    this.levelUpHandler = () => {
      if (this.target.level > 8) return;
      this.COOL_DOWN_DURATION -= 5;
      this.ACTIVATION_RADIUS -= 2.5;
      this.MIN_SPAWNS += 0.25;
      this.MAX_SPAWNS += 0.25;
    };
    this.scene.game.events.on(EVENTS_NAME.levelUp, this.levelUpHandler, this);
  }

  preUpdate(): void {
    // const graphic = this.scene.add.graphics();
    // graphic.strokeCircle(this.x, this.y, this.ACTIVATION_RADIUS);

    if (
      Math.Distance.BetweenPoints(
        { x: this.x, y: this.y },
        { x: this.target.x, y: this.target.y },
      ) < this.ACTIVATION_RADIUS &&
      this.coolDownTimer-- <= 0
    ) {
      (this.scene as Level1).addEnemies(this.createEnemies());
      this.coolDownTimer = this.COOL_DOWN_DURATION;
    }
  }

  createEnemies(): Enemy[] {
    const enemies: Enemy[] = [];
    const newEnemies = Math.Between(this.MIN_SPAWNS, this.MAX_SPAWNS);

    for (let idx = 0; idx < newEnemies; idx++) {
      const x = Math.Between(this.x - this.SPAWN_RADIUS, this.x + this.SPAWN_RADIUS);
      const y = Math.Between(this.y - this.SPAWN_RADIUS, this.y + this.SPAWN_RADIUS);
      const enemy = new Enemy(this.scene, x, y, 'tiles_spr', this.target, 503);
      enemies.push(enemy);
    }
    return enemies;
  }

  public setTarget(target: Player): void {
    this.target = target;
  }
}
