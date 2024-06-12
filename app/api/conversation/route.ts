import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

import { increaseApiLimit, checkApiLimit } from '@/lib/api-limit';

import { checkSubscription } from '@/lib/subscription';

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
	try {
		const { userId } = auth();
		const body = await req.json();
		const { messages } = body;
		console.log(body);

		if (!userId) {
			return new NextResponse('Unauthorized', { status: 401 });
		}

		if (!openai.apiKey) {
			return new NextResponse('OpenAI Api key not configured', { status: 500 });
		}

		if (!messages) {
			return new NextResponse('Messages are required', { status: 400 });
		}

		const freeTrial = await checkApiLimit();
		const isPro = await checkSubscription();

		if (!freeTrial && !isPro) {
			return new NextResponse('Free trial has expired.', { status: 403 });
		}

		const response = await openai.chat.completions.create({
			model: 'gpt-3.5-turbo',
			messages: messages,
			//stream: true,
		});

		/* const stream = await openai.chat.completions.create({
			model: 'gpt-3.5-turbo',
			messages: messages,
			stream: true,
		});
		for await (const part of stream) {
			console.log(part.choices[0].delta);
		} */

		if (!isPro) {
			await increaseApiLimit();
		}

		//return NextResponse.json(stream);
		return NextResponse.json(response.choices[0].message);
	} catch (error: any) {
		if (error instanceof OpenAI.APIError) {
			console.error(error.status); // e.g. 401
			console.error(error.message); // e.g. The authentication token you passed was invalid...
			console.error(error.code); // e.g. 'invalid_api_key'
			console.error(error.type); // e.g. 'invalid_request_error'
		} else {
			console.log('[CONVERSATION ERROR]', error);
		}

		return new NextResponse('[CONVERSATION ERROR] Internal Server Error', { status: 500 });
	}
}
