import * as ecs from '@8thwall/ecs'

const {THREE} = window as any

const FollowerCameraComponentOld = ecs.registerComponent({
  name: 'follower-camera-old',

  schema: {
    distance: ecs.f32,
    heightOffset: ecs.f32,
    positionLerp: ecs.f32,
    rotationLerp: ecs.f32,
  },

  schemaDefaults: {
    distance: 2.0,
    heightOffset: -0.5,
    positionLerp: 0.5,
    rotationLerp: 0.12,
  },

  data: {
    previousX: ecs.f32,
    previousY: ecs.f32,
    previousZ: ecs.f32,
    hasPreviousCameraPosition: ecs.boolean,
},

  add: (world, component) => {
    component.data.hasPreviousCameraPosition = false
  },

  tick: (world, component) => {
    const object = world.three.entityToObject.get(component.eid)
    if (!object) return

    const cameraEid = world.camera.getActiveEid()
    if (!cameraEid) return

    const cameraObject = world.three.entityToObject.get(cameraEid)
    if (!cameraObject) return

    const cameraPosition = new THREE.Vector3()
    const cameraQuaternion = new THREE.Quaternion()
    const cameraForward = new THREE.Vector3()
    const targetPosition = new THREE.Vector3()

    cameraObject.getWorldPosition(cameraPosition)
    cameraObject.getWorldQuaternion(cameraQuaternion)

    cameraForward.set(0, 0, -1)
    cameraForward.applyQuaternion(cameraQuaternion)
    cameraForward.normalize()

    targetPosition.copy(cameraPosition)
    targetPosition.addScaledVector(cameraForward, component.schema.distance)
    targetPosition.y += component.schema.heightOffset

    object.position.lerp(targetPosition, component.schema.positionLerp)

    var previousX = component.data.previousX
    var previousY = component.data.previousY
    var previousZ = component.data.previousZ

    if (!component.data.hasPreviousCameraPosition) {
      previousX = cameraPosition.x
      previousY = cameraPosition.y
      previousZ = cameraPosition.z
      component.data.hasPreviousCameraPosition = true
      return
    }

    const movementDirection = new THREE.Vector3(
      cameraPosition.x - previousX,
      0,
      cameraPosition.z - previousZ
    )

    previousX = cameraPosition.x
    previousY = cameraPosition.y
    previousZ = cameraPosition.z

    if (movementDirection.lengthSq() < 0.000001) {
      return
    }

    movementDirection.normalize()

    const targetQuaternion = new THREE.Quaternion()
    const modelForward = new THREE.Vector3(0, 0, 1)

    targetQuaternion.setFromUnitVectors(modelForward, movementDirection)

    object.quaternion.slerp(targetQuaternion, component.schema.rotationLerp)

    const debugPanel = document.getElementById('debug-panel')

    if (debugPanel) {
      debugPanel.textContent =
        `camera pos:
    x ${cameraPosition.x.toFixed(2)}
    y ${cameraPosition.y.toFixed(2)}
    z ${cameraPosition.z.toFixed(2)}

    object pos:
    x ${object.position.x.toFixed(2)}
    y ${object.position.y.toFixed(2)}
    z ${object.position.z.toFixed(2)}

    target pos:
    x ${targetPosition.x.toFixed(2)}
    y ${targetPosition.y.toFixed(2)}
    z ${targetPosition.z.toFixed(2)}

    distance to target:
    ${object.position.distanceTo(targetPosition).toFixed(2)}

    position lerp:
    ${component.schema.positionLerp}`
    }
  },
})

export {FollowerCameraComponentOld}