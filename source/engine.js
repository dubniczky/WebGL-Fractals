import * as Three from 'three'
import * as Stats from 'stats-js'
import shaders from './shaders'


//Constants
const defaultShaderIndex = 0
const linearZoomRate = .25
const exponentialZoomRate = 1.2
const paletteTextureFiles = [
    './palettes/magma-palette.png',
    './palettes/magenteal-palette.png',
    './palettes/rainbow-palette.png'
]

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
let stats = null
let uniforms = null
let shaderId = 0
let shaderTime = null
let offset = null
let palette = {
    textures: null,
    current: 0,
    reverse: false,
    count: 0
}
let zoom = {
    linear: 1.,
    exponential: 1.
}
let mouse = {
    pos: new Three.Vector2(0, 0),
    down: false
}


export async function setup(canvasElement) {
    // Attach or create canvas
    canvas = canvasElement
    if (canvas == null) {
        canvas = document.createElement('canvas')
        document.appendChild(canvas)
    }
    console.log('DOM loaded.')

    // Load shaders
    fragments = shaders.fragment
    vertex = shaders.vertex
    console.log('Shaders loaded.')
   
    // Load textures
    const textureLoader = new Three.TextureLoader()
    palette.textures = []
    for (const url of paletteTextureFiles) {
        palette.textures.push( textureLoader.load(url) )
    }
    palette.count = palette.textures.length
    console.log('Textures loaded.')

    // Setup scene
    scene = new Three.Scene()
    scene.autoUpdate = false
	camera = new Three.OrthographicCamera( -1, 1, 1, -1, 0, 1 )
	camera.position.z = 1
    console.log('Scene loaded.')
    
    // Setup uniform
    overrideDefaultUniform()
    uniforms = {
        Resolution:     { type: 'vec2',  value: new Three.Vector2(window.innerWidth, window.innerHeight) },
        Offset:         { type: 'vec2',  value: offset },
        Zoom:           { type: 'vec2',  value: new Three.Vector2(zoom.linear, zoom.exponential) },
        Time:           { type: 'float', value: 0 },
        Palette:        { type: 't',     value: palette.textures[0] },
        ReversePalette: { type: 'bool',  value: palette.reverse },
        MousePosition:  { type: 'vec2',  value: mouse.pos },
        MouseLeftDown:  { type: 'bool',  value: false },
        MouseRightDown: { type: 'bool',  value: false },
    }
    console.log('Uniforms loaded.')

    geometry = new Three.PlaneBufferGeometry(2, 2)
    applyShader(defaultShaderIndex)

    // Setup renderer
	renderer = new Three.WebGLRenderer({
        antialias: false,
        canvas: canvas,
        powerPerformance: 'high-performance',
        depth: false
    })
	renderer.setSize( window.innerWidth, window.innerHeight, false )
    console.log('Renderer loaded.')

    // Setup events
    window.addEventListener('resize', (e) => onWindowResized(e))
    canvas.addEventListener('mousewheel', (e) => onMouseScroll(e))
    canvas.addEventListener('mousemove', (e) => onMouseMove(e))
    canvas.addEventListener('mousedown', (e) => onMouseDown(e))
    canvas.addEventListener('mouseup', (e) => onMouseUp(e))
    window.addEventListener('keydown', (e) => onKeyDown(e))
    console.log('Events loaded.')

    // Create stats panel
    stats = new Stats()
    stats.setMode(0)
    document.body.appendChild( stats.domElement )
    console.log('Stats loaded.')

    // Setup Complete
    console.log('✅ Engine setup complete, setarting renderer...')
    renderer.setAnimationLoop( render )
}

function overrideDefaultUniform() {
    // Mandelbrot flower location
    zoom.exponential = 0.009554277742566964
    offset = new Three.Vector2(-0.37432304500407854, 0.6598041393699959)
}


//Render loop
function render(time) {
    updateUniform('Time', (Date.now() - shaderTime) / 1000.0)
	renderer.render( scene, camera )
    stats.update()
}


//Events
function onWindowResized(e) {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    renderer.setSize( canvas.width, canvas.height, false )
    camera.aspect = canvas.width / canvas.height
    camera.updateProjectionMatrix()

    updateUniform('Resolution', new Three.Vector2(canvas.width, canvas.height))
}
function onMouseScroll(e) {
    //Normalize
    if (e.deltaY < 0) { // Zoom out
        zoom.exponential /= exponentialZoomRate
        zoom.linear -= linearZoomRate
    }
    else { // Zoom in
        zoom.exponential *= exponentialZoomRate
        zoom.linear += linearZoomRate
    }

    updateUniform('Zoom', new Three.Vector2(zoom.linear, zoom.exponential))
}
function onMouseMove(e) {
    let pos = new Three.Vector2(e.x, e.y)

    if (mouse.down)
    {
        var dir = new Three.Vector2(e.x, e.y)
        dir.sub(mouse.pos)
        updateOffset(dir)
    }

    mouse.pos = pos

    let rect = canvas.getBoundingClientRect()
    let x = e.x / rect.width
    let y = e.y / rect.height
        
    updateUniform('MousePosition', new Three.Vector2(x, 1 - y))
}
function onMouseDown(e) {
    mouse.down = true
}
function onMouseUp(e) {
    mouse.down = false
}
function onKeyDown(e) {
    switch (e.code)
    {
        case "KeyP":
            updatePalette(palette.current + 1)
            break
        case "KeyR":
            updatePaletteReverse()
            break
        case "ArrowRight":
            cycleShader(+1)
            break
            case "ArrowLeft":
            cycleShader(-1)
            break
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
    console.log('Compiling shader...', [shaderIndex, fragments[shaderId].name])
    const perfStart = performance.now()

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

    const perfEnd = performance.now()
    console.log('Shader compiled in', (perfEnd-perfStart).toFixed(3), 'ms')

    resetUniform()
}
function updateOffset(direction) {
    offset.x -= (direction.x / canvas.width) * zoom.exponential
    offset.y += (direction.y / canvas.height) * zoom.exponential

    updateUniform('Offset', offset)
}
function updatePalette(newIndex = 0) {
    palette.current = newIndex % palettes.count
    updateUniform('Palette', palettes.textures[palette.current])
}
function updatePaletteReverse() {
    palette.reverse = !palette.reverse
    updateUniform('ReversePalette', palette.reverse)
}