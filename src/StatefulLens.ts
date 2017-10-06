import { Lens } from "./Lens";

export class StatefulLens<Value> extends Lens<Value> {

    constructor(
        protected value: Value,
        protected initialState: any,
        protected onChange?: () => void,
    ) {
        super(() => this);

        if (this.initialState) {
            this.state = new StatefulLens(this.initialState, undefined, onChange);
        }
    }

    public get(): Value {
        return this.value;
    }

    public set(value: Value): void {
        Object.assign(this.value, value);

        if (this.onChange) {
            this.onChange();
        }
    }

}
