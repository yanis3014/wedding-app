"use client";

import dynamic from "next/dynamic";

// Dynamically import the map component to avoid SSR issues with Leaflet
const PrestatairesMap = dynamic(
  () => import("@/components/shared/PrestatairesMap").then((mod) => mod.default),
  { ssr: false }
);

type MapWrapperProps = {
  prestataires: any[];
};

export default function MapWrapper({ prestataires }: MapWrapperProps) {
  return <PrestatairesMap prestataires={prestataires} />;
}
