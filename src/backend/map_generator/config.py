from os import environ
from pathlib import Path
from sys import path as sys_path

ENV_KEY_CHUNKS = 'GAME_MAP_CHUNKS'
ENV_KEY_IMG_EXPORT = 'GAME_MAP_EXPORT_IMG'

FORCE_REGEN = False
JS_CHUNK_SIZE = 500
JS_CHUNK_RESOLUTION = 250
CHUNK_RESOLUTION = JS_CHUNK_RESOLUTION + 1
# squared needs to be the size of plane.geometry.attributes.position.count
MAP_CHUNK_MUL = 5

if ENV_KEY_CHUNKS in environ:
    MAP_CHUNK_MUL = int(environ[ENV_KEY_CHUNKS])

BASE_PATH = Path(__file__).parent.resolve()
EXPORT_PATH = BASE_PATH.parent.resolve() / 'statics' / 'map'
LIB_PATH = BASE_PATH.parent.parent.parent.resolve() / 'lib'
sys_path.append(str(LIB_PATH))


# pylint: disable=C0413
from opensimplex_cli import OpenSimplexConfig, OpenSimplexCLI


NOISE_GEO = OpenSimplexCLI(OpenSimplexConfig(
    octaves=3,
    persistence=3,
    lacunarity=4,
    exponentiation=3,
    height=150,
    scale=1000,
    seed=524924922,
))
NOISE_GEO_LOWER_BY = 18

NOISE_TERRAIN = OpenSimplexCLI(OpenSimplexConfig(
    octaves=10,
    persistence=0.6,
    lacunarity=1.7,
    exponentiation=5.0,
    height=100.0,
    scale=50,
    seed=3289432309,
))
