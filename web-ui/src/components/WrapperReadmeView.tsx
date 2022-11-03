import { WrapperInfo } from "../models/WrapperInfo";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const WrapperReadmeView: React.FC<{
  wrapperInfo: WrapperInfo;
}> = ({ wrapperInfo }) => {
  return (
    <div className="WrapperReadmeView">
      <div className="px-4 pb-5">
        <ReactMarkdown className="markdown-body" remarkPlugins={[remarkGfm]}>
          {wrapperInfo.readme as string}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default WrapperReadmeView;
