import * as THREE from 'three'
import WEBGL from 'three/examples/jsm/capabilities/WebGL.js';
import {GUI} from 'dat.gui';

import {config} from './config.js';
import {sky} from './sky.js';
import {controls} from './controls.js';
import {graphics} from './graphics.js';
import {music} from './hud/music.js';
import {u} from './util/utils.js';
import {GetServerURL} from './util/server.js';
import {db} from './util/db.js';

let _APP = null;

class Game {
  constructor() {
    this._previousRAF = null;
    this._minFrameTime = 1.0 / 10.0;
    this._entities = {};
    this._startTime = Date.now();
    this._player = new THREE.Object3D();
    this._player.position.copy(config.PLAYER_POS);
    // this._sentHome = false;

    this._CreateDevTools();
    this._graphics = new graphics.Graphics(this);
    this._OnInitialize();
    this._RAF();
  }

  _RAF() {
    requestAnimationFrame((t) => {
      if (this._previousRAF === null) {
        this._previousRAF = t;
      }
      this._Render(t - this._previousRAF);
      this._previousRAF = t;
    });
  }

  _StepEntities(timeInSeconds) {
    for (let k in this._entities) {
      this._entities[k].Update(timeInSeconds);
    }
  }

  _Render(timeInMS) {
    if (typeof(document.hidden) !== undefined && document['hidden']) {
      // todo: handle browser-window in background
    }

    const timeInSeconds = Math.min(timeInMS * 0.001, this._minFrameTime);

    this._graphics.camera.position.copy(this._player.position);
    this._graphics.camera.quaternion.copy(this._player.quaternion);
  
    this._StepEntities(timeInSeconds);
    
    this._graphics.Render(timeInSeconds);

    this._RAF();
  }

  _OnInitialize() {
    GetServerURL();
    // db.CreateDB();

    /*
    this._entities['_map_entities'] = new map_entities.MapEntityManager({
      heightGen: this._heightGenerator,
      camera: this._graphics.camera,
      cameraDirection: this._graphics.cameraDirection,
    });
    */
    /*
    this._entities['_user'] = new user.User({
      settlements: this._entities['_map_entities'].settlements,
    });
    this._sentHome = true;
    console.log("@HOME", this._entities['_user'].settlements[0], this._entities['_user'].Home);
    this._player.position.copy(this._entities['_user'].Home);
    */

    this._entities['_sky'] = new sky.TerrainSky({
      camera: this._graphics.camera,
      scene: this._graphics.scene,
    });

    this._entities['_controls'] = new controls.FPSControls({
      scene: this._graphics.scene,
      player: this._player,
      gui: this._gui,
    });

    this._entities['_soundtrack'] = new music.SoundTrack();

    this._graphics.camera.position.copy(this._player.position);

    this._LoadBackground();
    this._RegisterEventListeners();
  }

  _CreateDevTools() {
    if (!config.DEBUG) {
      return;
    }
    this.devToolParams = {
      general: {
      },
    };
    this.devTools = new GUI();

    this.devTools.close();
  }

  _LoadBackground() {
    this._graphics.scene.background = new THREE.Color(0x000000);
  }

  _RegisterEventListeners() {
    let controls = this._entities['_controls'];
    document.addEventListener('keydown', function (e) { controls.OnKeyDown(e) }, false);
    document.addEventListener('keyup', function (e) { controls.OnKeyUp(e) }, false);

    let soundTrack = this._entities['_soundtrack'];
    let musicPlay = document.getElementById(config.HTML_MUSIC_PLAY);
    let musicPause = document.getElementById(config.HTML_MUSIC_PAUSE);
    let musicVolume = document.getElementById(config.HTML_MUSIC_VOLUME);

    musicPlay.addEventListener("click", function () { soundTrack.OnPlay() }, false);
    musicPause.addEventListener("click", function () { soundTrack.OnPause() }, false);
    musicVolume.addEventListener("click", function () { soundTrack.OnVolumeChange() }, false);    

    /*
    let map_entities = this._entities['_map_entities'];
    document.addEventListener('keydown', function (e) { map_entities.OnKeyDown(e) }, false);
    */
    /*
    let user = this._entities['_user'];
    let userRegister = document.getElementById(config.HTML_USER_REGISTER_BTN);
    userRegister.addEventListener("click", function (e) { user.OnRegister(e) }, false);
    */
  }
}


function _Main() {
  try {
    if (!WEBGL.isWebGL2Available()) {
      u.LoadError('WebGL2 is not available');
      return;
    }
    _APP = new Game();

  } catch (err) {
    u.ShowError('An unexpected error occurred:<br>' + err);
    throw err;
  }
}

_Main();
