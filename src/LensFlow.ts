import { Lens } from "./Lens";
import * as types from "./types";

export class LensFlow<Value, State = any> extends Lens<Value> {
    constructor(
        private getter: () => Value,
        private setter: (newValue: Value) => void,
        private metadataGetter?: (value: Value, state: State) => types.Metadata<Value>,
        private validationStateGetter?: (
            meta: types.Metadata<Value>,
            value: Value,
            state: State,
        ) => types.ValidationState,
        private getState?: () => State,
        private setState?: (newState: State) => void,
        protected updateInstanceOnSet?: (nextLens: LensFlow<Value, State>) => void,
    ) {
        super(() => this);

        if (this.getState && this.setState) {
            this.state = new LensFlow(this.getState, this.setState);
        }
    }

    public get() {
        return this.getter();
    }

    public set(newValue: Value) {
        if (this.updateInstanceOnSet) {
            this.updateInstanceOnSet(
                new LensFlow(
                    this.getter,
                    this.setter,
                    this.metadataGetter,
                    this.validationStateGetter,
                    this.getState,
                    this.setState,
                    this.updateInstanceOnSet,
                ),
            );
        }

        this.setter(newValue);
    }

    public getMetadata() {
        return this.metadataGetter ? this.metadataGetter(this.get(), this.state && this.state.get()) : {};
    }

    public getValidationState() {
        return this.validationStateGetter
            ? this.validationStateGetter(this.getMetadata(), this.get(), this.state && this.state.get())
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
            updater,
        );
    }
}
