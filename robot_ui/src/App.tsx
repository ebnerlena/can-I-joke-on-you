import React, { Suspense } from 'react';
import './App.css';
import { Canvas } from '@react-three/fiber'
import Model from './components/Model';
import { PerspectiveCamera, Text } from '@react-three/drei';
import Controls from './components/Controls';

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>Can I joke on you?</h1>
      </header>
      <main className='scene'>
        <Controls />
        <Canvas  shadows>
        <Text
          position={[0, 24, 0]}
          fontSize={1.2}
          color="black"
          maxWidth={40}
        >
          "What do you call a factory that makes okay products?" "A satisfactory."
     </Text>
        <PerspectiveCamera makeDefault position={[0, 20, 18]} fov={75} aspect={window.innerWidth / window.innerHeight} near={0.01} far={1000} rotation={[-15 * Math.PI/180, 0, 0]} />
          <hemisphereLight intensity={2} color="#ffffff" groundColor="#8d8d8d" position={[0, 50, 0]} />
          <directionalLight intensity={3} color="#ffffff" position={[3, 20, 10]} castShadow shadow-camera-top={2} shadow-camera-bottom={-2} shadow-camera-left={-2} shadow-camera-right={2} shadow-camera-near={0.1} shadow-camera-far={40} />
          <Suspense>
            <Model position={[0, 5, 0]} scale={[5,5, 5]} rotation={[0, 178 * Math.PI/180, 0]}  />
          </Suspense>

          {/* <Plane args={[200, 100]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -10, 0]} receiveShadow /> */}

        </Canvas>
      </main>
    </div>
  );
}

export default App;
