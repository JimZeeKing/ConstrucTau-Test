export const template = `
<div class="head" data-mapping data-hover-class='test'>{{it.fullName}}</div>
  <div class="row">
    <div class="cell" data-mapping data-hover-class='cell-hover'>Vocabulaire (nom français de la composante):</div>
    <div class="cell">{{it.vocableFR}}</div>
  </div>
  <div class="row">
    <div class="cell">Vocabulaire (nom usuel):</div>
    <div class="cell">{{it.vocableEN}}</div>
  </div>
  <div class="row">
    <div class="cell">Matériaux:</div>
    <div class="cell">{{it.materials.name}}</div>
    <div class="cell">{{it.materials.description}}</div>
  </div>
   <div class="row">
    <div class="cell">Dimensions standards:</div>
    <div class="cell">Hauteur {{it.standradSizes.height}}
      <br>Largeur {{it.standradSizes.width}}
     </div>
  </div>
  <div class="row">
    <div class="cell">Dimensions possibles: limite inférieure</div>
    <div class="cell">Hauteur : <br>{{it.possibleSizes.height}}</div>
    <div class="cell">Largeur : <br>{{it.possibleSizes.width}}</div>
  </div>
  
  <div class="row">
    <div class="cell">Images en différents contextes</div>
    <div class="cell flex"><img src="./data/images/semelle.jpg" alt=""><img src="./data/images/semelle2.jpg" alt=""><img src="./data/images/semelle3.jpg" alt=""></div>
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
    <div class="cell">Information textuelle sur les prescriptions de pose et /ou techniques d’assemblages</div>
    <div class="cell">{{it.description}}</div>
  </div>
  
  <div class="row">
    <div class="cell">
    <button data-mapping class='button' data-hover-class='button-hover' data-down-class='button-down'  onclick="javascript:alert(123)">button</button>
    </div>
  </div>
`;
