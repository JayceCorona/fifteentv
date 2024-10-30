import React from 'react';
import { useHandleFileChangeWrapper } from './utils';
export const UploadButton = ({ onFileChange, resetOnChange = true, ...rest }) => {
    const handleInputChange = useHandleFileChangeWrapper(resetOnChange, onFileChange);
    return React.createElement("input", { onChange: handleInputChange, type: 'file', ...rest });
};
