
import { useParams, Link } from "react-router-dom";
import { useSites } from "@/hooks/useSites";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, Star, ExternalLink } from "lucide-react";
import { useComments } from "@/hooks/useSites";

export default function SiteDetails() {
  const { id } = useParams<{ id: string }>();
  const { sites } = useSites();
  const site = sites.find((s) => s.id === id);
  const { comments } = useComments(id!);

  if (!site) return <div className="p-8 text-center">Site not found.</div>;

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
          <div className="mt-6">
            <h3 className="font-semibold mb-2">All Reviews</h3>
            {comments.length === 0 && <div className="text-muted-foreground">No reviews yet.</div>}
            <div className="space-y-3">
              {comments.map((comment) => (
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
