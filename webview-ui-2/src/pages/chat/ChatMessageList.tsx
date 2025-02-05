import { ChatMessageListContainer } from "./ChatMessageListContainer";
import { ChatMessages } from "./ChatMessages";
import { StreamingMessage } from "./StreamingMessage";

export const ChatMessageList = () => {
	return (
		<ChatMessageListContainer>
			<ChatMessages />
			<StreamingMessage />
		</ChatMessageListContainer>
	);
};
