import React from 'react';
export const ProgressBar = ({ onClick, progress }) => (React.createElement("div", { className: 'str-chat__message-attachment-audio-widget--progress-track', "data-progress": progress, "data-testid": 'audio-progress', onClick: onClick, role: 'progressbar', style: {
        '--str-chat__message-attachment-audio-widget-progress': progress + '%',
    } },
    React.createElement("div", { className: 'str-chat__message-attachment-audio-widget--progress-slider', style: { left: `${progress}px` } })));
