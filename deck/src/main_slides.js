// Main deck: title → context (BMC / Redfish / what I do) → experience → work vs self-directed → tracks → thank you.
// The two design-case slides (dc1, dc2) now open the Redfish appendix section.
const H = require("./helpers.js");
const { pres, newSlide, footer, iconCircle, apKicker, bgFill, bulletBlock, ghChip, tableSlideBasic, cardShape,
  diaBox, diaArrow, tagPill, icon, NAVY, NAVY2, STEEL, ICE, TEAL, TEAL_DK, WHITE, BG_SUBTLE, TEXT_DARK, TEXT_MUTED, F_HEAD, F_BODY } = H;

// ---------------------------------------------------------------------
// 1 — TITLE: one-line positioning + three strengths
// ---------------------------------------------------------------------
{
  const s = newSlide("title");
  bgFill(s, NAVY);
  s.addShape(pres.ShapeType.ellipse, { x: 10.3, y: -1.8, w: 5.4, h: 5.4, fill: { color: NAVY2 }, line: { type: "none" } });
  s.addShape(pres.ShapeType.ellipse, { x: 11.5, y: -0.9, w: 2.6, h: 2.6, fill: { color: TEAL_DK }, line: { type: "none" }, transparency: 55 });

  s.addText("YUJEN LAN", { x: 0.9, y: 0.85, w: 9.5, h: 0.95, fontFace: F_HEAD, fontSize: 50, bold: true, color: WHITE, isTextBox: true, margin: 0 });
  s.addText("Systems software engineer on Linux / BMC platforms — I design validation systems and debug across layers, from Redfish APIs down to drivers.", {
    x: 0.9, y: 1.85, w: 10.2, h: 0.85, fontFace: F_BODY, fontSize: 18, color: TEAL, isTextBox: true, margin: 0, lineSpacingMultiple: 1.1,
  });

  const cards = [
    { icon: "FiCheckCircle", tag: "work", head: "Document-driven validation design", body: "Designed the config-driven engine behind a live-hardware Redfish conformance suite — tests as data, 12 platforms, no mock BMC." },
    { icon: "FiSearch", tag: "work", head: "Cross-layer debugging", body: "In production BMC code: startup time cut by over 60%, memory-lifetime and concurrency defects fixed across Redfish, D-Bus and Linux." },
    { icon: "FiCpu", tag: "self", head: "Systems depth, self-directed", body: "eBPF intrusion detection (HTTPS-Guard) and a real MCTP/PLDM driver stack on QEMU — built and verified on my own time." },
  ];
  const cw = 3.78, cg = 0.2, cy = 2.95, ch = 2.55;
  cards.forEach((c, i) => {
    const x = 0.9 + i * (cw + cg);
    s.addShape(pres.ShapeType.roundRect, { x, y: cy, w: cw, h: ch, rectRadius: 0.09, fill: { color: NAVY2 }, line: { color: "24476B", width: 1 } });
    iconCircle(s, c.icon, x + 0.25, cy + 0.25, 0.55, c.tag === "self" ? TEAL_DK : STEEL, 0.12);
    tagPill(s, x + cw - (c.tag === "self" ? 1.55 : 0.95) - 0.25, cy + 0.36, c.tag, { w: c.tag === "self" ? 1.55 : 0.95, h: 0.32, fontSize: 9, fill: c.tag === "self" ? TEAL_DK : "24476B" });
    s.addText(c.head, { x: x + 0.25, y: cy + 0.88, w: cw - 0.5, h: 0.62, fontFace: F_HEAD, fontSize: 15.5, bold: true, color: WHITE, valign: "bottom", isTextBox: true, margin: 0 });
    s.addText(c.body, { x: x + 0.25, y: cy + 1.58, w: cw - 0.5, h: 0.88, fontFace: F_BODY, fontSize: 11.5, color: ICE, isTextBox: true, margin: 0, valign: "top", lineSpacingMultiple: 1.1 });
  });

  const contacts = [
    ["FiMapPin", "Taipei, Taiwan", 0.9, 1.6], ["FiMail", "johnblue.git@gmail.com", 2.75, 2.5], ["FiPhone", "0908 517 935", 5.5, 1.6],
    ["FiGithub", "github.com/JohnBlue", 7.35, 2.15], ["FiLinkedin", "linkedin.com/in/yu-jen-lan", 9.75, 2.6],
  ];
  contacts.forEach(([ic, t, x, w]) => {
    s.addImage({ path: icon(ic), x, y: 5.83, w: 0.26, h: 0.26 });
    s.addText(t, { x: x + 0.36, y: 5.78, w, h: 0.36, fontFace: F_BODY, fontSize: 12, color: ICE, valign: "middle", isTextBox: true, margin: 0 });
  });
  s.addText("Interview deck  ·  context first, then experience, then pick a track  ·  Appendix: project deep dives", {
    x: 0.9, y: 6.55, w: 11.5, h: 0.35, fontFace: F_BODY, fontSize: 11.5, italic: true, color: "8FA9C2", isTextBox: true, margin: 0,
  });

  s.addNotes([
    "【自我介紹 3–5 分鐘，結尾主動交球】",
    "一句定位：我是做 Linux / BMC 平台的系統軟體工程師，擅長設計驗證系統、跨層除錯，從 Redfish API 一路到 driver。",
    "三個強項：(1) 驗證系統設計——現職的 Redfish 驗證平台（工作、主要由我推進）；(2) 跨層除錯——開機時間 −60%、修記憶體生命週期與並行缺陷；(3) 自主專案的系統深度——HTTPS-Guard、HowToPLDM（標明是自主專案）。",
    "結尾：「先花一分鐘講 BMC 和 Redfish 是什麼，再講我的經歷。」→ 翻到下一頁。設計案例放在附錄 Redfish 段落最前面，對方追問時直接跳過去。",
    "",
    "【依職缺選開場軌道（下一頁之後、第 5 頁三軌總覽）】",
    "嵌入式／韌體安全：Track B 起手，立刻接 Track A；主打 QEMU-eBPF-Sandbox、HTTPS-Guard、Redfish 平台；MultiFish、GoVarlink 只留總覽表。",
    "安全／eBPF／偵測：Track B；主打 HTTPS-Guard、QEMU-eBPF-Sandbox、HTTPS_Notes；MultiFish、HowToPLDM、GoVarlink 只留總覽表。",
    "雲原生／DevSecOps／平台：Track B + C；主打 HTTPS-Guard、MultiFish；HowToPLDM 只留總覽表。",
    "BMC／韌體／系統：Track A；主打 Redfish 平台、HowToPLDM、HowToSDBusPlus；HTTPS_Notes 只留總覽表。",
  ].join("\n"));
}

// ---------------------------------------------------------------------
// 2 — CONTEXT: what a BMC is, what Redfish is, what I do
// ---------------------------------------------------------------------
{
  const s = newSlide("context");
  bgFill(s, WHITE);
  apKicker(s, "Context First", "BMC, Redfish — and Where My Work Sits", { icon: "FiServer", circleColor: NAVY });

  const cw = 3.9, g = 0.215, cy = 1.6, ch = 3.25;
  const cols = [
    { ic: "FiServer", c: NAVY, h: "What is a BMC?", body: [
      { text: "A small, separate computer on the server motherboard. It lets an administrator power the server on or off, read temperatures and fan speeds, update firmware and manage accounts — ", options: {} },
      { text: "even when the main OS is down.", options: { bold: true } },
      { text: " OpenBMC is the widely used open-source firmware stack for it.", options: {} }] },
    { ic: "FiLink2", c: TEAL_DK, h: "What is Redfish?", body: [
      { text: "The industry-standard API for talking to a BMC, published by DMTF as the modern replacement for IPMI: ", options: {} },
      { text: "RESTful JSON over HTTPS, ", options: { bold: true } },
      { text: "organised as a tree of resources. Clients GET to read, PATCH to change, POST / DELETE to create and remove, and invoke actions such as a reset.", options: {} }] },
    { ic: "FiTool", c: STEEL, h: "What I do", body: null },
  ];
  cols.forEach((col, i) => {
    const x = 0.6 + i * (cw + g);
    cardShape(s, x, cy, cw, ch, { fill: i === 2 ? NAVY : BG_SUBTLE, line: i === 2 ? { type: "none" } : { color: "E3E9EF", width: 1 }, noShadow: true });
    iconCircle(s, col.ic, x + 0.25, cy + 0.22, 0.55, i === 2 ? TEAL_DK : col.c, 0.12);
    s.addText(col.h, { x: x + 0.95, y: cy + 0.3, w: cw - 1.1, h: 0.4, fontFace: F_HEAD, fontSize: 16, bold: true, color: i === 2 ? WHITE : NAVY, isTextBox: true, margin: 0 });
    if (col.body) {
      s.addText(col.body, { x: x + 0.25, y: cy + 0.95, w: cw - 0.5, h: ch - 1.1, fontFace: F_BODY, fontSize: 11.5, color: TEXT_DARK, isTextBox: true, margin: 0, valign: "top", lineSpacingMultiple: 1.12 });
    } else {
      bulletBlock(s, x + 0.25, cy + 0.95, cw - 0.45, [
        { lead: "Build: ", rest: "Redfish services in OpenBMC firmware — bmcweb and the D-Bus services behind it." },
        { lead: "Validate: ", rest: "a document-driven test platform — tests written as data from the vendor spec, run on real hardware." },
        { lead: "Debug: ", rest: "across the stack, Redfish → D-Bus → Linux → drivers." },
      ], { fontSize: 11.5, color: ICE, leadColor: TEAL, bulletColor: TEAL, paraSpaceAfter: 7, h: ch - 1.1, indent: 12 });
    }
  });

  // The stack, left to right — where each keyword lives
  s.addText("One request, end to end — the keywords you'll hear next, in order", { x: 0.6, y: 5.07, w: 12.13, h: 0.3, fontFace: F_BODY, fontSize: 11, bold: true, color: TEAL_DK, isTextBox: true, margin: 0 });
  const chain = [
    ["Admin / client", "browser, script, curl"], ["Redfish", "JSON over HTTPS"], ["bmcweb", "OpenBMC's web server"],
    ["D-Bus services", "one per subsystem"], ["Linux & drivers", "I2C, MCTP / PLDM, hwmon"], ["Hardware", "sensors, fans, PSUs"],
  ];
  const bw = 1.82, bg = 0.242, by = 5.45, bh = 0.72;
  chain.forEach(([h, sub], i) => {
    const x = 0.6 + i * (bw + bg);
    const mine = i >= 1 && i <= 4;
    diaBox(s, x, by, bw, bh, [h, sub], { fontSize: 11.5, subIdx: 1, lineGap: 2, fill: mine ? NAVY2 : WHITE, color: mine ? WHITE : TEXT_DARK, subColor: mine ? ICE : TEXT_MUTED });
    if (i < chain.length - 1) diaArrow(s, x + bw + 0.03, by + bh / 2, x + bw + bg - 0.03, by + bh / 2, { color: STEEL, width: 1.25 });
  });
  s.addShape(pres.ShapeType.roundRect, { x: 0.6 + (bw + bg) - 0.06, y: by + bh + 0.08, w: 4 * bw + 3 * bg + 0.12, h: 0.3, rectRadius: 0.05, fill: { color: "E6F4F2" }, line: { type: "none" } });
  s.addText("where my day-to-day work sits", { x: 0.6 + (bw + bg), y: by + bh + 0.08, w: 4 * bw + 3 * bg, h: 0.3, fontFace: F_BODY, fontSize: 10, bold: true, italic: true, color: TEAL_DK, align: "center", valign: "middle", isTextBox: true, margin: 0 });
  footer(s, "Yujen Lan  ·  Context");
  s.addNotes([
    "【先讓對方有關鍵字，再講經歷】約 1 分鐘。",
    "BMC：主機板上獨立的小電腦，OS 掛了也能遠端開關機、看溫度風扇、更新韌體、管帳號。OpenBMC 是常見的開源韌體。",
    "Redfish：DMTF 制定、取代 IPMI 的標準 API，JSON over HTTPS，資源是一棵樹（Systems、Chassis、Managers…），GET 讀、PATCH 改、POST/DELETE 新增刪除、action 觸發重開等。",
    "我做的事：在 OpenBMC 裡做 Redfish 服務（bmcweb 與背後的 D-Bus 服務）、用文件驅動的測試平台在真機上驗證、跨層除錯 Redfish → D-Bus → Linux → driver。",
    "下面那條鏈就是接下來經歷頁會出現的關鍵字的位置，講完直接翻經歷。",
  ].join("\n"));
}

// ---------------------------------------------------------------------
// 2 — DESIGN CASE 1/2: what Redfish is, the problem, the architecture
// ---------------------------------------------------------------------
{
  const s = newSlide("dc1");
  bgFill(s, WHITE);
  apKicker(s, "Appendix · Redfish Platform 1/11 · Work Project", "Document-Driven Validation Design: Problem & Architecture", { icon: "FiCheckCircle", circleColor: TEAL_DK, titleSize: 24 });

  // Left: what Redfish is + the problem
  cardShape(s, 0.6, 1.6, 5.2, 1.82, { fill: BG_SUBTLE, line: { color: "E3E9EF", width: 1 }, noShadow: true });
  s.addText("What it is", { x: 0.85, y: 1.7, w: 4.7, h: 0.3, fontFace: F_HEAD, fontSize: 13, bold: true, color: NAVY, isTextBox: true, margin: 0 });
  s.addText("Automated conformance testing for a vendor's Redfish implementation on OpenBMC firmware: does the BMC actually implement what the standard and the vendor spec require? Tests are written as documents — one YAML file per schema, generated compliance data from the spec — and every test runs against real hardware over HTTPS.", {
    x: 0.85, y: 2.03, w: 4.75, h: 1.32, fontFace: F_BODY, fontSize: 11, color: TEXT_DARK, isTextBox: true, margin: 0, valign: "top", lineSpacingMultiple: 1.08,
  });

  s.addText("The problem", { x: 0.6, y: 3.55, w: 5.2, h: 0.3, fontFace: F_HEAD, fontSize: 13, bold: true, color: TEAL_DK, isTextBox: true, margin: 0 });
  bulletBlock(s, 0.6, 3.9, 5.2, [
    { lead: "Every firmware build × many platforms — ", rest: "hundreds of checks per build can't be done by hand." },
    { lead: "The off-the-shelf validator answers a different question — ", rest: "DMTF's Service Validator is read-only and treats a missing property as legal; the vendor spec says properties must exist, and some must be written and invoked." },
    { lead: "Two earlier in-house generations stopped scaling — ", rest: "a keyword runner only its author could maintain, then hand-written pytest with boilerplate per schema." },
  ], { fontSize: 11.5, paraSpaceAfter: 7, h: 2.3 });

  // Right: architecture chain + three independent data layers
  const cx = 6.15, cw = 3.55, bh = 0.8;
  const ys = [1.62, 2.75, 3.88, 5.01];
  diaBox(s, cx, ys[0], cw, bh, ["CLI wrapper", "unknown flags pass straight through to pytest"], { fontSize: 12, subIdx: 1, fill: BG_SUBTLE });
  diaBox(s, cx, ys[1], cw, bh, ["phase 1 · collection", "no BMC yet: each schema's YAML → Collector / Item objects"], { fontSize: 12, subIdx: 1, fill: NAVY2, color: WHITE, subColor: ICE });
  diaBox(s, cx, ys[2], cw, bh, ["phase 2 · execution", "live BMC over HTTPS: send, check, run sequences"], { fontSize: 12, subIdx: 1, fill: NAVY, color: WHITE, subColor: ICE });
  diaBox(s, cx, ys[3], cw, bh, ["one report", "a row per step; every request as a replayable curl"], { fontSize: 12, subIdx: 1, fill: BG_SUBTLE });
  for (let i = 0; i < 3; i++) diaArrow(s, cx + cw / 2, ys[i] + bh, cx + cw / 2, ys[i + 1], { color: STEEL });

  const dx = 10.15, dw = 2.58, dh = 0.68;
  s.addText("three independent layers", { x: dx, y: 2.28, w: dw, h: 0.3, fontFace: F_BODY, fontSize: 10.5, bold: true, color: TEAL_DK, align: "center", isTextBox: true, margin: 0 });
  const data = [["which rig", "connection details"], ["what the hardware has", "per-platform inventory"], ["what the spec requires", "compliance data, tiered"]];
  const dys = [2.65, 3.45, 4.25];
  data.forEach((d, i) => {
    diaBox(s, dx, dys[i], dw, dh, d, { fontSize: 11, subIdx: 1, line: { color: TEAL_DK, width: 1.25 } });
    diaArrow(s, dx, dys[i] + dh / 2, cx + cw, ys[2] + bh / 2, { color: TEAL_DK });
  });
  s.addText("tiers: common → chip gen → customer → platform", { x: dx - 0.1, y: 5.0, w: dw + 0.2, h: 0.5, fontFace: F_BODY, fontSize: 9, italic: true, color: TEXT_MUTED, align: "center", isTextBox: true, margin: 0 });

  s.addText("Tests are data, not code: one YAML file per schema says what to check; the engine decides how. One engine change upgrades every test, and a new platform is a data change rather than a code change.", {
    x: 0.6, y: 6.2, w: 12.13, h: 0.6, fontFace: F_BODY, fontSize: 11.5, italic: true, color: TEXT_MUTED, isTextBox: true, margin: 0, lineSpacingMultiple: 1.15,
  });
  footer(s, "Yujen Lan  ·  Appendix");
  s.addNotes([
    "【設計案例怎麼講：問題 → 架構 → 取捨 → 驗證結果】（Redfish 是什麼已在主簡報第 2 頁講過）",
    "Document-driven：測試是文件（每個 schema 一個 YAML、合規資料由廠商規格產生），engine 決定怎麼跑。",
    "問題：每個韌體版本 × 多個平台；DMTF Service Validator 只讀、而且把『欄位不存在』當合法；廠商規格要求欄位必須存在、有些要能寫、要能觸發 action。",
    "架構：CLI 包 pytest（未知參數直接傳給 pytest）→ 收集階段把每個 schema 的 YAML 變成真的 Collector / Item → 打真的 BMC（沒有 mock）→ 一份報表，每個 request 都能用 curl 重播。",
    "三層資料分離：哪台機器 / 這台硬體有什麼 / 規格要求什麼，所以同一份測試定義不改就能跑所有平台；新平台是改資料不是改程式。",
    "把它講成『我設計的系統』，不是『我寫的測試』。",
  ].join("\n"));
}

// ---------------------------------------------------------------------
// 3 — DESIGN CASE 2/2: trade-offs and verified results
// ---------------------------------------------------------------------
{
  const s = newSlide("dc2");
  bgFill(s, WHITE);
  apKicker(s, "Appendix · Redfish Platform 2/11 · Work Project", "Document-Driven Validation Design: Trade-offs & Results", { icon: "FiTarget", circleColor: TEAL_DK, titleSize: 24 });

  const rows = [
    ["Decision", "Why", "Cost accepted"],
    ["Tests as YAML data", "one engine change upgrades every test; a Redfish-literate QA engineer can add coverage without pytest", "a project-specific field vocabulary — the learning curve moved, it didn't vanish"],
    ["Complement the DMTF validators", "they own pure-read standard schemas; this suite owns writes, actions, OEM extensions, must-exist properties", "narrower standard-schema coverage than the Service Validator"],
    ["No mock BMC", "a mock would only test the mock", "real, shared rigs: write → re-read → restore, plus an --allow flag per risky action"],
    ["Declarative fields first", "patterns the hand-written suite reinvented module by module became 19 engine features", "an escape hatch (a plain Python function) is kept — used only after checking no field fits"],
  ];
  tableSlideBasic(s, 0.6, 1.6, 6.5, rows, { colW: [1.6, 2.45, 2.45], fontSize: 10, rowH: [0.42, 0.94, 0.94, 0.94, 0.94], align: ["left", "left", "left"], boldFirstCol: true });

  const rx = 7.35, rw = 5.38;
  s.addText("Results, measured on live hardware", { x: rx, y: 1.55, w: rw, h: 0.3, fontFace: F_HEAD, fontSize: 13, bold: true, color: TEAL_DK, isTextBox: true, margin: 0 });
  const stats = [
    ["297", "test cases, plus 325 request variants"], ["12", "hardware platforms, 2 generations"], ["280–650", "tests per platform run, 5–30 min"],
    ["527", "engine self-tests (was ~215)"], ["76", "Redfish schemas, standard and OEM"], ["13", "risky-action categories, each opt-in"],
  ];
  const cgap = 0.12, cw = (rw - 2 * cgap) / 3, ch = 1.12;
  stats.forEach(([v, l], i) => {
    const x = rx + (i % 3) * (cw + cgap), y = 1.95 + Math.floor(i / 3) * (ch + cgap);
    cardShape(s, x, y, cw, ch, { fill: BG_SUBTLE, line: { color: "E3E9EF", width: 1 }, noShadow: true });
    s.addText(v, { x, y: y + 0.1, w: cw, h: 0.48, fontFace: F_HEAD, fontSize: 24, bold: true, color: NAVY, align: "center", isTextBox: true, margin: 0 });
    s.addText(l, { x: x + 0.08, y: y + 0.6, w: cw - 0.16, h: 0.46, fontFace: F_BODY, fontSize: 9.5, color: TEXT_MUTED, align: "center", valign: "top", isTextBox: true, margin: 0 });
  });

  cardShape(s, rx, 4.5, rw, 1.42, { fill: WHITE, line: { color: "CBD8E4", width: 1 }, noShadow: true });
  s.addText("Where it goes next — documented open problems", { x: rx + 0.2, y: 4.58, w: rw - 0.4, h: 0.3, fontFace: F_BODY, fontSize: 11, bold: true, color: NAVY, isTextBox: true, margin: 0 });
  bulletBlock(s, rx + 0.2, 4.92, rw - 0.4, [
    "Several people, each with an AI, at once — two sessions can claim the same ticket or change the same shared rig",
    "Live findings move from in-file comments to tracked issues raised with the firmware and spec owners",
  ], { fontSize: 10, paraSpaceAfter: 4, h: 0.95 });

  cardShape(s, 0.6, 6.12, 12.13, 0.78, { fill: NAVY, line: { type: "none" }, noShadow: true });
  s.addText([
    { text: "Verified, not assumed: ", options: { fontFace: F_BODY, fontSize: 11.5, bold: true, color: TEAL } },
    { text: "a write check once reported PASSED while the resource was unchanged — caught by a manual curl replay because the pass looked too easy. The rule since: prove a check can fail before trusting that it passes.", options: { fontFace: F_BODY, fontSize: 11.5, color: ICE } },
  ], { x: 0.85, y: 6.17, w: 11.65, h: 0.68, isTextBox: true, margin: 0, valign: "middle", lineSpacingMultiple: 1.12 });
  footer(s, "Yujen Lan  ·  Appendix");
  s.addNotes([
    "【取捨要講出代價，不只講優點】每一列都是『我做了這個決定、為什麼、付出什麼代價』。",
    "如果被追問系統設計：先問規模（資料量、延遲、同時在線數），再講怎麼演進——多人＋多個 AI 同時作業時的 ticket 認領與共用機台鎖定、live findings 改成正式追蹤的 issue。",
    "數字來源：README / AI_WORKFLOW（2026-10-29）。一個平台一次跑約 280–650 個測試、5–30 分鐘；12 個平台、2 代硬體；engine self-test 從約 215 到 527。",
    "驗證故事：write 驗證曾經回報 PASSED、但資源其實沒改 → 手動 curl 重播抓到。之後的規則：先證明 check 會失敗，才相信它的 pass。",
  ].join("\n"));
}

// ---------------------------------------------------------------------
// 4 — EXPERIENCE with ownership tags
// ---------------------------------------------------------------------
{
  const s = newSlide("exp");
  bgFill(s, WHITE);
  apKicker(s, "Experience", "Where the Numbers Come From — and Who Owned What", { icon: "FiTrendingUp", circleColor: NAVY, titleSize: 26 });

  s.addText("Insyde Software — Software Engineer", { x: 0.6, y: 1.55, w: 6.0, h: 0.34, fontFace: F_HEAD, fontSize: 14.5, bold: true, color: NAVY, isTextBox: true, margin: 0 });
  s.addText("July 2024 – Present", { x: 6.45, y: 1.57, w: 2.5, h: 0.3, fontFace: F_BODY, fontSize: 11, color: TEXT_MUTED, align: "right", isTextBox: true, margin: 0 });
  s.addText("Role mix ≈ RD : QA = 1 : 1 — Redfish resource work and platform porting are assigned by team availability.", {
    x: 0.6, y: 1.93, w: 8.35, h: 0.3, fontFace: F_BODY, fontSize: 11, italic: true, color: TEAL_DK, isTextBox: true, margin: 0,
  });

  const rows = [
    ["owned", "Document-driven validation platform — started as a three-person project; after a teammate left, primarily driven and maintained by me (Appendix p.8–18)."],
    ["owned", "Upstream OpenBMC integration — designed the workflow that cut porting/patching from months to weeks; the porting itself rotates across the team."],
    ["owned", "Redfish schema refactor — evaluated and targeted the bottleneck schemas, then refactored them: +30% runtime performance."],
    ["contrib", "BMC startup time cut by over 60% through startup profiling, dependency analysis and service-initialization optimization."],
    ["contrib", "Fixed memory-lifetime and concurrency defects in production BMC code — security-relevant bug classes — using reusable RAII/OOP utility libraries."],
    ["contrib", "Implemented and maintained Redfish authentication, role-privilege and certificate features; application-layer TLS use and configuration."],
    ["rotation", "Redfish resource implementation and platform porting; legacy backend moved to a reverse proxy, firmware update unified behind one multipart API."],
  ];
  rows.forEach(([k, t], i) => {
    const y = 2.36 + i * 0.585;
    if (i % 2 === 0) s.addShape(pres.ShapeType.roundRect, { x: 0.6, y: y - 0.02, w: 8.35, h: 0.56, rectRadius: 0.06, fill: { color: BG_SUBTLE }, line: { type: "none" } });
    tagPill(s, 0.72, y + 0.12, k, { w: 1.2, h: 0.3, fontSize: 9 });
    s.addText(t, { x: 2.05, y, w: 6.8, h: 0.52, fontFace: F_BODY, fontSize: 10.5, color: TEXT_DARK, valign: "middle", isTextBox: true, margin: 0, lineSpacingMultiple: 1.05 });
  });
  s.addText("Owned — I proposed or changed the design or process, and I'm the one called when it breaks  ·  Contributed — implemented within an existing design  ·  Team rotation — shared work, assigned by availability", {
    x: 0.6, y: 6.5, w: 8.35, h: 0.45, fontFace: F_BODY, fontSize: 9, italic: true, color: TEXT_MUTED, isTextBox: true, margin: 0,
  });

  const rx = 9.25, rw = 3.48;
  cardShape(s, rx, 1.55, rw, 2.85, { fill: BG_SUBTLE, line: { color: "E3E9EF", width: 1 }, noShadow: true });
  s.addText("SinoPac Securities", { x: rx + 0.2, y: 1.65, w: rw - 0.4, h: 0.32, fontFace: F_HEAD, fontSize: 13.5, bold: true, color: NAVY, isTextBox: true, margin: 0 });
  s.addText("Software Engineer · June 2023 – April 2024", { x: rx + 0.2, y: 1.97, w: rw - 0.4, h: 0.28, fontFace: F_BODY, fontSize: 10, color: TEXT_MUTED, isTextBox: true, margin: 0 });
  bulletBlock(s, rx + 0.2, 2.35, rw - 0.4, [
    "3–4x data-processing efficiency via algorithm and workflow redesign",
    "C++ backend applications on Linux",
    "CI/CD pipelines for build validation and testing, reducing manual effort",
  ], { fontSize: 10.5, paraSpaceAfter: 6, h: 1.95 });

  cardShape(s, rx, 4.55, rw, 1.85, { fill: BG_SUBTLE, line: { color: "E3E9EF", width: 1 }, noShadow: true });
  s.addText("Education", { x: rx + 0.2, y: 4.65, w: rw - 0.4, h: 0.32, fontFace: F_HEAD, fontSize: 13.5, bold: true, color: NAVY, isTextBox: true, margin: 0 });
  s.addText([
    { text: "National Cheng Kung University (NCKU)", options: { bold: true, breakLine: true } },
    { text: "M.S. Systems & Naval Mechatronic Engineering — 2021, GPA 4.3", options: { breakLine: true } },
    { text: "B.S. same field — 2018, GPA 3.7" },
  ], { x: rx + 0.2, y: 5.0, w: rw - 0.4, h: 1.3, fontFace: F_BODY, fontSize: 10.5, color: TEXT_DARK, isTextBox: true, margin: 0, valign: "top", lineSpacingMultiple: 1.15 });
  footer(s, "Yujen Lan  ·  Experience");
  s.addNotes([
    "【分工被問時：用『我改變了什麼』講，不算比例】",
    "RD:QA 約 1:1；resource 與 porting 是看誰有空分配，中間也被調去做完全不同的專案，所以不講百分比。",
    "判斷能不能說是我的：(1) 有沒有一個設計或流程是我提出或改掉的？(2) 我不在會不會做得比較差或根本不會發生？(3) 出問題時是不是叫我去看？",
    "驗證平台口述：「最初是三個人的專案，中途有人離職，後來主要由我推進和維護，成長到現在 297 個 test case、76 個 schema、12 個平台。我發現 DMTF 官方 validator 的結構性缺口（只讀、不檢查欄位是否存在），才設計這個平台補上。」",
    "上游整合：porting 是團隊輪流，但把它從數月縮到數週的流程設計是我的。Schema 重構：我評估並鎖定瓶頸 schema 做重構，拿到 +30%。",
    "措辭：用「後來主要由我推進」，不要說「幾乎都是我硬幹的」。",
  ].join("\n"));
}

// ---------------------------------------------------------------------
// 5 — THREE TRACKS: pick where to go deeper
// ---------------------------------------------------------------------
{
  const s = newSlide("tracks");
  bgFill(s, WHITE);
  apKicker(s, "Three Tracks · One Deck", "Pick Where We Go Deeper", { icon: "FiLayers", circleColor: TEAL });

  const tracks = [
    { k: "TRACK A", t: "BMC / Platform", ic: "FiServer", c: NAVY, kw: "Redfish · OpenBMC · bmcweb · D-Bus · MCTP/PLDM · Yocto",
      work: ["Document-driven validation platform", "BMC startup −60%; upstream integration from months to weeks", "Redfish schema refactor, +30%"],
      self: ["HowToPLDM — a real MCTP/PLDM driver stack on QEMU", "HowToSDBusPlus · HowToYocto"],
      go: "Redfish p.7–18  ·  PLDM p.50–54" },
    { k: "TRACK B", t: "Security & Detection", ic: "FiShield", c: TEAL_DK, kw: "eBPF · XDP · uprobes/kprobes · TLS/PKI · OpenSSL",
      work: ["Memory-lifetime and concurrency defect fixes in production BMC code", "Redfish auth, roles and certificates — app-layer TLS"],
      self: ["HTTPS-Guard — eBPF intrusion detection, verified live", "QEMU-eBPF-Sandbox · HTTPS_Notes"],
      go: "HTTPS-Guard p.19–27  ·  Sandbox p.28–31" },
    { k: "TRACK C", t: "Backend / Systems", ic: "FiCode", c: STEEL, kw: "Modern C++ · Go · concurrency · API design · performance",
      work: ["SinoPac: 3–4x data-processing efficiency", "Reverse-proxy migration; one multipart firmware-update API"],
      self: ["MultiFish — Go generics and testable concurrency", "GoVarlink — four runtimes, measured vs. D-Bus"],
      go: "MultiFish p.36–41  ·  GoVarlink p.45–47" },
  ];
  const w = 3.9, gap = 0.215, y = 1.6, h = 5.25;
  tracks.forEach((tr, i) => {
    const x = 0.6 + i * (w + gap);
    cardShape(s, x, y, w, h, { fill: WHITE, line: { color: "D9E2EC", width: 1 } });
    iconCircle(s, tr.ic, x + 0.25, y + 0.25, 0.62, tr.c);
    s.addText(tr.k, { x: x + 1.02, y: y + 0.26, w: w - 1.2, h: 0.26, fontFace: F_BODY, fontSize: 10.5, bold: true, color: tr.c === NAVY ? STEEL : tr.c, charSpacing: 2, isTextBox: true, margin: 0 });
    s.addText(tr.t, { x: x + 1.02, y: y + 0.5, w: w - 1.15, h: 0.4, fontFace: F_HEAD, fontSize: 16, bold: true, color: NAVY, isTextBox: true, margin: 0 });
    s.addText(tr.kw, { x: x + 0.25, y: y + 1.05, w: w - 0.5, h: 0.5, fontFace: F_BODY, fontSize: 10, italic: true, color: TEAL_DK, isTextBox: true, margin: 0, valign: "top" });
    tagPill(s, x + 0.25, y + 1.65, "work", { w: 1.1, h: 0.28, fontSize: 8.5, text: "AT WORK" });
    bulletBlock(s, x + 0.25, y + 2.02, w - 0.45, tr.work, { fontSize: 10.5, paraSpaceAfter: 4, h: 1.3, indent: 12 });
    tagPill(s, x + 0.25, y + 3.35, "self", { w: 1.45, h: 0.28, fontSize: 8.5 });
    bulletBlock(s, x + 0.25, y + 3.72, w - 0.45, tr.self, { fontSize: 10.5, paraSpaceAfter: 4, h: 0.85, indent: 12 });
    s.addShape(pres.ShapeType.roundRect, { x: x + 0.2, y: y + h - 0.62, w: w - 0.4, h: 0.42, rectRadius: 0.07, fill: { color: BG_SUBTLE }, line: { type: "none" } });
    s.addText([{ text: "→  ", options: { bold: true, color: tr.c === NAVY ? NAVY : tr.c } }, { text: tr.go, options: { color: TEXT_DARK } }], {
      x: x + 0.3, y: y + h - 0.62, w: w - 0.5, h: 0.42, fontFace: F_BODY, fontSize: 9.5, valign: "middle", isTextBox: true, margin: 0,
    });
  });
  footer(s, "Yujen Lan  ·  Navigation");
  s.addNotes([
    "【依職缺決定從哪條軌開場，事前決定順序】",
    "嵌入式／韌體安全 → B 起手立刻接 A；安全／eBPF → B；雲原生／DevSecOps → B + C；BMC／韌體／系統 → A。",
    "Track B 一律先說：這些安全專案是自主做的，現職沒有安全任務——這個標籤本身就是故事（為什麼自己做）。",
    "Go / MultiFish 不刪：雲原生方向它是佐證；是否強調看 JD 技術棧。",
  ].join("\n"));
}

// ---------------------------------------------------------------------
// 6 — WORK vs SELF-DIRECTED
// ---------------------------------------------------------------------
{
  const s = newSlide("projects");
  bgFill(s, WHITE);
  apKicker(s, "Open Source · Labeled", "Work vs. Self-Directed — Separated on Purpose", { icon: "FiGitBranch", circleColor: TEAL });

  const lx = 0.6, lw = 4.25;
  cardShape(s, lx, 1.6, lw, 5.25, { fill: NAVY, line: { type: "none" } });
  tagPill(s, lx + 0.3, 1.85, "work", { w: 0.95, h: 0.3, fontSize: 9, fill: "24476B" });
  s.addText("Document-driven validation platform", { x: lx + 0.3, y: 2.25, w: lw - 0.6, h: 0.7, fontFace: F_HEAD, fontSize: 16, bold: true, color: WHITE, isTextBox: true, margin: 0 });
  s.addText("public case study: RedfishAutoYamlTestInterview", { x: lx + 0.3, y: 2.98, w: lw - 0.6, h: 0.3, fontFace: F_BODY, fontSize: 10.5, italic: true, color: "8FA9C2", isTextBox: true, margin: 0 });
  bulletBlock(s, lx + 0.3, 3.38, lw - 0.6, [
    "Design case p.8–9 · what it looks like p.10–11: the HTML report and the YAML visualizer",
    "Deep dive p.12–18: vs. DMTF, two-phase engine, scale & safety, AI workflow, what it caught",
    "Documentation only — no source, test definitions or product data",
  ], { fontSize: 10.5, color: ICE, bulletColor: TEAL, paraSpaceAfter: 6, h: 1.65 });
  s.addShape(pres.ShapeType.line, { x: lx + 0.3, y: 4.98, w: lw - 0.6, h: 0, line: { color: "24476B", width: 1 } });
  s.addText([
    { text: "Why the label matters", options: { bold: true, color: TEAL, breakLine: true, fontSize: 11.5 } },
    { text: "None of the security work was assigned at Insyde. Labeling it self-directed is the point — it answers why I built it: to understand detection end to end, on my own time.", options: { color: ICE, fontSize: 10.5 } },
  ], { x: lx + 0.3, y: 5.1, w: lw - 0.6, h: 1.6, fontFace: F_BODY, isTextBox: true, margin: 0, valign: "top", lineSpacingMultiple: 1.15 });

  const rx = 5.1, rw = 7.63;
  tagPill(s, rx, 1.62, "self", { w: 1.55, h: 0.3, fontSize: 9 });
  s.addText("built and verified on my own time", { x: rx + 1.7, y: 1.62, w: 5, h: 0.3, fontFace: F_BODY, fontSize: 11, italic: true, color: TEXT_MUTED, valign: "middle", isTextBox: true, margin: 0 });
  const rows = [
    ["Project", "What it is", "Track", "Pages"],
    ["HTTPS-Guard", "eBPF runtime intrusion detection for OpenBMC", "B", "p.19–27"],
    ["QEMU-eBPF-Sandbox", "eBPF development framework, three design variants", "B", "p.28–31"],
    ["HTTPS_Notes", "TLS / PKI / HTTP deep dive, with a bmcweb walkthrough", "B", "p.32–35"],
    ["MultiFish", "multi-BMC Redfish management service in Go", "C", "p.36–41"],
    ["HowToSDBusPlus", "modern C++ D-Bus services, with benchmarks", "A", "p.42–44"],
    ["GoVarlink", "polyglot Varlink IPC, measured against D-Bus", "C", "p.45–47"],
    ["HowToYocto", "custom Yocto / BitBake image practice", "A", "p.48–49"],
    ["HowToPLDM", "real MCTP/PLDM driver stack on QEMU AST2600", "A", "p.50–54"],
  ];
  tableSlideBasic(s, rx, 2.05, rw, rows, { colW: [2.05, 3.98, 0.7, 0.9], fontSize: 10.5, rowH: 0.52, align: ["left", "left", "center", "center"], boldFirstCol: true });
  footer(s, "Yujen Lan  ·  Open Source");
}
