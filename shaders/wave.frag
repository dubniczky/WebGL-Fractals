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

//Sin wave
float modulation1(float x, float time)
{
    return sin(x * 5. + time);
}

//Falling
float modulation2(float x, float time)
{
    return sin(x * 5. + time) * cos(x * 3. + time);
}

//Alternating
float modulation3(float x, float time)
{
    return sin(x * 5. + time) * cos(x * .5 + time);
}

//Subspirals
float modulation4(float x, float time)
{
    return sin(x * 58934.23546 + time) * cos(x * 94.14653 + time);
}

//Spiral tube
float modulation5(float x, float time)
{
    return fract(sin(x * 58934.23546 + time));
}

//Spiral tube
float modulation6(float x, float time)
{
    return fract(sin(x * 58934.23546 + time));
}



void main()
{
    const float treshold = 0.005;

    vec2 pos = pos.xy;

    //float s = modulation1(pos.x, time);
    //float s = modulation2(pos.x, time);
    //float s = modulation3(pos.x, time);
    //float s = modulation4(pos.x, time);
    float s = modulation5(pos.x, time);

    vec3 color;
    if (abs(s - pos.y) < treshold)
    {
        color = vec3(1.);
    }
    else
    {
        color = vec3(0.);
    }

    gl_FragColor = vec4(color, 1.);
}