import * as ecs from '@8thwall/ecs'

const {THREE} = window as any

const FollowerCameraComponent = ecs.registerComponent({
  name: 'follower-camera',

  schema: {
    xOffset: ecs.f32,
    yOffset: ecs.f32,
    zOffset: ecs.f32,

    distance: ecs.f32,
    heightOffset: ecs.f32,
    positionLerp: ecs.f32,
    rotationLerp: ecs.f32,

    cameraQuatX: ecs.f32,
    cameraQuatY: ecs.f32,
    cameraQuatZ: ecs.f32,
    cameraQuatW: ecs.f32,
  },

  schemaDefaults: {
    xOffset: 0,
    yOffset: 0,
    zOffset: 10,
    
    distance: 2.0,
    heightOffset: -0.5,
    positionLerp: 0.12,
    rotationLerp: 0.12,
    
    cameraQuatX: 0,
    cameraQuatY: 0,
    cameraQuatZ: 0,
    cameraQuatW: 0,
  },

  data: {
    previousX: ecs.f32,
    previousY: ecs.f32,
    previousZ: ecs.f32,
    hasPreviousCameraPosition: ecs.boolean,

    initialOffsetX: ecs.f32,
    initialOffsetY: ecs.f32,
    initialOffsetZ: ecs.f32,
    hasInitialOffset: ecs.boolean,
  },

  add: (world, component) => {
    /*component.data.hasPreviousCameraPosition = false
    component.data.hasInitialOffset = false*/
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
    const inverseCameraQuaternion = new THREE.Quaternion()
    var objectWorldPosition = new THREE.Vector3()
    const targetPosition = new THREE.Vector3()
    const cameraLocalOffset = new THREE.Vector3()

    cameraObject.getWorldPosition(cameraPosition)
    cameraObject.getWorldQuaternion(cameraQuaternion)

    targetPosition.add(cameraPosition)

    inverseCameraQuaternion.copy(cameraQuaternion).invert()

    //var objectWorldPosition = ecs.Position.get(world, component.eid)
    //object.getWorldPosition(objectWorldPosition)

    /*if (!component.data.hasInitialOffset) {
      cameraLocalOffset.copy(objectWorldPosition)
      cameraLocalOffset.sub(cameraPosition)
      cameraLocalOffset.applyQuaternion(inverseCameraQuaternion)

      component.data.initialOffsetX = cameraLocalOffset.x
      component.data.initialOffsetY = cameraLocalOffset.y
      component.data.initialOffsetZ = cameraLocalOffset.z
      component.data.hasInitialOffset = true
    }*/

    component.data.initialOffsetX = component.schema.xOffset
    component.data.initialOffsetY = component.schema.yOffset
    component.data.initialOffsetZ = component.schema.zOffset

    cameraLocalOffset.set(
      component.data.initialOffsetX,
      component.data.initialOffsetY,
      component.data.initialOffsetZ
    )

    targetPosition.copy(cameraLocalOffset)
    targetPosition.applyQuaternion(cameraQuaternion)
    targetPosition.add(cameraPosition)
    component.schema.cameraQuatX = cameraQuaternion.x
    component.schema.cameraQuatY = cameraQuaternion.y
    component.schema.cameraQuatZ = cameraQuaternion.z
    component.schema.cameraQuatW = cameraQuaternion.w


    //object.position.lerp(targetPosition, component.schema.positionLerp)
    ecs.Position.set(world, component.eid, {
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z
    })
    
    objectWorldPosition = ecs.Position.get(world, component.eid)
    /*
    let previousX = component.data.previousX
    let previousY = component.data.previousY
    let previousZ = component.data.previousZ

    if (!component.data.hasPreviousCameraPosition) {
      component.data.previousX = cameraPosition.x
      component.data.previousY = cameraPosition.y
      component.data.previousZ = cameraPosition.z
      component.data.hasPreviousCameraPosition = true
      return
    }

    const movementDirection = new THREE.Vector3(
      cameraPosition.x - previousX,
      0,
      cameraPosition.z - previousZ
    )

    component.data.previousX = cameraPosition.x
    component.data.previousY = cameraPosition.y
    component.data.previousZ = cameraPosition.z

    if (movementDirection.lengthSq() >= 0.000001) {
      movementDirection.normalize()

      const targetQuaternion = new THREE.Quaternion()
      const modelForward = new THREE.Vector3(0, 0, 1)

      targetQuaternion.setFromUnitVectors(modelForward, movementDirection)

      object.quaternion.slerp(targetQuaternion, component.schema.rotationLerp)
    }*/

    /*const debugPanel = document.getElementById('debug-panel')

    if (debugPanel) {
      debugPanel.textContent =
        `camera pos:
        x ${cameraPosition.x.toFixed(2)}
        y ${cameraPosition.y.toFixed(2)}
        z ${cameraPosition.z.toFixed(2)}

        target pos:
        x ${targetPosition.x.toFixed(2)}
        y ${targetPosition.y.toFixed(2)}
        z ${targetPosition.z.toFixed(2)}

        camera-local offset:
        x ${cameraLocalOffset.x.toFixed(2)}
        y ${cameraLocalOffset.y.toFixed(2)}
        z ${cameraLocalOffset.z.toFixed(2)}

        distance to target:
        ${object.position.distanceTo(targetPosition).toFixed(2)}

        object world pos:
        x ${objectWorldPosition.x.toFixed(2)}
        y ${objectWorldPosition.y.toFixed(2)}
        z ${objectWorldPosition.z.toFixed(2)}`
    }*/
  },
})

export {FollowerCameraComponent}