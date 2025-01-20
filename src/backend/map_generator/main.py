from time import time
from os import environ
from json import dumps as json_dumps

from config import *
from to_img import create_map_img


class Chunk:
    def __init__(self, cid: int, key: str, pos_x: int, pos_y: int):
        self.cid = cid
        self.pos_x = pos_x
        self.pos_y = pos_y
        self.key = key
        self.area = CHUNK_RESOLUTION * CHUNK_RESOLUTION
        self.data = []
        self.max_height = 0
        self.min_height = 0
        self.export_file = f"{EXPORT_PATH}/{key}"
        self._noise_kwargs = dict(
            size=CHUNK_RESOLUTION,
            pos_x=self.pos_x,
            pos_y=self.pos_y,
            mirror='x',
            rotate='90cw',
            no_coords=True,
        )

    def _export(self):
        with open(f'{self.export_file}.json', 'w', encoding='utf-8') as f:
            f.write(json_dumps({'data': self.data, 'max': self.max_height}))

        with open(f"{self.export_file}.txt", 'w', encoding='utf-8') as f:
            f.write(f'{int(time())}')

    def build(self):
        if not FORCE_REGEN and Path(f'{self.export_file}.json').is_file():
            return

        print(
            f"{self.cid} | Processing map: size {CHUNK_RESOLUTION} data-density {self.area} "
            f"at {self.key}"
        )

        print(f'{self.cid} | Generating map..')
        geo = NOISE_GEO.get_2d_array(
            lower_by=NOISE_GEO_LOWER_BY,
            **self._noise_kwargs,
        )
        terrain = NOISE_TERRAIN.get_2d_array(**self._noise_kwargs)

        self.max_height = geo['max'] + terrain['max']
        self.min_height = geo['min'] + terrain['min']

        for i in range(len(geo['data'])):
            self.data.append(geo['data'][i] + terrain['data'][i])

        print(f'{self.cid} | Exporting as JSON.. ({int(time())-start_time}s)')
        self._export()

        if ENV_KEY_IMG_EXPORT not in environ or environ[ENV_KEY_IMG_EXPORT] == '1':
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
            # NOTE: -1 because we need to use the same heights on all chunk-edges
            cx, cy = x * (CHUNK_RESOLUTION - 1), y * (CHUNK_RESOLUTION - 1)
            key = f'{x * JS_CHUNK_SIZE}_{y * JS_CHUNK_SIZE}'
            Chunk(cid=cid, pos_x=cx, pos_y=cy, key=key).build()
            cid += 1


if __name__ == '__main__':
    start_time = int(time())
    main()
