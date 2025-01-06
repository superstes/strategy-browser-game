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
        SERVER: 'http://localhost:8000',
        LOC_MUSIC: '/statics/music/',

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
        PLAYER_POS: new THREE.Vector3(60, 40, 60),

        CAM_FOV: 60,

        COL_ACCENT: 'orange',
        COL_BG: 'lightgrey',
        COL_CLOCK_DAWN: '#D46671',
        COL_CLOCK_NIGHT: '#121212',
        COL_CLOCK_DUSK: '#403f85',
        COL_SUN_DAY: 0xFFDD40,
        COL_SUN_DAWN: 0xDD541C,  // 0xC65F58
        COL_SUN_DUSK: 0xFAC258,

        SKY: {
            turbidity: 10.0,
            rayleigh: 0.4,
            mieCoefficient: 0.003,
            mieDirectionalG: 0.99,
        },

        MAP_SIZE: 1000,  // ²
        CHUNK_SIZE_MAX: 250,
        CHUNK_SIZE_MIN: 25,
        CHUNK_RESOLUTION_MIN: 48,
        CHUNK_RENDER_DISTANCE: 2.5,
        CHUNK_RENDER_DISTANCE_MIN: 1.5,  // single-threaded :(

        // whole day = dawn + day + night + dawn/dusk
        GAME_DAY: 600 * 1000,
        GAME_NIGHT: 60 * 1000,
        GAME_DAWN: 100 * 1000,
        ID_DAY_DAWN: 0,
        ID_DAY_DAY: 1,
        ID_DAY_DUSK: 2,
        ID_DAY_NIGHT: 3,

        ID_SETTLEMENT_FARM: 0,
        ID_SETTLEMENT_VILLAGE: 1,
        ID_SETTLEMENT_TOWN: 2,
        ID_SETTLEMENT_CITY: 3,
        ID_SETTLEMENT_FORT: 4,
        ID_SETTLEMENT_CASTLE: 5,

        ID_RESOURCE_WATER: 0,
        ID_RESOURCE_FIELD: 1,
        ID_RESOURCE_STONE: 2,
        ID_RESOURCE_METAL: 3,
        ID_RESOURCE_GOLD: 4,
        ID_RESOURCE_FISH: 5,
        ID_RESOURCE_LIVESTOCK: 6,
        ID_RESOURCE_WINE: 7,

        ID_TERRAIN_GRASSLAND: 0,
        ID_TERRAIN_WETLAND: 1,
        ID_TERRAIN_HILL: 2,
        ID_TERRAIN_HIGHLAND: 3,
        ID_TERRAIN_MOUNTAIN: 4,

        NOISE_MAP_DETAILS: {  // details to make it look a bit better
            octaves: 10,  // should match terrain
            persistence: 0.3,
            lacunarity: 1.9,
            exponentiation: 6.5,
            height: 60.0,
            scale: 400.0,  // should match terrain
            seed: 3289432309,  // should match terrain
        },
        NOISE_MAP_TERRAIN: {  // hills, greenlands, mountains, lakes
            octaves: 10,
            persistence: 0.75,
            lacunarity: 1.8,
            exponentiation: 5.0,
            height: 450.0,
            scale: 400.0,  // 450
            seed: 3289432309,
        },
        NOISE_MAP_GEO_WEIGHT: 5,
        NOISE_MAP_GEO: {  // plateus, mountain ranges, oceans, 
            octaves: 1,
            persistence: 1,
            lacunarity: 1.8,
            exponentiation: 4,
            height: 100.0,
            scale: 4096.0,
            seed: 1712171731,
        },
        NOISE_COLOR: {
            octaves: 2,
            persistence: 0.5,
            lacunarity: 2.0,
            exponentiation: 3.9,
            scale: 2048.0,
            seed: 9348289348,
            height: 1
        },
    };
})();