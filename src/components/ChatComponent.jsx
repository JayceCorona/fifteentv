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

const ChatComponent = () => {
  const [channel, setChannel] = React.useState(null);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const setupChat = async () => {
      try {
        console.log("Setting up chat...");
        const userId = localStorage.getItem('chatUserId') || 
                      'user-' + Math.random().toString(36).substring(7);
        localStorage.setItem('chatUserId', userId);

        const response = await fetch('https://fifteentv-a5b5844eddeb.herokuapp.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        });

        if (!response.ok) {
          throw new Error(`Token fetch failed: ${response.status}`);
        }

        const { token } = await response.json();
        console.log("Got token:", token);

        await chatClient.connectUser(
          {
            id: userId,
            name: `User ${userId.substring(0, 6)}`,
          },
          token
        );
        console.log("Connected user");

        const channel = chatClient.channel('messaging', 'fifteen-tv-chat', {
          name: 'Fifteen.tv Chat Room',
          members: [userId],
        });

        await channel.watch();
        console.log("Channel watching");
        setChannel(channel);
      } catch (error) {
        console.error('Chat initialization error:', error);
        setError(error.message);
      }
    };

    setupChat();

    return () => {
      chatClient.disconnectUser();
    };
  }, []);

  console.log("Rendering ChatComponent, channel:", channel, "error:", error);

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red', background: 'white' }}>
        Error: {error}
      </div>
    );
  }

  if (!channel) {
    return (
      <div style={{ padding: '20px', background: 'white' }}>
        Loading chat...
      </div>
    );
  }

  return (
    <div style={{ width: '300px', height: '100%', background: 'white' }}>
      <Chat client={chatClient} theme="messaging light">
        <Channel channel={channel}>
          <Window>
            <ChannelHeader title="Live Chat" />
            <MessageList />
            <MessageInput />
          </Window>
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatComponent; 