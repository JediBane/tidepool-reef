import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceArea, CartesianGrid,
} from "recharts";
import {
  Menu, X, Bell, Waves, Droplets, Fish, Shell, Store, Newspaper, BookOpen, ListChecks,
  FlaskConical, Notebook, Camera, Bot, MessageCircle, Receipt, Settings, MapPin, Heart,
  ChevronRight, ChevronLeft, Check, Sparkles, TrendingUp, Send, Clock, Tag, Plus, Calendar,
  Award, Image as ImageIcon, Search, PenSquare, Upload, Beaker, User, Users, SlidersHorizontal,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { REEFPEDIA, REEFPEDIA_CATS } from "./reefpedia.js";
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
.rb-root{font-family:'Hanken Grotesk',sans-serif;color:var(--text);min-height:100vh;position:relative;overflow-x:hidden;
  background:radial-gradient(120% 80% at 50% -10%,rgba(63,227,255,.18),transparent 55%),
    radial-gradient(90% 60% at 90% 110%,rgba(176,108,255,.12),transparent 60%),
    radial-gradient(70% 50% at 0% 100%,rgba(255,122,92,.08),transparent 55%),
    linear-gradient(180deg,var(--bg-1),var(--bg-0) 70%);}
.rb-root:before{content:'';position:fixed;inset:0;pointer-events:none;opacity:.5;mix-blend-mode:overlay;z-index:0;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.035'/%3E%3C/svg%3E");}
.rb-shell{max-width:480px;margin:0 auto;position:relative;z-index:1;padding:0 16px calc(110px + env(safe-area-inset-bottom,0px));}
.rb-fadein{animation:rbUp .5s cubic-bezier(.2,.7,.2,1) forwards;}
@keyframes rbUp{from{opacity:0;transform:translateY(14px)}99%{transform:translateY(0)}to{opacity:1;transform:none}}

.rb-top{display:flex;align-items:center;gap:12px;padding:18px 2px 14px;position:sticky;top:0;z-index:30;}
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
.rb-av.ring{box-shadow:0 0 0 3px var(--gold),0 0 0 6px rgba(255,194,77,.25);background:#0a1a25;}
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
.rb-thumb{width:46px;height:46px;border-radius:13px;flex:none;display:grid;place-items:center;color:#04111a;}
.rb-li .nm{font-weight:600;font-size:14px;}
.rb-li .sub{font-size:12px;color:var(--muted);margin-top:1px;}

/* tasks */
.rb-task{display:flex;align-items:center;gap:12px;padding:13px 14px;border-bottom:1px solid rgba(255,255,255,.05);cursor:pointer;}
.rb-task:last-child{border-bottom:none;}
.rb-check{width:26px;height:26px;border-radius:9px;border:2px solid var(--brd-2);flex:none;display:grid;place-items:center;
  color:var(--bg-0);transition:.18s;cursor:pointer;}
.rb-check:hover{border-color:var(--good);}
.rb-check.done{background:var(--good);border-color:var(--good);animation:rbPop .4s ease;}
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
  font-family:inherit;font-size:14px;padding:11px 13px;resize:none;outline:none;}
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
  display:flex;align-items:flex-end;justify-content:center;animation:rbFade .2s both;overflow-y:auto;overscroll-behavior:contain;}
.rb-sheet{width:min(480px,100%);max-height:88vh;overflow-y:auto;background:linear-gradient(180deg,var(--bg-2),var(--bg-1));
  border:1px solid var(--brd);border-radius:26px 26px 0 0;padding:20px;animation:rbSheet .3s cubic-bezier(.2,.8,.2,1) both;}
@keyframes rbSheet{from{transform:translateY(40px);opacity:.4}to{transform:none;opacity:1}}
.rb-sheet-h{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;}
.rb-sheet-h b{font-family:'Bricolage Grotesque';font-size:19px;}
.rb-field{margin-bottom:13px}.rb-field label{font-size:12px;color:var(--muted);display:block;margin-bottom:6px;}
.rb-num{display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,.04);border:1px solid var(--brd);
  border-radius:12px;padding:9px 13px;margin-bottom:8px;}
.rb-num label{font-size:13px}.rb-num input{width:84px;background:transparent;border:none;color:var(--aqua);text-align:right;
  font-family:'Bricolage Grotesque';font-weight:700;font-size:16px;outline:none;}

/* AI */
.rb-ai-msgs{display:flex;flex-direction:column;gap:10px;margin-bottom:14px;}
.rb-ai-msg{padding:11px 14px;border-radius:15px;font-size:13.5px;line-height:1.5;max-width:88%;white-space:pre-wrap;}
.rb-ai-msg.u{align-self:flex-end;background:linear-gradient(120deg,var(--aqua-d),var(--aqua));color:var(--bg-0);font-weight:500;}
.rb-ai-msg.a{align-self:flex-start;background:rgba(255,255,255,.05);border:1px solid var(--brd);}
.rb-ai-row{display:flex;gap:9px;position:sticky;bottom:0;}
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
.rb-searchpill input{flex:1;background:transparent;border:none;color:var(--text);outline:none;font-family:inherit;font-size:14px;}
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
  .rb-postgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;align-items:stretch;}
  .rb-postgrid .rb-post{margin-bottom:0;}
  .rb-overlay{align-items:center;padding:24px;}
  .rb-sheet{border-radius:26px;max-height:82vh;animation:rbModal .25s cubic-bezier(.2,.8,.2,1) both;}
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
  { key: "alk",  label: "Alkalinity", unit: "dKH", min: 7.5, max: 9.5, ideal: [8, 9],       dec: 1 },
  { key: "cal",  label: "Calcium",    unit: "ppm", min: 380, max: 470, ideal: [420, 440],   dec: 0 },
  { key: "mag",  label: "Magnesium",  unit: "ppm", min: 1250,max: 1450,ideal: [1300, 1400], dec: 0 },
  { key: "no3",  label: "Nitrate",    unit: "ppm", min: 0,   max: 30,  ideal: [5, 10],      dec: 1 },
  { key: "po4",  label: "Phosphate",  unit: "ppm", min: 0,   max: 0.25,ideal: [0.03, 0.1],  dec: 2 },
  { key: "ph",   label: "pH",         unit: "",    min: 7.7, max: 8.5, ideal: [8.0, 8.4],   dec: 2 },
  { key: "sal",  label: "Salinity",   unit: "sg",  min: 1.02,max: 1.028,ideal:[1.024,1.026],dec: 3 },
  { key: "temp", label: "Temp",       unit: "°F",  min: 74,  max: 82,  ideal: [76, 78],     dec: 1 },
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

const NOTIFS = [
  { id: 1, who: "torch_lord", txt: "liked your Gold Hammer post", time: "12m", c: "#ff7a5c" },
  { id: 2, who: "frag_fiend", txt: "sent you a message about the Rainbow Zoas", time: "1h", c: "#b06cff" },
  { id: 3, who: "Tidepool Reef", txt: "Your nitrate is trending up — tap to see DeepDive's read", time: "3h", c: "#3fe3ff" },
  { id: 4, who: "nano_nate", txt: "started following you", time: "5h", c: "#2ee6c8" },
  { id: 5, who: "FragSwap FL", txt: "posted an event near Melbourne, FL", time: "1d", c: "#ffc24d" },
  { id: 6, who: "acan_acres", txt: "replied to your comment", time: "1d", c: "#ff5d72" },
];

function statusOf(p, v) {
  if (v == null) return "warn";
  if (v < p.min || v > p.max) return "bad";
  if (v < p.ideal[0] || v > p.ideal[1]) return "warn";
  return "good";
}
const sclass = { good: "s-good", warn: "s-warn", bad: "s-bad" };
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
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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
async function fetchPublicTank(tankId) {
  const [{ data: tank }, { data: stock }] = await Promise.all([
    supabase.from("tanks").select("*").eq("id", tankId).single(),
    supabase.from("livestock").select("*").eq("tank_id", tankId).order("kind"),
  ]);
  let owner = null;
  if (tank) {
    const { data: p } = await supabase.from("profiles")
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
    supabase.from("profiles").select("id, handle"),
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
    supabase.from("profiles").select("id, handle"),
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
    livestock: (lr.data || []).map((r) => ({ id: r.id, type: r.kind, name: r.name, note: r.note || "", c: r.color || KIND_COLOR[r.kind] || "#3fe3ff", species_id: r.species_id })),
    tasks: (tr.data || []).map((r) => ({ id: r.id, name: r.name, every: r.every, due: new Date(r.due_at).getTime() })),
    log: (gr.data || []).map((r) => ({ id: r.id, date: new Date(r.created_at).getTime(), type: r.entry_type, note: r.note })),
  };
}

async function fetchAll(uid) {
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", uid).single();
  let { data: tanksAll } = await supabase.from("tanks").select("*").eq("owner_id", uid).order("created_at");
  if (!tanksAll || !tanksAll.length) {
    const { data: created, error } = await supabase.from("tanks")
      .insert({ owner_id: uid, name: (profile && profile.display_name) || "My Reef", model: "IM NuVo Fusion 15", volume_gal: 15, since: "2025" })
      .select().single();
    if (error) throw error;
    await supabase.from("tasks").insert(DEFAULT_TASKS.map((t) => ({
      tank_id: created.id, name: t.name, every: t.every, due_at: new Date(Date.now() + t.offset).toISOString(),
    })));
    tanksAll = [created];
  }
  let savedId = null; try { savedId = localStorage.getItem("tr:tank"); } catch (e) {}
  const active = tanksAll.find((t) => t.id === savedId) || tanksAll[0];
  const [children, mr, sr, allLikes, kr, cm, counts, pf] = await Promise.all([
    fetchTankChildren(active.id),
    supabase.from("listings").select("*").eq("status", "active").order("created_at", { ascending: false }).limit(50),
    supabase.from("posts").select("*").order("created_at", { ascending: false }).limit(50),
    supabase.from("post_likes").select("post_id"),
    supabase.from("post_likes").select("post_id").eq("profile_id", uid),
    supabase.from("post_comments").select("post_id"),
    fetchSpeciesCounts(),
    supabase.from("profiles").select("id, handle, display_name"),
  ]);
  // Surface failures instead of silently rendering an empty feed.
  [["listings", mr], ["posts", sr], ["likes", allLikes], ["profiles", pf]].forEach(([label, r]) => {
    if (r && r.error) console.error(`[tidepool] ${label} query failed:`, r.error.message, r.error.details || "");
  });

  const people = {};
  (pf.data || []).forEach((p) => (people[p.id] = p));
  const liked = {};
  (kr.data || []).forEach((r) => (liked[r.post_id] = true));
  const likeCounts = {};
  (allLikes.data || []).forEach((r) => (likeCounts[r.post_id] = (likeCounts[r.post_id] || 0) + 1));
  const commentCounts = {};
  (cm.data || []).forEach((r) => (commentCounts[r.post_id] = (commentCounts[r.post_id] || 0) + 1));
  return {
    uid,
    profile: profile || { handle: "reefer", display_name: "Reefer", pearls: 100, location: "Florida, United States" },
    pearls: (profile && profile.pearls) != null ? profile.pearls : 100,
    tanks: tanksAll.map(shapeTank),
    speciesCounts: counts || {},
    tankId: active.id,
    tank: shapeTank(active),
    ...children,
    listings: (mr.data || []).map((r, i) => ({
      id: r.id, cat: r.category, title: r.title, price: Number(r.price_usd),
      loc: r.location || "", seller: (people[r.seller_id] && people[r.seller_id].handle) || "reefer", g: PALETTE[i % PALETTE.length],
    })),
    posts: (sr.data || []).map((r) => {
      const a = people[r.author_id];
      return {
        id: r.id, user: (a && (a.display_name || a.handle)) || "reefer",
        handle: (a && a.handle) || "reefer", tag: r.tag, tagc: TAG_COLOR[r.tag] || "#3fe3ff",
        time: rel(r.created_at), body: r.body, img: r.img ? r.img.split(",") : null,
        likes: likeCounts[r.id] || 0, comments: commentCounts[r.id] || 0, mine: r.author_id === uid,
      };
    }),
    liked,
  };
}

/* AI via Netlify function proxy (key stays server-side) */
async function askReefAI(messages, system) {
  const res = await fetch("/api/chat", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ max_tokens: 1000, system, messages }),
  });
  const data = await res.json();
  if (data && data.error) throw new Error(data.error.message || "AI request failed");
  return (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
}

/* coral avatar */
function CoralAvatar({ size = 56 }) {
  return (
    <div className="rb-av ring" style={{ width: size, height: size }}>
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 48 48">
        <path d="M14 44c-1-8 1-13-2-18-2-3 0-7 3-6 1-5 5-6 6-1 2-4 6-3 5 1 3-1 5 2 3 5-2 4-1 9-2 19z" fill="#b06cff"/>
        <path d="M30 44c0-7-1-11 2-15 2-3 6-2 5 2 2-2 5 0 4 3-1 2 0 6-1 10z" fill="#3ce0a3"/>
        <path d="M22 44c0-5 0-9-1-12 2-1 4 1 3 4 1 0 2 2 1 4z" fill="#3fe3ff"/>
      </svg>
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
function AuthScreen() {
  const [mode, setMode] = useState("signin"); // signin | signup
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [handle, setHandle] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true); setMsg("");
    try {
      if (mode === "signup") {
        const clean = handle.trim().replace(/[^a-zA-Z0-9_]/g, "");
        if (clean.length < 2) { setMsg("Pick a handle (letters, numbers, underscores)."); setBusy(false); return; }
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password: pw, options: { data: { handle: clean } } });
        if (error) setMsg(error.message);
        else if (!data.session) setMsg("Check your email to confirm your account, then sign in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pw });
        if (error) setMsg(error.message);
      }
    } catch (e) { setMsg("Something went wrong — try again."); }
    setBusy(false);
  };

  return (
    <div className="rb-root"><style>{STYLES}</style>
      <div className="rb-shell" style={{ paddingTop: 70 }}>
        <div className="rb-authwrap">
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}><CoralAvatar size={84} /></div>
        <ReefLogo />
        <div style={{ textAlign: "center", color: "var(--muted)", fontSize: 13.5, margin: "10px 0 24px" }}>
          Track your reef. Trade frags. Talk coral.
        </div>
        <div className="rb-card" style={{ padding: 18 }}>
          <div className="rb-tabs" style={{ margin: "0 0 14px" }}>
            <div className={"rb-chip" + (mode === "signin" ? " on" : "")} onClick={() => setMode("signin")}>Sign in</div>
            <div className={"rb-chip" + (mode === "signup" ? " on" : "")} onClick={() => setMode("signup")}>Create account</div>
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
          {msg && <div style={{ color: "var(--warn)", fontSize: 13, marginBottom: 10, lineHeight: 1.4 }}>{msg}</div>}
          <button className="rb-btn" style={{ width: "100%", padding: 14 }} disabled={!email || !pw || busy} onClick={submit}>
            {busy ? "One sec…" : mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </div>
        <div style={{ textAlign: "center", color: "var(--muted-2)", fontSize: 12, marginTop: 16 }}>
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
export default function TidepoolReef() {
  const [state, setState] = useState(null);
  const [view, setView] = useState("tank");        // feed|library|shop|tasks|profile|params|tanklog|reefid|deepdive|notifications|messages|purchases|seller|settings
  const [drawer, setDrawer] = useState(false);
  const [sel, setSel] = useState("alk");
  const [cat, setCat] = useState("All");
  const [libCat, setLibCat] = useState("All");
  const [sheet, setSheet] = useState(null);        // log|sell|libDetail
  const [libItem, setLibItem] = useState(null);
  const [publicTank, setPublicTank] = useState(null);
  const [msgTo, setMsgTo] = useState(null);
  const [toast, setToast] = useState(0);

  const [session, setSession] = useState(undefined); // undefined=checking, null=signed out
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (session && session.user) { setState(null); fetchAll(session.user.id).then(setState).catch((e) => console.error("load failed", e)); }
  }, [session && session.user && session.user.id]);

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
  if (session === null) return <AuthScreen />;
  if (!state) {
    return (<div className="rb-root"><style>{STYLES}</style><div className="rb-shell"><div className="rb-empty" style={{ paddingTop: 120 }}>
      <Waves size={30} style={{ opacity: .6 }} /><div style={{ marginTop: 12 }}>Loading your reef…</div></div></div></div>);
  }

  const allListings = state.listings;
  const allPosts = state.posts;
  const issues = latest ? PARAMS.filter((p) => statusOf(p, latest[p.key]) !== "good") : [];
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
    setState((s) => ({ ...s, history: [...s.history, { date: Date.now(), ...vals }] }));
    await supabase.from("parameters").insert({ tank_id: state.tankId, ...vals });
    award(5);
  };
  const addLogEntry = async (type, note) => {
    setState((s) => ({ ...s, log: [{ id: "tmp" + Date.now(), date: Date.now(), type, note }, ...s.log] }));
    await supabase.from("tank_log").insert({ tank_id: state.tankId, entry_type: type, note });
    award(5);
  };
  const addLivestock = async (kind, name, note, speciesId) => {
    const c = KIND_COLOR[kind] || "#3fe3ff";
    setState((s) => ({ ...s, livestock: [...s.livestock, { id: "tmp" + Date.now(), type: kind, name, note: note || "", c, species_id: speciesId || null }] }));
    await supabase.from("livestock").insert({ tank_id: state.tankId, kind, name, note: note || null, color: c, species_id: speciesId || null });
    if (speciesId) setState((s) => ({ ...s, speciesCounts: { ...s.speciesCounts, [speciesId]: (s.speciesCounts[speciesId] || 0) + (s.livestock.some((l) => l.species_id === speciesId) ? 0 : 1) } }));
  };
  const sendMessage = async (toId, body, speciesId) => {
    await supabase.from("messages").insert({ sender_id: state.uid, recipient_id: toId, body, species_id: speciesId || null });
  };
  const addListing = async (l) => {
    const loc = state.profile.location || "Florida, United States";
    setState((s) => ({ ...s, listings: [{ ...l, id: "tmp" + Date.now(), seller: s.profile.handle, loc, g: PALETTE[0] }, ...s.listings] }));
    await supabase.from("listings").insert({ seller_id: state.uid, category: l.cat, title: l.title, price_usd: l.price, location: loc });
    award(3);
  };
  const addPost = async (body, tag = "Update") => {
    const { data, error } = await supabase.from("posts")
      .insert({ author_id: state.uid, tag, body }).select().single();
    if (error) {
      console.error("[tidepool] post failed:", error.message);
      alert("Couldn't publish that post: " + error.message);
      return;
    }
    setState((s) => ({ ...s, posts: [{
      id: data.id, user: s.profile.display_name || s.profile.handle, handle: s.profile.handle,
      tag, tagc: TAG_COLOR[tag] || "#3fe3ff", time: "now", body, img: null, likes: 0, comments: 0, mine: true,
    }, ...s.posts] }));
    award(3);
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

  const TITLES = { tank: "My Tank", log: "Tank Log", deepdive: "Tidepool DeepDive", community: "Community", profile: "My Profile",
    library: "Reefpedia", shop: "Shop", tasks: "Tasks", reefid: "Reef ID",
    notifications: "Notifications", messages: "Messages", purchases: "Purchases", seller: "Seller Hub", settings: "Settings" };
  const isTab = ["tank", "log", "deepdive", "community", "profile"].includes(view);
  const taskCount = state.tasks.filter((t) => t.due - Date.now() < dayMs).length;

  const go = (v) => { setView(v); setDrawer(false); };

  return (
    <div className="rb-root">
      <style>{STYLES}</style>

      {/* top bar */}
      <div className="rb-shell">
        <div className="rb-top">
          {isTab
            ? <div className="rb-iconbtn" onClick={() => setDrawer(true)}><Menu size={20} /></div>
            : <div className="rb-iconbtn" onClick={() => go("tank")}><ChevronLeft size={20} /></div>}
          {isTab ? <ReefLogo /> : <div className="rb-title" style={{ flex: 1, textAlign: "center" }}>{TITLES[view]}</div>}
          <div className="rb-avbtn" onClick={() => go("profile")}><CoralAvatar size={42} /><span className="rb-avdot" /></div>
        </div>

        {/* views */}
        {view === "tank" && <TankHome {...{ state, latest, issues, go, setSheet, switchTank }} />}
        {view === "log" && <LogView {...{ state, latest, sel, setSel, addLivestock, addLogEntry, switchTank }} />}
        {view === "deepdive" && <DeepDive {...{ state, latest, issues, switchTank }} />}
        {view === "community" && <Feed {...{ allPosts, liked: state.liked, toggleLike, addPost, addComment, uid: state.uid }} />}
        {view === "profile" && <Profile {...{ state, fish, corals, issues, go }} />}
        {view === "library" && <Library {...{ libCat, setLibCat, counts: state.speciesCounts, openItem: (it) => { setLibItem(it); setSheet("libDetail"); } }} />}
        {view === "shop" && <Shop {...{ allListings, cat, setCat }} />}
        {view === "tasks" && <Tasks {...{ state, latest, completeTask, addTask, updateTask, deleteTask, switchTank }} />}
        {view === "reefid" && <ReefID />}
        {view === "notifications" && <Notifications />}
        {view === "messages" && <Messages {...{ state, sendMessage }} />}
        {view === "purchases" && <Purchases />}
        {view === "seller" && <Seller {...{ state, openSell: () => setSheet("sell") }} />}
        {view === "settings" && <SettingsView {...{ state, setTankSharing }} />}
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
              ["settings", Settings, "Settings"],
            ].map(([k, Icon, lbl, extra]) => (
              <div key={k} className="rb-mitem" onClick={() => go(k)}>
                <span className="ic"><Icon size={20} /></span>{lbl}
                {extra === "dot" && <span className="reldot" />}
                {extra && extra !== "dot" && <span className="badge">{extra}</span>}
              </div>
            ))}
          </div>
        </>
      )}

      {/* sheets */}
      {sheet === "log" && <LogSheet latest={latest} onClose={() => setSheet(null)} onSave={saveLog} />}
      {sheet === "sell" && <SellSheet onClose={() => setSheet(null)} onSave={addListing} />}
      {sheet === "libDetail" && libItem && (
        <LibDetail item={libItem} uid={state.uid} count={state.speciesCounts[libItem.id] || 0}
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
function TankSwitcher({ tanks, tankId, switchTank }) {
  if (!tanks || tanks.length < 2) return null;
  return (
    <div className="rb-tabs" style={{ marginTop: 4 }}>
      {tanks.map((t) => (
        <div key={t.id} className={"rb-chip" + (t.id === tankId ? " on" : "")} onClick={() => switchTank(t.id)}>
          {t.name} <span style={{ opacity: .65, fontSize: 11 }}>· {t.volume}g</span>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Tank (home) ---------------- */
function TankHome({ state, latest, issues, go, setSheet, switchTank }) {
  const t = state.tank;
  const health = latest
    ? Math.round((PARAMS.reduce((a, p) => a + (statusOf(p, latest[p.key]) === "good" ? 1 : statusOf(p, latest[p.key]) === "warn" ? 0.6 : 0.2), 0) / PARAMS.length) * 100)
    : null;
  const nextTasks = [...state.tasks].sort((a, b) => a.due - b.due).slice(0, 2);
  const lastLog = state.log[0];
  return (
    <div className="rb-fadein">
      <TankSwitcher tanks={state.tanks} tankId={state.tankId} switchTank={switchTank} />
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
          <div style={{ fontFamily: "Bricolage Grotesque", fontWeight: 800, fontSize: 34, lineHeight: 1, background: "linear-gradient(120deg,var(--aqua),var(--teal))", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
            {health == null ? "—" : health}
          </div>
          <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: 1 }}>HEALTH</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <button className="rb-btn" style={{ flex: 1, padding: 13 }} onClick={() => setSheet("log")}><Beaker size={16} /> Log test</button>
        <button className="rb-btn ghost" style={{ flex: 1, padding: 13 }} onClick={() => go("log")}><Notebook size={16} /> Journal</button>
        <button className="rb-btn violet" style={{ flex: 1, padding: 13 }} onClick={() => go("deepdive")}><Bot size={16} /> Ask AI</button>
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
            const st = statusOf(p, latest[p.key]);
            return (
              <div key={p.key} className="rb-card" style={{ flex: "none", width: 108, padding: "11px 12px", cursor: "pointer", scrollSnapAlign: "start" }} onClick={() => go("log")}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>{p.label}</span><span className={"rb-sdot " + sclass[st]} />
                </div>
                <div style={{ fontFamily: "Bricolage Grotesque", fontWeight: 700, fontSize: 18, marginTop: 5 }}>
                  {latest[p.key]}<span style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 500, marginLeft: 2 }}>{p.unit}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {issues.length > 0 && (<>
        <div className="rb-h2"><Bell size={16} color="var(--coral)" /> Needs attention <small>{issues.length} flag{issues.length > 1 ? "s" : ""}</small></div>
        <div className="rb-card">
          {issues.map((p) => {
            const st = statusOf(p, latest[p.key]);
            return (
              <div key={p.key} className="rb-li" onClick={() => go("log")} style={{ cursor: "pointer" }}>
                <div className="rb-thumb" style={{ background: `linear-gradient(140deg,var(--${st === "bad" ? "bad" : "warn"}),#0b2b3d)` }}><Droplets size={20} color="#04111a" /></div>
                <div><div className="nm">{p.label} drifting</div><div className="sub">{latest[p.key]} {p.unit} · target {p.ideal[0]}–{p.ideal[1]}</div></div>
                <ChevronRight size={18} color="var(--muted)" style={{ marginLeft: "auto" }} />
              </div>
            );
          })}
        </div>
      </>)}

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
function LogView({ state, latest, sel, setSel, addLivestock, addLogEntry, switchTank }) {
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
      {tab === "journal" && <TankLog {...{ state, addLogEntry }} />}
      {tab === "livestock" && <Tracker {...{ state, latest, sel, setSel, addLivestock }} livestockOnly />}
    </div>
  );
}

/* ---------------- Profile ---------------- */
function Profile({ state, fish, corals, issues, go }) {
  const t = state.tank;
  return (
    <div className="rb-fadein">
      <div className="rb-cols2 wide-40-60">
      <div>
      <div className="rb-card rb-phero">
        <div className="glow" />
        <CoralAvatar size={84} />
        <div className="h">{state.profile.display_name || state.profile.handle}</div>
        <div className="ha">@{state.profile.handle}</div>
        <div className="rb-dloc" style={{ justifyContent: "center", marginTop: 8 }}><MapPin size={13} /> {state.profile.location || "Florida, United States"}</div>
        <div className="rb-badges">
          <span className="rb-badge" style={{ background: "rgba(176,108,255,.18)", color: "#d7b6ff", border: "1px solid rgba(176,108,255,.45)" }}>Reefing since {state.profile.reefing_since || state.tank.since}</span>
          <span className="rb-badge" style={{ background: "rgba(176,108,255,.18)", color: "#d7b6ff", border: "1px solid rgba(176,108,255,.45)" }}><Sparkles size={12} /> DeepDive</span>
          <span className="rb-badge" style={{ background: "rgba(255,194,77,.16)", color: "#ffd470", border: "1px solid rgba(255,194,77,.5)" }}><Award size={12} /> Founding Reefer</span>
        </div>
        <div className="rb-stats">
          <div className="rb-stat"><div className="v">{state.tanks.length}</div><div className="k">Tank{state.tanks.length !== 1 ? "s" : ""}</div></div>
          <div className="rb-stat"><div className="v">{fish}</div><div className="k">Fish</div></div>
          <div className="rb-stat"><div className="v">{corals}</div><div className="k">Corals</div></div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <button className="rb-btn ghost" style={{ flex: 1 }} onClick={() => go("seller")}><Store size={15} /> Seller Hub</button>
        <button className="rb-btn ghost" style={{ flex: 1 }} onClick={() => go("community")}><PenSquare size={15} /> Create Post</button>
      </div>
      </div>

      <div>
      <div className="rb-h2"><Waves size={16} color="var(--teal)" /> My Tank <small>{t.model}</small></div>
      <div className="rb-tankhero">
        <div className="light" /><div className="rock" />
        <div className="rb-coralbit" style={{ bottom: "38%", left: "30%", width: 16, height: 22, background: "#ff7a5c", borderRadius: "50% 50% 4px 4px" }} />
        <div className="rb-coralbit" style={{ bottom: "40%", left: "58%", width: 20, height: 14, background: "#3ce0a3" }} />
        <div className="rb-coralbit" style={{ bottom: "36%", left: "46%", width: 12, height: 18, background: "#ffc24d", borderRadius: 6 }} />
        <div className="acts">
          <div onClick={() => go("log")}><Notebook size={17} color="var(--text)" /></div>
          <div onClick={() => go("log")}><FlaskConical size={17} color="var(--text)" /></div>
          <div onClick={() => go("community")}><PenSquare size={17} color="var(--text)" /></div>
        </div>
      </div>

      <div className="rb-h2"><Bell size={16} color="var(--coral)" /> Tank health <small>{issues.length} flag{issues.length !== 1 ? "s" : ""}</small></div>
      <div className="rb-card">
        {issues.length === 0 && <div className="rb-empty">All parameters in range. 🪸</div>}
        {issues.map((p) => {
          const st = statusOf(p, state.history[state.history.length - 1][p.key]);
          return (
            <div key={p.key} className="rb-li" onClick={() => go("log")}>
              <div className="rb-thumb" style={{ background: `linear-gradient(140deg,var(--${st === "bad" ? "bad" : "warn"}),#0b2b3d)` }}><Droplets size={20} color="#04111a" /></div>
              <div><div className="nm">{p.label} drifting</div><div className="sub">{state.history[state.history.length - 1][p.key]} {p.unit} · target {p.ideal[0]}–{p.ideal[1]}</div></div>
              <ChevronRight size={18} color="var(--muted)" style={{ marginLeft: "auto" }} />
            </div>
          );
        })}
      </div>
      </div>
      </div>
    </div>
  );
}

/* ---------------- Feed ---------------- */
function Feed({ allPosts, liked, toggleLike, addPost, addComment, uid }) {
  const [draft, setDraft] = useState("");
  const [tag, setTag] = useState("Update");
  const [open, setOpen] = useState(null);
  const [tankView, setTankView] = useState(null);
  const TAGS = ["Update", "Help", "Build", "Event"];
  return (
    <>
    <div className="rb-fadein">
      <div className="rb-sec" style={{ marginTop: 6 }}><h3>My Feed</h3><p>Posts from you and reefers you follow</p></div>
      <div className="rb-card rb-compose">
        <CoralAvatar size={40} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <textarea className="rb-input" rows={2} placeholder="Share a tank update or ask the reef…"
            value={draft} onChange={(e) => setDraft(e.target.value)} />
          <div className="rb-compose-bar">
            {TAGS.map((t) => (
              <div key={t} className={"rb-chip" + (tag === t ? " on" : "")} style={{ fontSize: 12 }} onClick={() => setTag(t)}>
                {t === "Help" ? "❓ Help" : t}
              </div>
            ))}
            <button className="rb-btn" disabled={!draft.trim()}
              onClick={() => { addPost(draft.trim(), tag); setDraft(""); }}>
              <Send size={15} /> Post
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

      <div className="rb-sec"><h3>Latest Posts</h3><p>Everything from the community</p></div>
      {allPosts.length === 0 && (
        <div className="rb-card rb-empty" style={{ padding: "34px 20px" }}>
          Nothing here yet — post the first update.
        </div>
      )}

      <div className="rb-postgrid">
        {allPosts.map((post) => {
          const isLiked = liked[post.id];
          return (
            <div key={post.id} className="rb-card rb-post" style={{ cursor: "pointer" }} onClick={() => setOpen(post)}>
              <div className="rb-phead">
                <div className="rb-pa" style={{ background: `linear-gradient(140deg,${post.tagc},var(--violet))` }}>{post.user[0]}</div>
                <div><div className="u">{post.user}</div><div className="meta">@{post.handle} · {post.time}</div></div>
                <span className="rb-ptag" style={{ background: post.tagc + "22", color: post.tagc, border: `1px solid ${post.tagc}55` }}>{post.tag}</span>
              </div>
              <div className="rb-pbody">{post.body}</div>
              {post.img && <div className="rb-pimg" style={{ background: `linear-gradient(140deg,${post.img[0]},${post.img[1]})` }}><Waves size={36} /></div>}
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
        {post.img && <div className="rb-pimg" style={{ background: `linear-gradient(140deg,${post.img[0]},${post.img[1]})` }}><Waves size={36} /></div>}
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

/* ---------------- Reefpedia ---------------- */
// Free species photos from Wikipedia's public API (CORS-open, no key, freely licensed).
// Species photos are downloaded from Wikimedia Commons at BUILD time (scripts/fetch-images.mjs)
// and bundled into the site, so there's no runtime dependency on any external service.
// Each photo's author + license is carried in the manifest and credited in the detail view.
function photoOf(item) { return SPECIES_IMAGES[item.id] || null; }

function SpeciesIcon({ cat, size = 30 }) {
  if (cat === "Fish") return <Fish size={size} />;
  if (cat === "Invert") return <Shell size={size} />;
  if (cat === "Pest") return <Bell size={size} />;
  return <Waves size={size} />;
}

function SpeciesPhoto({ item, height, radius = 0 }) {
  const photo = photoOf(item);
  const [failed, setFailed] = useState(false);
  return (
    <div style={{
      height, borderRadius: radius, position: "relative", overflow: "hidden",
      background: `linear-gradient(140deg,${item.g[0]},${item.g[1]})`,
      display: "grid", placeItems: "center", color: "rgba(4,17,26,.5)",
    }}>
      {photo && !failed && (
        <img src={photo.src} alt={item.name} loading="lazy" onError={() => setFailed(true)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      )}
      {(!photo || failed) && <SpeciesIcon cat={item.cat} size={height > 140 ? 40 : 30} />}
    </div>
  );
}

const CAT_COLOR = { Fish: "#ff7a5c", SPS: "#2ee6c8", LPS: "#3fe3ff", Soft: "#b06cff", Invert: "#ffc24d", Pest: "#ff5d72" };

function Library({ libCat, setLibCat, openItem, counts }) {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const shown = REEFPEDIA.filter((l) =>
    (libCat === "All" || l.cat === libCat) &&
    (!query || l.name.toLowerCase().includes(query) || l.sci.toLowerCase().includes(query) || l.blurb.toLowerCase().includes(query)));
  return (
    <div className="rb-fadein">
      <div className="rb-card" style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", marginTop: 4 }}>
        <Search size={17} color="var(--muted)" />
        <input className="rb-input" style={{ border: "none", padding: 0, background: "transparent" }}
          placeholder="Search 76 species, corals & pests…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="rb-tabs" style={{ marginTop: 14 }}>
        {REEFPEDIA_CATS.map((c) => (
          <div key={c} className={"rb-chip" + (libCat === c ? " on" : "")} onClick={() => setLibCat(c)}>
            {c === "Pest" ? "Pests & Disease" : c === "Soft" ? "Soft Coral" : c}
          </div>
        ))}
      </div>
      {shown.length === 0 && <div className="rb-card rb-empty">Nothing matches “{q}”. Try a common name, a genus, or a symptom.</div>}
      <div className="rb-mgrid">
        {shown.map((l) => (
          <div key={l.id} className="rb-card rb-mcard" onClick={() => openItem(l)}>
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
        ))}
      </div>
    </div>
  );
}

function PhotoCredit({ item }) {
  const p = photoOf(item);
  if (!p) return null;
  return (
    <div style={{ textAlign: "center", color: "var(--muted-2)", fontSize: 10.5, marginTop: 12, lineHeight: 1.5 }}>
      Photo: {p.artist} · {p.license} · via{" "}
      <a href={p.source} target="_blank" rel="noreferrer" style={{ color: "var(--muted)" }}>Wikimedia Commons</a>
    </div>
  );
}

function LibDetail({ item, onClose, uid, count, onOpenTank, onMessage }) {
  const [keepers, setKeepers] = useState(null);
  useEffect(() => {
    let alive = true;
    if (item.cat === "Pest") { setKeepers([]); return; }
    fetchKeepers(item.id).then((k) => { if (alive) setKeepers(k); });
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
        "You are Tidepool Reef DeepDive, an expert reef-aquarium advisor. Be concise, specific, and practical.");
      setTips(r || "Couldn't load tips right now.");
    } catch (e) { setTips("DeepDive error: " + (e.message || "connection failed")); }
    setBusy(false);
  };
  return (
    <div className="rb-overlay" onClick={onClose}>
      <div className="rb-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="rb-sheet-h">
          <b>{item.name}</b>
          <div className="rb-iconbtn" onClick={onClose}><X size={18} /></div>
        </div>
        <SpeciesPhoto item={item} height={190} radius={14} />
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
        <button className="rb-btn violet" style={{ width: "100%", padding: 13 }} onClick={getTips} disabled={busy}>
          <Bot size={16} /> {busy ? "Asking DeepDive…" : isPest ? "Get an eradication plan" : "Care tips from DeepDive"}
        </button>
        <PhotoCredit item={item} />
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
      <div className="rb-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="rb-sheet-h">
          <b>{t ? t.name : "Loading…"}</b>
          <div className="rb-iconbtn" onClick={onClose}><X size={18} /></div>
        </div>
        {!data && <div className="rb-empty">Loading tank…</div>}
        {t && (
          <>
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
  const [body, setBody] = useState("");
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
function Shop({ allListings, cat, setCat }) {
  const cats = ["All", "Coral", "Fish", "Equipment"];
  const shown = cat === "All" ? allListings : allListings.filter((l) => l.cat === cat);
  return (
    <div className="rb-fadein">
      <div className="rb-tabs" style={{ marginTop: 6 }}>
        {cats.map((c) => <div key={c} className={"rb-chip" + (cat === c ? " on" : "")} onClick={() => setCat(c)}>{c}</div>)}
      </div>
      <div className="rb-mgrid">
        {shown.map((l) => (
          <div key={l.id} className="rb-card rb-mcard">
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
    setBusy(true); setErr("");
    const params = latest
      ? PARAMS.map((p) => `${p.label} ${latest[p.key]}${p.unit} (${statusOf(p, latest[p.key])})`).join(", ")
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
        "You are Tidepool Reef DeepDive, an expert reef-aquarium advisor. Reply with valid JSON only — no markdown fences, no commentary.");
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
function Tracker({ state, latest, sel, setSel, addLivestock, hideLivestock, livestockOnly }) {
  const [lsName, setLsName] = useState("");
  const [lsKind, setLsKind] = useState("Coral");
  const [pick, setPick] = useState(null);
  const KIND_CATS = { Coral: ["SPS", "LPS", "Soft"], Fish: ["Fish"], Invert: ["Invert"] };
  const q = lsName.trim().toLowerCase();
  const matches = q.length < 2 ? [] : REEFPEDIA
    .filter((r) => KIND_CATS[lsKind].includes(r.cat) &&
      (r.name.toLowerCase().includes(q) || r.sci.toLowerCase().includes(q)))
    .slice(0, 5);
  const p = PARAMS.find((x) => x.key === sel);
  const chartData = state.history.map((h) => ({ date: h.date, v: h[sel] }));
  const prev = state.history.length > 1 ? state.history[state.history.length - 2][sel] : latest ? latest[sel] : 0;
  const delta = latest ? +(latest[sel] - prev).toFixed(p.dec) : 0;
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
          <span style={{ fontSize: 11, color: "var(--muted)" }}>{delta === 0 ? "no change" : (delta > 0 ? "▲ " : "▼ ") + Math.abs(delta) + " " + p.unit}</span>
        </div>
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
      </div>
      </div>)}
      </>)}
      {!hideLivestock && (<>
      <div className="rb-h2"><Fish size={16} color="var(--teal)" /> Livestock <small>{state.livestock.length} in tank</small></div>
      <div className="rb-card" style={{ padding: 14, marginBottom: 10 }}>
        <div className="rb-tabs" style={{ margin: "0 0 10px" }}>
          {["Coral", "Fish", "Invert"].map((k) => <div key={k} className={"rb-chip" + (lsKind === k ? " on" : "")} onClick={() => { setLsKind(k); setPick(null); }}>{k}</div>)}
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          <input className="rb-input" placeholder={lsKind === "Fish" ? "e.g. Royal Gramma" : lsKind === "Invert" ? "e.g. Cleaner Shrimp" : "e.g. Gold Hammer"} value={lsName}
            onChange={(e) => { setLsName(e.target.value); setPick(null); }} />
          <button className="rb-btn" disabled={!lsName.trim()} onClick={() => { addLivestock(lsKind, lsName.trim(), null, pick && pick.id); setLsName(""); setPick(null); }}><Plus size={16} /></button>
        </div>
        {pick ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, fontSize: 12.5, color: "var(--muted)" }}>
            <Check size={14} color="var(--good)" /> Linked to <b style={{ color: "var(--text)" }}>{pick.name}</b> in Reefpedia
            <span style={{ marginLeft: "auto", cursor: "pointer", color: "var(--muted-2)" }} onClick={() => setPick(null)}>clear</span>
          </div>
        ) : matches.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 11.5, color: "var(--muted)", marginBottom: 6 }}>Link to a species so other reefers can find you:</div>
            <div className="rb-tabs" style={{ margin: 0, flexWrap: "wrap" }}>
              {matches.map((m) => (
                <div key={m.id} className="rb-chip" style={{ fontSize: 12 }} onClick={() => { setPick(m); if (!lsName.trim()) setLsName(m.name); }}>
                  {m.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="rb-card">
        {state.livestock.length === 0 && <div className="rb-empty">Nothing in the tank yet — add your first coral, fish, or invert above.</div>}
        {state.livestock.map((l) => (
          <div key={l.id} className="rb-li">
            <div className="rb-thumb" style={{ background: `linear-gradient(140deg,${l.c},#0b2b3d)` }}>
              {l.type === "Fish" ? <Fish size={20} color="#04111a" /> : l.type === "Coral" ? <Waves size={20} color="#04111a" /> : <Shell size={20} color="#04111a" />}
            </div>
            <div><div className="nm">{l.name}</div><div className="sub">{l.type}{l.note ? " · " + l.note : ""}</div></div>
          </div>
        ))}
      </div>
      </>)}
    </div>
  );
}

/* ---------------- Tank Log ---------------- */
function TankLog({ state, addLogEntry }) {
  const [type, setType] = useState("Water Change");
  const [note, setNote] = useState("");
  const types = ["Water Change", "Dosing", "Addition", "Observation"];
  const typeColor = { "Water Change": "#3fe3ff", Dosing: "#3ce0a3", Addition: "#ffc24d", Observation: "#b06cff" };
  return (
    <div className="rb-fadein">
      <div className="rb-card" style={{ padding: 16, marginTop: 6 }}>
        <div className="rb-tabs" style={{ margin: "0 0 12px" }}>
          {types.map((c) => <div key={c} className={"rb-chip" + (type === c ? " on" : "")} onClick={() => setType(c)}>{c}</div>)}
        </div>
        <textarea className="rb-input" rows={2} placeholder="What happened in the tank?" value={note} onChange={(e) => setNote(e.target.value)} />
        <button className="rb-btn" style={{ width: "100%", marginTop: 10, padding: 12 }} disabled={!note.trim()}
          onClick={() => { addLogEntry(type, note.trim()); setNote(""); }}><Plus size={16} /> Add log entry</button>
      </div>
      <div className="rb-h2"><Notebook size={16} color="var(--aqua)" /> Journal <small>{state.log.length} entries</small></div>
      <div className="rb-card">
        {state.log.length === 0 && <div className="rb-empty">No journal entries yet — log your first water change or observation above.</div>}
        {state.log.map((e) => (
          <div key={e.id} className="rb-li" style={{ alignItems: "flex-start" }}>
            <div className="rb-thumb" style={{ background: `linear-gradient(140deg,${typeColor[e.type] || "#3fe3ff"},#0b2b3d)` }}><Droplets size={18} color="#04111a" /></div>
            <div><div className="nm">{e.type} <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: 12 }}>· {fmtDate(e.date)}</span></div><div className="sub" style={{ lineHeight: 1.45 }}>{e.note}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Reef ID (Claude vision) ---------------- */
function ReefID() {
  const [img, setImg] = useState(null);     // {b64, media, url}
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const onFile = (e) => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    // Downscale to ≤1600px JPEG so big camera photos fit the function payload limit
    const url = URL.createObjectURL(f);
    const im = new Image();
    im.onload = () => {
      const scale = Math.min(1, 1600 / Math.max(im.width, im.height));
      const cv = document.createElement("canvas");
      cv.width = Math.round(im.width * scale); cv.height = Math.round(im.height * scale);
      cv.getContext("2d").drawImage(im, 0, 0, cv.width, cv.height);
      const dataUrl = cv.toDataURL("image/jpeg", 0.85);
      setImg({ b64: dataUrl.split(",")[1], media: "image/jpeg", url: dataUrl });
      setResult(""); URL.revokeObjectURL(url);
    };
    im.onerror = () => { // fall back to raw file if decode fails
      const reader = new FileReader();
      reader.onload = () => { const s = reader.result; setImg({ b64: s.split(",")[1], media: f.type || "image/jpeg", url: s }); setResult(""); };
      reader.readAsDataURL(f);
    };
    im.src = url;
  };
  const identify = async () => {
    if (!img) return; setBusy(true); setResult("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          max_tokens: 1000,
          system: "You are Reef ID, an expert at identifying saltwater aquarium corals, fish, and invertebrates from photos. Identify the most likely species. Reply with: Common name, Scientific name (best guess), Type, Care difficulty, and 2 quick care tips. If you can't tell, say so and list possibilities. Keep it concise.",
          messages: [{ role: "user", content: [
            { type: "image", source: { type: "base64", media_type: img.media, data: img.b64 } },
            { type: "text", text: "Identify this reef tank inhabitant and give quick care basics." },
          ] }],
        }),
      });
      const data = await res.json();
      if (data && data.error) throw new Error(data.error.message || "AI request failed");
      const txt = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
      setResult(txt || "Couldn't identify that one — try a clearer, closer shot.");
    } catch (e) { setResult("Reef ID error: " + (e.message || "connection failed") + ". Try again, or use a smaller/clearer photo."); }
    setBusy(false);
  };
  return (
    <div className="rb-fadein">
      <div className="rb-card" style={{ padding: 16, marginTop: 6 }}>
        <div style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.5, marginBottom: 14 }}>
          Snap or upload a photo of any coral, fish, or invert and DeepDive will identify it and give you care basics.
        </div>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={onFile} />
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
      {result && <div className="rb-card" style={{ padding: 16, marginTop: 14, fontSize: 14, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{result}</div>}
    </div>
  );
}

/* ---------------- DeepDive AI ---------------- */
function DeepDive({ state, latest, issues, switchTank }) {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scroller = useRef(null);
  useEffect(() => { if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight; }, [msgs, busy]);

  const snapshot = () => latest
    ? PARAMS.map((p) => `${p.label}: ${latest[p.key]}${p.unit} (target ${p.ideal[0]}-${p.ideal[1]}, ${statusOf(p, latest[p.key])})`).join("; ")
    : "No test results logged yet.";
  const t = state.tank;
  const SYS = "You are Tidepool Reef DeepDive, a concise expert saltwater reef-aquarium advisor inside the Tidepool Reef app. " +
    `The user is currently asking about their tank "${t.name}" (${t.model}, ${t.volume} gallons, running since ${t.since}). ` +
    `Latest test results for ${t.name} — ${snapshot()} ` +
    `Livestock in ${t.name}: ${state.livestock.map((l) => l.name).join(", ") || "none logged"}. ` +
    "Answer questions about THIS tank using this context unless the user clearly asks about something else. " +
    "Give practical, friendly, specific guidance. Keep answers short. Focus on what's drifting and 2-3 concrete actions. Never recommend dangerous dosing.";

  async function send(text, display) {
    const history = [...msgs, { role: "user", content: display || text }];
    setMsgs(history); setInput(""); setBusy(true);
    try {
      const apiMsgs = [...msgs.map((m) => ({ role: m.role, content: m.content })), { role: "user", content: text }];
      const reply = await askReefAI(apiMsgs, SYS);
      setMsgs((m) => [...m, { role: "assistant", content: reply || "Hmm, I couldn't generate a response just now." }]);
    } catch (e) { setMsgs((m) => [...m, { role: "assistant", content: "DeepDive error: " + (e.message || "connection failed") + " — try again in a moment." }]); }
    setBusy(false);
  }
  const diagnose = () => {
    const t = state.tank; const live = state.livestock.map((l) => l.name).join(", ");
    send(`Diagnose my reef tank. Tank: ${t.model}, ${t.volume} gallons, set up ${t.since}. Current parameters — ${snapshot()}. Livestock: ${live}. Give a quick health read, flag what's drifting, and 2-3 concrete next actions.`,
      "🔍 Diagnose my tank using current parameters");
  };
  return (
    <div className="rb-fadein">
      <TankSwitcher tanks={state.tanks} tankId={state.tankId} switchTank={async (id) => { await switchTank(id); setMsgs([]); }} />
      {state.tanks.length > 1 && (
        <div style={{ fontSize: 12.5, color: "var(--muted)", margin: "0 2px 12px", display: "flex", alignItems: "center", gap: 6 }}>
          <Bot size={14} color="var(--aqua)" /> DeepDive is looking at <b style={{ color: "var(--text)" }}>{t.name}</b> — switch tanks above to ask about another.
        </div>
      )}
      <div className="rb-ai-msgs" ref={scroller}>
        {msgs.length === 0 && (
          <div className="rb-empty"><Bot size={28} color="var(--aqua)" style={{ opacity: .85 }} />
            <div style={{ marginTop: 10 }}>Ask anything about your reef, or run a full diagnosis from your latest test results.</div></div>
        )}
        {msgs.map((m, i) => <div key={i} className={"rb-ai-msg " + (m.role === "user" ? "u" : "a")}>{m.content}</div>)}
        {busy && <div className="rb-ai-msg a"><div className="rb-typing"><i /><i /><i /></div></div>}
      </div>
      {msgs.length === 0 && (
        <button className="rb-btn violet" style={{ width: "100%", marginBottom: 12, padding: 13 }} onClick={diagnose} disabled={busy}>
          <TrendingUp size={16} /> Diagnose {t.name}{issues.length ? ` · ${issues.length} flag${issues.length > 1 ? "s" : ""}` : ""}
        </button>
      )}
      <div className="rb-ai-row">
        <input className="rb-input" placeholder="e.g. Why is my hammer receding?" value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && input.trim() && !busy) send(input.trim()); }} />
        <button className="rb-btn" disabled={!input.trim() || busy} onClick={() => send(input.trim())}><Send size={16} /></button>
      </div>
    </div>
  );
}

/* ---------------- secondary screens ---------------- */
function Notifications() {
  return (
    <div className="rb-fadein">
      <div className="rb-card" style={{ marginTop: 6 }}>
        {NOTIFS.map((n) => (
          <div key={n.id} className="rb-li">
            <div className="rb-pa" style={{ background: `linear-gradient(140deg,${n.c},var(--violet))` }}>{n.who[0].toUpperCase()}</div>
            <div><div className="nm"><b>@{n.who}</b> <span style={{ fontWeight: 400 }}>{n.txt}</span></div><div className="sub">{n.time} ago</div></div>
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
  const orders = [
    { t: "Gold Torch — 2 heads", s: "torch_lord", price: 120, status: "Shipped", c: "#ffc24d" },
    { t: "AI Prime 16HD (used)", s: "reef_recycle", price: 180, status: "Delivered", c: "#3fe3ff" },
  ];
  return (
    <div className="rb-fadein"><div className="rb-card" style={{ marginTop: 6 }}>
      {orders.map((o, i) => (
        <div key={i} className="rb-li">
          <div className="rb-thumb" style={{ background: `linear-gradient(140deg,${o.c},#0b2b3d)` }}><Receipt size={20} color="#04111a" /></div>
          <div><div className="nm">{o.t}</div><div className="sub">@{o.s} · {o.status}</div></div>
          <div style={{ marginLeft: "auto", fontFamily: "Bricolage Grotesque", fontWeight: 800, color: "var(--aqua)" }}>${o.price}</div>
        </div>
      ))}
    </div></div>
  );
}
function Seller({ state, openSell }) {
  const mine = state.listings.filter((l) => l.seller === state.profile.handle);
  return (
    <div className="rb-fadein">
      <div className="rb-card rb-phero" style={{ padding: 20, marginTop: 6 }}>
        <div className="glow" />
        <div style={{ position: "relative" }}>
          <div style={{ fontFamily: "Bricolage Grotesque", fontWeight: 800, fontSize: 20 }}>Seller Hub</div>
          <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>Sell frags & gear to the local reef community.</div>
          <div className="rb-stats">
            <div className="rb-stat"><div className="v">{mine.length}</div><div className="k">Active</div></div>
            <div className="rb-stat"><div className="v">0</div><div className="k">Sold</div></div>
            <div className="rb-stat"><div className="v">5.0</div><div className="k">Rating</div></div>
          </div>
        </div>
      </div>
      <button className="rb-btn" style={{ width: "100%", marginTop: 12, padding: 13 }} onClick={openSell}><Tag size={16} /> List an item</button>
      <div className="rb-h2"><Store size={16} color="var(--aqua)" /> Your listings</div>
      <div className="rb-card">
        {mine.length === 0 && <div className="rb-empty">No active listings yet. Tap “List an item” to post your first frag.</div>}
        {mine.map((l) => (
          <div key={l.id} className="rb-li">
            <div className="rb-thumb" style={{ background: `linear-gradient(140deg,${l.g[0]},${l.g[1]})` }}><Tag size={18} color="#04111a" /></div>
            <div><div className="nm">{l.title}</div><div className="sub">{l.cat}</div></div>
            <div style={{ marginLeft: "auto", fontFamily: "Bricolage Grotesque", fontWeight: 800, color: "var(--aqua)" }}>${l.price}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
function SettingsView({ state, setTankSharing }) {
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
      <div className="rb-h2" style={{ marginTop: 6 }}><Users size={16} color="var(--aqua)" /> Community sharing</div>
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
      <div style={{ textAlign: "center", color: "var(--muted-2)", fontSize: 12, marginTop: 18 }}>Tidepool Reef</div>
    </div>
  );
}

/* ---------------- sheets ---------------- */
function LogSheet({ latest, onClose, onSave }) {
  const [vals, setVals] = useState(() => {
    const o = {}; PARAMS.forEach((p) => (o[p.key] = String(latest ? latest[p.key] : +((p.ideal[0] + p.ideal[1]) / 2).toFixed(p.dec)))); return o;
  });
  return (
    <div className="rb-overlay" onClick={onClose}>
      <div className="rb-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="rb-sheet-h"><b>Log test results</b><div className="rb-iconbtn" onClick={onClose}><X size={18} /></div></div>
        {PARAMS.map((p) => (
          <div key={p.key} className="rb-num">
            <label>{p.label} <span style={{ color: "var(--muted)" }}>{p.unit}</span></label>
            <input type="number" inputMode="decimal" value={vals[p.key]} onChange={(e) => setVals((v) => ({ ...v, [p.key]: e.target.value }))} />
          </div>
        ))}
        <button className="rb-btn" style={{ width: "100%", marginTop: 8, padding: 14 }}
          onClick={() => { const out = {}; PARAMS.forEach((p) => { const v = parseFloat(vals[p.key]); out[p.key] = Number.isFinite(v) ? v : (latest ? latest[p.key] : (p.ideal[0] + p.ideal[1]) / 2); }); onSave(out); onClose(); }}>
          <Check size={17} /> Save reading <span style={{ opacity: .7 }}>· +5 Pearls</span>
        </button>
      </div>
    </div>
  );
}
function SellSheet({ onClose, onSave }) {
  const [title, setTitle] = useState(""); const [price, setPrice] = useState(""); const [cat, setCat] = useState("Coral");
  return (
    <div className="rb-overlay" onClick={onClose}>
      <div className="rb-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="rb-sheet-h"><b>List an item</b><div className="rb-iconbtn" onClick={onClose}><X size={18} /></div></div>
        <div className="rb-field"><label>Category</label>
          <div className="rb-tabs" style={{ margin: 0 }}>{["Coral", "Fish", "Equipment"].map((c) => <div key={c} className={"rb-chip" + (cat === c ? " on" : "")} onClick={() => setCat(c)}>{c}</div>)}</div>
        </div>
        <div className="rb-field"><label>Title</label><input className="rb-input" placeholder="e.g. WYSIWYG Acan frag" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div className="rb-field"><label>Price ($)</label><input className="rb-input" type="number" inputMode="decimal" placeholder="45" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
        <button className="rb-btn" style={{ width: "100%", padding: 14 }} disabled={!title.trim() || !price}
          onClick={() => { onSave({ cat, title: title.trim(), price: parseFloat(price) || 0 }); onClose(); }}>
          <Tag size={16} /> Post listing <span style={{ opacity: .7 }}>· +3 Pearls</span>
        </button>
      </div>
    </div>
  );
}
