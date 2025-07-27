
import { useParams, Link } from "react-router-dom";
import { useSites } from "@/hooks/useSites";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, Star, ExternalLink, MessageSquare, UserCircle } from "lucide-react";
import { useComments } from "@/hooks/useSites";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";



export default function SiteDetails() {
  const { id } = useParams<{ id: string }>();
  const { sites, loading } = useSites();
  const { comments, addComment, refetch } = useComments(id!);
  const { user } = useAuth();
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [selectedRating, setSelectedRating] = useState<"positive" | "negative" | "neutral">("neutral");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xl">Loading site details...</div>;
  }

  // Defensive: handle both string and number ids
  const site = sites.find((s) => String(s.id) === String(id));
  if (!site) return <div className="p-8 text-center">Site not found.</div>;

  const handleSubmitComment = async () => {
    if (!user) return;
    if (!commentText.trim()) return;
    setSubmitting(true);
    // Prefer user.user_metadata.display_name, fallback to user.email
    const displayName = user.user_metadata?.display_name || user.email || "User";
    await addComment(site.id, commentText.trim(), selectedRating, displayName);
    setCommentText("");
    setSelectedRating("neutral");
    setIsCommenting(false);
    setSubmitting(false);
    refetch();
  };

  // Calculate stats for likes/dislikes/total reviews
  const positiveComments = comments.filter((c) => c.rating === "positive").length;
  const negativeComments = comments.filter((c) => c.rating === "negative").length;

  // Helper: get initials for avatar
  const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0,2);

  // Helper: format date
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-2 sm:px-0">
      <Card className="shadow-2xl border-2 border-primary/20 bg-white/95 rounded-2xl">
        {/* Banner with avatar/icon */}
        <div className="h-36 w-full bg-gradient-to-r from-blue-200 to-blue-400 rounded-t-2xl flex items-center justify-between px-8 relative mb-2">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/80 flex items-center justify-center shadow-lg border-2 border-primary/30">
              {/* Site initials as avatar */}
              <span className="text-2xl font-bold text-primary">{getInitials(site.title)}</span>
            </div>
            <span className="text-3xl font-bold text-primary drop-shadow">{site.title}</span>
            {site.status === 'active' && site.author_name && (
              <span className="ml-4 text-xs text-muted-foreground font-medium">Submitted by {site.author_name}</span>
            )}
          </div>
          <a href={site.url} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline flex items-center gap-1 text-sm font-medium hover:text-blue-900 transition-colors">
            <ExternalLink className="h-5 w-5" />
            Visit Site
          </a>
        </div>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="text-xs px-2 py-1 bg-primary/10 text-primary border-primary/30">{site.category}</Badge>
          </div>
          <CardDescription className="mt-1 text-base text-muted-foreground">{site.description}</CardDescription>
        </CardHeader>
        {/* Stats row */}
        <div className="flex items-center justify-between px-6 py-3 bg-muted/40 rounded-lg mx-4 mt-2 mb-4 shadow-sm">
          <Badge className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 font-semibold text-sm" title="Number of positive reviews">
            <ThumbsUp className="h-4 w-4" /> {positiveComments} Likes
          </Badge>
          <Badge className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-600 font-semibold text-sm" title="Number of negative reviews">
            <ThumbsDown className="h-4 w-4" /> {negativeComments} Dislikes
          </Badge>
          <Badge className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 font-semibold text-sm" title="Total reviews">
            <MessageSquare className="h-4 w-4" /> {comments.length} Reviews
          </Badge>
        </div>
        <CardContent>
          {/* Add Review Button & Form */}
          <div className="mt-4">
            {user ? (
              isCommenting ? (
                <div className="space-y-3 border rounded-lg p-4 bg-muted/50 mb-6 animate-fade-in">
                  <div>
                    <Label className="text-sm font-medium">Your Experience</Label>
                    <Textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Share your experience with this government website..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Rating</Label>
                    <div className="flex gap-2 mt-1">
                      <Button
                        size="sm"
                        variant={selectedRating === "positive" ? "default" : "outline"}
                        onClick={() => setSelectedRating("positive")}
                        className={`flex items-center gap-1 ${selectedRating === "positive" ? "bg-green-500 hover:bg-green-600 text-white" : ""}`}
                      >
                        <ThumbsUp className="h-3 w-3" /> Good
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedRating === "neutral" ? "default" : "outline"}
                        onClick={() => setSelectedRating("neutral")}
                        className={`flex items-center gap-1 ${selectedRating === "neutral" ? "bg-yellow-400 hover:bg-yellow-500 text-white" : ""}`}
                      >
                        <Star className="h-3 w-3" /> Neutral
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedRating === "negative" ? "default" : "outline"}
                        onClick={() => setSelectedRating("negative")}
                        className={`flex items-center gap-1 ${selectedRating === "negative" ? "bg-red-500 hover:bg-red-600 text-white" : ""}`}
                      >
                        <ThumbsDown className="h-3 w-3" /> Poor
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSubmitComment} disabled={submitting || !commentText.trim()} className="transition-all">
                      {submitting ? <span className="animate-spin">⏳</span> : "Submit Review"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setIsCommenting(false)} disabled={submitting}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="outline" className="mb-6" onClick={() => setIsCommenting(true)}>
                  Add Your Review
                </Button>
              )
            ) : (
              <div className="mb-6 text-muted-foreground text-sm">Sign in to add your review.</div>
            )}
          </div>

          {/* Reviews Section */}
          <div className="mt-10">
            <h3 className="font-semibold mb-3 text-lg border-b pb-2">All Reviews</h3>
            {comments.length === 0 && <div className="text-muted-foreground">No reviews yet.</div>}
            <div className="space-y-4">
              {comments.map((comment, idx) => (
                <div key={comment.id} className={`border rounded-xl p-4 text-sm bg-background shadow-sm flex gap-3 items-start ${idx % 2 === 1 ? 'bg-muted/30' : ''}`}>
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">{getInitials(comment.author_name)}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-primary">{comment.author_name}</span>
                      <div className="flex items-center gap-1">
                        {comment.rating === "positive" && <ThumbsUp className="h-3 w-3 text-green-600" />}
                        {comment.rating === "negative" && <ThumbsDown className="h-3 w-3 text-red-600" />}
                        {comment.rating === "neutral" && <Star className="h-3 w-3 text-yellow-500" />}
                      </div>
                    </div>
                    <p className="text-muted-foreground italic mb-1">{comment.content}</p>
                    <div className="text-xs text-muted-foreground">{comment.created_at ? formatDate(comment.created_at) : ''}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center bg-muted/40 rounded-b-2xl mt-2">
          <Link to="/" className="text-blue-600 underline">← Back to all sites</Link>
        </CardFooter>
      </Card>
      {/* Animation keyframes for fade-in */}
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
