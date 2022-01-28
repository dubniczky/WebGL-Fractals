@include "./uniform.frag"

#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359
#define TWO_PI 6.28318530718

// Reference to
// http://thndl.com/square-shaped-shaders.html

void main()
{
    vec2 st = gl_FragCoord.xy/Resolution.xy;
    st.x *= Resolution.x/Resolution.y;
    vec3 color = vec3(0.0);

    // Remap the space to -1. to 1.
    st = st *2.-1.;

    // Number of sides of your shape
    //int N = 3;

    // Angle and radius from the current pixel
    float a = atan(st.x,st.y)+PI;
    //float r = TWO_PI/float(N);
    float r = TWO_PI / Time;

    // Shaping function that modulate the distance
    float d = cos(floor(.5+a/r)*r-a)*length(st);

    color = vec3(1.0-smoothstep(.4,.41,d));
    // color = vec3(d);

    gl_FragColor = vec4(color,1.0);
}