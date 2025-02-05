export const LoadingDots = ({ isLoading }: { isLoading: boolean }) => {
	if (!isLoading) {
		return null;
	}

	return (
		<div className="flex-1 mt-3 ml-2">
			<div className="flex items-center gap-x-1">
				<span className="sr-only">Loading...</span>
				<div className="size-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
				<div className="size-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
				<div className="size-1 bg-muted-foreground rounded-full animate-bounce" />
			</div>
		</div>
	);
};
