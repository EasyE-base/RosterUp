import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock Data for Blog Posts
const BLOG_POSTS = [
    {
        id: 1,
        title: "Surviving the Travel Ball Season: A Parent's Guide",
        excerpt: "From meal prepping to managing hotel stays, here are the essential tips every travel ball parent needs to know to keep their sanity intact.",
        category: "For Parents",
        author: "Sarah Jenkins",
        date: "Nov 15, 2023",
        readTime: "5 min read",
        image: "/blog-featured-hockey-dad.jpg",
        featured: true
    },
    {
        id: 2,
        title: "5 Drills to Improve Footwork at Home",
        excerpt: "No gym? No problem. These simple agility drills require minimal equipment and will help you stay sharp during the off-season.",
        category: "Training",
        author: "Coach Mike",
        date: "Nov 12, 2023",
        readTime: "4 min read",
        image: "https://images.unsplash.com/photo-1628779238951-be2c9f2a59f4?q=80&w=2787&auto=format&fit=crop",
        featured: false
    },
    {
        id: 3,
        title: "How to Ace Your Next Tryout",
        excerpt: "Scouts aren't just looking for skills—they're looking for attitude. Here's what you need to do to stand out from the crowd.",
        category: "For Athletes",
        author: "David Ross",
        date: "Nov 08, 2023",
        readTime: "6 min read",
        image: "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?q=80&w=2929&auto=format&fit=crop",
        featured: false
    },
    {
        id: 4,
        title: "Building a Championship Culture",
        excerpt: "Winning starts before the game begins. Learn how top organizations foster teamwork, discipline, and a winning mindset.",
        category: "For Coaches",
        author: "Coach Thompson",
        date: "Nov 05, 2023",
        readTime: "7 min read",
        image: "https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?q=80&w=2787&auto=format&fit=crop",
        featured: false
    },
    {
        id: 5,
        title: "The Future of Youth Sports Technology",
        excerpt: "From data analytics to video review, technology is changing the game. Here's how your team can leverage new tools to win.",
        category: "Technology",
        author: "Tech Team",
        date: "Nov 01, 2023",
        readTime: "5 min read",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2940&auto=format&fit=crop",
        featured: false
    },
    {
        id: 6,
        title: "Nutrition 101 for Young Athletes",
        excerpt: "Fueling your body is just as important as training. A simple guide to pre-game meals and post-game recovery.",
        category: "Health",
        author: "Dr. Emily Chen",
        date: "Oct 28, 2023",
        readTime: "4 min read",
        image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2906&auto=format&fit=crop",
        featured: false
    }
];

export default function Blog() {
    const featuredPost = BLOG_POSTS.find(post => post.featured);
    const regularPosts = BLOG_POSTS.filter(post => !post.featured);

    return (
        <div className="bg-white font-['-apple-system','BlinkMacSystemFont','SF_Pro_Display','Segoe_UI','Roboto','sans-serif']">

            {/* Header Section */}
            <section className="pt-32 pb-16 px-6 md:px-8 lg:px-12 bg-[rgb(251,251,253)]">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-bold text-[rgb(29,29,31)] mb-6 tracking-tight">
                            The Playbook
                        </h1>
                        <p className="text-xl text-[rgb(86,88,105)] max-w-2xl mx-auto">
                            Insights, stories, and tips for the entire youth sports community.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Featured Article */}
            {featuredPost && (
                <section className="px-6 md:px-8 lg:px-12 pb-20 bg-[rgb(251,251,253)]">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="group relative rounded-[2.5rem] overflow-hidden bg-white shadow-xl hover:shadow-2xl transition-all duration-500"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-2">
                                <div className="relative h-[400px] lg:h-auto overflow-hidden">
                                    <img
                                        src={featuredPost.image}
                                        alt={featuredPost.title}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute top-6 left-6">
                                        <span className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-[rgb(0,113,227)]">
                                            Featured
                                        </span>
                                    </div>
                                </div>
                                <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                                    <div className="flex items-center gap-4 text-sm text-[rgb(134,142,150)] mb-6">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {featuredPost.date}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {featuredPost.readTime}
                                        </span>
                                    </div>
                                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[rgb(29,29,31)] mb-6 leading-tight group-hover:text-[rgb(0,113,227)] transition-colors">
                                        {featuredPost.title}
                                    </h2>
                                    <p className="text-lg text-[rgb(86,88,105)] mb-8 leading-relaxed">
                                        {featuredPost.excerpt}
                                    </p>
                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                                                <User className="w-4 h-4 text-slate-500" />
                                            </div>
                                            <span className="text-sm font-medium text-[rgb(29,29,31)]">
                                                {featuredPost.author}
                                            </span>
                                        </div>
                                        <Link
                                            to={`/blog/${featuredPost.id}`}
                                            className="inline-flex items-center text-[rgb(0,113,227)] font-semibold hover:gap-2 transition-all"
                                        >
                                            Read Article <ArrowRight className="w-4 h-4 ml-1" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>
            )}

            {/* Categories Filter (Visual Only) */}
            <section className="px-6 md:px-8 lg:px-12 py-8 bg-white border-b border-slate-100 sticky top-16 z-10 backdrop-blur-md bg-white/80">
                <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {["All Stories", "For Parents", "For Athletes", "For Coaches", "Training", "Technology"].map((cat, i) => (
                        <button
                            key={i}
                            className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${i === 0
                                ? "bg-[rgb(29,29,31)] text-white"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </section>

            {/* Article Grid */}
            <section className="py-20 px-6 md:px-8 lg:px-12 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {regularPosts.map((post, index) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="group flex flex-col h-full"
                            >
                                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden mb-6">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-bold uppercase tracking-wider text-[rgb(29,29,31)]">
                                            {post.category}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col flex-grow">
                                    <div className="flex items-center gap-3 text-xs text-[rgb(134,142,150)] mb-3">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {post.date}
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {post.readTime}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-[rgb(29,29,31)] mb-3 leading-snug group-hover:text-[rgb(0,113,227)] transition-colors">
                                        {post.title}
                                    </h3>

                                    <p className="text-sm text-[rgb(86,88,105)] mb-6 line-clamp-3 leading-relaxed">
                                        {post.excerpt}
                                    </p>

                                    <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                                                <User className="w-3 h-3 text-slate-400" />
                                            </div>
                                            <span className="text-xs font-medium text-slate-600">
                                                {post.author}
                                            </span>
                                        </div>
                                        <Link
                                            to={`/blog/${post.id}`}
                                            className="text-sm font-semibold text-[rgb(0,113,227)] hover:underline"
                                        >
                                            Read
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter CTA */}
            <section className="py-24 px-6 md:px-8 lg:px-12 bg-[rgb(29,29,31)]">
                <div className="max-w-4xl mx-auto text-center text-white">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            Stay ahead of the game.
                        </h2>
                        <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">
                            Join 10,000+ subscribers getting the latest youth sports insights delivered to their inbox.
                        </p>

                        <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[rgb(0,113,227)] focus:bg-white/20 transition-all"
                            />
                            <button
                                type="submit"
                                className="px-8 py-4 bg-[rgb(0,113,227)] text-white font-bold rounded-full hover:bg-[rgb(0,98,204)] transition-all shadow-lg hover:shadow-blue-500/25"
                            >
                                Subscribe
                            </button>
                        </form>
                    </motion.div>
                </div>
            </section>

        </div>
    );
}
