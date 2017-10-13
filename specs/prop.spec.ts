import { expect } from "chai";
import { getLens, value } from "./mock";

describe("prop", () => {

    it("Should return root value", () => {
        const lens = getLens();

        expect(lens.get())
            .to.be.deep.equal(value);
    });

    it("Should return value by string key", () => {
        const lens = getLens();

        expect(lens.prop("name").get())
            .to.be.equal(value.name);
    });

    it("Should return value by lambda", () => {
        const lens = getLens();

        expect(lens.prop((p) => p.name).get())
            .to.be.equal(value.name);
    });

    it("Should return value by lambda chain", () => {
        const lens = getLens();

        expect(lens.prop((p) => p.obj.internal.a).get())
            .to.be.equal(value.obj.internal.a);
    });

    it("Should set value by string key", () => {
        const lens = getLens();
        lens.prop("name").set(value.name);

        expect(lens.prop("name").get())
            .to.be.equal(value.name);
    });

    it("Should set value by lambda", () => {
        const lens = getLens();
        lens.prop((p) => p.name).set("Jack");

        expect(lens.prop((p) => p.name).get())
            .to.be.equal("Jack");
    });

    it("Should set value by lambda chain", () => {
        const lens = getLens();
        lens.prop((p) => p.obj.internal.a).set("Jack");

        expect(lens.prop((p) => p.obj.internal.a).get())
            .to.be.equal("Jack");
    });

    it("Should check basic untyped prop", () => {
        const lens = getLens();

        let prop = lens.item("stringProp");

        expect(prop.get())
            .to.be.equal(value.stringProp);

        prop.set("new");

        expect(prop.get())
            .to.be.equal("new");

        prop = lens.item("stringProp");

        expect(prop.get())
            .to.be.equal("new");
    });

    it("Should check inner prop", () => {
        const lens = getLens();
        const obj = lens.prop("obj");
        let prop = obj.prop("name");

        expect(prop.get())
            .to.be.equal(value.obj.name);

        prop.set("new");

        expect(prop.get())
            .to.be.equal("new");

        prop = lens.prop("obj").prop("name");

        expect(prop.get())
            .to.be.equal("new");
    });

    it("Should not fall when gets absent parent prop by key", () => {
        const lens = getLens();
        let prop = lens.prop("objNull").item("one");

        expect(prop.get())
            .to.be.equal(null);

        prop.set("new");

        expect(prop.get())
            .to.be.equal("new");

        prop = lens.prop("objNull").item("one");

        expect(prop.get())
            .to.be.equal("new");
    });

    it("Should not fall when gets absent parent prop by lambda chain", () => {
        const lens = getLens();
        const prop = lens.prop((p) => p.empty.internal.a);

        expect(prop.get())
            .to.be.equal(null);
    });

    it("Should set to absent parent prop and create object shape according to set property props path", () => {
        const lens = getLens();
        const objNull = lens.prop("empty");

        const a = objNull.prop("internal").prop("a");
        a.set("inner");

        expect(objNull.prop("internal").prop("a").get())
            .to.be.equal("inner");
    });

    it("Should set to absent parent prop and create object shape according to set property props path by lambda", () => {
        const lens = getLens();

        const a = lens.prop((p) => p.empty.internal.a);
        a.set("inner");

        lens.prop((p) => p.obj);

        expect(lens.prop((p) => p.empty.internal.a).get())
            .to.be.equal("inner");
    });

    it("Should check default value in prop", () => {
        const lens = getLens();

        const prop = lens.prop("empty", value.obj);

        expect(prop.get())
            .to.be.deep.equal(value.obj);
    });

    it("Should transform value", () => {
        const lens = getLens();

        const prop = lens.prop("stringProp")
            .transform((s) => s, (s) => s.replace(/\s/g, "_"))
            .transform((s) => s, (s) => s.toUpperCase());

        expect(prop.get())
            .to.be.equal("initial");

        prop.set("a b c");

        expect(prop.get())
            .to.be.equal("A_B_C");
    });

    it("Should check default value", () => {
        const lens = getLens();

        const prop = lens.prop("objNull").defaultValue("Default");

        expect(prop.get())
            .to.be.equal("Default");

        prop.set("New");

        expect(prop.get())
            .to.be.equal("New");
    });

    it("Should check that default is not mutated", () => {
        const lens = getLens();

        const defaultValue = { a: "A", b: "B" };

        const prop = lens.prop("objNull").defaultValue(defaultValue);
        const aProp = prop.item("a");

        expect(aProp.get())
            .to.be.equal("A");

        aProp.set("New");

        expect(aProp.get())
            .to.be.equal("New");

        expect(defaultValue.a)
            .to.be.equal("A");
    });

    it("Should check that prop is the same by reference", () => {
        const lens = getLens();

        expect(lens.prop("obj").prop("internal").prop("a"))
            .to.be.equal(lens.prop("obj").prop("internal").prop("a"));
    });

    it("Should check that prop interop is the same by reference", () => {
        const lens = getLens();

        expect(lens.prop("obj").prop("internal").prop("a").getInterop())
            .to.be.not.equal(lens.prop("obj").prop("internal").prop("a").getInterop());

        lens.prop("obj").prop("internal").prop("a").set("some");

        expect(lens.prop("obj").prop("internal").prop("a").getInterop())
            .to.be.not.equal(lens.prop("obj").prop("internal").prop("a").getInterop());

        expect(lens.prop("obj").prop("internal").prop("a").getInterop().value)
            .to.be.equal("some");

        expect(lens.prop("obj").prop("internal").prop("a").getInterop().onChange)
            .to.be.equal(lens.prop("obj").prop("internal").prop("a").getInterop().onChange);
    });

    it("Should check that prop is changed by reference when you call set", () => {
        const lens = getLens();

        expect(lens.prop("obj").prop("internal").prop("a"))
            .to.be.equal(lens.prop("obj").prop("internal").prop("a"));

        const before = lens.prop("obj").prop("internal").prop("a");
        before.set("asd");
        const after = lens.prop("obj").prop("internal").prop("a");

        expect(before)
            .to.be.not.equal(after);
    });

    it("Should check that another prop is not changed by reference when you call set", () => {
        const lens = getLens();

        expect(lens.prop("obj").prop("internal").prop("a"))
            .to.be.equal(lens.prop("obj").prop("internal").prop("a"));

        const beforeName = lens.prop("name");
        const before = lens.prop("obj").prop("internal").prop("a");
        before.set("asd");
        const after = lens.prop("obj").prop("internal").prop("a");
        const afterName = lens.prop("name");

        expect(before)
            .to.be.not.equal(after);

        expect(beforeName)
            .to.be.equal(afterName);
    });

});
