// index.js (CommonJS version)
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// ---------------------------
// Embedded crimes dataset
// ---------------------------
const crimes = [
  { id: 1, name: "Murder (IPC 302)", ingredients: ["Intention to kill", "Knowledge that act is likely to cause death"], punishment: "Life imprisonment or death penalty + fine", cognizable: true, bailable: false, compoundable: false, severity: 10, section: "IPC 302", description: "Intentional killing of a person." },
  { id: 2, name: "Attempt to Murder (IPC 307)", ingredients: ["Intent to cause death", "Act done towards committing murder"], punishment: "Up to 10 years or life imprisonment", cognizable: true, bailable: false, compoundable: false, severity: 9, section: "IPC 307", description: "Attempted act with intention to kill." },
  { id: 3, name: "Culpable Homicide Not Amounting to Murder (IPC 304)", ingredients: ["Act causing death", "Without intention to kill", "Knowledge of likely death"], punishment: "Up to 10 years or life imprisonment", cognizable: true, bailable: true, compoundable: false, severity: 9, section: "IPC 304", description: "Unintentional causing of death with knowledge of risk." },
  { id: 4, name: "Rape (IPC 376)", ingredients: ["Sexual intercourse without consent", "Force, coercion, threat, or intoxication"], punishment: "10 years to life imprisonment", cognizable: true, bailable: false, compoundable: false, severity: 10, section: "IPC 376", description: "Sexual assault without consent." },
  { id: 5, name: "Gang Rape (IPC 376D)", ingredients: ["Rape committed by a group", "Victim helpless or overpowered"], punishment: "20 years to life imprisonment", cognizable: true, bailable: false, compoundable: false, severity: 10, section: "IPC 376D", description: "Rape by multiple offenders." },
  { id: 6, name: "Kidnapping (IPC 363)", ingredients: ["Forcefully taking a person", "Taking minor without guardian consent"], punishment: "Up to 7 years + fine", cognizable: true, bailable: true, compoundable: false, severity: 8, section: "IPC 363", description: "Taking a person away illegally by force." },
  { id: 7, name: "Kidnapping for Ransom (IPC 364A)", ingredients: ["Kidnapping", "Demanding ransom", "Threat to cause death or hurt"], punishment: "Life imprisonment or death penalty", cognizable: true, bailable: false, compoundable: false, severity: 10, section: "IPC 364A", description: "Kidnapping with ransom or threat." },
  { id: 8, name: "Dowry Death (IPC 304B)", ingredients: ["Woman dies within 7 years of marriage", "Cruelty or harassment for dowry"], punishment: "7 years to life imprisonment", cognizable: true, bailable: false, compoundable: false, severity: 10, section: "IPC 304B", description: "Death related to dowry harassment." },
  { id: 9, name: "Domestic Violence (DV Act)", ingredients: ["Physical, emotional, sexual, or economic abuse", "Against woman in household"], punishment: "Protection order, arrest depending on offense", cognizable: true, bailable: true, compoundable: true, severity: 7, section: "DV Act", description: "Abuse within household." },
  { id: 10, name: "Cruelty by Husband or Relatives (IPC 498A)", ingredients: ["Cruelty", "Harassment for dowry", "Mental or physical torture"], punishment: "Up to 3 years + fine", cognizable: true, bailable: false, compoundable: false, severity: 7, section: "IPC 498A", description: "Cruelty to married woman by husband/relatives." },
  { id: 11, name: "Assault (IPC 351/352)", ingredients: ["Attempt to apply force", "Intent to cause fear or harm"], punishment: "Up to 3 months or fine", cognizable: false, bailable: true, compoundable: true, severity: 4, section: "IPC 351/352", description: "Attempt or threat of physical harm." },
  { id: 12, name: "Grievous Hurt (IPC 325)", ingredients: ["Causing serious injury", "Intent to hurt"], punishment: "Up to 7 years + fine", cognizable: true, bailable: true, compoundable: false, severity: 8, section: "IPC 325", description: "Serious bodily injury." },
  { id: 13, name: "Acid Attack (IPC 326A)", ingredients: ["Throwing acid", "Causing permanent damage"], punishment: "10 years to life imprisonment", cognizable: true, bailable: false, compoundable: false, severity: 10, section: "IPC 326A", description: "Use of acid to cause disfigurement or injury." },
  { id: 14, name: "Theft (IPC 378/379)", ingredients: ["Dishonest intention", "Taking property without consent"], punishment: "Up to 3 years or fine", cognizable: true, bailable: true, compoundable: true, severity: 3, section: "IPC 378/379", description: "Dishonest removal of property." },
  { id: 15, name: "Robbery (IPC 392)", ingredients: ["Theft with violence or fear", "Use of force"], punishment: "Up to 10 years + fine", cognizable: true, bailable: false, compoundable: false, severity: 8, section: "IPC 392", description: "Stealing property using violence or threat." },
  { id: 16, name: "Dacoity (IPC 395)", ingredients: ["Five or more persons", "Committed robbery together"], punishment: "10 years to life imprisonment", cognizable: true, bailable: false, compoundable: false, severity: 9, section: "IPC 395", description: "Robbery by five or more persons." },
  { id: 17, name: "Burglary/Housebreaking (IPC 454/457)", ingredients: ["Breaking into house", "Intent to commit offense"], punishment: "Up to 14 years", cognizable: true, bailable: false, compoundable: false, severity: 7, section: "IPC 454/457", description: "Breaking into a house to commit an offense." },
  { id: 18, name: "Cheating (IPC 420)", ingredients: ["Deception", "Dishonest inducement", "Wrongful gain"], punishment: "Up to 7 years + fine", cognizable: true, bailable: false, compoundable: true, severity: 6, section: "IPC 420", description: "Cheating and dishonestly inducing delivery of property." },
  { id: 19, name: "Forgery (IPC 465/468)", ingredients: ["Making false document", "Intention to cheat"], punishment: "Up to 7 years + fine", cognizable: true, bailable: true, compoundable: false, severity: 6, section: "IPC 465/468", description: "Creating false documents with intent to cheat." },
  { id: 20, name: "Cyber Fraud (IT Act 66D)", ingredients: ["Cheating using digital means", "Impersonation", "Dishonest intention"], punishment: "Up to 3 years + fine", cognizable: true, bailable: true, compoundable: false, severity: 6, section: "IT Act 66D", description: "Fraud committed using electronic means." },
  { id: 21, name: "Identity Theft (IT Act 66C)", ingredients: ["Fraudulent use of identity", "Using electronic signatures or passwords"], punishment: "Up to 3 years + fine", cognizable: true, bailable: true, compoundable: false, severity: 6, section: "IT Act 66C", description: "Fraudulent use of someone's identity online." },
  { id: 22, name: "Cyber Stalking", ingredients: ["Repeated online harassment", "Threatening messages"], punishment: "Up to 3 years + fine", cognizable: true, bailable: true, compoundable: false, severity: 6, section: "IT Act / IPC (related)", description: "Persistent online harassment or threats." },
  { id: 23, name: "Publishing Obscene Material Online (IT Act 67)", ingredients: ["Publishing sexual content", "Intent to distribute"], punishment: "Up to 5 years + fine", cognizable: true, bailable: false, compoundable: false, severity: 7, section: "IT Act 67", description: "Distribution of obscene content online." },
  { id: 24, name: "Child Pornography (IT Act 67B)", ingredients: ["Publishing child sexual material", "Sharing or browsing illegal content"], punishment: "5–7 years + fine", cognizable: true, bailable: false, compoundable: false, severity: 10, section: "IT Act 67B", description: "Child sexual abuse material online." },
  { id: 25, name: "Drug Possession (NDPS Act)", ingredients: ["Possession of banned substances", "Without medical authorization"], punishment: "Up to 10 years to life imprisonment", cognizable: true, bailable: false, compoundable: false, severity: 9, section: "NDPS Act", description: "Possession or trafficking of illegal drugs." },
  { id: 26, name: "Human Trafficking (IPC 370)", ingredients: ["Buying/selling humans", "Exploitation"], punishment: "Up to life imprisonment", cognizable: true, bailable: false, compoundable: false, severity: 10, section: "IPC 370", description: "Trafficking and exploitation of persons." },
  { id: 27, name: "Defamation (IPC 499/500)", ingredients: ["False statement", "Damaging reputation"], punishment: "Up to 2 years or fine", cognizable: false, bailable: true, compoundable: true, severity: 3, section: "IPC 499/500", description: "Harming someone's reputation by false statements." },
  { id: 28, name: "Public Nuisance (IPC 268/290)", ingredients: ["Act causing annoyance to public"], punishment: "Fine up to \u20b9200", cognizable: false, bailable: true, compoundable: true, severity: 2, section: "IPC 268/290", description: "Acts causing public annoyance." },
  { id: 29, name: "Trespassing (IPC 447)", ingredients: ["Entering property without consent"], punishment: "Up to 3 months or fine", cognizable: true, bailable: true, compoundable: true, severity: 2, section: "IPC 447", description: "Entering property without permission." },
  { id: 30, name: "Rioting (IPC 147)", ingredients: ["Unlawful assembly", "Violent actions"], punishment: "Up to 2 years imprisonment", cognizable: true, bailable: true, compoundable: false, severity: 6, section: "IPC 147", description: "Violent unlawful assembly." },
  { id: 31, name: "Arson (IPC 435/436)", ingredients: ["Setting fire intentionally"], punishment: "Up to life imprisonment", cognizable: true, bailable: false, compoundable: false, severity: 9, section: "IPC 435/436", description: "Deliberate setting of fire." },
  { id: 32, name: "Bribery (Prevention of Corruption Act)", ingredients: ["Offering/accepting illegal gratification"], punishment: "Up to 7 years", cognizable: true, bailable: false, compoundable: false, severity: 8, section: "Prevention of Corruption Act", description: "Corruption and bribery by public servants or private persons." },
  { id: 33, name: "Money Laundering (PMLA)", ingredients: ["Concealing proceeds of crime", "Projecting money as legal"], punishment: "Up to 7 years", cognizable: true, bailable: false, compoundable: false, severity: 9, section: "PMLA", description: "Processing proceeds of crime to appear legitimate." },
  { id: 34, name: "Extortion (IPC 384)", ingredients: ["Threatening", "Obtaining property"], punishment: "Up to 3 years", cognizable: true, bailable: false, compoundable: true, severity: 6, section: "IPC 384", description: "Obtaining property by threat." },
  { id: 35, name: "Criminal Intimidation (IPC 506)", ingredients: ["Threatening person", "Intent to cause alarm"], punishment: "Up to 2–7 years", cognizable: true, bailable: true, compoundable: true, severity: 6, section: "IPC 506", description: "Threats causing alarm or fear." },
  { id: 36, name: "Sexual Harassment (IPC 354A)", ingredients: ["Unwelcome physical/sexual act", "Demand for sexual favours"], punishment: "1–3 years", cognizable: true, bailable: false, compoundable: false, severity: 7, section: "IPC 354A", description: "Sexual harassment at workplace or public." },
  { id: 37, name: "Stalking (IPC 354D)", ingredients: ["Following/contacting woman repeatedly", "Against her wishes"], punishment: "Up to 3 years", cognizable: true, bailable: true, compoundable: false, severity: 6, section: "IPC 354D", description: "Repeated unwanted following or contact." },
  { id: 38, name: "Voyeurism (IPC 354C)", ingredients: ["Watching/recording woman without consent"], punishment: "1–3 years", cognizable: true, bailable: false, compoundable: false, severity: 7, section: "IPC 354C", description: "Surreptitious watching or recording." },
  { id: 39, name: "Attempt to Suicide (IPC 309)", ingredients: ["Attempting to take own life"], punishment: "Up to 1 year", cognizable: true, bailable: true, compoundable: false, severity: 5, section: "IPC 309", description: "Attempted suicide (legal position varies)." },
  { id: 40, name: "Public Gambling (Public Gambling Act)", ingredients: ["Operating or participating in gambling house"], punishment: "Fine or short imprisonment", cognizable: false, bailable: true, compoundable: true, severity: 3, section: "Public Gambling Act", description: "Operating or participating in gambling." },
  { id: 41, name: "Illegal Arms Possession (Arms Act)", ingredients: ["Possession of unauthorized weapons"], punishment: "Up to 7 years", cognizable: true, bailable: false, compoundable: false, severity: 9, section: "Arms Act", description: "Possession or trafficking of illegal arms." },
  { id: 42, name: "Hit and Run (Motor Vehicles Act)", ingredients: ["Causing accident", "Fleeing scene"], punishment: "Up to 2 years", cognizable: true, bailable: true, compoundable: true, severity: 6, section: "MV Act", description: "Leaving the scene after causing accident." },
  { id: 43, name: "Drunk Driving (MV Act)", ingredients: ["Driving with BAC above limit"], punishment: "Fine + imprisonment", cognizable: true, bailable: true, compoundable: true, severity: 5, section: "MV Act", description: "Driving under influence of alcohol." },
  { id: 44, name: "Counterfeit Currency (IPC 489A)", ingredients: ["Making fake currency", "Possessing with intent to use"], punishment: "Up to life imprisonment", cognizable: true, bailable: false, compoundable: false, severity: 9, section: "IPC 489A", description: "Counterfeiting or handling fake currency." },
  { id: 45, name: "Violation of COVID Guidelines (Epidemic Diseases Act)", ingredients: ["Disobeying government health rules"], punishment: "Up to 2 years + fine", cognizable: true, bailable: true, compoundable: true, severity: 4, section: "Epidemic Diseases Act", description: "Breach of public health orders." },
  { id: 46, name: "Misuse of Emergency Helpline (IPC 182)", ingredients: ["Giving false information to police"], punishment: "Up to 6 months", cognizable: false, bailable: true, compoundable: true, severity: 2, section: "IPC 182", description: "Providing false information to public servant." },
  { id: 47, name: "Causing Death by Negligence (IPC 304A)", ingredients: ["Negligent act", "Death caused without intention"], punishment: "Up to 2 years", cognizable: true, bailable: true, compoundable: false, severity: 7, section: "IPC 304A", description: "Death caused by negligent act." },
  { id: 48, name: "Obscene Acts in Public (IPC 294)", ingredients: ["Obscene act", "Annoyance to public"], punishment: "Up to 3 months", cognizable: true, bailable: true, compoundable: true, severity: 3, section: "IPC 294", description: "Obscene acts in public causing annoyance." },
  { id: 49, name: "Violation of Court Orders (Contempt of Court Act)", ingredients: ["Wilful disobedience"], punishment: "Up to 6 months", cognizable: true, bailable: true, compoundable: false, severity: 5, section: "Contempt of Court", description: "Wilful disobedience of court orders." },
  { id: 50, name: "Molestation (IPC 354)", ingredients: ["Assault with intent to outrage modesty"], punishment: "Up to 5 years", cognizable: true, bailable: false, compoundable: false, severity: 8, section: "IPC 354", description: "Assault or molestation of a woman." }
];

// ---------------------------
// Utility helpers
// ---------------------------
function parseBool(val) {
  if (val === undefined || val === null) return undefined;
  if (typeof val === "boolean") return val;
  const s = String(val).toLowerCase();
  if (s === "true" || s === "1" || s === "yes") return true;
  if (s === "false" || s === "0" || s === "no") return false;
  return undefined;
}

function paginate(array, page = 1, limit = 50) {
  const p = Math.max(Number(page) || 1, 1);
  const l = Math.max(Number(limit) || 50, 1);
  const start = (p - 1) * l;
  const end = start + l;
  return {
    page: p,
    limit: l,
    total: array.length,
    totalPages: Math.ceil(array.length / l),
    data: array.slice(start, end)
  };
}

// ---------------------------
// Routes
// ---------------------------
app.get("/v1/crimes", (req, res) => {
  try {
    const { q, cognizable, bailable, compoundable, page, limit, sortBy } = req.query;

    let results = crimes.slice();

    // search
    if (q) {
      const ql = String(q).toLowerCase();
      results = results.filter((c) => {
        return (
          (c.name || "").toLowerCase().includes(ql) ||
          (c.section || "").toLowerCase().includes(ql) ||
          (c.description || "").toLowerCase().includes(ql) ||
          (Array.isArray(c.ingredients) && c.ingredients.join(" ").toLowerCase().includes(ql))
        );
      });
    }

    // filters
    const cb = parseBool(cognizable);
    if (typeof cb === "boolean") results = results.filter((r) => Boolean(r.cognizable) === cb);

    const bb = parseBool(bailable);
    if (typeof bb === "boolean") results = results.filter((r) => Boolean(r.bailable) === bb);

    const cp = parseBool(compoundable);
    if (typeof cp === "boolean") results = results.filter((r) => Boolean(r.compoundable) === cp);

    // sorting
    if (sortBy === "severity_desc") results.sort((a, b) => b.severity - a.severity);
    else if (sortBy === "severity_asc") results.sort((a, b) => a.severity - b.severity);
    else results.sort((a, b) => String(a.name).localeCompare(String(b.name)));

    // pagination
    const pageNum = Number(page) || 1;
    const lim = Number(limit) || 50;
    const pageObj = paginate(results, pageNum, lim);

    return res.json({ data: pageObj.data, meta: { total: pageObj.total, page: pageObj.page, limit: pageObj.limit, totalPages: pageObj.totalPages } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/v1/crimes/:id", (req, res) => {
  try {
    const id = Number(req.params.id);
    const item = crimes.find((c) => c.id === id);
    if (!item) return res.status(404).json({ error: "Not found" });
    return res.json({ data: item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/", (req, res) => {
  res.json({ message: "Crimes API running. Use /v1/crimes" });
});

app.listen(PORT, () => {
  console.log(`Crimes API listening on http://localhost:${PORT}`);
});

// Export app for testing or external uses (optional)
module.exports = app;
