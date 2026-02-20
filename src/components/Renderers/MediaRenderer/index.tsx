import { MediaAttrs } from "@/lib/editor/extensions/media-ext";
import {
  MediaComponentNew,
  type MediaNodeViewProps,
} from "@/lib/editor/nodes/media/MediaComponents";
import {
  StandaloneMedia,
  StandaloneMediaProps,
} from "@/lib/editor/nodes/media/MediaComponents/StandaloneMedia";

export const MediaRenderer = ({
  isEditing = false,
  attrs,
  node,
}: {
  isEditing?: boolean;
  attrs?: MediaAttrs;
  node?: MediaNodeViewProps["node"];
}) => {
  return <StandaloneMedia {...(attrs as StandaloneMediaProps)} />;
};
