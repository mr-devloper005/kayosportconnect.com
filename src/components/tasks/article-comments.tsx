"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageSquare, Trash2 } from "lucide-react";
import type { SitePost } from "@/lib/site-connector";
import { RichContent, formatRichHtml } from "@/components/shared/rich-content";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { loadFromStorage, saveToStorage, storageKeys } from "@/lib/local-storage";
import type { User } from "@/types";

const API_BASE =
  process.env.NEXT_PUBLIC_MASTER_PANEL_URL ||
  process.env.NEXT_PUBLIC_MASTER_API_URL;
const SITE_CODE = process.env.NEXT_PUBLIC_SITE_CODE;
const LOCAL_COMMENT_VERSION = "v2";
const DAILY_COMMENT_LIMIT = 10;

type LocalComment = {
  id: string;
  slug: string;
  articleSlug: string;
  authorName: string;
  body: string;
  createdAt: string;
  source: "local";
};

type DisplayComment = {
  id: string;
  slug: string;
  authorName: string;
  body: string;
  createdAt: string;
  source: "local" | "remote";
};

const buildPublicUrl = (path: string) => {
  if (!API_BASE || !SITE_CODE) return null;
  return `${API_BASE.replace(/\/$/, "")}/api/v1/public/${SITE_CODE}${path}`;
};

const getContent = (post: SitePost) =>
  post.content && typeof post.content === "object" ? (post.content as Record<string, any>) : {};

const commentStorageKey = (slug: string) => `nexus-article-comments:${LOCAL_COMMENT_VERSION}:${slug}`;

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

const nextResetTime = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getLocalAuthorName = () => {
  const savedUser = loadFromStorage<User | null>(storageKeys.user, null);
  return savedUser?.name?.trim() || "User";
};

const toDisplayComment = (comment: SitePost): DisplayComment => {
  const content = getContent(comment);
  return {
    id: comment.id,
    slug: comment.slug,
    authorName: comment.authorName || "Anonymous",
    body:
      (typeof content.description === "string" && content.description) ||
      comment.summary ||
      "Comment added.",
    createdAt: comment.publishedAt || comment.createdAt || new Date().toISOString(),
    source: "remote",
  };
};

const sortComments = (comments: DisplayComment[]) =>
  [...comments].sort((a, b) => {
    if (a.source !== b.source) {
      return a.source === "local" ? -1 : 1;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

export function ArticleComments({ slug }: { slug: string }) {
  const [remoteComments, setRemoteComments] = useState<DisplayComment[]>([]);
  const [localComments, setLocalComments] = useState<LocalComment[]>([]);
  const [page, setPage] = useState(1);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [commentBody, setCommentBody] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const pageSize = 10;

  useEffect(() => {
    const saved = loadFromStorage<LocalComment[]>(commentStorageKey(slug), []);
    setLocalComments(Array.isArray(saved) ? saved : []);
  }, [slug]);

  useEffect(() => {
    const load = async () => {
      const target = buildPublicUrl("/feed?limit=200");
      if (!target) {
        setRemoteComments([]);
        return;
      }

      try {
        const response = await fetch(target, { cache: "no-store" });
        if (!response.ok) {
          setRemoteComments([]);
          return;
        }
        const json = (await response.json()) as { data?: { posts?: SitePost[] } };
        const posts = json.data?.posts || [];
        const filtered = posts.filter((post) => {
          const content = getContent(post);
          return (
            content.type === "comment" &&
            (content.articleSlug === slug ||
              (typeof content.parentUrl === "string" && content.parentUrl.includes(`/${slug}`)))
          );
        });

        setRemoteComments(filtered.map(toDisplayComment));
      } catch {
        setRemoteComments([]);
      }
    };

    load();
  }, [slug]);

  const mergedComments = useMemo(
    () =>
      sortComments([
        ...localComments.map((comment) => ({
          id: comment.id,
          slug: comment.slug,
          authorName: comment.authorName,
          body: comment.body,
          createdAt: comment.createdAt,
          source: "local" as const,
        })),
        ...remoteComments,
      ]),
    [localComments, remoteComments]
  );

  const commentsToday = useMemo(() => {
    const todayStart = startOfToday();
    return localComments.filter((comment) => new Date(comment.createdAt).getTime() >= todayStart).length;
  }, [localComments]);

  const remainingToday = Math.max(DAILY_COMMENT_LIMIT - commentsToday, 0);
  const limitReached = remainingToday <= 0;
  const resetLabel = nextResetTime().toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith("#comment-")) {
      const targetKey = hash.replace("#comment-", "");
      const match = mergedComments.find(
        (item) => item.id === targetKey || item.slug === targetKey
      );
      setHighlightId(match?.id || null);
      return;
    }

    if (hash === "#comment" && mergedComments.length) {
      setHighlightId(mergedComments[0].id);
      return;
    }

    setHighlightId(null);
  }, [mergedComments]);

  useEffect(() => {
    if (!highlightId) return;
    const target = document.getElementById(`comment-${highlightId}`);
    if (target) {
      setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
    }
  }, [highlightId]);

  const totalPages = Math.max(Math.ceil(mergedComments.length / pageSize), 1);
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const visibleComments = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return mergedComments.slice(start, start + pageSize);
  }, [mergedComments, safePage]);

  const persistLocalComments = (nextComments: LocalComment[]) => {
    setLocalComments(nextComments);
    saveToStorage(commentStorageKey(slug), nextComments);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanBody = commentBody.trim();

    if (!cleanBody) {
      setFormError("Please write a comment before publishing.");
      return;
    }

    if (limitReached) {
      setFormError("You have reached the 10 comments per day limit on this device.");
      return;
    }

    const nextComment: LocalComment = {
      id: `local-${slug}-${Date.now()}`,
      slug: `local-comment-${Date.now()}`,
      articleSlug: slug,
      authorName: getLocalAuthorName(),
      body: cleanBody,
      createdAt: new Date().toISOString(),
      source: "local",
    };

    persistLocalComments([nextComment, ...localComments]);
    setCommentBody("");
    setFormError(null);
    setHighlightId(nextComment.id);
    setPage(1);
  };

  const handleDeleteLocalComment = (commentId: string) => {
    const nextComments = localComments.filter((comment) => comment.id !== commentId);
    persistLocalComments(nextComments);
    if (highlightId === commentId) {
      setHighlightId(null);
    }
    setFormError(null);
  };

  return (
    <section className="mt-12" id="comments">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <MessageSquare className="h-4 w-4" />
        Comments
      </div>

      <form onSubmit={handleSubmit} className="mt-8 rounded-3xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
            {getLocalAuthorName().charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{getLocalAuthorName()}</p>
            <p className="text-xs text-muted-foreground">Posting publicly</p>
          </div>
        </div>
        <Textarea
          id="comment-body"
          value={commentBody}
          onChange={(event) => setCommentBody(event.target.value)}
          placeholder="Share your thoughts..."
          className="min-h-24 resize-none border-0 bg-transparent text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
          maxLength={2000}
          disabled={limitReached}
        />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">
            {limitReached
              ? `Daily limit reached. Resets ${resetLabel}.`
              : `${remainingToday} remaining today`}
          </p>
          <div className="flex items-center gap-3">
            {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
            <Button type="submit" disabled={limitReached || !commentBody.trim()} size="sm" className="rounded-full px-6">
              Post
            </Button>
          </div>
        </div>
      </form>

      {mergedComments.length ? (
        <div className="mt-8 divide-y divide-border">
          {visibleComments.map((comment) => {
            const isHighlighted = highlightId === comment.id;
            return (
              <div
                key={comment.id}
                id={`comment-${comment.id}`}
                className={`flex gap-4 p-4 ${
                  isHighlighted ? "rounded-2xl bg-primary/5" : ""
                }`}
              >
                <div className="h-9 w-9 shrink-0 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                  {comment.authorName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">{comment.authorName}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                      {comment.source === "local" ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteLocalComment(comment.id)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                          aria-label="Delete comment"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <RichContent
                    html={formatRichHtml(comment.body, "Comment added.")}
                    className="mt-1 text-sm text-foreground prose-sm"
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-8 py-12 text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">No comments yet. Be the first to share your thoughts.</p>
        </div>
      )}

      {totalPages > 1 ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>
            Page {safePage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={safePage === 1}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={safePage === totalPages}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
