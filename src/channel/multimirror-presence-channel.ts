import { PresenceChannel } from './presence-channel';
import { MultimirrorPrivateChannel } from './multimirror-private-channel';

/**
 * This class represents a Socket.io presence channel.
 */
export class MultimirrorPresenceChannel extends MultimirrorPrivateChannel implements PresenceChannel {
    /**
     * Register a callback to be called anytime the member list changes.
     */
    here(callback: Function): MultimirrorPresenceChannel {
        this.on('presence:subscribed', (members: any[]) => {
            callback(members.map((m) => m.user_info));
        });

        return this;
    }

    /**
     * Listen for someone joining the channel.
     */
    joining(callback: Function): MultimirrorPresenceChannel {
        this.on('presence:joining', (member: any) => callback(member.user_info));

        return this;
    }

    /**
     * Listen for someone leaving the channel.
     */
    leaving(callback: Function): MultimirrorPresenceChannel {
        this.on('presence:leaving', (member: any) => callback(member.user_info));

        return this;
    }
}
