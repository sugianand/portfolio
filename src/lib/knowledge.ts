// Builds the assistant's knowledge base from the same data the site renders,
// so it can only ever say what the site itself says.
import { evidenceLabels, profile, projects, roles, skillGroups, stats } from '../data.ts'
import type { Doc } from './retrieval.ts'

const projectName = (key: string) => projects.find((p) => p.id === key)?.title ?? evidenceLabels[key] ?? key

export function buildKnowledge(): Doc[] {
  const docs: Doc[] = []
  const about = { kind: 'section', id: 'about' } as const

  docs.push({
    id: 'profile',
    title: `${profile.name} (Sugi), ${profile.headline}`,
    text: `Sugi is a software engineer and AI builder based in ${profile.location}, working on an M.S. in Artificial Intelligence at Wayne State University after a B.S. in Computer Science with a minor in Mathematics. Sugi builds ranking and retrieval systems, real-time multiplayer backends, and full-stack products.`,
    source: about,
  })
  docs.push({
    id: 'looking',
    title: 'Roles Sugi is looking for',
    text: `Sugi is looking for ${profile.targets.join(', ')} roles: ${profile.availability.toLowerCase()}. The projects that best show AI work are CineDNA (natural-language recommendation and ranking) and this portfolio's retrieval assistant; Movie in Three Clues shows real-time backend engineering.`,
    source: { kind: 'section', id: 'contact' },
  })
  docs.push({
    id: 'education',
    title: 'Education and GPA',
    text: `${profile.education.map((e) => `${e.degree}, ${e.school} (${e.when.toLowerCase()})`).join('. ')}. GPA: 3.97.`,
    source: about,
  })
  docs.push({
    id: 'contact',
    title: 'Contact, resume, GitHub, LinkedIn',
    text: `Email: ${profile.email}. GitHub: github.com/sugianand. LinkedIn: linkedin.com/in/suganeshwara-anand-b86367219. The resume PDF is linked in the hero, the About section, and the contact section.`,
    source: { kind: 'section', id: 'contact' },
  })
  docs.push({
    id: 'stats',
    title: 'Numbers',
    text: stats.map((s) => `${s.decimals ? s.value.toFixed(s.decimals) : s.value}${s.suffix} ${s.label.toLowerCase()}`).join('. ') + '.',
    source: about,
  })

  for (const r of roles) {
    docs.push({
      id: `role-${r.hash}`,
      title: `${r.title} at ${r.org}`,
      text: `${r.title} at ${r.org}, ${r.place} (${r.date === 'now' ? 'current' : r.date}). ${r.diff.map((d) => d.replace(/\.?$/, '.')).join(' ')}`,
      source: { kind: 'section', id: 'log' },
    })
  }

  for (const p of projects) {
    const src = { kind: 'project', id: p.id } as const
    docs.push({ id: `${p.id}-summary`, title: `${p.title}: ${p.tagline}`, text: `${p.title} (${p.kind}, ${p.year}). ${p.body} Role: ${p.role}. Status: ${p.status}. Stack: ${p.stack.join(', ')}.`, source: src, boost: 3 })
    docs.push({ id: `${p.id}-problem`, title: `${p.title} problem and solution`, text: `${p.problem} ${p.overview}`, source: src })
    if (p.hardest) docs.push({ id: `${p.id}-hardest`, title: `${p.title} hardest engineering problem`, text: p.hardest, source: src })
    if (p.built) docs.push({ id: `${p.id}-built`, title: `What Sugi built in ${p.title}`, text: p.built.map((b) => `${b}.`).join(' '), source: src })
    if (p.metrics) docs.push({ id: `${p.id}-metrics`, title: `${p.title} numbers`, text: p.metrics.map((m) => `${p.title}: ${m.value} ${m.label}.`).join(' '), source: src })
    if (p.architecture) docs.push({ id: `${p.id}-arch`, title: `${p.title} architecture`, text: p.architecture.nodes.map((n) => `${n.label} (${n.tech}): ${n.detail}`).join(' '), source: src })
    docs.push({ id: `${p.id}-features`, title: `${p.title} features and lessons`, text: [...p.features, ...p.challenges].map((f) => f.replace(/\.?$/, '.')).join(' '), source: src })
  }

  for (const g of skillGroups) {
    docs.push({
      id: `skills-${g.key}`,
      title: `${g.label} skills`,
      text: `Skills and technologies, ${g.label}: ` + g.items.map((i) => (i.evidence ? `${i.name} (used in ${i.evidence.map(projectName).join(', ')})` : i.name)).join('; ') + '.',
      source: about,
    })
  }

  return docs
}
