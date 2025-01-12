import pathlib

FORCE_REGEN = False
CHUNK_SIZE = 500
MAP_CHUNK_MUL = 10
MAP_SIZE = (CHUNK_SIZE * MAP_CHUNK_MUL) ** 2
MAX_THREADS_PARALLEL = 2


EXPORT_PATH = pathlib.Path(__file__).parent.parent.resolve() / 'statics' / 'map'

def export_file(pos_x: int, pos_y: int) -> str:
    return f"{EXPORT_PATH}/map_{pos_x}_{pos_y}"


NOISE_FACTOR = 0.5

class NoiseConfig:
    def __init__(
        self, octaves: int, persistence: float, lacunarity: float,
        exponentiation: float, height: float, scale: float, seed: int,
    ):
        self.octaves = octaves
        self.persistence = persistence
        self.lacunarity = lacunarity
        self.exponentiation = exponentiation
        self.height = height
        self.scale = scale
        self.seed = seed


NOISE_TERRAIN = NoiseConfig(
    octaves=10,
    persistence=0.7,
    lacunarity=1.5,
    exponentiation=5.0,
    height=135.0,
    scale=50,
    seed=3289432309,
)
