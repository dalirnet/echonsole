import _ from 'lodash'
import os from 'os'
import url from 'url'
import path from 'path'
import readline from 'readline'
import express from 'express'
import http from 'http'
import * as ws from 'socket.io'
import bowser from 'bowser'

const root = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '../')

const echonsole = () => {
    // init cli
    const cli = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })

    // init express
    const app = express()
    app.use(express.static(path.resolve(root, 'host')))
    app.use(express.static(path.resolve(root, 'dist')))

    // init http server
    const server = http.createServer(app)

    // init socket.io
    const io = new ws.Server(server, { serveClient: false })

    const detect = (userAgent) => {
        const parsed = bowser.parse(userAgent)

        return {
            os: _.toLower(parsed.os.name),
            browser: _.toLower(parsed.browser.name),
        }
    }

    const banner = (message) => {
        console.log('┌' + _.repeat('─', message.length + 2) + '┐')
        console.log('│ ' + message + ' │')
        console.log('└' + _.repeat('─', message.length + 2) + '┘')
    }

    // start
    io.on('connection', (socket) => {
        const { os, browser } = detect(socket.handshake.headers['user-agent'])
        banner(_.join(['Console', os, browser, '"' + socket.handshake.headers.referer + '"'], ' | '))
        socket.on('callback', ({ command, location, userAgent, output }) => {
            try {
                const { os, browser } = detect(userAgent)
                banner(_.join(['Callback', os, browser, '"' + location + '"'], ' | '))
                console.log(' $', command)
                console.log(' »', output, '\n')
            } catch (e) {}
        })
    })

    // start http server
    server.listen(3030, () => {
        const ip = _.get(
            _.find(_.flatten(_.values(os.networkInterfaces())), {
                family: 'IPv4',
                internal: false,
                netmask: '255.255.255.0',
            }),
            'address',
            '127.0.0.1'
        )

        banner('Attach "' + 'http://' + ip + ':3030/echonsole.js' + '"')
    })

    // watch user input
    cli.on('line', (input) => {
        if (_.startsWith(input, 'exit')) {
            process.exit(0)
        } else {
            console.clear()
            io.fetchSockets().then((sockets) => {
                _.each(sockets, (socket) => {
                    socket.emit('command', input)
                })
            })
        }
    })
}

export default echonsole
