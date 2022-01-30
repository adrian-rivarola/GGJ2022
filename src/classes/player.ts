import { Input, Scene } from 'phaser';
import { Level1 } from 'src/scenes';

import { EVENTS_NAME, GameStatus } from '../consts';
import { Actor } from './actor';
import { Text } from './text';

export class Player extends Actor {
  private keyW: Input.Keyboard.Key;
  private keyA: Input.Keyboard.Key;
  private keyS: Input.Keyboard.Key;
  private keyD: Input.Keyboard.Key;
  private keySpace: Input.Keyboard.Key;
  // private hpText!: Text;
  private maxHitsPerAttack = 2;
  private nextUpgrade = 16;
  private enemiesHit = 0;
  private maxHP = 90;
  private xp = 0;
  level = 0;
  chestLootHandler!: () => void;

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, 'king');

    // KEYS
    this.keyW = this.scene.input.keyboard.addKey('W');
    this.keyA = this.scene.input.keyboard.addKey('A');
    this.keyS = this.scene.input.keyboard.addKey('S');
    this.keyD = this.scene.input.keyboard.addKey('D');
    this.keySpace = this.scene.input.keyboard.addKey(32);
    this.keySpace.on('down', (event: KeyboardEvent) => {
      this.enemiesHit = 0;
      this.anims.play('attack', true);
      this.scene.game.events.emit(EVENTS_NAME.attack);
    });

    // this.hpText = new Text(this.scene, this.x, this.y - this.height, this.hp.toString())
    //   .setFontSize(12)
    //   .setOrigin(0.8, 0.5);

    // PHYSICS
    this.getBody().setSize(30, 30);
    this.getBody().setOffset(8, 0);

    // ANIMATIONS
    this.initAnimations();

    this.on('destroy', () => {
      this.keySpace.removeAllListeners();
    });

    this.chestLootHandler = () => {
      if (this.hp < this.maxHP) {
        this.updateHp(15);
      } else {
        this.updateXp(10);
      }
    };

    this.initListeners();
  }

  get canAttack(): boolean {
    return this.enemiesHit < Math.floor(this.maxHitsPerAttack);
  }

  get normalizedHP() {
    return Math.floor(this.hp / 15);
  }

  levelUp() {
    this.xp = this.xp - this.nextUpgrade;
    this.level++;
    this.maxHP += 30;
    this.updateHp(this.maxHP * 0.25);

    if (this.level % 5 === 0) {
      this.maxHitsPerAttack++;
      const attackAnim = this.scene.anims.get('attack');
      if (attackAnim != null)
        attackAnim.frameRate = Phaser.Math.Clamp(attackAnim.frameRate + 2, 8, 14);
    }

    this.nextUpgrade = Math.ceil(this.nextUpgrade * 1.1);
    this.scene?.cameras.main.flash();

    this.scene?.game.events.emit(EVENTS_NAME.levelUp);
  }

  updateHp(value: number) {
    this.hp = Phaser.Math.Clamp(this.hp + value, 0, this.maxHP);
    this.scene?.game.events.emit(EVENTS_NAME.hpChange, this.normalizedHP);
  }

  updateXp(value: number) {
    this.xp += value;
    if (this.xp >= this.nextUpgrade) {
      this.levelUp();
    }
  }

  onEnemyKilled() {
    let xpGained = 1;
    this.enemiesHit++;

    if (this.enemiesHit == Math.floor(this.maxHitsPerAttack)) xpGained++;

    this.updateXp(xpGained);
    if (this.enemiesHit < 2) {
      this.scene.sound.add('hitHurt').play();
      this.scene.cameras.main.shake(50, new Phaser.Math.Vector2(0.005, 0.0));
    }
  }

  update(): void {
    this.getBody().setVelocity(0);

    // this.hpText.setText(`XP: ${this.xp}/${this.nextUpgrade}\nAttack: ${this.maxHitsPerAttack}`);
    // this.hpText.setPosition(this.x, this.y - this.height * 0.56);
    // this.hpText.setOrigin(0.8, 0.5);

    if (this.keyW?.isDown) {
      this.body.velocity.y = -110;
      !this.anims.isPlaying && this.anims.play('run', true);
    }

    if (this.keyA?.isDown) {
      this.body.velocity.x = -110;
      this.checkFlip();
      this.getBody().setOffset(48, 15);
      !this.anims.isPlaying && this.anims.play('run', true);
    }

    if (this.keyS?.isDown) {
      this.body.velocity.y = 110;
      !this.anims.isPlaying && this.anims.play('run', true);
    }

    if (this.keyD?.isDown) {
      this.body.velocity.x = 110;
      this.checkFlip();
      this.getBody().setOffset(15, 15);
      !this.anims.isPlaying && this.anims.play('run', true);
    }
  }

  private initAnimations(): void {
    this.scene.anims.create({
      key: 'run',
      frames: this.scene.anims.generateFrameNames('a-king', {
        prefix: 'run-',
        end: 7,
      }),
      frameRate: 8,
    });

    this.scene.anims.create({
      key: 'attack',
      frames: this.scene.anims.generateFrameNames('a-king', {
        prefix: 'attack-',
        end: 2,
      }),
      frameRate: 8,
    });
  }

  private initListeners() {
    this.scene.game.events.on(EVENTS_NAME.chestLoot, this.chestLootHandler);
  }

  public getDamage(value?: number): void {
    if (!value) return;

    var prevHP = this.normalizedHP;

    super.getDamage(value);
    this.updateHp(-value);
    this.scene.time.delayedCall(100, () => this.clearTint());

    if (this.normalizedHP < prevHP) {
      this.scene.sound.add('badChest').play();
    }

    if (this.hp <= 0) {
      this.scene.game.events.emit(EVENTS_NAME.gameEnd, GameStatus.LOSE);
    }
  }
}
