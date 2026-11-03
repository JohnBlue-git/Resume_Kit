// Helpers ported 1:1 from the original build.js / appendix.js so new slides match the existing deck.
const pptxgen = require("pptxgenjs");
const path = require("path");

const NAVY = "0F2440", NAVY2 = "16324F", STEEL = "3E5C76", ICE = "CFE3F2", TEAL = "00B8A9", TEAL_DK = "00897E";
const WHITE = "FFFFFF", BG_SUBTLE = "F4F7FB", TEXT_DARK = "16232F", TEXT_MUTED = "5C6B7A", GRAY = "8A97A6";
const F_HEAD = "Cambria", F_BODY = "Calibri";
const ICON_DIR = path.join(__dirname, "..", "icons");
const icon = (n) => path.join(ICON_DIR, `${n}.png`);

const pres = new pptxgen();
pres.defineLayout({ name: "WIDE", width: 13.333, height: 7.5 });
pres.layout = "WIDE";
const PW = 13.333, PH = 7.5;

const manifest = [];
function newSlide(key) { const s = pres.addSlide(); manifest.push(key); return s; }

function footer(s, label) {
  s.addText(label, { x: 0.6, y: PH - 0.42, w: 8, h: 0.3, fontFace: F_BODY, fontSize: 10, color: TEXT_MUTED, isTextBox: true, margin: 0 });
  s.addText("0", { x: PW - 1.1, y: PH - 0.42, w: 0.5, h: 0.3, fontFace: F_BODY, fontSize: 10, color: TEXT_MUTED, align: "right", isTextBox: true, margin: 0 });
}
function iconCircle(s, name, x, y, d, circleColor, pad) {
  pad = pad === undefined ? 0.14 : pad;
  s.addShape(pres.ShapeType.ellipse, { x, y, w: d, h: d, fill: { color: circleColor }, line: { type: "none" } });
  s.addImage({ path: icon(name), x: x + pad, y: y + pad, w: d - pad * 2, h: d - pad * 2 });
}
function kickerTitle(s, kicker, title, o) {
  o = o || {};
  const dark = o.dark || false, titleSize = o.titleSize || 29;
  let leftX = 0.6;
  if (o.icon) { iconCircle(s, o.icon, 0.6, 0.48, 0.62, o.circleColor || TEAL); leftX = 1.42; }
  s.addText(kicker.toUpperCase(), { x: leftX, y: 0.48, w: 11, h: 0.32, fontFace: F_BODY, fontSize: 13, bold: true, color: dark ? TEAL : TEAL_DK, charSpacing: 2, isTextBox: true, margin: 0 });
  s.addText(title, { x: leftX, y: 0.76, w: 11.3, h: 0.68, fontFace: F_HEAD, fontSize: titleSize, bold: true, color: dark ? WHITE : NAVY, isTextBox: true, margin: 0 });
}
const apKicker = (s, k, t, o) => kickerTitle(s, k, t, Object.assign({ icon: "FiCheckCircle", circleColor: TEAL }, o || {}));
function bgFill(s, c) { s.background = { color: c }; }
function bulletBlock(s, x, y, w, items, o) {
  o = o || {};
  const fontSize = o.fontSize || 14, color = o.color || TEXT_DARK, bulletColor = o.bulletColor || TEAL_DK;
  const psa = o.paraSpaceAfter === undefined ? 10 : o.paraSpaceAfter;
  const leadColor = o.leadColor || color;
  const paras = [];
  items.forEach((it) => {
    const arr = [];
    if (typeof it === "string") arr.push({ text: it, options: { fontFace: F_BODY, fontSize, color } });
    else {
      if (it.lead) arr.push({ text: it.lead, options: { fontFace: F_BODY, fontSize, color: leadColor, bold: true } });
      arr.push({ text: it.rest || "", options: { fontFace: F_BODY, fontSize, color } });
    }
    arr[0].options = Object.assign({ bullet: { code: "25AA", color: bulletColor, indent: o.indent || 18 } }, arr[0].options);
    arr[arr.length - 1].options.paraSpaceAfter = psa;
    arr[arr.length - 1].options.breakLine = true;
    paras.push(...arr);
  });
  s.addText(paras, { x, y, w, h: o.h || 4, isTextBox: true, margin: 0, valign: "top", lineSpacingMultiple: o.lsm || 1.1 });
}
function ghChip(s, x, y, text, o) {
  o = o || {}; const w = o.w || 6.6;
  s.addShape(pres.ShapeType.roundRect, { x, y, w, h: 0.4, rectRadius: 0.08, fill: { color: o.fill || NAVY }, line: { type: "none" } });
  s.addImage({ path: icon("FiGithub"), x: x + 0.12, y: y + 0.09, w: 0.22, h: 0.22 });
  s.addText(text, { x: x + 0.44, y, w: w - 0.55, h: 0.4, fontFace: F_BODY, fontSize: 11.5, color: WHITE, valign: "middle", isTextBox: true, margin: 0 });
}
function tableSlideBasic(s, x, y, w, rows, o) {
  o = o || {}; const fontSize = o.fontSize || 12, headerFill = o.headerFill || NAVY;
  const t = rows.map((r, ri) => r.map((c, ci) => ({
    text: c,
    options: {
      fontFace: F_BODY, fontSize, color: ri === 0 ? WHITE : TEXT_DARK, bold: ri === 0 || (o.boldFirstCol && ci === 0),
      fill: { color: ri === 0 ? headerFill : (ri % 2 === 0 ? WHITE : BG_SUBTLE) },
      align: o.align ? o.align[ci] : (ci === 0 ? "left" : "center"), valign: "middle", margin: [3, 6, 3, 6],
    },
  })));
  s.addTable(t, { x, y, w, colW: o.colW, rowH: o.rowH, border: { type: "solid", color: "E3E9EF", pt: 0.75 }, autoPage: false });
}
function cardShape(s, x, y, w, h, o) {
  o = o || {};
  s.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.09, fill: { color: o.fill || WHITE }, line: o.line || { color: "E3E9EF", width: 1 },
    shadow: o.noShadow ? undefined : { type: "outer", color: "0F2440", opacity: 0.14, blur: 7, offset: 2, angle: 90 },
  });
}
function diaPill(s, x, y, w, h, text, o) {
  o = o || {};
  s.addShape(pres.ShapeType.roundRect, { x, y, w, h, rectRadius: h / 2, fill: { color: o.fill || NAVY }, line: o.line || { type: "none" } });
  s.addText(text, { x, y, w, h, fontFace: o.fontFace || F_HEAD, fontSize: o.fontSize || 13, bold: o.bold === undefined ? true : o.bold, color: o.color || WHITE, align: "center", valign: "middle", isTextBox: true, margin: 0, charSpacing: o.charSpacing });
}
function diaBox(s, x, y, w, h, lines, o) {
  o = o || {};
  s.addShape(pres.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.07, fill: { color: o.fill || WHITE }, line: o.line || { color: "CBD8E4", width: 1 } });
  const fs = o.fontSize || 10.5;
  const paras = lines.map((t, i) => {
    const sub = o.subIdx !== undefined && i >= o.subIdx;
    return { text: t, options: {
      fontFace: F_BODY, fontSize: sub ? fs - 1.5 : fs, color: sub ? (o.subColor || TEXT_MUTED) : (o.color || TEXT_DARK),
      italic: sub, bold: !sub && o.boldHead, align: o.align || "center", breakLine: true,
      paraSpaceAfter: i === lines.length - 1 ? 0 : (o.lineGap === undefined ? 5 : o.lineGap) } };
  });
  s.addText(paras, { x: x + (o.padX || 0), y, w: w - 2 * (o.padX || 0), h, valign: "middle", isTextBox: true, margin: 0, lineSpacingMultiple: 1.05 });
}
function diaArrow(s, x1, y1, x2, y2, o) {
  o = o || {};
  const line = { color: o.color || STEEL, width: o.width || 1.5, endArrowType: "triangle" };
  if (o.both) line.beginArrowType = "triangle";
  s.addShape(pres.ShapeType.line, { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1), flipH: x2 < x1, flipV: y2 < y1, line });
}
function diaLabel(s, cx, cy, text, o) {
  o = o || {}; const w = o.w || 2.6;
  s.addText(text, { x: cx - w / 2, y: cy - 0.15, w, h: 0.35, fontFace: F_BODY, fontSize: o.fontSize || 9, italic: o.italic === undefined ? true : o.italic, bold: o.bold, color: o.color || TEXT_MUTED, align: "center", valign: "middle", isTextBox: true, margin: 0 });
}
// Small rounded label used for Owned / Contributed / Work / Self-directed tags
const TAGS = {
  owned: { fill: TEAL_DK, color: WHITE, text: "Owned" },
  contrib: { fill: STEEL, color: WHITE, text: "Contributed" },
  rotation: { fill: "D5DDE6", color: NAVY, text: "Team rotation" },
  work: { fill: NAVY2, color: WHITE, text: "WORK" },
  self: { fill: TEAL_DK, color: WHITE, text: "SELF-DIRECTED" },
};
function tagPill(s, x, y, kind, o) {
  o = o || {}; const t = TAGS[kind];
  const w = o.w || 1.2, h = o.h || 0.3;
  s.addShape(pres.ShapeType.roundRect, { x, y, w, h, rectRadius: h / 2, fill: { color: o.fill || t.fill }, line: o.line || { type: "none" } });
  s.addText(o.text || t.text, { x, y, w, h, fontFace: F_BODY, fontSize: o.fontSize || 9.5, bold: true, color: o.color || t.color, align: "center", valign: "middle", isTextBox: true, margin: 0, charSpacing: o.charSpacing || 0.5 });
}
function apCover(cfg) {
  const s = newSlide("cover:" + cfg.n);
  bgFill(s, NAVY);
  s.addShape(pres.ShapeType.ellipse, { x: 10.6, y: -1.9, w: 5.2, h: 5.2, fill: { color: NAVY2 }, line: { type: "none" } });
  s.addShape(pres.ShapeType.ellipse, { x: 11.7, y: -0.95, w: 2.35, h: 2.35, fill: { color: cfg.color || TEAL_DK }, line: { type: "none" }, transparency: 55 });
  iconCircle(s, cfg.icon, 0.9, 1.95, 1.05, cfg.color || TEAL_DK);
  const tagText = cfg.work ? "WORK PROJECT  ·  PUBLIC CASE STUDY" : "SELF-DIRECTED PROJECT";
  const tw = cfg.work ? 3.55 : 2.55;
  s.addShape(pres.ShapeType.roundRect, { x: 2.2, y: 2.27, w: tw, h: 0.42, rectRadius: 0.21, fill: { color: NAVY2 }, line: { color: TEAL, width: 1.25 } });
  s.addText(tagText, { x: 2.2, y: 2.27, w: tw, h: 0.42, fontFace: F_BODY, fontSize: 10.5, bold: true, color: TEAL, align: "center", valign: "middle", charSpacing: 1.5, isTextBox: true, margin: 0 });
  s.addText(`APPENDIX  ·  PROJECT ${cfg.n} OF 9`, { x: 0.9, y: 3.15, w: 10.5, h: 0.32, fontFace: F_BODY, fontSize: 12.5, bold: true, color: cfg.color === STEEL ? "7FA3C2" : (cfg.color || TEAL_DK), charSpacing: 2.5, isTextBox: true, margin: 0 });
  s.addText(cfg.title, { x: 0.9, y: 3.46, w: 11.5, h: 0.85, fontFace: F_HEAD, fontSize: 33, bold: true, color: WHITE, isTextBox: true, margin: 0 });
  s.addText(cfg.tagline, { x: 0.9, y: 4.28, w: 11.2, h: 0.55, fontFace: F_BODY, fontSize: 14.5, italic: true, color: ICE, isTextBox: true, margin: 0 });
  let cx = 0.9; const chipH = 0.42, gap = 0.16;
  let row = 0;
  (cfg.chips || []).forEach((label) => {
    const w = 0.34 + label.length * 0.093;
    if (cx + w > 12.75) { row += 1; cx = 0.9; }
    const chipY = 5.05 + row * (chipH + 0.14);
    s.addShape(pres.ShapeType.roundRect, { x: cx, y: chipY, w, h: chipH, rectRadius: chipH / 2, fill: { color: NAVY2 }, line: { color: "24476B", width: 1 } });
    s.addText(label, { x: cx, y: chipY, w, h: chipH, fontFace: F_BODY, fontSize: 10.5, bold: true, color: ICE, align: "center", valign: "middle", isTextBox: true, margin: 0 });
    cx += w + gap;
  });
  if (row > 1) throw new Error("cover chips need more than two rows: " + cfg.title);
  ghChip(s, 0.9, 6.45, cfg.gh, { w: 7.6, fill: NAVY2 });
  footer(s, "Yujen Lan  ·  Appendix");
  if (cfg.notes) s.addNotes(cfg.notes);
  return s;
}
module.exports = { pres, PW, PH, manifest, newSlide, footer, iconCircle, kickerTitle, apKicker, bgFill, bulletBlock, ghChip,
  tableSlideBasic, cardShape, diaPill, diaBox, diaArrow, diaLabel, tagPill, apCover, icon,
  NAVY, NAVY2, STEEL, ICE, TEAL, TEAL_DK, WHITE, BG_SUBTLE, TEXT_DARK, TEXT_MUTED, GRAY, F_HEAD, F_BODY };
