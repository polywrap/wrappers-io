import { ETH_PROVIDERS, WNS_CONTRACT_ADDRESSES } from "../constants";
import { EnsDomain } from "../models/EnsDomain";
import { LoadedWrapper } from "../models/LoadedWrapper";
import { PublishedWrapper } from "../models/PublishedWrapper";
import { EnsRegistryContract } from "../utils/ens/EnsRegistryContract";
import { EnsResolverContract } from "../utils/ens/EnsResolverContract";
import { getCidFromContenthash } from "../utils/getCidFromContenthash";
import { getProvider } from "../utils/getProvider";
import { isCID } from "../utils/isCID";
import { loadFilesFromIpfs } from "../utils/loadFilesFromIpfs";
import { getFilesByOcrId } from "../utils/ocr/getFilesByOcrId";
import { stripBasePath } from "../utils/stripBasePath";
import OcrIdLoader from "./OcrIdLoader";
import { Network } from "../utils/Network";
import { fetchCidOrOcrId } from "../utils/ens/fetchCidOrOcrId";
import { useDebouncedEffect } from "../utils/useDebouncedEffect";

import { useEffect, useState } from "react";
import { InMemoryFile } from "@nerfzael/memory-fs";
import { useEthers } from "@usedapp/core";
import { useDropzone } from "react-dropzone";
import { IPFSHTTPClient } from "ipfs-http-client";
import { decodeOcrIdFromContenthash, OcrId } from "@nerfzael/ocr-core";
import { arrayify, namehash } from "ethers/lib/utils";
import { ethers } from "ethers";

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

const LoadWrapper: React.FC<{
  publishedWrapper?: PublishedWrapper;
  ipfsNode: IPFSHTTPClient;
  setLoadedWrapper: (wrapper: LoadedWrapper | undefined) => void;
}> = ({ publishedWrapper, ipfsNode, setLoadedWrapper }) => {
  const { library: provider, chainId } = useEthers();
  const [showUpload, setShowUpload] = useState(false);
  const [uploadType, setUploadType] = useState<
    "fs" | "ipfs" | "ens" | "wns" | "ocr" | undefined
  >();
  const { acceptedFiles, getRootProps, getInputProps, isDragAccept } =
    useDropzone();
  const [files, setFiles] = useState<InMemoryFile[]>([]);
  const [cid, setCID] = useState<string | undefined>();
  const [ensDomain, setEnsDomain] = useState<EnsDomain | undefined>();
  const [selectedEnsDomain, setSelectedEnsDomain] = useState<
    EnsDomain | undefined
  >();
  const [wnsDomain, setWnsDomain] = useState<EnsDomain | undefined>();
  const [ocrId, setOcrId] = useState<OcrId>();
  const [hasLoadedWrapper, setHasLoadedWrapper] = useState<boolean>(false);
  const [foundEnsDomains, setFoundEnsDomains] = useState<
    | { cid?: string; ocrId?: OcrId; chainId: number; ensDomain: EnsDomain }[]
    | undefined
  >();

  useEffect(() => {
    if (publishedWrapper) {
      setLoadedWrapper(undefined);
      setFiles([]);
      setCID(undefined);
      setEnsDomain(undefined);
      setWnsDomain(undefined);
      setOcrId(undefined);

      if (publishedWrapper.cid) {
        setCID(publishedWrapper.cid);
      } else if (publishedWrapper.ensDomain) {
        setEnsDomain(publishedWrapper.ensDomain);
      } else if (publishedWrapper.wnsDomain) {
        setWnsDomain(publishedWrapper.wnsDomain);
      } else if (publishedWrapper.ocrId) {
        setOcrId(publishedWrapper.ocrId);
      }
    }
  }, [publishedWrapper, setLoadedWrapper]);

  useEffect(() => {
    (async () => {
      if (acceptedFiles && acceptedFiles.length) {
        const result = await Promise.all(
          acceptedFiles.map(async (x) => {
            return await readFile(x);
          })
        );

        setFiles(stripBasePath(result));

        setShowUpload(false);
        setUploadType(undefined);
      }
    })();
  }, [acceptedFiles]);

  useEffect(() => {
    if (cid && !(files && files.length)) {
      (async () => {
        const ipfsFiles = await loadFilesFromIpfs(cid, ipfsNode);

        if (ipfsFiles) {
          setFiles(ipfsFiles);
        }
      })();
    }
  }, [cid, files, ipfsNode]);

  useEffect(() => {
    if (files && files.length) {
      setLoadedWrapper({
        cid,
        ensDomain: selectedEnsDomain,
        ocrId,
        files,
      });
      setHasLoadedWrapper(true);
    }
  }, [files, cid, ocrId, setLoadedWrapper, selectedEnsDomain]);

  useDebouncedEffect(
    () => {
      (async () => {
        setFiles([]);
        setLoadedWrapper(undefined);
        if (
          !provider ||
          !chainId ||
          !ensDomain ||
          !ensDomain.name.endsWith(".eth")
        ) {
          return;
        }

        const chainIds = Object.keys(ETH_PROVIDERS);

        const promises = chainIds.map(async (x: any) => {
          const networkProvider =
            parseInt(x) === chainId
              ? provider
              : ethers.getDefaultProvider(ETH_PROVIDERS[x as number]);
          const result = await fetchCidOrOcrId(
            ensDomain,
            x as number,
            networkProvider
          );
          return {
            ...result,
            ensDomain,
            chainId: parseInt(x),
          };
        });

        const results = await Promise.all(promises);

        const found = results.filter(
          (x) => x !== undefined && (x.cid || x.ocrId)
        );

        if (found.length) {
          setFoundEnsDomains(found);
        }
      })();
    },
    [chainId, provider, ensDomain, setLoadedWrapper],
    500
  );

  useEffect(() => {
    (async () => {
      if (
        !provider ||
        !chainId ||
        !wnsDomain ||
        !wnsDomain.name.endsWith(".wrap")
      ) {
        return;
      }

      const registry = EnsRegistryContract.create(
        WNS_CONTRACT_ADDRESSES[chainId].registry,
        provider
      );

      const resolverAddress = await registry.resolver(namehash(wnsDomain.name));
      if (resolverAddress && resolverAddress !== ethers.constants.AddressZero) {
        const resolver = EnsResolverContract.create(resolverAddress, provider);

        const contenthash = await resolver.contenthash(
          namehash(wnsDomain.name)
        );
        const savedCid = getCidFromContenthash(contenthash);

        if (savedCid) {
          setCID(savedCid);
        } else {
          const savedOcrId = decodeOcrIdFromContenthash(arrayify(contenthash));
          if (savedOcrId) {
            setOcrId(savedOcrId);
          }
        }
      }
    })();
  }, [chainId, provider, wnsDomain]);

  useEffect(() => {
    (async () => {
      if (provider && ocrId && chainId) {
        const readOnlyProvider = getProvider(ocrId.chainId, chainId, provider);

        if (!readOnlyProvider) {
          return;
        }

        const packageFiles = await getFilesByOcrId(ocrId, readOnlyProvider);

        setFiles(packageFiles);
      }
    })();
  }, [chainId, provider, ocrId]);

  const dropHover = isDragAccept ? " drop-hover" : "";

  return (
    <>
      {hasLoadedWrapper && <></>}
      {!hasLoadedWrapper && (
        <div className="LoadWrapper">
          {showUpload && !uploadType && (
            <select
              className="form-control"
              onChange={(e) => setUploadType(e.target.value as any)}
            >
              <option value="">None</option>
              <option value="fs">File system</option>
              <option value="ipfs">IPFS</option>
              <option value="ens">ENS</option>
              {/* <option value="wns">WNS</option> */}
              <option value="ocr">OCR</option>
            </select>
          )}
          {showUpload && uploadType && (
            <div className="registry-section">
              {uploadType === "fs" && (
                <div
                  {...getRootProps({
                    className: `dropzone drag-area${dropHover}`,
                  })}
                >
                  <input {...getInputProps()} />
                  {!files || !files.length ? (
                    <p>
                      Drag &quot;n&quot; drop the build folder here, or click to
                      select the files
                    </p>
                  ) : (
                    <></>
                  )}
                </div>
              )}
              {uploadType === "ipfs" && (
                <input
                  className="form-control"
                  placeholder="IPFS CID..."
                  type="text"
                  onChange={(e) => {
                    if (isCID(e.target.value)) {
                      setCID(e.target.value);
                    } else {
                      setCID(undefined);
                    }
                  }}
                />
              )}
              {uploadType === "ens" && chainId && (
                <input
                  className="form-control"
                  placeholder={`ENS domain (${
                    Network.fromChainId(chainId as number).name
                  })...`}
                  type="text"
                  onChange={(e) => {
                    if (e.target.value && e.target.value.endsWith(".eth")) {
                      setEnsDomain({
                        name: e.target.value,
                        chainId,
                      });
                    } else {
                      setEnsDomain(undefined);
                    }
                  }}
                />
              )}
              {uploadType === "wns" && chainId && (
                <input
                  className="form-control"
                  placeholder="WNS domain..."
                  type="text"
                  onChange={(e) => {
                    if (e.target.value && e.target.value.endsWith(".wrap")) {
                      setWnsDomain({
                        name: e.target.value,
                        chainId,
                      });
                    } else {
                      setWnsDomain(undefined);
                    }
                  }}
                />
              )}
              {uploadType === "ocr" && (
                <OcrIdLoader setOcrId={setOcrId}></OcrIdLoader>
              )}
            </div>
          )}
          <div className="registry-section">
            {!showUpload && (
              <button
                className="btn btn-success"
                onClick={async (e) => {
                  setShowUpload(true);
                }}
              >
                Load wrapper
              </button>
            )}
          </div>
          {foundEnsDomains && foundEnsDomains.length > 0 && (
            <div>
              {foundEnsDomains.map((x, i) => (
                <div key={i}>
                  {x.cid && (
                    <div
                      className="success-back round pad m-2 pointer"
                      onClick={() => {
                        setCID(x.cid);
                        setSelectedEnsDomain({
                          name: x.ensDomain.name,
                          chainId: x.chainId,
                        });
                      }}
                    >
                      <span>
                        {Network.fromChainId(x.chainId).label} - IPFS CID:{" "}
                        {x.cid}
                      </span>
                    </div>
                  )}
                  {x.ocrId && (
                    <div
                      className="success-back round pad m-2 pointer"
                      onClick={() => {
                        setOcrId(x.ocrId);
                      }}
                    >
                      <span>
                        {Network.fromChainId(x.chainId).label} - OCR ID:{" "}
                        {x.ocrId.packageIndex}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default LoadWrapper;
