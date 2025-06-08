const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

const SALT = process.env.PASSWORD_SALT || 'somesalt';
const user = {
  username: 'admin',
  // store hashed password using PBKDF2
  passwordHash: crypto
    .pbkdf2Sync('password', SALT, 1000, 32, 'sha512')
    .toString('hex'),
};

app.post('/api/login', (req, res) => {
  const { username, passwordHash } = req.body;
  if (
    username === user.username &&
    passwordHash === user.passwordHash
  ) {
    return res.json({ user: { username } });
  }
  res.status(401).json({ message: 'Invalid credentials' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
