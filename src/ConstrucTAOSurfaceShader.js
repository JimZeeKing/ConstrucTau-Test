/* eslint-disable require-jsdoc */
const { Color, GLShader, Registry, Material, MaterialColorParam, MaterialFloatParam } = zeaEngine

const vert = `
precision highp float;


attribute vec3 positions;
attribute vec3 normals;
#ifdef ENABLE_TEXTURES
attribute vec2 texCoords;
#endif

import 'GLSLUtils.glsl'
import 'transpose.glsl'
import 'inverse.glsl'
import 'drawItemId.glsl'
import 'drawItemTexture.glsl'
import 'modelMatrix.glsl'

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

#ifdef ENABLE_MULTI_DRAW
import 'materialparams.glsl'
#else
uniform float Overlay;
#endif

/* VS Outputs */
varying float v_drawItemId;
varying vec4 v_geomItemData;
varying vec3 v_viewPos;
varying vec3 v_viewNormal;
#ifdef ENABLE_TEXTURES
varying vec2 v_textureCoord;
#endif
varying vec3 v_worldPos;

void main(void) {
  int drawItemId = getDrawItemId();
  v_drawItemId = float(drawItemId);
  v_geomItemData  = getInstanceData(drawItemId);
  
  #ifdef ENABLE_MULTI_DRAW
  vec2 materialCoords = v_geomItemData.zw;
  vec4 materialValue1 = getMaterialValue(materialCoords, 1);
  float overlay = materialValue1.z;
  #else
  float overlay = Overlay;
  #endif

  mat4 modelMatrix = getModelMatrix(drawItemId);
  mat4 modelViewMatrix = viewMatrix * modelMatrix;

  vec4 pos = vec4(positions + (normals * overlay), 1.);

  vec4 viewPos    = modelViewMatrix * pos;
  gl_Position     = projectionMatrix * viewPos;

  mat3 normalMatrix = mat3(transpose(inverse(modelViewMatrix)));
  v_viewPos       = -viewPos.xyz;
  v_viewNormal    = normalMatrix * normals;

#ifdef ENABLE_TEXTURES
  v_textureCoord  = texCoords;
  v_textureCoord.y = 1.0 - v_textureCoord.y;// Flip y
#endif

  //////////////////////////////////////////////
  // Overlay

  // gl_Position.z = mix(gl_Position.z, -gl_Position.w, overlay);
  
  //////////////////////////////////////////////

  v_worldPos      = (modelMatrix * pos).xyz;
}

`

const frag = `
precision highp float;
#ifdef ENABLE_MULTI_DRAW
// #define DEBUG_GEOM_ID
#endif


import 'GLSLUtils.glsl'
import 'drawItemTexture.glsl'
import 'cutaways.glsl'
import 'gamma.glsl'
import 'materialparams.glsl'


#ifdef DEBUG_GEOM_ID
import 'debugColors.glsl'
#endif

uniform color cutColor;

#ifdef ENABLE_FLOAT_TEXTURES
vec4 getCutaway(int id) {
  return fetchTexel(instancesTexture, instancesTextureSize, (id * pixelsPerItem) + 5);
}

#else

uniform vec4 cutawayData;

vec4 getCutaway(int id) {
  return cutawayData;
}

#endif

/* VS Outputs */
varying float v_drawItemId;
varying vec4 v_geomItemData;
varying vec3 v_viewPos;
varying vec3 v_viewNormal;
#ifdef ENABLE_TEXTURES
varying vec2 v_textureCoord;
#endif
varying vec3 v_worldPos;
/* VS Outputs */

uniform mat4 cameraMatrix;
uniform int isOrthographic;

#ifndef ENABLE_MULTI_DRAW

uniform color BaseColor;
uniform float Opacity;
uniform float EmissiveStrength;

#ifdef ENABLE_TEXTURES
uniform sampler2D BaseColorTex;
uniform int BaseColorTexType;
uniform sampler2D OpacityTex;
uniform int OpacityTexType;
uniform sampler2D EmissiveStrengthTex;
uniform int EmissiveStrengthTexType;
#endif // ENABLE_TEXTURES

#endif // ENABLE_MULTI_DRAW

import 'computeViewNormal.glsl'
  

#ifdef ENABLE_ES3
    out vec4 fragColor;
#endif

#if defined(DRAW_GEOMDATA)
  import 'surfaceGeomData.glsl'
#elif defined(DRAW_HIGHLIGHT)
  import 'surfaceHighlight.glsl'
#endif // DRAW_HIGHLIGHT


void main(void) {
#ifndef ENABLE_ES3
  vec4 fragColor;
#endif

#if defined(DRAW_COLOR)
      int drawItemId = int(v_drawItemId + 0.5);

      int flags = int(v_geomItemData.r + 0.5);
      // Cutaways
      if (testFlag(flags, GEOMITEM_FLAG_CUTAWAY)) 
      {
        vec4 cutAwayData   = getCutaway(drawItemId);
        vec3 planeNormal = cutAwayData.xyz;
        float planeDist = cutAwayData.w;
        if (cutaway(v_worldPos, planeNormal, planeDist)) {
          discard;
          return;
        }
        else if (!gl_FrontFacing) {
    #ifdef ENABLE_ES3
      fragColor = cutColor;
    #else
      gl_FragColor = cutColor;
    #endif
          return;
        }
      }

      //////////////////////////////////////////////
      // Normals
      
      vec3 viewNormal;
      if (length(v_viewNormal) < 0.1) {
        viewNormal = computeViewNormal(v_viewPos);
      } else {
        viewNormal = normalize(v_viewNormal);
      }
      vec3 normal = normalize(mat3(cameraMatrix) * viewNormal);
      
      vec3 viewVector;
      if (isOrthographic == 0)
        viewVector = normalize(mat3(cameraMatrix) * normalize(v_viewPos));
      else 
        viewVector = vec3(-cameraMatrix[2][0], -cameraMatrix[2][1], -cameraMatrix[2][2]);
      
      //////////////////////////////////////////////
      // Material

    #ifdef ENABLE_MULTI_DRAW

      vec2 materialCoords = v_geomItemData.zw;
      vec4 baseColor = toLinear(getMaterialValue(materialCoords, 0));
      vec4 matValue1 = getMaterialValue(materialCoords, 1);
      float opacity       = baseColor.a * matValue1.r;
      float emission      = matValue1.g;

    #else // ENABLE_MULTI_DRAW

    #ifndef ENABLE_TEXTURES
      vec4 baseColor      = toLinear(BaseColor);
      float emission      = EmissiveStrength;
      float opacity       = baseColor.a * Opacity;
    #else
      vec4 baseColor      = getColorParamValue(BaseColor, BaseColorTex, BaseColorTexType, v_textureCoord);
      float opacity       = baseColor.a * getLuminanceParamValue(Opacity, OpacityTex, OpacityTexType, v_textureCoord);
      float emission      = getLuminanceParamValue(EmissiveStrength, EmissiveStrengthTex, EmissiveStrengthTexType, v_textureCoord);
    #endif

    #endif // ENABLE_MULTI_DRAW

      // Hacky simple irradiance. 
      float ndotv = dot(normal, viewVector);
      if (ndotv < 0.0) {
        normal = -normal;
        ndotv = dot(normal, viewVector);

        // Note: these 2 lines can be used to debug inverted meshes.
        //baseColor = vec4(1.0, 0.0, 0.0, 1.0);
        //ndotv = 1.0;
      }

      fragColor = vec4((ndotv * baseColor.rgb) + (emission * baseColor.rgb), opacity);

    #ifdef DEBUG_GEOM_ID
      if (testFlag(flags, GEOMITEM_INVISIBLE_IN_GEOMDATA)) {
        discard;
        return;
      }

      // ///////////////////////
      // Debug Draw ID (this correlates to GeomID within a GLGeomSet)
      float geomId = v_geomItemData.w;
      fragColor.rgb = getDebugColor(geomId);
      // ///////////////////////
    #endif

    #ifdef ENABLE_INLINE_GAMMACORRECTION
      fragColor.rgb = toGamma(fragColor.rgb);
    #endif

#elif defined(DRAW_GEOMDATA)
  fragColor = setFragColor_geomData(v_viewPos, floatGeomBuffer, passId,v_drawItemId, 0);
#elif defined(DRAW_HIGHLIGHT)
  fragColor = setFragColor_highlight(v_drawItemId);
#endif // DRAW_HIGHLIGHT

#ifndef ENABLE_ES3
  gl_FragColor = fragColor;
#endif
}`

/** A simple shader with no support for PBR or textures
 * @ignore
 */
class ConstrucTAOSurfaceShader extends GLShader {
  /**
   * Create a ConstrucTAOSurfaceShader
   * @param {any} gl - gl context
   */
  constructor(gl) {
    super(gl)
    this.setShaderStage('VERTEX_SHADER', vert)
    this.setShaderStage('FRAGMENT_SHADER', frag)
  }

  /**
   * The bind method.
   * @param {object} renderstate - The object tracking the current state of the renderer
   * @param {string} key - The key value.
   * @return {boolean} - The return value.
   */
  bind(renderstate, key) {
    super.bind(renderstate, key)
    const gl = this.__gl
    gl.disable(gl.CULL_FACE)
    return true
  }

  /**
   * The unbind method.
   * @param {object} renderstate - The object tracking the current state of the renderer
   * @return {any} - The return value.
   */
  unbind(renderstate) {
    super.unbind(renderstate)
    const gl = this.__gl
    gl.enable(gl.CULL_FACE)
    return true
  }

  static getParamDeclarations() {
    const paramDescs = super.getParamDeclarations()
    paramDescs.push({
      name: 'BaseColor',
      defaultValue: new Color(1.0, 1.0, 0.5),
    })
    paramDescs.push({ name: 'Opacity', defaultValue: 1.0, range: [0, 1] })
    paramDescs.push({
      name: 'EmissiveStrength',
      defaultValue: 0.0,
      range: [0, 1],
    })
    paramDescs.push({ name: 'Overlay', defaultValue: 0.0, range: [0, 1] })
    return paramDescs
  }

  /**
   * The getPackedMaterialData method.
   * @param {any} material - The material param.
   * @return {any} - The return value.
   */
  static getPackedMaterialData(material) {
    const matData = new Float32Array(8)
    const baseColor = material.getParameter('BaseColor').getValue()
    matData[0] = baseColor.r
    matData[1] = baseColor.g
    matData[2] = baseColor.b
    matData[3] = baseColor.a
    matData[4] = material.getParameter('Opacity').getValue()
    matData[5] = material.getParameter('EmissiveStrength').getValue()
    matData[6] = material.getParameter('Overlay').getValue()
    return matData
  }

  static getMaterialTemplate() {
    return template
  }
}

export class ConstrucTAOSurfaceMaterial extends Material {
  constructor(name) {
    super(name)
    this.__shaderName = 'SimpleSurfaceShader'
    this.baseColorParam = new MaterialColorParam('BaseColor', new Color(1.0, 1, 0.5))
    this.opacityParam = new MaterialFloatParam('Opacity', 1, [0, 1])
    this.emissiveStrengthParam = new MaterialFloatParam('EmissiveStrength', 0, [0, 1])
    this.overlayParam = new MaterialFloatParam('Overlay', 0, [0, 1])
    this.addParameter(this.baseColorParam)
    this.addParameter(this.opacityParam)
    this.addParameter(this.emissiveStrengthParam)
    this.addParameter(this.overlayParam)
  }
}

const template = new ConstrucTAOSurfaceMaterial()

Registry.register('ConstrucTAOSurfaceShader', ConstrucTAOSurfaceShader)
export { ConstrucTAOSurfaceShader }
