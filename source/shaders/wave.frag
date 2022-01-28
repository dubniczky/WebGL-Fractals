@include "./uniform.frag"

#define LINE_THRESHOLD 0.005

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
    // Get position
    vec2 pos = gl_FragCoord.xy;
    // Warp to normalize screen space
    pos = pos / vec2(Resolution.x, Resolution.y);
    // Transform sin range to position set
    pos = (pos - .5) * 2.;

    float s1 = modulation1(pos.x, Time);
    //float s = modulation2(pos.x, Time);
    //float s = modulation3(pos.x, Time);
    float s2 = modulation4(pos.x, Time);
    //float s = modulation5(pos.x, Time);

    
    vec3 color = vec3(0.);
    if (abs(s1 - pos.y) < LINE_THRESHOLD)
    {
        color = vec3(.25);
    }
    if (abs(s2 - pos.y) < LINE_THRESHOLD)
    {
        color = vec3(1.);
    }

    gl_FragColor = vec4(color, 1.);
}