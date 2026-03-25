import { useState } from "react";

const CATEGORIES = [
  { id: "site",     icon: "🔧", label: "Site Work",  color: "#3B82F6", bg:"#EFF6FF" },
  { id: "task",     icon: "✅", label: "Task",        color: "#10B981", bg:"#ECFDF5" },
  { id: "meeting",  icon: "📅", label: "Meeting",     color: "#8B5CF6", bg:"#F5F3FF" },
  { id: "followup", icon: "👤", label: "Follow-up",   color: "#F59E0B", bg:"#FFFBEB" },
  { id: "general",  icon: "📌", label: "General",     color: "#94A3B8", bg:"#F8FAFC" },
];

const NOTES = [
  { id:1, title:"Features for Rian",                     cat:"general",  loc:null,             date:"Wed 18. Mar", priority:"high"   },
  { id:2, title:"Ask Cormac where is the document",      cat:"followup", loc:null,             date:"Mon 23. Mar", priority:"medium" },
  { id:3, title:"Training at 10 in Terenure",            cat:"meeting",  loc:"Terenure (TRE)", date:"Wed 25. Mar", priority:"high"   },
  { id:4, title:"Get VCM card next week from depot",     cat:"task",     loc:null,             date:"Mon 16. Mar", priority:"medium" },
  { id:5, title:"Remove rectifiers one by one",          cat:"site",     loc:"Mucklagh (MUK)", date:"Thu 19. Mar", priority:"high"   },
  { id:6, title:"Make tickets for Monday tasks",         cat:"task",     loc:null,             date:"Mon 23. Mar", priority:"high"   },
  { id:7, title:"The battery needs to be replaced",      cat:"site",     loc:"Mucklagh (MUK)", date:"Thu 19. Mar", priority:"high"   },
  { id:8, title:"Alarm not extended on Vertiv",          cat:"site",     loc:"Kildare (KLE)",  date:"Thu 19. Mar", priority:"high"   },
];

const PRIORITY_COLOR = { high:"#EF4444", medium:"#F59E0B", low:"#22C55E" };
const getCat = id => CATEGORIES.find(c => c.id === id);

// Group notes by category
function groupByCategory(notes) {
  const groups = {};
  CATEGORIES.forEach(c => { groups[c.id] = []; });
  notes.forEach(n => { if (groups[n.cat]) groups[n.cat].push(n); });
  return groups;
}

export default function App() {
  const [view, setView] = useState("grouped"); // "grouped" | "list"
  const [newNote, setNewNote] = useState(false);
  const [aiStage, setAiStage] = useState(0); // 0=idle 1=typing 2=classified
  const [desc, setDesc] = useState("");
  const [aiCat, setAiCat] = useState(null);

  const groups = groupByCategory(NOTES);

  function handleDescChange(v) {
    setDesc(v);
    setAiStage(0); setAiCat(null);
    if (v.length > 12) {
      setAiStage(1);
      clearTimeout(window._aiTimer);
      window._aiTimer = setTimeout(() => {
        // Fake classification based on keywords
        let cat = "general";
        const l = v.toLowerCase();
        if (/train|meeting|call|visit|10|presentation/.test(l)) cat = "meeting";
        else if (/ask|cormac|waiting|follow|send|confirm/.test(l)) cat = "followup";
        else if (/buy|get|order|make|ticket|collect|pick|book/.test(l)) cat = "task";
        else if (/fault|alarm|battery|rectif|cable|replace|repair|check site|site/.test(l)) cat = "site";
        setAiCat(cat); setAiStage(2);
      }, 900);
    }
  }

  return (
    <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,Arial,sans-serif",background:"#EEF2F7",minHeight:"100vh",maxWidth:420,margin:"0 auto",paddingBottom:80}}>

      {/* Header */}
      <div style={{background:"#4A6580",padding:"18px 16px 12px",color:"#fff"}}>
        <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.13em",textTransform:"uppercase",opacity:.7,marginBottom:4}}>Notes</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontSize:22,fontWeight:800}}>My Notes</div>
          {/* View toggle */}
          <div style={{display:"flex",background:"rgba(255,255,255,0.15)",borderRadius:10,padding:3,gap:2}}>
            {["grouped","list"].map(v=>(
              <button key={v} onClick={()=>setView(v)}
                style={{padding:"4px 10px",borderRadius:7,border:"none",fontSize:12,fontWeight:700,cursor:"pointer",
                  background: view===v ? "#fff" : "transparent",
                  color:      view===v ? "#4A6580" : "rgba(255,255,255,0.8)"}}>
                {v==="grouped" ? "⊞ Groups" : "☰ List"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{padding:"14px 12px 0"}}>

        {view === "grouped" ? (
          /* GROUPED VIEW */
          CATEGORIES.map(cat => {
            const items = groups[cat.id];
            if (!items.length) return null;
            return (
              <div key={cat.id} style={{marginBottom:18}}>
                {/* Category header */}
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <div style={{width:28,height:28,borderRadius:8,background:cat.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>
                    {cat.icon}
                  </div>
                  <span style={{fontSize:13,fontWeight:700,color:cat.color}}>{cat.label}</span>
                  <span style={{fontSize:12,color:"#94A3B8",marginLeft:2}}>({items.length})</span>
                </div>
                {/* Cards */}
                {items.map(n => (
                  <div key={n.id} style={{background:"#fff",borderRadius:13,padding:"11px 13px",marginBottom:7,
                    boxShadow:"0 1px 3px rgba(0,0,0,0.06)",display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:PRIORITY_COLOR[n.priority],flexShrink:0}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:600,fontSize:14,color:"#1e293b",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{n.title}</div>
                      <div style={{fontSize:12,color:"#94A3B8",marginTop:2,display:"flex",gap:8}}>
                        {n.loc && <span>📍 {n.loc}</span>}
                        <span>🗓 {n.date}</span>
                      </div>
                    </div>
                    <span style={{color:"#CBD5E1",fontSize:18}}>›</span>
                  </div>
                ))}
              </div>
            );
          })
        ) : (
          /* LIST VIEW — same as before but with icon badge */
          NOTES.map(n => {
            const cat = getCat(n.cat);
            return (
              <div key={n.id} style={{background:"#fff",borderRadius:14,padding:"12px 14px",marginBottom:9,
                boxShadow:"0 1px 3px rgba(0,0,0,0.07)",display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:10,height:10,borderRadius:"50%",background:PRIORITY_COLOR[n.priority],flexShrink:0}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:15,color:"#1e293b",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{n.title}</div>
                  <div style={{fontSize:12,color:"#94A3B8",marginTop:3,display:"flex",gap:8,flexWrap:"wrap"}}>
                    {n.loc && <span>📍 {n.loc}</span>}
                    <span>🗓 {n.date}</span>
                  </div>
                </div>
                {/* Category badge */}
                <div style={{padding:"4px 9px",borderRadius:10,background:cat.bg,fontSize:12,fontWeight:600,color:cat.color,flexShrink:0}}>
                  {cat.icon} {cat.label}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* FAB */}
      <button onClick={()=>{setNewNote(true);setDesc("");setAiStage(0);setAiCat(null);}}
        style={{position:"fixed",bottom:24,right:24,width:54,height:54,borderRadius:27,background:"#4A6580",
          border:"none",color:"#fff",fontSize:26,cursor:"pointer",boxShadow:"0 4px 16px rgba(74,101,128,0.4)",
          display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>

      {/* New note sheet */}
      {newNote && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:100,display:"flex",alignItems:"flex-end"}}
          onClick={()=>setNewNote(false)}>
          <div style={{background:"#fff",borderRadius:"22px 22px 0 0",padding:"22px 18px 36px",width:"100%",maxWidth:420,margin:"0 auto"}}
            onClick={e=>e.stopPropagation()}>
            <div style={{fontWeight:800,fontSize:18,color:"#1e293b",marginBottom:14}}>New Note</div>

            {/* Description input */}
            <textarea value={desc} onChange={e=>handleDescChange(e.target.value)}
              placeholder="Describe your note…"
              style={{width:"100%",borderRadius:12,border:"1.5px solid #E2E8F0",padding:"11px 13px",fontSize:14,
                fontFamily:"inherit",resize:"none",rows:2,outline:"none",boxSizing:"border-box",color:"#1e293b"}}
              rows={2}/>

            {/* AI classification indicator */}
            <div style={{margin:"10px 0 12px",minHeight:28,display:"flex",alignItems:"center",gap:8}}>
              {aiStage===1 && (
                <span style={{fontSize:12,color:"#94A3B8",fontStyle:"italic"}}>✦ Gemini is classifying…</span>
              )}
              {aiStage===2 && aiCat && (() => {
                const c = getCat(aiCat);
                return (
                  <span style={{fontSize:12,color:"#64748b"}}>
                    ✦ AI suggested: <strong style={{color:c.color}}>{c.icon} {c.label}</strong>
                    <span style={{color:"#94A3B8"}}> · tap to override</span>
                  </span>
                );
              })()}
            </div>

            {/* Category chips */}
            <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:18}}>
              {CATEGORIES.map(c => {
                const selected = aiCat === c.id;
                return (
                  <button key={c.id} onClick={()=>setAiCat(c.id)}
                    style={{padding:"7px 13px",borderRadius:20,border:"1.5px solid",fontSize:13,fontWeight:600,cursor:"pointer",transition:"all .15s",
                      borderColor: selected ? c.color : "#E2E8F0",
                      background:  selected ? c.color : "#fff",
                      color:       selected ? "#fff"  : "#64748b"}}>
                    {c.icon} {c.label}
                  </button>
                );
              })}
            </div>

            <button onClick={()=>setNewNote(false)}
              style={{width:"100%",padding:14,borderRadius:14,border:"none",background:"#4A6580",color:"#fff",fontSize:16,fontWeight:700,cursor:"pointer"}}>
              Save Note
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
