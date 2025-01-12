import * as THREE from 'three';

import {config} from '../config.js';
import {noise} from '../util/noise.js';

export const map = (() => {
  class _Chunk {
    constructor() {
      this._heightGenTerrain = new noise.MapHeight(config.MAP_TERRAIN_NOISE);

      let size = config.MAP_SIZE;
      let res = config.MAP_SIZE / config.MAP_RESOLUTION;
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
      this._Create();
    }

    _Create() {
      // todo: map chunks
      const baseColor = new THREE.Color(config.COL_MAP_BASE);
      const testColor = new THREE.Color(0x000000)
      const colors = [];
      const planePoints = this.plane.geometry.attributes.position.array;

      for (let i = 0; i <= this.plane.geometry.attributes.position.count; i++) {
        let [xi, zi, yi] = [i * 3, i * 3 + 1, i * 3 + 2];
        let [x, z] = [planePoints[xi], planePoints[zi]];
        planePoints[yi] = this._heightGenTerrain.Get(x, z);

        if (x % config.CHUNK_SIZE == 0 || z % config.CHUNK_SIZE == 0) {
          colors.push(testColor.r, testColor.g, testColor.b);
        } else {
          colors.push(baseColor.r, baseColor.g, baseColor.b);
        }
      }
      this.plane.castShadow = false;
      this.plane.receiveShadow = true;
      this.plane.rotation.x = -Math.PI / 2;
      this.plane.geometry.elementsNeedUpdate = true;
      this.plane.geometry.verticesNeedUpdate = true;
      this.plane.geometry.computeVertexNormals();
      this.plane.position.set(0, 0, 0);
      this.plane.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    }
  }

  return {
    Chunk: _Chunk,
  };

})();