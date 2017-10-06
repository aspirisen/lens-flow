import { storiesOf } from "@storybook/react";
import * as React from "react";
import { App } from "./App";
import { Polygon } from "./Polygon";
import { State } from "./State";

storiesOf("Button", module)
    .add("App", () => <App />)
    .add("State", () => <State />)
    .add("Polygon", () => <Polygon />);
