import * as THREE from 'three';
import WEBGL from 'three/examples/jsm/capabilities/WebGL.js';
import {GUI} from 'dat.gui';

import {config} from './config.js';
import {sky} from './sky.js';
import {controls} from './controls.js';
import {graphics} from './graphics.js';
import {music} from './hud/music.js';
import {u} from './util/utils.js';
import {GetServerURL} from './util/server.js';
import {user} from './user.js';

let _APP = null;

class Game {
  constructor() {
    this._previousRAF = null;
    this._minFrameTime = 1.0 / 10.0;
    this._entities = {};
    this._startTime = Date.now();
    this._player = new THREE.Object3D();
    this._userLogonWindow = true;
    this.user = new user.User();
    this._initialized = false;

    GetServerURL();
    this._OnInitialize();

    this._CreateDevTools();
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

  /*
  _StepEntities(timeInSeconds) {
    for (let k in this._entities) {
      this._entities[k].Update(timeInSeconds);
    }
  }
  */

  _Render(timeInMS) {
    if (this.user == null || !this.user.Valid() || (typeof(document.hidden) !== undefined && document['hidden'])) {
      // skip rendering if user is not logged-on or windows is in background
    } else {
      if (this._userLogonWindow) {
        this._AfterLogon();
      }
      const timeInSeconds = Math.min(timeInMS * 0.001, this._minFrameTime);

      this._graphics.camera.position.copy(this._player.position);
      this._graphics.camera.quaternion.copy(this._player.quaternion);
    
      // this._StepEntities(timeInSeconds);
      
      this._graphics.Render(timeInSeconds);
    }

    this._RAF();
  }

  _AfterLogon() {
    this._player.position.copy(this.user.home);
    this._graphics.camera.position.copy(this._player.position);
    
    u.HtmlHide(config.HTML_USER_LOGON);
    u.HtmlUnhide(config.HTML_HUD);
    u.HtmlUnhide(config.HTML_LOADING);
    this._userLogonWindow = false;

    this._graphics.AfterLogon();
  }

  _OnInitialize() {
    this._graphics = new graphics.Graphics(this);
    this._entities['_sky'] = new sky.TerrainSky({
      camera: this._graphics.camera,
      scene: this._graphics.scene,
    });
    this._controls = new controls.FPSControls({
      scene: this._graphics.scene,
      player: this._player,
      gui: this._gui,
    });
    this._entities['_soundtrack'] = new music.SoundTrack();

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
    let controls = this._controls;
    document.addEventListener('keydown', function (e) { controls.OnKeyDown(e) }, false);
    document.addEventListener('keyup', function (e) { controls.OnKeyUp(e) }, false);

    let soundTrack = this._entities['_soundtrack'];
    let musicPlay = document.getElementById(config.HTML_MUSIC_PLAY);
    let musicPause = document.getElementById(config.HTML_MUSIC_PAUSE);
    let musicVolume = document.getElementById(config.HTML_MUSIC_VOLUME);

    musicPlay.addEventListener("click", function () { soundTrack.OnPlay() }, false);
    musicPause.addEventListener("click", function () { soundTrack.OnPause() }, false);
    musicVolume.addEventListener("click", function () { soundTrack.OnVolumeChange() }, false);    
  }
}

function registerEventListeners() {
  let userRegister = document.getElementById(config.HTML_USER_LOGON_FORM);
  userRegister.addEventListener("submit", function (e) { _APP.user.HandleLogon(e) }, false);
}

function initRegisterLogon() {
  let username = localStorage.getItem(config.STORE_UID);
  if (username !== undefined) {
    let userRegisterName = document.getElementById(config.HTML_USER_LOGON_NAME);
    userRegisterName.value = username;
  }
}


function _Main() {
  try {
    if (!WEBGL.isWebGL2Available()) {
      u.LoadError('WebGL2 is not available');
      return;
    }
    _APP = new Game();
    registerEventListeners();
    initRegisterLogon();

  } catch (err) {
    u.ShowError('An unexpected error occurred:<br>' + err);
    throw err;
  }
}

_Main();
