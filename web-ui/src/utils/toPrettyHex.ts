export const toPrettyHex = (hex: string): string => {
  return hex
    ? `${hex.slice(0, 5)}...${hex.slice(-5, hex.length)}`
    : "0x00...0000";
};
