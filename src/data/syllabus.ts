import type { PaperSyllabus } from "../types";

// Paper 2 — Political Science (UGC NET Code 02), verbatim from the official
// UGC/NTA syllabus PDF. Topic tags are derived from each unit's listed contents.
const paper2: PaperSyllabus = {
  paper: 2,
  title: "Political Science",
  units: [
    {
      number: 1,
      name: "Political Theory",
      topics: [
        "Concepts (Liberty, Equality, Justice, Rights)",
        "Democracy, Power, Citizenship",
        "Liberalism & Conservatism",
        "Socialism & Marxism",
        "Feminism & Ecologism",
        "Multiculturalism & Postmodernism",
      ],
    },
    {
      number: 2,
      name: "Political Thought (Western)",
      topics: [
        "Ancient (Confucius, Plato, Aristotle)",
        "Early Modern (Machiavelli, Hobbes, Locke, Rousseau)",
        "Hegel, J.S. Mill, Wollstonecraft",
        "Marx, Gramsci",
        "Arendt, Fanon, Mao, Rawls",
      ],
    },
    {
      number: 3,
      name: "Indian Political Thought",
      topics: [
        "Ancient & Medieval (Kautilya, Barani, Kabir)",
        "Nationalist (Tilak, Gandhi, Aurobindo, Tagore)",
        "Ambedkar, Nehru, M.N. Roy",
        "Periyar, Iqbal, Savarkar",
        "Lohia, JP Narayan, Upadhyaya",
      ],
    },
    {
      number: 4,
      name: "Comparative Political Analysis",
      topics: [
        "Approaches & Comparative Methods",
        "Colonialism & Nationalism",
        "State theory & Political regimes",
        "Constitutions & Constitutionalism",
        "Democratisation & Development",
        "Power structures, Parties & Movements",
      ],
    },
    {
      number: 5,
      name: "International Relations",
      topics: [
        "Approaches (Realism, Idealism, Constructivism)",
        "Core concepts (Power, Sovereignty, Security)",
        "Conflict, Peace & WMD",
        "United Nations & International Law",
        "Political Economy & Global governance",
        "Regional organisations & Contemporary challenges",
      ],
    },
    {
      number: 6,
      name: "India's Foreign Policy",
      topics: [
        "Perspectives & determinants",
        "Non-Alignment & Nuclear policy",
        "Relations with major powers (USA, Russia, China)",
        "Multipolar engagement (BRICS, ASEAN, SCO)",
        "Neighbourhood policy (SAARC, Act East)",
        "Contemporary challenges (security, refugees)",
      ],
    },
    {
      number: 7,
      name: "Political Institutions in India",
      topics: [
        "Making of the Constitution & Constituent Assembly",
        "Philosophy of the Constitution (FR, DPSP)",
        "Constitutionalism & Basic Structure",
        "Union Executive, Parliament & Judiciary",
        "Federalism & State institutions",
        "Elections, Local Govt & Constitutional Bodies",
      ],
    },
    {
      number: 8,
      name: "Political Processes in India",
      topics: [
        "State, Economy & Development",
        "Globalisation & its implications",
        "Identity Politics & Social Movements",
        "Civil Society & Regionalisation",
        "Gender and Politics",
        "Political Parties & Electoral Politics",
      ],
    },
    {
      number: 9,
      name: "Public Administration",
      topics: [
        "Meaning, evolution & approaches",
        "PA theories (NPA, NPM, Development Admin)",
        "Theories of Organization",
        "Leadership & Motivation",
        "Organisational Communication",
        "Conflict management & MBO",
      ],
    },
    {
      number: 10,
      name: "Governance and Public Policy in India",
      topics: [
        "Governance & good governance",
        "Accountability & control",
        "Good governance mechanisms (RTI, Lokpal)",
        "Grassroots Governance (PRIs)",
        "Planning & Development (NITI Aayog, e-governance)",
        "Public policy (MNREGA, RTE, social audit)",
      ],
    },
  ],
};

// Paper 1 — Teaching & Research Aptitude (common to all UGC NET candidates).
const paper1: PaperSyllabus = {
  paper: 1,
  title: "Teaching & Research Aptitude (Paper 1)",
  units: [
    {
      number: 1,
      name: "Teaching Aptitude",
      topics: [
        "Concept, objectives & levels of teaching",
        "Characteristics & basic requirements",
        "Learner & teacher characteristics",
        "Methods of teaching & teaching aids",
        "Evaluation systems",
      ],
    },
    {
      number: 2,
      name: "Research Aptitude",
      topics: [
        "Meaning, types & characteristics of research",
        "Methods & steps of research",
        "Thesis & article writing",
        "Research ethics",
        "Application of ICT in research",
      ],
    },
    {
      number: 3,
      name: "Comprehension",
      topics: ["Reading comprehension of a passage"],
    },
    {
      number: 4,
      name: "Communication",
      topics: [
        "Meaning, types & characteristics",
        "Effective & barriers to communication",
        "Mass-media & society",
      ],
    },
    {
      number: 5,
      name: "Mathematical Reasoning & Aptitude",
      topics: [
        "Number series, letter series, codes",
        "Relationships & classification",
        "Mathematical aptitude (fraction, time, ratio)",
      ],
    },
    {
      number: 6,
      name: "Logical Reasoning",
      topics: [
        "Structure of arguments & syllogism",
        "Evaluating & distinguishing deductive/inductive",
        "Venn diagrams",
        "Indian logic (Pramanas)",
      ],
    },
    {
      number: 7,
      name: "Data Interpretation",
      topics: [
        "Sources & types of data",
        "Quantitative & qualitative data",
        "Graphical representation & mapping",
      ],
    },
    {
      number: 8,
      name: "Information & Communication Technology (ICT)",
      topics: [
        "ICT: general abbreviations & terminology",
        "Basics of internet, intranet, email",
        "Digital initiatives in higher education",
        "ICT and governance",
      ],
    },
    {
      number: 9,
      name: "People, Development & Environment",
      topics: [
        "Development & environment (Millennium goals, SDGs)",
        "Human & environment interaction",
        "Pollution & natural hazards",
        "Environmental protection & policies",
      ],
    },
    {
      number: 10,
      name: "Higher Education System",
      topics: [
        "Institutions & governance",
        "Evolution of higher learning in India",
        "Value education & environmental education",
        "Policies & administration",
      ],
    },
  ],
};

export const SYLLABUS: PaperSyllabus[] = [paper2, paper1];

export function getPaper(paper: number): PaperSyllabus | undefined {
  return SYLLABUS.find((p) => p.paper === paper);
}

export function getUnit(paper: number, unit: number) {
  return getPaper(paper)?.units.find((u) => u.number === unit);
}
