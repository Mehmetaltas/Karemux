// Plandaki boşluk konuları için eklenen sorular. Biçim: { "sınıf": { "ek": [ [soru, [seçenekler], doğruİndeks, açıklama, gorsel|null, {u:"ünite", k:"konu"}] ] } }
import { S, svg, tablo } from "./gorselli-yardim.js";
const T = { u: "Theme 2: Classroom Life", k: "Theme 2: Classroom Life" };
const kart = (baslik, satirlar, renk) => svg(S.kart({ baslik, satirlar, renk }), "64%");
export default {
  "6": {
    "ek": [
      ["Look at the table. Where is the pencil case?", ["On the desk", "Under the desk", "In the bag", "Next to the window"], 0,
        "The table says the pencil case is on the desk.", tablo(["Thing", "Place"], [["Pencil case", "On the desk"], ["Ruler", "In the bag"], ["Ball", "Under the chair"]], "Classroom things"), T],
      ["Look at the card. Which sentence is correct?", ["Do not run in the classroom.", "Run in the classroom.", "Do not listen to the teacher.", "Shout in the classroom."], 0,
        "The card shows 'Do not run' and 'Listen to the teacher'. Only the first sentence matches the rules.", kart("CLASS RULES", ["Listen to the teacher.", "Do not run.", "Raise your hand."], "#2c6fbb"), T],
      ["The students ______ their hands before they speak in class.", ["raise", "raises", "raising", "to raise"], 0,
        "The subject 'students' is plural and the sentence is in the simple present, so we use 'raise'.", null, T],
      ["Teacher: Open your books! Students: ______", ["OK, we open them.", "Yes, it is a book.", "No, I am not a teacher.", "It is on the table."], 0,
        "The teacher gives an instruction, so the student answers by accepting it: 'OK, we open them.'", null, T],
      ["Look at the table. Which object is next to the board?", ["The clock", "The map", "The bookcase", "The door"], 2,
        "The table shows that the bookcase is next to the board.", tablo(["Object", "Place"], [["Clock", "Above the door"], ["Map", "On the wall"], ["Bookcase", "Next to the board"]], "Our classroom"), T],
      ["Student: ______ I borrow your eraser, please? Friend: Sure, here you are.", ["Can", "Do", "Are", "Is"], 0,
        "We use 'Can I ...?' to ask for something politely.", null, T],
      ["There ______ twenty-five desks in our classroom.", ["are", "is", "am", "be"], 0,
        "'Desks' is plural, so we use 'There are'.", null, T],
      ["Which word is a classroom object?", ["Eraser", "Banana", "Pillow", "Bicycle"], 0,
        "An eraser is a classroom object. The others are not typical classroom objects.", null, T],
    ],
  },
};
