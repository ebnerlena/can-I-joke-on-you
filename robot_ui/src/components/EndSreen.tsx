'use client';

import { useUserStore } from '@/store/store';
import { STUDY_ROUND } from '@/types/StudyRound';
import Link from 'next/link';

const LINK_QUESTIONNAIRE_WITH_RECOMMENDER = 'https://forms.gle/aSrkka8AHTnnFwkXA';
const LINK_QUESTIONNAIRE_WITHOUT_RECOMMENDER = 'https://forms.gle/wtiaPCp8Rzw2EtMS6';

const EndScreen = () => {
	const studyRound = useUserStore((state) => state.studyRound);

	return (
		<div className="h-full w-full flex flex-col items-center justify-center gap-8 p-12">
			<div className="text-justify text-xl max-w-[800px]">
				<h2 className="font-bold pb-2">Thank you!</h2>
				<p>Thank you very much for participating in our user study!</p>
				<p className="pb-4">For our evaluating we kindly ask you to fill out the following questionnaire:</p>

				<Link
					className="btn mt-20"
					href={
						studyRound === STUDY_ROUND.A ? LINK_QUESTIONNAIRE_WITH_RECOMMENDER : LINK_QUESTIONNAIRE_WITHOUT_RECOMMENDER
					}
					target="_blank"
					rel="noopener noreferrer">
					Take Questionnaire
				</Link>
			</div>
		</div>
	);
};

export default EndScreen;
