import { type ReactNode, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import type { Role } from "../../../../shared/model";
import {
	type MarkdownCodeProps,
	cn,
	defaultClassName,
	roleClassName,
} from "../../common/utils";
import { MarkdownCode } from "./MarkdownCode";

export const MarkdownRender = ({
	role,
	children,
}: { role: Role; children: ReactNode }) => {
	const codeComponents = useMemo(
		() => ({
			code: (props: MarkdownCodeProps) => <MarkdownCode {...props} />,
		}),
		[],
	);

	return (
		<ReactMarkdown
			className={cn(roleClassName[role] ?? defaultClassName)}
			components={codeComponents}
		>
			{String(children)}
		</ReactMarkdown>
	);
};
