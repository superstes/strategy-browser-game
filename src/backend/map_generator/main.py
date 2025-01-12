from time import time, sleep
from pathlib import Path
from threading import Thread  # , Lock
from json import dumps as json_dumps
from json import loads as json_loads

from opensimplex import OpenSimplex
from oxl_utils.ps import wait_for_threads

from config import *
from to_img import create_map_img


def _get_height(noise: OpenSimplex, cnf: NoiseConfig, x: int, y: int) -> float:
    xs = x / cnf.scale
    ys = y / cnf.scale
    g = 2.0 ** (-cnf.persistence)
    amplitude = 1.0
    frequency = 1.0
    normalization = 0
    total = 0

    for _ in range(cnf.octaves):
        noise_value = noise.noise2(
            xs * frequency,
            ys * frequency,
        ) * NOISE_FACTOR + NOISE_FACTOR
        total += noise_value * amplitude
        normalization += amplitude
        amplitude *= g
        frequency *= cnf.lacunarity

    total /= normalization
    return float(total ** cnf.exponentiation) * cnf.height


# todo: profile performance for optimizations
class Chunk:
    def __init__(self, thread_id: int, pos_x: int, pos_y: int):
        self.tid = thread_id
        self.pos_x = pos_x
        self.pos_y = pos_y
        self.area = CHUNK_SIZE * CHUNK_SIZE
        self.data = []
        self.max_height = 0

    def _generate_map(self) -> tuple[list, float]:
        position_array = []
        max_height = 0
        noise_terrain = OpenSimplex(seed=NOISE_TERRAIN.seed)
        idx = 0

        for x in range(0, CHUNK_SIZE):
            for y in range(0, CHUNK_SIZE):
                if idx != 0 and idx % 10_000 == 0:
                    print(f'{self.tid} | Status: {round((100 / self.area) * idx, 0)}% ({int(time())-start_time}s)')

                x_abs, y_abs = x + self.pos_x, y + self.pos_y
                height = _get_height(
                    noise=noise_terrain,
                    cnf=NOISE_TERRAIN,
                    x=x_abs,
                    y=y_abs,
                )
                position_array.extend([x, y, height])
                if height > max_height:
                    max_height = height

                idx += 1

        return position_array, max_height

    def _export(self):
        with open(f"{export_file(self.pos_x, self.pos_y)}.json", 'w', encoding='utf-8') as f:
            f.write(json_dumps({'map': self.data, 'max': self.max_height}))

    def build(self):
        print(
            f"{self.tid} | Processing map: size {CHUNK_SIZE} area {self.area} "
            f"at {self.pos_x}/{self.pos_y}"
        )

        exported_file = f"{export_file(self.pos_x, self.pos_y)}.json"
        if FORCE_REGEN or not Path(exported_file).is_file():
            print(f'{self.tid} | Generating map..')
            self.data, self.max_height = self._generate_map()

        else:
            print(f'{self.tid} | Loading map..')
            with open(exported_file, 'r', encoding='utf-8') as f:
                map_data_raw = json_loads(f.read())
                self.data = map_data_raw['map']
                self.max_height = map_data_raw['max']

        print(f'{self.tid} | Exporting as JSON.. ({int(time())-start_time}s)')
        self._export()

        print(f'{self.tid} | Exporting as image.. ({int(time())-start_time}s)')
        create_map_img(map_data=self.data, pos_x=self.pos_x, pos_y=self.pos_y, max_height=self.max_height)

        print(f'{self.tid} | Done ({int(time())-start_time}s)')


def main():
    def _build_chunk(thread_id: int, pos_x: int, pos_y: int):
        c = Chunk(thread_id=thread_id, pos_x=pos_x, pos_y=pos_y)
        c.build()

    threads = []
    tid = 0
    for x in range(MAP_CHUNK_MUL):
        for y in range(MAP_CHUNK_MUL):
            while len(threads) > MAX_THREADS_PARALLEL:
                sleep(0.5)
                finished = [t for t in threads if not t.is_alive()]
                for t in finished:
                    threads.remove(t)

            cx, cy = x * CHUNK_SIZE, y * CHUNK_SIZE
            t = Thread(
                target=_build_chunk,
                kwargs={
                    'thread_id': tid,
                    'pos_x': cx,
                    'pos_y': cy,
                },
            )
            threads.append(t)
            t.start()
            tid += 1

    wait_for_threads(threads=threads)



if __name__ == '__main__':
    start_time = int(time())
    main()
