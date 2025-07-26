import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Site, Comment } from "@/hooks/useSites";
import { Plus, Check, X, ExternalLink, ThumbsUp, ThumbsDown, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Admin = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [pendingComments, setPendingComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSite, setNewSite] = useState({
    title: "",
    url: "",
    description: "",
    category: "",
  });
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!isAdmin) {
      navigate("/");
      return;
    }
    fetchData();
  }, [user, isAdmin, navigate]);

  const fetchData = async () => {
    try {
      // Fetch all sites (including inactive)
      const { data: sitesData, error: sitesError } = await supabase
        .from('sites')
        .select('*')
        .order('created_at', { ascending: false });

      if (sitesError) throw sitesError;
      setSites(sitesData || []);

      // Fetch pending comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;
      setPendingComments(commentsData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch admin data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSite.title || !newSite.url || !newSite.description || !newSite.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('sites')
        .insert({
          ...newSite,
          created_by: user?.id,
          status: 'active'
        });

      if (error) throw error;

      toast({
        title: "Site Added",
        description: "New government site has been added successfully.",
      });

      setNewSite({ title: "", url: "", description: "", category: "" });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to add site",
        variant: "destructive",
      });
    }
  };

  const handleCommentAction = async (commentId: string, action: 'approve' | 'reject') => {
    try {
      const status = action === 'approve' ? 'approved' : 'rejected';
      const { error } = await supabase
        .from('comments')
        .update({ status })
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: `Comment ${action}d`,
        description: `The comment has been ${action}d successfully.`,
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to ${action} comment`,
        variant: "destructive",
      });
    }
  };

  const handleToggleSiteStatus = async (siteId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const { error } = await supabase
        .from('sites')
        .update({ status: newStatus })
        .eq('id', siteId);

      if (error) throw error;

      toast({
        title: "Site Updated",
        description: `Site has been ${newStatus === 'active' ? 'activated' : 'deactivated'}.`,
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update site status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="p-8">Loading admin panel...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      
      <Tabs defaultValue="sites" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sites">Manage Sites</TabsTrigger>
          <TabsTrigger value="comments">
            Review Comments 
            {pendingComments.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingComments.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="add-site">Add New Site</TabsTrigger>
        </TabsList>

        <TabsContent value="sites" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Sites</CardTitle>
              <CardDescription>Manage government websites in the directory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sites.map((site) => (
                  <div key={site.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{site.title}</h3>
                          <Badge variant={site.status === 'active' ? 'default' : 'secondary'}>
                            {site.status}
                          </Badge>
                          <Badge variant="outline">{site.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{site.description}</p>
                        <a 
                          href={site.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                        >
                          {site.url} <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleSiteStatus(site.id, site.status)}
                        >
                          {site.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Comments</CardTitle>
              <CardDescription>Review and moderate user comments</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingComments.length === 0 ? (
                <p className="text-muted-foreground">No pending comments to review.</p>
              ) : (
                <div className="space-y-4">
                  {pendingComments.map((comment) => {
                    const site = sites.find(s => s.id === comment.site_id);
                    return (
                      <div key={comment.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{comment.author_name}</span>
                              <div className="flex items-center gap-1">
                                {comment.rating === "positive" && <ThumbsUp className="h-4 w-4 text-green-600" />}
                                {comment.rating === "negative" && <ThumbsDown className="h-4 w-4 text-red-600" />}
                                {comment.rating === "neutral" && <Star className="h-4 w-4 text-muted-foreground" />}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              On: {site?.title || 'Unknown Site'}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleCommentAction(comment.id, 'approve')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleCommentAction(comment.id, 'reject')}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add-site">
          <Card>
            <CardHeader>
              <CardTitle>Add New Government Site</CardTitle>
              <CardDescription>Add a new government website to the directory</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddSite} className="space-y-4">
                <div>
                  <Label htmlFor="title">Site Title</Label>
                  <Input
                    id="title"
                    value={newSite.title}
                    onChange={(e) => setNewSite({ ...newSite, title: e.target.value })}
                    placeholder="e.g., Ministry of Finance"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="url">Website URL</Label>
                  <Input
                    id="url"
                    type="url"
                    value={newSite.url}
                    onChange={(e) => setNewSite({ ...newSite, url: e.target.value })}
                    placeholder="https://example.gov.in"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={newSite.category} onValueChange={(value) => setNewSite({ ...newSite, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General Services">General Services</SelectItem>
                      <SelectItem value="Citizen Engagement">Citizen Engagement</SelectItem>
                      <SelectItem value="Leadership">Leadership</SelectItem>
                      <SelectItem value="Security & Administration">Security & Administration</SelectItem>
                      <SelectItem value="Finance & Economics">Finance & Economics</SelectItem>
                      <SelectItem value="Foreign Affairs">Foreign Affairs</SelectItem>
                      <SelectItem value="Defence">Defence</SelectItem>
                      <SelectItem value="Transportation">Transportation</SelectItem>
                      <SelectItem value="Health & Welfare">Health & Welfare</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Agriculture">Agriculture</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Environment">Environment</SelectItem>
                      <SelectItem value="Employment">Employment</SelectItem>
                      <SelectItem value="Social Welfare">Social Welfare</SelectItem>
                      <SelectItem value="Urban Development">Urban Development</SelectItem>
                      <SelectItem value="Energy">Energy</SelectItem>
                      <SelectItem value="Data & Analytics">Data & Analytics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newSite.description}
                    onChange={(e) => setNewSite({ ...newSite, description: e.target.value })}
                    placeholder="Brief description of the website's purpose and services..."
                    rows={3}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Site
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};