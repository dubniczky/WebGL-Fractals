uniform sampler2D Palette;
uniform bool ReversePalette;

uniform vec2 Resolution;
uniform vec2 Offset;
uniform vec2 Zoom;
uniform float Time;


void main()
{
    float t = (sin(Time / 1000.0) + 1.0) * 0.5;

    //Coords
    vec2 off = Offset.xy;
    vec2 pos = gl_FragCoord.xy / Resolution.xy - vec2(.5);
    float x0 = off.x + (pos.x) * Zoom.y;
    float y0 = off.y + (pos.y) * Zoom.y;

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
    float percentr = (ReversePalette) ? percent : 1.0 - percent;

    //Apply palette
    vec4 texLayer = texture2D(Palette, vec2(percentr, 1.));

    //Apply wave
    if (i != limit)
    {
        float timePercent = sin(fract((Time) * speed));
        float reverse = 1. - timePercent;
        if (timePercent - percent < 0.05 && timePercent - percent > 0.)
        {
            texLayer += vec4(vec3(0.1) * reverse, 1.0);
        }
        if (abs(timePercent - percent) < 0.01)
        {
            texLayer += vec4(vec3(0.2) * reverse, 1.0);
        }
        
    }
    
    gl_FragColor = texLayer;
}