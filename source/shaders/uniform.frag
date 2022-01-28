#ifdef GL_ES
    precision mediump float;
#endif

uniform sampler2D Palette;
uniform bool ReversePalette;

uniform vec2 Resolution;
uniform vec2 Offset;
uniform vec2 Zoom;
uniform float Time;