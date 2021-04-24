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
    float x0 = offset.x + (pos.x * (size.x / size.y)) * zoom;
    float y0 = offset.y + (pos.y) * zoom;

    float x = 0.0;
    float y = 0.0;
    int i = 0;
    int limit = 4000;

    while (x*x + y*y <= 4.0 && i < limit)
    {
        float temp = x*x - y*y + x0 ;
        y = 2.0 * x * y + y0;
        x = temp;
        i++;
    }
        
   
    if (i == limit)
    {
        gl_FragColor = vec4(emptyColor, 1.0);
    }
    else if (float(i) < float(limit) * 0.01)
    {
        gl_FragColor = vec4(emptyColor, 1.0);
    }
    else if (float(i) > float(limit) * 0.95)
    {
        float shade = float(i) / float(limit);
        gl_FragColor =
            vec4(
                1.0 - shade,
                1.0 - shade,
                0.6,
                1.0);
    }
    else
    {
        float shade = float(i) / float(limit);
        gl_FragColor =
        vec4(
            shade,
            shade,
            0.6,
            1.0);
    }
}