import { action } from "@storybook/addon-actions";
import * as React from "react";
import { ArrayLensProperty, Lens, LensFlow } from "../";
import { validate } from "./validation";

export interface Person {
    age: number;
    name: string;
    code: string;
}

export interface Structure {
    persons: Person[];
}

function Input<T>({ lens, type = "text" }: { lens: Lens<T>, type?: string }) {
    return (
        <input type={type} value={lens.get() as any} onChange={(e: any) => lens.set(e.target.value)} />
    );
}

class Form extends React.Component<{ lens: ArrayLensProperty<Person, any> }> {

    private submit = (action as any)("submit", () => this.props.lens.get());
    private addNew = () => this.props.lens.insert({ age: Math.random(), name: "", code: "" });

    private renderList() {
        return this.props.lens.map((l, i) => (
            <div key={i}>
                <button onClick={() => this.props.lens.remove(l)}>Remove</button>{" "}
                {JSON.stringify(l.getValidationState())}
                <br />
                Name: <Input lens={l.prop((p) => p.name)} /> <br />
                Age: <Input lens={l.prop((p) => p.age)} type="number" /> <br />
                Code: <Input lens={l.prop((p) => p.code)} />
                <br />
                <br />
            </div>
        ));
    }

    public render() {
        return (
            <div>
                <button onClick={this.addNew}>Add</button>
                <button onClick={this.submit} disabled={this.props.lens.isInvalid()}>
                    Submit
                </button>
                <br />
                <br />
                {this.renderList()}
            </div>
        );
    }
}

export class App extends React.Component<{}, Structure> {

    public state = {
        persons: [{ age: 1, name: "one", code: "abc" }, { age: 2, name: "two", code: "abcd" }],
    };

    public getMeta = () => ({
        props: {
            persons: {
                all: {
                    props: {
                        name: { isRequired: true },
                        code: {
                            customValidators: [(code: any) => code.indexOf("abc") !== 0 && "Code must start from abc"],
                        },
                    },
                },
            },
        },
    })

    private lens = new LensFlow(
        () => this.state,
        (data) => this.setState(data),
        this.getMeta,
        (meta, value) => validate(value, meta)
    );

    public render() {
        return (
            <div>
                <Form lens={this.lens.array((p) => p.persons)} />
                <pre>{JSON.stringify(this.lens.get())}</pre>
            </div>
        );
    }
}
