"use client"

import { useState } from "react"
import { MAX_SKILLS, MAX_SKILL_LENGTH, normalizeSkill } from "@/lib/skills"

// Read-only list of skill chips. If onSelect is given, each chip is a button.
export function SkillChips({
  skills,
  onSelect,
}: {
  skills: string[]
  onSelect?: (skill: string) => void
}) {
  if (skills.length === 0) return null
  const chipClass =
    "rounded-full border border-[#2F6F52]/25 bg-[#2F6F52]/8 px-2 py-0.5 text-[11.5px] text-[#2F6F52]"
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Skills">
      {skills.map((skill) => (
        <li key={skill}>
          {onSelect ? (
            <button
              type="button"
              onClick={() => onSelect(skill)}
              className={`${chipClass} hover:bg-[#2F6F52]/15 focus-visible:outline-2 focus-visible:outline-[#2F6F52] focus-visible:outline-offset-1`}
            >
              {skill}
            </button>
          ) : (
            <span className={chipClass}>{skill}</span>
          )}
        </li>
      ))}
    </ul>
  )
}

// Editable tag input: type a skill and press Enter or comma to add it.
export default function SkillsInput({
  id,
  value,
  onChange,
  inputClassName,
}: {
  id: string
  value: string[]
  onChange: (skills: string[]) => void
  inputClassName: string
}) {
  const [draft, setDraft] = useState("")
  const [hint, setHint] = useState<string | null>(null)

  // Adds each comma-separated piece of `text` to the list. Returns whatever
  // couldn't be added (so it stays in the box for the user to fix).
  function commit(text: string): string {
    const next = [...value]
    let leftover = ""
    let message: string | null = null
    for (const piece of text.split(",")) {
      const skill = normalizeSkill(piece)
      if (!skill || next.includes(skill)) continue
      if (skill.length > MAX_SKILL_LENGTH) {
        message = `Keep each skill under ${MAX_SKILL_LENGTH} characters.`
        leftover = piece.trim()
        continue
      }
      if (next.length >= MAX_SKILLS) {
        message = `You can add up to ${MAX_SKILLS} skills.`
        break
      }
      next.push(skill)
    }
    if (next.length !== value.length) onChange(next)
    setHint(message)
    return leftover
  }

  return (
    <div>
      {value.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-1.5" aria-label="Added skills">
          {value.map((skill) => (
            <li
              key={skill}
              className="inline-flex items-center gap-1 rounded-full border border-[#2F6F52]/25 bg-[#2F6F52]/8 py-0.5 pl-2 pr-1 text-[12px] text-[#2F6F52]"
            >
              {skill}
              <button
                type="button"
                onClick={() => onChange(value.filter((s) => s !== skill))}
                className="rounded-full px-1 leading-none text-[#2F6F52]/70 hover:text-[#A8452E] focus-visible:outline-2 focus-visible:outline-[#2F6F52]"
                aria-label={`Remove ${skill}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <input
        id={id}
        type="text"
        value={draft}
        placeholder={
          value.length === 0 ? "e.g. react, node.js, postgresql" : "Add another skill"
        }
        onChange={(e) => {
          const text = e.target.value
          if (text.includes(",")) {
            const parts = text.split(",")
            const last = parts.pop() ?? ""
            const leftover = commit(parts.join(","))
            setDraft(leftover || last)
          } else {
            setDraft(text)
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            setDraft(commit(draft))
          } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
            onChange(value.slice(0, -1))
          }
        }}
        onBlur={() => setDraft(commit(draft))}
        className={inputClassName}
        aria-describedby={`${id}-help`}
      />
      <p id={`${id}-help`} className="mt-1 text-[12px] text-[#16231F]/50">
        {hint ?? `Press Enter or comma to add. Up to ${MAX_SKILLS} skills.`}
      </p>
    </div>
  )
}
