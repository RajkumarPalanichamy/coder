'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Download } from 'lucide-react';

// Dynamic import to avoid SSR issues
const Editor = dynamic(() => import('@monaco-editor/react'), { 
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">Loading editor...</p>
      </div>
    </div>
  )
});

// Language configurations for Monaco Editor
const LANGUAGE_CONFIG = {
  javascript: {
    monacoId: 'javascript',
    defaultCode: `function solution(input) {
    // Your code here
    return "";
}

// Example usage:
// console.log(solution("test input"));`,
    fileExtension: '.js'
  },
  python: {
    monacoId: 'python',
    defaultCode: `def solution(input_data):
    # Your code here
    return ""

# Example usage:
# print(solution("test input"))`,
    fileExtension: '.py'
  },
  java: {
    monacoId: 'java',
    defaultCode: `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String input = br.readLine();
        
        // Your code here
        System.out.println(solution(input));
    }
    
    public static String solution(String input) {
        // Your code here
        return "";
    }
}`,
    fileExtension: '.java'
  },
  cpp: {
    monacoId: 'cpp',
    defaultCode: `#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
using namespace std;

string solution(string input) {
    // Your code here
    return "";
}

int main() {
    string input;
    getline(cin, input);
    cout << solution(input) << endl;
    return 0;
}`,
    fileExtension: '.cpp'
  },
  c: {
    monacoId: 'c',
    defaultCode: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

char* solution(char* input) {
    // Your code here
    char* result = malloc(256);
    strcpy(result, "");
    return result;
}

int main() {
    char input[1000];
    fgets(input, sizeof(input), stdin);
    
    char* result = solution(input);
    printf("%s\\n", result);
    
    free(result);
    return 0;
}`,
    fileExtension: '.c'
  }
};

// Monaco Editor themes
const THEMES = {
  light: 'vs',
  dark: 'vs-dark',
  'high-contrast': 'hc-black'
};

export default function MonacoEditor({
  code,
  language,
  onChange,
  onMount,
  className = '',
  height = '400px',
  readOnly = false,
  showToolbar = true,
  starterCode = ''
}) {
  const [currentTheme, setCurrentTheme] = useState('light');
  const [fontSize, setFontSize] = useState(14);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const editorRef = useRef(null);
  const containerRef = useRef(null);

  const langConfig = LANGUAGE_CONFIG[language] || LANGUAGE_CONFIG.javascript;

  // Initialize code with starter code or default template
  useEffect(() => {
    if (!code && (starterCode || langConfig.defaultCode)) {
      const initialCode = starterCode || langConfig.defaultCode;
      onChange?.(initialCode);
    }
  }, [language, starterCode, code, onChange, langConfig.defaultCode]);

  // Handle editor mount
  const handleEditorDidMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    
    // Configure Monaco Editor
    monaco.editor.setTheme(THEMES[currentTheme]);
    
    // Add custom key bindings
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Save functionality (can be customized)
    });
    
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyR, () => {
      // Run code functionality (can be customized)
    });

    // Anti-cheat: disable copy / cut / paste and Ctrl+P.
    // Undo (Ctrl+Z) and redo (Ctrl+Y) are intentionally left enabled.
    editor.onKeyDown((e) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (
        ctrl &&
        (e.keyCode === monaco.KeyCode.KeyC ||
          e.keyCode === monaco.KeyCode.KeyX ||
          e.keyCode === monaco.KeyCode.KeyV ||
          e.keyCode === monaco.KeyCode.KeyP)
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    });

    // Also block clipboard events triggered via the mouse / context menu.
    const domNode = editor.getDomNode();
    if (domNode) {
      ['copy', 'cut', 'paste'].forEach((evt) => {
        domNode.addEventListener(evt, (e) => {
          e.preventDefault();
          e.stopPropagation();
        });
      });
    }

    // Configure language-specific features
    if (language === 'javascript') {
      monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2020,
        allowNonTsExtensions: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.CommonJS,
        noEmit: true,
        esModuleInterop: true,
        jsx: monaco.languages.typescript.JsxEmit.React,
        reactNamespace: 'React',
        allowJs: true,
        typeRoots: ['node_modules/@types']
      });
    }

    onMount?.(editor, monaco);
  }, [currentTheme, language, onMount]);

  // Download code as file
  const handleDownload = useCallback(() => {
    if (editorRef.current) {
      const code = editorRef.current.getValue();
      const blob = new Blob([code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `solution${langConfig.fileExtension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [langConfig.fileExtension]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  }, [isFullscreen]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Reset to default code
  const resetCode = useCallback(() => {
    const defaultCode = starterCode || langConfig.defaultCode;
    onChange?.(defaultCode);
  }, [starterCode, langConfig.defaultCode, onChange]);

  return (
    <div 
      ref={containerRef}
      className={`${className} ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'relative'}`}
    >
      {showToolbar && (
        <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <select
              value={currentTheme}
              onChange={(e) => setCurrentTheme(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1 text-gray-900"
            >
              <option value="light">Light Theme</option>
              <option value="dark">Dark Theme</option>
              <option value="high-contrast">High Contrast</option>
            </select>
            
            <select
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="text-sm border border-gray-300 rounded px-2 py-1 text-gray-900"
            >
              <option value="12">12px</option>
              <option value="14">14px</option>
              <option value="16">16px</option>
              <option value="18">18px</option>
              <option value="20">20px</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={resetCode}
              className="flex items-center px-2 py-1 text-sm text-gray-600 hover:text-gray-900"
              title="Reset to default code"
            >
              Reset
            </button>
            
            <button
              onClick={handleDownload}
              className="flex items-center px-2 py-1 text-sm text-gray-600 hover:text-gray-900"
              title="Download code"
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </button>

            <button
              onClick={toggleFullscreen}
              className="flex items-center px-2 py-1 text-sm text-gray-600 hover:text-gray-900"
              title="Toggle fullscreen"
            >
              {isFullscreen ? '⛶' : '⛶'}
            </button>
          </div>
        </div>
      )}

      <div style={{ height: isFullscreen ? 'calc(100vh - 60px)' : height }}>
        <Editor
          height="100%"
          language={langConfig.monacoId}
          value={code}
          onChange={onChange}
          onMount={handleEditorDidMount}
          theme={THEMES[currentTheme]}
          options={{
            minimap: { enabled: !isFullscreen ? false : true },
            fontSize: fontSize,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: language === 'python' ? 4 : 2,
            insertSpaces: true,
            wordWrap: 'on',
            contextmenu: false,
            quickSuggestions: true,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on',
            bracketMatching: 'always',
            autoIndent: 'advanced',
            formatOnPaste: true,
            formatOnType: true,
            readOnly: readOnly,
            selectOnLineNumbers: true,
            glyphMargin: true,
            folding: true,
            foldingStrategy: 'auto',
            showFoldingControls: 'always',
            unfoldOnClickAfterEndOfLine: true,
            cursorBlinking: 'blink',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            mouseWheelZoom: true,
            multiCursorModifier: 'ctrlCmd',
            accessibilitySupport: 'auto'
          }}
        />
      </div>
    </div>
  );
}
