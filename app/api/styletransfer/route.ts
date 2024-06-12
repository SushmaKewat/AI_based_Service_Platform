import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import * as mi from '@magenta/image';
import { createCanvas } from 'canvas';

import { increaseApiLimit, checkApiLimit } from '@/lib/api-limit';
import { checkSubscription } from '@/lib/subscription';

/* export const config = {
	api: {
		bodyParser: false,
	},
};
 */
export async function POST(req: Request) {
	try {
		const { userId } = auth();
		const body = await req.formData();

		//JSON.stringify(Object.fromEntries(body));

		const content = body.get('content[]') as unknown as HTMLCanvasElement;
		const style = body.get('style[]') as unknown as HTMLCanvasElement;

		console.log(body);
		console.log('content', content);
		console.log('style', style);

		if (!userId) {
			return new NextResponse('Unauthorized', { status: 401 });
		}

		if (!content || !style) {
			return new NextResponse('Image is required', { status: 400 });
		}

		const freeTrial = await checkApiLimit();
		const isPro = await checkSubscription();

		if (!freeTrial && !isPro) {
			return new NextResponse('Free trial has expired.', { status: 403 });
		}

		const canvas = createCanvas(400, 400);
		const ctx = canvas.getContext('2d');

		const model = new mi.ArbitraryStyleTransferNetwork();

		const stylize = () => {
			model
				.stylize(JSON.parse(JSON.stringify(content)), JSON.parse(JSON.stringify(style)))
				.then((imageData) => {
					console.log(imageData);
					ctx.putImageData(imageData, 0, 0);
					return ctx;
				});
		};

		const response = await model.initialize().then(stylize);

		if (!isPro) {
			await increaseApiLimit();
		}

		return NextResponse.json(response);
	} catch (err) {
		console.log('[STYLE TRANSFER ERROR]', err);
		return new NextResponse('Internal Server Error', { status: 500 });
	}
}
