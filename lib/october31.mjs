// New IDs keep progress for the previous October 31 edition from being applied
// to different questions. Archive dates continue using their original IDs.
export const october31Ids=[
 'oct31-supernatural','v2-q009','v2-q010','oct31-billion',
 'oct31-debut','v2-q047','oct31-west-coast','v2-q012',
 'oct31-instrumental','oct31-time-travel'
];
const entry=(title,points,aliases=[])=>({title,points,aliases,rarity:({20:'common',40:'uncommon',60:'rare',80:'epic',100:'legendary'})[points]});
export const october31Questions=[
 {id:'oct31-supernatural',category:'Film',prompt:'Name a movie featuring a supernatural entity.',hint:'Ghosts, spirits, vampires, demons, and other paranormal beings count.',answers:[
  entry('Ghostbusters',20),entry('The Exorcist',20),entry('The Sixth Sense',40),entry('Beetlejuice',40),entry('The Others',60),entry('The Conjuring',60),entry('Spirited Away',80),entry('A Ghost Story',100)
 ]},
 {id:'oct31-billion',category:'Film',prompt:'Name a movie with a worldwide box-office gross of over $1 billion.',hint:'Worldwide theatrical earnings in US dollars, including re-releases, as of October 31, 2026. Figures are not adjusted for inflation.',answers:[
  entry('Avatar',20),entry('Avengers: Endgame',20,['Endgame']),entry('Titanic',40),entry('The Avengers',40,['Avengers','Avengers Assemble']),entry('Frozen',60),entry('The Dark Knight',60),entry('Zootopia',80,['Zootropolis']),entry('Alice in Wonderland',100,['Alice in Wonderland (2010)'])
 ]},
 {id:'oct31-debut',category:'Music',prompt:'Name an artist’s first studio album.',hint:'Give the album title. Solo artists and bands count; an earlier EP or mixtape does not disqualify a studio debut.',answers:[
  entry('Taylor Swift',20,['Taylor Swift by Taylor Swift']),entry('Please Please Me',20),entry('The College Dropout',40),entry('Illmatic',40),entry('Pablo Honey',60),entry('Pure Heroine',60),entry('Section.80',80,['Section 80']),entry('For You',100,['For You by Prince'])
 ]},
 {id:'oct31-west-coast',category:'Music',prompt:'Name a rapper from the West Coast.',hint:'California, Oregon, and Washington count, along with rappers closely associated with the West Coast scene.',answers:[
  entry('Kendrick Lamar',20,['Kendrick']),entry('Snoop Dogg',20,['Snoop Doggy Dogg']),entry('Tupac Shakur',40,['Tupac','2Pac','Makaveli']),entry('Dr. Dre',40,['Dr Dre','Dre']),entry('Ice Cube',60),entry('Tyler, the Creator',60,['Tyler the Creator']),entry('E-40',80,['E40']),entry('Del the Funky Homosapien',100,['Del tha Funkee Homosapien'])
 ]},
 {id:'oct31-instrumental',category:'Music',prompt:'Name a song with no lyrics.',hint:'Instrumental tracks and compositions count. Tracks with sung or spoken lyrics do not.',answers:[
  entry('Axel F',20),entry('Green Onions',20),entry('Cliffs of Dover',40),entry('Jessica',40,['Jessica by the Allman Brothers Band']),entry('YYZ',60),entry('One Summer’s Day',60,["One Summer's Day"]),entry('An Ending (Ascent)',80),entry('Eruption',100,['Eruption by Van Halen'])
 ]},
 {id:'oct31-time-travel',category:'Culture',prompt:'Name a work of fiction featuring time travel.',hint:'Books, films, television series, comics, anime, and video games all count.',answers:[
  entry('Back to the Future',20),entry('Doctor Who',20),entry('The Time Machine',40),entry('Chrono Trigger',40),entry('Dark',60),entry('Steins;Gate',60,['Steins Gate']),entry('Kindred',80),entry('The Door into Summer',100)
 ]}
];
