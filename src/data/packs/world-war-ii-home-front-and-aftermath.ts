import { definePack } from '../authoring'

export const WORLD_WAR_II_HOME_FRONT_AND_AFTER_PACK = definePack({
  id: 'world-war-ii-home-front-and-aftermath',
  name: 'World War II: Home Front and Aftermath',
  description:
    'The Holocaust, home fronts, code names, naval and air war, theaters, and the end of World War II.',
  categories: [
    {
      name: 'Holocaust History',
      clues: [
        {
          clue: "This Nazi genocide targeted Europe's Jewish population for systematic murder.",
          answers: ['Holocaust', 'the Holocaust', 'Shoah'],
          finalEligible: true,
        },
        {
          clue: 'Which 1935 laws stripped German Jews of citizenship and banned many civil rights?',
          answers: ['Nuremberg Laws', 'Nurnberg Laws'],
          finalEligible: true,
        },
        {
          clue: 'This November 1938 pogrom is often translated as the Night of Broken Glass.',
          answers: ['Kristallnacht'],
          finalEligible: true,
        },
        {
          clue: 'The largest Nazi killing center was located at this camp complex in occupied Poland.',
          answers: ['Auschwitz-Birkenau', 'Auschwitz'],
        },
        {
          clue: 'Which 1942 meeting coordinated the Nazi plan known as the Final Solution?',
          answers: ['Wannsee Conference', 'Wannsee'],
          finalEligible: true,
        },
        {
          clue: 'The largest Jewish ghetto in German-occupied Europe was in this Polish city.',
          answers: ['Warsaw'],
        },
      ],
    },
    {
      name: 'Home Front',
      clues: [
        {
          clue: 'This poster icon represented women working in wartime industry.',
          answers: ['Rosie the Riveter', 'Rosie'],
          finalEligible: true,
        },
        {
          clue: 'Which backyard food plots helped civilians supplement rationed supplies?',
          answers: ['victory gardens', 'victory garden'],
          finalEligible: true,
        },
        {
          clue: 'Governments used this system to limit civilian purchases of scarce goods.',
          answers: ['rationing'],
          finalEligible: true,
        },
        {
          clue: 'These government securities helped civilians finance the war effort.',
          answers: ['war bonds', 'victory bonds'],
        },
        {
          clue: "Which slogan linked Black Americans' fight against fascism abroad with racism at home?",
          answers: ['Double V', 'Double Victory'],
          finalEligible: true,
        },
        {
          clue: 'This forced relocation policy incarcerated Japanese Americans during the war.',
          answers: ['internment', 'Japanese American internment', 'incarceration'],
        },
      ],
    },
    {
      name: 'Code Names',
      clues: [
        {
          clue: "This code name referred to Germany's invasion of the Soviet Union.",
          answers: ['Operation Barbarossa', 'Barbarossa'],
          finalEligible: true,
        },
        {
          clue: 'Which code name covered the Allied invasion of Normandy?',
          answers: ['Operation Overlord', 'Overlord'],
          finalEligible: true,
        },
        {
          clue: 'The secret Allied program to build atomic weapons had this code name.',
          answers: ['Manhattan Project'],
          finalEligible: true,
        },
        {
          clue: 'This code name referred to the planned Allied invasion of southern France in 1944.',
          answers: ['Operation Dragoon', 'Dragoon'],
        },
        {
          clue: 'Which German code name described the planned invasion of Britain?',
          answers: ['Operation Sea Lion', 'Sea Lion'],
          finalEligible: true,
        },
        {
          clue: 'The planned invasion of Kyushu, never carried out, had this code name.',
          answers: ['Operation Olympic', 'Olympic'],
        },
      ],
    },
    {
      name: 'Naval War',
      clues: [
        {
          clue: 'This ocean was the setting for the long convoy struggle against German submarines.',
          answers: ['Atlantic Ocean', 'Atlantic'],
          finalEligible: true,
        },
        {
          clue: 'Which German battleship was sunk in May 1941 after a famous chase?',
          answers: ['Bismarck'],
          finalEligible: true,
        },
        {
          clue: 'This Japanese battleship sank during a suicide mission toward Okinawa.',
          answers: ['Yamato'],
          finalEligible: true,
        },
        {
          clue: 'The U.S. carrier Yorktown was lost after this June 1942 battle.',
          answers: ['Midway', 'Battle of Midway'],
        },
        {
          clue: 'Which naval battle in May 1942 was fought between aircraft carriers without the fleets seeing each other directly?',
          answers: ['Coral Sea', 'Battle of the Coral Sea'],
          finalEligible: true,
        },
        {
          clue: 'This Arctic route carried Allied supplies to the Soviet port of Murmansk.',
          answers: ['Arctic convoys', 'Murmansk convoys'],
        },
      ],
    },
    {
      name: 'Air War',
      clues: [
        {
          clue: 'This German air force fought the RAF over Britain in 1940.',
          answers: ['Luftwaffe'],
          finalEligible: true,
        },
        {
          clue: 'Which British service defended home skies with Fighter Command?',
          answers: ['Royal Air Force', 'RAF'],
          finalEligible: true,
        },
        {
          clue: 'This U.S. bomber type carried out long-range raids over Japan from the Marianas.',
          answers: ['B-29', 'B-29 Superfortress'],
          finalEligible: true,
        },
        {
          clue: 'The German V-1 was an early pilotless version of this weapon type.',
          answers: ['cruise missile', 'flying bomb'],
        },
        {
          clue: 'Which Japanese tactic used pilots on deliberate suicide attacks against ships?',
          answers: ['kamikaze'],
          finalEligible: true,
        },
        {
          clue: 'The March 1945 incendiary raid devastated this Japanese capital city.',
          answers: ['Tokyo'],
        },
      ],
    },
    {
      name: 'Eastern Front',
      clues: [
        {
          clue: 'Germany launched its 1941 invasion against this country.',
          answers: ['Soviet Union', 'USSR', 'U.S.S.R.'],
          finalEligible: true,
        },
        {
          clue: 'Which city was the German objective of Operation Typhoon in 1941?',
          answers: ['Moscow'],
          finalEligible: true,
        },
        {
          clue: 'The siege of this city lasted about 872 days.',
          answers: ['Leningrad'],
          finalEligible: true,
        },
        {
          clue: 'This river city became the focus of a decisive 1942-43 battle.',
          answers: ['Stalingrad'],
        },
        {
          clue: 'Which 1943 battle around a salient became famous for massive armored clashes?',
          answers: ['Kursk'],
          finalEligible: true,
        },
        {
          clue: 'The Red Army reached and captured this German capital in 1945.',
          answers: ['Berlin'],
        },
      ],
    },
    {
      name: 'Mediterranean Theater',
      clues: [
        {
          clue: 'This North African country was the site of the battles of El Alamein.',
          answers: ['Egypt'],
          finalEligible: true,
        },
        {
          clue: 'Which German field marshal was nicknamed the Desert Fox?',
          answers: ['Erwin Rommel', 'Rommel'],
          finalEligible: true,
        },
        {
          clue: 'Allied forces landed on this island in July 1943 before invading mainland Italy.',
          answers: ['Sicily'],
          finalEligible: true,
        },
        {
          clue: 'This monastery hill became the focus of hard fighting during the Italian Campaign.',
          answers: ['Monte Cassino', 'Cassino'],
        },
        {
          clue: 'Which canal made Egypt strategically important to British imperial shipping routes?',
          answers: ['Suez Canal', 'Suez'],
          finalEligible: true,
        },
        {
          clue: 'The Afrika Korps fought mainly for this Axis country.',
          answers: ['Germany'],
        },
      ],
    },
    {
      name: 'War Ends',
      clues: [
        {
          clue: 'This date in May 1945 is celebrated as Victory in Europe Day.',
          answers: ['May 8, 1945', 'May 8', '8 May 1945'],
          finalEligible: true,
        },
        {
          clue: "Which U.S. president announced Japan's surrender in August 1945?",
          answers: ['Harry Truman', 'Harry S. Truman', 'Truman'],
          finalEligible: true,
        },
        {
          clue: 'The first atomic bomb used in war was dropped on this city.',
          answers: ['Hiroshima'],
          finalEligible: true,
        },
        {
          clue: 'Which city was struck by the second atomic bomb used in war?',
          answers: ['Nagasaki'],
        },
        {
          clue: 'Japan formally surrendered aboard this U.S. battleship.',
          answers: ['USS Missouri', 'Missouri'],
          finalEligible: true,
        },
        {
          clue: 'World War II formally ended on this date in 1945.',
          answers: ['September 2, 1945', 'September 2', '2 September 1945'],
        },
      ],
    },
    {
      name: 'War Geography',
      clues: [
        {
          clue: 'This French region was the landing site for the June 1944 invasion.',
          answers: ['Normandy'],
          finalEligible: true,
        },
        {
          clue: 'Which Belgian forest region was central to the winter offensive of 1944?',
          answers: ['Ardennes'],
          finalEligible: true,
        },
        {
          clue: 'This island chain includes Saipan, Tinian, and Guam.',
          answers: ['Mariana Islands', 'Marianas'],
          finalEligible: true,
        },
        {
          clue: 'The Ryukyu island group includes this major 1945 battlefield.',
          answers: ['Okinawa'],
        },
        {
          clue: 'Which Soviet river runs through the city once called Stalingrad?',
          answers: ['Volga', 'Volga River'],
          finalEligible: true,
        },
        {
          clue: 'The Aleutian Islands stretch from this U.S. territory toward Asia.',
          answers: ['Alaska'],
        },
      ],
    },
  ],
})
