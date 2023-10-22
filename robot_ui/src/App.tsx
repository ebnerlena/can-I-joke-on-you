import React from 'react';
import './App.css';
import { Canvas } from '@react-three/fiber'
import Box from './components/Box';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Can I joke on you?</h1>
      </header>
      <main>
        <Canvas>
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
          <Box position={[-1.2, 0, 0]} />
          <Box position={[1.2, 0, 0]} />
        </Canvas>
      </main>
    </div>
  );
}

export default App;
