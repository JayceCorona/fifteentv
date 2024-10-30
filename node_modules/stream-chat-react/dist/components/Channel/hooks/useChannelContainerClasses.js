import { useChatContext } from '../../../context/ChatContext';
export const useChannelContainerClasses = ({ customClasses, }) => {
    const { useImageFlagEmojisOnWindows } = useChatContext('Channel');
    return {
        channelClass: customClasses?.channel ?? 'str-chat__channel',
        chatClass: customClasses?.chat ?? 'str-chat',
        chatContainerClass: customClasses?.chatContainer ?? 'str-chat__container',
        windowsEmojiClass: useImageFlagEmojisOnWindows && navigator.userAgent.match(/Win/)
            ? 'str-chat--windows-flags'
            : '',
    };
};
