(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,951947,e=>{"use strict";var t=e.i(724225),a=e.i(378939),i=e.i(218547),n=e.i(364250),r=e.i(939951),o=e.i(741821),s=e.i(7284),l=e.i(695418),c=e.i(822411),u=e.i(344713),d=e.i(813409);let f=2*c.FINAL_CAMERA_DISTANCE*Math.tan(c.FINAL_CAMERA_FOV*Math.PI/360),g=800*(0,d.getResponsiveSwarmLayout)(1440,800).scale/f;var p=e.i(203959),h=e.i(615262);let m=e=>Math.max(0,Math.min(1,e));function v(e){let t=m(e);return 1===t?1:1-Math.cos(t*Math.PI/2)}function S(e,t){var a,i,n,r;let o,s,c,u,f=e.closest("[data-cloud-mesh-hero]"),g=f?.querySelector("[data-cloud-mesh-title]");if(!f||!g)return null;let p=f.getBoundingClientRect(),h=document.querySelector("header .h-header-h")?.getBoundingClientRect().bottom??0,v=e.getBoundingClientRect(),{centerY:S}=(0,d.getResponsiveSwarmLayout)(v.width,v.height);t.updateMatrixWorld();let x=new l.Vector3(0,S,0).project(t),A=v.top+(1-x.y)*v.height/2;return a=g.getBoundingClientRect().top,i=p.height,n=window.innerHeight,r=p.width<704?f.querySelector("[data-cloud-mesh-media]")?.getBoundingClientRect().bottom:void 0,o=h-a,s=void 0===r?o:Math.min(o,n-r),u=Math.max(1,(c=Math.max(1,.85*Math.min(i,n))-s)-(A-h-24)),m(1-c/u)}var x=e.i(409703);let A=`
  uniform float contrast;
  uniform float invert;

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec3 color = clamp(inputColor.rgb, 0.0, 1.0);
    color = 1.0 - pow(1.0 - color, vec3(contrast));
    // Invert display-referred color, after the shared bright-on-black bokeh.
    outputColor = vec4(mix(color, 1.0 - color, invert), inputColor.a);
  }
`;class M extends x.Effect{constructor(){super("CloudMeshBokehComposite",A,{blendFunction:x.BlendFunction.SRC,uniforms:new Map([["contrast",new l.Uniform(1)],["invert",new l.Uniform(0)]])}),this.inputColorSpace=l.SRGBColorSpace}}function w({contrast:e,invert:a}){let i=(0,o.useMemo)(()=>new M,[]);return(0,o.useEffect)(()=>()=>i.dispose(),[i]),(0,o.useLayoutEffect)(()=>{let t=i.uniforms.get("contrast");t&&(t.value=e);let n=i.uniforms.get("invert");n&&(n.value=Number(a))},[e,a,i]),(0,t.jsx)("primitive",{dispose:null,object:i})}var b=e.i(863285);let y=new l.Vector3(1.4,.7,.95);function E(e,t){if(e.x*t.x>=0||e.z*t.z>=0||.18>Math.min(Math.abs(e.x),Math.abs(e.z),Math.abs(t.x),Math.abs(t.z))||.5>Math.abs(e.x-t.x)||.45>Math.abs(e.z-t.z))return null;let a=((e.x+t.x)**2+(e.y+t.y)**2+(e.z+t.z)**2)/4;return a>.16||e.dot(t)>-.65*e.length()*t.length()?null:a+.12/e.distanceToSquared(t)}function R(e,t,a,i,n){let r=4*t;return(0,b.sampleFormationPosition)([e[r],e[r+1],e[r+2],e[r+3]],a,n,i),n.divide(y)}function I(e,t,a,i,n=[],r,o=[]){let s=new l.Vector3,c=n.map(i=>R(e,i,t,a,new l.Vector3)),u=new Set(o),d=null,f=-1/0,g=0,p=-1/0;for(let n=0;n<32;n++){let n=o.length>0&&.75>i()?o[Math.floor(i()*o.length)]:Math.floor(i()*(e.length/4));if(r&&!r(n))continue;R(e,n,t,a,s);let l=Math.min(Math.abs(s.x),Math.abs(s.z));if(l<.18)continue;let h=2;for(let e of c)h=Math.min(h,s.distanceToSquared(e));let m=l+.75*h;u.has(n)&&m>f&&(d=n,f=m),m>p&&(g=n,p=m)}return null!==d&&.9>i()?d:g}var T=e.i(867230),P=e.i(255519);function C(e,t,a,i){let n=Math.max(1,Math.ceil((i-a)/.06));for(let r=0;r<=n;r++)if(!e(t,a+(i-a)*r/n))return!1;return!0}let O=(0,u.getMurmurationTime)(3),_=Math.acos(.75),F=Math.PI/2*.5*Math.sin(_)/_,j=1.05/F,N=1.53/F;function k(e){return e.seed=Math.imul(e.seed,1664525)+0x3c6ef35f>>>0,e.seed/0x100000000}function L(e,t,a=.264){return Math.max(e+.37*t+.48,e+a)}function z(e=T.DEFAULT_MESSAGE_SEED,t=1,a=P.DEFAULT_MESSAGE_LIMIT,i=1){let n,r,o,s=(0,P.normalizeMessageSpeed)(t),l=(0,P.normalizeMessageSpeed)(i),c=.24/l,u=.264/l,d=N/s;return{infection:(n=new Map,r=new Map,o=0,{times:n,transitions:r,get version(){return o},at:e=>n.get(e)??1e20,has:(e,t)=>(n.get(e)??1/0)<=t+P.MESSAGE_COMPARISON_EPSILON,mark(e,t){if(t>=(n.get(e)??1/0))return;n.set(e,t);let a=t+.036;r.set(e,{start:a,end:a+.12,sending:!1}),o++},markSending(e,t,a,i,n){if(this.mark(e,a),!(Math.abs(this.at(e)-(i??a))<P.MESSAGE_COMPARISON_EPSILON)||r.get(e)?.sending)return;let s=null!==i,l=s?a:t+(a-t)/2,c=s?a+.072/n:a;r.set(e,{start:l,end:c,sending:!0}),o++}}),waveSpeed:l,preSendSeconds:c,rippleSeconds:u,maxMessages:Number.isFinite(a)?Math.max(0,Math.min(P.MAX_MESSAGE_LIMIT,Math.floor(a))):P.DEFAULT_MESSAGE_LIMIT,minDuration:j/s,maxDuration:d,maxLifetime:L(0,d,u),cascades:new Map,expiresAt:Array.from({length:36},()=>0),lastTime:0,nextCascadeAt:Math.max(0,O-c),nextCascadeId:0,nextSlot:0,pending:[],recentSenders:[],seed:e>>>0}}function D(e,t,a,i,n=1,r){if(0===e.maxMessages)return;let o=()=>k(e);for(let[t,i]of(a-e.lastTime>e.maxLifetime&&(e.pending=[],e.cascades.clear(),e.expiresAt.fill(0),e.recentSenders=[],e.nextCascadeAt=a),e.lastTime=a,e.recentSenders=e.recentSenders.filter(e=>e.sendAt>a-2.4),e.pending=e.pending.filter(e=>0===e.generation||e.pulseAt>=a-.024),e.cascades))i.expiresAt<=a&&!e.pending.some(e=>e.cascadeId===t)&&e.cascades.delete(t);if(a>=e.nextCascadeAt&&e.cascades.size<3){let t=0===e.nextCascadeId?e.nextCascadeAt:Math.max(e.nextCascadeAt,a),i=Math.floor(4*o()),n=new Set([...e.cascades.values()].map(e=>e.type));for(;n.has(i);)i=(i+1)%4;let r=e.nextCascadeId;e.nextCascadeId+=1,e.cascades.set(r,{expiresAt:t,messageCount:0,type:i,visitedAgents:[]}),e.pending.push({arcSide:null,cascadeId:r,generation:0,pulseAt:t,receivedAt:null,sender:null,type:i}),e.pending.sort((e,t)=>e.pulseAt-t.pulseAt),e.nextCascadeAt=t+(.8+.48*o())*1.5}let s=0;for(let t of e.expiresAt)t>a&&(s+=1);for(;e.pending.length>0&&e.pending[0].pulseAt<=a+P.MESSAGE_COMPARISON_EPSILON&&s<e.maxMessages;){let c=e.pending.findIndex(e=>e.generation>0&&e.pulseAt<=a+P.MESSAGE_COMPARISON_EPSILON),[u]=e.pending.splice(Math.max(0,c),1);if(!u)break;let d=0===u.cascadeId&&0===u.generation?u.pulseAt:Math.max(u.pulseAt,a),f=d+(0===u.generation?e.preSendSeconds:0),g=e.cascades.get(u.cascadeId);if(!g||g.messageCount>=14)continue;let p=f+.37*e.maxDuration,h=r?e=>C(r,e,d,p):void 0,m=r?e=>C(r,e,f,p):void 0,v=e.recentSenders.map(e=>e.sender),S=[...e.infection.times].filter(([,e])=>e<=d+P.MESSAGE_COMPARISON_EPSILON).map(([e])=>e),x=u.sender??I(t,f,n,o,v,h,S),A=a=>h&&!h(a)?null:function(e,t,a,i,n,r=[],o,s,c=1.2){let u=R(e,t,a,i,new l.Vector3);if(.18>Math.min(Math.abs(u.x),Math.abs(u.z)))return null;let d=new l.Vector3,f=r.map(t=>R(e,t,a,i,new l.Vector3)),g=R(e,t,a+c,i,new l.Vector3),p=new l.Vector3,h=null,m=1/0,v=n=>{if(n===t||r.includes(n)||o&&!o(n))return;R(e,n,a,i,d);let l=E(u,d);if(null===l)return;let v=1;for(let e of f)v=Math.min(v,d.distanceToSquared(e));R(e,n,a+c,i,p);let S=l+(s&&!s(n)?4:0)+ +(null===E(g,p))+(1-v)*.6;S<m&&(h=n,m=S)};for(let t=0;t<48;t++)v(Math.floor(n()*(e.length/4)));if(m>=1)for(let t=0;t<e.length/4;t+=97)v(t);return h}(t,a,f,n,o,g.visitedAgents.filter(e=>e!==a),m,t=>!e.infection.times.has(t),.37*e.maxDuration),M=A(x);for(let e=0;null===M&&0===u.generation&&e<3;e++)M=A(x=I(t,f,n,o,v,h,S));if(null===M)continue;let w=e.nextSlot;e.nextSlot=(w+1)%36;let b=e.minDuration+k(e)*(e.maxDuration-e.minDuration),y=.65+.18*k(e),T=f+.37*b,O=null===u.receivedAt?e.infection.has(x,d):e.infection.at(x)<u.receivedAt-P.MESSAGE_COMPARISON_EPSILON;e.infection.markSending(x,d,f,u.receivedAt,e.waveSpeed),e.infection.mark(M,T);let _=u.arcSide??((13.17*t[4*x]+7.41*t[4*M+3])%1<.5?-1:1);i({...u,infectedSource:O,arcSide:_,pulseAt:d,sender:x,recipient:M,sendAt:f,slot:w,duration:b,strength:y,arrivalAt:T}),e.recentSenders.push({sender:x,sendAt:f}),e.recentSenders.length>6&&e.recentSenders.shift();let F=L(f,b,e.rippleSeconds);e.expiresAt[w]=F,g.expiresAt=Math.max(g.expiresAt,F),g.messageCount+=1,g.visitedAgents.includes(x)||g.visitedAgents.push(x),g.visitedAgents.push(M),s+=1;let j=.95-.1*u.generation;if(u.generation<4&&g.messageCount<14&&k(e)<j){let t=.4>k(e)?2:1;for(let a=0;a<t;a+=1)e.pending.push({arcSide:_,cascadeId:u.cascadeId,generation:u.generation+1,pulseAt:T+.012*a,receivedAt:T,sender:M,type:u.type});e.pending.sort((e,t)=>e.pulseAt-t.pulseAt)}}}let V=`
  uniform vec3 uMessageInk;
`,G=`
  uniform vec3 uInfectionInk;
  float infectionEase(float progress) {
    return 1.0 - cos(clamp(progress, 0.0, 1.0) * 1.5707963267948966);
  }
  float infectionAmount(vec2 transition, float time) {
    return infectionEase((time - transition.x) / max(transition.y - transition.x, 0.0001));
  }
`,W=`
  float messageFade(float age, float duration) {
    float sinceArrival = (age - 0.3700) * duration;
    return 1.0 - smoothstep(0.0, 0.4800, sinceArrival);
  }
`,U=`
  uniform float uTime;
  uniform float uReveal;
  uniform float uScrollProgress;
  uniform float uScale;
  uniform float uShapeThickness;

  float ease(float value) {
    float progress = clamp(value, 0.0, 1.0);
    return progress * progress * (3.0 - 2.0 * progress);
  }

  vec3 formationPositionAt(vec4 agent, float elapsed) {
    float along = agent.x;
    float across = agent.y * uShapeThickness;
    float depth = agent.z * uShapeThickness;
    float character = agent.w;
    float shapeElapsed = elapsed * ${c.MURMURATION_SHAPE_SPEED.toFixed(4)};
    float formationElapsed = shapeElapsed;
    if (shapeElapsed > ${c.REVEAL_SECONDS.toFixed(4)}) {
      float phase = mod(shapeElapsed - ${c.REVEAL_SECONDS.toFixed(4)}, ${c.FORMATION_MORPH_PERIOD.toFixed(4)}) / ${c.FORMATION_MORPH_PERIOD.toFixed(4)};
      float excursion = sin(3.14159265359 * phase);
      formationElapsed = ${c.REVEAL_SECONDS.toFixed(4)} + ${c.FORMATION_MORPH_SPAN.toFixed(4)} * excursion * excursion;
    }
    float time = formationElapsed + ${c.FORMATION_TIME_OFFSET.toFixed(4)};
    float flowTime = shapeElapsed + ${c.FORMATION_TIME_OFFSET.toFixed(4)};

    float angle = along * 6.28318530718 +
      flowTime * (0.151 + character * 0.025);
    float pulse = time * 0.14;
    float crossSection = 0.10 + 0.15 * pow(abs(sin(angle * 1.5 + pulse)), 1.6);
    float filament = sin(angle * 5.0 + depth * 4.0 - time * 0.36) * 0.022;

    vec3 halo = vec3(
      cos(angle) * (1.03 + sin(angle * 2.0 - pulse) * 0.10),
      sin(angle) * 0.42 + sin(angle * 2.0 + pulse) * 0.085,
      sin(angle + pulse * 0.65) * 0.76
    );
    halo += vec3(
      cos(angle) * across * crossSection,
      across * crossSection * 0.74 + filament,
      depth * crossSection * 1.72
    );

    float sweep = sin(angle);
    float envelope = 0.58 + (0.5 + 0.5 * cos(angle * 2.0)) * 0.42;
    vec3 ribbon = vec3(
      sweep * 1.34,
      sin(angle * 2.0 + pulse) * 0.27 + sin(angle * 3.0 - pulse * 0.6) * 0.08,
      cos(angle) * 0.72 + sin(angle * 2.0 - pulse * 0.7) * 0.12
    );
    ribbon += vec3(
      across * cos(angle) * 0.09,
      across * envelope * 0.22 + filament,
      depth * envelope * 0.43
    );

    float figureAngle = angle + sin(angle * 2.0 + pulse) * 0.20;
    vec3 exchange = vec3(
      sin(figureAngle) * 1.08,
      sin(figureAngle * 2.0) * 0.31,
      cos(figureAngle) * 0.86
    );
    exchange += vec3(
      across * cos(figureAngle) * 0.14,
      across * 0.17 + filament,
      depth * (0.17 + abs(sin(figureAngle)) * 0.13)
    );

    float ringWeight = 0.5 + 0.5 * sin(time * 0.105 - 0.5);
    float exchangeWeight = 0.5 + 0.5 * sin(time * 0.074 + 1.3);
    vec3 formation = mix(ribbon, exchange, ease(exchangeWeight) * 0.72);
    formation = mix(formation, halo, ease(ringWeight));
    formation += vec3(
      sin(angle * 3.0 + depth * 1.6 - time * 0.19) * 0.035,
      sin(angle * 2.0 + across * 2.1 + time * 0.14) * 0.028,
      cos(angle * 4.0 + across * 0.9 - time * 0.17) * 0.055
    );

    return formation;
  }

  vec3 agentPosition(vec4 agent) {
    float scrollScale = 1.0 + 0.0033 * uScrollProgress;
    return formationPositionAt(agent, uTime) * uScale * scrollScale;
  }
`,B=`
  ${U}
  ${G}

  uniform float uPixelRatio;

  attribute vec4 aAgent;
  attribute vec2 aInfectionTransition;

  varying float vOpacity;
  varying float vInfection;

  void main() {
    float character = aAgent.w;
    vInfection = infectionAmount(aInfectionTransition, uTime);
    vec3 point = agentPosition(aAgent);
    vec4 viewPosition = modelViewMatrix * vec4(point, 1.0);
    float focalDepth = smoothstep(11.0, 6.1, -viewPosition.z);
    float cameraClearance = smoothstep(4.3, 6.0, -viewPosition.z);
    // Stable, scattered start times keep the entrance immediate without revealing
    // every dot at once. The last dots still finish with the shared five-second fade.
    float revealSeed = fract(aAgent.x * 17.13 + character * 7.41);
    float revealStart = pow(revealSeed, 1.6) * 0.9;
    float revealEnd = min(1.0, revealStart + mix(0.18, 0.34,
      fract(character * 13.17 + aAgent.x * 3.71)));
    float dotProgress = clamp((uReveal - revealStart) / (revealEnd - revealStart), 0.0, 1.0);
    float formationVisibility = 1.0 - (1.0 - dotProgress) * (1.0 - dotProgress);
    float size = mix(0.86, 2.05, pow(character, 2.4));
    size += smoothstep(0.976, 1.0, character) * 1.2;

    vOpacity = mix(0.57, 0.88, focalDepth) *
      mix(0.74, 1.0, character) * cameraClearance * formationVisibility * (1.0 - uScrollProgress);

    // Keep individual infected agents legible after depth-of-field softening.
    size = mix(size, max(size, 2.15), vInfection);

    float perspective = 8.0 / max(-viewPosition.z, 0.12);
    gl_PointSize = min(size * uPixelRatio * mix(perspective, 1.0, 0.28), 5.0 * uPixelRatio);
    gl_Position = projectionMatrix * viewPosition;
  }
`,$=`
  ${U}
  ${W}

  // Stop short of the sine's flat end so the message still has momentum on arrival.
  const float MESSAGE_TRAVEL_ANGLE = ${_.toFixed(16)};
  uniform vec2 uResolution;

  attribute vec4 aSender;
  attribute vec4 aRecipient;
  attribute float aEndpoint;
  attribute float aSide;
  attribute float aArcSide;
  attribute float aBirth;
  attribute float aDuration;
  attribute float aStrength;
  attribute float aIsReply;

  varying float vOpacity;
  varying float vEdge;
  varying float vPathProgress;
  varying float vTrailAge;
  varying float vAge;

  void main() {
    float age = clamp((uTime - aBirth) / aDuration, 0.0, 1.0);
    float travelTime = clamp(age / 0.3700, 0.0, 1.0);
    float reveal = sin(travelTime * MESSAGE_TRAVEL_ANGLE) / sin(MESSAGE_TRAVEL_ANGLE);
    // Launch opacity should not slow down with the line's travel duration.
    float attack = smoothstep(0.0, mix(0.018, 0.0096, aIsReply), uTime - aBirth);
    vec3 sender = agentPosition(aSender);
    vec3 recipient = agentPosition(aRecipient);
    float curveSeed = fract(aSender.x * 13.17 + aRecipient.w * 7.41);
    float depthSeed = fract(aSender.w * 9.83 + aRecipient.x * 11.29);
    vec3 crossing = vec3(
      mix(-0.12, 0.12, fract(curveSeed + depthSeed)),
      mix(-0.08, 0.08, curveSeed),
      mix(-0.16, 0.16, depthSeed)
    ) * uScale * (1.0 + 0.0033 * uScrollProgress);
    vec3 senderView = (modelViewMatrix * vec4(sender, 1.0)).xyz;
    vec3 recipientView = (modelViewMatrix * vec4(recipient, 1.0)).xyz;
    vec3 crossingView = (modelViewMatrix * vec4(crossing, 1.0)).xyz;
    vec2 chord = recipientView.xy / max(-recipientView.z, 0.12) -
      senderView.xy / max(-senderView.z, 0.12);
    vec2 arcNormal = vec2(-chord.y, chord.x) / max(length(chord), 0.0001);
    float centerDepth = max(-crossingView.z, 0.12);
    float arcHeight = min(
      length(chord) * centerDepth * mix(0.16, 0.24, fract(curveSeed * 2.0)),
      0.35 * uScale * (1.0 + 0.0033 * uScrollProgress)
    );
    // Bow in the camera plane so depth and the mobile camera cannot flatten the arc.
    // Keep its midpoint near the center's depth and its endpoints on real particles.
    // Cap the bow against the cloud itself, even when an endpoint nears the camera.
    crossingView.xy += arcNormal * aArcSide * arcHeight;
    vec3 control = 2.0 * crossingView - (senderView + recipientView) * 0.5;
    float progress = aEndpoint * reveal;
    vec3 first = mix(senderView, control, progress);
    vec3 second = mix(control, recipientView, progress);
    vec3 point = mix(first, second, progress);
    vec3 tangent = normalize(second - first + vec3(0.0001));
    vec4 pointClip = projectionMatrix * vec4(point, 1.0);
    vec4 tangentClip = projectionMatrix * vec4(point + tangent * 0.012, 1.0);
    vec2 pointScreen = pointClip.xy / pointClip.w * uResolution;
    vec2 tangentScreen = tangentClip.xy / tangentClip.w * uResolution;
    vec2 direction = normalize(tangentScreen - pointScreen + vec2(0.0001));
    vec2 perpendicular = vec2(-direction.y, direction.x);

    vOpacity = attack * messageFade(age, aDuration) * aStrength * uReveal * (1.0 - uScrollProgress);
    // Recover when the head passed this section so the oldest trail fades first.
    float laidAt = asin(clamp(progress, 0.0, 1.0) * sin(MESSAGE_TRAVEL_ANGLE)) / MESSAGE_TRAVEL_ANGLE;
    vEdge = aSide;
    vPathProgress = aEndpoint;
    vTrailAge = age - laidAt * 0.3700;
    vAge = age;
    gl_Position = pointClip;
    gl_Position.xy +=
      perpendicular * aSide * (1.2 + aStrength * 0.7) *
      (2.0 / uResolution) * gl_Position.w;
  }
`,X=`
  uniform vec3 uInfectionInk;
  uniform float uContrailOpacity;
  varying float vOpacity;
  varying float vEdge;
  varying float vPathProgress;
  varying float vTrailAge;
  varying float vAge;

  void main() {
    float edge = 1.0 - smoothstep(0.52, 1.0, abs(vEdge));
    float trail = mix(0.76, 0.9, smoothstep(0.0, 0.88, vPathProgress));
    float head = exp(-pow((1.0 - vPathProgress) * 8.0, 2.0)) * 0.26;
    float pulse = mix(min(trail + head, 1.0), 0.84, smoothstep(0.36, 0.56, vAge));
    // The older sections dissipate first, underneath the shared overall fade.
    float decay = 1.0 - smoothstep(0.34, 0.6300, vTrailAge);
    gl_FragColor = vec4(uInfectionInk, vOpacity * edge * pulse * decay * uContrailOpacity);
  }
`,H=`
  ${U}
  ${V}
  ${G}
  ${W}

  uniform float uPixelRatio;
  uniform float uWaveSpeed;

  attribute vec4 aSender;
  attribute vec4 aRecipient;
  attribute float aEndpoint;
  attribute float aBirth;
  attribute vec2 aSenderInfection;
  attribute vec2 aRecipientInfection;
  attribute float aDuration;
  attribute float aStrength;
  attribute float aSourceInfected;
  attribute float aIsReply;

  varying float vOpacity;
  varying vec3 vMessageColor;
  varying vec3 vWaveColor;
  varying float vRadio;
  varying float vEmissionProgress;
  varying float vIsReply;
  varying float vGlow;
  varying float vGlowScale;

  void main() {
    float age = clamp((uTime - aBirth) / aDuration, 0.0, 1.0);
    float preSend = mix(0.2400 / uWaveSpeed, 0.0, aIsReply);
    float rippleDuration = preSend + 0.2640 / uWaveSpeed;
    float lead = (uTime - aBirth + preSend) / max(preSend, 0.0001);
    float rippleProgress = (uTime - aBirth + preSend) / rippleDuration;
    float reached = mix(1.0, smoothstep(0.3700, 0.3700 + 0.048 / aDuration, age), aEndpoint);
    float attack = smoothstep(0.0, 0.11, age);
    float decay = messageFade(age, aDuration);
    vec3 point = mix(agentPosition(aSender), agentPosition(aRecipient), aEndpoint);
    vec4 viewPosition = modelViewMatrix * vec4(point, 1.0);

    // Hold the source gently through its lead-in; do not brighten it again in flight.
    float senderGlow = mix(
      0.3 * smoothstep(0.0, 0.3, lead),
      0.45 * smoothstep(0.0, 0.0096, (uTime - aBirth) * uWaveSpeed),
      aIsReply
    );
    float glowSize = 6.0 + aStrength * 4.4;
    // Keep the sender sprite the same size through launch so its ripples never snap shut.
    float spriteSize = mix(60.0, glowSize, aEndpoint);
    vOpacity = min(aStrength * 1.2, 1.0) * uReveal * (1.0 - uScrollProgress);
    vec2 transition = mix(aSenderInfection, aRecipientInfection, aEndpoint);
    vMessageColor = mix(uMessageInk, uInfectionInk, infectionAmount(transition, uTime));
    // Fresh senders change with their final broadcast; existing infections start red.
    float waveInfection = max(aSourceInfected, infectionAmount(aSenderInfection, uTime));
    vWaveColor = mix(uMessageInk, uInfectionInk, waveInfection);
    vRadio = 1.0 - aEndpoint;
    vEmissionProgress = (uTime - aBirth) * uWaveSpeed / 0.2640;
    vIsReply = aIsReply;
    // The sender is only highlighted while it is emitting radio waves.
    float senderFade = 1.0 - smoothstep(0.55, 1.0, rippleProgress);
    vGlow = mix(senderGlow * senderFade, attack * decay * reached, aEndpoint);
    vGlowScale = glowSize / spriteSize;
    gl_PointSize = spriteSize * uPixelRatio * (8.0 / max(-viewPosition.z, 0.12));
    gl_Position = projectionMatrix * viewPosition;
  }
`,Y=`
  uniform float uContrailOpacity;
  uniform float uWaveOpacity;
  varying float vOpacity;
  varying vec3 vMessageColor;
  varying vec3 vWaveColor;
  varying float vRadio;
  varying float vEmissionProgress;
  varying float vIsReply;
  varying float vGlow;
  varying float vGlowScale;

  float radioRing(float radius, float progress, float fadeEnd) {
    float travel = clamp(progress, 0.0, 1.0);
    float ringRadius = mix(0.045, 0.36, travel);
    // A constant, antialiased stroke keeps the wave legible without a wide glow.
    float edgeWidth = max(fwidth(radius) * 0.6, 0.001);
    float stroke = 1.0 - smoothstep(max(0.009 - edgeWidth, 0.0), 0.009 + edgeWidth, abs(radius - ringRadius));
    float envelope = smoothstep(0.0, 0.12, progress) * (1.0 - smoothstep(fadeEnd * 0.55, fadeEnd, progress));
    return stroke * envelope;
  }

  void main() {
    float radius = length(gl_PointCoord - vec2(0.5));
    float glowRadius = radius / vGlowScale;
    float core = 1.0 - smoothstep(0.12, 0.36, glowRadius);
    float halo = (1.0 - smoothstep(0.08, 0.5, glowRadius)) * 0.35;
    // Both initial sends and relays emit this final wave exactly at line launch.
    float radio = radioRing(radius, vEmissionProgress, 1.0) * 0.82;
    // Every initial send has two earlier waves; relays only emit at launch.
    float leadSpacing = 0.45454545;
    // Clear the first ring before launch without making either lead-in expand faster.
    float leadFadeEnd = min(1.0, leadSpacing * 1.75);
    radio += (
      radioRing(radius, vEmissionProgress + leadSpacing * 2.0, leadFadeEnd) * 0.5 +
      radioRing(radius, vEmissionProgress + leadSpacing, leadFadeEnd) * 0.65
    ) * (1.0 - vIsReply);
    float dot = min(core + halo, 1.0) * vGlow * uContrailOpacity;
    float waves = radio * vRadio * uWaveOpacity;
    float opacity = min(dot + waves, 1.0) * vOpacity;

    if (opacity < 0.004) discard;
    vec3 color = (vMessageColor * dot + vWaveColor * waves) / max(dot + waves, 0.0001);
    gl_FragColor = vec4(color, opacity);
  }
`,q=`
  uniform vec3 uInk;
  uniform vec3 uInfectionInk;
  varying float vInfection;
  varying float vOpacity;

  void main() {
    float radius = length(gl_PointCoord - vec2(0.5));
    // Antialias the circle in the sprite itself, including at small point sizes.
    float edgeWidth = clamp(fwidth(radius), 0.08, 0.5);
    float coverage = 1.0 - smoothstep(0.5 - edgeWidth, 0.5, radius);
    // Dark ink needs a little more opacity against a light background.
    float inkBrightness = dot(uInk, vec3(0.2126, 0.7152, 0.0722));
    float contrast = mix(1.18, 1.0, smoothstep(0.25, 0.75, inkBrightness));
    float opacity = min(vOpacity * contrast, 1.0) * coverage;
    if (opacity < 0.01) discard;

    gl_FragColor = vec4(mix(uInk, uInfectionInk, vInfection), opacity);
  }
`;var K=e.i(721136),Z=e.i(614559);function J(e,t,a){let i=t.transitions.get(a.sender),n=t.transitions.get(a.recipient),r=e.getAttribute("aSenderInfection"),o=e.getAttribute("aRecipientInfection");for(let e=0;e<2;e++){let t=2*a.slot+e;r.setXY(t,i?.start??1e20,i?.end??1e20),o.setXY(t,n?.start??1e20,n?.end??1e20)}r.needsUpdate=!0,o.needsUpdate=!0}function Q(e){return{births:new Float32Array(e),replies:new Float32Array(e),durations:new Float32Array(e).fill(1),positions:new Float32Array(3*e),recipients:new Float32Array(4*e),senders:new Float32Array(4*e),strengths:new Float32Array(e)}}function ee(e){let{buffers:a,nodeBuffers:r,uniforms:s,geometry:f,nodeGeometry:g,material:p,nodeMaterial:h}=function({theme:e,inspection:t,automaticFraming:a,messageSeed:r,messageSpeed:s,waveSpeed:f,maxMessages:g,contrailOpacity:p,waveOpacity:h,agents:m,infectionAttribute:v,artworkScale:S,centerY:x,shortAxisScale:A,thickness:M,scrollProgress:w}){let y=(0,o.useContext)(K.SceneTime),E=((0,o.useLayoutEffect)(()=>()=>{v.array.fill(1e20),v.needsUpdate=!0},[v]),(0,o.useMemo)(()=>{let e,t=-1;return(a,i,n)=>{if(a!==e||a.version!==t){for(let[i,n]of(e=a,t=a.version,v.array.fill(1e20),a.transitions))v.setXY(i,n.start,n.end);for(let e of(v.needsUpdate=!0,n))J(i,a,e)}}},[v])),R=(0,o.useRef)(null),I=(0,o.useRef)(null),T=(0,o.useRef)(null),C=(0,o.useRef)(null),O=(0,n.useThree)(e=>e.gl.getPixelRatio()),_=(0,n.useThree)(e=>e.size),F=function({agents:e,inspection:t,automaticFraming:a,messageSeed:i,messageSpeed:r,waveSpeed:s,maxMessages:u,artworkScale:f,centerY:g,shortAxisScale:p,thickness:h,scrollProgress:m}){let v=(0,n.useThree)(e=>e.size),S=(0,n.useThree)(e=>e.camera),x=(0,n.useThree)(e=>e.gl.domElement),A=(0,o.useRef)(null);return(0,o.useLayoutEffect)(()=>{if(v.width>=704)return;let e=()=>{A.current={bounds:x.getBoundingClientRect(),width:window.innerWidth,height:window.innerHeight}};return e(),window.addEventListener("scroll",e,{passive:!0}),window.addEventListener("resize",e),()=>{window.removeEventListener("scroll",e),window.removeEventListener("resize",e)}},[x,v.width,v.height]),(0,o.useMemo)(()=>{let n,o,x=new l.PerspectiveCamera(c.FINAL_CAMERA_FOV,v.width/v.height,.04,45),M=(0,d.createSwarmFraming)(v.width,v.height),w=new l.Matrix4,y=NaN,E=e=>(e!==y&&(M(x,e),w.multiplyMatrices(x.projectionMatrix,x.matrixWorldInverse),y=e),w);return()=>{var d,x,M,w,y;let R,I,T=A.current,C=v.width<704&&T?(d=T.bounds,x=T.width,M=T.height,w={scale:f*(1+.0033*m.value),centerY:g,shortAxisScale:p},R=Math.max(d.width,1),I=Math.max(d.height,1),S.updateMatrixWorld(),{...w,projection:new l.Matrix4().multiplyMatrices(S.projectionMatrix,S.matrixWorldInverse),left:2*(Math.max(0,-d.left)+18)/R-1,right:2*(Math.min(R,x-d.left)-18)/R-1,bottom:1-2*(Math.min(I,M-d.top)-18)/I,top:1-2*(Math.max(0,-d.top)+18)/I}):null,O=JSON.stringify(C&&{...C,projection:a?void 0:C.projection});if(O!==n){let d,f,g=C?(y=a?E:void 0,d=new l.Vector3,f=new l.Euler,(t,a)=>{let i=4*t;return(0,b.sampleFormationPosition)([e[i],e[i+1],e[i+2],e[i+3]],a,d,h),d.multiplyScalar(C.scale),d.y*=C.shortAxisScale,f.set(...(0,c.getSwarmRotation)(a)),d.applyEuler(f),d.y+=C.centerY,d.applyMatrix4(y?.(a)??C.projection),d.z>=-1&&d.z<=1&&d.x>=C.left&&d.x<=C.right&&d.y>=C.bottom&&d.y<=C.top}):void 0;o={visible:g,replay:t?function(e,t,a,i,n=1,r,o=1){let s=z(a,n,r,o),l=[],c=0,u=[];return{infection:s.infection,read(a){let n=Math.ceil(60*Math.max(0,a));for(;c<=n;c++)D(s,e,c/60,e=>l.push(e),t,i);let r=0,o=l.length;for(;r<o;){let e=r+o>>>1;l[e].pulseAt<=a+P.MESSAGE_COMPARISON_EPSILON?r=e+1:o=e}let d=[];for(let e=r-1;e>=0;e--){let t=l[e];if(t.pulseAt<a-s.maxLifetime-s.preSendSeconds)break;L(t.sendAt,t.duration,s.rippleSeconds)>a&&d.push(t)}return d.reverse(),(d.length!==u.length||d.some((e,t)=>e!==u[t]))&&(u=d),u}}}(e,h,i,g,r,u,s):null},n=O}return o}},[e,t,a,i,r,s,u,f,g,p,h,m,S,v.width,v.height])}({agents:m,inspection:t,automaticFraming:a,messageSeed:r,messageSpeed:s,waveSpeed:f,maxMessages:g,artworkScale:S,centerY:x,shortAxisScale:A,thickness:M,scrollProgress:w}),j=(0,o.useMemo)(()=>z(r,s,g,f),[r,s,g,f]),N=(0,o.useRef)(new Map),k=(0,o.useRef)(null),V=(0,o.useMemo)(()=>({...Q(4680),arcSides:new Float32Array(4680),...function(){let e=4680,t=new Uint16Array(13824),a=new Float32Array(e),i=new Float32Array(e);for(let e=0;e<36;e++){let n=130*e;for(let r=0;r<=64;r++){let o=n+2*r;a[o]=a[o+1]=r/64,i[o]=-1,i[o+1]=1,64!==r&&t.set([o,o+2,o+1,o+1,o+2,o+3],(64*e+r)*6)}}return{indices:t,endpoints:a,sides:i}}()}),[]),G=(0,o.useMemo)(()=>({...Q(72),infectedSources:new Float32Array(72),senderInfections:new Float32Array(144).fill(1e20),recipientInfections:new Float32Array(144).fill(1e20),endpoints:Float32Array.from({length:72},(e,t)=>t%2)}),[]),W=(0,o.useMemo)(()=>({uScrollProgress:w,uMessageInk:{value:e.messages[0]},uInfectionInk:{value:e.infection},uContrailOpacity:{value:p},uWaveOpacity:{value:h},uWaveSpeed:{value:j.waveSpeed},uPixelRatio:{value:O},uResolution:{value:new l.Vector2(_.width,_.height)},uScale:{value:S},uShapeThickness:{value:M},uTime:{value:0},uReveal:{value:0}}),[S,p,h,j.waveSpeed,M,w,O,_.height,_.width,e.messages,e.infection]);return(0,i.useFrame)(()=>{let e=R.current,t=I.current,a=T.current;if(!e||!t||!a)return;let i=(0,u.getMurmurationTime)(y.elapsed),{visible:n,replay:r}=F(),o=r?.infection??j.infection;for(let e of[a,C.current])e&&(e.uniforms.uScrollProgress.value=w.value,e.uniforms.uTime.value=i,e.uniforms.uReveal.value=(0,u.getMurmurationReveal)(y.elapsed));let s=a=>{J(t,o,a);let{slot:i,duration:n,strength:r,sendAt:s}=a,l=t.getAttribute("aSourceInfected");for(let e=0;e<2;e++)l.setX(2*i+e,Number(a.infectedSource));l.needsUpdate=!0;let c=4*a.sender,u=4*a.recipient,d=Number(a.generation>0),f=e.getAttribute("aArcSide");for(let e=0;e<130;e++)f.setX(130*i+e,a.arcSide);for(let[a,o]of(f.needsUpdate=!0,[[e,130],[t,2]])){let e=a.getAttribute("aSender"),t=a.getAttribute("aRecipient"),l=a.getAttribute("aBirth"),f=a.getAttribute("aDuration"),g=a.getAttribute("aStrength"),p=a.getAttribute("aIsReply");for(let a=0;a<o;a+=1){let h=i*o+a;e.setXYZW(h,m[c],m[c+1],m[c+2],m[c+3]),t.setXYZW(h,m[u],m[u+1],m[u+2],m[u+3]),l.setX(h,s),f.setX(h,n),g.setX(h,r),p.setX(h,d)}for(let e of["aSender","aRecipient","aBirth","aDuration","aStrength","aIsReply"])a.getAttribute(e).needsUpdate=!0}};if(r){let a=r.read(i);if(a!==k.current){for(let i of(V.strengths.fill(0),G.strengths.fill(0),e.getAttribute("aStrength").needsUpdate=!0,t.getAttribute("aStrength").needsUpdate=!0,a))s(i);k.current=a}E(o,t,a)}else{for(let[a,r]of(D(j,m,i,e=>{s(e),N.current.set(e.slot,{message:e,hidden:!1})},M,n),N.current)){let{message:o}=r;if(L(o.sendAt,o.duration,j.rippleSeconds)<=i){N.current.delete(a);continue}let s=!!n&&(!n(o.sender,i)||!n(o.recipient,i));if(s!==r.hidden)for(let[i,n]of(r.hidden=s,[[e,130],[t,2]])){let e=i.getAttribute("aStrength");for(let t=0;t<n;t++)e.setX(a*n+t,s?0:o.strength);e.needsUpdate=!0}}E(o,t,Array.from(N.current.values(),({message:e})=>e))}}),{buffers:V,nodeBuffers:G,uniforms:W,geometry:R,nodeGeometry:I,material:T,nodeMaterial:C}}(e);return(0,t.jsxs)("group",{children:[(0,t.jsxs)("mesh",{frustumCulled:!1,renderOrder:1,children:[(0,t.jsxs)("bufferGeometry",{ref:f,children:[(0,t.jsx)("bufferAttribute",{attach:"index",args:[a.indices,1]}),(0,t.jsx)("bufferAttribute",{attach:"attributes-position",args:[a.positions,3]}),(0,t.jsx)("bufferAttribute",{attach:"attributes-aSender",args:[a.senders,4]}),(0,t.jsx)("bufferAttribute",{attach:"attributes-aRecipient",args:[a.recipients,4]}),(0,t.jsx)("bufferAttribute",{attach:"attributes-aEndpoint",args:[a.endpoints,1]}),(0,t.jsx)("bufferAttribute",{attach:"attributes-aSide",args:[a.sides,1]}),(0,t.jsx)("bufferAttribute",{attach:"attributes-aArcSide",args:[a.arcSides,1]}),(0,t.jsx)("bufferAttribute",{attach:"attributes-aBirth",args:[a.births,1]}),(0,t.jsx)("bufferAttribute",{attach:"attributes-aIsReply",args:[a.replies,1]}),(0,t.jsx)("bufferAttribute",{attach:"attributes-aDuration",args:[a.durations,1]}),(0,t.jsx)("bufferAttribute",{attach:"attributes-aStrength",args:[a.strengths,1]})]}),(0,t.jsx)("shaderMaterial",{ref:p,depthTest:!1,depthWrite:!1,fragmentShader:X,toneMapped:!1,transparent:!0,uniforms:s,vertexShader:$})]}),(0,t.jsxs)("points",{frustumCulled:!1,renderOrder:2,children:[(0,t.jsxs)("bufferGeometry",{ref:g,children:[(0,t.jsx)("bufferAttribute",{attach:"attributes-position",args:[r.positions,3]}),(0,t.jsx)("bufferAttribute",{attach:"attributes-aSender",args:[r.senders,4]}),(0,t.jsx)("bufferAttribute",{attach:"attributes-aRecipient",args:[r.recipients,4]}),(0,t.jsx)("bufferAttribute",{attach:"attributes-aEndpoint",args:[r.endpoints,1]}),(0,t.jsx)("bufferAttribute",{attach:"attributes-aBirth",args:[r.births,1]}),(0,t.jsx)("bufferAttribute",{attach:"attributes-aSenderInfection",args:[r.senderInfections,2]}),(0,t.jsx)("bufferAttribute",{attach:"attributes-aRecipientInfection",args:[r.recipientInfections,2]}),(0,t.jsx)("bufferAttribute",{attach:"attributes-aIsReply",args:[r.replies,1]}),(0,t.jsx)("bufferAttribute",{attach:"attributes-aDuration",args:[r.durations,1]}),(0,t.jsx)("bufferAttribute",{attach:"attributes-aStrength",args:[r.strengths,1]}),(0,t.jsx)("bufferAttribute",{attach:"attributes-aSourceInfected",args:[r.infectedSources,1]})]}),(0,t.jsx)("shaderMaterial",{ref:h,depthTest:!1,depthWrite:!1,fragmentShader:Y,toneMapped:!1,transparent:!0,uniforms:s,vertexShader:H})]})]})}let et=(0,o.lazy)(()=>e.A(957417));function ea({theme:e,count:a,capacity:r,maxWidth:s,active:f,inspection:g,automaticFraming:p,messageSeed:h,messageSpeed:x,waveSpeed:A,maxMessages:M,contrailOpacity:w,waveOpacity:b}){let y=(0,o.useContext)(K.SceneTime),E=(0,o.useRef)(null),R=(0,o.useRef)(null),I=(0,o.useRef)(null),{width:T,height:P}=(0,n.useThree)(e=>e.size),C=(0,n.useThree)(e=>e.gl.getPixelRatio()),O=function(e,t=!0){let a=(0,n.useThree)(e=>e.gl.domElement),r=(0,n.useThree)(e=>e.camera),s=(0,n.useThree)(e=>e.invalidate),l=(0,o.useMemo)(()=>{let e={value:0},t={current:0,target:0},a={uniform:e,needsSync:!0,update(i,n=!1){t.target=i,n&&(a.needsSync=!1,t.current=i,e.value=v(i))},advance(a){var i,n,r;let o,s,l,c,u,d;return i=t.current,n=t.target,r=Math.min(a,.05),o=m(i),l=Math.abs((s=m(n))-o),c=Math.max(0,(l-.33)/1.5),t.current=(d=(u=Math.max(0,r))<=c?l-1.5*u:Math.min(l,.33)*Math.exp(-(u-c)/.22))<1e-5?s:s+Math.sign(o-s)*d,e.value=v(t.current),t.current!==t.target}};return a},[]);return(0,i.useFrame)((e,i)=>{if(t){if(l.needsSync){let e=S(a,r);null!==e&&l.update(e,!0)}l.advance(i)&&s()}},-2),(0,o.useLayoutEffect)(()=>{if(!t)return void l.update(0,!0);if(!e)return;let i=(e=!1)=>{let t=S(a,r);null!==t&&(l.update(t,e),s())},n=()=>i();return i(!0),window.addEventListener("scroll",n,{passive:!0}),window.addEventListener("resize",n),()=>{l.needsSync=!0,window.removeEventListener("scroll",n),window.removeEventListener("resize",n)}},[e,r,a,t,s,l]),l.uniform}(f,!g),{scale:_,centerY:F,shortAxisScale:j,thickness:N}=(0,d.getResponsiveSwarmLayout)(T,P,s),k=(0,o.useMemo)(()=>({agents:function(e,t){let a=e.length/4,i=Math.max(0,Math.min(a,Math.floor(t)));if(i===a)return e;let n=new Float32Array(4*i);for(let t=0;t<i;t+=1){let r=Math.floor((t+.5)*a/i);n.set(e.subarray(4*r,4*r+4),4*t)}return n}(c.SWARM_AGENTS,r),positions:new Float32Array(3*r),infection:new l.BufferAttribute(new Float32Array(2*r).fill(1e20),2)}),[r]),L=(0,o.useMemo)(()=>k.agents.subarray(0,4*a),[k.agents,a]);(0,o.useLayoutEffect)(()=>{I.current?.setDrawRange(0,a)},[a]);let z=(0,o.useMemo)(()=>({uScrollProgress:O,uInk:{value:e.ink},uInfectionInk:{value:e.infection},uPixelRatio:{value:C},uScale:{value:_},uShapeThickness:{value:N},uTime:{value:0},uReveal:{value:0}}),[_,N,C,e.ink,e.infection,O]);return(0,i.useFrame)(()=>{let e=(0,u.getMurmurationTime)(y.elapsed);R.current?.rotation.set(...(0,c.getSwarmRotation)(e)),E.current&&(E.current.uniforms.uScrollProgress.value=O.value,E.current.uniforms.uTime.value=e,E.current.uniforms.uReveal.value=(0,u.getMurmurationReveal)(y.elapsed))}),(0,t.jsxs)("group",{ref:R,position:[0,F,0],rotation:(0,c.getSwarmRotation)((0,u.getMurmurationTime)(y.elapsed)),scale:[1,j,1],children:[(0,t.jsxs)("points",{frustumCulled:!1,children:[(0,t.jsxs)("bufferGeometry",{ref:I,children:[(0,t.jsx)("bufferAttribute",{attach:"attributes-position",args:[k.positions,3]}),(0,t.jsx)("bufferAttribute",{attach:"attributes-aAgent",args:[k.agents,4]}),(0,t.jsx)("primitive",{attach:"attributes-aInfectionTransition",object:k.infection})]}),(0,t.jsx)("shaderMaterial",{ref:E,depthWrite:!0,fragmentShader:q,toneMapped:!1,transparent:!0,uniforms:z,vertexShader:B})]}),a>0&&(0,t.jsx)(ee,{theme:e,inspection:g,automaticFraming:p,messageSeed:h,messageSpeed:x,waveSpeed:A,maxMessages:M,contrailOpacity:w,waveOpacity:b,agents:L,infectionAttribute:k.infection,artworkScale:_,centerY:F,shortAxisScale:j,thickness:N,scrollProgress:O},`${a}-${h}-${x}-${M}-${A}`)]})}function ei({active:e,profile:a,tuning:s}){let l=(0,o.useContext)(K.SceneTime),m=(0,n.useThree)(e=>e.camera),{width:v,height:S}=(0,n.useThree)(e=>e.size),x=(0,n.useThree)(e=>e.gl.domElement),A=(0,h.useMurmurationTheme)(),M=s?.renderSettings??(0,p.getDefaultRenderSettings)(A.mode),b=(0,o.useMemo)(()=>(0,d.createSwarmFraming)(v,S,M.maxWidth),[v,S,M.maxWidth]),y=Math.min(c.MURMURATION_AGENT_COUNT,a.getMaxParticleCount()),E=function(e,t,a,i){let n=Math.min(c.MURMURATION_AGENT_COUNT,a,i.particleLimit);if(!i.particles||e<=0||t<=0||n<=0)return 0;if(!i.dynamicParticles)return n;let r=(0,d.getResponsiveSwarmLayout)(e,t,i.maxWidth),o=t*r.scale/f;return Math.min(n,Math.max(1e3,500*Math.round(c.MURMURATION_AGENT_COUNT*i.density*(o/g)**2*r.shortAxisScale/500)))}(v,S,y,M),R=(0,p.getPostprocessingSettings)(a,M),I=(0,o.useMemo)(()=>R.enabled?(0,h.getBokehRenderTheme)(A,M.blurContrast):A,[R.enabled,M.blurContrast,A]),C=s?.onRenderStats;return(0,o.useLayoutEffect)(()=>{x.closest("[data-effect='monochrome-murmuration']")?.setAttribute("data-particle-count",String(E)),C?.({count:E,capacity:y,width:Math.round(v),height:Math.round(S),postprocessing:R.enabled,multisampling:R.enabled?R.multisampling:0,resolutionScale:R.resolutionScale})},[x,E,y,v,S,R.enabled,R.multisampling,R.resolutionScale,C]),(0,i.useFrame)(()=>{(!s||s.automaticFraming)&&b(m,(0,u.getMurmurationTime)(l.elapsed))},-2.5),(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("color",{attach:"background",args:[I.background]}),(0,t.jsx)(ea,{theme:I,active:e,inspection:!!s,automaticFraming:s?.automaticFraming??!0,messageSeed:s?.messageSeed??T.DEFAULT_MESSAGE_SEED,messageSpeed:s?.messageSpeed??1,waveSpeed:s?.waveSpeed??1,maxMessages:s?.maxMessages??P.DEFAULT_MESSAGE_LIMIT,contrailOpacity:M.contrailOpacity,waveOpacity:M.waveOpacity,count:E,capacity:y,maxWidth:M.maxWidth}),s&&(0,t.jsx)(o.Suspense,{fallback:null,children:(0,t.jsx)(et,{tuning:s})}),R.enabled&&(0,t.jsxs)(r.EffectComposer,{depthBuffer:!0,enableNormalPass:!1,multisampling:R.multisampling,children:[(0,t.jsx)(r.DepthOfField,{target:[0,0,M.focusDepth],bokehScale:M.bokehScale,focalLength:M.focalLength,resolutionScale:R.resolutionScale,worldFocusRange:M.focusRange}),(0,t.jsx)(w,{contrast:M.blurContrast,invert:"light"===A.mode})]})]})}e.s(["default",0,function({active:e,profile:i,tuning:n}){let r=!!n,d=(0,o.useMemo)(()=>(0,Z.createSceneClock)({elapsed:r?u.MURMURATION_INTRO_SECONDS:0,paused:r,started:!1}),[r]),[f,g]=i.getDpr();return(0,t.jsx)(a.Canvas,{"aria-hidden":"true",camera:{far:45,fov:c.FINAL_CAMERA_FOV,near:.04,position:[0,0,8]},className:(0,s.clsx)("size-full",n?"touch-none":"touch-pan-y"),"data-effect":"monochrome-murmuration","data-engine":"threejs","data-particle-count":0,dpr:[f,Math.min(1.6,g)],frameloop:e?"always":"never",gl:{alpha:!1,antialias:i.getAntialias(),toneMapping:l.NoToneMapping},children:(0,t.jsxs)(K.SceneTime.Provider,{value:d,children:[(0,t.jsx)(K.AdvanceSceneTime,{paused:n?.paused,timeScale:n?.timeScale}),(0,t.jsx)(ei,{active:e,profile:i,tuning:n})]})})}],951947)},557599,function(e){e.n(e.i(951947))}]);