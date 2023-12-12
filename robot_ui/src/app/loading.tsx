export default function Loading() {
	return (
		<div className="flex h-full w-full grow flex-col items-center justify-center py-4">
			<span aria-label="loading spinner" className={`loading loading-spinner loading-md color-gray`} />
			<p className={'mt-3 animate-pulse text-md text-black'}>loading...</p>
		</div>
	);
}
