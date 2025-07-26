
import { useParams, Link } from "react-router-dom";
import { useSites } from "@/hooks/useSites";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, Star, ExternalLink, MessageSquare } from "lucide-react";
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

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card className="shadow-xl border-2 border-primary/20 bg-white/90">
        {/* Banner or placeholder image */}
        <div className="h-32 w-full bg-gradient-to-r from-blue-200 to-blue-400 rounded-t-lg flex items-center justify-center mb-2">
          <span className="text-3xl font-bold text-primary drop-shadow">{site.title}</span>
        </div>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="text-xs px-2 py-1 bg-primary/10 text-primary border-primary/30">{site.category}</Badge>
            <a href={site.url} target="_blank" rel="noopener noreferrer" className="ml-auto text-blue-600 underline flex items-center gap-1 text-xs">
              <ExternalLink className="h-4 w-4" />
              Visit Site
            </a>
          </div>
          <CardDescription className="mt-1 text-base text-muted-foreground">{site.description}</CardDescription>
        </CardHeader>
        {/* Stats row */}
        <div className="flex items-center justify-between px-6 py-2 bg-muted/40 rounded-lg mx-4 mt-2 mb-4 shadow-sm">
          <div className="flex items-center gap-2 text-green-700 font-medium">
            <ThumbsUp className="h-4 w-4" /> {positiveComments} Likes
          </div>
          <div className="flex items-center gap-2 text-red-600 font-medium">
            <ThumbsDown className="h-4 w-4" /> {negativeComments} Dislikes
          </div>
          <div className="flex items-center gap-2 text-blue-700 font-medium">
            <MessageSquare className="h-4 w-4" /> {comments.length} Reviews
          </div>
        </div>
        <CardContent>
          {/* Add Review Button & Form */}
          <div className="mt-4">
            {user ? (
              isCommenting ? (
                <div className="space-y-3 border rounded-lg p-4 bg-muted/50 mb-6">
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
                        className="flex items-center gap-1"
                      >
                        <ThumbsUp className="h-3 w-3" /> Good
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedRating === "neutral" ? "default" : "outline"}
                        onClick={() => setSelectedRating("neutral")}
                        className="flex items-center gap-1"
                      >
                        <Star className="h-3 w-3" /> Neutral
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedRating === "negative" ? "default" : "outline"}
                        onClick={() => setSelectedRating("negative")}
                        className="flex items-center gap-1"
                      >
                        <ThumbsDown className="h-3 w-3" /> Poor
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSubmitComment} disabled={submitting || !commentText.trim()}>
                      {submitting ? "Submitting..." : "Submit Review"}
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
          <div className="mt-8">
            <h3 className="font-semibold mb-2 text-lg border-b pb-1">All Reviews</h3>
            {comments.length === 0 && <div className="text-muted-foreground">No reviews yet.</div>}
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="border rounded-lg p-3 text-sm bg-background shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-primary">{comment.author_name}</span>
                    <div className="flex items-center gap-1">
                      {comment.rating === "positive" && <ThumbsUp className="h-3 w-3 text-green-600" />}
                      {comment.rating === "negative" && <ThumbsDown className="h-3 w-3 text-red-600" />}
                      {comment.rating === "neutral" && <Star className="h-3 w-3 text-muted-foreground" />}
                    </div>
                  </div>
                  <p className="text-muted-foreground italic">{comment.content}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center bg-muted/40 rounded-b-lg mt-2">
          <Link to="/" className="text-blue-600 underline">← Back to all sites</Link>
        </CardFooter>
      </Card>
    </div>
  );
}
