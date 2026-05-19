import * as ecs from '@8thwall/ecs'

const SHARK_LAYER = 1

const SharkLayerComponent = ecs.registerComponent({
  name: 'shark-layer',

  schema: {},

  add: (world, component) => {
    const object = world.three.entityToObject.get(component.eid)
    if (!object) return

    object.traverse((child) => {
      child.layers.set(SHARK_LAYER)
    })
  },
})

export {SharkLayerComponent}