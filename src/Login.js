import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import CryptoJS from 'crypto-js';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const salt = 'somesalt';
      const passwordHash = CryptoJS.PBKDF2(password, salt, {
        keySize: 256 / 32,
        iterations: 1000,
      }).toString(CryptoJS.enc.Hex);
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, passwordHash })
      });
      if (res.ok) {
        const data = await res.json();
        onLogin(data.user);
      } else {
        const err = await res.json();
        setError(err.message || 'Login fehlgeschlagen');
      }
    } catch (err) {
      setError('Login fehlgeschlagen');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: 300, m: 'auto', mt: 8 }}>
      <Typography variant="h5" align="center">Login</Typography>
      <TextField label="Benutzername" value={username} onChange={(e) => setUsername(e.target.value)} />
      <TextField label="Passwort" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <Typography color="error">{error}</Typography>}
      <Button variant="contained" type="submit">Login</Button>
    </Box>
  );
}

export default Login;
