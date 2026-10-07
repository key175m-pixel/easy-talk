import { useState } from 'react';
// eliminate the check after CSS is done
function Chat( { user }) {
    const [channels, setChannels] = useState([
    {id: 1, name: 'channel 1' },
    {id: 2, name: 'channel 2' }
]);
        const [servers, setServers] = useState([
    {id: 1, name: 'server 1' },
    {id: 2, name: 'server 2' }
]);
const [nameServer, setNameServer] = useState(''); 
const [nameChannel, setNameChannel] = useState(''); 
        const [serverPick, setServerPick] = useState(1);
        const [channelPick, setChannelPick] = useState(1);
        const found = channels.find(channel => channel.id === channelPick);
        function handleAddServer(e) {
    e.preventDefault();
    const newServer = {id: Date.now(), name: nameServer}; 
    setServers([...servers, newServer]);
    setNameServer('');
}
        function handleAddChannel(e) {
    e.preventDefault();
    const newChannel = {id: Date.now(), name: nameChannel}; 
    setChannels([...channels, newChannel]);
    setNameChannel('');
}
    return (
        <div>
            <h3>Welcome, {user}</h3>
            <h1>List of servers</h1>
            <form onSubmit={handleAddServer}> 
                <input type="text" value={nameServer} onChange={(e) => setNameServer(e.target.value)} placeholder="New server name" />
                <button type="submit">Add Server</button>
            </form>
            <form onSubmit={handleAddChannel}> 
                <input type="text" value={nameChannel} onChange={(e) => setNameChannel(e.target.value)} placeholder="New channel name" />
                <button type="submit">Add Channel</button>
            </form>
            <ul>
                {servers.map((server) => (<li key={server.id}><button onClick={() => setServerPick(server.id)}> {server.name} {server.id === serverPick && '✓'}</button></li>))} 
            </ul>
            <h2>List of channels</h2>
            <ul>
                {channels.map((channel) => (<li key={channel.id}><button onClick={() => setChannelPick(channel.id)}> {channel.name} {channel.id === channelPick && '✓'}</button></li>))}
            </ul>
            <p>Selected channel: {found?.name} </p>
        </div>
    )
}
export default Chat;