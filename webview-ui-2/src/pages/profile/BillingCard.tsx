import type { User, UserSubscription } from "../../../../shared/model";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../../components/ui/Card";
import { UsageDisplay } from "./UsageDisplay";

export const BillingCard = ({
	user,
	subscription,
	onManageBilling,
	onSubscribe,
}: {
	user: User;
	subscription: UserSubscription;
	onManageBilling: () => void;
	onSubscribe: () => void;
}) => {
	if (!subscription.plan) {
		return null;
	}

	const isFreePlan = subscription.plan.name.toLowerCase().includes("free");
	const hasStripeAccount = Boolean(user.stripeCustomerID);
	const showManageBilling = hasStripeAccount && !isFreePlan;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Billing</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{subscription.endDate && (
					<Badge variant="destructive">
						Your subscription has been canceled and will end on{" "}
						{new Date(subscription.endDate).toLocaleDateString()}.
					</Badge>
				)}

				<div className="flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-center">
					<div>
						<p className="text-sm font-medium text-muted-foreground">
							Current Plan
						</p>
						<p className="text-lg font-semibold capitalize">
							{subscription.plan.name}
						</p>
					</div>

					{showManageBilling ? (
						<Button onClick={onManageBilling}>Manage Billing</Button>
					) : (
						<Button onClick={onSubscribe}>Subscribe</Button>
					)}
				</div>

				<div className="space-y-4">
					<CardDescription>Usage</CardDescription>
					<UsageDisplay
						label="Premium Requests"
						used={subscription.premiumRequestsUsed}
						limit={subscription.plan.premiumRequestLimit}
					/>
					<UsageDisplay
						label="Basic Requests"
						used={subscription.basicRequestsUsed}
						limit={subscription.plan.basicRequestLimit}
					/>
				</div>
			</CardContent>
		</Card>
	);
};
