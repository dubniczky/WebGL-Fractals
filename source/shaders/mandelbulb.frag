//Uniforms
@include "./uniform.frag"

#define DIFFERENTIAL_LIMIT 30
#define RADIUS_LIMIT 2.
#define WARP_SPEED .2
#define REFERENCE_DIRECTION vec3(-1.0, 0.0, 0.0)
#define MAX_MARCHING_STEPS 128
#define DISTANCE_LOWER_LIMIT 0.0001
#define FIELD_OF_VIEW 50.
#define ZOOM .5
#define CAMERA_OFFSET -.5
#define TARGET_OFFSET vec3(0.)


//Convert from carthesian to polar unit coordinate
vec3 polToCar(vec2 polar)
{
    float x = sin(polar.x) * cos(polar.y);
    float y = sin(polar.y) * sin(polar.x);
    float z = cos(polar.x);
    return vec3(x, y, z);
}


//Convert from polar to carthesian unit coordinate
vec2 carToPol(vec3 carte, float radius)
{
    float x = acos(carte.z / radius);
    float y = atan(carte.y, carte.x);
    return vec2(x, y);
}


//Solve mandeblrot differential equation at this position
float mandelbrotDifferential(vec3 pos, float time, inout float totalLength)
{
    const int DifferentialLimit = DIFFERENTIAL_LIMIT;
    const float RadiusLimit = RADIUS_LIMIT;
    const float WarpSpeed = WARP_SPEED;

    vec3 z = pos;
    float power = (9. + sin(time * WarpSpeed) * 5.);    
    float rad = length(z);
    float drad = 1.;

    for (int i = 0; i < DifferentialLimit && rad < RadiusLimit; i++)
    {
        //Convert to polar
        vec2 polar = carToPol(z, rad);

        //Scale
        polar.x = polar.x * power;
        polar.y = polar.y * power;
        
        //Convert to cartesian
        vec3 cart = polToCar(polar);

        //Apply
        z = pow(rad, power) * cart + pos;        
        drad = pow(rad, power - 1.) * power * drad + 1.;
        rad = length(z);
        totalLength += rad;
    }
    
    return log(rad) * rad / drad / 2.;
}


// Calculate camera ray matrix transform components (orthonormal basis)
vec3 cameraRayDirection3(vec2 uv, vec3 camera, vec3 target, float fov)
{
    //Directions
    vec3 forward = normalize(target - camera);
    vec3 up = normalize(cross(forward, vec3(1., 0., 0.)));
    vec3 right = normalize(cross(up, forward));
    
    //Perpective
    float perspective = .5 / tan(radians(fov) / 2.0);
 
    //Orthonormal
    return normalize(uv.x * right + uv.y * up + forward * perspective);
}


//Raymarch mandelbrot
float marchMandelbrot(vec3 pos, vec3 dir, float close, float far, float time, inout int i, inout float lengthMin)
{
    float depth = close;
    float minDist = 100.;
    float dist = DISTANCE_LOWER_LIMIT + 1.;
    float totalLength = 0.;

    for(i = 0;
        i < MAX_MARCHING_STEPS &&
            depth < far &&
            dist > DISTANCE_LOWER_LIMIT;
        i++)
    {
        
        dist = mandelbrotDifferential(pos + dir * depth, time, totalLength);
        depth += dist;
        if (dist < minDist)
        {
            minDist = dist;
        }
        if (lengthMin > totalLength) lengthMin = totalLength;
    }

    return totalLength;
}


//Main
void main()
{
    //Constants
    const float CameraOffset = CAMERA_OFFSET;
    const vec3 TargetOffset = TARGET_OFFSET;
    const float zoom = ZOOM;
    const float fov = FIELD_OF_VIEW;

    //Get coordinates
    vec2 uv = (gl_FragCoord.xy / Resolution.xy + CameraOffset) / zoom;
    uv.x *= Resolution.x / Resolution.y;
    float t = Time + 6.;
    vec3 campos = vec3(cos(t / 10.) * 1.5, sin(t / 15.), sin(t / 10.) * 1.5);
    vec3 direction = cameraRayDirection3(uv, campos, TargetOffset, fov);
    
    //Raymarch
    int i = 0;
    float len = 10000.;
    float dist = marchMandelbrot(campos, direction, 0.f, 200.f, t, i, len);
    float d = 1. - (dist * 50.);
    len /= 300.;

    //vec3 col = vec3(d, 0.9 * len, 0.7 * dist) * float(i) / float(MAX_MARCHING_STEPS);
    vec3 col = vec3(d, 0., float(i) / float(MAX_MARCHING_STEPS));
    

    //Apply color
    gl_FragColor = vec4(col, 1.);
}