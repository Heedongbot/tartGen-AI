export function Footer() {
    return (
        <footer className="border-t border-white/10 bg-black/40 backdrop-blur-md py-12">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="size-6 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <span className="text-sm font-bold text-white">S</span>
                            </div>
                            <span className="text-lg font-bold text-white">StartupIdeas.ai</span>
                        </div>
                        <p className="text-sm text-white/50">
                            AI-powered personalized startup ideas for your next big venture.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-white mb-4">Product</h3>
                        <ul className="space-y-2 text-sm text-white/60">
                            <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-white mb-4">Resources</h3>
                        <ul className="space-y-2 text-sm text-white/60">
                            <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-white mb-4">Legal</h3>
                        <ul className="space-y-2 text-sm text-white/60">
                            <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-white/40">
                        © 2024 StartupIdeas.ai. All rights reserved.
                    </p>
                    <div className="flex gap-4">
                        {/* Social Icons Placeholder */}
                        <div className="size-5 bg-white/10 rounded-full" />
                        <div className="size-5 bg-white/10 rounded-full" />
                        <div className="size-5 bg-white/10 rounded-full" />
                    </div>
                </div>
            </div>
        </footer>
    );
}
