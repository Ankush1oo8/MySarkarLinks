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
import { Site, useComments, Comment } from "@/hooks/useSites";

interface UpdatedGovSiteCardProps {
  site: Site;
}

export const UpdatedGovSiteCard = ({ site }: UpdatedGovSiteCardProps) => {
  const { user } = useAuth();
  // Restore comment stats for like/dislike/total reviews
  // Use useComments to get stats, but do not show review list or form
  const { comments } = useComments(site.id);
  const positiveComments = comments.filter((c: Comment) => c.rating === "positive").length;
  const negativeComments = comments.filter((c: Comment) => c.rating === "negative").length;

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
        </CardContent>
        <CardFooter className="flex gap-2 mt-2">
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