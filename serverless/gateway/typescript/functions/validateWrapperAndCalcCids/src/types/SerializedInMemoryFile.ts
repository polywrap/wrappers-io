export type SerializedInMemoryFile = {
  path: string;
  content?: {
    type: "Buffer";
    data: number[];
  };
}
