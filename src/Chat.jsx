import { useState } from 'react';
import './Chat.css';

// "server 1" -> "s1", "My Cool Server" -> "MC"
function initials(name) {
  return name.split(/\s+/).filter(Boolean).map((w) => w[0]).join('').slice(0, 2);
}

function Chat( { user }) {
    const [channels, setChannels] = useState([
    {id: 1, name: 'channel 1', serverId: 1 },
    {id: 2, name: 'channel 2', serverId: 2 }
]);
        const [servers, setServers] = useState([
    {id: 1, name: 'server 1', },
    {id: 2, name: 'server 2', }
]);
const [nameServer, setNameServer] = useState(''); 
const [nameChannel, setNameChannel] = useState(''); 
        const [serverPick, setServerPick] = useState(1);
        const [channelPick, setChannelPick] = useState(1);
        const found = channels.find(channel => channel.id === channelPick);
        const channelsOfServer = channels.filter(channel => channel.serverId === serverPick);
        const [messages, setMessages] = useState([
{ id: 1, text: 'hi', author: 'Elena', channelId: 1 },
{id: 2, text:'wsp!', author:'Ronny', channelId: 1},
{id: 3, text:'hello!', author: 'kenneth', channelId: 2}
]);
  const messagesOfChannel = messages.filter(message => message.channelId === channelPick);
  const [newMessage, setNewMessage] = useState(''); 
  function handleAddMessage(e) {
    e.preventDefault();
    const cleanMessage = newMessage.trim();
    if (!cleanMessage || !channelPick) return;
    const newMsg = {id: Date.now(), text: cleanMessage, author: user, channelId: channelPick};
    setMessages([...messages, newMsg]);
    setNewMessage('');
  }
        function handleAddServer(e) {
        e.preventDefault();
    const cleanNameServer = nameServer.trim();
    if (!cleanNameServer) return;
    const newServer = {id: Date.now(), name: cleanNameServer}; 
    setServers([...servers, newServer]);
     setChannelPick(null)
    setServerPick(newServer.id);
    setNameServer('');
}
        function handleAddChannel(e) {
    e.preventDefault();
    const cleanNameChannel = nameChannel.trim();
    if (!cleanNameChannel) return;
    const newChannel = {id: Date.now(), name: cleanNameChannel, serverId: serverPick}; 
    setChannels([...channels, newChannel]);
    setChannelPick(newChannel.id);
    setNameChannel('');
}
function handlePickServer(id) {
  setServerPick(id);
  const firstChannel = channels.find(channel => channel.serverId === id);
  setChannelPick(firstChannel?.id);
}
    const serverName = servers.find((server) => server.id === serverPick)?.name;
    return (
        <div className="app">
            <aside className="servers" aria-label="Servers">
                <ul>
                    {servers.map((server) => (
                        <li key={server.id}>
                            <button
                                className={'server' + (server.id === serverPick ? ' selected' : '')}
                                title={server.name} aria-label={server.name}
                                onClick={() => handlePickServer(server.id)}
                            >{initials(server.name)}</button>
                        </li>
                    ))}
                </ul>
                <form className="server-form" onSubmit={handleAddServer}>
                    <input type="text" value={nameServer} onChange={(e) => setNameServer(e.target.value)} placeholder="New server name" aria-label="New server name" />
                    <button type="submit">Add Server</button>
                </form>
            </aside>

            <nav className="channels" aria-label="Channels">
                <h2 className="channels-title">{serverName}</h2>
                <ul>
                    {channelsOfServer.map((channel) => (
                        <li key={channel.id}>
                            <button
                                className={'channel' + (channel.id === channelPick ? ' active' : '')}
                                onClick={() => setChannelPick(channel.id)}
                            >{channel.name}</button>
                        </li>
                    ))}
                </ul>
                <form className="channel-form" onSubmit={handleAddChannel}>
                    <input type="text" value={nameChannel} onChange={(e) => setNameChannel(e.target.value)} placeholder="New channel" aria-label="New channel name" />
                    <button type="submit">Add Channel</button>
                </form>
                <div className="me"><i className="dot" aria-hidden="true" />{user}</div>
            </nav>

            <main className="chat">
                <header className="chat-header">
                    {found
                        ? <><h1 className="selected">{found.name}</h1><span className="where">in {serverName}</span></>
                        : <h1 className="muted">Pick a channel</h1>}
                </header>
                <ul className="messages">
                    {messagesOfChannel.map((message) => (
                        <li key={message.id} className={'message' + (message.author === user ? ' mine' : '')}>
                            <strong>{message.author}</strong>
                            <p>{message.text}</p>
                        </li>
                    ))}
                    {channelPick && messagesOfChannel.length === 0 && (
                        <li className="empty"><b>Quiet in here.</b><span>Send the first message below.</span></li>
                    )}
                </ul>
                <form className="composer" onSubmit={handleAddMessage}>
                    <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder={found ? `Message ${found.name}` : 'Say something'} />
                    <button type="submit" aria-label="Send message">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                    </button>
                </form>
            </main>
        </div>
    )
}
export default Chat;
