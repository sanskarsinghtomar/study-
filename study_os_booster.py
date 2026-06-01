import json
from pathlib import Path
from uuid import uuid4

PROJECT_ROOT = Path(__file__).parent
OUTPUT_NOTES = PROJECT_ROOT / "study_os_notes.json"
OUTPUT_REPORT = PROJECT_ROOT / "study_os_improvement_report.md"

SUBJECTS = [
    {
        "name": "Physics",
        "code": "PHY",
        "color": "violet",
        "chapters": [
            {
                "name": "Electrostatics",
                "topics": [
                    "Electric Charge",
                    "Electric Field",
                    "Coulomb's Law",
                    "Capacitance"
                ]
            },
            {
                "name": "Motion",
                "topics": [
                    "Kinematics",
                    "Dynamics",
                    "Work and Energy"
                ]
            }
        ]
    },
    {
        "name": "Chemistry",
        "code": "CHEM",
        "color": "teal",
        "chapters": [
            {
                "name": "Solutions",
                "topics": [
                    "Concentration",
                    "Solubility",
                    "Molarity"
                ]
            },
            {
                "name": "Organic Chemistry",
                "topics": [
                    "Hydrocarbons",
                    "Functional Groups"
                ]
            }
        ]
    },
    {
        "name": "Maths",
        "code": "MATH",
        "color": "amber",
        "chapters": [
            {
                "name": "Real Numbers",
                "topics": [
                    "Number Systems",
                    "Laws of Exponents"
                ]
            },
            {
                "name": "Polynomial Functions",
                "topics": [
                    "Quadratic Equations",
                    "Factorization"
                ]
            }
        ]
    },
    {
        "name": "Biology",
        "code": "BIO",
        "color": "green",
        "chapters": [
            {
                "name": "Cell Structure",
                "topics": [
                    "Cell Organelles",
                    "Cell Division"
                ]
            }
        ]
    },
    {
        "name": "English",
        "code": "ENG",
        "color": "pink",
        "chapters": [
            {
                "name": "Writing Skills",
                "topics": [
                    "Formal Letters",
                    "Essay Writing"
                ]
            }
        ]
    }
]

FEATURE_IDEAS = [
    "Add a chapter/topic explorer page with subject-wise and topic-wise tabs.",
    "Create a Smart Notes Hub that shows AI-generated summaries and diagrams based on attachments.",
    "Build a study tracker card with subject/topic time breakdown and highest-time activity highlights.",
    "Use immersive fonts, subtle gradients, and responsive cards for a premium study OS feel.",
    "Add an attachment parser that extracts headings, bullets, and Mermaid diagrams into structured notes.",
    "Support a clean export/import flow for notes, bookmarks, and revision summaries.",
    "Add a revision dashboard with key-point flashcards and spaced repetition stats."
]


def make_note(subject_name: str, chapter_name: str, topic_name: str) -> dict:
    title = f"{topic_name} — {subject_name}"
    overview = (
        f"This note covers {topic_name} from {chapter_name} in {subject_name}. "
        "It explains the main ideas, key terms, and practice directions."
    )
    key_points = [
        f"Understand the definition of {topic_name}.",
        "Identify the main formulas and examples.",
        "Use simple diagrams to remember core relationships.",
        "Review sample problems and steps for revision."
    ]
    diagram = (
        "flowchart LR\n"
        f"  A[{topic_name}] --> B[Concept]\n"
        "  B --> C[Example]\n"
        "  C --> D[Practice]\n"
        "  D --> E[Review]"
    )
    return {
        "id": str(uuid4()),
        "subject": subject_name,
        "chapter": chapter_name,
        "topic": topic_name,
        "title": title,
        "overview": overview,
        "content": f"{overview}\n\nKey Concepts:\n- {key_points[0]}\n- {key_points[1]}\n- {key_points[2]}\n- {key_points[3]}",
        "key_points": key_points,
        "diagram": diagram,
        "created_at": "2026-06-01T00:00:00Z",
        "type": "detailed"
    }


def generate_notes() -> list[dict]:
    notes = []
    for subject in SUBJECTS:
        for chapter in subject["chapters"]:
            for topic in chapter["topics"]:
                notes.append(make_note(subject["name"], chapter["name"], topic))
    return notes


def write_output(notes: list[dict]) -> None:
    output_data = {
        "generated": True,
        "notes": notes,
        "summary": {
            "subjects": len(SUBJECTS),
            "chapters": sum(len(subject["chapters"]) for subject in SUBJECTS),
            "notes": len(notes)
        }
    }
    OUTPUT_NOTES.write_text(json.dumps(output_data, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Saved {len(notes)} generated notes to {OUTPUT_NOTES}")


def write_report() -> None:
    report_lines = [
        "# Study OS Enhancement Report",
        "",
        "This report was generated without changing the existing app code. It offers a roadmap to make the project feel premium, immersive, and feature-rich.",
        "",
        "## Suggested Feature Enhancements",
    ]
    report_lines.extend([f"- {idea}" for idea in FEATURE_IDEAS])
    report_lines.extend([
        "",
        "## Notes Generated by Python",
        "Use the generated `study_os_notes.json` file to import or manually review rich note cards.",
        "Each note includes an overview, key points, and a Mermaid-style diagram string for visual study support.",
        "",
        "## How to Use",
        "1. Run `python study_os_booster.py` in the project folder.",
        "2. Open `study_os_notes.json` to review generated note content.",
        "3. Copy note details into the app or wire the data into future app enhancements.",
    ])
    OUTPUT_REPORT.write_text("\n".join(report_lines), encoding="utf-8")
    print(f"Saved improvement report to {OUTPUT_REPORT}")


if __name__ == "__main__":
    notes = generate_notes()
    write_output(notes)
    write_report()
