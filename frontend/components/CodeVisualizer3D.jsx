import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// 3D Code Visualizer Component (Stable Persistent Context)
export default function CodeVisualizer3D({
  listKey,
  listVal = [],
  variables = {},
  prevVariables = {},
  scalarKeys = [],
  dictKeys = [],
  actionType = 'STEP',
  swapMessage = ''
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // References to keep WebGL context and controls persistent
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const visualizerGroupRef = useRef(null);
  const connectorGroupRef = useRef(null);

  // Animation targets and element identities
  const meshesRef = useRef({}); // keyed by element ID
  const elementIdsRef = useRef([]); // stable element IDs array
  const hoveredMeshIdRef = useRef(null);
  const pointersRef = useRef({}); // current pointer registers map
  
  // Selected element for student inspector details card
  const [selectedElement, setSelectedElement] = useState(null);
  
  // Scalar variables for stack visualization
  const [stackVars, setStackVars] = useState([]);

  // Heuristic stable ID tracking to make elements physically slide on swap
  useEffect(() => {
    if (!listVal || listVal.length === 0) {
      elementIdsRef.current = [];
      return;
    }

    const prevListVal = elementIdsRef.current.map(id => meshesRef.current[id]?.value);
    let newIds = [...elementIdsRef.current];

    if (newIds.length !== listVal.length) {
      // Reinitialize IDs
      newIds = listVal.map((_, i) => `el-${i}-${Math.random().toString(36).substr(2, 9)}`);
    } else {
      // Check if it's a swap of 2 elements
      const diffIndices = [];
      listVal.forEach((val, idx) => {
        if (prevListVal[idx] !== val) {
          diffIndices.push(idx);
        }
      });

      if (diffIndices.length === 2) {
        const [i1, i2] = diffIndices;
        if (listVal[i1] === prevListVal[i2] && listVal[i2] === prevListVal[i1]) {
          // Perform swap of stable IDs
          const temp = newIds[i1];
          newIds[i1] = newIds[i2];
          newIds[i2] = temp;
        }
      } else if (diffIndices.length > 2) {
        // Greedy matching for more complex reordering
        const usedOldIndices = new Set();
        const nextIds = new Array(listVal.length);
        
        // Step 1: Match unchanged elements
        listVal.forEach((val, idx) => {
          if (prevListVal[idx] === val) {
            nextIds[idx] = newIds[idx];
            usedOldIndices.add(idx);
          }
        });

        // Step 2: Match changed elements by value
        listVal.forEach((val, idx) => {
          if (nextIds[idx] === undefined) {
            let matchedIdx = -1;
            for (let j = 0; j < prevListVal.length; j++) {
              if (!usedOldIndices.has(j) && prevListVal[j] === val) {
                matchedIdx = j;
                break;
              }
            }
            if (matchedIdx !== -1) {
              nextIds[idx] = newIds[matchedIdx];
              usedOldIndices.add(matchedIdx);
            } else {
              // Create new ID if value is brand new
              nextIds[idx] = `el-${idx}-${Math.random().toString(36).substr(2, 9)}`;
            }
          }
        });
        newIds = nextIds;
      }
    }

    elementIdsRef.current = newIds;
  }, [listVal]);

  // Handle stack memory values
  useEffect(() => {
    const list = [];
    scalarKeys.forEach(key => {
      const val = variables[key];
      const prevVal = prevVariables[key];
      const isChanged = prevVal !== undefined && prevVal !== val;
      list.push({ key, val, isChanged, type: typeof val });
    });
    dictKeys.forEach(key => {
      const val = variables[key];
      const prevVal = prevVariables[key];
      const isChanged = prevVal !== undefined && JSON.stringify(prevVal) !== JSON.stringify(val);
      list.push({ key, val, isChanged, type: 'dict' });
    });
    setStackVars(list);
  }, [scalarKeys, dictKeys, variables, prevVariables]);

  // 1. Mount-only useEffect to initialize Three.js Context
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 280;

    // Setup Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#ffffff'); // White background
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 4.5, 8.5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // OrbitControls for Student Interaction
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    // Set boundaries to prevent getting lost in space
    controls.minDistance = 3;
    controls.maxDistance = 18;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // don't go below ground level
    controlsRef.current = controls;

    // Add Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(4, 9, 3);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x6366f1, 0.35, 12);
    pointLight.position.set(0, 4, 1);
    scene.add(pointLight);

    // Subtle Grid Helper
    const gridHelper = new THREE.GridHelper(30, 30, 0xe2e8f0, 0xf1f5f9);
    gridHelper.position.y = -0.505;
    scene.add(gridHelper);

    // Visualizer meshes container group
    const visualizerGroup = new THREE.Group();
    scene.add(visualizerGroup);
    visualizerGroupRef.current = visualizerGroup;

    // Compare/swap 3D connectors group
    const connectorGroup = new THREE.Group();
    scene.add(connectorGroup);
    connectorGroupRef.current = connectorGroup;

    // Raycasting elements
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };
    canvas.addEventListener('mousemove', handleCanvasMouseMove);

    const handleCanvasClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(visualizerGroup.children);
      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object;
        const { id, index, value } = clickedMesh.userData;
        
        // Query current pointers
        const activePointers = pointersRef.current[index] || [];
        setSelectedElement({
          id,
          index,
          value,
          isPointed: activePointers.length > 0,
          pointers: activePointers
        });
      } else {
        setSelectedElement(null);
      }
    };
    canvas.addEventListener('click', handleCanvasClick);

    // Resize Observer for responsive scaling
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 280;

      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    resizeObserver.observe(container);

    // Continuous tick loop
    let animationFrameId = null;
    const tempV = new THREE.Vector3();

    const tick = () => {
      controls.update();

      // Raycast Hover check
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(visualizerGroup.children);
      if (intersects.length > 0) {
        hoveredMeshIdRef.current = intersects[0].object.userData.id;
        canvas.style.cursor = 'pointer';
      } else {
        hoveredMeshIdRef.current = null;
        canvas.style.cursor = 'grab';
      }

      // Smoothly interpolate (lerp) meshes
      Object.keys(meshesRef.current).forEach((id) => {
        const meshInfo = meshesRef.current[id];
        if (!meshInfo) return;

        const mesh = meshInfo.mesh;
        
        // Raycaster scale pop effect on hover
        const isHovered = hoveredMeshIdRef.current === id;
        const hoverScaleFactor = isHovered ? 1.15 : 1.0;

        // Position interpolation
        mesh.position.x += (meshInfo.targetX - mesh.position.x) * 0.12;
        mesh.position.z += (meshInfo.targetZ - mesh.position.z) * 0.12;

        // Height scale interpolation
        meshInfo.currentHeight += (meshInfo.targetHeight - meshInfo.currentHeight) * 0.12;
        mesh.scale.y = meshInfo.currentHeight;
        mesh.scale.x = 1.0 * hoverScaleFactor;
        mesh.scale.z = 1.0 * hoverScaleFactor;

        // Keep anchored to grid floor
        mesh.position.y = (meshInfo.currentHeight / 2) - 0.5;

        // Material color & glow interpolation
        mesh.material.color.lerp(meshInfo.targetMat.color, 0.12);
        if (meshInfo.targetMat.emissive) {
          mesh.material.emissive.lerp(meshInfo.targetMat.emissive, 0.12);
          mesh.material.emissiveIntensity += (meshInfo.targetMat.emissiveIntensity - mesh.material.emissiveIntensity) * 0.12;
        } else {
          mesh.material.emissive.setHex(0x000000);
        }

        // Project coordinate styles directly onto HTML overlays for absolute positioning
        const overlayElement = document.getElementById(`label-${id}`);
        if (overlayElement) {
          // Top position of bar
          tempV.set(mesh.position.x, mesh.position.y + (meshInfo.currentHeight / 2) + 0.1, mesh.position.z);
          tempV.project(camera);

          const w = container.clientWidth || 600;
          const h = container.clientHeight || 280;

          const x2d = (tempV.x * 0.5 + 0.5) * w;
          const y2d = (-tempV.y * 0.5 + 0.5) * h;

          overlayElement.style.left = `${x2d}px`;
          overlayElement.style.top = `${y2d}px`;
          overlayElement.style.display = 'flex';
        }
      });

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(tick);
    };

    tick();

    // Cleanups on unmount
    return () => {
      canvas.removeEventListener('mousemove', handleCanvasMouseMove);
      canvas.removeEventListener('click', handleCanvasClick);
      resizeObserver.disconnect();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);

      controls.dispose();
      renderer.dispose();
    };
  }, []);

  // 2. Separate reconciler useEffect to update target properties on step changes
  useEffect(() => {
    const scene = sceneRef.current;
    const visualizerGroup = visualizerGroupRef.current;
    const connectorGroup = connectorGroupRef.current;
    if (!scene || !visualizerGroup || !connectorGroup) return;

    // Materials definitions
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x4f46e5, roughness: 0.25, metalness: 0.1 });
    const compareMaterial = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.15, metalness: 0.1, emissive: 0x10b981, emissiveIntensity: 0.15 });
    const swapMaterial = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.15, metalness: 0.1, emissive: 0xef4444, emissiveIntensity: 0.15 });
    const changedMaterial = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.1, emissive: 0xf59e0b, emissiveIntensity: 0.1 });

    const ids = elementIdsRef.current;
    
    // Normalize bar heights
    const numericVals = listVal.map(v => typeof v === 'number' ? v : 1).filter(v => !isNaN(v));
    const maxVal = numericVals.length > 0 ? Math.max(...numericVals, 1) : 1;
    const minVal = numericVals.length > 0 ? Math.min(...numericVals, 0) : 0;
    
    const spacing = 1.0;
    const startX = -((listVal.length - 1) * spacing) / 2;

    // Detect pointers and map pointersRef
    const pointers = {};
    Object.entries(variables).forEach(([k, v]) => {
      if (typeof v === 'number' && v >= 0 && v < listVal.length && !k.startsWith('__') && k !== 'step_counter') {
        if (!pointers[v]) pointers[v] = [];
        pointers[v].push(k);
      }
    });
    pointersRef.current = pointers;

    const activeMeshIds = new Set(ids);

    // Sync meshes
    ids.forEach((id, index) => {
      const val = listVal[index];
      let targetHeight = 1.5;
      if (typeof val === 'number') {
        const range = maxVal - minVal || 1;
        const pct = (val - minVal) / range;
        targetHeight = 0.4 + pct * 2.2; // height between 0.4 and 2.6
      }

      const targetX = startX + index * spacing;
      const targetY = targetHeight / 2 - 0.5;
      const targetZ = 0;

      // Determine material
      const activePointers = pointers[index] || [];
      const isPointed = activePointers.length > 0;
      const prevVal = prevVariables[listKey]?.[index];
      const wasChanged = prevVal !== undefined && prevVal !== val;

      let targetMat = baseMaterial;
      if (isPointed) {
        targetMat = actionType === 'SWAP' ? swapMaterial : compareMaterial;
      } else if (wasChanged) {
        targetMat = changedMaterial;
      }

      let meshInfo = meshesRef.current[id];
      if (!meshInfo) {
        // Create box mesh
        const geo = new THREE.BoxGeometry(0.65, 1, 0.65);
        const mesh = new THREE.Mesh(geo, baseMaterial.clone());
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.set(targetX, -10, targetZ); // slide up from bottom
        mesh.userData = { id, index, value: val };
        visualizerGroup.add(mesh);

        meshInfo = {
          mesh,
          currentHeight: 0.1,
          targetHeight,
          targetX,
          targetY,
          targetZ,
          targetMat,
          value: val
        };
        meshesRef.current[id] = meshInfo;
      } else {
        // Update values
        meshInfo.targetX = targetX;
        meshInfo.targetHeight = targetHeight;
        meshInfo.targetY = targetY;
        meshInfo.targetMat = targetMat;
        meshInfo.value = val;
        // Keep mesh userData updated
        meshInfo.mesh.userData.index = index;
        meshInfo.mesh.userData.value = val;
      }
    });

    // Remove outdated meshes
    Object.keys(meshesRef.current).forEach((id) => {
      if (!activeMeshIds.has(id)) {
        const meshInfo = meshesRef.current[id];
        visualizerGroup.remove(meshInfo.mesh);
        meshInfo.mesh.geometry.dispose();
        meshInfo.mesh.material.dispose();
        delete meshesRef.current[id];
      }
    });

    // 3. Render 3D Connector Arch/Tube for COMPARE or SWAP operations
    // Clear old connectors
    while(connectorGroup.children.length > 0) {
      const child = connectorGroup.children[0];
      connectorGroup.remove(child);
      child.geometry.dispose();
      child.material.dispose();
    }

    const activeIndices = Object.keys(pointers).map(Number).sort((a, b) => a - b);
    if (activeIndices.length >= 2 && (actionType === 'COMPARE' || actionType === 'SWAP')) {
      const idx1 = activeIndices[0];
      const idx2 = activeIndices[activeIndices.length - 1];

      // Get mesh info
      const id1 = ids[idx1];
      const id2 = ids[idx2];
      const m1 = meshesRef.current[id1];
      const m2 = meshesRef.current[id2];

      if (m1 && m2) {
        const x1 = startX + idx1 * spacing;
        const x2 = startX + idx2 * spacing;
        const y1 = m1.targetHeight - 0.5;
        const y2 = m2.targetHeight - 0.5;

        const start = new THREE.Vector3(x1, y1 + 0.1, 0);
        const end = new THREE.Vector3(x2, y2 + 0.1, 0);
        
        // Draw elegant curve arching upwards
        const midX = (x1 + x2) / 2;
        const midY = Math.max(y1, y2) + 1.2 + Math.abs(x1 - x2) * 0.15;
        const control = new THREE.Vector3(midX, midY, 0);

        const path = new THREE.QuadraticBezierCurve3(start, control, end);
        const tubeGeo = new THREE.TubeGeometry(path, 25, 0.035, 8, false);
        
        const connectorColor = actionType === 'SWAP' ? 0xef4444 : 0x10b981;
        const tubeMat = new THREE.MeshStandardMaterial({
          color: connectorColor,
          emissive: connectorColor,
          emissiveIntensity: 0.35,
          roughness: 0.2
        });

        const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
        connectorGroup.add(tubeMesh);
      }
    }

    // Cleanup materials
    return () => {
      baseMaterial.dispose();
      compareMaterial.dispose();
      swapMaterial.dispose();
      changedMaterial.dispose();
    };
  }, [listKey, listVal, variables, actionType]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 250,
        background: '#ffffff',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Three.js WebGL Canvas */}
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />

      {/* Floating 2D HTML Labels Overlay (Positions managed directly by WebGL loop) */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
        {elementIdsRef.current.map((id, index) => {
          const val = listVal[index];
          const activePointers = pointersRef.current[index] || [];
          return (
            <div
              key={id}
              id={`label-${id}`}
              style={{
                position: 'absolute',
                display: 'none', // toggled to block by three.js tick loop once coordinates are projected
                transform: 'translate(-50%, -100%)',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4
              }}
            >
              {/* Value Box */}
              <div
                style={{
                  background: '#0F172A',
                  color: '#F8FAFC',
                  fontFamily: 'monospace',
                  fontSize: 11.5,
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: 5,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                {String(val)}
              </div>

              {/* Variable Pointers (i, j, low, high) */}
              {activePointers.length > 0 && (
                <div style={{ display: 'flex', gap: 3, marginTop: 2 }}>
                  {activePointers.map(ptrName => (
                    <div
                      key={ptrName}
                      style={{
                        background: actionType === 'SWAP' ? '#EF4444' : '#10B981',
                        color: '#ffffff',
                        fontSize: 8.5,
                        fontWeight: 800,
                        padding: '1px 5px',
                        borderRadius: 3,
                        fontFamily: 'monospace',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                        animation: 'bounce 0.8s infinite alternate'
                      }}
                    >
                      {ptrName}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Element HUD Card Details Inspector */}
      {selectedElement && (
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(8px)',
            color: '#F8FAFC',
            padding: '10px 14px',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.08)',
            fontSize: 11.5,
            fontFamily: 'monospace',
            zIndex: 40,
            minWidth: 190,
            boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: 4
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 4, marginBottom: 4 }}>
            <span style={{ fontWeight: 800, color: '#F5A95B', letterSpacing: '0.02em' }}>3D ELEMENT INSPECTOR</span>
            <button
              onClick={() => setSelectedElement(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#647298',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: 11,
                padding: '0 2px'
              }}
              onMouseEnter={e => e.target.style.color = '#ef4444'}
              onMouseLeave={e => e.target.style.color = '#647298'}
            >
              ✕
            </button>
          </div>
          <div>Target: <span style={{ color: '#F5A95B', fontWeight: 800 }}>{listKey}[{selectedElement.index}]</span></div>
          <div>Value: <span style={{ color: '#22C5A0', fontWeight: 800 }}>{String(selectedElement.value)}</span></div>
          <div>Status: <span style={{ color: '#8892B0' }}>{selectedElement.isPointed ? `Pointed (${selectedElement.pointers.join(', ')})` : 'Idle'}</span></div>
        </div>
      )}

      {/* Stack/Scalar Registers Sidebar overlay (right side) */}
      {stackVars.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            width: 160,
            maxHeight: 'calc(100% - 20px)',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(15, 23, 42, 0.08)',
            borderRadius: 10,
            padding: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
            overflowY: 'auto',
            zIndex: 20
          }}
          className="sandbox-scroll"
        >
          <div style={{ fontSize: 9, color: '#64748B', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: 4 }}>
            Stack Memory
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {stackVars.map((v) => (
              <div
                key={v.key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: v.isChanged ? 'rgba(245, 158, 11, 0.08)' : 'rgba(15, 23, 42, 0.02)',
                  border: v.isChanged ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(15, 23, 42, 0.03)',
                  borderRadius: 5,
                  padding: '3px 6px',
                  transition: 'all 0.3s'
                }}
              >
                <span style={{ fontSize: 10.5, fontFamily: 'monospace', fontWeight: 700, color: '#334155' }}>
                  {v.key}
                </span>
                <span
                  style={{
                    fontSize: 10.5,
                    fontFamily: 'monospace',
                    fontWeight: 800,
                    color: v.isChanged ? '#D97706' : (v.type === 'number' ? '#2563EB' : (v.type === 'boolean' ? '#059669' : '#475569'))
                  }}
                >
                  {v.type === 'dict' ? '{...}' : String(v.val)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Styles for bounce animation and OrbitControls hover cursor */}
      <style>{`
        @keyframes bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-3px); }
        }
      `}</style>
    </div>
  );
}
