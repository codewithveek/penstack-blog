import EditPostPage from "@/components//pages/Dashboard/NewPostPage";
import { getPostForEditing } from "@/lib/queries/post";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Editing Post",
};
export default async function Page({ params }: { params: { postId: string } }) {
  const postId = params.postId;
  const post = await getPostForEditing(postId);

  if (!post) {
    return <div className=" font-bold text-xl text-center">Post not found</div>;
  }
  return <EditPostPage post={post as any} />;
}
