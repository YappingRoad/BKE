import Callback from "../Callback";

export default class DeltaTracker {
    value: number | null = null;
    onChange: Callback<number> = new Callback()
    diffOf(value: number): number {
        if (this.value == null) {
            this.value = value;
            return 0;
        }
        const difference = (value - this.value);
        if (difference !== 0) {
            this.onChange.dispatch(value);
        }
        this.value = value;
        return difference;
    }


    clearValue() {
        this.value = null;
    }
}