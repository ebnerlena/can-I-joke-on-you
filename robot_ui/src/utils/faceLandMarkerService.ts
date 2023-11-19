import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export class FaceLandmarkerService {
	private static _instance: FaceLandmarkerService;
	public faceLandmarker: FaceLandmarker | undefined;

	static get Instance(): FaceLandmarkerService {
		return this._instance || (this._instance = new this());
	}

	constructor() {
		this.init().then((landmarker) => {
			console.log('facelandmaker instance initialized!');
			this.faceLandmarker = landmarker;
		});
	}

	public async init(): Promise<FaceLandmarker> {
		const vision = await FilesetResolver.forVisionTasks(
			'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm',
		);

		const landmarker = await FaceLandmarker.createFromModelPath(
			vision,
			'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
		);

		await landmarker.setOptions({
			runningMode: 'VIDEO',
			numFaces: 1,
			outputFaceBlendshapes: true,
		});

		return landmarker;
	}
}

export const faceLandmarkerService = FaceLandmarkerService.Instance;
