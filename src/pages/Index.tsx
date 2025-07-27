import { useState, useMemo } from "react";
import { UpdatedGovSiteCard } from "@/components/UpdatedGovSiteCard";
import { SearchAndFilter } from "@/components/SearchAndFilter";
import { useSites } from "@/hooks/useSites";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flag, Users, ExternalLink, MessageSquare, LogOut, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useComments } from "@/hooks/useComments";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addSite } from "@/hooks/useSites";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { sites, loading } = useSites();
  const { user, signOut, isAdmin } = useAuth();
  const { comments: reviews, loading: loadingReviews } = useComments();
  const [suggestModalOpen, setSuggestModalOpen] = useState(false);
  const [suggestForm, setSuggestForm] = useState({
    title: "",
    url: "",
    description: "",
    category: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
  };

  const handleSuggestClick = () => {
    if (!user) {
      navigate('/auth');
    } else {
      setSuggestModalOpen(true);
    }
  };

  const filteredSites = useMemo(() => {
    return sites.filter(site => {
      const matchesSearch = site.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          site.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || site.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [sites, searchTerm, selectedCategory]);

  // Get unique categories from sites
  const categories = Array.from(new Set(sites.map(site => site.category))).sort();

  // Calculate stats
  const totalReviews = reviews.length;
  const positiveReviews = reviews.filter(r => r.rating === "positive").length;

  // Placeholder for submit handler (to be implemented)
  const handleSuggestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const authorName = user?.user_metadata?.display_name || user?.email || undefined;
    const authorEmail = user?.email || undefined;
    const result = await addSite(suggestForm, authorName, authorEmail);
    setSubmitting(false);
    if (result.success) {
      toast({
        title: "Site Submitted",
        description: "Your suggestion has been submitted and is awaiting admin approval.",
      });
      setSuggestModalOpen(false);
      setSuggestForm({ title: "", url: "", description: "", category: "" });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to submit site.",
        variant: "destructive",
      });
    }
  };

  if (loading || loadingReviews) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading government websites...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg">
                <Flag className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  India Government Portal Directory
                </h1>
                <p className="text-muted-foreground">
                  Your gateway to all government websites with community reviews
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="hidden sm:flex">
                🇮🇳 For Indian Citizens
              </Badge>
              <Button 
                variant="default"
                size="sm"
                onClick={handleSuggestClick}
              >
                + Suggest a Site
              </Button>
              {user ? (
                <>
                  {isAdmin && (
                    <Button asChild variant="outline" size="sm">
                      <Link to="/admin">
                        <Settings className="h-4 w-4 mr-2" />
                        Admin
                      </Link>
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button asChild size="sm">
                  <Link to="/auth">Sign In</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="bg-muted/50 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <ExternalLink className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{sites.length}</div>
                <div className="text-sm text-muted-foreground">Government Websites</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <MessageSquare className="h-8 w-8 text-accent mx-auto mb-2" />
                <div className="text-2xl font-bold">{totalReviews}</div>
                <div className="text-sm text-muted-foreground">Community Reviews</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{positiveReviews}</div>
                <div className="text-sm text-muted-foreground">Positive Reviews</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Badge className="h-8 w-8 text-blue-600 mx-auto mb-2 flex items-center justify-center text-xs">
                  {categories.length}
                </Badge>
                <div className="text-2xl font-bold">{categories.length}</div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="mb-8">
          <SearchAndFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            categories={categories}
            totalSites={sites.length}
            filteredCount={filteredSites.length}
          />
        </div>

        {/* Sites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSites.map((site) => (
            <UpdatedGovSiteCard key={site.id} site={site} />
          ))}
        </div>

        {filteredSites.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No websites found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50 py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            Help fellow citizens by sharing your experience with government websites.
            <br />
            Together, we can make government services more accessible and user-friendly.
          </p>
          <div className="mt-4 flex justify-center space-x-4 text-sm">
            <Badge variant="outline">🤝 Community Driven</Badge>
            <Badge variant="outline">{user ? "👤 Signed In" : "🔒 Sign In to Review"}</Badge>
            <Badge variant="outline">🇮🇳 Made for India</Badge>
          </div>
        </div>
      </footer>

      {/* Suggest a Site Modal */}
      <Dialog open={suggestModalOpen} onOpenChange={setSuggestModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Suggest a New Government Site</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSuggestSubmit} className="space-y-4">
            <div>
              <Label htmlFor="suggest-title">Site Title</Label>
              <Input
                id="suggest-title"
                value={suggestForm.title}
                onChange={e => setSuggestForm(f => ({ ...f, title: e.target.value }))}
                required
                disabled={!user}
              />
            </div>
            <div>
              <Label htmlFor="suggest-url">Website URL</Label>
              <Input
                id="suggest-url"
                type="url"
                value={suggestForm.url}
                onChange={e => setSuggestForm(f => ({ ...f, url: e.target.value }))}
                required
                disabled={!user}
              />
            </div>
            <div>
              <Label htmlFor="suggest-category">Category</Label>
              <Select value={suggestForm.category} onValueChange={value => setSuggestForm(f => ({ ...f, category: value }))} required disabled={!user}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="suggest-description">Description</Label>
              <Textarea
                id="suggest-description"
                value={suggestForm.description}
                onChange={e => setSuggestForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                required
                disabled={!user}
              />
            </div>
            {!user && (
              <div className="text-xs text-destructive font-medium">Sign in to suggest a site.</div>
            )}
            {user && (
              <div className="text-xs text-muted-foreground">Submitting as: <span className="font-medium">{user.user_metadata?.display_name || user.email}</span></div>
            )}
            <DialogFooter className="mt-4">
              <Button type="submit" className="w-full" disabled={submitting || !user}>{submitting ? "Submitting..." : "Submit Suggestion"}</Button>
              <DialogClose asChild>
                <Button variant="outline" className="w-full mt-2" type="button">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;