import React from "react";
import { getPrimarSetariData } from "@/actions/primar-actions";
import { PrimarSetariContent } from "../_components/primar-setari-content";

export default async function PrimarSetariPage(): Promise<React.ReactElement> {
  const result = await getPrimarSetariData();
  return <PrimarSetariContent initialData={result} />;
}
