"use client";

import { useState } from "react";
import { homeContent, href, projects, type Project } from "@/content/site";
import { Button, PhotoPlaceholder } from "./ui";

export function ProjectCard({ project }: { project: Project }) {
  const text = homeContent.projects;
  return (
    <article className="project-card">
      <div className="project-photo">
        <PhotoPlaceholder label={text.photo} photo={project.photo} />
        <span className="project-status">
          <span aria-hidden="true" />
          {project.status === "current"
            ? text.statusCurrent
            : text.statusCompleted}
        </span>
      </div>
      <div className="project-body">
        <p className="project-meta">
          <span>
            {project.zone}
          </span>
          <span>{project.period}</span>
        </p>
        <h3>{project.title}</h3>
        <p className="project-description">{project.description}</p>
        <p className="project-partner">
          {text.partner} <strong>{project.partner}</strong>
        </p>
        <Button
          href={`${href("fr", "projets")}#projet-${project.slug}`}
          variant="text"
          aria-label={`${text.view} : ${project.title}`}
        >
          {text.view}
        </Button>
      </div>
    </article>
  );
}

export function Projects() {
  const [filter, setFilter] = useState<Project["status"]>("current");
  const visible = projects
    .filter((project) => project.status === filter)
    .slice(0, 3);
  const text = homeContent.projects;
  return (
    <>
      <div className="project-toolbar">
        <div className="project-filter" role="group" aria-label={text.filters}>
          <button
            type="button"
            aria-pressed={filter === "current"}
            aria-controls="project-list"
            onClick={() => setFilter("current")}
          >
            {text.current}
          </button>
          <button
            type="button"
            aria-pressed={filter === "completed"}
            aria-controls="project-list"
            onClick={() => setFilter("completed")}
          >
            {text.completed}
          </button>
        </div>
        <p aria-live="polite" className="project-count">
          {visible.length} {text.count}
        </p>
      </div>
      <div className="project-grid" id="project-list">
        {visible.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </>
  );
}
