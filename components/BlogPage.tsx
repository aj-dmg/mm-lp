import React, { useEffect } from 'react';
import { StickyNav, Footer } from './LandingPage.tsx';

export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: React.ReactNode;
    author: string;
    date: string;
    image: string;
    tags: string[];
    readTime: string;
}

const BLOG_POSTS: BlogPost[] = [
    {
        id: '1',
        slug: 'ultimate-calgary-party-bus-guide',
        title: 'The Ultimate Guide to Planning a Calgary Party Bus Event',
        excerpt: 'Everything you need to know about booking, routes, and making the most of your night out in Calgary.',
        author: 'Sarah Jenkins',
        date: 'June 15, 2024',
        readTime: '5 min read',
        image: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        tags: ['Planning', 'Nightlife'],
        content: (
            <>
                <p className="mb-6">Planning a group event in Calgary can be stressful. Between coordinating arrivals, finding parking, and ensuring everyone gets home safely, the logistics often overshadow the fun. That's where the party bus experience changes the game.</p>
                
                <h3 className="text-2xl font-headline font-bold text-deep-midnight-blue mb-4">1. Choose Your Vessel Wisely</h3>
                <p className="mb-6">Not all party buses are created equal. For smaller, intimate groups of 15-20, a standard limo bus offers luxury and conversation space. However, for larger corporate groups or wedding parties of 40+, a Double-Decker bus isn't just a vehicle—it's a venue on wheels.</p>
                
                <h3 className="text-2xl font-headline font-bold text-deep-midnight-blue mb-4">2. Map Your Route (But Stay Flexible)</h3>
                <p className="mb-6">Calgary has incredible nightlife districts like 17th Ave, Stephen Avenue, and Inglewood. While it's good to have a plan, the beauty of a party bus is the journey itself. Many groups find they have more fun dancing on the bus than at the clubs!</p>
                
                <h3 className="text-2xl font-headline font-bold text-deep-midnight-blue mb-4">3. Stocking the Bar</h3>
                <p className="mb-6">Ensure you check with your provider about alcohol policies. Most reputable companies in Calgary allow you to bring your own beverages (with a valid liquor license for the event), making it a cost-effective way to enjoy premium drinks.</p>
            </>
        )
    },
    {
        id: '2',
        slug: 'wedding-transportation-logistics',
        title: 'Why Double-Decker Buses Are Taking Over Calgary Weddings',
        excerpt: 'Forget the convoy of Ubers. Here is why savvy couples are moving their guests in style.',
        author: 'Michael Ross',
        date: 'May 28, 2024',
        readTime: '4 min read',
        image: 'https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        tags: ['Weddings', 'Trends'],
        content: (
            <>
                <p className="mb-6">The transition between the ceremony and the reception is often the "dead zone" of a wedding day. Guests are left to navigate unfamiliar streets, pay for parking, or kill time in a hotel lobby.</p>
                
                <h3 className="text-2xl font-headline font-bold text-deep-midnight-blue mb-4">The "All-Together" Atmosphere</h3>
                <p className="mb-6">A Double-Decker bus keeps the energy high. Instead of separating into individual cars, your guests start the celebration immediately. It serves as an icebreaker for extended family and friends who haven't met.</p>
                
                <h3 className="text-2xl font-headline font-bold text-deep-midnight-blue mb-4">Photo Opportunities</h3>
                <p className="mb-6">Let's be honest: a vintage-style or modern double-decker bus makes for incredible photos. It adds a touch of London flair or distinct character to your wedding album that a standard shuttle van simply can't match.</p>
            </>
        )
    },
    {
        id: '3',
        slug: 'corporate-team-building-ideas',
        title: '5 Corporate Team Building Ideas That Actually Work',
        excerpt: 'Move beyond the trust falls. Discover mobile team building events that employees actually want to attend.',
        author: 'Jessica Chen',
        date: 'April 12, 2024',
        readTime: '6 min read',
        image: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        tags: ['Corporate', 'Team Building'],
        content: (
            <>
                <p className="mb-6">The modern workforce values experience over forced participation. If you're planning a quarterly outing, the logistics of moving 50 people can be a nightmare. </p>
                
                <h3 className="text-2xl font-headline font-bold text-deep-midnight-blue mb-4">The Brewery Tour</h3>
                <p className="mb-6">Calgary's craft beer scene is booming. A guided tour of 3-4 local breweries is a relaxed way for teams to bond. The bus handles the safe transport, ensuring liability is managed and everyone gets home safe.</p>
                
                <h3 className="text-2xl font-headline font-bold text-deep-midnight-blue mb-4">Scavenger Hunts</h3>
                <p className="mb-6">Use the city as your playground. Split into teams and use the bus as a mobile base, dropping groups at key landmarks to solve clues before racing to the next location.</p>
            </>
        )
    }
];

interface BlogPageProps {
    slug?: string;
}

const BlogPage: React.FC<BlogPageProps> = ({ slug }) => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [slug]);

    const activePost = slug ? BLOG_POSTS.find(post => post.slug === slug) : null;

    return (
        <div className="bg-white min-h-screen flex flex-col font-sans">
            <StickyNav />
            
            <main className="flex-grow pt-[100px] pb-20">
                {activePost ? (
                    // --- Single Post View ---
                    <article className="max-w-[800px] mx-auto px-5 md:px-10 animate-fade-in-up">
                        <div className="mb-8">
                            <button 
                                onClick={() => window.history.back()} 
                                className="text-electric-blue font-semibold hover:underline mb-6 inline-flex items-center gap-2"
                            >
                                <i className="fas fa-arrow-left"></i> Back to Blog
                            </button>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {activePost.tags.map(tag => (
                                    <span key={tag} className="bg-light-gray text-charcoal-gray px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <h1 className="font-headline font-bold text-deep-midnight-blue text-[clamp(2rem,4vw,3rem)] leading-tight mb-6">
                                {activePost.title}
                            </h1>
                            <div className="flex items-center gap-4 text-steel-gray text-sm">
                                <span className="flex items-center gap-2"><i className="far fa-user"></i> {activePost.author}</span>
                                <span className="flex items-center gap-2"><i className="far fa-calendar"></i> {activePost.date}</span>
                                <span className="flex items-center gap-2"><i className="far fa-clock"></i> {activePost.readTime}</span>
                            </div>
                        </div>
                        
                        <div className="w-full h-[400px] rounded-xl overflow-hidden shadow-xl mb-10">
                            <img src={activePost.image} alt={activePost.title} className="w-full h-full object-cover" />
                        </div>

                        <div className="prose prose-lg text-charcoal-gray max-w-none">
                            {activePost.content}
                        </div>

                        <div className="mt-16 pt-10 border-t border-light-gray">
                            <h3 className="font-headline font-bold text-2xl mb-6">Ready to Experience It Yourself?</h3>
                            <div className="bg-deep-midnight-blue text-white p-8 rounded-xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <p className="font-bold text-xl mb-2">Book Your Event Today</p>
                                    <p className="text-metallic-silver">Get a custom quote in minutes.</p>
                                </div>
                                <button 
                                    onClick={() => window.location.href = '/#quote'}
                                    className="bg-electric-blue text-white font-bold py-3 px-8 rounded-lg hover:bg-white hover:text-electric-blue transition-all whitespace-nowrap"
                                >
                                    Get Started
                                </button>
                            </div>
                        </div>
                    </article>
                ) : (
                    // --- Blog Index View ---
                    <div className="max-w-[1200px] mx-auto px-5 md:px-10">
                        <div className="text-center mb-16 animate-fade-in-up">
                            <h1 className="font-headline font-bold text-deep-midnight-blue text-[clamp(2.5rem,5vw,4rem)] mb-4">The Midnight Blog</h1>
                            <p className="font-sans text-xl text-charcoal-gray max-w-2xl mx-auto">
                                Tips, trends, and stories from Calgary's premier event transportation team.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {BLOG_POSTS.map((post, index) => (
                                <div 
                                    key={post.id} 
                                    className="group bg-white rounded-xl overflow-hidden shadow-lg border border-light-gray hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full animate-fade-in-up"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="h-48 overflow-hidden relative">
                                        <img 
                                            src={post.image} 
                                            alt={post.title} 
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" 
                                        />
                                        <div className="absolute top-4 left-4 flex gap-2">
                                            {post.tags.map(tag => (
                                                <span key={tag} className="bg-white/90 backdrop-blur-sm text-deep-midnight-blue px-2 py-1 rounded text-xs font-bold shadow-sm">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="p-6 flex flex-col flex-grow">
                                        <div className="flex items-center gap-2 text-xs text-steel-gray mb-3">
                                            <span>{post.date}</span>
                                            <span>•</span>
                                            <span>{post.readTime}</span>
                                        </div>
                                        <h3 className="font-headline font-bold text-xl text-deep-midnight-blue mb-3 group-hover:text-electric-blue transition-colors">
                                            <a href={`#blog/${post.slug}`} className="focus:outline-none">
                                                {post.title}
                                            </a>
                                        </h3>
                                        <p className="text-charcoal-gray text-sm line-clamp-3 mb-6 flex-grow">
                                            {post.excerpt}
                                        </p>
                                        <a 
                                            href={`#blog/${post.slug}`} 
                                            className="inline-flex items-center gap-2 font-bold text-electric-blue hover:gap-3 transition-all"
                                        >
                                            Read Article <i className="fas fa-arrow-right"></i>
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default BlogPage;
