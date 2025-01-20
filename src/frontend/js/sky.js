import * as THREE from 'three'
import {Sky} from 'three/examples/jsm/objects/Sky.js';
// import {Water} from 'three/examples/jsm/objects/Water.js';

import {config} from './config.js';
import {u} from './util/utils.js';

const GAME_DAY_LIGHT = config.GAME_DAWN * 2 + config.GAME_DAY;
const GAME_DAY_LIGHT2 = GAME_DAY_LIGHT / 2;

export const sky = (function() {

  class TerrainSky {
    constructor(params) {
      this._params = params;
      this._Init(params);
    }

    _Init(params) {
      /*
      const waterGeometry = new THREE.PlaneGeometry(10000, 10000, 100, 100);
      this._water = new Water(
        waterGeometry,
        {
          textureWidth: 2048,
          textureHeight: 2048,
          waterNormals: new THREE.TextureLoader().load('resources/waternormals.jpg', function ( texture ) {

            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

          }),
          alpha: 0.5,
          sunDirection: new THREE.Vector3(1, 0, 0),
          sunColor: 0xffffff,
          waterColor: 0x001e0f,
          distortionScale: 0.0,
          fog: undefined
        }
      );
      this._water.rotation.x = - Math.PI / 2;
      this._water.position.y = 4;
      */

      this._sky = new Sky();
      this._sky.scale.setScalar(10000);

      this._group = new THREE.Group();
      // this._group.add(this._water);
      this._group.add(this._sky);

      params.scene.add(this._group);

      for (let k in config.SKY) {
        this._sky.material.uniforms[k].value = config.SKY[k];
      }

      // console.log("SKY", this._sky);
      this._UpdateSun();
    }

    _UpdateSun() {
      let dayTime = u.TimeOfDay();
      let dayPart = u.PartOfDay(dayTime);
      let afterNoon = u.TimeAfterNoon(dayTime);

      const sunPosition = new THREE.Vector3();
      if (dayPart == config.ID_DAY_NIGHT) {
        sunPosition.x = 0;
        sunPosition.y = 0;
        sunPosition.z = 0;

      } else {
        let azimuth = -90.0;
        let elevation = 0.0;
        if (afterNoon) {
          azimuth = 90;
          let dayTimeAfterNoon = GAME_DAY_LIGHT2 - (dayTime - GAME_DAY_LIGHT2);
          elevation = 90 * (dayTimeAfterNoon / GAME_DAY_LIGHT2);
        } else {
          elevation = 90 * (dayTime / GAME_DAY_LIGHT2);
        }

        // https://github.com/mrdoob/three.js/blob/master/examples/webgl_shaders_sky.html

        let phi = THREE.MathUtils.degToRad(90 - elevation);
        let theta = THREE.MathUtils.degToRad(azimuth);
        sunPosition.setFromSphericalCoords(1, phi, theta);
      }

      this._sky.material.uniforms['sunPosition'].value.copy(sunPosition);
      // this._water.material.uniforms['sunDirection'].value.copy(sunPosition.normalize());
    };

    Update(timeInSeconds) {
      this._UpdateSun();
      // this._water.material.uniforms['time'].value += timeInSeconds;

      this._group.position.x = this._params.camera.position.x;
      this._group.position.z = this._params.camera.position.z;
    }
  }


  return {
    TerrainSky: TerrainSky
  }
})();
