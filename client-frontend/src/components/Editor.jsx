import React, { useState, useEffect, useCallback } from 'react';
import { Editor as MonacoEditor } from '@monaco-editor/react';
import { debounce } from 'lodash';
import { IoSettings } from 'react-icons/io5';
import Loader from './Loader';
import { MONACO_THEMES, FONT_SIZES } from '../utils/constants';
import { CODE_TEMPLATES, LANGUAGE_OPTIONS } from '../utils/codeTemplates';
import useTheme from '../hooks/useTheme';

const Editor = ({ language, code, setCode, problemSlug }) => {
  const { theme: appTheme } = useTheme();
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [showSettings, setShowSettings] = useState(false);

  // Load saved preferences
  useEffect(() => {
    const savedTheme = localStorage.getItem('editorTheme') || 'vs-dark';
    const savedFontSize = parseInt(localStorage.getItem('editorFontSize')) || 14;
    setEditorTheme(savedTheme);
    setFontSize(savedFontSize);
  }, []);

  // Auto-save code to localStorage
  const debouncedSave = useCallback(
    debounce((code) => {
      if (problemSlug) {
        localStorage.setItem(`code_${problemSlug}_${language}`, code);
      }
    }, 2000),
    [problemSlug, language]
  );

  useEffect(() => {
    if (code) {
      debouncedSave(code);
    }
  }, [code, debouncedSave]);

  const handleEditorChange = (value) => {
    setCode(value);
  };

  const handleThemeChange = (newTheme) => {
    setEditorTheme(newTheme);
    localStorage.setItem('editorTheme', newTheme);
  };

  const handleFontSizeChange = (newSize) => {
    setFontSize(newSize);
    localStorage.setItem('editorFontSize', newSize);
  };

  const handleTemplateLoad = () => {
    const template = CODE_TEMPLATES[language] || CODE_TEMPLATES.cpp;
    setCode(template);
  };

  return (
    <div className="relative">
      {/* Settings Bar */}
      <div className={`flex items-center justify-between p-2 ${appTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} border-b border-gray-600`}>
        <div className="flex items-center gap-4">
          <button
            onClick={handleTemplateLoad}
            className="text-sm px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded"
          >
            Load Template
          </button>
          <span className="text-sm text-gray-400">Auto-save enabled</span>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 hover:bg-gray-600 rounded"
        >
          <IoSettings size={20} />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className={`absolute right-0 top-12 z-10 ${appTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow-lg border border-gray-700 w-64`}>
          <h3 className="font-bold mb-3">Editor Settings</h3>
          
          <div className="mb-4">
            <label className="block text-sm mb-2">Theme</label>
            <select
              value={editorTheme}
              onChange={(e) => handleThemeChange(e.target.value)}
              className={`w-full p-2 rounded ${appTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} border border-gray-600`}
            >
              {MONACO_THEMES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-2">Font Size</label>
            <select
              value={fontSize}
              onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
              className={`w-full p-2 rounded ${appTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} border border-gray-600`}
            >
              {FONT_SIZES.map(size => (
                <option key={size} value={size}>{size}px</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <MonacoEditor
        height="60vh"
        language={language}
        value={code}
        onChange={handleEditorChange}
        theme={editorTheme}
        options={{
          fontSize: fontSize,
          minimap: { enabled: false },
          automaticLayout: true,
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          lineNumbers: 'on',
          renderWhitespace: 'selection',
        }}
        loading={<Loader />}
      />
    </div>
  );
};

export default Editor;
