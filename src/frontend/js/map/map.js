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
      this.loaded = false;
      this.needsUpdate = false;
      this.hasColor = false;
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
      srv.LoadText(`statics/map/map_${this.pos_x}_${this.pos_y}.txt`, (this._SetChunkBuildTime).bind(this));
      this.lastBuildCheck = u.TimestampSec();
    }

    Check() {
      if (this.buildTime == 0) {
        return;
      }
      if (!this.loaded) {
        this._Download();
        /*
        if (localStorage.getItem(`${STORE_DB_CHUNK}_${this.pos_x}_${this.pos_y}`) != this.buildTime) {
          this._Download();
        } else {
          this._Load();
        }
        */
        this._Build();
        this.loaded = true;
      }
      if (this.needsUpdate) {
        this._Build();
      }
      this._CheckChunkBuildTime();
    }

    _ProcessChunk(raw) {
      this.plane.geometry.attributes.position.array = new Float32Array(raw.data);
      this.needsUpdate = true;
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
      srv.LoadJSON(`statics/map/map_${this.pos_x}_${this.pos_y}.json`, (this._ProcessChunk).bind(this));
    }

    _Purge() {
      this.buildTime = 0;
      this.loaded = false;
      localStorage.setItem(`${STORE_DB_CHUNK}_${this.pos_x}_${this.pos_y}`, '');
    }

    _Build() {
      // todo: fix heights not rendering with loaded data (?)

      if (!this.loaded) {
        return;
      }
      console.log(this._log_prefix + 'Building');
      let baseColor = new THREE.Color(config.COL_MAP_BASE);
      let testColor = new THREE.Color(0x000000)
      let colors = [];
      let planePoints = this.plane.geometry.attributes.position.array;

      for (let i = 0; i <= this.plane.geometry.attributes.position.count; i++) {
        let [xi, yi, _] = [i * 3, i * 3 + 1, i * 3 + 2];
        let [x, y] = [planePoints[xi], planePoints[yi]];

        if ((x %  Math.round(config.CHUNK_SHARD_COUNT)) == 0 || (y % Math.round(config.CHUNK_SHARD_COUNT)) == 0) {
          colors.push(testColor.r, testColor.g, testColor.b);
        } else {
          colors.push(baseColor.r, baseColor.g, baseColor.b);
        }
      }
      this.plane.geometry.verticesNeedUpdate = true;
      this.plane.geometry.elementsNeedUpdate = true;
      this.plane.position.set(this.pos_x, this.pos_y, 0);
      if (!this.hasColor) {
        this.plane.geometry.computeVertexNormals();
        this.plane.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        this.hasColor = true;
      }
      this.needsUpdate = false;
    }
  }

  return {
    Chunk: _Chunk,
  };

})();