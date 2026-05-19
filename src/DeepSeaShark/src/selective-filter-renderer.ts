import * as ecs from '@8thwall/ecs'

const {THREE} = window as any

const WORLD_LAYER = 0
const SHARK_LAYER = 1

let isPatched = false

const SelectiveFilterRenderer = ecs.registerComponent({
  name: 'selective-filter-renderer',

  schema: {},

  add: (world) => {
    if (isPatched) return
    isPatched = true

    const renderer = world.three.renderer
    if (!renderer) {
      console.warn('No Three.js renderer found.')
      return
    }

    const originalRender = renderer.render.bind(renderer)

    const renderTarget = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight,
      {
        depthBuffer: true,
        stencilBuffer: false,
      }
    )

    const filterScene = new THREE.Scene()

    const filterCamera = new THREE.OrthographicCamera(
      -1,
      1,
      1,
      -1,
      0,
      1
    )

    const filterMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: {value: renderTarget.texture},
        tintStrength: {value: 0.25},
      },

      vertexShader: `
        varying vec2 vUv;

        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,

      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float tintStrength;

        varying vec2 vUv;

        void main() {
          vec4 color = texture2D(tDiffuse, vUv);

          float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));

          vec3 filtered = mix(
            color.rgb,
            vec3(gray * 0.7, gray * 0.95, gray * 1.25),
            tintStrength
          );

          gl_FragColor = vec4(filtered, color.a);
        }
      `,

      depthTest: false,
      depthWrite: false,
    })

    const fullscreenQuad = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      filterMaterial
    )

    filterScene.add(fullscreenQuad)

    renderer.render = function patchedRender(scene, camera) {
      const width = renderer.domElement.clientWidth
      const height = renderer.domElement.clientHeight

      if (
        renderTarget.width !== width ||
        renderTarget.height !== height
      ) {
        renderTarget.setSize(width, height)
      }

      const previousRenderTarget = renderer.getRenderTarget()
      const previousAutoClear = renderer.autoClear
      const previousCameraMask = camera.layers.mask

      renderer.autoClear = true

      camera.layers.set(WORLD_LAYER)
      renderer.setRenderTarget(renderTarget)
      renderer.clear()
      originalRender(scene, camera)

      renderer.setRenderTarget(null)
      renderer.clear()
      originalRender(filterScene, filterCamera)

      renderer.clearDepth()

      camera.layers.set(SHARK_LAYER)
      originalRender(scene, camera)

      camera.layers.mask = previousCameraMask
      renderer.setRenderTarget(previousRenderTarget)
      renderer.autoClear = previousAutoClear
    }
  },
})

export {SelectiveFilterRenderer}