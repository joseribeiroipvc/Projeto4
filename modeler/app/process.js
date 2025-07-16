function Participant(id, name) {
this.id = id;
this.name = name;
}

function Asset(id, name,type) {
this.id = id;
this.name = name;
}

function Task(id, name,datastores,typedatastore,participant,typeparticipant,istrasnfer) {
this.id = id;
this.name = name;
this.datastores = datastores;
this.typedatastore = typedatastore;
this.participant = participant;
this.typeparticipant = typeparticipant;
this.istrasnfer = istrasnfer;
}


      
   //data holders   
var participantArray = []; 
var participanttxt = "";
var datastoretxt = "";
var assetArray = [];
var tasktxt = "";
var taskArray = [];
var sequencetxt = "";
var messagetxt = "";
var assosstxt = ""; 

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml,"application/xml");


   var xpartic = xmlDoc.getElementsByTagName("participant");
   for (i = 0; i < xpartic.length; i++) {
      participanttxt += "Participante - " + "Id: " + xpartic.item(i).getAttribute("id") + " Nome: " + xpartic.item(i).getAttribute("name") + "\n" ;
    var novo = new Participant(xpartic.item(i).getAttribute("id"),xpartic.item(i).getAttribute("name")); //adicionar - tipo


    
    this.addtoArray = function(){
          participantArray.push(novo)
    }();
    }
   console.log(participantArray);


   var xdata = xmlDoc.getElementsByTagName("dataStoreReference");
   for (i = 0; i < xdata.length; i++) {
      datastoretxt += "Datastore - " + "Id: " + xdata.item(i).getAttribute("id") + " Nome: " + xdata.item(i).getAttribute("name") + "\n" ;
    var novo = new Asset(xdata.item(i).getAttribute("id"),xdata.item(i).getAttribute("name"));



    this.addtoArray = function(){
          assetArray.push(novo)
    }();
  }
     console.log("=== DATASTORES ENCONTRADOS ===");
   console.log(assetArray);
     console.log("Texto dos datastores:", datastoretxt);



   var xtask = xmlDoc.getElementsByTagName("task");
   for (i = 0; i < xtask.length; i++) {
      tasktxt += "Tarefa - " + "Id: " + xtask.item(i).getAttribute("id") + " Nome: " + xtask.item(i).getAttribute("name") + "\n" ;
    var novo = new Task(xtask.item(i).getAttribute("id"),xtask.item(i).getAttribute("name"));
      
      // Processar dataInputAssociation e dataOutputAssociation para descobrir datastores
      var xDataInputAssoc = xmlDoc.getElementsByTagName("dataInputAssociation");
      for(c=0; c<xDataInputAssoc.length;c++){
        var parentElement = xDataInputAssoc.item(c).parentNode;
        if(parentElement && parentElement.getAttribute("id") == xtask.item(i).getAttribute("id")){
          var sourceRef = xDataInputAssoc.item(c).getElementsByTagName("sourceRef")[0];
          if(sourceRef){
            novo.datastores = sourceRef.textContent;
            novo.typedatastore = "Ler";
          }
        }
      }
  
      var xDataOutputAssoc = xmlDoc.getElementsByTagName("dataOutputAssociation");
      for(c=0; c<xDataOutputAssoc.length;c++){
        var parentElement = xDataOutputAssoc.item(c).parentNode;
        if(parentElement && parentElement.getAttribute("id") == xtask.item(i).getAttribute("id")){
          var targetRef = xDataOutputAssoc.item(c).getElementsByTagName("targetRef")[0];
          if(targetRef){
            novo.datastores = targetRef.textContent;
            novo.typedatastore = "Escrever";
          }
        }
      }
  
      // Removi a lógica automática - apenas associações explícitas do BPMN serão processadas
  
      // Fallback para associations (método antigo)
    var xassos = xmlDoc.getElementsByTagName("association");
    for(c=0; c<xassos.length;c++){
      //Se o sourceRef tiver o id da nossa task então a origem é a task e o destino o asset o que implica escrever
      if(xassos.item(c).getAttribute("sourceRef")==(xtask.item(i).getAttribute("id"))){
          if(!novo.datastores) { // só se não foi definido pelos métodos acima
        novo.datastores=xassos.item(c).getAttribute("targetRef")
        novo.typedatastore="Escrever"
          }
      }
      if(xassos.item(c).getAttribute("targetRef")==(xtask.item(i).getAttribute("id"))){
          if(!novo.datastores) { // só se não foi definido pelos métodos acima
        novo.datastores=xassos.item(c).getAttribute("sourceRef")
        novo.typedatastore="Ler"
          }
      }
    }

   
    var xassos = xmlDoc.getElementsByTagName("messageFlow");
      //para descobrir o participant da task
    for(c=0; c<xassos.length;c++){
      if(xassos.item(c).getAttribute("sourceRef")==(xtask.item(i).getAttribute("id"))){
        novo.participant=xassos.item(c).getAttribute("targetRef")
        novo.typeparticipant="Recebe"
      }
      if(xassos.item(c).getAttribute("targetRef")==(xtask.item(i).getAttribute("id"))){
        novo.participant=xassos.item(c).getAttribute("sourceRef")
        novo.typeparticipant="Envia"
      }
    }

    novo.istrasnfer=false;

    this.addtoArray = function(){
          taskArray.push(novo)
    }();
    }

     console.log("=== TAREFAS E DATASTORES ASSOCIADOS ===");
   console.log(taskArray);
     console.log("Texto das tarefas:", tasktxt);
     
     // Log detalhado das associações
     taskArray.forEach((task, index) => {
       console.log(`Tarefa ${index + 1}:`);
       console.log(`  - ID: ${task.id}`);
       console.log(`  - Nome: ${task.name}`);
       console.log(`  - Datastore: ${task.datastores || 'Nenhum'}`);
       console.log(`  - Tipo de acesso: ${task.typedatastore || 'Nenhum'}`);
       console.log(`  - Participante: ${task.participant || 'Nenhum'}`);
       console.log(`  - Tipo de participante: ${task.typeparticipant || 'Nenhum'}`);
       console.log(`  - IsTransfer: ${task.istrasnfer}`);
       console.log('---');
     });

   var x = xmlDoc.getElementsByTagName("sequenceFlow");
   for (i = 0; i < x.length; i++) {     
     sequencetxt += "SequenceFlow - " + "Id: " + x.item(i).getAttribute("id") + " Source: " + x.item(i).getAttribute("sourceRef") + "  Target: " + x.item(i).getAttribute("targetRef") + "\n" ;
    }
   console.log(sequencetxt);



   var x = xmlDoc.getElementsByTagName("association");
   for (i = 0; i < x.length; i++) {     
       assosstxt += "Associação - " + "Id: " + x.item(i).getAttribute("id") + " Source: " + x.item(i).getAttribute("sourceRef") + "  Target: " + x.item(i).getAttribute("targetRef") + "\n" ;
    }
   console.log(assosstxt);



   var x = xmlDoc.getElementsByTagName("messageFlow");
   for (i = 0; i < x.length; i++) {     
     messagetxt += "messageFlow - " + "Id: " + x.item(i).getAttribute("id") + " Source: " + x.item(i).getAttribute("sourceRef") + "  Target: " + x.item(i).getAttribute("targetRef") + "\n" ;
    }
   console.log(messagetxt);

     // Resumo final
     console.log("\n=== RESUMO FINAL DO BPMN ===");
     console.log(`Participantes encontrados: ${participantArray.length}`);
     console.log(`Datastores encontrados: ${assetArray.length}`);
     console.log(`Tarefas encontradas: ${taskArray.length}`);
     console.log("Datastores:", assetArray.map(d => d.name).join(", "));
     console.log("Tarefas:", taskArray.map(t => t.name).join(", "));
     console.log("=====================\n");
  

/*   
/
/
/
/
/
// criação das tabelas
/
/
/
/
/
*/

//tabela participantes

$(document).ready(function() {
    var tableparticipante =  $('#tableparticipante').DataTable( {
        data: participantArray,
        columns: [
            { title: "ID" ,data: "id" },
              { title: "Nome", data:"name" }
        ],       
    } );

    $('#tableparticipante tbody').on( 'click', 'tr', function () {
        if ( $(this).hasClass('selected') ) {
            $(this).removeClass('selected');
        }
        else {
            tableparticipante.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
        }
    } );
 
    $('#button').click( function () {
      
      delete_id=tableparticipante .row('.selected').data().id
      tableparticipante .row('.selected').remove().draw( false );

for(i=0;i<participantArray.length;i++){
  if(delete_id==participantArray[i].id){
    participantArray.splice(i,1)
  }
}
console.log(participantArray);
    } );
    
    $('#buttonadd').click( function () {
  var newname = document.getElementById('partname').value
  var newid = document.getElementById('partid').value
  tableparticipante.rows.add([{
  "id": newid,
  "name": newname
                  
      }]).draw();

      var novo = new Participant(newid,newname);
      participantArray.push(novo);
    } );


} );



//
//
//
//
//
  // Tabela de Datastores
//
//
//
//
//
//

$(document).ready(function() {
   var tableassets = $('#tableassets').DataTable( {
        data: assetArray,
        columns: [
            { title: "ID" ,data: "id" },
              { title: "Nome", data:"name" }
        ]
    } );


    $('#tableassets tbody').on( 'click', 'tr', function () {
        if ( $(this).hasClass('selected') ) {
            $(this).removeClass('selected');
        }
        else {
            tableassets.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
        }
    } );
 
    $('#buttonasset').click( function () {
      
      delete_id=tableassets .row('.selected').data().id
      tableassets .row('.selected').remove().draw( false );

for(i=0;i<assetArray.length;i++){
  if(delete_id==assetArray[i].id){
    assetArray.splice(i,1)
  }
}
console.log(assetArray);
    } );
    
    $('#buttonaddasset').click( function () {
  var newname = document.getElementById('assetname').value
  var newid = document.getElementById('assetid').value
  tableassets.rows.add([{
  "id": newid,
  "name": newname
                  
      }]).draw();

      var novo = new Asset(newid,newname);
      assetArray.push(novo);
    } );




} );


//
//
//
//
//
  // Tabela de Tarefas
//
//
//
//
//
//

$(document).ready(function() {
  var tabletask =  $('#tabletasks').DataTable( {
        data: taskArray,
        columns: [
            { title: "ID" ,data: "id" },
              { title: "Nome", data:"name" },
            { title: "Datastore", data:"datastores" },
            { title: "Tipo", data:"typedatastore" },
              { title: "Participante", data:"participant" },
            { title: "Tipo", data:"typeparticipant" },
            { title: "IsTransfer", data:"istrasnfer" },
        ]
    } );



    $('#tabletasks tbody').on( 'click', 'tr', function () {
        if ( $(this).hasClass('selected') ) {
            $(this).removeClass('selected');
        }
        else {
            tabletask.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
        }
    } );
 
    $('#buttontask').click( function () {
      
      delete_id=tabletask .row('.selected').data().id
      tabletask .row('.selected').remove().draw( false );

for(i=0;i<taskArray.length;i++){
  if(delete_id==taskArray[i].id){
    taskArray.splice(i,1)
  }
}
console.log(taskArray);
    } );
    
    $('#buttonaddtask').click( function () {
  var newname = document.getElementById('taskname').value
  var newid = document.getElementById('taskid').value
  var newdatastores = document.getElementById('taskstore').value
  var newparticipant = document.getElementById('taskpart').value
 
  var checkBox = document.getElementById("tasktrasnfer");
  if(checkBox.checked == true){
  var newistransfer = true
  }else{
  var newistransfer = false
  }
  tabletask.rows.add([{
  "id": newid,
  "name": newname,
  "datastores": newdatastores,
  "participant": newparticipant,
  "istrasnfer": newistransfer
      }]).draw();

      var novo = new Task(newid,newname,newdatastores,newparticipant,newistransfer);
      taskArray.push(novo);
    } );

    
} );

function generateChaincode(taskArray, participantArray, assetArray, contractName = "BPMNContract") {
  let code = `'use strict';\n\n`;
    code += `const { Contract } = require('fabric-contract-api');\n\n`;
  code += `class ${contractName} extends Contract {\n\n`;

    // ... resto do código igual (sem alteração de lógica)
    // Aqui podes adaptar nomes de variáveis, comentários e strings de interface para português de Portugal, caso haja algum termo mais relevante.
  
    // No final:
  code += `}\n\nmodule.exports = ${contractName};\n`;

  return code;
}

  // Função para download genérico
  function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
  }
  
  // Função para download de contratos
  function downloadContract() {
    const filename = prompt("Introduza o nome do ficheiro do contrato:", "BPMNContract");
  
    if (!filename) {
      alert("Nome do ficheiro não foi fornecido.");
      return;
    }
  
    const contractCode = generateChaincode(taskArray, participantArray, assetArray);
  
    // Enviar para o servidor
    fetch('http://localhost:3000/save-contract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ filename, code: contractCode })
    })
    .then(response => {
      if (!response.ok) throw new Error('Erro ao guardar o contrato no servidor.');
      return response.text();
    })
    .then(msg => {
      alert(msg); // ou uma mensagem de sucesso na interface
    })
    .catch(err => {
      console.error(err);
      alert("Erro ao guardar o contrato.");
    });
  }