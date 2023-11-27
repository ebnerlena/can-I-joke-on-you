'use client';

import { useApplicationStore } from '@/store/store';
import { ApplicationStatus } from '@/types/ApplicationStatus';
import { useCallback } from 'react';

const Header = () => {
	const applicationStatus = useApplicationStore((state) => state.status);
	const setApplicationStatus = useApplicationStore((state) => state.setStatus);

	const onRestart = useCallback(() => {
		setApplicationStatus(ApplicationStatus.START);
		window.location.reload();
	}, [setApplicationStatus]);

	const onFinish = useCallback(() => {
		setApplicationStatus(ApplicationStatus.END);
	}, [setApplicationStatus]);

	return (
		<header className="bg-sky-600 min-h-[100px] flex justify-between items-center px-8">
			<h1 className="text-white text-4xl">Can I joke on you?</h1>
			<div className="flex gap-2 items-center justify-center">
				<button className="underline text-white hover:font-bold text-xl" onClick={onRestart}>
					Restart
				</button>
				<button className="underline text-white hover:font-bold text-xl" onClick={onFinish}>
					Finish
				</button>
			</div>
		</header>
	);
};

export default Header;
