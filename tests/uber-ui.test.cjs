const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const {JSDOM}=require(process.env.JSDOM_MODULE);
test('admin sees separate fees, confirms exact quote and follows delivery',async()=>{
 const dom=new JSDOM(fs.readFileSync('admin.html','utf8'),{runScripts:'outside-only',url:'https://espetinhoperus.com.br/admin.html'}),w=dom.window,calls=[];
 w.confirm=()=>true;w.api=async(path,opts)=>{calls.push({path,body:JSON.parse(opts.body)});return path.endsWith('/quote')?{mode:'test',quote:{id:'q',fee:1750,customer_fee:10,expires:new Date(Date.now()+60000).toISOString(),pickup_address:'Loja',dropoff_address:'Cliente'}}:{delivery:{id:'del1',status:'pending',tracking_url:'https://example.com/track',live_mode:false}};};
 w.eval(fs.readFileSync('uber-admin.js','utf8'));w.document.getElementById('uberOrderId').value='EP-1';
 await w.document.getElementById('uberQuote').onclick();assert.match(w.document.getElementById('uberMessage').textContent,/17,50/);assert.match(w.document.getElementById('uberMessage').textContent,/10,00/);
 await w.document.getElementById('uberDispatch').onclick();assert.deepEqual(calls[1].body,{quote_id:'q',confirm_fee:1750});assert.equal(w.document.getElementById('uberTracking').hidden,false);dom.window.close();
});
