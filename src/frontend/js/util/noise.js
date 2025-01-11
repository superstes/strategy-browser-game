import { makeNoise2D } from "open-simplex-noise";

export const noise = (function() {

  class _OpenSimplexWrapper {
    constructor(seed) {
      this._noise = makeNoise2D(seed);
    }

    noise2D(x, y) {
      return this._noise(x, y);
    }
  }

  class _MapHeight {
    constructor(params) {
      this._params = params;
      this._noise = new _OpenSimplexWrapper(params.seed);
    }

    Get(x, y) {
      // todo: factor in valleys/rivers/lakes at noise-level
      const xs = x / this._params.scale;
      const ys = y / this._params.scale;
      const G = 2.0 ** (-this._params.persistence);
      let amplitude = 1.0;
      let frequency = 1.0;
      let normalization = 0;
      let total = 0;
      for (let o = 0; o < this._params.octaves; o++) {
        const noiseValue = this._noise.noise2D(
          xs * frequency, ys * frequency
        ) * 0.5 + 0.5;
        total += noiseValue * amplitude;
        normalization += amplitude;
        amplitude *= G;
        frequency *= this._params.lacunarity;
      }
      total /= normalization;
      return Math.pow(total, this._params.exponentiation) * this._params.height;
    }
  }

  return {
    MapHeight: _MapHeight
  }
})();
