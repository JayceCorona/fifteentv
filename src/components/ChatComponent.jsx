import React from 'react';
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageList,
  MessageInput,
  Thread,
  Window,
} from 'stream-chat-react';
import { StreamChat } from 'stream-chat';
import 'stream-chat-react/dist/css/v2/index.css';

const chatClient = StreamChat.getInstance('g9m53zqntv69');

const CustomChannelHeader = () => (
  <div className="chat-header">
    <h3>Live Chat</h3>
  </div>
);

const ChatComponent = () => {
  const [channel, setChannel] = React.useState(null);

  React.useEffect(() => {
    const setupChat = async () => {
      try {
        const userId = localStorage.getItem('chatUserId') || 
                      'user-' + Math.random().toString(36).substring(7);
        localStorage.setItem('chatUserId', userId);

        const response = await fetch('https://fifteentv-a5b5844eddeb.herokuapp.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        });

        const { token } = await response.json();

        await chatClient.connectUser(
          {
            id: userId,
            name: `User ${userId.substring(0, 6)}`,
          },
          token
        );

        const channel = chatClient.channel('messaging', 'fifteen-tv-chat', {
          name: 'Fifteen.tv Chat Room',
          members: [userId],
        });

        await channel.watch();
        setChannel(channel);
      } catch (error) {
        console.error('Chat initialization error:', error);
      }
    };

    setupChat();

    return () => {
      chatClient.disconnectUser();
    };
  }, []);

  if (!channel) return <div className="loading-chat">Loading chat...</div>;

  return (
    <Chat client={chatClient} theme="messaging light">
      <Channel channel={channel}>
        <Window>
          <ChannelHeader />
          <MessageList />
          <MessageInput />
        </Window>
        <Thread />
      </Channel>
    </Chat>
  );
};

export default ChatComponent; 