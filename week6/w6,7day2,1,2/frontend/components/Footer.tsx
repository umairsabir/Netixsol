// Footer
export default function Footer() {
    return (
        <footer className="bg-gray-50 px-4 py-12">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <h3 className="font-bold text-lg mb-4">SHOP.CO</h3>
                        <p className="text-gray-600 text-sm mb-4">
                            We have clothes that suits your style and which you're proud to wear. From women to men.
                        </p>
                        <div className="flex gap-4">
                            <button className="text-gray-700 hover:text-black">
                                𝕏
                            </button>
                            <button className="text-gray-700 hover:text-black">
                                f
                            </button>
                            <button className="text-gray-700 hover:text-black">
                                ⚫
                            </button>
                            <button className="text-gray-700 hover:text-black">
                                ◯
                            </button>
                        </div>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="font-semibold text-sm mb-4 uppercase">Company</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><button className="hover:text-black">About</button></li>
                            <li><button className="hover:text-black">Features</button></li>
                            <li><button className="hover:text-black">Works</button></li>
                            <li><button className="hover:text-black">Career</button></li>
                        </ul>
                    </div>

                    {/* Help */}
                    <div>
                        <h4 className="font-semibold text-sm mb-4 uppercase">Help</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><button className="hover:text-black">Customer Support</button></li>
                            <li><button className="hover:text-black">Delivery Details</button></li>
                            <li><button className="hover:text-black">Terms & Conditions</button></li>
                            <li><button className="hover:text-black">Privacy Policy</button></li>
                        </ul>
                    </div>

                    {/* FAQ */}
                    <div>
                        <h4 className="font-semibold text-sm mb-4 uppercase">FAQ</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><button className="hover:text-black">Account</button></li>
                            <li><button className="hover:text-black">Manage Deliveries</button></li>
                            <li><button className="hover:text-black">Orders</button></li>
                            <li><button className="hover:text-black">Payments</button></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="font-semibold text-sm mb-4 uppercase">Resources</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><button className="hover:text-black">Free eBooks</button></li>
                            <li><button className="hover:text-black">Development Tutorial</button></li>
                            <li><button className="hover:text-black">How to - Blog</button></li>
                            <li><button className="hover:text-black">Youtube Playlist</button></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-gray-600">
                    <p>Shop.co © 2000-2023. All Rights Reserved</p>
                    <div className="flex gap-4 items-center mt-4 md:mt-0">
                        <span>💳</span>
                        <span>🔵</span>
                        <span>📦</span>
                        <span>🍎</span>
                        <span>🔵</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}