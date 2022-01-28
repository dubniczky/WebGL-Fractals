#ifdef GL_ES
    precision mediump float;
#endif

// View
uniform vec2 Resolution;
uniform vec2 Offset;
uniform vec2 Zoom;

// Engine
uniform float Time;

// Palette
uniform sampler2D Palette;
uniform bool ReversePalette;

// Mouse
uniform vec2 MousePosition;
uniform bool MouseLeftDown;
uniform bool MouseRightDown;