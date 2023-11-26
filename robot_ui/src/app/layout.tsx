import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'Joking Robot',
	description: 'Can I joke on you?',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<Header />
				<main className="flex flex-col items-center justify-between w-full">{children}</main>
			</body>
		</html>
	);
}
