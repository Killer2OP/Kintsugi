import Link from "next/link";
import { Bot, Github, Twitter, Linkedin, ExternalLink } from "lucide-react";

const footerLinks = {
    product: [
        { name: "Dashboard", href: "/dashboard" },
        { name: "Analytics", href: "/analytics" },
        { name: "Failures", href: "/failures" },
        { name: "Fixes", href: "/fixes" },
    ],
    resources: [
        { name: "Documentation", href: "/docs" },
        { name: "API Reference", href: "/docs" },
        { name: "GitHub", href: "https://github.com/CI-CD-Fixer-Agent", external: true },
    ],
    company: [
        { name: "About", href: "#" },
        { name: "Blog", href: "#" },
        { name: "Contact", href: "#" },
    ],
};

const socialLinks = [
    { name: "GitHub", icon: Github, href: "https://github.com/CI-CD-Fixer-Agent" },
    { name: "Twitter", icon: Twitter, href: "#" },
    { name: "LinkedIn", icon: Linkedin, href: "#" },
];

export function Footer() {
    return (
        <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090b]">
            <div className="max-w-6xl mx-auto px-6 py-12 lg:py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2.5 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center">
                                <Bot className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-semibold text-zinc-900 dark:text-white font-serif tracking-wide">
                                Kintsugi
                            </span>
                        </Link>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 max-w-xs">
                            AI-powered workflow failure detection and automated fix suggestions for reliable deployments.
                        </p>
                        <div className="flex items-center gap-3">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                    aria-label={social.name}
                                >
                                    <social.icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">
                            Product
                        </h3>
                        <ul className="space-y-3">
                            {footerLinks.product.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div>
                        <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">
                            Resources
                        </h3>
                        <ul className="space-y-3">
                            {footerLinks.resources.map((link) => (
                                <li key={link.name}>
                                    {link.external ? (
                                        <a
                                            href={link.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                                        >
                                            {link.name}
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    ) : (
                                        <Link
                                            href={link.href}
                                            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                                        >
                                            {link.name}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">
                            Company
                        </h3>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            © {new Date().getFullYear()} Kintsugi. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6 text-sm text-zinc-500 dark:text-zinc-400">
                            <Link
                                href="#"
                                className="hover:text-zinc-900 dark:hover:text-white transition-colors"
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                href="#"
                                className="hover:text-zinc-900 dark:hover:text-white transition-colors"
                            >
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
