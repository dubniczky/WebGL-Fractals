@include "./uniform.frag"

#define PI 3.14159265359
#define PI2 6.28318530718

void main()
{
    vec2 st = gl_FragCoord.xy/Resolution.xy;
    st.x *= Resolution.x/Resolution.y;
    vec3 color = vec3(0.0);

    // Remap the space to -1. to 1.
    st = (st * 2.) - 1.;

    // Angle from current pixel
    float a = atan(st.x, st.y) + PI;
    // Radius from current pixel
    float r = PI2 / Time;

    // Modulate the distance using shaping function
    float d = cos( (floor( .5 + (a / r) ) * r) - a ) * length(st);

    // Calculate pixel color
    color = vec3(1.0 - smoothstep(.4, .401, d));

    gl_FragColor = vec4(color,1.0);
}