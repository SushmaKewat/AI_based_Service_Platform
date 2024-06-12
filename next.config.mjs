/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		domains: [
			//hostname from the error message in the application
			'localhost',
			'oaidalleapiprodscus.blob.core.windows.net',
		],
	},
};

export default nextConfig;
