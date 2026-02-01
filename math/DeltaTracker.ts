export default class DeltaTracker {
    value: number | null = null;
    diffOf(value: number): number {
        if (this.value == null) {
            this.value = value;
            return 0;
        }
        const difference = (value - this.value);
        this.value = value;
        return difference;
    }


    clearValue() {
        this.value = null;
    }
}