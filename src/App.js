import logo from './sopass.png';
import React, { useState } from "react";
import './App.css';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [inputText, setInputText] = useState("こんにちわんこそば");
  const [response, setResponse] = useState("");

  const handleClick = async () => {
    setLoading(true);
    setError(null);

    const endpoint = "https://g5c0tc5vy3.execute-api.ap-northeast-1.amazonaws.com/test/";
    const apikey = "AlP0oXHoy46V8LgHYoavg6rFJBge1VW35jAvbuV9";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apikey
        },
        body: JSON.stringify({ question: inputText })
      });

      if (!res.ok) {
        throw new Error(`API request failed: ${res.status}`);
      }

      const result = await res.json();
      setData(result);

      // Lambdaのレスポンスが { body: '{"answer":"..."}' } の場合
      if (result.body) {
        const parsedBody = JSON.parse(result.body);
        setResponse(parsedBody.answer);
      }

    } catch (err) {
      console.error("Fetch API failed:", err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} alt="logo" style={{ width: '200px', height: 'auto' }} />
        <p>AWS Bedrockに聞きたい内容を入力してください。</p>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="質問を入力してください"
          style={{ marginRight: "20px", padding: "10px" }}
        />
        <button onClick={handleClick} className="api-button">APIを実行</button>

        {loading && <p>読み込み中...</p>}
        {error && <p style={{ color: "red" }}>エラー: {error}</p>}
        {data && (
          <div>
            <h2>結果:</h2>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
      {response && (
        <p className="api-response">{response}</p>
      )}
      </header>
    </div>
  );
}

export default App;