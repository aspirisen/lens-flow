import { Lens } from "./Lens";
import * as types from "./types";

export class LensFlow<Value, State = any> extends Lens<Value> {
    public state: Lens<State>;

    constructor(
        private getter: () => Value,
        private setter: (newValue: Value) => void,
        private metadataGetter?: (value: Value, state: State) => types.Metadata<Value>,
        private validationStateGetter?: (
            meta: types.Metadata<Value>,
            value: Value,
            state: State
        ) => types.ValidationState,
        private getState?: () => State,
        private setState?: (newState: State) => void,
        protected updateInstanceOnSet?: (nextLens: LensFlow<Value, State>) => void
    ) {
        super(() => this);

        if (this.getState && this.setState) {
            this.state = new LensFlow(this.getState, this.stateSetter);
        }
    }

    public get() {
        return this.getter();
    }

    public set(newValue: Value) {
        this.updateInstance();
        this.setter(newValue);
    }

    public getMetadata() {
        return this.metadataGetter ? this.metadataGetter(this.get(), this.state && this.state.get() as any) : {};
    }

    public getValidationState() {
        return this.validationStateGetter
            ? this.validationStateGetter(this.getMetadata(), this.get(), this.state && this.state.get() as any)
            : { isValid: true };
    }

    public immutable(updater: (nextLens: LensFlow<Value, State>) => void) {
        return new LensFlow(
            this.getter,
            this.setter,
            this.metadataGetter,
            this.validationStateGetter,
            this.getState,
            this.setState,
            updater
        );
    }

    private stateSetter = (newState: State) => {
        this.updateInstance();

        if (this.setState) {
            this.setState(newState);
        }
    }

    private updateInstance() {
        if (this.updateInstanceOnSet) {
            this.updateInstanceOnSet(
                new LensFlow(
                    this.getter,
                    this.setter,
                    this.metadataGetter,
                    this.validationStateGetter,
                    this.getState,
                    this.setState,
                    this.updateInstanceOnSet
                )
            );
        }
    }
}
