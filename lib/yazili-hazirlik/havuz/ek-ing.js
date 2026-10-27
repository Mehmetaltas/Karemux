// Plandaki boşluk konuları için eklenen sorular. Biçim: { "sınıf": { "ek": [ [soru, [seçenekler], doğruİndeks, açıklama, gorsel|null, {u:"ünite", k:"konu"}] ] } }
import { S, svg, tablo } from "./gorselli-yardim.js";
const saat = (s, d) => svg(S.saat({ s, d }), "40%");
let n = 0;
function q(soru, dogru, yanlislar, aciklama, gorsel, et) {
  const pos = n++ % (yanlislar.length + 1);
  const o = [...yanlislar]; o.splice(pos, 0, dogru);
  return [soru, o, pos, aciklama, gorsel || null, et];
}
const U = (u) => ({ u, k: u });
const T = { u: "Theme 2: Classroom Life", k: "Theme 2: Classroom Life" };
const kart = (baslik, satirlar, renk) => svg(S.kart({ baslik, satirlar, renk }), "64%");
export default {
  "6": {
    "ek": [
      ["Look at the table. Where is the pencil case?", ["On the desk", "Under the desk", "In the bag", "Next to the window"], 0,
        "The table says the pencil case is on the desk.", tablo(["Thing", "Place"], [["Pencil case", "On the desk"], ["Ruler", "In the bag"], ["Ball", "Under the chair"]], "Classroom things"), T],
      ["Look at the card. Which sentence is a class rule?", ["Do not run in the classroom.", "Run in the classroom.", "Do not listen to the teacher.", "Shout in the classroom."], 0,
        "The card shows 'Do not run' and 'Listen to the teacher'. Only the first sentence matches the rules.", kart("CLASS RULES", ["Listen to the teacher.", "Do not run.", "Raise your hand."], "#2c6fbb"), T],
      ["The students ______ their hands before they speak in class.", ["raise", "raises", "raising", "to raise"], 0,
        "The subject 'students' is plural and the sentence is in the simple present, so we use 'raise'.", null, T],
      ["Teacher: Open your books, please. Student: ______", ["OK, teacher.", "Yes, it is a book.", "No, I am not a teacher.", "It is on the table."], 0,
        "The teacher gives an instruction, so the student accepts it politely: 'OK, teacher.'", null, T],
      ["Look at the table. Which object is next to the board?", ["The clock", "The map", "The bookcase", "The door"], 2,
        "The table shows that the bookcase is next to the board.", tablo(["Object", "Place"], [["Clock", "Above the door"], ["Map", "On the wall"], ["Bookcase", "Next to the board"]], "Our classroom"), T],
      ["Student: ______ I borrow your eraser, please? Friend: Sure, here you are.", ["Can", "Do", "Are", "Is"], 0,
        "We use 'Can I ...?' to ask for something politely.", null, T],
      ["There ______ twenty-five desks in our classroom.", ["are", "is", "am", "be"], 0,
        "'Desks' is plural, so we use 'There are'.", null, T],
      ["Which word is a classroom object?", ["Eraser", "Banana", "Pillow", "Bicycle"], 0,
        "An eraser is a classroom object. The others are not typical classroom objects.", null, T],
    q("My brother is good at drawing. He ______ draw very well.", "can", ["cans", "is", "do"], "After 'can' we use the base form of the verb, and 'can' never takes -s.", null, U("Theme 3: Personal Life")),
    q("Look at the card. When is Selin's birthday?", "On 5 May", ["On 5 June", "On 15 May", "On 5 March"], "The card says Selin's birthday is on 5 May.", kart("MY PROFILE", ["Name: Selin", "Hobby: painting", "Pet: a cat", "Birthday: 5 May"], "#8e44ad"), U("Theme 3: Personal Life")),
    q("What is your hobby? My hobby is ______ stamps.", "collecting", ["collect", "collects", "to collecting"], "After 'My hobby is' we use the -ing form: 'collecting stamps'.", null, U("Theme 3: Personal Life")),
    q("My mother's sister is my ______.", "aunt", ["uncle", "cousin", "grandmother"], "Your mother's sister is your aunt.", null, U("Theme 4: Family Life")),
    q("Look at the table. Who is the teacher?", "Deniz", ["Murat", "Ayla", "Nobody"], "The table says Deniz is a teacher.", tablo(["Name", "Relationship", "Job"], [["Murat", "Father", "Engineer"], ["Ayla", "Mother", "Nurse"], ["Deniz", "Uncle", "Teacher"]], "My family"), U("Theme 4: Family Life")),
    ],
  },
  "4": { "ek": [
    q("Look at the card. What can Tom the cat do?", "He can jump.", ["He can swim.", "He can fly.", "He can read."], "The card says Tom can jump and can't swim.", kart("TOM THE CAT", ["Age: 5", "Can jump", "Can't swim"], "#d68910"), U("Cartoon Characters")),
    q("Look at the table. Which character is big?", "Bobo", ["Pip", "Lulu", "Nobody"], "The table shows that Bobo is big, Pip is small and Lulu is tall.", tablo(["Character", "Colour", "Size"], [["Pip", "Red", "Small"], ["Bobo", "Green", "Big"], ["Lulu", "Yellow", "Tall"]], "Cartoon characters"), U("Cartoon Characters")),
    q("Is Bobo a cat? No, ______.", "he isn't", ["he doesn't", "he can't", "he don't"], "The question uses 'Is', so the short answer is 'No, he isn't.'", null, U("Cartoon Characters")),
    q("I like ______ football in my free time.", "playing", ["plays", "played", "to playing"], "After 'like' we can use the -ing form: 'I like playing football.'", null, U("Free Time")),
    q("It's cold today. I wear my ______.", "coat", ["sandals", "shorts", "swimsuit"], "In cold weather we wear a coat.", null, U("My Clothes")),
    q("Look at the card. What colour are Tom's jeans?", "Blue", ["Red", "Black", "Green"], "The card says Tom has blue jeans.", kart("TOM'S CLOTHES", ["Red T-shirt", "Blue jeans", "Black shoes"], "#c0504d"), U("My Clothes")),
    q("This is my friend, Ayşe. ______ is ten years old.", "She", ["He", "It", "They"], "Ayşe is a girl, so we use 'She'.", null, U("My Friends")),
    q("Look at the table. Who is ten years old?", "Leo", ["Mia", "Zeynep", "Nobody"], "The table shows that Leo is 10. Mia and Zeynep are 9.", tablo(["Friend", "Age", "Hobby"], [["Mia", "9", "Painting"], ["Leo", "10", "Football"], ["Zeynep", "9", "Dancing"]], "My friends"), U("My Friends")),
    q("Look at the table. What does Can do in his free time?", "He plays chess.", ["He reads books.", "He rides a bike.", "He watches TV."], "The table says Can's free time activity is playing chess.", tablo(["Name", "Free time activity"], [["Ece", "Reading books"], ["Can", "Playing chess"], ["Ali", "Riding a bike"]], "Free time"), U("Free Time")),
  ] },
  "5": { "ek": [
    q("The books are ______ the shelf.", "on", ["at", "of", "with"], "We use 'on' for things that are on a surface such as a shelf.", null, U("Theme 2: Classroom Life")),
    q("Look at the table. Where is the bin?", "Under the desk", ["On the wall", "Next to the window", "On the shelf"], "The table says the bin is under the desk.", tablo(["Object", "Place"], [["Map", "On the wall"], ["Globe", "Next to the window"], ["Bin", "Under the desk"]], "Our classroom"), U("Theme 2: Classroom Life")),
    q("Teacher: Please ______ quiet. Students: OK, teacher.", "be", ["is", "are", "being"], "After 'please' we use the base form of the verb: 'Please be quiet.'", null, U("Theme 2: Classroom Life")),
    q("Look at the clock. What time is it?", "It's half past five.", ["It's half past four.", "It's five o'clock.", "It's a quarter past five."], "The hour hand is between 5 and 6 and the minute hand is on 6: half past five.", saat(5, 30), U("Theme 2: Classroom Life")),
    q("Look at the card. When is the Science lesson?", "At ten o'clock.", ["At nine o'clock.", "At eleven o'clock.", "At twelve o'clock."], "The card shows Science at 10:00.", kart("TODAY'S LESSONS", ["9:00 Maths", "10:00 Science", "11:00 English"], "#2c6fbb"), U("Theme 2: Classroom Life")),
    q("I ______ playing computer games. It is boring.", "don't like", ["doesn't like", "not like", "am not like"], "With 'I' in the negative simple present we say 'don't like'.", null, U("Theme 3: Personal Life")),
    q("Look at the table. Who likes swimming?", "Sibel", ["Arda", "Kaan", "Nobody"], "Sibel likes swimming. Kaan doesn't like it.", tablo(["Name", "Likes", "Doesn't like"], [["Sibel", "Swimming", "Cooking"], ["Arda", "Cooking", "Running"], ["Kaan", "Running", "Swimming"]], "Likes and dislikes"), U("Theme 3: Personal Life")),
  ] },
  "7": { "ek": [
    q("Look at the card. Which sentence is true?", "Kemal has short dark hair.", ["Kemal is short and strong.", "Kemal has blond hair.", "Kemal has blue eyes."], "The card says Kemal is tall and thin, with short dark hair and brown eyes.", kart("MY FRIEND KEMAL", ["Tall and thin", "Short dark hair", "Brown eyes", "Generous and funny"], "#8e44ad"), U("Appearance and Personality")),
    q("Ayşe always shares her sandwich with her friends. She is very ______.", "generous", ["selfish", "lazy", "rude"], "A generous person likes giving and sharing.", null, U("Appearance and Personality")),
    q("Look at the table. Who plays a sport every day?", "Lale", ["Mert", "Okan", "Nobody"], "The table shows Lale plays tennis every day.", tablo(["Name", "Sport", "How often"], [["Mert", "Football", "Twice a week"], ["Lale", "Tennis", "Every day"], ["Okan", "Swimming", "Once a week"]], "Sports"), U("Sports")),
    q("My brother is ______ at basketball. He wins every match.", "good", ["well", "goodly", "gooder"], "After the verb 'be' we use the adjective 'good'.", null, U("Sports")),
    q("Aziz Sancar ______ a Nobel Prize in 2015.", "won", ["win", "wins", "winning"], "The year 2015 is in the past, so we use the simple past: 'won'.", null, U("Biographies")),
    q("Look at the card. Where was Ali born?", "In Izmir", ["In Ankara", "In Bursa", "In Adana"], "The card says Ali was born in Izmir.", kart("BIOGRAPHY", ["Name: Ali Demir", "Born: 1990, in Izmir", "Job: pilot"], "#2e8b57"), U("Biographies")),
    q("Look at the table. What happened in 2007?", "She started primary school.", ["She was born.", "She entered medical school.", "She became a doctor."], "The table says Lale started primary school in 2007.", tablo(["Year", "Event"], [["2001", "Was born"], ["2007", "Started primary school"], ["2019", "Entered medical school"], ["2025", "Became a doctor"]], "Life of Lale Kaya"), U("Biographies")),
    q("He ______ a famous painter. He painted a lot of beautiful pictures.", "became", ["become", "becomes", "becoming"], "The sentence talks about the past, so we use 'became'.", null, U("Biographies")),
    q("Look at the table. Which animal is the fastest?", "Cheetah", ["Lion", "Elephant", "Giraffe"], "The cheetah's speed is 110 km/h, the highest in the table.", tablo(["Animal", "Speed"], [["Cheetah", "110 km/h"], ["Lion", "80 km/h"], ["Elephant", "40 km/h"]], "Wild animals"), U("Wild Animals")),
    q("Polar bears ______ in the desert. They live in cold places.", "don't live", ["doesn't live", "lives", "aren't live"], "'Polar bears' is plural and the sentence is negative, so we say 'don't live'.", null, U("Wild Animals")),
  ] },
  "8": { "ek": [
    q("Look at the table. Who discovered penicillin?", "Alexander Fleming", ["Isaac Newton", "Marie Curie", "Albert Einstein"], "The table shows that Alexander Fleming discovered penicillin.", tablo(["Scientist", "Discovery"], [["Alexander Fleming", "Penicillin"], ["Isaac Newton", "Gravity"], ["Marie Curie", "Radioactivity"]], "Famous scientists"), U("Science")),
    q("Look at the card. What should you do during an earthquake?", "Cover your head under a strong table.", ["Run to the lift.", "Stand near the windows.", "Go to the roof."], "The card advises: drop to the ground, cover your head and hold on to a strong table.", kart("EARTHQUAKE TIPS", ["Drop to the ground", "Cover your head", "Hold on to a strong table"], "#c0504d"), U("Natural Forces")),
    q("A volcano ______ when hot lava comes out of it.", "erupts", ["erupt", "erupting", "is erupt"], "'A volcano' is singular and we talk about a general fact, so we use 'erupts'.", null, U("Natural Forces")),
    q("Many houses ______ by the flood last year.", "were destroyed", ["destroyed", "was destroyed", "are destroyed"], "The subject 'houses' is plural and the sentence is passive in the past: 'were destroyed'.", null, U("Natural Forces")),
  ] },
};
