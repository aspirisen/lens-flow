import { storiesOf } from "@storybook/react";
import * as React from "react";
import { App } from "./App";
import { State } from "./State";
import { FormPlaygound } from "./Form";

storiesOf("Button", module)
  .add("App", () => <App />)
  .add("Form", () => <FormPlaygound />)
  .add("State", () => <State />);
