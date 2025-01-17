import * as THREE from 'three';

import {config} from '../config.js';
import {srv} from '../util/server.js';
// import {db} from '../util/db.js';
import {u} from '../util/utils.js';

const STORE_DB_CHUNK = 'db-chunk-';

export const map = (() => {
  class _Chunk {
    constructor(pos_x, pos_y) {
      this.pos_x = pos_x;
      this.pos_y = pos_y;
      this.buildTime = 0;
      this.lastBuildCheck = 0;
      this._loaded = false;
      this.visible = false;
      this._needsUpdate = false;
      this._log_prefix = `Map chunk ${this.pos_x}/${this.pos_y}: `
      let size = config.CHUNK_SIZE;
      let res = config.CHUNK_RESOLUTION;
      this.plane = new THREE.Mesh(
        new THREE.PlaneGeometry(size, size, res, res),
        new THREE.MeshStandardMaterial({
          wireframe: false,
          wireframeLinewidth: 1,
          color: 0xFFFFFF,
          side: THREE.FrontSide,
          vertexColors: true,
        })
      );
      this.plane.castShadow = false;
      this.plane.receiveShadow = true;
      this.plane.rotation.x = -Math.PI / 2;
      this._CheckChunkBuildTime();
    }

    _SetChunkBuildTime(buildTime) {
      this.buildTime = buildTime;
    }

    _CheckChunkBuildTime() {
      if (u.TimestampSec() - config.CHUNK_CHECK_INTERVAL < this.lastBuildCheck) {
        return;
      }
      srv.LoadText(`statics/map/${this.pos_x}_${this.pos_y}.txt`, (this._SetChunkBuildTime).bind(this));
      this.lastBuildCheck = u.TimestampSec();
    }

    Update() {
      if (this.buildTime == 0) {
        return;
      }
      if (!this._loaded) {
        this._Download();
        /*
        if (localStorage.getItem(`${STORE_DB_CHUNK}_${this.pos_x}_${this.pos_y}`) != this.buildTime) {
          this._Download();
        } else {
          this._Load();
        }
        */
        this._Build();
        this._loaded = true;
      }
      if (this._needsUpdate) {
        this._Build();
      }
      this._CheckChunkBuildTime();
    }

    _ProcessChunk(raw) {
      this.plane.geometry.attributes.position.array = new Float32Array(raw.data);
      this._needsUpdate = true;
      console.log(this._log_prefix + 'Saving');
      // db.SaveMapChunk(raw.data, this.pos_x, this.pos_y, this.buildTime);
      localStorage.setItem(`${STORE_DB_CHUNK}_${this.pos_x}_${this.pos_y}`, this.buildTime);
    }

    _Load() {
      // todo: download if loading fails..
      console.log(this._log_prefix + 'Loading');
      // db.LoadMapChunk(this.pos_x, this.pos_y, (this._ProcessChunk).bind(this));
    }

    _Download() {
      console.log(this._log_prefix + 'Downloading');
      srv.LoadJSON(`statics/map/${this.pos_x}_${this.pos_y}.json`, (this._ProcessChunk).bind(this));
    }

    _Purge() {
      this.buildTime = 0;
      this._loaded = false;
      localStorage.setItem(`${STORE_DB_CHUNK}_${this.pos_x}_${this.pos_y}`, '');
    }

    _Build() {
      // todo: fix heights not rendering with loaded data (?)

      if (!this._loaded) {
        return;
      }
      console.log(this._log_prefix + 'Building');
      let baseColor = new THREE.Color(config.COL_MAP_BASE);
      let testColor = new THREE.Color(0x000000)
      let colors = [];
      let planePoints = this.plane.geometry.attributes.position.array;

      for (let i = 0; i <= this.plane.geometry.attributes.position.count; i++) {
        let [x, y] = [planePoints[i * 3], planePoints[i * 3 + 1]];

        if ((Math.round(x) % config.CHUNK_SHARD_SIZE == 0)) {
          colors.push(testColor.r, testColor.g, testColor.b);
        } else if ((Math.round(y) % config.CHUNK_SHARD_SIZE) == 0) {
          // console.log(y, Math.round(y), (Math.round(y) % config.CHUNK_SHARD_COUNT))
          colors.push(testColor.r, testColor.g, testColor.b);
        } else {
          colors.push(baseColor.r, baseColor.g, baseColor.b);
        }
      }

      this.plane.geometry.verticesNeedUpdate = true;
      this.plane.geometry.elementsNeedUpdate = true;
      // this.plane.geometry.computeVertexNormals();
      this.plane.position.set(this.pos_x, 0, this.pos_y);
      this.plane.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      if (!this._loaded) {
      }
      this._needsUpdate = false;
    }
  }

  class _Map {
    constructor(scene) {
      this._scene = scene;
      this.chunks = [];
      this._CreateChunks();
    }

    _CreateChunks() {
      for (let xi = 0; xi <= config.CHUNK_MUL - 1; xi++) {
        for (let yi = 0; yi <= config.CHUNK_MUL - 1; yi++) {
          let [offset_x, offset_y] = [config.CHUNK_SIZE * xi, config.CHUNK_SIZE * yi];
          let chunk = new _Chunk(offset_x, offset_y);
          chunk.visible = true;
          this.chunks.push(chunk);
          console.log(`Chunk ${offset_x}/${offset_y}: `, chunk, chunk.plane.geometry.attributes)
          this._scene.add(chunk.plane);
        }
      }
    }

    Update() {
      // todo: load and unload chunks in regards to distance to player
      // todo: unload chunks if window in background
      for (let c of this.chunks) {
        if (c.visible) {
          c.Update()
        }
      }
    }

  }

  return {
    Map: _Map,
  };

})();