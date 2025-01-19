// NOTE: https://github.com/simondevyoutube/Quick_3D_RPG/blob/main/src/entity.js

export const map_entities = (function() {

    class _MapEntity {
        constructor(min, max) {
            this.uuid = crypto.randomUUID();
            this.mark = false;  // mark on map
            this.markColor = 0xFF10F0;  // pink
            this.min = min;
            this.max = max;
        }

        OnMap() {
            // make sure the entity is inside the bounds of our map
            return !(
                this.min.x < -config.MAP_SIZE ||
                this.min.y < -config.MAP_SIZE ||
                this.max.x > config.MAP_SIZE ||
                this.max.y > config.MAP_SIZE
            )
        }

        Overlapping(otherEntity) {
            if (Array.isArray(otherEntity)) {
                if (otherEntity.length == 0) {
                    return false;
                }
                for (let other of otherEntity) {
                    if (this.Overlapping(other)) {
                        return true;
                    }
                }
                return false;
            }

            // console.log("CHECKING IF OVERLAPPING", this.min, this.max, otherEntity.min, otherEntity.max);
            return u.RectanglesOverlap(this.min, this.max, otherEntity.min, otherEntity.max);
        }

        DistanceBetween(otherEntity, distance) {
            // make sure we keep a distance between these entities
            if (distance === undefined || isNaN(distance)) {
                console.log("ERROR checking map-entity distance!");
                return false;
            }

            if (Array.isArray(otherEntity)) {
                if (otherEntity.length == 0) {
                    return true;
                }
                for (let other of otherEntity) {
                    if (!this.DistanceBetween(other, distance)) {
                        return false;
                    }
                }
                return true;
            }

            if (this.Overlapping(otherEntity)) {
                return false;
            }

            // console.log("CHECKING DISTANCE", this.min, this.max, otherEntity.min, otherEntity.max);
            let dMin = new THREE.Vector2(this.min.x - distance, this.min.y - distance);
            let dMax = new THREE.Vector2(this.max.x + distance, this.max.y + distance);
            return !u.RectanglesOverlap(dMin, dMax, otherEntity.min, otherEntity.max);
        }

        PointInside(point) {
            return u.RectanglesOverlap(this.min, this.max, point, point);
        }

        DistanceToPoint(point, distance) {
            return this.position.distanceTo(point) > distance;
        }
    }
    class _MapEntityManager {
        constructor(params) {
            this._params = params;
            this.loaded = false;
            this.first = true;
            this._camera = this._params.camera;
            this._uid = undefined;
        }

        Update() {
        }

        _GetClosestEntity() {
            // hack - choose closest entity inside FOV to interact with
            let closest = undefined;
            /*
            let closestDistance = 100;
            for (let s of this.settlements) {
                if (!u.InCameraFOV(this._camera.position, this._params.cameraDirection, s.position)) {
                    continue;
                }
                let distance = s.position.distanceTo(this._camera.position);
                if (distance < closestDistance) {
                    closest = s;
                    closestDistance = distance;
                }
            }
            */
            if (closest === undefined) {
                return;
            }
            return closest;
        }

        OnKeyDown(event) {
            if (event.keyCode == 69) { // E
                // let target = this._GetClosestEntity();
            }
            // 81 = Q
            return;
        }
    }

    return {
        MapEntityManager: _MapEntityManager,
    }
})();