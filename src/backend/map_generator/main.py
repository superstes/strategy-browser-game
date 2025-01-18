from time import time
from json import dumps as json_dumps
from json import loads as json_loads

from config import *
from to_img import create_map_img


class Chunk:
    def __init__(self, cid: int, key: str, pos_x: int, pos_y: int):
        self.cid = cid
        self.pos_x = pos_x
        self.pos_y = pos_y
        self.area = CHUNK_RESOLUTION * CHUNK_RESOLUTION
        self.data = []
        self.max_height = 0
        self.min_height = 0
        self.export_file = f"{EXPORT_PATH}/{key}"

    def _prepare_heights(self) -> list[float]:
        dm, d = [],  []

        # todo: port mirroring and rotation to https://github.com/O-X-L/opensimplex
        # mirror Y-axis
        for x in range(1, CHUNK_RESOLUTION + 1):
            for y in range(CHUNK_RESOLUTION):
                hi = (x * CHUNK_RESOLUTION * 3) - (y * 3 + 2)
                dm.append(self.data[-hi])

        # rotate 90° clockwise
        for y in range(CHUNK_RESOLUTION):
            for x in range(1, CHUNK_RESOLUTION + 1):
                hi = ((CHUNK_RESOLUTION - x) * CHUNK_RESOLUTION) + y
                d.append(dm[hi])

        del dm
        return d

    def _export(self):
        with open(f'{self.export_file}.json', 'w', encoding='utf-8') as f:
            f.write(json_dumps({'data': self._prepare_heights(), 'max': self.max_height}))

        with open(f"{self.export_file}.txt", 'w', encoding='utf-8') as f:
            f.write(f'{int(time())}')

    def build(self):
        print(
            f"{self.cid} | Processing map: size {CHUNK_RESOLUTION} area {self.area} "
            f"at {self.pos_x}/{self.pos_y}"
        )

        if FORCE_REGEN or not Path(f'{self.export_file}.json').is_file():
            print(f'{self.cid} | Generating map..')
            geo_data, geo_max_height, geo_min_height = NOISE_GEO.get_2d_array(
                size=CHUNK_RESOLUTION,
                pos_x=self.pos_x,
                pos_y=self.pos_y,
                lower_by=NOISE_GEO_LOWER_BY,
            )
            terrain_data, terrain_max_height, terrain_min_height = NOISE_TERRAIN.get_2d_array(
                size=CHUNK_RESOLUTION,
                pos_x=self.pos_x,
                pos_y=self.pos_y,
            )

            self.max_height = geo_max_height + terrain_max_height
            self.min_height = geo_min_height + terrain_min_height

            for i in range(CHUNK_RESOLUTION * CHUNK_RESOLUTION):
                xi, yi, hi = i * 3, i * 3 + 1, i * 3 + 2
                self.data.extend([
                    terrain_data[xi],
                    terrain_data[yi],
                    geo_data[hi] + terrain_data[hi],
                ])

        else:
            print(f'{self.cid} | Loading map..')
            with open(self.export_file, 'r', encoding='utf-8') as f:
                map_data_raw = json_loads(f.read())
                self.data = map_data_raw['data']
                self.max_height = map_data_raw['max']

        print(f'{self.cid} | Exporting as JSON.. ({int(time())-start_time}s)')
        self._export()

        print(f'{self.cid} | Exporting as image.. ({int(time())-start_time}s)')
        create_map_img(
            export_file=self.export_file,
            map_data=self.data,
            pos_x=self.pos_x,
            pos_y=self.pos_y,
            max_height=self.max_height,
        )

        print(f'{self.cid} | Done ({int(time())-start_time}s)')


def main():
    cid = 0
    for x in range(MAP_CHUNK_MUL):
        for y in range(MAP_CHUNK_MUL):
            cx, cy = x * CHUNK_RESOLUTION, y * CHUNK_RESOLUTION
            key = f'{x * JS_CHUNK_SIZE}_{y * JS_CHUNK_SIZE}'
            Chunk(cid=cid, pos_x=cx, pos_y=cy, key=key).build()
            cid += 1


if __name__ == '__main__':
    start_time = int(time())
    main()
