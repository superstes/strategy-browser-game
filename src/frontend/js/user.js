import * as THREE from 'three';

import {u} from './util/utils.js';
import {config} from './config.js';

const RESOURCE_UPDATE_INTERVAL_SEC = 2;

export const user = (function() {
    class _User {
        constructor() {
            this.name = null;
            this._session = null;
            this._sessionTime = null;
            this._sessionLifetimeSec = null;
            this._resourceUpdateTime = null;
            this._sentHome = false;
        }

        HandleLogon(e) {
            e.preventDefault();
            let [username, password] = [e.target[0].value, e.target[1].value];
            this._CreateUpdateSession(password);

            if (!this.Valid()) {
              let errorField = document.getElementById(config.HTML_USER_LOGON_ERROR);
              errorField.innerText = 'Failed to logon!';
              u.HtmlUnhide(config.HTML_USER_LOGON_ERROR);
              return;
            }

            this.name = username;
            localStorage.setItem(config.STORE_UID, username);
            this._GetUserSettings();
        }

        Valid() {
            return this._session != null
        }

        _CreateUpdateSession(password) {
            // todo: logon to server via API
            if (this._session != null) {
                // auth via existing token
            } else {
                // auth via password
            }
            // todo: securly store token

            this._session = "<API-TOKEN>";
            this._sessionTime = Date.now() / 1000;
            this._sessionLifetimeSec = 4 * 60 * 60;
        }

        _GetUserSettings() {
            // todo: fetch user settings from API
            let h = u.RandomMapPosition();
            this.home = new THREE.Vector3(h.x, config.PLAYER_HEIGHT, h.y);
            console.log("SPAWN: ", this.home);
        }

        SetUserSettings() {
            // todo: change settings via API
            this._GetUserSettings();
        }

        _GetUserResources(timeInSeconds) {
            // todo: fetch user resources from API
            // todo: websockets for continuous stat-updates
            this._resourceUpdateTime = timeInSeconds;
        }

        Update(timeInSeconds) {
            if (timeInSeconds - RESOURCE_UPDATE_INTERVAL_SEC > this._resourceUpdateTime) {
                this._GetUserResources(timeInSeconds);
            }
        }


    }

    return {
        User: _User,
    }
})();