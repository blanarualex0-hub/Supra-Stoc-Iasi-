import { useState, useMemo, useReducer } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell, PieChart, Pie, Legend
} from "recharts";

// ─── GOOGLE FONTS ─────────────────────────────────────────────────────────────
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@500;600;700;800&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; }
    h1,h2,h3,h4,h5,h6 { font-family: 'Outfit', sans-serif; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #c8d9c8; border-radius: 99px; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
    @keyframes slideUp { from { opacity:0; transform:translateY(100%); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
    @keyframes spin    { to   { transform:rotate(360deg); } }
    .fade-up  { animation: fadeUp  .35s ease both; }
    .slide-up { animation: slideUp .32s cubic-bezier(.34,1.56,.64,1) both; }
    .fade-in  { animation: fadeIn  .2s ease both; }
    tr:hover td { background: hsl(140 20% 97%); }
  `}</style>
);

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  bg:          "hsl(140,20%,98%)",
  card:        "#ffffff",
  border:      "hsl(140,15%,88%)",
  primary:     "hsl(87,64%,38%)",
  primaryFg:   "#ffffff",
  primaryLight:"hsl(87,64%,92%)",
  primaryDark: "hsl(87,64%,28%)",
  secondary:   "hsl(140,20%,92%)",
  muted:       "hsl(220,15%,50%)",
  accent:      "hsl(87,64%,94%)",
  destructive: "hsl(0,84%,60%)",
  destructiveLight:"hsl(0,84%,94%)",
  foreground:  "hsl(220,30%,15%)",
  shadow:      "0 2px 12px rgba(0,0,0,0.07)",
  shadowMd:    "0 4px 24px rgba(0,0,0,0.10)",
  radius:      14,
};

// ─── RAIOANE & DATE ───────────────────────────────────────────────────────────
const RAIOANE = [
  "1-MATERIALE CONSTRUCTII","2-TAMPLARIE","3-ELECTRICE","4-UNELTE",
  "5-ACOPERIRE SOL","6-GRESIE","7-SANITARE","8-INSTALATII",
  "9-GRADINA","10-FERONERIE","11-VOPSEA","12-DECORATIUNI",
  "13-ILUMINAT","14-ARANJARE SI DEPOZITARE","15-BUCATARII","16-SISTEME DE INCALZIRE",
];

// Date demo suprastoc
const INIT_ITEMS = [
  { id:1, denumire:"Bormașină Bosch GBH 2-28", codSku:"10445231", cantitate:8,  raion:"4-UNELTE",                  locatie:"R4-Top-A",  dataIntrare:"2026-04-15", observatii:"Cutii sigilate" },
  { id:2, denumire:"Gresie Porțelanată 60x60 Alb Mat", codSku:"11220000", cantitate:45, raion:"6-GRESIE",          locatie:"R6-Top-B",  dataIntrare:"2026-04-20", observatii:"" },
  { id:3, denumire:"Rigips RBI Gipscarton 12.5x1200x2000", codSku:"10350200", cantitate:30, raion:"1-MATERIALE CONSTRUCTII", locatie:"R1-Top-C", dataIntrare:"2026-04-18", observatii:"" },
  { id:4, denumire:"Set WC Stativ+Rez Ceramic Nerea", codSku:"11576733", cantitate:3,  raion:"7-SANITARE",          locatie:"R7-Top-A",  dataIntrare:"2026-05-01", observatii:"Verificat ambalaj" },
  { id:5, denumire:"Parchet Laminat 8mm Stejar",     codSku:"12000100", cantitate:2,  raion:"5-ACOPERIRE SOL",     locatie:"R5-Top-A",  dataIntrare:"2026-05-02", observatii:"" },
  { id:6, denumire:"Ceresit CT126 Glet Umplere 20kg",codSku:"10292310", cantitate:22, raion:"1-MATERIALE CONSTRUCTII", locatie:"R1-Top-B", dataIntrare:"2026-04-25", observatii:"" },
  { id:7, denumire:"Faianță 25x40 Alb Lucios",       codSku:"11220001", cantitate:60, raion:"6-GRESIE",            locatie:"R6-Top-A",  dataIntrare:"2026-04-22", observatii:"" },
  { id:8, denumire:"Cablu Electric CYY-F 3x2.5mm",   codSku:"10881200", cantitate:4,  raion:"3-ELECTRICE",         locatie:"R3-Top-A",  dataIntrare:"2026-04-30", observatii:"" },
];

const INIT_TX = {
  1:[{ id:1,tip:"intrare",cantitate:10,utilizator:"Ion Popescu",motiv:"Recepție furnizor",dataOra:"2026-04-15T08:30:00" },
     { id:2,tip:"iesire", cantitate:2, utilizator:"Maria Ionescu",motiv:"Refill raft",   dataOra:"2026-04-28T14:00:00" }],
  2:[{ id:3,tip:"intrare",cantitate:50,utilizator:"Andrei Mihai", motiv:"Recepție",       dataOra:"2026-04-20T09:00:00" },
     { id:4,tip:"iesire", cantitate:5, utilizator:"Ion Popescu",  motiv:"Comanda #4421", dataOra:"2026-05-03T11:00:00" }],
  4:[{ id:5,tip:"intrare",cantitate:5, utilizator:"Maria Ionescu",motiv:"Recepție",       dataOra:"2026-05-01T10:00:00" },
     { id:6,tip:"iesire", cantitate:2, utilizator:"Andrei Mihai", motiv:"SRM client",    dataOra:"2026-05-04T15:30:00" }],
};

// Date demo 3P
const RAFT_3P = [
  { id:101,raion:7, ref:11576733,denumire:"SET WC STATIV+ REZ. CERAMIC NEREA",  furnizor:"ADEO-ANHUI FOR SM",  top:1,gama:"A",capRaft:9, sd:424,apro:2 },
  { id:102,raion:7, ref:11592231,denumire:"SET WC STATIV+REZ. CERAMIC ESSENTIAL",furnizor:"CERSANIT R07",       top:1,gama:"A",capRaft:9, sd:724,apro:null },
  { id:103,raion:7, ref:11502071,denumire:"SET WC STATIV+REZ. CERAMIC VENTO",   furnizor:"CERSANIT R07",       top:1,gama:"A",capRaft:9, sd:103,apro:1 },
  { id:104,raion:7, ref:12002081,denumire:"VAS WC COMPACT 818 CRETA",           furnizor:"CERSANIT R07",       top:1,gama:"A",capRaft:9, sd:129,apro:1 },
  { id:105,raion:7, ref:12052474,denumire:"VAS WC CIL PP ALB",                  furnizor:"REGATA R07",         top:1,gama:"A",capRaft:24,sd:443,apro:null },
  { id:106,raion:12,ref:11836895,denumire:"VASWC CURTE ALB",                    furnizor:"REGATA R07",         top:1,gama:"A",capRaft:4, sd:331,apro:null },
  { id:107,raion:13,ref:10350200,denumire:"RIGIPS RBI GIPSCARTON 12.5X1200X2000",furnizor:"KNAUF R13",         top:1,gama:"A",capRaft:30,sd:80, apro:null },
  { id:108,raion:13,ref:10292310,denumire:"CERESIT CT126 GLET UMPLERE 20KG",    furnizor:"CERESIT R13",        top:1,gama:"A",capRaft:20,sd:150,apro:null },
  { id:109,raion:15,ref:11220000,denumire:"GRESIE PORTELANATA 60X60 ALB MAT",   furnizor:"CERSANIT R15",       top:1,gama:"A",capRaft:10,sd:200,apro:2 },
  { id:110,raion:15,ref:11220001,denumire:"FAIANTA 25X40 ALB LUCIOS",           furnizor:"CERSANIT R15",       top:1,gama:"A",capRaft:12,sd:350,apro:1 },
  { id:111,raion:16,ref:12000100,denumire:"PARCHET LAMINAT 8MM STEJAR",         furnizor:"TARKETT R16",        top:1,gama:"A",capRaft:20,sd:180,apro:1 },
  { id:112,raion:13,ref:10350263,denumire:"RIGIPS RBI GIPSCARTON 12.5X1200X2600",furnizor:"KNAUF R13",         top:2,gama:"B",capRaft:10,sd:45, apro:null },
  { id:113,raion:7, ref:11276391,denumire:"SET WC STATIV+ REZ. CERAMIC CARINA", furnizor:"CERSANIT R07",       top:1,gama:"B",capRaft:1, sd:32, apro:1 },
  { id:114,raion:16,ref:12000101,denumire:"PARCHET LAMINAT 12MM NATUR",         furnizor:"TARKETT R16",        top:1,gama:"A",capRaft:15,sd:90, apro:null },
];

// ─── STATE REDUCER ────────────────────────────────────────────────────────────
let _nextId = 9;
let _nextTxId = 10;

function reducer(state, action) {
  switch(action.type) {
    case "ADD_ITEM": {
      const item = { ...action.payload, id: _nextId++ };
      return { ...state, items: [...state.items, item], tx: { ...state.tx, [item.id]: [] } };
    }
    case "UPDATE_ITEM":
      return { ...state, items: state.items.map(i => i.id === action.payload.id ? { ...i, ...action.payload } : i) };
    case "DELETE_ITEM": {
      const { [action.id]: _, ...restTx } = state.tx;
      return { ...state, items: state.items.filter(i => i.id !== action.id), tx: restTx };
    }
    case "ADD_TX": {
      const { itemId, tip, cantitate, utilizator, motiv } = action.payload;
      const newQty = tip === "intrare"
        ? (state.items.find(i=>i.id===itemId)?.cantitate||0) + cantitate
        : (state.items.find(i=>i.id===itemId)?.cantitate||0) - cantitate;
      const newTx = { id: _nextTxId++, tip, cantitate, utilizator, motiv, dataOra: new Date().toISOString() };
      return {
        ...state,
        items: state.items.map(i => i.id === itemId ? { ...i, cantitate: newQty } : i),
        tx: { ...state.tx, [itemId]: [newTx, ...(state.tx[itemId]||[])] },
      };
    }
    default: return state;
  }
}

// ─── UI PRIMITIVES ────────────────────────────────────────────────────────────
const Card = ({ children, style={} }) => (
  <div style={{ background:T.card, borderRadius:T.radius, border:`1px solid ${T.border}`, boxShadow:T.shadow, ...style }}>
    {children}
  </div>
);

const Btn = ({ children, onClick, variant="primary", disabled=false, style={}, type="button", full=false }) => {
  const base = {
    display:"inline-flex", alignItems:"center", justifyContent:"center", gap:7,
    padding:"10px 18px", borderRadius:12, fontWeight:600, fontSize:14,
    cursor:disabled?"not-allowed":"pointer", border:"2px solid transparent",
    transition:"all 0.15s", opacity:disabled?0.55:1, width:full?"100%":"auto",
    fontFamily:"'Inter',sans-serif",
  };
  const v = {
    primary:     { background:T.primary,     color:T.primaryFg,    borderColor:T.primary },
    outline:     { background:"#fff",         color:T.foreground,   borderColor:T.border },
    destructive: { background:T.destructive,  color:"#fff",         borderColor:T.destructive },
    ghost:       { background:"transparent",  color:T.muted,        borderColor:"transparent" },
    success:     { background:T.primaryLight, color:T.primaryDark,  borderColor:T.primaryLight },
  };
  return (
    <button type={type} disabled={disabled} onClick={onClick}
      style={{ ...base, ...v[variant], ...style }}
      onMouseEnter={e => { if(!disabled && variant==="primary") e.currentTarget.style.background=T.primaryDark; }}
      onMouseLeave={e => { if(!disabled && variant==="primary") e.currentTarget.style.background=T.primary; }}>
      {children}
    </button>
  );
};

const Inp = ({ style={}, label, error, ...props }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
    {label && <div style={{ fontSize:13, fontWeight:600, color:T.foreground }}>{label}</div>}
    <input
      style={{ width:"100%", height:44, borderRadius:11, border:`2px solid ${error?T.destructive:T.border}`,
        padding:"0 14px", fontSize:14, background:"#fff", color:T.foreground, outline:"none",
        fontFamily:"'Inter',sans-serif", transition:"border-color 0.15s", ...style }}
      onFocus={e => e.target.style.borderColor = T.primary}
      onBlur={e => e.target.style.borderColor = error ? T.destructive : T.border}
      {...props}
    />
    {error && <div style={{ fontSize:12, color:T.destructive }}>{error}</div>}
  </div>
);

const Sel = ({ children, style={}, label, error, ...props }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
    {label && <div style={{ fontSize:13, fontWeight:600, color:T.foreground }}>{label}</div>}
    <select
      style={{ width:"100%", height:44, borderRadius:11, border:`2px solid ${error?T.destructive:T.border}`,
        padding:"0 14px", fontSize:14, background:"#fff", color:T.foreground, cursor:"pointer", outline:"none",
        fontFamily:"'Inter',sans-serif", transition:"border-color 0.15s", ...style }}
      onFocus={e => e.target.style.borderColor = T.primary}
      onBlur={e => e.target.style.borderColor = error ? T.destructive : T.border}
      {...props}
    >{children}</select>
    {error && <div style={{ fontSize:12, color:T.destructive }}>{error}</div>}
  </div>
);

const Textarea = ({ style={}, label, ...props }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
    {label && <div style={{ fontSize:13, fontWeight:600, color:T.foreground }}>{label}</div>}
    <textarea
      style={{ width:"100%", borderRadius:11, border:`2px solid ${T.border}`, padding:"10px 14px",
        fontSize:14, background:"#fff", resize:"none", minHeight:72, outline:"none",
        fontFamily:"'Inter',sans-serif", transition:"border-color 0.15s", ...style }}
      onFocus={e => e.target.style.borderColor = T.primary}
      onBlur={e => e.target.style.borderColor = T.border}
      {...props}
    />
  </div>
);

const Badge = ({ children, variant="default", style={} }) => {
  const v = {
    default:     { background:T.secondary,        color:T.muted },
    success:     { background:T.primaryLight,      color:T.primaryDark },
    destructive: { background:T.destructiveLight,  color:T.destructive },
    outline:     { background:"#fff",              color:T.muted, border:`1px solid ${T.border}` },
    gama_A:      { background:"#dcfce7", color:"#15803d" },
    gama_B:      { background:"#dbeafe", color:"#1d4ed8" },
    gama_S:      { background:"#fef9c3", color:"#854d0e" },
    top1:        { background:"#dcfce7", color:"#15803d" },
    top2:        { background:"#fef9c3", color:"#854d0e" },
  };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", padding:"3px 10px", borderRadius:20,
      fontSize:12, fontWeight:700, whiteSpace:"nowrap", ...(v[variant]||v.default), ...style }}>
      {children}
    </span>
  );
};

const Modal = ({ open, onClose, title, children, maxWidth=520 }) => {
  if (!open) return null;
  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
      <div className="fade-in" onClick={onClose}
        style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.45)", backdropFilter:"blur(4px)" }} />
      <div className="slide-up"
        style={{ position:"relative", width:"100%", maxWidth, background:T.card,
          borderRadius:"20px 20px 0 0", boxShadow:"0 -8px 40px rgba(0,0,0,0.18)",
          maxHeight:"92vh", display:"flex", flexDirection:"column" }}>
        <div style={{ width:40, height:4, borderRadius:2, background:T.border, margin:"12px auto 0" }} />
        <div style={{ padding:"14px 24px", borderBottom:`1px solid ${T.border}`,
          display:"flex", alignItems:"center", justifyContent:"space-between", background:T.secondary+"80", borderRadius:"16px 16px 0 0" }}>
          <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:18, fontWeight:800, color:T.foreground }}>{title}</div>
          <button onClick={onClose}
            style={{ width:34, height:34, borderRadius:"50%", border:"none", background:"#f1f5f9",
              cursor:"pointer", fontSize:20, color:T.muted, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>
        <div style={{ padding:24, overflowY:"auto", flex:1 }}>{children}</div>
      </div>
    </div>
  );
};

// Table primitives
const TH = ({ children, align="left" }) => (
  <th style={{ background:T.primary, color:"#fff", padding:"11px 16px", textAlign:align,
    fontWeight:700, fontSize:12, letterSpacing:.5, whiteSpace:"nowrap", fontFamily:"'Outfit',sans-serif" }}>
    {children}
  </th>
);
const TD = ({ children, align="left", style={} }) => (
  <td style={{ padding:"10px 16px", textAlign:align, borderBottom:`1px solid ${T.border}`,
    fontSize:13, color:T.foreground, whiteSpace:"nowrap", ...style }}>
    {children ?? "—"}
  </td>
);

const fmt = (n, d=0) => n == null ? "—" : Number(n).toLocaleString("ro-RO",{minimumFractionDigits:d,maximumFractionDigits:d});
const fmtDate = d => new Date(d).toLocaleDateString("ro-RO");
const fmtDateTime = d => new Date(d).toLocaleString("ro-RO",{day:"2-digit",month:"2-digit",year:"2-digit",hour:"2-digit",minute:"2-digit"});
const raionShort = r => r.split("-").slice(1).join("-") || r;

// ─── NAV ITEMS ────────────────────────────────────────────────────────────────
const NAV = [
  { id:"dashboard", label:"Dashboard",       icon:"⊞" },
  { id:"suprastoc", label:"Gestiune Suprastoc", icon:"📦" },
  { id:"3p",        label:"3P Stoc Dedicat", icon:"🏪" },
];

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ page, setPage }) {
  return (
    <aside style={{
      width:272, minHeight:"100vh", background:T.card, borderRight:`1px solid ${T.border}`,
      boxShadow:"2px 0 12px rgba(0,0,0,0.05)", display:"flex", flexDirection:"column", flexShrink:0,
    }}>
      {/* Logo */}
      <div style={{ height:72, display:"flex", alignItems:"center", padding:"0 24px",
        borderBottom:`1px solid ${T.border}60` }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ padding:8, background:T.primaryLight, borderRadius:12 }}>
            <span style={{ fontSize:20 }}>📦</span>
          </div>
          <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:20, fontWeight:800, color:T.foreground }}>
            LM <span style={{ color:T.primary }}>Supply</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:"20px 12px", display:"flex", flexDirection:"column", gap:6 }}>
        <div style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:"uppercase",
          letterSpacing:1, padding:"0 12px", marginBottom:8 }}>Meniu Principal</div>
        {NAV.map(n => {
          const active = page === n.id;
          return (
            <button key={n.id} onClick={() => setPage(n.id)}
              style={{
                display:"flex", alignItems:"center", gap:12, padding:"11px 16px", borderRadius:12,
                border:"none", cursor:"pointer", textAlign:"left", width:"100%",
                fontFamily:"'Inter',sans-serif", fontSize:14, fontWeight:active?700:500,
                background: active ? T.primary : "transparent",
                color: active ? T.primaryFg : T.muted,
                boxShadow: active ? `0 4px 12px ${T.primary}40` : "none",
                transition:"all 0.18s",
              }}
              onMouseEnter={e => { if(!active){ e.currentTarget.style.background=T.accent; e.currentTarget.style.color=T.primaryDark; }}}
              onMouseLeave={e => { if(!active){ e.currentTarget.style.background="transparent"; e.currentTarget.style.color=T.muted; }}}>
              <span style={{ fontSize:16 }}>{n.icon}</span>
              {n.label}
            </button>
          );
        })}
      </nav>

      {/* User card */}
      <div style={{ padding:16, borderTop:`1px solid ${T.border}60` }}>
        <div style={{ background:T.secondary, borderRadius:14, padding:"14px 16px",
          display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:40, height:40, borderRadius:"50%", background:T.primaryLight,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:13, color:T.primaryDark }}>LM</div>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:T.foreground }}>Leroy Merlin Iași</div>
            <div style={{ fontSize:11, color:T.muted }}>Supply Chain</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, alert=false, delay=0 }) {
  return (
    <Card style={{ padding:"22px 24px", flex:1, minWidth:160,
      animation:`fadeUp .35s ease ${delay*0.08}s both` }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontSize:12, color:T.muted, fontWeight:600, textTransform:"uppercase",
            letterSpacing:.8, marginBottom:8 }}>{label}</div>
          <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:30, fontWeight:800,
            color: alert ? T.destructive : T.foreground }}>{value}</div>
        </div>
        <div style={{ width:48, height:48, borderRadius:14, display:"flex", alignItems:"center",
          justifyContent:"center", fontSize:22,
          background: alert ? T.destructiveLight : T.primaryLight }}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

// ─── DASHBOARD PAGE ───────────────────────────────────────────────────────────
function DashboardPage({ items, raft3p }) {
  const totalItems = items.length;
  const totalQty   = items.reduce((s,i) => s+i.cantitate, 0);
  const lowStock   = items.filter(i => i.cantitate < 5).length;
  const raionCount = new Set(items.map(i=>i.raion)).size;
  const total3pSd  = raft3p.reduce((s,r) => s+(r.sd||0), 0);
  const cuApro     = raft3p.filter(r=>r.apro).length;

  const chartData = Object.entries(
    items.reduce((a,i) => { const k=raionShort(i.raion); a[k]=(a[k]||0)+i.cantitate; return a; }, {})
  ).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value).slice(0,8);

  const sdByRaion = [7,12,13,15,16].map(r => ({
    name: `R${r}`,
    sd: raft3p.filter(p=>p.raion===r).reduce((s,p)=>s+(p.sd||0),0),
  }));

  const gamaData = [
    { name:"Gamă A", value: raft3p.filter(r=>r.gama==="A").length },
    { name:"Gamă B", value: raft3p.filter(r=>r.gama==="B").length },
    { name:"Gamă S", value: raft3p.filter(r=>r.gama==="S").length },
  ];
  const COLORS = [T.primary, "#3b82f6", "#f59e0b"];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
      <div className="fade-up">
        <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:32, fontWeight:800, color:T.foreground }}>Dashboard</div>
        <div style={{ fontSize:14, color:T.muted, marginTop:4 }}>Privire de ansamblu — Suprastoc & 3P Stoc Dedicat</div>
      </div>

      {/* KPI row */}
      <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
        <StatCard label="Poziții Suprastoc" value={totalItems}   icon="📦" delay={0} />
        <StatCard label="Cantitate Totală"  value={fmt(totalQty)} icon="📊" delay={1} />
        <StatCard label="Stoc Scăzut (<5)" value={lowStock}      icon="⚠️" alert={lowStock>0} delay={2} />
        <StatCard label="Total SD (3P)"     value={fmt(total3pSd)} icon="🏪" delay={3} />
        <StatCard label="Cu Aprobare 3P"    value={cuApro}        icon="✅" delay={4} />
      </div>

      {/* Charts row */}
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:16 }}>
        <Card style={{ padding:20 }}>
          <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:16, fontWeight:700, color:T.foreground, marginBottom:16 }}>
            Cantitate Suprastoc pe Raioane
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{top:4,right:8,bottom:20,left:0}}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={T.border} />
              <XAxis dataKey="name" tick={{fontSize:11,fill:T.muted}} axisLine={false} tickLine={false} angle={-30} textAnchor="end" />
              <YAxis tick={{fontSize:11,fill:T.muted}} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{borderRadius:12,border:"none",boxShadow:T.shadowMd,fontSize:13}} cursor={{fill:T.accent}} />
              <Bar dataKey="value" name="Cantitate" radius={[6,6,0,0]}>
                {chartData.map((_,i)=><Cell key={i} fill={T.primary} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card style={{ padding:20 }}>
          <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:16, fontWeight:700, color:T.foreground, marginBottom:16 }}>
            Distribuție Gamă 3P
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={gamaData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                label={({name,percent})=>`${name}: ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                {gamaData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{borderRadius:12,border:"none",fontSize:13}} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* SD by raion */}
      <Card style={{ padding:20 }}>
        <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:16, fontWeight:700, color:T.foreground, marginBottom:16 }}>
          Stoc Dedicat (SD) pe Raioane 3P
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={sdByRaion} margin={{top:4,right:8,bottom:4,left:0}}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={T.border} />
            <XAxis dataKey="name" tick={{fontSize:12,fill:T.muted}} axisLine={false} tickLine={false} />
            <YAxis tick={{fontSize:11,fill:T.muted}} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{borderRadius:12,border:"none",boxShadow:T.shadowMd,fontSize:13}} cursor={{fill:T.accent}} />
            <Bar dataKey="sd" name="Total SD" radius={[6,6,0,0]} fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

// ─── ITEM FORM ────────────────────────────────────────────────────────────────
function ItemForm({ init, onClose, onSave }) {
  const [f, setF] = useState({
    denumire:   init?.denumire    || "",
    codSku:     init?.codSku      || "",
    cantitate:  init?.cantitate   || "",
    raion:      init?.raion       || "",
    locatie:    init?.locatie     || "",
    dataIntrare:init?.dataIntrare || new Date().toISOString().split("T")[0],
    observatii: init?.observatii  || "",
  });
  const [err, setErr] = useState({});

  const set = k => e => setF(p=>({...p,[k]:e.target.value}));

  const validate = () => {
    const e = {};
    if(f.denumire.length<3)           e.denumire   = "Minim 3 caractere";
    if(!f.codSku)                     e.codSku     = "Câmp obligatoriu";
    if(!f.cantitate||Number(f.cantitate)<1) e.cantitate = "Minim 1";
    if(!f.raion)                      e.raion      = "Selectați raionul";
    if(!f.locatie)                    e.locatie    = "Câmp obligatoriu";
    if(!f.dataIntrare)                e.dataIntrare= "Câmp obligatoriu";
    setErr(e); return !Object.keys(e).length;
  };

  const submit = () => { if(validate()) { onSave({...f,cantitate:Number(f.cantitate)}); onClose(); } };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <Inp label="Denumire Produs *" value={f.denumire} onChange={set("denumire")} error={err.denumire} placeholder="ex: Bormașină Bosch GBH 2-28..." />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <Inp label="Cod SKU *" value={f.codSku} onChange={set("codSku")} error={err.codSku} placeholder="ex: 12345678" />
        <Inp label="Cantitate *" type="number" min={1} value={f.cantitate} onChange={set("cantitate")} error={err.cantitate} placeholder="10" />
      </div>
      <Sel label="Raion *" value={f.raion} onChange={set("raion")} error={err.raion}>
        <option value="">Selectează raionul...</option>
        {RAIOANE.map(r=><option key={r} value={r}>{r}</option>)}
      </Sel>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <Inp label="Locație Suprastoc *" value={f.locatie} onChange={set("locatie")} error={err.locatie} placeholder="ex: R12-Top-A" />
        <Inp label="Data Intrare *" type="date" value={f.dataIntrare} onChange={set("dataIntrare")} error={err.dataIntrare} />
      </div>
      <Textarea label="Observații (opțional)" value={f.observatii} onChange={set("observatii")} placeholder="Detalii adiționale..." />
      <div style={{ display:"flex", gap:10, paddingTop:8, borderTop:`1px solid ${T.border}` }}>
        <Btn variant="outline" onClick={onClose} full>Anulează</Btn>
        <Btn onClick={submit} full>{init ? "Actualizează" : "Adaugă în Suprastoc"}</Btn>
      </div>
    </div>
  );
}

// ─── TRANSACTION FORM ─────────────────────────────────────────────────────────
function TxForm({ item, defaultTip="intrare", onClose, dispatch }) {
  const [tip, setTip]   = useState(defaultTip);
  const [cant, setCant] = useState("1");
  const [user, setUser] = useState("");
  const [motiv,setMotiv]= useState("");
  const [err, setErr]   = useState({});

  const submit = () => {
    const e = {};
    if(!cant||Number(cant)<1)   e.cant="Minim 1";
    if(tip==="iesire"&&Number(cant)>item.cantitate) e.cant=`Max ${item.cantitate}`;
    if(user.length<2)           e.user="Minim 2 caractere";
    setErr(e); if(Object.keys(e).length) return;
    dispatch({ type:"ADD_TX", payload:{ itemId:item.id, tip, cantitate:Number(cant), utilizator:user, motiv } });
    onClose();
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {/* Tip selector */}
      <div>
        <div style={{ fontSize:13, fontWeight:600, color:T.foreground, marginBottom:8 }}>Tip operațiune</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {[["intrare","⬇️","Intrare (+)","Adaugă pe suprastoc",T.primary,T.primaryLight],
            ["iesire", "⬆️","Ieșire (-)", "Coboară la raft",   T.destructive,T.destructiveLight]].map(([v,ico,lbl,sub,col,bg])=>(
            <button key={v} onClick={()=>setTip(v)}
              style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4,
                padding:"14px 10px", borderRadius:14, cursor:"pointer", transition:"all .15s",
                border:`2px solid ${tip===v?col:T.border}`,
                background: tip===v?`${col}15`:"#fff", color:tip===v?col:T.muted }}>
              <div style={{ width:40, height:40, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:18, background:tip===v?`${col}25`:T.secondary }}>{ico}</div>
              <span style={{ fontWeight:700, fontSize:14 }}>{lbl}</span>
              <span style={{ fontSize:11, opacity:.7 }}>{sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stoc info */}
      <div style={{ padding:"10px 14px", borderRadius:10, fontSize:13, fontWeight:500,
        background: tip==="iesire" ? T.destructiveLight : T.primaryLight,
        color: tip==="iesire" ? T.destructive : T.primaryDark,
        border:`1px solid ${tip==="iesire" ? T.destructive+"40" : T.primary+"40"}` }}>
        Stoc curent: <strong>{item.cantitate} bucăți</strong> pe suprastoc
      </div>

      <Inp label="Cantitate *" type="number" min={1} max={tip==="iesire"?item.cantitate:undefined}
        value={cant} onChange={e=>setCant(e.target.value)} error={err.cant}
        style={{ textAlign:"center", fontSize:20, fontWeight:800, height:56 }} />
      <Inp label="Numele tău *" value={user} onChange={e=>setUser(e.target.value)} error={err.user} placeholder="ex: Ion Popescu" />
      <Inp label="Motiv / Referință (opțional)" value={motiv} onChange={e=>setMotiv(e.target.value)} placeholder="ex: Refill raft, Comanda #..." />

      <div style={{ display:"flex", gap:10, paddingTop:8, borderTop:`1px solid ${T.border}` }}>
        <Btn variant="outline" onClick={onClose} full>Anulează</Btn>
        <Btn variant={tip==="iesire"?"destructive":"primary"} onClick={submit} full>
          Confirmă {tip==="intrare"?"intrarea":"ieșirea"}
        </Btn>
      </div>
    </div>
  );
}

// ─── SUPRASTOC LIST PAGE ──────────────────────────────────────────────────────
function SuprastocPage({ items, tx, dispatch }) {
  const [search, setSearch]       = useState("");
  const [raionF, setRaionF]       = useState("");
  const [addOpen, setAddOpen]     = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [txOpen, setTxOpen]       = useState(false);
  const [txTip, setTxTip]         = useState("intrare");

  const filtered = useMemo(() => items.filter(i => {
    if(raionF && i.raion !== raionF) return false;
    const q = search.toLowerCase();
    return !q || i.denumire.toLowerCase().includes(q) || i.codSku.includes(q);
  }), [items, raionF, search]);

  const openTx = (item, tip) => { setDetailItem(item); setTxTip(tip); setTxOpen(true); };

  const handleDelete = (id) => {
    if(window.confirm("Sigur dorești să ștergi acest produs?")) dispatch({ type:"DELETE_ITEM", id });
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div className="fade-up" style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
        <div>
          <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:28, fontWeight:800, color:T.foreground }}>Gestiune Suprastoc</div>
          <div style={{ fontSize:14, color:T.muted, marginTop:4 }}>Administrează produsele aflate deasupra rafturilor.</div>
        </div>
        <Btn onClick={()=>setAddOpen(true)}>
          <span style={{fontSize:16}}>＋</span> Adaugă Produs
        </Btn>
      </div>

      {/* Filters */}
      <Card style={{ padding:16, display:"flex", gap:12, flexWrap:"wrap", alignItems:"center" }}>
        <div style={{ position:"relative", flex:1, minWidth:200 }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:T.muted, fontSize:16 }}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Caută după denumire sau SKU..."
            style={{ width:"100%", height:44, borderRadius:11, border:`2px solid ${T.border}`, padding:"0 14px 0 38px",
              fontSize:14, background:"#fff", outline:"none", fontFamily:"'Inter',sans-serif" }}
            onFocus={e=>e.target.style.borderColor=T.primary} onBlur={e=>e.target.style.borderColor=T.border} />
        </div>
        <Sel value={raionF} onChange={e=>setRaionF(e.target.value)} style={{ width:220 }}>
          <option value="">Toate Raioanele</option>
          {RAIOANE.map(r=><option key={r} value={r}>{r}</option>)}
        </Sel>
        <div style={{ fontSize:13, color:T.muted }}>{filtered.length} produse</div>
      </Card>

      {/* Table */}
      {filtered.length === 0 ? (
        <Card style={{ padding:"60px 24px", textAlign:"center" }}>
          <div style={{ fontSize:48, marginBottom:12 }}>📦</div>
          <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:18, fontWeight:700, color:T.foreground }}>Niciun produs găsit</div>
          <div style={{ fontSize:14, color:T.muted, marginTop:6 }}>Modifică filtrele sau adaugă un produs nou.</div>
          <div style={{ marginTop:16 }}><Btn onClick={()=>setAddOpen(true)}>Adaugă primul produs</Btn></div>
        </Card>
      ) : (
        <Card style={{ overflow:"hidden" }}>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr>
                  <TH>SKU / Produs</TH>
                  <TH>Raion</TH>
                  <TH>Locație</TH>
                  <TH align="center">Cantitate</TH>
                  <TH>Data Intrare</TH>
                  <TH align="center">Acțiuni</TH>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item.id}>
                    <TD>
                      <div style={{ fontWeight:600 }}>{item.denumire}</div>
                      <div style={{ fontSize:11, color:T.muted, fontFamily:"monospace" }}>{item.codSku}</div>
                    </TD>
                    <TD><Badge variant="outline">{raionShort(item.raion)}</Badge></TD>
                    <TD style={{ fontWeight:500 }}>{item.locatie}</TD>
                    <TD align="center">
                      <Badge variant={item.cantitate<5?"destructive":"success"}>{item.cantitate} buc</Badge>
                    </TD>
                    <TD style={{ color:T.muted }}>{fmtDate(item.dataIntrare)}</TD>
                    <TD align="center">
                      <div style={{ display:"flex", gap:6, justifyContent:"center", alignItems:"center" }}>
                        <button onClick={()=>openTx(item,"intrare")} title="Intrare"
                          style={{ padding:"5px 9px", borderRadius:8, border:"none", background:T.primaryLight,
                            color:T.primaryDark, cursor:"pointer", fontSize:14, fontWeight:700 }}>+</button>
                        <button onClick={()=>openTx(item,"iesire")} title="Ieșire"
                          style={{ padding:"5px 9px", borderRadius:8, border:"none", background:T.destructiveLight,
                            color:T.destructive, cursor:"pointer", fontSize:14, fontWeight:700 }}>−</button>
                        <button onClick={()=>{ setDetailItem(item); setTxOpen(false); setDetailItem(item); }} title="Detalii"
                          style={{ padding:"5px 9px", borderRadius:8, border:"none", background:T.secondary,
                            color:T.muted, cursor:"pointer", fontSize:13 }}
                          onClick={()=>setDetailItem(item)}>👁</button>
                        <button onClick={()=>setEditItem(item)} title="Editare"
                          style={{ padding:"5px 9px", borderRadius:8, border:"none", background:T.secondary,
                            color:T.muted, cursor:"pointer", fontSize:13 }}>✏️</button>
                        <button onClick={()=>handleDelete(item.id)} title="Șterge"
                          style={{ padding:"5px 9px", borderRadius:8, border:"none", background:T.destructiveLight,
                            color:T.destructive, cursor:"pointer", fontSize:13 }}>🗑</button>
                      </div>
                    </TD>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modals */}
      <Modal open={addOpen} onClose={()=>setAddOpen(false)} title="Adaugă în Suprastoc">
        <ItemForm onClose={()=>setAddOpen(false)} onSave={p=>dispatch({type:"ADD_ITEM",payload:p})} />
      </Modal>
      <Modal open={!!editItem} onClose={()=>setEditItem(null)} title="Editare Produs">
        {editItem && <ItemForm init={editItem} onClose={()=>setEditItem(null)} onSave={p=>dispatch({type:"UPDATE_ITEM",payload:{...p,id:editItem.id}})} />}
      </Modal>

      {/* Detail modal */}
      <Modal open={!!detailItem && !txOpen} onClose={()=>setDetailItem(null)} title={detailItem?.denumire||""} maxWidth={700}>
        {detailItem && <DetailView item={detailItem} tx={tx[detailItem.id]||[]}
          onTx={(tip)=>{ setTxTip(tip); setTxOpen(true); }} />}
      </Modal>

      {/* Tx modal */}
      <Modal open={txOpen && !!detailItem} onClose={()=>{ setTxOpen(false); setDetailItem(null); }} title="Înregistrare Tranzacție">
        {detailItem && <TxForm item={detailItem} defaultTip={txTip}
          onClose={()=>{ setTxOpen(false); setDetailItem(null); }} dispatch={dispatch} />}
      </Modal>
    </div>
  );
}

function DetailView({ item, tx, onTx }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1.6fr", gap:20 }}>
      {/* Left */}
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <div style={{ background:`linear-gradient(135deg,${T.primaryLight},${T.accent})`,
          borderRadius:14, padding:20, textAlign:"center", border:`1px solid ${T.primary}30` }}>
          <div style={{ fontSize:12, fontWeight:700, color:T.primary, textTransform:"uppercase", letterSpacing:.8, marginBottom:8 }}>Stoc Curent</div>
          <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:52, fontWeight:800, color:T.foreground }}>{item.cantitate}</div>
          <div style={{ fontSize:13, color:T.muted, marginTop:4 }}>bucăți pe suprastoc</div>
          <div style={{ display:"flex", gap:8, marginTop:16 }}>
            <Btn onClick={()=>onTx("intrare")} full style={{ fontSize:13 }}>⬇️ Intrare</Btn>
            <Btn onClick={()=>onTx("iesire")} variant="destructive" full style={{ fontSize:13 }}>⬆️ Ieșire</Btn>
          </div>
        </div>
        <Card style={{ padding:16 }}>
          <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:14, fontWeight:700, marginBottom:12, color:T.foreground }}>📍 Detalii</div>
          {[["Raion", item.raion], ["Locație", item.locatie], ["Data Intrare", fmtDate(item.dataIntrare)], ["SKU", item.codSku]].map(([k,v])=>(
            <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:`1px solid ${T.border}`, fontSize:13 }}>
              <span style={{ color:T.muted }}>{k}</span>
              <span style={{ fontWeight:600, color:T.foreground }}>{v}</span>
            </div>
          ))}
          {item.observatii && <div style={{ marginTop:10, fontSize:12, color:T.muted, fontStyle:"italic" }}>{item.observatii}</div>}
        </Card>
      </div>

      {/* Right - history */}
      <Card style={{ overflow:"hidden" }}>
        <div style={{ padding:"14px 16px", borderBottom:`1px solid ${T.border}`, background:T.secondary+"80",
          fontFamily:"'Outfit',sans-serif", fontSize:15, fontWeight:700, color:T.foreground }}>
          🕐 Istoric Tranzacții
        </div>
        {tx.length === 0 ? (
          <div style={{ padding:40, textAlign:"center", color:T.muted, fontSize:14 }}>
            Nicio tranzacție înregistrată.
          </div>
        ) : (
          <div style={{ maxHeight:320, overflowY:"auto" }}>
            {tx.map(t => (
              <div key={t.id} style={{ padding:"12px 16px", display:"flex", alignItems:"center", gap:12,
                borderBottom:`1px solid ${T.border}` }}>
                <div style={{ width:36, height:36, borderRadius:"50%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center",
                  background: t.tip==="intrare" ? T.primaryLight : T.destructiveLight,
                  color: t.tip==="intrare" ? T.primaryDark : T.destructive, fontWeight:800, fontSize:16 }}>
                  {t.tip==="intrare"?"⬇":"⬆"}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:T.foreground }}>
                    {t.tip==="intrare"?"Intrare":"Ieșire"}
                    <span style={{ marginLeft:8, color: t.tip==="intrare"?T.primary:T.destructive, fontWeight:800 }}>
                      {t.tip==="intrare"?"+":"-"}{t.cantitate}
                    </span>
                  </div>
                  <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>
                    {fmtDateTime(t.dataOra)} · {t.utilizator}
                  </div>
                </div>
                {t.motiv && (
                  <div style={{ fontSize:11, background:T.secondary, padding:"3px 8px", borderRadius:6,
                    color:T.muted, flexShrink:0, maxWidth:120, overflow:"hidden", textOverflow:"ellipsis" }}>
                    {t.motiv}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── 3P PAGE ──────────────────────────────────────────────────────────────────
function ThreePPage({ raft3p }) {
  const [search, setSearch]   = useState("");
  const [raionF, setRaionF]   = useState("all");
  const [gamaF, setGamaF]     = useState("all");
  const [topF, setTopF]       = useState("all");
  const [subTab, setSubTab]   = useState("produse");

  const raioni3p = [...new Set(raft3p.map(r=>r.raion))].sort();

  const filtered = useMemo(() => raft3p.filter(r => {
    if(raionF !== "all" && r.raion !== Number(raionF)) return false;
    if(gamaF  !== "all" && r.gama  !== gamaF)  return false;
    if(topF   !== "all" && String(r.top) !== topF) return false;
    const q = search.toLowerCase();
    return !q || r.denumire.toLowerCase().includes(q) || String(r.ref).includes(q) || r.furnizor.toLowerCase().includes(q);
  }), [raft3p, raionF, gamaF, topF, search]);

  const raionStats = raioni3p.map(r => ({
    raion: r,
    total: raft3p.filter(p=>p.raion===r).length,
    totalSd: raft3p.filter(p=>p.raion===r).reduce((s,p)=>s+(p.sd||0),0),
    cuApro: raft3p.filter(p=>p.raion===r&&p.apro).length,
    avgSd: raft3p.filter(p=>p.raion===r).reduce((s,p)=>s+(p.sd||0),0) / (raft3p.filter(p=>p.raion===r).length||1),
  }));

  const subTabs = [
    { id:"produse",  label:"Lista Produse" },
    { id:"raioane",  label:"Analiză Raioane" },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div className="fade-up">
        <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:28, fontWeight:800, color:T.foreground }}>3P Stoc Dedicat</div>
        <div style={{ fontSize:14, color:T.muted, marginTop:4 }}>Prezentă raft, stoc dedicat și aprobare cereri 3P.</div>
      </div>

      {/* Sub-tabs */}
      <div style={{ display:"flex", gap:2, background:T.secondary, padding:4, borderRadius:12, width:"fit-content" }}>
        {subTabs.map(t => (
          <button key={t.id} onClick={()=>setSubTab(t.id)}
            style={{ padding:"8px 20px", borderRadius:9, border:"none", cursor:"pointer",
              fontFamily:"'Inter',sans-serif", fontSize:13, fontWeight:600, transition:"all .15s",
              background: subTab===t.id ? T.card : "transparent",
              color: subTab===t.id ? T.foreground : T.muted,
              boxShadow: subTab===t.id ? T.shadow : "none" }}>
            {t.label}
          </button>
        ))}
      </div>

      {subTab === "produse" && (
        <>
          {/* Filters */}
          <Card style={{ padding:16, display:"flex", gap:12, flexWrap:"wrap", alignItems:"center" }}>
            <div style={{ position:"relative", flex:1, minWidth:200 }}>
              <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:T.muted, fontSize:16 }}>🔍</span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Caută denumire / ref / furnizor..."
                style={{ width:"100%", height:44, borderRadius:11, border:`2px solid ${T.border}`, padding:"0 14px 0 38px",
                  fontSize:14, background:"#fff", outline:"none", fontFamily:"'Inter',sans-serif" }}
                onFocus={e=>e.target.style.borderColor=T.primary} onBlur={e=>e.target.style.borderColor=T.border} />
            </div>
            <Sel value={raionF} onChange={e=>setRaionF(e.target.value)} style={{ width:120 }}>
              <option value="all">Toate R.</option>
              {raioni3p.map(r=><option key={r} value={r}>Raion {r}</option>)}
            </Sel>
            <Sel value={gamaF} onChange={e=>setGamaF(e.target.value)} style={{ width:120 }}>
              <option value="all">Toate Gamele</option>
              {["A","B","S"].map(g=><option key={g} value={g}>Gamă {g}</option>)}
            </Sel>
            <Sel value={topF} onChange={e=>setTopF(e.target.value)} style={{ width:110 }}>
              <option value="all">Toate Top</option>
              {["0","1","2"].map(t=><option key={t} value={t}>Top {t}</option>)}
            </Sel>
            <div style={{ fontSize:13, color:T.muted }}>{filtered.length} / {raft3p.length}</div>
          </Card>

          <Card style={{ overflow:"hidden" }}>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr>
                    <TH>Raion</TH>
                    <TH>Ref</TH>
                    <TH>Denumire</TH>
                    <TH>Furnizor</TH>
                    <TH align="center">Top</TH>
                    <TH align="center">Gamă</TH>
                    <TH align="right">Cap. Raft</TH>
                    <TH align="right">SD</TH>
                    <TH align="center">Aprobare</TH>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r,i) => (
                    <tr key={r.id} style={{ background: i%2===0?"#fff":T.bg }}>
                      <TD><span style={{ fontWeight:700, color:T.primary }}>R{r.raion}</span></TD>
                      <TD style={{ fontFamily:"monospace", fontSize:12 }}>{r.ref}</TD>
                      <TD><span style={{ fontWeight:500 }}>{r.denumire}</span></TD>
                      <TD style={{ color:T.muted, fontSize:12 }}>{r.furnizor}</TD>
                      <TD align="center"><Badge variant={r.top===1?"top1":r.top===2?"top2":"default"}>{r.top}</Badge></TD>
                      <TD align="center"><Badge variant={`gama_${r.gama}`}>{r.gama}</Badge></TD>
                      <TD align="right" style={{ fontWeight:500 }}>{fmt(r.capRaft)}</TD>
                      <TD align="right">
                        <span style={{ fontWeight:700, color: r.sd>200?T.primary:T.foreground }}>{fmt(r.sd)}</span>
                      </TD>
                      <TD align="center">
                        {r.apro
                          ? <span style={{ color:T.primary, fontWeight:700 }}>✓ {r.apro}</span>
                          : <span style={{ color:T.border }}>—</span>}
                      </TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {subTab === "raioane" && (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {/* Chart */}
          <Card style={{ padding:20 }}>
            <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:16, fontWeight:700, color:T.foreground, marginBottom:16 }}>
              Stoc Dedicat Total pe Raion
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={raionStats.map(r=>({name:`R${r.raion}`,sd:r.totalSd}))} margin={{top:4,right:8,bottom:4,left:0}}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={T.border} />
                <XAxis dataKey="name" tick={{fontSize:12,fill:T.muted}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize:11,fill:T.muted}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{borderRadius:12,border:"none",boxShadow:T.shadowMd,fontSize:13}} cursor={{fill:T.accent}} />
                <Bar dataKey="sd" name="Total SD" radius={[6,6,0,0]}>
                  {raionStats.map((_,i)=><Cell key={i} fill={T.primary} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Table */}
          <Card style={{ overflow:"hidden" }}>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr>
                    <TH>Raion</TH>
                    <TH align="right">Nr. Produse</TH>
                    <TH align="right">Total SD</TH>
                    <TH align="right">SD Mediu</TH>
                    <TH align="right">Cu Aprobare</TH>
                  </tr>
                </thead>
                <tbody>
                  {raionStats.map((r,i) => (
                    <tr key={r.raion} style={{ background: i%2===0?"#fff":T.bg }}>
                      <TD><span style={{ fontWeight:700, color:T.primary }}>Raion {r.raion}</span></TD>
                      <TD align="right">{fmt(r.total)}</TD>
                      <TD align="right"><span style={{ fontWeight:700 }}>{fmt(r.totalSd)}</span></TD>
                      <TD align="right">{fmt(r.avgSd,1)}</TD>
                      <TD align="right">
                        {r.cuApro > 0
                          ? <Badge variant="success">{r.cuApro} aprobate</Badge>
                          : <span style={{ color:T.muted }}>—</span>}
                      </TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [state, dispatch] = useReducer(reducer, { items: INIT_ITEMS, tx: INIT_TX });

  return (
    <>
      <FontLoader />
      <div style={{ display:"flex", minHeight:"100vh", background:T.bg, color:T.foreground }}>
        <Sidebar page={page} setPage={setPage} />
        <main style={{ flex:1, padding:"32px 36px", overflowY:"auto", minHeight:"100vh" }}>
          <div style={{ maxWidth:1100, margin:"0 auto" }}>
            {page === "dashboard" && <DashboardPage items={state.items} raft3p={RAFT_3P} />}
            {page === "suprastoc" && <SuprastocPage items={state.items} tx={state.tx} dispatch={dispatch} />}
            {page === "3p"        && <ThreePPage raft3p={RAFT_3P} />}
          </div>
        </main>
      </div>
    </>
  );
}
