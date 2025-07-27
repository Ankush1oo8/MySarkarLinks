import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Site {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  status: string;
  created_at: string;
  updated_at: string;
  author_name?: string;
  author_email?: string;
}

export interface Comment {
  id: string;
  site_id: string;
  user_id: string;
  author_name: string;
  content: string;
  rating: 'positive' | 'negative' | 'neutral';
  status: string;
  created_at: string;
  updated_at: string;
}

export const useSites = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSites = async () => {
    try {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSites(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch sites",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  return {
    sites,
    loading,
    refetch: fetchSites
  };
};

// Add a function to add a new site as pending
export const addSite = async (
  site: { title: string; url: string; description: string; category: string },
  authorName?: string,
  authorEmail?: string
) => {
  try {
    const { error } = await supabase
      .from('sites')
      .insert({
        ...site,
        status: 'pending',
        author_name: authorName,
        author_email: authorEmail,
      });
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const useComments = (siteId?: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchComments = async () => {
    if (!siteId) return;
    
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('site_id', siteId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch comments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (siteId: string, content: string, rating: Comment['rating'], authorName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('comments')
        .insert({
          site_id: siteId,
          user_id: user.id,
          author_name: authorName,
          content,
          rating,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Comment Added",
        description: "Your comment has been submitted and is awaiting approval.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchComments();
  }, [siteId]);

  return {
    comments,
    loading,
    addComment,
    refetch: fetchComments
  };
};