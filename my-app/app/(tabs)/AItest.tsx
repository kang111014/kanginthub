import { GoogleGenerativeAI } from '@google/generative-ai';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

// --- 類型定義 ---
export type Part = { text: string };
export type ChatMsg = { role: 'user' | 'model'; parts: Part[] };

// --- 子元件：單則聊天訊息 ---
const ChatMessage: React.FC<{ message: ChatMsg }> = ({ message }) => {
  const isModel = message.role === 'model';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.parts.map(p => p.text).join('\n'));
  };

  return (
    <div style={{ ...styles.msg, ...(isModel ? styles.modelMsg : styles.userMsg) }}>
      <div style={styles.msgHeader}>
        <span style={styles.msgRole}>{isModel ? 'AI 機率助手' : '您'}</span>
        {isModel && <button onClick={handleCopy} style={styles.copyBtn}>複製</button>}
      </div>
      <div style={styles.msgBody}>
        <ReactMarkdown>{message.parts.map(p => p.text).join('\n')}</ReactMarkdown>
      </div>
    </div>
  );
};

// --- 主元件：聊天機器人 ---
export default function ProbabilityChatbot() {
  const [model, setModel] = useState<string>('gemini-2.5-flash');
  const [apiKey, setApiKey] = useState('');
  const [rememberKey, setRememberKey] = useState(true);
  const [history, setHistory] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // --- 初始載入 ---
  useEffect(() => {
    const savedKey = localStorage.getItem('AIzaSyBPb2HI51D1kxVegjfvIpgJs3qmsn4JIK4');
    if (savedKey) setApiKey(savedKey);
  }, []);

  // --- 自動捲動至底部 ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loading]);

  // --- 初始化 AI ---
  const ai = useMemo(() => {
    if (!apiKey) return null;
    try {
      return new GoogleGenerativeAI(apiKey);
    } catch (e: any) {
      setError('無效的 API Key 格式: ' + e.message);
      return null;
    }
  }, [apiKey]);

  // --- 處理函式 ---
  const handleSendMessage = async (messageContent?: string) => {
    const content = (messageContent || input).trim();
    if (!content || loading) return;
    if (!ai) {
      setError('請先在左側輸入您的 Gemini API Key');
      return;
    }

    setError('');
    setLoading(true);
    setInput('');
    
    const newHistory: ChatMsg[] = [...history, { role: 'user', parts: [{ text: content }] }];
    setHistory(newHistory);

    try {
      // 這裡使用了最新的 API 呼叫方式
      const modelInstance = ai.getGenerativeModel({ model });
      const result = await modelInstance.generateContent(content);
      const response = await result.response;
      const reply = response.text() || '[AI 沒有回傳內容]';
      setHistory(h => [...h, { role: 'model', parts: [{ text: reply }] }]);
    } catch (err: any) {
      setError(err?.message || '發生未知錯誤');
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setHistory([]);
  };

  // --- 渲染 ---
  return (
    <div style={styles.appContainer}>
      {/* --- 左側邊欄 --- */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h3>設定</h3>
        </div>
        <div style={styles.sidebarContent}>
          <label style={styles.label}>
            <span>Gemini API Key</span>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                const v = e.target.value;
                setApiKey(v);
                if (rememberKey) localStorage.setItem('gemini_api_key', v);
              }}
              placeholder="貼上您的 API Key"
              style={styles.input}
            />
          </label>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={rememberKey}
              onChange={(e) => {
                setRememberKey(e.target.checked);
                if (!e.target.checked) localStorage.removeItem('gemini_api_key');
                else if (apiKey) localStorage.setItem('gemini_api_key', apiKey);
              }}
            />
            <span>記住 API Key</span>
          </label>
          
          <label style={styles.label}>
            <span>模型 (Model)</span>
            <input
              value={model}
              onChange={e => setModel(e.target.value)}
              style={styles.input}
            />
          </label>

          <button onClick={handleClearChat} style={styles.clearButton}>
            清除對話
          </button>
        </div>
      </aside>

      {/* --- 主聊天視窗 --- */}
      <main style={styles.chatContainer}>
        <div style={styles.messages}>
          {history.length === 0 ? (
            <div style={styles.welcomeScreen}>
              <h2>AI 機率小幫手</h2>
              <p>準備好開始探索機率的奧妙了嗎？</p>
            </div>
          ) : (
            history.map((msg, idx) => <ChatMessage key={idx} message={msg} />)
          )}
          {loading && (
            <div style={{...styles.msg, ...styles.modelMsg}}>
              <div style={styles.msgHeader}><span style={styles.msgRole}>AI 機率助手</span></div>
              <div style={styles.msgBody}>思考中...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {error && <div style={styles.error}>⚠️ {error}</div>}

        <div style={styles.composerArea}>
          <form
            onSubmit={e => { e.preventDefault(); handleSendMessage(); }}
            style={styles.composerForm}
          >
            <input
              placeholder="輸入關於機率的問題..."
              value={input}
              onChange={e => setInput(e.target.value)}
              style={styles.textInput}
            />
            <button
              type="submit"
              disabled={loading || !input.trim() || !apiKey}
              style={styles.sendBtn}
            >
              送出
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

// --- CSS 樣式 ---
const styles: Record<string, React.CSSProperties> = {
  appContainer: { display: 'flex', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f7f8fa' },
  sidebar: {
    width: '280px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e0e0e0',
    display: 'flex',
    flexDirection: 'column',
  },
  sidebarHeader: { padding: '16px', borderBottom: '1px solid #e0e0e0' },
  sidebarContent: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' },
  label: { display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', fontWeight: 600, color: '#333' },
  input: { padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 400 },
  clearButton: {
    marginTop: '16px',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ffcccc',
    backgroundColor: '#fffafa',
    color: '#d00',
    cursor: 'pointer',
    fontWeight: '600',
  },
  chatContainer: { flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f7f8fa' },
  messages: { flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' },
  welcomeScreen: { textAlign: 'center', margin: 'auto', color: '#888' },
  msg: { borderRadius: '12px', padding: '12px 16px', maxWidth: '90%', border: '1px solid #e0e0e0' },
  userMsg: { backgroundColor: '#e1efff', alignSelf: 'flex-end', borderBottomRightRadius: '4px' },
  modelMsg: { backgroundColor: '#ffffff', alignSelf: 'flex-start', borderBottomLeftRadius: '4px' },
  msgHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  msgRole: { fontSize: '13px', fontWeight: 700 },
  copyBtn: {
    background: 'none', border: '1px solid #ccc', borderRadius: '4px',
    padding: '2px 6px', fontSize: '10px', cursor: 'pointer'
  },
  msgBody: { fontSize: '15px', lineHeight: 1.6 },
  error: { color: '#d9534f', padding: '10px 24px', backgroundColor: '#f2dede', borderTop: '1px solid #e0e0e0' },
  composerArea: { padding: '16px', borderTop: '1px solid #e0e0e0', backgroundColor: '#ffffff' },
  composerForm: { display: 'flex', gap: '12px' },
  textInput: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid #ccc',
    fontSize: '15px',
  },
  sendBtn: {
    padding: '12px 24px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#007bff',
    color: 'white',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  },
}