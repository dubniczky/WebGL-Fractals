import mandelbrot from './shaders/mandelbrot.frag'
import mandelbulb from './shaders/mandelbulb.frag'
import discretebodies from './shaders/discretebodies.frag'
import mellowbodies from './shaders/mellowbodies.frag'
import noise from './shaders/noise.frag'
import rainbowflower from './shaders/rainbowflower.frag'
import random from './shaders/random.frag'
import raymarch from './shaders/raymarch.frag'
import shapes from './shaders/shapes.frag'
import smears from './shaders/smears.frag'
import truchet from './shaders/truchet.frag'
import wave from './shaders/wave.frag'

export default {
    shaders: [
        { name: 'mandelbrot', source: mandelbrot },
        { name: 'mandelbulb', source: mandelbulb },
        { name: 'discretebodies', source: discretebodies },
        { name: 'mellowbodies', source: mellowbodies },
        { name: 'noise', source: noise },
        { name: 'rainbowflower', source: rainbowflower },
        { name: 'random', source: random },
        { name: 'raymarch', source: raymarch },
        { name: 'shapes', source: shapes },
        { name: 'smears', source: smears },
        { name: 'truchet', source: truchet },
        { name: 'wave', source: wave },
    ]
}