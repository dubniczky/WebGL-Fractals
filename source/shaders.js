import mandelbrot from './shaders/mandelbrot.frag'
import mandelbulb from './shaders/mandelbulb.frag'
import discretebodies from './shaders/discretebodies.frag'
import mellowbodies from './shaders/mellowbodies.frag'
import noise from './shaders/noise.frag'
import rainbowflower from './shaders/rainbowflower.frag'
import circleapprox from './shaders/circleapprox.frag'
import smears from './shaders/smears.frag'
import truchet from './shaders/truchet.frag'
import wave from './shaders/wave.frag'

import fullquad from './shaders/fullquad.vert'

export default {
    vertex: fullquad.sourceCode,
    fragment: [
        { name: 'mandelbrot', source: mandelbrot.sourceCode },
        { name: 'mandelbulb', source: mandelbulb.sourceCode },
        { name: 'discretebodies', source: discretebodies.sourceCode },
        { name: 'mellowbodies', source: mellowbodies.sourceCode },
        { name: 'noise', source: noise.sourceCode },
        { name: 'rainbowflower', source: rainbowflower.sourceCode },
        { name: 'circleapprox', source: circleapprox.sourceCode },
        { name: 'smears', source: smears.sourceCode },
        { name: 'truchet', source: truchet.sourceCode },
        { name: 'wave', source: wave.sourceCode },
    ]
}