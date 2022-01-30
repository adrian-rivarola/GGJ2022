import { GameObjects, Scene, Tilemaps } from 'phaser';

import { Chest } from '../../classes/chest';
import { Player } from '../../classes/player';
import { Enemy } from '../../classes/enemy';
import { Spawner } from '../../classes/spawner';
import { gameObjectsToObjectPoints } from '../../helpers/gameobject-to-object-point';

import { EVENTS_NAME, UpdateLifeOperation } from '../../consts';

export class Level1 extends Scene {
  private player!: Player;
  private map!: Tilemaps.Tilemap;
  private tileset!: Tilemaps.Tileset;
  private wallsLayer!: Tilemaps.TilemapLayer;
  private groundLayer!: Tilemaps.TilemapLayer;
  private chests!: GameObjects.Sprite[];
  private enemies!: Enemy[];
  private spawners!: Spawner[];

  constructor() {
    super('level-1-scene');
  }

  create(): void {
    this.initMap();
    this.player = new Player(this, 100, 100);
    this.enemies = [];
    this.initChests();
    this.initEnemies();
    this.initCamera();

    this.physics.add.collider(this.player, this.wallsLayer);
  }

  update(): void {
    this.player.update();
  }

  private initMap(): void {
    this.map = this.make.tilemap({ key: 'dungeon', tileWidth: 16, tileHeight: 16 });
    this.tileset = this.map.addTilesetImage('dungeon', 'tiles');
    this.groundLayer = this.map.createLayer('Ground', this.tileset, 0, 0);
    this.wallsLayer = this.map.createLayer('Walls', this.tileset, 0, 0);
    this.wallsLayer.setCollisionByProperty({ collides: true });

    this.physics.world.setBounds(0, 0, this.wallsLayer.width, this.wallsLayer.height);
    // this.showDebugWalls();
  }

  private initChests(): void {
    const chestPoints = gameObjectsToObjectPoints(
      this.map.filterObjects('Chests', (obj) => obj.name === 'ChestPoint'),
    );

    this.chests = chestPoints.map((chestPoint) =>
      new Chest(this, chestPoint.x, chestPoint.y, 'tiles_spr', this.player, 595).setScale(1.5),
    );
  }

  private initEnemies(): void {
    const enemiesPoints = gameObjectsToObjectPoints(
      this.map.filterObjects('Enemies', (obj) => obj.name === 'EnemyPoint'),
    );

    this.spawners = [];
    const enemies: Enemy[] = [];

    enemiesPoints.forEach((enemyPoint) => {
      this.spawners.push(new Spawner(this, enemyPoint.x, enemyPoint.y, '', this.player));
    });

    this.addEnemies(enemies);
  }

  public addEnemies(newEnemies: Enemy[]) {
    this.physics.add.collider(newEnemies, this.wallsLayer);
    this.physics.add.collider(this.enemies, newEnemies);
    this.physics.add.collider(newEnemies, newEnemies);
    this.physics.add.collider(
      this.player,
      newEnemies,
      (obj1, obj2) => {
        (obj1 as Player).getDamage(0.25);
      },
      undefined,
      this,
    );
    this.enemies = this.enemies.concat(newEnemies);
  }

  private initCamera(): void {
    this.cameras.main.setSize(this.game.scale.width, this.game.scale.height);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
    this.cameras.main.setZoom(2.5);
  }

  private showDebugWalls(): void {
    const debugGraphics = this.add.graphics().setAlpha(0.7);
    this.wallsLayer.renderDebug(debugGraphics, {
      tileColor: null,
      collidingTileColor: new Phaser.Display.Color(243, 234, 48, 255),
    });
  }
}
