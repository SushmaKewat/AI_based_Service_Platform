import { useUser } from '@clerk/nextjs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export const UserAvatar = () => {
	const { user } = useUser();

	return (
		<Avatar>
			<AvatarImage src={user?.imageUrl} />
			{/* if there is no profile image */}
			<AvatarFallback>
				{user?.firstName?.charAt(0)}
				{user?.lastName?.charAt(0)}
			</AvatarFallback>
		</Avatar>
	);
};
