from time import time
from json import dumps as json_dumps
from json import loads as json_loads

from config import *
from to_img import create_map_img


class Chunk:
    def __init__(self, cid: int, pos_x: int, pos_y: int):
        self.cid = cid
        self.pos_x = pos_x
        self.pos_y = pos_y
        self.area = CHUNK_SIZE * CHUNK_SIZE
        self.data = []
        self.max_height = 0
        self.export_file = f"{export_file(self.pos_x, self.pos_y)}.json"

    def _centered_chunk(self) -> list[float]:
        m = CHUNK_SIZE / 2
        d = []
        for i, p in enumerate(self.data, start=1):
            if i % 3 == 0:
                d.append(p)

            else:
                d.append(p - m)

        return d

    def _export(self):
        with open(self.export_file, 'w', encoding='utf-8') as f:
            f.write(json_dumps({'data': self._centered_chunk(), 'max': self.max_height}))

        with open(f"{export_file(self.pos_x, self.pos_y)}.txt", 'w', encoding='utf-8') as f:
            f.write(f'{int(time())}')

    def build(self):
        print(
            f"{self.cid} | Processing map: size {CHUNK_SIZE} area {self.area} "
            f"at {self.pos_x}/{self.pos_y}"
        )

        if FORCE_REGEN or not Path(self.export_file).is_file():
            print(f'{self.cid} | Generating map..')
            self.data, self.max_height = NOISE_TERRAIN.get_2d_array(
                size=CHUNK_SIZE,
                pos_x=self.pos_x,
                pos_y=self.pos_y,
            )

        else:
            print(f'{self.cid} | Loading map..')
            with open(self.export_file, 'r', encoding='utf-8') as f:
                map_data_raw = json_loads(f.read())
                self.data = map_data_raw['data']
                self.max_height = map_data_raw['max']

        print(f'{self.cid} | Exporting as JSON.. ({int(time())-start_time}s)')
        self._export()

        print(f'{self.cid} | Exporting as image.. ({int(time())-start_time}s)')
        create_map_img(map_data=self.data, pos_x=self.pos_x, pos_y=self.pos_y, max_height=self.max_height)

        print(f'{self.cid} | Done ({int(time())-start_time}s)')


def main():
    cid = 0
    for x in range(MAP_CHUNK_MUL):
        for y in range(MAP_CHUNK_MUL):
            cx, cy = x * CHUNK_SIZE, y * CHUNK_SIZE
            Chunk(cid=cid, pos_x=cx, pos_y=cy).build()
            cid += 1



if __name__ == '__main__':
    start_time = int(time())
    main()
