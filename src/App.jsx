import './App.css'
import Login from './Login';
import Profile from './Profile';
import { useState } from 'react';

function App() {
  const [screen, setScreen] = useState('login');
  const [user, setUser] = useState('');
  return (
   <div>
   {screen ===  'login' && <Login onLogin={() => setScreen('profile')} />} 
   {screen === 'profile' && <Profile onSetup={(name) => { setUser(name); setScreen('chat'); }} />}
   {screen === 'chat' && <h1>Hello {user}</h1>}

   </div>
  );
}

export default App;