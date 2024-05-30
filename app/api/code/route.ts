import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';

import { increaseApiLimit, checkApiLimit } from '@/lib/api-limit';
import { checkSubscription } from '@/lib/subscription';

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

const instructionMessage: ChatCompletionMessageParam = {
	role: 'system',
	content:
		'You are a code generator. You must answer only in markdown code snippets. Use code comments for explanation.',
};

export async function POST(req: Request) {
	try {
		const { userId } = auth();
		const body = await req.json();
		const { messages } = body;

		if (!userId) {
			return new NextResponse('Unauthorized', { status: 401 });
		}

		/* if (!apiKey) {
			return new NextResponse('OpenAI Api key not configured', { status: 500 });
		} */

		if (!messages) {
			return new NextResponse('Messages a re required', { status: 400 });
		}

		const freeTrial = await checkApiLimit();
		const isPro = await checkSubscription();

		if (!freeTrial && !isPro) {
			return new NextResponse('Free trial has expired.', { status: 403 });
		}

		const response = await openai.chat.completions.create({
			model: 'gpt-3.5-turbo',
			messages: [instructionMessage, ...messages],
		});

		if (!isPro) {
			await increaseApiLimit();
		}

		return NextResponse.json(response.choices[0].message);
	} catch (err) {
		console.log('[CODE ERROR]', err);
		return new NextResponse('Internal Server Error', { status: 500 });
	}
}
