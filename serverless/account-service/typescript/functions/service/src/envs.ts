export const ENV_VARS = [
  "ACCOUNTS_TABLE",
  "WRAPPERS_GATEWAY_ADMIN_KEY"
] as const;

export type EnvVars = {
  [key in typeof ENV_VARS[number]]: string;
};
