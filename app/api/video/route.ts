import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import Replicate from 'replicate';

import { increaseApiLimit, checkApiLimit } from '@/lib/api-limit';
import { checkSubscription } from '@/lib/subscription';

const replicate = new Replicate({
	auth: process.env.REPLICATE_API_TOKEN!,
});

export async function POST(req: Request) {
	try {
		const { userId } = auth();
		const body = await req.json();
		const { prompt } = body;

		if (!userId) {
			return new NextResponse('Unauthorized', { status: 401 });
		}

		if (!prompt) {
			return new NextResponse('Prompt is required', { status: 400 });
		}

		const freeTrial = await checkApiLimit();

		const isPro = await checkSubscription();

		if (!freeTrial && !isPro) {
			return new NextResponse('Free trial has expired.', { status: 403 });
		}

		const response = await replicate.run(
			'lucataco/hotshot-xl:78b3a6257e16e4b241245d65c8b2b81ea2e1ff7ed4c55306b511509ddbfd327a',
			{
				input: {
					prompt,
				},
			}
		);

		if (!isPro) {
			await increaseApiLimit();
		}

		return NextResponse.json(response);
	} catch (err) {
		console.log('[VIDEO ERROR]', err);
		return new NextResponse('Internal Server Error', { status: 500 });
	}
}
