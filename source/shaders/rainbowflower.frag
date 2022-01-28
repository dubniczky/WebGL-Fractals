@include "./uniform.frag"

#define TWO_PI 6.28318530718

vec3 hsb2rgb(in vec3 c)
{
    vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0),
                             6.0) - 3.0) - 1.0,
                     0.0,
                     1.0 );
    rgb = rgb * rgb * (3.0 - 2.0 * rgb);
    return c.z * mix( vec3(1.0), rgb, c.y );
}

float sinw(in float x)
{
    return (1. * sin(x)) / 2.;
}

void main()
{
    vec2 st = gl_FragCoord.xy / Resolution;
    st.x *= Resolution.x / Resolution.y;

    //Convert to polar
    vec2 toCenter = vec2(0.5) - st;
    float angle = atan(toCenter.y, toCenter.x);
    float radius = length(toCenter) * 2.0;

    //Flower shape
    float morph = 1. + sinw(Time);
    float f = abs(cos(angle * 18.) * sin(angle * 3. * morph)) * .8 * morph + .1;

    //Calc color
    vec3 color = hsb2rgb(vec3((angle / TWO_PI) + .5 + Time / 5., radius * 4., 1.));

    //Add to shape
    color *= 1. - smoothstep(f,f + 0.02, radius);


    gl_FragColor = vec4(color, 1.0);
}