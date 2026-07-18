import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceArea, CartesianGrid,
} from "recharts";
import {
  Menu, X, Bell, Waves, Droplets, Fish, Shell, Store, Newspaper, BookOpen, ListChecks,
  FlaskConical, Notebook, Camera, Bot, MessageCircle, Receipt, Settings, MapPin, Heart,
  ChevronRight, ChevronLeft, Check, RefreshCw, Sparkles, TrendingUp, Send, Clock, Tag, Plus, Calendar,
  Award, Image as ImageIcon, Search, PenSquare, Upload, Beaker, User, Users, SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { REEFPEDIA, REEFPEDIA_CATS } from "./reefpedia.js";
import { TERMS, PRIVACY, TOS_VERSION } from "./legal.js";
import { ZOAS, ZOA_TIERS, ZOA_CARE, ZOA_TIPS } from "./zoas.js";
import SPECIES_IMAGES from "./species-images.json";

/* ======================================================================= */
/*  Styles — "Actinic": a reef tank at night under blue LED                 */
/* ======================================================================= */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Hanken+Grotesk:wght@400;500;600;700&display=swap');
:root{
  --bg-0:#03080c;--bg-1:#05121b;--bg-2:#0b2330;
  --glass:rgba(13,40,55,.55);--glass-2:rgba(9,30,42,.78);
  --brd:rgba(86,224,255,.16);--brd-2:rgba(86,224,255,.32);
  --aqua:#3fe3ff;--aqua-d:#1aa7c4;--teal:#2ee6c8;--coral:#ff7a5c;--violet:#b06cff;--gold:#ffc24d;
  --good:#3ce0a3;--warn:#ffc24d;--bad:#ff5d72;
  --text:#e9f7fc;--muted:#84a8ba;--muted-2:#5b8194;
}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
html,body{height:100%;overflow:hidden;overscroll-behavior:none;}
#root{height:100%;}
.rb-root{font-family:'Hanken Grotesk',sans-serif;color:var(--text);height:100dvh;position:relative;
  overflow-y:auto;overflow-x:hidden;overscroll-behavior-y:contain;-webkit-overflow-scrolling:touch;
  background:radial-gradient(120% 80% at 50% -10%,rgba(63,227,255,.18),transparent 55%),
    radial-gradient(90% 60% at 90% 110%,rgba(176,108,255,.12),transparent 60%),
    radial-gradient(70% 50% at 0% 100%,rgba(255,122,92,.08),transparent 55%),
    linear-gradient(180deg,var(--bg-1),var(--bg-0) 70%);}
.rb-root:before{content:'';position:fixed;inset:0;pointer-events:none;opacity:.5;mix-blend-mode:overlay;z-index:0;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.035'/%3E%3C/svg%3E");}
.rb-shell{max-width:480px;margin:0 auto;position:relative;z-index:1;padding:0 16px calc(110px + env(safe-area-inset-bottom,0px));}
.rb-fadein{animation:rbFade .45s cubic-bezier(.2,.7,.2,1);}
/* rbUp retired: its translateY made animated views the containing block for position:fixed
   children — iOS Low Power Mode can freeze the animation mid-transform, permanently trapping
   and clipping modal overlays inside the view (the "black box" bug). Opacity-only is safe. */
@keyframes rbUp{from{opacity:0;transform:translateY(14px)}99%{transform:translateY(0)}to{opacity:1;transform:none}}

.rb-top{display:flex;align-items:center;gap:12px;padding:calc(18px + env(safe-area-inset-top,0px)) 2px 14px;position:sticky;top:0;z-index:30;}
.rb-iconbtn{width:42px;height:42px;border-radius:14px;border:1px solid var(--brd);background:var(--glass);
  display:grid;place-items:center;color:var(--text);cursor:pointer;position:relative;backdrop-filter:blur(12px);flex:none;}
.rb-title{font-family:'Bricolage Grotesque';font-weight:800;font-size:19px;letter-spacing:-.4px;}
.rb-cnt{position:absolute;top:-4px;right:-4px;background:var(--bad);color:#fff;font-size:10px;font-weight:700;
  min-width:18px;height:18px;border-radius:9px;display:grid;place-items:center;padding:0 4px;}
.rb-pearls{margin-left:auto;display:flex;align-items:center;gap:6px;font-weight:700;font-size:13px;
  background:rgba(176,108,255,.14);border:1px solid rgba(176,108,255,.4);color:#d7b6ff;padding:7px 12px;border-radius:20px;}
.rb-pearl{width:11px;height:11px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,#b06cff 70%);box-shadow:0 0 7px #b06cff;}

.rb-card{background:var(--glass);border:1px solid var(--brd);border-radius:20px;backdrop-filter:blur(14px);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.04),0 14px 40px -24px rgba(0,0,0,.8);}
.rb-h2{font-family:'Bricolage Grotesque';font-weight:700;font-size:16px;letter-spacing:-.3px;margin:24px 2px 12px;
  display:flex;align-items:center;gap:8px;}
.rb-h2 small{font-family:'Hanken Grotesk';font-weight:500;font-size:12px;color:var(--muted);margin-left:auto;}

/* drawer */
.rb-scrim{position:fixed;inset:0;z-index:50;background:rgba(2,9,15,.55);backdrop-filter:blur(2px);animation:rbFade .2s both;}
@keyframes rbFade{from{opacity:0}to{opacity:1}}
.rb-drawer{position:fixed;top:0;right:0;height:100%;width:min(330px,82%);z-index:51;padding:22px 18px;overflow-y:auto;
  background:linear-gradient(200deg,#0c2536,#06141d);border-left:1px solid var(--brd);
  animation:rbDraw .28s cubic-bezier(.2,.8,.2,1) both;box-shadow:-30px 0 60px -20px #000;}
@keyframes rbDraw{from{transform:translateX(40px);opacity:.3}to{transform:none;opacity:1}}
.rb-dhead{display:flex;flex-direction:column;align-items:center;text-align:center;padding:6px 0 18px;cursor:pointer;}
.rb-av{border-radius:50%;display:grid;place-items:center;overflow:hidden;flex:none;}
.rb-dhead .h{font-family:'Bricolage Grotesque';font-weight:800;font-size:19px;margin-top:12px;}
.rb-dloc{color:var(--muted);font-size:13px;margin-top:8px;display:flex;align-items:center;gap:4px;}
.rb-mitem{display:flex;align-items:center;gap:14px;padding:14px 8px;border-radius:13px;cursor:pointer;font-size:15px;font-weight:600;}
.rb-mitem:active{background:rgba(255,255,255,.05);}
.rb-mitem .ic{color:var(--aqua);display:grid;place-items:center;width:24px;}
.rb-mitem .badge{margin-left:auto;background:var(--bad);color:#fff;font-size:11px;font-weight:700;border-radius:11px;padding:2px 8px;}
.rb-mitem .reldot{margin-left:auto;width:8px;height:8px;border-radius:50%;background:var(--aqua);box-shadow:0 0 7px var(--aqua);}
.rb-mdiv{height:1px;background:rgba(255,255,255,.07);margin:6px 2px;}

/* profile */
.rb-phero{padding:22px 20px;text-align:center;position:relative;overflow:hidden;}
.rb-phero .glow{position:absolute;inset:0;opacity:.5;background:radial-gradient(60% 80% at 50% -10%,rgba(176,108,255,.4),transparent 60%);}
.rb-phero .h{font-family:'Bricolage Grotesque';font-weight:800;font-size:24px;margin-top:12px;position:relative;}
.rb-phero .ha{color:var(--muted);font-size:14px;position:relative;}
.rb-badges{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:14px;position:relative;}
.rb-badge{font-size:12px;font-weight:700;padding:6px 13px;border-radius:20px;display:flex;align-items:center;gap:5px;}
.rb-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:16px;}
.rb-stat{background:rgba(255,255,255,.03);border:1px solid var(--brd);border-radius:14px;padding:13px;text-align:center;}
.rb-stat .v{font-family:'Bricolage Grotesque';font-weight:800;font-size:24px;}
.rb-stat .k{font-size:11px;color:var(--muted);margin-top:2px;}
.rb-tankhero{height:230px;border-radius:18px;overflow:hidden;position:relative;margin-top:12px;
  background:linear-gradient(180deg,#0a2742,#04111a);border:1px solid var(--brd);}
.rb-tankhero .light{position:absolute;inset:0;background:
  radial-gradient(50% 70% at 30% 120%,rgba(46,230,200,.45),transparent 55%),
  radial-gradient(45% 65% at 75% 130%,rgba(176,108,255,.4),transparent 55%),
  radial-gradient(80% 50% at 50% -10%,rgba(63,160,255,.35),transparent 60%);}
.rb-tankhero .rock{position:absolute;bottom:0;left:8%;right:8%;height:46%;border-radius:50% 50% 0 0;
  background:linear-gradient(180deg,#173a52,#0a2030);filter:blur(.3px);}
.rb-tankhero .acts{position:absolute;top:12px;right:12px;display:flex;gap:8px;}
.rb-tankhero .acts div{width:40px;height:40px;border-radius:50%;background:rgba(4,17,26,.55);border:1px solid var(--brd);
  display:grid;place-items:center;cursor:pointer;backdrop-filter:blur(8px);}
.rb-coralbit{position:absolute;border-radius:6px;}

/* param grid */
.rb-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.rb-pcard{padding:13px 14px;cursor:pointer;transition:transform .15s,border-color .15s;}
.rb-pcard:active{transform:scale(.97);}
.rb-pcard.sel{border-color:var(--brd-2);box-shadow:0 0 0 1px var(--brd-2),0 0 24px -8px var(--aqua);}
.rb-pcard .top{display:flex;align-items:center;justify-content:space-between;}
.rb-pcard .lbl{font-size:12px;color:var(--muted);}
.rb-pcard .val{font-family:'Bricolage Grotesque';font-weight:700;font-size:22px;margin-top:6px;}
.rb-pcard .val u{font-size:12px;color:var(--muted);font-weight:500;text-decoration:none;margin-left:3px;}
.rb-sdot{width:9px;height:9px;border-radius:50%;}
.s-good{background:var(--good);box-shadow:0 0 9px var(--good);}
.s-warn{background:var(--warn);box-shadow:0 0 9px var(--warn);}
.s-bad{background:var(--bad);box-shadow:0 0 9px var(--bad);}
.rb-trend{font-size:11px;margin-top:4px;color:var(--muted);}
.rb-chartwrap{padding:16px 6px 8px 0;margin-top:10px;}
.rb-chart-h{display:flex;align-items:center;justify-content:space-between;padding:0 14px 6px;}
.rb-chart-h b{font-family:'Bricolage Grotesque';font-size:15px;}

/* lists */
.rb-li{display:flex;align-items:center;gap:13px;padding:13px 14px;border-bottom:1px solid rgba(255,255,255,.05);}
.rb-li:last-child{border-bottom:none;}
.rb-thumb{width:46px;height:46px;border-radius:13px;flex:none;display:grid;place-items:center;color:#04111a;overflow:hidden;}
.rb-thumb img{width:100%;height:100%;object-fit:cover;}
.rb-li .nm{font-weight:600;font-size:14px;}
.rb-li .sub{font-size:12px;color:var(--muted);margin-top:1px;}

/* tasks */
.rb-task{display:flex;align-items:center;gap:12px;padding:13px 14px;border-bottom:1px solid rgba(255,255,255,.05);cursor:pointer;}
.rb-task:last-child{border-bottom:none;}
.rb-check{width:26px;height:26px;border-radius:9px;border:2px solid var(--brd-2);flex:none;display:grid;place-items:center;
  color:var(--bg-0);transition:.18s;cursor:pointer;}
.rb-check:hover{border-color:var(--good);}
.rb-check.done{background:var(--good);border-color:var(--good);animation:rbPop .4s ease;}
.rb-spin{animation:rbSpin .8s linear infinite;}
@keyframes rbSpin{to{transform:rotate(360deg);}}
@keyframes rbPop{0%{transform:scale(1)}45%{transform:scale(1.25)}100%{transform:scale(1)}}
.rb-task.completing{animation:rbSlideOut .45s ease forwards;}
@keyframes rbSlideOut{60%{opacity:1}100%{opacity:0;transform:translateX(14px)}}
.rb-task .nm{font-weight:600;font-size:14px;}
.rb-task .when{font-size:12px;margin-top:1px;}
.due-over{color:var(--bad)}.due-soon{color:var(--warn)}.due-ok{color:var(--muted)}
.rb-pill{margin-left:auto;font-size:10.5px;color:var(--muted);border:1px solid var(--brd);border-radius:20px;padding:3px 9px;}

/* chips */
.rb-tabs{display:flex;gap:8px;margin:4px 0 14px;overflow-x:auto;padding-bottom:2px;}
.rb-chip{flex:none;font-size:13px;padding:8px 15px;border-radius:20px;border:1px solid var(--brd);background:var(--glass);
  color:var(--muted);cursor:pointer;font-weight:600;}
.rb-chip.on{color:var(--bg-0);background:linear-gradient(120deg,var(--aqua),var(--teal));border-color:transparent;}

/* market + library grids */
.rb-mgrid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.rb-mcard{overflow:hidden;cursor:pointer;transition:transform .15s;}
.rb-mcard:active{transform:scale(.98);}
.rb-mimg{height:120px;display:grid;place-items:center;position:relative;color:rgba(255,255,255,.85);}
.rb-mimg .cat{position:absolute;top:8px;left:8px;font-size:10px;background:rgba(4,17,26,.6);padding:3px 8px;border-radius:20px;
  backdrop-filter:blur(6px);border:1px solid var(--brd);}
.rb-mbody{padding:11px 12px;}
.rb-mbody .t{font-weight:600;font-size:13.5px;line-height:1.25;}
.rb-mbody .p{font-family:'Bricolage Grotesque';font-weight:800;font-size:17px;margin-top:6px;color:var(--aqua);}
.rb-mbody .sci{font-size:11px;color:var(--muted);margin-top:4px;font-style:italic;}
.rb-mbody .loc{font-size:11px;color:var(--muted);margin-top:3px;display:flex;align-items:center;gap:3px;}
.rb-care{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;}
.rb-care span{font-size:10px;border:1px solid var(--brd);border-radius:8px;padding:2px 7px;color:var(--muted);}

/* community */
.rb-post{padding:16px;margin-bottom:14px;display:flex;flex-direction:column;}
.rb-post .rb-pbody{flex:1;}
.rb-phead{display:flex;align-items:center;gap:11px;margin-bottom:12px;}
.rb-pa{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;font-weight:700;color:var(--bg-0);font-size:15px;flex:none;}
.rb-phead .u{font-weight:700;font-size:14px}.rb-phead .meta{font-size:11.5px;color:var(--muted)}
.rb-ptag{margin-left:auto;font-size:10.5px;padding:4px 10px;border-radius:20px;font-weight:600;}
.rb-pbody{font-size:14px;line-height:1.5;color:#d8eef5;}
.rb-pimg{height:170px;border-radius:14px;margin:12px 0;display:grid;place-items:center;color:rgba(4,17,26,.5);}
.rb-pacts{display:flex;gap:20px;margin-top:6px;color:var(--muted);font-size:13px;}
.rb-pacts span{display:flex;align-items:center;gap:6px;cursor:pointer;}
.rb-pacts .liked{color:var(--coral);}
.rb-compose{padding:14px;display:flex;gap:10px;align-items:flex-start;margin-bottom:14px;}
.rb-compose-bar{display:flex;align-items:center;gap:8px;margin-top:8px;flex-wrap:wrap;justify-content:flex-end;}
.rb-compose-bar .rb-chip{flex:none;}

/* inputs */
.rb-input{width:100%;background:rgba(255,255,255,.04);border:1px solid var(--brd);border-radius:12px;color:var(--text);
  font-family:inherit;font-size:16px;padding:11px 13px;resize:none;outline:none;}
.rb-input:focus{border-color:var(--brd-2);}
.rb-btn{border:none;border-radius:12px;padding:11px 16px;font-family:'Hanken Grotesk';font-weight:700;font-size:14px;
  background:linear-gradient(120deg,var(--aqua),var(--teal));color:var(--bg-0);cursor:pointer;display:inline-flex;
  align-items:center;gap:7px;justify-content:center;}
.rb-btn:disabled{opacity:.5}
.rb-btn.ghost{background:transparent;border:1px solid var(--brd-2);color:var(--text);}
.rb-btn.violet{background:linear-gradient(120deg,var(--violet),var(--aqua-d));color:#fff;}

/* bottom nav */
.rb-nav{position:fixed;bottom:0;left:0;right:0;width:100%;z-index:40;
  display:flex;justify-content:space-around;align-items:stretch;
  padding:8px 8px calc(8px + env(safe-area-inset-bottom,0px));
  border-radius:0;background:var(--glass-2);border:none;border-top:1px solid var(--brd);
  backdrop-filter:blur(20px);box-shadow:0 -10px 40px -16px rgba(0,0,0,.9);}
.rb-navi{flex:1;max-width:180px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;
  padding:9px 0;border-radius:14px;color:var(--muted-2);cursor:pointer;font-size:10.5px;font-weight:600;transition:.18s;}
.rb-navi.on{color:var(--bg-0);background:linear-gradient(140deg,var(--aqua),var(--teal));box-shadow:0 0 22px -4px var(--aqua);}
.rb-fab{position:fixed;bottom:calc(84px + env(safe-area-inset-bottom,0px));right:max(16px,calc(50% - 224px));width:56px;height:56px;border-radius:18px;z-index:41;
  background:linear-gradient(140deg,var(--coral),var(--violet));border:none;color:#fff;display:grid;place-items:center;cursor:pointer;
  box-shadow:0 14px 34px -8px rgba(255,122,92,.6);}

/* sheet */
.rb-overlay{position:fixed;top:0;left:0;right:0;bottom:0;z-index:60;background:rgba(2,10,16,.7);backdrop-filter:blur(4px);
  display:flex;align-items:flex-end;justify-content:center;animation:rbFade .2s both;overscroll-behavior:contain;}
.rb-sheet{width:min(480px,100%);max-height:90vh;max-height:90dvh;overflow-y:auto;-webkit-overflow-scrolling:touch;background:linear-gradient(180deg,var(--bg-2),var(--bg-1));
  border:1px solid var(--brd);border-radius:26px 26px 0 0;padding:20px 20px calc(20px + env(safe-area-inset-bottom,0px));animation:rbSheet .3s cubic-bezier(.2,.8,.2,1) both;}
@keyframes rbSheet{from{transform:translateY(40px);opacity:.4}to{transform:none;opacity:1}}
.rb-sheet-h{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;}
.rb-sheet-h b{font-family:'Bricolage Grotesque';font-size:19px;}
.rb-field{margin-bottom:13px}.rb-field label{font-size:12px;color:var(--muted);display:block;margin-bottom:6px;}
.rb-num{display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,.04);border:1px solid var(--brd);transition:border-color .2s;
  border-radius:12px;padding:9px 13px;margin-bottom:8px;}
.rb-num label{font-size:13px}.rb-num input{width:84px;background:transparent;border:none;color:var(--aqua);text-align:right;
  font-family:'Bricolage Grotesque';font-weight:700;font-size:16px;outline:none;}

/* AI */
.rb-ai-msgs{display:flex;flex-direction:column;gap:10px;margin-bottom:14px;overflow-y:auto;}
.rb-ai-msgs.grow{flex:1 1 auto;min-height:180px;}
.rb-ai-msgs.empty{flex:0 0 auto;min-height:0;}
.rb-ai-wrap.compact{min-height:0;}
.rb-ai-wrap{display:flex;flex-direction:column;min-height:calc(100dvh - 210px);}
.rb-ai-msg{padding:11px 14px;border-radius:15px;font-size:13.5px;line-height:1.5;max-width:88%;white-space:pre-wrap;}
.rb-ai-msg.u{align-self:flex-end;background:linear-gradient(120deg,var(--aqua-d),var(--aqua));color:var(--bg-0);font-weight:500;}
.rb-ai-msg.a{align-self:flex-start;background:rgba(255,255,255,.05);border:1px solid var(--brd);}
.rb-ai-row{display:flex;gap:9px;position:sticky;bottom:0;background:linear-gradient(180deg,rgba(5,18,27,0),var(--bg-1) 26%);padding-top:12px;}
.rb-typing{display:flex;gap:5px;padding:4px 0}.rb-typing i{width:7px;height:7px;border-radius:50%;background:var(--aqua);animation:rbBlink 1.2s infinite}
.rb-typing i:nth-child(2){animation-delay:.2s}.rb-typing i:nth-child(3){animation-delay:.4s}
@keyframes rbBlink{0%,60%,100%{opacity:.25}30%{opacity:1}}
.rb-empty{text-align:center;color:var(--muted);font-size:13px;padding:30px 10px;}

/* reef id */
.rb-drop{border:1.5px dashed var(--brd-2);border-radius:18px;padding:34px 18px;text-align:center;cursor:pointer;color:var(--muted);}
.rb-preview{width:100%;border-radius:16px;max-height:300px;object-fit:cover;margin-bottom:14px;border:1px solid var(--brd);}

/* pearl toast */
.rb-toast{position:fixed;top:74px;left:50%;transform:translateX(-50%);z-index:80;background:rgba(176,108,255,.92);
  color:#fff;font-weight:700;font-size:14px;padding:10px 18px;border-radius:22px;display:flex;align-items:center;gap:8px;
  box-shadow:0 12px 30px -8px rgba(176,108,255,.7);animation:rbToast 2s both;}
@keyframes rbToast{0%{opacity:0;transform:translate(-50%,-12px)}15%,80%{opacity:1;transform:translate(-50%,0)}100%{opacity:0;transform:translate(-50%,-12px)}}

/* logo + top bar */
.rb-logowrap{flex:1;display:flex;justify-content:center;}
.rb-logo{font-family:'Bricolage Grotesque';font-weight:800;font-size:19px;letter-spacing:-.6px;line-height:1;position:relative;padding-bottom:4px;}
.rb-logo .a{color:#3f9bff}.rb-logo .b{color:var(--teal)}
.rb-wave{position:absolute;left:0;width:62%;bottom:-2px;height:6px;}
.rb-avbtn{position:relative;cursor:pointer;flex:none;}
.rb-avdot{position:absolute;top:0;right:0;width:11px;height:11px;border-radius:50%;background:var(--bad);border:2px solid var(--bg-0);}
.rb-navbadge{position:absolute;top:-7px;right:-10px;background:var(--bad);color:#fff;font-size:9px;font-weight:700;min-width:15px;height:15px;
  border-radius:8px;display:grid;place-items:center;padding:0 3px;}

/* feed search + sections */
.rb-searchrow{display:flex;align-items:center;gap:10px;margin:2px 0 6px;}
.rb-iconbtn.sm{width:38px;height:38px;border-radius:50%;}
.rb-searchpill{flex:1;display:flex;align-items:center;gap:9px;background:rgba(255,255,255,.04);border:1px solid var(--brd);border-radius:24px;padding:10px 16px;}
.rb-searchpill input{flex:1;background:transparent;border:none;color:var(--text);outline:none;font-family:inherit;font-size:16px;}
.rb-sec{margin:22px 2px 12px;}
.rb-sec h3{font-family:'Bricolage Grotesque';font-weight:800;font-size:21px;letter-spacing:-.5px;margin:0;}
.rb-sec p{color:var(--muted);font-size:13px;margin:3px 0 0;}
.rb-hscroll{display:flex;gap:12px;overflow-x:auto;padding:0 16px 6px;margin:0 -16px;scroll-snap-type:x mandatory;}
.rb-hscroll::-webkit-scrollbar{display:none;}
.rb-qcard{flex:none;width:268px;padding:14px;scroll-snap-align:start;}
.rb-clamp{display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden;}
.rb-qimg{height:118px;border-radius:12px;margin-top:12px;display:grid;place-items:center;color:rgba(4,17,26,.45);}
.rb-tcard{flex:none;width:196px;padding:0;overflow:hidden;scroll-snap-align:start;}
.rb-tcard-h{display:flex;align-items:center;justify-content:space-between;padding:12px 14px 10px;}
.rb-tcard-h b{font-family:'Bricolage Grotesque';font-size:16px;}
.rb-tcard-h span{font-size:12px;color:var(--muted);}
.rb-timg{height:118px;display:grid;place-items:center;color:rgba(4,17,26,.45);}

/* ---------- responsive: tablet & desktop ---------- */
.rb-postgrid{display:block;}
@media (min-width: 768px){
  .rb-shell{max-width:768px;padding:0 24px calc(120px + env(safe-area-inset-bottom,0px));}
  .rb-grid{grid-template-columns:repeat(4,1fr);}
  .rb-mgrid{grid-template-columns:repeat(3,1fr);}
  .rb-qcard{width:300px;}
  .rb-tcard{width:220px;}
  .rb-hscroll{padding:0 24px 6px;margin:0 -24px;}
  .rb-postgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;align-items:start;}
  .rb-postgrid .rb-post{margin-bottom:0;}
  .rb-overlay{align-items:flex-start;padding:24px;overflow-y:auto;}
  .rb-overlay > .rb-sheet{margin:auto;}

  /* Landscape tablets + desktops: use the horizontal space so the info fits without scrolling. */
  @media (orientation: landscape) and (min-width: 900px) {
    .rb-sheet.rb-split{
      max-width:1040px;width:100%;max-height:90vh;border-radius:22px;
      display:grid;grid-template-columns:minmax(320px,400px) 1fr;grid-column-gap:26px;align-content:start;
    }
    .rb-sheet.rb-split .rb-sheet-h{grid-column:1 / -1;}
    .rb-split-media{position:sticky;top:0;align-self:start;}
    .rb-split-body{min-width:0;overflow-y:auto;max-height:calc(90vh - 104px);padding-right:4px;}
    .rb-split-body::-webkit-scrollbar{width:6px;}
    .rb-split-body::-webkit-scrollbar-thumb{background:var(--brd-2);border-radius:3px;}
  }
  .rb-sheet{border-radius:26px;max-height:88vh;max-height:88dvh;overflow-y:auto;-webkit-overflow-scrolling:touch;animation:rbModal .25s cubic-bezier(.2,.8,.2,1) both;}
  .rb-cols2{display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:start;}
  .rb-cols2 > *{margin-top:0 !important;}
  .rb-cols2 > div > .rb-h2:first-child{margin-top:2px;}
  .rb-authwrap{max-width:460px;margin:0 auto;}
}
@keyframes rbModal{from{transform:scale(.96);opacity:.4}to{transform:none;opacity:1}}
@media (min-width: 1100px){
  .rb-shell{max-width:1080px;}
  .rb-mgrid{grid-template-columns:repeat(4,1fr);}
  .rb-postgrid{grid-template-columns:repeat(3,minmax(0,1fr));}
  .rb-qcard{width:320px;}
  .rb-cols2.wide-40-60{grid-template-columns:2fr 3fr;}
  .rb-fab{right:max(16px,calc(50% - 524px));}
}
`;

/* ======================================================================= */
/*  Data                                                                    */
/* ======================================================================= */
const PARAMS = [
  { key: "alk",  label: "Alkalinity", unit: "dKH", min: 7.5, max: 9.5, ideal: [8, 9],       dec: 1, w: 3 },
  { key: "cal",  label: "Calcium",    unit: "ppm", min: 380, max: 470, ideal: [420, 440],   dec: 0, w: 1 },
  { key: "mag",  label: "Magnesium",  unit: "ppm", min: 1250,max: 1450,ideal: [1300, 1400], dec: 0, w: 1 },
  { key: "no3",  label: "Nitrate",    unit: "ppm", min: 0,   max: 30,  ideal: [5, 10],      dec: 1, w: 1.5 },
  { key: "po4",  label: "Phosphate",  unit: "ppm", min: 0,   max: 0.25,ideal: [0.03, 0.1],  dec: 2, w: 1.5 },
  { key: "ph",   label: "pH",         unit: "",    min: 7.7, max: 8.5, ideal: [8.0, 8.4],   dec: 2, w: 2 },
  { key: "sal",  label: "Salinity",   unit: "sg",  min: 1.02,max: 1.028,ideal:[1.024,1.026],dec: 3, w: 3 },
  { key: "temp", label: "Temp",       unit: "°F",  min: 74,  max: 82,  ideal: [76, 78],     dec: 1, w: 3 },
];
const dayMs = 86400000;
const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });




const QUESTIONS = [
  { id: "q1", user: "Joshua", time: "23h", c: "#b06cff", type: "Fish", img: ["#1aa7c4", "#3fe3ff"], body: "Not a good day for the tank! Lost 2 clowns this morning and now another looking really suspect. Still new to the saltwater life — is this velvet or Ich?? I don't have a QT tank…" },
  { id: "q2", user: "Julio", time: "1d", c: "#ff7a5c", type: "Invert", img: ["#1aa7c4", "#0b2330"], body: "Does anyone know what these little white specks are? There's a ton of them crawling on the glass and they seem to hang out anywhere algae grows on the glass." },
  { id: "q3", user: "Moon", time: "1d", c: "#ffc24d", type: "Coral", img: ["#ff9d8a", "#ffc24d"], body: "Got this free leather coral at my local Petco — you think they'll make it? They were a DOA shipment with their fish, you think they'll make it?" },
  { id: "q4", user: "V.brooks", time: "2d", c: "#3ce0a3", type: "Coral", img: ["#2ee6c8", "#1aa7c4"], body: "Any suggestions on a good starter setup budget build? (Coral included if possible / frag). Photos coming soon!" },
];
const COMMUNITY_TANKS = [
  { id: "t1", name: "Super Softy", time: "7m", g: ["#3fe3ff", "#1aa7c4"] },
  { id: "t2", name: "Biocube 16", time: "9m", g: ["#b06cff", "#ff5d72"] },
  { id: "t3", name: "40 G", time: "10m", g: ["#1aa7c4", "#2ee6c8"] },
  { id: "t4", name: "75 Gal Tank", time: "21m", g: ["#ff7a5c", "#ffc24d"] },
  { id: "t5", name: "JediReef", time: "34m", g: ["#3fe3ff", "#b06cff"] },
];


function statusOf(p, v) {
  if (v == null || !Number.isFinite(+v)) return "none";
  const [lo, hi] = p.ideal;
  const span = (hi - lo) * 0.5;
  if (v >= lo && v <= hi) return "good";
  if (v >= lo - span && v <= hi + span) return "warn";
  return "bad";
}
const sclass = { good: "s-good", warn: "s-warn", bad: "s-bad" };
/* Last non-null reading for a parameter — partial logs mean the latest row may not have every value. */
function lastVal(history, key) {
  for (let i = history.length - 1; i >= 0; i--) {
    const v = history[i][key];
    if (v != null && Number.isFinite(+v)) return { v: +v, date: history[i].date };
  }
  return null;
}

function startOfDay(ts) { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime(); }
/** Whole calendar days from today until the due date. 0 = today, -1 = yesterday, 1 = tomorrow. */
function daysUntil(due) { return Math.round((startOfDay(due) - startOfDay(Date.now())) / dayMs); }
function dueLabel(due) {
  const d = daysUntil(due);
  if (d < -1) return { t: `Overdue by ${-d} days`, c: "due-over" };
  if (d === -1) return { t: "Overdue by 1 day", c: "due-over" };
  if (d === 0) return { t: "Due today", c: "due-soon" };
  if (d === 1) return { t: "Due tomorrow", c: "due-ok" };
  return { t: "Due " + fmtDate(due), c: "due-ok" };
}
const everyMs = { Daily: dayMs, "Every 2 days": 2 * dayMs, "Every 3 days": 3 * dayMs, Weekly: 7 * dayMs,
  Biweekly: 14 * dayMs, Monthly: 30 * dayMs, Quarterly: 90 * dayMs, "One-time": 0 };
const EVERY_OPTS = ["Daily", "Every 2 days", "Every 3 days", "Weekly", "Biweekly", "Monthly", "Quarterly", "One-time"];
const diffColor = { Easy: "#3ce0a3", Medium: "#ffc24d", Hard: "#ff5d72" };

/* ---------------- Supabase ---------------- */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://dhluuqpdbshvhnskyprb.supabase.co";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || "sb_publishable_9RMUI6qMi33Ju4ATaudIlQ_JxmkxPKb";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    detectSessionInUrl: true,   // pick up the auth token when users return from the email confirm link
    persistSession: true,
    autoRefreshToken: true,
  },
});

const DEFAULT_TASKS = [
  { name: "Water change (2 gal)", every: "Weekly", offset: 0 },
  { name: "Test parameters", every: "Weekly", offset: dayMs },
  { name: "Dose 2-part", every: "Every 2 days", offset: 0 },
  { name: "Clean skimmer cup", every: "Weekly", offset: 2 * dayMs },
  { name: "Replace filter floss", every: "Biweekly", offset: 5 * dayMs },
];
const PALETTE = [["#3fe3ff", "#b06cff"], ["#ff7a5c", "#ffc24d"], ["#2ee6c8", "#1aa7c4"], ["#b06cff", "#ff5d72"], ["#3ce0a3", "#2ee6c8"]];
const KIND_COLOR = { Fish: "#ff7a5c", Coral: "#2ee6c8", Invert: "#84a8ba" };
const TAG_COLOR = { Update: "#3fe3ff", Help: "#ffc24d", Build: "#2ee6c8", Event: "#b06cff" };
function rel(ts) {
  const s = (Date.now() - new Date(ts).getTime()) / 1000;
  if (s < 60) return "now";
  if (s < 3600) return Math.floor(s / 60) + "m";
  if (s < 86400) return Math.floor(s / 3600) + "h";
  return Math.floor(s / 86400) + "d";
}

function shapeTank(t) { return { id: t.id, name: t.name, model: t.model || "", volume: t.volume_gal || 0, since: t.since || "", isPublic: t.is_public !== false, shareParams: !!t.share_params }; }

async function fetchSpeciesCounts() {
  const { data } = await supabase.rpc("species_counts");
  const out = {};
  (data || []).forEach((r) => (out[r.species_id] = Number(r.keepers)));
  return out;
}
async function fetchKeepers(sid) {
  const { data } = await supabase.rpc("species_keepers", { sid });
  return data || [];
}
async function fetchEvents() {
  const [ev, rs, pf] = await Promise.all([
    supabase.from("events").select("*").gte("event_date", new Date().toISOString().slice(0, 10)).order("event_date").limit(10),
    supabase.from("event_rsvps").select("*"),
    supabase.from("public_profiles").select("id, handle"),
  ]);
  const handles = {}; (pf.data || []).forEach((p) => (handles[p.id] = p.handle));
  return (ev.data || []).map((e) => ({
    ...e, host: handles[e.host_id] || "reefer",
    rsvps: (rs.data || []).filter((r) => r.event_id === e.id).map((r) => ({ ...r, handle: handles[r.profile_id] || "reefer" })),
  }));
}

async function fetchPublicTank(tankId) {
  const [{ data: tank }, { data: stock }] = await Promise.all([
    supabase.from("tanks").select("*").eq("id", tankId).single(),
    supabase.from("livestock").select("*").eq("tank_id", tankId).order("kind"),
  ]);
  let owner = null;
  if (tank) {
    const { data: p } = await supabase.from("public_profiles")
      .select("handle, display_name, location, reefing_since, badges").eq("id", tank.owner_id).single();
    owner = p;
  }
  return { tank: tank ? { ...tank, owner } : null, stock: stock || [] };
}
async function fetchRecentParams() {
  const { data, error } = await supabase.rpc("recent_parameters_feed", { lim: 12 });
  if (error) console.error("[tidepool] recent params failed:", error.message);
  return data || [];
}

async function fetchComments(postId) {
  const [{ data, error }, { data: pf }] = await Promise.all([
    supabase.from("post_comments").select("*").eq("post_id", postId).order("created_at"),
    supabase.from("public_profiles").select("id, handle"),
  ]);
  if (error) console.error("[tidepool] comments query failed:", error.message);
  const people = {};
  (pf || []).forEach((p) => (people[p.id] = p.handle));
  return (data || []).map((c) => ({ ...c, handle: people[c.author_id] || "reefer" }));
}

async function fetchThreads(uid) {
  const [{ data, error }, { data: pf }] = await Promise.all([
    supabase.from("messages").select("*")
      .or(`sender_id.eq.${uid},recipient_id.eq.${uid}`)
      .order("created_at", { ascending: false }).limit(200),
    supabase.from("public_profiles").select("id, handle"),
  ]);
  if (error) console.error("[tidepool] messages query failed:", error.message);
  const people = {};
  (pf || []).forEach((p) => (people[p.id] = p.handle));
  const threads = {};
  (data || []).forEach((m) => {
    const other = m.sender_id === uid ? m.recipient_id : m.sender_id;
    if (!threads[other]) threads[other] = { id: other, handle: people[other] || "reefer", msgs: [] };
    threads[other].msgs.push(m);
  });
  Object.values(threads).forEach((t) => t.msgs.reverse());
  return Object.values(threads).sort((a, b) =>
    new Date(b.msgs[b.msgs.length - 1].created_at) - new Date(a.msgs[a.msgs.length - 1].created_at));
}

async function fetchTankChildren(tankId) {
  const [pr, lr, tr, gr] = await Promise.all([
    supabase.from("parameters").select("*").eq("tank_id", tankId).order("measured_at"),
    supabase.from("livestock").select("*").eq("tank_id", tankId).order("created_at"),
    supabase.from("tasks").select("*").eq("tank_id", tankId),
    supabase.from("tank_log").select("*").eq("tank_id", tankId).order("created_at", { ascending: false }),
  ]);
  return {
    history: (pr.data || []).map((r) => ({
      date: new Date(r.measured_at).getTime(),
      alk: r.alk, cal: r.cal, mag: r.mag, no3: r.no3, po4: r.po4, ph: r.ph, sal: r.sal, temp: r.temp,
    })),
    livestock: (lr.data || []).map((r) => ({
      id: r.id, type: r.kind, name: r.name, note: r.note || "", c: r.color || KIND_COLOR[r.kind] || "#3fe3ff", species_id: r.species_id,
      price: r.price_usd, source: r.source || "", size: r.size_note || "", acquiredAt: r.acquired_at, photo: r.photo_url || null,
      status: r.status || "alive", endedAt: r.ended_at, endReason: r.end_reason || "",
    })),
    tasks: (tr.data || []).map((r) => ({ id: r.id, name: r.name, every: r.every, due: new Date(r.due_at).getTime() })),
    log: (gr.data || []).map((r) => ({ id: r.id, date: new Date(r.created_at).getTime(), type: r.entry_type, note: r.note, aiThread: r.ai_thread_id || null })),
  };
}

async function fetchAll(uid) {
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", uid).single();
  if (profile && (profile.status === "banned" || profile.status === "deleted")) {
    const e = new Error(profile.status === "banned" ? "account_banned" : "account_deleted");
    e.accountBlocked = profile.status;
    throw e;
  }
  let { data: tanksAll } = await supabase.from("tanks").select("*").eq("owner_id", uid).order("created_at");
  tanksAll = tanksAll || [];   // zero tanks = fresh account → onboarding handles it
  let savedId = null; try { savedId = localStorage.getItem("tr:tank"); } catch (e) {}
  const active = tanksAll.find((t) => t.id === savedId) || tanksAll[0] || null;
  const myTankIds = tanksAll.map((t) => t.id);
  const EMPTY_CHILDREN = { history: [], livestock: [], tasks: [], log: [] };
  const [children, mr, sr, allLikes, kr, cm, counts, pf, allStock, followRows] = await Promise.all([
    active ? fetchTankChildren(active.id) : Promise.resolve(EMPTY_CHILDREN),
    supabase.from("listings").select("*").eq("status", "active").order("created_at", { ascending: false }).limit(50),
    supabase.from("posts").select("*").order("created_at", { ascending: false }).limit(50),
    supabase.from("post_likes").select("post_id"),
    supabase.from("post_likes").select("post_id").eq("profile_id", uid),
    supabase.from("post_comments").select("post_id"),
    fetchSpeciesCounts(),
    supabase.from("public_profiles").select("id, handle, display_name"),
    myTankIds.length ? supabase.from("livestock").select("kind, species_id, tank_id").in("tank_id", myTankIds) : Promise.resolve({ data: [] }),
    supabase.from("follows").select("follower_id, followee_id"),
  ]);
  // Surface failures instead of silently rendering an empty feed.
  [["listings", mr], ["posts", sr], ["likes", allLikes], ["profiles", pf], ["livestock", allStock]].forEach(([label, r]) => {
    if (r && r.error) console.error(`[tidepool] ${label} query failed:`, r.error.message, r.error.details || "");
  });

  const stock = (allStock && allStock.data) || [];
  const state_history_total = (children && children.history && children.history.length) || 0;

  const people = {};
  (pf.data || []).forEach((p) => (people[p.id] = p));
  const liked = {};
  (kr.data || []).forEach((r) => (liked[r.post_id] = true));
  const likeCounts = {};
  (allLikes.data || []).forEach((r) => (likeCounts[r.post_id] = (likeCounts[r.post_id] || 0) + 1));
  const commentCounts = {};
  (cm.data || []).forEach((r) => (commentCounts[r.post_id] = (commentCounts[r.post_id] || 0) + 1));
  const following = {};
  let followerCount = 0;
  (followRows && followRows.data || []).forEach((f) => {
    if (f.follower_id === uid) following[f.followee_id] = true;
    if (f.followee_id === uid) followerCount += 1;
  });
  return {
    uid,
    profile: profile || { handle: "reefer", display_name: "Reefer", pearls: 100, location: "Florida, United States" },
    pearls: (profile && profile.pearls) != null ? profile.pearls : 100,
    tanks: tanksAll.map(shapeTank),
    speciesCounts: counts || {},
    totals: {
      livestock: stock.length,
      corals: stock.filter((l) => l.kind === "Coral").length,
      fish: stock.filter((l) => l.kind === "Fish").length,
      linked: stock.filter((l) => l.species_id).length,
      readings: state_history_total,
    },
    tankId: active ? active.id : null,
    tank: active ? shapeTank(active) : null,
    ...children,
    listings: (mr.data || []).map((r, i) => ({
      id: r.id, cat: r.category, title: r.title, price: Number(r.price_usd),
      loc: r.location || "", seller: (people[r.seller_id] && people[r.seller_id].handle) || "reefer",
      sellerId: r.seller_id, description: r.description || "", created_at: r.created_at, g: PALETTE[i % PALETTE.length],
    })),
    posts: (sr.data || []).map((r) => {
      const a = people[r.author_id];
      return {
        id: r.id, user: (a && (a.display_name || a.handle)) || "reefer",
        handle: (a && a.handle) || "reefer", tag: r.tag, tagc: TAG_COLOR[r.tag] || "#3fe3ff",
        time: rel(r.created_at), body: r.body, img: r.img || null, authorId: r.author_id,
        likes: likeCounts[r.id] || 0, comments: commentCounts[r.id] || 0, mine: r.author_id === uid,
      };
    }),
    liked,
    following,
    followerCount,
    followingCount: Object.keys(following).length,
  };
}

/* AI via Netlify function proxy (key stays server-side) */
/* ---------------- Pro gating ---------------- */
const FREE_REEFID = 3;      // lifetime free ReefID scans
const FREE_DEEPDIVE = 5;    // lifetime free DeepDive/AI messages
const AI_GATE = { check: null, sync: null };   // main component installs the checker + counter sync
// Once we learn the server-side gate is active (env key set, it counts), the client stops
// incrementing to avoid double-counting. Until then, the client counts (works before the key is set).
const APP_VERSION = (typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "dev").replace(/\.0$/, "");
function LegalSheet({ doc, onClose }) {
  const sections = doc === "privacy" ? PRIVACY : TERMS;
  return (
    <div className="rb-overlay" onClick={onClose} style={{ zIndex: 320 }}>
      <div className="rb-sheet" onClick={(e) => e.stopPropagation()} style={{ width: "min(640px,100%)" }}>
        <div className="rb-sheet-h"><b>{sections[0][0]}</b><div className="rb-iconbtn" onClick={onClose}><X size={18} /></div></div>
        {sections.map(([h, body], i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            {i > 0 && <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{h}</div>}
            <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Blocks the app until the current Terms/Privacy version is accepted.
   Covers existing users and version bumps; new signups also consent at the form. */
function TermsGate({ uid, onAccepted }) {
  const [viewing, setViewing] = useState(null);
  const [busy, setBusy] = useState(false);
  const accept = async () => {
    setBusy(true);
    const { error } = await supabase.from("profiles").update({ tos_accepted_at: new Date().toISOString(), tos_version: TOS_VERSION }).eq("id", uid);
    setBusy(false);
    if (error) { alert("Couldn't record your acceptance — try again."); return; }
    onAccepted();
  };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 310, background: "rgba(2,6,10,.9)", backdropFilter: "blur(8px)", display: "grid", placeItems: "center", padding: 18 }}>
      <div className="rb-card" style={{ maxWidth: 460, width: "100%", padding: 24 }}>
        <div style={{ fontFamily: "Bricolage Grotesque", fontWeight: 800, fontSize: 20 }}>Quick legal bit 🪸</div>
        <div style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.6, marginTop: 10 }}>
          To keep using Tidepool Reef, please review and accept our{" "}
          <span style={{ color: "var(--aqua)", cursor: "pointer", fontWeight: 600 }} onClick={() => setViewing("terms")}>Terms of Service</span> and{" "}
          <span style={{ color: "var(--aqua)", cursor: "pointer", fontWeight: 600 }} onClick={() => setViewing("privacy")}>Privacy Policy</span>.
          The short version: your data is yours, we don't sell it, AI advice is informational (not professional advice), and marketplace deals are between reefers.
        </div>
        <button className="rb-btn" style={{ width: "100%", marginTop: 18, padding: 13 }} disabled={busy} onClick={accept}>
          {busy ? "Saving…" : "I agree — let's reef"}
        </button>
        <div style={{ textAlign: "center", fontSize: 11.5, color: "var(--muted-2)", marginTop: 10, cursor: "pointer" }} onClick={() => supabase.auth.signOut()}>Disagree & sign out</div>
      </div>
      {viewing && <LegalSheet doc={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}

const AI_GATE_STATE = { serverCounts: false, disabled: false };
// Journal → DeepDive handoff: tap a DeepDive journal entry to reopen that conversation.
const PENDING_AI_THREAD = { id: null };

/* Returns true if the call may proceed. Opens the upgrade sheet + returns false otherwise. */
async function gateAI(kind) {
  if (AI_GATE_STATE.disabled) { alert("AI features are briefly paused for maintenance — back soon!"); return false; }
  if (AI_GATE.check) return AI_GATE.check(kind);
  return true;
}

/* Read + downscale a photo to ≤1600px JPEG (fits function payload; plenty for vision). */
function readReefPhoto(f, cb) {
  const url = URL.createObjectURL(f);
  const im = new Image();
  im.onload = () => {
    const scale = Math.min(1, 1600 / Math.max(im.width, im.height));
    const cv = document.createElement("canvas");
    cv.width = Math.round(im.width * scale); cv.height = Math.round(im.height * scale);
    cv.getContext("2d").drawImage(im, 0, 0, cv.width, cv.height);
    const dataUrl = cv.toDataURL("image/jpeg", 0.85);
    cb({ b64: dataUrl.split(",")[1], media: "image/jpeg", url: dataUrl });
    URL.revokeObjectURL(url);
  };
  im.onerror = () => {
    const reader = new FileReader();
    reader.onload = () => { const s = reader.result; cb({ b64: s.split(",")[1], media: f.type || "image/jpeg", url: s }); };
    reader.readAsDataURL(f);
  };
  im.src = url;
}

/* Upload a downscaled photo to Supabase Storage, return its public URL. */
async function uploadPhoto(file, uid) {
  const photo = await new Promise((res) => readReefPhoto(file, res));
  const bytes = Uint8Array.from(atob(photo.b64), (c) => c.charCodeAt(0));
  const path = `${uid}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const { error } = await supabase.storage.from("photos").upload(path, bytes, { contentType: "image/jpeg", upsert: false });
  if (error) { console.error("photo upload failed:", error.message); return null; }
  const { data } = supabase.storage.from("photos").getPublicUrl(path);
  return data ? data.publicUrl : null;
}

/* Reliably get the access token — retries if the session isn't hydrated yet
   (Supabase can briefly return null right after page load). */
async function getAccessToken() {
  for (let i = 0; i < 3; i++) {
    try {
      const { data } = await supabase.auth.getSession();
      const t = data && data.session && data.session.access_token;
      if (t) return t;
    } catch (e) {}
    await new Promise((r) => setTimeout(r, 250));
  }
  return null;
}

async function askReefAI(messages, system, kind) {
  const token = await getAccessToken();
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) },
    body: JSON.stringify({ max_tokens: 1000, system, messages, kind: kind || "deepdive" }),
  });
  const data = await res.json();
  if (data && data.error) {
    const err = new Error(data.error.message || "AI request failed");
    if (data.error.code === "limit_reached") err.limitReached = true;
    throw err;
  }
  if (data && data._serverCounted) AI_GATE_STATE.serverCounts = true;
  if (AI_GATE.sync) AI_GATE.sync();   // refresh cached usage counters (non-blocking)
  return (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
}

/* coral avatar */
function CoralAvatar({ size = 56 }) {
  return (
    <div className="rb-av" style={{ width: size, height: size }}>
      <img src="/icons/icon-512.png" alt="Tidepool Reef" width={size} height={size}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </div>
  );
}

function ReefLogo() {
  return (
    <div className="rb-logowrap"><div className="rb-logo">
      <span className="a">Tidepool</span> <span className="b">Reef</span>
      <svg className="rb-wave" viewBox="0 0 60 6" preserveAspectRatio="none">
        <path d="M0 3 Q7 0 14 3 T28 3 T42 3 T56 3" stroke="#3f9bff" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </svg>
    </div></div>
  );
}

/* ---------------- Auth ---------------- */
function FeatureRow({ icon, title, body, c }) {
  return (
    <div style={{ display: "flex", gap: 13, alignItems: "flex-start", padding: "13px 0" }}>
      <div style={{ flex: "none", width: 42, height: 42, borderRadius: 12, display: "grid", placeItems: "center",
        background: `linear-gradient(140deg, ${c}22, ${c}0a)`, border: `1px solid ${c}44` }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "Bricolage Grotesque", fontWeight: 700, fontSize: 15 }}>{title}</div>
        <div style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.5, marginTop: 2 }}>{body}</div>
      </div>
    </div>
  );
}

function ResetPasswordScreen({ onDone }) {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const save = async () => {
    if (pw.length < 6) { setMsg("Password must be at least 6 characters."); return; }
    if (pw !== pw2) { setMsg("Passwords don't match."); return; }
    setBusy(true); setMsg("");
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) { setMsg(error.message); return; }
    alert("Password updated. You're all set!");
    onDone();
  };
  return (
    <div className="rb-root"><style>{STYLES}</style>
      <div className="rb-shell" style={{ paddingTop: 60 }}>
        <div style={{ maxWidth: 420, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}><CoralAvatar size={72} /></div>
          <ReefLogo />
          <div className="rb-card" style={{ padding: 18, marginTop: 26, border: "1px solid rgba(63,227,255,.25)" }}>
            <div style={{ fontFamily: "Bricolage Grotesque", fontWeight: 800, fontSize: 18, marginBottom: 4 }}>Set a new password</div>
            <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 14 }}>Choose a new password for your account.</div>
            <div className="rb-field"><label>New password</label>
              <input className="rb-input" type="password" placeholder="••••••••" value={pw} onChange={(e) => setPw(e.target.value)} /></div>
            <div className="rb-field"><label>Confirm password</label>
              <input className="rb-input" type="password" placeholder="••••••••" value={pw2} onChange={(e) => setPw2(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && pw && pw2 && !busy) save(); }} /></div>
            {msg && <div style={{ color: "var(--warn)", fontSize: 13, marginBottom: 10 }}>{msg}</div>}
            <button className="rb-btn" style={{ width: "100%", padding: 14 }} disabled={!pw || !pw2 || busy} onClick={save}>
              {busy ? "Saving…" : "Update password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthScreen() {
  const [mode, setMode] = useState("signup"); // land on signup — this is a new-visitor funnel
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [handle, setHandle] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [legalDoc, setLegalDoc] = useState(null);   // "terms" | "privacy"
  const authRef = useRef(null);

  const scrollToAuth = () => { if (authRef.current) authRef.current.scrollIntoView({ behavior: "smooth", block: "center" }); };

  const submit = async () => {
    setBusy(true); setMsg("");
    try {
      if (mode === "signup") {
        const clean = handle.trim().replace(/[^a-zA-Z0-9_]/g, "");
        if (clean.length < 2) { setMsg("Pick a handle (letters, numbers, underscores)."); setBusy(false); return; }
        if (!agreed) { setMsg("Please agree to the Terms of Service and Privacy Policy to create an account."); setBusy(false); return; }
        const redirectBase = (typeof window !== "undefined" && window.location && window.location.origin && !window.location.origin.includes("localhost"))
          ? window.location.origin
          : "https://reefpulse-app.netlify.app";
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(), password: pw,
          options: { data: { handle: clean }, emailRedirectTo: redirectBase },
        });
        if (error) {
          // Supabase sometimes surfaces the dup directly
          if (/already|registered|exists/i.test(error.message)) {
            setMsg("That email is already registered. Try signing in, or reset your password below.");
            setMode("signin");
          } else setMsg(error.message);
        } else if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
          // Existing email: Supabase returns a user with an empty identities array and sends no email.
          setMsg("That email is already registered. Try signing in, or reset your password below.");
          setMode("signin");
        } else if (!data.session) {
          setMsg("Check your email to confirm your account, then sign in.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pw });
        if (error) setMsg(error.message);
      }
    } catch (e) { setMsg("Something went wrong — try again."); }
    setBusy(false);
  };

  const forgotPassword = async () => {
    if (!email.trim()) { setMsg("Enter your email above first, then tap reset."); return; }
    setBusy(true); setMsg("");
    const redirectBase = (typeof window !== "undefined" && window.location && window.location.origin && !window.location.origin.includes("localhost"))
      ? window.location.origin : "https://reefpulse-app.netlify.app";
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: redirectBase + "?reset=1" });
    setBusy(false);
    setMsg(error ? error.message : "If that email has an account, a password reset link is on its way.");
  };

  return (
    <div className="rb-root"><style>{STYLES}</style>
      <div className="rb-shell" style={{ paddingTop: 48, paddingBottom: 60 }}>
        <div style={{ maxWidth: 460, margin: "0 auto" }}>

          {/* HERO */}
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}><CoralAvatar size={88} /></div>
            <ReefLogo />
            <div style={{ fontFamily: "Bricolage Grotesque", fontWeight: 800, fontSize: 27, lineHeight: 1.15, letterSpacing: "-.5px", marginTop: 18 }}>
              The home for your<br /><span style={{ background: "linear-gradient(120deg,var(--aqua),var(--teal))", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>reef aquarium</span>
            </div>
            <div style={{ color: "var(--muted)", fontSize: 14.5, lineHeight: 1.6, margin: "14px auto 0", maxWidth: 380 }}>
              Track your parameters, get AI diagnosis when something looks off, ID any coral from a photo, and trade frags with reefers near you — all in one app.
            </div>
            <button className="rb-btn" style={{ width: "100%", maxWidth: 300, margin: "22px auto 0", padding: 15, fontSize: 15 }} onClick={scrollToAuth}>
              <Sparkles size={17} /> Create your free account
            </button>
            <div style={{ fontSize: 12.5, color: "var(--muted-2)", marginTop: 10 }}>Free to start · No credit card · v{APP_VERSION}</div>
          </div>

          {/* FEATURE SHOWCASE */}
          <div className="rb-card" style={{ padding: "8px 18px", marginTop: 30 }}>
            <FeatureRow c="#b06cff" icon={<Bot size={20} color="#c79bff" />}
              title="DeepDive AI advisor"
              body="Ask anything about your tank. DeepDive reads your live parameters and livestock, then gives specific, practical fixes — snap a photo and it diagnoses what it sees." />
            <div style={{ borderTop: "1px solid rgba(255,255,255,.06)" }} />
            <FeatureRow c="#3fe3ff" icon={<Camera size={20} color="#3fe3ff" />}
              title="Reef ID from a photo"
              body="Point your camera at any coral, fish, or invert. Get the species, care difficulty, and how to keep it thriving — then add it to your tank in a tap." />
            <div style={{ borderTop: "1px solid rgba(255,255,255,.06)" }} />
            <FeatureRow c="#2ee6c8" icon={<TrendingUp size={20} color="#2ee6c8" />}
              title="Parameter tracking & health score"
              body="Log alk, calcium, nitrate and more. See trends over time, get a weighted tank health score, and catch problems before they cost you corals." />
            <div style={{ borderTop: "1px solid rgba(255,255,255,.06)" }} />
            <FeatureRow c="#ffc24d" icon={<BookOpen size={20} color="#ffc24d" />}
              title="Reefpedia — a library built by reefers"
              body="300+ fish, corals, inverts, pests, and named zoa morphs with care basics for each — and a growing gallery of real specimen photos contributed by the community, not scraped from stores. See a coral you keep? Add your photo and help others ID it." />
            <div style={{ borderTop: "1px solid rgba(255,255,255,.06)" }} />
            <FeatureRow c="#ff7a9e" icon={<Store size={20} color="#ff7a9e" />}
              title="Frag marketplace"
              body="Buy and sell frags, fish, and gear with reefers near you. Message sellers directly and build your reputation." />
            <div style={{ borderTop: "1px solid rgba(255,255,255,.06)" }} />
            <FeatureRow c="#3ce0a3" icon={<Users size={20} color="#3ce0a3" />}
              title="A real reef community"
              body="Share tank updates and photos, ask for help, follow other reefers, and see who keeps the corals you're eyeing." />
            <div style={{ borderTop: "1px solid rgba(255,255,255,.06)" }} />
            <FeatureRow c="#ff9d3c" icon={<Camera size={20} color="#ff9d3c" />}
              title="Built by the community, owned by everyone"
              body="Every specimen photo is a real tank shot shared by a reefer who keeps it — consented, credited, and moderated. The library gets richer and more accurate every day, because it's built by the people using it." />
          </div>

          {/* VALUE STRIP */}
          <div style={{ display: "flex", gap: 10, marginTop: 16, textAlign: "center" }}>
            {[["300+", "species & morphs"], ["100%", "real community photos"], ["AI", "tank diagnosis"]].map(([v, k], i) => (
              <div key={i} className="rb-card" style={{ flex: 1, padding: "14px 6px" }}>
                <div style={{ fontFamily: "Bricolage Grotesque", fontWeight: 800, fontSize: 20, background: "linear-gradient(120deg,var(--aqua),var(--teal))", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{v}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3, lineHeight: 1.3 }}>{k}</div>
              </div>
            ))}
          </div>

          {/* AUTH CARD */}
          <div ref={authRef} className="rb-card" style={{ padding: 18, marginTop: 30, border: "1px solid rgba(63,227,255,.25)" }}>
            <div style={{ textAlign: "center", fontFamily: "Bricolage Grotesque", fontWeight: 800, fontSize: 18, marginBottom: 4 }}>
              {mode === "signup" ? "Start tracking your reef" : "Welcome back"}
            </div>
            <div style={{ textAlign: "center", color: "var(--muted)", fontSize: 12.5, marginBottom: 14 }}>
              {mode === "signup" ? "Free account — set up your first tank in under a minute." : "Sign in to your tanks."}
            </div>
            <div className="rb-tabs" style={{ margin: "0 0 14px" }}>
              <div className={"rb-chip" + (mode === "signup" ? " on" : "")} onClick={() => setMode("signup")}>Create account</div>
              <div className={"rb-chip" + (mode === "signin" ? " on" : "")} onClick={() => setMode("signin")}>Sign in</div>
            </div>
            {mode === "signup" && (
              <div className="rb-field"><label>Handle</label>
                <input className="rb-input" placeholder="e.g. JediReef" value={handle} onChange={(e) => setHandle(e.target.value)} autoCapitalize="none" />
              </div>
            )}
            <div className="rb-field"><label>Email</label>
              <input className="rb-input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoCapitalize="none" />
            </div>
            <div className="rb-field"><label>Password</label>
              <input className="rb-input" type="password" placeholder="••••••••" value={pw} onChange={(e) => setPw(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && email && pw && !busy) submit(); }} />
            </div>
            {mode === "signup" && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 9, marginBottom: 12, cursor: "pointer" }} onClick={() => setAgreed((a) => !a)}>
                <div style={{ width: 19, height: 19, borderRadius: 6, flex: "none", marginTop: 1, display: "grid", placeItems: "center",
                  border: agreed ? "1px solid var(--aqua)" : "1px solid var(--brd-2)", background: agreed ? "var(--aqua)" : "transparent" }}>
                  {agreed && <Check size={13} color="#04111a" />}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>
                  I agree to the{" "}
                  <span style={{ color: "var(--aqua)", fontWeight: 600 }} onClick={(e) => { e.stopPropagation(); setLegalDoc("terms"); }}>Terms of Service</span>{" "}and{" "}
                  <span style={{ color: "var(--aqua)", fontWeight: 600 }} onClick={(e) => { e.stopPropagation(); setLegalDoc("privacy"); }}>Privacy Policy</span>.
                </div>
              </div>
            )}
            {msg && <div style={{ color: "var(--warn)", fontSize: 13, marginBottom: 10, lineHeight: 1.4 }}>{msg}</div>}
            <button className="rb-btn" style={{ width: "100%", padding: 14 }} disabled={!email || !pw || busy || (mode === "signup" && !agreed)} onClick={submit}>
              {busy ? "One sec…" : mode === "signup" ? "Create my free account" : "Sign in"}
            </button>
            {mode === "signup" && (
              <div style={{ textAlign: "center", fontSize: 12, color: "var(--muted)", marginTop: 12 }}>
                Already have an account? <span style={{ color: "var(--aqua)", cursor: "pointer", fontWeight: 600 }} onClick={() => setMode("signin")}>Sign in</span>
              </div>
            )}
            {legalDoc && <LegalSheet doc={legalDoc} onClose={() => setLegalDoc(null)} />}
            {mode === "signin" && (
              <div style={{ textAlign: "center", fontSize: 12, color: "var(--muted)", marginTop: 12 }}>
                <span style={{ color: "var(--aqua)", cursor: "pointer", fontWeight: 600 }} onClick={forgotPassword}>Forgot password?</span>
                <span style={{ margin: "0 8px", opacity: .4 }}>·</span>
                New here? <span style={{ color: "var(--aqua)", cursor: "pointer", fontWeight: 600 }} onClick={() => setMode("signup")}>Create account</span>
              </div>
            )}
          </div>

          <div style={{ textAlign: "center", color: "var(--muted-2)", fontSize: 11.5, marginTop: 16, lineHeight: 1.5 }}>
            Your data syncs across devices. Marketplace listings and posts are visible to other reefers.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ======================================================================= */
/*  Main                                                                    */
/* ======================================================================= */
class ErrorBoundary extends React.Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  componentDidCatch(err, info) { console.error("[tidepool] render error:", err, info); }
  render() {
    if (this.state.err) {
      return (
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#03080c", color: "#e8f4f8", fontFamily: "Hanken Grotesk, system-ui, sans-serif" }}>
          <div style={{ maxWidth: 380, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🪸</div>
            <div style={{ fontFamily: "Bricolage Grotesque, sans-serif", fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Something hiccuped</div>
            <div style={{ color: "#8fa8b5", fontSize: 14, lineHeight: 1.5, marginBottom: 18 }}>
              A screen ran into an error and stopped rendering. Reloading usually clears it.
            </div>
            <button onClick={() => location.reload()} style={{ background: "linear-gradient(120deg,#3fe3ff,#2ee6c8)", color: "#04111a", border: "none", borderRadius: 12, padding: "12px 22px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Reload</button>
            <div style={{ marginTop: 14, fontSize: 11, color: "#5a6b76" }}>{String(this.state.err && this.state.err.message || this.state.err).slice(0, 140)}</div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function TidepoolReefApp() {
  return <ErrorBoundary><TidepoolReef /></ErrorBoundary>;
}

/* ---------------- First-run onboarding ---------------- */
const TANK_PRESETS = [
  ["IM NuVo Fusion 15", 15], ["Biocube 16", 16], ["Biocube 32", 32],
  ["40 Gallon Breeder", 40], ["Red Sea Reefer 250", 65], ["Red Sea Reefer 425 XL", 120],
];
function Onboarding({ profile, onDone }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [gal, setGal] = useState("");
  const [since, setSince] = useState(String(new Date().getFullYear()));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  // Returning user who deleted all tanks (vs. a brand-new signup) — friendlier, non-"welcome" copy.
  const returning = (() => { try { return localStorage.getItem("tr:firstrun") === "1"; } catch (e) { return false; } })();

  const create = async () => {
    setBusy(true); setErr("");
    const { data: created, error } = await supabase.from("tanks")
      .insert({ owner_id: profile.id, name: name.trim() || "My Reef", model: model.trim() || "Custom", volume_gal: Number(gal) || null, since })
      .select().single();
    if (error) { setErr(error.message); setBusy(false); return; }
    await supabase.from("tasks").insert(DEFAULT_TASKS.map((t) => ({
      tank_id: created.id, name: t.name, every: t.every, due_at: new Date(Date.now() + t.offset).toISOString(),
    })));
    try { localStorage.setItem("tr:tank", created.id); localStorage.setItem("tr:firstrun", "1"); } catch (e) {}
    await onDone();
  };

  const years = []; for (let y = new Date().getFullYear(); y >= 2000; y--) years.push(String(y));
  const Dots = () => (
    <div style={{ display: "flex", gap: 6, justifyContent: "center", margin: "18px 0 0" }}>
      {[0, 1, 2, 3].map((i) => <div key={i} style={{ width: 7, height: 7, borderRadius: 7, background: i <= step ? "var(--aqua)" : "rgba(255,255,255,.15)" }} />)}
    </div>
  );

  return (
    <div className="rb-root" style={{ display: "grid", placeItems: "center", padding: 20 }}>
      <style>{STYLES}</style>
      <div style={{ maxWidth: 430, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div style={{ fontFamily: "Bricolage Grotesque", fontWeight: 800, fontSize: 24 }}>
            <span style={{ background: "linear-gradient(90deg,#3f9bff,#2ee6c8)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Tidepool</span> <span style={{ color: "var(--aqua)" }}>Reef</span>
          </div>
        </div>
        <div className="rb-card" style={{ padding: 26 }}>

          {step === 0 && (<div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 44 }}>🪸</div>
            <div style={{ fontFamily: "Bricolage Grotesque", fontWeight: 800, fontSize: 21, marginTop: 10 }}>
              {returning ? "Let's set up a tank" : `Welcome, @${profile.handle}!`}
            </div>
            <div style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6, marginTop: 10 }}>
              {returning ? (
                <>You don't have any tanks right now. Add one to start tracking parameters, logging livestock, and getting answers again — takes about a minute.</>
              ) : (
                <>Your reef journal starts here — track parameters, log livestock, and get answers when something looks off.<br /><br />Would you like to set up your first tank?</>
              )}
            </div>
            <button className="rb-btn" style={{ width: "100%", marginTop: 20, padding: 14 }} onClick={() => setStep(1)}>
              <Waves size={16} /> {returning ? "Set up a tank" : "Set up my first tank"}
            </button>
            <div style={{ fontSize: 12, color: "var(--muted-2)", marginTop: 12, cursor: "pointer" }} onClick={() => supabase.auth.signOut()}>Sign out</div>
          </div>)}

          {step === 1 && (<div>
            <div style={{ fontFamily: "Bricolage Grotesque", fontWeight: 800, fontSize: 18 }}>Name your tank</div>
            <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 5 }}>Whatever you call it at home — you can change this anytime.</div>
            <input className="rb-input" autoFocus placeholder="e.g. The Reef, Living Room Lagoon…" value={name}
              onChange={(e) => setName(e.target.value)} style={{ width: "100%", marginTop: 14 }} />
            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
              {["My Reef", "The Lagoon", "Coral Corner"].map((s) => (
                <div key={s} className="rb-chip" style={{ fontSize: 11.5 }} onClick={() => setName(s)}>{s}</div>
              ))}
            </div>
            <button className="rb-btn" style={{ width: "100%", marginTop: 18 }} disabled={!name.trim()} onClick={() => setStep(2)}>Next</button>
          </div>)}

          {step === 2 && (<div>
            <div style={{ fontFamily: "Bricolage Grotesque", fontWeight: 800, fontSize: 18 }}>What kind of tank?</div>
            <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 5 }}>Pick a common setup or type your own.</div>
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              {TANK_PRESETS.map(([m, g]) => (
                <div key={m} className={"rb-chip" + (model === m ? " on" : "")} style={{ fontSize: 11.5 }}
                  onClick={() => { setModel(m); setGal(String(g)); }}>{m}</div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <input className="rb-input" placeholder="Model / brand" value={model} onChange={(e) => setModel(e.target.value)} style={{ flex: 2 }} />
              <input className="rb-input" placeholder="Gallons" type="number" inputMode="numeric" value={gal} onChange={(e) => setGal(e.target.value)} style={{ flex: 1 }} />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button className="rb-btn ghost" style={{ flex: 1 }} onClick={() => setStep(1)}>Back</button>
              <button className="rb-btn" style={{ flex: 2 }} disabled={!model.trim()} onClick={() => setStep(3)}>Next</button>
            </div>
          </div>)}

          {step === 3 && (<div>
            <div style={{ fontFamily: "Bricolage Grotesque", fontWeight: 800, fontSize: 18 }}>Running since?</div>
            <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 5 }}>Roughly when did this tank start? (Helps track maturity.)</div>
            <select className="rb-input" value={since} onChange={(e) => setSince(e.target.value)} style={{ width: "100%", marginTop: 14 }}>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <div className="rb-card" style={{ padding: 14, marginTop: 16, background: "var(--bg-2)", fontSize: 13, color: "var(--muted)" }}>
              <b style={{ color: "var(--text)" }}>{name || "My Reef"}</b><br />
              {model || "Custom"}{gal ? ` · ${gal} gal` : ""} · since {since}<br />
              <span style={{ fontSize: 11.5, color: "var(--muted-2)" }}>We'll add a starter maintenance schedule you can edit.</span>
            </div>
            {err && <div style={{ color: "var(--bad)", fontSize: 12.5, marginTop: 10 }}>{err}</div>}
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button className="rb-btn ghost" style={{ flex: 1 }} disabled={busy} onClick={() => setStep(2)}>Back</button>
              <button className="rb-btn" style={{ flex: 2 }} disabled={busy} onClick={create}>{busy ? "Creating…" : "Create my tank 🎉"}</button>
            </div>
          </div>)}

          <Dots />
        </div>
      </div>
    </div>
  );
}

/* Pull-to-refresh — listens on the app's own scroll container (.rb-root) so iOS Safari's
   native bounce/PTR can't hijack the gesture. Engages only at scrollTop 0. */
function usePullToRefresh(onRefresh, refreshing, ready) {
  const cb = useRef(onRefresh); cb.current = onRefresh;
  const busy = useRef(refreshing); busy.current = refreshing;
  useEffect(() => {
    const scroller = document.querySelector(".rb-root");
    if (!scroller) return;
    let startY = 0, pulling = false, pulled = 0;
    const THRESHOLD = 70;
    const indicator = () => document.getElementById("rb-ptr");

    const setPull = (px) => {
      const el = indicator(); if (!el) return;
      const p = Math.min(px, 90);
      el.style.transform = `translateX(-50%) translateY(${p - 46}px)`;
      el.style.opacity = String(Math.min(1, px / THRESHOLD));
      const svg = el.querySelector("svg"); if (svg) svg.style.transform = `rotate(${px * 3}deg)`;
    };
    const reset = () => { const el = indicator(); if (el) { el.style.transform = "translateX(-50%) translateY(-46px)"; el.style.opacity = "0"; } };

    const onStart = (e) => {
      pulling = scroller.scrollTop <= 0 && !busy.current;
      if (pulling) { startY = e.touches[0].clientY; pulled = 0; }
    };
    const onMove = (e) => {
      if (!pulling) return;
      const dy = e.touches[0].clientY - startY;
      if (dy <= 0) { setPull(0); return; }
      if (scroller.scrollTop > 0) { pulling = false; reset(); return; }
      e.preventDefault();               // own the gesture from the first downward pixel
      pulled = dy * 0.5;                // rubber-band damping
      setPull(pulled);
    };
    const onEnd = () => {
      if (!pulling) return;
      pulling = false;
      if (pulled >= THRESHOLD && !busy.current) cb.current();
      reset();
    };

    scroller.addEventListener("touchstart", onStart, { passive: true });
    scroller.addEventListener("touchmove", onMove, { passive: false });
    scroller.addEventListener("touchend", onEnd, { passive: true });
    scroller.addEventListener("touchcancel", onEnd, { passive: true });
    return () => {
      scroller.removeEventListener("touchstart", onStart);
      scroller.removeEventListener("touchmove", onMove);
      scroller.removeEventListener("touchend", onEnd);
      scroller.removeEventListener("touchcancel", onEnd);
    };
  }, [ready]);   // rebind when the main UI (its .rb-root) mounts; callbacks via refs
}

function TidepoolReef() {
  const [state, setState] = useState(null);
  const [view, setView] = useState(() => {
    try {
      const v = new URLSearchParams(window.location.search).get("view");
      if (["tank", "log", "deepdive", "community", "profile", "tasks", "library", "shop", "reefid"].includes(v)) return v;
    } catch (e) {}
    return "tank";
  });        // feed|library|shop|tasks|profile|params|tanklog|reefid|deepdive|notifications|messages|purchases|seller|settings
  const [drawer, setDrawer] = useState(false);
  const [sel, setSel] = useState("alk");
  const [cat, setCat] = useState("All");
  const [libCat, setLibCat] = useState("All");
  const [sheet, setSheet] = useState(null);        // log|sell|libDetail
  const [libItem, setLibItem] = useState(null);
  const [addItem, setAddItem] = useState(null);
  const [publicTank, setPublicTank] = useState(null);
  // Activity ping (throttled to hourly) + app settings (announcement, AI kill switch)
  const [appSettings, setAppSettings] = useState({});
  useEffect(() => {
    if (!state) return;
    try {
      const last = Number(localStorage.getItem("tr:seen") || 0);
      if (Date.now() - last > 3600000) {
        localStorage.setItem("tr:seen", String(Date.now()));
        supabase.from("profiles").update({ last_seen_at: new Date().toISOString() }).eq("id", state.uid).then(() => {});
      }
    } catch (e) {}
    supabase.from("app_settings").select("key, value").then(({ data }) => {
      const s = {}; (data || []).forEach((r) => (s[r.key] = r.value));
      AI_GATE_STATE.disabled = s.ai_enabled === false;
      setAppSettings(s);
    });
  }, [state && state.uid]);
  // Shareable tank links: /?tank=<id> opens that public tank once signed in.
  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search).get("tank");
      if (p) { setPublicTank(p); setSheet("publicTank"); window.history.replaceState({}, "", window.location.pathname); }
    } catch (e) {}
  }, []);
  const [msgTo, setMsgTo] = useState(null);
  const [toast, setToast] = useState(0);

  const [session, setSession] = useState(undefined); // undefined=checking, null=signed out
  const [recovery, setRecovery] = useState(false);    // password-reset return
  useEffect(() => {
    // Handle the "token_hash" style confirm/recovery return (newer Supabase links).
    // detectSessionInUrl covers the #access_token hash flow; this covers ?token_hash=...&type=...
    // which otherwise leaves the user logged-out on a blank page.
    (async () => {
      try {
        if (typeof window === "undefined") return;
        const url = new URL(window.location.href);
        const token_hash = url.searchParams.get("token_hash");
        const type = url.searchParams.get("type");
        if (token_hash && type) {
          const { error } = await supabase.auth.verifyOtp({ token_hash, type });
          if (!error) {
            if (type === "recovery") setRecovery(true);
            window.history.replaceState({}, "", window.location.pathname);
          } else {
            console.error("verifyOtp failed:", error.message);
          }
        }
      } catch (e) { console.error("confirm-return handling error", e); }
    })();
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    if (typeof window !== "undefined" && (window.location.search.includes("reset=1") || window.location.hash.includes("type=recovery"))) setRecovery(true);
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (_e === "PASSWORD_RECOVERY") setRecovery(true);
      setSession(s);
      // After the email-confirm token is consumed, strip it from the URL bar.
      if (s && typeof window !== "undefined" && (window.location.hash.includes("access_token") || window.location.search.includes("code=")) && !window.location.hash.includes("type=recovery")) {
        window.history.replaceState({}, "", window.location.pathname);
      }
    });
    // Learn up-front whether the server gate counts, so the client never double-counts.
    fetch("/api/chat", { method: "GET" }).then((r) => r.json()).then((d) => {
      if (d && d.gateActive) AI_GATE_STATE.serverCounts = true;
    }).catch(() => {});
    return () => sub.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (session && session.user) {
      setState(null);
      fetchAll(session.user.id).then(setState).catch((e) => {
        if (e && e.accountBlocked) {
          alert(e.accountBlocked === "banned"
            ? "This account has been suspended. Contact support if you believe this is a mistake."
            : "This account has been deleted.");
          supabase.auth.signOut();
        } else {
          console.error("load failed", e);
        }
      });
    }
  }, [session && session.user && session.user.id]);

  const [refreshing, setRefreshing] = useState(false);
  const refresh = async () => {
    if (!session || !session.user || refreshing) return;
    setRefreshing(true);
    try {
      const fresh = await fetchAll(session.user.id);
      setState(fresh);   // swap in place — no full-screen loader
    } catch (e) { console.error("refresh failed", e); }
    setRefreshing(false);
  };
  usePullToRefresh(refresh, refreshing, !!state);
  const [justUpgraded, setJustUpgraded] = useState(false);
  useEffect(() => {
    if (!session || !session.user) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("upgraded") !== "1") return;
    window.history.replaceState({}, "", window.location.pathname);
    setJustUpgraded(true);
    let tries = 0;
    const tick = async () => {
      tries += 1;
      const fresh = await fetchAll(session.user.id).catch(() => null);
      if (fresh) setState(fresh);
      if (fresh && fresh.profile && fresh.profile.plan === "pro") return;
      if (tries < 5) setTimeout(tick, 2000);
    };
    tick();
  }, [session && session.user && session.user.id]);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  // Client-side counting: increments the free-tier counter via the use_ai RPC so usage
  // deducts immediately. When SUPABASE_SERVICE_KEY is set, the server gate becomes the
  // authoritative counter and the client defers (serverCounts flag) to avoid double-counting.
  AI_GATE.check = async (kind) => {
    const p = state && state.profile;
    if (!p) return false;
    if (p.plan === "pro") return true;
    const k = kind === "reefid" ? "reefid" : "deepdive";
    const field = k === "reefid" ? "reefid_used" : "deepdive_used";
    const used = p[field] || 0;
    const limit = k === "reefid" ? FREE_REEFID : FREE_DEEPDIVE;
    if (used >= limit) { setUpgradeOpen(true); return false; }
    // Count this use client-side unless the server gate is the active counter.
    if (!AI_GATE_STATE.serverCounts) {
      try {
        const { data: n, error } = await supabase.rpc("use_ai", { kind: k });
        if (error) {
          console.error("use_ai increment failed:", error.message);
          // Fallback: optimistic local bump so the UI still counts down even if the RPC hiccups.
          AI_GATE_STATE.lastCount = used + 1;
          setState((s) => s ? { ...s, profile: { ...s.profile, [field]: used + 1 } } : s);
        } else {
          AI_GATE_STATE.lastCount = (typeof n === "number") ? n : used + 1;
          setState((s) => s ? { ...s, profile: { ...s.profile, [field]: AI_GATE_STATE.lastCount } } : s);
        }
      } catch (e) {
        console.error("use_ai threw:", e);
        setState((s) => s ? { ...s, profile: { ...s.profile, [field]: used + 1 } } : s);
      }
    }
    return true;
  };
  AI_GATE.sync = async () => {
    if (!session || !session.user) return;
    const { data } = await supabase.from("profiles").select("reefid_used, deepdive_used, plan").eq("id", session.user.id).single();
    if (data) setState((s) => {
      if (!s) return s;
      // Never let a stale read lower a counter below what we just counted locally.
      const merged = { ...s.profile, ...data };
      if (typeof s.profile.reefid_used === "number" && data.reefid_used < s.profile.reefid_used) merged.reefid_used = s.profile.reefid_used;
      if (typeof s.profile.deepdive_used === "number" && data.deepdive_used < s.profile.deepdive_used) merged.deepdive_used = s.profile.deepdive_used;
      return { ...s, profile: merged };
    });
  };
  useEffect(() => {
    const el = document.getElementById("rb-ptr");
    if (!el) return;
    if (refreshing) { el.style.transform = "translateX(-50%) translateY(8px)"; el.style.opacity = "1"; }
    else { el.style.transform = "translateX(-50%) translateY(-46px)"; el.style.opacity = "0"; }
  }, [refreshing, state]);

  const latest = useMemo(() => (state && state.history.length ? state.history[state.history.length - 1] : null), [state]);
  const award = async (n) => {
    setToast(n); setTimeout(() => setToast(0), 2000);
    const { data } = await supabase.rpc("award_pearls", { amount: n });
    if (typeof data === "number") setState((s) => (s ? { ...s, pearls: data } : s));
  };

  if (session === undefined) {
    return (<div className="rb-root"><style>{STYLES}</style><div className="rb-shell"><div className="rb-empty" style={{ paddingTop: 120 }}>
      <Waves size={30} style={{ opacity: .6 }} /><div style={{ marginTop: 12 }}>Loading your reef…</div></div></div></div>);
  }
  if (recovery) return <ResetPasswordScreen onDone={() => { setRecovery(false); if (typeof window !== "undefined") window.history.replaceState({}, "", window.location.pathname); }} />;
  if (session === null) return <AuthScreen />;
  if (!state) {
    return (<div className="rb-root"><style>{STYLES}</style><div className="rb-shell"><div className="rb-empty" style={{ paddingTop: 120 }}>
      <Waves size={30} style={{ opacity: .6 }} /><div style={{ marginTop: 12 }}>Loading your reef…</div></div></div></div>);
  }
  // Terms gate: block until the current legal version is accepted (existing users + version bumps).
  if (state.profile && state.profile.tos_version !== TOS_VERSION) {
    return <TermsGate uid={state.uid} onAccepted={refresh} />;
  }
  if (!state.tanks.length) return <Onboarding profile={state.profile} onDone={refresh} />;
  // First-run nudge: right after creating their first tank, open the Log sheet so the
  // first reading happens while the momentum is there.
  if (typeof window !== "undefined") {
    try {
      if (localStorage.getItem("tr:firstrun") === "1") {
        localStorage.removeItem("tr:firstrun");
        setTimeout(() => setSheet("log"), 600);
      }
    } catch (e) {}
  }

  const allListings = state.listings;
  const allPosts = state.posts;
  const issues = state ? (() => {
    const out = [];
    for (const p of PARAMS) {
      const lv = lastVal(state.history, p.key);
      if (!lv) continue;
      const st = statusOf(p, lv.v);
      if (st === "warn" || st === "bad") { out.push(p); continue; }
      // Drift detection: in-range now, but trending out. Least-squares slope over
      // recent readings; flag if projected outside ideal within ~4 weeks.
      const cutoff = Date.now() - 45 * 86400000;
      const pts = state.history.filter((h) => h[p.key] != null && h.date >= cutoff).map((h) => ({ t: h.date, v: h[p.key] }));
      if (pts.length < 3) continue;
      const wk = 7 * 86400000;
      const mx = pts.reduce((a, b) => a + b.t, 0) / pts.length, my = pts.reduce((a, b) => a + b.v, 0) / pts.length;
      const slope = pts.reduce((a, b) => a + (b.t - mx) * (b.v - my), 0) / (pts.reduce((a, b) => a + (b.t - mx) ** 2, 0) || 1) * wk; // units per week
      if (!Number.isFinite(slope) || Math.abs(slope) < 1e-6) continue;
      const [lo, hi] = p.ideal;
      const last = pts[pts.length - 1].v;
      const weeksToExit = slope > 0 ? (hi - last) / slope : (lo - last) / slope;
      if (weeksToExit > 0 && weeksToExit <= 4) {
        out.push({ ...p, _drift: true, _driftMsg: `${slope > 0 ? "rising" : "falling"} ${Math.abs(slope).toFixed(p.dec)} ${p.unit}/wk — out of range in ~${Math.max(1, Math.round(weeksToExit))} wk` });
      }
    }
    return out;
  })() : [];
  const corals = state.livestock.filter((l) => l.type === "Coral").length;
  const fish = state.livestock.filter((l) => l.type === "Fish").length;

  /* actions — optimistic local update, then persist to Supabase */
  const completeTask = async (id) => {
    const t = state.tasks.find((x) => x.id === id); if (!t) return;
    if (t.every === "One-time") {   // one-time tasks disappear when done
      setState((s) => ({ ...s, tasks: s.tasks.filter((x) => x.id !== id) }));
      await supabase.from("tasks").delete().eq("id", id);
      award(2);
      return;
    }
    const due = Date.now() + (everyMs[t.every] || 7 * dayMs);
    setState((s) => ({ ...s, tasks: s.tasks.map((x) => (x.id === id ? { ...x, due } : x)) }));
    await supabase.from("tasks").update({ due_at: new Date(due).toISOString() }).eq("id", id);
    award(2);
  };
  const addTask = async (name, every, dueAt) => {
    const due = dueAt || Date.now();
    const { data } = await supabase.from("tasks")
      .insert({ tank_id: state.tankId, name, every, due_at: new Date(due).toISOString() })
      .select().single();
    setState((s) => ({ ...s, tasks: [...s.tasks, { id: (data && data.id) || "tmp" + Date.now(), name, every, due }] }));
  };
  const updateTask = async (id, name, every, due) => {
    setState((s) => ({ ...s, tasks: s.tasks.map((x) => (x.id === id ? { ...x, name, every, due } : x)) }));
    await supabase.from("tasks").update({ name, every, due_at: new Date(due).toISOString() }).eq("id", id);
  };
  const deleteTask = async (id) => {
    setState((s) => ({ ...s, tasks: s.tasks.filter((x) => x.id !== id) }));
    await supabase.from("tasks").delete().eq("id", id);
  };
  const saveLog = async (vals) => {
    const prev = state.history;
    setState((s) => ({ ...s, history: [...s.history, { date: Date.now(), ...vals }] }));
    const { error } = await supabase.from("parameters").insert({ tank_id: state.tankId, ...vals });
    if (error) {
      console.error("saveLog failed:", error.message);
      setState((s) => ({ ...s, history: prev }));
      alert("Couldn't save that reading — check your connection and try again.");
      return;
    }
    award(5);
  };
  const addLogEntry = async (type, note) => {
    const prev = state.log;
    setState((s) => ({ ...s, log: [{ id: "tmp" + Date.now(), date: Date.now(), type, note }, ...s.log] }));
    const { error } = await supabase.from("tank_log").insert({ tank_id: state.tankId, entry_type: type, note });
    if (error) {
      console.error("addLogEntry failed:", error.message);
      setState((s) => ({ ...s, log: prev }));
      alert("Couldn't save that journal entry — try again.");
      return;
    }
    award(5);
  };
  const addLivestock = async (kind, name, note, speciesId, detail = {}) => {
    const c = KIND_COLOR[kind] || "#3fe3ff";
    const prev = state.livestock;
    const targetTank = detail.tankId || state.tankId;
    const isActive = targetTank === state.tankId;
    const row = {
      tank_id: targetTank, kind, name, note: note || null, color: c, species_id: speciesId || null,
      price_usd: detail.price != null && detail.price !== "" ? Number(detail.price) : null,
      source: detail.source || null,
      size_note: detail.size || null,
      acquired_at: detail.acquiredAt || null,
      photo_url: detail.photoUrl || null,
    };
    const tmpId = "tmp" + Date.now();
    if (isActive) setState((s) => ({ ...s, livestock: [...s.livestock, {
      id: tmpId, type: kind, name, note: note || "", c, species_id: speciesId || null,
      price: row.price_usd, source: detail.source || "", size: detail.size || "", acquiredAt: detail.acquiredAt || null,
      photo: detail.photoUrl || null, status: "alive",
    }] }));
    const { data, error } = await supabase.from("livestock").insert(row).select().single();
    if (error) {
      console.error("addLivestock failed:", error.message);
      if (isActive) setState((s) => ({ ...s, livestock: prev }));
      alert("Couldn't add that livestock — try again.");
      return null;
    }
    // swap tmp id for the real one
    if (isActive) setState((s) => ({ ...s, livestock: s.livestock.map((l) => l.id === tmpId ? { ...l, id: data.id } : l) }));
    // Library keeper counter — refresh authoritatively so an add to ANY tank is reflected.
    const counts = await fetchSpeciesCounts();
    setState((s) => ({ ...s, speciesCounts: counts }));
    // Auto-journal entry — detailed (to the target tank's log)
    const bits = [];
    if (row.price_usd != null) bits.push(`$${row.price_usd}`);
    if (detail.source) bits.push(`from ${detail.source}`);
    if (detail.size) bits.push(detail.size);
    const acq = detail.acquiredAt ? new Date(detail.acquiredAt + "T00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null;
    if (acq) bits.push(`acquired ${acq}`);
    const journalNote = `Added ${name} (${kind})${bits.length ? " — " + bits.join(", ") : ""}.${note ? " Note: " + note : ""}`;
    await supabase.from("tank_log").insert({ tank_id: targetTank, entry_type: "Addition", note: journalNote });
    if (isActive) setState((s) => ({ ...s, log: [{ id: "tmp" + Date.now(), date: Date.now(), type: "Addition", note: journalNote }, ...s.log] }));
    return data.id;
  };
  const endLivestock = async (id, reason, endReason) => {
    // reason: 'died' | 'sold' | 'traded' | 'removed'. Archives (off active list) but keeps the record + journal.
    const prev = state.livestock;
    const item = prev.find((l) => l.id === id);
    if (!item) return;
    const today = new Date().toISOString().slice(0, 10);
    setState((s) => ({ ...s, livestock: s.livestock.map((l) => l.id === id ? { ...l, status: reason, endedAt: today, endReason: endReason || "" } : l) }));
    const { error } = await supabase.from("livestock").update({ status: reason, ended_at: today, end_reason: endReason || null }).eq("id", id);
    if (error) {
      console.error("endLivestock failed:", error.message);
      setState((s) => ({ ...s, livestock: prev }));
      alert("Couldn't update that — try again.");
      return;
    }
    if (item.species_id) setState((s) => ({ ...s, speciesCounts: { ...s.speciesCounts, [item.species_id]: Math.max(0, (s.speciesCounts[item.species_id] || 1) - 1) } }));
    // Days kept, if we know when it was acquired
    let kept = "";
    const start = item.acquiredAt ? new Date(item.acquiredAt + "T00:00") : null;
    if (start) { const days = Math.max(0, Math.round((Date.now() - start.getTime()) / 86400000)); kept = ` — kept ${days} day${days === 1 ? "" : "s"}`; }
    const verb = reason === "died" ? "Lost" : reason === "sold" ? "Sold" : reason === "traded" ? "Traded" : "Removed";
    const journalNote = `${verb} ${item.name} (${item.type})${kept}.${endReason ? " " + endReason : ""}`;
    await supabase.from("tank_log").insert({ tank_id: state.tankId, entry_type: reason === "died" ? "Loss" : "Removal", note: journalNote });
    setState((s) => ({ ...s, log: [{ id: "tmp" + Date.now(), date: Date.now(), type: reason === "died" ? "Loss" : "Removal", note: journalNote }, ...s.log] }));
  };
  const addLivestockTo = async (tankId, kind, name, speciesId) => {
    const c = KIND_COLOR[kind] || "#3fe3ff";
    const { error } = await supabase.from("livestock")
      .insert({ tank_id: tankId, kind, name, color: c, species_id: speciesId || null });
    if (error) { console.error("[tidepool] add livestock failed:", error.message); return; }
    if (tankId === state.tankId) {
      setState((s) => ({ ...s, livestock: [...s.livestock, { id: "tmp" + Date.now(), type: kind, name, note: "", c, species_id: speciesId }] }));
    }
    const counts = await fetchSpeciesCounts();
    setState((s) => ({ ...s, speciesCounts: counts }));
    award(2);
  };
  const sendMessage = async (toId, body, speciesId) => {
    await supabase.from("messages").insert({ sender_id: state.uid, recipient_id: toId, body, species_id: speciesId || null });
  };
  const addListing = async (l) => {
    const loc = state.profile.location || "Florida, United States";
    const prev = state.listings;
    setState((s) => ({ ...s, listings: [{ ...l, id: "tmp" + Date.now(), seller: s.profile.handle, sellerId: s.uid, loc, created_at: new Date().toISOString(), g: PALETTE[0] }, ...s.listings] }));
    const { error } = await supabase.from("listings").insert({ seller_id: state.uid, category: l.cat, title: l.title, price_usd: l.price, location: loc, description: l.description || null });
    if (error) {
      console.error("addListing failed:", error.message);
      setState((s) => ({ ...s, listings: prev }));
      alert("Couldn't post that listing — try again.");
      return;
    }
    award(3);
  };
  const markListingSold = async (id) => {
    const prev = state.listings;
    setState((s) => ({ ...s, listings: s.listings.map((l) => l.id === id ? { ...l, status: "sold" } : l) }));
    const { error } = await supabase.from("listings").update({ status: "sold" }).eq("id", id);
    if (error) { console.error("markSold failed:", error.message); setState((s) => ({ ...s, listings: prev })); alert("Couldn't update — try again."); }
  };
  const removeListing = async (id) => {
    const prev = state.listings;
    setState((s) => ({ ...s, listings: s.listings.filter((l) => l.id !== id) }));
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) { console.error("removeListing failed:", error.message); setState((s) => ({ ...s, listings: prev })); alert("Couldn't remove — try again."); }
  };
  const addPost = async (body, tag = "Update", img = null) => {
    const { data, error } = await supabase.from("posts")
      .insert({ author_id: state.uid, tag, body, img }).select().single();
    if (error) {
      console.error("[tidepool] post failed:", error.message);
      alert("Couldn't publish that post: " + error.message);
      return;
    }
    setState((s) => ({ ...s, posts: [{
      id: data.id, user: s.profile.display_name || s.profile.handle, handle: s.profile.handle,
      tag, tagc: TAG_COLOR[tag] || "#3fe3ff", time: "now", body, img, likes: 0, comments: 0, mine: true,
    }, ...s.posts] }));
    award(3);
  };
  const toggleFollow = async (targetId) => {
    if (!targetId || targetId === state.uid) return;
    const isFollowing = !!(state.following && state.following[targetId]);
    setState((s) => {
      const nf = { ...(s.following || {}) };
      if (isFollowing) delete nf[targetId]; else nf[targetId] = true;
      return { ...s, following: nf, followingCount: Object.keys(nf).length };
    });
    const { error } = isFollowing
      ? await supabase.from("follows").delete().eq("follower_id", state.uid).eq("followee_id", targetId)
      : await supabase.from("follows").insert({ follower_id: state.uid, followee_id: targetId });
    if (error) {
      console.error("toggleFollow failed:", error.message);
      setState((s) => {
        const nf = { ...(s.following || {}) };
        if (isFollowing) nf[targetId] = true; else delete nf[targetId];
        return { ...s, following: nf, followingCount: Object.keys(nf).length };
      });
    }
  };
  const toggleLike = async (id) => {
    const had = !!state.liked[id];
    setState((s) => ({
      ...s,
      liked: { ...s.liked, [id]: !had },
      posts: s.posts.map((p) => (p.id === id ? { ...p, likes: Math.max(0, p.likes + (had ? -1 : 1)) } : p)),
    }));
    const { error } = had
      ? await supabase.from("post_likes").delete().eq("post_id", id).eq("profile_id", state.uid)
      : await supabase.from("post_likes").insert({ post_id: id, profile_id: state.uid });
    if (error) {   // roll back so the UI never lies about what was saved
      console.error("[tidepool] like failed:", error.message);
      setState((s) => ({
        ...s,
        liked: { ...s.liked, [id]: had },
        posts: s.posts.map((p) => (p.id === id ? { ...p, likes: Math.max(0, p.likes + (had ? 1 : -1)) } : p)),
      }));
    }
  };
  const addComment = async (postId, body) => {
    const { data, error } = await supabase.from("post_comments")
      .insert({ post_id: postId, author_id: state.uid, body }).select().single();
    if (error) { console.error("[tidepool] comment failed:", error.message); return null; }
    setState((s) => ({ ...s, posts: s.posts.map((p) => (p.id === postId ? { ...p, comments: p.comments + 1 } : p)) }));
    award(2);
    return { ...data, handle: state.profile.handle };
  };
  const updateProfile = async (fields) => {
    const clean = {};
    if (fields.display_name != null) clean.display_name = fields.display_name.trim().slice(0, 40);
    if (fields.handle != null) clean.handle = fields.handle.trim().replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20);
    if (fields.location != null) clean.location = fields.location.trim().slice(0, 60);
    if (fields.reefing_since != null) clean.reefing_since = parseInt(fields.reefing_since, 10) || null;
    if (clean.handle === "") { alert("Handle can't be empty."); return false; }
    const prev = state.profile;
    setState((s) => ({ ...s, profile: { ...s.profile, ...clean } }));
    const { error } = await supabase.from("profiles").update(clean).eq("id", state.uid);
    if (error) {
      console.error("updateProfile failed:", error.message);
      setState((s) => ({ ...s, profile: prev }));
      if (error.code === "23505" || /duplicate|unique/i.test(error.message)) alert("That handle is already taken — try another.");
      else alert("Couldn't save your profile — try again.");
      return false;
    }
    return true;
  };
  const setTankSharing = async (id, field, value) => {
    const col = field === "params" ? "share_params" : "is_public";
    setState((s) => ({
      ...s,
      tanks: s.tanks.map((t) => (t.id === id ? { ...t, [field === "params" ? "shareParams" : "isPublic"]: value } : t)),
      tank: s.tank.id === id ? { ...s.tank, [field === "params" ? "shareParams" : "isPublic"]: value } : s.tank,
    }));
    const { error } = await supabase.from("tanks").update({ [col]: value }).eq("id", id);
    if (error) console.error("[tidepool] sharing update failed:", error.message);
  };
  const switchTank = async (id) => {
    if (id === state.tankId) return;
    try { localStorage.setItem("tr:tank", id); } catch (e) {}
    const children = await fetchTankChildren(id);
    setState((s) => ({ ...s, tankId: id, tank: s.tanks.find((t) => t.id === id) || s.tank, ...children }));
  };
  const createTank = async ({ name, model, gal, since }) => {
    const { data: created, error } = await supabase.from("tanks")
      .insert({ owner_id: state.uid, name: name.trim() || "New Tank", model: (model || "").trim() || "Custom", volume_gal: Number(gal) || null, since: since || String(new Date().getFullYear()) })
      .select().single();
    if (error) { alert("Couldn't create tank — try again."); return; }
    await supabase.from("tasks").insert(DEFAULT_TASKS.map((t) => ({
      tank_id: created.id, name: t.name, every: t.every, due_at: new Date(Date.now() + t.offset).toISOString(),
    })));
    setState((s) => ({ ...s, tanks: [...s.tanks, shapeTank(created)] }));
  };
  const renameTank = async (id, name) => {
    const nm = name.trim(); if (!nm) return;
    setState((s) => ({ ...s, tanks: s.tanks.map((t) => t.id === id ? { ...t, name: nm } : t), tank: s.tank && s.tank.id === id ? { ...s.tank, name: nm } : s.tank }));
    const { error } = await supabase.from("tanks").update({ name: nm }).eq("id", id);
    if (error) { console.error("renameTank failed:", error.message); alert("Couldn't rename — try again."); }
  };
  const deleteTank = async (id) => {
    const prev = state.tanks;
    const remaining = prev.filter((t) => t.id !== id);
    setState((s) => ({ ...s, tanks: remaining }));
    const { error } = await supabase.from("tanks").delete().eq("id", id);
    if (error) { console.error("deleteTank failed:", error.message); setState((s) => ({ ...s, tanks: prev })); alert("Couldn't delete tank — try again."); return; }
    if (remaining.length === 0) {
      // No tanks left — clear active and let the app fall back to onboarding.
      try { localStorage.removeItem("tr:tank"); } catch (e) {}
      setState((s) => ({ ...s, tankId: null, tank: null }));
      await refresh();
    } else if (state.tankId === id) {
      const nextActive = remaining[0].id;
      try { localStorage.setItem("tr:tank", nextActive); } catch (e) {}
      await switchTank(nextActive);
    }
  };

  const TITLES = { tank: "My Tank", log: "Tank Log", deepdive: "Tidepool DeepDive", community: "Community", profile: "My Profile",
    library: "Reefpedia", shop: "Shop", tasks: "Tasks", reefid: "Reef ID",
    notifications: "Notifications", messages: "Messages", purchases: "Purchases", seller: "Seller Hub", settings: "Settings", admin: "Admin" };
  const isTab = ["tank", "log", "deepdive", "community", "profile"].includes(view);
  const taskCount = state.tasks.filter((t) => t.due - Date.now() < dayMs).length;

  const go = (v) => { setView(v); setDrawer(false); };

  return (
    <div className="rb-root">
      <style>{STYLES}</style>

      <UpgradeSheet open={upgradeOpen} onClose={() => setUpgradeOpen(false)} profile={state ? state.profile : {}} />

      {justUpgraded && (
        <div style={{ position: "fixed", inset: 0, zIndex: 340, background: "rgba(2,6,10,.8)", backdropFilter: "blur(6px)", display: "grid", placeItems: "center", padding: 20 }}
          onClick={() => setJustUpgraded(false)}>
          <div className="rb-card" style={{ maxWidth: 380, width: "100%", padding: 26, textAlign: "center", border: "1px solid rgba(46,230,200,.4)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 46 }}>🎉</div>
            <div style={{ fontFamily: "Bricolage Grotesque", fontWeight: 800, fontSize: 22, marginTop: 8 }}>Welcome to <span style={{ color: "var(--teal)" }}>Pro</span>!</div>
            <div style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.55, marginTop: 10 }}>
              {state && state.profile && state.profile.plan === "pro"
                ? "Unlimited DeepDive and ReefID are now unlocked. Dive in. 🪸"
                : "Your payment went through — Pro is activating now, it'll be live in a few seconds."}
            </div>
            <button className="rb-btn" style={{ width: "100%", marginTop: 18 }} onClick={() => setJustUpgraded(false)}>Let's go</button>
          </div>
        </div>
      )}

      {/* pull-to-refresh indicator */}
      <div id="rb-ptr" style={{
        position: "fixed", top: "calc(8px + env(safe-area-inset-top, 0px))", left: "50%", zIndex: 200,
        transform: "translateX(-50%) translateY(-46px)", opacity: 0,
        width: 38, height: 38, borderRadius: "50%", background: "var(--bg-2)",
        border: "1px solid var(--brd-2)", display: "grid", placeItems: "center",
        boxShadow: "0 6px 20px -6px rgba(0,0,0,.6)", pointerEvents: "none",
        transition: "transform .25s, opacity .25s",
      }}>
        <RefreshCw size={18} color="var(--aqua)" className={refreshing ? "rb-spin" : ""} />
      </div>

      {/* top bar */}
      <div className="rb-shell">
        <div className="rb-top">
          {isTab
            ? <div className="rb-iconbtn" onClick={() => setDrawer(true)}><Menu size={20} /></div>
            : <div className="rb-iconbtn" onClick={() => go("tank")}><ChevronLeft size={20} /></div>}
          {isTab ? <ReefLogo /> : <div className="rb-title" style={{ flex: 1, textAlign: "center" }}>{TITLES[view]}</div>}
          <div className="rb-avbtn" onClick={() => go("profile")}><CoralAvatar size={42} /><span className="rb-avdot" /></div>
        </div>

        {appSettings.announcement && typeof appSettings.announcement === "string" && (() => {
          let dismissed = false;
          try { dismissed = localStorage.getItem("tr:ann") === appSettings.announcement; } catch (e) {}
          if (dismissed) return null;
          return (
            <div className="rb-card" style={{ padding: "11px 14px", marginBottom: 10, display: "flex", alignItems: "center", gap: 10, border: "1px solid rgba(63,227,255,.4)", background: "rgba(63,227,255,.07)" }}>
              <Bell size={15} color="var(--aqua)" style={{ flex: "none" }} />
              <div style={{ fontSize: 13, lineHeight: 1.5, flex: 1 }}>{appSettings.announcement}</div>
              <X size={15} color="var(--muted)" style={{ cursor: "pointer", flex: "none" }}
                onClick={(e) => { try { localStorage.setItem("tr:ann", appSettings.announcement); } catch (err) {} e.currentTarget.closest(".rb-card").style.display = "none"; }} />
            </div>
          );
        })()}

        {/* views */}
        {view === "tank" && <TankHome {...{ state, latest, issues, go, setSheet, switchTank, createTank }} />}
        {view === "log" && <LogView {...{ state, latest, sel, setSel, addLivestock, endLivestock, addLogEntry, switchTank, go, uid: state.uid, profile: state.profile }} />}
        {view === "deepdive" && <DeepDive {...{ state, latest, issues, switchTank }} uid={session.user.id} onUpgrade={() => setUpgradeOpen(true)} />}
        {view === "community" && <Feed {...{ allPosts, liked: state.liked, toggleLike, addPost, addComment, uid: state.uid, following: state.following || {}, toggleFollow }} />}
        {view === "admin" && <AdminPanel state={state} />}
        {view === "profile" && <Profile {...{ state, fish: (state.totals ? state.totals.fish : fish), corals: (state.totals ? state.totals.corals : corals), issues, go, switchTank, updateProfile, myPosts: (state.posts || []).filter((p) => p.mine) }} />}
        {view === "library" && <Library {...{ libCat, setLibCat, counts: state.speciesCounts, onAddToTank: setAddItem, openItem: (it) => { setLibItem(it); setSheet("libDetail"); } }} />}
        {view === "shop" && <Shop {...{ allListings, cat, setCat, uid: state.uid, onMessage: (who, prefill) => { setMsgTo({ ...who, prefill }); setSheet("message"); } }} />}
        {view === "tasks" && <Tasks {...{ state, latest, completeTask, addTask, updateTask, deleteTask, switchTank }} />}
        {view === "reefid" && <ReefID profile={state.profile} onUpgrade={() => setUpgradeOpen(true)} tanks={state.tanks} addTo={addLivestockTo} tank={state.tank} history={state.history} livestock={state.livestock} />}
        {view === "notifications" && <Notifications uid={session.user.id} />}
        {view === "messages" && <Messages {...{ state, sendMessage }} />}
        {view === "purchases" && <Purchases />}
        {view === "seller" && <Seller {...{ state, openSell: () => setSheet("sell"), markSold: markListingSold, removeListing }} />}
        {view === "settings" && <SettingsView {...{ state, setTankSharing, createTank, renameTank, deleteTank }} />}
      </div>

      {/* contextual FAB */}
      {view === "log" && <button className="rb-fab" onClick={() => setSheet("log")}><Beaker size={24} /></button>}
      {(view === "shop" || view === "seller") && <button className="rb-fab" onClick={() => setSheet("sell")}><Tag size={22} /></button>}

      {/* bottom nav */}
      <nav className="rb-nav">
        {[["tank", Waves, "Tank"], ["log", FlaskConical, "Log"], ["deepdive", Bot, "DeepDive"], ["community", Newspaper, "Community"], ["profile", User, "Profile"]]
          .map(([k, Icon, lbl]) => (
            <div key={k} className={"rb-navi" + (view === k ? " on" : "")} onClick={() => go(k)}>
              <div style={{ position: "relative" }}><Icon size={20} />{k === "tank" && taskCount > 0 && <span className="rb-navbadge">{taskCount}</span>}</div>
              <span>{lbl}</span>
            </div>
          ))}
      </nav>

      {/* drawer */}
      {drawer && (
        <>
          <div className="rb-scrim" onClick={() => setDrawer(false)} />
          <div className="rb-drawer">
            <div className="rb-dhead" onClick={() => go("profile")}>
              <CoralAvatar size={84} />
              <div className="h">@{state.profile.handle}</div>
              <div className="rb-pearls" style={{ marginTop: 10 }}><span className="rb-pearl" />Pearls: {state.pearls}</div>
              <div className="rb-dloc"><MapPin size={13} /> {state.profile.location || "Florida, United States"}</div>
            </div>
            <div className="rb-mdiv" />
            {[
              ["library", BookOpen, "Reefpedia"],
              ["shop", Store, "Shop"],
              ["tasks", ListChecks, "Maintenance Tasks", taskCount > 0 ? String(taskCount) : null],
              ["reefid", Camera, "Reef ID", "dot"],
              ["notifications", Bell, "Notifications"],
              ["messages", MessageCircle, "Messages"],
              ["purchases", Receipt, "Purchases"],
              ["seller", Store, "Seller Hub"],
              ...(state.profile.plan !== "pro" ? [["upgrade", Sparkles, "Tidepool Pro", "UPGRADE"]] : []),
              ...(state.profile.is_admin ? [["admin", Users, "Admin"]] : []),
              ["settings", Settings, "Settings"],
            ].map(([k, Icon, lbl, extra]) => (
              <div key={k} className="rb-mitem" onClick={() => k === "upgrade" ? (setUpgradeOpen(true), setDrawer(false)) : go(k)}>
                <span className="ic"><Icon size={20} /></span>{lbl}
                {extra === "dot" && <span className="reldot" />}
                {extra && extra !== "dot" && <span className="badge">{extra}</span>}
              </div>
            ))}
          </div>
        </>
      )}

      {/* sheets */}
      {sheet === "log" && <LogSheet latest={latest} history={state.history} onClose={() => setSheet(null)} onSave={saveLog} />}
      {sheet === "sell" && <SellSheet onClose={() => setSheet(null)} onSave={addListing} />}
      {addItem && (
        <AddLivestockSheet
          uid={state.uid}
          tanks={state.tanks}
          activeTankId={state.tankId}
          prefill={{
            name: addItem.name,
            kind: addItem.kind || (addItem.cat === "Fish" ? "Fish" : addItem.cat === "Invert" ? "Invert" : "Coral"),
            species: addItem.id && !String(addItem.id).startsWith("zoa:") ? addItem : null,
          }}
          onClose={() => setAddItem(null)}
          onAdd={addLivestock}
        />
      )}
      {sheet === "libDetail" && libItem && (
        <LibDetail item={libItem} uid={state.uid} count={state.speciesCounts[libItem.id] || 0}
          onAddToTank={(it) => { setSheet(null); setAddItem(it); }}
          onClose={() => setSheet(null)}
          onOpenTank={(tid) => { setPublicTank(tid); setSheet("publicTank"); }}
          onMessage={(who) => { setMsgTo({ ...who, species: libItem }); setSheet("message"); }} />
      )}
      {sheet === "publicTank" && publicTank && (
        <PublicTankSheet tankId={publicTank} onClose={() => setSheet(libItem ? "libDetail" : null)}
          onMessage={(who) => { setMsgTo({ ...who, species: libItem }); setSheet("message"); }} />
      )}
      {sheet === "message" && msgTo && (
        <MessageSheet to={msgTo} onClose={() => setSheet(libItem ? "libDetail" : null)} onSend={sendMessage} />
      )}

      {toast > 0 && <div className="rb-toast"><span className="rb-pearl" />+{toast} Pearls</div>}
    </div>
  );
}

/* ---------------- Tank switcher ---------------- */
function TankSwitcher({ tanks, tankId, switchTank, createTank }) {
  const [addOpen, setAddOpen] = useState(false);
  // Always render when we can add tanks, so "+ Add tank" is discoverable even with one tank.
  if ((!tanks || tanks.length < 2) && !createTank) return null;
  return (
    <>
      <div className="rb-tabs" style={{ marginTop: 4 }}>
        {tanks.map((t) => (
          <div key={t.id} className={"rb-chip" + (t.id === tankId ? " on" : "")} onClick={() => switchTank(t.id)}>
            {t.name} <span style={{ opacity: .65, fontSize: 11 }}>· {t.volume}g</span>
          </div>
        ))}
        {createTank && (
          <div className="rb-chip" style={{ borderStyle: "dashed", color: "var(--aqua)", borderColor: "var(--brd-2)" }} onClick={() => setAddOpen(true)}>
            <Plus size={13} style={{ verticalAlign: -2, marginRight: 3 }} />Add tank
          </div>
        )}
      </div>
      {addOpen && createTank && <NewTankSheet onClose={() => setAddOpen(false)} onCreate={createTank} />}
    </>
  );
}

/* ---------------- Tank (home) ---------------- */
function TankHome({ state, latest, issues, go, setSheet, switchTank, createTank }) {
  const t = state.tank;
  // Health from each parameter's LAST KNOWN value, weighted by real reef impact
  // (temp/salinity/alk swings hurt far more than a slightly-off magnesium).
  const known = PARAMS.map((p) => ({ p, lv: lastVal(state.history, p.key) })).filter((x) => x.lv);
  const totalW = known.reduce((a, { p }) => a + (p.w || 1), 0);
  const health = known.length
    ? Math.round((known.reduce((a, { p, lv }) => {
        const score = statusOf(p, lv.v) === "good" ? 1 : statusOf(p, lv.v) === "warn" ? 0.6 : 0.2;
        return a + score * (p.w || 1);
      }, 0) / totalW) * 100)
    : null;
  // Health band: label + color from the score.
  const healthBand = health == null ? null
    : health >= 85 ? { label: "Excellent", color: "#3ce0a3" }
    : health >= 70 ? { label: "Good", color: "#5fd0a0" }
    : health >= 55 ? { label: "Fair", color: "#ffc24d" }
    : health >= 40 ? { label: "Watch", color: "#ff9d3c" }
    : { label: "Needs care", color: "#ff5d72" };
  const nextTasks = [...state.tasks].sort((a, b) => a.due - b.due).slice(0, 2);
  const lastLog = state.log[0];
  return (
    <div className="rb-fadein">
      <TankSwitcher tanks={state.tanks} tankId={state.tankId} switchTank={switchTank} createTank={createTank} />
      <div className="rb-tankhero" style={{ marginTop: 4, height: 190 }}>
        <div className="light" /><div className="rock" />
        <div className="rb-coralbit" style={{ bottom: "38%", left: "30%", width: 16, height: 22, background: "#ff7a5c", borderRadius: "50% 50% 4px 4px" }} />
        <div className="rb-coralbit" style={{ bottom: "40%", left: "58%", width: 20, height: 14, background: "#3ce0a3" }} />
        <div className="rb-coralbit" style={{ bottom: "36%", left: "46%", width: 12, height: 18, background: "#ffc24d", borderRadius: 6 }} />
        <div style={{ position: "absolute", left: 16, bottom: 14 }}>
          <div style={{ fontFamily: "Bricolage Grotesque", fontWeight: 800, fontSize: 24, letterSpacing: "-.5px" }}>{t.name}</div>
          <div style={{ color: "var(--muted)", fontSize: 12.5 }}>{t.model} · {t.volume} gal · est. {t.since}</div>
        </div>
        <div style={{ position: "absolute", right: 16, bottom: 14, textAlign: "right" }}>
          <div style={{ fontSize: 9.5, color: "var(--muted)", letterSpacing: 1.2, marginBottom: 1 }}>HEALTH</div>
          <div style={{ fontFamily: "Bricolage Grotesque", fontWeight: 800, fontSize: 34, lineHeight: 1,
            ...(healthBand
              ? { color: healthBand.color }
              : { background: "linear-gradient(120deg,var(--aqua),var(--teal))", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }) }}>
            {health == null ? "—" : health}
          </div>
          {healthBand && (
            <div style={{ fontSize: 11, fontWeight: 700, color: healthBand.color, letterSpacing: .3, marginTop: 3 }}>{healthBand.label}</div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <button className="rb-btn" style={{ flex: 1, padding: 13 }} onClick={() => setSheet("log")}><Beaker size={16} /> Log test</button>
        <button className="rb-btn ghost" style={{ flex: 1, padding: 13 }} onClick={() => go("log")}><Notebook size={16} /> Journal</button>
        <button className="rb-btn violet" style={{ flex: 1, padding: 13 }} onClick={() => go("deepdive")}><Bot size={16} /> Ask AI</button>
        {state.tank && state.tank.is_public !== false && (
          <button className="rb-btn" style={{ flex: "none", padding: "13px 15px" }} title="Share a public link to this tank"
            onClick={async () => {
              const url = `${window.location.origin}/?tank=${state.tankId}`;
              try {
                if (navigator.share) await navigator.share({ title: `${state.tank.name} on Tidepool Reef`, url });
                else { await navigator.clipboard.writeText(url); alert("Tank link copied — anyone with the app can view your public tank."); }
              } catch (e) {}
            }}><Send size={16} /></button>
        )}
      </div>

      <div className="rb-h2"><FlaskConical size={16} color="var(--aqua)" /> Latest parameters
        <small>{latest ? fmtDate(latest.date) : "none yet"}</small></div>
      {!latest ? (
        <div className="rb-card rb-empty" style={{ padding: "26px 18px" }}>
          No readings yet — tap <b style={{ color: "var(--text)" }}>Log test</b> above to start tracking. Charts, health, and AI diagnosis all build from your readings.
        </div>
      ) : (
        <div className="rb-hscroll">
          {PARAMS.map((p) => {
            const lv = lastVal(state.history, p.key);
            const st = lv ? statusOf(p, lv.v) : "none";
            return (
              <div key={p.key} className="rb-card" style={{ flex: "none", width: 108, padding: "11px 12px", cursor: "pointer", scrollSnapAlign: "start" }} onClick={() => go("log")}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>{p.label}</span>{lv && <span className={"rb-sdot " + sclass[st]} />}
                </div>
                <div style={{ fontFamily: "Bricolage Grotesque", fontWeight: 700, fontSize: 18, marginTop: 5 }}>
                  {lv ? lv.v : "—"}<span style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 500, marginLeft: 2 }}>{lv ? p.unit : ""}</span>
                </div>
                {lv && lv.date !== (latest && latest.date) && (
                  <div style={{ fontSize: 9.5, color: "var(--muted-2)", marginTop: 2 }}>{fmtDate(lv.date)}</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {issues.length > 0 && (<>
        <div className="rb-h2"><Bell size={16} color="var(--coral)" /> Needs attention <small>{issues.length} flag{issues.length > 1 ? "s" : ""}</small></div>
        <div className="rb-card">
          {issues.map((p) => {
            const st = p._drift ? "warn" : statusOf(p, (lastVal(state.history, p.key) || {}).v);
            return (
              <div key={p.key} className="rb-li" onClick={() => go("log")} style={{ cursor: "pointer" }}>
                <div className="rb-thumb" style={{ background: `linear-gradient(140deg,var(--${st === "bad" ? "bad" : "warn"}),#0b2b3d)` }}>{p._drift ? <TrendingUp size={20} color="#04111a" /> : <Droplets size={20} color="#04111a" />}</div>
                <div><div className="nm">{p.label} {p._drift ? "trending" : "drifting"}</div><div className="sub">{p._drift ? p._driftMsg : `${(lastVal(state.history, p.key) || {}).v} ${p.unit} · target ${p.ideal[0]}–${p.ideal[1]}`}</div></div>
                <ChevronRight size={18} color="var(--muted)" style={{ marginLeft: "auto" }} />
              </div>
            );
          })}
        </div>
      </>)}

      {(() => {
        // Livestock anniversaries — today + coming up this week (1+ years).
        const now = new Date(); const today = [now.getMonth(), now.getDate()];
        const soonMs = 7 * 86400000;
        const annivs = state.livestock.filter((l) => (l.status || "alive") === "alive" && l.acquiredAt).map((l) => {
          const d = new Date(l.acquiredAt + "T00:00");
          const yrs = now.getFullYear() - d.getFullYear();
          if (yrs < 1) return null;
          const thisYear = new Date(now.getFullYear(), d.getMonth(), d.getDate());
          const diff = thisYear.getTime() - now.setHours(0,0,0,0);
          if (d.getMonth() === today[0] && d.getDate() === today[1]) return { l, yrs, today: true };
          if (diff > 0 && diff <= soonMs) return { l, yrs, days: Math.ceil(diff / 86400000) };
          return null;
        }).filter(Boolean);
        if (!annivs.length) return null;
        return (
          <div className="rb-card" style={{ padding: "13px 16px", marginBottom: 14, border: "1px solid rgba(255,194,77,.35)", background: "rgba(255,194,77,.06)" }}>
            {annivs.map(({ l, yrs, today: isToday, days }) => (
              <div key={l.id} style={{ fontSize: 13.5, lineHeight: 1.7 }}>
                🎉 {isToday
                  ? <><b>{yrs} year{yrs > 1 ? "s" : ""}</b> with your <b>{l.name}</b> today!</>
                  : <><b>{l.name}</b> hits <b>{yrs} year{yrs > 1 ? "s" : ""}</b> in {days} day{days > 1 ? "s" : ""}</>}
              </div>
            ))}
          </div>
        );
      })()}

      <div className="rb-cols2">
        <div>
          <div className="rb-h2"><Calendar size={16} color="var(--aqua)" /> Up next <small onClick={() => go("tasks")} style={{ cursor: "pointer", color: "var(--aqua)" }}>manage tasks ›</small></div>
          <div className="rb-card">
            {nextTasks.length === 0 && (
              <div className="rb-empty" style={{ padding: 20 }}>
                No tasks yet — <span style={{ color: "var(--aqua)", cursor: "pointer" }} onClick={() => go("tasks")}>build a schedule</span> or let DeepDive suggest one.
              </div>
            )}
            {nextTasks.map((tk) => {
              const d = dueLabel(tk.due);
              return (
                <div key={tk.id} className="rb-li" onClick={() => go("tasks")} style={{ cursor: "pointer" }}>
                  <div className="rb-thumb" style={{ background: "linear-gradient(140deg,var(--aqua),var(--teal))" }}><Clock size={20} color="#04111a" /></div>
                  <div><div className="nm">{tk.name}</div><div className={"sub " + d.c}>{d.t} · {tk.every}</div></div>
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <div className="rb-h2"><Notebook size={16} color="var(--teal)" /> Last journal entry <small onClick={() => go("log")} style={{ cursor: "pointer" }}>open log ›</small></div>
          <div className="rb-card">
            {!lastLog ? <div className="rb-empty">No entries yet — water changes, additions, and observations live here.</div> : (
              <div className="rb-li" style={{ alignItems: "flex-start" }}>
                <div className="rb-thumb" style={{ background: "linear-gradient(140deg,var(--teal),#0b2b3d)" }}><Notebook size={18} color="#04111a" /></div>
                <div><div className="nm">{lastLog.type} <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: 12 }}>· {fmtDate(lastLog.date)}</span></div>
                  <div className="sub" style={{ lineHeight: 1.45 }}>{lastLog.note}</div></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Log (parameters + journal + livestock) ---------------- */
function LogView({ state, latest, sel, setSel, addLivestock, endLivestock, addLogEntry, switchTank, go, uid, profile }) {
  const [tab, setTab] = useState("params");
  return (
    <div className="rb-fadein">
      <TankSwitcher tanks={state.tanks} tankId={state.tankId} switchTank={switchTank} />
      <div className="rb-tabs" style={{ marginTop: 4 }}>
        {[["params", "Parameters"], ["journal", "Journal"], ["livestock", "Livestock"]].map(([k, lbl]) => (
          <div key={k} className={"rb-chip" + (tab === k ? " on" : "")} onClick={() => setTab(k)}>{lbl}</div>
        ))}
      </div>
      {tab === "params" && <Tracker {...{ state, latest, sel, setSel, addLivestock }} hideLivestock />}
      {tab === "journal" && <TankLog {...{ state, addLogEntry, go }} />}
      {tab === "livestock" && <Tracker {...{ state, latest, sel, setSel, addLivestock, endLivestock, uid, profile }} livestockOnly />}
    </div>
  );
}

/* ---------------- Profile ---------------- */
/* ---------------- Upgrade (paywall) ---------------- */
function UpgradeSheet({ open, onClose, profile }) {
  const [busy, setBusy] = useState(false);
  if (!open) return null;
  const buy = async (plan) => {
    setBusy(true);
    try {
      let token = null;
      try { const { data } = await supabase.auth.getSession(); token = data.session && data.session.access_token; } catch (e) {}
      const r = await fetch("/api/checkout", { method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) },
        body: JSON.stringify({ plan, uid: profile.id, handle: profile.handle }) });
      const d = await r.json();
      if (d && d.url) { window.location.href = d.url; return; }
      alert(d && d.error ? d.error : "Payments are launching soon — hang tight!");
    } catch (e) { alert("Payments are launching soon — hang tight!"); }
    setBusy(false);
  };
  const perk = (t) => (
    <div style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13.5, marginTop: 8 }}>
      <Check size={15} color="var(--good)" style={{ flex: "none" }} /> {t}
    </div>
  );
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(2,6,10,.78)", backdropFilter: "blur(6px)",
      display: "grid", placeItems: "center", padding: 18 }} onClick={onClose}>
      <div className="rb-card" style={{ maxWidth: 420, width: "100%", padding: 22, border: "1px solid rgba(176,108,255,.4)" }}
        onClick={(e) => e.stopPropagation()}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 34 }}>🤿</div>
          <div style={{ fontFamily: "Bricolage Grotesque", fontWeight: 800, fontSize: 21, marginTop: 6 }}>Tidepool <span style={{ color: "var(--violet)" }}>Pro</span></div>
          <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 5 }}>You've used your free AI taste — unlock the full reef brain.</div>
        </div>
        <div style={{ margin: "14px 0 4px" }}>
          {perk("Unlimited DeepDive — AI that knows YOUR tank")}
          {perk("Unlimited ReefID photo identification")}
          {perk("AI chart summaries on any date range")}
          {perk("AI task scheduling")}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button className="rb-btn ghost" style={{ flex: 1, flexDirection: "column", padding: 13, gap: 2 }} disabled={busy} onClick={() => buy("monthly")}>
            <b style={{ fontSize: 16 }}>$6.99</b><span style={{ fontSize: 11, color: "var(--muted)" }}>per month</span>
          </button>
          <button className="rb-btn" style={{ flex: 1.15, flexDirection: "column", padding: 13, gap: 2, position: "relative" }} disabled={busy} onClick={() => buy("annual")}>
            <span style={{ position: "absolute", top: -9, right: 10, fontSize: 9.5, fontWeight: 800, background: "var(--violet)", color: "#fff", padding: "2px 8px", borderRadius: 20 }}>SAVE 40%</span>
            <b style={{ fontSize: 16 }}>$49.99</b><span style={{ fontSize: 11, opacity: .8 }}>per year</span>
          </button>
        </div>
        <div style={{ textAlign: "center", fontSize: 11.5, color: "var(--muted-2)", marginTop: 12, cursor: "pointer" }} onClick={onClose}>Maybe later</div>
      </div>
    </div>
  );
}

/* ---------------- Admin ---------------- */
function AdminUsers({ state }) {
  const [users, setUsers] = useState(null);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [planF, setPlanF] = useState("all");     // all | pro | free
  const [sort, setSort] = useState("newest");    // newest | active | pearls
  const [sel, setSel] = useState(null);          // selected user for detail
  const [detail, setDetail] = useState(null);

  const [total, setTotal] = useState(0);
  const PAGE = 50;
  const load = async (append = false, off = 0) => {
    const { data, error } = await supabase.rpc("admin_list_users", {
      q: q.trim() || null,
      f_status: null,
      f_plan: planF === "all" ? null : planF,
      sort: sort === "pearls" ? "newest" : sort,
      lim: PAGE, off,
    });
    if (error) { setErr(error.message); return; }
    setTotal((data && data.total) || 0);
    setUsers((prev) => append ? [...(prev || []), ...(data.users || [])] : (data.users || []));
  };
  useEffect(() => { const t = setTimeout(() => load(), q ? 300 : 0); return () => clearTimeout(t); }, [q, planF, sort]);

  useEffect(() => {
    if (!sel) { setDetail(null); return; }
    let alive = true;
    supabase.rpc("admin_user_detail", { target: sel.id }).then(({ data, error }) => {
      if (error) console.error("admin_user_detail:", error.message);
      if (alive) setDetail(data || {});
    });
    return () => { alive = false; };
  }, [sel && sel.id]);

  const setPlan = async (u, plan) => {
    const { error } = await supabase.rpc("admin_set_plan", { target: u.id, new_plan: plan });
    if (error) { alert(error.message); return; }
    setUsers((list) => list.map((x) => x.id === u.id ? { ...x, plan } : x));
    if (sel && sel.id === u.id) setSel({ ...sel, plan });
  };
  const setStatus = async (u, status) => {
    const verb = status === "banned" ? "suspend" : "reinstate";
    if (!confirm(`Are you sure you want to ${verb} @${u.handle}?`)) return;
    const { error } = await supabase.rpc("admin_set_status", { target: u.id, new_status: status });
    if (error) { alert(error.message); return; }
    setUsers((list) => list.map((x) => x.id === u.id ? { ...x, status } : x));
    if (sel && sel.id === u.id) setSel({ ...sel, status });
  };
  const deleteUser = async (u) => {
    if (!confirm(`Permanently delete @${u.handle} and all their data? This can't be undone.`)) return;
    if (!confirm(`Really delete @${u.handle}? Final confirmation.`)) return;
    const { error } = await supabase.rpc("admin_delete_user", { target: u.id });
    if (error) { alert(error.message); return; }
    setUsers((list) => list.filter((x) => x.id !== u.id));
    setSel(null);
  };
  const resetAi = async (u) => {
    if (!confirm(`Reset @${u.handle}'s free AI counters to 0/0?`)) return;
    const { error } = await supabase.rpc("admin_reset_ai", { target: u.id });
    if (error) { alert(error.message); return; }
    if (sel && sel.id === u.id) setSel({ ...sel, deepdive_used: 0, reefid_used: 0 });
    setDetail((d) => d ? { ...d, deepdive_used: 0, reefid_used: 0 } : d);
    alert(`@${u.handle} reset — 5 DeepDives and 3 ReefIDs available again.`);
  };
  const deletePost = async (pid) => {
    if (!confirm("Delete this post?")) return;
    const { error } = await supabase.rpc("admin_delete_post", { pid });
    if (error) { alert(error.message); return; }
    setDetail((d) => d ? { ...d, recent_posts: (d.recent_posts || []).filter((p) => p.id !== pid), posts_count: (d.posts_count || 1) - 1 } : d);
  };

  if (err) return <div className="rb-card rb-empty" style={{ padding: 30 }}>Admin error: {err}</div>;
  if (!users) return <div className="rb-empty" style={{ padding: 40 }}>Loading users…</div>;

  const pro = users.filter((u) => u.plan === "pro").length;
  const mrr = (pro * 6.99).toFixed(0);
  const shown = sort === "pearls" ? [...users].sort((a, b) => (b.pearls || 0) - (a.pearls || 0)) : users;
  const fmtD = (d) => d ? new Date(d).toLocaleDateString() : "never";

  return (
    <div>
      {/* stats */}
      <div className="rb-card" style={{ display: "flex", justifyContent: "space-around", padding: 14, textAlign: "center", marginTop: 4, flexWrap: "wrap", gap: 8 }}>
        <div className="rb-stat"><div className="v">{total}</div><div className="k">Users</div></div>
        <div className="rb-stat"><div className="v">{pro}</div><div className="k">Pro</div></div>
        <div className="rb-stat"><div className="v">${mrr}</div><div className="k">Est. MRR</div></div>
        <div className="rb-stat"><div className="v">{users.reduce((a, u) => a + (u.reefid_used || 0), 0)}</div><div className="k">ReefIDs</div></div>
        <div className="rb-stat"><div className="v">{users.reduce((a, u) => a + (u.deepdive_used || 0), 0)}</div><div className="k">AI msgs</div></div>
      </div>

      {/* search + filters */}
      <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center", flexWrap: "wrap" }}>
        <input className="rb-input" placeholder="Search handle, name, or email…" value={q} onChange={(e) => setQ(e.target.value)} style={{ flex: "1 1 220px" }} />
      </div>
      <div className="rb-tabs" style={{ margin: "10px 0 4px", flexWrap: "wrap" }}>
        {[["all", "All"], ["pro", "Pro"], ["free", "Free"]].map(([k, l]) => (
          <div key={k} className={"rb-chip" + (planF === k ? " on" : "")} onClick={() => setPlanF(k)}>{l}</div>
        ))}
        <span style={{ width: 10 }} />
        {[["newest", "Newest"], ["active", "Most active"], ["pearls", "Pearls"]].map(([k, l]) => (
          <div key={k} className={"rb-chip" + (sort === k ? " on" : "")} onClick={() => setSort(k)}>{l}</div>
        ))}
      </div>

      <div className="rb-h2"><Users size={16} color="var(--aqua)" /> Users <small>{shown.length} of {users.length}</small></div>
      <div className="rb-card">
        {shown.length === 0 && <div className="rb-empty" style={{ padding: 24 }}>No users match.</div>}
        {shown.map((u) => (
          <div key={u.id} className="rb-li" style={{ alignItems: "center", cursor: "pointer" }} onClick={() => setSel(u)}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="nm">@{u.handle} {u.is_admin && <span style={{ color: "var(--gold)", fontSize: 10.5 }}>ADMIN</span>}</div>
              <div className="sub" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.email || "—"}</div>
              <div style={{ fontSize: 10.5, color: "var(--muted-2)", marginTop: 2 }}>
                joined {fmtD(u.joined || u.created_at)} · seen {fmtD(u.last_seen_at)} · {u.reefid_used || 0} IDs · {u.deepdive_used || 0} AI · {u.pearls || 0} pearls
              </div>
            </div>
            <span className="rb-badge" style={{ flex: "none", background: u.plan === "pro" ? "rgba(46,230,200,.15)" : "rgba(255,255,255,.05)",
              color: u.plan === "pro" ? "var(--teal)" : "var(--muted)", border: `1px solid ${u.plan === "pro" ? "rgba(46,230,200,.4)" : "var(--brd)"}` }}>
              {u.plan === "pro" ? "PRO" : "Free"}
            </span>
            <ChevronRight size={17} color="var(--muted)" style={{ flex: "none" }} />
          </div>
        ))}
      </div>
      {users.length < total && (
        <button className="rb-btn ghost" style={{ width: "100%", marginTop: 10, padding: 11, fontSize: 13 }}
          onClick={() => load(true, users.length)}>Load more ({users.length} of {total})</button>
      )}

      {/* customer detail — portal so it can't be trapped by animated ancestors */}
      {sel && createPortal(
        <div style={{ position: "fixed", inset: 0, zIndex: 320, background: "rgba(2,6,10,.78)", backdropFilter: "blur(6px)", display: "grid", placeItems: "center", padding: 16 }} onClick={() => setSel(null)}>
          <div className="rb-card" style={{ maxWidth: 520, width: "100%", maxHeight: "86vh", overflowY: "auto", padding: 20 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div>
                <div style={{ fontFamily: "Bricolage Grotesque", fontWeight: 800, fontSize: 19 }}>@{sel.handle} {sel.is_admin && <span style={{ color: "var(--gold)", fontSize: 11 }}>ADMIN</span>}</div>
                <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{sel.email || "—"} · joined {fmtD(sel.joined || sel.created_at)}</div>
              </div>
              <button className={"rb-btn" + (sel.plan === "pro" ? "" : " ghost")} style={{ marginLeft: "auto", flex: "none", padding: "8px 14px", fontSize: 12 }}
                onClick={() => setPlan(sel, sel.plan === "pro" ? "free" : "pro")}>
                {sel.plan === "pro" ? "PRO ✓" : "Grant Pro"}
              </button>
            </div>

            {!sel.is_admin && (
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                {sel.status === "banned" ? (
                  <button className="rb-btn ghost" style={{ flex: 1, padding: "9px 0", fontSize: 12.5 }} onClick={() => setStatus(sel, "active")}>Reinstate</button>
                ) : (
                  <button className="rb-btn ghost" style={{ flex: 1, padding: "9px 0", fontSize: 12.5, color: "#ffb43c", borderColor: "rgba(255,180,60,.4)" }} onClick={() => setStatus(sel, "banned")}>Suspend</button>
                )}
                <button className="rb-btn ghost" style={{ flex: 1, padding: "9px 0", fontSize: 12.5, color: "var(--aqua)" }} onClick={() => resetAi(sel)}>Reset AI</button>
                <button className="rb-btn" style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "rgba(255,93,114,.15)", color: "#ff8fa0", border: "1px solid rgba(255,93,114,.4)" }} onClick={() => deleteUser(sel)}>Delete user</button>
              </div>
            )}
            {sel.status === "banned" && <div style={{ fontSize: 12, color: "#ffb43c", marginTop: 8, fontWeight: 600 }}>⚠ This account is suspended.</div>}

            {!detail && <div className="rb-empty" style={{ padding: 26 }}>Loading detail…</div>}
            {detail && (<>
              <div className="rb-card" style={{ display: "flex", justifyContent: "space-around", padding: 12, textAlign: "center", marginTop: 14, background: "var(--bg-2)" }}>
                <div className="rb-stat"><div className="v">{(detail.tanks || []).length}</div><div className="k">Tanks</div></div>
                <div className="rb-stat"><div className="v">{detail.livestock || 0}</div><div className="k">Livestock</div></div>
                <div className="rb-stat"><div className="v">{detail.readings || 0}</div><div className="k">Readings</div></div>
                <div className="rb-stat"><div className="v">{detail.posts_count || 0}</div><div className="k">Posts</div></div>
                <div className="rb-stat"><div className="v">{detail.listings || 0}</div><div className="k">Listings</div></div>
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 10 }}>
                Usage: {sel.reefid_used || 0} ReefIDs · {sel.deepdive_used || 0} AI msgs · {sel.pearls || 0} pearls<br />
                Last reading: {fmtD(detail.last_reading)} · Last post: {fmtD(detail.last_post)}
              </div>
              {(detail.tanks || []).length > 0 && (<>
                <div style={{ fontWeight: 700, fontSize: 13.5, margin: "14px 0 6px" }}>Tanks</div>
                {(detail.tanks || []).map((t, i) => (
                  <div key={i} style={{ fontSize: 12.5, color: "var(--muted)", padding: "3px 0" }}>• {t.name} — {t.model || "?"} · {t.gal || "?"} gal</div>
                ))}
              </>)}
              {(detail.recent_posts || []).length > 0 && (<>
                <div style={{ fontWeight: 700, fontSize: 13.5, margin: "14px 0 6px" }}>Recent posts <span style={{ fontWeight: 400, color: "var(--muted-2)", fontSize: 11 }}>(tap ✕ to moderate)</span></div>
                {(detail.recent_posts || []).map((p) => (
                  <div key={p.id} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "6px 0", borderTop: "1px solid var(--brd)" }}>
                    <div style={{ flex: 1, fontSize: 12.5, color: "var(--muted)" }}><b style={{ color: "var(--text)" }}>{p.tag}</b> — {p.body}</div>
                    <span style={{ color: "var(--bad)", cursor: "pointer", fontWeight: 700, flex: "none" }} onClick={() => deletePost(p.id)}>✕</span>
                  </div>
                ))}
              </>)}
            </>)}
            <div style={{ textAlign: "center", fontSize: 12, color: "var(--muted-2)", marginTop: 16, cursor: "pointer" }} onClick={() => setSel(null)}>Close</div>
          </div>
        </div>, document.body)}
    </div>
  );
}

/* ---------------- Admin CRM ---------------- */
function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    supabase.rpc("admin_platform_stats").then(({ data, error }) => {
      if (error) setErr(error.message); else setStats(data);
    });
  }, []);
  if (err) return <div className="rb-card rb-empty" style={{ padding: 26 }}>Error: {err}</div>;
  if (!stats) return <div className="rb-empty" style={{ padding: 36 }}>Loading platform stats…</div>;
  const t = stats.totals || {};
  const weeks = stats.weeks || [];
  const kpis = [
    ["Users", t.users, "🧑‍🤝‍🧑"], ["Active today", t.active1, "🟢"], ["Active 7d", t.active7, "📆"],
    ["Pro subs", t.pro, "⭐"], ["Est. MRR", "$" + (t.pro * 6.99).toFixed(0), "💵"],
    ["Tanks", t.tanks, "🪣"], ["Readings", t.readings, "🧪"], ["Posts", t.posts, "💬"],
    ["Comments", t.comments, "↩️"], ["Listings", t.listings, "🏪"], ["ReefIDs", t.reefids, "📸"], ["AI msgs", t.aimsgs, "🤖"],
    ["AI threads", t.threads, "🧵"], ["Events", t.events, "📅"], ["Wishlists", t.wishes, "❤️"], ["Photo queue", t.photoq, "🖼️"], ["Open reports", t.reportsq, "⚑"],
  ];
  const chart = (key, color, label) => (
    <div className="rb-card rb-chartwrap" style={{ marginTop: 12 }}>
      <div className="rb-chart-h"><b>{label}</b><span style={{ fontSize: 11, color: "var(--muted)" }}>last 10 weeks</span></div>
      <ResponsiveContainer width="100%" height={150}>
        <LineChart data={weeks} margin={{ top: 8, right: 14, left: -14, bottom: 4 }}>
          <CartesianGrid stroke="rgba(255,255,255,.05)" vertical={false} />
          <XAxis dataKey="wk" stroke="var(--muted-2)" fontSize={10} tickLine={false} axisLine={false} minTickGap={22} />
          <YAxis stroke="var(--muted-2)" fontSize={10} tickLine={false} axisLine={false} width={34} allowDecimals={false} />
          <Tooltip content={({ active, payload }) => active && payload && payload.length ? (
            <div style={{ background: "var(--bg-2)", border: "1px solid var(--brd-2)", borderRadius: 10, padding: "6px 10px", fontSize: 12 }}>
              <div style={{ color: "var(--muted)" }}>{payload[0].payload.wk}</div>
              <div style={{ fontWeight: 700, color }}>{payload[0].value}</div>
            </div>) : null} />
          <Line type="monotone" dataKey={key} stroke={color} strokeWidth={2.5} dot={{ r: 2.5, fill: color }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: 8, marginTop: 4 }}>
        {kpis.map(([k, v, ic]) => (
          <div key={k} className="rb-card" style={{ padding: "10px 8px", textAlign: "center" }}>
            <div style={{ fontSize: 16 }}>{ic}</div>
            <div style={{ fontFamily: "Bricolage Grotesque", fontWeight: 800, fontSize: 17, marginTop: 2 }}>{v ?? 0}</div>
            <div style={{ fontSize: 10, color: "var(--muted)" }}>{k}</div>
          </div>
        ))}
      </div>
      {chart("signups", "var(--aqua)", "New signups")}
      {chart("readings", "var(--teal)", "Parameter readings logged")}
      {chart("posts", "var(--violet)", "Community posts")}
      {chart("aithreads", "#8f5cd6", "AI conversations started")}
      <div style={{ textAlign: "center", fontSize: 11.5, color: "var(--muted-2)", margin: "16px 0 4px" }}>
        Build v{APP_VERSION} · {APP_VERSION.startsWith("0.") ? "pre-launch — 1.0 ships at public launch" : "production"}
      </div>
    </div>
  );
}

function AdminContent() {
  const [data, setData] = useState(null);
  const [evl, setEvl] = useState(null);   // events + listings moderation
  const [err, setErr] = useState("");
  const load = () => {
    supabase.rpc("admin_recent_content").then(({ data: d, error }) => {
      if (error) setErr(error.message); else setData(d);
    });
    supabase.rpc("admin_recent_events_listings").then(({ data: d, error }) => {
      if (!error) setEvl(d);
    });
  };
  useEffect(() => { load(); }, []);
  const delEvent = async (id) => {
    if (!confirm("Delete this event (and its RSVPs)?")) return;
    const { error } = await supabase.rpc("admin_delete_event", { eid: id });
    if (error) return alert(error.message);
    setEvl((d) => ({ ...d, events: d.events.filter((e) => e.id !== id) }));
  };
  const delListing = async (id) => {
    if (!confirm("Delete this listing?")) return;
    const { error } = await supabase.rpc("admin_delete_listing", { lid: id });
    if (error) return alert(error.message);
    setEvl((d) => ({ ...d, listings: d.listings.filter((l) => l.id !== id) }));
  };
  const delPost = async (id) => {
    if (!confirm("Delete this post?")) return;
    const { error } = await supabase.rpc("admin_delete_post", { pid: id });
    if (error) return alert(error.message);
    setData((d) => ({ ...d, posts: d.posts.filter((p) => p.id !== id) }));
  };
  const delComment = async (id) => {
    if (!confirm("Delete this comment?")) return;
    const { error } = await supabase.rpc("admin_delete_comment", { cid: id });
    if (error) return alert(error.message);
    setData((d) => ({ ...d, comments: d.comments.filter((c) => c.id !== id) }));
  };
  if (err) return <div className="rb-card rb-empty" style={{ padding: 26 }}>Error: {err}</div>;
  if (!data) return <div className="rb-empty" style={{ padding: 36 }}>Loading content…</div>;
  const row = (item, body, onDel) => (
    <div key={item.id} style={{ display: "flex", gap: 9, alignItems: "flex-start", padding: "9px 0", borderTop: "1px solid var(--brd)" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5 }}><b>@{item.handle}</b> <span style={{ color: "var(--muted-2)", fontSize: 10.5 }}>{new Date(item.created_at).toLocaleString()}</span></div>
        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>{body}</div>
      </div>
      <span style={{ color: "var(--bad)", cursor: "pointer", fontWeight: 700, flex: "none" }} onClick={onDel}>✕</span>
    </div>
  );
  return (
    <div>
      <div className="rb-h2" style={{ marginTop: 6 }}>💬 Recent posts <small>{data.posts.length}</small></div>
      <div className="rb-card" style={{ padding: "4px 14px 10px" }}>
        {data.posts.length === 0 && <div className="rb-empty" style={{ padding: 20 }}>No posts yet.</div>}
        {data.posts.map((p) => row(p, <><b style={{ color: "var(--text)" }}>{p.tag}</b> — {p.body}</>, () => delPost(p.id)))}
      </div>
      <div className="rb-h2">↩️ Recent comments <small>{data.comments.length}</small></div>
      <div className="rb-card" style={{ padding: "4px 14px 10px" }}>
        {data.comments.length === 0 && <div className="rb-empty" style={{ padding: 20 }}>No comments yet.</div>}
        {data.comments.map((c) => row(c, c.body, () => delComment(c.id)))}
      </div>
      <div className="rb-h2" style={{ marginTop: 18 }}>📅 Upcoming events <small>{evl ? evl.events.length : "…"}</small></div>
      <div className="rb-card">
        {evl && evl.events.length === 0 && <div className="rb-empty" style={{ padding: 16 }}>No upcoming events.</div>}
        {evl && evl.events.map((e) => (
          <div key={e.id} className="rb-li" style={{ alignItems: "flex-start" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="nm">{e.title} <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: 12 }}>· {e.date}</span></div>
              <div className="sub">@{e.host} · {e.location || "no location"} · {e.rsvps} going</div>
            </div>
            <span style={{ color: "var(--muted-2)", padding: 8, flex: "none", cursor: "pointer" }} onClick={() => delEvent(e.id)}><Trash2 size={15} /></span>
          </div>
        ))}
      </div>

      <div className="rb-h2" style={{ marginTop: 18 }}>🏪 Recent listings <small>{evl ? evl.listings.length : "…"}</small></div>
      <div className="rb-card">
        {evl && evl.listings.length === 0 && <div className="rb-empty" style={{ padding: 16 }}>No listings.</div>}
        {evl && evl.listings.map((l) => (
          <div key={l.id} className="rb-li" style={{ alignItems: "flex-start" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="nm">{l.title} <span style={{ color: "var(--aqua)", fontWeight: 600, fontSize: 12 }}>${l.price}</span></div>
              <div className="sub">@{l.seller} · {fmtDate(new Date(l.created).getTime())}</div>
            </div>
            <span style={{ color: "var(--muted-2)", padding: 8, flex: "none", cursor: "pointer" }} onClick={() => delListing(l.id)}><Trash2 size={15} /></span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminMarket() {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    supabase.rpc("admin_listings").then(({ data, error }) => {
      if (error) setErr(error.message); else setRows(data || []);
    });
  }, []);
  const setStatus = async (l, status) => {
    const { error } = await supabase.rpc("admin_set_listing_status", { lid: l.id, new_status: status });
    if (error) return alert(error.message);
    setRows((r) => r.map((x) => x.id === l.id ? { ...x, status } : x));
  };
  if (err) return <div className="rb-card rb-empty" style={{ padding: 26 }}>Error: {err}</div>;
  if (!rows) return <div className="rb-empty" style={{ padding: 36 }}>Loading listings…</div>;
  return (
    <div>
      <div className="rb-h2" style={{ marginTop: 6 }}>🏪 Listings <small>{rows.length}</small></div>
      <div className="rb-card">
        {rows.length === 0 && <div className="rb-empty" style={{ padding: 22 }}>No listings.</div>}
        {rows.map((l) => (
          <div key={l.id} className="rb-li" style={{ alignItems: "center" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="nm" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.title}</div>
              <div className="sub">@{l.handle} · {l.category} · ${l.price_usd}</div>
            </div>
            <span className="rb-badge" style={{ flex: "none", fontSize: 10.5,
              background: l.status === "active" ? "rgba(46,230,200,.15)" : "rgba(255,93,114,.12)",
              color: l.status === "active" ? "var(--teal)" : "var(--bad)",
              border: `1px solid ${l.status === "active" ? "rgba(46,230,200,.4)" : "rgba(255,93,114,.35)"}` }}>{l.status}</span>
            {l.status === "active"
              ? <button className="rb-btn ghost" style={{ flex: "none", padding: "6px 11px", fontSize: 11.5 }} onClick={() => setStatus(l, "removed")}>Remove</button>
              : <button className="rb-btn ghost" style={{ flex: "none", padding: "6px 11px", fontSize: 11.5 }} onClick={() => setStatus(l, "active")}>Restore</button>}
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminReports() {
  const [reports, setReports] = useState(null);
  const load = () => supabase.rpc("admin_list_reports").then(({ data, error }) => { if (!error) setReports(data || []); });
  useEffect(() => { load(); }, []);
  const resolve = async (r, status) => {
    await supabase.rpc("admin_resolve_report", { rid: r.id, new_status: status });
    load();
  };
  const nuke = async (r) => {
    if (!confirm(`Delete the reported ${r.type}?`)) return;
    const rpcMap = { post: ["admin_delete_post", "pid"], comment: ["admin_delete_comment", "cid"], listing: ["admin_delete_listing", "lid"], event: ["admin_delete_event", "eid"] };
    const m = rpcMap[r.type];
    if (m) { const { error } = await supabase.rpc(m[0], { [m[1]]: r.target_id }); if (error) return alert(error.message); }
    await resolve(r, "resolved");
  };
  const suspend = async (r) => {
    if (!r.author_id || !confirm("Suspend the author of this content?")) return;
    const { error } = await supabase.rpc("admin_set_status", { target: r.author_id, new_status: "banned" });
    if (error) return alert(error.message);
    await resolve(r, "resolved");
  };
  if (!reports) return <div className="rb-empty" style={{ padding: 36 }}>Loading reports…</div>;
  const open = reports.filter((r) => r.status === "open");
  const closed = reports.filter((r) => r.status !== "open");
  const row = (r) => (
    <div key={r.id} className="rb-li" style={{ alignItems: "flex-start" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="nm" style={{ textTransform: "capitalize" }}>{r.type} <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: 12 }}>· reported by @{r.reporter} · {fmtDate(new Date(r.created).getTime())}</span></div>
        {r.preview && <div className="sub" style={{ marginTop: 2 }}>"{r.preview}"</div>}
        {r.reason && <div className="sub" style={{ marginTop: 2, color: "var(--warn)" }}>Reason: {r.reason}</div>}
        {r.status === "open" ? (
          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            {r.type !== "user" && <div className="rb-chip" style={{ fontSize: 11.5, color: "var(--bad)" }} onClick={() => nuke(r)}>Delete {r.type}</div>}
            {r.author_id && <div className="rb-chip" style={{ fontSize: 11.5, color: "#ffb43c" }} onClick={() => suspend(r)}>Suspend author</div>}
            <div className="rb-chip" style={{ fontSize: 11.5 }} onClick={() => resolve(r, "dismissed")}>Dismiss</div>
          </div>
        ) : <div className="sub" style={{ marginTop: 4, color: r.status === "resolved" ? "var(--good)" : "var(--muted-2)" }}>{r.status}</div>}
      </div>
    </div>
  );
  return (
    <div>
      <div className="rb-h2" style={{ marginTop: 6 }}>⚑ Open reports <small>{open.length}</small></div>
      <div className="rb-card">{open.length === 0 ? <div className="rb-empty" style={{ padding: 18 }}>Nothing reported. Quiet reef.</div> : open.map(row)}</div>
      {closed.length > 0 && (<>
        <div className="rb-h2" style={{ marginTop: 18 }}>Recently handled <small>{closed.length}</small></div>
        <div className="rb-card">{closed.slice(0, 15).map(row)}</div>
      </>)}
    </div>
  );
}

function AdminSettings() {
  const [ann, setAnn] = useState("");
  const [aiOn, setAiOn] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    supabase.from("app_settings").select("key, value").then(({ data }) => {
      (data || []).forEach((r) => {
        if (r.key === "announcement") setAnn(typeof r.value === "string" ? r.value : "");
        if (r.key === "ai_enabled") setAiOn(r.value !== false);
      });
      setLoaded(true);
    });
  }, []);
  const save = async (k, v) => {
    setBusy(true);
    const { error } = await supabase.rpc("admin_set_setting", { k, v });
    setBusy(false);
    if (error) alert(error.message);
  };
  if (!loaded) return <div className="rb-empty" style={{ padding: 36 }}>Loading settings…</div>;
  return (
    <div>
      <div className="rb-h2" style={{ marginTop: 6 }}>📣 Announcement banner</div>
      <div className="rb-card" style={{ padding: 16 }}>
        <textarea className="rb-input" rows={2} placeholder="Shown to every user at the top of the app until dismissed. Leave empty for none."
          value={ann} onChange={(e) => setAnn(e.target.value)} />
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <button className="rb-btn" style={{ flex: 1, padding: 11 }} disabled={busy} onClick={() => save("announcement", ann.trim() || null)}>Publish</button>
          <button className="rb-btn ghost" style={{ flex: 1, padding: 11 }} disabled={busy} onClick={() => { setAnn(""); save("announcement", null); }}>Clear banner</button>
        </div>
        <div style={{ fontSize: 11.5, color: "var(--muted-2)", marginTop: 8 }}>Use for maintenance windows, launches, events. Users can dismiss; a new message re-appears.</div>
      </div>
      <div className="rb-h2" style={{ marginTop: 18 }}>🤖 AI features</div>
      <div className="rb-card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <b style={{ fontSize: 14 }}>AI enabled</b>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Kill switch for DeepDive + ReefID — flip off if API costs spike or the provider has an outage. Users see a friendly "paused for maintenance" note.</div>
        </div>
        <div className={"rb-chip" + (aiOn ? " on" : "")} style={{ flex: "none" }} onClick={() => { const n = !aiOn; setAiOn(n); save("ai_enabled", n); }}>{aiOn ? "ON" : "OFF"}</div>
      </div>
    </div>
  );
}

function AdminAudit() {
  const [rows, setRows] = useState(null);
  useEffect(() => { supabase.rpc("admin_list_audit").then(({ data, error }) => { if (!error) setRows(data || []); }); }, []);
  if (!rows) return <div className="rb-empty" style={{ padding: 36 }}>Loading audit trail…</div>;
  return (
    <div>
      <div className="rb-h2" style={{ marginTop: 6 }}>🧾 Admin actions <small>last {rows.length}</small></div>
      <div className="rb-card">
        {rows.length === 0 && <div className="rb-empty" style={{ padding: 18 }}>No admin actions recorded yet.</div>}
        {rows.map((a) => (
          <div key={a.id} className="rb-li" style={{ alignItems: "flex-start" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="nm">{a.action} <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: 12 }}>· @{a.admin} · {fmtDate(new Date(a.at).getTime())}</span></div>
              <div className="sub">{a.target}{a.detail ? ` — ${a.detail}` : ""}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminPanel({ state }) {
  const [tab, setTab] = useState("overview");
  const [photoQ, setPhotoQ] = useState(0);
  const [reportQ, setReportQ] = useState(0);
  useEffect(() => {
    let alive = true;
    supabase.from("species_photo_contributions").select("id", { count: "exact", head: true }).eq("status", "pending")
      .then(({ count }) => { if (alive && count != null) setPhotoQ(count); });
    supabase.rpc("admin_list_reports").then(({ data, error }) => {
      if (alive && !error) setReportQ((data || []).filter((r) => r.status === "open").length);
    });
    return () => { alive = false; };
  }, [tab]);
  return (
    <div className="rb-fadein">
      <div className="rb-tabs" style={{ marginTop: 4, flexWrap: "wrap" }}>
        {[["overview", "Overview"], ["reports", "Reports"], ["users", "Users"], ["content", "Content"], ["market", "Market"], ["photos", "Photos"], ["settings", "Settings"], ["audit", "Audit"]].map(([k, l]) => {
          const badge = k === "photos" ? photoQ : k === "reports" ? reportQ : 0;
          return (
            <div key={k} className={"rb-chip" + (tab === k ? " on" : "")} onClick={() => setTab(k)} style={{ position: "relative" }}>
              {l}{badge > 0 && (
                <span style={{ marginLeft: 6, background: "var(--coral)", color: "#04111a", fontWeight: 800, fontSize: 10, borderRadius: 12, padding: "1px 6px" }}>{badge}</span>
              )}
            </div>
          );
        })}
      </div>
      {tab === "overview" && <AdminOverview />}
      {tab === "users" && <AdminUsers state={state} />}
      {tab === "content" && <AdminContent />}
      {tab === "market" && <AdminMarket />}
      {tab === "photos" && <AdminPhotos />}
      {tab === "reports" && <AdminReports />}
      {tab === "settings" && <AdminSettings />}
      {tab === "audit" && <AdminAudit />}
    </div>
  );
}

function AdminPhotos() {
  const [pending, setPending] = useState(null);
  const load = () => supabase.from("species_photo_contributions").select("*").eq("status", "pending").order("created_at", { ascending: false })
    .then(({ data }) => setPending(data || []));
  useEffect(() => { load(); }, []);
  const act = async (id, status) => {
    setPending((p) => p.filter((x) => x.id !== id));
    await supabase.from("species_photo_contributions").update({ status }).eq("id", id);
  };
  if (pending === null) return <div className="rb-empty" style={{ padding: 30 }}>Loading…</div>;
  return (
    <div style={{ marginTop: 10 }}>
      <div className="rb-h2" style={{ marginTop: 0 }}><Camera size={15} color="var(--teal)" /> Photo contributions <small>{pending.length} pending</small></div>
      {pending.length === 0 && <div className="rb-card rb-empty" style={{ padding: 28 }}>No photos waiting for review.</div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 10 }}>
        {pending.map((c) => (
          <div key={c.id} className="rb-card" style={{ padding: 8 }}>
            <img src={c.photo_url} alt="" style={{ width: "100%", height: 130, objectFit: "cover", borderRadius: 10 }} />
            <div style={{ fontSize: 12, fontWeight: 600, margin: "6px 2px 2px" }}>{c.caption || "—"}</div>
            <div style={{ fontSize: 10.5, color: "var(--muted-2)", margin: "0 2px 8px" }}>{c.species_id}</div>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="rb-btn" style={{ flex: 1, padding: "7px 0", fontSize: 12 }} onClick={() => act(c.id, "approved")}>Approve</button>
              <button className="rb-btn ghost" style={{ flex: 1, padding: "7px 0", fontSize: 12 }} onClick={() => act(c.id, "rejected")}>Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Achievements ---------------- */
const ACHIEVEMENTS = [
  { id: "first_tank",   icon: "🪣", name: "Wet Hands",        desc: "Set up your first tank",                tier: "bronze", check: (s) => s.tanks.length >= 1 },
  { id: "multi_tank",   icon: "🏠", name: "Fish Room",         desc: "Run 3 or more tanks at once",           tier: "gold",   check: (s) => s.tanks.length >= 3 },
  { id: "first_log",    icon: "🧪", name: "Testing Testing",   desc: "Log your first parameter reading",      tier: "bronze", check: (s) => s.history.length >= 1 },
  { id: "log_50",       icon: "📈", name: "Data Diver",        desc: "Log 50 parameter readings",             tier: "silver", check: (s) => (s.totals ? s.totals.readings : s.history.length) >= 50 },
  { id: "log_100",      icon: "🔬", name: "Reef Scientist",    desc: "Log 100 parameter readings",            tier: "gold",   check: (s) => (s.totals ? s.totals.readings : s.history.length) >= 100 },
  { id: "stocked_10",   icon: "🐠", name: "Getting Crowded",   desc: "Add 10 livestock to your tanks",        tier: "bronze", check: (s) => (s.totals ? s.totals.livestock : s.livestock.length) >= 10 },
  { id: "stocked_25",   icon: "🌊", name: "Living Reef",       desc: "Keep 25 livestock across your tanks",   tier: "silver", check: (s) => (s.totals ? s.totals.livestock : s.livestock.length) >= 25 },
  { id: "coral_keeper", icon: "🪸", name: "Coral Gardener",    desc: "Keep 15 corals",                        tier: "silver", check: (s, d) => d.corals >= 15 },
  { id: "first_post",   icon: "💬", name: "Say Hi",            desc: "Make your first community post",        tier: "bronze", check: (s, d) => d.myPosts >= 1 },
  { id: "poster_10",    icon: "📣", name: "Reef Voice",        desc: "Make 10 community posts",               tier: "silver", check: (s, d) => d.myPosts >= 10 },
  { id: "pearls_500",   icon: "🦪", name: "Pearl Collector",   desc: "Earn 500 Pearls",                       tier: "silver", check: (s) => (s.pearls || 0) >= 500 },
  { id: "pearls_1000",  icon: "👑", name: "Pearl Hoarder",     desc: "Earn 1,000 Pearls",                     tier: "gold",   check: (s) => (s.pearls || 0) >= 1000 },
  { id: "shared",       icon: "🔗", name: "Open Book",         desc: "Share a tank's parameters publicly",    tier: "bronze", check: (s) => s.tanks.some((t) => t.shareParams) },
  { id: "reefpedia_20", icon: "📖", name: "Librarian",         desc: "Link 20 livestock to Reefpedia",        tier: "silver", check: (s) => (s.totals ? s.totals.linked : s.livestock.filter((l) => l.species_id).length) >= 20 },
  { id: "veteran",      icon: "🎖️", name: "Founding Reefer",   desc: "One of the first on Tidepool Reef",     tier: "gold",   check: () => true },
];
const TIER_STYLE = {
  bronze: { c: "#cd8b5f", bg: "rgba(205,139,95,.14)", bd: "rgba(205,139,95,.5)" },
  silver: { c: "#c8d0d8", bg: "rgba(200,208,216,.14)", bd: "rgba(200,208,216,.5)" },
  gold:   { c: "#ffd470", bg: "rgba(255,194,77,.16)", bd: "rgba(255,194,77,.55)" },
};
function computeAchievements(state, derived) {
  return ACHIEVEMENTS.map((a) => ({ ...a, earned: !!a.check(state, derived) }));
}

function Profile({ state, fish, corals, issues, go, myPosts, switchTank, updateProfile }) {
  const [wishlist, setWishlist] = useState([]);
  useEffect(() => {
    let alive = true;
    supabase.from("wishlist").select("species_id").eq("profile_id", state.uid).order("created_at", { ascending: false })
      .then(({ data }) => { if (alive) setWishlist((data || []).map((w) => REEFPEDIA.find((r) => r.id === w.species_id)).filter(Boolean)); });
    return () => { alive = false; };
  }, [state.uid]);
  const unwish = async (sid) => {
    await supabase.from("wishlist").delete().eq("profile_id", state.uid).eq("species_id", sid);
    setWishlist((w) => w.filter((x) => x.id !== sid));
  };
  const [editOpen, setEditOpen] = useState(false);
  const derived = { corals, fish, myPosts: myPosts.length };
  const achievements = computeAchievements(state, derived);
  const earned = achievements.filter((a) => a.earned);
  const locked = achievements.filter((a) => !a.earned);
  const ordered = [...earned, ...locked];   // earned first
  const gradFor = (i) => PALETTE[i % PALETTE.length];

  return (
    <div className="rb-fadein">
      {/* Compact horizontal hero */}
      <div className="rb-card" style={{ padding: 14, display: "flex", gap: 14, alignItems: "center", marginTop: 4, position: "relative" }}>
        <div style={{ flex: "none" }}><CoralAvatar size={60} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "Bricolage Grotesque", fontWeight: 800, fontSize: 19 }}>{state.profile.display_name || state.profile.handle}</div>
          <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 1 }}>@{state.profile.handle}{state.profile.location ? " · " + state.profile.location : ""}</div>
          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span className="rb-badge" style={{ background: "rgba(176,108,255,.18)", color: "#d7b6ff", border: "1px solid rgba(176,108,255,.45)", fontSize: 11 }}>Since {state.profile.reefing_since || state.tank.since}</span>
            <span className="rb-badge" style={{ background: "rgba(255,194,77,.16)", color: "#ffd470", border: "1px solid rgba(255,194,77,.5)", fontSize: 11 }}><Award size={11} /> {earned.length} badges</span>
            <span style={{ fontSize: 12, color: "var(--muted)" }}><b style={{ color: "var(--text)" }}>{state.followerCount || 0}</b> followers · <b style={{ color: "var(--text)" }}>{state.followingCount || 0}</b> following</span>
          </div>
        </div>
        <div className="rb-iconbtn" style={{ position: "absolute", top: 12, right: 12, width: 34, height: 34 }} onClick={() => setEditOpen(true)} title="Edit profile"><PenSquare size={15} /></div>
      </div>

      {/* Stat bar */}
      <div className="rb-card" style={{ display: "flex", justifyContent: "space-around", padding: "12px 8px", marginTop: 10, textAlign: "center" }}>
        {[[state.tanks.length, state.tanks.length === 1 ? "Tank" : "Tanks"], [fish, "Fish"], [corals, "Corals"], [state.pearls || 0, "Pearls"]].map(([v, k], i) => (
          <div key={i} className="rb-stat"><div className="v">{v}</div><div className="k">{k}</div></div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <button className="rb-btn ghost" style={{ flex: 1 }} onClick={() => go("seller")}><Store size={15} /> Seller Hub</button>
        <button className="rb-btn" style={{ flex: 1 }} onClick={() => go("community")}><PenSquare size={15} /> Create Post</button>
      </div>

      {/* My Tanks — 2-up grid */}
      <div className="rb-h2"><Waves size={16} color="var(--teal)" /> My Tanks <small>{state.tanks.length}</small></div>
      <div className="rb-mgrid" style={{ marginTop: 0 }}>
        {state.tanks.map((t, i) => {
          const active = t.id === state.tankId;
          return (
            <div key={t.id} className="rb-card rb-mcard" style={{ overflow: "hidden", cursor: "pointer", border: active ? "1px solid var(--aqua)" : undefined }}
              onClick={() => { switchTank(t.id); go("tank"); }}>
              <div style={{ height: 72, position: "relative", background: `linear-gradient(150deg, ${gradFor(i)[0]}, ${gradFor(i)[1]})` }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,.18), transparent 60%)" }} />
                <Waves size={26} color="rgba(4,17,26,.4)" style={{ position: "absolute", bottom: 10, right: 10 }} />
                {active && <span style={{ position: "absolute", top: 8, left: 8, fontSize: 9.5, fontWeight: 700, background: "rgba(3,8,12,.7)", color: "var(--aqua)", padding: "2px 7px", borderRadius: 20 }}>ACTIVE</span>}
              </div>
              <div className="rb-mbody">
                <div className="t">{t.name}</div>
                <div className="sci" style={{ fontStyle: "normal" }}>{t.model}</div>
                <div className="rb-care"><span>{t.volume} gal</span><span>since {t.since}</span></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Achievements — earned-first grid */}
      <div className="rb-h2"><Award size={16} color="var(--gold)" /> Achievements <small>{earned.length} / {achievements.length}</small></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {ordered.map((a) => {
          const ts = TIER_STYLE[a.tier];
          return (
            <div key={a.id} className="rb-card" title={a.name + " — " + a.desc}
              style={{ padding: "12px 6px", textAlign: "center", opacity: a.earned ? 1 : 0.38,
                border: a.earned ? `1px solid ${ts.bd}` : "1px solid var(--brd)", filter: a.earned ? "none" : "grayscale(1)" }}>
              <div style={{ fontSize: 26, lineHeight: 1 }}>{a.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 10.5, marginTop: 5, lineHeight: 1.2 }}>{a.name}</div>
            </div>
          );
        })}
      </div>

      {/* Activity */}
      {wishlist.length > 0 && (<>
        <div className="rb-h2"><Heart size={16} color="var(--coral)" /> Wishlist <small>{wishlist.length}</small></div>
        <div className="rb-card" style={{ padding: 14 }}>
          <div className="rb-tabs" style={{ margin: 0, flexWrap: "wrap" }}>
            {wishlist.map((w) => (
              <div key={w.id} className="rb-chip" style={{ fontSize: 12 }}>
                {w.name} <span style={{ marginLeft: 6, cursor: "pointer", color: "var(--muted-2)" }} onClick={() => unwish(w.id)}>✕</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--muted-2)", marginTop: 10 }}>Tap ✕ to remove. Add more from any Reefpedia species page.</div>
        </div>
      </>)}

      <div className="rb-h2"><Bell size={16} color="var(--coral)" /> Activity <small>{issues.length} flag{issues.length !== 1 ? "s" : ""}</small></div>
      <div className="rb-card">
        {issues.length === 0 && <div className="rb-empty">All parameters in range across your tanks. 🪸</div>}
        {issues.map((p) => (
          <div key={p.key} className="rb-li" style={{ cursor: "pointer" }} onClick={() => go("log")}>
            <div className="rb-thumb" style={{ background: `linear-gradient(140deg,var(--warn),#0b2b3d)` }}><Droplets size={20} color="#04111a" /></div>
            <div><div className="nm">{p.label} drifting</div><div className="sub">{(lastVal(state.history, p.key) || {}).v} {p.unit} · target {p.ideal[0]}–{p.ideal[1]}</div></div>
            <ChevronRight size={18} color="var(--muted)" style={{ marginLeft: "auto" }} />
          </div>
        ))}
        {myPosts.slice(0, 4).map((post) => (
          <div key={post.id} className="rb-li" style={{ alignItems: "flex-start", cursor: "pointer" }} onClick={() => go("community")}>
            <div className="rb-thumb" style={{ background: "linear-gradient(140deg,var(--aqua),#0b2b3d)", flex: "none" }}><PenSquare size={18} color="#04111a" /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="nm">You posted <span style={{ color: post.tagc }}>{post.tag}</span></div>
              <div className="sub" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{post.body}</div>
              <div style={{ fontSize: 11, color: "var(--muted-2)", marginTop: 2 }}>{post.time} · {post.likes} likes · {post.comments} comments</div>
            </div>
          </div>
        ))}
        {issues.length === 0 && myPosts.length === 0 && (
          <div className="rb-empty" style={{ padding: "20px" }}>Nothing to report — <span style={{ color: "var(--aqua)", cursor: "pointer" }} onClick={() => go("community")}>share a tank update</span>.</div>
        )}
      </div>
      {editOpen && <EditProfileSheet profile={state.profile} onClose={() => setEditOpen(false)} onSave={updateProfile} />}
    </div>
  );
}

function EditProfileSheet({ profile, onClose, onSave }) {
  const [name, setName] = useState(profile.display_name || "");
  const [handle, setHandle] = useState(profile.handle || "");
  const [location, setLocation] = useState(profile.location || "");
  const [since, setSince] = useState(profile.reefing_since || String(new Date().getFullYear()));
  const [busy, setBusy] = useState(false);
  const years = []; for (let y = new Date().getFullYear(); y >= 1990; y--) years.push(String(y));
  const save = async () => {
    setBusy(true);
    const ok = await onSave({ display_name: name, handle, location, reefing_since: since });
    setBusy(false);
    if (ok) onClose();
  };
  return (
    <div className="rb-overlay" onClick={onClose}>
      <div className="rb-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="rb-sheet-h"><b>Edit profile</b><div className="rb-iconbtn" onClick={onClose}><X size={18} /></div></div>
        <div className="rb-field"><label>Display name</label>
          <input className="rb-input" placeholder="How your name shows up" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} /></div>
        <div className="rb-field"><label>Handle</label>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "var(--muted)", fontSize: 15 }}>@</span>
            <input className="rb-input" placeholder="username" value={handle} onChange={(e) => setHandle(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))} maxLength={20} style={{ flex: 1 }} />
          </div>
          <div style={{ fontSize: 11, color: "var(--muted-2)", marginTop: 4 }}>Letters, numbers, and underscores. Must be unique.</div>
        </div>
        <div className="rb-field"><label>Location</label>
          <input className="rb-input" placeholder="e.g. Tampa, FL" value={location} onChange={(e) => setLocation(e.target.value)} maxLength={60} /></div>
        <div className="rb-field"><label>Reefing since</label>
          <select className="rb-input" value={since} onChange={(e) => setSince(e.target.value)}>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <button className="rb-btn" style={{ width: "100%", padding: 14 }} disabled={busy || !handle.trim()} onClick={save}>
          <Check size={16} /> {busy ? "Saving…" : "Save profile"}
        </button>
      </div>
    </div>
  );
}

/* ---------------- Feed ---------------- */
function HostEventSheet({ uid, onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10));
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const save = async () => {
    if (!title.trim() || busy) return;
    setBusy(true);
    const { error } = await supabase.from("events").insert({ host_id: uid, title: title.trim(), location: location.trim() || null, event_date: date, details: details.trim() || null });
    setBusy(false);
    if (error) { console.error("event create failed:", error.message); alert("Couldn't create the event — try again."); return; }
    onCreated();
  };
  return (
    <div className="rb-overlay" onClick={onClose}>
      <div className="rb-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="rb-sheet-h"><b>Host an event</b><div className="rb-iconbtn" onClick={onClose}><X size={18} /></div></div>
        <div className="rb-field"><label>What is it?</label>
          <input className="rb-input" placeholder="e.g. Space Coast Frag Swap" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div className="rb-field"><label>Where?</label>
          <input className="rb-input" placeholder="e.g. Melbourne, FL — DM for address" value={location} onChange={(e) => setLocation(e.target.value)} /></div>
        <div className="rb-field"><label>When?</label>
          <input className="rb-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div className="rb-field"><label>Details (optional)</label>
          <textarea className="rb-input" rows={2} placeholder="Bring frags to trade, coolers provided…" value={details} onChange={(e) => setDetails(e.target.value)} /></div>
        <button className="rb-btn" style={{ width: "100%", padding: 13, marginTop: 4 }} disabled={!title.trim() || busy} onClick={save}>
          <Calendar size={15} /> {busy ? "Creating…" : "Create event"}
        </button>
      </div>
    </div>
  );
}

function Feed({ allPosts, liked, toggleLike, addPost, addComment, uid, following, toggleFollow }) {
  const [events, setEvents] = useState([]);
  const [hostOpen, setHostOpen] = useState(false);
  const loadEvents = () => fetchEvents().then(setEvents);
  useEffect(() => { loadEvents(); }, []);
  const rsvp = async (ev, bringing) => {
    const mine = ev.rsvps.find((r) => r.profile_id === uid);
    if (mine && bringing === undefined) await supabase.from("event_rsvps").delete().eq("event_id", ev.id).eq("profile_id", uid);
    else await supabase.from("event_rsvps").upsert({ event_id: ev.id, profile_id: uid, bringing: bringing || (mine && mine.bringing) || null });
    loadEvents();
  };
  const [feedTab, setFeedTab] = useState("all");   // all | following
  const [draft, setDraft] = useState("");
  const [tag, setTag] = useState("Update");
  const [open, setOpen] = useState(null);
  const [tankView, setTankView] = useState(null);
  const [photo, setPhoto] = useState(null);   // {url, file}
  const [posting, setPosting] = useState(false);
  const photoRef = useRef(null);
  const TAGS = ["Update", "Help", "Build", "Event"];
  const submitPost = async () => {
    if ((!draft.trim() && !photo) || posting) return;
    setPosting(true);
    let imgUrl = null;
    if (photo) { imgUrl = await uploadPhoto(photo.file, uid); if (!imgUrl) { alert("Photo upload failed — posting without it."); } }
    await addPost(draft.trim() || "(photo)", tag, imgUrl);
    setDraft(""); setPhoto(null); setPosting(false);
  };
  return (
    <>
    <div className="rb-fadein">
      <div className="rb-sec" style={{ marginTop: 6 }}><h3>My Feed</h3><p>Posts from you and reefers you follow</p></div>
      <div className="rb-card rb-compose">
        <CoralAvatar size={40} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <textarea className="rb-input" rows={2} placeholder="Share a tank update or ask the reef…"
            value={draft} onChange={(e) => setDraft(e.target.value)} />
          {photo && (
            <div style={{ position: "relative", marginTop: 8, marginBottom: 2, width: "fit-content" }}>
              <img src={photo.url} alt="" style={{ maxHeight: 120, borderRadius: 10 }} />
              <span onClick={() => setPhoto(null)} style={{ position: "absolute", top: 6, right: 6, background: "rgba(3,8,12,.8)", color: "#fff", borderRadius: "50%", width: 22, height: 22, display: "grid", placeItems: "center", cursor: "pointer", fontWeight: 700 }}>✕</span>
            </div>
          )}
          <div className="rb-compose-bar">
            {TAGS.map((t) => (
              <div key={t} className={"rb-chip" + (tag === t ? " on" : "")} style={{ fontSize: 12 }} onClick={() => setTag(t)}>
                {t === "Help" ? "❓ Help" : t}
              </div>
            ))}
            <input ref={photoRef} type="file" accept="image/*" style={{ display: "none" }}
              onChange={(e) => { const f = e.target.files && e.target.files[0]; if (f) { const u = URL.createObjectURL(f); setPhoto({ url: u, file: f }); } e.target.value = ""; }} />
            <div className="rb-chip" style={{ fontSize: 12, cursor: "pointer" }} onClick={() => photoRef.current && photoRef.current.click()}>
              <Camera size={13} /> Photo
            </div>
            <button className="rb-btn" disabled={(!draft.trim() && !photo) || posting} onClick={submitPost}>
              <Send size={15} /> {posting ? "Posting…" : "Post"}
            </button>
          </div>
          {tag === "Help" && (
            <div style={{ fontSize: 11.5, color: "var(--aqua)", marginTop: 8, display: "flex", alignItems: "center", gap: 5 }}>
              <Users size={12} /> Tagged Help — this posts to Community Questions so other reefers can answer.
            </div>
          )}
        </div>
      </div>

      <CommunityQuestions posts={allPosts} onOpen={setOpen} />
      <RecentParameters onOpenTank={setTankView} />

      {/* ── Upcoming events (frag swaps & meetups) ── */}
      <div className="rb-h2" style={{ display: "flex", alignItems: "center" }}><Calendar size={16} color="var(--violet)" /> Events
        <small style={{ marginLeft: 6 }}>{events.length ? `${events.length} upcoming` : "none yet"}</small>
        <span className="rb-chip" style={{ marginLeft: "auto", fontSize: 11.5 }} onClick={() => setHostOpen(true)}>+ Host an event</span>
      </div>
      {events.length > 0 && (
        <div className="rb-card" style={{ marginBottom: 18 }}>
          {events.map((ev) => {
            const mine = ev.rsvps.find((r) => r.profile_id === uid);
            return (
              <div key={ev.id} className="rb-li" style={{ alignItems: "flex-start" }}>
                <div className="rb-thumb" style={{ background: "linear-gradient(140deg,var(--violet),#0b2b3d)" }}><Calendar size={18} color="#04111a" /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="nm">{ev.title} <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: 12 }}>· {new Date(ev.event_date + "T00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span></div>
                  <div className="sub">{ev.location || "location TBA"} · hosted by @{ev.host} · {ev.rsvps.length} going</div>
                  {ev.details && <div className="sub" style={{ marginTop: 3 }}>{ev.details}</div>}
                  {ev.rsvps.some((r) => r.bringing) && (
                    <div className="sub" style={{ marginTop: 4, color: "var(--aqua)" }}>
                      Bringing: {ev.rsvps.filter((r) => r.bringing).map((r) => `@${r.handle}: ${r.bringing}`).join(" · ")}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                    <div className={"rb-chip" + (mine ? " on" : "")} style={{ fontSize: 11.5 }} onClick={() => rsvp(ev)}>
                      {mine ? "✓ Going" : "I'm going"}
                    </div>
                    {mine && (
                      <div className="rb-chip" style={{ fontSize: 11.5 }} onClick={() => { const b = prompt("What are you bringing? (frags, gear, snacks…)", mine.bringing || ""); if (b !== null) rsvp(ev, b.trim()); }}>
                        {mine.bringing ? `Bringing: ${mine.bringing}` : "+ What I'm bringing"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {hostOpen && <HostEventSheet uid={uid} onClose={() => setHostOpen(false)} onCreated={() => { setHostOpen(false); loadEvents(); }} />}

      <div className="rb-sec" style={{ display: "flex", alignItems: "center" }}>
        <div style={{ flex: 1 }}><h3>Latest Posts</h3><p>{feedTab === "following" ? "From reefers you follow" : "Everything from the community"}</p></div>
        <div className="rb-tabs" style={{ margin: 0 }}>
          <div className={"rb-chip" + (feedTab === "all" ? " on" : "")} onClick={() => setFeedTab("all")}>All</div>
          <div className={"rb-chip" + (feedTab === "following" ? " on" : "")} onClick={() => setFeedTab("following")}>Following</div>
        </div>
      </div>
      {(() => {
      const visible = feedTab === "following" ? allPosts.filter((p) => following[p.authorId] || p.mine) : allPosts;
      if (visible.length === 0) return (
        <div className="rb-card rb-empty" style={{ padding: "34px 20px" }}>
          {feedTab === "following" ? "You're not following anyone yet — tap Follow on a post to build your feed." : "Nothing here yet — post the first update."}
        </div>
      );
      return (
      <div className="rb-postgrid">
        {visible.map((post) => {
          const isLiked = liked[post.id];
          return (
            <div key={post.id} className="rb-card rb-post" style={{ cursor: "pointer" }} onClick={() => setOpen(post)}>
              <div className="rb-phead">
                <div className="rb-pa" style={{ background: `linear-gradient(140deg,${post.tagc},var(--violet))` }}>{post.user[0]}</div>
                <div style={{ flex: 1, minWidth: 0 }}><div className="u">{post.user}</div><div className="meta">@{post.handle} · {post.time}</div></div>
                {!post.mine && post.authorId && (
                  <span onClick={(e) => { e.stopPropagation(); toggleFollow(post.authorId); }}
                    style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, cursor: "pointer", flex: "none",
                      background: following[post.authorId] ? "transparent" : "rgba(63,227,255,.14)",
                      color: following[post.authorId] ? "var(--muted)" : "var(--aqua)",
                      border: `1px solid ${following[post.authorId] ? "var(--brd)" : "rgba(63,227,255,.4)"}` }}>
                    {following[post.authorId] ? "Following" : "Follow"}
                  </span>
                )}
                <span className="rb-ptag" style={{ background: post.tagc + "22", color: post.tagc, border: `1px solid ${post.tagc}55`, flex: "none" }}>{post.tag}</span>
              </div>
              <div className="rb-pbody">{post.body}</div>
              {post.img && <PostImg src={post.img} />}
              <div className="rb-pacts">
                <span className={isLiked ? "liked" : ""} onClick={(e) => { e.stopPropagation(); toggleLike(post.id); }}>
                  <Heart size={16} fill={isLiked ? "var(--coral)" : "none"} /> {post.likes}
                </span>
                <span onClick={(e) => { e.stopPropagation(); setOpen(post); }}>
                  <MessageCircle size={16} /> {post.comments}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      );
      })()}

    </div>

      {open && (
        <PostSheet post={allPosts.find((p) => p.id === open.id) || open} liked={liked} toggleLike={toggleLike}
          addComment={addComment} uid={uid} onClose={() => setOpen(null)} />
      )}
      {tankView && <PublicTankSheet tankId={tankView} onClose={() => setTankView(null)} onMessage={() => {}} />}
    </>
  );
}

/* Community Questions — real posts tagged "Help" */
function CommunityQuestions({ posts, onOpen }) {
  const qs = posts.filter((p) => p.tag === "Help");
  if (!qs.length) return null;
  return (
    <>
      <div className="rb-sec"><h3>Community Questions</h3><p>Share your knowledge and help fellow reefers</p></div>
      <div className="rb-hscroll">
        {qs.map((q) => (
          <div key={q.id} className="rb-card rb-qcard" style={{ cursor: "pointer" }} onClick={() => onOpen(q)}>
            <div className="rb-phead">
              <div className="rb-pa" style={{ background: `linear-gradient(140deg,${q.tagc},var(--violet))` }}>{q.user[0]}</div>
              <div><div className="u">{q.user}</div></div>
              <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--muted)" }}>{q.time}</span>
            </div>
            <div className="rb-pbody rb-clamp">{q.body}</div>
            <div className="rb-pacts" style={{ marginTop: 10 }}>
              <span><Heart size={15} /> {q.likes}</span>
              <span><MessageCircle size={15} /> {q.comments}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* Recent Parameters — real readings from tanks whose owners opted in */
function RecentParameters({ onOpenTank }) {
  const [rows, setRows] = useState(null);
  useEffect(() => { let alive = true; fetchRecentParams().then((r) => { if (alive) setRows(r); }); return () => { alive = false; }; }, []);
  if (rows !== null && rows.length === 0) return null;
  const chip = (label, val, key) => {
    const p = PARAMS.find((x) => x.key === key);
    const st = p && val != null ? statusOf(p, Number(val)) : "warn";
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <span className={"rb-sdot " + sclass[st]} style={{ width: 6, height: 6 }} />
        <span style={{ fontSize: 11, color: "var(--muted)" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700 }}>{val == null ? "—" : val}</span>
      </div>
    );
  };
  return (
    <>
      <div className="rb-sec"><h3>Recent Parameters</h3><p>Latest updates from the community</p></div>
      <div className="rb-hscroll">
        {rows === null && <div className="rb-card rb-qcard rb-empty">Loading…</div>}
        {(rows || []).map((r) => (
          <div key={r.tank_id} className="rb-card" style={{ flex: "none", width: 210, padding: 14, cursor: "pointer", scrollSnapAlign: "start" }}
            onClick={() => onOpenTank(r.tank_id)}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <b style={{ fontFamily: "Bricolage Grotesque", fontSize: 15 }}>{r.tank_name}</b>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>{rel(r.measured_at)}</span>
            </div>
            <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>@{r.handle} · {r.tank_volume}g</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 10px", marginTop: 12 }}>
              {chip("Alk", r.alk, "alk")}
              {chip("Ca", r.cal, "cal")}
              {chip("NO₃", r.no3, "no3")}
              {chip("pH", r.ph, "ph")}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ---------------- Post detail + comments ---------------- */
function PostSheet({ post, liked, toggleLike, addComment, onClose }) {
  const [comments, setComments] = useState(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const isLiked = liked[post.id];

  useEffect(() => { let alive = true; fetchComments(post.id).then((c) => { if (alive) setComments(c); }); return () => { alive = false; }; }, [post.id]);

  const send = async () => {
    const body = draft.trim(); if (!body) return;
    setBusy(true); setDraft("");
    const c = await addComment(post.id, body);
    if (c) setComments((cs) => [...(cs || []), c]);
    setBusy(false);
  };

  return (
    <div className="rb-overlay" onClick={onClose}>
      <div className="rb-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="rb-sheet-h">
          <b>Post</b>
          <div className="rb-iconbtn" onClick={onClose}><X size={18} /></div>
        </div>

        <div className="rb-phead">
          <div className="rb-pa" style={{ background: `linear-gradient(140deg,${post.tagc},var(--violet))` }}>{post.user[0]}</div>
          <div><div className="u">{post.user}</div><div className="meta">@{post.handle} · {post.time}</div></div>
          <span className="rb-ptag" style={{ background: post.tagc + "22", color: post.tagc, border: `1px solid ${post.tagc}55` }}>{post.tag}</span>
        </div>
        <div className="rb-pbody">{post.body}</div>
        {post.img && <PostImg src={post.img} detail />}
        <div style={{ textAlign: "right", marginTop: 2 }}>
          <span style={{ fontSize: 11.5, color: "var(--muted-2)", cursor: "pointer" }}
            onClick={async () => {
              const reason = prompt("Report this post — what's wrong?");
              if (reason === null) return;
              const { error } = await supabase.from("reports").insert({ reporter_id: uid, target_type: "post", target_id: post.id, reason: reason.trim() || null });
              alert(error ? "Couldn't send the report — try again." : "Reported. Thanks for keeping the reef clean — a moderator will review it.");
            }}>⚑ Report</span>
        </div>
        <div className="rb-pacts" style={{ marginBottom: 16 }}>
          <span className={isLiked ? "liked" : ""} onClick={() => toggleLike(post.id)}>
            <Heart size={16} fill={isLiked ? "var(--coral)" : "none"} /> {post.likes}
          </span>
          <span><MessageCircle size={16} /> {post.comments}</span>
        </div>

        <div className="rb-h2" style={{ marginTop: 0, marginBottom: 10 }}>
          <MessageCircle size={15} color="var(--aqua)" /> Comments
          <small>{comments === null ? "…" : comments.length}</small>
        </div>
        <div className="rb-card" style={{ marginBottom: 14 }}>
          {comments === null && <div className="rb-empty" style={{ padding: 18 }}>Loading…</div>}
          {comments !== null && comments.length === 0 && (
            <div className="rb-empty" style={{ padding: 20 }}>No comments yet — be the first to weigh in.</div>
          )}
          {(comments || []).map((c) => (
            <div key={c.id} className="rb-li" style={{ alignItems: "flex-start" }}>
              <div className="rb-pa" style={{ background: "linear-gradient(140deg,var(--aqua),var(--violet))", width: 34, height: 34, fontSize: 13 }}>
                {(c.handle || "?")[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div className="nm" style={{ fontSize: 13 }}>@{c.handle} <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: 11.5 }}>· {rel(c.created_at)}</span></div>
                <div className="sub" style={{ lineHeight: 1.5, color: "#d8eef5" }}>{c.body}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="rb-ai-row">
          <input className="rb-input" placeholder="Add a comment…" value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !busy) send(); }} />
          <button className="rb-btn" disabled={!draft.trim() || busy} onClick={send}><Send size={16} /></button>
        </div>
      </div>
    </div>
  );
}


/* ---------------- Add to tank ---------------- */
function AddToTankSheet({ item, tanks, onClose, onAdd }) {
  const [done, setDone] = useState(null);
  const [busy, setBusy] = useState(false);
  const kind = item.kind || (item.cat === "Fish" ? "Fish" : item.cat === "Invert" ? "Invert" : "Coral");
  const add = async (tank) => {
    setBusy(true);
    await onAdd(tank.id, kind, item.name, item.id);
    setBusy(false);
    setDone(tank);
  };
  return (
    <div className="rb-overlay" onClick={onClose}>
      <div className="rb-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="rb-sheet-h">
          <b>{done ? "Added" : "Add to which tank?"}</b>
          <div className="rb-iconbtn" onClick={onClose}><X size={18} /></div>
        </div>
        {done ? (
          <div className="rb-empty" style={{ padding: "34px 20px" }}>
            <Check size={30} color="var(--good)" />
            <div style={{ marginTop: 12, color: "var(--text)", fontWeight: 600 }}>{item.name} added to {done.name}</div>
            <div style={{ marginTop: 6 }}>Other reefers can now find you as a keeper.</div>
            <button className="rb-btn" style={{ marginTop: 16, padding: "11px 20px" }} onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>
              Adding <b style={{ color: "var(--text)" }}>{item.name}</b> as {kind === "Fish" ? "a fish" : kind === "Invert" ? "an invert" : "a coral"}.
            </div>
            <div className="rb-card">
              {tanks.map((t) => (
                <div key={t.id} className="rb-li" style={{ cursor: busy ? "wait" : "pointer" }} onClick={() => !busy && add(t)}>
                  <div className="rb-thumb" style={{ background: "linear-gradient(140deg,var(--aqua),var(--violet))", width: 40, height: 40 }}>
                    <Waves size={18} color="#04111a" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="nm">{t.name}</div>
                    <div className="sub">{t.model} · {t.volume} gal</div>
                  </div>
                  <ChevronRight size={17} color="var(--muted)" />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------- Zoa polyp illustration ----------------
   Named zoa morphs are trade names, not species — there are no freely-licensed photos
   of them. Rather than fake a photo, we render the morph's actual color signature
   (skirt / ring / mouth), which is what reefers use to ID one. */
function ZoaPolyp({ z, size = 120 }) {
  const r = size / 2;
  const tentacles = 28;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block" }}>
      <defs>
        <radialGradient id={`sk-${z.id}`} cx="50%" cy="50%">
          <stop offset="55%" stopColor={z.skirt} />
          <stop offset="100%" stopColor={z.skirt} stopOpacity="0.75" />
        </radialGradient>
        <radialGradient id={`ct-${z.id}`} cx="50%" cy="50%">
          <stop offset="0%" stopColor={z.mouth} />
          <stop offset="60%" stopColor={z.center} />
          <stop offset="100%" stopColor={z.ring} />
        </radialGradient>
      </defs>
      {/* skirt tentacles */}
      {Array.from({ length: tentacles }).map((_, i) => {
        const a = (i / tentacles) * Math.PI * 2;
        const x1 = 50 + Math.cos(a) * 26, y1 = 50 + Math.sin(a) * 26;
        const x2 = 50 + Math.cos(a) * 45, y2 = 50 + Math.sin(a) * 45;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={z.skirt} strokeWidth="3.2" strokeLinecap="round" opacity="0.95" />;
      })}
      <circle cx="50" cy="50" r="27" fill={`url(#sk-${z.id})`} />
      <circle cx="50" cy="50" r="19" fill={z.ring} />
      <circle cx="50" cy="50" r="13" fill={`url(#ct-${z.id})`} />
      <ellipse cx="50" cy="50" rx="5.5" ry="3" fill={z.mouth} />
      <ellipse cx="50" cy="50" rx="2.6" ry="1.2" fill={z.center} opacity="0.8" />
    </svg>
  );
}

const TIER_COLOR = { Starter: "#3ce0a3", Mid: "#3fe3ff", "High-End": "#b06cff", Grail: "#ffc24d" };

function ZoaGuide({ onAddToTank }) {
  const [tier, setTier] = useState("All");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(null);
  const query = q.trim().toLowerCase();
  const shown = ZOAS.filter((z) =>
    (tier === "All" || z.tier === tier) &&
    (!query || z.name.toLowerCase().includes(query) || z.note.toLowerCase().includes(query)));
  return (
    <>
      <div className="rb-card" style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", marginTop: 4 }}>
        <Search size={17} color="var(--muted)" />
        <input className="rb-input" style={{ border: "none", padding: 0, background: "transparent" }}
          placeholder={`Search ${ZOAS.length} zoa & paly morphs…`} value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="rb-tabs" style={{ marginTop: 14 }}>
        {ZOA_TIERS.map((t) => (
          <div key={t} className={"rb-chip" + (tier === t ? " on" : "")} onClick={() => setTier(t)}>{t}</div>
        ))}
      </div>

      <div className="rb-card" style={{ padding: 14, marginBottom: 14, fontSize: 12.5, color: "var(--muted)", lineHeight: 1.55 }}>
        Zoa morphs are hobbyist trade names, so there are no freely-licensed photos of them.
        Each polyp below is drawn from its real color signature — skirt, ring, and mouth — which is
        how you actually tell morphs apart. Husbandry is the same across all of them.
      </div>

      <div className="rb-mgrid">
        {shown.map((z) => (
          <div key={z.id} className="rb-card rb-mcard" onClick={() => setOpen(z)}>
            <div style={{ position: "relative", display: "grid", placeItems: "center", padding: "10px 0 4px",
              background: `radial-gradient(circle at 50% 50%, ${z.skirt}22, transparent 70%)` }}>
              <ZoaPolyp z={z} size={110} />
              <span style={{ position: "absolute", top: 8, left: 8, fontSize: 10, background: "rgba(3,8,12,.72)",
                padding: "3px 8px", borderRadius: 20, border: `1px solid ${TIER_COLOR[z.tier]}66`, color: TIER_COLOR[z.tier] }}>
                {z.tier}
              </span>
            </div>
            <div className="rb-mbody">
              <div className="t">{z.name}</div>
              <div className="rb-care">
                <span>{z.growth}</span>
                <span>{z.polyp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {shown.length === 0 && <div className="rb-card rb-empty">No morphs match “{q}”.</div>}

      {open && <ZoaSheet z={open} onClose={() => setOpen(null)} onAddToTank={onAddToTank} />}
    </>
  );
}

function ZoaSheet({ z, onClose, onAddToTank }) {
  const [tips, setTips] = useState("");
  const [busy, setBusy] = useState(false);
  const getTips = async () => {
    setBusy(true);
    try {
      const r = await askReefAI(
        [{ role: "user", content: `I want to keep the zoanthid morph "${z.name}" in my reef tank. Give me 4 short, practical tips for getting it to color up and spread. One line each.` }],
        "You are Tidepool Reef DeepDive, an expert reef advisor. Be concise and specific.", "deepdive");
      setTips(r || "Couldn't load tips right now.");
    } catch (e) { setTips("DeepDive error: " + (e.message || "connection failed")); }
    setBusy(false);
  };
  return (
    <div className="rb-overlay" onClick={onClose}>
      <div className="rb-sheet rb-split" onClick={(e) => e.stopPropagation()}>
        <div className="rb-sheet-h"><b>{z.name}</b><div className="rb-iconbtn" onClick={onClose}><X size={18} /></div></div>

        <div className="rb-split-media">
          <div style={{ display: "grid", placeItems: "center", padding: "10px 0 16px", borderRadius: 16,
            background: `radial-gradient(circle at 50% 45%, ${z.skirt}26, transparent 72%)` }}>
            <ZoaPolyp z={z} size={190} />
          </div>
        </div>

        <div className="rb-split-body">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "14px 0" }}>
          <span className="rb-badge" style={{ background: TIER_COLOR[z.tier] + "22", color: TIER_COLOR[z.tier], border: `1px solid ${TIER_COLOR[z.tier]}55`, fontSize: 11 }}>{z.tier}</span>
          <span className="rb-badge" style={{ background: "rgba(255,255,255,.05)", color: "var(--muted)", border: "1px solid var(--brd)", fontSize: 11 }}>{z.growth} growth</span>
          <span className="rb-badge" style={{ background: "rgba(255,255,255,.05)", color: "var(--muted)", border: "1px solid var(--brd)", fontSize: 11 }}>{z.polyp} polyps</span>
        </div>

        <div style={{ fontSize: 14, lineHeight: 1.6, color: "#d8eef5", marginBottom: 14 }}>{z.note}</div>

        <div className="rb-h2" style={{ marginTop: 0, marginBottom: 8 }}>Color signature</div>
        <div className="rb-card" style={{ padding: 14, marginBottom: 14, display: "flex", gap: 14, justifyContent: "space-around" }}>
          {[["Skirt", z.skirt], ["Ring", z.ring], ["Center", z.center], ["Mouth", z.mouth]].map(([k, c]) => (
            <div key={k} style={{ textAlign: "center" }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: c, margin: "0 auto 6px", border: "1px solid rgba(255,255,255,.15)" }} />
              <div style={{ fontSize: 11, color: "var(--muted)" }}>{k}</div>
            </div>
          ))}
        </div>

        <div className="rb-h2" style={{ marginTop: 0, marginBottom: 8 }}>Care <small>same for all zoas</small></div>
        <div className="rb-card" style={{ padding: "4px 14px", marginBottom: 14 }}>
          {ZOA_CARE.map(([k, v], i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0",
              borderBottom: i < ZOA_CARE.length - 1 ? "1px solid rgba(255,255,255,.06)" : "none" }}>
              <span style={{ fontSize: 12.5, color: k.startsWith("⚠️") ? "var(--warn)" : "var(--muted)", minWidth: 92 }}>{k}</span>
              <span style={{ fontSize: 13.5, fontWeight: 600, flex: 1, color: k.startsWith("⚠️") ? "var(--warn)" : "var(--text)" }}>{v}</span>
            </div>
          ))}
        </div>

        {tips && <div className="rb-card" style={{ padding: 14, marginBottom: 14, fontSize: 13.5, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{tips}</div>}

        <div style={{ display: "flex", gap: 10 }}>
          <button className="rb-btn" style={{ flex: 1, padding: 13 }}
            onClick={() => onAddToTank({ id: "zoa:" + z.id, name: z.name, cat: "Soft", kind: "Coral" })}>
            <Plus size={16} /> Add to tank
          </button>
          <button className="rb-btn violet" style={{ flex: 1, padding: 13 }} onClick={getTips} disabled={busy}>
            <Bot size={16} /> {busy ? "Asking…" : "Care tips"}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Reefpedia ---------------- */
// Free species photos from Wikipedia's public API (CORS-open, no key, freely licensed).
// Species photos are downloaded from Wikimedia Commons at BUILD time (scripts/fetch-images.mjs)
// and bundled into the site, so there's no runtime dependency on any external service.
// Each photo's author + license is carried in the manifest and credited in the detail view.
function photoOf(item) { return SPECIES_IMAGES[item.id] || null; }

/* Safety net: if a photo wasn't bundled at build time, fetch it live once and cache it,
   so Reefpedia never shows a bare gradient just because a build hiccuped. */
const runtimeCache = {};
function loadCache() {
  try { return JSON.parse(localStorage.getItem("tr:pics") || "{}"); } catch (e) { return {}; }
}
function saveCache(c) { try { localStorage.setItem("tr:pics", JSON.stringify(c)); } catch (e) {} }

async function resolveRuntimePhoto(item) {
  if (item.noPhoto) return null;   // designer morphs: trade names with no free photos — render the gradient
  const disk = loadCache();
  if (disk[item.id] !== undefined) return disk[item.id];
  const tryTitle = async (title) => {
    try {
      const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
      if (!r.ok) return null;
      const d = await r.json();
      if (d.type === "disambiguation") return null;
      return (d.thumbnail && d.thumbnail.source) || (d.originalimage && d.originalimage.source) || null;
    } catch (e) { return null; }
  };
  let src = await tryTitle(item.wiki);
  if (!src) {
    try {
      const r = await fetch(`https://en.wikipedia.org/w/rest.php/v1/search/page?q=${encodeURIComponent(item.sci)}&limit=3`);
      if (r.ok) {
        const d = await r.json();
        for (const p of d.pages || []) {
          if (p.thumbnail && p.thumbnail.url) {
            const u = p.thumbnail.url;
            src = (u.startsWith("//") ? "https:" + u : u).replace(/\/\d+px-/, "/640px-");
            break;
          }
        }
      }
    } catch (e) {}
  }
  disk[item.id] = src;   // cache misses too, so we don't retry forever
  saveCache(disk);
  return src;
}

function useSpeciesPhoto(item) {
  const bundled = photoOf(item);
  const [url, setUrl] = useState(() => (bundled ? bundled.src : runtimeCache[item.id]));
  useEffect(() => {
    if (bundled) { setUrl(bundled.src); return; }
    let alive = true;
    if (runtimeCache[item.id] !== undefined) { setUrl(runtimeCache[item.id]); return; }
    resolveRuntimePhoto(item).then((src) => {
      runtimeCache[item.id] = src;
      if (alive) setUrl(src);
    });
    return () => { alive = false; };
  }, [item.id]);
  return url;
}

function SpeciesIcon({ cat, size = 30 }) {
  if (cat === "Fish") return <Fish size={size} />;
  if (cat === "Invert") return <Shell size={size} />;
  if (cat === "Pest") return <Bell size={size} />;
  return <Waves size={size} />;
}

/* Post images: /species/{id}.jpg srcs resolve through the species-photo system
   (bundled file if present, live Wikipedia fallback if the build fetch missed) —
   so demo-feed photos are self-healing. Other srcs render directly, hiding on error. */
const NO_ITEM = { id: "__none__", noPhoto: true, g: ["#0b2330", "#05121b"], name: "" };
function PostImg({ src, detail }) {
  const m = typeof src === "string" ? src.match(/^\/species\/([A-Za-z0-9_-]+)\.jpg$/) : null;
  const item = m ? (REEFPEDIA.find((e) => e.id === m[1]) || NO_ITEM) : NO_ITEM;
  const resolved = useSpeciesPhoto(item);
  const finalSrc = m ? resolved : src;
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [finalSrc]);
  if (!finalSrc || failed) return null;
  return detail ? (
    <img className="rb-pimg" src={finalSrc} alt="" onError={() => setFailed(true)}
      style={{ height: "auto", maxHeight: "60vh", objectFit: "contain", width: "100%", background: "rgba(3,8,12,.5)" }} />
  ) : (
    <img className="rb-pimg" src={finalSrc} alt="" onError={() => setFailed(true)}
      style={{ height: 170, flexShrink: 0, objectFit: "cover", width: "100%" }} />
  );
}

function SpeciesPhoto({ item, height, radius = 0 }) {
  const url = useSpeciesPhoto(item);
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [url]);
  return (
    <div style={{
      height, borderRadius: radius, position: "relative", overflow: "hidden",
      background: `linear-gradient(140deg,${item.g[0]},${item.g[1]})`,
      display: "grid", placeItems: "center", color: "rgba(4,17,26,.5)",
    }}>
      {url && !failed && (
        <img src={url} alt={item.name} loading="lazy" onError={() => setFailed(true)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      )}
      {(!url || failed) && <SpeciesIcon cat={item.cat} size={height > 140 ? 40 : 30} />}
    </div>
  );
}

const CAT_COLOR = { Fish: "#ff7a5c", SPS: "#2ee6c8", LPS: "#3fe3ff", Soft: "#b06cff", Invert: "#ffc24d", Pest: "#ff5d72" };

/* Fish-family grouping for the Library — keyword-based so new entries self-classify. */
const FISH_FAMILIES = [
  ["Clownfish", /clownfish|amphiprion|premnas|ocellaris|percula|maroon/i],
  ["Tangs & Surgeonfish", /tang\b|zebrasoma|acanthurus|ctenochaetus|naso|foxface|siganus/i],
  ["Wrasses", /wrasse|halichoeres|cirrhilabrus|paracheilinus|macropharyngodon|pseudocheilin|wetmorella/i],
  ["Gobies, Blennies & Dragonets", /goby|blenny|mandarin|dragonet|synchiropus|gobiodon|amblyeleotris|stonogobiops|salarias|jawfish|engineer|watchman/i],
  ["Anthias, Basslets & Dottybacks", /anthias|gramma|basslet|dottyback|pseudochromis|chalk bass|serranocirrhitus/i],
  ["Angels & Butterflies", /angelfish|centropyge|pygoplites|butterfly|chelmon/i],
  ["Cardinals, Damsels & Chromis", /cardinal|damsel|chromis|chrysiptera/i],
  ["Firefish & Dartfish", /firefish|dartfish|nemateleotris/i],
];
function fishFamily(item) {
  const hay = item.name + " " + item.sci;
  for (const [fam, re] of FISH_FAMILIES) if (re.test(hay)) return fam;
  return "More Reef Fish";
}

/* Coral genus groupings per tab — same keyword approach, so new corals self-file. */
const CORAL_GROUPS = {
  SPS: [
    ["Acropora", /acropora|staghorn|table |slimer/i],
    ["Montipora", /montipora/i],
    ["Birdsnest & Stylo", /birdsnest|seriatopora|stylophora/i],
    ["Pocillopora", /pocillopora/i],
    ["Encrusting SPS", /porites|pavona|psammocora|leptoseris|cyphastrea|hydnophora/i],
  ],
  LPS: [
    ["Euphyllia (Hammer/Torch/Frog)", /euphyllia|hammer|torch|frogspawn/i],
    ["Brains", /brain|trachyphyllia|lobophyllia|symphyllia|favia|platygyra|diploastrea|open brain|scoly|homophyllia|cynarina|goniastrea|wellsophyllia/i],
    ["Acans & Micromussa", /acan|acanthastrea|micromussa|blastomussa|bowerbanki/i],
    ["Chalices & Favites", /chalice|echinophyllia|oxypora|favites|war coral|leptastrea|cyphastrea|pectinia/i],
    ["Plates & Fungia", /plate |fungia|tongue|herpolitha/i],
    ["Bubble, Elegance & Fleshy", /bubble|plerogyra|physogyra|elegance|catalaphyllia|meat coral|acanthophyllia|fox coral/i],
    ["Flowerpot & Star", /goniopora|alveopora|galaxea|duncan/i],
    ["Non-Photosynthetic", /sun coral|tubastraea|dendrophyllia/i],
    ["Candy Cane & Scroll", /candy cane|caulastraea|scroll|turbinaria/i],
  ],
  Soft: [
    ["Leathers", /leather|sarcophyton|sinularia|lobophytum|cladiella|capnella|colt|kenya|litophyton|tree coral/i],
    ["Mushrooms", /mushroom|discosoma|rhodactis|ricordea|bounce|jawbreaker/i],
    ["Zoas & Palys", /zoanthid|palythoa|parazoanthus|yellow polyp/i],
    ["Pulsing & Polyps", /xenia|anthelia|clove|pipe organ|tubipora|sympodium|star polyp|briareum|clavularia|pachyclavularia/i],
    ["Gorgonians", /gorgonian|antillogorgia/i],
  ],
};
function coralGroup(item, cat) {
  const groups = CORAL_GROUPS[cat]; if (!groups) return null;
  const hay = item.name + " " + item.sci;
  for (const [g, re] of groups) if (re.test(hay)) return g;
  return "Other " + cat;
}
// Representative species id per group (hand-picked so tiles look intentional).
const GROUP_ICON = {
  "Clownfish": "f40", "Tangs & Surgeonfish": "f6", "Wrasses": "f48", "Gobies, Blennies & Dragonets": "f44",
  "Anthias, Basslets & Dottybacks": "f52", "Angels & Butterflies": "f42", "Cardinals, Damsels & Chromis": "f73", "Firefish & Dartfish": "f54",
  "Acropora": "s2", "Montipora": "s4", "Birdsnest & Stylo": "s6", "Pocillopora": "s8", "Encrusting SPS": "s18",
  "Euphyllia (Hammer/Torch/Frog)": "l2", "Brains": "l10", "Acans & Micromussa": "l5", "Chalices & Favites": "l8",
  "Plates & Fungia": "l12", "Bubble, Elegance & Fleshy": "l14", "Flowerpot & Star": "l16", "Non-Photosynthetic": "l15", "Candy Cane & Scroll": "l6",
  "Leathers": "o1", "Mushrooms": "o10", "Zoas & Palys": "o6", "Pulsing & Polyps": "o5", "Gorgonians": "o20",
};

function Library({ libCat, setLibCat, openItem, counts, onAddToTank }) {
  const [q, setQ] = useState("");
  const [diffFilter, setDiffFilter] = useState("All");
  const [group, setGroup] = useState(null);   // selected family/genus tile
  const isZoa = libCat === "Zoa";
  const query = q.trim().toLowerCase();
  // Which tabs use the tile landing.
  const grouped = libCat === "Fish" || libCat === "SPS" || libCat === "LPS" || libCat === "Soft";
  const groupOf = (l) => libCat === "Fish" ? fishFamily(l) : coralGroup(l, libCat);
  const groupOrder = libCat === "Fish"
    ? [...FISH_FAMILIES.map(([f]) => f), "More Reef Fish"]
    : (CORAL_GROUPS[libCat] ? [...CORAL_GROUPS[libCat].map(([g]) => g), "Other " + libCat] : []);

  const shown = REEFPEDIA.filter((l) =>
    (libCat === "All" || l.cat === libCat) &&
    (diffFilter === "All" || l.diff === diffFilter) &&
    (!group || groupOf(l) === group) &&
    (!query || l.name.toLowerCase().includes(query) || l.sci.toLowerCase().includes(query) || l.blurb.toLowerCase().includes(query)));

  const switchCat = (c) => { setLibCat(c); setGroup(null); setDiffFilter("All"); };
  // Show tile landing: a grouped tab, no search, no group drilled into.
  const showTiles = grouped && !query && !group;

  return (
    <div className="rb-fadein">
      {!isZoa && (
        <div className="rb-card" style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", marginTop: 4 }}>
          <Search size={17} color="var(--muted)" />
          <input className="rb-input" style={{ border: "none", padding: 0, background: "transparent" }}
            placeholder={`Search ${REEFPEDIA.length} species, corals & pests…`} value={q} onChange={(e) => { setQ(e.target.value); }} />
        </div>
      )}
      <div className="rb-tabs" style={{ marginTop: 14 }}>
        {[...REEFPEDIA_CATS, "Zoa"].map((c) => (
          <div key={c} className={"rb-chip" + (libCat === c ? " on" : "")} onClick={() => switchCat(c)}>
            {c === "Pest" ? "Pests & Disease" : c === "Soft" ? "Soft Coral" : c === "Zoa" ? "🪸 Zoa Morphs" : c}
          </div>
        ))}
      </div>

      {isZoa && <ZoaGuide onAddToTank={onAddToTank} />}

      {/* Back chip when drilled into a group */}
      {!isZoa && group && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "14px 2px 0" }}>
          <div className="rb-chip" onClick={() => setGroup(null)}><ChevronLeft size={14} style={{ verticalAlign: -2 }} /> All {libCat === "Fish" ? "families" : "types"}</div>
          <span style={{ fontFamily: "Bricolage Grotesque", fontWeight: 700, fontSize: 16 }}>{group}</span>
          <span style={{ fontSize: 12, color: "var(--muted-2)" }}>{shown.length}</span>
        </div>
      )}

      {/* Care-level filter — hidden on the tile landing and on Pest */}
      {!isZoa && !showTiles && libCat !== "Pest" && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "12px 2px 0", flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>Care level:</span>
          {["All", "Easy", "Medium", "Hard", "Expert"].map((d) => (
            <div key={d} className={"rb-chip" + (diffFilter === d ? " on" : "")} style={{ fontSize: 11, padding: "5px 11px" }}
              onClick={() => setDiffFilter(d)}>
              {d !== "All" && <span className="rb-sdot" style={{ display: "inline-block", width: 6, height: 6, marginRight: 5, verticalAlign: 1, background: diffColor[d] || "var(--muted)" }} />}{d}
            </div>
          ))}
          <span style={{ fontSize: 11, color: "var(--muted-2)", marginLeft: "auto" }}>{shown.length} shown</span>
        </div>
      )}

      {/* TILE LANDING */}
      {!isZoa && showTiles && (() => {
        const tiles = groupOrder.map((g) => {
          const members = REEFPEDIA.filter((l) => l.cat === libCat && groupOf(l) === g);
          if (!members.length) return null;
          const iconItem = REEFPEDIA.find((l) => l.id === GROUP_ICON[g]) || members[0];
          return { g, count: members.length, iconItem };
        }).filter(Boolean);
        return (
          <div className="rb-mgrid" style={{ marginTop: 16 }}>
            {tiles.map(({ g, count, iconItem }) => (
              <div key={g} className="rb-card rb-mcard" style={{ cursor: "pointer" }} onClick={() => setGroup(g)}>
                <div style={{ position: "relative" }}>
                  <SpeciesPhoto item={iconItem} height={128} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,transparent 45%,rgba(3,8,12,.9))" }} />
                  <div style={{ position: "absolute", left: 12, right: 12, bottom: 10 }}>
                    <div style={{ fontFamily: "Bricolage Grotesque", fontWeight: 800, fontSize: 15, lineHeight: 1.15 }}>{g}</div>
                    <div style={{ fontSize: 11.5, color: "var(--aqua)", marginTop: 2 }}>{count} species</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* SPECIES GRID — flat (All/Invert/Pest, search, or a drilled-in group) */}
      {!isZoa && !showTiles && (
        <>
          {shown.length === 0 && <div className="rb-card rb-empty" style={{ marginTop: 14 }}>Nothing matches{q ? ` “${q}”` : " these filters"}. Try a common name, a genus, or a symptom{diffFilter !== "All" ? " — or clear the care-level filter" : ""}.</div>}
          <div className="rb-mgrid" style={{ marginTop: 14 }}>
            {shown.map((l) => <LibCard key={l.id} l={l} counts={counts} openItem={openItem} />)}
          </div>
        </>
      )}
    </div>
  );
}

function LibCard({ l, counts, openItem }) {
  return (
    <div className="rb-card rb-mcard" onClick={() => openItem(l)}>
      <div style={{ position: "relative" }}>
        <SpeciesPhoto item={l} height={120} />
        <span className="cat" style={{ position: "absolute", top: 8, left: 8, fontSize: 10, background: "rgba(3,8,12,.72)",
          padding: "3px 8px", borderRadius: 20, backdropFilter: "blur(6px)", border: `1px solid ${CAT_COLOR[l.cat]}66`, color: CAT_COLOR[l.cat] }}>
          {l.cat}
        </span>
      </div>
      <div className="rb-mbody">
        <div className="t">{l.name}</div>
        <div className="sci">{l.sci}</div>
        <div className="rb-care">
          <span style={{ color: diffColor[l.diff] || "var(--bad)", borderColor: (diffColor[l.diff] || "#ff5d72") + "66" }}>
            {l.diff === "Pest" ? "Pest" : l.diff}
          </span>
          {counts && counts[l.id] > 0 && (
            <span style={{ color: "var(--aqua)", borderColor: "var(--brd-2)" }}>
              <Users size={9} style={{ verticalAlign: -1, marginRight: 3 }} />{counts[l.id]}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function PhotoCredit({ item }) {
  const p = photoOf(item);
  if (!p) return (
    <div style={{ textAlign: "center", color: "var(--muted-2)", fontSize: 10.5, marginTop: 12 }}>
      Photo via Wikimedia Commons
    </div>
  );
  return (
    <div style={{ textAlign: "center", color: "var(--muted-2)", fontSize: 10.5, marginTop: 12, lineHeight: 1.5 }}>
      Photo: {p.artist} · {p.license} · via{" "}
      <a href={p.source} target="_blank" rel="noreferrer" style={{ color: "var(--muted)" }}>Wikimedia Commons</a>
    </div>
  );
}

function LibDetail({ item, onClose, uid, count, onOpenTank, onMessage, onAddToTank }) {
  const [keepers, setKeepers] = useState(null);
  const [communityPhotos, setCommunityPhotos] = useState([]);
  const [wish, setWish] = useState(false);
  const [wishBusy, setWishBusy] = useState(false);
  const [contribBusy, setContribBusy] = useState(false);
  const [contribDone, setContribDone] = useState(false);
  const contribRef = useRef(null);
  useEffect(() => {
    let alive = true;
    if (uid) supabase.from("wishlist").select("id").eq("profile_id", uid).eq("species_id", item.id).maybeSingle()
      .then(({ data }) => { if (alive) setWish(!!data); });
    return () => { alive = false; };
  }, [item.id, uid]);
  const toggleWish = async () => {
    if (wishBusy || !uid) return;
    setWishBusy(true);
    if (wish) { await supabase.from("wishlist").delete().eq("profile_id", uid).eq("species_id", item.id); setWish(false); }
    else { await supabase.from("wishlist").insert({ profile_id: uid, species_id: item.id }); setWish(true); }
    setWishBusy(false);
  };
  // Contribute a photo straight from the species page — the legit way the library grows.
  const contributePhoto = async (file) => {
    if (!file || !uid) return;
    setContribBusy(true);
    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      // Storage policy requires the first folder to be the uploader's uid.
      const path = `${uid}/contrib-${item.id}-${Date.now()}.${ext}`;
      const up = await supabase.storage.from("photos").upload(path, file, { upsert: false });
      if (up.error) throw up.error;
      const { data: pub } = supabase.storage.from("photos").getPublicUrl(path);
      const { error } = await supabase.from("species_photo_contributions").insert({
        species_id: item.id, contributor_id: uid, photo_url: pub.publicUrl, caption: item.name,
      });
      if (error) throw error;
      setContribDone(true);
    } catch (e) { console.error("contribute failed:", e.message || e); alert("Couldn't submit the photo — try again."); }
    setContribBusy(false);
  };
  useEffect(() => {
    let alive = true;
    if (item.cat === "Pest") { setKeepers([]); return; }
    fetchKeepers(item.id).then((k) => { if (alive) setKeepers(k); });
    supabase.from("species_photo_contributions").select("id, photo_url, caption")
      .eq("species_id", item.id).eq("status", "approved").limit(12)
      .then(({ data }) => { if (alive && data) setCommunityPhotos(data); });
    return () => { alive = false; };
  }, [item.id]);
  const [tips, setTips] = useState("");
  const [busy, setBusy] = useState(false);
  const isPest = item.cat === "Pest";
  const getTips = async () => {
    setBusy(true);
    try {
      const prompt = isPest
        ? `I think I have ${item.name} (${item.sci}) in my reef tank. Give me a short, practical eradication plan — 3-4 steps, most effective first, plus one thing NOT to do.`
        : `Give 4 concise, practical care tips for keeping ${item.name} (${item.sci}) in a home reef aquarium. Bullet points, one line each.`;
      const r = await askReefAI([{ role: "user", content: prompt }],
        "You are Tidepool Reef DeepDive, an expert reef-aquarium advisor. Be concise, specific, and practical.", "deepdive");
      setTips(r || "Couldn't load tips right now.");
    } catch (e) { setTips("DeepDive error: " + (e.message || "connection failed")); }
    setBusy(false);
  };
  return (
    <div className="rb-overlay" onClick={onClose}>
      <div className="rb-sheet rb-split" onClick={(e) => e.stopPropagation()}>
        <div className="rb-sheet-h">
          <b>{item.name}</b>
          <div className="rb-iconbtn" onClick={onClose}><X size={18} /></div>
        </div>
        <div className="rb-split-media">
          <SpeciesPhoto item={item} height={190} radius={14} />
          <PhotoCredit item={item} />
        </div>
        <div className="rb-split-body">
        <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "12px 0 14px", flexWrap: "wrap" }}>
          <span style={{ fontStyle: "italic", color: "var(--muted)", fontSize: 13 }}>{item.sci}</span>
          <span className="rb-badge" style={{ background: CAT_COLOR[item.cat] + "22", color: CAT_COLOR[item.cat], border: `1px solid ${CAT_COLOR[item.cat]}55`, fontSize: 11 }}>
            {item.cat}
          </span>
          <span className="rb-badge" style={{ background: (diffColor[item.diff] || "#ff5d72") + "22", color: diffColor[item.diff] || "#ff5d72",
            border: `1px solid ${(diffColor[item.diff] || "#ff5d72")}55`, fontSize: 11 }}>
            {isPest ? "Pest / Disease" : item.diff + " care"}
          </span>
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.6, color: "#d8eef5", marginBottom: 14 }}>{item.blurb}</div>
        {item.cat !== "Pest" && (
          <div style={{ marginBottom: 14 }}>
            <div className="rb-h2" style={{ marginTop: 0, marginBottom: 8 }}>
              <Camera size={14} color="var(--teal)" /> Community photos
              <small>{communityPhotos.length || "none yet"}</small>
            </div>
            {communityPhotos.length > 0 ? (
              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
                {communityPhotos.map((cp) => (
                  <img key={cp.id} src={cp.photo_url} alt={cp.caption || ""} style={{ height: 96, borderRadius: 10, flex: "none", objectFit: "cover" }} />
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.5, marginBottom: 8 }}>
                No community photos of {item.name} yet — keep one? Add the first real photo and help other reefers ID it.
              </div>
            )}
            {/* Contribute — the legitimate, owned-by-consent way the library grows */}
            <input ref={contribRef} type="file" accept="image/*" style={{ display: "none" }}
              onChange={(e) => { const f = e.target.files && e.target.files[0]; if (f) contributePhoto(f); e.target.value = ""; }} />
            {contribDone ? (
              <div style={{ fontSize: 12.5, color: "var(--good)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                <Check size={14} /> Submitted for review — thanks for helping build Reefpedia!
              </div>
            ) : (
              <div className="rb-chip" style={{ marginTop: 6, borderStyle: "dashed", color: "var(--teal)", borderColor: "var(--brd-2)", opacity: contribBusy ? .6 : 1 }}
                onClick={() => !contribBusy && contribRef.current && contribRef.current.click()}>
                <Camera size={13} style={{ verticalAlign: -2, marginRight: 5 }} />{contribBusy ? "Uploading…" : "Add your photo"}
              </div>
            )}
          </div>
        )}
        <div className="rb-card" style={{ padding: "4px 14px", marginBottom: 14 }}>
          {item.facts.map(([k, v], i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0",
              borderBottom: i < item.facts.length - 1 ? "1px solid rgba(255,255,255,.06)" : "none" }}>
              <span style={{ fontSize: 12.5, color: "var(--muted)", minWidth: 108 }}>{k}</span>
              <span style={{ fontSize: 13.5, fontWeight: 600, flex: 1 }}>{v}</span>
            </div>
          ))}
        </div>
        {item.cat !== "Pest" && (
          <>
            <div className="rb-h2" style={{ marginTop: 4, marginBottom: 10 }}>
              <Users size={15} color="var(--aqua)" /> Who keeps this
              <small>{keepers === null ? "…" : keepers.length ? `${keepers.length} in the community` : "be the first"}</small>
            </div>
            <div className="rb-card" style={{ marginBottom: 14 }}>
              {keepers === null && <div className="rb-empty" style={{ padding: 18 }}>Looking…</div>}
              {keepers !== null && keepers.length === 0 && (
                <div className="rb-empty" style={{ padding: 18 }}>Nobody's logged this one yet. Add it to your tank and you'll be the first.</div>
              )}
              {(keepers || []).map((k, i) => (
                <div key={i} className="rb-li" style={{ gap: 11 }}>
                  <div className="rb-pa" style={{ background: `linear-gradient(140deg,${CAT_COLOR[item.cat]},var(--violet))`, width: 38, height: 38 }}>
                    {(k.handle || "?")[0].toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="nm">
                      @{k.handle}
                      {k.profile_id === uid && <span style={{ color: "var(--aqua)", fontSize: 11, marginLeft: 6 }}>you</span>}
                    </div>
                    <div className="sub" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {k.tank_name} · {k.tank_volume}g{k.item_note ? " · " + k.item_note : ""}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <div className="rb-iconbtn" style={{ width: 34, height: 34, borderRadius: 10 }}
                      title="View tank" onClick={() => onOpenTank(k.tank_id)}>
                      <Waves size={15} />
                    </div>
                    {k.profile_id !== uid && (
                      <div className="rb-iconbtn" style={{ width: 34, height: 34, borderRadius: 10 }}
                        title="Message" onClick={() => onMessage({ id: k.profile_id, handle: k.handle })}>
                        <MessageCircle size={15} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {tips && <div className="rb-card" style={{ padding: 14, marginBottom: 14, fontSize: 13.5, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{tips}</div>}
        <div style={{ display: "flex", gap: 10 }}>
          {!isPest && (
            <button className="rb-btn" style={{ flex: 1, padding: 13 }} onClick={() => onAddToTank(item)}>
              <Plus size={16} /> Add to tank
            </button>
          )}
          {!isPest && (
            <button className="rb-btn" style={{ flex: "none", padding: "13px 15px", background: wish ? "linear-gradient(120deg,var(--coral),#c2405c)" : undefined, color: wish ? "#fff" : undefined, opacity: wishBusy ? .6 : 1 }}
              onClick={toggleWish} title={wish ? "On your wishlist" : "Add to wishlist"}>
              <Heart size={16} fill={wish ? "#fff" : "none"} />
            </button>
          )}
          <button className="rb-btn violet" style={{ flex: 1, padding: 13 }} onClick={getTips} disabled={busy}>
            <Bot size={16} /> {busy ? "Asking…" : isPest ? "Eradication plan" : "Care tips"}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}


/* ---------------- Public tank view ---------------- */
function PublicTankSheet({ tankId, onClose, onMessage }) {
  const [data, setData] = useState(null);
  useEffect(() => { let alive = true; fetchPublicTank(tankId).then((d) => { if (alive) setData(d); }); return () => { alive = false; }; }, [tankId]);
  const t = data && data.tank;
  const owner = t && t.owner;
  const groups = ["Coral", "Fish", "Invert"];
  return (
    <div className="rb-overlay" onClick={onClose}>
      <div className="rb-sheet rb-split" onClick={(e) => e.stopPropagation()}>
        <div className="rb-sheet-h">
          <b>{t ? t.name : "Loading…"}</b>
          <div className="rb-iconbtn" onClick={onClose}><X size={18} /></div>
        </div>
        {!data && <div className="rb-empty">Loading tank…</div>}
        {t && (
          <>
            <div className="rb-split-media">
            <div className="rb-tankhero" style={{ height: 150, marginTop: 0 }}>
              <div className="light" /><div className="rock" />
              <div className="rb-coralbit" style={{ bottom: "38%", left: "30%", width: 14, height: 20, background: "#ff7a5c", borderRadius: "50% 50% 4px 4px" }} />
              <div className="rb-coralbit" style={{ bottom: "40%", left: "58%", width: 18, height: 12, background: "#3ce0a3" }} />
              <div style={{ position: "absolute", left: 14, bottom: 12 }}>
                <div style={{ fontFamily: "Bricolage Grotesque", fontWeight: 800, fontSize: 19 }}>{t.name}</div>
                <div style={{ color: "var(--muted)", fontSize: 12 }}>{t.model} · {t.volume_gal} gal · since {t.since}</div>
              </div>
            </div>
            <div className="rb-li" style={{ padding: "14px 0" }}>
              <div className="rb-pa" style={{ background: "linear-gradient(140deg,var(--aqua),var(--violet))" }}>
                {(owner && owner.handle ? owner.handle[0] : "?").toUpperCase()}
              </div>
              <div>
                <div className="nm">@{owner && owner.handle}</div>
                <div className="sub">{owner && owner.location}{owner && owner.reefing_since ? ` · reefing since ${owner.reefing_since}` : ""}</div>
              </div>
              <button className="rb-btn ghost" style={{ marginLeft: "auto", padding: "9px 13px" }}
                onClick={() => onMessage({ id: t.owner_id, handle: owner && owner.handle })}>
                <MessageCircle size={15} /> Message
              </button>
            </div>
            </div>
            <div className="rb-split-body">
            {groups.map((g) => {
              const items = data.stock.filter((s) => s.kind === g);
              if (!items.length) return null;
              return (
                <div key={g}>
                  <div className="rb-h2" style={{ marginTop: 14, marginBottom: 8 }}>
                    {g === "Fish" ? <Fish size={15} color="var(--coral)" /> : g === "Invert" ? <Shell size={15} color="var(--gold)" /> : <Waves size={15} color="var(--teal)" />}
                    {g === "Invert" ? "Inverts" : g + "s"} <small>{items.length}</small>
                  </div>
                  <div className="rb-card">
                    {items.map((s) => (
                      <div key={s.id} className="rb-li">
                        <div className="rb-thumb" style={{ background: `linear-gradient(140deg,${s.color || "#3fe3ff"},#0b2b3d)`, width: 38, height: 38 }}>
                          {g === "Fish" ? <Fish size={17} color="#04111a" /> : g === "Invert" ? <Shell size={17} color="#04111a" /> : <Waves size={17} color="#04111a" />}
                        </div>
                        <div><div className="nm">{s.name}</div>{s.note && <div className="sub">{s.note}</div>}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            <div style={{ textAlign: "center", color: "var(--muted-2)", fontSize: 11, marginTop: 14 }}>
              Test results are only shared if the owner opts in.
            </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------- Message composer ---------------- */
function MessageSheet({ to, onClose, onSend }) {
  const sp = to.species;
  const quick = sp ? [
    `Awesome ${sp.name}! 🔥`,
    `How long have you kept your ${sp.name}?`,
    `Any tips for keeping ${sp.name} happy?`,
    `What are you feeding your ${sp.name}?`,
  ] : ["Hey! 👋"];
  const [body, setBody] = useState(to.prefill || "");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const send = async () => {
    if (!body.trim()) return;
    setBusy(true);
    try { await onSend(to.id, body.trim(), sp ? sp.id : null); setSent(true); }
    catch (e) { /* surfaced below */ }
    setBusy(false);
  };
  return (
    <div className="rb-overlay" onClick={onClose}>
      <div className="rb-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="rb-sheet-h">
          <b>Message @{to.handle}</b>
          <div className="rb-iconbtn" onClick={onClose}><X size={18} /></div>
        </div>
        {sent ? (
          <div className="rb-empty" style={{ padding: "36px 20px" }}>
            <Check size={30} color="var(--good)" />
            <div style={{ marginTop: 12, color: "var(--text)", fontWeight: 600 }}>Sent to @{to.handle}</div>
            <div style={{ marginTop: 6 }}>Find their reply in Messages.</div>
            <button className="rb-btn" style={{ marginTop: 16, padding: "11px 20px" }} onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            {sp && (
              <div className="rb-card" style={{ display: "flex", gap: 11, padding: 11, marginBottom: 14, alignItems: "center" }}>
                <div style={{ width: 46, height: 46, borderRadius: 11, overflow: "hidden", flex: "none" }}>
                  <SpeciesPhoto item={sp} height={46} radius={11} />
                </div>
                <div><div style={{ fontSize: 12, color: "var(--muted)" }}>About their</div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{sp.name}</div></div>
              </div>
            )}
            <div className="rb-tabs" style={{ margin: "0 0 12px", flexWrap: "wrap" }}>
              {quick.map((q, i) => (
                <div key={i} className="rb-chip" style={{ fontSize: 12 }} onClick={() => setBody(q)}>{q}</div>
              ))}
            </div>
            <textarea className="rb-input" rows={4} placeholder="Say something nice, or ask for advice…"
              value={body} onChange={(e) => setBody(e.target.value)} />
            <button className="rb-btn" style={{ width: "100%", marginTop: 12, padding: 13 }} disabled={!body.trim() || busy} onClick={send}>
              <Send size={16} /> {busy ? "Sending…" : "Send message"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------- Shop ---------------- */
function Shop({ allListings, cat, setCat, uid, onMessage }) {
  const [sel, setSel] = useState(null);
  const cats = ["All", "Coral", "Fish", "Equipment"];
  const shown = cat === "All" ? allListings : allListings.filter((l) => l.cat === cat);
  return (
    <div className="rb-fadein">
      <div className="rb-tabs" style={{ marginTop: 6 }}>
        {cats.map((c) => <div key={c} className={"rb-chip" + (cat === c ? " on" : "")} onClick={() => setCat(c)}>{c}</div>)}
      </div>
      {shown.length === 0 ? (
        <div className="rb-card rb-empty" style={{ padding: "36px 22px", marginTop: 4 }}>
          <Store size={28} color="var(--aqua)" style={{ opacity: .8 }} />
          <div style={{ marginTop: 10, fontWeight: 600, color: "var(--text)" }}>
            {cat === "All" ? "No listings yet" : `No ${cat.toLowerCase()} listings`}
          </div>
          <div style={{ marginTop: 6 }}>
            {cat === "All" ? "Frags, fish, and gear from the community will show up here. List something from your Profile → Seller Hub." : "Try another category, or check back soon."}
          </div>
        </div>
      ) : (
      <div className="rb-mgrid">
        {shown.map((l) => (
          <div key={l.id} className="rb-card rb-mcard" style={{ cursor: "pointer" }} onClick={() => setSel(l)}>
            <div className="rb-mimg" style={{ background: `linear-gradient(140deg,${l.g[0]},${l.g[1]})` }}>
              <span className="cat">{l.cat}</span>
              {l.cat === "Fish" ? <Fish size={30} /> : l.cat === "Equipment" ? <Droplets size={30} /> : <Waves size={30} />}
            </div>
            <div className="rb-mbody">
              <div className="t">{l.title}</div><div className="p">${l.price}</div>
              <div className="loc"><MapPin size={11} /> {l.loc} · @{l.seller}</div>
            </div>
          </div>
        ))}
      </div>
      )}
      {sel && <ListingSheet listing={sel} uid={uid} onClose={() => setSel(null)} onMessage={onMessage} />}
    </div>
  );
}

function ListingSheet({ listing: l, uid, onClose, onMessage }) {
  const mine = l.sellerId === uid;
  return (
    <div className="rb-overlay" onClick={onClose}>
      <div className="rb-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="rb-sheet-h"><b>Listing</b><div className="rb-iconbtn" onClick={onClose}><X size={18} /></div></div>
        <div style={{ height: 150, borderRadius: 16, background: `linear-gradient(140deg,${l.g[0]},${l.g[1]})`, display: "grid", placeItems: "center", position: "relative", marginBottom: 14 }}>
          <span style={{ position: "absolute", top: 10, left: 10, fontSize: 11, background: "rgba(3,8,12,.72)", color: "#fff", padding: "3px 10px", borderRadius: 20 }}>{l.cat}</span>
          {l.cat === "Fish" ? <Fish size={44} color="rgba(4,17,26,.55)" /> : l.cat === "Equipment" ? <Droplets size={44} color="rgba(4,17,26,.55)" /> : <Waves size={44} color="rgba(4,17,26,.55)" />}
        </div>
        <div style={{ fontFamily: "Bricolage Grotesque", fontWeight: 800, fontSize: 21 }}>{l.title}</div>
        <div style={{ fontFamily: "Bricolage Grotesque", fontWeight: 800, fontSize: 24, color: "var(--aqua)", marginTop: 2 }}>${l.price}</div>
        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 6, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <MapPin size={12} /> {l.loc || "Location not set"} · listed by @{l.seller}{l.created_at ? ` · ${rel(l.created_at)}` : ""}
        </div>
        {l.description && <div style={{ fontSize: 13.5, color: "#d8eef5", lineHeight: 1.55, marginTop: 12 }}>{l.description}</div>}
        {mine ? (
          <div className="rb-card" style={{ padding: 12, marginTop: 16, textAlign: "center", fontSize: 12.5, color: "var(--muted)" }}>This is your listing.</div>
        ) : (
          <button className="rb-btn" style={{ width: "100%", marginTop: 16, padding: 14 }}
            onClick={() => { onClose(); onMessage({ id: l.sellerId, handle: l.seller }, `Hi! Is your "${l.title}" ($${l.price}) still available?`); }}>
            <Send size={16} /> Message @{l.seller}
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------------- Tasks ---------------- */
function Tasks({ state, latest, completeTask, addTask, updateTask, deleteTask, switchTank }) {
  const [edit, setEdit] = useState(null);      // task being edited, or "new"
  const [aiOpen, setAiOpen] = useState(false);
  const [doneIds, setDoneIds] = useState({});

  const sorted = [...state.tasks].sort((a, b) => a.due - b.due);
  const overdue = sorted.filter((t) => daysUntil(t.due) < 0);
  const soon = sorted.filter((t) => daysUntil(t.due) === 0);
  const later = sorted.filter((t) => daysUntil(t.due) > 0);

  const done = (t) => {
    setDoneIds((d) => ({ ...d, [t.id]: true }));           // instant visual confirmation
    setTimeout(() => {
      completeTask(t.id);                                   // then reschedule/remove
      setDoneIds((d) => { const n = { ...d }; delete n[t.id]; return n; });
    }, 450);
  };

  const Group = ({ title, items, color }) => items.length === 0 ? null : (
    <>
      <div className="rb-h2"><ListChecks size={16} color={color} /> {title} <small>{items.length}</small></div>
      <div className="rb-card">
        {items.map((t) => {
          const d = dueLabel(t.due);
          const isDone = !!doneIds[t.id];
          return (
            <div key={t.id} className={"rb-task" + (isDone ? " completing" : "")} style={{ cursor: "default" }}>
              <div className={"rb-check" + (isDone ? " done" : "")} onClick={() => !isDone && done(t)} title="Complete">
                <Check size={15} style={{ opacity: isDone ? 1 : 0 }} />
              </div>
              <div style={{ flex: 1, cursor: "pointer" }} onClick={() => setEdit(t)}>
                <div className="nm">{t.name}</div>
                <div className={"when " + d.c}>{d.t} · {t.every}</div>
              </div>
              <div className="rb-iconbtn" style={{ width: 32, height: 32, borderRadius: 10 }} onClick={() => setEdit(t)} title="Edit">
                <PenSquare size={14} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );

  return (
    <>
    <div className="rb-fadein">
      <TankSwitcher tanks={state.tanks} tankId={state.tankId} switchTank={switchTank} />

      <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
        <button className="rb-btn" style={{ flex: 1, padding: 13 }} onClick={() => setEdit("new")}>
          <Plus size={16} /> New task
        </button>
        <button className="rb-btn violet" style={{ flex: 1, padding: 13 }} onClick={() => setAiOpen(true)}>
          <Bot size={16} /> AI schedule help
        </button>
      </div>

      <div style={{ fontSize: 12, color: "var(--muted)", margin: "12px 2px 0", textAlign: "center" }}>
        Tap the circle to complete · tap the task to edit · +2 Pearls each
      </div>

      {state.tasks.length === 0 && (
        <div className="rb-card rb-empty" style={{ marginTop: 14, padding: "34px 20px" }}>
          <ListChecks size={28} color="var(--aqua)" style={{ opacity: .85 }} />
          <div style={{ marginTop: 10, fontWeight: 600, color: "var(--text)" }}>No tasks yet</div>
          <div style={{ marginTop: 6 }}>Build your own schedule, or let DeepDive suggest one based on this tank's parameters and livestock.</div>
        </div>
      )}

      {state.tasks.length > 0 && overdue.length === 0 && soon.length === 0 && (
        <div className="rb-card" style={{ marginTop: 14, padding: "22px 20px", textAlign: "center" }}>
          <Check size={26} color="var(--good)" />
          <div style={{ marginTop: 8, fontWeight: 600 }}>All caught up on {state.tank.name}</div>
          <div style={{ marginTop: 4, fontSize: 13, color: "var(--muted)" }}>
            Next up {fmtDate(later[0].due)} — nothing due today.
          </div>
        </div>
      )}

      <Group title="Overdue" items={overdue} color="var(--bad)" />
      <Group title="Due today" items={soon} color="var(--warn)" />
      <Group title="Coming up" items={later} color="var(--aqua)" />

    </div>

      {edit && (
        <TaskSheet task={edit === "new" ? null : edit}
          onClose={() => setEdit(null)}
          onSave={(name, every, due) => {
            if (edit === "new") addTask(name, every, due);
            else updateTask(edit.id, name, every, due);
            setEdit(null);
          }}
          onDelete={edit === "new" ? null : () => { deleteTask(edit.id); setEdit(null); }} />
      )}
      {aiOpen && (
        <AIScheduleSheet state={state} latest={latest} onClose={() => setAiOpen(false)}
          onAdd={(name, every) => addTask(name, every, Date.now())} />
      )}
    </>
  );
}

/* ---------------- Task editor ---------------- */
function TaskSheet({ task, onClose, onSave, onDelete }) {
  const [name, setName] = useState(task ? task.name : "");
  const [every, setEvery] = useState(task ? task.every : "Weekly");
  const [when, setWhen] = useState(() => {
    const d = new Date(task ? task.due : Date.now());
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  });
  const [confirmDel, setConfirmDel] = useState(false);
  return (
    <div className="rb-overlay" onClick={onClose}>
      <div className="rb-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="rb-sheet-h">
          <b>{task ? "Edit task" : "New task"}</b>
          <div className="rb-iconbtn" onClick={onClose}><X size={18} /></div>
        </div>
        <div className="rb-field">
          <label>Task</label>
          <input className="rb-input" placeholder="e.g. Water change (5 gal)" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </div>
        <div className="rb-field">
          <label>Repeats</label>
          <div className="rb-tabs" style={{ margin: 0, flexWrap: "wrap" }}>
            {EVERY_OPTS.map((o) => (
              <div key={o} className={"rb-chip" + (every === o ? " on" : "")} style={{ fontSize: 12 }} onClick={() => setEvery(o)}>{o}</div>
            ))}
          </div>
        </div>
        <div className="rb-field">
          <label>Next due</label>
          <input className="rb-input" type="date" value={when} onChange={(e) => setWhen(e.target.value)} />
        </div>
        <button className="rb-btn" style={{ width: "100%", padding: 14 }} disabled={!name.trim()}
          onClick={() => onSave(name.trim(), every, new Date(when + "T09:00").getTime())}>
          <Check size={16} /> {task ? "Save changes" : "Add task"}
        </button>
        {onDelete && (
          confirmDel ? (
            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <button className="rb-btn ghost" style={{ flex: 1 }} onClick={() => setConfirmDel(false)}>Cancel</button>
              <button className="rb-btn" style={{ flex: 1, background: "var(--bad)", color: "#fff" }} onClick={onDelete}>Delete for good</button>
            </div>
          ) : (
            <button className="rb-btn ghost" style={{ width: "100%", marginTop: 10, color: "var(--bad)", borderColor: "rgba(255,93,114,.4)" }}
              onClick={() => setConfirmDel(true)}>Delete task</button>
          )
        )}
      </div>
    </div>
  );
}

/* ---------------- AI schedule builder ---------------- */
function AIScheduleSheet({ state, latest, onClose, onAdd }) {
  const [busy, setBusy] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [added, setAdded] = useState({});
  const [err, setErr] = useState("");
  const t = state.tank;

  const ask = async () => {
    if (!(await gateAI("deepdive"))) return;
    setBusy(true); setErr("");
    const params = state.history.length
      ? PARAMS.map((p) => { const lv = lastVal(state.history, p.key); return lv ? `${p.label} ${lv.v}${p.unit} (${statusOf(p, lv.v)})` : null; }).filter(Boolean).join(", ")
      : "no test results logged yet";
    const stock = state.livestock.length
      ? state.livestock.map((l) => `${l.name} (${l.type})`).join(", ") : "nothing logged yet";
    const current = state.tasks.length
      ? state.tasks.map((x) => `${x.name} — ${x.every}`).join("; ") : "no tasks yet";
    const prompt =
      `Build a maintenance schedule for this reef tank.\n` +
      `Tank: ${t.name} — ${t.model}, ${t.volume} gallons, running since ${t.since}.\n` +
      `Latest parameters: ${params}.\n` +
      `Livestock: ${stock}.\n` +
      `Tasks they already have: ${current}.\n\n` +
      `Suggest 5-8 maintenance tasks tailored to THIS tank — consider its size, what lives in it, and especially any ` +
      `parameters that are drifting (address those directly). Don't duplicate tasks they already have; suggest what's MISSING.\n` +
      `Reply with ONLY a JSON array, no markdown, no preamble:\n` +
      `[{"name":"Water change (5 gal)","every":"Weekly","why":"one short sentence explaining why THIS tank needs it"}]\n` +
      `The "every" field must be exactly one of: ${EVERY_OPTS.join(", ")}.`;
    try {
      const raw = await askReefAI([{ role: "user", content: prompt }],
        "You are Tidepool Reef DeepDive, an expert reef-aquarium advisor. Reply with valid JSON only — no markdown fences, no commentary.", "deepdive");
      const clean = raw.replace(/```json|```/g, "").trim();
      const jsonStart = clean.indexOf("[");
      const parsed = JSON.parse(clean.slice(jsonStart, clean.lastIndexOf("]") + 1));
      setSuggestions(parsed.filter((s) => s && s.name && EVERY_OPTS.includes(s.every)));
    } catch (e) {
      setErr("DeepDive couldn't build a schedule just now — try again.");
    }
    setBusy(false);
  };

  useEffect(() => { ask(); }, []);

  return (
    <div className="rb-overlay" onClick={onClose}>
      <div className="rb-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="rb-sheet-h">
          <b style={{ display: "flex", alignItems: "center", gap: 8 }}><Bot size={18} color="var(--aqua)" /> Schedule for {t.name}</b>
          <div className="rb-iconbtn" onClick={onClose}><X size={18} /></div>
        </div>

        {busy && (
          <div className="rb-empty" style={{ padding: "34px 20px" }}>
            <div className="rb-typing" style={{ justifyContent: "center" }}><i /><i /><i /></div>
            <div style={{ marginTop: 12 }}>Reading this tank's parameters and livestock…</div>
          </div>
        )}
        {err && <div className="rb-card" style={{ padding: 16, color: "var(--warn)", fontSize: 13.5 }}>{err}</div>}

        {suggestions && suggestions.length > 0 && (
          <>
            <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 12, lineHeight: 1.5 }}>
              Based on {t.volume} gallons, {state.livestock.length} inhabitants
              {latest ? ", and your latest test results" : ""}. Tap to add any you want.
            </div>
            {suggestions.map((s, i) => (
              <div key={i} className="rb-card" style={{ padding: 14, marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: "var(--aqua)", marginTop: 2 }}>{s.every}</div>
                    {s.why && <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 6, lineHeight: 1.5 }}>{s.why}</div>}
                  </div>
                  <button className={"rb-btn" + (added[i] ? " ghost" : "")} style={{ padding: "9px 14px", flex: "none" }}
                    disabled={added[i]}
                    onClick={() => { onAdd(s.name, s.every); setAdded((a) => ({ ...a, [i]: true })); }}>
                    {added[i] ? <><Check size={14} /> Added</> : <><Plus size={14} /> Add</>}
                  </button>
                </div>
              </div>
            ))}
            <button className="rb-btn ghost" style={{ width: "100%", marginTop: 4, padding: 12 }}
              onClick={() => {
                suggestions.forEach((s, i) => { if (!added[i]) onAdd(s.name, s.every); });
                setAdded(Object.fromEntries(suggestions.map((_, i) => [i, true])));
              }}>
              Add all remaining
            </button>
          </>
        )}
        {suggestions && suggestions.length === 0 && !busy && (
          <div className="rb-empty" style={{ padding: 24 }}>DeepDive thinks your current schedule already covers this tank. Nice.</div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Tracker ---------------- */
function Tracker({ state, latest, sel, setSel, addLivestock, endLivestock, hideLivestock, livestockOnly, uid, profile }) {
  const [addOpen, setAddOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const p = PARAMS.find((x) => x.key === sel);
  const [range, setRange] = useState(90);            // days; 0 = all; "custom"
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [aiBusy, setAiBusy] = useState(false);

  const RANGES = [["3d", 3], ["5d", 5], ["7d", 7], ["14d", 14], ["30d", 30], ["90d", 90], ["All", 0]];
  const now = Date.now();
  const useCustom = range === "custom" && customFrom && customTo;
  const fromTs = useCustom ? new Date(customFrom + "T00:00").getTime() : (range && range !== "custom" ? now - range * dayMs : 0);
  const toTs = useCustom ? new Date(customTo + "T23:59").getTime() : now;

  const chartData = state.history
    .filter((h) => h.date >= fromTs && h.date <= toTs && h[sel] != null)
    .map((h) => ({ date: h.date, v: h[sel] }));
  const seriesAll = state.history.filter((h) => h[sel] != null);
  const prev = seriesAll.length > 1 ? seriesAll[seriesAll.length - 2][sel] : (seriesAll[0] ? seriesAll[0][sel] : 0);
  const cur = seriesAll.length ? seriesAll[seriesAll.length - 1][sel] : null;
  const delta = cur != null ? +(cur - prev).toFixed(p.dec) : 0;

  const vals = chartData.map((d) => d.v).filter((v) => v != null);
  const stats = vals.length ? {
    min: Math.min(...vals), max: Math.max(...vals),
    avg: +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(p.dec),
    first: vals[0], last: vals[vals.length - 1], n: vals.length,
  } : null;
  const rangeLabel = useCustom ? `${fmtDate(fromTs)} – ${fmtDate(toTs)}` : (range && range !== "custom" ? `last ${range} days` : "all time");

  useEffect(() => { setAiSummary(""); }, [sel, range, customFrom, customTo]);

  const summarize = async () => {
    if (!stats) return;
    if (!(await gateAI("deepdive"))) return;
    setAiBusy(true);
    const series = chartData.map((d) => `${fmtDate(d.date)}: ${d.v}`).join(", ");
    const prompt =
      `Summarize the trend for ${p.label} in a reef tank over ${rangeLabel}. ` +
      `Target range is ${p.ideal[0]}–${p.ideal[1]} ${p.unit}. ` +
      `Readings (${stats.n}): ${series}. ` +
      `Min ${stats.min}, max ${stats.max}, average ${stats.avg}, started ${stats.first}, ended ${stats.last}. ` +
      `In 2-3 short sentences: is it stable or drifting, in or out of range, and one specific suggestion if needed. Be direct.`;
    try {
      const r = await askReefAI([{ role: "user", content: prompt }],
        "You are Tidepool Reef DeepDive, a concise expert reef-aquarium advisor. 2-3 sentences max, specific and practical.", "deepdive");
      setAiSummary(r || "Couldn't generate a summary right now.");
    } catch (e) { setAiSummary("DeepDive error: " + (e.message || "connection failed")); }
    setAiBusy(false);
  };
  return (
    <div className="rb-fadein">
      {!livestockOnly && (<>
      <div className="rb-h2" style={{ marginTop: 6 }}><FlaskConical size={16} color="var(--aqua)" /> Parameters <small>tap to chart</small></div>
      {!latest && (
        <div className="rb-card rb-empty" style={{ padding: "34px 20px" }}>
          <Beaker size={28} color="var(--aqua)" style={{ opacity: .85 }} />
          <div style={{ marginTop: 10, fontWeight: 600, color: "var(--text)" }}>No test results yet</div>
          <div style={{ marginTop: 5 }}>Tap the flask button below to log your first reading — charts and health tracking start from there.</div>
        </div>
      )}
      {latest && (<div className="rb-cols2">
      <div className="rb-grid">
        {PARAMS.map((pp) => {
          const st = statusOf(pp, latest[pp.key]);
          return (
            <div key={pp.key} className={"rb-card rb-pcard" + (sel === pp.key ? " sel" : "")} onClick={() => setSel(pp.key)}>
              <div className="top"><span className="lbl">{pp.label}</span><span className={"rb-sdot " + sclass[st]} /></div>
              <div className="val">{latest[pp.key]}<u>{pp.unit}</u></div>
              <div className="rb-trend">target {pp.ideal[0]}–{pp.ideal[1]}</div>
            </div>
          );
        })}
      </div>
      <div className="rb-card rb-chartwrap" style={{ marginTop: 12 }}>
        <div className="rb-chart-h"><b>{p.label} trend</b>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>{rangeLabel}{stats ? ` · ${stats.n} readings` : ""}</span>
        </div>

        <div className="rb-tabs" style={{ margin: "0 0 6px", padding: "0 10px", flexWrap: "wrap" }}>
          {RANGES.map(([lbl, d]) => {
            const count = d ? state.history.filter((h) => h.date >= now - d * dayMs && h[sel] != null).length : state.history.filter((h) => h[sel] != null).length;
            const empty = count === 0;
            return (
              <div key={lbl} className={"rb-chip" + (range === d && range !== "custom" ? " on" : "")}
                style={{ fontSize: 11.5, opacity: empty ? 0.35 : 1, cursor: empty ? "not-allowed" : "pointer" }}
                onClick={() => !empty && setRange(d)}>{lbl}</div>
            );
          })}
          <div className={"rb-chip" + (range === "custom" ? " on" : "")} style={{ fontSize: 11.5 }}
            onClick={() => setRange(range === "custom" ? 90 : "custom")}>Custom</div>
        </div>

        {range === "custom" && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "4px 12px 10px", flexWrap: "wrap" }}>
            <input className="rb-input" type="date" value={customFrom} max={customTo || undefined}
              onChange={(e) => setCustomFrom(e.target.value)} style={{ flex: 1, minWidth: 130, fontSize: 12.5 }} />
            <span style={{ color: "var(--muted)", fontSize: 12 }}>to</span>
            <input className="rb-input" type="date" value={customTo} min={customFrom || undefined}
              onChange={(e) => setCustomTo(e.target.value)} style={{ flex: 1, minWidth: 130, fontSize: 12.5 }} />
          </div>
        )}

        {stats && (
          <div style={{ display: "flex", gap: 16, padding: "2px 12px 10px", flexWrap: "wrap" }}>
            {[["Low", stats.min], ["Avg", stats.avg], ["High", stats.max]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>{k}</span>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{v}</span>
                <span style={{ fontSize: 10.5, color: "var(--muted-2)" }}>{p.unit}</span>
              </div>
            ))}
          </div>
        )}

        {chartData.length === 0 && (
          <div className="rb-empty" style={{ padding: "30px 20px" }}>No readings in this range. Pick a wider window.</div>
        )}

        {chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 8, right: 14, left: -8, bottom: 4 }}>
            <CartesianGrid stroke="rgba(255,255,255,.05)" vertical={false} />
            <ReferenceArea y1={p.ideal[0]} y2={p.ideal[1]} fill="#3ce0a3" fillOpacity={0.1} />
            <XAxis dataKey="date" tickFormatter={fmtDate} stroke="var(--muted-2)" fontSize={11} tickLine={false} axisLine={false} minTickGap={28} />
            <YAxis domain={[p.min, p.max]} stroke="var(--muted-2)" fontSize={11} tickLine={false} axisLine={false} width={42} />
            <Tooltip content={({ active, payload }) => active && payload && payload.length ? (
              <div style={{ background: "var(--bg-2)", border: "1px solid var(--brd-2)", borderRadius: 10, padding: "7px 11px", fontSize: 12 }}>
                <div style={{ color: "var(--muted)" }}>{fmtDate(payload[0].payload.date)}</div>
                <div style={{ fontWeight: 700, color: "var(--aqua)" }}>{payload[0].value} {p.unit}</div>
              </div>) : null} />
            <Line type="monotone" dataKey="v" stroke="var(--aqua)" strokeWidth={2.5} dot={{ r: 2.5, fill: "var(--aqua)" }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
        )}

        {stats && (
          <div style={{ padding: "6px 12px 4px" }}>
            {!aiSummary && !aiBusy && (
              <button className="rb-btn violet" style={{ width: "100%", padding: 12 }} onClick={summarize}>
                <Bot size={16} /> Summarize this {rangeLabel} with AI
              </button>
            )}
            {aiBusy && (
              <div className="rb-card" style={{ padding: 14, display: "flex", alignItems: "center", gap: 10, background: "rgba(176,108,255,.08)" }}>
                <div className="rb-typing"><i /><i /><i /></div>
                <span style={{ fontSize: 13, color: "var(--muted)" }}>Reading {stats.n} {p.label} points…</span>
              </div>
            )}
            {aiSummary && !aiBusy && (
              <div className="rb-card" style={{ padding: 14, background: "rgba(176,108,255,.08)", border: "1px solid rgba(176,108,255,.25)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
                  <Bot size={15} color="var(--violet)" />
                  <b style={{ fontSize: 12.5, color: "var(--violet)" }}>DeepDive · {p.label} over {rangeLabel}</b>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--muted)", cursor: "pointer" }} onClick={summarize}>refresh</span>
                </div>
                <div style={{ fontSize: 13.5, lineHeight: 1.55, color: "#e8f4f8", whiteSpace: "pre-wrap" }}>{aiSummary}</div>
              </div>
            )}
          </div>
        )}
      </div>
      </div>)}
      </>)}
      {!hideLivestock && (<>
      {(() => {
        const active = state.livestock.filter((l) => (l.status || "alive") === "alive");
        const archived = state.livestock.filter((l) => (l.status || "alive") !== "alive");
        return (<>
        <div className="rb-h2"><Fish size={16} color="var(--teal)" /> Livestock <small>{active.length} in tank</small></div>
        {(() => {
          const spent = state.livestock.filter((l) => l.price != null && l.price !== "").reduce((a, l) => a + Number(l.price || 0), 0);
          if (!spent) return null;
          const by = {};
          state.livestock.forEach((l) => { if (l.price) by[l.type] = (by[l.type] || 0) + Number(l.price); });
          return (
            <div className="rb-card" style={{ padding: "13px 16px", marginBottom: 10, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: .6 }}>INVESTED IN {String((state.tank && state.tank.name) || "THIS TANK").toUpperCase()}</div>
                <div style={{ fontFamily: "Bricolage Grotesque", fontWeight: 800, fontSize: 24, marginTop: 2, color: "var(--aqua)" }}>${spent.toLocaleString()}</div>
              </div>
              <div style={{ fontSize: 11.5, color: "var(--muted)", textAlign: "right", lineHeight: 1.6 }}>
                {Object.entries(by).map(([k, v]) => <div key={k}>{k}s · ${Number(v).toLocaleString()}</div>)}
              </div>
            </div>
          );
        })()}
        <button className="rb-btn" style={{ width: "100%", marginBottom: 10, padding: 12 }} onClick={() => setAddOpen(true)}>
          <Plus size={16} /> Add livestock
        </button>
        <div className="rb-card">
          {active.length === 0 && <div className="rb-empty">Nothing in the tank yet — tap "Add livestock" to log your first coral, fish, or invert.</div>}
          {active.map((l) => (
            <div key={l.id} className="rb-li" style={{ cursor: "pointer" }} onClick={() => setDetailItem(l)}>
              {l.photo
                ? <img src={l.photo} alt="" className="rb-thumb" style={{ objectFit: "cover" }} />
                : <div className="rb-thumb" style={{ background: `linear-gradient(140deg,${l.c},#0b2b3d)` }}>
                    {l.type === "Fish" ? <Fish size={20} color="#04111a" /> : l.type === "Coral" ? <Waves size={20} color="#04111a" /> : <Shell size={20} color="#04111a" />}
                  </div>}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="nm">{l.name}</div>
                <div className="sub">{l.type}{l.price != null ? ` · $${l.price}` : ""}{l.acquiredAt ? ` · ${fmtAcq(l.acquiredAt)}` : ""}</div>
              </div>
              <ChevronRight size={17} color="var(--muted)" style={{ flex: "none" }} />
            </div>
          ))}
        </div>

        {archived.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <div className="rb-h2" style={{ cursor: "pointer" }} onClick={() => setShowArchived((v) => !v)}>
              <Clock size={15} color="var(--muted)" /> Past livestock <small>{archived.length} · {showArchived ? "hide" : "show"}</small>
            </div>
            {showArchived && (
              <div className="rb-card">
                {archived.map((l) => (
                  <div key={l.id} className="rb-li" style={{ cursor: "pointer", opacity: .7 }} onClick={() => setDetailItem(l)}>
                    <div className="rb-thumb" style={{ background: "linear-gradient(140deg,#3a4a55,#0b2b3d)" }}>
                      {l.status === "died" ? <span style={{ fontSize: 15 }}>🕊️</span> : l.type === "Fish" ? <Fish size={18} color="#04111a" /> : l.type === "Coral" ? <Waves size={18} color="#04111a" /> : <Shell size={18} color="#04111a" />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="nm">{l.name}</div>
                      <div className="sub" style={{ textTransform: "capitalize" }}>{l.status}{l.endedAt ? ` · ${fmtAcq(l.endedAt)}` : ""}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {addOpen && <AddLivestockSheet uid={uid} onClose={() => setAddOpen(false)} onAdd={addLivestock} />}
        {detailItem && <LivestockDetailSheet item={detailItem} uid={uid} profile={profile} onClose={() => setDetailItem(null)} onEnd={endLivestock} />}
        </>);
      })()}
      </>)}
    </div>
  );
}

const fmtAcq = (d) => { try { return new Date(d + "T00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); } catch (e) { return d; } };

function AddLivestockSheet({ uid, onClose, onAdd, prefill, tanks, activeTankId }) {
  const pf = prefill || {};
  const [kind, setKind] = useState(pf.kind || "Coral");
  const [name, setName] = useState(pf.name || "");
  const [pick, setPick] = useState(pf.species || null);   // {id, name, ...} linked Reefpedia entry
  const [price, setPrice] = useState("");
  const [source, setSource] = useState("");
  const [size, setSize] = useState("");
  const [acquiredAt, setAcquiredAt] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState(null);   // {url, file}
  const [busy, setBusy] = useState(false);
  const [tankId, setTankId] = useState(activeTankId || (tanks && tanks[0] && tanks[0].id) || null);
  const photoRef = useRef(null);
  const showTankPicker = tanks && tanks.length > 1;
  const KIND_CATS = { Coral: ["SPS", "LPS", "Soft"], Fish: ["Fish"], Invert: ["Invert"] };
  const q = name.trim().toLowerCase();
  const matches = q.length < 2 || pick ? [] : REEFPEDIA
    .filter((r) => KIND_CATS[kind].includes(r.cat) && (r.name.toLowerCase().includes(q) || r.sci.toLowerCase().includes(q))).slice(0, 5);

  const [fit, setFit] = useState("");        // AI compatibility result
  const [fitBusy, setFitBusy] = useState(false);
  const checkFit = async () => {
    if (!pick || fitBusy) return;
    setFitBusy(true); setFit("");
    try {
      if (!(await gateAI("deepdive"))) { setFitBusy(false); return; }
      const t = (tanks || []).find((x) => x.id === tankId);
      const { data: stock } = await supabase.from("livestock").select("name, kind, status").eq("tank_id", tankId);
      const alive = (stock || []).filter((s) => (s.status || "alive") === "alive").map((s) => `${s.name} (${s.kind})`).join(", ") || "nothing yet";
      const SYS = "You are Tidepool Reef's stocking advisor. Answer in 2-3 honest sentences: will this species work in this tank? Consider adult size vs tank volume, temperament vs existing livestock, and bioload. If it's a bad fit, say so plainly and why.";
      const q = `Species: ${pick.name} (${pick.sci}). Tank: "${t ? t.name : "tank"}", ${t ? t.volume : "?"} gallons. Current livestock: ${alive}.`;
      const reply = await askReefAI([{ role: "user", content: q }], SYS, "deepdive");
      setFit(reply || "Couldn't run the check just now.");
    } catch (e) { setFit("Couldn't run the check just now."); }
    setFitBusy(false);
  };

  const save = async () => {
    if (!name.trim() || busy) return;
    setBusy(true);
    let photoUrl = null;
    if (photo) { photoUrl = await uploadPhoto(photo.file, uid); }
    await onAdd(kind, name.trim(), note.trim() || null, pick && pick.id, {
      price, source: source.trim(), size: size.trim(), acquiredAt, photoUrl, tankId,
    });
    setBusy(false); onClose();
  };

  return (
    <div className="rb-overlay" onClick={onClose}>
      <div className="rb-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="rb-sheet-h"><b>Add livestock</b><div className="rb-iconbtn" onClick={onClose}><X size={18} /></div></div>

        <div className="rb-field"><label>Type</label>
          <div className="rb-tabs" style={{ margin: 0 }}>
            {["Coral", "Fish", "Invert"].map((k) => <div key={k} className={"rb-chip" + (kind === k ? " on" : "")} onClick={() => { setKind(k); setPick(null); }}>{k}</div>)}
          </div>
        </div>

        {showTankPicker && (
          <div className="rb-field"><label>Add to which tank?</label>
            <div className="rb-tabs" style={{ margin: 0, flexWrap: "wrap" }}>
              {tanks.map((t) => <div key={t.id} className={"rb-chip" + (tankId === t.id ? " on" : "")} onClick={() => setTankId(t.id)}>{t.name} <span style={{ opacity: .6, fontSize: 11 }}>· {t.volume}g</span></div>)}
            </div>
          </div>
        )}

        <div className="rb-field"><label>Name</label>
          <input className="rb-input" placeholder={kind === "Fish" ? "e.g. Royal Gramma" : kind === "Invert" ? "e.g. Cleaner Shrimp" : "e.g. Gold Torch"}
            value={name} onChange={(e) => { setName(e.target.value); setPick(null); }} />
          {pick ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, fontSize: 12.5, color: "var(--muted)" }}>
              <Check size={14} color="var(--good)" /> Linked to <b style={{ color: "var(--text)" }}>{pick.name}</b> in Reefpedia
              <span style={{ marginLeft: "auto", cursor: "pointer", color: "var(--muted-2)" }} onClick={() => setPick(null)}>clear</span>
            </div>
          ) : null}
          {pick && (
            <div style={{ marginTop: 8 }}>
              {!fit && (
                <div className="rb-chip" style={{ borderStyle: "dashed", color: "var(--aqua)", borderColor: "var(--brd-2)", opacity: fitBusy ? .6 : 1 }} onClick={checkFit}>
                  ✓ {fitBusy ? "Checking fit…" : "Will it work in this tank? (AI check)"}
                </div>
              )}
              {fit && (
                <div className="rb-card" style={{ padding: "10px 13px", fontSize: 12.5, lineHeight: 1.55, color: "var(--muted)", border: "1px solid var(--brd-2)" }}>
                  <b style={{ color: "var(--aqua)" }}>Fit check:</b> {fit}
                </div>
              )}
            </div>
          )}
          {!pick && matches.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 11.5, color: "var(--muted)", marginBottom: 6 }}>Link to a species (helps others find you as a keeper):</div>
              <div className="rb-tabs" style={{ margin: 0, flexWrap: "wrap" }}>
                {matches.map((m) => <div key={m.id} className="rb-chip" style={{ fontSize: 12 }} onClick={() => { setPick(m); if (!name.trim()) setName(m.name); }}>{m.name}</div>)}
              </div>
            </div>
          )}
        </div>

        {/* Photo */}
        <div className="rb-field"><label>Photo of your specimen</label>
          <input ref={photoRef} type="file" accept="image/*" style={{ display: "none" }}
            onChange={(e) => { const f = e.target.files && e.target.files[0]; if (f) setPhoto({ url: URL.createObjectURL(f), file: f }); e.target.value = ""; }} />
          {photo ? (
            <div style={{ position: "relative", width: "fit-content" }}>
              <img src={photo.url} alt="" style={{ maxHeight: 130, borderRadius: 12 }} />
              <span onClick={() => setPhoto(null)} style={{ position: "absolute", top: 6, right: 6, background: "rgba(3,8,12,.8)", color: "#fff", borderRadius: "50%", width: 24, height: 24, display: "grid", placeItems: "center", cursor: "pointer", fontWeight: 700 }}>✕</span>
            </div>
          ) : (
            <div className="rb-drop" style={{ padding: 20 }} onClick={() => photoRef.current && photoRef.current.click()}>
              <Camera size={24} style={{ opacity: .8 }} /><div style={{ marginTop: 8, fontWeight: 600, fontSize: 13 }}>Take or upload a photo</div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <div className="rb-field" style={{ flex: 1 }}><label>Price ($)</label>
            <input className="rb-input" type="number" inputMode="decimal" placeholder="45" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
          <div className="rb-field" style={{ flex: 1 }}><label>Date acquired</label>
            <input className="rb-input" type="date" value={acquiredAt} onChange={(e) => setAcquiredAt(e.target.value)} /></div>
        </div>
        <div className="rb-field"><label>Source <span style={{ color: "var(--muted-2)" }}>(store, seller, frag swap…)</span></label>
          <input className="rb-input" placeholder="e.g. Local Fish Store, @reefer_handle" value={source} onChange={(e) => setSource(e.target.value)} /></div>
        <div className="rb-field"><label>Size / details <span style={{ color: "var(--muted-2)" }}>(optional)</span></label>
          <input className="rb-input" placeholder="e.g. 2-head frag, ~1.5 in" value={size} onChange={(e) => setSize(e.target.value)} /></div>
        <div className="rb-field"><label>Notes <span style={{ color: "var(--muted-2)" }}>(optional)</span></label>
          <textarea className="rb-input" rows={2} placeholder="Placement, flow, acclimation notes…" value={note} onChange={(e) => setNote(e.target.value)} /></div>

        <button className="rb-btn" style={{ width: "100%", padding: 14 }} disabled={!name.trim() || busy} onClick={save}>
          <Check size={16} /> {busy ? "Saving…" : "Add to tank"} <span style={{ opacity: .7 }}>· logs to journal</span>
        </button>
      </div>
    </div>
  );
}

function LivestockDetailSheet({ item, uid, profile, onClose, onEnd }) {
  const [endMode, setEndMode] = useState(false);
  const [reason, setReason] = useState("died");
  const [endReason, setEndReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [shared, setShared] = useState(false);
  const [sharing, setSharing] = useState(false);
  // Growth timeline — progress photos over time
  const [progress, setProgress] = useState([]);
  const [progBusy, setProgBusy] = useState(false);
  const progRef = useRef(null);
  useEffect(() => {
    let alive = true;
    if (!String(item.id).startsWith("tmp")) supabase.from("livestock_photos").select("*").eq("livestock_id", item.id).order("created_at")
      .then(({ data }) => { if (alive) setProgress(data || []); });
    return () => { alive = false; };
  }, [item.id]);
  const addProgressPhoto = async (file) => {
    if (!file || progBusy) return;
    setProgBusy(true);
    const url = await uploadPhoto(file, uid);
    if (url) {
      const { data } = await supabase.from("livestock_photos").insert({ livestock_id: item.id, photo_url: url }).select().single();
      if (data) setProgress((p) => [...p, data]);
    }
    setProgBusy(false);
  };
  const isActive = (item.status || "alive") === "alive";
  const daysKept = item.acquiredAt ? Math.max(0, Math.round((( item.endedAt ? new Date(item.endedAt + "T00:00").getTime() : Date.now()) - new Date(item.acquiredAt + "T00:00").getTime()) / 86400000)) : null;

  const shareToLibrary = async () => {
    if (!item.species_id || !item.photo) { alert("Link this to a Reefpedia species and add a photo first."); return; }
    setSharing(true);
    const { error } = await supabase.from("species_photo_contributions").insert({
      species_id: item.species_id, contributor_id: uid, photo_url: item.photo, livestock_id: item.id.startsWith("tmp") ? null : item.id, caption: item.name,
    });
    setSharing(false);
    if (error) { console.error("share failed:", error.message); alert("Couldn't submit — try again."); return; }
    setShared(true);
  };

  const doEnd = async () => {
    setBusy(true);
    await onEnd(item.id, reason, endReason.trim());
    setBusy(false); onClose();
  };

  const Row = ({ k, v }) => v ? (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,.05)", fontSize: 13.5 }}>
      <span style={{ color: "var(--muted)" }}>{k}</span><span style={{ fontWeight: 600, textAlign: "right", maxWidth: "62%" }}>{v}</span>
    </div>
  ) : null;

  return (
    <div className="rb-overlay" onClick={onClose}>
      <div className="rb-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="rb-sheet-h"><b>{item.name}</b><div className="rb-iconbtn" onClick={onClose}><X size={18} /></div></div>

        {item.photo && <img src={item.photo} alt="" style={{ width: "100%", maxHeight: 240, objectFit: "cover", borderRadius: 14, marginBottom: 14 }} />}

        <Row k="Type" v={item.type} />
        <Row k="Status" v={<span style={{ textTransform: "capitalize" }}>{item.status || "alive"}</span>} />
        <Row k="Price paid" v={item.price != null ? `$${item.price}` : null} />
        <Row k="Source" v={item.source} />
        <Row k="Size / details" v={item.size} />
        <Row k="Acquired" v={item.acquiredAt ? fmtAcq(item.acquiredAt) : null} />
        {!isActive && <Row k={item.status === "died" ? "Died" : "Left tank"} v={item.endedAt ? fmtAcq(item.endedAt) : null} />}
        <Row k="Time in tank" v={daysKept != null ? `${daysKept} day${daysKept === 1 ? "" : "s"}` : null} />
        <Row k="Notes" v={item.note} />
        {!isActive && item.endReason && <Row k="Reason" v={item.endReason} />}

        {/* Growth timeline — progress photos over time */}
        <div style={{ margin: "14px 0" }}>
          <div className="rb-h2" style={{ marginTop: 0, marginBottom: 8 }}><Camera size={14} color="var(--aqua)" /> Growth timeline <small>{progress.length ? `${progress.length} photo${progress.length > 1 ? "s" : ""}` : "track it over time"}</small></div>
          {progress.length > 0 && (
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 8 }}>
              {progress.map((ph) => (
                <div key={ph.id} style={{ flex: "none", textAlign: "center" }}>
                  <img src={ph.photo_url} alt="" style={{ height: 92, borderRadius: 10, objectFit: "cover", display: "block" }} />
                  <div style={{ fontSize: 10.5, color: "var(--muted-2)", marginTop: 3 }}>{fmtDate(new Date(ph.created_at).getTime())}</div>
                </div>
              ))}
            </div>
          )}
          {isActive && !String(item.id).startsWith("tmp") && (
            <>
              <input ref={progRef} type="file" accept="image/*" style={{ display: "none" }}
                onChange={(e) => { const f = e.target.files && e.target.files[0]; if (f) addProgressPhoto(f); e.target.value = ""; }} />
              <div className="rb-chip" style={{ borderStyle: "dashed", color: "var(--aqua)", borderColor: "var(--brd-2)", opacity: progBusy ? .6 : 1 }}
                onClick={() => !progBusy && progRef.current && progRef.current.click()}>
                <Camera size={13} style={{ verticalAlign: -2, marginRight: 5 }} />{progBusy ? "Uploading…" : "Add progress photo"}
              </div>
            </>
          )}
        </div>

        {/* Share to Reefpedia */}
        {item.photo && item.species_id && (
          <div className="rb-card" style={{ padding: 12, marginTop: 14, background: "rgba(63,227,255,.06)", border: "1px solid rgba(63,227,255,.25)" }}>
            {shared ? (
              <div style={{ fontSize: 13, color: "var(--good)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}><Check size={15} /> Submitted to Reefpedia — thanks for contributing!</div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, fontSize: 12.5, color: "var(--muted)" }}>Share this photo to the <b style={{ color: "var(--text)" }}>{item.name}</b> Reefpedia page for other reefers.</div>
                <button className="rb-btn" style={{ flex: "none", padding: "8px 12px", fontSize: 12.5 }} disabled={sharing} onClick={shareToLibrary}>{sharing ? "…" : "Share"}</button>
              </div>
            )}
          </div>
        )}

        {/* End / remove flow (active only) */}
        {isActive && !endMode && (
          <button className="rb-btn ghost" style={{ width: "100%", marginTop: 16, padding: 12 }} onClick={() => setEndMode(true)}>
            Mark as died / sold / removed
          </button>
        )}
        {isActive && endMode && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>What happened to {item.name}?</div>
            <div className="rb-tabs" style={{ margin: "0 0 10px", flexWrap: "wrap" }}>
              {[["died", "Died"], ["sold", "Sold"], ["traded", "Traded"], ["removed", "Removed"]].map(([v, lbl]) => (
                <div key={v} className={"rb-chip" + (reason === v ? " on" : "")} onClick={() => setReason(v)}>{lbl}</div>
              ))}
            </div>
            <input className="rb-input" placeholder={reason === "died" ? "Cause, if known (e.g. tissue recession)" : "Details (e.g. sold to @reefer for $40)"}
              value={endReason} onChange={(e) => setEndReason(e.target.value)} />
            <div style={{ fontSize: 11.5, color: "var(--muted-2)", margin: "8px 0 12px" }}>
              This moves {item.name} to Past livestock and logs a journal entry. The full record is kept.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="rb-btn ghost" style={{ flex: 1 }} disabled={busy} onClick={() => setEndMode(false)}>Cancel</button>
              <button className="rb-btn" style={{ flex: 2 }} disabled={busy} onClick={doEnd}>{busy ? "Saving…" : "Confirm"}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Tank Log ---------------- */
function TankLog({ state, addLogEntry, go }) {
  const [type, setType] = useState("Water Change");
  const [note, setNote] = useState("");
  const types = ["Water Change", "Dosing", "Addition", "Observation"];
  const typeColor = { "Water Change": "#3fe3ff", Dosing: "#3ce0a3", Addition: "#ffc24d", Observation: "#b06cff", DeepDive: "#b06cff", ReefID: "#2ee6c8", Loss: "#ff5d72", Removal: "#84a8ba", "AI Report": "#8f5cd6" };
  const typeIcon = (t) => t === "DeepDive" ? <Bot size={18} color="#04111a" /> : t === "ReefID" ? <Camera size={18} color="#04111a" /> : <Droplets size={18} color="#04111a" />;
  const openThread = (tid) => { if (!go) return; PENDING_AI_THREAD.id = tid; go("deepdive"); };
  const [reportBusy, setReportBusy] = useState(false);
  const weeklyReport = async () => {
    if (reportBusy) return;
    setReportBusy(true);
    try {
      if (!(await gateAI("deepdive"))) { setReportBusy(false); return; }
      const wk = Date.now() - 7 * 86400000;
      const params = state.history.filter((h) => h.date >= wk);
      const paramsTxt = params.length ? params.map((h) => PARAMS.map((p) => h[p.key] != null ? `${p.label} ${h[p.key]}` : null).filter(Boolean).join(", ")).join(" | ") : "no tests logged";
      const events = state.log.filter((e) => e.date >= wk && e.type !== "AI Report").map((e) => `${e.type}: ${e.note}`).join(" | ") || "no journal entries";
      const SYS = "You are Tidepool Reef's weekly tank reporter. Write a concise 3-5 sentence weekly summary of this reef tank: parameter trends and stability, notable events, and one specific thing to watch or do next week. Plain, honest, no fluff.";
      const q = `Tank "${state.tank ? state.tank.name : ""}" (${state.tank ? state.tank.volume : "?"}g). This week's test readings (oldest→newest): ${paramsTxt}. Journal events: ${events}.`;
      const reply = await askReefAI([{ role: "user", content: q }], SYS, "deepdive");
      if (reply) await addLogEntry("AI Report", reply);   // optimistic — appears in the journal immediately
    } catch (e) { console.error("weekly report failed:", e); }
    setReportBusy(false);
  };
  return (
    <div className="rb-fadein">
      <div className="rb-card" style={{ padding: 16, marginTop: 6 }}>
        <div className="rb-tabs" style={{ margin: "0 0 12px" }}>
          {types.map((c) => <div key={c} className={"rb-chip" + (type === c ? " on" : "")} onClick={() => setType(c)}>{c}</div>)}
        </div>
        <textarea className="rb-input" rows={2} placeholder="What happened in the tank?" value={note} onChange={(e) => setNote(e.target.value)} />
        <button className="rb-btn" style={{ width: "100%", marginTop: 10, padding: 12 }} disabled={!note.trim()}
          onClick={() => { addLogEntry(type, note.trim()); setNote(""); }}><Plus size={16} /> Add log entry</button>
        <button className="rb-btn violet" style={{ width: "100%", marginTop: 8, padding: 12, opacity: reportBusy ? .6 : 1 }} onClick={weeklyReport} disabled={reportBusy}>
          <Sparkles size={15} /> {reportBusy ? "Writing your week…" : "AI weekly report"}
        </button>
      </div>
      <div className="rb-h2"><Notebook size={16} color="var(--aqua)" /> Journal <small>{state.log.length} entries</small></div>
      <div className="rb-card">
        {state.log.length === 0 && <div className="rb-empty">No journal entries yet — log your first water change or observation above.</div>}
        {state.log.map((e) => (
          <div key={e.id} className="rb-li" style={{ alignItems: "flex-start", cursor: e.aiThread ? "pointer" : "default" }}
            onClick={() => e.aiThread && openThread(e.aiThread)}>
            <div className="rb-thumb" style={{ background: `linear-gradient(140deg,${typeColor[e.type] || "#3fe3ff"},#0b2b3d)` }}>{typeIcon(e.type)}</div>
            <div style={{ flex: 1 }}>
              <div className="nm">{e.type} <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: 12 }}>· {fmtDate(e.date)}</span></div>
              <div className="sub" style={{ lineHeight: 1.45 }}>{e.note}</div>
              {e.aiThread && <div style={{ fontSize: 11.5, color: "var(--aqua)", marginTop: 4 }}>Tap to reopen this conversation ›</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Reef ID (Claude vision) ---------------- */
function FreeTasteBanner({ used, limit, unit, onUpgrade }) {
  const left = Math.max(0, limit - (used || 0));
  return (
    <div className="rb-card" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", margin: "0 0 12px",
      background: "rgba(176,108,255,.08)", border: "1px solid rgba(176,108,255,.3)" }}>
      <Sparkles size={16} color="var(--violet)" style={{ flex: "none" }} />
      <div style={{ flex: 1, fontSize: 12.5, color: "var(--muted)" }}>
        <b style={{ color: "#d7b6ff" }}>Free preview:</b> {left} of {limit} {unit} left
      </div>
      <button className="rb-btn" style={{ flex: "none", padding: "7px 13px", fontSize: 12,
        background: "linear-gradient(120deg,var(--violet),#8f5cd6)", color: "#fff" }} onClick={onUpgrade}>Upgrade</button>
    </div>
  );
}

function ReefID({ profile, onUpgrade, tanks, addTo, tank, history, livestock }) {
  const [addOpen, setAddOpen] = useState(false);
  const [added, setAdded] = useState("");
  const [img, setImg] = useState(null);     // {b64, media, url}
  const [result, setResult] = useState("");     // raw text fallback
  const [card, setCard] = useState(null);       // parsed ID card
  const [busy, setBusy] = useState(false);
  const [followMsgs, setFollowMsgs] = useState([]);   // follow-up Q&A after an ID
  const [followInput, setFollowInput] = useState("");
  const [followBusy, setFollowBusy] = useState(false);
  const [journalSaved, setJournalSaved] = useState(false);
  const [journalBusy, setJournalBusy] = useState(false);
  const fileRef = useRef(null);
  const followScroll = useRef(null);
  // Opt-in journal save — heavy scanners shouldn't flood the journal with every ID.
  const saveIdToJournal = async () => {
    if (!card || !tank || journalBusy || journalSaved) return;
    setJournalBusy(true);
    const { error } = await supabase.from("tank_log").insert({
      tank_id: tank.id, entry_type: "ReefID",
      note: `Identified ${card.common}${card.scientific ? ` (${card.scientific})` : ""} — ${card.confidence || "?"} confidence, ${card.difficulty || "?"} care.${card.note ? " " + card.note : ""}`,
    });
    if (error) { console.error("journal save failed:", error.message); alert("Couldn't save to journal — try again."); }
    else setJournalSaved(true);
    setJournalBusy(false);
  };
  useEffect(() => { if (followScroll.current) followScroll.current.scrollTop = followScroll.current.scrollHeight; }, [followMsgs, followBusy]);

  // Snapshot of the user's active tank, for compatibility checks.
  const tankSnapshot = () => {
    if (!tank) return "";
    const params = (history && history.length) ? PARAMS.map((p) => {
      const lv = lastVal(history, p.key);
      return lv ? `${p.label} ${lv.v}${p.unit}` : null;
    }).filter(Boolean).join(", ") : "no test data yet";
    const stock = (livestock || []).filter((l) => (l.status || "alive") === "alive");
    const stockList = stock.length ? stock.map((l) => `${l.name}${l.type ? " (" + l.type + ")" : ""}`).join(", ") : "no livestock yet";
    return `Tank "${tank.name}": ${tank.model || "reef tank"}, ${tank.volume} gallons, running since ${tank.since || "recently"}. ` +
      `Current parameters: ${params}. Current livestock: ${stockList}.`;
  };

  const onFile = (e) => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    readReefPhoto(f, (photo) => { setImg(photo); setResult(""); setCard(null); setAdded(""); setAddOpen(false); setFollowMsgs([]); });
  };

  const identify = async () => {
    if (!img) return;
    if (!(await gateAI("reefid"))) return;
    setBusy(true); setResult(""); setCard(null); setFollowMsgs([]);
    try {
      const token = await getAccessToken();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) },
        body: JSON.stringify({
          max_tokens: 1200,
          kind: "reefid",
          system: "You are Reef ID, an expert at identifying saltwater aquarium corals, fish, and invertebrates from photos. Identify the most likely species from the image. Respond with ONLY a JSON object, no markdown, no preamble, in exactly this shape: {\"common\":\"common name\",\"scientific\":\"Genus species (best guess)\",\"type\":\"Coral|Fish|Invert\",\"difficulty\":\"Beginner|Intermediate|Advanced|Expert\",\"confidence\":\"High|Medium|Low\",\"overview\":\"1-2 sentence description of the species and what it looks like\",\"placement\":\"where to place/keep it (e.g. low-to-mid, sandbed, high flow) — for fish use 'swimming zone'\",\"lighting\":\"lighting needs (corals) or 'n/a' for fish/inverts\",\"flow\":\"water flow preference\",\"diet\":\"what and how to feed it\",\"temperament\":\"reef-safe? aggressive? compatibility notes\",\"tips\":[\"short care tip\",\"short care tip\",\"short care tip\"],\"watch\":[\"common problem or warning sign to watch for\",\"another\"],\"note\":\"one short caveat or alternate possibility if unsure, else empty string\"}. Keep every field concise (one line each). If you truly cannot tell, set common to \"Unclear\" and use note to list possibilities.",
          messages: [{ role: "user", content: [
            { type: "image", source: { type: "base64", media_type: img.media, data: img.b64 } },
            { type: "text", text: "Identify this reef tank inhabitant and give detailed care info as JSON." },
          ] }],
        }),
      });
      const data = await res.json();
      if (data && data.error) {
        if (data.error.code === "limit_reached" && onUpgrade) { onUpgrade(); setBusy(false); return; }
        throw new Error((data.error.message || "AI request failed") + (res.status === 401 ? " (auth)" : ""));
      }
      if (data && data._serverCounted) AI_GATE_STATE.serverCounts = true;
      const txt = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
      let parsed = null;
      try {
        const jsonStr = txt.replace(/```json|```/g, "").trim();
        const start = jsonStr.indexOf("{"), end = jsonStr.lastIndexOf("}");
        if (start !== -1 && end !== -1) parsed = JSON.parse(jsonStr.slice(start, end + 1));
      } catch (e) { parsed = null; }
      if (parsed && parsed.common) { setCard(parsed); setJournalSaved(false); }
      else setResult(txt || "Couldn't identify that one — try a clearer, closer shot.");
    } catch (e) { setResult("Reef ID error: " + (e.message || "connection failed") + ". Try again, or use a smaller/clearer photo."); }
    setBusy(false);
  };

  // Follow-up questions about the identified species — a mini conversation, free-tier gated.
  const askFollowUp = async (text) => {
    const q = (text || "").trim(); if (!q || followBusy) return;
    if (!(await gateAI("deepdive"))) return;
    const hist = [...followMsgs, { role: "user", content: q }];
    setFollowMsgs(hist); setFollowInput(""); setFollowBusy(true);
    const idContext = card
      ? `The user just identified: ${card.common}${card.scientific ? " (" + card.scientific + ")" : ""}, a ${card.type}. Care summary — difficulty: ${card.difficulty}; placement: ${card.placement || "?"}; lighting: ${card.lighting || "?"}; flow: ${card.flow || "?"}; diet: ${card.diet || "?"}; temperament: ${card.temperament || "?"}.`
      : "The user is asking about a reef species they just tried to identify.";
    const tankCtx = tankSnapshot();
    const SYS = "You are Tidepool Reef ID, an expert saltwater aquarium advisor. " + idContext +
      (tankCtx ? " Here is the user's tank you should evaluate compatibility against — " + tankCtx : "") +
      " Answer the user's follow-up question about this species specifically. When compatibility with their tank is relevant, reference their actual parameters, tank size, and existing livestock (aggression, bioload, adult size vs tank volume, parameter fit). Be concise, practical, and honest — if it's a bad fit, say so and why. 2-4 sentences unless more detail is needed.";
    try {
      const apiMsgs = hist.map((m) => ({ role: m.role, content: m.content }));
      const reply = await askReefAI(apiMsgs, SYS, "deepdive");
      setFollowMsgs((m) => [...m, { role: "assistant", content: reply || "Hmm, I couldn't answer that just now." }]);
    } catch (e) {
      if (e.limitReached && onUpgrade) { setFollowMsgs((m) => m.slice(0, -1)); onUpgrade(); setFollowBusy(false); return; }
      setFollowMsgs((m) => [...m, { role: "assistant", content: "Error: " + (e.message || "connection failed") + " — try again." }]);
    }
    setFollowBusy(false);
  };
  return (
    <div className="rb-fadein">
      {profile && profile.plan !== "pro" && (
        <FreeTasteBanner used={profile.reefid_used} limit={FREE_REEFID} unit="free IDs" onUpgrade={onUpgrade} />
      )}
      <div className="rb-card" style={{ padding: 16, marginTop: 6 }}>
        <div style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.5, marginBottom: 14 }}>
          Point your camera at any coral, fish, or invert. Reef ID names the species, rates its care difficulty, and gives you quick care tips — then adds it to your tank in a tap.
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onFile} />
        {img
          ? <img className="rb-preview" src={img.url} alt="to identify" />
          : <div className="rb-drop" onClick={() => fileRef.current && fileRef.current.click()}>
              <Camera size={30} style={{ opacity: .8 }} /><div style={{ marginTop: 10, fontWeight: 600 }}>Tap to take or upload a photo</div>
            </div>}
        <div style={{ display: "flex", gap: 10 }}>
          {img && <button className="rb-btn ghost" style={{ flex: 1 }} onClick={() => fileRef.current && fileRef.current.click()}><Upload size={15} /> Change</button>}
          <button className="rb-btn violet" style={{ flex: 2 }} disabled={!img || busy} onClick={identify}><Camera size={16} /> {busy ? "Identifying…" : "Identify"}</button>
        </div>
      </div>
      {busy && <div className="rb-card" style={{ padding: 16, marginTop: 14 }}><div className="rb-typing"><i /><i /><i /></div></div>}

      {card && (() => {
        const diffColors = { Beginner: "#3ce0a3", Intermediate: "#ffc24d", Advanced: "#ff9d5c", Expert: "#ff5d72" };
        const confColors = { High: "#3ce0a3", Medium: "#ffc24d", Low: "#ff9d5c" };
        const dc = diffColors[card.difficulty] || "#3fe3ff";
        const cc = confColors[card.confidence] || "var(--muted)";
        const kindColor = { Coral: "var(--teal)", Fish: "var(--aqua)", Invert: "var(--violet)" }[card.type] || "var(--aqua)";
        return (
          <div className="rb-card" style={{ padding: 0, marginTop: 14, overflow: "hidden" }}>
            {/* Header band with the photo */}
            <div style={{ position: "relative", height: 150 }}>
              {img && <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,transparent 30%,rgba(3,8,12,.92))" }} />
              <div style={{ position: "absolute", left: 14, right: 14, bottom: 12 }}>
                <div style={{ fontFamily: "Bricolage Grotesque", fontWeight: 800, fontSize: 22, lineHeight: 1.1, letterSpacing: "-.3px" }}>{card.common}</div>
                {card.scientific && <div style={{ fontStyle: "italic", color: "var(--muted)", fontSize: 13, marginTop: 2 }}>{card.scientific}</div>}
              </div>
            </div>
            <div style={{ padding: 16 }}>
              {/* Badges */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                {card.type && <span className="rb-badge" style={{ background: kindColor + "22", color: kindColor, border: `1px solid ${kindColor}55` }}>{card.type}</span>}
                {card.difficulty && <span className="rb-badge" style={{ background: dc + "22", color: dc, border: `1px solid ${dc}55` }}>{card.difficulty} care</span>}
                {card.confidence && <span className="rb-badge" style={{ background: "transparent", color: cc, border: `1px solid ${cc}55` }}>{card.confidence} confidence</span>}
              </div>
              {/* Overview */}
              {card.overview && <div style={{ fontSize: 13.5, lineHeight: 1.55, color: "#d8eef5", marginBottom: 14 }}>{card.overview}</div>}
              {/* Spec grid */}
              {(() => {
                const specs = [
                  ["Placement", card.placement], ["Lighting", card.lighting && card.lighting.toLowerCase() !== "n/a" ? card.lighting : null],
                  ["Flow", card.flow], ["Diet", card.diet], ["Temperament", card.temperament],
                ].filter(([, v]) => v);
                return specs.length > 0 ? (
                  <div className="rb-card" style={{ padding: "4px 12px", marginBottom: 14, background: "var(--bg-2)" }}>
                    {specs.map(([k, v], i) => (
                      <div key={k} style={{ display: "flex", gap: 12, padding: "9px 0", borderBottom: i < specs.length - 1 ? "1px solid rgba(255,255,255,.06)" : "none" }}>
                        <span style={{ fontSize: 12, color: "var(--muted)", minWidth: 92, flex: "none" }}>{k}</span>
                        <span style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                ) : null;
              })()}
              {/* Care tips */}
              {Array.isArray(card.tips) && card.tips.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 700, letterSpacing: .3, marginBottom: 8 }}>QUICK CARE</div>
                  {card.tips.map((tip, i) => (
                    <div key={i} style={{ display: "flex", gap: 9, marginBottom: 8, fontSize: 13.5, lineHeight: 1.45 }}>
                      <Check size={15} color="var(--good)" style={{ flex: "none", marginTop: 2 }} /><span>{tip}</span>
                    </div>
                  ))}
                </div>
              )}
              {/* Watch for */}
              {Array.isArray(card.watch) && card.watch.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: "var(--warn)", fontWeight: 700, letterSpacing: .3, marginBottom: 8 }}>WATCH FOR</div>
                  {card.watch.map((w, i) => (
                    <div key={i} style={{ display: "flex", gap: 9, marginBottom: 8, fontSize: 13.5, lineHeight: 1.45 }}>
                      <Bell size={14} color="var(--warn)" style={{ flex: "none", marginTop: 3 }} /><span>{w}</span>
                    </div>
                  ))}
                </div>
              )}
              {card.note && <div style={{ fontSize: 12.5, color: "var(--muted)", fontStyle: "italic", lineHeight: 1.45, borderTop: "1px solid rgba(255,255,255,.06)", paddingTop: 10 }}>{card.note}</div>}

              {/* Save to journal — opt-in, so heavy scanning doesn't flood it */}
              {tank && card.common !== "Unclear" && (
                <div style={{ marginTop: 14 }}>
                  {journalSaved ? (
                    <div style={{ fontSize: 13, color: "var(--good)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}><Check size={14} /> Saved to {tank.name}'s journal</div>
                  ) : (
                    <div className="rb-chip" style={{ borderStyle: "dashed", color: "var(--aqua)", borderColor: "var(--brd-2)", opacity: journalBusy ? .6 : 1 }} onClick={saveIdToJournal}>
                      <Notebook size={13} style={{ verticalAlign: -2, marginRight: 5 }} />{journalBusy ? "Saving…" : `Save to ${tank.name}'s journal`}
                    </div>
                  )}
                </div>
              )}

              {/* Add to tank */}
              {tanks && tanks.length > 0 && card.common !== "Unclear" && (
                <div style={{ marginTop: 14 }}>
                  {added ? (
                    <div style={{ fontSize: 13, color: "var(--good)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}><Check size={14} /> Added to {added}!</div>
                  ) : !addOpen ? (
                    <button className="rb-btn" style={{ width: "100%" }} onClick={() => setAddOpen(true)}><Plus size={15} /> Add to my tank</button>
                  ) : (
                    <div>
                      <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 8 }}>Which tank?</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {tanks.map((tk) => (
                          <div key={tk.id} className="rb-chip" style={{ fontSize: 12 }} onClick={async () => {
                            const kind = card.type === "Fish" ? "Fish" : card.type === "Invert" ? "Invert" : "Coral";
                            await addTo(tk.id, kind, card.common, null);
                            setAdded(tk.name); setAddOpen(false);
                          }}>{tk.name}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Follow-up questions about the identified species */}
      {card && card.common !== "Unclear" && (
        <div className="rb-card" style={{ padding: 16, marginTop: 14 }}>
          <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 700, letterSpacing: .3, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <Bot size={14} color="var(--aqua)" /> ASK ABOUT THIS {card.type ? card.type.toUpperCase() : "SPECIES"}
          </div>
          {followMsgs.length > 0 && (
            <div ref={followScroll} style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12, maxHeight: 340, overflowY: "auto" }}>
              {followMsgs.map((m, i) => (
                <div key={i} className={"rb-ai-msg " + (m.role === "user" ? "u" : "a")}>{m.content}</div>
              ))}
              {followBusy && <div className="rb-ai-msg a"><div className="rb-typing"><i /><i /><i /></div></div>}
            </div>
          )}
          {followMsgs.length === 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
              {tank && <div className="rb-chip" style={{ fontSize: 12, borderColor: "var(--aqua)", color: "var(--aqua)" }}
                onClick={() => !followBusy && askFollowUp(`Will this ${card.common} thrive in my tank "${tank.name}"? Check it against my parameters, tank size, and current livestock — flag any compatibility, aggression, bioload, or adult-size concerns.`)}>
                ✓ Will it work in {tank.name}?
              </div>}
              {[
                `Is ${card.common} reef-safe?`,
                card.type === "Coral" ? "How fast does it grow?" : "What tankmates work?",
                "Common problems?",
              ].map((s, i) => (
                <div key={i} className="rb-chip" style={{ fontSize: 12 }} onClick={() => !followBusy && askFollowUp(s)}>{s}</div>
              ))}
            </div>
          )}
          <div className="rb-ai-row">
            <input className="rb-input" placeholder={`Ask about ${card.common}…`} value={followInput}
              onChange={(e) => setFollowInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && followInput.trim() && !followBusy) askFollowUp(followInput); }} />
            <button className="rb-btn" disabled={!followInput.trim() || followBusy} onClick={() => askFollowUp(followInput)}><Send size={16} /></button>
          </div>
        </div>
      )}

      {result && (
        <div className="rb-card" style={{ padding: 16, marginTop: 14, fontSize: 14, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
          {result}
          {!result.startsWith("Reef ID error") && tanks && tanks.length > 0 && (
            <div style={{ marginTop: 14, whiteSpace: "normal" }}>
              {added ? (
                <div style={{ fontSize: 13, color: "var(--good)", fontWeight: 600 }}><Check size={14} /> Added to {added}!</div>
              ) : !addOpen ? (
                <button className="rb-btn" style={{ width: "100%" }} onClick={() => setAddOpen(true)}><Plus size={15} /> Add to my tank</button>
              ) : (
                <div>
                  <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 8 }}>Which tank?</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {tanks.map((tk) => (
                      <div key={tk.id} className="rb-chip" style={{ fontSize: 12 }} onClick={async () => {
                        const firstLine = result.split("\n").find((l) => l.trim()) || "Identified species";
                        const name = (firstLine.match(/Common name[:\s]*([^\n(]+)/i) || [null, firstLine])[1].trim().replace(/^[-*#\s]+/, "").slice(0, 60);
                        const lower = result.toLowerCase();
                        const kind = /type[:\s]*[^\n]*fish/i.test(result) || lower.includes("this fish") ? "Fish"
                          : /type[:\s]*[^\n]*(invert|shrimp|crab|snail|anemone)/i.test(result) ? "Invert" : "Coral";
                        await addTo(tk.id, kind, name, null);
                        setAdded(tk.name); setAddOpen(false);
                      }}>{tk.name}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------- DeepDive AI ---------------- */
function DeepDive({ state, latest, issues, switchTank, onUpgrade, uid }) {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [photo, setPhoto] = useState(null);   // {b64, media, url}
  const [threadId, setThreadId] = useState(null);
  const [threads, setThreads] = useState([]);       // past conversations
  const [histOpen, setHistOpen] = useState(false);
  const fileRef = useRef(null);
  const scroller = useRef(null);
  useEffect(() => { if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight; }, [msgs, busy]);

  // Load this user's past DeepDive threads (most recent first).
  const loadThreads = async () => {
    if (!uid) return;
    const { data } = await supabase.from("ai_threads").select("id, title, tank_id, updated_at").eq("user_id", uid).order("updated_at", { ascending: false }).limit(30);
    setThreads(data || []);
  };
  useEffect(() => { loadThreads(); }, [uid]);
  // Which past conversations are already in a journal (for the history drawer's save button)
  const [journaled, setJournaled] = useState({});
  useEffect(() => {
    if (!histOpen || !threads.length) return;
    let alive = true;
    supabase.from("tank_log").select("ai_thread_id").in("ai_thread_id", threads.map((t) => t.id))
      .then(({ data }) => { if (alive) { const m = {}; (data || []).forEach((r) => (m[r.ai_thread_id] = true)); setJournaled(m); } });
    return () => { alive = false; };
  }, [histOpen, threads]);
  const journalThread = async (th) => {
    if (journaled[th.id]) return;
    // Excerpt from the thread's first assistant reply
    const { data: firstA } = await supabase.from("ai_messages").select("content").eq("thread_id", th.id).eq("role", "assistant").order("created_at").limit(1).maybeSingle();
    const excerpt = firstA && firstA.content ? firstA.content.replace(/\s+/g, " ").trim().slice(0, 170) : "";
    const { error } = await supabase.from("tank_log").insert({
      tank_id: th.tank_id || state.tankId, entry_type: "DeepDive", ai_thread_id: th.id,
      note: `Asked: "${(th.title || "Chat").slice(0, 70)}"${excerpt ? ` — ${excerpt}…` : ""}`,
    });
    if (error) { console.error("journal thread failed:", error.message); alert("Couldn't save to journal — try again."); return; }
    setJournaled((m) => ({ ...m, [th.id]: true }));
  };
  // If a journal entry sent us here, open that saved conversation.
  useEffect(() => {
    if (PENDING_AI_THREAD.id) { const t = PENDING_AI_THREAD.id; PENDING_AI_THREAD.id = null; openThread(t); }
  }, []);

  // Resume a saved conversation.
  const openThread = async (id) => {
    const { data } = await supabase.from("ai_messages").select("role, content, img_url, created_at").eq("thread_id", id).order("created_at");
    setMsgs((data || []).map((m) => ({ role: m.role, content: m.content, img: m.img_url || null })));
    setThreadId(id); setHistOpen(false);
  };
  const newChat = () => { setMsgs([]); setThreadId(null); };
  // Journal auto-log preference (per device). Default on.
  const [journalLog, setJournalLog] = useState(() => { try { return localStorage.getItem("tr:dd-journal") !== "0"; } catch (e) { return true; } });
  const toggleJournalLog = () => setJournalLog((v) => { const n = !v; try { localStorage.setItem("tr:dd-journal", n ? "1" : "0"); } catch (e) {} return n; });
  const deleteThread = async (id) => {
    await supabase.from("ai_threads").delete().eq("id", id);
    setThreads((ts) => ts.filter((t) => t.id !== id));
    if (id === threadId) newChat();
  };
  // Ensure a thread exists; create one titled from the first user message.
  const ensureThread = async (firstUserText) => {
    if (threadId) return threadId;
    const title = (firstUserText || "New chat").replace(/\s+/g, " ").trim().slice(0, 48);
    const { data, error } = await supabase.from("ai_threads").insert({ user_id: uid, tank_id: state.tankId, title }).select("id").single();
    if (error || !data) { console.error("thread create failed:", error && error.message); return null; }
    setThreadId(data.id);
    loadThreads();
    return data.id;
  };
  const persist = async (tid, role, content, imgUrl) => {
    if (!tid) return;
    await supabase.from("ai_messages").insert({ thread_id: tid, role, content: typeof content === "string" ? content : String(content), img_url: imgUrl || null });
    await supabase.from("ai_threads").update({ updated_at: new Date().toISOString() }).eq("id", tid);
  };

  const snapshot = () => {
    const parts = PARAMS.map((p) => {
      const lv = lastVal(state.history, p.key);
      if (!lv) return null;
      return `${p.label}: ${lv.v}${p.unit} (target ${p.ideal[0]}-${p.ideal[1]}, ${statusOf(p, lv.v)}, measured ${fmtDate(lv.date)})`;
    }).filter(Boolean);
    return parts.length ? parts.join("; ") : "No test results logged yet.";
  };
  const t = state.tank;
  const SYS = "You are Tidepool Reef DeepDive, a concise expert saltwater reef-aquarium advisor inside the Tidepool Reef app. " +
    `The user is currently asking about their tank "${t.name}" (${t.model}, ${t.volume} gallons, running since ${t.since}). ` +
    `Latest test results for ${t.name} — ${snapshot()} ` +
    `Livestock in ${t.name}: ${state.livestock.map((l) => l.name).join(", ") || "none logged"}. ` +
    "Answer questions about THIS tank using this context unless the user clearly asks about something else. " +
    "If the user attaches a photo, analyze what is actually visible in it (species, condition, symptoms, pests, equipment) and connect it to their tank context and question. " +
    "Give practical, friendly, specific guidance. Keep answers short. Focus on what's drifting and 2-3 concrete actions. Never recommend dangerous dosing.";

  async function send(text, display) {
    const attach = photo;   // capture, then clear the composer immediately
    setPhoto(null);
    const question = text || "What can you tell me about this photo of my reef?";
    // api: multimodal content when a photo rides along; display keeps the thumbnail
    const api = attach
      ? [{ type: "image", source: { type: "base64", media_type: attach.media, data: attach.b64 } }, { type: "text", text: question }]
      : question;
    const history = [...msgs, { role: "user", content: display || question, img: attach ? attach.url : null, api }];
    setMsgs(history); setInput(""); setBusy(true);
    try {
      // Gate FIRST — don't create/persist a thread for a message that gets paywalled.
      if (!(await gateAI("deepdive"))) { setBusy(false); return; }
      const isNewThread = !threadId;
      // Persist the user turn (create the thread on first message). Photos are kept
      // in-session only — data URLs are far too large to store per-message in the DB.
      const tid = await ensureThread(display || question);
      if (tid) persist(tid, "user", (attach ? "📷 " : "") + (display || question), null);
      // Token control: only the 2 most recent photos travel to the API; older ones become a note.
      let imgsSeen = 0;
      const apiMsgs = [...history].reverse().map((m) => {
        let c = m.api || m.content;
        if (Array.isArray(c) && c.some((b) => b.type === "image")) {
          imgsSeen += 1;
          if (imgsSeen > 2) c = "[photo previously attached] " + (c.find((b) => b.type === "text") || {}).text;
        }
        return { role: m.role, content: c };
      }).reverse();
      const reply = await askReefAI(apiMsgs, SYS, "deepdive");
      const answer = reply || "Hmm, I couldn't generate a response just now.";
      setMsgs((m) => [...m, { role: "assistant", content: answer }]);
      if (tid) persist(tid, "assistant", answer, null);
      // Journal the consultation: one entry per NEW conversation, linked to the thread
      // so it can be reopened from the journal later.
      if (tid && isNewThread && journalLog) {
        const topic = (display || question).replace(/\s+/g, " ").trim().slice(0, 70);
        const excerpt = answer.replace(/\s+/g, " ").trim().slice(0, 170);
        supabase.from("tank_log").insert({
          tank_id: state.tankId, entry_type: "DeepDive", ai_thread_id: tid,
          note: `Asked: "${topic}" — ${excerpt}${answer.length > 170 ? "…" : ""}`,
        }).then(() => {});
      }
    } catch (e) {
      if (e.limitReached && onUpgrade) { setMsgs((m) => m.slice(0, -1)); onUpgrade(); setBusy(false); return; }
      setMsgs((m) => [...m, { role: "assistant", content: "DeepDive error: " + (e.message || "connection failed") + " — try again in a moment." }]); }
    setBusy(false);
  }
  const diagnose = () => {
    const t = state.tank; const live = state.livestock.map((l) => l.name).join(", ");
    send(`Diagnose my reef tank. Tank: ${t.model}, ${t.volume} gallons, set up ${t.since}. Current parameters — ${snapshot()}. Livestock: ${live}. Give a quick health read, flag what's drifting, and 2-3 concrete next actions.`,
      "🔍 Diagnose my tank using current parameters");
  };
  // Context-aware suggestions built from THIS tank's flags, livestock, and stage.
  const suggestions = useMemo(() => {
    const out = [];
    const active = state.livestock.filter((l) => (l.status || "alive") === "alive");
    // 1) Anything drifting → a targeted fix question
    for (const p of issues.slice(0, 2)) {
      const lv = lastVal(state.history, p.key);
      if (lv) out.push({ label: `Why is my ${p.label.toLowerCase()} ${lv.v > p.ideal[1] ? "high" : "low"}?`, q: `My ${p.label} is ${lv.v}${p.unit} (target ${p.ideal[0]}-${p.ideal[1]}). Why might that be, and how do I safely correct it for this tank?` });
    }
    // 2) A question about a specific animal they keep
    if (active.length) {
      const pick = active[Math.floor(Math.random() * active.length)];
      out.push({ label: `Care tips for my ${pick.name}`, q: `Give me care tips for keeping ${pick.name} healthy in this specific tank, based on my current parameters.` });
    }
    // 3) Stage-appropriate / stocking
    if (active.length < 3) out.push({ label: "What should I add next?", q: "Based on my tank size, parameters, and current livestock, what would be a good next addition — and what should I avoid?" });
    else out.push({ label: "Is my tank ready for SPS?", q: "Looking at my parameters and stability, is my tank ready for SPS corals? What would you want to see first?" });
    // 4) Always-useful maintenance
    out.push({ label: "What should I test next?", q: "Given my recent readings, which parameters should I prioritise testing next and how often?" });
    // 5) Continuity: nudge toward the most recent past conversation's topic
    if (threads.length && !threadId) {
      const last = threads[0];
      if (last && last.title) out.unshift({ label: `Continue: ${last.title.slice(0, 28)}${last.title.length > 28 ? "…" : ""}`, q: null, resume: last.id });
    }
    return out.slice(0, 5);
  }, [state.tankId, state.livestock, state.history, issues, threads, threadId]);
  return (
    <div className="rb-fadein">
      {state.profile.plan !== "pro" && (
        <FreeTasteBanner used={state.profile.deepdive_used} limit={FREE_DEEPDIVE} unit="free AI messages" onUpgrade={onUpgrade} />
      )}
      <TankSwitcher tanks={state.tanks} tankId={state.tankId} switchTank={async (id) => { await switchTank(id); newChat(); }} />
      {state.tanks.length > 1 && (
        <div style={{ fontSize: 12.5, color: "var(--muted)", margin: "0 2px 12px", display: "flex", alignItems: "center", gap: 6 }}>
          <Bot size={14} color="var(--aqua)" /> DeepDive is looking at <b style={{ color: "var(--text)" }}>{t.name}</b> — switch tanks above to ask about another.
        </div>
      )}
      <div className={"rb-ai-wrap" + (msgs.length ? "" : " compact")}>
      <div className={"rb-ai-msgs" + (msgs.length ? " grow" : " empty")} ref={scroller}>
        {msgs.length === 0 && (
          <div className="rb-empty"><Bot size={28} color="var(--aqua)" style={{ opacity: .85 }} />
            <div style={{ marginTop: 10 }}>Ask anything about <b style={{ color: "var(--text)" }}>{t.name}</b> — DeepDive can see your parameters and livestock.</div></div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={"rb-ai-msg " + (m.role === "user" ? "u" : "a")}>
            {m.img && <img src={m.img} alt="attached" style={{ display: "block", maxWidth: 180, borderRadius: 10, marginBottom: m.content ? 8 : 0 }} />}
            {m.content}
          </div>
        ))}
        {busy && <div className="rb-ai-msg a"><div className="rb-typing"><i /><i /><i /></div></div>}
      </div>
      {msgs.length === 0 ? (
        <>
          <button className="rb-btn violet" style={{ width: "100%", marginBottom: 10, padding: 13 }} onClick={diagnose} disabled={busy}>
            <TrendingUp size={16} /> Diagnose {t.name}{issues.length ? ` · ${issues.length} flag${issues.length > 1 ? "s" : ""}` : ""}
          </button>
          <div style={{ fontSize: 11.5, color: "var(--muted)", margin: "0 2px 8px" }}>Or ask about your tank:</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            {suggestions.map((s, i) => (
              <div key={i} className="rb-chip" style={{ fontSize: 12 }} onClick={() => { if (busy) return; if (s.resume) openThread(s.resume); else send(s.q, s.label); }}>{s.label}</div>
            ))}
            {threads.length > 0 && <div className="rb-chip" style={{ fontSize: 12 }} onClick={() => setHistOpen(true)}>🕐 Past chats</div>}
          </div>
        </>
      ) : (
        <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
          <div className="rb-chip" style={{ fontSize: 11.5 }} onClick={() => !busy && diagnose()}>🔍 Re-diagnose {t.name}</div>
          <div className="rb-chip" style={{ fontSize: 11.5 }} onClick={newChat}>✨ New chat</div>
          <div className={"rb-chip" + (journalLog ? " on" : "")} style={{ fontSize: 11.5 }} onClick={toggleJournalLog}
            title="Log each new conversation to the tank journal">
            <Notebook size={12} style={{ verticalAlign: -2, marginRight: 4 }} />{journalLog ? "Journaling on" : "Journaling off"}
          </div>
          {threads.length > 0 && <div className="rb-chip" style={{ fontSize: 11.5 }} onClick={() => setHistOpen(true)}>🕐 History</div>}
        </div>
      )}
      {photo && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, padding: "8px 10px",
          background: "var(--bg-1)", border: "1px solid var(--brd-2)", borderRadius: 12 }}>
          <img src={photo.url} alt="preview" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 8 }} />
          <div style={{ flex: 1, fontSize: 12.5, color: "var(--muted)" }}>Photo attached — ask a question about it, or just hit send.</div>
          <span style={{ color: "var(--bad)", fontWeight: 700, cursor: "pointer", padding: 6 }} onClick={() => setPhoto(null)}>✕</span>
        </div>
      )}
      <div className="rb-ai-row">
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
          onChange={(e) => { const f = e.target.files && e.target.files[0]; if (f) readReefPhoto(f, setPhoto); e.target.value = ""; }} />
        <button className="rb-btn ghost" style={{ flex: "none", padding: "0 13px" }} disabled={busy}
          onClick={() => fileRef.current && fileRef.current.click()} title="Attach a photo">
          <Camera size={17} color={photo ? "var(--aqua)" : "currentColor"} />
        </button>
        <input className="rb-input" placeholder={photo ? "What do you want to know about this photo?" : "e.g. Why is my hammer receding?"} value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (input.trim() || photo) && !busy) send(input.trim()); }} />
        <button className="rb-btn" disabled={(!input.trim() && !photo) || busy} onClick={() => send(input.trim())}><Send size={16} /></button>
      </div>
      </div>

      {histOpen && (
        <div className="rb-overlay" onClick={() => setHistOpen(false)}>
          <div className="rb-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="rb-sheet-h"><b>Past conversations</b><div className="rb-iconbtn" onClick={() => setHistOpen(false)}><X size={18} /></div></div>
            {threads.length === 0 && <div className="rb-empty" style={{ padding: 24 }}>No saved conversations yet.</div>}
            {threads.map((th) => {
              const tank = state.tanks.find((x) => x.id === th.tank_id);
              return (
                <div key={th.id} className="rb-li" style={{ cursor: "pointer" }} onClick={() => openThread(th.id)}>
                  <div className="rb-thumb" style={{ background: "linear-gradient(140deg,var(--violet),#0b2b3d)" }}><Bot size={18} color="#04111a" /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="nm" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{th.title || "Chat"}</div>
                    <div className="sub">{tank ? tank.name + " · " : ""}{fmtDate(new Date(th.updated_at).getTime())}</div>
                  </div>
                  <span style={{ color: journaled[th.id] ? "var(--good)" : "var(--aqua)", padding: 8, flex: "none" }}
                    title={journaled[th.id] ? "In the journal" : "Save to journal"}
                    onClick={(e) => { e.stopPropagation(); journalThread(th); }}>
                    {journaled[th.id] ? <Check size={16} /> : <Notebook size={16} />}
                  </span>
                  <span style={{ color: "var(--muted-2)", padding: 8, flex: "none" }} onClick={(e) => { e.stopPropagation(); if (confirm("Delete this conversation?")) deleteThread(th.id); }}><Trash2 size={16} /></span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- secondary screens ---------------- */
function Notifications({ uid }) {
  const [items, setItems] = useState(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      // my posts
      const { data: myPosts } = await supabase.from("posts").select("id, body").eq("author_id", uid);
      const ids = (myPosts || []).map((p) => p.id);
      const [likes, comments, dms, profiles] = await Promise.all([
        ids.length ? supabase.from("post_likes").select("post_id, profile_id, created_at").in("post_id", ids) : Promise.resolve({ data: [] }),
        ids.length ? supabase.from("post_comments").select("post_id, author_id, body, created_at").in("post_id", ids) : Promise.resolve({ data: [] }),
        supabase.from("messages").select("sender_id, body, created_at").eq("recipient_id", uid).order("created_at", { ascending: false }).limit(10),
        supabase.from("public_profiles").select("id, handle"),
      ]);
      const handle = Object.fromEntries((profiles.data || []).map((p) => [p.id, p.handle]));
      const postBody = Object.fromEntries((myPosts || []).map((p) => [p.id, (p.body || "").slice(0, 44)]));
      const all = [
        ...(likes.data || []).filter((l) => l.profile_id !== uid).map((l) => ({
          key: "l" + l.post_id + l.profile_id, who: handle[l.profile_id] || "someone", txt: `liked your post "${postBody[l.post_id]}…"`, at: l.created_at, c: "#ff7a9e" })),
        ...(comments.data || []).filter((c) => c.author_id !== uid).map((c) => ({
          key: "c" + c.post_id + c.created_at, who: handle[c.author_id] || "someone", txt: `commented: "${(c.body || "").slice(0, 50)}"`, at: c.created_at, c: "#3fe3ff" })),
        ...(dms.data || []).map((m) => ({
          key: "m" + m.created_at, who: handle[m.sender_id] || "someone", txt: `sent you a message: "${(m.body || "").slice(0, 46)}"`, at: m.created_at, c: "#b06cff" })),
      ].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 25);
      if (alive) setItems(all);
    })();
    return () => { alive = false; };
  }, [uid]);

  if (!items) return <div className="rb-empty" style={{ padding: 40 }}>Loading…</div>;
  return (
    <div className="rb-fadein">
      <div className="rb-card" style={{ marginTop: 6 }}>
        {items.length === 0 && (
          <div className="rb-empty" style={{ padding: "30px 20px" }}>
            <Bell size={26} color="var(--aqua)" style={{ opacity: .8 }} />
            <div style={{ marginTop: 10 }}>Nothing yet — when reefers like, comment, or message you, it shows up here.</div>
          </div>
        )}
        {items.map((n) => (
          <div key={n.key} className="rb-li">
            <div className="rb-pa" style={{ background: `linear-gradient(140deg,${n.c},var(--violet))` }}>{(n.who[0] || "?").toUpperCase()}</div>
            <div><div className="nm"><b>@{n.who}</b> <span style={{ fontWeight: 400 }}>{n.txt}</span></div><div className="sub">{rel(n.at)}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}
function Messages({ state, sendMessage }) {
  const [threads, setThreads] = useState(null);
  const [open, setOpen] = useState(null);
  const [reply, setReply] = useState("");
  const load = () => fetchThreads(state.uid).then(setThreads);
  useEffect(() => { load(); }, [state.uid]);

  const send = async () => {
    if (!reply.trim() || !open) return;
    const body = reply.trim();
    setReply("");
    await sendMessage(open.id, body, null);
    const fresh = await fetchThreads(state.uid);
    setThreads(fresh);
    setOpen(fresh.find((t) => t.id === open.id) || open);
  };

  if (open) {
    return (
      <div className="rb-fadein">
        <div className="rb-li" style={{ padding: "4px 0 14px" }}>
          <div className="rb-iconbtn" onClick={() => setOpen(null)}><ChevronLeft size={18} /></div>
          <div className="rb-pa" style={{ background: "linear-gradient(140deg,var(--aqua),var(--violet))", marginLeft: 4 }}>
            {open.handle[0].toUpperCase()}
          </div>
          <div className="nm">@{open.handle}</div>
        </div>
        <div className="rb-ai-msgs">
          {open.msgs.map((m) => (
            <div key={m.id} className={"rb-ai-msg " + (m.sender_id === state.uid ? "u" : "a")}>{m.body}</div>
          ))}
        </div>
        <div className="rb-ai-row">
          <input className="rb-input" placeholder="Reply…" value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") send(); }} />
          <button className="rb-btn" disabled={!reply.trim()} onClick={send}><Send size={16} /></button>
        </div>
      </div>
    );
  }
  return (
    <div className="rb-fadein">
      {threads === null && <div className="rb-card rb-empty" style={{ marginTop: 6 }}>Loading…</div>}
      {threads !== null && threads.length === 0 && (
        <div className="rb-card rb-empty" style={{ marginTop: 6, padding: "34px 20px" }}>
          <MessageCircle size={26} color="var(--aqua)" style={{ opacity: .8 }} />
          <div style={{ marginTop: 10, color: "var(--text)", fontWeight: 600 }}>No messages yet</div>
          <div style={{ marginTop: 6 }}>Browse Reefpedia, find someone who keeps a coral you love, and say hi.</div>
        </div>
      )}
      <div className="rb-card" style={{ marginTop: 6 }}>
        {(threads || []).map((t) => {
          const last = t.msgs[t.msgs.length - 1];
          return (
            <div key={t.id} className="rb-li" style={{ cursor: "pointer" }} onClick={() => setOpen(t)}>
              <div className="rb-pa" style={{ background: "linear-gradient(140deg,var(--aqua),var(--violet))" }}>
                {t.handle[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="nm">@{t.handle}</div>
                <div className="sub" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {last.sender_id === state.uid ? "You: " : ""}{last.body}
                </div>
              </div>
              <div className="sub">{rel(last.created_at)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Purchases() {
  return (
    <div className="rb-fadein"><div className="rb-card rb-empty" style={{ marginTop: 6, padding: "36px 22px" }}>
      <Receipt size={28} color="var(--aqua)" style={{ opacity: .8 }} />
      <div style={{ marginTop: 10, fontWeight: 600, color: "var(--text)" }}>No purchases yet</div>
      <div style={{ marginTop: 6 }}>When you buy from the Shop, your orders and their status will live here.</div>
    </div></div>
  );
}
function Seller({ state, openSell, markSold, removeListing }) {
  const mine = state.listings.filter((l) => l.sellerId === state.uid || l.seller === state.profile.handle);
  const active = mine.filter((l) => l.status !== "sold");
  const sold = mine.filter((l) => l.status === "sold");
  return (
    <div className="rb-fadein">
      <div className="rb-card rb-phero" style={{ padding: 20, marginTop: 6 }}>
        <div className="glow" />
        <div style={{ position: "relative" }}>
          <div style={{ fontFamily: "Bricolage Grotesque", fontWeight: 800, fontSize: 20 }}>Seller Hub</div>
          <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>Sell frags & gear to the local reef community.</div>
          <div className="rb-stats">
            <div className="rb-stat"><div className="v">{active.length}</div><div className="k">Active</div></div>
            <div className="rb-stat"><div className="v">{sold.length}</div><div className="k">Sold</div></div>
            <div className="rb-stat"><div className="v">5.0</div><div className="k">Rating</div></div>
          </div>
        </div>
      </div>
      <button className="rb-btn" style={{ width: "100%", marginTop: 12, padding: 13 }} onClick={openSell}><Tag size={16} /> List an item</button>
      <div className="rb-h2"><Store size={16} color="var(--aqua)" /> Your listings</div>
      <div className="rb-card">
        {mine.length === 0 && <div className="rb-empty">No listings yet. Tap "List an item" to post your first frag.</div>}
        {mine.map((l) => {
          const isSold = l.status === "sold";
          return (
            <div key={l.id} className="rb-li" style={{ opacity: isSold ? 0.6 : 1 }}>
              <div className="rb-thumb" style={{ background: `linear-gradient(140deg,${l.g[0]},${l.g[1]})` }}><Tag size={18} color="#04111a" /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="nm">{l.title} {isSold && <span style={{ fontSize: 10, color: "var(--muted-2)", fontWeight: 700 }}>SOLD</span>}</div>
                <div className="sub">{l.cat} · ${l.price}</div>
              </div>
              {!isSold && markSold && (
                <span style={{ color: "var(--good)", cursor: "pointer", padding: "6px 8px", fontSize: 12, flex: "none" }}
                  onClick={() => { if (confirm(`Mark "${l.title}" as sold?`)) markSold(l.id); }}>Sold</span>
              )}
              {removeListing && (
                <span style={{ color: "var(--bad)", cursor: "pointer", padding: "6px 8px", fontSize: 12, flex: "none" }}
                  onClick={() => { if (confirm(`Remove "${l.title}"?`)) removeListing(l.id); }}>✕</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
function SettingsView({ state, setTankSharing, createTank, renameTank, deleteTank }) {
  const [legalDoc, setLegalDoc] = useState(null);
  const [tankSheet, setTankSheet] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const Toggle = ({ on, onChange }) => (
    <div onClick={() => onChange(!on)} style={{
      width: 46, height: 27, borderRadius: 14, flex: "none", cursor: "pointer", position: "relative",
      background: on ? "linear-gradient(120deg,var(--aqua),var(--teal))" : "rgba(255,255,255,.12)",
      transition: ".2s", border: "1px solid " + (on ? "transparent" : "var(--brd)"),
    }}>
      <div style={{
        position: "absolute", top: 2, left: on ? 21 : 2, width: 21, height: 21, borderRadius: "50%",
        background: on ? "#04111a" : "var(--muted)", transition: ".2s",
      }} />
    </div>
  );
  return (
    <div className="rb-fadein">
      <div className="rb-h2" style={{ marginTop: 6 }}><Waves size={16} color="var(--teal)" /> My tanks <small onClick={() => setTankSheet(true)} style={{ cursor: "pointer", color: "var(--aqua)" }}>+ add tank</small></div>
      <div className="rb-card" style={{ padding: "4px 14px" }}>
        {state.tanks.map((t, i) => (
          <div key={t.id} className="rb-li" style={{ borderBottom: i < state.tanks.length - 1 ? "1px solid rgba(255,255,255,.06)" : "none" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="nm">{t.name}</div>
              <div className="sub">{t.model} · {t.volume} gal · since {t.since}</div>
            </div>
            <span style={{ color: "var(--muted)", cursor: "pointer", padding: "6px 8px", fontSize: 12.5, flex: "none" }}
              onClick={() => { const nm = prompt("Rename tank:", t.name); if (nm != null) renameTank(t.id, nm); }}>Rename</span>
            <span style={{ color: state.tanks.length > 1 ? "var(--bad)" : "var(--muted-2)", cursor: state.tanks.length > 1 ? "pointer" : "not-allowed", padding: "6px 8px", fontSize: 12.5, flex: "none" }}
              onClick={() => { if (confirm(`Delete "${t.name}"? This removes its readings, livestock, and journal permanently.`)) deleteTank(t.id); }}>Delete</span>
          </div>
        ))}
      </div>

      <div className="rb-h2"><Users size={16} color="var(--aqua)" /> Community sharing</div>
      <div className="rb-card" style={{ padding: "4px 14px" }}>
        {state.tanks.map((t, i) => (
          <div key={t.id} style={{ padding: "14px 0", borderBottom: i < state.tanks.length - 1 ? "1px solid rgba(255,255,255,.06)" : "none" }}>
            <div style={{ fontWeight: 700, fontSize: 14.5 }}>{t.name}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{t.model} · {t.volume} gal</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>Show tank & livestock</div>
                <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2, lineHeight: 1.4 }}>
                  Lets other reefers find you in Reefpedia as a keeper.
                </div>
              </div>
              <Toggle on={t.isPublic} onChange={(v) => setTankSharing(t.id, "public", v)} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>Share test results</div>
                <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2, lineHeight: 1.4 }}>
                  Posts your latest readings to the community "Recent Parameters" feed. Off by default.
                </div>
              </div>
              <Toggle on={t.shareParams} onChange={(v) => setTankSharing(t.id, "params", v)} />
            </div>
          </div>
        ))}
      </div>

      <div className="rb-h2"><Settings size={16} color="var(--muted)" /> App</div>
      <div className="rb-card">
        {[["Units", "Imperial (°F, gal)"], ["Theme", "Actinic (dark)"], ["Signed in as", "@" + state.profile.handle]].map(([k, v], i) => (
          <div key={i} className="rb-li"><div className="nm">{k}</div><div style={{ marginLeft: "auto", color: "var(--muted)", fontSize: 13 }}>{v}</div></div>
        ))}
      </div>
      <button className="rb-btn ghost" style={{ width: "100%", marginTop: 14, padding: 13 }} onClick={() => supabase.auth.signOut()}>Sign out</button>

      <div className="rb-h2" style={{ marginTop: 22 }}><Trash2 size={15} color="var(--bad)" /> Danger zone</div>
      <div className="rb-card" style={{ padding: 14, border: "1px solid rgba(255,93,114,.3)" }}>
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>Delete my account</div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4, lineHeight: 1.5 }}>
          Permanently removes your tanks, readings, livestock, posts, listings, and messages. This can't be undone.
        </div>
        <button className="rb-btn" style={{ width: "100%", marginTop: 12, padding: 12, background: "rgba(255,93,114,.15)", color: "#ff8fa0", border: "1px solid rgba(255,93,114,.4)" }}
          onClick={() => setDeleteOpen(true)}>Delete account</button>
      <div style={{ textAlign: "center", fontSize: 11.5, color: "var(--muted-2)", marginTop: 16 }}>
        Tidepool Reef v{APP_VERSION}{APP_VERSION.startsWith("0.") ? " · pre-launch" : ""}
        <span style={{ margin: "0 7px", opacity: .4 }}>·</span>
        <span style={{ color: "var(--aqua)", cursor: "pointer" }} onClick={() => setLegalDoc("terms")}>Terms</span>
        <span style={{ margin: "0 7px", opacity: .4 }}>·</span>
        <span style={{ color: "var(--aqua)", cursor: "pointer" }} onClick={() => setLegalDoc("privacy")}>Privacy</span>
      </div>
      {legalDoc && <LegalSheet doc={legalDoc} onClose={() => setLegalDoc(null)} />}
      </div>

      <div style={{ textAlign: "center", color: "var(--muted-2)", fontSize: 12, marginTop: 18 }}>Tidepool Reef</div>
      {tankSheet && <NewTankSheet onClose={() => setTankSheet(false)} onCreate={createTank} />}
      {deleteOpen && <DeleteAccountSheet onClose={() => setDeleteOpen(false)} />}
    </div>
  );
}

function DeleteAccountSheet({ onClose }) {
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const doDelete = async () => {
    setBusy(true);
    const { error } = await supabase.rpc("delete_my_account");
    if (error) { setBusy(false); alert("Couldn't delete your account — try again or contact support."); return; }
    // Try to also remove the auth login via the server (works once SUPABASE_SERVICE_KEY is set).
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session && data.session.access_token;
      if (token) await fetch("/api/account", { method: "DELETE", headers: { Authorization: "Bearer " + token } }).catch(() => {});
    } catch (e) {}
    await supabase.auth.signOut();
    alert("Your account has been deleted.");
    location.reload();
  };
  return (
    <div className="rb-overlay" onClick={onClose}>
      <div className="rb-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="rb-sheet-h"><b>Delete account</b><div className="rb-iconbtn" onClick={onClose}><X size={18} /></div></div>
        <div style={{ fontSize: 13.5, color: "#d8eef5", lineHeight: 1.6 }}>
          This permanently deletes everything tied to your account — tanks, readings, livestock, journal, posts, listings, and messages. <b style={{ color: "#ff8fa0" }}>It cannot be undone.</b>
        </div>
        <div className="rb-field" style={{ marginTop: 16 }}><label>Type DELETE to confirm</label>
          <input className="rb-input" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="DELETE" autoCapitalize="characters" />
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
          <button className="rb-btn ghost" style={{ flex: 1 }} disabled={busy} onClick={onClose}>Cancel</button>
          <button className="rb-btn" style={{ flex: 1, background: "rgba(255,93,114,.18)", color: "#ff8fa0", border: "1px solid rgba(255,93,114,.45)" }}
            disabled={busy || confirm.trim().toUpperCase() !== "DELETE"} onClick={doDelete}>{busy ? "Deleting…" : "Delete forever"}</button>
        </div>
      </div>
    </div>
  );
}

function NewTankSheet({ onClose, onCreate }) {
  const [name, setName] = useState(""); const [model, setModel] = useState(""); const [gal, setGal] = useState("");
  const [since, setSince] = useState(String(new Date().getFullYear()));
  const PRESETS = [["IM NuVo Fusion 15", 15], ["Biocube 16", 16], ["40 Gallon Breeder", 40], ["Red Sea Reefer 425 XL", 120]];
  return (
    <div className="rb-overlay" onClick={onClose}>
      <div className="rb-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="rb-sheet-h"><b>Add a tank</b><div className="rb-iconbtn" onClick={onClose}><X size={18} /></div></div>
        <div className="rb-field"><label>Name</label><input className="rb-input" autoFocus placeholder="e.g. The Frag Tank" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="rb-field"><label>Type</label>
          <div className="rb-tabs" style={{ margin: "0 0 8px", flexWrap: "wrap" }}>
            {PRESETS.map(([m, g]) => <div key={m} className={"rb-chip" + (model === m ? " on" : "")} style={{ fontSize: 11.5 }} onClick={() => { setModel(m); setGal(String(g)); }}>{m}</div>)}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <input className="rb-input" placeholder="Model" value={model} onChange={(e) => setModel(e.target.value)} style={{ flex: 2 }} />
            <input className="rb-input" placeholder="Gallons" type="number" inputMode="numeric" value={gal} onChange={(e) => setGal(e.target.value)} style={{ flex: 1 }} />
          </div>
        </div>
        <button className="rb-btn" style={{ width: "100%", padding: 14 }} disabled={!name.trim()}
          onClick={() => { onCreate({ name, model, gal, since }); onClose(); }}>
          <Plus size={16} /> Create tank
        </button>
      </div>
    </div>
  );
}

/* ---------------- sheets ---------------- */
function LogSheet({ latest, history, onClose, onSave }) {
  // Fields start EMPTY — only what you actually enter gets recorded.
  // (Pre-filling from the last reading was silently logging phantom data.)
  const [vals, setVals] = useState(() => { const o = {}; PARAMS.forEach((p) => (o[p.key] = "")); return o; });
  const entered = PARAMS.filter((p) => vals[p.key].trim() !== "" && Number.isFinite(parseFloat(vals[p.key])));
  const statusColor = { good: "var(--good)", warn: "var(--warn)", bad: "var(--bad)" };
  const statusWord = { good: "in range", warn: "a little off", bad: "out of range" };
  return (
    <div className="rb-overlay" onClick={onClose}>
      <div className="rb-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="rb-sheet-h"><b>Log test results</b><div className="rb-iconbtn" onClick={onClose}><X size={18} /></div></div>
        <div style={{ fontSize: 12, color: "var(--muted)", margin: "0 2px 10px" }}>
          Only fill in what you tested — leave the rest blank.
        </div>
        {PARAMS.map((p) => {
          const lv = history ? lastVal(history, p.key) : null;
          const raw = vals[p.key].trim();
          const num = raw !== "" ? parseFloat(raw) : null;
          const st = num != null && Number.isFinite(num) ? statusOf(p, num) : "none";
          return (
            <div key={p.key}>
              <div className="rb-num" style={st !== "none" ? { borderColor: statusColor[st] } : null}>
                <label>{p.label} <span style={{ color: "var(--muted)" }}>{p.unit}</span></label>
                <input type="number" inputMode="decimal" value={vals[p.key]}
                  placeholder={lv ? `last: ${lv.v}` : "—"}
                  onChange={(e) => setVals((v) => ({ ...v, [p.key]: e.target.value }))} />
              </div>
              {st !== "none" && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "-4px 2px 8px", fontSize: 11.5 }}>
                  <span className={"rb-sdot " + sclass[st]} style={{ width: 7, height: 7 }} />
                  <span style={{ color: statusColor[st], fontWeight: 600 }}>{statusWord[st]}</span>
                  <span style={{ color: "var(--muted-2)" }}>· target {p.ideal[0]}–{p.ideal[1]}{p.unit}</span>
                </div>
              )}
            </div>
          );
        })}
        <button className="rb-btn" style={{ width: "100%", marginTop: 8, padding: 14 }} disabled={entered.length === 0}
          onClick={() => {
            const out = {};
            entered.forEach((p) => { out[p.key] = parseFloat(vals[p.key]); });
            onSave(out); onClose();
          }}>
          <Check size={17} /> Save {entered.length > 0 ? `${entered.length} reading${entered.length > 1 ? "s" : ""}` : "reading"} <span style={{ opacity: .7 }}>· +5 Pearls</span>
        </button>
      </div>
    </div>
  );
}
function SellSheet({ onClose, onSave }) {
  const [title, setTitle] = useState(""); const [price, setPrice] = useState(""); const [cat, setCat] = useState("Coral");
  const [desc, setDesc] = useState("");
  return (
    <div className="rb-overlay" onClick={onClose}>
      <div className="rb-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="rb-sheet-h"><b>List an item</b><div className="rb-iconbtn" onClick={onClose}><X size={18} /></div></div>
        <div className="rb-field"><label>Category</label>
          <div className="rb-tabs" style={{ margin: 0 }}>{["Coral", "Fish", "Equipment"].map((c) => <div key={c} className={"rb-chip" + (cat === c ? " on" : "")} onClick={() => setCat(c)}>{c}</div>)}</div>
        </div>
        <div className="rb-field"><label>Title</label><input className="rb-input" placeholder="e.g. WYSIWYG Acan frag" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div className="rb-field"><label>Price ($)</label><input className="rb-input" type="number" inputMode="decimal" placeholder="45" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
        <div className="rb-field"><label>Description <span style={{ color: "var(--muted-2)" }}>(optional)</span></label>
          <textarea className="rb-input" rows={3} placeholder="Size, coloration, care notes, pickup vs shipping…" value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
        <button className="rb-btn" style={{ width: "100%", padding: 14 }} disabled={!title.trim() || !price}
          onClick={() => { onSave({ cat, title: title.trim(), price: parseFloat(price) || 0, description: desc.trim() }); onClose(); }}>
          <Tag size={16} /> Post listing <span style={{ opacity: .7 }}>· +3 Pearls</span>
        </button>
      </div>
    </div>
  );
}
