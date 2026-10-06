import { useState } from 'react';
function Profile({ onSetup }) {
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const cleanUsername = username.trim();
function handleSubmit(e) {
    e.preventDefault();
    if (cleanUsername.length < 3) {
        setError('Username must be at least 3 characters long');
        return;
    }
    setError('');
    onSetup(cleanUsername);
}
    return (
            <form onSubmit={handleSubmit}>
<input value={username} onChange={(e) => setUsername(e.target.value)} />
<button type="submit">Create profile</button>
    {error && <p>{error}</p>}
            </form>
    );
}

export default Profile;
