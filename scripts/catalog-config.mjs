// Each category must describe the prompt, not merely a loosely related subject.
// Descendants are bounded to avoid following unrelated cross-categories.
const wiki=(id,kind,categories,depth=1,rule)=>({id:`v2-q${String(id).padStart(3,'0')}`,kind,categories,depth,rule});
export const wikipediaJobs=[
 wiki(1,'film',['Films about time travel','Time loop films','Time-loop films'],1),
 wiki(2,'book',['Novels about magic'],1),
 wiki(4,'character',['Friends characters'],0),
 wiki(6,'book',["Children's novels"],1),
 wiki(7,'song',['ABBA songs'],0),
 wiki(8,'film',['Pixar animated films'],0),
 wiki(10,'television',['Animated television series'],1),
 wiki(11,'film',['Superhero films'],1),
 wiki(12,'book',['Novels adapted into films',"Children's books adapted into films"],1),
 wiki(14,'character',['Breaking Bad characters'],0),
 wiki(16,'book',['Novels about talking animals','Novels about anthropomorphic animals'],1),
 wiki(17,'song',['Queen (band) songs'],0),
 wiki(18,'film',['Studio Ghibli animated films'],0),
 wiki(20,'television',['Sitcoms'],1),
 wiki(21,'film',['Films about dinosaurs'],1),
 wiki(22,'book',['Detective novels'],1),
 wiki(24,'character',['The Office (American TV series) characters'],0),
 wiki(27,'song',['The Beatles songs'],0),
 wiki(28,'film',['Harry Potter films'],0),
 wiki(30,'television',['Television series about high school','School television series'],1),
 wiki(31,'film',['Films about talking animals','Films about anthropomorphic animals'],1),
 wiki(34,'character',['Stranger Things characters'],0),
 wiki(36,'book',['School novels','Boarding school novels'],1),
 wiki(37,'song',['Adele songs'],0),
 wiki(38,'film',['Skywalker Saga films'],0),
 wiki(40,'television',['Medical television series','Medical drama television series'],1),
 wiki(41,'film',['Films set in outer space','Films set on fictional planets','Films set on Mars','Films set on the Moon'],1),
 wiki(42,'book',['Dystopian novels'],1),
 wiki(44,'character',['The Simpsons characters'],0),
 wiki(46,'book',['Harry Potter novels','The Hunger Games novels','A Song of Ice and Fire novels','Discworld books','The Chronicles of Narnia books','The Wheel of Time books','Percy Jackson & the Olympians novels','The Dresden Files novels','Alex Cross novels','Sherlock Holmes novels'],0),
 wiki(47,'song',['Taylor Swift songs'],0),
 wiki(48,'film',['Films directed by Quentin Tarantino'],0),
 wiki(50,'television',['Detective television series','Police procedural television series'],1),
 wiki(51,'film',['Films set in schools','Films set in universities and colleges','High school films'],1),
 wiki(54,'character',['Avatar: The Last Airbender characters'],0),
 wiki(56,'book',['Romance novels'],1),
 wiki(57,'song',['Elton John songs'],0),
 wiki(58,'film',['Films directed by Denis Villeneuve'],0),
 wiki(60,'television',['Television shows based on novels','Television shows based on books'],1),
 wiki(61,'film',['Pirate films'],1),
 wiki(62,'book',['Novels about children','Novels about teenagers'],1),
 wiki(64,'character',['Parks and Recreation characters'],0),
 wiki(67,'song',['David Bowie songs'],0),
 wiki(68,'film',['Films directed by Martin Scorsese'],0),
 wiki(69,'song',['Songs from Frozen (2013 film)','Songs from Moana (2016 film)','Songs from The Lion King (1994 film)','Songs from Aladdin (1992 film)','Songs from The Little Mermaid (1989 film)','Songs from Beauty and the Beast (1991 film)','Disney animated film songs'],0),
 wiki(70,'television',['Television series about magic','Television series about witchcraft'],1),
 wiki(71,'film',['Films about robots','Robot films'],1),
 wiki(72,'book',['Novels about dragons'],1),
 wiki(74,'character',['Brooklyn Nine-Nine characters'],0),
 wiki(77,'song',['Fleetwood Mac songs'],0),
 wiki(78,'film',['Films directed by Greta Gerwig','Films directed by Noah Baumbach'],0),
 wiki(80,'television',['Superhero television series'],1),
 wiki(84,'character',['Gilmore Girls characters'],0),
 wiki(86,'book',['Novels about siblings'],1),
 wiki(87,'song',['Lana Del Rey songs'],0),
 wiki(88,'film',['Films directed by Rob Reiner'],0),
 wiki(90,'television',['Television series about families'],1),
 wiki(91,'film',['Films about weddings'],1),
 wiki(94,'character',['The Good Place characters'],0),
 wiki(97,'song',['Michael Jackson songs'],0),
 wiki(98,'film',['Films directed by Nora Ephron'],0),
 wiki(100,'television',['Space adventure television series','Space opera television series'],1),
 wiki(101,'film',['Ghost films'],2),
 wiki(102,'book',['Vampire novels','Werewolf novels','Novels about ghosts','Novels about witches and witchcraft'],1),
 wiki(104,'character',['Buffy the Vampire Slayer characters'],0),
 wiki(106,'book',['Mystery novels'],1),
 wiki(107,'song',['Kate Bush songs'],0),
 wiki(108,'film',['Stop-motion animated feature films'],1),
 wiki(110,'television',['Television series about vampires','Television series about werewolves','Television series about ghosts','Television series about zombies','Television series about monsters','Television series about demons'],1)
];
// Principal-cast records are tied to exact IMDb IDs to avoid remakes with the same name.
export const televisionJobs=[
 [4,'tt0108778'],[14,'tt0903747'],[24,'tt0386676'],[34,'tt4574334'],[44,'tt0096697'],[54,'tt0417299'],[64,'tt1266020'],[74,'tt2467372'],[84,'tt0238784'],[94,'tt4955642'],[104,'tt0118276']
].map(([id,imdb])=>({id:`v2-q${String(id).padStart(3,'0')}`,imdb}));
export const albumJobs=[
 [3,'Taylor Swift'],[13,'The Beatles'],[23,'Beyoncé'],[33,'Radiohead'],[43,'Adele'],[53,'David Bowie'],[63,'Fleetwood Mac'],[73,'Kendrick Lamar'],[83,'Lorde'],[93,'Nirvana'],[103,'Michael Jackson']
].map(([id,artist])=>({id:`v2-q${String(id).padStart(3,'0')}`,artist}));
export const actorJobs=[
 [5,'Leonardo DiCaprio'],[15,'Emma Stone'],[25,'Tom Hanks'],[35,'Anne Hathaway'],[45,'Denzel Washington'],[55,'Saoirse Ronan'],[65,'Keanu Reeves'],[75,'Viola Davis'],[85,'Ryan Gosling'],[95,'Meryl Streep'],[105,'Winona Ryder']
].map(([id,actor])=>({id:`v2-q${String(id).padStart(3,'0')}`,actor}));
const book=(id,query,rule)=>({id:`v2-q${String(id).padStart(3,'0')}`,query:`(${query}) AND language:eng`,rule});
export const bookJobs=[
 book(2,'subject:Magic AND subject:Fiction'),
 book(16,'subject:"Talking animals"'),
 book(22,'subject:Detectives AND subject:Fiction'),
 book(26,'title:(black OR white OR red OR blue OR green OR yellow OR purple OR pink OR orange OR scarlet OR silver OR gold)','color'),
 book(32,'title:(cat OR dog OR wolf OR bear OR rabbit OR tiger OR lion OR horse OR whale OR fox OR bird OR mouse OR spider)','animal'),
 book(36,'subject:Schools AND subject:Fiction'),
 book(42,'subject:Dystopias AND subject:Fiction'),
 book(52,'subject:"Voyages and travels" AND subject:Fiction'),
 book(56,'subject:"Love stories"'),
 book(62,'subject:Children AND subject:Fiction'),
 book(66,'title:(London OR Paris OR America OR England OR India OR Narnia OR Oz OR Wonderland OR Brooklyn OR Venice OR Mars)','place'),
 book(72,'subject:Dragons AND subject:Fiction'),
 book(76,'subject:Fiction','one-word'),
 book(86,'subject:"Brothers and sisters" AND subject:Fiction'),
 book(92,'first_publish_year:[1 TO 1899]'),
 book(96,'(subject:Kings OR subject:Queens) AND subject:Fiction'),
 book(102,'(subject:Vampires OR subject:Werewolves OR subject:Ghosts OR subject:Witches) AND subject:Fiction'),
 book(106,'subject:"Mystery fiction"')
];
export const songRules=[[9,'color'],[29,'number'],[39,'city'],[49,'love'],[59,'day'],[99,'night'],[109,'animal'],[89,'question']].map(([id,rule])=>({id:`v2-q${String(id).padStart(3,'0')}`,rule}));

// Reviewed thematic selections. The importer still requires the matching work-type
// infobox on the source article; these lists are not used as unverified answers.
export const wikiTitleJobs=[
 {id:'v2-q089',kind:'song',criterion:'Reviewed song title phrased as a question',titles:[
  'Do I Wanna Know?','Are You Gonna Be My Girl',"What's Love Got to Do with It (song)",'Where Is the Love?','How Deep Is Your Love (Bee Gees song)','Have You Ever Seen the Rain?',"Who's That Girl (Madonna song)",'Who Let the Dogs Out','Should I Stay or Should I Go',"Isn't She Lovely",'Can You Feel the Love Tonight','Are You Lonesome Tonight?','Why Does It Always Rain on Me?','Who Wants to Live Forever','Is This Love (Bob Marley and the Wailers song)','What About Us (Pink song)','What Is Love','Why (Annie Lennox song)',"What's My Age Again?",'Who Are You (song)','Would I Lie to You? (Eurythmics song)',"Don't You Want Me",'Does Your Mother Know'
 ]},
 {id:'v2-q019',kind:'song',criterion:'Reviewed song title containing a person’s name',titles:[
  'Fernando (song)','Cassandra (ABBA song)','Hey Jude','Eleanor Rigby','Michelle (song)','Lucy in the Sky with Diamonds','Julia (Beatles song)','Martha My Dear','Dear Prudence','Sexy Sadie','Anna (Go to Him)','Dizzy, Miss Lizzy','Daniel (Elton John song)','Bennie and the Jets','Nikita (song)','Billie Jean','Dirty Diana','Ben (song)','Jolene (song)','Layla','Roxanne (song)','Angie (song)','Lola (song)','Sara (Fleetwood Mac song)','Rhiannon (song)','Peggy Sue','Johnny B. Goode','Sweet Caroline','Come On Eileen','Cecilia (Simon & Garfunkel song)','Me and Bobby McGee','Jack & Diane','Betty (Taylor Swift song)','Tim McGraw (song)','Dear John (Taylor Swift song)','Hey Stephen','Dorothea (song)','Marjorie (song)','Peter (Taylor Swift song)','Robin (Taylor Swift song)','Clara Bow (song)'
 ]},
 {id:'v2-q030',kind:'television',criterion:'Reviewed television series featuring a school',titles:[
  'Glee (TV series)','Freaks and Geeks',"Dawson's Creek",'Saved by the Bell','Degrassi: The Next Generation','Degrassi Junior High','Elite (TV series)','Heartstopper (TV series)','Waterloo Road (TV series)','Grange Hill','Abbott Elementary','The Inbetweeners','Derry Girls','Never Have I Ever (TV series)','Awkward (TV series)','A.P. Bio','Big School','Bad Education (TV series)','Welcome Back, Kotter','The Paper Chase (TV series)','My So-Called Life','Community (TV series)','Boy Meets World','The Magic School Bus (TV series)','The Worst Witch (2017 TV series)','Wednesday (TV series)','School Spirits (2023 TV series)'
 ]},
 {id:'v2-q069',kind:'song',criterion:'Reviewed song featured in a Disney animated feature',titles:[
  'Let It Go','Into the Unknown (song)','Show Yourself (Disney song)','Do You Want to Build a Snowman?','Love Is an Open Door','For the First Time in Forever',"You're Welcome (Moana song)","How Far I'll Go",'We Know the Way','Shiny (Moana song)','Un Poco Loco','Remember Me (Coco song)','We Don’t Talk About Bruno','Surface Pressure','Waiting on a Miracle','The Family Madrigal','What Else Can I Do?','Dos Oruguitas','All of You (Encanto song)',"You'll Be in My Heart",'Strangers Like Me','Son of Man (song)','Two Worlds (song)','Go the Distance','Zero to Hero',"I Won't Say (I'm in Love)",'Reflection (song)',"I'll Make a Man Out of You",'A Girl Worth Fighting For','Honor to Us All','Colors of the Wind','Just Around the Riverbend','Out There (The Hunchback of Notre Dame song)','Hellfire (song)','God Help the Outcasts','I See the Light','When Will My Life Begin?','Mother Knows Best','Almost There (The Princess and the Frog song)','Friends on the Other Side','Part of Your World','Under the Sea','Kiss the Girl','Poor Unfortunate Souls','Beauty and the Beast (Disney song)','Be Our Guest','Belle (Disney song)','Gaston (song)','A Whole New World','Friend Like Me','Prince Ali (song)','Circle of Life','Hakuna Matata (song)',"I Just Can't Wait to Be King",'Be Prepared (song)','Can You Feel the Love Tonight','The Bare Necessities',"I Wan'na Be Like You",'The Siamese Cat Song',"He's a Tramp",'Bibbidi-Bobbidi-Boo','A Dream Is a Wish Your Heart Makes','Once Upon a Dream (Sleeping Beauty song)','Someday My Prince Will Come','Heigh-Ho','Whistle While You Work','When You Wish Upon a Star',"I've Got No Strings"
 ]},
 {id:'v2-q079',kind:'band',rule:'number',criterion:'Reviewed band or musical group with a number in its name',titles:[
  'Blink-182','Sum 41','Maroon 5','The 1975','One Direction','Twenty One Pilots','U2','UB40','311 (band)','Nine Inch Nails',"The B-52's",'3 Doors Down','Three Days Grace','Sixpence None the Richer','Five Finger Death Punch','Seven Mary Three','Fifth Harmony','All-4-One','2 Unlimited','4 Non Blondes','Level 42','Matchbox Twenty','10cc','Thirty Seconds to Mars','D12','S Club 7','The Jackson 5','The Dave Clark Five','Five (group)','7 Seconds (band)','808 State','65daysofstatic','100 gecs','The Four Tops','Four Year Strong','Third Eye Blind','Sevendust','Sevenfold','Avenged Sevenfold','The Brothers Four','The Four Seasons (band)'
 ]},
 {id:'v2-q082',kind:'book',criterion:'Reviewed book title containing a person’s name',titles:[
  'Jane Eyre','David Copperfield (novel)','Oliver Twist','Anna Karenina','Mrs Dalloway','Rebecca (novel)','Emma (novel)','Carrie (novel)','Coraline','Matilda (novel)','Clarissa','Pamela; or, Virtue Rewarded','Moll Flanders','The History of Tom Jones, a Foundling','The Life and Opinions of Tristram Shandy, Gentleman',"Tess of the d'Urbervilles",'Madame Bovary','Silas Marner','The Picture of Dorian Gray','Orlando: A Biography','Agnes Grey','Frankenstein','Dracula','Pollyanna','Heidi','Pippi Longstocking','Nicholas Nickleby','Martin Chuzzlewit','Barnaby Rudge','Daniel Deronda','Adam Bede','Romola','Kim (novel)','Rob Roy (novel)','Ivanhoe','Lorna Doone','Anne of Green Gables','Anne of Avonlea','Jane of Lantern Hill',"Charlotte's Web",'Stuart Little','Harriet the Spy','Jude the Obscure','The Adventures of Huckleberry Finn','The Adventures of Tom Sawyer','Harry Potter and the Chamber of Secrets','Artemis Fowl (novel)','Eragon'
 ]}
];
for(const job of wikipediaJobs){if(['v2-q008','v2-q018','v2-q108'].includes(job.id))job.feature=true;}
const stopMotion=wikipediaJobs.find(job=>job.id==='v2-q108');
stopMotion.categories=['Stop-motion animated films'];

export const characterListJobs=[{id:'v2-q004',page:'List of Friends and Joey characters',sections:{
 'Rachel Green':['Rachel Green'],'Monica Geller':['Monica Geller'],'Phoebe Buffay':['Phoebe Buffay'],'Joey Tribbiani':['Joey Tribbiani'],'Chandler Bing':['Chandler Bing'],'Ross Geller':['Ross Geller'],
 'Gunther':['Gunther'],'Jack and Judy Geller':['Jack Geller','Judy Geller'],'Carol Willick and Susan Bunch':['Carol Willick','Susan Bunch'],'Janice Litman-Goralnik':['Janice Litman-Goralnik'],
 'David':['David'],'Nora Tyler Bing':['Nora Tyler Bing'],'Ugly Naked Guy':['Ugly Naked Guy'],'Estelle Leonard':['Estelle Leonard'],'Richard Burke':['Richard Burke'],'Sandra Green':['Sandra Green'],'Frank Buffay Jr.':['Frank Buffay Jr.'],'Emily Waltham':['Emily Waltham'],'Tag Jones':['Tag Jones'],'Charles Bing/Helena Handbasket':['Charles Bing'],
 'Mike Hannigan':['Mike Hannigan'],'Charlie Wheeler':['Charlie Wheeler'],'Russ':['Russ'],'Pete Becker':['Pete Becker'],'Joshua Burgin':['Joshua Burgin'],'Paul Stevens':['Paul Stevens'],'Eric':['Eric']
}}];

wikipediaJobs.push(
 {id:'oct31-supernatural',kind:'film',categories:['Ghost films','Vampire films','Werewolf films','Films about demons','Films about angels','Films about witchcraft'],depth:2},
 {id:'oct31-debut',kind:'album',categories:['Debut albums by year'],depth:1,studio:true},
 {id:'oct31-west-coast',kind:'rapper',categories:['Rappers from California','Rappers from Oregon','Rappers from Washington (state)'],depth:2,rapper:true},
 {id:'oct31-instrumental',kind:'song',categories:['Instrumentals','Electronic instrumentals','Jazz instrumentals','Rock instrumentals','Pop instrumentals','Surf instrumentals'],depth:1,excludedTitles:[
  'Tequila','Wipe Out','The Hustle','Pick Up the Pieces','Gonna Fly Now','TSOP (The Sound of Philadelphia)','The Great Gig in the Sky','Maggot Brain','On the Run','Speak to Me','Signs of Life','Atom Heart Mother'
 ]},
 {id:'oct31-time-travel',kind:'fiction',categories:['Films about time travel','Novels about time travel','Short stories about time travel','Television shows about time travel','Comics about time travel','Anime and manga about time travel','Video games about time travel'],depth:1}
);
