import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ExternalLink, MessageSquare, ThumbsUp, ThumbsDown, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface Comment {
  id: string;
  author: string;
  content: string;
  rating: "positive" | "negative" | "neutral";
  timestamp: Date;
}

export interface GovSite {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  comments: Comment[];
  avgRating: number;
}

interface GovSiteCardProps {
  site: GovSite;
  onAddComment: (siteId: string, comment: Omit<Comment, "id" | "timestamp">) => void;
}

export const GovSiteCard = ({ site, onAddComment }: GovSiteCardProps) => {
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [selectedRating, setSelectedRating] = useState<"positive" | "negative" | "neutral">("neutral");
  const [authorName, setAuthorName] = useState("");
  const { toast } = useToast();

  const handleSubmitComment = () => {
    if (!commentText.trim() || !authorName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both your name and comment.",
        variant: "destructive",
      });
      return;
    }

    onAddComment(site.id, {
      author: authorName.trim(),
      content: commentText.trim(),
      rating: selectedRating,
    });

    setCommentText("");
    setAuthorName("");
    setSelectedRating("neutral");
    setIsCommenting(false);
    
    toast({
      title: "Comment Added",
      description: "Thank you for sharing your experience!",
    });
  };

  const positiveComments = site.comments.filter(c => c.rating === "positive").length;
  const negativeComments = site.comments.filter(c => c.rating === "negative").length;

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
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
            <ThumbsUp className="h-4 w-4 text-success" />
            <span>{positiveComments}</span>
          </div>
          <div className="flex items-center gap-1">
            <ThumbsDown className="h-4 w-4 text-destructive" />
            <span>{negativeComments}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>{site.comments.length} reviews</span>
          </div>
        </div>

        {site.comments.length > 0 && (
          <div className="space-y-3 mb-4">
            <h4 className="font-medium text-sm">Recent Reviews:</h4>
            {site.comments.slice(0, 2).map((comment) => (
              <div key={comment.id} className="border rounded-lg p-3 text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{comment.author}</span>
                  <div className="flex items-center gap-1">
                    {comment.rating === "positive" && <ThumbsUp className="h-3 w-3 text-success" />}
                    {comment.rating === "negative" && <ThumbsDown className="h-3 w-3 text-destructive" />}
                    {comment.rating === "neutral" && <Star className="h-3 w-3 text-muted-foreground" />}
                  </div>
                </div>
                <p className="text-muted-foreground">{comment.content}</p>
              </div>
            ))}
            {site.comments.length > 2 && (
              <p className="text-xs text-muted-foreground">
                +{site.comments.length - 2} more reviews
              </p>
            )}
          </div>
        )}

        {isCommenting && (
          <div className="space-y-3 border rounded-lg p-4 bg-muted/50">
            <div>
              <label className="text-sm font-medium">Your Name</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                placeholder="Enter your name"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Rating</label>
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
              <label className="text-sm font-medium">Your Experience</label>
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
        <Button asChild className="flex-1">
          <a href={site.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            Visit Site
          </a>
        </Button>
        {!isCommenting && (
          <Button variant="outline" onClick={() => setIsCommenting(true)}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Review
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};