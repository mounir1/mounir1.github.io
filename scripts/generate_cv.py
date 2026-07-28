#!/usr/bin/env python3
"""Generate Mounir Abderrahmani's CV PDF from real, verified data.

Data source of truth: src/data/initial-experience.ts, initial-projects.ts,
initial-skills.ts and src/hooks/useSettings.ts (all real-data-policy files).
Run:  python3 scripts/generate_cv.py
Outputs: Mounir_CV_2025.pdf and public/Mounir_CV_2025.pdf
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import (
    BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer,
    HRFlowable, KeepTogether,
)

ACCENT = HexColor("#1d4ed8")
DARK = HexColor("#111827")
GRAY = HexColor("#4b5563")
LIGHT = HexColor("#9ca3af")

styles = {
    "name": ParagraphStyle("name", fontName="Helvetica-Bold", fontSize=20,
                            leading=24, textColor=DARK),
    "title": ParagraphStyle("title", fontName="Helvetica", fontSize=11,
                             leading=14, textColor=ACCENT),
    "contact": ParagraphStyle("contact", fontName="Helvetica", fontSize=8.5,
                               leading=12, textColor=GRAY),
    "h2": ParagraphStyle("h2", fontName="Helvetica-Bold", fontSize=11,
                          leading=14, textColor=ACCENT, spaceBefore=10,
                          spaceAfter=2),
    "role": ParagraphStyle("role", fontName="Helvetica-Bold", fontSize=10,
                            leading=13, textColor=DARK),
    "meta": ParagraphStyle("meta", fontName="Helvetica-Oblique", fontSize=8.5,
                            leading=11, textColor=LIGHT),
    "body": ParagraphStyle("body", fontName="Helvetica", fontSize=9,
                            leading=12, textColor=GRAY, alignment=TA_LEFT),
    "bullet": ParagraphStyle("bullet", fontName="Helvetica", fontSize=9,
                              leading=12, textColor=GRAY, leftIndent=10,
                              bulletIndent=2),
}


def bullet(text):
    return Paragraph(f"• {text}", styles["bullet"])


def section(title):
    return [Paragraph(title.upper(), styles["h2"]),
            HRFlowable(width="100%", thickness=0.7, color=ACCENT,
                       spaceAfter=5)]


story = []

# ── Header ──────────────────────────────────────────────────────────────────
story.append(Paragraph("Mounir Abderrahmani", styles["name"]))
story.append(Paragraph("Senior Full-Stack Developer — E-commerce, Hospitality &amp; Edge Platforms", styles["title"]))
story.append(Spacer(1, 3))
story.append(Paragraph(
    "Algeria (Remote) &nbsp;|&nbsp; mounir.webdev@gmail.com &nbsp;|&nbsp; +213 674 09 48 55<br/>"
    "github.com/mounir1 &nbsp;|&nbsp; linkedin.com/in/mounir1badi &nbsp;|&nbsp; mounir1.github.io",
    styles["contact"]))
story.append(Spacer(1, 4))

# ── Summary ─────────────────────────────────────────────────────────────────
story += section("Profile")
story.append(Paragraph(
    "Full-stack developer with 10+ years of shipped, verifiable work: a live Magento 2.4 "
    "storefront and Akeneo PIM 6 in production, an open-source suite of 28 Magento extensions, "
    "the front-end of a hospitality Property Management System (Nava PMS), and an edge-native "
    "platform on Cloudflare Workers. Strong on typed React/TypeScript front-ends, API "
    "integration, automated testing, and running production infrastructure end to end.",
    styles["body"]))

# ── Experience ──────────────────────────────────────────────────────────────
story += section("Experience")

exp = [
    {
        "role": "Front-End Developer — Nava PMS (Hospitality)",
        "org": "HoTech · Contract · Remote", "dates": "2025 – Present",
        "points": [
            "Build core PMS screens including the Syncfusion-based Room Rack reservation timeline.",
            "Typed integration layer over the OREST hospitality API; MSW mocks for offline development.",
            "Automated testing with Vitest (unit) and Playwright (end-to-end).",
        ],
    },
    {
        "role": "Lead E-commerce & Platform Developer",
        "org": "Techno Stationery · Full-time · Algeria", "dates": "2022 – Present",
        "points": [
            "Operate the live Magento 2.4 store technostationery.com end to end.",
            "Deployed and administer Akeneo PIM 6 (PHP 8.3) as the central product-data hub.",
            "Authored the open-source MAB Modules suite — 28 Magento 2.4 extensions in production.",
            "Integrated Yalidine shipping: 165+ pickup centers across all 58 Algerian wilayas.",
            "Built the internal operations dashboard; own hosting, security, and deployments.",
        ],
    },
    {
        "role": "Founder & Architect — MabCoin / Mab Arena",
        "org": "Personal venture · Remote", "dates": "Jul 2025 – Present",
        "points": [
            "Edge-native platform on Cloudflare Workers: Hono API, D1 (SQLite) persistence.",
            "MCP server exposing 12 tools for AI-agent integration; Telegram bot @Mymabcoinbot.",
            "CI quality gate green across 89/89 automated checks.",
        ],
    },
    {
        "role": "Freelance Full-Stack Developer",
        "org": "Independent · Algeria / Remote", "dates": "2016 – 2021",
        "points": [
            "Delivered sites and web apps for local businesses — including nooralmaarifa.com (still live).",
            "Published JSKit (jskit-app.web.app), a Firebase-hosted developer toolkit.",
            "Grew from front-end builds into complete design–build–deploy–maintain delivery.",
        ],
    },
]

for e in exp:
    block = [Paragraph(e["role"], styles["role"]),
             Paragraph(f'{e["org"]} — {e["dates"]}', styles["meta"]),
             Spacer(1, 2)]
    block += [bullet(p) for p in e["points"]]
    block.append(Spacer(1, 6))
    story.append(KeepTogether(block))

# ── Selected Projects ───────────────────────────────────────────────────────
story += section("Selected Projects")
projects = [
    ("Nava PMS", "Hospitality PMS front-end (React/TS, Syncfusion, OREST API)."),
    ("MAB Modules Suite", "28 open-source Magento 2.4 extensions — mounirtms.github.io."),
    ("TechnoStationery.com", "Production Magento 2.4 storefront, live in Algeria."),
    ("MabCoin / Mab Arena", "Cloudflare Workers + Hono + D1; MCP server (12 tools); Telegram bot."),
    ("Akeneo PIM", "Production PIM 6 deployment — pim.technostationery.com."),
    ("Portfolio + Admin CMS", "React 18 + Firebase with full content management — mounir1.github.io."),
]
for name, desc in projects:
    story.append(Paragraph(f"<b>{name}</b> — {desc}", styles["bullet"]))
story.append(Spacer(1, 4))

# ── Skills ──────────────────────────────────────────────────────────────────
story += section("Skills")
skills = [
    ("Frontend", "React, TypeScript, Vite, Tailwind CSS, Syncfusion UI, HTML/CSS (incl. RTL)"),
    ("Backend / Edge", "Node.js, PHP 8, Cloudflare Workers, Hono, Firebase, REST APIs, MCP, Telegram Bot API"),
    ("E-commerce / PIM", "Magento 2.4 / Adobe Commerce, Akeneo PIM 6, custom module development"),
    ("Data", "MySQL/MariaDB, SQLite / Cloudflare D1, Firestore, Elasticsearch"),
    ("Quality / Ops", "Vitest, Playwright, MSW, Git, GitHub Actions CI/CD, Linux &amp; Nginx administration"),
]
for cat, items in skills:
    story.append(Paragraph(f"<b>{cat}:</b> {items}", styles["bullet"]))
story.append(Spacer(1, 4))

# ── Languages ───────────────────────────────────────────────────────────────
story += section("Languages")
story.append(Paragraph("Arabic (native) · French (professional) · English (professional)", styles["body"]))

# ── Build ───────────────────────────────────────────────────────────────────
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = os.path.join(root, "Mounir_CV_2025.pdf")

doc = BaseDocTemplate(out, pagesize=A4,
                      leftMargin=18 * mm, rightMargin=18 * mm,
                      topMargin=16 * mm, bottomMargin=14 * mm,
                      title="Mounir Abderrahmani — CV 2025",
                      author="Mounir Abderrahmani")
frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="main")
doc.addPageTemplates([PageTemplate(id="cv", frames=[frame])])
doc.build(story)

import shutil
shutil.copy(out, os.path.join(root, "public", "Mounir_CV_2025.pdf"))
print(f"Generated {out} ({os.path.getsize(out)} bytes) + copied to public/")
