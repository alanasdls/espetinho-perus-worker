(function(root){
  const KEY='ep-cart-v1';
  const api={
    read(){try{const value=JSON.parse(localStorage.getItem(KEY)||'{}');return {items:Array.isArray(value.items)?value.items.filter(i=>typeof i.name==='string'&&Number.isInteger(i.quantity)&&i.quantity>0&&i.quantity<=50):[],owner:typeof value.owner==='string'?value.owner:null};}catch{return {items:[],owner:null}}},
    write(value){localStorage.setItem(KEY,JSON.stringify(value));},
    addReward(product,owner){const pending=JSON.parse(localStorage.getItem('ep-reward-checkout-v1')||'null');if(pending?.started)throw Error('Existe um resgate em pagamento. Conclua ou acompanhe esse pedido antes de adicionar outro.');const state=this.read();if(state.items.some(i=>i.reward)&&state.owner!==owner)throw Error('Há um resgate de outra conta no carrinho. Remova-o antes de continuar.');state.owner=owner;const row=state.items.find(i=>i.name===product.name&&i.reward===true);if(row)row.quantity=Math.min(50,row.quantity+1);else state.items.push({name:product.name,quantity:1,reward:true,points:Number(product.points)});this.write(state);},
    clear(){localStorage.removeItem(KEY);localStorage.removeItem('ep-reward-checkout-v1');}
  };
  root.EPCart=api;
})(globalThis);
