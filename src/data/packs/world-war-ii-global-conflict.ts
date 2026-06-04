import { definePack } from '../authoring'

export const WORLD_WAR_II_GLOBAL_CONFLICT_PACK = definePack({
  id: 'world-war-ii-global-conflict',
  name: 'World War II: Global Conflict',
  description:
    'Major leaders, battles, operations, weapons, and turning points of the Second World War.',
  categories: [
    {
      name: 'Opening Moves',
      clues: [
        {
          clue: 'Germany invaded this country on September 1, 1939, beginning the war in Europe.',
          answers: ['Poland'],
          finalEligible: true,
        },
        {
          clue: 'Which two countries declared war on Germany on September 3, 1939?',
          answers: ['Britain and France', 'United Kingdom and France', 'France and Britain'],
          finalEligible: true,
        },
        {
          clue: 'This 1939 pact included a secret protocol dividing eastern Europe into spheres of influence.',
          answers: ['Molotov-Ribbentrop Pact', 'Nazi-Soviet Pact', 'German-Soviet Nonaggression Pact'],
          finalEligible: true,
        },
        {
          clue: 'German forces used this fast combined-arms style of warfare in early campaigns.',
          answers: ['blitzkrieg', 'lightning war'],
        },
        {
          clue: 'Which Scandinavian country was invaded by Germany in April 1940 along with Norway?',
          answers: ['Denmark'],
          finalEligible: true,
        },
        {
          clue: 'The evacuation of Allied troops from beaches near this French port became a symbol of British resolve.',
          answers: ['Dunkirk'],
        },
      ],
    },
    {
      name: 'European Battles',
      clues: [
        {
          clue: 'This 1940 air campaign prevented Germany from gaining control of the skies over the United Kingdom.',
          answers: ['Battle of Britain'],
          finalEligible: true,
        },
        {
          clue: 'Which Soviet city on the Volga became the site of a brutal 1942-43 German defeat?',
          answers: ['Stalingrad'],
          finalEligible: true,
        },
        {
          clue: "The July 1943 clash near this Soviet city is often described as history's largest tank battle.",
          answers: ['Kursk'],
          finalEligible: true,
        },
        {
          clue: 'This December 1944 German offensive created a large salient in the Allied lines in the Ardennes.',
          answers: ['Battle of the Bulge', 'Ardennes Offensive'],
        },
        {
          clue: 'Which June 1944 invasion opened a major Allied front in western France?',
          answers: ['Normandy', 'Normandy invasion', 'D-Day'],
          finalEligible: true,
        },
        {
          clue: 'The long siege of this Soviet city lasted from 1941 to 1944.',
          answers: ['Leningrad'],
        },
      ],
    },
    {
      name: 'Pacific Battles',
      clues: [
        {
          clue: 'Japan attacked this U.S. naval base on December 7, 1941.',
          answers: ['Pearl Harbor'],
          finalEligible: true,
        },
        {
          clue: 'Which June 1942 naval battle cost Japan four aircraft carriers?',
          answers: ['Midway', 'Battle of Midway'],
          finalEligible: true,
        },
        {
          clue: 'This Solomon Islands campaign began in August 1942 and helped halt Japanese expansion.',
          answers: ['Guadalcanal'],
          finalEligible: true,
        },
        {
          clue: 'U.S. Marines raised a famous flag on Mount Suribachi during this 1945 island battle.',
          answers: ['Iwo Jima'],
        },
        {
          clue: 'Which 1945 battle in the Ryukyus was the largest amphibious operation of the Pacific War?',
          answers: ['Okinawa', 'Battle of Okinawa'],
          finalEligible: true,
        },
        {
          clue: "This Philippine naval battle in 1944 helped cripple Japan's remaining surface fleet.",
          answers: ['Leyte Gulf', 'Battle of Leyte Gulf'],
        },
      ],
    },
    {
      name: 'Allied Leaders',
      clues: [
        {
          clue: 'This British prime minister led the United Kingdom through most of the war.',
          answers: ['Winston Churchill', 'Churchill'],
          finalEligible: true,
        },
        {
          clue: 'Which U.S. president asked Congress for a declaration of war after Pearl Harbor?',
          answers: ['Franklin D. Roosevelt', 'Franklin Roosevelt', 'FDR', 'Roosevelt'],
          finalEligible: true,
        },
        {
          clue: 'This Soviet leader met with Churchill and Roosevelt at Tehran and Yalta.',
          answers: ['Joseph Stalin', 'Stalin'],
          finalEligible: true,
        },
        {
          clue: 'The Free French movement was led by this general.',
          answers: ['Charles de Gaulle', 'de Gaulle'],
        },
        {
          clue: "Which U.S. general accepted Japan's formal surrender aboard the USS Missouri?",
          answers: ['Douglas MacArthur', 'MacArthur'],
          finalEligible: true,
        },
        {
          clue: 'This Chinese Nationalist leader was one of the Allied leaders at the Cairo Conference.',
          answers: ['Chiang Kai-shek', 'Jiang Jieshi', 'Chiang'],
        },
      ],
    },
    {
      name: 'Axis Leaders',
      clues: [
        {
          clue: 'This dictator led Nazi Germany.',
          answers: ['Adolf Hitler', 'Hitler'],
          finalEligible: true,
        },
        {
          clue: 'Which Fascist leader ruled Italy at the start of the war?',
          answers: ['Benito Mussolini', 'Mussolini'],
          finalEligible: true,
        },
        {
          clue: 'This Japanese prime minister was in office when Japan attacked Pearl Harbor.',
          answers: ['Hideki Tojo', 'Tojo Hideki', 'Tojo'],
          finalEligible: true,
        },
        {
          clue: "Germany's air force was commanded by this high-ranking Nazi official.",
          answers: ['Hermann Goring', 'Goring', 'Goering'],
        },
        {
          clue: "Which admiral planned Japan's carrier attack on Pearl Harbor?",
          answers: ['Isoroku Yamamoto', 'Yamamoto'],
          finalEligible: true,
        },
        {
          clue: 'This SS chief was one of the principal architects of Nazi genocide.',
          answers: ['Heinrich Himmler', 'Himmler'],
        },
      ],
    },
    {
      name: 'Weapons and Technology',
      clues: [
        {
          clue: 'This British fighter is closely associated with defense against the Luftwaffe in 1940.',
          answers: ['Spitfire', 'Supermarine Spitfire'],
          finalEligible: true,
        },
        {
          clue: 'Which American long-range bomber dropped the atomic bombs on Japan?',
          answers: ['B-29 Superfortress', 'B-29'],
          finalEligible: true,
        },
        {
          clue: 'This German cipher machine was a major target of Allied codebreakers.',
          answers: ['Enigma', 'Enigma machine'],
          finalEligible: true,
        },
        {
          clue: 'The German V-2 was an early ballistic version of this weapon type.',
          answers: ['rocket', 'missile'],
        },
        {
          clue: "Which underwater vessels were central to Germany's campaign against Atlantic shipping?",
          answers: ['U-boats', 'submarines', 'U-boat'],
          finalEligible: true,
        },
        {
          clue: 'This Japanese suicide aircraft tactic targeted Allied ships late in the Pacific War.',
          answers: ['kamikaze', 'kamikazes'],
        },
      ],
    },
    {
      name: 'Conferences and Strategy',
      clues: [
        {
          clue: 'At this 1945 Crimean meeting, Allied leaders discussed postwar Europe.',
          answers: ['Yalta Conference', 'Yalta'],
          finalEligible: true,
        },
        {
          clue: "Which 1945 conference issued a declaration demanding Japan's surrender?",
          answers: ['Potsdam Conference', 'Potsdam'],
          finalEligible: true,
        },
        {
          clue: 'This 1943 meeting in Iran brought Roosevelt, Churchill, and Stalin together.',
          answers: ['Tehran Conference', 'Tehran'],
          finalEligible: true,
        },
        {
          clue: 'The 1943 meeting with Roosevelt, Churchill, and Chiang Kai-shek took place in this Egyptian city.',
          answers: ['Cairo'],
        },
        {
          clue: 'Which policy gave priority to defeating Nazi Germany before focusing fully on Japan?',
          answers: ['Germany first', 'Europe first'],
          finalEligible: true,
        },
        {
          clue: 'This U.S. aid program supplied Allied nations before and after America entered the war.',
          answers: ['Lend-Lease', 'Lend Lease'],
        },
      ],
    },
    {
      name: 'Resistance and Occupation',
      clues: [
        {
          clue: 'This term describes organized underground opposition to occupying forces.',
          answers: ['resistance'],
          finalEligible: true,
        },
        {
          clue: 'Which occupied capital was liberated in August 1944 by Allied and French forces?',
          answers: ['Paris'],
          finalEligible: true,
        },
        {
          clue: 'This Czech village was destroyed by the Nazis after the assassination of Reinhard Heydrich.',
          answers: ['Lidice'],
          finalEligible: true,
        },
        {
          clue: 'The Polish Home Army launched a major 1944 uprising in this city.',
          answers: ['Warsaw'],
        },
        {
          clue: 'Which collaborationist government ruled unoccupied southern France after the 1940 armistice?',
          answers: ['Vichy France', 'Vichy'],
          finalEligible: true,
        },
        {
          clue: 'This Yugoslav partisan leader later became president of socialist Yugoslavia.',
          answers: ['Josip Broz Tito', 'Tito'],
        },
      ],
    },
    {
      name: 'Turning Points',
      clues: [
        {
          clue: 'This Soviet counteroffensive encircled the German Sixth Army in late 1942.',
          answers: ['Operation Uranus', 'Uranus'],
          finalEligible: true,
        },
        {
          clue: "Which May 1942 carrier battle checked Japan's advance toward Port Moresby?",
          answers: ['Coral Sea', 'Battle of the Coral Sea'],
          finalEligible: true,
        },
        {
          clue: 'This North African battle helped stop Axis advances toward Egypt and the Suez Canal.',
          answers: ['El Alamein', 'Second Battle of El Alamein'],
          finalEligible: true,
        },
        {
          clue: 'The Allied landings in Sicily helped lead to the fall of this European dictator in 1943.',
          answers: ['Mussolini', 'Benito Mussolini'],
        },
        {
          clue: 'Which June 1944 operation began the liberation of western Europe?',
          answers: ['Overlord', 'Operation Overlord', 'D-Day'],
          finalEligible: true,
        },
        {
          clue: 'The Soviet capture of this capital signaled the final collapse of Nazi Germany.',
          answers: ['Berlin'],
        },
      ],
    },
  ],
})
