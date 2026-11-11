import { BrowserProvider, Contract, JsonRpcProvider, isAddress } from "ethers";
import "./style.css";

type WalletChoice={info:{uuid:string;name:string;icon?:string;rdns?:string};provider:Eip1193Provider};
type Signal={from:string;to:string;sentAt:number};
const CHAIN={id:677,hex:"0x2a5",name:"BOT Chain Mainnet",rpc:"https://rpc.botchain.ai",explorer:"https://scan.botchain.ai"};
const ADDRESS=(import.meta.env.VITE_NOKAVA_ADDRESS||"").trim();
const configured=/^0x[a-fA-F0-9]{40}$/.test(ADDRESS);
const ABI=["function sendSignal(address) returns(uint256)","function totalSignals() view returns(uint256)","function sentCount(address) view returns(uint256)","function receivedCount(address) view returns(uint256)","function recentSignals(uint256) view returns(tuple(address from,address to,uint64 sentAt)[])"];
const rpc=new JsonRpcProvider(CHAIN.rpc,CHAIN.id,{staticNetwork:true});
const walletMap=new Map<string,WalletChoice>();
let injected:Eip1193Provider|null=null,account="",busy=false,walletOpen=false;
let total=12,sent=0,received=0;
let notice=configured?"Live contract configured. Connect only when you are ready to send.":"Preview mode — deploy NokavaSignal and configure VITE_NOKAVA_ADDRESS to enable writes.";
let signals:Signal[]=[
 {from:"0x71E6B6C9049057A64c2272Fa85C37C5069a48312",to:"0x3f6D154AA32Bf0B0ac4B9E7c9870D5B63A5b37E2",sentAt:Math.floor(Date.now()/1000)-320},
 {from:"0x95D1A17D29e42C9B521F7a4eB14d638E2bBA1047",to:"0x71E6B6C9049057A64c2272Fa85C37C5069a48312",sentAt:Math.floor(Date.now()/1000)-1280},
 {from:"0xAA63E2CCB75E1f16C8B1E8bF3615D6Bf3D50A991",to:"0x13452D4Aad8B7E5a1076F10f70eB9C8AD78e3120",sentAt:Math.floor(Date.now()/1000)-4100}
];
const app=document.querySelector<HTMLDivElement>("#app")!;

window.addEventListener("eip6963:announceProvider",((e:CustomEvent<WalletChoice>)=>{if(e.detail?.provider&&e.detail?.info?.uuid)walletMap.set(e.detail.info.uuid,e.detail)}) as EventListener);
window.dispatchEvent(new Event("eip6963:requestProvider"));
const esc=(v:unknown)=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));
const short=(v:string)=>v?`${v.slice(0,6)}…${v.slice(-4)}`:"Connect wallet";
const time=(n:number)=>new Intl.DateTimeFormat("en",{month:"short",day:"2-digit",hour:"2-digit",minute:"2-digit"}).format(new Date(n*1000));

function signalRows(){return signals.map((s,i)=>`<article class="receipt"><span>${String(i+1).padStart(2,"0")}</span><div><small>FROM</small><a href="${CHAIN.explorer}/address/${s.from}" target="_blank">${short(s.from)}</a></div><i aria-hidden="true"></i><div><small>TO</small><a href="${CHAIN.explorer}/address/${s.to}" target="_blank">${short(s.to)}</a></div><time>${time(s.sentAt)}</time></article>`).join("")}
function render(){
 app.innerHTML=`<!-- dealt: collage / navigation-ledger / footer-columns / close-statement / buttons-solid / mark-signal -->
 <a class="skip" href="#communicator">Skip to communicator</a>
 <header class="top"><a class="mark" href="#top"><b>N</b><span>NOKAVA<small>PUBLIC SIGNAL PROTOCOL</small></span></a><nav><a href="#ledger">Ledger</a><a href="#protocol">Protocol</a><a href="${CHAIN.explorer}" target="_blank">Explorer ↗</a></nav><div class="chain"><i></i> BOT / 677</div><button class="wallet" id="wallet">${short(account)}</button></header>
 <main id="top"><section class="hero"><div class="hero-copy"><p class="eyebrow">ONE ACTION · PUBLICLY RECEIPTED</p><h1>Send a clear signal.</h1><p class="lead">A wallet-to-wallet acknowledgement for BOT Chain. No message to moderate, no token to mint—just a durable public receipt.</p><div class="hero-actions"><button class="primary" data-jump="communicator">Send a signal ↗</button><a href="#ledger">Read the public tape</a></div><p class="proof">CONTRACT ${configured?short(ADDRESS):"AWAITING DEPLOYMENT"}</p></div>
 <div class="console-frame" data-enter><div class="console-top"><span>COMMUNICATION DESK / LIVE</span><b>${busy?"TRANSMITTING":"READY"}</b></div><div class="signal-map"><div class="node node-a"><i></i><span>SENDER</span><b>${account?short(account):"YOUR WALLET"}</b></div><svg viewBox="0 0 600 180" aria-hidden="true"><path d="M90 91 C220 8 370 175 510 89"/><circle cx="300" cy="90" r="7"/></svg><div class="node node-b"><i></i><span>RECIPIENT</span><b>0x ADDRESS</b></div></div><form id="signal-form"><label for="recipient">Recipient address</label><div><input id="recipient" name="recipient" placeholder="0x…" autocomplete="off" spellcheck="false"><button class="primary" ${busy?"disabled":""}>${busy?"Confirming…":account?"Send a signal ↗":"Connect wallet ↗"}</button></div></form><div class="console-note"><span>${configured?"LIVE CONTRACT":"PREVIEW MODE"}</span><p>${esc(notice)}</p></div><aside class="counter-card"><span>NETWORK TOTAL</span><strong>${String(total).padStart(2,"0")}</strong><small>public signals</small></aside></div></section>
 <section class="numbers" aria-label="Signal counts"><div><span>01</span><strong>${total}</strong><p>Total signals</p></div><div><span>02</span><strong>${account?sent:"—"}</strong><p>You sent</p></div><div><span>03</span><strong>${account?received:"—"}</strong><p>You received</p></div><div><span>04</span><strong>677</strong><p>BOT Chain</p></div></section>
 <section class="ledger" id="ledger"><header><div><p class="eyebrow">PUBLIC SIGNAL TAPE</p><h2>Every acknowledgement<br>leaves a receipt.</h2></div><p>Addresses and time are public. The protocol stores no message, profile or private metadata.</p></header><div class="receipts"><div class="receipt-head"><span>#</span><span>ROUTE</span><span>TIME / LOCAL</span></div>${signalRows()}</div></section>
 <section class="protocol" id="protocol"><div class="iris-panel"><div><p class="eyebrow">THE PROTOCOL</p><h2>Less data.<br>More certainty.</h2><p>NOKAVA records only sender, recipient and block time. One compact event is enough to prove that one wallet acknowledged another.</p><a href="${configured?`${CHAIN.explorer}/address/${ADDRESS}`:CHAIN.explorer}" target="_blank">Inspect on BOTScan ↗</a></div><ol><li><b>01</b><span>Choose an EVM address</span></li><li><b>02</b><span>Confirm one wallet transaction</span></li><li><b>03</b><span>Read the permanent receipt</span></li></ol></div></section>
 <section class="close"><p class="eyebrow">READY WHEN YOU ARE</p><h2>Make the signal visible.</h2><button class="primary" data-jump="communicator">Open communicator ↗</button></section></main>
 <footer><div><a class="mark" href="#top"><b>N</b><span>NOKAVA</span></a><p>A minimal public acknowledgement protocol for BOT Chain.</p></div><div><h3>Protocol</h3><a href="#ledger">Signal tape</a><a href="#protocol">How it works</a></div><div><h3>Network</h3><a href="https://www.botchain.ai/en/" target="_blank">BOT Chain ↗</a><a href="${CHAIN.explorer}" target="_blank">Explorer ↗</a></div><small>Experimental software. Verify addresses before signing. Chain ID 677.</small></footer>
 ${walletOpen?walletModal():""}`;
 bind();
}
function walletModal(){const choices=[...walletMap.values()];const hasLegacy=!!window.ethereum&&!choices.length;return `<div class="modal-back"><section class="modal" role="dialog" aria-modal="true"><button class="x" id="close-wallet">×</button><p class="eyebrow">WALLET ACCESS</p><h2>Choose your wallet.</h2><p>Connecting requests account access only. Sending a signal is a separate confirmation.</p><div class="wallets">${choices.map((w,i)=>`<button data-wallet="${i}">${w.info.icon?`<img src="${w.info.icon}" alt="">`:`<b>${w.info.name[0]}</b>`}<span>${esc(w.info.name)}<small>${esc(w.info.rdns||"Browser extension")}</small></span><i>Connect ↗</i></button>`).join("")}${hasLegacy?`<button data-legacy><b>W</b><span>Browser wallet<small>Injected provider</small></span><i>Connect ↗</i></button>`:""}</div>${!choices.length&&!hasLegacy?`<a class="install" href="https://metamask.io/download/" target="_blank">Install MetaMask ↗</a>`:""}</section></div>`}
function bind(){
 document.querySelector("#wallet")?.addEventListener("click",openWallet);
 document.querySelector("#close-wallet")?.addEventListener("click",()=>{walletOpen=false;render()});
 document.querySelector(".modal-back")?.addEventListener("click",e=>{if(e.target===(e.currentTarget as HTMLElement)){walletOpen=false;render()}});
 document.querySelectorAll<HTMLElement>("[data-wallet]").forEach(x=>x.onclick=()=>connect([...walletMap.values()][Number(x.dataset.wallet)].provider));
 document.querySelector<HTMLElement>("[data-legacy]")?.addEventListener("click",()=>window.ethereum&&connect(window.ethereum.providers?.[0]||window.ethereum));
 document.querySelectorAll<HTMLElement>("[data-jump]").forEach(x=>x.onclick=()=>document.getElementById("recipient")?.focus());
 const form=document.querySelector<HTMLFormElement>("#signal-form");if(form)form.onsubmit=e=>{e.preventDefault();const to=String(new FormData(form).get("recipient")||"").trim();if(!account){openWallet();return}send(to)};
 const panel=document.querySelector(".iris-panel");if(panel){const io=new IntersectionObserver(([x])=>{if(x.isIntersecting)panel.classList.add("revealed")},{threshold:.28});io.observe(panel)}
}
function openWallet(){window.dispatchEvent(new Event("eip6963:requestProvider"));setTimeout(()=>{if(!walletMap.size&&!window.ethereum&&/Android|iPhone|iPad/i.test(navigator.userAgent)){location.href=`https://metamask.app.link/dapp/${location.host}${location.pathname}`;return}walletOpen=true;render()},180)}
async function connect(provider:Eip1193Provider){walletOpen=false;busy=true;notice="Waiting for wallet authorization…";render();try{injected=provider;const xs=await provider.request({method:"eth_requestAccounts"}) as string[];if(!xs[0])throw new Error("No wallet account was authorized.");account=xs[0];await ensureChain();provider.on?.("accountsChanged",(a:string[])=>{account=a?.[0]||"";load()});provider.on?.("chainChanged",(id:string)=>{notice=id.toLowerCase()===CHAIN.hex?"BOT Chain connected.":"Network changed. Switch back to BOT Chain before sending.";render()});notice=`Connected ${short(account)}. No transaction was sent.`;await load()}catch(e){notice=message(e)}finally{busy=false;render()}}
async function ensureChain(){if(!injected)throw new Error("Connect a wallet first.");try{await injected.request({method:"wallet_switchEthereumChain",params:[{chainId:CHAIN.hex}]})}catch(e:any){if(e?.code!==4902&&e?.data?.originalError?.code!==4902)throw e;await injected.request({method:"wallet_addEthereumChain",params:[{chainId:CHAIN.hex,chainName:CHAIN.name,nativeCurrency:{name:"BOT",symbol:"BOT",decimals:18},rpcUrls:[CHAIN.rpc],blockExplorerUrls:[CHAIN.explorer]}]})}}
async function verifyContract(){if(!configured)throw new Error("Preview mode: deploy NokavaSignal and set VITE_NOKAVA_ADDRESS first.");const code=await rpc.getCode(ADDRESS);if(code==="0x")throw new Error("No contract bytecode was found at the configured address on BOT Chain.")}
async function load(){if(!configured)return;try{await verifyContract();const c=new Contract(ADDRESS,ABI,rpc);const [t,recent,s,r]=await Promise.all([c.totalSignals(),c.recentSignals(8),account?c.sentCount(account):0n,account?c.receivedCount(account):0n]);total=Number(t);sent=Number(s);received=Number(r);signals=(recent as any[]).map(x=>({from:x.from,to:x.to,sentAt:Number(x.sentAt)}));}catch(e){notice=message(e)}render()}
async function send(to:string){if(!isAddress(to)){notice="Enter a complete EVM recipient address.";render();return}if(to.toLowerCase()===account.toLowerCase()){notice="Choose another wallet; self-signals are not accepted.";render();return}busy=true;notice="Preparing BOT Chain transaction…";render();try{await verifyContract();await ensureChain();const bp=new BrowserProvider(injected!);const c=new Contract(ADDRESS,ABI,await bp.getSigner());const tx=await c.sendSignal(to);notice=`Transaction ${short(tx.hash)} submitted. Waiting for confirmation…`;render();await tx.wait();notice="Signal confirmed on BOT Chain.";await load();}catch(e){notice=message(e)}finally{busy=false;render()}}
function message(e:any){return e?.shortMessage||e?.reason||e?.message||"The request did not complete."}
render();load();
