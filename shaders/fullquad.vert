varying vec3 pos; 

void main()
{
    pos = position;
    gl_Position = vec4(position, 1);
}