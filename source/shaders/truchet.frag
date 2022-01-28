@include "./uniform.frag"

#define PI 3.14159265358979323846


float random (in vec2 _st)
{
    return fract(sin(dot(_st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

vec2 truchet(in vec2 _st, in float _index)
{
    _index = fract(((_index - 0.5) * 2.0));
    if (_index > 0.75)
    {
        _st = vec2(1.0) - _st;
    }
    else if (_index > 0.5)
    {
        _st = vec2(1.0-_st.x,_st.y);
    }
    else if (_index > 0.25)
    {
        _st = 1.0-vec2(1.0-_st.x,_st.y);
    }
    return _st;
}

void main()
{
    const int steps = 10;

    //coord
    vec2 coord = gl_FragCoord.xy / Resolution.xy;
    vec2 pcoord = coord * 20.0;
    pcoord.x += Time * 1.0;
    //pcoord *= 2. + sin(time);

    //Layers
    float intensity = 0.;
    for (int i = 0; i < steps; i++)
    {
        vec2 ipos = floor(pcoord);  // integer
        vec2 fpos = fract(pcoord);  // fraction
        vec2 tile = truchet(fpos, random( ipos ));


        float trustep = smoothstep(tile.x-0.1,tile.x,tile.y) -
                        smoothstep(tile.x,tile.x+0.1,tile.y);


        if (i == 0)
        {
            intensity += trustep;
        }
        else
        {
            intensity += trustep * .2 / float(i) * 3.;
        }

        pcoord.y += .05;
    }

    

    //pcoord.y += (1. + sin(time)) / 2.;
    //pcoord.y += time / 2.;


    // Maze
    
    //Fade out
    //intensity *= coord.x * 2.;


    vec3 color = vec3(intensity);

    float mouseDistance = distance(MousePosition, coord.xy);
    if (mouseDistance < .1 && intensity >= 0.9)
    {
        color.xyz = vec3(0.);
    }
    //color *= mouseDistance / 3.;
    

    // Truchet (2 triangles)
    //color += step(tile.x,tile.y) * 0.08;

    gl_FragColor = vec4(vec3(color),1.0);
}