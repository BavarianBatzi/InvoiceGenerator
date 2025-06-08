import React, { useState } from 'react';
import InvoiceGenerator from './InvoiceGenerator';
import Login from './Login';

function App() {
  const [user, setUser] = useState(null);

  return (
    <div>
      {user ? (
        <InvoiceGenerator />
      ) : (
        <Login onLogin={setUser} />
      )}
    </div>
  );
}

export default App;
