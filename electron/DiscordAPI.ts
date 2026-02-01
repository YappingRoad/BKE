export default class DiscordAPI {
    public static isAvailable(): boolean {
        return "electronAPI" in window;
    }

    public static setActivity(activity:SetActivity) {
        (window as any).electronAPI.discord_setActivity(JSON.stringify(activity));
    }
}


export type SetActivity = {
    name?: string;
    type?: ActivityType;
    url?: string;
    state?: string;
    stateUrl?: string;
    details?: string;
    detailsUrl?: string;
    startTimestamp?: number | Date;
    endTimestamp?: number | Date;
    largeImageKey?: string;
    largeImageUrl?: string;
    smallImageKey?: string;
    smallImageUrl?: string;
    largeImageText?: string;
    smallImageText?: string;
    partyId?: string;
    partySize?: number;
    partyMax?: number;
    matchSecret?: string;
    joinSecret?: string;
    spectateSecret?: string;
    instance?: boolean;
    applicationId?: string;
    flags?: number;
    emoji?: {
        name: string;
        id?: string;
        animated?: boolean;
    };
};
/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#activity-object-activity-types}
 */
export declare enum ActivityType {
    /**
     * Playing \{game\}
     */
    Playing = 0,
    /**
     * Streaming \{details\}
     */
    Streaming = 1,
    /**
     * Listening to \{name\}
     */
    Listening = 2,
    /**
     * Watching \{details\}
     */
    Watching = 3,
    /**
     * \{emoji\} \{state\}
     */
    Custom = 4,
    /**
     * Competing in \{name\}
     */
    Competing = 5
}