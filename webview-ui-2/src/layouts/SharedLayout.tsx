import type { ReactNode } from "react";

export const SharedLayout = ({ children }: { children: ReactNode }) => {
	return (
		<div className="App h-full">
			<div id="AppContent" className="h-full">
				{children}
			</div>
		</div>
	);
};
