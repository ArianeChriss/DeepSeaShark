import * as ecs from '@8thwall/ecs'
import {FollowerCameraComponent} from './follower-camera-component'

const AnimationDebugComponent = ecs.registerComponent({
  name: 'animation-debug',

  schema: {
    animationDuration: ecs.f32,
  },

  schemaDefaults: {
    animationDuration: 10.0,
  },

  data: {
    finished: ecs.boolean,
  },
  
  stateMachine: ({defineState, eid, world, dataAttribute}) => {
    defineState('initial-state').initial().listen(eid, ecs.events.GLTF_ANIMATION_LOOP, (event) => {
      console.log('Animation finished: ', event.data.name)
      dataAttribute.set(eid, {
        finished: true,
      })
    })
  },

  tick: (world, component) => {
    const debugPanel = document.getElementById('debug-panel')
    if (!debugPanel) return

    const eid = component.eid

    if (!ecs.GltfModel.has(world, eid)) {
      debugPanel.textContent = 'No GltfModel component found on this entity.'
      return
    }

    const gltf = ecs.GltfModel.get(world, eid)

    const duration = component.schema.animationDuration
    var timey = gltf.time

    ecs.GltfModel.set(world, eid, {
        time: 0.05,
        })

    const progress =
      duration > 0
        ? ((timey % duration) / duration) * 100
        : 0
    
    component.schema.animationDuration += 1
    const camera_follower = FollowerCameraComponent.get(world, eid)
    debugPanel.textContent =
        `GLB Animation Debug

        Clip:
        ${gltf.animationClip}

        Time:
        ${timey}

        Finished:
        ${component.data.finished}

        CameraQuatX:
        ${camera_follower.cameraQuatX}
        CameraQuatY:
        ${camera_follower.cameraQuatY}
        CameraQuatZ:
        ${camera_follower.cameraQuatZ}
        CameraQuatW:
        ${camera_follower.cameraQuatW}

        Progress:
        ${/*progress.toFixed(1)*/1}%

        Loop:
        ${gltf.loop}

        Paused:
        ${gltf.paused}

        Time Scale:
        ${gltf.timeScale}

        Reverse:
        ${gltf.reverse}

        Repetitions:
        ${gltf.repetitions}`
    component.data.finished = false;
  },
})

export {AnimationDebugComponent}