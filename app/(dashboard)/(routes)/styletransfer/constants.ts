import * as z from 'zod';

export const formSchema = z.object({
	content: typeof window === 'undefined' ? z.any() : z.instanceof(FileList),
	style: typeof window === 'undefined' ? z.any() : z.instanceof(FileList),
});
