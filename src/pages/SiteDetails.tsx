
import { useParams, Link } from "react-router-dom";
import { useSites } from "@/hooks/useSites";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, Star, ExternalLink } from "lucide-react";
import { useComments } from "@/hooks/useSites";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


export default function SiteDetails() {
  const { id } = useParams<{ id: string }>();
  const { sites } = useSites();
  const site = sites.find((s) => s.id === id);
  const { comments, addComment, refetch } = useComments(id!);
  const { user } = useAuth();
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [selectedRating, setSelectedRating] = useState<"positive" | "negative" | "neutral">("neutral");
  const [authorName, setAuthorName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!site) return <div className="p-8 text-center">Site not found.</div>;

  const handleSubmitComment = async () => {
    if (!user) return;
    if (!commentText.trim() || !authorName.trim()) return;
    setSubmitting(true);
    await addComment(site.id, commentText.trim(), selectedRating, authorName.trim());
    setCommentText("");
    setAuthorName("");
    setSelectedRating("neutral");
    setIsCommenting(false);
    setSubmitting(false);
    refetch();
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>{site.title}</CardTitle>
          <Badge className="ml-2">{site.category}</Badge>
          <CardDescription className="mt-2">{site.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <a href={site.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline flex items-center gap-1">
            <ExternalLink className="h-4 w-4" />
            {site.url}
          </a>

          {/* Add Review Button & Form */}
          <div className="mt-8">
            {user ? (
              isCommenting ? (
                <div className="space-y-3 border rounded-lg p-4 bg-muted/50 mb-6">
                  <div>
                    <Label className="text-sm font-medium">Your Name</Label>
                    <Input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      className="mt-1"
                      placeholder="Enter your name"
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
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSubmitComment} disabled={submitting || !commentText.trim() || !authorName.trim()}>
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

          <div className="mt-6">
            <h3 className="font-semibold mb-2">All Reviews</h3>
            {comments.length === 0 && <div className="text-muted-foreground">No reviews yet.</div>}
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="border rounded-lg p-3 text-sm bg-background">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{comment.author_name}</span>
                    <div className="flex items-center gap-1">
                      {comment.rating === "positive" && <ThumbsUp className="h-3 w-3 text-green-600" />}
                      {comment.rating === "negative" && <ThumbsDown className="h-3 w-3 text-red-600" />}
                      {comment.rating === "neutral" && <Star className="h-3 w-3 text-muted-foreground" />}
                    </div>
                  </div>
                  <p className="text-muted-foreground">{comment.content}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Link to="/" className="text-blue-600 underline">← Back to all sites</Link>
        </CardFooter>
      </Card>
    </div>
  );
}
