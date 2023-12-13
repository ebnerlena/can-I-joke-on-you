export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { LOGS_DIR } from '@/constants';
import { readdirSync } from 'fs';
import path from 'path';

const getAllFiles = async () => {
	'use server';

	const filenames = readdirSync(LOGS_DIR);
	const logFiles: string[] = [];

	filenames.forEach((filename) => {
		if (filename.endsWith('.json')) {
			logFiles.push(path.join('/', 'logs', filename));
		}
	});

	return logFiles;
};

export default async function DownloadsPage() {
	const filepaths = await getAllFiles();

	return (
		<>
			<main className="flex flex-col w-full h-screen justify-start max-w-[2000px] self-center pt-28 px-8 pb-8">
				<h2 className="font-bold pb-4 text-lg">Logs</h2>

				<ul className="list-disc min-w-0">
					{filepaths.map((file) => (
						<li key={file} className="flex w-full items-center gap-6 pb-2 min-w-0">
							{file.split('/').pop()}
							<a href={file} className="btn text-xs" download>
								Download
							</a>
						</li>
					))}
				</ul>
			</main>
		</>
	);
}
