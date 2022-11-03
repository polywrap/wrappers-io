import {
  Abi,
  MethodDefinition,
} from "@polywrap/wrap-manifest-types-js/build/formats/wrap.info/0.1";

export type WrapperInfo = {
  name: string;
  readme?: string;
  abi: Abi;
  schema?: string;
  dependencies: string[];
  methods: MethodDefinition[] | undefined;
};
