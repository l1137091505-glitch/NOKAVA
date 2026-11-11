interface Eip1193Provider {
  request(args:{method:string;params?:unknown[]|Record<string,unknown>}):Promise<unknown>;
  on?(event:string,handler:(value:any)=>void):void;
  removeListener?(event:string,handler:(value:any)=>void):void;
  providers?:Eip1193Provider[];
  isMetaMask?:boolean;
}
interface Window { ethereum?:Eip1193Provider }
