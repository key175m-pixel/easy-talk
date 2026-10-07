import { useState } from 'react';
const servers = [
    {id: 1, name: 'server 1' },
    {id: 2, name: 'server 2' }
]
const channels = [
    {id: 1, name: 'channel 1' },
    {id: 2, name: 'channel 2' }
]
// eliminate the check after CSS is done
function Chat( { user }) {
        const [serverPick, setServerPick] = useState(1);
        const [channelPick, setChannelPick] = useState(1);
        const found = channels.find(channel => channel.id === channelPick);
    return (
        <div>
            <h3>Welcome, {user}</h3>
            <h1>List of servers</h1>
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