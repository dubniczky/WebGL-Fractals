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
    return fract(sin(x * 5389934.23546 + time + 2.9820384) * sin(x * 42358.0912783 + time + 2.9820384));
}

//Spiral tube
float modulation6(float x, float time)
{
    return fract(sin(x * 58934.23546 + time));
}

float random(vec2 point, float time)
{
    return fract(sin(dot(point.xy, vec2(7.12734, 799.1235))) * 612356.123964);
}



void main()
{
    const float treshold = 0.005;

    vec2 pos = pos.xy;

    //float s = modulation1(pos.x, time);
    //float s = modulation2(pos.x, time);
    //float s = modulation3(pos.x, time);
    //float s = modulation4(pos.x, time);
    //float s = modulation5(pos.x, time);

    /*
    vec3 color;
    if (abs(s - pos.y) < treshold)
    {
        color = vec3(1.);
    }
    else
    {
        color = vec3(0.);
    }*/

    float x = random(pos, time);

    vec3 color = vec3(x);

    gl_FragColor = vec4(color, 1.);
}