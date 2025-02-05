import { useCallback, useEffect } from "react";
import type {
	EventResponseType,
	TypedEventResponseMessage,
} from "../../../shared/protocol";

type TypedEventConsumeHandler<T extends EventResponseType> = (
	event: Extract<TypedEventResponseMessage, { command: T }>,
) => void;

export function useConsumeMessage<T extends EventResponseType>(
	eventTypes: T | T[],
	handler: TypedEventConsumeHandler<T>,
	deps: React.DependencyList = [],
): void {
	const handleMessage = useCallback(
		(evt: MessageEvent<TypedEventResponseMessage>) => {
			const { command, error } = evt.data || {};

			const matchesType = Array.isArray(eventTypes)
				? eventTypes.includes(command as T)
				: eventTypes === command;

			if (!matchesType || error) {
				return;
			}

			handler(evt.data as Extract<TypedEventResponseMessage, { command: T }>);
		},
		[eventTypes, handler, ...deps],
	);

	useEffect(() => {
		window.addEventListener("message", handleMessage as EventListener);
		return () => {
			window.removeEventListener("message", handleMessage as EventListener);
		};
	}, [handleMessage]);
}
