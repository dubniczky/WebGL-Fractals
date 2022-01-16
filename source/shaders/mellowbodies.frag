@include "./uniform.frag"

in vec3 pos;

vec2 random2( vec2 p )
{
    return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
}

void main()
{
    vec2 st = gl_FragCoord.xy / Resolution.xy;
    st.x *= Resolution.x / Resolution.y;
    float intensity = 0.;

    // Scale
    st *= 8. * (1. + Time / 10.);

    // Tile the space
    vec2 i_st = floor(st);
    vec2 f_st = fract(st);

    float minDistance = 1.;  // minimum distance

    for (int y = -1; y <= 1; y++)
    {
        for (int x = -1; x <= 1; x++)
        {
            // Neighbor place in the grid
            vec2 neighbor = vec2(float(x),float(y));

            // Random position from current + neighbor place in the grid
            vec2 point = random2(i_st + neighbor);

			// Animate the point
            point = 0.5 + 0.5*sin(Time + 6.2831*point);

			// Vector between the pixel and the point
            vec2 diff = neighbor + point - f_st;

            // Distance to the point
            float dist = length(diff);

            // Keep the closer distance
            minDistance = min(minDistance, dist);
        }
    }

    // Draw the min distance (distance field)
    intensity += minDistance;

    // Draw cell center
    //intensity += 1.-step(.02, m_dist);

    // Draw grid
    //color.r += step(.98, f_st.x) + step(.98, f_st.y);

    // Show isolines
    // color -= step(.7,abs(sin(27.0*m_dist)))*.5;

    vec4 texLayer = texture2D(Palette, vec2(1.0 - intensity, 1));

    gl_FragColor = texLayer;
}