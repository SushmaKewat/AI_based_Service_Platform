'use client';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Download, Palette } from 'lucide-react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import Image from 'next/image';

import { Heading } from '@/components/heading';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';

import { formSchema } from './constants';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Empty } from '@/components/empty';
import { Loader } from '@/components/loader';
import { cn } from '@/lib/utils';
import { Card, CardFooter } from '@/components/ui/card';
import { useProModal } from '@/hooks/use-pro-modal';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import * as mi from '@magenta/image';

const StyleTransferPage = () => {
	const proModal = useProModal();
	const router = useRouter();
	const [image, setImage] = useState(null);
	const [contentImage, setContentImage] = useState<string>('');
	const [styleImage, setStyleImage] = useState<string>('');
	const [formImages, setFormImages] = useState({
		formContentImage: z.any(),
		formStyleImage: z.any(),
	});
	const [isLoading, setIsLoading] = useState(false);
	const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
	const [contentImg, setContentImg] = useState<HTMLImageElement>(null);
	const [styleImg, setStyleImg] = useState<HTMLImageElement>(null);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
	});

	const contentFileRef = form.register('content');

	const styleFileRef = form.register('style');

	//const isLoading = form.formState.isSubmitting;

	const model = new mi.ArbitraryStyleTransferNetwork();

	async function stylize() {
		// This does all the work!
		model.stylize(contentImg, styleImg).then((imageData) => {
			canvas.getContext('2d').putImageData(imageData, 0, 0);
		});
	}

	useEffect(() => {
		setCanvas(document.getElementById('stylized') as unknown as HTMLCanvasElement);
		//const ctx = canvas.getContext('2d');
		setContentImg(document.getElementById('contentImg') as HTMLImageElement);
		setStyleImg(document.getElementById('styleImg') as HTMLImageElement);
	}, []);

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		try {
			setIsLoading(true);
			model
				.initialize()
				.then(() => {
					stylize();
				})
				.then(() => {
					setIsLoading(false);
				});

			/* setImage(null);

			const formData = new FormData();
			formData.append('content', values.content);
			formData.append('style', values.style);
			console.log('Values', values);
			console.log('Form data', formData);
			const response = await axios.post('/api/styletransfer', values, {
				headers: {
					'Content-Type': 'multipart/form-data',
					Accept: 'application/json',
				},
			});
			console.log(response);
 */
			//const urls = response.data.map((image: { url: string }) => image.url);
			/* setImage(response.data); */

			form.reset();
		} catch (error: any) {
			if (error?.response?.status === 403) {
				proModal.onOpen();
			} else {
				toast.error('Something went wrong');
			}
		} finally {
			router.refresh();
		}
	};

	const handleContentImageChange = (e: any) => {
		setContentImage(URL.createObjectURL(e.target.files[0]));
	};
	const handleStyleImageChange = (e: any) => {
		setStyleImage(URL.createObjectURL(e.target.files[0]));
	};

	return (
		<div>
			<Heading
				title='Style Transfer'
				description='Apply artistic styles to your images.'
				icon={Palette}
				iconColor='text-pink-700'
				bgColor='bg-pink-700/10'
			/>
			<div className='px-4 lg:px-8'>
				<div>
					<Form {...form}>
						<form
							encType='multipart/form-data'
							onSubmit={form.handleSubmit(onSubmit)}
							className='rounded-lg
                        border
                        w-full
                        p-4
                        px-3
                        md:px-6
                        focus-within:shadow-sm
                        grid
                        grid-cols-12
                        gap-2'>
							<FormField
								control={form.control}
								name='content'
								render={({ field }) => (
									<FormItem className='flex flex-col justify-start col-span-12 lg:col-span-5'>
										<FormLabel className='m-0 px-2 font-md text-xl'>
											Content Image
										</FormLabel>
										<FormControl className='m-0 p-0'>
											{/* <Input
												{...contentFileRef}
												placeholder='Picture'
												type='file'
												accept='image/*'
												onChange={(event) => {
													field.onChange(
														event.target?.files?.[0] ?? undefined
													);
													setContentImage(
														URL.createObjectURL(event?.target?.files[0])
													);
													setFormImages({
														...formImages,

														formContentImage: event.target?.files?.[0],
													});
												}}
												id='contentImg'
												 onChange={handleContentImageChange} 
												className='text-sm text-grey-500 file:mr-5 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:cursor-pointer hover:file:bg-amber-50 hover:file:text-amber-700'
											/> */}
											<label>
												<input
													onChange={handleContentImageChange}
													id='contentImg'
													type='file'
													name='file'
													accept='image/*'
													className='text-sm text-grey-500 file:mr-5 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:cursor-pointer hover:file:bg-amber-50 hover:file:text-amber-700'
												/>
											</label>
										</FormControl>
										{contentImage !== '' && (
											<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8'>
												<Card
													className='rounded-lg overflow-hidden'
													key={contentImage}>
													<div className='relative aspect-square'>
														<Image
															src={contentImage}
															fill
															alt='image'
														/>
													</div>
												</Card>
											</div>
										)}
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='style'
								render={({ field }) => (
									<FormItem className='flex flex-col justify-start col-span-12 lg:col-span-5'>
										<FormLabel className='m-0 px-2 font-md text-xl'>
											Style Image
										</FormLabel>
										<FormControl className='m-0 p-0'>
											<label>
												<input
													onChange={handleStyleImageChange}
													id='styleImg'
													type='file'
													name='file'
													accept='image/*'
													className='text-sm text-grey-500 file:mr-5 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:cursor-pointer hover:file:bg-amber-50 hover:file:text-amber-700'
												/>
											</label>
											{/* <Input
												{...styleFileRef}
												placeholder='Picture'
												type='file'
												accept='image/*'
												onChange={(event) => {
													field.onChange(
														event.target?.files?.[0] ?? undefined
													);
													setStyleImage(
														URL.createObjectURL(event?.target?.files[0])
													);
													setFormImages({
														...formImages,
														formStyleImage: event.target?.files?.[0],
													});
												}}
												id='styleImg'
												 onChange={handleStyleImageChange}
												className='text-sm text-grey-500 file:mr-5 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:cursor-pointer hover:file:bg-amber-50 hover:file:text-amber-700'
											/> */}
										</FormControl>
										{styleImage !== '' && (
											<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8'>
												<Card
													className='rounded-lg overflow-hidden'
													key={styleImage}>
													<div className='relative aspect-square'>
														<Image src={styleImage} fill alt='image' />
													</div>
												</Card>
											</div>
										)}
									</FormItem>
								)}
							/>

							<Button
								type='submit'
								className='col-span-12 lg:col-span-2 w-full '
								disabled={isLoading}>
								Generate
							</Button>
						</form>
					</Form>
				</div>
				<div className='space-y-4 mt-4'>
					{isLoading && (
						<div className='p-20'>
							<Loader />
						</div>
					)}
					{image === '' && !isLoading && <Empty label='No images generated.' />}
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8'>
						<Card className='rounded-lg overflow-hidden' key={image}>
							<div className='relative aspect-square'>
								<canvas id='stylized' width={400} height={400} />
								{/* <Image src={image} alt='alt' width={200} height={200} /> */}
							</div>
							<CardFooter className='p-2'>
								<Button
									/* onClick={() => window.open(image)} */
									variant='secondary'
									className='w-full'>
									<Download className='h-4 w-4 mr-2' /> Download
								</Button>
							</CardFooter>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
};

export default StyleTransferPage;
