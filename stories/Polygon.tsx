import * as React from "react";
import { StatefulLens } from "../";

export class Polygon extends React.Component {

    public state = {} as any;
    private lens = new StatefulLens(this.state, {}, () => this.forceUpdate());

    private runTest() {
        const lens = this.lens.item("foo");
        const sampleLens = lens.item("a");
        const sampleLens2 = lens.item("b");
        const sampleLens3 = sampleLens2.item("c");
        const sampleLens4 = sampleLens2.item("d");
        sampleLens.set("bar");
        sampleLens3.set("baz");
        sampleLens4.set("foo");
    }

    private runTest2() {
        const lens = this.lens.item("bar");
        const sampleLens = lens.array("testArray");
        const test1 = sampleLens.item(0);
        const test2 = sampleLens.item(1);
        test1.set("foo");
        test2.set("bar");
        test1.set("baz");
    }

    private runTest3() {
        const sampleLens = this.lens.item("baz").array("array");
        const test1 = sampleLens.item(0);
        const test2 = sampleLens.item(1);
        test1.item("a").set("foo");
        test1.item("b").set("bar");
        test2.item("a").set("bar");
        test1.item("b").set("baz");
    }

    private runTest4() {
        const sampleLens = this.lens
            .item("foo")
            .item("t")
            .transform(
            (v) => v,
            (v: any, prev) => {
                if (v.a && prev && v.a !== prev.a) {
                    return {
                        ...v,
                        b: v.a,
                    };
                }

                return v;
            },
            );
        const test1 = sampleLens.prop("a");
        test1.set("repeatMe");
        test1.set("repeatMeTwice");
    }

    public render() {
        return (
            <div>
                <button onClick={() => this.runTest()}>Тест 1</button>
                <button onClick={() => this.runTest2()} style={{ marginLeft: 20 }}>
                    Тест 2
                </button>
                <button onClick={() => this.runTest3()} style={{ marginLeft: 20 }}>
                    Тест 3
                </button>
                <button onClick={() => this.runTest4()} style={{ marginLeft: 20 }}>
                    Тест 4
                </button>
                <pre>{JSON.stringify(this.lens.get(), null, "  ")}</pre>
            </div>
        );
    }
}
