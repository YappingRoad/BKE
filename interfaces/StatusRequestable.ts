import { SetActivity } from "../electron/DiscordAPI";

export default interface StatusRequestable {
    getDiscord():SetActivity;
}