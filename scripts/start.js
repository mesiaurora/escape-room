"use strict";

const suppressedCodes = new Set([
  "DEP_WEBPACK_DEV_SERVER_ON_AFTER_SETUP_MIDDLEWARE",
  "DEP_WEBPACK_DEV_SERVER_ON_BEFORE_SETUP_MIDDLEWARE",
]);

const originalEmitWarning = process.emitWarning.bind(process);

process.emitWarning = (warning, ...args) => {
  const codeFromObject =
    warning && typeof warning === "object" && "code" in warning ? warning.code : undefined;
  const codeFromArgs = typeof args[1] === "string" ? args[1] : undefined;
  const code = codeFromObject || codeFromArgs;

  if (typeof code === "string" && suppressedCodes.has(code)) {
    return;
  }

  return originalEmitWarning(warning, ...args);
};

require("react-scripts/scripts/start");
