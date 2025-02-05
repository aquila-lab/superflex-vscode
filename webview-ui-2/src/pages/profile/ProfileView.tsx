import { useEffect } from "react";
import { useUser } from "../../context/UserContext";
import { BillingCard } from "./BillingCard";
import { UserInfoCard } from "./UserInfoCard";

export const ProfileView = () => {
	const {
		user,
		subscription,
		handleSubscribe,
		handleManageBilling,
		fetchSubscription,
	} = useUser();

	useEffect(() => {
		fetchSubscription();
	}, [fetchSubscription]);

	return (
		<div className="flex-1 w-full p-6 space-y-8">
			<UserInfoCard user={user} />
			<BillingCard
				user={user}
				subscription={subscription}
				onManageBilling={handleManageBilling}
				onSubscribe={handleSubscribe}
			/>
		</div>
	);
};

export default ProfileView;
