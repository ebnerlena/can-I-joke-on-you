import Link from 'next/link';

const EndScreen = () => {
	return (
		<div className="h-full w-full flex flex-col items-center justify-center gap-8 p-12">
			<div className="text-justify text-xl max-w-[800px]">
				<h2 className="font-bold pb-2">Thank you!</h2>
				<p>Thank you very much for participating in our user study!</p>
				<p className="pb-4">For our evaluating we kindly ask you to fill out the following questionnaire:</p>

				<Link
					className="btn mt-20"
					href={'https://docs.google.com/forms/d/1XZ35rf1fPlua9fnNoVj6-foQrYfN9qi5jwdG0DC9IxA/prefill'}
					target="_blank"
					rel="noopener noreferrer">
					Take Questionnaire
				</Link>
			</div>
		</div>
	);
};

export default EndScreen;
