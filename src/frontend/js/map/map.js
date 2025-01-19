import * as THREE from 'three';

import {config} from '../config.js';
import {srv} from '../util/server.js';
// import {db} from '../util/db.js';
import {u} from '../util/utils.js';

const STORE_DB_CHUNK = 'db-chunk-';
const COLOR_DEEPWATER = new THREE.Color("rgb(0, 62, 178)");
const COLOR_WATER = new THREE.Color("rgb(9, 82, 198)");
const COLOR_SAND = new THREE.Color("rgb(254, 224, 179)");
const COLOR_GRASS = new THREE.Color("rgb(9, 120, 93)");
const COLOR_DARKGRASS = new THREE.Color("rgb(10, 107, 72)");
const COLOR_DARKESTGRASS = new THREE.Color("rgb(11, 94, 51)");
const COLOR_DARKROCKS = new THREE.Color("rgb(140, 142, 123)");
const COLOR_ROCKS = new THREE.Color("rgb(160, 162, 143)");
const COLOR_BLACKROCKS = new THREE.Color("rgb(53, 54, 68)");
const COLOR_SNOW = new THREE.Color("rgb(255, 255, 240)");
const COLOR_MARK = new THREE.Color(0x000000);

export const map = (() => {
  class _Chunk {
    constructor(pos_x, pos_y) {
      this.pos = new THREE.Vector2(pos_x, pos_y);
      this.buildTime = 0;
      this.lastBuildCheck = 0;
      this._loaded = false;
      this.visible = false;
      this._needsUpdate = false;
      this._log_prefix = `Map chunk ${this.pos.x}/${this.pos.y}: `
      let size = config.CHUNK_SIZE;
      let res = config.CHUNK_RESOLUTION;
      this.plane = new THREE.Mesh(
        new THREE.PlaneGeometry(size, size, res, res),
        new THREE.MeshStandardMaterial({
          wireframe: false,
          wireframeLinewidth: 1,
          vertexColors: true,
          color: 0xFFFFFF,
          side: THREE.FrontSide,
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
      srv.LoadText(`statics/map/${this.pos.x}_${this.pos.y}.txt`, (this._SetChunkBuildTime).bind(this));
      this.lastBuildCheck = u.TimestampSec();
    }

    Update() {
      if (this.buildTime == 0) {
        return;
      }
      if (!this._loaded) {
        this._Download();
        /*
        if (localStorage.getItem(`${STORE_DB_CHUNK}_${this.pos.x}_${this.pos.y}`) != this.buildTime) {
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
      console.log(this._log_prefix + 'Updating');
      console.log(this._log_prefix + 'Raw', raw.data);
      let planePoints = this.plane.geometry.attributes.position.array;

      for (let i = 0; i <= this.plane.geometry.attributes.position.count; i++) {
        let [xi, yi, hi] = [i * 3, i * 3 + 1, i * 3 + 2];
        planePoints[hi] = raw.data[i];
      }

      // this.plane.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(raw.data), 3))
      this.plane.geometry.attributes.position.needsUpdate = true;
      this._needsUpdate = true;
      //console.log(this._log_prefix + 'Saving');
      // db.SaveMapChunk(raw.data, this.pos.x, this.pos.y, this.buildTime);
      //localStorage.setItem(`${STORE_DB_CHUNK}_${this.pos.x}_${this.pos.y}`, this.buildTime);
    }

    _Load() {
      // todo: download if loading fails..
      console.log(this._log_prefix + 'Loading');
      // db.LoadMapChunk(this.pos.x, this.pos.y, (this._ProcessChunk).bind(this));
    }

    _Download() {
      console.log(this._log_prefix + 'Downloading');
      srv.LoadJSON(`statics/map/${this.pos.x}_${this.pos.y}.json`, (this._ProcessChunk).bind(this));
    }

    _Purge() {
      this.buildTime = 0;
      this._loaded = false;
      localStorage.setItem(`${STORE_DB_CHUNK}_${this.pos.x}_${this.pos.y}`, '');
    }

    _Build() {
      // todo: fix heights not rendering with loaded data (?)

      if (!this._loaded) {
        return;
      }
      console.log(this._log_prefix + 'Building');
      let colors = [];
      let planePoints = this.plane.geometry.attributes.position.array;

      for (let i = 0; i <= this.plane.geometry.attributes.position.count; i++) {
        let [x, y, h] = [planePoints[i * 3], planePoints[i * 3 + 1], planePoints[i * 3 + 2]];

        if ((Math.round(x) % config.CHUNK_SHARD_SIZE) == 0 || (Math.round(y) % config.CHUNK_SHARD_SIZE) == 0) {
          colors.push(COLOR_MARK.r, COLOR_MARK.g, COLOR_MARK.b);
        } else {
          let c = this._GetHeightColor(h);
          colors.push(c.r, c.g, c.b);
        }
      }

      this.plane.geometry.verticesNeedUpdate = true;
      this.plane.geometry.elementsNeedUpdate = true;
      this.plane.geometry.computeVertexNormals();
      this.plane.position.set(this.pos.x, 0, this.pos.y);
      this.plane.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      this._needsUpdate = false;
    }

    _GetHeightColor(height) {
      let m = 90;
      let h = height * (255 / m);

      if (h < 0) {
        h = 0
      }

      if (h > 255) {
        h = 255
      }

      if (h <= 1) {
        return COLOR_DEEPWATER
      }
      if (h <= 1.5) {
        return COLOR_WATER
      }
      if (h <= 2) {
        return COLOR_SAND
      }
      if (h <= 18) {
        return COLOR_GRASS
      }
      if (h <= 30) {
        return COLOR_DARKGRASS
      }
      if (h <= 70) {
        return COLOR_DARKESTGRASS
      }
      if (h <= 115) {
        return COLOR_DARKROCKS
      }
      if (h <= 125) {
        return COLOR_ROCKS
      }
      if (h <= 220) {
        return COLOR_BLACKROCKS
      }
      return COLOR_SNOW
    }
  }

  class _Map {
    constructor(scene, devTools, devToolParams, camera) {
      this._chunks = [];
      this._camera = camera;
      this._DevTools(devTools, devToolParams);
      this._group = new THREE.Group()
      scene.add(this._group);
      this._CreateChunks();
    }

    _DevTools(devTools, devToolParams) {
      if (!config.DEBUG) {
        return;
      }
      devToolParams.map = {
        wireframe: false,
      };

      let devMap = devTools.addFolder('Map');
      devMap.add(devToolParams.map, 'wireframe').onChange(() => {
        for (let ci in this._chunks) {
          this._chunks[ci].plane.material.wireframe = devToolParams.map.wireframe;
        }
      });
    }

    _CreateChunks() {
      for (let xi = 0; xi <= config.MAP_SIZE - 1; xi++) {
        for (let yi = 0; yi <= config.MAP_SIZE - 1; yi++) {
          let [offset_x, offset_y] = [config.CHUNK_SIZE * xi, config.CHUNK_SIZE * yi];
          let chunk = new _Chunk(offset_x, offset_y);
          this._chunks.push(chunk);
          console.log(`Chunk ${offset_x}/${offset_y}: `, chunk, chunk.plane.geometry.attributes)
        }
      }
      this._ChunkVisibility();
    }

    _ChunkVisibility() {
      for (let c of this._chunks) {
        let cv = u.WithinDistance(this._camera.position, c.pos, config.CHUNK_SIZE * config.CHUNK_RENDER_DISTANCE);
        if (cv && !c.visible) {
          console.log(`Chunk ${c.pos.x}/${c.pos.y}: Showing`)
          this._group.add(c.plane);
        } else if (!cv && c.visible) {
          console.log(`Chunk ${c.pos.x}/${c.pos.y}: Hiding`)
          this._group.remove(c.plane);
        }
        c.visible = cv;
      }
    }

    Update() {
      // todo: load and unload chunks in regards to distance to player
      // todo: unload chunks if window in background
      this._ChunkVisibility();
      for (let c of this._chunks) {
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