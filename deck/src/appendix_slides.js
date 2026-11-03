// New / rebuilt appendix slides. Keys are referenced by merge.py's ORDER list.
const H = require("./helpers.js");
const { pres, newSlide, footer, iconCircle, apKicker, bgFill, bulletBlock, ghChip, tableSlideBasic, cardShape,
  diaPill, diaBox, diaArrow, diaLabel, tagPill, apCover,
  NAVY, NAVY2, STEEL, ICE, TEAL, TEAL_DK, WHITE, BG_SUBTLE, TEXT_DARK, TEXT_MUTED, F_HEAD, F_BODY } = H;

// ===================================================================== COVERS
apCover({ n: 1, work: true, title: "RedfishAutoYamlTestInterview", icon: "FiCheckCircle", color: TEAL,
  tagline: "Document-driven validation design — tests as documents from the vendor spec, pytest underneath, no mock BMC.",
  chips: ["Design", "Trade-offs", "HTML Report", "YAML Visualizer", "vs. DMTF", "Two Phases", "Evolution", "Scale & Safety", "AI Workflow", "Agent I/O", "What It Caught"],
  gh: "github.com/JohnBlue-git/RedfishAutoYamlTestInterview" });
apCover({ n: 2, title: "HTTPS-Guard", icon: "FiShield", color: TEAL_DK,
  tagline: "eBPF runtime intrusion detection for OpenBMC — detect, classify, dispatch, and provably testable.",
  chips: ["Architecture", "Detections", "Classes", "Tests", "Session Binding", "Build", "Debugging", "Limits"],
  gh: "github.com/JohnBlue-git/HTTPS-Guard" });
apCover({ n: 3, title: "QEMU-eBPF-Sandbox", icon: "FiCpu", color: TEAL_DK,
  tagline: "One kernel source, three user-space philosophies — the eBPF development framework HTTPS-Guard builds on.",
  chips: ["Design Variants", "Class Hierarchy", "Shared Invariant"], gh: "github.com/JohnBlue-git/QEMU-eBPF-Sandbox" });
apCover({ n: 4, title: "HTTPS_Notes", icon: "FiLock", color: TEAL_DK,
  tagline: "TLS / PKI / HTTP security, written down from fundamentals to a real bmcweb walkthrough.",
  chips: ["7-Part Guide", "Handshake Flow", "Real Attacks & Commands"], gh: "github.com/JohnBlue-git/HTTPS_Notes" });
apCover({ n: 5, title: "MultiFish", icon: "FiDatabase", color: STEEL,
  tagline: "A Go HTTP service managing multiple BMC platforms — and a source-code tour, not just an architecture diagram.",
  chips: ["Architecture", "Generics & Interfaces", "Concurrency", "Providers & Scheduler", "Ops Maturity"], gh: "github.com/JohnBlue-git/MultiFish" });
apCover({ n: 6, title: "HowToSDBusPlus", icon: "FiGitBranch", color: STEEL,
  tagline: "From raw sd-bus to generated, async D-Bus services — with the trade-offs actually benchmarked.",
  chips: ["Codegen Pipeline", "Benchmarked Trade-offs"], gh: "github.com/JohnBlue-git/HowToSDBusPlus" });
apCover({ n: 7, title: "GoVarlink", icon: "FiLink2", color: STEEL,
  tagline: "Polyglot lightweight IPC via Varlink — one interface, four runtimes, measured against D-Bus.",
  chips: ["Four Runtimes", "D-Bus vs. Varlink"], gh: "github.com/JohnBlue-git/GoVarlink" });
apCover({ n: 8, title: "HowToYocto", icon: "FiPackage", color: STEEL,
  tagline: "Custom Yocto/BitBake image build practice — the layer, recipe, and image work behind every other project.",
  chips: ["Build Practice"], gh: "github.com/JohnBlue-git/HowToYocto" });
apCover({ n: 9, title: "HowToPLDM", icon: "FiCpu", color: STEEL,
  tagline: "A real MCTP/PLDM driver stack on QEMU AST2600 — honestly scoped, debugged down to a single byte.",
  chips: ["Honest Scope", "Layer Map", "Byte by Byte", "I2C Timing Bug"], gh: "github.com/JohnBlue-git/HowToPLDM" });

// ===================================================================== REDFISH 3/11 & 4/11 — Visualization (screenshots from the repo)
const IMG = require("path").join(__dirname, "..", "img");
function shot(s, file, x, y, w, aspect) {
  const h = w / aspect;
  s.addShape(pres.ShapeType.rect, { x: x - 0.02, y: y - 0.02, w: w + 0.04, h: h + 0.04, fill: { color: WHITE }, line: { color: "CBD8E4", width: 1 } });
  s.addImage({ path: `${IMG}/${file}`, x, y, w, h });
  return y + h;
}
function shotLabel(s, x, y, w, lead, rest, c) {
  s.addText([{ text: lead, options: { bold: true, color: c || TEAL_DK } }, { text: rest, options: { color: TEXT_DARK } }],
    { x, y, w, h: 0.28, fontFace: F_BODY, fontSize: 10.5, isTextBox: true, margin: 0, valign: "bottom" });
}
{
  const s = newSlide("rReport");
  bgFill(s, WHITE);
  apKicker(s, "Appendix · Redfish Platform 3/11 · Work Project", "What a Run Looks Like: The HTML Report", { icon: "FiActivity", circleColor: TEAL_DK, titleSize: 26 });
  const lx = 0.6, lw = 6.35, rx = 7.2, rw = 5.53;
  shotLabel(s, lx, 1.55, lw, "One page per run — ", "filter by category, operation and schema");
  shot(s, "report_summary.png", lx, 1.9, lw, 1300 / 335);
  shotLabel(s, lx, 4.28, lw, "A sequence — ", "every step is its own row (step n/5)");
  shot(s, "3-group-steps.png", lx, 4.63, lw, 1260 / 284);
  shotLabel(s, rx, 1.55, rw, "FAIL — ", "lists every missing property, not just the first", "C0392B");
  shot(s, "4-failed-row.png", rx, 1.9, rw, 1323 / 250);
  shotLabel(s, rx, 3.08, rw, "WARN — ", "the request as curl, plus undeclared properties", "C77700");
  shot(s, "5-warning-row.png", rx, 3.43, rw, 1323 / 308);
  shotLabel(s, rx, 4.85, rw, "SKIP — ", "an earlier step failed; the unsent curl is still shown", "9A7B00");
  shot(s, "6-skipped-row.png", rx, 5.2, rw, 1323 / 223);
  s.addText("Built on pytest-html: one self-contained page per run, and every request replayable as a curl command — even for steps that were never sent. Company, rig address, platform names and result counts are masked in these screenshots.", {
    x: 0.6, y: 6.32, w: 12.13, h: 0.55, fontFace: F_BODY, fontSize: 10.5, italic: true, color: TEXT_MUTED, isTextBox: true, margin: 0, lineSpacingMultiple: 1.12,
  });
  footer(s, "Yujen Lan  ·  Appendix");
  s.addNotes("【結果怎麼看】一次執行產生一個獨立 HTML（pytest-html 為底）。每個 step 一列，可依 category / operation / schema 篩選。\nFAIL 會列出所有缺少的屬性，不是只有第一個；WARN 附上 curl 與 schema 沒宣告的屬性；SKIP 是前面的 step 失敗了，但仍顯示本來要送的 curl。\n重點：任何一列都能用 curl 重播，回報 bug 給韌體團隊時直接貼。截圖已遮掉公司、機台位址、平台名稱與結果數量。");
}
{
  const s = newSlide("rViz");
  bgFill(s, WHITE);
  apKicker(s, "Appendix · Redfish Platform 4/11 · Work Project", "What a Test Looks Like: The YAML Test Visualizer", { icon: "FiGitBranch", circleColor: TEAL_DK, titleSize: 26 });
  const lw = 7.2;
  const end = shot(s, "1-overview.png", 0.6, 1.6, lw, 1300 / 820);
  s.addText("Reads only the YAML — no BMC needed. One flowchart per sequence (60 of them), listed by resource area and file.", {
    x: 0.6, y: end + 0.08, w: lw, h: 0.42, fontFace: F_BODY, fontSize: 10, italic: true, color: TEXT_MUTED, isTextBox: true, margin: 0,
  });
  const rx = 8.1, rw = 4.63;
  s.addText("How to read it", { x: rx, y: 1.55, w: rw, h: 0.3, fontFace: F_HEAD, fontSize: 13, bold: true, color: NAVY, isTextBox: true, margin: 0 });
  const legend = [
    ["box", "DBEAFE", "3B82F6", "request — GET / PATCH / POST / DELETE"],
    ["box", "DCFCE7", "22C55E", "Python helper step"],
    ["para", "FEF3C7", "F59E0B", "static input — parametrize / context"],
    ["line", null, "64748B", "step order"],
    ["line", null, "F97316", "a value passed from one step to the next"],
  ];
  legend.forEach(([kind, fill, line, text], i) => {
    const y = 1.95 + i * 0.32;
    if (kind === "box") s.addShape(pres.ShapeType.rect, { x: rx, y: y + 0.03, w: 0.42, h: 0.2, fill: { color: fill }, line: { color: line, width: 1 } });
    if (kind === "para") s.addShape(pres.ShapeType.parallelogram, { x: rx, y: y + 0.03, w: 0.42, h: 0.2, fill: { color: fill }, line: { color: line, width: 1 } });
    if (kind === "line") s.addShape(pres.ShapeType.line, { x: rx, y: y + 0.13, w: 0.42, h: 0, line: { color: line, width: 2 } });
    s.addText(text, { x: rx + 0.55, y, w: rw - 0.55, h: 0.26, fontFace: F_BODY, fontSize: 10.5, color: TEXT_DARK, valign: "middle", isTextBox: true, margin: 0 });
  });
  const iw = 2.5;
  shot(s, "4-unresolved-read.png", rx, 3.65, iw, 828 / 905);
  s.addText([
    { text: "Caught before any hardware run: ", options: { bold: true, color: "C0392B", breakLine: true } },
    { text: "a teardown step reads {context.acount_uri} — a typo that nothing earlier writes. The visualizer flags it as an unresolved read.", options: { color: TEXT_DARK, breakLine: true } },
    { text: " ", options: { breakLine: true, fontSize: 5 } },
    { text: "Each diagram's Mermaid source copies straight into a code review or a wiki.", options: { color: TEXT_MUTED, italic: true } },
  ], { x: rx + iw + 0.15, y: 3.65, w: rw - iw - 0.15, h: 2.73, fontFace: F_BODY, fontSize: 10, isTextBox: true, margin: 0, valign: "top", lineSpacingMultiple: 1.1 });
  footer(s, "Yujen Lan  ·  Appendix");
  s.addNotes("【設計怎麼看】一個指令讀所有 YAML，產生一頁 HTML，每個 sequence 一張流程圖；只讀 YAML，不需要 BMC。\n藍＝request、綠＝Python helper、黃＝靜態輸入；灰線＝步驟順序、橘線＝值在步驟間傳遞。\n價值：讀某個值但前面沒有任何步驟寫它，會在上機前被標出來（例：acount_uri 打錯字）。這回應了『YAML 可視化編輯器』這個 open problem 的一半：唯讀流程圖已完成（ticket 3/3），編輯仍靠 AI authoring skill。");
}

// ===================================================================== REDFISH 2/7 — Architecture: a pytest plugin, two phases
{
  const s = newSlide("r2");
  bgFill(s, WHITE);
  apKicker(s, "Appendix · Redfish Platform 6/11", "Architecture — A Pytest Plugin, Two Phases", { icon: "FiCheckCircle" });
  bulletBlock(s, 0.6, 1.6, 6.0, [
    { lead: "One CLI wraps pytest — ", rest: "every flag it doesn't recognize passes straight through, so -m, -k, -v, --collect-only all keep working." },
    { lead: "Every declarative construct becomes a real pytest object ", rest: "reached through pytest's own hooks — nothing is invented outside pytest's model." },
    { lead: "The three-way split: ", rest: "which rig (connection details), what the hardware has (a per-platform inventory), what the spec requires (compliance data, tiered common → chip generation → customer → platform) — so one test definition runs unchanged on all 12 platforms." },
  ], { fontSize: 12, paraSpaceAfter: 8, h: 2.7 });
  const rows = [
    ["Declarative construct", "Becomes", "Pytest hook"],
    ["A schema's test file", "Collector", "pytest_collect_file"],
    ["A test case / payload / step", "Item", "item.runtest()"],
    ["A platform-applicability tag", "Marker", "item.setup()"],
    ["A verification declaration", "Assertion", "raised inside runtest()"],
  ];
  tableSlideBasic(s, 6.85, 1.62, 5.88, rows, { colW: [2.4, 1.35, 2.13], fontSize: 10.5, rowH: 0.5 });

  const py = 4.45, ph = 1.45, lw = 5.8, rx = 6.93, rw = 5.8;
  const phases = [
    [0.6, "COLLECTION — no BMC, no network", ["read each schema's YAML file", "build the Collector / Item tree", "fan out over the platform's expected resource ids", "apply platform markers"], NAVY2],
    [rx, "EXECUTION — live BMC", ["fill in placeholders", "send the request", "run the checks", "run a sequence's steps in order"], NAVY],
  ];
  phases.forEach(([x, head, items, fill]) => {
    cardShape(s, x, py, lw, ph, { fill: BG_SUBTLE, line: { color: "E3E9EF", width: 1 }, noShadow: true });
    diaPill(s, x + 0.2, py + 0.15, 3.6, 0.36, head, { fill, fontSize: 10.5, fontFace: F_BODY, charSpacing: 0.5 });
    s.addText(items.join("   ·   "), { x: x + 0.22, y: py + 0.6, w: lw - 0.44, h: 0.75, fontFace: F_BODY, fontSize: 11, color: TEXT_DARK, valign: "middle", isTextBox: true, margin: 0, lineSpacingMultiple: 1.15 });
  });
  s.addShape(pres.ShapeType.rect, { x: 6.5, y: py - 0.08, w: 0.33, h: ph + 0.16, fill: { color: TEAL_DK }, line: { type: "none" } });
  s.addText("WALL", { x: 6.35, y: py + ph / 2 - 0.15, w: 0.63, h: 0.3, fontFace: F_BODY, fontSize: 8, bold: true, color: WHITE, align: "center", rotate: 270, isTextBox: true, margin: 0 });
  s.addText([
    { text: "pytest collects every test before running any — ", options: { bold: true, color: TEAL_DK } },
    { text: "so collection-time fan-out can only use the platform inventory, never a live response. Ids that only a live GET can reveal need a separate runtime loop inside a single test: the wall shapes the field vocabulary.", options: { color: TEXT_DARK } },
  ], { x: 0.6, y: 6.08, w: 12.13, h: 0.65, fontFace: F_BODY, fontSize: 11, isTextBox: true, margin: 0, lineSpacingMultiple: 1.15 });
  footer(s, "Yujen Lan  ·  Appendix");
  s.addNotes("【SPEC 的證據】這張表證明規格來自我對 pytest 內部機制的理解：Collector、Item、marker、assertion。\n兩階段：pytest 先收集全部測試才執行，所以收集階段不能碰 BMC；只有 live GET 才知道的 id 要在單一測試裡用 runtime loop 展開。這是被追問設計時很好講的一個『限制如何決定設計』的例子。");
}

// ===================================================================== REDFISH 6/7 — What the agent reads and writes
{
  const s = newSlide("rAgent");
  bgFill(s, WHITE);
  apKicker(s, "Appendix · Redfish Platform 10/11", "What the Agent Reads — and What It Writes Back", { icon: "FiGitPullRequest" });
  const ins = [["Rules", "root + per-folder CLAUDE.md"], ["Adapters", "where tickets, labels and docs live"], ["Skills", "project + global"],
    ["Tickets & spec", "one folder per feature"], ["Memory", "personal"], ["You & the rig", "requests · answers · BMC responses"]];
  const outs = [["Work", "code · test YAML · compliance data · docs"], ["Ticket state", "status · checkboxes · comments · ledger"], ["To you", "questions · proof · gates 1 / 2 / 3"],
    ["To the BMC", "curl · pytest — after you approve"], ["Lessons", "memory (just you) · CLAUDE.md · skills"], ["Sub-agents", "search · review → one report back"]];
  const ix = 0.6, iw = 3.55, ox = 9.18, ow = 3.55, y0 = 1.85, bh = 0.55, gap = 0.1;
  s.addText("INPUT", { x: ix, y: 1.52, w: iw, h: 0.28, fontFace: F_BODY, fontSize: 10.5, bold: true, color: TEAL_DK, charSpacing: 2, isTextBox: true, margin: 0 });
  s.addText("OUTPUT", { x: ox, y: 1.52, w: ow, h: 0.28, fontFace: F_BODY, fontSize: 10.5, bold: true, color: TEAL_DK, charSpacing: 2, align: "right", isTextBox: true, margin: 0 });
  const ax = 5.0, aw = 3.33, ay = 2.85, ah = 1.45;
  diaBox(s, ax, ay, aw, ah, ["AI agent — Claude Code", "keeps nothing between sessions except what it writes to a file"], { fontSize: 13, subIdx: 1, fill: NAVY, color: WHITE, subColor: ICE, lineGap: 6, padX: 0.2 });
  ins.forEach(([h, sub], i) => {
    const y = y0 + i * (bh + gap);
    diaBox(s, ix, y, iw, bh, [h, sub], { fontSize: 11, subIdx: 1, lineGap: 1, fill: BG_SUBTLE });
    diaArrow(s, ix + iw, y + bh / 2, ax, ay + ah / 2, { color: STEEL, width: 1.1 });
  });
  outs.forEach(([h, sub], i) => {
    const y = y0 + i * (bh + gap);
    diaBox(s, ox, y, ow, bh, [h, sub], { fontSize: 11, subIdx: 1, lineGap: 1, line: { color: TEAL_DK, width: 1.1 } });
    diaArrow(s, ax + aw, ay + ah / 2, ox, y + bh / 2, { color: TEAL_DK, width: 1.1 });
  });
  s.addText("↺  the right side becomes the next session's left side", { x: ax - 0.3, y: ay + ah + 0.12, w: aw + 0.6, h: 0.3, fontFace: F_BODY, fontSize: 10, italic: true, bold: true, color: TEAL_DK, align: "center", isTextBox: true, margin: 0 });

  cardShape(s, 0.6, 5.85, 12.13, 1.0, { fill: NAVY, line: { type: "none" }, noShadow: true });
  s.addText([
    { text: "Read it in two directions: ", options: { bold: true, color: TEAL } },
    { text: "left to right is one session; right back to left is across sessions — an updated ticket, a new rules line, a saved memory. That loop is the only way the agent remembers: skip writing ticket state and the next session believes the ticket is still open. Memory is the one personal piece — a correction a teammate's agent should follow goes in a CLAUDE.md line in git.", options: { color: ICE } },
  ], { x: 0.85, y: 5.92, w: 11.65, h: 0.86, fontFace: F_BODY, fontSize: 10.5, isTextBox: true, margin: 0, valign: "middle", lineSpacingMultiple: 1.12 });
  footer(s, "Yujen Lan  ·  Appendix");
  s.addNotes("【回答『這是不是 AI 寫的、你做了什麼』】agent 只知道檔案裡寫的東西：規則、skills、ticket 與 spec 都是我寫、我維護的；它的輸出要經過 gate（我核准才打 BMC、要拿證據才算 pass）。\n跨 session 的記憶只靠寫回檔案——所以流程設計（寫 ticket 狀態、把教訓寫進 CLAUDE.md）才是重點，這部分是我設計的。");
}

// ===================================================================== REDFISH 3/6 — Evolution
{
  const s = newSlide("r3");
  bgFill(s, WHITE);
  apKicker(s, "Appendix · Redfish Platform 7/11", "Three Generations — Each Fixed the One Before", { icon: "FiTrendingUp" });
  const rows = [
    ["Generation", "Fixed", "Stopped at"],
    ["1. Web test-management tool + in-house keyword runner", "Execution — regression runs became automatic", "Maintenance — a language nobody else knows, one test spread over three places, numbered steps, nothing in git"],
    ["2. Hand-written pytest", "Language & history — mainstream Python, reviewed in git", "Scale — boilerplate files per schema, platform support wired through mixin classes, one Pass/Fail per multi-step flow"],
    ["3. Config-driven (current)", "Scale — tests become data, pytest still underneath", "Cost — a field vocabulary specific to this project"],
  ];
  tableSlideBasic(s, 0.6, 1.65, 12.13, rows, { colW: [3.4, 3.5, 5.23], fontSize: 11.5, rowH: 0.78, align: ["left", "left", "left"], boldFirstCol: true });

  const cards = [
    ["Lesson carried from generation 1", "An in-house runner ends up maintainable only by its author — so keep a mainstream runner (pytest) underneath."],
    ["Lesson carried from generation 2", "Deciding platform support in Python class hierarchies doesn't scale — so declare it as data, resolved at collection time."],
  ];
  cards.forEach(([h, b], i) => {
    const x = 0.6 + i * 6.165, w = 5.965;
    cardShape(s, x, 5.0, w, 1.2, { fill: BG_SUBTLE, line: { color: "E3E9EF", width: 1 }, noShadow: true });
    s.addText(h, { x: x + 0.25, y: 5.1, w: w - 0.5, h: 0.3, fontFace: F_BODY, fontSize: 11.5, bold: true, color: TEAL_DK, isTextBox: true, margin: 0 });
    s.addText(b, { x: x + 0.25, y: 5.42, w: w - 0.5, h: 0.7, fontFace: F_BODY, fontSize: 11.5, color: TEXT_DARK, isTextBox: true, margin: 0, valign: "top" });
  });
  s.addText("Migration ran schema by schema — because every construct is a real pytest object, old hand-written tests ran side by side in the same pytest process until each was retired.", {
    x: 0.6, y: 6.35, w: 12.13, h: 0.5, fontFace: F_BODY, fontSize: 11, italic: true, color: TEXT_MUTED, isTextBox: true, margin: 0,
  });
  footer(s, "Yujen Lan  ·  Appendix");
}

// ===================================================================== REDFISH 4/6 — Scale & Safety
{
  const s = newSlide("r4");
  bgFill(s, WHITE);
  apKicker(s, "Appendix · Redfish Platform 8/11", "Scale, Safety & Day-to-Day Use", { icon: "FiActivity" });
  const stats = [
    ["76", "Redfish schemas (standard + OEM), 86 files"], ["297", "test cases, plus 325 request variants"], ["60", "multi-step sequences, 283 steps"],
    ["12", "hardware platforms, 2 generations"], ["527", "engine self-tests, synthetic sandbox"], ["13", "risky-action categories, each opt-in"],
  ];
  const x0 = 0.6, tw = 6.6, g = 0.12, cw = (tw - 2 * g) / 3, ch = 1.12;
  stats.forEach(([v, l], i) => {
    const x = x0 + (i % 3) * (cw + g), y = 1.6 + Math.floor(i / 3) * (ch + g);
    cardShape(s, x, y, cw, ch, { fill: BG_SUBTLE, line: { color: "E3E9EF", width: 1 }, noShadow: true });
    s.addText(v, { x, y: y + 0.1, w: cw, h: 0.48, fontFace: F_HEAD, fontSize: 26, bold: true, color: NAVY, align: "center", isTextBox: true, margin: 0 });
    s.addText(l, { x: x + 0.1, y: y + 0.62, w: cw - 0.2, h: 0.44, fontFace: F_BODY, fontSize: 10, color: TEXT_MUTED, align: "center", valign: "top", isTextBox: true, margin: 0 });
  });

  s.addChart(pres.charts.BAR, [{ name: "Test cases", labels: ["GET", "PATCH", "POST", "DELETE", "PUT"], values: [118, 81, 78, 19, 1] }], {
    x: 7.45, y: 1.5, w: 5.28, h: 2.6, barDir: "bar", chartColors: [TEAL_DK], catAxisOrientation: "maxMin",
    showTitle: true, title: "Test cases by HTTP method (297)", titleFontFace: F_BODY, titleFontSize: 11, titleColor: NAVY,
    showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 10, dataLabelFontFace: F_BODY, dataLabelColor: TEXT_DARK,
    catAxisLabelFontSize: 10, catAxisLabelFontFace: F_BODY, catAxisLabelColor: TEXT_MUTED, catAxisLineShow: false,
    valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" }, showLegend: false, barGapWidthPct: 60,
  });

  cardShape(s, 0.6, 4.25, 6.6, 1.55, { fill: NAVY, line: { type: "none" }, noShadow: true });
  s.addText([
    { text: "$ python3 run_tests.py --html", options: { breakLine: true } },
    { text: "$ python3 run_tests.py -m Chassis -k \".GET\"", options: { breakLine: true } },
    { text: "$ python3 run_tests.py --allow-bmc-reset tests/Manager/" },
  ], { x: 0.85, y: 4.35, w: 6.2, h: 1.35, fontFace: "Courier New", fontSize: 11.5, color: ICE, isTextBox: true, margin: 0, valign: "middle", lineSpacingMultiple: 1.3 });

  bulletBlock(s, 7.45, 4.3, 5.28, [
    { lead: "Safety is an orthogonal gate — ", rest: "host power, BMC reset, firmware update, secure-boot keys: each needs its own --allow-<category> flag, independent of test selection. A marker expression alone can never trigger a reset." },
    { lead: "Write, re-read, restore — ", rest: "rigs are shared and must be left as found." },
  ], { fontSize: 11, paraSpaceAfter: 6, h: 1.6 });

  s.addText("One platform's run: about 280–650 tests in 5–30 minutes, depending on the hardware. Findings are reported honestly — a test is written as if it should pass and allowed to fail, never loosened to go green.", {
    x: 0.6, y: 6.05, w: 12.13, h: 0.6, fontFace: F_BODY, fontSize: 11, italic: true, color: TEXT_MUTED, isTextBox: true, margin: 0, lineSpacingMultiple: 1.15,
  });
  footer(s, "Yujen Lan  ·  Appendix");
}

// ===================================================================== REDFISH 5/6 — Gated AI-pair workflow
{
  const s = newSlide("r5");
  bgFill(s, WHITE);
  apKicker(s, "Appendix · Redfish Platform 9/11", "A Gated AI-Pair Workflow — Every Stage Has a Check", { icon: "FiGitPullRequest", titleSize: 26 });

  const lx = 0.6, lw = 0.95, sx = 1.65, total = 11.08, g = 0.15, cw = (total - 4 * g) / 5;
  const stages = [
    { n: "GRILL", sk: "/grill-me", in: "a plan",
      mech: "One question at a time, each with a recommended answer; the AI looks facts up itself and asks me only for decisions",
      gate: "I decide. Three core structural decisions went against the AI's recommendation: one YAML file per schema · sequences in the same file as their tests · the platform-tier order",
      out: "settled decisions" },
    { n: "SPEC", sk: "/to-spec", in: "the grilling",
      mech: "Writes the problem, user stories, implementation decisions and test seams",
      gate: "Grounded in how pytest works — Collector, Item, marker, assertion; an Out-of-Scope section stops later sessions from expanding the work",
      out: "a spec file" },
    { n: "TICKETS", sk: "/to-tickets", in: "the spec",
      mech: "Thin vertical slices through the whole stack, each naming the tickets that block it",
      gate: "Each slice verifiable on its own and sized to one context window — too big, split it",
      out: "one file per ticket · 103 / 154 done" },
    { n: "IMPLEMENT", sk: "/implement · /tdd", in: "one ticket",
      mech: "Failing test first at an agreed seam, then the code, run against the live rig",
      gate: "Gate 1: I read every rig-touching command. Gate 2: proof, not \"passed\" — command, rig, exact pytest summary line, report file; prove the check can fail",
      out: "the change + tests" },
    { n: "REVIEW", sk: "/code-review", in: "the diff + the ticket",
      mech: "Two parallel sub-agents — Standards (repo rules) and Spec (the ticket); it changes no code",
      gate: "Gate 3: a person reviews and re-implements if needed; engine changes need all 527 self-tests green",
      out: "a commit" },
  ];
  const rowsY = { head: 1.58, in: 2.18, mech: 2.8, gate: 3.86, out: 5.2 };
  const rowsH = { in: 0.52, mech: 0.96, gate: 1.24, out: 0.5 };
  [["Input", "in"], ["How", "mech"], ["Gate", "gate"], ["Output", "out"]].forEach(([lab, k]) => {
    s.addText(lab, { x: lx, y: rowsY[k], w: lw, h: rowsH[k], fontFace: F_BODY, fontSize: 10.5, bold: true, color: k === "gate" ? TEAL_DK : TEXT_MUTED, valign: "middle", isTextBox: true, margin: 0 });
  });
  stages.forEach((st, i) => {
    const x = sx + i * (cw + g);
    diaPill(s, x, rowsY.head, cw, 0.46, st.n, { fill: NAVY2, fontSize: 12.5 });
    if (i < 4) diaArrow(s, x + cw + 0.01, rowsY.head + 0.23, x + cw + g - 0.01, rowsY.head + 0.23, { color: STEEL, width: 1.25 });
    s.addText(st.sk, { x, y: rowsY.head + 0.47, w: cw, h: 0.13, fontFace: "Courier New", fontSize: 8.5, color: TEXT_MUTED, align: "center", isTextBox: true, margin: 0 });
    s.addText(st.in, { x, y: rowsY.in, w: cw, h: rowsH.in, fontFace: F_BODY, fontSize: 10, color: TEXT_DARK, align: "center", valign: "middle", isTextBox: true, margin: 0 });
    diaBox(s, x, rowsY.mech, cw, rowsH.mech, [st.mech], { fontSize: 9.5, fill: BG_SUBTLE, line: { color: "E3E9EF", width: 1 }, padX: 0.08 });
    diaBox(s, x, rowsY.gate, cw, rowsH.gate, [st.gate], { fontSize: 9.5, fill: "E6F4F2", line: { color: TEAL_DK, width: 1.25 }, padX: 0.08 });
    s.addText(st.out, { x, y: rowsY.out, w: cw, h: rowsH.out, fontFace: F_BODY, fontSize: 10, bold: true, color: NAVY, align: "center", valign: "middle", isTextBox: true, margin: 0 });
  });

  cardShape(s, 0.6, 5.85, 12.13, 1.02, { fill: NAVY, line: { type: "none" }, noShadow: true });
  s.addText([
    { text: "Gap, stated honestly: ", options: { bold: true, color: TEAL } },
    { text: "review is only as good as the requirement handed to it — without it the Spec reviewer has nothing to check against, and a dropped step is exactly what nobody catches. There is no static-analysis pass yet. ", options: { color: ICE } },
    { text: "Planned fix: ", options: { bold: true, color: TEAL } },
    { text: "run static analysis before review (e.g. clang-tidy / cppcheck on the C++ projects), and always pass the spec into /code-review.", options: { color: ICE } },
  ], { x: 0.85, y: 5.92, w: 11.65, h: 0.88, fontFace: F_BODY, fontSize: 10.5, isTextBox: true, margin: 0, valign: "middle", lineSpacingMultiple: 1.12 });
  footer(s, "Yujen Lan  ·  Appendix");
  s.addNotes([
    "【被說『看起來是 AI 寫的』時：哪些判斷是我的、AI 提了什麼我否決、怎麼驗證】",
    "GRILL：三個結構性決定推翻了 AI 的初始建議——一個 schema 一個 YAML 檔、sequence 跟它要排序的測試放同一個檔（AI 原本提議另開一個頂層目錄）、平台層級的順序（common → chip generation → customer → platform）。",
    "SPEC：規格來自我對 pytest 內部機制的理解（Collector、Item、marker、assertion），見 hook 對照表那頁。",
    "IMPLEMENT：沒有單一驗證公式，要跟真實硬體或既有已知行為交叉比對才算數。例：參考資料寫的屬性，硬體根本沒有。",
    "Code review 被追問『AI 寫的看起來沒問題，但有漏洞怎麼辦？』：誠實講現況（Spec reviewer 只跟傳進去的規格比對、還沒有靜態分析），再講一個真的打算做的補法。",
  ].join("\n"));
}

// ===================================================================== REDFISH 6/6 — What the process caught
{
  const s = newSlide("r6");
  bgFill(s, WHITE);
  apKicker(s, "Appendix · Redfish Platform 11/11", "What the Process Caught", { icon: "FiSearch" });
  const rows = [
    ["What was wrong", "How it was caught"],
    ["An old test whose core assumptions about a live endpoint were all wrong — creation order, a required field its own payload omitted, ids renumbering on delete", "exploring the live rig before trusting existing code"],
    ["Reference data asserting properties the hardware never actually had", "comparing against the live rig during conversion, not trusting the paperwork"],
    ["A compliance file that validated nothing — garbage data passed clean", "proving a check can fail before trusting that it passes"],
    ["A write check reporting PASSED while the resource was unchanged", "a manual curl replay, because the pass looked too easy"],
    ["A \"skipped\" request variant still sent when reached through a sequence — including host resets", "the read-only engine audit, proven live"],
    ["A generated compliance check that silently didn't run on some responses, leaving the row PASS", "the read-only engine audit"],
  ];
  tableSlideBasic(s, 0.6, 1.6, 12.13, rows, { colW: [7.5, 4.63], fontSize: 11, rowH: 0.54, align: ["left", "left"] });

  s.addText("A read-only audit of the engine, run through the same loop — because its worst past bugs had all been silent", {
    x: 0.6, y: 5.55, w: 12.13, h: 0.3, fontFace: F_BODY, fontSize: 11, bold: true, color: TEAL_DK, isTextBox: true, margin: 0,
  });
  const chips = ["Grill the audit's scope", "Audit read-only: 59 findings", "Maintainer decides: 55 accepted, 4 rejected", "15 tickets · self-tests ~215 → 523"];
  const cw = 2.84, g = 0.257;
  chips.forEach((c, i) => {
    const x = 0.6 + i * (cw + g);
    diaBox(s, x, 5.92, cw, 0.62, [c], { fontSize: 10.5, fill: i === 2 ? NAVY2 : BG_SUBTLE, color: i === 2 ? WHITE : TEXT_DARK, line: { color: "CBD8E4", width: 1 } });
    if (i < 3) diaArrow(s, x + cw + 0.02, 6.23, x + cw + g - 0.02, 6.23, { color: STEEL });
  });
  footer(s, "Yujen Lan  ·  Appendix");
  s.addNotes([
    "【最強的 ownership 證據——被問分工時挑一個講】",
    "這些都是『出問題時叫我去看』的直接證明，比任何百分比都有說服力。",
    "講法：現象 → 為什麼懷疑 → 怎麼驗證 → 留下什麼規則。例：write 驗證回報 PASSED 但資源沒改 → pass 太容易 → 手動 curl 重播 → 規則：先證明 check 會失敗。",
  ].join("\n"));
}

// ===================================================================== HTTPS-GUARD 4/8 — Tests
{
  const s = newSlide("hgTests");
  bgFill(s, WHITE);
  apKicker(s, "Appendix · HTTPS-Guard 4/8", "67 GoogleTest Cases, Wired Into Yocto ptest", { icon: "FiCheckCircle", circleColor: TEAL_DK });
  bulletBlock(s, 0.6, 1.55, 12.13, [
    { lead: "From a single-header framework to a real suite: ", rest: "doctest's 3 flat files became GoogleTest — FetchContent-vendored, GTest::gtest_main plus gmock — 67 cases in four purpose-built directories, all building and running with zero kernel, BPF or root access." },
  ], { fontSize: 12.5, paraSpaceAfter: 6, h: 0.85 });
  const rows = [
    ["Suite", "Cases", "What it proves"],
    ["parsing/", "13", "the real ClientHello wire-format parser, against hand-built packet bytes"],
    ["detections/", "37", "all 7 detector families (TLS version, payload anomaly, cipher suite, SNI, cert access, rate/Slowloris/reneg. sweep, traffic-observed) in isolation"],
    ["core/", "12", "EventMeta lazy peer resolution and dual-stack connection tuples (10), cross-detection dispatch priority (2)"],
    ["actions/", "5", "TcpDestroyer address-family handling — an AF_INET vs. AF_INET6 teardown request built correctly"],
  ];
  tableSlideBasic(s, 0.6, 2.5, 12.13, rows, { colW: [1.9, 1.1, 9.13], fontSize: 11, rowH: 0.5 });
  cardShape(s, 0.6, 5.2, 12.13, 1.15, { fill: NAVY, line: { type: "none" }, noShadow: true });
  s.addText([
    { text: "Design claim → CI fact: ", options: { fontFace: F_BODY, fontSize: 11.5, bold: true, color: TEAL } },
    { text: "https-guard-openbmc.bb inherits ptest — do_install_ptest() ships the GoogleTest binary plus a run-ptest script that turns [ RUN ]/[ OK ]/[ FAILED ] into ptest's PASS:/FAIL:, runnable on-target or under QEMU via ptest-runner. Deliberate holdout: detectloop_harness.cpp stays a standalone harness outside GoogleTest (it links the real DetectLoop plus libbpf) — and no TSan/ASan/UBSan pass has been run against it yet.", options: { fontFace: F_BODY, fontSize: 11, color: ICE } },
  ], { x: 0.9, y: 5.27, w: 11.5, h: 1.0, isTextBox: true, margin: 0, lineSpacingMultiple: 1.15, valign: "middle" });
  ghChip(s, 0.6, 6.55, "github.com/JohnBlue-git/HTTPS-Guard", { w: 7.4, fill: NAVY2 });
  footer(s, "Yujen Lan  ·  Appendix");
}

// ===================================================================== HTTPS-GUARD 5/8 — Session binding
{
  const s = newSlide("hgSession");
  bgFill(s, WHITE);
  apKicker(s, "Appendix · HTTPS-Guard 5/8", "Which Connection Sent This TLS Record? Kernel-Side Session Binding", { icon: "FiLink2", circleColor: TEAL_DK, titleSize: 22 });

  const r1 = 1.62, h1 = 0.9, r2 = 2.95, h2 = 0.82;
  const K = [0.6, 2.85], M1 = [3.85, 2.3], U = [6.55, 2.85], M2 = [9.8, 2.93];
  diaBox(s, K[0], r1, K[1], h1, ["kprobe tcp_recvmsg / tcp_sendmsg", "records the thread's port-443 tuple"], { fontSize: 11, subIdx: 1 });
  diaBox(s, M1[0], r1, M1[1], h1, ["thread → tuple", "LRU_HASH"], { fontSize: 11, subIdx: 1, fill: BG_SUBTLE });
  diaBox(s, U[0], r1, U[1], h1, ["uprobe SSL_accept / SSL_connect", "consumes it: read, then deleted"], { fontSize: 11, subIdx: 1 });
  diaBox(s, M2[0], r1, M2[1], h1, ["SSL* → 4-tuple", "LRU_HASH session map"], { fontSize: 11.5, subIdx: 1, fill: NAVY2, color: WHITE, subColor: ICE });
  const mid1 = r1 + h1 / 2;
  diaArrow(s, K[0] + K[1], mid1, M1[0], mid1, { color: TEAL_DK, width: 2 });
  diaArrow(s, M1[0] + M1[1], mid1, U[0], mid1, { color: TEAL_DK, width: 2 });
  diaArrow(s, U[0] + U[1], mid1, M2[0], mid1, { color: TEAL_DK, width: 2 });

  diaBox(s, M2[0], r2, M2[1], h2, ["SSL_read / SSL_write events", "carry the resolved tuple into EventMeta"], { fontSize: 11, subIdx: 1, fill: NAVY, color: WHITE, subColor: ICE });
  diaArrow(s, M2[0] + M2[1] / 2, r1 + h1, M2[0] + M2[1] / 2, r2, { color: TEAL_DK, width: 2 });
  diaBox(s, U[0], r2, U[1], h2, ["uprobe SSL_free", "releases the binding promptly"], { fontSize: 11, subIdx: 1 });
  diaArrow(s, U[0] + U[1] - 0.3, r2, M2[0] + 0.3, r1 + h1, { color: STEEL });
  diaBox(s, M1[0], r2, M1[1], h2, ["SessionTupleSweeper", "drops stale entries"], { fontSize: 11, subIdx: 1, fill: BG_SUBTLE });
  diaArrow(s, M1[0] + M1[1] / 2, r2, M1[0] + M1[1] / 2, r1 + h1, { color: STEEL });
  diaBox(s, K[0], r2, K[1], h2, ["/proc ProcPeerResolver", "fallback when nothing is bound"], { fontSize: 11, subIdx: 1, line: { color: "CBD8E4", width: 1, dashType: "dash" } });

  const cards = [
    ["Can only under-bind, never mis-bind", "Binding happens once, at SSL_accept / SSL_connect entry, and the record is consumed: read, then deleted. A wrong thread-affinity guess falls back to /proc instead of naming the wrong peer."],
    ["Dual-stack, verified live", "bmcweb listens on ::, so an IPv4 client arrives as AF_INET6. Checking the legacy IPv4 fields first fixed every real bmcweb connection resolving to an all-zero address."],
    ["Honest scope", "Genuine (non-mapped) IPv6 is implemented and reviewed but not live-verified — the QEMU/SLIRP network has IPv6 disabled. IPv6 verdicts get SOCK_DESTROY; the IPv4-only blocklist is skipped and logged."],
  ];
  const cw = 3.9, g = 0.215;
  cards.forEach(([h, b], i) => {
    const x = 0.6 + i * (cw + g);
    cardShape(s, x, 4.1, cw, 1.55, { fill: BG_SUBTLE, line: { color: "E3E9EF", width: 1 }, noShadow: true });
    s.addText(h, { x: x + 0.22, y: 4.2, w: cw - 0.44, h: 0.32, fontFace: F_BODY, fontSize: 12, bold: true, color: TEAL_DK, isTextBox: true, margin: 0 });
    s.addText(b, { x: x + 0.22, y: 4.55, w: cw - 0.44, h: 1.05, fontFace: F_BODY, fontSize: 10.5, color: TEXT_DARK, isTextBox: true, margin: 0, valign: "top", lineSpacingMultiple: 1.1 });
  });
  s.addText("Why it exists: the /proc resolver fails closed once a process — chiefly bmcweb — owns more than one established connection. Five programs, all non-fatal; filtering on port 443 keeps per-packet cost off unrelated traffic.", {
    x: 0.6, y: 5.85, w: 12.13, h: 0.6, fontFace: F_BODY, fontSize: 10.5, italic: true, color: TEXT_MUTED, isTextBox: true, margin: 0, lineSpacingMultiple: 1.15,
  });
  ghChip(s, 0.6, 6.55, "github.com/JohnBlue-git/HTTPS-Guard", { w: 7.4, fill: NAVY2 });
  footer(s, "Yujen Lan  ·  Appendix");
}

// ===================================================================== HOWTOPLDM 1/4 — honest scope
{
  const s = newSlide("p1");
  bgFill(s, WHITE);
  apKicker(s, "Appendix · HowToPLDM 1/4", "A Real Driver Stack — and Exactly Where It Stops", { icon: "FiCpu", circleColor: STEEL });
  const cols = [
    ["Real", TEAL_DK, [
      "Upstream and unmodified: QEMU's AST2600 I2C model, the kernel's i2c-aspeed.c, mctp-i2c.c and net/mctp, OpenBMC's mctpd, pldmd and pldmtool",
      "EID assignment really crosses the wire — no static mctp addr add",
      "pldmtool GetTID, GetPLDMTypes, GetPLDMVersion, GetPDR and GetSensorReading all return correct values"]],
    ["Simulated", STEEL, [
      "Sensor values are canned: CPU 42 °C, 12 V rail 11.98 V — no hwmon driver behind them",
      "record_change_num and the GetPDR CRC-32 are placeholders",
      "The device model itself: ~965 lines plus a 7-file patch against QEMU 10.2.0"]],
    ["Known gaps", NAVY, [
      "pldmd stops before the PDR walk: no GetPLDMCommands → all-zero bitmap → no D-Bus sensors → nothing in Redfish",
      "Lenient receive path: no PEC, destination-EID or SOM/EOM check",
      "Single-packet only (MTU 254); unsupported PLDM types get no reply, so pldmd's type-5 query times out"]],
  ];
  const cw = 3.9, g = 0.215;
  cols.forEach(([h, c, items], i) => {
    const x = 0.6 + i * (cw + g);
    cardShape(s, x, 1.6, cw, 2.6, { fill: WHITE, line: { color: "D9E2EC", width: 1 } });
    s.addText(h, { x: x + 0.25, y: 1.72, w: cw - 0.5, h: 0.36, fontFace: F_HEAD, fontSize: 15, bold: true, color: c, isTextBox: true, margin: 0 });
    bulletBlock(s, x + 0.25, 2.18, cw - 0.45, items, { fontSize: 10.5, paraSpaceAfter: 8, h: 2.2, bulletColor: c, indent: 12 });
  });
  s.addText([
    { text: "How \"verified end to end\" was checked: ", options: { bold: true, color: TEAL_DK } },
    { text: "a clean rebuild with no debug instrumentation, then mctp neigh show reports EID 10, both GetPDR records decode, and GetSensorReading returns 42 / 1198 over the real wire path — with no failed systemd units. That covers the pldmtool path; pldmd's autonomous discovery is the known gap.", options: { color: TEXT_DARK } },
  ], { x: 0.6, y: 4.42, w: 12.13, h: 0.7, fontFace: F_BODY, fontSize: 11, isTextBox: true, margin: 0, lineSpacingMultiple: 1.15 });
  cardShape(s, 0.6, 5.42, 12.13, 0.95, { fill: NAVY, line: { type: "none" }, noShadow: true });
  s.addText([
    { text: "Next step, already specified: ", options: { bold: true, color: TEAL } },
    { text: "implement GetPLDMCommands with a truthful 32-byte bitmap — type 0: 0x02–0x05; type 2: 0x11, 0x50, 0x51. pldmd checks that bitmap before each step, so it only has to be accurate; the device doesn't need every command.", options: { color: ICE } },
  ], { x: 0.85, y: 5.48, w: 11.65, h: 0.83, fontFace: F_BODY, fontSize: 11, isTextBox: true, margin: 0, valign: "middle", lineSpacingMultiple: 1.12 });
  ghChip(s, 0.6, 6.55, "github.com/JohnBlue-git/HowToPLDM", { w: 7.4, fill: NAVY });
  footer(s, "Yujen Lan  ·  Appendix");
}

// ===================================================================== HOWTOPLDM 2/4 — layer map
{
  const s = newSlide("p2");
  bgFill(s, WHITE);
  apKicker(s, "Appendix · HowToPLDM 2/4", "Seven Layers, Two Very Different Shapes", { icon: "FiLayers", circleColor: STEEL });
  const lx = 0.6, lw = 0.48, bx = 1.15, bw = 4.4, ax1 = bx + bw, dx = 7.25, dw = 5.48, ax2 = dx;
  s.addText("BMC — Linux guest, EID 8", { x: bx, y: 1.5, w: bw, h: 0.3, fontFace: F_HEAD, fontSize: 12.5, bold: true, color: NAVY, align: "center", isTextBox: true, margin: 0 });
  s.addText("QEMU device mctp-i2c-endpoint — EID 10, bus 1, addr 0x0f", { x: dx, y: 1.5, w: dw, h: 0.3, fontFace: F_HEAD, fontSize: 12.5, bold: true, color: NAVY, align: "center", isTextBox: true, margin: 0 });
  const y0 = 1.9, step = 0.57, rh = 0.5;
  const L = [
    ["L7", "bmcweb reads the D-Bus sensors pldmd creates — not working yet", null, null],
    ["L6", "pldmd (platform-mc) · pldmtool", "PLDM msg", "handle_pldm_base() Type 0 · handle_pldm_pmc() Type 2 + pdr_repo[]"],
    ["L5", "mctpd — bus owner: assigns EIDs, sets up routes", "MCTP ctrl", "handle_mctp_control() — SetEID · GetEID · GetVersion · GetMsgTypes"],
    ["L4", "kernel net/mctp + AF_MCTP sockets (DSP0236)", "MCTP hdr", "split"],
    ["L3", "mctp-i2c.c — I2C slave at 0x10, SMBus header + PEC (DSP0237)", "SMBus + PEC", "split"],
    ["L2", "i2c-aspeed.c — byte mode, one interrupt per byte", "I2C bytes", "split2"],
  ];
  L.forEach(([lab, bmc, arr, dev], i) => {
    const y = y0 + i * step;
    s.addText(lab, { x: lx, y, w: lw, h: rh, fontFace: F_BODY, fontSize: 11, bold: true, color: TEAL_DK, align: "center", valign: "middle", isTextBox: true, margin: 0 });
    diaBox(s, bx, y, bw, rh, [bmc], { fontSize: 10, fill: i === 0 ? BG_SUBTLE : WHITE, color: i === 0 ? TEXT_MUTED : TEXT_DARK });
    if (arr) {
      diaArrow(s, ax1 + 0.08, y + rh / 2 + 0.06, ax2 - 0.08, y + rh / 2 + 0.06, { color: STEEL, width: 1.25, both: true });
      s.addText(arr, { x: ax1, y: y + 0.02, w: ax2 - ax1, h: 0.22, fontFace: F_BODY, fontSize: 9, italic: true, color: TEXT_MUTED, align: "center", isTextBox: true, margin: 0 });
    }
    if (dev === null) diaBox(s, dx, y, dw, rh, ["(none)"], { fontSize: 10, fill: BG_SUBTLE, color: TEXT_MUTED });
    else if (dev !== "split" && dev !== "split2") diaBox(s, dx, y, dw, rh, [dev], { fontSize: 10 });
  });
  // device L4+L3 merged: split by direction, not by layer
  const hw = (dw - 0.1) / 2, y4 = y0 + 3 * step, h43 = step + rh;
  diaBox(s, dx, y4, hw, h43, ["RX: process_mctp_frame()", "reads EIDs and tag, dispatches on message type — PEC not verified"], { fontSize: 10, subIdx: 1, fill: NAVY2, color: WHITE, subColor: ICE });
  diaBox(s, dx + hw + 0.1, y4, hw, h43, ["TX: build_mctp_frame()", "writes header, SOM|EOM|tag; crc8_smbus() → PEC"], { fontSize: 10, subIdx: 1, fill: NAVY2, color: WHITE, subColor: ICE });
  const y2 = y0 + 5 * step;
  diaBox(s, dx, y2, hw, rh, ["mctp_i2c_ep_send/_event()", "bytes → rx_buf"], { fontSize: 9.5, subIdx: 1, lineGap: 1 });
  diaBox(s, dx + hw + 0.1, y2, hw, rh, ["mctp_i2c_resp_bh()", "1 byte per 20 ms tick → master write to 0x10"], { fontSize: 9.5, subIdx: 1, lineGap: 1 });
  const y1 = y0 + 6 * step;
  s.addText("L1", { x: lx, y: y1, w: lw, h: 0.56, fontFace: F_BODY, fontSize: 11, bold: true, color: TEAL_DK, align: "center", valign: "middle", isTextBox: true, margin: 0 });
  diaBox(s, bx, y1, dx + dw - bx, 0.56, ["Wire: QEMU hw/i2c/aspeed_i2c.c (emulated AST2600 controller) + I2C bus 1", "request: BMC is master, writes to 0x0f  ·  response: device becomes master, writes to 0x10 — nobody ever does an I2C read"], { fontSize: 10.5, subIdx: 1, fill: NAVY, color: WHITE, subColor: ICE, lineGap: 2 });

  s.addText("Read it row by row: each layer talks to its peer, but bytes only cross at L1. The BMC splits layers into separate modules and processes; the device is one C file split by direction (receive vs. transmit), not by layer. mctpd lives only at L5 — runtime PLDM traffic from pldmd or pldmtool uses its own AF_MCTP sockets and never passes through it.", {
    x: 0.6, y: 6.1, w: 12.13, h: 0.8, fontFace: F_BODY, fontSize: 10.5, italic: true, color: TEXT_MUTED, isTextBox: true, margin: 0, lineSpacingMultiple: 1.15,
  });
  footer(s, "Yujen Lan  ·  Appendix");
}

// ===================================================================== HOWTOPLDM 3/4 — one frame byte by byte
{
  const s = newSlide("p3");
  bgFill(s, WHITE);
  apKicker(s, "Appendix · HowToPLDM 3/4", "One GetTID on the Wire, Byte by Byte", { icon: "FiTerminal", circleColor: STEEL });
  s.addText([
    { text: "pldmtool base GetTID -m 10", options: { fontFace: "Courier New", bold: true, color: NAVY } },
    { text: "  —  BMC (EID 8, I2C 0x10) → device (EID 10, I2C 0x0f)", options: { color: TEXT_DARK } },
  ], { x: 0.6, y: 1.55, w: 12.13, h: 0.32, fontFace: F_BODY, fontSize: 12, isTextBox: true, margin: 0 });
  const rows = [
    ["", "addr", "[0] cmd", "[1] byte count", "[2] src addr", "[3] hdr ver", "[4] dst EID", "[5] src EID", "[6] SOM EOM TO tag", "[7] msg type", "[8…] message body", "PEC"],
    ["layer", "L2", "L3", "L3", "L3", "L4", "L4", "L4", "L4", "L4 → L5", "L5 / L6", "L3"],
    ["request", "1e", "0f", "09", "21", "01", "0a", "08", "c8", "01", "80 00 02", "4e"],
    ["response", "20", "0f", "0b", "1f", "01", "08", "0a", "c0", "01", "00 00 02 00 01", "de"],
  ];
  const t = rows.map((r, ri) => r.map((c, ci) => ({ text: c, options: {
    fontFace: ri >= 2 && ci > 0 ? "Courier New" : F_BODY, fontSize: ri === 0 ? 9.5 : (ri >= 2 && ci > 0 ? 12 : 10.5),
    bold: ri === 0 || ci === 0 || (ri >= 2 && (ci === 8 || ci === 10)), color: ri === 0 ? WHITE : (ri === 1 ? TEAL_DK : TEXT_DARK),
    fill: { color: ri === 0 ? NAVY : (ri === 1 ? "E6F4F2" : (ri === 2 ? WHITE : BG_SUBTLE)) },
    align: ci === 0 ? "left" : "center", valign: "middle", margin: [3, 4, 3, 4] } })));
  s.addTable(t, { x: 0.6, y: 1.98, w: 12.13, colW: [1.0, 0.72, 0.75, 0.85, 0.85, 0.75, 0.8, 0.8, 1.15, 0.85, 2.81, 0.8], rowH: [0.55, 0.36, 0.42, 0.42], border: { type: "solid", color: "E3E9EF", pt: 0.75 }, autoPage: false });

  s.addText([
    { text: "The response ", options: {} },
    { text: "swaps addresses and EIDs, clears the tag-owner bit (c8 → c0), and adds completion code 00 and TID 01. ", options: {} },
    { text: "Two bugs were fixed exactly here: ", options: { bold: true, color: TEAL_DK } },
    { text: "byte_count must exclude the PEC (the kernel checks byte_count + 3), and the PEC must cover every byte, address phase included.", options: {} },
  ], { x: 0.6, y: 3.95, w: 12.13, h: 0.65, fontFace: F_BODY, fontSize: 11.5, color: TEXT_DARK, isTextBox: true, margin: 0, lineSpacingMultiple: 1.15 });

  s.addText("Names that are easy to mix up", { x: 0.6, y: 4.75, w: 6, h: 0.3, fontFace: F_HEAD, fontSize: 13, bold: true, color: NAVY, isTextBox: true, margin: 0 });
  const names = [
    ["Name", "Meaning 1", "Meaning 2"],
    ["aspeed_i2c", "QEMU hw/i2c/aspeed_i2c.c — the emulated controller hardware (L1)", "Linux i2c-aspeed.c — the BMC's driver for it (L2)"],
    ["0x0f", "the device's I2C address", "the DSP0237 command code in byte [0] — a coincidence"],
    ["\"Type 0\"", "MCTP type 0 = MCTP Control", "PLDM type 0 = PLDM Base, carried inside MCTP type 1"],
  ];
  tableSlideBasic(s, 0.6, 5.1, 12.13, names, { colW: [1.7, 5.4, 5.03], fontSize: 10.5, rowH: 0.4, align: ["left", "left", "left"], boldFirstCol: true });
  footer(s, "Yujen Lan  ·  Appendix");
}
