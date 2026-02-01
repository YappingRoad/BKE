// thank you https://github.com/HaxeFlixel/flixel/blob/master/flixel/tweens/FlxEase.hx
export default class Ease {
    private static PI2: number = Math.PI / 2;
    private static EL: number = 2 * Math.PI / .45;
    private static B1: number = 1 / 2.75;
    private static B2: number = 2 / 2.75;
    private static B3: number = 1.5 / 2.75;
    private static B4: number = 2.5 / 2.75;
    private static B5: number = 2.25 / 2.75;
    private static B6: number = 2.625 / 2.75;
    private static ELASTIC_AMPLITUDE: number = 1;
    private static ELASTIC_PERIOD: number = 0.4;

    public static linear(t: number): number {
        return t;
    }

    public static quadIn(t: number): number {
        return t * t;
    }

    public static quadOut(t: number): number {
        return -t * (t - 2);
    }

    public static quadInOut(t: number): number {
        return t <= .5 ? t * t * 2 : 1 - (--t) * t * 2;
    }

    public static cubeIn(t: number): number {
        return t * t * t;
    }

    public static cubeOut(t: number): number {
        return 1 + (--t) * t * t;
    }

    public static cubeInOut(t: number): number {
        return t <= .5 ? t * t * t * 4 : 1 + (--t) * t * t * 4;
    }

    public static quartIn(t: number): number {
        return t * t * t * t;
    }

    public static quartOut(t: number): number {
        return 1 - (t -= 1) * t * t * t;
    }

    public static quartInOut(t: number): number {
        return t <= .5 ? t * t * t * t * 8 : (1 - (t = t * 2 - 2) * t * t * t) / 2 + .5;
    }

    public static quintIn(t: number): number {
        return t * t * t * t * t;
    }

    public static quintOut(t: number): number {
        return (t = t - 1) * t * t * t * t + 1;
    }

    public static quintInOut(t: number): number {
        return ((t *= 2) < 1) ? (t * t * t * t * t) / 2 : ((t -= 2) * t * t * t * t + 2) / 2;
    }

    public static smoothStepIn(t: number): number {
        return 2 * Ease.smoothStepInOut(t / 2);
    }

    public static smoothStepOut(t: number): number {
        return 2 * Ease.smoothStepInOut(t / 2 + 0.5) - 1;
    }

    public static smoothStepInOut(t: number): number {
        return t * t * (t * -2 + 3);
    }

    public static smootherStepIn(t: number): number {
        return 2 * Ease.smootherStepInOut(t / 2);
    }

    public static smootherStepOut(t: number): number {
        return 2 * Ease.smootherStepInOut(t / 2 + 0.5) - 1;
    }

    public static smootherStepInOut(t: number): number {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    public static sineIn(t: number): number {
        return -Math.cos(Ease.PI2 * t) + 1;
    }

    public static sineOut(t: number): number {
        return Math.sin(Ease.PI2 * t);
    }

    public static sineInOut(t: number): number {
        return -Math.cos(Math.PI * t) / 2 + .5;
    }

    public static bounceIn(t: number): number {
        return 1 - Ease.bounceOut(1 - t);
    }

    public static bounceOut(t: number): number {
        if (t < Ease.B1)
            return 7.5625 * t * t;
        if (t < Ease.B2)
            return 7.5625 * (t - Ease.B3) * (t - Ease.B3) + .75;
        if (t < Ease.B4)
            return 7.5625 * (t - Ease.B5) * (t - Ease.B5) + .9375;
        return 7.5625 * (t - Ease.B6) * (t - Ease.B6) + .984375;
    }

    public static bounceInOut(t: number): number {
        return t < 0.5
            ? (1 - Ease.bounceOut(1 - 2 * t)) / 2
            : (1 + Ease.bounceOut(2 * t - 1)) / 2;
    }

    public static circIn(t: number): number {
        return -(Math.sqrt(1 - t * t) - 1);
    }

    public static circOut(t: number): number {
        return Math.sqrt(1 - (t - 1) * (t - 1));
    }

    public static circInOut(t: number): number {
        return t <= .5 ? (Math.sqrt(1 - t * t * 4) - 1) / -2 : (Math.sqrt(1 - (t * 2 - 2) * (t * 2 - 2)) + 1) / 2;
    }

    public static expoIn(t: number): number {
        return Math.pow(2, 10 * (t - 1));
    }

    public static expoOut(t: number): number {
        return -Math.pow(2, -10 * t) + 1;
    }

    public static expoInOut(t: number): number {
        return t < .5 ? Math.pow(2, 10 * (t * 2 - 1)) / 2 : (-Math.pow(2, -10 * (t * 2 - 1)) + 2) / 2;
    }

    public static backIn(t: number): number {
        return t * t * (2.70158 * t - 1.70158);
    }

    public static backOut(t: number): number {
        return 1 - (--t) * (t) * (-2.70158 * t - 1.70158);
    }

    public static backInOut(t: number): number {
        t *= 2;
        if (t < 1)
            return t * t * (2.70158 * t - 1.70158) / 2;
        t--;
        return (1 - (--t) * (t) * (-2.70158 * t - 1.70158)) / 2 + .5;
    }

    public static elasticIn(t: number): number {
        return -(Ease.ELASTIC_AMPLITUDE * Math.pow(2,
            10 * (t -= 1)) * Math.sin((t - (Ease.ELASTIC_PERIOD / (2 * Math.PI) * Math.asin(1 / Ease.ELASTIC_AMPLITUDE))) * (2 * Math.PI) / Ease.ELASTIC_PERIOD));
    }

    public static elasticOut(t: number): number {
        return (Ease.ELASTIC_AMPLITUDE * Math.pow(2,
            -10 * t) * Math.sin((t - (Ease.ELASTIC_PERIOD / (2 * Math.PI) * Math.asin(1 / Ease.ELASTIC_AMPLITUDE))) * (2 * Math.PI) / Ease.ELASTIC_PERIOD)
            + 1);
    }

    public static elasticInOut(t: number): number {
        if (t < 0.5) {
            return -0.5 * (Math.pow(2, 10 * (t -= 0.5)) * Math.sin((t - (Ease.ELASTIC_PERIOD / 4)) * (2 * Math.PI) / Ease.ELASTIC_PERIOD));
        }
        return Math.pow(2, -10 * (t -= 0.5)) * Math.sin((t - (Ease.ELASTIC_PERIOD / 4)) * (2 * Math.PI) / Ease.ELASTIC_PERIOD) * 0.5 + 1;
    }
}

export type EaseFunction = (t: number) => number;