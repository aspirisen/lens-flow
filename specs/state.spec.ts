import { expect } from "chai";
import { StatefulLens } from "../src/index";
import { getLens } from "./mock";

describe("state", () => {

    it("Should have state in lens ", () => {
        const lens = getLens();
        expect(lens.state)
            .to.exist;
    });

    it("Should have state in TransformLens ", () => {
        const lens = getLens().transform(v => v, v => v);

        expect(lens.state)
            .to.exist;

        const prop = getLens().transform(v => v, v => v).prop('name');

        expect(prop.state)
            .to.exist;

    });

    it("Should change state in lens and do not mutate value in lens ", () => {
        const lens = getLens();

        const name = lens.prop("name");
        expect(name.get())
            .to.equal("John");

        const isFocused = name.state.item("isFocused");
        isFocused.set(true);

        expect(name.get())
            .to.equal("John");

        expect(name.state.get())
            .to.include({ isFocused: true });

        expect(name.get())
            .to.equal("John");

        isFocused.set(false);

        expect(name.state.get())
            .to.include({ isFocused: false });
    });

    it("Should check onChange callback in StatefulLens", () => {
        const data = {
            one: 1,
            two: 2,
        };

        const onChange = () => ++data.one;
        const lens = new StatefulLens(data, {}, onChange);

        expect(lens.get())
            .to.include({ one: 1, two: 2 });

        lens.set({ one: 4, two: 3 });

        expect(data)
            .to.equal(lens.get());

        expect(lens.get())
            .to.include({ one: 5, two: 3 });
    });

    it("Property lens should have initial state ", () => {
        const lens = getLens();
        const name = lens.prop("name", undefined, {
            isOpened: true,
        });

        expect(name.state.get())
            .to.include({ isOpened: true });
    });

    it("Should change state and data in lens at the same time ", () => {
        const lens = getLens();
        const name = lens.prop("name", undefined, { isOpened: false });

        lens.prop((p) => p.obj.name);

        const nameTurn = name.turn((v) => v, (v) => ({
            value: v.value,
            state: { isOpened: v.value === "someValue" },
        }));

        expect(name.get())
            .to.equal("John");
        expect(nameTurn.get())
            .to.equal("John");

        expect(name.state.get())
            .to.include({ isOpened: false });

        nameTurn.set("One");

        expect(nameTurn.get())
            .to.equal("One");
        expect(name.get())
            .to.equal("One");

        expect(name.state.get())
            .to.include({ isOpened: false });
    });

});
