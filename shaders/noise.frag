uniform vec3 emptyColor; 
uniform sampler2D palette;
uniform int paletteDirection;

uniform vec2 size;
uniform vec2 offset;
uniform float linZoom;
uniform float relZoom;
uniform float time;
uniform bool reversePalette;

in vec3 pos;


float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))
                 * 43758.5453123);
}

// 2D Noise based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth Interpolation

    // Quintic Interpolation Curve.
    vec2 u = f * f * f * (f * (f * 6. -15.) + 10.);
    
    // Mix 4 coorners percentages
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

void main()
{
    vec2 st = gl_FragCoord.xy / size.xy * 5.;


    float intensity;
    intensity += smoothstep(.15, .2,noise(st * 10. + time)); // Black splatter
    intensity -= smoothstep(.35, .4,noise(st * 10. + time)); // Holes on splatter
    intensity += smoothstep(.55, .8,noise(st * 10. + time));
    intensity += smoothstep(.65, 1.,noise(st * 10. + time));
    
    
    vec4 color = texture2D(palette, vec2(intensity, 1.));

    gl_FragColor = vec4(vec3(color), 1.0);
}