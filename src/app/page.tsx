import React from 'react';
import { Menu, Search, User, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function MainBoard() {
  return (
    <div className="min-h-screen bg-slate-50 flex justify-center font-sans">
      {/* Main Container - Max width controls the overall stretch */}
      <div className="w-full max-w-[1400px] flex gap-6 p-4 md:p-6 items-start">

        {/* LEFT SIDEBAR: Sticky Navigation */}
        <aside className="hidden md:flex flex-col w-[250px] shrink-0 sticky top-6 gap-6">
          <Card className="rounded-2xl border-2 border-slate-200 shadow-sm">
            <CardContent className="p-6 flex flex-col gap-4">
              {/* User Profile Area */}
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="h-12 w-12 border-2 border-slate-200">
                  <AvatarImage src="" alt="User" />
                  <AvatarFallback><User /></AvatarFallback>
                </Avatar>
                <div className="font-semibold text-lg">Name</div>
              </div>

              {/* Sub Menus */}
              <Button variant="outline" className="w-full justify-start rounded-xl border-2">Sub</Button>
              <Button variant="outline" className="w-full justify-start rounded-xl border-2">Sub</Button>
              <Button variant="outline" className="w-full justify-start rounded-xl border-2">Sub</Button>

              {/* Mobile Menu Trigger Placeholder (Visible on smaller screens usually) */}
              <Button variant="ghost" className="w-full justify-start mt-4 text-slate-500">
                <Menu className="mr-2 h-5 w-5" />
                Hamburger Menu
              </Button>
            </CardContent>
          </Card>
        </aside>

        {/* MIDDLE: Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 gap-6">

          {/* Top Horizontal Scroll: Categories */}
          {/* Note: 'scrollbar-hide' requires a plugin, or you can use custom CSS to hide the scrollbar */}
          <div className="flex overflow-x-auto pb-2 gap-4 snap-x w-full">
            {['Announcements', 'Urgent', 'Lost & Found', 'Community', 'Community'].map((item, i) => (
              <Card key={i} className="shrink-0 w-[120px] h-[100px] rounded-2xl border-2 border-slate-200 shadow-sm snap-start cursor-pointer hover:bg-slate-50 transition-colors flex items-center justify-center text-center p-2 font-medium">
                {item}
              </Card>
            ))}
          </div>

          {/* Vertical Feed: Posts Area */}
          <div className="flex flex-col gap-6">
            {/* Standard Post */}
            <Card className="rounded-3xl border-2 border-slate-200 shadow-sm cursor-pointer hover:border-slate-300 transition-colors min-h-[300px] flex items-center justify-center">
              <CardContent>
                <h2 className="text-2xl font-bold text-slate-400">Posts</h2>
              </CardContent>
            </Card>

            {/* Buy & Sell Post */}
            <Card className="rounded-3xl border-2 border-slate-200 shadow-sm cursor-pointer hover:border-slate-300 transition-colors min-h-[250px] flex items-center justify-center">
              <CardContent>
                <h2 className="text-2xl font-bold text-slate-400">Buy & Sell Post</h2>
              </CardContent>
            </Card>
          </div>
        </main>

        {/* RIGHT SIDEBAR: Sticky Tools & Ads */}
        <aside className="hidden lg:flex flex-col w-[300px] shrink-0 sticky top-6 gap-6">

          {/* Search & Filter */}
          <Card className="rounded-3xl border-2 border-slate-200 shadow-sm">
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input placeholder="Search" className="pl-9 rounded-xl border-2" />
              </div>
              <Button variant="ghost" className="w-full justify-start text-slate-600">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </CardContent>
          </Card>

          {/* Advertisement Block */}
          <Card className="rounded-3xl border-2 border-slate-200 shadow-sm min-h-[300px] flex items-center justify-center text-center p-6 bg-slate-100">
            <CardContent>
              <h3 className="text-xl font-black tracking-widest text-slate-400 break-words">
                $$$$$$$ADVERTISEMENTS$$$$$$$
              </h3>
            </CardContent>
          </Card>

        </aside>

      </div>
    </div>
  );
}