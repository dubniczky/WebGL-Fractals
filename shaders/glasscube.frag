

uniform vec3 emptyColor; 
uniform sampler2D palette;
uniform int paletteDirection;

uniform vec2 size;
uniform vec2 offset;
uniform float linZoom;
uniform float relZoom;
uniform float time;
uniform bool reversePalette;



#define ROTATE(a)            mat2(cos(a), sin(a), -sin(a), cos(a))
#define PI                3.141592654
#define TAU               (2.0*PI)
#define L2(x)             dot(x, x)


const float CMiss  = 256.;
const float CThird = 1.0 / 3.0;
const int CMarbleShine = 10;
const int CMarbleLayers = 64;
const float CSurfaceDifferential = 0.01;
const float CSMarchScale = 0.005;

const float refractionIndex = 0.85;
const vec3  lightPosition   = 2.0 * vec3(1.5, 2.0, 1.0);
const vec3  lightColor      = vec3(.9, .8, .7);


//Cube Root
float cubeRoot(float x)
{
    return pow(x, CThird);
}

// Optimized HSV to RGB Conversion
// Originally from: https://stackoverflow.com/questions/15095909/from-rgb-to-hsv-in-opengl-glsl
vec3 hsv2rgb(vec3 hsv)
{
    vec4 k = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(hsv.xxx + k.xyz) * 6.0 - k.www);
    return hsv.z * mix(k.xxx, clamp(p - k.xxx, 0.0, 1.0), hsv.y);
}

// Ray Cube External Intersection
// https://www.iquilezles.org/www/articles/intersectors/intersectors.htm
float externalRaySphereIntersect(vec3 ro, vec3 rd, float ra)
{
    //directions
    vec3 rd2 = rd * rd;
    vec3 ro2 = ro * ro;

    //k
    float ka = 1. / dot(rd2, rd2);
    float k0 = ka * (dot(ro2,ro2) - ra * ra * ra * ra);
    float k1 = ka * dot(ro2 * ro,rd);
    float k2 = ka * dot(ro2, rd2);
    float k3 = ka * dot(ro, rd2 * rd);
    float k32 = k3 * k3;
    float k33 = k32 * k3;

    //c
    float c0 = k0 - 3. * k33 * k3 + 6. * k32 * k2 - 4. * k3 * k1;
    float c1 = k1 + 2. * k33 - 3. * k3 * k2;
    float c2 = k2 - k32;
    float c22 = c2 * c2;    

    float q = c22 * c2 - c2 * c0 + c1 * c1;
    float h = q*q - pow(c22 + c0 * 0.57, 3.);

    if (h < 0.) //Outside ray cube
    {
        return CMiss;
    }

    float h_2 = sqrt(h);
    float pos = sign(q + h_2) * cubeRoot(abs(q + h_2));
    float neg = sign(q - h_2) * cubeRoot(abs(q - h_2));

    vec2 comp = vec2( (pos + neg) + c2 * 4.0, (pos - neg) * sqrt(3.) ) * .5;
    float len = length(comp);

    return - abs(comp.y) / sqrt(len + comp.x) - k3 - c1 / len;
}


// Ray Cube Internal Intersection with inverse outer intersection
float internalRaySphereIntersect(vec3 ro, vec3 rd, float ra)
{
    vec3 reverseRo = ro + rd * ra * 4.;
    vec3 reverseRd = - rd;

    float rt = externalRaySphereIntersect(reverseRo, reverseRd, ra);

    if (rt == CMiss)
    {
        return CMiss;
    }
    else
    {
        return length(reverseRo + reverseRd * rt - ro);
    }
}

float marbleDifferential(vec3 p)
{  
    float result = 0.;
    vec3 c = p;
    float scale = 0.78;

    for (int i = 0; i < CMarbleShine; i++)
    {
        p    = scale * abs(p) / dot(p, p) - scale;
        p.yz = vec2(p.y * p.y - p.z * p.z, 2. * p.y * p.z);        
        p    = p.zxy;
        result += exp(-17. * abs(dot(p, c)));
    }

    return result;
}

vec3 marbleMarch(vec3 ro, vec3 rd, vec2 tminmax)
{
    float tmin = tminmax.x;
    float tmax = tminmax.y;

    float t  = tmin;
    vec3 col = vec3(0.);
    float c  = 0.;

    for (int i = 0; i < CMarbleLayers && t < tmax; ++i)
    {
        t += CSurfaceDifferential * exp(-2. * c);
        c = marbleDifferential(ro+t*rd) * 0.5; 
            
        vec2 position = (ro + t * rd).xy;
        float dist = ( abs(position.x + position.y -.15) ) * 10.;
        float c2 = c * c;

        col += vec3(c2 * c - c * dist, c2 - c, c);
    }

    return col * exp(-10. * (t - tmin) / (tmax - tmin)) * CSMarchScale;
}


vec3 render(vec3 ro, vec3 rd)
{
    vec3 col = vec3(0.0);
    float t   = CMiss;
    float ext = externalRaySphereIntersect(ro, rd, 0.5);

    if (ext < CMiss) //Ray hit marble
    {
        t = ext;
        vec3 pos  = ro + ext * rd;
        vec3 nor  = normalize(pos * pos * pos);
        vec3 refr = refract(rd, nor, refractionIndex);
        vec3 refl = reflect(rd, nor);
        float fre = mix(0.0, 1.0, pow(1.0-dot(-rd, nor), 4.0));

        vec3 lv   = lightPosition - pos;
        float ll2 = L2(lv);
        float ll  = sqrt(ll2);
        vec3 ld   = lv / ll;

        float dm  = min(1.0, 40.0/ll2);
        float dif = pow(max(dot(nor,ld),0.0), 8.0)*dm;
        float spe = pow(max(dot(reflect(-ld, nor), -rd), 0.), 100.);
        float l   = dif;

        float lin = mix(0.0, 1.0, l);
        const vec3 lcol = 2.0*sqrt(lightColor);
        col = marbleMarch(pos, refr, vec2(0., internalRaySphereIntersect(pos, refr, 0.5)));
        vec3 diff = hsv2rgb(vec3(0.7, fre, 0.075*lin))*lcol;
        col += fre+diff+spe*lcol;
        
    }
    else //Ray missed marble
    {
        return vec3(0.6, 0.6, 1.);
    }

    return col;
}

vec3 effect(vec2 p, vec2 q)
{ 
    vec3 ro = 0.6*vec3(2.0, 0, 0.2)+vec3(0.0, 0.75, 0.0);
    ro.xz *= ROTATE(PI / 2.0 + sin(time*0.05));
    ro.yz *= ROTATE(0.5 + 0.25 * sin(time * 0.05 * sqrt(0.5)) * 0.5);

    vec3 ww = normalize(vec3(0.0, 0.0, 0.0) - ro);
    vec3 uu = normalize(cross( vec3(0.0,1.0,0.0), ww));
    vec3 vv = normalize(cross(ww,uu));
    float rdd = 2.0;
    vec3 rd = normalize( p.x*uu + p.y*vv + rdd*ww);

    vec3 col = render(ro, rd);
    return col;
}

vec3 postProcess(vec3 col, vec2 q)
{
  col = clamp(col, 0.0, 1.0);
  col = pow(col, vec3(1.0/2.2));
  col = col*0.6+0.4*col*col*(3.0-2.0*col);
  col = mix(col, vec3(dot(col, vec3(0.33))), -0.4);
  col *=0.5+0.5*pow(19.0*q.x*q.y*(1.0-q.x)*(1.0-q.y),0.7);
  return col;
}

void main()
{
    vec2 q = gl_FragCoord.xy/size.xy;
    vec2 p = q * 2. - 1.;
    p.x *= size.x/size.y;

    vec3 col = effect(p, q);
    col = postProcess(col, q);

    gl_FragColor = vec4(col, 1.0);
}
