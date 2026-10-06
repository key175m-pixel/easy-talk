import { useState } from 'react';
function Login({ onLogin } ) {
const [email, setEmail] = useState('');
const [error, setError] = useState('');
const [password, setPassword] = useState('');
function handleSubmit (e) {
e.preventDefault();
if(!email) {
setError('Type your email');
return;}
if(!password){
setError('Type your password');
return;}
setError('');
onLogin();
}
return (
 <form onSubmit={handleSubmit}> <input value={email} onChange={e => setEmail(e.target.value)} /> <input value={password} type="password" onChange={e => setPassword(e.target.value)} /> <button type="submit">Log in</button> {error && <p>{error}</p>} </form> ); } export default Login;