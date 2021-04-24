
//DOM
const Three = THREE

var canvas

//Three
var camera
var scene
var renderer
var geometry
var material
var mesh
var objects = []

//Effects
var zoom = 1
var mousePos = new Three.Vector2(0, 0)
var mouseDown = false
var offset = null


async function main()
{
    canvas = document.getElementById('main-canvas')

    //Setup camera
    setupDefaults()
	camera = new Three.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
	camera.position.z = 1;

	//Setup scene
    scene = new Three.Scene();

    var vertex = await (await fetch('../shaders/mandelbrot.vert')).text()
    var fragment = await (await fetch('../shaders/mandelbrot.frag')).text()

    let uniforms =
    {
        emptyColor: { type: 'vec3', value: new Three.Color(0x000000) },
        size: { type: 'vec2', value: new Three.Vector2(window.innerWidth, window.innerHeight) },
        offset: { type: 'vec2', value: offset },
        zoom: { type: 'float', value: zoom },
        time: { type: 'float', value: 0 }
    }

    let geometry = new Three.PlaneBufferGeometry(2, 2)
    let material =  new Three.ShaderMaterial({
        uniforms: uniforms,
        fragmentShader: fragment,
        vertexShader: vertex,
    })

    mesh = new Three.Mesh(geometry, material)
    scene.add(mesh)
    objects.push(mesh)

    //Setup renderer
	renderer = new Three.WebGLRenderer( { antialias: true, canvas } );
	renderer.setSize( window.innerWidth, window.innerHeight, false );
	renderer.setAnimationLoop( render );

    //Setup events
    window.addEventListener('resize', (e) => onWindowResized(e))
    canvas.addEventListener('mousewheel', (e) => onMouseScroll(e))
    canvas.addEventListener('mousemove', (e) => onMouseMove(e))
    canvas.addEventListener('mousedown', (e) => onMouseDown(e))
    canvas.addEventListener('mouseup', (e) => onMouseUp(e))
}
function setupDefaults()
{
    zoom = 0.0021746731908035134
    offset = new Three.Vector2(-0.8465005331231863, 0.20450787381815994)

    //zoom = 0.0007435497
    //offset = new Three.Vector2(-0.7435669, 0.1314023)
    
}


//Render loop
function render(time)
{
    mesh.material.uniforms.time.value = time
	renderer.render( scene, camera );
}


//Events
function onWindowResized(e)
{
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight

    renderer.setSize( canvas.width, canvas.height, false )
    camera.aspect = canvas.width / canvas.height
    camera.updateProjectionMatrix()
}
function onMouseScroll(e)
{
    //Normalize
    var delta = e.deltaY
    if (delta < 0)
    {
        zoom *= 0.8
    }
    else
    {
        zoom *= 1.2
    }
    
    mesh.material.uniforms.zoom.value = zoom
}
function onMouseMove(e)
{
    var pos = new Three.Vector2(e.x, e.y)

    if (mouseDown)
    {
        var dir = new Three.Vector2(e.x, e.y)
        dir.sub(mousePos)
        updateOffset(dir)
    }

    mousePos = pos
}
function onMouseDown(e)
{
    mouseDown = true
}
function onMouseUp(e)
{
    mouseDown = false
}

function updateOffset(direction)
{
    offset.x -= direction.x * zoom * 0.002
    offset.y += direction.y * zoom * 0.002

    mesh.material.uniforms.offset.value = offset
}


//Begin
main()