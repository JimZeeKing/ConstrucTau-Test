export const template = `
<div class="head">{{it.fullName}}</div>
  <div class="row">
    <div class="cell" data-mapping data-hover-class='cell-hover' data-down-class='cell-down' data-target-id='vocableFR'>Vocabulaire (nom français de la composante):</div>
    <div class="cell invisible-data" id='vocableFR' data-remove-class='invisible-data'>{{it.vocableFR}}</div>
  </div>
  <div class="row">
    <div class="cell" data-mapping data-hover-class='cell-hover' data-down-class='cell-down' data-target-id='vocableEN'>Vocabulaire (nom usuel):</div>
    <div class="cell invisible-data" id='vocableEN' data-remove-class='invisible-data'>{{it.vocableEN}}</div>
  </div>
  <div class="row">
    <div class="cell" data-mapping data-hover-class='cell-hover' data-down-class='cell-down' data-target-id='mat-name,mat-desc'>Matériaux:</div>
    <div class="cell invisible-data" id='mat-name' data-remove-class='invisible-data'>{{it.materials.name}}</div>
    <div class="cell invisible-data" id='mat-desc' data-remove-class='invisible-data'>{{it.materials.description}}</div>
  </div>
   <div class="row">
    <div class="cell" data-mapping data-hover-class='cell-hover' data-down-class='cell-down' data-target-id='sizes'>Dimensions standards:</div>
    <div class="cell invisible-data" id='sizes' data-remove-class='invisible-data'>Hauteur {{it.standradSizes.height}}
      <br>Largeur {{it.standradSizes.width}}
     </div>
  </div>
  <div class="row">
    <div class="cell" data-mapping data-hover-class='cell-hover' data-down-class='cell-down' data-target-id='sizes-h,sizes-w'>Dimensions possibles: limite inférieure</div>
    <div class="cell invisible-data" id='sizes-h' data-remove-class='invisible-data'>Hauteur : <br>{{it.possibleSizes.height}}</div>
    <div class="cell invisible-data" id='sizes-w' data-remove-class='invisible-data'>Largeur : <br>{{it.possibleSizes.width}}</div>
  </div>
  
  <div class="row">
    <div class="cell" data-mapping data-hover-class='cell-hover' data-down-class='cell-down' data-target-id='img1,img2,img3'>Images en différents contextes</div>
    <div class="cell flex "><img id='img1' class='invisible-data' data-remove-class='invisible-data' src="./data/images/semelle.jpg" alt=""><img data-remove-class='invisible-data' id='img2' class='invisible-data' src="./data/images/semelle2.jpg" alt=""><img data-remove-class='invisible-data' id='img3' class='invisible-data' src="./data/images/semelle3.jpg" alt=""></div>
  </div>
  
  <div class="row">
    <div class="cell">Normes du Code de construction du Québec:</div>
    <div class="cell">Extrait du Code construction du Québec <br>voir plus bas</div>
    <div class="cell">
      {{it.code.article}}
                        <br>{{it.code.links[0].name}}
                        <br> <a href="{{it.code.links[0].url}}">{{it.code.links[0].url}}</a>
                        <br> et
                        <br>{{it.code.links[1].name}}
                        <br> <a href="{{it.code.links[1].url}}">{{it.code.links[1].url}}</a></div>
  </div>
  
  <div class="row">
    <div class="cell" data-mapping data-hover-class='cell-hover' data-down-class='cell-down' data-target-id='description'>Information textuelle sur les prescriptions de pose et /ou techniques d’assemblages</div>
    <div class="cell invisible-data" id='description' data-remove-class='invisible-data'>{{it.description}}</div>
  </div>
  
  <div class="row">
    <div class="cell">
    <button data-mapping class='button' data-hover-class='button-hover' data-down-class='button-down'  onclick="closeActiveBillboard()">Fermer la fenêtre</button>
    </div>
  </div>
`;
