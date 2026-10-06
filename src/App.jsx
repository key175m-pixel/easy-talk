import './App.css'
import Login from './Login';
import { useState } from 'react';

function App() {
  const [screen, setScreen] = useState('login');
  return (
   <div>
   {screen ===  'login' ? <Login onLogin={() => setScreen('profile')} /> : <h1>Profile</h1>}

   </div>
  );
}

export default App;