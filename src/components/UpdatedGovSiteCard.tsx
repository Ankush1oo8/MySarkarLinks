import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExternalLink, MessageSquare, ThumbsUp, ThumbsDown, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Site, Comment, useComments } from "@/hooks/useSites";

interface UpdatedGovSiteCardProps {
  site: Site;
}

export const UpdatedGovSiteCard = ({ site }: UpdatedGovSiteCardProps) => {
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [selectedRating, setSelectedRating] = useState<"positive" | "negative" | "neutral">("neutral");
  const [authorName, setAuthorName] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const { comments, addComment } = useComments(site.id);

  const handleSubmitComment = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to leave a comment.",
        variant: "destructive",
      });
      return;
    }

    if (!commentText.trim() || !authorName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both your name and comment.",
        variant: "destructive",
      });
      return;
    }

    await addComment(site.id, commentText.trim(), selectedRating, authorName.trim());

    setCommentText("");
    setAuthorName("");
    setSelectedRating("neutral");
    setIsCommenting(false);
  };

  const positiveComments = comments.filter(c => c.rating === "positive").length;
  const negativeComments = comments.filter(c => c.rating === "negative").length;

  return (
    <Link to={`/site/${site.id}`} style={{ textDecoration: 'none' }}>
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{site.title}</CardTitle>
            <CardDescription className="mt-2">{site.description}</CardDescription>
          </div>
          <Badge variant="secondary" className="ml-2 shrink-0">
            {site.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <ThumbsUp className="h-4 w-4 text-green-600" />
            <span>{positiveComments}</span>
          </div>
          <div className="flex items-center gap-1">
            <ThumbsDown className="h-4 w-4 text-red-600" />
            <span>{negativeComments}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>{comments.length} reviews</span>
          </div>
        </div>

        {comments.length > 0 && (
          <div className="space-y-3 mb-4">
            <h4 className="font-medium text-sm">Recent Reviews:</h4>
            {comments.slice(0, 2).map((comment) => (
              <div key={comment.id} className="border rounded-lg p-3 text-sm">
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
            {comments.length > 2 && (
              <p className="text-xs text-muted-foreground">
                +{comments.length - 2} more reviews
              </p>
            )}
          </div>
        )}

        {isCommenting && (
          <div className="space-y-3 border rounded-lg p-4 bg-muted/50">
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
                  <ThumbsUp className="h-3 w-3" />
                  Good
                </Button>
                <Button
                  size="sm"
                  variant={selectedRating === "neutral" ? "default" : "outline"}
                  onClick={() => setSelectedRating("neutral")}
                  className="flex items-center gap-1"
                >
                  <Star className="h-3 w-3" />
                  Neutral
                </Button>
                <Button
                  size="sm"
                  variant={selectedRating === "negative" ? "default" : "outline"}
                  onClick={() => setSelectedRating("negative")}
                  className="flex items-center gap-1"
                >
                  <ThumbsDown className="h-3 w-3" />
                  Poor
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
              <Button size="sm" onClick={handleSubmitComment}>
                Submit Review
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsCommenting(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button asChild className="flex-1" onClick={e => { e.stopPropagation(); }}>
          <a href={site.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Visit Site
          </a>
        </Button>
        {!isCommenting && user && (
          <Button variant="outline" onClick={e => { e.stopPropagation(); setIsCommenting(true); }}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Review
          </Button>
        )}
      </CardFooter>
    </Card>
    </Link>
  );
};