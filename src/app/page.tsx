'use client';
import React, { useState } from 'react';
import { Menu, Search, User, Filter, ArrowLeft, ThumbsUp, ThumbsDown, MessageCircle, CornerDownRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// ─── Types ───────────────────────────────────────────────────────────────────
interface Comment {
  id: number;
  author: string;
  text: string;
  votes: number;
  replies?: Comment[];
}
interface Post {
  id: number;
  title: string;
  body: string;
  image?: string;
  votes: number;
  commentCount: number;
  comments: Comment[];
}
// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_POSTS: Post[] = [
  {
    id: 1,
    title: 'Barangay Fiesta Road Closure This Weekend',
    body: 'Please be advised that Rizal Avenue will be closed from 6 AM to 10 PM on Saturday and Sunday due to the annual Barangay Fiesta celebration. Alternative routes are available via Mabini Street and Bonifacio Road. Plan your commutes accordingly and enjoy the festivities!',
    votes: 7600,
    commentCount: 1700,
    comments: [
      {
        id: 1, author: 'JuanD', text: 'Thanks for the heads up! Will definitely use the alternate route.', votes: 546, replies: [
          { id: 4, author: 'MariaC', text: 'Same, Mabini is always faster anyway haha.', votes: 120 },
        ]
      },
      { id: 2, author: 'PedroPa', text: 'Is there any parking near the venue? Asking for my lola.', votes: 312 },
      { id: 3, author: 'AnaR', text: 'So excited for the street food! 🎉', votes: 203 },
    ],
  },
  {
    id: 2,
    title: 'Lost: Black Labrador with Red Collar near Purok 3',
    body: 'Our dog Bruno went missing yesterday evening near the basketball court in Purok 3. He is a 2-year-old black Labrador wearing a red collar with a tag. He is friendly and responds to his name. If found, please contact 0912-345-6789. Reward offered. We miss him dearly.',
    votes: 2100,
    commentCount: 430,
    comments: [
      { id: 1, author: 'NeighborA', text: 'I saw a dog matching that description near the market this morning!', votes: 546 },
      { id: 2, author: 'NeighborB', text: 'Sharing this on our group chat now! Hope Bruno gets home safe.', votes: 211 },
    ],
  },
];
// ─── Sub-components ───────────────────────────────────────────────────────────
function VotePill({ votes, size = 'md' }: { votes: number; size?: 'sm' | 'md' }) {
  const [vote, setVote] = useState<1 | -1 | 0>(0);
  const displayed = votes + vote;
  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
  const iconCls = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  const textCls = size === 'sm' ? 'text-xs' : 'text-sm';
  return (
    <span className="inline-flex items-center gap-1 bg-slate-800 text-white rounded-full px-3 py-1 select-none">
      <button onClick={() => setVote(v => v === 1 ? 0 : 1)} className={`${vote === 1 ? 'text-orange-400' : 'text-white'} hover:text-orange-300 transition-colors`}>
        <ThumbsUp className={iconCls} />
      </button>
      <span className={`font-semibold ${textCls}`}>{fmt(displayed)}</span>
      <button onClick={() => setVote(v => v === -1 ? 0 : -1)} className={`${vote === -1 ? 'text-blue-400' : 'text-white'} hover:text-blue-300 transition-colors`}>
        <ThumbsDown className={iconCls} />
      </button>
    </span>
  );
}
function CommentNode({ comment, depth = 0 }: { comment: Comment; depth?: number }) {
  const [replying, setReplying] = useState(false);
  return (
    <div className={`flex flex-col gap-2 ${depth > 0 ? 'ml-6 pl-4 border-l-2 border-slate-200' : ''}`}>
      <Card className="rounded-2xl border-2 border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="h-7 w-7 border border-slate-200">
              <AvatarFallback className="text-xs bg-slate-100">{comment.author[0]}</AvatarFallback>
            </Avatar>
            <span className="font-semibold text-sm text-slate-700">{comment.author}</span>
          </div>
          <p className="text-slate-600 text-sm mb-3 leading-relaxed">{comment.text}</p>
          <div className="flex items-center gap-2">
            <VotePill votes={comment.votes} size="sm" />
            <button
              onClick={() => setReplying(r => !r)}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors font-medium bg-slate-100 hover:bg-slate-200 rounded-full px-3 py-1"
            >
              <CornerDownRight className="h-3 w-3" />
              Reply
            </button>
          </div>
          {replying && (
            <div className="mt-3 flex gap-2">
              <Input placeholder="Write a reply…" className="rounded-xl border-2 text-sm" autoFocus />
              <Button size="sm" className="rounded-xl shrink-0">Post</Button>
            </div>
          )}
        </CardContent>
      </Card>
      {comment.replies?.map(reply => (
        <CommentNode key={reply.id} comment={reply} depth={depth + 1} />
      ))}
    </div>
  );
}
// ─── Thread Detail View ───────────────────────────────────────────────────────
function ThreadView({ post, onBack }: { post: Post; onBack: () => void }) {
  return (
    <div className="flex-1 flex flex-col min-w-0 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Thread Title Row */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full border-2 border-slate-200 shrink-0 hover:bg-slate-100">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="rounded-2xl border-2 border-slate-200 bg-white px-5 py-3 flex-1 font-bold text-lg text-slate-800 shadow-sm">
          {post.title}
        </div>
      </div>
      <div className="flex gap-6 items-start">
        {/* Thread Body + Comments */}
        <div className="flex-1 flex flex-col gap-5 min-w-0">
          {/* Thread Body Card */}
          <Card className="rounded-3xl border-2 border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <p className="text-slate-700 leading-relaxed mb-5">{post.body}</p>
              <div className="flex items-center gap-3">
                <VotePill votes={post.votes} />
                <span className="inline-flex items-center gap-1.5 text-sm text-white bg-slate-800 rounded-full px-3 py-1 font-semibold">
                  <MessageCircle className="h-4 w-4" />
                  {post.commentCount >= 1000 ? `${(post.commentCount / 1000).toFixed(1)}K` : post.commentCount}
                </span>
              </div>
            </CardContent>
          </Card>
          {/* Comments Section */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-slate-700 text-base">
              Comments ({post.commentCount.toLocaleString()})
            </h3>
            {/* New Comment Input */}
            <div className="flex gap-2">
              <Input placeholder="Add a comment…" className="rounded-xl border-2" />
              <Button className="rounded-xl shrink-0">Post</Button>
            </div>
            {/* Threaded Comments */}
            {post.comments.map(comment => (
              <CommentNode key={comment.id} comment={comment} />
            ))}
          </div>
        </div>
        {/* Right Filter Panel */}
        <aside className="hidden lg:flex flex-col w-[260px] shrink-0 sticky top-6 gap-4">
          <Card className="rounded-3xl border-2 border-slate-200 shadow-sm">
            <CardContent className="p-5 flex flex-col gap-3">
              <h4 className="font-bold text-slate-700 flex items-center gap-2">
                <Filter className="h-4 w-4" /> Filter
              </h4>
              {['Top', 'New', 'Hot', 'Rising'].map(f => (
                <Button key={f} variant="outline" className="w-full justify-start rounded-xl border-2 text-slate-600">
                  {f}
                </Button>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
// ─── Post Feed ─────────────────────────────────────────────────────────────────
function PostCard({ post, onClick }: { post: Post; onClick: () => void }) {
  return (
    <Card
      onClick={onClick}
      className="rounded-3xl border-2 border-slate-200 shadow-sm cursor-pointer hover:border-slate-400 hover:shadow-md transition-all duration-200 group"
    >
      <CardContent className="p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-slate-900">{post.title}</h2>
        <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-4">{post.body}</p>
        <div className="flex items-center gap-3">
          <VotePill votes={post.votes} />
          <span className="inline-flex items-center gap-1.5 text-sm text-white bg-slate-700 rounded-full px-3 py-1 font-semibold">
            <MessageCircle className="h-4 w-4" />
            {post.commentCount >= 1000 ? `${(post.commentCount / 1000).toFixed(1)}K` : post.commentCount}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function MainBoard() {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  return (
    <div className="min-h-screen bg-slate-50 flex justify-center font-sans">
      <div className="w-full max-w-[1400px] flex gap-6 p-4 md:p-6 items-start">
        {/* LEFT SIDEBAR */}
        <aside className="hidden md:flex flex-col w-[250px] shrink-0 sticky top-6 gap-6">
          <Card className="rounded-2xl border-2 border-slate-200 shadow-sm">
            <CardContent className="p-6 flex flex-col gap-4">
              {/* User Profile */}
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="h-12 w-12 border-2 border-slate-200">
                  <AvatarImage src="" alt="User" />
                  <AvatarFallback><User /></AvatarFallback>
                </Avatar>
                <div className="font-semibold text-lg">Name</div>
              </div>
              <Button variant="outline" className="w-full justify-start rounded-xl border-2">Sub</Button>
              <Button variant="outline" className="w-full justify-start rounded-xl border-2">Sub</Button>
              <Button variant="outline" className="w-full justify-start rounded-xl border-2">Sub</Button>
              <Button variant="ghost" className="w-full justify-start mt-4 text-slate-500">
                <Menu className="mr-2 h-5 w-5" />
                Hamburger Menu
              </Button>
            </CardContent>
          </Card>
        </aside>
        {/* MAIN CONTENT */}
        {selectedPost ? (
          <ThreadView post={selectedPost} onBack={() => setSelectedPost(null)} />
        ) : (
          <main className="flex-1 flex flex-col min-w-0 gap-6">
            {/* Category Scroll */}
            <div className="flex overflow-x-auto pb-2 gap-4 snap-x w-full">
              {['Announcements', 'Urgent', 'Lost & Found', 'Community', 'Events'].map((item, i) => (
                <Card key={i} className="shrink-0 w-[120px] h-[100px] rounded-2xl border-2 border-slate-200 shadow-sm snap-start cursor-pointer hover:bg-slate-100 transition-colors flex items-center justify-center text-center p-2 font-medium text-sm">
                  {item}
                </Card>
              ))}
            </div>
            {/* Post Feed */}
            <div className="flex flex-col gap-6">
              {MOCK_POSTS.map(post => (
                <PostCard key={post.id} post={post} onClick={() => setSelectedPost(post)} />
              ))}
            </div>
          </main>
        )}
        {/* RIGHT SIDEBAR — only shown on feed */}
        {!selectedPost && (
          <aside className="hidden lg:flex flex-col w-[300px] shrink-0 sticky top-6 gap-6">
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
            <Card className="rounded-3xl border-2 border-slate-200 shadow-sm min-h-[300px] flex items-center justify-center text-center p-6 bg-slate-100">
              <CardContent>
                <h3 className="text-xl font-black tracking-widest text-slate-400 break-words">
                  $$$$$$$ADVERTISEMENTS$$$$$$$
                </h3>
              </CardContent>
            </Card>
          </aside>
        )}
      </div>
    </div>
  );
}