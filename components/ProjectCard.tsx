
import React from 'react';
import { Project, View } from '../types';

interface ProjectCardProps {
    project: Project;
    navigateTo: (view: View, caseStudyId?: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, navigateTo }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transform transition duration-500 hover:scale-105 hover:shadow-2xl group">
            <div className="relative">
                <img src={project.imageUrl} alt={project.title} className="w-full h-56 object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-40 transition-all duration-300"></div>
            </div>
            <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.map(tag => (
                        <span key={tag} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">{tag}</span>
                    ))}
                </div>
                <h3 className="ghibli-font text-2xl text-gray-900 dark:text-white mb-2">{project.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 h-16">{project.description}</p>
                <button
                    onClick={() => navigateTo('caseStudy', project.caseStudyId)}
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold py-2 px-4 rounded-full shadow-md transform transition hover:scale-105"
                >
                    View Case Study <i className="fas fa-arrow-right ml-2"></i>
                </button>
            </div>
        </div>
    );
};

export default ProjectCard;
