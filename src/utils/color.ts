export const toHexChannel = (value: number) =>
  Math.max(0, Math.min(255, value)).toString(16).padStart(2, "0");

export const getDepthRowColor = (depth: number) => {
  const brightnessFactor = Math.max(0, 1 - depth * 0.1);
  const channelValue = Math.round(255 * brightnessFactor);
  const channel = toHexChannel(channelValue);
  return `#${channel}${channel}${channel}`;
};
