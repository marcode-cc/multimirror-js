import { MultimirrorChannel } from './multimirror-channel';

/**
 * This class represents a Socket.io private channel.
 */
export class MultimirrorPrivateChannel extends MultimirrorChannel {
    /**
     * Trigger client event on the channel.
     */
    whisper(eventName: string, data: any): MultimirrorChannel {
        this.socket.emit('client event', {
            channel: this.name,
            event: `client-${eventName}`,
            data: data,
        });

        return this;
    }
}
