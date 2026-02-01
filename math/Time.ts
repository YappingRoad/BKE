export default class Time {
    /** 
    Returns the current time in seconds.
    Note that this is not the real world time, rather the timestep that is used for calculating animations.
    */
    public static get(): number {
        return document.timeline.currentTime as number / 1000;
    }

    /** 
    Returns the current time in milliseconds.
    Note that this is not the real world time, rather the timestep that is used for calculating animations.
    */
    public static getMS(): number {
        return document.timeline.currentTime as number;
    }
}