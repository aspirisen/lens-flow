import { Lens } from "./Lens";

export class StatefulLens<Value> extends Lens<Value> {
    constructor(
        protected value: Value,
        protected initialState: any,
        protected onChange?: () => void,
        protected updateInstanceOnSet?: (nextLens: StatefulLens<Value>) => void,
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

        if (this.updateInstanceOnSet) {
            this.updateInstanceOnSet(
                new StatefulLens(this.value, this.initialState, this.onChange, this.updateInstanceOnSet),
            );
        }

        if (this.onChange) {
            this.onChange();
        }
    }

    public immutable(updater: (nextLens: StatefulLens<Value>) => void) {
        return new StatefulLens(this.value, this.initialState, this.onChange, updater);
    }
}
