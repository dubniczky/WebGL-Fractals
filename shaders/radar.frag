uniform vec3 emptyColor; 
uniform sampler2D palette;
uniform int paletteDirection;

uniform vec2 size;
uniform vec2 offset;
uniform float linZoom;
uniform float relZoom;
uniform float time;
uniform bool reversePalette;

#define M_PI 3.1415926535897932384626433832795

const vec3 green1 = vec3(.39, .9, .55);
const vec3 green2 = vec3(.28, 1., .42);
const vec3 gray1 = vec3(.21, .27, .19);
const vec3 red1 = vec3(1., .39, .23);

//Helpers
float blink(in float time, in float interval)
{
    return step(fract(time * interval), .5);
}

vec2 move(vec3 pos, float dist, float time)
{
    return vec2(pos.x * cos(time) + pos.y * cos(0.1 * time),
                pos.z * sin(time) + dist * cos(0.1 * time));
}

float smooths(in float x, in float y)
{
    return 1. - smoothstep(y - 1., y + 1., x);
}

//Shapes
float drawPlus(vec2 dist, float radius, float width)
{
    if (length(dist) > radius) return 0.;

    if (abs(dist.x - dist.y) < width || abs(dist.x + dist.y) < width)
    {
        return 1.;
    }

    return 0.;
}

float drawCircle(vec2 dist, float radius, float width)
{
    float r = length(dist);
    return smooths(r - width / 2.0, radius) - 
           smooths(r + width / 2.0, radius);
}

float drawDot(vec2 pos, float radius)
{
    return step(length(pos), radius);
}

float drawLine(vec2 dist, float radius, float width, float time)
{
    float theta0 = 90. * time;
    float rad = length(dist) * 2.;
    float r = sqrt( dot( dist, dist ) );
    
    //Distance
    vec2 line = radius * vec2(cos(theta0 * M_PI / 180.),
                                -sin(theta0 * M_PI / 180.));
    float l = length( dist - line * clamp( dot(dist, line) / dot(line, line), 0., 1.) );
    dist = normalize(dist);

    //Color
    float theta = mod(180.0 * atan(dist.y, dist.x) / M_PI + theta0,360.0);
    float gradient = clamp(1.0 - theta / 90.0, 0.0, 1.0);
    float res = smooths(l, 1.0) + 0.5 * gradient;

    if (r < radius)
    {
        return res;
    }
    else
    {
        return res * .2;
    }
}

float drawTarget(vec2 dist, vec3 dir, float len, float time)
{
    float intensity = 0.;
    vec2 targetCenter = dist + 130.0 * move(dir, len, 3.0 + 0.1 * time);

    intensity += drawDot(targetCenter, 8.) * blink(time, 4.); //Dot
    intensity += drawCircle(targetCenter, 13., 2.); //Border
    intensity += drawCircle(targetCenter, 12. + 50. * fract(time), 2.); //Radar
    return intensity;
}



void main()
{
    vec2 uv = gl_FragCoord.xy;
    vec2 center = size.xy * .5;
    vec2 dist = uv - center;
    vec3 color = vec3(0.);

    //Plus
    color += drawPlus(dist, 350., 2.) * gray1;

    //Circles
    color += drawCircle(dist, 15., .5) * green1;
    color += drawCircle(dist, 150., 1.) * green1;
    color += drawCircle(dist, 250., 1.) * green1;
    color += drawCircle(dist, 350., 4.) * green2;

    //Line
    color += drawLine(dist, 350., 1., time) * green2;

    //Center dot
    color += drawDot(dist, 6.) * green1;

    //Target
    float target = 0.;
    target += drawTarget(dist, vec3(1.3, 1.0, 0.9), 1.4, time);
    target += drawTarget(dist, vec3(0.2, -0.8, -0.3), 0.7, time);
    target += drawTarget(dist, vec3(-0.7, 0.8, 2.3), 0.7, time);

    if (target > 0.)
    {
        color = target * red1;
    }

    

    gl_FragColor = vec4(color, 1.);
}