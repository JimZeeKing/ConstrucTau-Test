export const template = `<table>
            <thead>
                <th colspan="3">{{it.fullName}}</th>
            </thead>
            <tbody>
                <tr>
                    <td class="font-bold">Vocabulaire (nom français de la composante):</td>
                    <td class="bg-gray-600" colspan="2">{{it.vocableFR}}</td>
                </tr>
                <tr>
                    <td class="font-bold">Vocabulaire (vocabulaire usuel de la composante):</td>
                    <td class="bg-gray-600" colspan="2">{{it.vocableEN}}</td>
                </tr>
                <tr>
                    <td class="font-bold">Matériaux:</td>
                    <td class="bg-gray-600">{{it.materials.name}}</td>
                    <td class="bg-gray-600">{{it.materials.description}}</td>
                </tr>
                <tr>
                    <td class="font-bold">Dimensions standards:</td>
                    <td class="bg-gray-600" colspan="2">Hauteur {{it.standradSizes.height}}<br>Largeur
                        {{it.standradSizes.width}}</td>
                </tr>
                <tr>
                    <td class="font-bold">Dimensions possibles: limite inférieur</td>
                    <td class="bg-gray-600">Hauteur : <br>{{it.possibleSizes.height}}</td>
                    <td class="bg-gray-600">Largeur : <br>{{it.possibleSizes.width}}</td>
                </tr>
                <tr>
                    <td class="font-bold">Lien vers des images de constructions réelles (en différents contextes)</td>
                    <td class="bg-gray-600" colspan="2">
                    <img src="./data/images/semelle.jpg" alt=""><img src="./data/images/semelle2.jpg" alt=""><img src="./data/images/semelle3.jpg" alt="">
                    </td>
                </tr>
                <tr>
                    <td class="font-bold">Norme du Code de construction du Québec:</td>
                    <td class="bg-gray-600">Extrait du Code construction du Québec <br>voir plus bas</td>
                    <td class="bg-gray-600">{{it.code.article}}
                        <br>{{it.code.links[0].name}}
                        <br> <a href="{{it.code.links[0].url}}">{{it.code.links[0].url}}</a>
                        <br> et
                        <br>{{it.code.links[1].name}}
                        <br> <a href="{{it.code.links[1].url}}">{{it.code.links[1].url}}</a>
                    </td>
                </tr>
                <tr>
                    <td class="font-bold">Information textuelle sur les prescriptions de pose et /ou techniques
                        d’assemblages
                    </td>
                    <td class="bg-gray-600" colspan="2">{{it.description}}</td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="3"> <button class="bg-gray-500 p-5" onclick="javascript:alert(123)">button</button>
                    </td>
                </tr>
            </tfoot>
        </table>`;


