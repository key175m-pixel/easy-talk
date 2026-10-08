import { useState, useEffect } from 'react';
import './Profile.css';
import ProfileBackdrop from './ProfileBackdrop';

const TAKEN = ['admin', 'myttup', 'key', 'root', 'support']; // fake "already registered" names

// TODO(supabase): replace with a real query, e.g. a profiles row with that username
function checkUsername(name) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(TAKEN.includes(name.toLowerCase()) ? 'taken' : 'available'), 700);
  });
}

function Profile({ onSetup }) {
  const [username, setUsername] = useState('');
  const [checked, setChecked] = useState({ name: '', result: '' }); // last answer from checkUsername
  const [shaking, setShaking] = useState(false);

  const clean = username.trim();
  const valid = /^[a-zA-Z0-9_.]{3,20}$/.test(clean);

  // idle | short | invalid | checking | available | taken  (derived, so there is no state to keep in sync)
  let status = 'idle';
  if (clean) {
    if (!/^[a-zA-Z0-9_.]*$/.test(clean) || clean.length > 20) status = 'invalid';
    else if (clean.length < 3) status = 'short';
    else status = checked.name === clean ? checked.result : 'checking';
  }

  // Wait until the user stops typing, then ask whether the name is free
  useEffect(() => {
    if (!valid) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      const result = await checkUsername(clean);
      if (!cancelled) setChecked({ name: clean, result });
    }, 450);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [clean, valid]);

  function handleSubmit(e) {
    e.preventDefault();
    if (status !== 'available') {
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
      return;
    }
    onSetup(clean);
  }

  const hints = {
    idle: '3 to 20 characters: letters, numbers, _ and .',
    short: 'Keep going, at least 3 characters',
    invalid: 'Only letters, numbers, _ and . (max 20)',
    checking: 'Checking if it’s free…',
    available: `@${clean} is available`,
    taken: `@${clean} is already taken`,
  };

  return (
    <main className="profile">
      <ProfileBackdrop />
      {/* TODO(key): make this go back to the login screen (a new prop like onBack, called on click) */}
      <button type="button" className="logo-link" aria-label="Back to login"><img src="/logo-mark.png" alt="Myttup" /></button>
      <div className="center">
        <form className="pcard" onSubmit={handleSubmit} noValidate>
          <img className="pmark" src="/logo-mark.png" alt="Myttup" />
          <h1>Set up your profile</h1>
          <p className="psub">Pick how people will see you.</p>

          <div className="avatar-slot">
            {/* TODO(key): wire this up: pick a photo or search a GIF API, then show it inside the circle */}
            <button type="button" className="avatar" aria-label="Add a photo or GIF">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
            </button>
            <span>Add a photo or GIF</span>
          </div>

          <label className="plabel">Username
            <span className="field">
              <input
                className={shaking ? 'shake' : ''} value={username} autoComplete="off" spellCheck="false"
                placeholder="how people will see you" onChange={(e) => setUsername(e.target.value)}
              />
              <span key={status} className="status" data-state={status} aria-hidden="true">
                <i className="spin" />
                <svg viewBox="0 0 24 24" className="icon ok"><circle cx="12" cy="12" r="10" /><path d="M7.5 12.5l3 3 6-6.5" /></svg>
                <svg viewBox="0 0 24 24" className="icon no"><circle cx="12" cy="12" r="10" /><path d="M8.5 8.5l7 7M15.5 8.5l-7 7" /></svg>
              </span>
            </span>
          </label>
          <p className="hint" data-state={status} role="status">{hints[status]}</p>

          <button className="pbtn" type="submit" disabled={status !== 'available'}>Create profile</button>
        </form>

        <footer className="partners">
          <span>our partners</span>
          <span>we don&rsquo;t have partners, lol</span>
        </footer>
      </div>
    </main>
  );
}

export default Profile;
