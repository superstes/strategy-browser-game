import * as THREE from 'three';
import {PointerLockControls} from 'three/examples/jsm/controls/PointerLockControls.js';

import {config} from './config.js';

const COORD_UPDATE_TIME = 250;

export const controls = (function() {
  return {
    // FPSControls was adapted heavily from a threejs example. Movement control
    // and collision detection was completely rewritten, but credit to original
    // class for the setup code.
    FPSControls: class {
      constructor(params) {
        this._params = params;
        this._cells = params.cells;
        this._radius = 2;
        this._enabled = false;
        this._move = {
          forward: false,
          backward: false,
          left: false,
          right: false,
          up: false,
          down: false,
        };
        this._standing = true;
        this._velocity = new THREE.Vector3(0, 0, 0);
        this._decceleration = new THREE.Vector3(-10, -10, -10);
        this._acceleration = new THREE.Vector3(config.PLAYER_SPEED, config.PLAYER_SPEED, config.PLAYER_SPEED);
        this._hudCoords = document.getElementById(config.HTML_COORDS);
        this._hudCoordsUpdateTime = 0;
        this._Init(params);
      }

      _Init(params) {
        this._params.guiParams.player = {
          acceleration_x: config.PLAYER_SPEED,
        };
  
        const rollup = this._params.gui.addFolder('Player.FPS');
        rollup.add(this._params.guiParams.player, "acceleration_x", 4.0, 24.0).onChange(
          () => {
            this._acceleration.set(
              this._params.guiParams.player.acceleration_x,
              this._params.guiParams.player.acceleration_x,
              this._params.guiParams.player.acceleration_x,
            );
          });

        this._SetupPointerLock();

        this._controls = new PointerLockControls(
          params.player, document.body
        );
        params.scene.add(this._controls.getObject());
        this._UpdateCoordinates(config.PLAYER_POS);
      }

      OnKeyDown(event) {
        switch (event.keyCode) {
          case 38: // up
          case 87: // w
            this._move.forward = true;
            break;
          case 37: // left
          case 65: // a
            this._move.left = true;
            break;
          case 40: // down
          case 83: // s
            this._move.backward = true;
            break;
          case 39: // right
          case 68: // d
            this._move.right = true;
            break;
          /*
          case 33: // PG_UP
          case 32: // SPACE
            this._move.up = true;
            break;
          case 34: // PG_DOWN
            this._move.down = true;
            break;
          */
        }
      }

      OnKeyUp(event) {
        switch(event.keyCode) {
          case 38: // up
          case 87: // w
            this._move.forward = false;
            break;
          case 37: // left
          case 65: // a
            this._move.left = false;
            break;
          case 40: // down
          case 83: // s
            this._move.backward = false;
            break;
          case 39: // right
          case 68: // d
            this._move.right = false;
            break;
          /*
          case 33: // PG_UP
          case 32: // SPACE
            this._move.up = false;
            break;
          case 34: // PG_DOWN
            this._move.down = false;
            break;
          */
        }
      }

      _SetupPointerLock() {
        const hasPointerLock = (
            'pointerLockElement' in document ||
            'mozPointerLockElement' in document ||
            'webkitPointerLockElement' in document);
        if (hasPointerLock) {
          const lockChange = (event) => {
            if (document.pointerLockElement === document.body ||
                document.mozPointerLockElement === document.body ||
                document.webkitPointerLockElement === document.body ) {
              this._enabled = true;
              this._controls.enabled = true;
            } else {
              this._controls.enabled = false;
            }
          };
          const lockError = (event) => {
            console.log(event);
          };

          document.addEventListener('pointerlockchange', lockChange, false);
          document.addEventListener('webkitpointerlockchange', lockChange, false);
          document.addEventListener('mozpointerlockchange', lockChange, false);
          document.addEventListener('pointerlockerror', lockError, false);
          document.addEventListener('mozpointerlockerror', lockError, false);
          document.addEventListener('webkitpointerlockerror', lockError, false);

          document.getElementById(config.HTML_GAME).addEventListener('click', (event) => {
            document.body.requestPointerLock = (
                document.body.requestPointerLock ||
                document.body.mozRequestPointerLock ||
                document.body.webkitRequestPointerLock);

            if (/Firefox/i.test(navigator.userAgent)) {
              const fullScreenChange = (event) => {
                if (document.fullscreenElement === document.body ||
                    document.mozFullscreenElement === document.body ||
                    document.mozFullScreenElement === document.body) {
                  document.removeEventListener('fullscreenchange', fullScreenChange);
                  document.removeEventListener('mozfullscreenchange', fullScreenChange);
                  document.body.requestPointerLock();
                }
              };
              document.addEventListener(
                  'fullscreenchange', fullScreenChange, false);
              document.addEventListener(
                  'mozfullscreenchange', fullScreenChange, false);
              document.body.requestFullscreen = (
                  document.body.requestFullscreen ||
                  document.body.mozRequestFullscreen ||
                  document.body.mozRequestFullScreen ||
                  document.body.webkitRequestFullscreen);
              document.body.requestFullscreen();
            } else {
              document.body.requestPointerLock();
            }
          }, false);
        }
      }

      _FindIntersections(boxes, position) {
        const sphere = new THREE.Sphere(position, this._radius);

        const intersections = boxes.filter(b => {
          return sphere.intersectsBox(b);
        });

        return intersections;
      }

      Update(timeInSeconds) {
        if (!this._enabled) {
          return;
        }

        const frameDecceleration = new THREE.Vector3(
            this._velocity.x * this._decceleration.x,
            this._velocity.y * this._decceleration.y,
            this._velocity.z * this._decceleration.z,
        );
        frameDecceleration.multiplyScalar(timeInSeconds);

        this._velocity.add(frameDecceleration);

        if (this._move.forward) {
          this._velocity.z -= 2 ** this._acceleration.z * timeInSeconds;
        }
        if (this._move.backward) {
          this._velocity.z += 2 ** this._acceleration.z * timeInSeconds;
        }
        if (this._move.left) {
          this._velocity.x -= 2 ** this._acceleration.x * timeInSeconds;
        }
        if (this._move.right) {
          this._velocity.x += 2 ** this._acceleration.x * timeInSeconds;
        }
        /*
        if (this._move.up) {
          this._velocity.y += 2 ** this._acceleration.y * timeInSeconds;
        }
        if (this._move.down) {
          this._velocity.y -= 2 ** this._acceleration.y * timeInSeconds;
        }
        */

        const controlObject = this._controls.getObject();

        //const oldPosition = new THREE.Vector3();
        //oldPosition.copy(controlObject.position);

        const forward = new THREE.Vector3(0, 0, 1);
        forward.applyQuaternion(controlObject.quaternion);
        forward.y = 0;
        forward.normalize();

        const updown = new THREE.Vector3(0, 1, 0);

        const sideways = new THREE.Vector3(1, 0, 0);
        sideways.applyQuaternion(controlObject.quaternion);
        sideways.normalize();

        sideways.multiplyScalar(this._velocity.x * timeInSeconds);
        updown.multiplyScalar(this._velocity.y * timeInSeconds);
        forward.multiplyScalar(this._velocity.z * timeInSeconds);

        controlObject.position.add(forward);
        controlObject.position.add(sideways);
        controlObject.position.add(updown);

        // oldPosition.copy(controlObject.position);
        this._UpdateCoordinates(controlObject.position);
      }

      _UpdateCoordinates(newPos) {
        if (Date.now() > this._hudCoordsUpdateTime + COORD_UPDATE_TIME) {
          this._hudCoords.innerHTML = '<p>' + Math.ceil(newPos.x) + '/' + Math.ceil(newPos.z) + '<br>' + Math.ceil(newPos.y) + '</p>';  
          this._hudCoordsUpdateTime = Date.now();
        }
      }
    }
  };
})();
