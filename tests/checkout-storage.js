import {OrderRealtime} from '../worker.js';
// Simulate separate Worker/DO activations sharing transactional durable storage.
export function checkoutBinding() {
  const stores = new Map();
  return {idFromName: name => name, get(id) {
    if (!stores.has(id)) stores.set(id, {data:new Map(), tail:Promise.resolve()});
    const store=stores.get(id);
    const storage={transaction(fn) {
      const run=store.tail.then(async()=>{
        const draft=structuredClone(store.data);
        const result=await fn({get:async key=>draft.get(key),put:async(key,value)=>draft.set(key,value)});
        store.data=draft;return result;
      });
      store.tail=run.catch(()=>{});return run;
    }};
    return {fetch:(url,init)=>new OrderRealtime({storage,getWebSockets:()=>[]},{}).fetch(new Request(url,init))};
  }};
}
