export const ENV_VARS = [
  "PACKAGES_TABLE",
  "ACCOUNT_SERVICE_URI",
  "WRAPPERS_GATEWAY_ADMIN_KEY",
] as const;

export type EnvVars = {
  [key in typeof ENV_VARS[number]]: string;
};
