import React from 'react';
import { DefaultTriggerProvider } from './DefaultTriggerProvider';
import { MessageInputFlat } from './MessageInputFlat';
import { useCooldownTimer } from './hooks/useCooldownTimer';
import { useCreateMessageInputContext } from './hooks/useCreateMessageInputContext';
import { useMessageInputState } from './hooks/useMessageInputState';
import { useChannelStateContext } from '../../context/ChannelStateContext';
import { useComponentContext } from '../../context/ComponentContext';
import { MessageInputContextProvider } from '../../context/MessageInputContext';
const MessageInputProvider = (props) => {
    const cooldownTimerState = useCooldownTimer();
    const messageInputState = useMessageInputState(props);
    const { emojiSearchIndex } = useComponentContext('MessageInput');
    const messageInputContextValue = useCreateMessageInputContext({
        ...cooldownTimerState,
        ...messageInputState,
        ...props,
        emojiSearchIndex: props.emojiSearchIndex ?? emojiSearchIndex,
    });
    return (React.createElement(MessageInputContextProvider, { value: messageInputContextValue }, props.children));
};
const UnMemoizedMessageInput = (props) => {
    const { Input: PropInput } = props;
    const { dragAndDropWindow } = useChannelStateContext();
    const { Input: ContextInput, TriggerProvider = DefaultTriggerProvider } = useComponentContext('MessageInput');
    const Input = PropInput || ContextInput || MessageInputFlat;
    if (dragAndDropWindow)
        return (React.createElement(React.Fragment, null,
            React.createElement(TriggerProvider, null,
                React.createElement(Input, null))));
    return (React.createElement(MessageInputProvider, { ...props },
        React.createElement(TriggerProvider, null,
            React.createElement(Input, null))));
};
/**
 * A high level component that has provides all functionality to the Input it renders.
 */
export const MessageInput = React.memo(UnMemoizedMessageInput);
