import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';

import {config} from './config.js';
import {u} from './util/utils.js';
import {map} from './map/map.js';

export const graphics = (function() {

  class _Graphics {
    constructor(game) {
      this._loaded = false;
      this._threejs = new THREE.WebGLRenderer({
          antialias: true,
      });
      this._threejs.setPixelRatio(window.devicePixelRatio);
      this._threejs.setSize(window.innerWidth, window.innerHeight);

      const target = document.getElementById(config.HTML_GAME);
      target.appendChild(this._threejs.domElement);

      this._stats = new Stats();
      //target.appendChild(this._stats.dom);

      window.addEventListener('resize', () => {
        this._OnWindowResize();
      }, false);

      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0xaaaaaa);
      this.scene.fog = new THREE.FogExp2(0x89b2eb, config.MAP_FOG);
      this._lightSun = new THREE.DirectionalLight(0xFFFFFF, 1);

      this.devTools = game.devTools;
      this.devToolParams = game.devToolParams;
      this._DevTools(game.devTools, game.devToolParams);

      this._CreateLights();
      this._CreateCamera();
      this._AddMap();
      this._RemoveLoadingScreen();
    }

    _DevTools(devTools, devToolParams) {
      if (!config.DEBUG) {
        return;
      }
      devToolParams.graphics = {
        fog: true,
      };

      let devGraphics = devTools.addFolder('Graphics');
      devGraphics.add(devToolParams.graphics, 'fog').onChange(() => {
        if (devToolParams.graphics.fog) {
          this.scene.fog = new THREE.FogExp2(0x89b2eb, config.MAP_FOG);
        } else {
          this.scene.fog = new THREE.FogExp2(0x89b2eb, 0);
        }
      });
    }

    _CreateCamera() {
      const aspect = 1920 / 1080;
      const near = 1;
      const far = 25000.0;
      this.camera = new THREE.PerspectiveCamera(config.CAM_FOV, aspect, near, far);
      this.camera.position.copy(config.PLAYER_POS);

      this.cameraDirection = new THREE.Vector3();
      this.camera.getWorldDirection(this.cameraDirection);
    }

    _CreateLights() {
      this._lightSun.position.set(100, 100, -100);
      this._lightSun.target.position.set(0, 0, 0);
      this._lightSun.castShadow = true;
      this.scene.add(this._lightSun);

      // night light; could be changed to directional-light
      let light = new THREE.AmbientLight(0xFFFFFF, config.LIGHT_NIGHT);
      this.scene.add(light);
    }

    _AddMap() {
      this._map = new map.Map(this.scene, this.devTools, this.devToolParams, this.camera);
    }

    _UpdateMap() {
      this._map.Update();
    }

    _UpdateClock(dayTime, dayPart) {
      let dayPercent = Math.ceil(u.PercentOfDay(dayTime));
      let color = config.COL_CLOCK_NIGHT;
      if (dayPart == config.ID_DAY_DAY) {
        color = config.COL_ACCENT;
      } else if (dayPart == config.ID_DAY_DAWN) {
        color = config.COL_CLOCK_DAWN;
      } else if (dayPart == config.ID_DAY_DUSK) {
        color = config.COL_CLOCK_DUSK;
      }

      document.getElementById(config.HTML_CLOCK).style.background=`conic-gradient(${color} 0, ${color} ${dayPercent}%, ${config.COL_BG} 0)`;
    }

    _UpdateSun() {
      let dayTime = u.TimeOfDay();
      let dayPart = u.PartOfDay(dayTime);

      let intensity = 0.0;
      /*
      // todo: blend colors
      if (dayPart == config.ID_DAY_DAWN) {
        intensity = dayTime / config.GAME_DAWN;
        this._lightSun.color.setHex(config.COL_SUN_DAWN);

      } else if (dayPart == config.ID_DAY_DAY) {
        intensity = 1;
        this._lightSun.color.setHex(config.COL_SUN_DAY);

      } else if (dayPart == config.ID_DAY_DUSK) {
        let dawnTime = dayTime - config.GAME_DAWN - config.GAME_DAY;
        intensity = 1 - (dawnTime / config.GAME_DAWN);
        this._lightSun.color.setHex(config.COL_SUN_DUSK);
      }
      */
      if (dayPart != config.ID_DAY_NIGHT) {
        intensity = 1.0;
      }

      // console.log('SUN STATE2', dayTime, dayPart, intensity);
      this._lightSun.position.set(100, 100, -100);
      this._lightSun.intensity = intensity;
      this._UpdateClock(dayTime, dayPart);
      this._UpdateMap();
    }

    _RemoveLoadingScreen() {
      /*
      if (u.False(this._loaded) && !this._builder.Busy) {
        u.HtmlRemove(config.HTML_LOADING);
      }
      */
      u.HtmlRemove(config.HTML_LOADING);
      this._loaded = true;
    }

    _OnWindowResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this._threejs.setSize(window.innerWidth, window.innerHeight);
    }

    _UpdateCamera() {
      this.camera.getWorldDirection(this.cameraDirection);
    }

    Render(timeInSeconds) {
      this._UpdateSun();
      this._UpdateCamera();
      this._threejs.render(this.scene, this.camera);
      this._stats.update();
    }
  }

  return {
    Graphics: _Graphics,
  };
})();
