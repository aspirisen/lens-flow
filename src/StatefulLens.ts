import { Lens } from "./Lens";

export class StatefulLens<Value, State = any> extends Lens<Value> {
    public state: Lens<Partial<State>>;

    constructor(
        protected value: Value,
        protected initialState: Partial<State>,
        protected onChange?: () => void,
        protected updateInstanceOnSet?: (nextLens: StatefulLens<Value>) => void,
    ) {
        super(() => this);

        if (this.initialState) {
            this.state = new StatefulLens(this.initialState, undefined, this.onSet);
        }
    }

    public get(): Value {
        return this.value;
    }

    public set(value: Value): void {
        Object.assign(this.value, value);
        this.onSet();
    }

    public immutable(updater: (nextLens: StatefulLens<Value>) => void) {
        return new StatefulLens(this.value, this.initialState, this.onChange, updater);
    }

    private onSet = () => {
        if (this.updateInstanceOnSet) {
            this.updateInstanceOnSet(
                new StatefulLens(this.value, this.initialState, this.onChange, this.updateInstanceOnSet),
            );
        }

        if (this.onChange) {
            this.onChange();
        }
    }
}
