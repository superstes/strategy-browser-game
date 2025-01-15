from pathlib import Path
from sys import path as sys_path

FORCE_REGEN = True
CHUNK_SIZE = 501
MAP_CHUNK_MUL = 3
MAP_SIZE = (CHUNK_SIZE * MAP_CHUNK_MUL) ** 2
MAX_THREADS_PARALLEL = 2


BASE_PATH = Path(__file__).parent.resolve()
EXPORT_PATH = BASE_PATH.parent.resolve() / 'statics' / 'map'
LIB_PATH = BASE_PATH.parent.parent.parent.resolve() / 'lib'
sys_path.append(str(LIB_PATH))
print(LIB_PATH)


# pylint: disable=C0413
from opensimplex_cli import OpenSimplexConfig, OpenSimplexCLI


def export_file(pos_x: int, pos_y: int) -> str:
    return f"{EXPORT_PATH}/map_{pos_x}_{pos_y}"


NOISE_TERRAIN = OpenSimplexCLI(OpenSimplexConfig(
    octaves=10,
    persistence=0.7,
    lacunarity=1.5,
    exponentiation=5.0,
    height=135.0,
    scale=50,
    seed=3289432309,
))
