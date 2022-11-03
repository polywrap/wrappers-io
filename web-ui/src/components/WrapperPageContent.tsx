import LoadedWrapperView from "./LoadedWrapperView";
import { LoadedWrapper } from "../models/LoadedWrapper";
import { WrapperInfo } from "../models/WrapperInfo";
import { PublishedWrapper } from "../models/PublishedWrapper";
import Navigation from "./Navigation";
import LoadWrapper from "./LoadWrapper";
import { stripBasePath } from "../utils/stripBasePath";

import { IPFSHTTPClient } from "ipfs-http-client";
import { useDropzone } from "react-dropzone";
import { useEffect, useState } from "react";
import { InMemoryFile } from "@nerfzael/memory-fs";

const readFile = (file: File): Promise<InMemoryFile> => {
  return new Promise<InMemoryFile>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e: any) => {
      const text = e.target.result;

      resolve({
        path: (file as any)["path"],
        content: text,
      } as InMemoryFile);
    };

    reader.readAsArrayBuffer(file);
  });
};

const WrapperPageContent: React.FC<{
  wrapper: LoadedWrapper | undefined;
  ipfsNode: IPFSHTTPClient;
  setWrapper: (wrapper: LoadedWrapper | undefined) => void;
}> = ({ wrapper, ipfsNode, setWrapper }) => {
  const [wrapperInfo, setWrapperInfo] = useState<WrapperInfo>();
  const [publishedWrapper, setPublishedWrapper] = useState<
    PublishedWrapper | undefined
  >();

  const { acceptedFiles, getRootProps, getInputProps, isDragAccept } =
    useDropzone({ noClick: true });

  useEffect(() => {
    (async () => {
      if (acceptedFiles && acceptedFiles.length) {
        const result = await Promise.all(
          acceptedFiles.map(async (x) => {
            return await readFile(x);
          })
        );

        setWrapper({
          files: stripBasePath(result),
        });
      }
    })();
  }, [acceptedFiles, setWrapper]);

  const dropHover = isDragAccept ? " drop-hover" : "";

  return (
    <>
      <Navigation></Navigation>
      <div className="page container-xl">
        <div
          {...getRootProps({
            className: `dropzone ${dropHover}`,
          })}
        >
          {isDragAccept && (
            <div className="inner-dropzone">
              <input {...getInputProps()} />
              <p>
                Drag &quot;n&quot; drop the build folder here, or click to
                select the files
              </p>
            </div>
          )}
          {!isDragAccept && (
            <>
              <h2 className="p-3 mt-2">
                {wrapperInfo && wrapperInfo.name && (
                  <span>{wrapperInfo.name}</span>
                )}
                {!(wrapperInfo && wrapperInfo.name) && <span>Wrapper</span>}
              </h2>

              <div className="widget widget-border widget-shadow widget-with-tabs">
                {!wrapper && (
                  <LoadWrapper
                    publishedWrapper={publishedWrapper}
                    ipfsNode={ipfsNode}
                    setLoadedWrapper={setWrapper}
                  ></LoadWrapper>
                )}
                {wrapper && (
                  <LoadedWrapperView
                    wrapper={wrapper}
                    setWrapper={setWrapper}
                    ipfsNode={ipfsNode}
                    setLoadedWrapperInfo={setWrapperInfo}
                  ></LoadedWrapperView>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default WrapperPageContent;
