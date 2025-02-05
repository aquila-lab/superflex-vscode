import { Fragment, type ReactNode } from "react";
import { useThreads } from "../context/ThreadsProvider";

export const ThreadResetWrapper = ({ children }: { children: ReactNode }) => {
	const { threadKey } = useThreads();

	return <Fragment key={threadKey}>{children}</Fragment>;
};
