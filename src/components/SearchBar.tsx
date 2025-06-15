
import React from "react";
import { Search } from "lucide-react";

const SearchBar = () => (
  <div className="relative w-full">
    <input
      type="text"
      placeholder="Search for brands, offers or products…"
      className="w-full bg-dim-green-muted pl-10 pr-4 py-2 rounded-lg outline-none border border-dim-green-light focus:border-dim-green-dark text-gray-800 placeholder:text-gray-400 transition"
    />
    <Search className="absolute left-2 top-2.5 w-5 h-5 text-dim-green" />
  </div>
);

export default SearchBar;
