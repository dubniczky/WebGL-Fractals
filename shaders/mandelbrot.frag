uniform vec3 emptyColor; 
uniform sampler2D palette;
uniform int paletteDirection;

uniform vec2 size;
uniform vec2 offset;
uniform float linZoom;
uniform float relZoom;
uniform float time;
uniform bool reversePalette;

in vec3 pos;

void main()
{
    float t = (sin(time / 1000.0) + 1.0) * 0.5;

    //Coords
    float x0 = offset.x + (pos.x * (size.x / size.y)) * relZoom;
    float y0 = offset.y + (pos.y) * relZoom;

    float x = 0.0;
    float y = 0.0;
    int i = 0;
    int limit = 100;

    while (x*x + y*y <= 4.0 && i < limit)
    {
        float temp = x*x - y*y + x0;
        y = 2.0 * x * y + y0;
        x = temp;
        i++;
    }
    const float speed = .3;
    float percent = float(i) / float(limit);
    float percentr = (reversePalette) ? percent : 1.0 - percent;

    //Apply palette
    vec4 texLayer = texture2D(palette, vec2(percentr, 1.));

    //Apply wave
    if (i != limit)
    {
        float timePercent = sin(fract((1. - time) * speed));
        if (timePercent - percent < 0.05 && timePercent - percent > 0.)
        {
            texLayer += vec4(vec3(0.1) * timePercent, 1.0);
        }
        if (abs(timePercent - percent) < 0.01)
        {
            texLayer += vec4(vec3(0.2) * timePercent, 1.0);
        }
        
    }
    
    
    //texLayer -= smoothstep(.15,.2,noise(vec2(x, y * 100.)));
    gl_FragColor = texLayer;
}