import React, { useState } from 'react';
import '../../styles/login-page.css';
import { getGlobalApp } from '../../global';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    console.log(`Client ${username} logged in with password ${password}`);

    const body = { username, password };

    const response = await fetch(getGlobalApp().serverUrl + '/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    console.log(response);
  };
  return (
    <div className="center-container">
      <div className="login-container">
        <h2>Login</h2>
        <div className="form-group">
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="login-button" onClick={() => handleLogin()}>
          Login
        </button>
      </div>
    </div>
  );
}
