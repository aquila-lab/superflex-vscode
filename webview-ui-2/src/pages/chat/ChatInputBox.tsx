import { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from '../../components/ui/Button';
import { MessageType } from '../../../../shared/model';
import { IoIosReturnLeft } from 'react-icons/io';
import { useNewMessage } from '../../context/NewMessageContext';

export const ChatInputBox = () => {
  const [input, setInput] = useState('');
  const { sendMessageContent, isMessageProcessing } = useNewMessage();

  const handleSend = async () => {
    if (!input.trim()) return;

    const success = await sendMessageContent([{ type: MessageType.Text, text: input.trim() }], []);

    if (success) {
      setInput('');
    }
  };

  return (
    <div className="border border-border rounded-md p-2 mx-4 mb-4">
      <TextareaAutosize
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isMessageProcessing}
        placeholder="Ask me anything..."
        className="w-full resize-none bg-transparent border-0 focus:outline-none"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
      />
      <div className="flex justify-end mt-2">
        <Button size="sm" disabled={isMessageProcessing ?? !input.trim()} onClick={handleSend}>
          <IoIosReturnLeft className="mr-2 h-4 w-4" />
          Send
        </Button>
      </div>
    </div>
  );
};
