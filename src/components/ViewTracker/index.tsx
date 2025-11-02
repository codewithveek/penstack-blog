import { useTrackView } from "@/hooks/useTrackView";

export const ViewTracker = ({ postId }: { postId: number }) => {
  useTrackView(postId);
  return <></>;
};
