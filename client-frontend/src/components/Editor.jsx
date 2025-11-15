import React from 'react';
import { Editor as MonacoEditor } from '@monaco-editor/react';
import Loader from './Loader';

const Editor = ({ language, code, setCode }) => {
  const handleEditorChange = (value) => {
    setCode(value);
  };

  return (
    <MonacoEditor
      height="60vh"
      language={language}
      value={code}
      onChange={handleEditorChange}
      theme="vs-dark"
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        automaticLayout: true,
      }}
      loading={<Loader />}
    />
  );
};

export default Editor;