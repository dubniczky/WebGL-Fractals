
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
var palettes = []
var currentPalette = 0
var reversePalette = false
var stats = null

//Effects
var linZoom = 1
var relZoom = 1
var mousePos = new Three.Vector2(0, 0)
var mouseDown = false
var offset = null


async function main()
{
    canvas = document.getElementById('main-canvas')

    
    //Setup camera
    setupDefaults()
	camera = new Three.OrthographicCamera( -1, 1, 1, -1, 0, 1 )
	camera.position.z = 1

	//Setup scene
    scene = new Three.Scene()

    var vertex = await (await fetch('../shaders/fullquad.vert')).text()
    var fragment = await (await fetch('../shaders/mandelbrot-3d.frag')).text()

    palettes.push(new Three.TextureLoader().load('./palettes/magma-palette.png'))
    palettes.push(new Three.TextureLoader().load('./palettes/magenteal-palette.png'))
    palettes.push(new Three.TextureLoader().load('./palettes/rainbow-palette.png'))

    let uniforms =
    {
        size:           { type: 'vec2',  value: new Three.Vector2(window.innerWidth, window.innerHeight) },
        offset:         { type: 'vec2',  value: offset },
        relZoom:        { type: 'float', value: relZoom },
        linZoom:        { type: 'float', value: 1.0 },
        time:           { type: 'float', value: 0 },
        palette:        { type: 't',     value: palettes[0] },
        reversePalette: { type: 'bool',  value: reversePalette },
    }

    let geometry = new Three.PlaneBufferGeometry(2, 2)
    let material =  new Three.ShaderMaterial(
    {
        uniforms: uniforms,
        fragmentShader: fragment,
        vertexShader: vertex,
    })

    

    mesh = new Three.Mesh(geometry, material)
    scene.add(mesh)
    objects.push(mesh)

    //Setup renderer
	renderer = new Three.WebGLRenderer( { antialias: true, canvas } )
	renderer.setSize( window.innerWidth, window.innerHeight, false )
	renderer.setAnimationLoop( render )

    //Setup events
    window.addEventListener('resize', (e) => onWindowResized(e))
    canvas.addEventListener('mousewheel', (e) => onMouseScroll(e))
    canvas.addEventListener('mousemove', (e) => onMouseMove(e))
    canvas.addEventListener('mousedown', (e) => onMouseDown(e))
    canvas.addEventListener('mouseup', (e) => onMouseUp(e))
    window.addEventListener('keydown', (e) => onKeyDown(e))

    stats = createStats()
    document.body.appendChild( stats.domElement )
}

function setupDefaults()
{
    //edge
    //relZoom = 0.0021746731908035134
    //offset = new Three.Vector2(-0.8465005331231863, 0.20450787381815994)

    //flower
    relZoom = 0.009554277742566964
    offset = new Three.Vector2(-0.37432304500407854, 0.6598041393699959)

    //relZoom = 0.0007435497
    //offset = new Three.Vector2(-0.7435669, 0.1314023)
    
}


//Render loop
function render(time)
{
    mesh.material.uniforms.time.value = time / 1000.0
	renderer.render( scene, camera )
    stats.update()
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
        relZoom *= 0.8
        linZoom -= .25
    }
    else
    {
        relZoom *= 1.2
        linZoom += .25
    }
    
    mesh.material.uniforms.linZoom.value = linZoom
    mesh.material.uniforms.relZoom.value = relZoom
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
function onKeyDown(e)
{
    switch (e.code)
    {
        case "KeyP":
            updatePalette(currentPalette + 1)
            break;
        case "KeyR":
            updatePaletteReverse()
            break;
    }
}


//Methods
function createStats()
{
    var stats = new Stats();
    stats.setMode(0);

    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0';
    stats.domElement.style.top = '0';

    return stats;
  }
function updateOffset(direction)
{
    offset.x -= direction.x * relZoom * 0.002
    offset.y += direction.y * relZoom * 0.002

    mesh.material.uniforms.offset.value = offset
}
function updatePalette(newIndex = 0)
{
    currentPalette = newIndex % palettes.length
    mesh.material.uniforms.palette.value = palettes[currentPalette]
}
function updatePaletteReverse()
{
    reversePalette = !reversePalette
    mesh.material.uniforms.reversePalette.value = reversePalette
}


//Begin
main()