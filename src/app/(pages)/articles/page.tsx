import { getPosts } from "@/lib/queries/posts";
import ArticlesPage from "../../components/pages/ArticlesPage";

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}
export const dynamic = "force-dynamic";
export default async function Page({ searchParams }: PageProps) {
  const category = searchParams?.category as string;
  const posts = await getPosts({ category });
  return <ArticlesPage posts={posts.data} initialCategory={category} />;
}
