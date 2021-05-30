import { EventFormatter } from '../util';
import { Channel } from './channel';
let axios = require('axios')
/**
 * This class represents a Socket.io channel.
 */
export class MultimirrorChannel extends Channel {
    /**
     * The Socket.io client instance.
     */
    socket: any;


    isSubscribed : boolean = false;

    /**
     * The name of the channel.
     */
    name: any;

    /**
     * Channel options.
     */
    options: any;

    /**
     * The event formatter.
     */
    eventFormatter: EventFormatter;

    /**
     * The event callbacks applied to the socket.
     */
    events: any = {};

    /**
     * User supplied callbacks for events on this channel.
     */
    private listeners: any = {};

    /**
     * Create a new class instance.
     */
    constructor(socket: any, name: string, options: any) {
        super();

        this.name = name;
        this.socket = socket;
        this.options = options;
        this.eventFormatter = new EventFormatter(this.options.namespace);
    }

    /**
     * Subscribe to a Socket.io channel.
     */
    subscribe(): void {
        if(this.isSubscribed)
            return ;
        this.isSubscribed = true;
        if (!this.isGuardedChannel(this.name)) {
            this.socket.emit('subscribe', {
                app_key: this.options.app_key,
                channel: this.name,
                auth: {}
            });
        } else {
            axios.post('/broadcasting/auth', {
                channel_name: this.name,
                socket_id: this.socket.id
            }).then((res: any) => {

                if (res.status === 200) {

                    this.socket.emit('subscribe', {
                        app_key: this.options.app_key,
                        channel: this.name,
                        auth: {
                            socket_id: this.socket.id,
                            extra: res.data
                        },
                    });
                }
            });
        }
    }

    isGuardedChannel(channel: string): boolean {
        return channel.indexOf("private-") != -1;
    }
    disconnect(): void {
        this.isSubscribed = false;
    }

    /**
     * Unsubscribe from channel and ubind event callbacks.
     */
    unsubscribe(): void {
        this.unbind();
        this.isSubscribed = false;

        this.socket.emit('unsubscribe', {
            channel: this.name,
            auth: this.options.auth || {},
        });
    }

    /**
     * Listen for an event on the channel instance.
     */
    listen(event: string, callback: Function): MultimirrorChannel {
        this.on(this.eventFormatter.format(event), callback);

        return this;
    }

    /**
     * Stop listening for an event on the channel instance.
     */
    stopListening(event: string, callback?: Function): MultimirrorChannel {
        this.unbindEvent(this.eventFormatter.format(event), callback);

        return this;
    }

    /**
     * Register a callback to be called anytime a subscription succeeds.
     */
    subscribed(callback: Function): MultimirrorChannel {
        this.on('connect', (socket: any) => {
            callback(socket);
        });

        return this;
    }

    /**
     * Register a callback to be called anytime an error occurs.
     */
    error(callback: Function): MultimirrorChannel {
        return this;
    }

    /**
     * Bind the channel's socket to an event and store the callback.
     */
    on(event: string, callback: Function): MultimirrorChannel {
        this.listeners[event] = this.listeners[event] || [];

        if (!this.events[event]) {
            this.events[event] = (channel: any, data: any) => {
                if (this.name === channel && this.listeners[event]) {
                    this.listeners[event].forEach((cb: any) => cb(data));
                }
            };

            this.socket.on(event, this.events[event]);
        }

        this.listeners[event].push(callback);

        return this;
    }

    /**
     * Unbind the channel's socket from all stored event callbacks.
     */
    unbind(): void {
        Object.keys(this.events).forEach((event) => {
            this.unbindEvent(event);
        });
    }

    /**
     * Unbind the listeners for the given event.
     */
    protected unbindEvent(event: string, callback?: Function): void {
        this.listeners[event] = this.listeners[event] || [];

        if (callback) {
            this.listeners[event] = this.listeners[event].filter((cb: any) => cb !== callback);
        }

        if (!callback || this.listeners[event].length === 0) {
            if (this.events[event]) {
                this.socket.removeListener(event, this.events[event]);

                delete this.events[event];
            }

            delete this.listeners[event];
        }
    }
}
