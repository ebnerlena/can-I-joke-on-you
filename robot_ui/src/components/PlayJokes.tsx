'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Model from './Model';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Text } from '@react-three/drei';
import Controls from './Controls';
import FaceLandmarkerDetection from './FaceLandmarkerDetection';
import { useFaceLandmarkDetector } from '@/utils/useDetector';
import { useApplicationStore, useUserStore } from '@/store/store';
import { postRequest } from '@/utils/backendService';
import { writeLog } from '@/app/actions';

const PlayJokes = () => {
	const [joke, setJoke] = useState<string>();
	const [isMuted, setIsMuted] = useState<boolean>(true);
	const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
	const [showDebugInfo, setShowDebugInfo] = useState(false);
	const [error, setError] = useState<string | undefined>();

	const timeoutRef = useRef<NodeJS.Timeout>();

	const { smileDegree, setVideoNode, startPrediction, stopPrediction } = useFaceLandmarkDetector();

	const maxSmileDegree = useApplicationStore((state) => state.smileDegree);
	const applicationError = useApplicationStore((state) => state.error);
	const uuid = useUserStore((state) => state.uuid);
	const startTime = useUserStore((state) => state.startTime);
	const studyRound = useUserStore((state) => state.studyRound);

	const getJokeDisplayStructure = (joke: string) => {
		const paragraphs = joke
			.split(/(?<=[.!?])\s+|\[|\]|\s+(?=[A-Z]:)/)
			.filter(Boolean)
			.map((paragraph, index) => (
				<p key={index}>
					{paragraph.trim().match(/^[A-Z]+:/) ? <br /> : null}
					{paragraph.trim()}
				</p>
			));

		return paragraphs;
	};

	// *************** Jokes  *******************
	const speakJoke = () => {
		if (isMuted) return;

		const synth = window.speechSynthesis;
		const voices = synth.getVoices();

		//console.log(voices);
		//console.log(voices.findIndex((voice) => voice.name.includes('Steph'))); //steph, alicia, zac

		const msg = new SpeechSynthesisUtterance(joke);
		const voiceIndex = 10; // steph = 10 , zac = 266 , alicia = 174
		msg.rate = 1.1;
		msg.pitch = 1.1;
		msg.voice = voices[voiceIndex];
		msg.lang = voices[voiceIndex]?.lang;

		synth.speak(msg);

		msg.onend = () => setIsSpeaking(false);
	};

	const nextJoke = async () => {
		window.speechSynthesis.cancel();
		const maxSmileDegree = stopPrediction();

		try {
			await writeLog(startTime, uuid, joke, maxSmileDegree, studyRound);
			await postRequest('/rate', { client_id: uuid, rating: maxSmileDegree });
		} catch (err) {
			console.log(err);
		} finally {
			await updateJoke();
		}
	};

	const updateJoke = async () => {
		const jokeData = await postRequest('/recommend', { client_id: uuid });

		setJoke(jokeData.joke);
	};

	const prepareNextJokePlaying = () => {
		timeoutRef.current = setTimeout(
			() => {
				speakJoke();
				startPrediction();
			},

			500,
		);
	};

	const playJoke = () => {
		setIsSpeaking(!isSpeaking);
		if (window.speechSynthesis.speaking) {
			window.speechSynthesis.cancel();
		} else {
			setIsMuted(false);
			speakJoke();
		}
	};

	const toggleMute = () => {
		setIsMuted(!isMuted);

		if (window.speechSynthesis.speaking) {
			window.speechSynthesis.cancel();
		}
	};

	useEffect(() => {
		if (joke === undefined) return;

		prepareNextJokePlaying();
	}, [joke]);

	useEffect(() => {
		setError(applicationError);
	}, [applicationError]);

	useEffect(() => {
		postRequest('/recommend', { client_id: uuid }).then((res) => {
			setJoke(res.joke);
		});

		return () => clearTimeout(timeoutRef.current);
	}, []);

	return (
		<div className="h-[79vh] w-full flex flex-col items-center justify-center">
			<Controls
				onNextClick={nextJoke}
				onMuteClick={toggleMute}
				onPlayClick={playJoke}
				isMuted={isMuted}
				isPlaying={isSpeaking}
			/>
			<div className="flex w-full items-end justify-between my-1 px-8">
				{showDebugInfo ? (
					<div className="flex gap-4  items-center justify-center text-xs self-center">
						<p className="p-0 m-0">
							<span className="font-bold">Smile Degree: </span>
							{smileDegree.toFixed(4)}
						</p>
						<p className="p-0 m-0">
							<span className="font-bold">Last Max Smile Degree: </span>
							{maxSmileDegree.toFixed(4)}
						</p>
						<button className="text-xs underline" onClick={stopPrediction}>
							Stop Prediction
						</button>
						<button className="text-xs underline" onClick={startPrediction}>
							Predict
						</button>
					</div>
				) : (
					<div />
				)}
				<button
					className="text-xs underline cursor-pointer justify-end w-fit"
					onClick={() => setShowDebugInfo(!showDebugInfo)}>
					Toggle Debug Info
				</button>
			</div>

			{joke && (
				<div className="w-full justify-center mr-[400px] flex px-20 max-md:mr-[50px]  max-lg:mr-[100px] max-md:mxl-[200px]">
					<div className="mt-10 text-xl max-md:max-w-[600px] max-w-[700px] max-sm:max-w-[300px]  min-w-[200px] w-fit bg-black/20 rounded-lg p-4">
						{getJokeDisplayStructure(joke)}
					</div>
				</div>
			)}

			<FaceLandmarkerDetection onWebcamRefReceived={setVideoNode} />
			<Canvas shadows className="w-full mr-0">
				<PerspectiveCamera
					makeDefault
					position={[0, 20, 18]}
					fov={75}
					near={0.01}
					far={1000}
					rotation={[(-5 * Math.PI) / 180, 0, 0]}
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
					<Model position={[-10, 5, 0]} scale={[6, 6, 6]} rotation={[0, (-170 * Math.PI) / 180, 0]} />
				</Suspense>
			</Canvas>
			{/* {error && <p className="text-red-500 py-1 absolute bottom-4 left-4">{error}</p>} */}
		</div>
	);
};

export default PlayJokes;
