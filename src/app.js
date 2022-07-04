async function evaluaPanel() {
  const objetos=await miro.board.get();
  let marcos=[];

  for (let objeto of objetos){
    if(objeto.type=="frame"/* && objeto.title=="1.Determinación del alcance"*/){
      marcos.push(objeto);
    }
  }

for(let marco of marcos){
  let postits=[];
  let votos=[];
  const hijos=await marco.getChildren();
  
  for(var i=0;i<=hijos.length-1;i++){
    if(hijos[i].type=="sticky_note"){
      postits.push(hijos[i]);
    }else if(hijos[i].type=="shape"){
      if (hijos[i].shape=='circle' && hijos[i].content=='<p><strong>VOTO</strong></p>') {
        votos.push(hijos[i]);
      }
    }else{
    }
  }

  var distancias=[];
  var resultados=[];
    for(let voto of votos){
      let formaVoto=await miro.board.getById(voto.id);
      for (let postit of postits){
        let DX=voto.x-postit.x;
        let DY=voto.y-postit.y;
        let distancia=Math.sqrt(DX**2+DY**2);
        distancias.push([postit,distancia]);
      }
    
    var menor=[distancias[0][0].content,distancias[0][1]];
    for (let i=1;i<=distancias.length-1;i++){
      if(distancias[i][1]<menor[1]){
        menor=[distancias[i][0].content,distancias[i][1]];
      }
    }
    resultados.push([menor[0],1]);
    distancias=[];
    }
    
    for(let resultado of resultados){
      resultado[0]=resultado[0].replace("<p>","");
      resultado[0]=resultado[0].replace("</p>","");
    }

  var resultadosFiltrados=[];
  do{
    for (let i=resultados.length-1;i>=0;i--){
    if(resultadosFiltrados.length==0){
      resultadosFiltrados.push([resultados[i][0],1]);
    }else{
      for(let j=resultadosFiltrados.length-1;j>=0;j--){
        if (resultadosFiltrados[j][0]==resultados[i][0]) {
          resultadosFiltrados[j][1]++;
          break;
        }else if(resultadosFiltrados[j][0]!=resultados[i][0]&&j==0){
          resultadosFiltrados.push([resultados[i][0],1]);
          break;
        }
      }
    }
    resultados.pop();
    i=resultados.length-1;
    j=resultadosFiltrados.length-1;
  }
  }while(resultados.length!=0)
    const objCompCall=(a,b)=>{
      if(a[1]<b[1]){
        return 1
      }
      if (a[1]>b[1]){
        return -1
      }
      return 0
    }

  resultadosFiltrados.sort(objCompCall);
  textoResultado(resultadosFiltrados,marco);
  postitResultado(resultadosFiltrados,marco);
}

return resultadosFiltrados;
}


async function textoResultado(resultadosFiltrados,marco){
  const texto=await miro.board.createText({
    style:{
      fillColor: 'transparent',
      fontSize:200,
    },
    content:"La idea ganadora ha sido: "+resultadosFiltrados[0][0]+" con "+resultadosFiltrados[0][1]+" votos.",
    x:marco.x-500,
    y:marco.y-(marco.height/2)-250,
    width: 1500,
  });

  

  return texto;
}


async function postitResultado(resultadosFiltrados,marco){
  const postit=await miro.board.createStickyNote({
    content: resultadosFiltrados[0][0],
  style: {
    fillColor: 'light_yellow', 
    textAlign: 'center', 
    textAlignVertical: 'middle', 
  },
  x: marco.x+1000, 
  y: marco.y-(marco.height/2)-250, 
  shape: 'square',
  width: 1000, 
  });
  return postit;
}
