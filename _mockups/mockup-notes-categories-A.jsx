import { useState } from "react";

const CATEGORIES = [
  { id: "all",      label: "All",        color: null },
  { id: "site",     label: "🔧 Site Work", color: "#3B82F6" },
  { id: "task",     label: "✅ Task",      color: "#10B981" },
  { id: "meeting",  label: "📅 Meeting",   color: "#8B5CF6" },
  { id: "followup", label: "👤 Follow-up", color: "#F59E0B" },
  { id: "general",  label: "📌 General",   color: "#94A3B8" },
];

const NOTES = [
  { id:1, title:"Features for Rian",                    cat:"general",  loc:null,             date:"Wed 18. Mar '26", done:false, priority:"high"   },
  { id:2, title:"Ask Cormac where is the document",     cat:"followup", loc:null,             date:"Mon 23. Mar '26", done:false, priority:"medium" },
  { id:3, title:"Training at 10 in Terenure",           cat:"meeting",  loc:"Terenure (TRE)", date:"Wed 25. Mar '26", done:false, priority:"high"   },
  { id:4, title:"Get VCM card next week (23.3) from…",  cat:"task",     loc:null,             date:"Mon 16. Mar '26", done:false, priority:"medium" },
  { id:5, title:"Remove rectifiers one by one. Extend…",cat:"site",     loc:"Mucklagh (MUK)", date:"Thu 19. Mar '26", done:false, priority:"high"   },
  { id:6, title:"Make tickets for Monday tasks",        cat:"task",     loc:null,             date:"Mon 23. Mar '26", done:false, priority:"high"   },
  { id:7, title:"The battery needs to be replaced",     cat:"site",     loc:"Mucklagh (MUK)", date:"Thu 19. Mar '26", done:false, priority:"high"   },
  { id:8, title:"Alarm not extended on Vertiv",         cat:"site",     loc:"Kildare (KLE)",  date:"Thu 19. Mar '26", done:false, priority:"high"   },
  { id:9, title:"Buy Working Gloves",                   cat:"task",     loc:null,             date:"Thu 19. Mar '26", done:false, priority:"high"   },
  { id:10,title:"Order voltmeter",                      cat:"task",     loc:null,             date:"Thu 12. Mar '26", done:true,  priority:"high"   },
];

const PRIORITY_COLOR = { high:"#EF4444", medium:"#F59E0B", low:"#22C55E" };

function getCat(id) { return CATEGORIES.find(c => c.id === id); }

export default function App() {
  const [active, setActive] = useState("all");
  const [showEditor, setShowEditor] = useState(false);
  const [editorCat, setEditorCat] = useState("site");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDone, setAiDone] = useState(false);

  const visible = NOTES.filter(n => !n.done && (active === "all" || n.cat === active));
  const done    = NOTES.filter(n =>  n.done && (active === "all" || n.cat === active));

  function simulateAI() {
    setAiLoading(true); setAiDone(false);
    setTimeout(() => { setAiLoading(false); setAiDone(true); }, 1400);
  }

  return (
    <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,Arial,sans-serif",background:"#EEF2F7",minHeight:"100vh",maxWidth:420,margin:"0 auto",paddingBottom:40}}>

      {/* Header */}
      <div style={{background:"#4A6580",padding:"18px 16px 14px",color:"#fff"}}>
        <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.13em",textTransform:"uppercase",opacity:.7,marginBottom:4}}>Notes</div>
        <div style={{fontSize:22,fontWeight:800}}>My Notes</div>
      </div>

      {/* Filter bar */}
      <div style={{background:"#fff",borderBottom:"1px solid #E8EFF5",padding:"10px 12px",overflowX:"auto",display:"flex",gap:6,whiteSpace:"nowrap"}}>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setActive(c.id)}
            style={{padding:"6px 13px",borderRadius:20,border:"1.5px solid",fontSize:13,fontWeight:600,cursor:"pointer",flexShrink:0,transition:"all .15s",
              borderColor: active===c.id ? (c.color||"#4A6580") : "#E2E8F0",
              background:  active===c.id ? (c.color||"#4A6580") : "#fff",
              color:       active===c.id ? "#fff" : "#64748b"}}>
            {c.label}
          </button>
        ))}
      </div>

      <div style={{padding:"12px 12px 0"}}>

        {/* Notes list */}
        {visible.map(n => {
          const cat = getCat(n.cat);
          return (
            <div key={n.id} onClick={() => { setShowEditor(true); setEditorCat(n.cat); setAiDone(false); }}
              style={{background:"#fff",borderRadius:14,padding:"13px 14px",marginBottom:9,boxShadow:"0 1px 3px rgba(0,0,0,0.07)",cursor:"pointer",
                borderLeft:`3.5px solid ${cat.color||"#94A3B8"}`,display:"flex",alignItems:"flex-start",gap:10}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700,fontSize:15,color:"#1e293b",marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{n.title}</div>
                <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                  {n.loc && <span style={{fontSize:12,color:"#64748b"}}>📍 {n.loc}</span>}
                  <span style={{fontSize:12,color:"#94A3B8"}}>🗓 {n.date}</span>
                </div>
                {/* Category chip */}
                <div style={{marginTop:6}}>
                  <span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:10,background:cat.color+"18",color:cat.color||"#64748b"}}>
                    {cat.label}
                  </span>
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                <div style={{width:10,height:10,borderRadius:"50%",background:PRIORITY_COLOR[n.priority],flexShrink:0,marginTop:2}}/>
                <span style={{color:"#CBD5E1",fontSize:18}}>›</span>
              </div>
            </div>
          );
        })}

        {done.length > 0 && <>
          <div style={{fontSize:11,fontWeight:700,color:"#94A3B8",letterSpacing:"0.1em",margin:"16px 4px 8px"}}>DONE</div>
          {done.map(n => {
            const cat = getCat(n.cat);
            return (
              <div key={n.id} style={{background:"#fff",borderRadius:14,padding:"13px 14px",marginBottom:9,opacity:.55,
                borderLeft:`3.5px solid ${cat.color||"#94A3B8"}`,display:"flex",alignItems:"center",gap:10}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:15,color:"#94A3B8",textDecoration:"line-through",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{n.title}</div>
                  <div style={{fontSize:12,color:"#CBD5E1",marginTop:3}}>🗓 {n.date}</div>
                </div>
                <span style={{color:"#CBD5E1",fontSize:18}}>›</span>
              </div>
            );
          })}
        </>}
      </div>

      {/* Editor sheet overlay */}
      {showEditor && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:100,display:"flex",alignItems:"flex-end"}}
          onClick={() => setShowEditor(false)}>
          <div style={{background:"#fff",borderRadius:"22px 22px 0 0",padding:"22px 18px 36px",width:"100%",maxWidth:420,margin:"0 auto"}}
            onClick={e => e.stopPropagation()}>
            <div style={{fontWeight:800,fontSize:18,color:"#1e293b",marginBottom:16}}>Edit Note</div>

            {/* AI category row */}
            <div style={{marginBottom:14,background:"#F1F5F9",borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
              <div style={{flex:1}}>
                <div style={{fontSize:11,fontWeight:700,color:"#94A3B8",letterSpacing:"0.08em",marginBottom:2}}>CATEGORY</div>
                <div style={{fontSize:12,color:"#64748b"}}>AI suggested · tap to change</div>
              </div>
              <button onClick={simulateAI}
                style={{padding:"6px 12px",borderRadius:10,border:"none",background:"#4A6580",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                {aiLoading ? "…" : aiDone ? "✓ Done" : "Re-classify"}
              </button>
            </div>

            {/* Category chips */}
            <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:18}}>
              {CATEGORIES.filter(c=>c.id!=="all").map(c => (
                <button key={c.id} onClick={() => setEditorCat(c.id)}
                  style={{padding:"7px 14px",borderRadius:20,border:"1.5px solid",fontSize:13,fontWeight:600,cursor:"pointer",
                    borderColor: editorCat===c.id ? c.color : "#E2E8F0",
                    background:  editorCat===c.id ? c.color : "#fff",
                    color:       editorCat===c.id ? "#fff"  : "#64748b"}}>
                  {c.label}
                </button>
              ))}
            </div>

            <button style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:"#4A6580",color:"#fff",fontSize:16,fontWeight:700,cursor:"pointer"}}
              onClick={() => setShowEditor(false)}>Save Note</button>
          </div>
        </div>
      )}
    </div>
  );
}
