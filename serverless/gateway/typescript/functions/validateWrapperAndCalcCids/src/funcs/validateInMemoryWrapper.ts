import { ValidationResult, WasmPackageValidator } from "@polywrap/package-validation";
import { InMemoryPackageReader } from "../types";
import { InMemoryFile } from "../types/InMemoryFile";

export const wrapperValidationConstraints = {
  "maxSize": 10_000_000,
  "maxFileSize": 10_000_000,
  "maxModuleSize": 10_000_000,
  "maxNumberOfFiles": 1000,
};

export const validateInMemoryWrapper = async (
  files: InMemoryFile[]
): Promise<ValidationResult> => {
  const reader = new InMemoryPackageReader(files);
  
  const wasmPackageValidator = new WasmPackageValidator(wrapperValidationConstraints);

  return await wasmPackageValidator.validate(reader);
};
