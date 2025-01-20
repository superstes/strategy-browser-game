import * as THREE from 'three'

import {config} from '../config.js';

const CAM_FOV2 = (Math.PI / 360) * (360 - config.CAM_FOV);

const GAME_DAY_FULL = config.GAME_DAWN + config.GAME_DAY + config.GAME_NIGHT + config.GAME_DAWN;
const GAME_DAY_MID = config.GAME_DAWN + config.GAME_DAY;
const GAME_DAY_DUSK = config.GAME_DAWN * 2 + config.GAME_DAY;
const GAME_DAY_NOON = config.GAME_DAWN + (config.GAME_DAY / 2);
const MAP_SIZE2 = config.MAP_SIZE * 2;

function RandomInt(max) {
  if (isNaN(max)) {
    throw new Error('Random max is not a number');
  }
  return Math.round(max * Math.random());
};

function RandomFloatMinMax(min, max) {
  if (isNaN(min)) {
    throw new Error('Random min is not a number');
  }
  if (isNaN(max)) {
    throw new Error('Random max is not a number');
  }
  return (max - min) * Math.random() + min;
};

function HtmlUnhide(element) {
  let e = document.getElementById(element);
  e.removeAttribute("hidden");
  e.style.visibility = "visible";
  e.style.display = "";
};

export const u = (function() {
  return {
    DictIntersection: function(dictA, dictB) {
      const intersection = {};
      for (let k in dictB) {
        if (k in dictA) {
          intersection[k] = dictA[k];
        }
      }
      return intersection
    },

    DictDifference: function(dictA, dictB) {
      const diff = {...dictA};
      for (let k in dictB) {
        delete diff[k];
      }
      return diff;
    },

    TimeOfDay: function() {
      return Math.ceil(Date.now() % GAME_DAY_FULL);
    },

    PartOfDay: function(timeOfDay) {
      if (timeOfDay <= config.GAME_DAWN) {
        return config.ID_DAY_DAWN;
      } else if (timeOfDay <= GAME_DAY_MID) {
        return config.ID_DAY_DAY;
      } else if (timeOfDay <= GAME_DAY_DUSK) {
        return config.ID_DAY_DUSK;
      } else {
        return config.ID_DAY_NIGHT;
      }
    },

    TimeAfterNoon: function(timeOfDay) {
      return timeOfDay > GAME_DAY_NOON;
    },

    PercentOfDay: function(timeOfDay) {
      return (timeOfDay / GAME_DAY_FULL) * 100;
    },

    ShuffleArray: function(array) {
      for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    },

    HtmlHide: function(element) {
      let e = document.getElementById(element);
      e.setAttribute("hidden", "hidden");
      e.style.visibility = "hidden";
      e.style.display = "none";
    },

    HtmlUnhide: HtmlUnhide,

    HtmlHideSwitch: function(element) {
      let e = document.getElementById(element);
      if (e.hidden) {
        e.removeAttribute("hidden");
        e.style.visibility = "visible";
        e.style.display = "";
      } else {
        e.setAttribute("hidden", "hidden");
        e.style.visibility = "hidden";
        e.style.display = "none";
      }
    },

    HtmlRemove: function(element) {
      try {
        document.getElementById(element).remove();
        // console.log("REMOVED", element);
      } catch {
        // already deleted
      }
      return;
    },

    IsSet: function(data) {
      if (data === null || data === undefined || data === '') {
        return false;
      }
      return true;
    },

    True: function(data) {
      return data === true;
    },

    False: function(data) {
      return data === false;
    },

    PositionsMatch: function(pos1, pos2) {
      return Math.ceil(pos1.x) == Math.ceil(pos2.x) &&
      Math.ceil(pos1.y) == Math.ceil(pos2.y) &&
      Math.ceil(pos1.z) == Math.ceil(pos2.z);
    },

    RandomInt: RandomInt,

    RandomIntMinMax: function (min, max) {
      return Math.round(RandomFloatMinMax(min, max));
    },

    RandomFloatMinMax: RandomFloatMinMax,

    RandomMapPosition: function() {
      let rx = RandomInt(MAP_SIZE2);
      let ry = RandomInt(MAP_SIZE2);
      if (rx > config.MAP_SIZE) {
          rx = rx - MAP_SIZE2;
      }
      if (ry > config.MAP_SIZE) {
          ry = ry - MAP_SIZE2;
      }
      return new THREE.Vector2(rx, ry);
    },

    // https://gist.github.com/Daniel-Hug/d7984d82b58d6d2679a087d896ca3d2b
    RectanglesOverlap: function(minA, maxA, minB, maxB) {
  	  // no horizontal overlap
      if (minA.x >= maxB.x || minB.x >= maxA.x) return false;

      // no vertical overlap
      if (minA.y >= maxB.y || minB.y >= maxA.y) return false;

      return true;
    },

    WithinDistance: function(vA, vB, distance) {
      let dX = vA.x - vB.x;
      let dY = vA.y - vB.y;
      if (dX < 0) {
        dX *= -1;
      }
      if (dY < 0) {
        dY *= -1;
      }
      return dX < distance && dY < distance;
    },

    // https://discourse.threejs.org/t/detect-if-target-is-behind-the-camera-bis/219/2
    InCameraFOV: function(cameraPosition, cameraDirection, position) {
      let p = new THREE.Vector3();
      p.copy(position);
      return (p.sub(cameraPosition).angleTo(cameraDirection)) < (Math.PI / CAM_FOV2);
    },

    ShowError: function(msg) {
      document.getElementById(config.HTML_ERROR).innerHTML = msg;
      HtmlUnhide(config.HTML_ERROR);
    },

    SetCookie: function(name, value, days) {
      var expires = "";
      if (days) {
          var date = new Date();
          date.setTime(date.getTime() + (days*24*60*60*1000));
          expires = "; expires=" + date.toUTCString();
      }
      document.cookie = name + "=" + (value || "")  + expires + "; path=/";
    },
    GetCookie: function(name) {
      var nameEQ = name + "=";
      var ca = document.cookie.split(';');
      for(var i=0;i < ca.length;i++) {
          var c = ca[i];
          while (c.charAt(0)==' ') c = c.substring(1,c.length);
          if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
      }
      return null;
    },
    EraseCookie: function(name) {
      document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    },

    TimestampSec: function() {
      return new Date().getTime() / 1000;
    },
  };
})();
