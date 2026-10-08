"use client";

import { useState } from "react";
import { getHomeContent, getPortfolioProjects, href, type Locale, type Project } from "@/content/site";
import { Button, PhotoPlaceholder } from "./ui";

export function ProjectCard({ project, locale }: { project: Project; locale: Locale }) {
  const text = getHomeContent(locale).projects;
  return (
    <article className="project-card">
      <div className="project-photo">
        <PhotoPlaceholder locale={locale} label={text.photo} photo={project.photo} />
        {project.status && <span className="project-status">
          <span aria-hidden="true" />
          {project.status === "current"
            ? text.statusCurrent
            : text.statusCompleted}
        </span>}
      </div>
      <div className="project-body card-content">
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
          href={`${href(locale, "projets")}#projet-${project.slug}`}
          variant="text"
          aria-label={`${text.view} : ${project.title}`}
        >
          {text.view}
        </Button>
      </div>
    </article>
  );
}

export function Projects({ locale }: { locale: Locale }) {
  const [filter, setFilter] = useState<NonNullable<Project["status"]>>("current");
  const visible = getPortfolioProjects(locale)
    .filter((project) => project.status === filter)
    .slice(0, 3);
  const text = getHomeContent(locale).projects;
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
          <ProjectCard key={project.slug} project={project} locale={locale} />
        ))}
      </div>
    </>
  );
}
