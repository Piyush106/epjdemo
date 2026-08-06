/**
 * EP Journals Group editorial advisory board.
 *
 * Single source of truth, shared between the server component (which emits the
 * ItemList + Person JSON-LD so members and their ORCID/Scopus identifiers are
 * crawlable in the initial HTML — an E-E-A-T / entity-authority signal) and the
 * client view that renders the visible list.
 *
 * This is ONE consolidated board common to every journal on the site: members
 * are NOT grouped by, or labelled with, the individual journal they serve. Where
 * a person appears on more than one journal's board in the source directory,
 * they are listed once here.
 *
 * ORDERING (see `sortBoard`): members are ranked by the strength of their
 * verifiable scholarly identifiers — those with both an ORCID iD and a Scopus
 * Author ID rank highest, then ORCID holders, then other indexed profiles, with
 * members carrying no public identifier last. Within a rank, members are ordered
 * by ORCID iD. The array is exported already sorted.
 */
export interface EditorialBoardMember {
  name: string;
  /** e.g. "PhD, Mechanical Engineering" */
  credentials: string;
  /** Academic role + institution + country (never the journal they serve). */
  affiliation: string;
  orcid?: string;
  scopusId?: string;
  /** Web of Science / Publons ResearcherID. */
  wos?: string;
  /** SINTA (Indonesian science index) author ID. */
  sinta?: string;
}

// Source order is irrelevant — the export is sorted by `sortBoard`.
const RAW_BOARD: EditorialBoardMember[] = [
  { name: "Prof. Dr. Hasan Köten", credentials: "PhD, Mechanical Engineering", affiliation: "Head, Department of Mechanical Engineering, Istanbul Medeniyet University, Turkey", orcid: "0000-0002-1907-9420", scopusId: "36157946800" },
  { name: "Dr. Harsh Vardhan Harsh", credentials: "PhD, Mathematics", affiliation: "Associate Professor, Parul University, Vadodara, India", orcid: "0000-0003-1310-8400", scopusId: "57105665500" },
  { name: "Prof. Emad Toma Bane Karash", credentials: "PhD, Mechanical Engineering", affiliation: "Professor, Al-Amarah University College, Iraq", orcid: "0000-0001-8202-4038", scopusId: "50661453100", wos: "9759-2019" },
  { name: "Dr. M. Raju", credentials: "PhD, Computer Science and Engineering", affiliation: "Head and Professor, Department of Computer Science and Engineering, Nalla Malla Reddy Engineering College, India", orcid: "0009-0007-3444-6376", scopusId: "58246307000", wos: "LTE-0241-2024" },
  { name: "Dr. Megha (Bakshi) Singh", credentials: "PhD, Management", affiliation: "Assistant Professor, Balaji Institute of Management and Human Resource Development, Sri Balaji University, Pune, India", orcid: "0000-0002-2651-3184", scopusId: "58209922200", wos: "MYQ-4444-2025" },
  { name: "Assoc. Prof. Dr. Ahmed Hameed Kaleel", credentials: "PhD, Mechanical Engineering", affiliation: "H.R. Manager, College of Engineering, Iraq", scopusId: "35118884500" },
  { name: "Dr. Mohammad Taghipour", credentials: "PhD, Industrial Engineering", affiliation: "Young Researchers and Elites Club, Science and Research Branch, Islamic Azad University, Tehran, Iran", orcid: "0000-0003-3720-3795" },
  { name: "Dr. Ali Kaya (Ali Mohammadiounotikandi)", credentials: "PhD, Artificial Intelligence and Robotics", affiliation: "CEO and Director, AI Infinity Ltd Co., United Kingdom", orcid: "0000-0001-7727-9511" },
  { name: "Dr. Emmanuel Chika Obizue", credentials: "PhD, Banking and Finance", affiliation: "Lecturer, Peaceland College of Education, Nigeria", orcid: "0009-0002-9119-1668" },
  { name: "Dr. Iwegbue Ishioma Nwanapayi", credentials: "PhD, Library Science", affiliation: "Lecturer, Department of Library and Information Science, Dennis Osadebay University, Asaba, Delta State, Nigeria", orcid: "0000-0001-8633-0788" },
  { name: "Dr. Gerald Malabarbas", credentials: "PhD, Education in Educational Management", affiliation: "Professor and Research Director, Christ the King College of Calbayog City, Samar, Philippines", orcid: "0000-0002-4080-8333" },
  { name: "Dr. Torang Siregar", credentials: "PhD, Mathematics Education", affiliation: "Department of Mathematics Education, Faculty of Tarbiyah and Teacher Training (FTIK), State Institute for Islamic Studies (IAIN) Padangsidimpuan, Indonesia", orcid: "0009-0006-1416-0461", wos: "ONJ-9824-2025" },
  { name: "Prof. Dr. H. Mahfudnurnajamuddin, S.E., M.M., CRA., CRP", credentials: "PhD, Management Science", affiliation: "Professor of Finance and Management, Faculty of Economics and Business, Universitas Muslim Indonesia, Indonesia", sinta: "6645740" },
  { name: "Dr. Methodius N. Kiarie", credentials: "PhD, Project Planning and Management", affiliation: "Senior Project Management Professional, Kenya Power and Lighting Company (KPLC), Kenya" },
  { name: "Dr. Alaba Lawrence Aladejana", credentials: "PhD, Science Education (Physics Option)", affiliation: "Senior Lecturer, Bamidele Olumilua University of Education, Science and Technology, Ikere-Ekiti, Ekiti State, Nigeria" },
  { name: "Dr. Nwokeocha Ifeanyi Martins", credentials: "PhD, Mass Communication and Media Studies", affiliation: "Lecturer, Federal University, Otuoke, Bayelsa State, Nigeria" },
  { name: "Dr. Sunny Nwakanma", credentials: "PhD, Vocational and Technical Education", affiliation: "Senior Lecturer, Department of Technical Education (Electrical/Electronic Option), Ignatius Ajuru University of Education, Port Harcourt, Rivers State, Nigeria" },
  { name: "Dr. Addi Juma Faki", credentials: "PhD, Monitoring and Evaluation Systems", affiliation: "Senior Planning Officer, Zanzibar Planning Commission, Tanzania" },
  { name: "Dr. Donia Khalfallah", credentials: "PhD, Regional Science and Business Administration", affiliation: "Assistant Lecturer, Department of International and Applied Economics, Széchenyi István University, Hungary" },
  { name: "Dr. Fadele Ayotunde Alaba", credentials: "PhD, Computer Science", affiliation: "Lecturer, Department of Computer Science, Federal University of Education, Zaria, Nigeria" },
  { name: "Dr. Chukwuebuka Okwonna", credentials: "PhD, Mechanical Engineering (Industrial Production and Design)", affiliation: "Senior Lecturer and Research Coordinator, Department of Mechanical Engineering, Abia State University, Nigeria" },
  { name: "Prof. Dr. Brahim Necib", credentials: "PhD, Aeronautics and Astronautics", affiliation: "Professor and Researcher, Mechanical Engineering Department, Faculty of Technological Sciences, University of Mentouri Constantine, Algeria" },
  { name: "Dr. Nhorito Shadreck", credentials: "PhD, Accounting", affiliation: "Lecturer, Midlands State University, Zimbabwe" },
  { name: "Assist. Prof. Dr. Jabbar Saadoon Daraj", credentials: "PhD, Economics and Management", affiliation: "Assistant Professor of Economics, Al-Nahrain University, Baghdad, Iraq" },
  { name: "Dr. Ojji M. Chinedu (MAMN, ANIMN)", credentials: "PhD, Business Administration", affiliation: "Department of Business Administration, Faculty of Social and Management Sciences, Benson Idahosa University, Nigeria" },
  { name: "Dr. Varadaraj Aravamudhan", credentials: "PhD, Management", affiliation: "Professor of Management Studies, Alliance University, India" },
  { name: "Dr. Ana Lucia Andrade Carrión", credentials: "PhD, Infantile Psychology and Early Childhood Education", affiliation: "Professor, Faculty of Education, Art and Communication, Universidad Nacional de Loja, Ecuador" },
];

/**
 * Identifier strength score. ORCID is weighted highest, then Scopus, then other
 * indexed profiles — so ORCID+Scopus holders sort to the top and members with no
 * public identifier to the bottom.
 */
function idScore(m: EditorialBoardMember): number {
  return (m.orcid ? 4 : 0) + (m.scopusId ? 2 : 0) + (m.wos ? 1 : 0) + (m.sinta ? 1 : 0);
}

export function sortBoard(list: EditorialBoardMember[]): EditorialBoardMember[] {
  return [...list].sort((a, b) => {
    const s = idScore(b) - idScore(a);
    if (s !== 0) return s;
    // Within a rank, order by ORCID iD; ORCID holders precede non-holders.
    if (a.orcid && b.orcid) return a.orcid.localeCompare(b.orcid);
    if (a.orcid) return -1;
    if (b.orcid) return 1;
    return a.name.localeCompare(b.name);
  });
}

export const EDITORIAL_BOARD: EditorialBoardMember[] = sortBoard(RAW_BOARD);
