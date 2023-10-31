import React, { Suspense } from 'react';
import './App.css';
import { Canvas } from '@react-three/fiber'
import Model from './components/Model';
import { PerspectiveCamera, Plane } from '@react-three/drei';

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>Can I joke on you?</h1>
      </header>
      <main className='scene'>
        <Canvas color="#a0a0a0">
        <PerspectiveCamera makeDefault position={[0, 5,15]} fov={75} aspect={window.innerWidth / window.innerHeight} near={0.1} far={1000} rotation={[0, 0, 0]} />
          <hemisphereLight intensity={3} color="#ffffff" groundColor="#8d8d8d" position={[0, 20, 0]} />
          <directionalLight intensity={3} color="#ffffff" position={[3, 10, 10]} castShadow shadow-camera-top={2} shadow-camera-bottom={-2} shadow-camera-left={-2} shadow-camera-right={2} shadow-camera-near={0.1} shadow-camera-far={40} />
          <Suspense fallback={<div>Loading model...</div>}>
            <Model position={[0, -2, 0]} scale={[3,3, 3]} rotation={[0, Math.PI / 1, 0]}  /> {/* Math.PI / 2 */}
          </Suspense>

          <Plane args={[100, 100]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -10, 0]} receiveShadow />

        </Canvas>
      </main>
    </div>
  );
}

export default App;
