import { Scene } from 'phaser';

export class LoadingScene extends Scene {
  constructor() {
    super('loading-scene');
  }

  preload(): void {
    this.load.baseURL = 'assets/';

    // PLAYER LOADING
    this.load.image('king', 'sprites/king.png');
    this.load.atlas('a-king', 'spritesheets/a-king.png', 'spritesheets/a-king_atlas.json');

    // MAP LOADING
    this.load.image({
      key: 'tiles',
      url: 'tilemaps/tiles/dungeon-16-16.png',
    });
    this.load.tilemapTiledJSON('dungeon', 'tilemaps/json/dungeon.json');

    // CHEST LOADING
    this.load.spritesheet('tiles_spr', 'tilemaps/tiles/dungeon-16-16.png', {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.atlas('chest', 'tilemaps/tiles/dungeon-16-16.png', 'spritesheets/chest_atlas.json');

    this.load.atlas('enemy', 'tilemaps/tiles/dungeon-16-16.png', 'spritesheets/enemy_atlas.json');

    // this.load.audio('fondo', 'sounds/fondo.mp3');
    this.load.audio('hitHurt', 'sounds/hitHurt.wav');
    this.load.audio('pickupCoin', 'sounds/pickupCoin.wav');
    this.load.audio('badChest', 'sounds/badChest.wav');
  }

  create(): void {
    this.scene.start('level-1-scene');
    this.scene.start('ui-scene');
  }
}
