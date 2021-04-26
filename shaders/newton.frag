uniform vec3 emptyColor; 

uniform vec2 size;
uniform vec2 offset;
uniform float zoom;
uniform float time;

in vec3 pos;

void main()
{
    float t = (sin(time / 1000.0) + 1.0) * 0.5;

    //Coords
    float x0 = 3.0 * (0.0 + (pos.x * (size.x / size.y)) * 1.0);
    float y0 = 2.0 * (0.0 + (pos.y) * 1.0);

    vec2 z;
    z.x = 5.0;
    z.y = 0.0;

    float x;
    float y;

    int i;
    int limit = 100;
    for(i=0; i < limit; i++)
    {
        x = (z.x * z.x - z.y * z.y) + x0;
        y = (z.y * z.x + z.x * z.y) + y0;

        if((x * x + y * y) > 4.0) break;
        z.x = x;
        z.y = y;
    }
   
    gl_FragColor = vec4(float(i) / float(limit), 0.0, 0.0, 1.0);
}