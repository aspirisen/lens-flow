import { config } from "chai";

config.truncateThreshold = 0;

(((requireContext) => {
    return requireContext.keys().map(requireContext);
})(require.context("./specs/", true, /^.*\.spec\.tsx?$/)));
