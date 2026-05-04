import Link from "next/link";
import { PageShell } from "@/components/shared/page-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileText, Image as ImageIcon, LayoutGrid } from "lucide-react";
import { fetchSiteFeed } from "@/lib/site-connector";
import { buildPostUrl, getPostTaskKey } from "@/lib/task-data";
import { getMockPostsForTask } from "@/lib/mock-posts";
import { SITE_CONFIG, type TaskKey } from "@/lib/site-config";
import { TaskPostCard } from "@/components/shared/task-post-card";
import { cn } from "@/lib/utils";

export const revalidate = 3;

const matchText = (value: string, query: string) =>
  value.toLowerCase().includes(query);

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, " ");

const compactText = (value: unknown) => {
  if (typeof value !== "string") return "";
  return stripHtml(value).replace(/\s+/g, " ").trim().toLowerCase();
};

function buildSearchHref(opts: {
  q: string;
  task?: string;
  category?: string;
}) {
  const p = new URLSearchParams();
  p.set("master", "1");
  if (opts.q.trim()) p.set("q", opts.q.trim());
  if (opts.task) p.set("task", opts.task);
  if (opts.category) p.set("category", opts.category);
  const qs = p.toString();
  return qs ? `/search?${qs}` : "/search?master=1";
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; category?: string; task?: string; master?: string }>;
}) {
  const resolved = (await searchParams) || {};
  const query = (resolved.q || "").trim();
  const normalized = query.toLowerCase();
  const category = (resolved.category || "").trim().toLowerCase();
  const task = (resolved.task || "").trim().toLowerCase();
  const useMaster = resolved.master !== "0";
  const feed = await fetchSiteFeed(
    useMaster ? 1000 : 300,
    useMaster
      ? { fresh: true, category: category || undefined, task: task || undefined }
      : undefined
  );
  const posts =
    feed?.posts?.length
      ? feed.posts
      : useMaster
        ? []
        : SITE_CONFIG.tasks.flatMap((task) => getMockPostsForTask(task.key));

  const filtered = posts.filter((post) => {
    const content = post.content && typeof post.content === "object" ? post.content : {};
    const typeText = compactText((content as any).type);
    if (typeText === "comment") return false;
    const description = compactText((content as any).description);
    const body = compactText((content as any).body);
    const excerpt = compactText((content as any).excerpt);
    const categoryText = compactText((content as any).category);
    const tags = Array.isArray(post.tags) ? post.tags.join(" ") : "";
    const tagsText = compactText(tags);
    const derivedCategory = categoryText || tagsText;
    if (category && !derivedCategory.includes(category)) return false;
    if (task && typeText && typeText !== task) return false;
    if (!normalized.length) return true;
    return (
      matchText(compactText(post.title || ""), normalized) ||
      matchText(compactText(post.summary || ""), normalized) ||
      matchText(description, normalized) ||
      matchText(body, normalized) ||
      matchText(excerpt, normalized) ||
      matchText(tagsText, normalized)
    );
  });

  const results = normalized.length > 0 ? filtered : filtered.slice(0, 24);

  const scopeItems = [
    { id: "" as const, label: "All", icon: LayoutGrid },
    { id: "image" as const, label: "Images", icon: ImageIcon },
    { id: "article" as const, label: "Articles", icon: FileText },
  ] as const;

  const pageDescription =
    query.length > 0
      ? task === "image"
        ? `Image results for “${query}”.`
        : task === "article"
          ? `Article results for “${query}”.`
          : `Results for “${query}”.`
      : task === "image"
        ? "Browsing image posts with optional text search."
        : task === "article"
          ? "Browsing articles with optional text search."
          : "Search captions, titles, and story text across images and articles.";

  const resultGridClass =
    task === "article"
      ? "grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
      : task === "image"
        ? "grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
        : "grid gap-6 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <PageShell
      title="Search"
      description={pageDescription}
      actions={
        <form action="/search" className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <input type="hidden" name="master" value="1" />
          {category ? <input type="hidden" name="category" value={category} /> : null}
          {task ? <input type="hidden" name="task" value={task} /> : null}
          <div className="relative w-full sm:w-[min(100%,22rem)] lg:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(53_88_114/0.4)]" />
            <Input
              name="q"
              defaultValue={query}
              placeholder="Titles, summaries, captions…"
              className="h-11 border-[rgb(53_88_114/0.12)] bg-white pl-9 shadow-sm"
            />
          </div>
          <Button type="submit" className="h-11 shrink-0 bg-[#355872] font-semibold text-white hover:bg-[rgb(45_72_94)]">
            Search
          </Button>
        </form>
      }
    >
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Narrow results to <span className="font-medium text-foreground">images</span> or{" "}
          <span className="font-medium text-foreground">articles</span>—same search query is kept.
        </p>
        <div className="flex flex-wrap gap-2">
          {scopeItems.map(({ id, label, icon: Icon }) => {
            const active = (task || "") === id;
            const href = buildSearchHref({ q: query, task: id || undefined, category });
            return (
              <Link
                key={id || "all"}
                href={href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-colors",
                  active
                    ? "border-[#355872] bg-[#355872] text-white shadow-sm"
                    : "border-[rgb(53_88_114/0.14)] bg-white text-[rgb(53_88_114/0.85)] hover:border-[rgb(122_170_206/0.5)] hover:bg-[rgb(247_248_240)]",
                )}
              >
                <Icon className="h-3.5 w-3.5 opacity-80" />
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      {results.length ? (
        <div className={resultGridClass}>
          {results.map((post) => {
            const postTask = getPostTaskKey(post);
            const href = postTask ? buildPostUrl(postTask, post.slug) : `/posts/${post.slug}`;
            return (
              <TaskPostCard
                key={post.id}
                post={post}
                href={href}
                taskKey={postTask ?? undefined}
              />
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[rgb(53_88_114/0.18)] bg-[rgb(255_255_255/0.7)] px-6 py-16 text-center">
          <p className="text-base font-medium text-[#355872]">No matches in this scope.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try another keyword, switch to <Link className="font-semibold text-[#355872] underline-offset-2 hover:underline" href={buildSearchHref({ q: query, task: undefined, category })}>All</Link>, or open the{" "}
            <Link className="font-semibold text-[#355872] underline-offset-2 hover:underline" href="/">
              home page
            </Link>
            .
          </p>
        </div>
      )}
    </PageShell>
  );
}
