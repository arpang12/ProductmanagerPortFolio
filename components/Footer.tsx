
import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-800 text-white py-12 dark:bg-gray-950">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
                    <div className="ghibli-font text-2xl mb-6 md:mb-0">
                        <span className="text-yellow-400">★</span> Arpan's Product Journey
                    </div>
                    <div className="flex space-x-4">
                        <a href="https://www.linkedin.com/in/arpan-guria/" target="_blank" rel="noopener noreferrer" className="bg-gray-700 hover:bg-yellow-500 hover:text-gray-800 p-3 rounded-full transition-colors duration-300">
                            <i className="fab fa-linkedin-in"></i>
                        </a>
                        <a href="https://github.com/arpang12" target="_blank" rel="noopener noreferrer" className="bg-gray-700 hover:bg-yellow-500 hover:text-gray-800 p-3 rounded-full transition-colors duration-300">
                            <i className="fab fa-github"></i>
                        </a>
                    </div>
                </div>
                <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                    <p>© {new Date().getFullYear()} Arpan's Product Journey. All rights reserved. Crafted with magic and ♥</p>
                    <p className="mt-2 text-sm">Inspired by the enchanting worlds of Studio Ghibli</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
