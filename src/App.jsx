import './App.css'
import Login from './Login';
import Profile from './Profile';
import Chat from './Chat';
import { useState } from 'react';
// ALL: change after finishing chat part state of screen and user
function App() {
  const [screen, setScreen] = useState('login');
  const [user, setUser] = useState('key');
  return (
   <div>
   {screen ===  'login' && <Login onLogin={() => setScreen('profile')} />} 
   {screen === 'profile' && <Profile onSetup={(name) => { setUser(name); setScreen('chat'); }} />}
   {screen === 'chat' && <Chat user={user} />}

   </div>
  );
}

export default App;