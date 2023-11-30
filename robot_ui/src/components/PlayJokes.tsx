'use client';

import { Suspense, useEffect, useState } from 'react';
import Model from './Model';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Text } from '@react-three/drei';
import Controls from './Controls';
import FaceLandmarkerDetection from './FaceLandmarkerDetection';

const PlayJokes = () => {
	const [jokes, setJokes] = useState<string[]>([]);
	const [activeJokeIndex, setActiveJokeIndex] = useState(0);

	useEffect(() => {
		fetch('http://localhost:3000/jokes.json')
			.then((res) => res.json())
			.then((jokes) => setJokes(jokes.jokes));

		window.speechSynthesis.cancel();
	}, []);

	const speakJoke = () => {
		const synth = window.speechSynthesis;
		const voices = synth.getVoices();

		console.log(voices);
		console.log(voices.findIndex((voice) => voice.name.includes('Alicia'))); // alicia, zac

		const msg = new SpeechSynthesisUtterance(jokes[activeJokeIndex]);
		const voiceIndex = 174; // zac = 266 , alicia = 174//13300
		msg.rate = 1;
		msg.pitch = 1.2;
		msg.voice = voices[voiceIndex];
		msg.lang = voices[voiceIndex]?.lang;

		window.speechSynthesis.speak(msg);
	};

	useEffect(() => {
		if (jokes.length <= 0) return;

		setTimeout(() => speakJoke(), 500);
	}, [activeJokeIndex]);

	const nextJoke = () => {
		window.speechSynthesis.cancel();

		if (activeJokeIndex === jokes.length - 1) {
			setActiveJokeIndex(0);
		} else {
			setActiveJokeIndex(activeJokeIndex + 1);
		}
	};

	const randomJoke = () => {
		window.speechSynthesis.cancel();

		const randomIndex = Math.floor(Math.random() * jokes.length);
		setActiveJokeIndex(randomIndex);
	};

	const playJoke = () => {
		if (window.speechSynthesis.speaking) {
			window.speechSynthesis.cancel();
		} else {
			speakJoke();
		}
	};

	return (
		<div className="h-[79vh] w-full flex flex-col items-center justify-center">
			<Controls onNextClick={nextJoke} onRandomClick={randomJoke} onPlayClick={playJoke} />
			<p className="mt-20 text-4xl px-20">{`${jokes[activeJokeIndex]}`}</p>

			<FaceLandmarkerDetection />
			<Canvas shadows className="w-full">
				<PerspectiveCamera
					makeDefault
					position={[0, 20, 18]}
					fov={75}
					near={0.01}
					far={1000}
					rotation={[(-15 * Math.PI) / 180, 0, 0]}
				/>
				<hemisphereLight intensity={2} color="#ffffff" groundColor="#8d8d8d" position={[0, 50, 0]} />
				<directionalLight
					intensity={3}
					color="#ffffff"
					position={[3, 20, 10]}
					castShadow
					shadow-camera-top={2}
					shadow-camera-bottom={-2}
					shadow-camera-left={-2}
					shadow-camera-right={2}
					shadow-camera-near={0.1}
					shadow-camera-far={40}
				/>
				<Suspense>
					<Model position={[0, 5, 0]} scale={[5, 5, 5]} rotation={[0, (178 * Math.PI) / 180, 0]} />
				</Suspense>

				{/* <Plane args={[200, 100]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -10, 0]} receiveShadow /> */}
			</Canvas>
		</div>
	);
};

export default PlayJokes;
