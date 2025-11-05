import logo from './logo.svg';
import React, { useState } from "react";
import './App.css';

import { SignatureV4 } from "@aws-sdk/signature-v4";
import { HttpRequest } from "@aws-sdk/protocol-http";
import { Sha256 } from "@aws-crypto/sha256-browser";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";


function App() {

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [inputText, setInputText] = useState("こんにちわんこそば"); // 入力テキスト
  const [response, setResponse] = useState("");   // APIの返答

  const handleClick = async () => {
    setLoading(true);
    setError(null);

  const region = "ap-northeast-1";
  const service = "execute-api";
  const endpoint = "https://gsdfghasdfgasdy3.execute-api.ap-northeast-1.amazonaws.com/test/";

  // Cognito認証情報を取得
  const credentials = await fromCognitoIdentityPool({
    identityPoolId: "ap-northeast-1:c30e76b3-c92a-43d3-9096-11c090b1ffc6",
    clientConfig: { region },
  })();

  // HTTPリクエストを作成
  const request = new HttpRequest({
    method: "POST",
    headers: { "Content-Type": "application/json" },
    hostname: new URL(endpoint).hostname,
    path: new URL(endpoint).pathname,
    body: JSON.stringify({ question: inputText }),
  });

  // SigV4署名を付与
  const signer = new SignatureV4({
    credentials,
    region,
    service,
    sha256: Sha256,
  });

  const signedRequest = await signer.sign(request);

  try {
    const res = await fetch(endpoint, {
      method: signedRequest.method,
      headers: signedRequest.headers,
      body: signedRequest.body,
    });


    if (!res.ok) {
      throw new Error("API request failed");
    }

    const result = await res.json();
    setData(result); // 全体のJSONを表示
    setResponse(result.answer); // answerだけ表示

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">

        <img src={logo} className="App-logo" alt="logo" />

        <h1>質問を送信する</h1>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="質問を入力してください"
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <button onClick={handleClick}>APIを実行</button>

        {loading && <p>読み込み中...</p>}
        {error && <p style={{ color: "red" }}>エラー: {error}</p>}
        {data && (
          <div>
            <h2>結果:</h2>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
        {response && <p>APIの返答: {response}</p>}

      </header>
    </div>
  );
}


export default App;

