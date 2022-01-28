import * as Three from 'three'
import * as Stats from 'stats-js'
import shaders from './shaders'


//Constants
const defaultShaderIndex = 0

//Engine
let fragments = null
let vertex = null
let canvas = null
let camera = null
let scene = null
let renderer = null
let geometry = null
let material = null
let mesh = null
let palettes = null
let currentPalette = null
let reversePalette = null
let stats = null
let uniforms = null
let shaderId = 0
let shaderTime = null
let zoom = {
    linear: 1.,
    exponential: 1.
}
let mousePos = new Three.Vector2(0, 0)
let mouseDown = false
let offset = null


export async function setup(canvasElement) {
    canvas = canvasElement
    if (canvas == null) {
        canvas = document.createElement('canvas')
        document.appendChild(canvas)
    }
    console.log('DOM loaded.')

    //Load shaders
    fragments = shaders.fragment
    vertex = shaders.vertex
   
    //Load textures
    const textureLoader = new Three.TextureLoader()
    palettes = []
    palettes.push(textureLoader.load('./palettes/magma-palette.png'))
    palettes.push(textureLoader.load('./palettes/magenteal-palette.png'))
    palettes.push(textureLoader.load('./palettes/rainbow-palette.png'))
    currentPalette = 0
    reversePalette = false
    console.log('Textures loaded.')

    //Setup scene
    scene = new Three.Scene()
    scene.autoUpdate = false
	camera = new Three.OrthographicCamera( -1, 1, 1, -1, 0, 1 )
	camera.position.z = 1
    console.log('Scene loaded.')
    
    setupDefaults()
    uniforms = {
        Resolution:     { type: 'vec2',  value: new Three.Vector2(window.innerWidth, window.innerHeight) },
        Offset:         { type: 'vec2',  value: offset },
        Zoom:           { type: 'vec2',  value: new Three.Vector2(zoom.linear, zoom.exponential) },
        Time:           { type: 'float', value: 0 },
        Palette:        { type: 't',     value: palettes[0] },
        ReversePalette: { type: 'bool',  value: reversePalette },
        MousePosition:  { type: 'vec2',  value: new Three.Vector2(0, 0) },
        MouseLeftDown:  { type: 'bool',  value: false },
        MouseRightDown: { type: 'bool',  value: false },
    }
    console.log('Uniforms loaded.')

    geometry = new Three.PlaneBufferGeometry(2, 2)
    applyShader(defaultShaderIndex)

    //Setup renderer
	renderer = new Three.WebGLRenderer({
        antialias: false,
        canvas: canvas,
        powerPerformance: 'high-performance',
        depth: false
    })
	renderer.setSize( window.innerWidth, window.innerHeight, false )
	renderer.setAnimationLoop( render )
    console.log('Renderer loaded.')

    //Setup events
    window.addEventListener('resize', (e) => onWindowResized(e))
    canvas.addEventListener('mousewheel', (e) => onMouseScroll(e))
    canvas.addEventListener('mousemove', (e) => onMouseMove(e))
    canvas.addEventListener('mousedown', (e) => onMouseDown(e))
    canvas.addEventListener('mouseup', (e) => onMouseUp(e))
    window.addEventListener('keydown', (e) => onKeyDown(e))
    console.log('Events loaded.')

    stats = createStats()
    document.body.appendChild( stats.domElement )
    console.log('Stats loaded.')
}

function setupDefaults() {
    //edge
    //relZoom = 0.0021746731908035134
    //offset = new Three.Vector2(-0.8465005331231863, 0.20450787381815994)

    //flower
    zoom.exponential = 0.009554277742566964
    offset = new Three.Vector2(-0.37432304500407854, 0.6598041393699959)

    //relZoom = 0.0007435497
    //offset = new Three.Vector2(-0.7435669, 0.1314023)
    
}


//Render loop
function render(time) {
    updateUniform('Time', (Date.now() - shaderTime) / 1000.0)
	renderer.render( scene, camera )
    stats.update()
}


//Events
function onWindowResized(e) {
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight

    renderer.setSize( canvas.width, canvas.height, false )
    camera.aspect = canvas.width / canvas.height
    camera.updateProjectionMatrix()

    updateUniform('Resolution', new Three.Vector2(canvas.width, canvas.height))
}
function onMouseScroll(e) {
    //Normalize
    var delta = e.deltaY
    if (delta < 0)
    {
        zoom.exponential *= 0.8
        zoom.linear -= .25
    }
    else
    {
        zoom.exponential *= 1.2
        zoom.linear += .25
    }
    
    updateUniform('Zoom', new Three.Vector2(zoom.linear, zoom.exponential))
}
function onMouseMove(e) {
    var pos = new Three.Vector2(e.x, e.y)

    if (mouseDown)
    {
        var dir = new Three.Vector2(e.x, e.y)
        dir.sub(mousePos)
        updateOffset(dir)
    }

    mousePos = pos

    let rect = canvas.getBoundingClientRect();
    let x = e.x / rect.width
    let y = e.y / rect.height
        
    updateUniform('MousePosition', new Three.Vector2(x, 1 - y))
}
function onMouseDown(e) {
    mouseDown = true
}
function onMouseUp(e) {
    mouseDown = false
}
function onKeyDown(e) {
    switch (e.code)
    {
        case "KeyP":
            updatePalette(currentPalette + 1)
            break;
        case "KeyR":
            updatePaletteReverse()
            break;
        case "ArrowRight":
            cycleShader(+1)
            break;
            case "ArrowLeft":
            cycleShader(-1)
            break;
    }
}


//Methods
function updateUniform(name, value) {
    mesh.material.uniforms[name].value = value
}
function resetUniform() {
    shaderTime = Date.now()
}
function cycleShader(delta) {
    applyShader((shaderId + delta) % fragments.length)
}
function applyShader(shaderIndex) {
    shaderId = shaderIndex

    //Create shader material
    material =  new Three.ShaderMaterial(
    {
        uniforms: uniforms,
        fragmentShader: fragments[shaderId].source,
        vertexShader: vertex,
    })    

    //Remove previous shader
    if (mesh != null)
    {
        scene.remove(mesh)
        mesh.geometry.dispose()
        mesh.material.dispose()
        mesh = null
    }
    
    //Apply shader
    mesh = new Three.Mesh(geometry, material)
    scene.add(mesh)
    resetUniform()
}
function createStats() {
    var stats = new Stats();
    stats.setMode(0);

    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0';
    stats.domElement.style.top = '0';

    return stats;
}
function updateOffset(direction) {
    offset.x -= direction.x * zoom.exponential * 0.002
    offset.y += direction.y * zoom.exponential * 0.002

    updateUniform('Offset', offset)
}
function updatePalette(newIndex = 0) {
    currentPalette = newIndex % palettes.length
    updateUniform('Palette', palettes[currentPalette])
}
function updatePaletteReverse() {
    reversePalette = !reversePalette
    updateUniform('ReversePalette', reversePalette)
}