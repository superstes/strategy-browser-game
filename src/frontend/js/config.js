import * as THREE from 'three';

function IsSet(data) {
    if (data === null || data === undefined || data === '') {
        return false;
    }
    return true;
}

const URL_PARAMS = new URLSearchParams(window.location.search);

export const config = (function() {
    return {
        DEBUG: IsSet(URL_PARAMS.get('debug')),
        THREADING: crossOriginIsolated,
        DB_MAX_SIZE:  navigator.storage.estimate() * 0.8,
        LANGUAGE: 'en',

        HTML_GAME: 'ui-game',
        HTML_CLOCK: 'ui-clock',
        HTML_LOADING: 'ui-loader',
        HTML_MUSIC_LOAD: 'ui-music-load',
        HTML_MUSIC_TITLE: 'ui-music-title',
        HTML_MUSIC_BY: 'ui-music-by',
        HTML_MUSIC_DESC: 'ui-music-description',
        HTML_MUSIC_PLAY: 'ui-music-play',
        HTML_MUSIC_PAUSE: 'ui-music-pause',
        HTML_MUSIC_VOLUME: 'ui-music-volume',
        HTML_COORDS: 'ui-coords-data',
        HTML_USER_REGISTER: 'ui-register',
        HTML_USER_REGISTER_BTN: 'ui-register-btn',
        HTML_USER_REGISTER_NAME: 'ui-register-username',
        HTML_ERROR: 'ui-error',
        HTML_SETTLEMENT_EDIT: 'ui-settlement-edit',
        HTML_SETTLEMENT_VIEW: 'ui-settlement-view',

        STORE_UID: 'uid',

        PLAYER_SPEED: 9,
        PLAYER_POS: new THREE.Vector3(100, 60, 100),

        CAM_FOV: 60,
        CHUNK_SIZE: 500,
        // JS_CHUNK_SIZE in map_generator/config.py
        CHUNK_RENDER_DISTANCE: 1,  // CHUNK_SIZE * DISTANCE
        MAP_SIZE: 5,
        CHUNK_SHARD_SIZE: 10,
        CHUNK_CHECK_INTERVAL: 3600,
        CHUNK_RESOLUTION: 250,  // vectors by chunk; 250 = 21.000 height values
        // JS_CHUNK_RESOLUTION in map_generator/config.py
        MAP_FOG: 0.005,

        MAP_TERRAIN_NOISE: {  // hills, greenlands, mountains, lakes
            octaves: 10,
            persistence: 0.7,
            lacunarity: 1.5,
            exponentiation: 5.0,
            height: 135.0,
            scale: 50.0,  // 450
            seed: 3289432309,
        },

        COL_ACCENT: 'orange',
        COL_BG: 'lightgrey',
        COL_CLOCK_DAWN: '#D46671',
        COL_CLOCK_NIGHT: '#121212',
        COL_CLOCK_DUSK: '#403f85',
        COL_SUN_DAY: 0xFFDD40,
        COL_SUN_DAWN: 0xDD541C,  // 0xC65F58
        COL_SUN_DUSK: 0xFAC258,
        COL_MAP_BASE: 0x6fb86c,

        SKY: {
            turbidity: 10.0,
            rayleigh: 0.4,
            mieCoefficient: 0.003,
            mieDirectionalG: 0.99,
        },

        // whole day = dawn + day + night + dawn/dusk
        GAME_DAY: 600 * 1000,
        GAME_NIGHT: 60 * 1000,
        GAME_DAWN: 60 * 1000,
        ID_DAY_DAWN: 0,
        ID_DAY_DAY: 1,
        ID_DAY_DUSK: 2,
        ID_DAY_NIGHT: 3,
        LIGHT_NIGHT: 0.3,
    };
})();