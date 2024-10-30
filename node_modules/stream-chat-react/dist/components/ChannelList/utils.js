import uniqBy from 'lodash.uniqby';
export const MAX_QUERY_CHANNELS_LIMIT = 30;
export const moveChannelUp = ({ activeChannel, channels, cid, }) => {
    // get index of channel to move up
    const channelIndex = channels.findIndex((channel) => channel.cid === cid);
    if (!activeChannel && channelIndex <= 0)
        return channels;
    // get channel to move up
    const channel = activeChannel || channels[channelIndex];
    return uniqBy([channel, ...channels], 'cid');
};
