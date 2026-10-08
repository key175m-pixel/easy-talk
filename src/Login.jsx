import { useState } from 'react';
import './Login.css';
import LoginStage from './LoginStage';

const COPY = {
  login: {
    title: 'Welcome back', sub: 'Sign in to pick up your conversations.', primary: 'Log in',
    apple: 'Log in with Apple', google: 'Log in with Google', switchText: 'New to Myttup?', switchBtn: 'Create an account',
  },
  signup: {
    title: 'Join Myttup', sub: 'Pick a username and start talking.', primary: 'Create account',
    apple: 'Sign up with Apple', google: 'Sign up with Google', switchText: 'Already have an account?', switchBtn: 'Log in',
  },
};

function Login({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'busy' | 'done'
  const [social, setSocial] = useState(null);   // 'apple' | 'google' while "connecting"
  const [shaking, setShaking] = useState([]);   // names of the fields that are shaking
  const [settled, setSettled] = useState(false); // username field finished opening (lets the focus ring show)
  const [mood, setMood] = useState('');
  const [pulseKey, setPulseKey] = useState(0);

  const t = COPY[mode];
  const signup = mode === 'signup';

  function shake(names) {
    setShaking(names);
    setTimeout(() => setShaking([]), 400);
  }

  function toggleMode() {
    const next = signup ? 'login' : 'signup';
    setMode(next);
    setError('');
    setSettled(false);
    if (next === 'signup') setTimeout(() => setSettled(true), 340);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const missing = [];
    if (signup && !username.trim()) missing.push('username');
    if (!email.trim()) missing.push('email');
    if (!password) missing.push('password');
    if (missing.length) {
      setError(missing[0] === 'username' ? 'Pick a username' : missing[0] === 'email' ? 'Type your email' : 'Type your password');
      shake(missing);
      return;
    }
    setError('');
    setStatus('busy');
    // TODO(supabase): replace this fake wait with the real signIn / signUp call
    setTimeout(() => {
      setStatus('done');
      setMood('happy');
      setPulseKey((k) => k + 1);
      setTimeout(() => setMood(''), 1500);
      setTimeout(() => onLogin(), 900);
    }, 1100);
  }

  function handleSocial(provider) {
    if (social) return;
    setSocial(provider);
    // TODO(supabase): signInWithOAuth({ provider })
    setTimeout(() => setSocial(null), 1300);
  }

  const fieldClass = (name) => (shaking.includes(name) ? 'shake' : '');
  const focusMood = (m) => ({ onFocus: () => setMood(m), onBlur: () => setMood((cur) => (cur === m ? '' : cur)) });
  const socialLabel = (provider) => (social === provider ? 'Connecting…' : t[provider]);

  return (
    <main className="login">
      <LoginStage mood={mood} pulseKey={pulseKey} />

      <section className="panel">
        <div className="card">
          <div className="brand"><img src="/logo-tile.png" alt="" width="30" height="30" />Myttup</div>
          <div>
            <h1 key={t.title} className="swap">{t.title}</h1>
            <p key={t.sub} className="sub swap">{t.sub}</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className={'extra' + (signup ? ' open' : '') + (settled ? ' settled' : '')} inert={!signup}>
              <label>Username
                <input
                  className={fieldClass('username')} value={username} autoComplete="username"
                  placeholder="How people will see you" onChange={(e) => setUsername(e.target.value)} {...focusMood('look')}
                />
              </label>
            </div>
            <label>Email
              <input
                className={fieldClass('email')} type="email" value={email} autoComplete="email"
                placeholder="you@example.com" onChange={(e) => setEmail(e.target.value)} {...focusMood('look')}
              />
            </label>
            <label>Password
              <input
                className={fieldClass('password')} type="password" value={password}
                autoComplete={signup ? 'new-password' : 'current-password'}
                placeholder="Your password" onChange={(e) => setPassword(e.target.value)} {...focusMood('shy')}
              />
            </label>
            {error && <p className="error" role="alert">{error}</p>}
            <button className={'primary ' + (status === 'idle' ? '' : status)} type="submit" disabled={status !== 'idle'}>
              <span key={t.primary} className="lbl swap">{t.primary}</span>
              <span className="fx">
                <i className="spin" />
                <svg className="tick" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
              </span>
            </button>
          </form>

          <div className="or">or</div>
          <div className="social">
            <button className={'apple' + (social === 'apple' ? ' busy' : '')} type="button" disabled={!!social} onClick={() => handleSocial('apple')}>
              <span className="ico">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.955 4.45z" /></svg>
              </span>
              <i className="spin" />
              <span key={socialLabel('apple')} className="lbl swap">{socialLabel('apple')}</span>
            </button>
            <button className={'google' + (social === 'google' ? ' busy' : '')} type="button" disabled={!!social} onClick={() => handleSocial('google')}>
              <span className="ico">
                <svg viewBox="0 0 18 18" aria-hidden="true">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" />
                  <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
                </svg>
              </span>
              <i className="spin" />
              <span key={socialLabel('google')} className="lbl swap">{socialLabel('google')}</span>
            </button>
          </div>

          <p className="switch">
            <span key={t.switchText} className="swap">{t.switchText}</span>{' '}
            <button className="link swap" key={t.switchBtn} type="button" onClick={toggleMode}>{t.switchBtn}</button>
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;
