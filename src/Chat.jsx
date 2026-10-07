
const servers = [
    {id: 1, name: 'server 1' },
    {id: 2, name: 'server 2' }
]
const channels = [
    {id: 1, name: 'channel 1' },
    {id: 2, name: 'channel 2' }
]
function Chat( { user }) {
    return (
        <div>
            <h3>Welcome, {user}</h3>
            <h1>List of servers</h1>
            <ul>
                {servers.map((server) => (<li key={server.id}>{server.name}</li>))}
            </ul>
            <h2>List of channels</h2>
            <ul>
                {channels.map((channel) => (<li key={channel.id}>{channel.name}</li>))}
            </ul>
        </div>
    )
}

export default Chat;