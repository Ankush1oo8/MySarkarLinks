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
import { Plus, Check, X, ExternalLink, ThumbsUp, ThumbsDown, Star, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

function Admin() {
  // State for delete confirmation dialogs
  const [deleteSiteId, setDeleteSiteId] = useState<string | null>(null);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);

  // Delete site handler
  const handleDeleteSite = async () => {
    if (!deleteSiteId) return;
    try {
      const { error } = await supabase.from('sites').delete().eq('id', deleteSiteId);
      if (error) throw error;
      toast({
        title: 'Site Deleted',
        description: 'The site has been deleted.',
      });
      setDeleteSiteId(null);
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete site',
        variant: 'destructive',
      });
    }
  };

  // Delete comment handler
  const handleDeleteComment = async () => {
    if (!deleteCommentId) return;
    try {
      const { error } = await supabase.from('comments').delete().eq('id', deleteCommentId);
      if (error) throw error;
      toast({
        title: 'Comment Deleted',
        description: 'The comment has been deleted.',
      });
      setDeleteCommentId(null);
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete comment',
        variant: 'destructive',
      });
    }
  };

  const [approvedComments, setApprovedComments] = useState<Comment[]>([]);
  const [editCommentModalOpen, setEditCommentModalOpen] = useState(false);
  const [editComment, setEditComment] = useState<Comment | null>(null);
  const [editCommentForm, setEditCommentForm] = useState<{ content: string; rating: "neutral" | "positive" | "negative" }>({ content: "", rating: "neutral" });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editSite, setEditSite] = useState<Site | null>(null);
  const [editForm, setEditForm] = useState({ title: "", url: "", description: "", category: "" });
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
  const [pendingSites, setPendingSites] = useState<Site[]>([]);

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
    // Fetch all active/inactive sites for Manage Sites
    const { data: sitesData, error: sitesError } = await supabase
      .from('sites')
      .select('*')
      .in('status', ['active', 'inactive'])
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

    // Fetch approved comments
    const { data: approvedData, error: approvedError } = await supabase
      .from('comments')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    if (approvedError) throw approvedError;
    setApprovedComments(approvedData || []);

    // Fetch pending sites for Pending Sites tab
    const { data: pendingSitesData, error: pendingSitesError } = await supabase
      .from('sites')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (pendingSitesError) throw pendingSitesError;
    setPendingSites(pendingSitesData || []);
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

// Move these functions outside fetchData
const openEditCommentModal = (comment: Comment) => {
  setEditComment(comment);
  setEditCommentForm({
    content: comment.content,
    rating: comment.rating,
  });
  setEditCommentModalOpen(true);
};

const handleEditCommentFormChange = (field: string, value: string) => {
  setEditCommentForm((prev) => ({ ...prev, [field]: value }));
};

const handleEditCommentSave = async () => {
  if (!editComment) return;
  if (!editCommentForm.content.trim()) {
    toast({
      title: "Missing Information",
      description: "Review content cannot be empty.",
      variant: "destructive",
    });
    return;
  }
  try {
    const { error } = await supabase
      .from('comments')
      .update({
        content: editCommentForm.content,
        rating: editCommentForm.rating,
      })
      .eq('id', editComment.id);
    if (error) throw error;
    toast({
      title: "Review Updated",
      description: "The review has been updated.",
    });
    setEditCommentModalOpen(false);
    setEditComment(null);
    fetchData();
  } catch (error: any) {
    toast({
      title: "Error",
      description: "Failed to update review",
      variant: "destructive",
    });
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

  const handlePendingSiteAction = async (siteId: string, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        const { error } = await supabase
          .from('sites')
          .update({ status: 'active' })
          .eq('id', siteId);
        if (error) throw error;
        toast({
          title: 'Site approved',
          description: 'The site has been approved and is now active.',
        });
      } else if (action === 'reject') {
        const { error } = await supabase
          .from('sites')
          .delete()
          .eq('id', siteId);
        if (error) throw error;
        toast({
          title: 'Site deleted',
          description: 'The site has been rejected and deleted.',
        });
      }
      await fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to ${action} site`,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="p-8">Loading admin panel...</div>;
  }

  const openEditModal = (site: Site) => {
    setEditSite(site);
    setEditForm({
      title: site.title,
      url: site.url,
      description: site.description,
      category: site.category,
    });
    setEditModalOpen(true);
  };

  const handleEditFormChange = (field: string, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditSiteSave = async () => {
    if (!editSite) return;
    if (!editForm.title || !editForm.url || !editForm.description || !editForm.category) {
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
        .update({
          title: editForm.title,
          url: editForm.url,
          description: editForm.description,
          category: editForm.category,
        })
        .eq('id', editSite.id);
      if (error) throw error;
      toast({
        title: "Site Updated",
        description: "Site details have been updated.",
      });
      setEditModalOpen(false);
      setEditSite(null);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update site",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      
      <Tabs defaultValue="sites" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="sites">Manage Sites</TabsTrigger>
          <TabsTrigger value="pending-sites">Pending Sites</TabsTrigger>
          <TabsTrigger value="comments">Review Comments 
            {pendingComments.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingComments.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved Reviews</TabsTrigger>
          <TabsTrigger value="add-site">Add New Site</TabsTrigger>
        </TabsList>
        <TabsContent value="pending-sites" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Sites</CardTitle>
              <CardDescription>Review and approve or reject new site suggestions</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingSites.length === 0 ? (
                <p className="text-muted-foreground">No pending sites found.</p>
              ) : (
                <div className="space-y-4">
                  {pendingSites.map((site) => (
                    <div key={site.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{site.title}</h3>
                            <Badge variant="secondary">Pending</Badge>
                            <Badge variant="outline">{site.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{site.description}</p>
                          <a href={site.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline inline-flex items-center gap-1">{site.url} <ExternalLink className="h-3 w-3" /></a>
                          {site.author_name && (
                            <div className="text-xs text-muted-foreground mt-2">Submitted by <span className="font-medium">{site.author_name}</span></div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <Button variant="default" size="sm" onClick={() => handlePendingSiteAction(site.id, 'approve')}>
                            Approve
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handlePendingSiteAction(site.id, 'reject')}>
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

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
                      <div className="flex flex-col gap-2 items-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleSiteStatus(site.id, site.status)}
                        >
                          {site.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openEditModal(site)}
                          className="flex items-center gap-1"
                        >
                          <Pencil className="h-4 w-4" /> Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteSiteId(site.id)}
                          className="flex items-center gap-1"
                        >
                          <X className="h-4 w-4" /> Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Edit Site Modal */}
                <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Edit Site Details</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="edit-title">Site Title</Label>
                        <Input
                          id="edit-title"
                          value={editForm.title}
                          onChange={e => handleEditFormChange('title', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-url">Website URL</Label>
                        <Input
                          id="edit-url"
                          type="url"
                          value={editForm.url}
                          onChange={e => handleEditFormChange('url', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-category">Category</Label>
                        <Select value={editForm.category} onValueChange={value => handleEditFormChange('category', value)}>
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
                        <Label htmlFor="edit-description">Description</Label>
                        <Textarea
                          id="edit-description"
                          value={editForm.description}
                          onChange={e => handleEditFormChange('description', e.target.value)}
                          rows={3}
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter className="mt-4">
                      <Button onClick={handleEditSiteSave} className="w-full">Save Changes</Button>
                      <DialogClose asChild>
                        <Button variant="outline" className="w-full mt-2" type="button">Cancel</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Review Comments</CardTitle>
              <CardDescription>Approve or reject comments that are pending</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingComments.length === 0 ? (
                <p className="text-muted-foreground">No pending comments found.</p>
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
                              variant="secondary"
                              onClick={() => openEditCommentModal(comment)}
                            >
                              <Pencil className="h-4 w-4 mr-1" /> Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setDeleteCommentId(comment.id)}
                            >
                              <X className="h-4 w-4 mr-1" /> Delete
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
      {/* Delete Approved Review Confirmation Dialog */}
      <Dialog open={!!deleteCommentId} onOpenChange={open => { if (!open) setDeleteCommentId(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete this review? This action cannot be undone.</div>
          <DialogFooter className="mt-4">
            <Button variant="destructive" onClick={handleDeleteComment} className="w-full">Delete</Button>
            <DialogClose asChild>
              <Button variant="outline" className="w-full mt-2" type="button" onClick={() => setDeleteCommentId(null)}>Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        {/* Edit Approved Review Modal */}
        <Dialog open={editCommentModalOpen} onOpenChange={setEditCommentModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Review</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-review-content">Review Content</Label>
                <Textarea
                  id="edit-review-content"
                  value={editCommentForm.content}
                  onChange={e => handleEditCommentFormChange('content', e.target.value)}
                  rows={3}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-review-rating">Rating</Label>
                <Select value={editCommentForm.rating} onValueChange={value => handleEditCommentFormChange('rating', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button onClick={handleEditCommentSave} className="w-full">Save Changes</Button>
              <DialogClose asChild>
                <Button variant="outline" className="w-full mt-2" type="button">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Approved Reviews</CardTitle>
              <CardDescription>Edit reviews that are already approved</CardDescription>
            </CardHeader>
            <CardContent>
              {approvedComments.length === 0 ? (
                <p className="text-muted-foreground">No approved reviews found.</p>
              ) : (
                <div className="space-y-4">
                  {approvedComments.map((comment) => {
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
                              variant="secondary"
                              onClick={() => openEditCommentModal(comment)}
                            >
                              <Pencil className="h-4 w-4 mr-1" /> Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setDeleteCommentId(comment.id)}
                            >
                              <X className="h-4 w-4 mr-1" /> Delete
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
      {/* Delete Approved Review Confirmation Dialog */}
      <Dialog open={!!deleteCommentId} onOpenChange={open => { if (!open) setDeleteCommentId(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete this review? This action cannot be undone.</div>
          <DialogFooter className="mt-4">
            <Button variant="destructive" onClick={handleDeleteComment} className="w-full">Delete</Button>
            <DialogClose asChild>
              <Button variant="outline" className="w-full mt-2" type="button" onClick={() => setDeleteCommentId(null)}>Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        {/* Edit Approved Review Modal */}
        <Dialog open={editCommentModalOpen} onOpenChange={setEditCommentModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Review</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-review-content">Review Content</Label>
                <Textarea
                  id="edit-review-content"
                  value={editCommentForm.content}
                  onChange={e => handleEditCommentFormChange('content', e.target.value)}
                  rows={3}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-review-rating">Rating</Label>
                <Select value={editCommentForm.rating} onValueChange={value => handleEditCommentFormChange('rating', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button onClick={handleEditCommentSave} className="w-full">Save Changes</Button>
              <DialogClose asChild>
                <Button variant="outline" className="w-full mt-2" type="button">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </TabsContent>
      </Tabs>
      {/* Delete Site Confirmation Dialog */}
      <Dialog open={!!deleteSiteId} onOpenChange={open => { if (!open) setDeleteSiteId(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Site</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete this site? This action cannot be undone.</div>
          <DialogFooter className="mt-4">
            <Button variant="destructive" onClick={handleDeleteSite} className="w-full">Delete</Button>
            <DialogClose asChild>
              <Button variant="outline" className="w-full mt-2" type="button" onClick={() => setDeleteSiteId(null)}>Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
export default Admin;
export { Admin };