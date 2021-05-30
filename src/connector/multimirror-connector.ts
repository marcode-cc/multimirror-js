import { Connector } from './connector';
import { MultimirrorChannel, MultimirrorPrivateChannel, MultimirrorPresenceChannel } from './../channel';

/**
 * This class creates a connnector to a Socket.io server.
 */
export class MultimirrorConnector extends Connector {
    /**
     * The Socket.io connection instance.
     */
    socket: any;

    /**
     * All of the subscribed channel names.
     */
    channels: { [name: string]: MultimirrorChannel } = {};

    socketConnected : boolean = false;

    /**
     * Create a fresh Socket.io connection.
     */
    connect(): void {
        let io = this.getSocketIO();
        this.socket = io(this.options.host, {query:"app_key="+this.options.app_key});
        
        this.socket.on('reconnect', () => {
            this.socketConnected = true;
            Object.values(this.channels).forEach((channel: any) => {
             
                channel.subscribe();
            });
        });

        this.socket.on('connect', () => {
            this.socketConnected = true;
            Object.values(this.channels).forEach((channel: any) => {
             
                channel.subscribe();
            });
        });

        this.socket.on('disconnect', () => {
            this.socketConnected = false;
            Object.values(this.channels).forEach((channel: any) => {
                channel.disconnect();
            });
        });

        return this.socket;
    }

    /**
     * Get socket.io module from global scope or options.
     */
    getSocketIO(): any {
        if (typeof this.options.client !== 'undefined') {
            return this.options.client;
        }

        if (typeof io !== 'undefined') {
            return io;
        }

        throw new Error('Socket.io client not found. Should be globally available or passed via options.client');
    }

    /**
     * Listen for an event on a channel instance.
     */
    listen(name: string, event: string, callback: Function): MultimirrorChannel {
        return this.channel(name).listen(event, callback);
    }

    /**
     * Get a channel instance by name.
     */
    channel(name: string): MultimirrorChannel {
      
        if (!this.channels[name]) {
            this.channels[name] = new MultimirrorChannel(this.socket, name, this.options);
        }

        let channel = this.channels[name];
        if(this.socketConnected && channel && !channel.isSubscribed)
        {
            channel.subscribe();
        }
        return channel;
    }

    /**
     * Get a private channel instance by name.
     */
    privateChannel(name: string): MultimirrorPrivateChannel {
        if (!this.channels['private-' + name]) {
            this.channels['private-' + name] = new MultimirrorPrivateChannel(this.socket, 'private-' + name, this.options);
        }

        return this.channels['private-' + name] as MultimirrorPrivateChannel;
    }

    /**
     * Get a presence channel instance by name.
     */
    presenceChannel(name: string): MultimirrorPresenceChannel {
        if (!this.channels['presence-' + name]) {
            this.channels['presence-' + name] = new MultimirrorPresenceChannel(
                this.socket,
                'presence-' + name,
                this.options
            );
        }

        return this.channels['presence-' + name] as MultimirrorPresenceChannel;
    }

    /**
     * Leave the given channel, as well as its private and presence variants.
     */
    leave(name: string): void {
        let channels = [name, 'private-' + name, 'presence-' + name];

        channels.forEach((name) => {
            this.leaveChannel(name);
        });
    }

    /**
     * Leave the given channel.
     */
    leaveChannel(name: string): void {
        if (this.channels[name]) {
            this.channels[name].unsubscribe();

            delete this.channels[name];
        }
    }

    /**
     * Get the socket ID for the connection.
     */
    socketId(): string {
        return this.socket.id;
    }

    /**
     * Disconnect Socketio connection.
     */
    disconnect(): void {
        this.socket.disconnect();
    }
}
