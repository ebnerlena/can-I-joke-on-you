'use client';

import { useApplicationStore } from '@/store/store';
import { ApplicationStatus } from '@/types/ApplicationStatus';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

const Header = () => {
	const setApplicationStatus = useApplicationStore((state) => state.setStatus);
	const router = useRouter();

	const onRestart = useCallback(() => {
		setApplicationStatus(ApplicationStatus.START);
		router.push('/');
		router.refresh();
	}, [setApplicationStatus, router]);

	const onFinish = useCallback(() => {
		setApplicationStatus(ApplicationStatus.END);
	}, [setApplicationStatus]);

	return (
		<header className="bg-sky-600 min-h-[100px] flex justify-between items-center px-8">
			<h1 className="text-white text-4xl">Can I joke on you?</h1>
			<div className="flex gap-2 items-center justify-center">
				<div
					className="cursor-pointer underline text-white hover:font-bold text-xl transition-all duration-2000 ease-in"
					onClick={onRestart}>
					Restart
				</div>
				<Link
					href="/end"
					className="cursor-pointer underline text-white hover:font-bold text-xl transition-all duration-2000 ease-in"
					onClick={onFinish}>
					Finish
				</Link>
			</div>
		</header>
	);
};

export default Header;
