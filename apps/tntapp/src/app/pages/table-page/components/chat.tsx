import { Message } from '@tnt-react/ws-messages';
import { MutableRefObject } from 'react';
import '../../../styles/table-page.css';

interface ChatProps {
  chatContainerReference: MutableRefObject<null>;
  recievedMessages: Message[];
  inputMessage: string;
  onSend: () => void;
  setInputMessage: (message: string) => void;
}

export function Chat(props: ChatProps) {
  return (
    <div className="chat-popup" ref={props.chatContainerReference}>
      <div className="chat-messages">
        {/* Mapping over the receivedMessages array to render each message. */}
        {props.recievedMessages.map((msg, index) => (
          // Each message is wrapped in a div with a unique key for React's reconciliation.
          <div key={index} className="chat-message">
            <p className="message-username">{msg.username}</p>
            <p className="message-text">{msg.message}</p>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={props.inputMessage}
          onChange={(e) => props.setInputMessage(e.target.value)}
        />
        <button onClick={props.onSend}>Send</button>
      </div>
    </div>
  );
}
