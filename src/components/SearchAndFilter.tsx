import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";

interface SearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  totalSites: number;
  filteredCount: number;
}

export const SearchAndFilter = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  totalSites,
  filteredCount
}: SearchAndFilterProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const clearFilters = () => {
    onSearchChange("");
    onCategoryChange("all");
  };

  const hasActiveFilters = searchTerm || selectedCategory !== "all";

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search government websites..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters} size="icon">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {filteredCount} of {totalSites} government websites
        </div>
        
        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            <span>Active filters:</span>
            {searchTerm && (
              <Badge variant="secondary" className="text-xs">
                Search: "{searchTerm}"
              </Badge>
            )}
            {selectedCategory !== "all" && (
              <Badge variant="secondary" className="text-xs">
                Category: {selectedCategory}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
};