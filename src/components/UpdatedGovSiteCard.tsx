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
  const { user } = useAuth();
  const { comments } = useComments(site.id);

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

      </CardContent>


      <CardFooter className="flex gap-2">
        <Button asChild className="flex-1" onClick={e => { e.stopPropagation(); }}>
          <a href={site.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Visit Site
          </a>
        </Button>
        {user && (
          <Button variant="outline" className="pointer-events-none opacity-80">
            <MessageSquare className="h-4 w-4 mr-2" />
            Add Review
          </Button>
        )}
      </CardFooter>
    </Card>
    </Link>
  );
};