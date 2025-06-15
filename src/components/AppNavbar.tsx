
import React from "react";
import { Search, User, Bell, Gift, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const AppNavbar = () => (
  <header className="sticky top-0 z-40 bg-dim-green shadow-lg py-2 px-2 sm:px-6 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <Button variant="ghost" size="icon" className="sm:hidden text-white">
        <Menu />
      </Button>
      <Link to="/home" className="flex items-center gap-2">
        <img src="/favicon.ico" alt="App Logo" className="w-8 h-8 rounded-full bg-accent" />
        <span className="text-lg sm:text-xl font-bold text-white tracking-wider">CashRewards</span>
      </Link>
    </div>
    <div className="hidden sm:flex min-w-[300px] max-w-lg flex-1 mx-8"><SearchBar /></div>
    <div className="flex items-center gap-1 sm:gap-3">
      <Button variant="ghost" className="text-white hover:bg-dim-green-dark" size="icon">
        <Gift />
      </Button>
      <Button variant="ghost" className="text-white hover:bg-dim-green-dark" size="icon">
        <Bell />
      </Button>
      <Button variant="ghost" className="text-white hover:bg-dim-green-dark" size="icon">
        <User />
      </Button>
    </div>
  </header>
);

import SearchBar from "./SearchBar";
export default AppNavbar;
