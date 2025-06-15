
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search for offers, stores, categories...",
  className = ""
}) => {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
      <Input
        type="search"
        placeholder={placeholder}
        className="pl-12 pr-4 h-14 w-full rounded-full bg-white border-gray-200 shadow-sm focus:border-primary focus:ring-primary"
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default SearchBar;
