from os import environ
from pathlib import Path
from sys import path as sys_path

ENV_KEY_CHUNKS = 'GAME_MAP_CHUNKS'

FORCE_REGEN = True
CHUNK_SIZE = 500
MAP_CHUNK_MUL = 2
MAP_SIZE = (CHUNK_SIZE * MAP_CHUNK_MUL) ** 2
MAX_THREADS_PARALLEL = 2

if ENV_KEY_CHUNKS in environ:
    MAP_CHUNK_MUL = int(environ[ENV_KEY_CHUNKS])

BASE_PATH = Path(__file__).parent.resolve()
EXPORT_PATH = BASE_PATH.parent.resolve() / 'statics' / 'map'
LIB_PATH = BASE_PATH.parent.parent.parent.resolve() / 'lib'
sys_path.append(str(LIB_PATH))


# pylint: disable=C0413
from opensimplex_cli import OpenSimplexConfig, OpenSimplexCLI


def export_file(pos_x: int, pos_y: int) -> str:
    return f"{EXPORT_PATH}/{pos_x}_{pos_y}"


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
    persistence=0.9,
    lacunarity=1.5,
    exponentiation=5.0,
    height=120.0,
    scale=50,
    seed=3289432309,
))
