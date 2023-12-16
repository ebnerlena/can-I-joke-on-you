'use client';

import { ROUTES } from '@/constants';
import { useUserStore } from '@/store/store';
import { STUDY_ROUND } from '@/types/StudyRound';
import { postRequest } from '@/utils/backendService';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const IntroductionScreen = () => {
	const studyRound = useUserStore((state) => state.studyRound);
	const setStudyRound = useUserStore((state) => state.setStudyRound);
	const uuid = useUserStore((state) => state.uuid);
	const setUUID = useUserStore((state) => state.setUUID);
	const setStartTime = useUserStore((state) => state.setStartTime);
	const [error, setError] = useState<string | undefined>();

	const [id, setId] = useState<string | undefined>();

	const router = useRouter();

	useEffect(() => {
		setId(uuid);
		if (uuid === undefined) {
			const uniqueId = generateRandomId(6);
			setUUID(uniqueId);
		}
	}, [uuid, setUUID]);

	const generateRandomId = (length: number) => {
		const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		let randomId = '';

		for (let i = 0; i < length; i++) {
			const randomIndex = Math.floor(Math.random() * chars.length);
			randomId += chars.charAt(randomIndex);
		}

		return randomId;
	};

	const onStartClick = async () => {
		setStartTime(new Date());

		let path = 'enable';

		if (studyRound === STUDY_ROUND.B) {
			path = 'disable';
		}

		try {
			await postRequest(path, { client_id: uuid });
		} catch (e) {
			console.log(e);
			setError("Couldn't connect to the robot. Please refresh and try again.");
			return;
		}

		router.push(ROUTES.START_NEUTRAL_CALIBRATION);
	};

	return (
		<div className="h-full w-full flex flex-col items-center justify-center gap-8 p-12">
			<div className="flex flex-col items-center gap-16 w-full justify-center">
				<div className="flex flex-col gap-2">
					<div className="text-justify text-xl max-w-[1000px]">
						<h2 className="font-bold pb-2 text-2xl">Welcome!</h2>
						<p>We are glad to have you on our study!</p>
						<p>First we will do some configurations, afterwards laughters are guaranteed :) </p>

						<p className="pt-4">
							<span className="font-bold">UUID:</span> {id}
						</p>

						<p className="pt-4">Please select what the person you are doing the study with is telling you. </p>
						<div className="flex gap-12 w-full justify-center py-6 ">
							<label key={'a'} className="flex flex-col items-center mb-2 p-2">
								<input
									type="radio"
									name={'a'}
									value={'a'}
									checked={studyRound === STUDY_ROUND.A}
									onChange={() => setStudyRound(STUDY_ROUND.A)}
									className="hidden"
								/>
								<div
									className={`w-8 h-8 max-sm:w-5 max-sm:h-5 max-md:w-6 max-md:h-6 border-2 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
										studyRound === STUDY_ROUND.A ? 'bg-primary border-primary' : 'border-primary'
									}`}></div>
								<span className="mt-1 max-md:text-md text-xl text-center">{STUDY_ROUND.A}</span>
							</label>

							<label key={'b'} className="flex flex-col items-center mb-2 p-2">
								<input
									type="radio"
									name={'b'}
									value={'b'}
									checked={studyRound === STUDY_ROUND.B}
									onChange={() => setStudyRound(STUDY_ROUND.B)}
									className="hidden"
								/>
								<div
									className={`w-8 h-8 max-sm:w-5 max-sm:h-5 max-md:w-6 max-md:h-6  border-2 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
										studyRound === STUDY_ROUND.B ? 'bg-primary border-primary' : 'border-primary'
									}`}></div>
								<span className="mt-1 max-md:text-md text-xl text-center">{STUDY_ROUND.B}</span>
							</label>
						</div>
					</div>
					<div className="btn w-fit self-center font-bold !px-4 !py-2" onClick={onStartClick}>
						START
					</div>
					{error && <p className="text-red-500 w-full">{error}</p>}
				</div>
			</div>
		</div>
	);
};

export default IntroductionScreen;
