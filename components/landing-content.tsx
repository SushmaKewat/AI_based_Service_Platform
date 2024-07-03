'use client';

import { Card, CardHeader, CardTitle } from './ui/card';
import { CardContent } from '@/components/ui/card';

const testimonials = [
	{
		name: 'Sushma',
		avatar: 'S',
		title: 'Software Engineer',
		description: "This is the best AI tool I've ever used.",
	},
	{
		name: 'Sumitra Agnihotram',
		avatar: 'S',
		title: 'Python Developer',
		description: 'Amazing! Well built. All you need at one place.',
	},
	{
		name: 'Trupti',
		avatar: 'T',
		title: 'Data Analyst',
		description:
			"Thanks to Xynapse! Now I don't have to go to multiple sites to use AI services.",
	},
	{
		name: 'Rajnish',
		avatar: 'R',
		title: 'Frontend Developer',
		description: 'Creating images from text have never been this easier.',
	},
	{
		name: 'Manik Malhotra',
		avatar: 'M',
		title: 'Prompt Engineer',
		description: 'Prompt engneering never felt this better.',
	},
];

export const LandingContent = () => {
	return (
		<div className='px-10 pb-20'>
			<h2 className='text-center text-4xl text-white font-extrabold mb-10'>Testimonials</h2>
			<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
				{testimonials.map((item) => (
					<Card key={item.description} className='bg-[#192339] border-none text-white'>
						<CardHeader>
							<CardTitle className='flex items-center gap-x-2'>
								<div>
									<p className='text-lg'>{item.name}</p>
									<p className='text-zinc-400 text-sm'>{item.title}</p>
								</div>
							</CardTitle>
							<CardContent className='pt-4 px-0'>{item.description}</CardContent>
						</CardHeader>
					</Card>
				))}
			</div>
		</div>
	);
};
