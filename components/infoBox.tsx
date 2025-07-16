import React from "react";
import { infoBoxContentFactory } from "./utilities";

interface InfoBoxProps {
  version: string;
}

const InfoBox: React.FC<InfoBoxProps> = ({ version }) => (
  <div className="bg-black bg-opacity-60 text-white p-6 rounded-xl shadow-lg max-w-4xl w-full text-base font-sans space-y-3 leading-relaxed">
    {infoBoxContentFactory(version)}
  </div>
);

export default InfoBox;
